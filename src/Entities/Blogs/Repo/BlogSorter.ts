import { BlogResponse } from "../Entities/BlogForResponse";
import { Sorter, SorterType } from "../../../Common/Database/Sort/Sorter";

export class BlogSorter extends Sorter<BlogResponse>{
    constructor(
        public sorterType: SorterType,
        public searchNameTerm: string | null = null,
        public sortBy: keyof BlogResponse & string = "createdAt",
        public sortDirection: "desc" | "asc" = "desc"
    ) {
        super(sortBy, sortDirection, sorterType)
    }
}