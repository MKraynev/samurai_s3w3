import { Router, Response, Request } from "express"
import { CheckFormatErrors, FieldNotEmpty, RequestIsAllowed, ValidEmail } from "../../../../Common/Request/RequestValidation/RequestValidation";
import { RequestWithBody } from "../../../../Common/Request/Entities/RequestTypes";
import { AuthRequest } from "../Entities/AuthRequest";
import { UserRequest } from "../../Admin/Entities/UserForRequest";
import { emailSender } from "../../../../EmailHandler/EmailSender";
import { Token } from "../Entities/Token";
import { CONFIRM_ADRESS, REFRESH_PASSWORD_ADRESS } from "../../../../../settings";
import { ValidUserFields } from "../../Admin/Router/Middleware/UserMiddleware";
import { ParseAccessToken, ParseRefreshToken, ValidAuthFields, ValidAuthRefreshPasswordFields } from "./Middleware/AuthMeddleware";
import { UserServiceExecutionResult, userService } from "../BuisnessLogic/UserService";
import { DeviceRequest } from "../../../Devices/Entities/DeviceForRequest";

export const authRouter = Router();

authRouter.post("/login",
    RequestIsAllowed,
    ValidAuthFields,
    CheckFormatErrors,
    async (request: RequestWithBody<AuthRequest>, response: Response) => {
        let authRequest = new AuthRequest(request.body.loginOrEmail, request.body.password);

        let deviceData = new DeviceRequest(request.ip, request.deviceName);

        let generateTokens = await userService.Login(authRequest, deviceData);

        switch (generateTokens.executionStatus) {
            case UserServiceExecutionResult.DataBaseFailed:
            case UserServiceExecutionResult.NotFound:
            case UserServiceExecutionResult.ServiceFail:
            case UserServiceExecutionResult.Unauthorized:
            case UserServiceExecutionResult.WrongPassword:
                response.sendStatus(401);
                break;


            case UserServiceExecutionResult.Success:
                response.cookie("refreshToken", generateTokens.executionResultObject!.refreshToken.accessToken, { httpOnly: true, secure: true, })
                response.status(200).send(generateTokens.executionResultObject!.accessToken);


                break;
        }
    })

authRouter.get("/me",
    ParseAccessToken,
    async (request: Request, response: Response) => {
        let token: Token = request.accessToken;
        let search = await userService.GetUserByToken(token);

        switch (search.executionStatus) {
            case UserServiceExecutionResult.DataBaseFailed:
            case UserServiceExecutionResult.NotFound:
            case UserServiceExecutionResult.ServiceFail:
            case UserServiceExecutionResult.Unauthorized:
            case UserServiceExecutionResult.WrongPassword:
                response.sendStatus(401);
                break;

            case UserServiceExecutionResult.Success:
                response.status(200).send({
                    email: search.executionResultObject!.email,
                    login: search.executionResultObject!.login,
                    userId: search.executionResultObject!.id
                })
                break;
        }
    })

authRouter.post("/refresh-token",
    ParseRefreshToken,
    async (request: Request, response: Response) => {
        let token: Token = request.refreshToken;
        let deviceData = new DeviceRequest(request.ip, request.deviceName);

        let generateNewTokens = await userService.RefreshUserAccess(token, deviceData);

        switch (generateNewTokens.executionStatus) {
            case UserServiceExecutionResult.DataBaseFailed:
            case UserServiceExecutionResult.NotFound:
            case UserServiceExecutionResult.ServiceFail:
            case UserServiceExecutionResult.Unauthorized:
            case UserServiceExecutionResult.WrongPassword:
                response.sendStatus(401);
                break;

            case UserServiceExecutionResult.Success:
                let accessToken = generateNewTokens.executionResultObject?.accessToken;
                let refreshToken = generateNewTokens.executionResultObject?.accessToken;

                if (accessToken && refreshToken) {
                    response.cookie("refreshToken", refreshToken.accessToken, { httpOnly: true, secure: true, })
                    response.status(200).send(accessToken);
                    return;
                }

                response.sendStatus(400);
                break;
        }
    })

