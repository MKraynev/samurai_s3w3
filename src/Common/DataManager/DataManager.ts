// import { BlogRepo } from "../../Entities/Blogs/Repo/BlogRepo";
// import { CommentRepo } from "../../Entities/Comments/Repo/CommentsRepo";
// import { mongoDb } from "../Database/MongoDb";
// import { PostRepo } from "../../Entities/Posts/Repo/PostRepo";
// import { UserRepo } from "../../Entities/Users/Repo/UserRepo";
// import { UserService } from "../../Entities/Users/Common/BuisnessLogic/UserService";

// const blogRepo = new BlogRepo(mongoDb, "blogs");
// const postRepo = new PostRepo(mongoDb, "posts");
// const userRepo = new UserRepo(mongoDb, "users");
// const commentRepo = new CommentRepo(mongoDb, "comments");
// const userService = new UserService(userRepo);

// class DataManager {
//     public blogRepo: BlogRepo;
//     public postRepo: PostRepo;
//     public userService: UserService;
//     public commentRepo: CommentRepo;
//     constructor(blog: BlogRepo, post: PostRepo, user: UserService, commentRepo: CommentRepo) {
//         this.blogRepo = blog;
//         this.postRepo = post;
//         this.userService = user;
//         this.commentRepo = commentRepo
//     }

//     async Run(): Promise<boolean> {
//         let repoRunStatuses: boolean[] = [];
//         repoRunStatuses.push(await this.blogRepo.RunDb());
//         repoRunStatuses.push(await this.postRepo.RunDb());
//         repoRunStatuses.push(await this.commentRepo.RunDb());
        

//         let ConnectionFailed = repoRunStatuses.includes(false);

//         if (ConnectionFailed) {
//             console.log("Data manager: db connection failed");
//         }
//         return !ConnectionFailed;
//     }
// }

// export const dataManager = new DataManager(blogRepo, postRepo, userService, commentRepo);