import { Router, Request, Response } from "express";
import { RequestParser } from "../../../Common/Request/RequestParser/RequestParser";
import { postService } from "../BuisnessLogic/PostService";
import { ServiseExecutionStatus } from "../../Blogs/BuisnessLogic/BlogService";
import { CompleteRequest, RequestWithBody, RequestWithParams } from "../../../Common/Request/Entities/RequestTypes";
import { ValidPostFields } from "./Middleware/PostMiddleware";
import { CheckFormatErrors } from "../../../Common/Request/RequestValidation/RequestValidation";
import { PostRequest } from "../Entities/PostForRequest";
import { ParseAccessToken } from "../../Users/Common/Router/Middleware/AuthMeddleware";
import { ValidCommentFields } from "../../Comments/Router/Middleware/CommentMiddleware";
import { CommentRequest } from "../../Comments/Entities/CommentRequest";

export const postRouter = Router();

postRouter.get("",
    async (request: Request, response: Response) => {
        let searchParams = RequestParser.ReadQueryPostSorter(request);
        let pageHandler = RequestParser.ReadQueryPageHandle(request);

        let search = await postService.GetPosts(searchParams, pageHandler)

        switch (search.executionStatus) {
            case ServiseExecutionStatus.DataBaseFailed:
            case ServiseExecutionStatus.Unauthorized:
                response.sendStatus(400);
                break;

            case ServiseExecutionStatus.Success:
                response.status(200).send(search.executionResultObject);
                break;
        }
        // let foundValues = await dataManager.postRepo.TakeAll(searchParams, pageHandler);
        // let returnValues = foundValues || [];

        // response.status(200).send(returnValues)
    })

postRouter.get("/:id",
    async (request: RequestWithParams<{ id: string }>, response: Response) => {
        let reqId = request.params.id;

        let search = await postService.GetPostById(request.params.id);
        switch (search.executionStatus) {
            case ServiseExecutionStatus.DataBaseFailed:
            case ServiseExecutionStatus.Unauthorized:
                response.sendStatus(400);
                break;

            case ServiseExecutionStatus.NotFound:
                response.sendStatus(404);
                break;

            case ServiseExecutionStatus.Success:
                response.status(200).send(search.executionResultObject);
                break;
        }

        // let foundValue = await dataManager.postRepo.TakeCertain(reqId);
        // if (foundValue) {
        //     response.status(200).send(foundValue);
        // }
        // else {
        //     response.sendStatus(404);
        // }

    })

postRouter.post("",
    ValidPostFields,
    CheckFormatErrors,
    async (request: RequestWithBody<PostRequest>, response: Response) => {
        let reqObj = new PostRequest(request.body.title, request.body.shortDescription, request.body.content, request.body.blogId);

        let save = await postService.SavePost(reqObj, request);

        switch (save.executionStatus) {
            case ServiseExecutionStatus.DataBaseFailed:
            case ServiseExecutionStatus.NotFound:
                response.sendStatus(404);
                break;
            case ServiseExecutionStatus.Unauthorized:
                response.sendStatus(401);
                break;

            case ServiseExecutionStatus.Success:
                response.status(201).send(save.executionResultObject);
                break;
        }

        // let existedBlog = await dataManager.blogRepo.TakeCertain(request.body.blogId);
        // if (existedBlog) {
        //     let reqObj = new PostRequest(
        //         request.body.title, request.body.shortDescription, request.body.content, request.body.blogId, existedBlog.name);
        //     //Blog exist
        //     let savedPost = await dataManager.postRepo.Save(reqObj);
        //     if (savedPost) {
        //         response.status(201).send(savedPost);
        //         return;
        //     }
        // }
        // response.sendStatus(404);

    })

