import { ObjectId } from "mongodb";
import { RequestLogDataBase } from "./RequestLogDataBase"
import { RequestLogRequest } from "./RequestLogRequest"

export class RequestLogResponse extends RequestLogDataBase{
    public id: string;
    constructor(objectId: ObjectId, dbData: RequestLogDataBase) {
        super(dbData, dbData.requestTime)
        this.id = objectId.toString();
    }
}