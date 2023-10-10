import { Router, Request, Response } from "express";
import { RequestParser } from "../../../Common/Request/RequestParser/RequestParser";
import { CompleteRequest, RequestWithBody, RequestWithParams } from "../../../Common/Request/Entities/RequestTypes";
import { CheckFormatErrors } from "../../../Common/Request/RequestValidation/RequestValidation";
import { BlogRequest } from "../Entities/BlogForRequest";
import { ValidBlogFields } from "./Middleware/BlogMiddleware";
import { ServiseExecutionStatus, blogService } from "../BuisnessLogic/BlogService";
import { PostSorter } from "../../Posts/Repo/PostSorter";
import { ValidPostFieldsLight } from "../../Posts/Router/Middleware/PostMiddleware";
import { PostRequest } from "../../Posts/Entities/PostForRequest";


export const blogRouter = Router();

blogRouter.get("",
    async (request: Request, response: Response) => {
        let searchParams = RequestParser.ReadQueryBlogSorter(request);
        let pageHandler = RequestParser.ReadQueryPageHandle(request);

        let search = await blogService.GetBlogs(searchParams, pageHandler);

        switch (search.executionStatus) {
            case ServiseExecutionStatus.DataBaseFailed:
            case ServiseExecutionStatus.Unauthorized:
                response.sendStatus(400);
                break;

            case ServiseExecutionStatus.Success:
                response.status(200).send(search.executionResultObject);
                break;
        }
    })

blogRouter.get("/:id",
    async (request: RequestWithParams<{ id: string }>, response: Response) => {
        let search = await blogService.GetBlogById(request.params.id);
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
    })

blogRouter.get("/:id/posts",
    async (request: RequestWithParams<{ id: string }>, response: Response) => {
        let blogId = request.params.id;

        // let existedBlog = await dataManager.blogRepo.TakeCertain(reqId);
        // if (existedBlog) {
        //Для запроса создаем объект PostSorter
        let searchParams = RequestParser.ReadQueryPostSorter(request) as PostSorter;
        let pageHandler = RequestParser.ReadQueryPageHandle(request);

        let findPosts = await blogService.GetBlogPosts(blogId, searchParams, pageHandler);

        switch (findPosts.executionStatus) {
            case ServiseExecutionStatus.Success:
                if (findPosts.executionResultObject) {
                    response.status(200).send(findPosts.executionResultObject);
                    return;
                }

            case ServiseExecutionStatus.NotFound:
            default:
                response.sendStatus(404);
        }
        //     let foundValue = await dataManager.postRepo.TakeAll(searchParams, pageHandler)

        //     response.status(200).send(foundValue);
        //     return;

        // }
        // response.sendStatus(404);
    })

blogRouter.post("",
    ValidBlogFields,
    CheckFormatErrors,
    async (request: RequestWithBody<BlogRequest>, response: Response) => {
        let reqObj = new BlogRequest(request.body.name, request.body.description, request.body.websiteUrl);

        let save = await blogService.SaveBlog(reqObj, request);

        switch (save.executionStatus) {
            case ServiseExecutionStatus.DataBaseFailed:
            case ServiseExecutionStatus.NotFound:
            case ServiseExecutionStatus.Unauthorized:
                response.sendStatus(401);
                break;

            case ServiseExecutionStatus.Success:
                response.status(201).send(save.executionResultObject);
                break;
        }
        // let savedBlog = await dataManager.blogRepo.Save(reqObj);
        // if (savedBlog) {
        //     response.status(201).send(savedBlog);
        // }
        // else {
        //     response.sendStatus(400);
        // }
    })

blogRouter.post("/:id/posts",
    ValidPostFieldsLight,
    CheckFormatErrors,
    async (request: CompleteRequest<{ id: string }, PostRequest, {}>, response: Response) => {
        let blogId = request.params.id;
        let reqPost = new PostRequest(request.body.title, request.body.shortDescription, request.body.content, blogId)

        let savePost = await blogService.SavePost(reqPost);

        switch (savePost.executionStatus) {
            case ServiseExecutionStatus.Success:
                let savedPost = savePost.executionResultObject;
                if (savedPost) {
                    response.status(201).send(savedPost);
                    return;
                }

            case ServiseExecutionStatus.NotFound:
            case ServiseExecutionStatus.DataBaseFailed:
            default:
                response.sendStatus(404);
        }
    })


blogRouter.put("/:id",
    ValidBlogFields,
    CheckFormatErrors,
    async (request: CompleteRequest<{ id: string }, BlogRequest, {}>, response: Response) => {
        let reqData: BlogRequest = new BlogRequest(request.body.name, request.body.description, request.body.websiteUrl)

        let update = await blogService.UpdateBlog(request.params.id, reqData, request);
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
        // let requestedId = request.params.id;

        // let existedBlog = await dataManager.blogRepo.TakeCertain(requestedId);

        // if (existedBlog) {
        //     let updateResultIsPositive = await dataManager.blogRepo.Update(requestedId, reqData);

        //     if (updateResultIsPositive) {
        //         response.sendStatus(204);
        //         return;
        //     }
        // }

        // response.sendStatus(404);
    })

blogRouter.delete("/:id",
    async (request: RequestWithParams<{ id: string }>, response: Response) => {
        let idVal = request.params.id;

        let deleteOperation = await blogService.DeleteBlog(idVal, request);

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
        // let blogDeleted = await dataManager.blogRepo.DeleteCertain(idVal);

        // if (blogDeleted) {
        //     response.sendStatus(204);
        // }
        // else {
        //     response.sendStatus(404);
        // }
    })

