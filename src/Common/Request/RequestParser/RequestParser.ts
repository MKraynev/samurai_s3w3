import { Request } from "express"
import { Sorter, SorterType } from "../../Database/Sort/Sorter";
import { BlogSorter } from "../../../Entities/Blogs/Repo/BlogSorter";
import { BlogResponse } from "../../../Entities/Blogs/Entities/BlogForResponse";
import { Paginator } from "../../Paginator/PageHandler";
import { PostResponse } from "../../../Entities/Posts/Entities/PostForResponse";
import { PostSorter } from "../../../Entities/Posts/Repo/PostSorter";
import { UserResponse } from "../../../Entities/Users/Admin/Entities/UserForResponse";
import { UserSorter } from "../../../Entities/Users/Repo/UserSorter";
import { Token } from "../../../Entities/Users/Common/Entities/Token";
import { CommentSorter } from "../../../Entities/Comments/Repo/CommentSorter";
import { CommentDataBase } from "../../../Entities/Comments/Entities/CommentForDataBase";
import { TOKEN_COOKIE_NAME } from "../../../../settings";

export class RequestParser {
    static ReadQueryBlogSorter(request: Request): BlogSorter {
        let searchNameTerm = request.query.searchNameTerm as string | undefined;
        let sortBy: keyof BlogResponse & string | undefined = request.query.sortBy as keyof BlogResponse & string | undefined;
        let sortDirection: string | undefined = request.query.sortDirection as string | undefined;

        return new BlogSorter(
            SorterType.BlogSorter,
            searchNameTerm ? searchNameTerm : null,
            sortBy ? sortBy : "createdAt",
            sortDirection == "asc" || sortDirection == "desc" ? sortDirection : undefined
        )
    }
    static ReadQueryPostSorter(request: Request): PostSorter {
        let sortBy: keyof PostResponse & string | undefined = request.query.sortBy as keyof PostResponse & string | undefined;
        let sortDirection: string | undefined = request.query.sortDirection as string | undefined;

        return new PostSorter(
            SorterType.PostSorter,
            null,
            sortBy ? sortBy : "createdAt",
            sortDirection == "asc" || sortDirection == "desc" ? sortDirection : undefined
        )
    }
    static ReadQueryUserSorter(request: Request) {
        let sortBy: keyof UserResponse & string | undefined = request.query.sortBy as keyof UserResponse & string | undefined;
        let sortDirection: string | undefined = request.query.sortDirection as string | undefined;
        let searchLoginTerm: string | undefined = request.query.searchLoginTerm as string | undefined;
        let searchEmailTerm: string | undefined = request.query.searchEmailTerm as string | undefined;

        return new UserSorter(
            SorterType.UserSorter,
            searchLoginTerm ? searchLoginTerm : null,
            searchEmailTerm ? searchEmailTerm : null,
            sortBy ? sortBy : "createdAt",
            sortDirection == "asc" || sortDirection == "desc" ? sortDirection : undefined
        )

    }
    static ReadQueryCommentSorter(request: Request, postId: string | null) {
        let sortBy: keyof CommentDataBase & string | undefined = request.query.sortBy as keyof CommentDataBase & string | undefined;
        let sortDirection: string | undefined = request.query.sortDirection as string | undefined;


        return new CommentSorter(
            SorterType.CommentSorter,
            postId ? postId : null,
            sortBy ? sortBy : "createdAt",
            sortDirection == "asc" || sortDirection == "desc" ? sortDirection : undefined
        )

    }
    static ReadQueryPageHandle(request: Request): Paginator {
        let strPageNumber = request.query.pageNumber as string;
        let strPageSize = request.query.pageSize as string;

        let pageNumber = Number.parseInt(strPageNumber);
        let pageSize = Number.parseInt(strPageSize);


        return new Paginator(
            pageNumber,
            pageSize
        )
    }
    static ReadTokenFromBody(request: Request): Token | null {
        let headerString: string | undefined = request.header("authorization");

        if (headerString?.toLocaleLowerCase().startsWith("bearer ")) {
            let tokenString = headerString.split(" ")[1];
            let token: Token = {
                accessToken: tokenString
            }
            return token;
        }
        return null;

    }
    static ReadTokenFromCookie(request: any): Token | null {
        let token: Token = {
            accessToken: request.cookies[TOKEN_COOKIE_NAME]
        };

        return token || null;

    }
}
