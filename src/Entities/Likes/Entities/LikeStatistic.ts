import { AvailableLikeStatus } from "./LikeRequest"

export type LikeStatistic = {
    likesCount: number,
    dislikesCount: number,
    myStatus: AvailableLikeStatus
}