import mongoose from "mongoose";
import { LikeRequest } from "./LikeRequest";

export class LikeDataBase extends LikeRequest {
    constructor(public userId: string, public userLogin: string, likeData: LikeRequest) {
        super(likeData.targetId, likeData.status)
    }
}

export const likeSchema = new mongoose.Schema<LikeDataBase>(
    {
        userId: String,
        userLogin: String,
        targetId: String,
        status: { type: String, enum: ["Like", "Dislike", "None"], default: "None" }
    },
    { timestamps: true })