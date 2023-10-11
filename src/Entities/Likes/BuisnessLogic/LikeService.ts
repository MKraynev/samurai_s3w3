import { TokenHandler, TokenStatus, tokenHandler } from "../../../Common/Authentication/User/TokenAuthentication";
import { AvailableDbTables, ExecutionResult, ExecutionResultContainer } from "../../../Common/Database/DataBase";
import { MongoDb, mongoDb } from "../../../Common/Database/MongoDb";
import { Sorter, SorterType } from "../../../Common/Database/Sort/Sorter";
import { ServicesWithUsersExecutionResult, commentService } from "../../Comments/BuisnessLogic/CommentService";
import { postService } from "../../Posts/BuisnessLogic/PostService";
import { UserServiceExecutionResult, userService } from "../../Users/Common/BuisnessLogic/UserService";
import { Token } from "../../Users/Common/Entities/Token";
import { LikeDataBase } from "../Entities/LikeDataBase";
import { AvailableLikeStatus, AvailableLikeStatusList, AvailableLikeTarget, LikeRequest } from "../Entities/LikeRequest";
import { LikeResponse } from "../Entities/LikeResponse";
import { ExtendedLikeStatistic, LikeStatistic, NewestLike } from "../Entities/LikeStatistic";
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

        if (checkToken.tokenStatus !== TokenStatus.Accepted || !checkToken.result) {
            return new ExecutionResultContainer(ServicesWithUsersExecutionResult.Unauthorized);
        }

        let userId = checkToken.result.id;
        let getUser = await userService.GetUserById(userId);
        let user = getUser.executionResultObject;

        if (getUser.executionStatus !== UserServiceExecutionResult.Success || !user) {
            return new ExecutionResultContainer(ServicesWithUsersExecutionResult.Unauthorized);
        }

        // let findTarget = await this.FindTarget(likeData.target, likeData.targetId);
        // let targetData = findTarget.executionResultObject;

        // if (findTarget.executionStatus !== ServicesWithUsersExecutionResult.Success || !targetData) {
        //     return new ExecutionResultContainer(ServicesWithUsersExecutionResult.NotFound);
        // }

        let findLike = await this.likeRepo.GetCurrentLikeStatus(userId, likeData.targetId);
        let previousLikeData = findLike.executionResultObject;

        if (previousLikeData) {
            //Лайк/дислайк существует
            previousLikeData.status = likeData.status;
        }
        else {
            //лайка/дислайка еще не было
            let dataForSave = new LikeDataBase(userId, user.login, likeData);
            previousLikeData = this.likeRepo.GetEntity(dataForSave);
        }

        let saveCHanges = await this.likeRepo.Save(previousLikeData);
        let likeResponse = new LikeResponse(saveCHanges._id, saveCHanges);

        return new ExecutionResultContainer(ServicesWithUsersExecutionResult.Success, likeResponse);
    }

    private async GetUserLikeStatus(userId: string, targetId: string): Promise<ExecutionResultContainer<ServicesWithUsersExecutionResult, LikeResponse | null>> {
        let getUserStatus = await this.likeRepo.GetCurrentLikeStatus(userId, targetId);

        if (getUserStatus.executionStatus !== ExecutionResult.Pass) {
            return new ExecutionResultContainer(ServicesWithUsersExecutionResult.NotFound);
        }

        return new ExecutionResultContainer(ServicesWithUsersExecutionResult.Success, getUserStatus.executionResultObject?.toObject());
    }

    private async GetLastLikes(targetId: string, count: number = 3): Promise<ExecutionResultContainer<ServicesWithUsersExecutionResult, LikeResponse[]>> {
        let likes = await this.likeRepo.GetLast(targetId, count);

        return new ExecutionResultContainer(ServicesWithUsersExecutionResult.Success, likes.map(likeMongooseDto => likeMongooseDto.toObject()));
    }
    public async GetLikeStatistic(targetId: string, userId: string): Promise<LikeStatistic> {
        let countLikes = await this.likeRepo.Count(targetId, "Like");
        let countDislikes = await this.likeRepo.Count(targetId, "Dislike");
        let userStatus = await this.GetUserLikeStatus(userId, targetId);

        let result: LikeStatistic = {
            likesCount: countLikes,
            dislikesCount: countDislikes,
            myStatus: userStatus.executionResultObject?.status || "None"
        }

        return result;
    }

    public async GetExtendedLikeStatistic(targetId: string, userId: string): Promise<ExtendedLikeStatistic> {
        let getStatistic = await this.GetLikeStatistic(targetId, userId);
        let getLastLikes = await this.GetLastLikes(targetId, 3);
        let newestLikes: NewestLike[] = getLastLikes.executionResultObject?.map(likeResponse => {
            let nl: NewestLike = {
                addedAt: likeResponse.createdAt,
                userId: likeResponse.userId,
                login: likeResponse.userLogin
            }
            return nl;
        }) || []


        let result: ExtendedLikeStatistic = {
            likesCount: getStatistic.likesCount,
            dislikesCount: getStatistic.dislikesCount,
            myStatus: getStatistic.myStatus,
            newestLikes: newestLikes
        }

        return result;
    }

    private async FindTarget(target: AvailableLikeTarget, targetId: string) {
        switch (target) {
            case "comments":
                return await commentService.GetCommentById(targetId);
                break;

            case "posts":
                return await postService.GetPostById(targetId);
                break;
        }
    }
    private async AddStatistics(target: AvailableLikeTarget, targetId: string, newLikeData: LikeRequest, previousLikeData: LikeDataBase | null) {
        let findTarget = await this.FindTarget(target, targetId);
        let targetData = findTarget.executionResultObject;

        if (findTarget.executionStatus !== ServicesWithUsersExecutionResult.Success || !targetData) {
            return;
        }

        let previousStatus: AvailableLikeStatus = previousLikeData?.status || "None";
        let newStatus: AvailableLikeStatus = newLikeData.status;
        let dbTable: AvailableDbTables;


        switch (target) {
            case "comments":
                dbTable = AvailableDbTables.comments;
                break;

            case "posts":
                dbTable = AvailableDbTables.posts;
                break;
        }

        //step 1
        switch (`${previousStatus}->${newStatus}`) {
            case "Like->None":
            case "Like->Dislike":
                this.SubLike(targetId, mongoDb, dbTable);
                break;

            case "Dislike->None":
            case "Dislike->Like":
                this.SubDislike(targetId, mongoDb, dbTable);
                break;

            case "Dislike->Dislike":
            case "Like->Like":
            case "None->None":
                return;
                break;
        }

        //step 2
        switch (newStatus) {
            case "Like":
                this.AddLike(targetId, mongoDb, dbTable);
                break;

            case "Dislike":
                this.AddDislike(targetId, mongoDb, dbTable);
                break;
        }
    }

    private async AddLike(targetId: string, mongoDb: MongoDb, table: AvailableDbTables) {
        let add = await mongoDb.IncrementProperty(table, targetId, "likesInfo.likesCount", 1);
        return add.executionResultObject;
    }
    private async SubLike(targetId: string, mongoDb: MongoDb, table: AvailableDbTables) {
        let sub = await mongoDb.IncrementProperty(table, targetId, "likesInfo.likesCount", -1);
        return sub.executionResultObject;
    }
    private async AddDislike(targetId: string, mongoDb: MongoDb, table: AvailableDbTables) {
        let add = await mongoDb.IncrementProperty(table, targetId, "likesInfo.dislikesCount", 1);
        return add.executionResultObject;
    }
    private async SubDislike(targetId: string, mongoDb: MongoDb, table: AvailableDbTables) {
        let sub = await mongoDb.IncrementProperty(table, targetId, "likesInfo.dislikesCount", -1);
        return sub.executionResultObject;
    }
}

export const likeService = new LikeService(likeRepo, tokenHandler);