import { ObjectId } from "mongodb";
import { BlogRequest } from "./BlogForRequest";
import { BlogDataBase } from "./BlogForDataBase";

export class BlogResponse extends BlogDataBase {
    public id: string;
    constructor(id: ObjectId, blog: BlogDataBase) {
        super(blog, blog.createdAt, blog.isMembership);
        this.id = id.toString();
    }
}