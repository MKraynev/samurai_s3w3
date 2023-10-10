import { Request, Response, Router } from "express";
import { mongoDb } from "../../../Common/Database/MongoDb";
import { AvailableDbTables, ExecutionResult } from "../../../Common/Database/DataBase";
import { likeRepo } from "../../Likes/Repo/LikeRepo";


export const _NewTestClearAllRouter = Router();

_NewTestClearAllRouter.delete("", async (request: Request, response: Response) => {
    let blogsDeleted = await mongoDb.DeleteAll(AvailableDbTables.blogs);
    let postsDeleted = await mongoDb.DeleteAll(AvailableDbTables.posts);
    let usersDeleted = await mongoDb.DeleteAll(AvailableDbTables.users);
    let commentDeleted = await mongoDb.DeleteAll(AvailableDbTables.comments);
    let logDeleted = await mongoDb.DeleteAll(AvailableDbTables.requestLogs);
    let deviceDeleted = await mongoDb.DeleteAll(AvailableDbTables.devices);
    likeRepo.DeleteAll();

    let results: ExecutionResult[] = [blogsDeleted.executionStatus, postsDeleted.executionStatus, usersDeleted.executionStatus, commentDeleted.executionStatus, logDeleted.executionStatus, deviceDeleted.executionStatus];
    if(results.includes(ExecutionResult.Failed)){
        response.sendStatus(404);
        return;
    }
    response.sendStatus(204);
})