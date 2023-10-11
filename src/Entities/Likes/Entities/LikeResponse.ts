import { ObjectId } from "mongodb";
import { LikeDataBase } from "./LikeDataBase";
import { LikeRepoType } from "../Repo/LikeRepo";

export class LikeResponse extends LikeDataBase{
    public id: string
    public createdAt: string

    constructor(_id: ObjectId , likeData: LikeRepoType) {
        super(likeData.userId,likeData.userLogin , likeData)
        this.id = _id.toString()
        this.createdAt = likeData.createdAt;
    }
}