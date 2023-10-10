import { TokenHandler, TokenStatus, tokenHandler } from "../../../Common/Authentication/User/TokenAuthentication";
import { AvailableDbTables, ExecutionResult, ExecutionResultContainer } from "../../../Common/Database/DataBase";
import { MongoDb, mongoDb } from "../../../Common/Database/MongoDb";
import { Sorter, SorterType } from "../../../Common/Database/Sort/Sorter";
import { ServiseExecutionStatus } from "../../Blogs/BuisnessLogic/BlogService";
import { ServicesWithUsersExecutionResult } from "../../Comments/BuisnessLogic/CommentService";
import { UserServiceExecutionResult, userService } from "../../Users/Common/BuisnessLogic/UserService";
import { Token } from "../../Users/Common/Entities/Token";
import { DeviceDataBase } from "../Entities/DeviceForDataBase";
import { DeviceResponse, DeviceResponseLight } from "../Entities/DeviceForResponse";

export class DeviceSorter extends Sorter<DeviceResponse>{
    constructor(
        public sorterType: SorterType,
        public userId: string,
        public exceptCurrentId: string | undefined,
        public sortBy: keyof DeviceResponse & string = "lastActiveDate",
        public sortDirection: "desc" | "asc" = "desc"
    ) {
        super(sortBy, sortDirection, sorterType)
    }
}

class DeviceService {
    private deviceTable = AvailableDbTables.devices;

    constructor(private db: MongoDb, private tokenHandler: TokenHandler) { }

    public async GetUserDevices(token: Token): Promise<ExecutionResultContainer<ServicesWithUsersExecutionResult, DeviceResponseLight[]>> {
        let getTokenLoad = await this.tokenHandler.GetTokenLoad(token);

        if (getTokenLoad.tokenStatus !== TokenStatus.Accepted || !getTokenLoad.result) {
            return new ExecutionResultContainer(ServicesWithUsersExecutionResult.Unauthorized);
        }

        let tokenData = getTokenLoad.result;
        let getDevices = await this.GetUserDevicesByUserId(tokenData.id);

        if (getDevices.executionStatus !== ServicesWithUsersExecutionResult.Success || !getDevices.executionResultObject) {
            return new ExecutionResultContainer(ServicesWithUsersExecutionResult.DataBaseFailed);
        }

        let lightDevices = getDevices.executionResultObject.map(device => new DeviceResponseLight(device))

        return new ExecutionResultContainer(ServicesWithUsersExecutionResult.Success, lightDevices);
    }

    public async GetUserDevicesByUserId(userId: string): Promise<ExecutionResultContainer<ServicesWithUsersExecutionResult, DeviceResponse[]>> {
        let deviceSorter = new DeviceSorter(SorterType.DeviceSorter, userId, undefined);
        let searchDevices = await this.db.GetMany(this.deviceTable, deviceSorter, 0, 20) as ExecutionResultContainer<ExecutionResult, DeviceResponse[]>;

        if (searchDevices.executionStatus !== ExecutionResult.Pass) {
            return new ExecutionResultContainer(ServicesWithUsersExecutionResult.DataBaseFailed);
        }

        let devices = searchDevices.executionResultObject || [];



        return new ExecutionResultContainer(ServicesWithUsersExecutionResult.Success, devices);
    }

    public async DeleteDevice(token: Token, deviceId: string): Promise<ExecutionResultContainer<ServicesWithUsersExecutionResult, DeviceDataBase>> {
        let parceUserId = await this.tokenHandler.DecodePropertyFromToken(token, "id");

        if (parceUserId.tokenStatus !== TokenStatus.Accepted || !parceUserId.result) {
            return new ExecutionResultContainer(ServicesWithUsersExecutionResult.NotFound);
        }

        let userId = parceUserId.result;

        return this.DeleteDeviceByDeviceId(deviceId, userId);
    }

    public async DeleteDeviceByDeviceId(deviceId: string, userOwnerId: string): Promise<ExecutionResultContainer<ServicesWithUsersExecutionResult, DeviceDataBase>> {
        let getDevice = await this.db.GetOneById(this.deviceTable, deviceId) as ExecutionResultContainer<ExecutionResult, DeviceResponse>;

        if (getDevice.executionStatus !== ExecutionResult.Pass || !getDevice.executionResultObject) {
            return new ExecutionResultContainer(ServicesWithUsersExecutionResult.NotFound);
        }

        let device = getDevice.executionResultObject;

        if (device.userId !== userOwnerId) {
            return new ExecutionResultContainer(ServicesWithUsersExecutionResult.WrongUser);
        }

        let deleteDevice = await this.db.DeleteOne(this.deviceTable, deviceId);
        if (deleteDevice.executionStatus !== ExecutionResult.Pass || !deleteDevice.executionResultObject) {
            return new ExecutionResultContainer(ServicesWithUsersExecutionResult.DataBaseFailed);
        }

        return new ExecutionResultContainer(ServicesWithUsersExecutionResult.Success, device);
    }

    public async DeleteManyDevices(token: Token): Promise<ExecutionResultContainer<ServicesWithUsersExecutionResult, boolean>> {
        let getTokenLoad = await this.tokenHandler.GetTokenLoad(token);

        if (getTokenLoad.tokenStatus !== TokenStatus.Accepted || !getTokenLoad.result) {
            return new ExecutionResultContainer(ServicesWithUsersExecutionResult.Unauthorized);
        }

        let tokenData = getTokenLoad.result;

        let deviceSorter = new DeviceSorter(SorterType.DeviceSorter, tokenData.id, undefined);

        let getAvailableDevices = await this.db.GetMany(this.deviceTable, deviceSorter, 0, 20) as ExecutionResultContainer<ExecutionResult, DeviceResponse[]>;


        if (getAvailableDevices.executionStatus !== ExecutionResult.Pass || !getAvailableDevices.executionResultObject) {
            return new ExecutionResultContainer(ServicesWithUsersExecutionResult.DataBaseFailed);
        }

        
        let devices = getAvailableDevices.executionResultObject;

        let device = devices.find(deviceElement => deviceElement.id === tokenData.deviceId);

        if (!device) {
            return new ExecutionResultContainer(ServicesWithUsersExecutionResult.NotFound);
        }

        deviceSorter.exceptCurrentId = device.id;

        let deleteAllUserDevices = await this.db.DeleteMany(this.deviceTable, deviceSorter);

        if (deleteAllUserDevices.executionStatus !== ExecutionResult.Pass) {
            return new ExecutionResultContainer(ServicesWithUsersExecutionResult.DataBaseFailed);
        }

        return new ExecutionResultContainer(ServicesWithUsersExecutionResult.Success, true);
    }


}

export const deviceService = new DeviceService(mongoDb, tokenHandler);