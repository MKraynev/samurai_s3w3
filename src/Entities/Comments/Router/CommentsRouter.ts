import { Router, Response, Request } from "express";
import { CompleteRequest, RequestWithBody, RequestWithParams } from "../../../Common/Request/Entities/RequestTypes";
import { ValidCommentFields } from "./Middleware/CommentMiddleware";
import { ServicesWithUsersExecutionResult, commentService } from "../BuisnessLogic/CommentService";
import { CheckFormatErrors } from "../../../Common/Request/RequestValidation/RequestValidation";
import { AccessIsAllowed, ParseAccessToken } from "../../Users/Common/Router/Middleware/AuthMeddleware";
import { ValidLikeFields } from "../../Likes/TestRouter/Middleware/LikeMiddleware";
import { AvailableLikeStatus, LikeRequest } from "../../Likes/Entities/LikeRequest";
import { likeService } from "../../Likes/BuisnessLogic/LikeService";

export const commentRouter = Router();

commentRouter.get("/:id",
    ParseAccessToken,
    async (request: RequestWithParams<{ id: string }>, response: Response) => {
        let userToken = request.accessToken;
        let findComment = await commentService.GetCommentById(request.params.id, userToken);

        switch (findComment.executionStatus) {
            case ServicesWithUsersExecutionResult.Success:
                let comment = findComment.executionResultObject;
                if (comment) {
                    response.status(200).send(comment);
                    return;
                }

            case ServicesWithUsersExecutionResult.DataBaseFailed:
            case ServicesWithUsersExecutionResult.NotFound:
            default:
                response.sendStatus(404);
                break;
        }
    })

commentRouter.delete("/:id",
    ParseAccessToken,
    async (request: RequestWithParams<{ id: string }>, response: Response) => {
        let id = request.params.id;
        let token = request.accessToken;

        if (!token) {
            response.sendStatus(404);
            return;
        }

        let deleteComment = await commentService.DeleteComment(id, token);

        switch (deleteComment.executionStatus) {
            case ServicesWithUsersExecutionResult.Success:
                if (deleteComment.executionResultObject) {
                    response.sendStatus(204);
                    return;
                }

            case ServicesWithUsersExecutionResult.Unauthorized:
                response.sendStatus(401);
                break;

            case ServicesWithUsersExecutionResult.WrongUser:
                response.sendStatus(403);
                break;

            case ServicesWithUsersExecutionResult.NotFound:
            case ServicesWithUsersExecutionResult.DataBaseFailed:
            default:
                response.sendStatus(404);
                break;
        }
        // let deleteResult = await dataManager.commentRepo.DeleteCertainWithUserCheck(request.params.id, user.id);

        // switch (deleteResult) {
        //     case DeleteResult.WrongUser:
        //         response.sendStatus(403);
        //         break;
        //     case DeleteResult.Deleted:
        //         response.sendStatus(204);
        //         break;
        //     default:
        //         response.sendStatus(404);
        //         break;
        // }
        // return;
    })

commentRouter.put("/:id",
    ValidCommentFields,
    ParseAccessToken,
    CheckFormatErrors,
    async (request: CompleteRequest<{ id: string }, { content: string }, {}>, response: Response) => {
        let commentId = request.params.id;
        let userToken = request.accessToken;
        let content = request.body.content;

        let updateComment = await commentService.UpdateComment(commentId, userToken, content);

        switch (updateComment.executionStatus) {
            case ServicesWithUsersExecutionResult.Success:
                if (updateComment.executionResultObject) {
                    response.sendStatus(204);
                    return;
                }

            case ServicesWithUsersExecutionResult.Unauthorized:
                response.sendStatus(401);
                break;

            case ServicesWithUsersExecutionResult.WrongUser:
                response.sendStatus(403);
                break;

            case ServicesWithUsersExecutionResult.NotFound:
            case ServicesWithUsersExecutionResult.DataBaseFailed:
            default:
                response.sendStatus(404);
                break;
        }
    })

commentRouter.put("/:id/like-status",
    ParseAccessToken,
    AccessIsAllowed,
    ValidLikeFields,
    CheckFormatErrors,
    async (request: CompleteRequest<{ id: string }, { likeStatus: AvailableLikeStatus }, {}>, response: Response) => {
        let commentId = request.params.id;
        let likeStatus = request.body.likeStatus;
        let token = request.accessToken;

        let likeData = new LikeRequest("comments", commentId, likeStatus);

        let setLike = await likeService.SetLikeData(token, likeData);

        switch (setLike.executionStatus) {
            case ServicesWithUsersExecutionResult.Success:
                response.sendStatus(204);
                break;

            case ServicesWithUsersExecutionResult.Unauthorized:
                response.sendStatus(401);
                break;

            default:
                response.sendStatus(404);
                break;
        }
    })