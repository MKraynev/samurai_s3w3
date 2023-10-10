import { TokenHandler, TokenStatus, tokenHandler } from "../../../Common/Authentication/User/TokenAuthentication";
import { ExecutionResult, ExecutionResultContainer } from "../../../Common/Database/DataBase";
import { Sorter, SorterType } from "../../../Common/Database/Sort/Sorter";
import { ServicesWithUsersExecutionResult, commentService } from "../../Comments/BuisnessLogic/CommentService";
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

class LikeService{
    constructor(private likeRepo: LikeRepo, private tokenHandler: TokenHandler) {}
        
    public async SetLikeData(token: Token, likeData: LikeRequest): Promise<ExecutionResultContainer<ServicesWithUsersExecutionResult, LikeResponse | null>>{
        let checkToken = await this.tokenHandler.GetTokenLoad(token);

        if(checkToken.tokenStatus !== TokenStatus.Accepted || !checkToken.result)
            return new ExecutionResultContainer(ServicesWithUsersExecutionResult.Unauthorized);
        
        let userId = checkToken.result.id;

        let findComment = await commentService.GetCommentById(likeData.targetId);
        let comment = findComment.executionResultObject;
        if(findComment.executionStatus !== ServicesWithUsersExecutionResult.Success || !comment){
            return new ExecutionResultContainer(ServicesWithUsersExecutionResult.NotFound);
        }
        
        let findLike = await this.likeRepo.GetCurrentLikeStatus(userId, likeData.targetId);
        let likeOrmObject = findLike.executionResultObject;

        let addLikeDataToComment = await commentService.AddLikeData(likeData, likeOrmObject?.toObject() || null);

        if(likeOrmObject){
            //Лайк/дислайк существует
            likeOrmObject.status = likeData.status;
        }
        else{
            //лайка/дислайка еще не было
            let dataForSave = new LikeDataBase(userId, likeData);
            likeOrmObject = this.likeRepo.GetEntity(dataForSave);
        }
        
        let saveCHanges = await this.likeRepo.Save(likeOrmObject);
        let likeResponse = new LikeResponse(saveCHanges._id, saveCHanges.toObject());

        return new ExecutionResultContainer(ServicesWithUsersExecutionResult.Success, likeResponse);
    }

    public async GetUserLikeStatus(userId: string, targetId: string): Promise<ExecutionResultContainer<ServicesWithUsersExecutionResult, LikeResponse | null>>{
        let getUserStatus = await this.likeRepo.GetCurrentLikeStatus(userId, targetId);

        if(getUserStatus.executionStatus !== ExecutionResult.Pass){
            return new ExecutionResultContainer(ServicesWithUsersExecutionResult.NotFound);
        }

        return new ExecutionResultContainer(ServicesWithUsersExecutionResult.Success, getUserStatus.executionResultObject?.toObject());
    }
}

export const likeService = new LikeService(likeRepo, tokenHandler);
// class LikeService {
//     private likeTable = AvailableDbTables.likes;

//     constructor(private db: MongoDb, private tokenHandler: TokenHandler) { }

//     public async Count(commentId: string): Promise<ExecutionResultContainer<UserServiceExecutionResult, LikeCount | null>> {
//         let findComment = await commentService.GetCommentById(commentId);

//         if (findComment.executionStatus !== ServicesWithUsersExecutionResult.Success || !findComment.executionResultObject) {
//             return new ExecutionResultContainer(UserServiceExecutionResult.NotFound)
//         }

//         let likeSorter = new LikeSorter(SorterType.LikeSorter, undefined, "Like", "comments");
//         let findLikesNumber = await this.db.Count(this.likeTable, likeSorter);

//         likeSorter.status = "Dislike";
//         let findDislikeNumber = await this.db.Count(this.likeTable, likeSorter);

