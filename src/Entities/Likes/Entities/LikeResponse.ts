import { ObjectId } from "mongodb";
import { LikeDataBase } from "./LikeDataBase";

export class LikeResponse extends LikeDataBase{
    public id: string
    constructor(_id: ObjectId , likeData: LikeDataBase) {
        super(likeData.userId, likeData)
        this.id = _id.toString()
    }
}