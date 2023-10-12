import { UserRequest } from "../../Admin/Entities/UserForRequest";
import { UserSorter } from "../../Repo/UserSorter";
import { Paginator } from "../../../../Common/Paginator/PageHandler";
import { Page } from "../../../../Common/Paginator/Page";
import { ACCESS_TOKEN_TIME, JWT_SECRET, REFRESH_PASSWORD_TOKEN_TIME, REFRESH_TOKEN_TIME } from "../../../../../settings";
import { Token } from "../Entities/Token";
import { UserResponse } from "../../Admin/Entities/UserForResponse";
import bcrypt from "bcrypt";
import { UniqueValGenerator } from "../../../../Common/DataManager/HandleFunctions/UniqueValGenerator";
import { UserDataBase } from "../../Admin/Entities/UserForDataBase";
import { MongoDb, mongoDb } from "../../../../Common/Database/MongoDb";
import { AvailableDbTables, ExecutionResult, ExecutionResultContainer } from "../../../../Common/Database/DataBase";
import { RefreshUserPasswordToken, TokenHandler, TokenLoad, TokenStatus, tokenHandler } from "../../../../Common/Authentication/User/TokenAuthentication";
import { ServiseExecutionStatus } from "../../../Blogs/BuisnessLogic/BlogService";
import { AdminAuthentication, AuthenticationResult, IAuthenticator } from "../../../../Common/Authentication/Admin/AdminAuthenticator";
import { Request } from "express"
import { AuthRequest } from "../Entities/AuthRequest";
import { DeviceRequest } from "../../../Devices/Entities/DeviceForRequest";
import { DeviceDataBase } from "../../../Devices/Entities/DeviceForDataBase";
import ms from "ms"
import { deviceService } from "../../../Devices/BuisnessLogic/DeviceService";
import { DeviceResponse } from "../../../Devices/Entities/DeviceForResponse";

export enum LoginEmailStatus {
    LoginAndEmailFree,
    LoginExist,
    EmailEXist

}

export enum UserServiceExecutionResult {
    DataBaseFailed,
    Unauthorized,
    NotFound,
    WrongPassword,
    ServiceFail,
    UserAlreadyExist,
    Success
}

export type UserServiceDto = ExecutionResultContainer<ExecutionResult, UserResponse>;
export type UserServiceDtos = ExecutionResultContainer<ExecutionResult, UserResponse[]>;

type LoginTokens = {
    accessToken: Token,
    refreshToken: Token
}

export class AdminUserService {
    private userTable = AvailableDbTables.users;
    private deviceTable = AvailableDbTables.devices;

    private usedTokenName = "usedRefreshTokens";

    constructor(private _db: MongoDb, private _authenticator: IAuthenticator, private tokenHandler: TokenHandler) { }

    public async GetUserById(id: string): Promise<ExecutionResultContainer<UserServiceExecutionResult, UserResponse>> {
        let userSearch = await this._db.GetOneById(this.userTable, id) as UserServiceDto;
        if (userSearch.executionStatus === ExecutionResult.Failed || !userSearch.executionResultObject) {
            return new ExecutionResultContainer(UserServiceExecutionResult.DataBaseFailed);
        }

        return new ExecutionResultContainer(UserServiceExecutionResult.Success, userSearch.executionResultObject);
    }