//         let result: LikeCount = {
//             likes: findLikesNumber.executionResultObject || 0,
//             dislikes: findDislikeNumber.executionResultObject || 0
//         }

//         return new ExecutionResultContainer(UserServiceExecutionResult.Success, result);
//     }

//     public async GetUserStatus(token: Token): Promise<ExecutionResultContainer<UserServiceExecutionResult, AvailableLikeStatus | null>> {
//         let getTokenData = await this.tokenHandler.GetTokenLoad(token);

//         if (getTokenData.tokenStatus !== TokenStatus.Accepted || !getTokenData.result) {
//             return new ExecutionResultContainer(UserServiceExecutionResult.NotFound)
//         }
//         let tokenData = getTokenData.result;

//         let userStatus: AvailableLikeStatus = "None";

//         let findLike = await this.db.GetOneByValueInOnePropery(this.likeTable, "userId", tokenData.id) as ExecutionResultContainer<ExecutionResult, LikeResponse>;
//         if(findLike.executionStatus === ExecutionResult.Pass && findLike.executionResultObject)
//             userStatus = findLike.executionResultObject.status;
        
//             return new ExecutionResultContainer(UserServiceExecutionResult.Success, userStatus);
//     }

//     // public async Save(likeData: LikeRequest, token: Token): Promise<ExecutionResultContainer<UserServiceExecutionResult, LikeResponse | null>> {
//     //     let getTokenData = await this.tokenHandler.GetTokenLoad(token);

//     //     if (getTokenData.tokenStatus !== TokenStatus.Accepted || !getTokenData.result) {
//     //         return new ExecutionResultContainer(UserServiceExecutionResult.Unauthorized)
//     //     }
//     //     let tokenData = getTokenData.result;

//     //     let findComment = await commentService.GetCommentById(likeData.targetId);

//     //     if (findComment.executionStatus !== ServicesWithUsersExecutionResult.Success || !findComment.executionResultObject) {
//     //         return new ExecutionResultContainer(UserServiceExecutionResult.NotFound)
//     //     }

//     //     let findLike = await this.db.GetOneByTwoProperties(this.likeTable, "target", likeData.target, "userId", tokenData.id) as ExecutionResultContainer<ExecutionResult, LikeResponse>;

//     //     if (findLike.executionStatus !== ExecutionResult.Pass) {
//     //         return new ExecutionResultContainer(UserServiceExecutionResult.DataBaseFailed);
//     //     }

//     //     let foundLike = findLike.executionResultObject;
//     //     let resultLikeData: LikeResponse;

//     //     if (!foundLike) {
//     //         let saveData = new LikeDataBase(tokenData.id, likeData);
//     //         let saveNewLike = await this.db.SetOne(this.likeTable, saveData) as ExecutionResultContainer<ExecutionResult, LikeResponse>;

//     //         if (saveNewLike.executionStatus !== ExecutionResult.Pass || !saveNewLike.executionResultObject) {
//     //             return new ExecutionResultContainer(UserServiceExecutionResult.DataBaseFailed);
//     //         }

//     //         resultLikeData = saveNewLike.executionResultObject;
//     //     }
//     //     else if (foundLike.status !== likeData.status) {
//     //         let updateExistedLike = await this.db.UpdateOne(this.likeTable, foundLike.id, likeData) as ExecutionResultContainer<ExecutionResult, LikeResponse>;
//     //         if (updateExistedLike.executionStatus !== ExecutionResult.Pass || !updateExistedLike.executionResultObject) {
//     //             return new ExecutionResultContainer(UserServiceExecutionResult.DataBaseFailed);
//     //         }

//     //         resultLikeData = updateExistedLike.executionResultObject;
//     //     }
//     //     else {
//     //         resultLikeData = foundLike;
//     //     }

//     //     return new ExecutionResultContainer(UserServiceExecutionResult.Success, resultLikeData);
//     // }

// }

// export const likeService = new LikeService(mongoDb, tokenHandler);