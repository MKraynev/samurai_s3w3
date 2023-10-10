import request from "supertest"
import { BlogsPath, TestClearAllPath, app } from "../../src/app"
import { Base64 } from "../../src/Common/Authentication/Base64";





export const _encodedKey = Base64.Encode64("admin:qwerty");
const blogCompleteStructure = {
    name: expect.any(String),
    description: expect.any(String),
    websiteUrl: expect.any(String),
    id: expect.any(String),
    createdAt: expect.any(String),
    isMembership: false
};
export const pagedStructure = (...someObj: any) => {
    return {
        page: expect.any(Number),
        pageSize: expect.any(Number),
        pagesCount: expect.any(Number),
        totalCount: expect.any(Number),
        items: someObj ? [...someObj] : []
    }

}

let availableIds: Array<string> = [];

describe("Blogs test", () => {



    it("DELETE ALL 204", async () => {
        await request(app).delete(TestClearAllPath).expect(204);

        let response = await request(app).get(BlogsPath).expect(200);

        expect(response.body).toEqual(pagedStructure());
    })

    it("POST #1 201", async () => {
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
        if (response.body) {
            availableIds.push(response.body.id)
        }
    })

    

    it("GET 200", async () => {
        let response = await request(app).get(BlogsPath).expect(200);

        expect(response.body).toEqual(pagedStructure({
            id: expect.any(String),
            "name": "Elon Mask",
            "description": "I did another stupid thing",
            "websiteUrl": "www.elonmelon.com",
            createdAt: expect.any(String),
            isMembership: false
        }))
    })

    it("POST #2 201", async () => {
        let response = await request(app).post(BlogsPath)
            .send({
                "name": "Hanna Montana",
                "description": "some description",
                "websiteUrl": "www.someadress.com"
            })
            .set({ Authorization: `Basic ${_encodedKey}` })
            .expect(201);

        expect(response.body).toEqual({
            id: expect.any(String),
            "name": "Hanna Montana",
            "description": "some description",
            "websiteUrl": "www.someadress.com",
            createdAt: expect.any(String),
            isMembership: false
        })
        if (response.body) {
            availableIds.push(response.body.id)
        }

    })

    it(`GET ID 200`, async () => {
        let resp_1 = await request(app).get(`${BlogsPath}/${availableIds[0]}`).expect(200);
        expect(resp_1.body).toEqual(blogCompleteStructure)
    })


    it("POST 401 NO AUTH", async () => {
        let response = await request(app).post(BlogsPath).send({
            "name": "Elon Mask",
            "description": "I did another stupid thing",
            "websiteUrl": "www.elonmelon.com"
        }).expect(401);
    })

    it("POST 401 WRONG AUTH", async () => {
        let response = await request(app)
            .post(BlogsPath)
            .set({ Authorization: `Bosic ${12345}` })
            .send({
                "name": "Elon Mask",
                "description": "I did another stupid thing",
                "websiteUrl": "www.elonmelon.com"
            }).expect(401);
    })


    it("POST 400 WRONG FIELD NAME(name)", async () => {
        let response = await request(app).post(BlogsPath)
            .set({ Authorization: `Basic ${_encodedKey}` })
            .send({
                "nam": "somename",
                "websiteUrl": "invalid-url",
                "description": "description"
            })
            .expect(400);
        expect(response.body).toEqual({
            errorsMessages: [{
                field: expect.any(String),
                message: expect.any(String)
            },
            {
                field: expect.any(String),
                message: expect.any(String)
            }]

        })
    });

    it("POST 400 WRONG FIELD NAME(description)", async () => {
        let response = await request(app).post(BlogsPath)
            .set({ Authorization: `Basic ${_encodedKey}` })
            .send({
                "name": "Elon Mask",
                "descption": "I did another stupid thing",
                "websiteUrl": "www.elonmelon.com"
            }).expect(400);
        expect(response.body).toEqual({
            errorsMessages: [{
                field: expect.any(String),
                message: expect.any(String)
            }]

        })
    })
    it("POST 400 WRONG FIELD NAME(Url)", async () => {
        let response = await request(app).post(BlogsPath)
            .set({ Authorization: `Basic ${_encodedKey}` })
            .send({
                "name": "Elon Mask",
                "description": "I did another stupid thing",
                "websitUrl": "www.elonmelon.com"
            }).expect(400);

        expect(response.body).toEqual({
            errorsMessages: [{
                field: expect.any(String),
                message: expect.any(String)
            }]

        })
    })

    it("POST 400 EMPY BODY", async () => {
        let response = await request(app).post(BlogsPath)
            .set({ Authorization: `Basic ${_encodedKey}` })
            .send().expect(400);

        expect(response.body).toEqual({
            errorsMessages: [{
                field: expect.any(String),
                message: expect.any(String)
            },
            {
                field: expect.any(String),
                message: expect.any(String)
            },
            {
                field: expect.any(String),
                message: expect.any(String)
            }]

        })
    })

    it("PUT 204", async () => {
        let response = await request(app).put(`${BlogsPath}/${availableIds[0]}`)
            .set({ Authorization: `Basic ${_encodedKey}` })
            .send({
                "name": "Jim Beam",
                "description": "Hello there",
                "websiteUrl": "www.elonmelon.com"
            }).expect(204);
    })

    it("PUT 401 NO AUTH", async () => {
        let response = await request(app)
            .put(`${BlogsPath}/1`)
            .send({
                "name": "Elon Mask",
                "description": "I did another stupid thing",
                "websiteUrl": "www.elonmelon.com"
            }).expect(401);
    })
    it("PUT 401 WRONG AUTH", async () => {
        let response = await request(app)
            .put(`${BlogsPath}/1`)
            .set({ Authorization: `Basic ${5678456}` })
            .send({
                "name": "Elon Mask",
                "description": "I did another stupid thing",
                "websiteUrl": "www.elonmelon.com"
            }).expect(401);
    })

    it("PUT 400 WRONG FIELD NAME(name)", async () => {
        let response = await request(app)
            .put(`${BlogsPath}/1`)
            .set({ Authorization: `Basic ${_encodedKey}` })
            .send({
                "ame": "Elon Mask",
                "description": "I did another stupid thing",
                "websiteUrl": "www.elonmelon.com"
            }).expect(400);
    })
    it("PUT 400 WRONG FIELD NAME(description)", async () => {
        let response = await request(app)
            .put(`${BlogsPath}/1`)
            .set({ Authorization: `Basic ${_encodedKey}` })
            .send({
                "name": "Elon Mask",
                "desiptin": "I did another stupid thing",
                "websiteUrl": "www.elonmelon.com"
            }).expect(400);
    })
    it("PUT 400 WRONG FIELD NAME(Url)", async () => {
        let response = await request(app)
            .put(`${BlogsPath}/1`)
            .set({ Authorization: `Basic ${_encodedKey}` })
            .send({
                "name": "Elon Mask",
                "description": "I did another stupid thing",
                "Url": "www.elonmelon.com"
            }).expect(400);
    })
    it("PUT 400 EMPTY BODY", async () => {
        let response = await request(app)
            .put(`${BlogsPath}/1`)
            .set({ Authorization: `Basic ${_encodedKey}` })
            .send()
            .expect(400);
    })

    // it("DELETE 204", async () => {
    //     let response = await request(app)
    //         .delete(`${BlogsPath}/${availableIds.pop()}`)
    //         .set({ Authorization: `Basic ${_encodedKey}` })
    //         .expect(204);
    // })

    it("DELETE 404 NOT SUPPORTED ID", async () => {
        let response = await request(app)
            .delete(`${BlogsPath}/1000`)
            .set({ Authorization: `Basic ${_encodedKey}` })
            .expect(404);
    })
    it("DELETE 401 NO AUTH", async () => {
        let response = await request(app)
            .delete(`${BlogsPath}/1`)
            .expect(401);
    })
})