import { BlogRequest } from "./BlogForRequest";

export class BlogDataBase extends BlogRequest{
    constructor(
        blog: BlogRequest,
        public createdAt: string = (new Date()).toISOString(),
        public isMembership: boolean = false
    ){
        super(blog.name, blog.description, blog.websiteUrl)
    }
}