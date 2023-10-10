import { Router, Request, Response } from "express";
import { ParseAccessToken, ParseRefreshToken } from "../../Users/Common/Router/Middleware/AuthMeddleware";
import { Token } from "../../Users/Common/Entities/Token";
import { deviceService } from "../BuisnessLogic/DeviceService";
import { ServiseExecutionStatus } from "../../Blogs/BuisnessLogic/BlogService";
import { RequestWithParams } from "../../../Common/Request/Entities/RequestTypes";
import { ServicesWithUsersExecutionResult } from "../../Comments/BuisnessLogic/CommentService";


export const deviceRouter = Router();


deviceRouter.get("",
    ParseRefreshToken,
    async (request: Request, response: Response) => {
        let token: Token = request.refreshToken;
        let search = await deviceService.GetUserDevices(token);

        switch (search.executionStatus) {
            case ServicesWithUsersExecutionResult.Success:
                let result = search.executionResultObject || [];

                response.status(200).send(result);
                break;

            case ServicesWithUsersExecutionResult.DataBaseFailed:
            case ServicesWithUsersExecutionResult.Unauthorized:
            default:
                response.sendStatus(401);
                break;
        }
    })

deviceRouter.delete("",
    ParseRefreshToken,
    async (request: Request, response: Response) => {
        let token: Token = request.refreshToken;
        let deleteDevises = await deviceService.DeleteManyDevices(token);

        switch (deleteDevises.executionStatus) {
            case ServicesWithUsersExecutionResult.Success:
                response.sendStatus(204);
                break;

            case ServicesWithUsersExecutionResult.DataBaseFailed:
            case ServicesWithUsersExecutionResult.Unauthorized:
            default:
                response.sendStatus(401);
                break;
        }
    }
)

deviceRouter.delete("/:id",
    ParseRefreshToken,
    async (request: RequestWithParams<{ id: string }>, response: Response) => {
        let token: Token = request.refreshToken;
        let id = request.params.id;


        let deleteDevises = await deviceService.DeleteDevice(token, id);

        switch (deleteDevises.executionStatus) {
            case ServicesWithUsersExecutionResult.Success:

                response.sendStatus(204);
                break;

            case ServicesWithUsersExecutionResult.DataBaseFailed:
            case ServicesWithUsersExecutionResult.Unauthorized:
                response.sendStatus(401);
                break;

            case ServicesWithUsersExecutionResult.WrongUser:
                response.sendStatus(403);
                break;

            case ServicesWithUsersExecutionResult.NotFound:
            default:
                response.sendStatus(404);
                break;
        }
    }
)
