import fs from "fs";
import supertest from "supertest";
import * as server from "../../src/server";
import Post from "../../src/models/Post";
import Item from "../../src/models/Item";
import {
  mockFindById,
  testNotFoundErrorHandling,
  testServerErrorHandling,
} from "./utils";

describe("Posts", () => {
  let item = new Item({ name: "base item posts", slug: "base-item-posts" });
  const baseUrl = `/api/items/${item.slug}`;

  beforeAll(async () => {
    await server.setup();
    await item.save();
  });
  afterAll(async () => {
    await item.remove();
    await server.stop();
  });

  // *** Index

  describe("index", () => {
    it(
      "can handle server error",
      testServerErrorHandling(`${baseUrl}/posts`, Post, "find")
    );

    it("can return list of posts", async () => {
      // get posts
      const response = await supertest(server.server)
        .get(`${baseUrl}/posts`)
        .set("Authorization", "Bearer " + process.env.TEST_TOKEN)
        .trustLocalhost();
      expect(response.status).toBe(200);
    });
  });

  // *** Insert

  describe("insert", () => {
    // cleanup inserted posts
    afterAll(async () => {
      await Post.deleteMany({});
    });

    it("won't store invalid request", async () => {
      // run a request with invalid body
      const response = await supertest(server.server)
        .post(`${baseUrl}/posts`)
        .set("Authorization", "Bearer " + process.env.TEST_TOKEN)
        .send({ message: undefined })
        .trustLocalhost();

      // response is failure
      expect(response.status).toBe(422);
      expect(response.body).toMatchObject({
        errors: [
          {
            message: "Post message is required.",
            type: "required",
            path: "message",
          },
        ],
      });
    });

    it("can store valid request", async () => {
      // run a request with valid body
      const response = await supertest(server.server)
        .post(`${baseUrl}/posts`)
        .set("Authorization", "Bearer " + process.env.TEST_TOKEN)
        .send({ message: "Le test message" })
        .trustLocalhost();

      // response is successful with newly created post
      expect(response.status).toBe(201);
      expect(response.body).toBeTruthy();
      expect(response.body.message).toBe("Le test message");
      expect(response.body.author).toBe(process.env.TEST_USER_ID);
    });

    it("can handle images upload", async () => {
      // run a request with valid body
      const response = await supertest(server.server)
        .post(`${baseUrl}/posts`)
        .set("Authorization", "Bearer " + process.env.TEST_TOKEN)
        .field("message", "Le test post with images")
        .attach("images", "__tests__/images/lol.jpg")
        .trustLocalhost();

      // response is successful with newly created post
      expect(response.status).toBe(201);
      expect(response.body).toBeTruthy();
      expect(response.body.message).toBe("Le test post with images");
      expect(response.body.images).toStrictEqual([
        `/images/${item.slug}/lol.jpg`,
      ]);

      // cleanup
      fs.rmdirSync(`../storage/${item.slug}`, { recursive: true });
    });
  });

  // *** Get

  describe("get", () => {
    // create and cleanup a model we'll work with
    let testPost = new Post({ message: "Le test message", item: item._id });
    beforeAll(async () => {
      await testPost.save();
    });
    afterAll(async () => {
      await Post.deleteMany({});
    });

    it(
      "can handle server error",
      testServerErrorHandling(
        `${baseUrl}/posts/${testPost._id}`,
        Post,
        "findById"
      )
    );

    it(
      "can handle not found",
      testNotFoundErrorHandling(
        "GET",
        `${baseUrl}/posts/000000000000000000000000`
      )
    );

    it("can get post", async () => {
      // run a request that will work
      const response = await supertest(server.server)
        .get(`${baseUrl}/posts/${testPost._id}`)
        .set("Authorization", "Bearer " + process.env.TEST_TOKEN)
        .trustLocalhost();
      expect(response.status).toBe(200);
      expect(response.body._id).toBe(testPost._id.toHexString());
    });
  });

  // *** Update

  describe("update", () => {
    // create and cleanup a model we'll work with
    let testPost = new Post({ message: "Le test message", item: item._id });
    beforeAll(async () => {
      await testPost.save();
    });
    afterAll(async () => {
      await Post.deleteMany({});
    });

    it("can handle server error", async () => {
      // hijack post.findById to have a server error on Post.save()
      const findByIdBackup = Post.findById;
      Post.findById = mockFindById({
        save: () => {
          throw new Error("TEST server error");
        },
      });

      // mute console
      jest.spyOn(console, "error").mockImplementationOnce(() => {});

      // run a request that will fail
      const response = await supertest(server.server)
        .patch(`${baseUrl}/posts/${testPost._id}`)
        .set("Authorization", "Bearer " + process.env.TEST_TOKEN)
        .trustLocalhost();
      expect(response.status).toBe(500);

      // restore hijack
      Post.findById = findByIdBackup;
    });

    it(
      "can handle not found",
      testNotFoundErrorHandling(
        "PATCH",
        `${baseUrl}/posts/000000000000000000000000`
      )
    );

    it("can update post", async () => {
      // run a request that will work
      const now = new Date();
      const response = await supertest(server.server)
        .patch(`${baseUrl}/posts/${testPost._id}`)
        .set("Authorization", "Bearer " + process.env.TEST_TOKEN)
        .send({
          message: "new value",
          createdAt: now,
        })
        .trustLocalhost();
      expect(response.status).toBe(200);
      expect(response.body).toStrictEqual({});

      // get post from db
      const dbPost = await Post.findById(testPost._id);

      if (!dbPost) {
        throw new Error("Could not find test post in database anymore");
      }

      // validate changes
      expect(dbPost.message).toBe("new value");

      // validate field protection
      expect(dbPost.createdAt).not.toBe(now);
    });
  });

  // *** Remove

  describe("remove", () => {
    // create a model we'll work with
    let testPost = new Post({ message: "Le test message", item: item._id });
    beforeAll(async () => {
      await testPost.save();
    });

    it("can handle server error", async () => {
      // hijack post.findById to have a server error on Post.save()
      const findByIdBackup = Post.findById;
      Post.findById = mockFindById({
        remove: () => {
          throw new Error("TEST server error");
        },
      });

      // mute console
      jest.spyOn(console, "error").mockImplementationOnce(() => {});

      // run a request that will fail
      const response = await supertest(server.server)
        .delete(`${baseUrl}/posts/${testPost._id}`)
        .set("Authorization", "Bearer " + process.env.TEST_TOKEN)
        .trustLocalhost();
      expect(response.status).toBe(500);

      // restore hijack
      Post.findById = findByIdBackup;
    });

    it(
      "can handle not found",
      testNotFoundErrorHandling(
        "DELETE",
        `${baseUrl}/posts/000000000000000000000000`
      )
    );

    it("can delete post", async () => {
      // run a request that will work
      const response = await supertest(server.server)
        .delete(`${baseUrl}/posts/${testPost._id}`)
        .set("Authorization", "Bearer " + process.env.TEST_TOKEN)
        .trustLocalhost();
      expect(response.status).toBe(200);
      expect(response.body).toStrictEqual({});

      // check post is not in database anymore
      const dbPost = await Post.findById(testPost._id);
      expect(dbPost).toBe(null);
    });
  });
});
