import { ObjectId } from "mongodb";
import { DeviceDataBase } from "./DeviceForDataBase";

export class DeviceResponse extends DeviceDataBase{
    public id: string;
    constructor(id: ObjectId, dbData: DeviceDataBase) {
        super(dbData, dbData.userId, dbData.lastActiveDate, dbData.expireTime)
        this.id = id.toString();
    }
}

export class DeviceResponseLight{
    public ip: string;
    public title: string;
    public lastActiveDate: string;
    public deviceId: string;

    constructor(dataObj: DeviceResponse) {
        this.ip = dataObj.ip;
        this.title = dataObj.title;
        this.lastActiveDate = dataObj.lastActiveDate;
        this.deviceId = dataObj.id;
    }
}

// "ip": "string",
//     "title": "string",
//     "lastActiveDate": "string",
//     "deviceId": "string"