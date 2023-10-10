import { ObjectId } from "mongodb";
import { UserDataBase } from "./UserForDataBase";

export class UserResponse extends UserDataBase {
    public id: string;
    constructor(_id: ObjectId, user: UserDataBase) {
        super(
            user.login,
            user.email,
            user.salt,
            user.hashedPass,
            user.emailConfirmId,
            user.emailConfirmed,
            user.createdAt,
            user.usedRefreshTokens,
            user.refreshPasswordTime
        )

        this.id = _id.toString();
    }
}

export class UserResponceLite {
    public id: string;
    public login: string;
    public email: string;
    public createdAt: string;

    constructor(user: UserResponse) {
        this.id = user.id
        this.login = user.login;
        this.email = user.email;
        this.createdAt = user.createdAt;
    }
}