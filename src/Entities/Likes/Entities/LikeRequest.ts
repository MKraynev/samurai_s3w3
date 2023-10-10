import { AvailableDbTables } from "../../../Common/Database/DataBase";

export type AvailableLikeTarget = "comments";
export type AvailableLikeStatus = "Like" | "Dislike" | "None";
export const AvailableLikeStatusList = ["Like", "Dislike", "None"];
export enum LikeStatus{
    None = 0,
    Like = 1,
    Dislike = 2
}

export class LikeRequest{
    constructor(
        public target: AvailableLikeTarget,
        public targetId: string,
        public status: AvailableLikeStatus
    ) {}
}