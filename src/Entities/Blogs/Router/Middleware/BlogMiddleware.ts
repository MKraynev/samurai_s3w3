import { body } from "express-validator";
import { FieldIsUri, FieldMaxLength, FieldMinLength, FieldNotEmpty } from "../../../../Common/Request/RequestValidation/RequestValidation";
// import { dataManager } from "../../../../Common/DataManager/DataManager";

export const ValidBlogFields = [
    FieldNotEmpty("name"), FieldMinLength("name", 2), FieldMaxLength("name", 15),
    FieldNotEmpty("description"), FieldMinLength("description", 3),
    FieldNotEmpty("websiteUrl"), FieldIsUri("websiteUrl")
];
