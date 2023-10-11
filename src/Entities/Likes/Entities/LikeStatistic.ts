import { AvailableLikeStatus } from "./LikeRequest"

export type ExtendedLikeStatistic = LikeStatistic & { newestLikes: NewestLike[] }

export type LikeStatistic = {
    likesCount: number,
    dislikesCount: number,
    myStatus: AvailableLikeStatus
}

export type NewestLike = {
    addedAt: string,
    userId: string,
    login: string
}