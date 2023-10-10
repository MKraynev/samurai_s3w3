import { WithId } from "mongodb";
// import { Repo } from "../../../Common/Data/Repo/Repo"
import { PostRequest } from "../Entities/PostForRequest";
import { PostDataBase } from "../Entities/PostForDataBase";
import { PostResponse } from "../Entities/PostForResponse";


// export class PostRepo extends Repo<PostRequest, PostResponse | PostDataBase>{
//     ConvertFrom(dbValue: WithId<PostDataBase>): PostResponse {
//         return new PostResponse(dbValue._id, dbValue)
//     }
//     ConvertTo(dbValue: PostRequest): PostDataBase {
//         return new PostDataBase(dbValue);
//     }
// }