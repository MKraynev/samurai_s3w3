import express from "express";
import { blogRouter } from "./Entities/Blogs/Router/BlogsRouter";
import { _NewTestClearAllRouter } from "./Entities/ClearAll/Router/TestRouter";
import { postRouter } from "./Entities/Posts/Router/PostsRouter";
import { userRouter } from "./Entities/Users/Admin/Router/UserRouter";
import { commentRouter } from "./Entities/Comments/Router/CommentsRouter";
import cookieParser from "cookie-parser";
import ngrok from "ngrok"
import { PORT_NUM } from "../settings";
import { mongoDb } from "./Common/Database/MongoDb";
import { authRouter } from "./Entities/Users/Common/Router/AuthRouter";
import { deviceRouter } from "./Entities/Devices/Router/DeviceRouter";
import { mongooseRepo } from "./Common/Mongoose/MongooseRepo";
import { likeRouter } from "./Entities/Likes/TestRouter/LikeRouter";


var useragent = require('express-useragent');

export const blogsPath = "/blogs";
export const postsPath = "/posts";
export const usersPath = "/users";
export const authPath = "/auth";
export const commentPath = "/comments";
export const devicesPath = "/security/devices"
export const likeTestPath = "/likes"

export const TestClearAllPath = "/testing/all-data";

export const app = express();
app.set('trust proxy', true);

app.use(useragent.express());
app.use(express.json());
app.use(cookieParser())

app.use(blogsPath, blogRouter);
app.use(postsPath, postRouter);
app.use(usersPath, userRouter);
app.use(authPath, authRouter);
app.use(devicesPath, deviceRouter);
app.use(commentPath, commentRouter);
// app.use(likeTestPath, likeRouter);

app.use(TestClearAllPath, _NewTestClearAllRouter)

// app.use(async (err, req, res, next) => {

// })

const PORT: number = PORT_NUM;
const ngrokConnect = async (): Promise<string> => {
    const url = await ngrok.connect();
    console.log(url);
    return url;
};

const StartApp = async () => {

    await mongoDb.RunDb();
    
    let mongooseStatus = await mongooseRepo.Connect();
    if(mongooseStatus)
        console.log("Mongoose connected");

    app.listen(PORT, () => {
        console.log("app is running");
    })

    await ngrokConnect();
}

StartApp();