    public async GetUsers(searchConfig: UserSorter, paginator: Paginator, request: Request): Promise<ExecutionResultContainer<ServiseExecutionStatus, Page<UserResponse[]> | null>> {
        let accessVerdict = this._authenticator.AccessCheck(request);

        if (accessVerdict !== AuthenticationResult.Accept)
            return new ExecutionResultContainer(ServiseExecutionStatus.Unauthorized);

        let countOperation = await this._db.Count(this.userTable, searchConfig);

        if (countOperation.executionStatus === ExecutionResult.Failed || countOperation.executionResultObject === null)
            return new ExecutionResultContainer(ServiseExecutionStatus.DataBaseFailed);

        let neededSkipObjectsNumber = paginator.GetAvailableSkip(countOperation.executionResultObject);
        let foundObjectsOperation = await this._db.GetMany(this.userTable, searchConfig, neededSkipObjectsNumber, paginator.pageSize) as UserServiceDtos;

        if (foundObjectsOperation.executionStatus === ExecutionResult.Failed || !foundObjectsOperation.executionResultObject)
            return new ExecutionResultContainer(ServiseExecutionStatus.DataBaseFailed);

        let pagedObjects = paginator.GetPaged(foundObjectsOperation.executionResultObject);
        let operationResult = new ExecutionResultContainer(ServiseExecutionStatus.Success, pagedObjects)

        return operationResult;
    }
    public async SaveUser(user: UserRequest, request: Request): Promise<ExecutionResultContainer<UserServiceExecutionResult, UserResponse | null>> {
        let accessVerdict = this._authenticator.AccessCheck(request);

        if (accessVerdict !== AuthenticationResult.Accept)
            return new ExecutionResultContainer(UserServiceExecutionResult.Unauthorized);

        user.emailConfirmed = true;
        return await this.PostUser(user);
    }
    public async RegisterUser(user: UserRequest): Promise<ExecutionResultContainer<UserServiceExecutionResult, UserResponse | null>> {
        user.emailConfirmed = false;
        return await this.PostUser(user);
    }
    private async PostUser(user: UserRequest): Promise<ExecutionResultContainer<UserServiceExecutionResult, UserResponse | null>> {
        let findUserByLogin = await this._db.GetOneByValueInOnePropery(this.userTable, "login", user.login);
        let findUserByEmail = await this._db.GetOneByValueInOnePropery(this.userTable, "email", user.email);

        if (findUserByEmail.executionResultObject || findUserByLogin.executionResultObject) {

            throw new ExecutionResultContainer(UserServiceExecutionResult.UserAlreadyExist);
        }

        let salt = await bcrypt.genSalt(10);
        let hashedPass = await bcrypt.hash(user.password, salt);
        let emailConfirmId = UniqueValGenerator();

        let userObj = new UserDataBase(user.login, user.email, salt, hashedPass, emailConfirmId, user.emailConfirmed);
        let save = await this._db.SetOne(this.userTable, userObj) as UserServiceDto;

        if (save.executionStatus === ExecutionResult.Failed) {
            return new ExecutionResultContainer(UserServiceExecutionResult.DataBaseFailed);
        }
        return new ExecutionResultContainer(UserServiceExecutionResult.Success, save.executionResultObject);
    }
    public async DeleteUser(id: string, request: Request<{}, {}, {}, {}>): Promise<ExecutionResultContainer<ServiseExecutionStatus, boolean | null>> {
        let accessVerdict = this._authenticator.AccessCheck(request);

        if (accessVerdict !== AuthenticationResult.Accept)
            return new ExecutionResultContainer(ServiseExecutionStatus.Unauthorized);

        let deleteOperation = await this._db.DeleteOne(this.userTable, id);

        if (deleteOperation.executionStatus === ExecutionResult.Failed)
            return new ExecutionResultContainer(ServiseExecutionStatus.DataBaseFailed);

        if (!deleteOperation.executionResultObject) {
            return new ExecutionResultContainer(ServiseExecutionStatus.NotFound);
        }

        return new ExecutionResultContainer(ServiseExecutionStatus.Success, true);
    }
    public async Login(authRequest: AuthRequest, deviceData: DeviceRequest): Promise<ExecutionResultContainer<UserServiceExecutionResult, LoginTokens>> {
        let findUser = await this._db.GetOneByValueInTwoProperties(this.userTable, "email", "login", authRequest.loginOrEmail) as UserServiceDto;

        if (findUser.executionStatus === ExecutionResult.Failed || !findUser.executionResultObject) {
            return new ExecutionResultContainer(UserServiceExecutionResult.DataBaseFailed);
        }

        let user = findUser.executionResultObject;

        let requestHashedPass = await bcrypt.hash(authRequest.password, findUser.executionResultObject.salt);
        if (requestHashedPass !== findUser.executionResultObject.hashedPass) {
            return new ExecutionResultContainer(UserServiceExecutionResult.WrongPassword);
        }

        let getUserDevices = await deviceService.GetUserDevicesByUserId(user.id);

        let availableUserDevices = getUserDevices.executionResultObject || [];

        let devicePositionIfSuchDeviceAlreadyExist = availableUserDevices.findIndex(device => device.ip === deviceData.ip && device.title === deviceData.title);

        let activationTime = new Date();

        let refreshTokenExpireTime_ms = activationTime.getTime() + ms(REFRESH_TOKEN_TIME);
        let refreshTokenexpireTime = new Date(refreshTokenExpireTime_ms);

        let accessTokenExpireTime_ms = activationTime.getTime() + ms(ACCESS_TOKEN_TIME);
        //let accessTokenexpireTime = new Date(accessTokenExpireTime_ms);


        let deviceDataToSave = new DeviceDataBase(deviceData, user.id, activationTime.toISOString(), refreshTokenexpireTime.toISOString())

        let deviceDbOperation: ExecutionResultContainer<ExecutionResult, DeviceResponse>;

        if (devicePositionIfSuchDeviceAlreadyExist > -1) {
            let deviceId = availableUserDevices[devicePositionIfSuchDeviceAlreadyExist].id;
            deviceDbOperation = await this._db.UpdateOne(this.deviceTable, deviceId, deviceDataToSave) as ExecutionResultContainer<ExecutionResult, DeviceResponse>;
        }
        else {
            deviceDbOperation = await this._db.SetOne(this.deviceTable, deviceDataToSave) as ExecutionResultContainer<ExecutionResult, DeviceResponse>;
        }


        if (deviceDbOperation.executionStatus !== ExecutionResult.Pass || !deviceDbOperation.executionResultObject) {
            return new ExecutionResultContainer(UserServiceExecutionResult.DataBaseFailed);
        }

        let device = deviceDbOperation.executionResultObject;


        let tokenLoad: TokenLoad = {
            id: findUser.executionResultObject.id,
            deviceId: device.id,
        };

        let accessToken = await this.tokenHandler.GenerateToken(tokenLoad, ACCESS_TOKEN_TIME);
        let refreshToken = await this.tokenHandler.GenerateToken(tokenLoad, REFRESH_TOKEN_TIME);

        if (!accessToken || !refreshToken) {
            return new ExecutionResultContainer(UserServiceExecutionResult.ServiceFail);
        }

        let tokens: LoginTokens = {
            accessToken: accessToken,
            refreshToken: refreshToken
        }

        return new ExecutionResultContainer(UserServiceExecutionResult.Success, tokens);
    }
    public async GetUserByToken(token: Token): Promise<ExecutionResultContainer<UserServiceExecutionResult, UserResponse>> {
        let getTokenLoad = await this.tokenHandler.GetTokenLoad(token);

        if (getTokenLoad.tokenStatus !== TokenStatus.Accepted || !getTokenLoad.result) {
            return new ExecutionResultContainer(UserServiceExecutionResult.NotFound);
        }
        let id = getTokenLoad.result.id;

        return this.GetUserById(id);
    }
    public async RefreshUserAccess(refreshToken: Token, deviceData: DeviceRequest, skipDeviceSaving: boolean = false): Promise<ExecutionResultContainer<UserServiceExecutionResult, LoginTokens | null>> {

        let findUser = await userService.GetUserByToken(refreshToken) as ExecutionResultContainer<UserServiceExecutionResult, UserResponse>;
        let user = findUser.executionResultObject;

        if (findUser.executionStatus !== UserServiceExecutionResult.Success || !user) {
            return new ExecutionResultContainer(UserServiceExecutionResult.NotFound);
        }

        if (user.usedRefreshTokens.includes(refreshToken.accessToken)) {
            return new ExecutionResultContainer(UserServiceExecutionResult.Unauthorized);
        }

        let getTokenData = await this.tokenHandler.GetTokenLoad(refreshToken);
        let tokenData = getTokenData.result;

        if (!tokenData) {
            return new ExecutionResultContainer(UserServiceExecutionResult.Unauthorized);
        }

        let tokenLoad: TokenLoad = {
            id: user.id,
            deviceId: tokenData.deviceId,
        }

        let saveUsedToken = await this._db.AppendOneProperty(this.userTable, user.id, this.usedTokenName, refreshToken.accessToken);

        if (saveUsedToken.executionStatus === ExecutionResult.Failed)
            return new ExecutionResultContainer(UserServiceExecutionResult.NotFound);


        let activationTime = new Date();

        let refreshTokenExpireTime_ms = activationTime.getTime() + ms(REFRESH_TOKEN_TIME);
        let refreshTokenexpireTime = new Date(refreshTokenExpireTime_ms);

        let accessToken = await this.tokenHandler.GenerateToken(tokenLoad, ACCESS_TOKEN_TIME);
        let newRefreshToken = await this.tokenHandler.GenerateToken(tokenLoad, REFRESH_TOKEN_TIME);


        if (skipDeviceSaving) {
            let deleteUsedDevice = await deviceService.DeleteDeviceByDeviceId(tokenData.deviceId, user.id);
            return new ExecutionResultContainer(UserServiceExecutionResult.Success, null);
        }
        else {
            let deviceInfo = new DeviceDataBase(deviceData, user.id, activationTime.toISOString(), refreshTokenexpireTime.toISOString())
            let updateDeviceInfo = await this._db.UpdateOne(this.deviceTable, tokenData.deviceId, deviceInfo);
        }


        if (accessToken && newRefreshToken) {
            let tokens: LoginTokens = {
                accessToken: accessToken,
                refreshToken: newRefreshToken
            }

            return new ExecutionResultContainer(UserServiceExecutionResult.Success, tokens);
        }

        return new ExecutionResultContainer(UserServiceExecutionResult.ServiceFail);
    }
    public async GetConfirmId(userEmail: string): Promise<ExecutionResultContainer<UserServiceExecutionResult, UserResponse>> {
        let findUser = await this._db.GetOneByValueInOnePropery(this.userTable, "email", userEmail) as UserServiceDto;

        if (findUser.executionStatus !== ExecutionResult.Pass || !findUser.executionResultObject) {
            return new ExecutionResultContainer(UserServiceExecutionResult.NotFound);
        }
        let emailConfirmId = UniqueValGenerator();
        let setNewConfirmId = await this._db.UpdateOneProperty(this.userTable, findUser.executionResultObject.id, "emailConfirmId", emailConfirmId) as UserServiceDto;

        if (setNewConfirmId.executionStatus === ExecutionResult.Pass)
            return new ExecutionResultContainer(UserServiceExecutionResult.Success, setNewConfirmId.executionResultObject);

        return new ExecutionResultContainer(UserServiceExecutionResult.ServiceFail);
    }
    public async ConfirmUser(confirmId: string): Promise<ExecutionResultContainer<UserServiceExecutionResult, UserResponse>> {
        let findUser = await this._db.GetOneByValueInOnePropery(this.userTable, "emailConfirmId", confirmId) as UserServiceDto;

        if (findUser.executionStatus === ExecutionResult.Failed || !findUser.executionResultObject)
            return new ExecutionResultContainer(UserServiceExecutionResult.NotFound);

        let confirmUser = await this._db.UpdateOneProperty(this.userTable, findUser.executionResultObject.id, "emailConfirmed", true) as UserServiceDto;
        if (confirmUser.executionStatus === ExecutionResult.Pass && confirmUser.executionResultObject)
            return new ExecutionResultContainer(UserServiceExecutionResult.Success, confirmUser.executionResultObject);

        return new ExecutionResultContainer(UserServiceExecutionResult.DataBaseFailed);
    }

