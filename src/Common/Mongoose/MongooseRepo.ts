import mongoose from "mongoose";
import { MONGO_URL } from "../../../settings";

class MongooseRepo{
    private isConnected: boolean = false;

    constructor(private mongoUrl: string, private baseName: string) {}
    public async Connect(): Promise<boolean> {
        try {
            if (!this.isConnected)
                await mongoose.connect(this.mongoUrl, {dbName: this.baseName});

            this.isConnected = true;
        }
        catch {
            this.isConnected = true;
        }
        return this.isConnected;
    }
    public GetModel<T>(tableName: string, schema: mongoose.Schema<T>){
        return mongoose.model(tableName, schema);
    }
}

export const mongooseRepo = new MongooseRepo(MONGO_URL, "MyNewDataBase");