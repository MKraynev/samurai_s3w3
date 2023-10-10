import { body } from "express-validator";
import { FieldMaxLength, FieldMinLength, FieldNotEmpty } from "../../../../../Common/Request/RequestValidation/RequestValidation";

export const ValidUserFields = [
    FieldNotEmpty("login"), FieldMinLength("login", 3), FieldMaxLength("login", 10),
    FieldNotEmpty("password"), FieldMinLength("password", 6), FieldMaxLength("password", 20),
    FieldNotEmpty("email"), body("email").isEmail().withMessage("Wrong email: email")

];