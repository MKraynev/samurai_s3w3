import { Router, Request, Response } from "express";
import { likeRepo } from "../Repo/LikeRepo";
import { LikeDataBase } from "../Entities/LikeDataBase";
import { LikeRequest } from "../Entities/LikeRequest";

export const likeRouter = Router();

likeRouter.get("",
    async (request: Request, response: Response) => {
        let search = await likeRepo.Get();

        response.send(search);
    })

    likeRouter.post("",
    async (request: Request, response: Response) => {
        let likeReq = new LikeRequest("comments", "123456", "Like");
        let like = likeRepo.GetEntity(new LikeDataBase("98765", likeReq))
        let save = await likeRepo.Save(like);

        response.send(save);
    })