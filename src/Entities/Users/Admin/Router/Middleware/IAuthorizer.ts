import { Request } from "express";

export interface IAuthorizer{
    RequestIsAuthorized(req: Request<{}, {}, {}, {}>): AuthorizationStatus;
}

export enum AuthorizationStatus {
    DataIsMissing,
    WrongLoginPassword,
    AccessAllowed
}