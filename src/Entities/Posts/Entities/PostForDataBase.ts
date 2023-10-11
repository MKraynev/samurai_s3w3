import { ExtendedLikeStatistic } from "../../Likes/Entities/LikeStatistic";
import { PostRequest } from "./PostForRequest";

export class PostDataBase extends PostRequest {
    public extendedLikesInfo: ExtendedLikeStatistic = {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: "None",
        newestLikes: []
    };

    constructor(
        public blogName: string,
        post: PostRequest,
        public createdAt: string = (new Date()).toISOString()
    ) {
        super(post.title, post.shortDescription, post.content, post.blogId)
    }
}