postRouter.put("/:id",
    ValidPostFields,
    CheckFormatErrors,
    async (request: Request<{ id: string }, {}, PostRequest, {}>, response: Response) => {
        let requestedPostId = request.params.id;
        let reqObj = new PostRequest(request.body.title, request.body.shortDescription, request.body.content, request.body.blogId);

        let update = await postService.UpdatePost(requestedPostId, reqObj, request);
        switch (update.executionStatus) {
            case ServiseExecutionStatus.DataBaseFailed:
            case ServiseExecutionStatus.NotFound:
            case ServiseExecutionStatus.Unauthorized:
                response.sendStatus(401);
                break;

            case ServiseExecutionStatus.Success:
                response.sendStatus(204);
                break;
        }
        // let existedBlog = await dataManager.blogRepo.TakeCertain(requestedBlogId);
        // let requestedPost = await dataManager.postRepo.TakeCertain(requestedPostId);
        // if (existedBlog && requestedPost) {
        //     let reqData: PostRequest = new PostRequest(
        //         request.body.title, request.body.shortDescription, request.body.content, request.body.blogId, existedBlog.name)

        //     let updateResultIsPositive = await dataManager.postRepo.Update(requestedPostId, reqData);

        //     if (updateResultIsPositive) {
        //         response.sendStatus(204);
        //         return;
        //     }
        // }
        // response.sendStatus(404);
    })

postRouter.delete("/:id",
    async (request: RequestWithParams<{ id: string }>, response: Response) => {
        let idVal = request.params.id;

        let deleteOperation = await postService.DeletePost(idVal, request);

        switch (deleteOperation.executionStatus) {
            case ServiseExecutionStatus.Unauthorized:
                response.sendStatus(401);
                break;

            case ServiseExecutionStatus.DataBaseFailed:
                response.sendStatus(500);
                break;

            case ServiseExecutionStatus.Success:
                response.sendStatus(204);
                break;

            case ServiseExecutionStatus.NotFound:
                response.sendStatus(404);
                break;
        }

        // let postDeleted = await dataManager.postRepo.DeleteCertain(idVal);

        // if (postDeleted) {
        //     response.sendStatus(204);
        // }
        // else {
        //     response.sendStatus(404);
        // }
        // return;
    })

postRouter.get("/:id/comments",
    ParseAccessToken,
    async (request: RequestWithParams<{ id: string }>, response: Response) => {
        let userToken = request.accessToken;
        let postId = request.params.id;
        let pageHandler = RequestParser.ReadQueryPageHandle(request);
        let searchParams = RequestParser.ReadQueryCommentSorter(request, postId);

        let getComments = await postService.GetPostComments(postId, searchParams, pageHandler, userToken);

        switch (getComments.executionStatus) {
            case ServiseExecutionStatus.Success:
                let comments = getComments.executionResultObject;
                if (comments) {
                    response.status(200).send(comments);
                    return;
                }

            case ServiseExecutionStatus.NotFound:
            case ServiseExecutionStatus.DataBaseFailed:
            default:
                response.sendStatus(404);
                break;
        }
        // let foundValues = await dataManager.commentRepo.TakeAll(searchParams, pageHandler);
        // if (foundValues) {
        //     response.status(200).send(foundValues);
        //     return;
        // }
        // response.sendStatus(404);
        // return;
    })

postRouter.post("/:id/comments",
    ValidCommentFields,
    CheckFormatErrors,
    ParseAccessToken,
    async (request: CompleteRequest<{ id: string }, { content: string }, {}>, response: Response) => {

        let token = request.accessToken;
        let comment = new CommentRequest(request.body.content);
        let postId = request.params.id;


        let saveComment = await postService.SaveComment(postId, token, comment);

        switch (saveComment.executionStatus) {
            case ServiseExecutionStatus.NotFound:
                response.sendStatus(404);
                break;
            case ServiseExecutionStatus.Unauthorized:
                response.sendStatus(401);
                break;

            case ServiseExecutionStatus.Success:
                let savedComment = saveComment.executionResultObject;
                if (savedComment) {
                    response.status(201).send(savedComment);
                    return;
                }

            default:
                response.sendStatus(400);
                break;
        }
        // let user: UserResponse  = request.user;

        // let comment = new CommentRequest(request.body.content);
        // let commentToDb = new CommentRequestForDB(comment, request.params.id, user.id, user.login);

        // let savedComment = await dataManager.commentRepo.Save(commentToDb);

        // if (savedComment) {
        //     response.status(201).send(savedComment);
        //     return;
        // }
        // response.sendStatus(400);
        // return;
    })