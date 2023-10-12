import { AvailableDbTables, ExecutionResult, ExecutionResultContainer } from "../../Common/Database/DataBase";
import { MongoDb, mongoDb } from "../../Common/Database/MongoDb";
import { Sorter, SorterType } from "../../Common/Database/Sort/Sorter";
import { ServiseExecutionStatus } from "../../Entities/Blogs/BuisnessLogic/BlogService";
import { RequestLogResponse } from "../Entities/RequestLogResponse";
import { REQUEST_LIMIT_COUNT, REQUEST_LIMIT_SECONDS } from "../../../settings";
import { RequestLogRequest } from "../Entities/RequestLogRequest";
import { RequestLogDataBase } from "../Entities/RequestLogDataBase";

export class LogSorter extends Sorter<RequestLogResponse>{
    constructor(
        public sorterType: SorterType,
        public ip: string,
        public serviceRoot: string,
        public deviceInfo: string,
        public sortBy: keyof RequestLogResponse & string = "requestTime",
        public sortDirection: "desc" | "asc" = "desc"
    ) {
        super(sortBy, sortDirection, sorterType)
    }
}

class RequestLoggerService {
    private logTable = AvailableDbTables.requestLogs;

    constructor(private _db: MongoDb) { }


    private async GetLogs(data: RequestLogRequest, logsCount: number): Promise<ExecutionResultContainer<ServiseExecutionStatus, RequestLogResponse[] | null>> {
        let sorter = new LogSorter(SorterType.LogSorter, data.ip, data.root, data.info);

        let logs = await this._db.GetMany(this.logTable, sorter, 0, logsCount) as ExecutionResultContainer<ExecutionResult, RequestLogResponse[]>;

        if (logs.executionStatus !== ExecutionResult.Pass || !logs.executionResultObject) {
            return new ExecutionResultContainer(ServiseExecutionStatus.DataBaseFailed)
        }

        return new ExecutionResultContainer(ServiseExecutionStatus.Success, logs.executionResultObject);
    }

    public async RequestIsAllowed(data: RequestLogRequest): Promise<boolean> {
        return true;
        // try {
        //     let getLastLogs = await this.GetLogs(data, REQUEST_LIMIT_COUNT);
        //     if (getLastLogs.executionStatus !== ServiseExecutionStatus.Success || !getLastLogs.executionResultObject) {
        //         return true;
        //     }

        //     let logs = getLastLogs.executionResultObject;
        //     let logsCount = logs.length;
            
        //     let recentRequestTime = logs[0].requestTime;
        //     let lastRequestTime: string | undefined = logs?.pop()?.requestTime;

        //     if (!lastRequestTime) {
        //         return true;
        //     }

        //     let actualRequestTime = new Date(recentRequestTime);
        //     let earlyestRequestTime = new Date(lastRequestTime);

        //     let diff_ms = actualRequestTime.getTime() - earlyestRequestTime.getTime();
        //     let result = (logsCount < REQUEST_LIMIT_COUNT) || ((diff_ms / 1000) > REQUEST_LIMIT_SECONDS)

        //     return result;
        // }
        // catch {
        //     return true;
        // }
    }
    public async SaveRequest(requestData: RequestLogRequest): Promise<boolean> {
        let data = new RequestLogDataBase(requestData);

        let saveData = await this._db.SetOne(this.logTable, data);

        return saveData.executionStatus === ExecutionResult.Pass;
    }
}

export const requestLogService = new RequestLoggerService(mongoDb);