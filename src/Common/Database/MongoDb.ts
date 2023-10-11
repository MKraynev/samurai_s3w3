import { Db, MongoClient, ObjectId, Sort, SortDirection, UpdateResult, WithId } from "mongodb";
import { AvailableDbTables, DataBase, ExecutionResultContainer, ExecutionResult } from "./DataBase";
import { SorterType } from "./Sort/Sorter";
import { BlogSorter } from "../../Entities/Blogs/Repo/BlogSorter";
import { PostSorter } from "../../Entities/Posts/Repo/PostSorter";
import { UserSorter } from "../../Entities/Users/Repo/UserSorter";
import { MONGO_URL } from "../../../settings";
import { CommentSorter } from "../../Entities/Comments/Repo/CommentSorter";
import { BlogDataBase } from "../../Entities/Blogs/Entities/BlogForDataBase";
import { PostDataBase } from "../../Entities/Posts/Entities/PostForDataBase";
import { UserDataBase } from "../../Entities/Users/Admin/Entities/UserForDataBase";
import { CommentDataBase } from "../../Entities/Comments/Entities/CommentForDataBase";
import { BlogResponse } from "../../Entities/Blogs/Entities/BlogForResponse";
import { PostResponse } from "../../Entities/Posts/Entities/PostForResponse";
import { CommentResponse } from "../../Entities/Comments/Entities/CommentForResponse";
import { UserResponse } from "../../Entities/Users/Admin/Entities/UserForResponse";
import { BlogRequest } from "../../Entities/Blogs/Entities/BlogForRequest";
import { PostRequest } from "../../Entities/Posts/Entities/PostForRequest";
import { UserRequest } from "../../Entities/Users/Admin/Entities/UserForRequest";
import { CommentRequest } from "../../Entities/Comments/Entities/CommentRequest";
import { LogSorter } from "../../RequestLogger/BuisnessLogic/RequestLoggerService";
import { RequestLogDataBase } from "../../RequestLogger/Entities/RequestLogDataBase";
import { RequestLogResponse } from "../../RequestLogger/Entities/RequestLogResponse";
import { DeviceDataBase } from "../../Entities/Devices/Entities/DeviceForDataBase";
import { DeviceRequest } from "../../Entities/Devices/Entities/DeviceForRequest";
import { DeviceSorter } from "../../Entities/Devices/BuisnessLogic/DeviceService";
import { DeviceResponse } from "../../Entities/Devices/Entities/DeviceForResponse";


type MongoSearch = {
    [key: string]: { $regex: string, $options: string }
}

export type AvailableReturnDbTypes = BlogResponse | PostResponse | UserResponse | CommentResponse | RequestLogResponse | DeviceDataBase;
export type AvailableUpdateTypes = BlogRequest | PostRequest | UserRequest | CommentRequest | DeviceRequest;
export type AvailableInputDbTypes = BlogDataBase | PostDataBase | UserDataBase | CommentDataBase | RequestLogDataBase | DeviceDataBase;
type AvailableSorterTypes = BlogSorter | PostSorter | UserSorter | CommentSorter | LogSorter | DeviceSorter;

export class MongoDb extends DataBase<AvailableInputDbTypes, AvailableUpdateTypes, AvailableReturnDbTypes> {


    private _dbIsRunning = false;
    private _client: MongoClient;
    private _db: Db;

    constructor(private url: string, private DbName: string) {
        super();

        //1 Init Db
        this._client = new MongoClient(url);
        this._db = this._client.db(DbName);
    }

    async GetOneById(tableName: AvailableDbTables, id: string): Promise<ExecutionResultContainer<ExecutionResult, AvailableReturnDbTypes | undefined>> {
        try {
            let internalId: ObjectId;
            internalId = new ObjectId(id);

            let executionResult = new ExecutionResultContainer<ExecutionResult, AvailableReturnDbTypes>(ExecutionResult.Pass);

            let databaseObject = await this._db.collection(tableName).findOne({ _id: internalId }) as WithId<AvailableInputDbTypes> | null;

            executionResult.executionResultObject = databaseObject ? this.ExtractDataObject(tableName, databaseObject) : null;

            return executionResult;
        }
        catch {
            return new ExecutionResultContainer(ExecutionResult.Failed)
        }

    }

