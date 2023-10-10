import { LikeStatistic } from "../../Likes/Entities/LikeStatistic";
import { PostRequest } from "./PostForRequest";

export class PostDataBase extends PostRequest {
    

    constructor(
        post: PostRequest,
        public createdAt: string = (new Date()).toISOString()
    ) {
        super(post.title, post.shortDescription, post.content, post.blogId)
    }
}