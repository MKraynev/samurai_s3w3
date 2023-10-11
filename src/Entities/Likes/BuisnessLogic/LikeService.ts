import { TokenHandler, TokenStatus, tokenHandler } from "../../../Common/Authentication/User/TokenAuthentication";
import { ExecutionResult, ExecutionResultContainer } from "../../../Common/Database/DataBase";
import { Sorter, SorterType } from "../../../Common/Database/Sort/Sorter";
import { ServicesWithUsersExecutionResult, commentService } from "../../Comments/BuisnessLogic/CommentService";
import { UserServiceExecutionResult, userService } from "../../Users/Common/BuisnessLogic/UserService";
import { Token } from "../../Users/Common/Entities/Token";
import { LikeDataBase } from "../Entities/LikeDataBase";
import { AvailableLikeStatus, AvailableLikeStatusList, AvailableLikeTarget, LikeRequest } from "../Entities/LikeRequest";
import { LikeResponse } from "../Entities/LikeResponse";
import { LikeRepo, likeRepo } from "../Repo/LikeRepo";

export class LikeSorter extends Sorter<LikeResponse>{
    constructor(
        public sorterType: SorterType,
        public userId: string | undefined,
        public status: AvailableLikeStatus | undefined,
        public target: AvailableLikeTarget,
        public sortBy: keyof LikeResponse & string = "userId",
        public sortDirection: "desc" | "asc" = "desc"
    ) {
        super(sortBy, sortDirection, sorterType)
    }
}
export type LikeCount = {
    likes: number,
    dislikes: number
}

class LikeService {
    constructor(private likeRepo: LikeRepo, private tokenHandler: TokenHandler) { }

    public async SetLikeData(token: Token, likeData: LikeRequest): Promise<ExecutionResultContainer<ServicesWithUsersExecutionResult, LikeResponse | null>> {
        let checkToken = await this.tokenHandler.GetTokenLoad(token);

        if (checkToken.tokenStatus !== TokenStatus.Accepted || !checkToken.result)
            return new ExecutionResultContainer(ServicesWithUsersExecutionResult.Unauthorized);

        let userId = checkToken.result.id;

        let getUser = await userService.GetUserById(userId);
        let user = getUser.executionResultObject;
        if(getUser.executionStatus !== UserServiceExecutionResult.Success || !user){
            return new ExecutionResultContainer(ServicesWithUsersExecutionResult.Unauthorized);
        }


        let findComment = await commentService.GetCommentById(likeData.targetId);
        let comment = findComment.executionResultObject;
        if (findComment.executionStatus !== ServicesWithUsersExecutionResult.Success || !comment) {
            return new ExecutionResultContainer(ServicesWithUsersExecutionResult.NotFound);
        }

        let findLike = await this.likeRepo.GetCurrentLikeStatus(userId, likeData.targetId);
        let likeOrmObject = findLike.executionResultObject;

        let addLikeDataToComment = await commentService.AddLikeData(likeData, likeOrmObject?.toObject() || null);

        if (likeOrmObject) {
            //Лайк/дислайк существует
            likeOrmObject.status = likeData.status;
        }
        else {
            //лайка/дислайка еще не было
            let dataForSave = new LikeDataBase(userId, user.login, likeData);
            likeOrmObject = this.likeRepo.GetEntity(dataForSave);
        }

        let saveCHanges = await this.likeRepo.Save(likeOrmObject);
        let likeResponse = new LikeResponse(saveCHanges._id, saveCHanges);

        return new ExecutionResultContainer(ServicesWithUsersExecutionResult.Success, likeResponse);
    }

    public async GetUserLikeStatus(userId: string, targetId: string): Promise<ExecutionResultContainer<ServicesWithUsersExecutionResult, LikeResponse | null>> {
        let getUserStatus = await this.likeRepo.GetCurrentLikeStatus(userId, targetId);

        if (getUserStatus.executionStatus !== ExecutionResult.Pass) {
            return new ExecutionResultContainer(ServicesWithUsersExecutionResult.NotFound);
        }

        return new ExecutionResultContainer(ServicesWithUsersExecutionResult.Success, getUserStatus.executionResultObject?.toObject());
    }

    public async GetLastLikes(targetId: string, count: number = 3): Promise<ExecutionResultContainer<ServicesWithUsersExecutionResult, LikeResponse[]>> {
        let likes = await this.likeRepo.GetLast(targetId, count);

        return new ExecutionResultContainer(ServicesWithUsersExecutionResult.Success, likes.map(likeMongooseDto => likeMongooseDto.toObject()));
    }
}

export const likeService = new LikeService(likeRepo, tokenHandler);