    async GetOneByValueInOnePropery(tableName: AvailableDbTables, propName: keyof (AvailableReturnDbTypes) | string, propVal: string): Promise<ExecutionResultContainer<ExecutionResult, AvailableReturnDbTypes>> {
        try {
            let query: any = {}
            query[propName] = propVal;

            let dataBaseObject = await this._db.collection(tableName).findOne(query) as WithId<AvailableInputDbTypes> | null;

            let executionResult = new ExecutionResultContainer<ExecutionResult, AvailableReturnDbTypes>(ExecutionResult.Pass);
            executionResult.executionResultObject = dataBaseObject ? this.ExtractDataObject(tableName, dataBaseObject) : null;

            return executionResult;
        }
        catch {
            return new ExecutionResultContainer(ExecutionResult.Failed);
        }
    }

    async GetOneByValueInTwoProperties(tableName: AvailableDbTables, propName_1: keyof (AvailableReturnDbTypes) | string, propName_2: keyof (AvailableReturnDbTypes) | string, propVal: string): Promise<ExecutionResultContainer<ExecutionResult, AvailableReturnDbTypes>> {
        try {
            let query_1: any = {}
            query_1[propName_1] = propVal;
            let query_2: any = {}
            query_2[propName_2] = propVal;

            let dataBaseObject = await this._db.collection(tableName).findOne({ $or: [query_1, query_2] }) as WithId<AvailableInputDbTypes> | null;

            let executionResult = new ExecutionResultContainer<ExecutionResult, AvailableReturnDbTypes>(ExecutionResult.Pass);
            executionResult.executionResultObject = dataBaseObject ? this.ExtractDataObject(tableName, dataBaseObject) : null;

            return executionResult;
        }
        catch {
            return new ExecutionResultContainer(ExecutionResult.Failed);
        }

    }

    async GetMany(tableName: AvailableDbTables, sorter: AvailableSorterTypes, skip: number, maxTake: number): Promise<ExecutionResultContainer<ExecutionResult, Array<AvailableReturnDbTypes>>> {
        try {
            let searchPattert = this.BuildMongoSearcher(sorter);
            let mongoSorter = this.BuildMongoSorter(sorter);

            let foundDataBaseObjects = await this._db.collection(tableName)
                .find(searchPattert)
                .sort(mongoSorter)
                .skip(skip)
                .limit(maxTake)
                .toArray() as WithId<AvailableInputDbTypes>[] | null;

            let executionResult = new ExecutionResultContainer<ExecutionResult, Array<AvailableReturnDbTypes>>(ExecutionResult.Pass);
            executionResult.executionResultObject = foundDataBaseObjects ? foundDataBaseObjects.map(foundObj => this.ExtractDataObject(tableName, foundObj)) : null;

            return executionResult;
        }
        catch {
            return new ExecutionResultContainer(ExecutionResult.Failed);
        }

    }

    async SetOne(tableName: AvailableDbTables, setObject: AvailableInputDbTypes): Promise<ExecutionResultContainer<ExecutionResult, AvailableReturnDbTypes>> {
        try {
            let postResult = await this._db.collection(tableName).insertOne(setObject);

            let executionResult = new ExecutionResultContainer<ExecutionResult, AvailableReturnDbTypes>(ExecutionResult.Failed);

            if (postResult.acknowledged) {
                executionResult.executionStatus = ExecutionResult.Pass;

                let dataBaseObject: WithId<AvailableInputDbTypes> = {
                    _id: postResult.insertedId,
                    ...setObject
                };

                executionResult.executionResultObject = this.ExtractDataObject(tableName, dataBaseObject);
            }

            return executionResult;
        }
        catch {
            return new ExecutionResultContainer(ExecutionResult.Failed);
        }
    }

    async UpdateOne(tableName: AvailableDbTables, id: string, updateObject: AvailableUpdateTypes): Promise<ExecutionResultContainer<ExecutionResult, AvailableReturnDbTypes | undefined>> {
        try {
            let updateResult = await this._db.collection(tableName).updateOne({ _id: new ObjectId(id) }, { $set: updateObject })

            if (updateResult.matchedCount === 1)
                return await this.GetOneById(tableName, id);

            return new ExecutionResultContainer(ExecutionResult.Pass, undefined, "not found");
        }
        catch {
            return new ExecutionResultContainer(ExecutionResult.Failed);
        }
    }

    async UpdateOneProperty(tableName: AvailableDbTables, id: string, property: string, value: any): Promise<ExecutionResultContainer<ExecutionResult, AvailableReturnDbTypes | undefined>> {
        try {
            let updateField: any = {};
            updateField[property] = value;

            let updateResult = await this._db.collection(tableName).updateOne({ _id: new ObjectId(id) }, { $set: updateField })

            if (updateResult.matchedCount == 1)
                return await this.GetOneById(tableName, id);

            return new ExecutionResultContainer(ExecutionResult.Failed);
        }
        catch {
            return new ExecutionResultContainer(ExecutionResult.Failed);
        }
    }

