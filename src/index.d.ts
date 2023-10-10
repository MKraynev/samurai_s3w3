import express from "express";
import { Token } from "./Entities/Users/Common/Entities/Token";
import { UserResponse } from "./Entities/Users/Admin/Entities/UserForResponse";

declare global {
    namespace Express {
        export interface Request {
            accessToken: Token;
            refreshToken: Token;
            deviceName: string;
            userData: UserResponse
        }
    }
}
