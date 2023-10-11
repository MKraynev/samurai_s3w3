import { AvailableLikeStatus } from "./LikeRequest"

export type LikeStatistic = {
    likesCount: number,
    dislikesCount: number,
    myStatus: AvailableLikeStatus,
    newestLikes: NewestLike[]
}

export type NewestLike = {
    addedAt: string,
    userId: string,
    login: string
}