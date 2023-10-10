import { Sorter } from "./Sort/Sorter";

export enum ExecutionResult {
    Failed,
    Pass
}

export class ExecutionResultContainer<ExecutionStatusType, ExecutionResultObjectType> {
    constructor(
        public executionStatus: ExecutionStatusType,
        public executionResultObject: ExecutionResultObjectType | null = null,
        public message: string | null = null) { }

}


export enum AvailableDbTables {
    blogs = "blogs",
    posts = "posts",
    users = "users",
    comments = "comments",
    requestLogs = "requestsLog",
    devices = "devices"
}

export abstract class DataBase<SaveObject, UpdateObject, ReturnObject> {
    abstract GetOneById(tableName: AvailableDbTables, id: string): Promise<ExecutionResultContainer<ExecutionResult, ReturnObject | undefined>>;
    abstract GetOneByValueInOnePropery(tableName: AvailableDbTables, propertyName: keyof (SaveObject), propVal: string): Promise<ExecutionResultContainer<ExecutionResult, ReturnObject | undefined>>;
    abstract GetOneByValueInTwoProperties(tableName: AvailableDbTables, propertyName_1: keyof (SaveObject), propertyName_2: keyof (SaveObject), propVal: string): Promise<ExecutionResultContainer<ExecutionResult, ReturnObject | undefined>>;
    abstract GetMany(tableName: AvailableDbTables, sorter: Sorter<any>, skip: number, maxTake: number): Promise<ExecutionResultContainer<ExecutionResult, Array<ReturnObject | undefined>>>;

    abstract SetOne(tableName: AvailableDbTables, setObject: SaveObject): Promise<ExecutionResultContainer<ExecutionResult, ReturnObject | undefined>>;

    abstract UpdateOne(tableName: AvailableDbTables, id: string, updateObject: UpdateObject): Promise<ExecutionResultContainer<ExecutionResult, ReturnObject | undefined>>;
    abstract UpdateOneProperty(tableName: AvailableDbTables, id: string, propertyName: keyof (SaveObject), value: string | boolean | number): Promise<ExecutionResultContainer<ExecutionResult, ReturnObject | undefined>>;
    abstract AppendOneProperty(tableName: AvailableDbTables, id: string, propertyName: keyof (SaveObject), value: string | boolean | number): Promise<ExecutionResultContainer<ExecutionResult, ReturnObject | undefined>>;

    abstract DeleteOne(tableName: AvailableDbTables, id: string): Promise<ExecutionResultContainer<ExecutionResult, boolean | undefined>>;
    abstract DeleteAll(tableName: AvailableDbTables): Promise<ExecutionResultContainer<ExecutionResult, boolean | undefined>>;
    abstract DeleteMany(tableName: AvailableDbTables, sorter: Sorter<any>): Promise<ExecutionResultContainer<ExecutionResult, boolean | undefined>>;

    abstract Count(tableName: AvailableDbTables, sorter: Sorter<any>): Promise<ExecutionResultContainer<ExecutionResult, number | undefined>>;
    abstract RunDb(): Promise<ExecutionResultContainer<ExecutionResult, boolean | undefined>>;
}