    async AppendOneProperty(tableName: AvailableDbTables, id: string, property: keyof (AvailableReturnDbTypes) | string, value: any): Promise<ExecutionResultContainer<ExecutionResult, AvailableReturnDbTypes | undefined>> {
        try {
            let updateField: any = {};
            updateField[property] = value;

            let appendRes = await this._db.collection(tableName).updateOne({ _id: new ObjectId(id) }, { $push: updateField })

            if (appendRes.matchedCount == 1)
                return await this.GetOneById(tableName, id);

            return new ExecutionResultContainer(ExecutionResult.Failed);

        }
        catch {
            return new ExecutionResultContainer(ExecutionResult.Failed);
        }
    }

    async IncrementProperty(tableName: AvailableDbTables, id: string, property: keyof (AvailableReturnDbTypes) | string, incrementValue: number): Promise<ExecutionResultContainer<ExecutionResult, AvailableReturnDbTypes | undefined>> {
        try {
            let incObj: any = {};
            incObj[property] = incrementValue;

            let updateResult = await this._db.collection(tableName).updateOne({ _id: new ObjectId(id) }, { $inc: incObj })

            if (updateResult.matchedCount == 1)
                return await this.GetOneById(tableName, id);

            return new ExecutionResultContainer(ExecutionResult.Failed);
        }
        catch {
            return new ExecutionResultContainer(ExecutionResult.Failed);
        }
    }

    async DeleteOne(tableName: AvailableDbTables, id: string): Promise<ExecutionResultContainer<ExecutionResult, boolean>> {
        let dbId: ObjectId;
        try {
            dbId = new ObjectId(id);
        }
        catch {
            return new ExecutionResultContainer(ExecutionResult.Pass, false);
        }

        try {
            let deleteResult = await this._db.collection(tableName).deleteOne({ _id: dbId })

            if (deleteResult.deletedCount === 1)
                return new ExecutionResultContainer(ExecutionResult.Pass, true);


            return new ExecutionResultContainer(ExecutionResult.Pass, false);

        }
        catch {
            return new ExecutionResultContainer<ExecutionResult, boolean>(ExecutionResult.Failed);
        }
    }

    async DeleteAll(tableName: AvailableDbTables): Promise<ExecutionResultContainer<ExecutionResult, boolean>> {
        try {
            let delRes = await this._db.collection(tableName).deleteMany({});

            let operationResult = new ExecutionResultContainer<ExecutionResult, boolean>(ExecutionResult.Failed);

            if (delRes.acknowledged) {
                operationResult.executionStatus = ExecutionResult.Pass;
                operationResult.executionResultObject = true;
            }

            return operationResult;
        }
        catch {
            return new ExecutionResultContainer<ExecutionResult, boolean>(ExecutionResult.Failed);
        }
    }

    async DeleteMany(tableName: AvailableDbTables, sorter: AvailableSorterTypes): Promise<ExecutionResultContainer<ExecutionResult, boolean | undefined>> {
        try {
            let searchPattert = this.BuildMongoSearcher(sorter);
            let delRes = await this._db.collection(tableName).deleteMany(searchPattert);


            let operationResult = new ExecutionResultContainer<ExecutionResult, boolean>(ExecutionResult.Failed);

            if (delRes.acknowledged) {
                operationResult.executionStatus = ExecutionResult.Pass;
                operationResult.executionResultObject = true;
            }

            return operationResult;
        }
        catch {
            return new ExecutionResultContainer(ExecutionResult.Failed);
        }
    }

    async Count(tableName: AvailableDbTables, sorter: AvailableSorterTypes): Promise<ExecutionResultContainer<ExecutionResult, number>> {
        try {
            let searchPattert = this.BuildMongoSearcher(sorter);
            let collectionSize = await this._db.collection(tableName).countDocuments(searchPattert);

            return new ExecutionResultContainer<ExecutionResult, number>(ExecutionResult.Pass, collectionSize);
        }
        catch {
            return new ExecutionResultContainer<ExecutionResult, number>(ExecutionResult.Failed);
        }
    }

    async RunDb(): Promise<ExecutionResultContainer<ExecutionResult, boolean>> {
        let result: ExecutionResultContainer<ExecutionResult, boolean> = new ExecutionResultContainer(ExecutionResult.Pass, true, "Db connected");

        if (this._dbIsRunning)
            return result;

        try {
            await this._client.connect();
            this._dbIsRunning = true;
        }
        catch {
            await this._client.close();
            this._dbIsRunning = false;
            result.executionStatus = ExecutionResult.Failed;
            result.message = "Connection failed";
        }

        return result;
    }

