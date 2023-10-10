import { ObjectId, WithId } from "mongodb";
// import { Repo } from "../../../Common/Data/Repo/Repo"
import { UserRequest } from "../Admin/Entities/UserForRequest";
import { UserResponceLite, UserResponse } from "../Admin/Entities/UserForResponse";
import { UserDataBase } from "../Admin/Entities/UserForDataBase";
import { Sorter } from "../../../Common/Database/Sort/Sorter";
import { Paginator } from "../../../Common/Paginator/PageHandler";
import { Page } from "../../../Common/Paginator/Page";
import { UserSorter } from "./UserSorter";
import { Token } from "../Common/Entities/Token";


// export class UserRepo extends Repo<UserRequest, UserResponse | UserDataBase>{
//     ConvertFrom(dbValue: WithId<any>): UserResponse {
//         let { salt, hash, _id, ...rest } = dbValue;
//         // let responseUser: any = {
//         //     id: _id.toString(),
//         //     ...rest
//         // }

//         let respUser = new UserResponse(dbValue._id, dbValue);
//         return respUser;

//     }
//     ConvertTo(reqValue: UserRequest): UserDataBase {
//         return new UserDataBase(reqValue.login, reqValue.email, "", "", "");
//     }
//     override async TakeAll(sorter: UserSorter, pageHandler: Paginator): Promise<Page<any[]> | null> {

//         // let [dbHandler, dbData] = await this.db.GetMany(this.tableName, sorter, pageHandler);
//         let dbFoundExecution = await this.db.GetMany(this.tableName, sorter, pageHandler);


//         if (dbData) {
//             let returnValues = dbData.map(dbVal => {
//                 return new UserResponceLite(this.ConvertFrom(dbVal))
//             })
//             let pagedData = dbHandler.GetPaged(returnValues);
//             return pagedData;
//         }
//         return null;
//     }

//     override async TakeCertain(id: string): Promise<UserResponse | null> {
//         let dbValue = await this.db.GetOneById(this.tableName, id);
//         if (dbValue) {
//             let rerurnValue = this.ConvertFrom(dbValue);
//             return rerurnValue;
//         }
//         return null;
//     }
//     override async Update(id: string, reqObj: UserRequest): Promise<any | null> {
//         let updatedResult = await this.db.UpdateOne(this.tableName, id, reqObj);
//         //let { password, ...rest } = this.ConvertFrom(updatedResult);
//         let respUser = this.ConvertFrom(updatedResult);

//         return respUser;
//     }
//     async UpdateProperty(id: string, propertyName: string, propertyVal: string | boolean | number): Promise<UserResponse | null>{
//         let updatedObj = await this.db.UpdateOneProperty(this.tableName, id, propertyName, propertyVal);
//         if(updatedObj){
//             let respUser = this.ConvertFrom(updatedObj);
//             return respUser;
//         }
//         return null;
//     }
//     async AppendToken(id: string, token: Token): Promise<boolean>{
//         return await this.db.AppendOneProperty(this.tableName, id, "usedRefreshTokens", token.accessToken);
//     }
//     override async Save(reqObj: any): Promise<any | null> {
//         let saveResult = await this.db.SetOne(this.tableName, reqObj);
//         return this.ConvertFrom(saveResult);
//     }
//     async GetUserByLoginOrEmail(loginOrEmail: string, rawData: boolean = false): Promise<UserResponse |WithId<UserDataBase>| null> {
//         let foundUser: WithId<UserDataBase> = await this.db.GetOneByValueInTwoProperties(this.tableName, "login", "email", loginOrEmail);
//         if(foundUser){
//             let returnVal = rawData? foundUser: this.ConvertFrom(foundUser)
//             return returnVal;
//         }
//         return null;
//     }

//     async GetByConfirmEmailCode(code: string): Promise<UserResponse | null>{
//         let foundVal = await this.db.GetOneByValueInOnePropery(this.tableName, "emailConfirmId", code);

//         if(foundVal){
//             return this.ConvertFrom(foundVal);
//         }
//         return null;
//     }
// }