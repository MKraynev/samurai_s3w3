import { FieldMaxLength, FieldMinLength, FieldNotEmpty } from "../../../../Common/Request/RequestValidation/RequestValidation";

export const ValidCommentFields = [
    FieldNotEmpty("content"),
    FieldMinLength("content", 20),
    FieldMaxLength("content", 300)
]