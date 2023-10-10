import { Router, Request, Response } from "express"
import { RequestParser } from "../../../../Common/Request/RequestParser/RequestParser";
import { UserServiceExecutionResult, userService } from "../../Common/BuisnessLogic/UserService";
import { ServiseExecutionStatus } from "../../../Blogs/BuisnessLogic/BlogService";
import { ValidUserFields } from "./Middleware/UserMiddleware";
import { CheckFormatErrors } from "../../../../Common/Request/RequestValidation/RequestValidation";
import { RequestWithBody, RequestWithParams } from "../../../../Common/Request/Entities/RequestTypes";
import { UserRequest } from "../Entities/UserForRequest";
import { UserResponceLite } from "../Entities/UserForResponse";

export const userRouter = Router();

userRouter.get("", async (request: Request, response: Response) => {

    let searchParams = RequestParser.ReadQueryUserSorter(request);
    let pageHandler = RequestParser.ReadQueryPageHandle(request);

    let search = await userService.GetUsers(searchParams, pageHandler, request);

    switch (search.executionStatus) {
        case ServiseExecutionStatus.DataBaseFailed:
        case ServiseExecutionStatus.Unauthorized:
            response.sendStatus(401);
            break;

        case ServiseExecutionStatus.Success:
            response.status(200).send(search.executionResultObject);
            break;
    }

    //let foundValues = await dataManager.userRepo.TakeAll(searchParams, pageHandler);
    // let foundValues = await dataManager.userService.GetUsers(searchParams, pageHandler);
    // let returnValues = foundValues || [];

    // response.status(200).send(returnValues)
    return;
})

userRouter.post("",
    ValidUserFields,
    CheckFormatErrors,
    async (request: RequestWithBody<UserRequest>, response: Response) => {
        let reqObj = new UserRequest(request.body.login, request.body.password, request.body.email);

        let save = await userService.SaveUser(reqObj, request);

        switch (save.executionStatus) {
            case UserServiceExecutionResult.DataBaseFailed:
            case UserServiceExecutionResult.UserAlreadyExist:
            case UserServiceExecutionResult.ServiceFail:
            default:
                response.sendStatus(400);
                break;

            case UserServiceExecutionResult.Success:
                if (!save.executionResultObject) {
                    response.sendStatus(400);
                    return;
                }
                response.status(201).send(new UserResponceLite(save.executionResultObject));
                break;
        }
        // let savedPost = await dataManager.userService.SaveUser(reqObj);
        // if (savedPost) {
        //     response.status(201).send(new UserResponceLite(savedPost));
        //     return;
        // }
        // response.sendStatus(400);
    })

userRouter.delete("/:id",
    async (request: RequestWithParams<{ id: string }>, response: Response) => {
        let idVal = request.params.id;

        let deleteOperation = await userService.DeleteUser(idVal, request);

        switch (deleteOperation.executionStatus) {
            case ServiseExecutionStatus.Unauthorized:
                response.sendStatus(401);
                break;

            case ServiseExecutionStatus.DataBaseFailed:
                response.sendStatus(500);
                break;

            case ServiseExecutionStatus.Success:
                response.sendStatus(204);
                break;

            case ServiseExecutionStatus.NotFound:
                response.sendStatus(404);
                break;
        }
        // let userIsDeleted = await dataManager.userService.DeleteUser(idVal);

        // if (userIsDeleted) response.sendStatus(204);

        // else response.sendStatus(404);
        // return;
    }

)