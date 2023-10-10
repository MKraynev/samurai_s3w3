import request from "supertest"
import { TestClearAllPath, app } from "../../src/app"
import { pagedStructure } from "./BlogsRouter.tests";
import { Base64 } from "../../src/Common/Authentication/Admin/Base64";



const _encodedKey = Base64.Encode64("admin:qwerty");
const postCompleteStructure = {
    title: expect.any(String),
    shortDescription: expect.any(String),
    content: expect.any(String),
    blogId: expect.any(String),
    blogName: expect.any(String),
    id: expect.any(String),
    createdAt: expect.any(String)
};
let availableBlogIds: Array<string> = [];
let availablePostIds: Array<string> = [];

const PostRequestData = {
    title: "Default Title",
    shortDescription: "Default Description",
    content: "Default content",
    blogId: ""
}

const authData = `Basic ${_encodedKey}`;
const _authorization = { Authorization: authData };


describe("Posts test", () => {
    it("DELETE ALL 204", async () => {
        await request(app).delete(TestClearAllPath).expect(204);

        let response = await request(app).get(PostsPath).expect(200);

        expect(response.body).toEqual(pagedStructure());
    })

    it("GET 200", async () => {
        let response = await request(app).get(PostsPath).expect(200);

        expect(response.body).toEqual(pagedStructure())
    })


    it("POST Blog 201", async () => {
        let response = await request(app).post(BlogsPath)
            .send({
                "name": "Elon Mask",
                "description": "I did another stupid thing",
                "websiteUrl": "www.elonmelon.com"
            })
            .set({ Authorization: `Basic ${_encodedKey}` })
            .expect(201);

        expect(response.body).toEqual({
            id: expect.any(String),
            "name": "Elon Mask",
            "description": "I did another stupid thing",
            "websiteUrl": "www.elonmelon.com",
            createdAt: expect.any(String),
            isMembership: false
        })

        availableBlogIds.push(response.body.id)
        PostRequestData.blogId = availableBlogIds[0];
    })

    it("GET 404 STRING ID", async () => {
        let resp_2 = await request(app).get(`${PostsPath}/sdfs`).expect(404);
    })
    it("GET 404 NOT SUPPORTED ID", async () => {
        let resp_2 = await request(app).get(`${PostsPath}/10000`).expect(404);
    })

    it("POST 201", async () => {
        let response = await request(app)
            .post(PostsPath)
            .send(PostRequestData)
            .set(_authorization);

        console.log(PostRequestData);

        expect(response.body).toEqual(postCompleteStructure);

        availablePostIds.push(response.body.id);
    })

    it("POST 401 NO AUTH", async () => {
        let response = await request(app).post(PostsPath).send(PostRequestData).expect(401);
    })
    it("POST 401 WRONG AUTH", async () => {
        let response = await request(app)
            .post(PostsPath)
            .set({ Authorization: `Basic ${5678456}` })
            .send(PostRequestData)
            .expect(401);
    })

    it("POST 400 EMPY BODY", async () => {
        await request(app).post(PostsPath)
            .set(_authorization)
            .send().expect(400);
    })

    it("PUT 204", async () => {
        let response = await request(app).put(`${PostsPath}/${availablePostIds[0]}`)
            .set(_authorization)
            .send(PostRequestData)
            .expect(204);
    })

    it("PUT 401 NO AUTH", async () => {
        let response = await request(app)
            .put(`${PostsPath}/1`)
            .send(PostRequestData)
            .expect(401);
    })
    it("PUT 401 WRONG AUTH", async () => {
        let response = await request(app)
            .put(`${PostsPath}/1`)
            .set({ Authorization: `Basic ${5678456}` })
            .send(PostRequestData)
            .expect(401);
    })
    it("PUT 400 EMPTY BODY", async () => {
        let response = await request(app)
            .put(`${PostsPath}/1`)
            .set(_authorization)
            .send()
            .expect(400);
    })

    it("DELETE 204", async () => {
        let response = await request(app)
            .delete(`${PostsPath}/${availablePostIds[0]}`)
            .set(_authorization)
            .expect(204);
    })

    it("DELETE 404 NOT SUPPORTED ID", async () => {
        let response = await request(app)
            .delete(`${PostsPath}/1000`)
            .set(_authorization)
            .expect(404);
    })
    it("DELETE 401 NO AUTH", async () => {
        let response = await request(app)
            .delete(`${PostsPath}/1`)
            .expect(401);
    })



})