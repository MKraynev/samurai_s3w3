import { IDataAccess } from "./Interface/IDataAccess";
import { Page } from "../../Paginator/Page";
import { DataBase } from "../../Database/DataBase";
import { Paginator } from "../../Paginator/PageHandler";
import { Sorter } from "../../Database/Sort/Sorter";

// export abstract class Repo<RequestDataPresentation, ResponseDataPresentation>
//     implements IDataAccess<RequestDataPresentation, ResponseDataPresentation>{

//     constructor(protected db: DataBase, protected tableName: string) { }

//     //Methods
//     async TakeCertain(id: string): Promise<ResponseDataPresentation | null> {
//         let dbValue = await this.db.GetOneById(this.tableName, id);
//         if (dbValue) {
//             let rerurnValue = this.ConvertFrom(dbValue);
//             return rerurnValue;
//         }
//         return null;
//     }

//     async TakeAll(sorter: Sorter<ResponseDataPresentation>, pageHandler: Paginator): Promise<Page<ResponseDataPresentation[]> | null> {

//         let [dbHandler, dbData] = await this.db.GetMany(this.tableName, sorter, pageHandler);


//         if (dbData) {
//             let returnValues = dbData.map(dbVal => this.ConvertFrom(dbVal))
//             let pagedData = dbHandler.GetPaged(returnValues);
//             return pagedData;
//         }
//         return null;
//     }

//     async Save(reqObj: RequestDataPresentation): Promise<ResponseDataPresentation | null> {
//         let dataForDb = this.ConvertTo(reqObj);
//         let saveResult = await this.db.SetOne(this.tableName, dataForDb);
//         let returnResult = this.ConvertFrom(saveResult);
//         return returnResult;
//     }

//     async Update(id: string, reqObj: RequestDataPresentation): Promise<ResponseDataPresentation | null> {
//         let updatedResult = await this.db.UpdateOne(this.tableName, id, reqObj);
//         let returnResult = this.ConvertFrom(updatedResult);

//         return returnResult;
//     }

//     async DeleteCertain(id: string): Promise<boolean> {
//         let delResult = await this.db.DeleteOne(this.tableName, id);
//         return delResult;

//     }

//     async DeleteMany(): Promise<boolean> {
//         let delRes = await this.db.DeleteMany(this.tableName);

//         return delRes;
//     }

//     async RunDb(): Promise<boolean> {
//         return await this.db.RunDb();
//     }

//     abstract ConvertFrom(dbValue: any): ResponseDataPresentation;
//     abstract ConvertTo(reqValue: RequestDataPresentation): ResponseDataPresentation;

// }