    private BuildMongoSorter(sorter: AvailableSorterTypes): Sort {
        let sortDir: SortDirection = sorter.sortDirection;
        let mongoSorter: Sort = {};

        switch (sorter.sorterType) {
            case SorterType.BlogSorter:
                sorter = sorter as BlogSorter;
                mongoSorter[sorter.sortBy] = sortDir;
                break;

            case SorterType.PostSorter:
                sorter = sorter as PostSorter;
                mongoSorter[sorter.sortBy] = sortDir;

                break;
            case SorterType.UserSorter:
                sorter = sorter as UserSorter;
                mongoSorter[sorter.sortBy] = sortDir;
                break;

            case SorterType.CommentSorter:
                sorter = sorter as CommentSorter;
                mongoSorter[sorter.sortBy] = sortDir;
                break;
            case SorterType.LogSorter:
                sorter = sorter as LogSorter;
                mongoSorter[sorter.sortBy] = sortDir;
        }

        return mongoSorter;
    }

    private BuildMongoSearcher(sorter: AvailableSorterTypes): MongoSearch {
        switch (sorter.sorterType) {
            case SorterType.BlogSorter:
                sorter = sorter as BlogSorter;
                if (sorter.searchNameTerm) {
                    let searcher: MongoSearch = {
                        "name": { $regex: sorter.searchNameTerm, $options: 'i' }
                    }

                    return searcher;
                }
                return {};
                break;

            case SorterType.PostSorter:
                sorter = sorter as PostSorter;
                if (sorter.searchBlogId) {
                    let searcher: MongoSearch = {
                        "blogId": { $regex: sorter.searchBlogId, $options: 'i' }
                    }
                    return searcher;
                }
                return {}
                break;

            case SorterType.UserSorter:
                sorter = sorter as UserSorter;
                if (sorter.searchEmailTerm && sorter.searchLoginTerm) {
                    let searcher: any = {
                        "$or": [
                            { "email": { $regex: sorter.searchEmailTerm, $options: 'i' } },
                            { "login": { $regex: sorter.searchLoginTerm, $options: 'i' } }
                        ]
                    }
                    return searcher;
                }
                else if (sorter.searchEmailTerm) {
                    let searcher: MongoSearch = {
                        "email": { $regex: sorter.searchEmailTerm, $options: 'i' }
                    }
                    return searcher;
                }
                else if (sorter.searchLoginTerm) {
                    let searcher: MongoSearch = {
                        "login": { $regex: sorter.searchLoginTerm, $options: 'i' }
                    }
                    return searcher;
                }
                return {}

            case SorterType.CommentSorter:
                sorter = sorter as CommentSorter;
                if (sorter.postId) {
                    let searcher: MongoSearch = {
                        "postId": { $regex: sorter.postId, $options: 'i' }
                    }
                    return searcher;
                }
                return {}

            case SorterType.LogSorter:
                sorter = sorter as LogSorter;

                let searcher: any = {
                    "ip": sorter.ip,
                    "root": sorter.serviceRoot,
                    "info": sorter.deviceInfo
                }

                return searcher;
                break;

            case SorterType.DeviceSorter:
                sorter = sorter as DeviceSorter;
                let searcherObj: any;
                if (sorter.exceptCurrentId) {

                    searcherObj = {
                        "_id": { $ne: new ObjectId(sorter.exceptCurrentId) }
                    }
                }
                else {
                    searcherObj = {
                        "userId": { $regex: sorter.userId }
                    }
                }

                return searcherObj;
                break;
        }
    }

    private ExtractDataObject(tableName: AvailableDbTables, object: WithId<AvailableInputDbTypes>): AvailableReturnDbTypes {
        switch (tableName) {
            case AvailableDbTables.blogs:
                object = object as WithId<BlogDataBase>;
                return new BlogResponse(object._id, object);

            case AvailableDbTables.posts:
                object = object as WithId<PostDataBase>;
                let post = new PostResponse(object._id, object);
                post.blogName = object.blogName;
                return post;

            case AvailableDbTables.comments:
                object = object as WithId<CommentDataBase>
                return new CommentResponse(object._id, object);

            case AvailableDbTables.users:
                object = object as WithId<UserDataBase>
                return new UserResponse(object._id, object);

            case AvailableDbTables.requestLogs:
                object = object as WithId<RequestLogDataBase>;
                return new RequestLogResponse(object._id, object);

            case AvailableDbTables.devices:
                object = object as WithId<DeviceDataBase>;
                return new DeviceResponse(object._id, object);
        }
    }
}

const dbUrl = MONGO_URL;
export const mongoDb = new MongoDb(dbUrl, "s2w2");
