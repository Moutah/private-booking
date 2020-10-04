import supertest from "supertest";
import * as server from "../../src/server";
import Item from "../../src/models/Item";

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
        ],
      });
    });

    it("can store valid request", async () => {
      // run a request with valid body
      const response = await supertest(server.server)
        .post("/api/items")
        .send({ name: "item name" })
        .trustLocalhost();

      // response is success with newly created item
      expect(response.status).toBe(201);
      expect(response.body).toBeTruthy();
      expect(response.body.name).toBe("item name");
    });
  });
});
