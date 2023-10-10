import { BlogResponse } from "../../../Entities/Blogs/Entities/BlogForResponse";

export class Sorter<T>{
    constructor(
        public sortBy: keyof T | string = "createdAt",
        public sortDirection: "desc" | "asc" = "desc",
        public type: SorterType
    ) { }
}

export enum SorterType {
    BlogSorter,
    PostSorter,
    UserSorter,
    CommentSorter,
    LogSorter,
    DeviceSorter
}