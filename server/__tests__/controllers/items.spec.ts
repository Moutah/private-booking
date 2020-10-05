import supertest from "supertest";
import * as server from "../../src/server";
import Item, { IItem } from "../../src/models/Item";

describe("Items", () => {
  beforeAll(server.setup);
  afterAll(server.stop);

  describe("index", () => {
    it("can handle server error", async () => {
      // hijack Item.find to have a server error and console.log to mute
      jest.spyOn(Item, "find").mockImplementationOnce(() => {
        throw new Error("server error");
      });
      jest.spyOn(console, "log").mockImplementationOnce(() => {});

      // run a request that will fail
      const response = await supertest(server.server)
        .get("/api/items")
        .trustLocalhost();
      expect(response.status).toBe(500);
    });

    it("can return list of items", async () => {
      // get items
      const response = await supertest(server.server)
        .get("/api/items")
        .trustLocalhost();
      expect(response.status).toBe(200);
    });
  });

  describe("insert", () => {
    // cleanup inserted items
    afterAll(async () => {
      await Item.deleteMany({ name: "item name" });
    });

    it("won't store invalid request", async () => {
      // run a request with invalid body
      const response = await supertest(server.server)
        .post("/api/items")
        .send({ name: undefined })
        .trustLocalhost();

      // response is failure
      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        errors: [
          { message: "Item name required", type: "required", path: "name" },
          {
            message: "Path `slug` is required.",
            path: "slug",
            type: "required",
            value: "",
          },
        ],
      });
    });

    it("can store valid request", async () => {
      // run a request with valid body
      const response = await supertest(server.server)
        .post("/api/items")
        .send({ name: "item name" })
        .trustLocalhost();

      // response is successful with newly created item
      expect(response.status).toBe(201);
      expect(response.body).toBeTruthy();
      expect(response.body.name).toBe("item name");
    });

    it("handles duplicate names", async () => {
      // run a request with the same name as above
      const response = await supertest(server.server)
        .post("/api/items")
        .send({ name: "item name" })
        .trustLocalhost();

      // response is successful with incremented slug
      expect(response.status).toBe(201);
      expect(response.body.slug).toBe("item-name-1");
    });

    it("handles non continuous duplicate names", async () => {
      // tweak database
      const newItem = new Item({ name: "item name", slug: "item-name" });
      newItem.save();
      Item.findOneAndDelete({ slug: "item-name-1" });

      // run a request with the same name as above
      const response = await supertest(server.server)
        .post("/api/items")
        .send({ name: "item name" })
        .trustLocalhost();

      // response is successful with incremented slug
      expect(response.status).toBe(201);
      expect(response.body.slug).toBe("item-name-3");
    });
  });

  describe("get", () => {
    // create and cleanup a model we'll work with
    let testItem: IItem;
    beforeAll(async () => {
      testItem = new Item({ name: "test item", slug: "test-item" });
      await testItem.save();
    });
    afterAll(async () => {
      await Item.deleteMany({ name: "test item" });
    });

    it("can handle server error", async () => {
      // hijack Item.findBySlug to have a server error and console.log to mute
      jest.spyOn(Item, "findBySlug").mockImplementationOnce(() => {
        throw new Error("server error");
      });
      jest.spyOn(console, "log").mockImplementationOnce(() => {});

      // run a request that will fail
      const response = await supertest(server.server)
        .get("/api/items/test-item")
        .trustLocalhost();
      expect(response.status).toBe(500);
    });

    it("can handle not found", async () => {
      // run a request that will not found
      const response = await supertest(server.server)
        .get("/api/items/this-item-does-not-exist")
        .trustLocalhost();
      expect(response.status).toBe(404);
      expect(response.body).toBe("Not found");
    });

    it("can get item", async () => {
      // run a request that will not found
      const response = await supertest(server.server)
        .get("/api/items/test-item")
        .trustLocalhost();
      expect(response.status).toBe(200);
      expect(response.body._id).toBe(testItem._id.toHexString());
    });
  });
});
