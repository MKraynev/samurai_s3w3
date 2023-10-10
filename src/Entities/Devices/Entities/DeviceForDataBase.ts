import { DeviceRequest } from "./DeviceForRequest";

export class DeviceDataBase extends DeviceRequest {
    constructor(
        deviceData: DeviceRequest,
        public userId: string,
        public lastActiveDate: string,
        public expireTime: string) {
        super(deviceData.ip, deviceData.title);

    }
}