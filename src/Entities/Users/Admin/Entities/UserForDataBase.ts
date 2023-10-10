import { DeviceDataBase } from "../../../Devices/Entities/DeviceForDataBase";
import { UserRequest } from "./UserForRequest";

export class UserDataBase {
    constructor(
        public login: string,
        public email: string,
        public salt: string,
        public hashedPass: string,
        public emailConfirmId: string,
        public emailConfirmed: boolean = false,
        public createdAt: string = (new Date()).toISOString(),
        public usedRefreshTokens: Array<string> = [],
        public refreshPasswordTime: string | null = null
    ) {
    }
}
