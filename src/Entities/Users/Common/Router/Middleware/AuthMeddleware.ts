import { NextFunction, Request, Response } from "express";
import { body, oneOf } from "express-validator";
import { FieldMaxLength, FieldMinLength, FieldNotEmpty } from "../../../../../Common/Request/RequestValidation/RequestValidation";
import { Token } from "../../Entities/Token";
import { TOKEN_COOKIE_NAME } from "../../../../../../settings";
import { TokenStatus, tokenHandler } from "../../../../../Common/Authentication/User/TokenAuthentication";
import { UserServiceExecutionResult, userService } from "../../BuisnessLogic/UserService";
import { ExecutionResult } from "../../../../../Common/Database/DataBase";

export const ValidAuthFields = [
    oneOf(
        [
            FieldNotEmpty("loginOrEmail"), FieldMinLength("loginOrEmail", 3), FieldMaxLength("loginOrEmail", 10),
            FieldNotEmpty("loginOrEmail"), body("loginOrEmail").isEmail().withMessage("Wrong email: email")
        ]),
    FieldNotEmpty("password"), FieldMinLength("password", 6), FieldMaxLength("password", 20),
];

export const ValidAuthRefreshPasswordFields = [
    FieldNotEmpty("recoveryCode"),FieldMinLength("recoveryCode", 40),
    FieldNotEmpty("newPassword"), FieldMinLength("newPassword", 6), FieldMaxLength("newPassword", 20)
]

export const ParseAccessToken = async (request: Request, response: Response, next: NextFunction) => {
    let headerString: string | undefined = request.header("authorization");
    if (headerString?.toLocaleLowerCase().startsWith("bearer ")) {
        let tokenString = headerString.split(" ")[1];
        let token: Token = {
            accessToken: tokenString
        }
        request.accessToken = token;
    }
    next();
};

export const ParseRefreshToken = (request: Request, response: Response, next: NextFunction) => {
    let tokenVal = request.cookies[TOKEN_COOKIE_NAME];

    if (!tokenVal) {
        response.sendStatus(401);
        return;
    }

    let token: Token = {
        accessToken: tokenVal
    };
    request.refreshToken = token;
    next();
}

export const AccessIsAllowed = async (request: Request, response: Response, next: NextFunction) => {
    let getTokenData = await tokenHandler.GetTokenLoad(request.accessToken);
    let tokenData = getTokenData.result;

    if(getTokenData.tokenStatus !== TokenStatus.Accepted || !tokenData){
        response.sendStatus(401);
        return;
    }

    let findUser = await userService.GetUserById(tokenData.id);
    let userData = findUser.executionResultObject;
    if(findUser.executionStatus !== UserServiceExecutionResult.Success || !userData){
        response.sendStatus(401);
        return;
    }
    
    request.userData = userData;
    next();
}