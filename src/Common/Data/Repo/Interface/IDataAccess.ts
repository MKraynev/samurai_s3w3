import { Paginator } from "../../../Paginator/PageHandler";
import { Sorter } from "../../../Database/Sort/Sorter";
import { Page } from "../../../Paginator/Page";

export interface IDataAccess<RequestDataPresentation, ResponseDataPresentation> {
    TakeCertain(id: string): Promise<ResponseDataPresentation | null>;
    TakeAll(sorter?: Sorter<ResponseDataPresentation>, pageHandler?: Paginator): Promise<Page<ResponseDataPresentation[]> | null>;

    Save(reqObj: RequestDataPresentation): Promise<ResponseDataPresentation | null>;
    Update(id: string, reqObj: RequestDataPresentation): Promise<ResponseDataPresentation | null>;
    DeleteCertain(id: string): Promise<boolean>;
    DeleteMany(): Promise<boolean>;
}