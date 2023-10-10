import { Paginator } from "../Paginator/PageHandler";
import { Sorter } from "../Database/Sort/Sorter";

export interface IDataManager<RequestDataPresentation, ResponseDataPresentation extends RequestDataPresentation> {
    GetData (filter: keyof RequestDataPresentation, filterValue: string, sorter: Sorter<ResponseDataPresentation>, pageHandler: Paginator): RequestDataPresentation[] | null;
    
    GetCertainData(id: string, sorter: Sorter<ResponseDataPresentation>, pageHandler: Paginator): RequestDataPresentation | null;

    PostData (reqObj: RequestDataPresentation): ResponseDataPresentation | null;

    PutData(reqObj: RequestDataPresentation): ResponseDataPresentation | null;

    DeleteData(): ResponseDataPresentation;
}