import { PostResponse } from "../Entities/PostForResponse";
import { Sorter, SorterType } from "../../../Common/Database/Sort/Sorter";

export class PostSorter extends Sorter<PostResponse>{
    constructor(
        public sorterType: SorterType,
        public searchBlogId: string | null = null,
        public sortBy: keyof PostResponse & string = "createdAt",
        public sortDirection: "desc" | "asc" = "desc"
    ) {
        super(sortBy, sortDirection, sorterType)
    }
}