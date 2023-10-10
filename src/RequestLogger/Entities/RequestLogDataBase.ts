import { RequestLogRequest } from "./RequestLogRequest";

export class RequestLogDataBase extends RequestLogRequest {
    constructor(
        requestLog: RequestLogRequest,
        public requestTime: string = (new Date()).toISOString()
    ) {
        super(requestLog.ip, requestLog.root, requestLog.info)
    }
}