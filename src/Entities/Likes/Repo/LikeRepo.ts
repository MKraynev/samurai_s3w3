import mongoose, { HydratedDocument } from "mongoose";
import { LikeDataBase, likeSchema } from "../Entities/LikeDataBase";
import { mongooseRepo } from "../../../Common/Mongoose/MongooseRepo";
import { LikeRequest } from "../Entities/LikeRequest";
import { ExecutionResult, ExecutionResultContainer } from "../../../Common/Database/DataBase";


export class LikeRepo {
    constructor(private likeModel: mongoose.Model<LikeDataBase>) { }

    public async FindById(id: string) {
        return await this.likeModel.find({ _id: id })
    }

    public async GetCurrentLikeStatus(userId: string, targetId: string)
        : Promise<ExecutionResultContainer<ExecutionResult, (mongoose.Document<unknown, {}, LikeDataBase> & LikeDataBase & { _id: mongoose.Types.ObjectId; }) | null>> {
        try {
            //Возвращает [] при отсутствии документа при find()
            //findOne() -> null
            let foundLike = await this.likeModel.findOne({targetId: targetId, userId: userId });

            return new ExecutionResultContainer(ExecutionResult.Pass, foundLike);
        }
        catch {
            return new ExecutionResultContainer(ExecutionResult.Failed);
        }

    }

    public async Save(like: HydratedDocument<LikeDataBase>): Promise<HydratedDocument<LikeDataBase>> {
        return await like.save();
    }

    public async DeleteAll() {
        await this.likeModel.deleteMany();
    }
    public async Get() {
        return this.likeModel.find({});
    }

    public GetEntity = (like: LikeDataBase): HydratedDocument<LikeDataBase> => new this.likeModel(like);
}

export const likeRepo = new LikeRepo(mongooseRepo.GetModel("Like", likeSchema))
