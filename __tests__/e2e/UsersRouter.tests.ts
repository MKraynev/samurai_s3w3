import request from "supertest"
import { BlogsPath, PostsPath, TestClearAllPath, UsersPath, app, authPath } from "../../src/app"
//import { Encode64 } from "../../src/_legacy/Authorization/BasicAuthorization/BasicAuthorization";
import { _encodedKey, pagedStructure } from "./BlogsRouter.tests";


// const authData = `Basic ${_encodedKey}`;
// const _authorization = { Authorization: authData };

// const user_1 = {
//     "login": "JimLim",
//     "password": "1234567",
//     "email": "www.jm@gmail.com"
// }
// const user_2 = {
//     "login": "Bobo",
//     "password": "1234567",
//     "email": "www.bobo@gmail.com"
// }
// const user_3 = {
//     "login": "QweZxc",
//     "password": "1234567",
//     "email": "www.qwezxc@gmail.com"
// }

// describe("Users test", () => {
//     let availableId: string[] = [];


//     it("DELETE ALL 204", async () => {
//         await request(app).delete(TestClearAllPath).expect(204);

//         let response = await request(app).get(UsersPath).expect(200);

//         expect(response.body).toEqual(pagedStructure());
//     })

//     it("POST #1 201", async () => {
//         let response = await request(app).post(UsersPath)
//             .send({
//                 "login": "JoeMoe",
//                 "password": "1234567",
//                 "email": "www.elonmelon@gmail.com"
//             })
//             .set({ Authorization: `Basic ${_encodedKey}` })
//             .expect(201);
//             console.log(response.body);
//         expect(response.body).toEqual({
//             id: expect.any(String),
//             "login": "JoeMoe",
//             "email": "www.elonmelon@gmail.com",
//             createdAt: expect.any(String)
//         })

//         if (response.body) {
//             console.log("User Response")
//             console.log(response.body)
//             availableId.push(response.body.id);
//         }
//     })

//     it("GET 200", async () => {
//         let response = await request(app).get(UsersPath).expect(200);

//         expect(response.body).toEqual(pagedStructure({
//             id: expect.any(String),
//             "login": "JoeMoe",
//             "email": "www.elonmelon@gmail.com",
//             createdAt: expect.any(String)
//         }))
//     })

//     it("DELETE 204", async () => {
//         let response = await request(app)
//             .delete(`${UsersPath}/${availableId.pop()}`)
//             .set(_authorization)
//             .expect(204);
//     })

//     it("GET 200 []", async () => {
//         let response = await request(app).get(UsersPath).expect(200);

//         expect(response.body).toEqual(pagedStructure())
//     })


//     it("POST AGAIN #1 201", async () => {
//         let response = await request(app).post(UsersPath)
//             .send({
//                 "login": "JimLim",
//                 "password": "1234567",
//                 "email": "www.jm@gmail.com"
//             })
//             .set({ Authorization: `Basic ${_encodedKey}` })
//             .expect(201);

//         expect(response.body).toEqual({
//             id: expect.any(String),
//             "login": "JimLim",
//             "email": "www.jm@gmail.com",
//             createdAt: expect.any(String)
//         })

//         if (response.body) {
//             console.log("User Response")
//             console.log(response.body)
//             availableId.push(response.body.id);
//         }
//     })
//     it("POST #2 201", async () => {
//         let response = await request(app).post(UsersPath)
//             .send({
//                 "login": "Bobo",
//                 "password": "1234567",
//                 "email": "www.bobo@gmail.com"
//             })
//             .set({ Authorization: `Basic ${_encodedKey}` })
//             .expect(201);

//         expect(response.body).toEqual({
//             id: expect.any(String),
//             "login": "Bobo",
//             "email": "www.bobo@gmail.com",
//             createdAt: expect.any(String)
//         })

//         if (response.body) {
//             console.log("User Response")
//             console.log(response.body)
//             availableId.push(response.body.id);
//         }
//     })

//     it("POST #3 201", async () => {
//         let response = await request(app).post(UsersPath)
//             .send({
//                 "login": "QweZxc",
//                 "password": "1234567",
//                 "email": "www.qwezxc@gmail.com"
//             })
//             .set({ Authorization: `Basic ${_encodedKey}` })
//             .expect(201);

//         expect(response.body).toEqual({
//             id: expect.any(String),
//             "login": "QweZxc",
//             "email": "www.qwezxc@gmail.com",
//             createdAt: expect.any(String)
//         })

//         if (response.body) {
//             console.log("User Response")
//             console.log(response.body)
//             availableId.push(response.body.id);
//         }
//     })

//     it("DELETE #3 204", async () => {
//         let response = await request(app)
//             .delete(`${UsersPath}/${availableId.pop()}`)
//             .set(_authorization)
//             .expect(204);
//     })

//     it("GET 2 ITEMS 200", async () => {
//         let response = await request(app).get(UsersPath).expect(200);

//         expect(response.body).toEqual(pagedStructure(
//             {
//                 id: expect.any(String),
//                 "login": expect.any(String),
//                 "email": expect.any(String),
//                 createdAt: expect.any(String)
//             },
//             {
//                 id: expect.any(String),
//                 "login": expect.any(String),
//                 "email": expect.any(String),
//                 createdAt: expect.any(String)
//             }
//         ))
//     })

