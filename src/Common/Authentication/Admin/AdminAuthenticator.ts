import { AuthorizationStatus } from "../../../Entities/Users/Admin/Router/Middleware/IAuthorizer";
import { Request } from "express";
import { ADMIN_PASSWORD } from "../../../../settings";
import { Base64 } from "./Base64";

export enum AuthenticationResult {
    InvalidKey,
    Denied,
    Accept
}

export interface IAuthenticator {
    AccessCheck(request: Request<{}, {}, {}, {}>): AuthenticationResult;
}


export class AdminAuthenticator implements IAuthenticator {
    constructor(private password: string) {}

    AccessCheck(request: Request<{}, {}, {}, {}>): AuthenticationResult {
        let headerValue = request.header("authorization");

        if (!headerValue)
            return AuthenticationResult.InvalidKey;

        let result = Base64.ValidBase64Key(headerValue, this.password) ? AuthenticationResult.Accept : AuthenticationResult.Denied;
        return result;
    }

}


export const AdminAuthentication = new AdminAuthenticator(ADMIN_PASSWORD);