    public async RefreshUserPassword(userEmail: string): Promise<ExecutionResultContainer<UserServiceExecutionResult, string>> {
        let findUser = await this._db.GetOneByValueInOnePropery(this.userTable, "email", userEmail) as UserServiceDto;
        let user = findUser.executionResultObject;

        if (findUser.executionStatus !== ExecutionResult.Pass || !user) {
            return new ExecutionResultContainer(UserServiceExecutionResult.NotFound);
        }

        let createTime = new Date().toISOString();
        let tokenData: RefreshUserPasswordToken = {
            email: userEmail,
            createTime: createTime
        }

        let refreshPasswordToken = await this.tokenHandler.GenerateToken(tokenData, REFRESH_PASSWORD_TOKEN_TIME);
        if (!refreshPasswordToken) {
            return new ExecutionResultContainer(UserServiceExecutionResult.ServiceFail);
        }


        let updateObj: any = {};
        updateObj["refreshPasswordTime"] = createTime;

        let saveRefreshingProccessUserData = await this._db.UpdateOne(this.userTable, user.id, updateObj);
        if (!saveRefreshingProccessUserData) {
            return new ExecutionResultContainer(UserServiceExecutionResult.DataBaseFailed);
        }

        return new ExecutionResultContainer(UserServiceExecutionResult.Success, refreshPasswordToken.accessToken);
    }

