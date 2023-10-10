import { BlogResponse } from "../../Blogs/Entities/BlogForResponse";
import { UserResponse } from "../Admin/Entities/UserForResponse";
import { Sorter, SorterType } from "../../../Common/Database/Sort/Sorter";

export class UserSorter extends Sorter<UserResponse>{
    constructor(
        public sorterType: SorterType,
        public searchLoginTerm: string | null = null,
        public searchEmailTerm: string | null = null,
        public sortBy: keyof UserResponse & string = "createdAt",
        public sortDirection: "desc" | "asc" = "desc"
    ) {
        super(sortBy, sortDirection, sorterType)
    }
}