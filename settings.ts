import dotenv from "dotenv"
dotenv.config();

export const JWT_SECRET = process.env.JWT_SECRET_TOKEN || "123321"
export const ADMIN_PASSWORD = process.env.ADMIN_AUTH || "12345"
export const MONGO_URL = process.env.MONGO_URL || "";
export const MAIL_LOGIN = process.env.GMAIL_LOGIN || "";
export const MAIL_PASSWORD = process.env.GMAIL_PASSWORD || "";
export const CONFIRM_ADRESS = process.env.USER_CONFIRM_ADRESS || "http://localhost/auth/registration-confirmation";
export const REFRESH_PASSWORD_ADRESS = process.env.USER_REFRESH_PASSWORD_ADRESS || "http://localhost/auth/registration-confirmation";


export const ACCESS_TOKEN_TIME = process.env.ACCESS_TOKEN_EXPIRE || "10s";
export const REFRESH_TOKEN_TIME = process.env.REFRESH_TOKEN_EXPIRE || "20s";
export const REFRESH_PASSWORD_TOKEN_TIME = process.env.REFRESH_PASSWORD_TOKEN_EXPIRE || "60s";

export const TOKEN_COOKIE_NAME = process.env.COOKIE_TOKEN_REFRESH_NAME || "samurai";
export const TOKEN_BODY_NAME = process.env.COOKIE_TOKEN_ACCESS_NAME || "samurai";

export const PORT_NUM: number = +(process.env.PORT_NUMBER || "5001");


export const REQUEST_LIMIT_COUNT: number = +(process.env.REQUEST_LIMIT_COUNT || "5");
export const REQUEST_LIMIT_SECONDS: number = +(process.env.REQUEST_LIMIT_TIME_SECONDS || "10");