//     it("USER_1 EXIST BY LOGIN", async () => {
//         let response = await request(app)
//             .post(authPath)
//             .send({
//                 "loginOrEmail": user_1.login,
//                 "password": user_1.password
//             })
//             .set({ Authorization: `Basic ${_encodedKey}` })
//             .expect(204);
//     })

//     it("USER_1 EXIST BY EMAIL", async () => {
//         let response = await request(app)
//             .post(authPath)
//             .send({
//                 "loginOrEmail": user_1.email,
//                 "password": user_1.password
//             })
//             .set({ Authorization: `Basic ${_encodedKey}` })
//             .expect(204);
//     })

//     it("USER_2 EXIST BY LOGIN", async () => {
//         let response = await request(app)
//             .post(authPath)
//             .send({
//                 "loginOrEmail": user_2.login,
//                 "password": user_2.password
//             })
//             .set({ Authorization: `Basic ${_encodedKey}` })
//             .expect(204);
//     })

//     it("USER_2 EXIST BY EMAIL", async () => {
//         let response = await request(app)
//             .post(authPath)
//             .send({
//                 "loginOrEmail": user_2.email,
//                 "password": user_2.password
//             })
//             .set({ Authorization: `Basic ${_encodedKey}` })
//             .expect(204);
//     })

//     it("USER_3 NOT EXIST BY LOGIN", async () => {
//         let response = await request(app)
//             .post(authPath)
//             .send({
//                 "loginOrEmail": user_3.login,
//                 "password": user_3.password
//             })
//             .set({ Authorization: `Basic ${_encodedKey}` })
//             .expect(401);
//     })
//     it("USER_3 NOT EXIST BY EMAIL", async () => {
//         let response = await request(app)
//             .post(authPath)
//             .send({
//                 "loginOrEmail": user_3.email,
//                 "password": user_3.password
//             })
//             .set({ Authorization: `Basic ${_encodedKey}` })
//             .expect(401);
//     })



//     it("DELETE #2 204", async () => {
//         let response = await request(app)
//             .delete(`${UsersPath}/${availableId.pop()}`)
//             .set(_authorization)
//             .expect(204);
//     })

//     it("USER_2 NOT EXIST BY LOGIN", async () => {
//         let response = await request(app)
//             .post(authPath)
//             .send({
//                 "loginOrEmail": user_2.login,
//                 "password": user_2.password
//             })
//             .set({ Authorization: `Basic ${_encodedKey}` })
//             .expect(401);
//     })

//     it("USER_2 NOT EXIST BY EMAIL", async () => {
//         let response = await request(app)
//             .post(authPath)
//             .send({
//                 "loginOrEmail": user_2.email,
//                 "password": user_2.password
//             })
//             .set({ Authorization: `Basic ${_encodedKey}` })
//             .expect(401);
//     })


//     it("DELETE #1 204", async () => {
//         let response = await request(app)
//             .delete(`${UsersPath}/${availableId.pop()}`)
//             .set(_authorization)
//             .expect(204);
//     })

//     it("USER_1 NOT EXIST BY LOGIN", async () => {
//         let response = await request(app)
//             .post(authPath)
//             .send({
//                 "loginOrEmail": user_1.login,
//                 "password": user_1.password
//             })
//             .set({ Authorization: `Basic ${_encodedKey}` })
//             .expect(401);
//     })

//     it("USER_1 NOT EXIST BY EMAIL", async () => {
//         let response = await request(app)
//             .post(authPath)
//             .send({
//                 "loginOrEmail": user_1.email,
//                 "password": user_1.password
//             })
//             .set({ Authorization: `Basic ${_encodedKey}` })
//             .expect(401);
//     })
// })

// describe('delete users', () => {
//     //clear all data
//     it("DELETE ALL 204", async () => {
//         await request(app).delete(TestClearAllPath).expect(204);

//         let response = await request(app).get(UsersPath).expect(200);

//         expect(response.body).toEqual(pagedStructure());
//     })

//     it('shuld delete user', async () => {
//         for (let i = 0; i < 5; i++) {
//             let response = await request(app).post(UsersPath)
//                 .send({
//                     "login": `JimLim${i}`,
//                     "password": "1234567",
//                     "email": `www.jm@gm${i}il.com`
//                 })
//                 .set({ Authorization: `Basic ${_encodedKey}` })
//                 .expect(201);
//         }



//         const rosponse = await request(app).post(UsersPath)
//             .send({
//                 "login": `JimLim`,
//                 "password": "1234567",
//                 "email": `www.jm@gmil.com`
//             })
//             .set({ Authorization: `Basic ${_encodedKey}` })
//             .expect(201);

//         let length_1 = (await request(app).get(UsersPath)).body.items?.length;

//         const user = rosponse.body
//         //
//         await request(app)
//             .delete(`${UsersPath}/${user.id}`)
//             .set(_authorization)
//             .expect(204);

//         let responseAllUsers = await request(app).get(`${UsersPath}?pageSize=50`).expect(200);

//         expect(responseAllUsers.body.items).toHaveLength(length_1 - 1)
//     })
// })