    public async ConfirmRefreshUserPassword(refreshCode: string, newPassword: string): Promise<ExecutionResultContainer<UserServiceExecutionResult, boolean>> {
        let token: Token = {
            accessToken: refreshCode
        }

        let getTokenLoad = await this.tokenHandler.GetRefreshPasswordToken(token);


        if (getTokenLoad.tokenStatus !== TokenStatus.Accepted || !getTokenLoad.result) {
            return new ExecutionResultContainer(UserServiceExecutionResult.Unauthorized);
        }

        let userEmail = getTokenLoad.result.email;
        let refreshTime = getTokenLoad.result.createTime;

        let findUser = await this._db.GetOneByValueInOnePropery(this.userTable, "email", userEmail) as UserServiceDto;
        let user = findUser.executionResultObject;
        if (findUser.executionStatus !== ExecutionResult.Pass || !user) {
            return new ExecutionResultContainer(UserServiceExecutionResult.DataBaseFailed);
        }

        if (user.refreshPasswordTime !== refreshTime) {
            return new ExecutionResultContainer(UserServiceExecutionResult.Unauthorized);
        }

        let hashWithNewPassword = await bcrypt.hash(newPassword, user.salt);

        if (hashWithNewPassword === user.hashedPass) {
            return new ExecutionResultContainer(UserServiceExecutionResult.WrongPassword);
        }

        let salt = await bcrypt.genSalt(10);
        let hashedPass = await bcrypt.hash(newPassword, salt);



        //TODO updateObj[user.refreshPasswordTime.toString()] = null; так выдает ошибку - спросить
        let updateObj: any = {};
        updateObj["salt"] = salt;
        updateObj["hashedPass"] = hashedPass;
        updateObj["refreshPasswordTime"] = null;

        let updateUserData = await this._db.UpdateOne(this.userTable, user.id, updateObj);
        if (!updateUserData) {
            return new ExecutionResultContainer(UserServiceExecutionResult.DataBaseFailed);
        }

        return new ExecutionResultContainer(UserServiceExecutionResult.Success, true);
    }
}
export const userService = new AdminUserService(mongoDb, AdminAuthentication, tokenHandler)