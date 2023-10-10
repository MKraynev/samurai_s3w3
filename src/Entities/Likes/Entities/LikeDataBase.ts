import mongoose from "mongoose";
import { LikeRequest } from "./LikeRequest";

export class LikeDataBase extends LikeRequest {
    constructor(public userId: string, likeData: LikeRequest) {
        super(likeData.target, likeData.targetId, likeData.status)
    }
}

export const likeSchema = new mongoose.Schema<LikeDataBase>({
    userId: String,
    target: String,
    targetId: String,
    status: {type: String, enum: ["Like", "Dislike", "None"], default: "None"}
})