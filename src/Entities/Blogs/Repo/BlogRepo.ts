// import { WithId } from "mongodb";
// import { BlogRequest } from "../Entities/BlogForRequest";
// import { BlogResponse } from "../Entities/BlogForResponse";
// import { Repo } from "../../../Common/Data/Repo/Repo"
// import { BlogDataBase } from "../Entities/BlogForDataBase";

// export class BlogRepo extends Repo<BlogRequest, BlogResponse | BlogDataBase>{
//     ConvertFrom(dbValue: WithId<BlogDataBase>): BlogResponse {
//         return new BlogResponse(dbValue._id, dbValue)
//     }
//     ConvertTo(dbValue: BlogRequest): BlogDataBase {
//         return new BlogDataBase(dbValue);
//     }
// }