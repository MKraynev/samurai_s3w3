import mongoose, { HydratedDocument } from "mongoose";
import { LikeDataBase, likeSchema } from "../Entities/LikeDataBase";
import { mongooseRepo } from "../../../Common/Mongoose/MongooseRepo";
import { ExecutionResult, ExecutionResultContainer } from "../../../Common/Database/DataBase";
import { AvailableLikeStatus } from "../Entities/LikeRequest";

export type LikeRepoType = (
    mongoose.Document<unknown, {}, LikeDataBase>
    & LikeDataBase
    & { _id: mongoose.Types.ObjectId; }
    & { createdAt: string, updatedAt: string })

export class LikeRepo {
    constructor(private likeModel: mongoose.Model<LikeDataBase>) { }

    public async FindById(id: string) {
        return await this.likeModel.find({ _id: id })
    }

    public async GetCurrentLikeStatus(userId: string, targetId: string)
        : Promise<ExecutionResultContainer<ExecutionResult, LikeRepoType | null>> {
        try {
            //Возвращает [] при отсутствии документа при find()
            //findOne() -> null
            let foundLike = await this.likeModel.findOne({ targetId: targetId, userId: userId }) as LikeRepoType;

            return new ExecutionResultContainer(ExecutionResult.Pass, foundLike);
        }
        catch {
            return new ExecutionResultContainer(ExecutionResult.Failed);
        }

    }

    public async Save(like: HydratedDocument<LikeDataBase>): Promise<LikeRepoType> {
        return await like.save() as LikeRepoType;
    }

    public async DeleteAll() {
        await this.likeModel.deleteMany();
    }
    public async GetLast(targetId: string, status: AvailableLikeStatus, limit: number = 3) {
        let values = await this.likeModel.find({ targetId: targetId, status: status }).sort({"createdAt": "desc"}).limit(limit) as LikeRepoType[]


        // if (values) {
        //     values.sort((l1, l2) => new Date(l1.createdAt).getMilliseconds() - new Date(l2.createdAt).getMilliseconds()).reverse();
        // }

        return values;
    }
    public async Count(targetId: string, status: AvailableLikeStatus) {
        return await this.likeModel.countDocuments({ targetId: targetId, status: status }) || 0;
    }

    public GetEntity = (like: LikeDataBase): LikeRepoType => new this.likeModel(like) as LikeRepoType;
}

export const likeRepo = new LikeRepo(mongooseRepo.GetModel("Like", likeSchema))