authRouter.post("/registration",
    RequestIsAllowed,
    ValidUserFields,
    CheckFormatErrors,
    async (request: RequestWithBody<UserRequest>, response: Response) => {


        let user = new UserRequest(request.body.login, request.body.password, request.body.email);
        let registration = await userService.RegisterUser(user);

        switch (registration.executionStatus) {
            case UserServiceExecutionResult.Success:
                if (!registration.executionResultObject) {
                    response.sendStatus(400);
                    return;
                }

                emailSender.SendRegistrationMail(registration.executionResultObject.email, CONFIRM_ADRESS, registration.executionResultObject.emailConfirmId);
                response.sendStatus(204);
                break;

            case UserServiceExecutionResult.DataBaseFailed:
            case UserServiceExecutionResult.ServiceFail:
            case UserServiceExecutionResult.UserAlreadyExist:
            default:
                response.sendStatus(400);
                break;


        }
    })

authRouter.post("/registration-email-resending",
    RequestIsAllowed,
    ValidEmail,
    CheckFormatErrors,
    async (request: RequestWithBody<{ email: string }>, response: Response) => {
        let getNewConfirmId = await userService.GetConfirmId(request.body.email);

        switch (getNewConfirmId.executionStatus) {
            case UserServiceExecutionResult.Success:
                if (!getNewConfirmId.executionResultObject) {
                    response.sendStatus(400);
                    return;
                }
                emailSender.SendRegistrationMail(getNewConfirmId.executionResultObject.email, CONFIRM_ADRESS, getNewConfirmId.executionResultObject.emailConfirmId);
                response.sendStatus(204);
                break;


            case UserServiceExecutionResult.NotFound:
            case UserServiceExecutionResult.ServiceFail:
            default:
                response.sendStatus(400);
                break;
        }
    })

authRouter.post("/registration-confirmation",
    RequestIsAllowed,
    FieldNotEmpty("code"),
    CheckFormatErrors,
    async (request: RequestWithBody<{ code: string }>, response: Response) => {

        let confirmUser = await userService.ConfirmUser(request.body.code);
        switch (confirmUser.executionStatus) {
            case UserServiceExecutionResult.Success:
                if (confirmUser.executionResultObject) {
                    response.sendStatus(204);
                    return;
                }
                response.sendStatus(400);
                break;

            case UserServiceExecutionResult.NotFound:
            case UserServiceExecutionResult.ServiceFail:
            case UserServiceExecutionResult.DataBaseFailed:
            default:
                response.sendStatus(400);
                break;

        }
    })

authRouter.post("/logout",
    ParseRefreshToken,
    async (request: Request, response: Response) => {
        let token: Token = request.refreshToken;
        let deviceData = new DeviceRequest(request.ip, request.deviceName);

        let generateNewTokens = await userService.RefreshUserAccess(token, deviceData, true);

        switch (generateNewTokens.executionStatus) {
            case UserServiceExecutionResult.DataBaseFailed:
            case UserServiceExecutionResult.NotFound:
            case UserServiceExecutionResult.ServiceFail:
            case UserServiceExecutionResult.Unauthorized:
            case UserServiceExecutionResult.WrongPassword:
                response.sendStatus(401);
                break;

            case UserServiceExecutionResult.Success:
                response.sendStatus(204);
        }
    })

authRouter.post("/password-recovery",
    RequestIsAllowed,
    ValidEmail,
    CheckFormatErrors,
    async (request: RequestWithBody<{ email: string }>, response: Response) => {
        let email = request.body.email;

        let getConfirmCode = await userService.RefreshUserPassword(email);

        switch (getConfirmCode.executionStatus) {
            case UserServiceExecutionResult.Success:
                let refreshCode = getConfirmCode.executionResultObject;
                if (refreshCode) {
                    emailSender.SendRefreshPasswordMail(email, REFRESH_PASSWORD_ADRESS, refreshCode);
                    response.sendStatus(204);
                }
                else {
                    response.sendStatus(404);
                }
                break;

            case UserServiceExecutionResult.NotFound:
                response.sendStatus(204);
                break;

            default:
                response.sendStatus(400);
                break;
        }
    })

authRouter.post("/new-password",
    RequestIsAllowed,
    ValidAuthRefreshPasswordFields,
    CheckFormatErrors,
    async (request: RequestWithBody<{ recoveryCode: string, newPassword: string }>, response: Response) => {
        let code = request.body.recoveryCode;
        let password = request.body.newPassword;

        let updateUserPassword = await userService.ConfirmRefreshUserPassword(code, password);

        switch (updateUserPassword.executionStatus) {
            case UserServiceExecutionResult.Success:
                response.sendStatus(204);
                break;

            default:
                response.sendStatus(400);
                break;
        }
    }
)