import { Request } from "express"
import { AdminAuthentication, AuthenticationResult, IAuthenticator } from "../../../Common/Authentication/Admin/AdminAuthenticator";
import { AvailableDbTables, DataBase, ExecutionResult, ExecutionResultContainer } from "../../../Common/Database/DataBase";
import { MongoDb, mongoDb } from "../../../Common/Database/MongoDb";
import { Page } from "../../../Common/Paginator/Page";
import { Paginator } from "../../../Common/Paginator/PageHandler";
import { BlogRequest } from "../Entities/BlogForRequest";
import { BlogResponse } from "../Entities/BlogForResponse";
import { BlogSorter } from "../Repo/BlogSorter";
import { BlogDataBase } from "../Entities/BlogForDataBase";
import { PostResponse } from "../../Posts/Entities/PostForResponse";
import { postService } from "../../Posts/BuisnessLogic/PostService";
import { PostSorter } from "../../Posts/Repo/PostSorter";
import { RequestParser } from "../../../Common/Request/RequestParser/RequestParser";
import { PostRequest } from "../../Posts/Entities/PostForRequest";
import { PostDataBase } from "../../Posts/Entities/PostForDataBase";

export enum ServiseExecutionStatus {
    Unauthorized,
    DataBaseFailed,
    Success,
    NotFound
}
type BlogServiceDto = ExecutionResultContainer<ExecutionResult, BlogResponse>;
type BlogServiceDtos = ExecutionResultContainer<ExecutionResult, BlogResponse[]>;

class BlogServise {
    private blogsTable = AvailableDbTables.blogs;
    private postsTable = AvailableDbTables.posts;

    constructor(private _db: MongoDb, private _authenticator: IAuthenticator) { }

