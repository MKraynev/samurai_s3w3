import { AvailableDbTables, ExecutionResult, ExecutionResultContainer } from "../../../Common/Database/DataBase";
import { MongoDb, mongoDb } from "../../../Common/Database/MongoDb";
import { CommentResponse } from "../Entities/CommentForResponse";
import { Token } from "../../Users/Common/Entities/Token";
import { UserServiceExecutionResult, userService } from "../../Users/Common/BuisnessLogic/UserService";
import { AvailableLikeStatus, LikeRequest, LikeStatus } from "../../Likes/Entities/LikeRequest";
import { LikeDataBase } from "../../Likes/Entities/LikeDataBase";
import { TokenStatus, tokenHandler } from "../../../Common/Authentication/User/TokenAuthentication";
import { likeService } from "../../Likes/BuisnessLogic/LikeService";
import { NewestLike } from "../../Likes/Entities/LikeStatistic";

type CommentServiceDto = ExecutionResultContainer<ExecutionResult, CommentResponse>;

export enum ServicesWithUsersExecutionResult {
    DataBaseFailed,
    Unauthorized,
    WrongInputData,
    WrongUser,
    NotFound,
    ServiceFail,
    Success
}

class CommentService {
    private commentTable = AvailableDbTables.comments;

    constructor(private _db: MongoDb) { }

    public async GetCommentById(id: string, userToken?: Token): Promise<ExecutionResultContainer<ServicesWithUsersExecutionResult, CommentResponse | null>> {
        let foundObjectsOperation = await this._db.GetOneById(this.commentTable, id) as CommentServiceDto;
        let foundComment = foundObjectsOperation.executionResultObject;
        if (foundObjectsOperation.executionStatus === ExecutionResult.Failed) {
            return new ExecutionResultContainer(ServicesWithUsersExecutionResult.DataBaseFailed);
        }

        if (!foundComment)
            return new ExecutionResultContainer(ServicesWithUsersExecutionResult.NotFound);

        if (userToken) {
            let getTokenData = await tokenHandler.GetTokenLoad(userToken);
            let tokenData = getTokenData.result;

            if (getTokenData.tokenStatus === TokenStatus.Accepted && tokenData) {
                let getLikeStatus = await likeService.GetUserLikeStatus(tokenData.id, foundComment.id);

                if (getLikeStatus.executionStatus === ServicesWithUsersExecutionResult.Success && getLikeStatus.executionResultObject) {
                    foundComment.likesInfo.myStatus = getLikeStatus.executionResultObject.status;
                }

            }
        }

        let getLastLikes = await likeService.GetLastLikes(foundComment.id);
        if (getLastLikes.executionStatus === ServicesWithUsersExecutionResult.Success && getLastLikes.executionResultObject) {
            foundComment.likesInfo.newestLikes = getLastLikes.executionResultObject.map(likeResponse => {
                let like: NewestLike = {
                    addedAt: likeResponse.createdAt,
                    userId: likeResponse.userId,
                    login: likeResponse.userLogin
                }

                return like;
            });
        }

        return new ExecutionResultContainer(ServicesWithUsersExecutionResult.Success, foundComment);
    }
    public async DeleteComment(id: string, userToken: Token): Promise<ExecutionResultContainer<ServicesWithUsersExecutionResult, boolean | null>> {

        let findUser = await userService.GetUserByToken(userToken);
        let findComment = await this._db.GetOneById(this.commentTable, id) as CommentServiceDto;

        if (findUser.executionStatus === UserServiceExecutionResult.NotFound ||
            !findUser.executionResultObject)
            return new ExecutionResultContainer(ServicesWithUsersExecutionResult.Unauthorized);

        if (findComment.executionStatus === ExecutionResult.Failed ||
            !findComment.executionResultObject)
            return new ExecutionResultContainer(ServicesWithUsersExecutionResult.NotFound);

        let user = findUser.executionResultObject;
        let comment = findComment.executionResultObject;

        if (user.id !== comment.commentatorInfo.userId)
            return new ExecutionResultContainer(ServicesWithUsersExecutionResult.WrongUser);


        let deleteOperation = await this._db.DeleteOne(this.commentTable, id);

        if (deleteOperation.executionStatus === ExecutionResult.Failed ||
            !deleteOperation.executionResultObject)
            return new ExecutionResultContainer(ServicesWithUsersExecutionResult.DataBaseFailed);


        return new ExecutionResultContainer(ServicesWithUsersExecutionResult.Success, true);
    }
    public async UpdateComment(id: string, userToken: Token, content: string): Promise<ExecutionResultContainer<ServicesWithUsersExecutionResult, CommentResponse | null>> {
        let findUser = await userService.GetUserByToken(userToken);
        let findComment = await this._db.GetOneById(this.commentTable, id) as CommentServiceDto;

        if (findUser.executionStatus === UserServiceExecutionResult.NotFound ||
            !findUser.executionResultObject)
            return new ExecutionResultContainer(ServicesWithUsersExecutionResult.Unauthorized);

        if (findComment.executionStatus === ExecutionResult.Failed ||
            !findComment.executionResultObject)
            return new ExecutionResultContainer(ServicesWithUsersExecutionResult.NotFound);

        let user = findUser.executionResultObject;
        let comment = findComment.executionResultObject;

        if (user.id !== comment.commentatorInfo.userId)
            return new ExecutionResultContainer(ServicesWithUsersExecutionResult.Unauthorized);

        let updateComment = await this._db.UpdateOneProperty(this.commentTable, id, "content", content) as CommentServiceDto;
        if (updateComment.executionStatus === ExecutionResult.Failed ||
            !updateComment.executionResultObject)
            return new ExecutionResultContainer(ServicesWithUsersExecutionResult.DataBaseFailed);

        return new ExecutionResultContainer(ServicesWithUsersExecutionResult.Success, updateComment.executionResultObject);
    }

    public async AddLikeData(newLikeData: LikeRequest, previousLikeData: LikeDataBase | null) {
        let commentId = newLikeData.targetId;
        let findComment = await this.GetCommentById(commentId);

        if (findComment.executionStatus !== ServicesWithUsersExecutionResult.Success || !findComment.executionResultObject) {
            return;
        }

        let previousStatus: AvailableLikeStatus = previousLikeData?.status || "None";
        let newStatus: AvailableLikeStatus = newLikeData.status;


        //step 1
        switch (`${previousStatus}->${newStatus}`) {
            case "Like->None":
            case "Like->Dislike":
                this.SubLike(commentId);
                break;

            case "Dislike->None":
            case "Dislike->Like":
                this.SubDislike(commentId)
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
                this.AddLike(commentId);
                break;

            case "Dislike":
                this.AddDislike(commentId);
                break;
        }
    }

    private async AddLike(commentId: string) {
        let add = await this._db.IncrementProperty(this.commentTable, commentId, "likesInfo.likesCount", 1);
        return add.executionResultObject;
    }
    private async SubLike(commentId: string) {
        let sub = await this._db.IncrementProperty(this.commentTable, commentId, "likesInfo.likesCount", -1);
        return sub.executionResultObject;
    }
    private async AddDislike(commentId: string) {
        let add = await this._db.IncrementProperty(this.commentTable, commentId, "likesInfo.dislikesCount", 1);
        return add.executionResultObject;
    }
    private async SubDislike(commentId: string) {
        let sub = await this._db.IncrementProperty(this.commentTable, commentId, "likesInfo.dislikesCount", -1);
        return sub.executionResultObject;
    }
}

export const commentService = new CommentService(mongoDb);