import {Request, Response} from "express";
import { AvailableLikeStatusList } from "../../Entities/LikeRequest";
import { NextFunction } from "express";
import { RequestWithBody } from "../../../../Common/Request/Entities/RequestTypes";
import { ErrorLog } from "../../../../Common/Request/RequestValidation/Error";


export const ValidLikeFields = async (request: RequestWithBody<{likeStatus: string}>, response: Response, next: NextFunction) => {
    let status = request.body.likeStatus;

    if(AvailableLikeStatusList.includes(status)){
        next();
        return;
    }

    let error = new ErrorLog();
    error.add("likeStatus", "Invalid status");
    
    response.status(400).send(error);
}