    public async GetBlogs(searchConfig: BlogSorter, paginator: Paginator): Promise<ExecutionResultContainer<ServiseExecutionStatus, Page<BlogResponse[] | null>>> {

        let countOperation = await this._db.Count(this.blogsTable, searchConfig);

        if (countOperation.executionStatus === ExecutionResult.Failed || countOperation.executionResultObject === null)
            return new ExecutionResultContainer(ServiseExecutionStatus.DataBaseFailed);

        let neededSkipObjectsNumber = paginator.GetAvailableSkip(countOperation.executionResultObject);
        let foundObjectsOperation = await this._db.GetMany(this.blogsTable, searchConfig, neededSkipObjectsNumber, paginator.pageSize) as BlogServiceDtos;

        if (foundObjectsOperation.executionStatus === ExecutionResult.Failed)
            return new ExecutionResultContainer(ServiseExecutionStatus.DataBaseFailed);
        let pagedObjects: Page<BlogResponse[] | null>;

        if (foundObjectsOperation.executionResultObject) {
            pagedObjects = paginator.GetPaged(foundObjectsOperation.executionResultObject);
        }
        else {
            pagedObjects = paginator.GetPaged(null);
        }

        let operationResult = new ExecutionResultContainer(ServiseExecutionStatus.Success, pagedObjects)

        return operationResult;
    }
    public async GetBlogById(id: string): Promise<ExecutionResultContainer<ServiseExecutionStatus, BlogResponse | null>> {
        let foundObjectsOperation = await this._db.GetOneById(this.blogsTable, id) as BlogServiceDto;

        if (foundObjectsOperation.executionStatus === ExecutionResult.Failed) {
            return new ExecutionResultContainer(ServiseExecutionStatus.DataBaseFailed);
        }

        if (!foundObjectsOperation.executionResultObject)
            return new ExecutionResultContainer(ServiseExecutionStatus.NotFound);

        return new ExecutionResultContainer(ServiseExecutionStatus.Success, foundObjectsOperation.executionResultObject);
    }
    public async SaveBlog(blog: BlogRequest, request: Request<{}, {}, {}, {}>): Promise<ExecutionResultContainer<ServiseExecutionStatus, BlogResponse | null>> {
        let accessVerdict = this._authenticator.AccessCheck(request);

        if (accessVerdict !== AuthenticationResult.Accept)
            return new ExecutionResultContainer(ServiseExecutionStatus.Unauthorized);

        let blogForSave = new BlogDataBase(blog);
        let saveOperation = await this._db.SetOne(this.blogsTable, blogForSave) as BlogServiceDto;

        if (saveOperation.executionStatus === ExecutionResult.Failed || !saveOperation.executionResultObject) {
            return new ExecutionResultContainer(ServiseExecutionStatus.DataBaseFailed);
        }

        return new ExecutionResultContainer(ServiseExecutionStatus.Success, saveOperation.executionResultObject);
    }
    public async UpdateBlog(id: string, blog: BlogRequest, request: Request<{}, {}, {}, {}>): Promise<ExecutionResultContainer<ServiseExecutionStatus, BlogResponse | null>> {
        let accessVerdict = this._authenticator.AccessCheck(request);

        if (accessVerdict !== AuthenticationResult.Accept)
            return new ExecutionResultContainer(ServiseExecutionStatus.Unauthorized);

        let update = await this._db.UpdateOne(this.blogsTable, id, blog) as BlogServiceDto;

        if (update.executionStatus === ExecutionResult.Failed)
            return new ExecutionResultContainer(ServiseExecutionStatus.DataBaseFailed);

        if (!update.executionResultObject)
            return new ExecutionResultContainer(ServiseExecutionStatus.NotFound);


        return new ExecutionResultContainer(ServiseExecutionStatus.Success, update.executionResultObject);
    }
    public async DeleteBlog(id: string, request: Request<{}, {}, {}, {}>): Promise<ExecutionResultContainer<ServiseExecutionStatus, boolean | null>> {
        let accessVerdict = this._authenticator.AccessCheck(request);

        if (accessVerdict !== AuthenticationResult.Accept)
            return new ExecutionResultContainer(ServiseExecutionStatus.Unauthorized);

        let deleteOperation = await this._db.DeleteOne(this.blogsTable, id);

        if (deleteOperation.executionStatus === ExecutionResult.Failed)
            return new ExecutionResultContainer(ServiseExecutionStatus.DataBaseFailed);

        if (!deleteOperation.executionResultObject) {
            return new ExecutionResultContainer(ServiseExecutionStatus.NotFound);
        }

        return new ExecutionResultContainer(ServiseExecutionStatus.Success, true);
    }
    public async GetBlogPosts(blogId: string, postSorter: PostSorter, paginator: Paginator): Promise<ExecutionResultContainer<ServiseExecutionStatus, Page<PostResponse[]> | null>> {
        let findBlog = await this.GetBlogById(blogId);
        if (findBlog.executionStatus !== ServiseExecutionStatus.Success || !findBlog.executionResultObject)
            return new ExecutionResultContainer(ServiseExecutionStatus.NotFound);

        let blog = findBlog.executionResultObject;
        postSorter.searchBlogId = blog.id;

        let postSearch = await postService.GetPosts(postSorter, paginator);
        return postSearch;

    }
    public async SavePost(post: PostRequest): Promise<ExecutionResultContainer<ServiseExecutionStatus, PostResponse | null>> {
        let findBlog = await this.GetBlogById(post.blogId);
        if (findBlog.executionStatus !== ServiseExecutionStatus.Success || !findBlog.executionResultObject)
            return new ExecutionResultContainer(ServiseExecutionStatus.NotFound);

        // let blog = findBlog.executionResultObject;

        let postForSave = new PostDataBase(findBlog.executionResultObject.name, post);
        let savePost = await this._db.SetOne(this.postsTable, postForSave) as ExecutionResultContainer<ExecutionResult, PostResponse>;

        if (savePost.executionStatus !== ExecutionResult.Pass || !savePost.executionResultObject)
            return new ExecutionResultContainer(ServiseExecutionStatus.DataBaseFailed);

        return new ExecutionResultContainer(ServiseExecutionStatus.Success, savePost.executionResultObject);
    }
}

export const blogService = new BlogServise(mongoDb, AdminAuthentication); 