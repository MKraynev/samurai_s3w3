import { CommentResponse } from "../Entities/CommentForResponse";
import { CommentDataBase } from "../Entities/CommentForDataBase";
import { Sorter, SorterType } from "../../../Common/Database/Sort/Sorter";

export class CommentSorter extends Sorter<CommentDataBase>{
    constructor(
        public sorterType: SorterType,
        public postId: string | null,
        public sortBy: keyof CommentDataBase & string = "createdAt",
        public sortDirection: "desc" | "asc" = "desc"
    ) {
        super(sortBy, sortDirection, sorterType)
    }
}