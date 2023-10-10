import { ObjectId } from "mongodb";
import { PostDataBase } from "./PostForDataBase";

export class PostResponse extends PostDataBase {
    public id: string;
    constructor(id: ObjectId, dbPost: PostDataBase) {
        super(dbPost, dbPost.createdAt);
        this.id = id.toString();
    }
}