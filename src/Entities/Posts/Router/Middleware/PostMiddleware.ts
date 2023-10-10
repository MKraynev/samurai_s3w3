// import { dataManager } from "../../../../Common/DataManager/DataManager";
import { FieldMaxLength, FieldMinLength, FieldNotEmpty } from "../../../../Common/Request/RequestValidation/RequestValidation";
import {Request, Response, NextFunction} from "express"

export const ValidPostFields = [
    FieldNotEmpty("title"), FieldMinLength("title", 5), FieldMaxLength("title", 30),
    FieldNotEmpty("shortDescription"), FieldMinLength("shortDescription", 5), FieldMaxLength("shortDescription", 100),
    FieldNotEmpty("content"), FieldMinLength("content", 5), FieldMaxLength("content", 1000),
    FieldNotEmpty("blogId"), FieldMinLength("blogId", 24), FieldMaxLength("blogId", 24)
];

export const ValidPostFieldsLight = [
    FieldNotEmpty("title"), FieldMinLength("title", 5), FieldMaxLength("title", 30),
    FieldNotEmpty("shortDescription"), FieldMinLength("shortDescription", 5), FieldMaxLength("shortDescription", 100),
    FieldNotEmpty("content"), FieldMinLength("content", 5), FieldMaxLength("content", 1000)
];

// export const PostIdExist = async (request: Request<{ id: string }, {}, {}, {}>, response: Response, next: NextFunction) => {
//     let post = await dataManager.postRepo.TakeCertain(request.params.id);
//     if (!post) {
//         response.sendStatus(404);
//         return;
//     }
//     next();
//}