import supertest from "supertest";
import * as server from "../../src/server";
import Item, { IItem } from "../../src/models/Item";
import { testNotFoundErrorHandling, testServerErrorHandling } from "./utils";

describe("Items", () => {
  beforeAll(server.setup);
  afterAll(server.stop);

  // *** Index

  describe("index", () => {
    it(
      "can handle server error",
      testServerErrorHandling("/api/items", Item, "find")
    );

    it("can return list of items", async () => {
      // get items
      const response = await supertest(server.server)
        .get("/api/items")
        .trustLocalhost();
      expect(response.status).toBe(200);
    });
  });

  // *** Insert

  describe("insert", () => {
    // cleanup inserted items
    afterAll(async () => {
      await Item.deleteMany({});
    });

    it("won't store invalid request", async () => {
      // run a request with invalid body
      const response = await supertest(server.server)
        .post("/api/items")
        .send({ name: undefined })
        .trustLocalhost();

      // response is failure
      expect(response.status).toBe(422);
      expect(response.body).toMatchObject({
        errors: [
          { message: "Item name is required.", type: "required", path: "name" },
          {
            message: "Item slug is required.",
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

  // *** Get

  describe("get", () => {
    // create and cleanup a model we'll work with
    let testItem = new Item({ name: "test item", slug: "test-item" });
    beforeAll(async () => await testItem.save());
    afterAll(async () => await Item.deleteMany({}));

    it(
      "can handle server error",
      testServerErrorHandling("/api/items/test-item", Item, "findBySlug")
    );

    it(
      "can handle not found",
      testNotFoundErrorHandling("GET", "/api/items/this-item-does-not-exist")
    );

    it("can get item", async () => {
      // run a request that will work
      const response = await supertest(server.server)
        .get("/api/items/test-item")
        .trustLocalhost();
      expect(response.status).toBe(200);
      expect(response.body._id).toBe(testItem._id.toHexString());
    });
  });

  // *** Update

  describe("update", () => {
    // create and cleanup a model we'll work with
    let testItem = new Item({ name: "test item", slug: "test-item" });
    beforeAll(async () => await testItem.save());
    afterAll(async () => await Item.deleteMany({}));

    it("can handle server error", async () => {
      // hijack Item.findBySlug to have a server error
      jest.spyOn(Item, "findBySlug").mockImplementationOnce(
        (slug: string): Promise<IItem> =>
          new Promise((resolve, reject) => {
            let item = new Item();
            item.save = () => {
              throw new Error("TEST server error");
            };
            resolve(item);
          })
      );

      // mute console
      jest.spyOn(console, "error").mockImplementationOnce(() => {});

      // run a request that will fail
      const response = await supertest(server.server)
        .patch("/api/items/test-item")
        .trustLocalhost();
      expect(response.status).toBe(500);
    });

    it(
      "can handle not found",
      testNotFoundErrorHandling("PATCH", "/api/items/this-item-does-not-exist")
    );

    it("can update item", async () => {
      // run a request that will work
      const response = await supertest(server.server)
        .patch("/api/items/test-item")
        .send({
          description: "new value",
          address: {
            street: "new value",
            city: "new value",
            zip: "new value",
            country: "new value",
            lat: 1,
            long: 2,
          },
          equipments: ["new value"],
          name: "new value",
        })
        .trustLocalhost();
      expect(response.status).toBe(200);
      expect(response.body).toStrictEqual({});

      // get item from db
      const dbItem = await Item.findById(testItem._id);

      if (!dbItem) {
        throw new Error("Could not find test item in database anymore");
      }

      // validate changes
      expect(dbItem.description).toBe("new value");
      expect(dbItem.address.street).toBe("new value");
      expect(dbItem.address.city).toBe("new value");
      expect(dbItem.address.zip).toBe("new value");
      expect(dbItem.address.country).toBe("new value");
      expect(dbItem.address.lat).toBe(1);
      expect(dbItem.address.long).toBe(2);
      expect(dbItem.equipments.join(",")).toBe("new value");

      // validate field protection
      expect(dbItem.name).not.toBe("new value");
    });

    it("can update item address partially", async () => {
      // run a request that will work
      let response = await supertest(server.server)
        .patch("/api/items/test-item")
        .send({
          address: {
            lat: 11,
            long: 22,
          },
        })
        .trustLocalhost();
      expect(response.status).toBe(200);
      expect(response.body).toStrictEqual({});

      // get item from db
      let dbItem = await Item.findById(testItem._id);

      if (!dbItem) {
        throw new Error("Could not find test item in database anymore");
      }

      // validate changes
      expect(dbItem.address.street).toBe("new value");
      expect(dbItem.address.city).toBe("new value");
      expect(dbItem.address.zip).toBe("new value");
      expect(dbItem.address.country).toBe("new value");
      expect(dbItem.address.lat).toBe(11);
      expect(dbItem.address.long).toBe(22);
      expect(dbItem.equipments.join(",")).toBe("");

      // run a request that will work
      response = await supertest(server.server)
        .patch("/api/items/test-item")
        .send({
          address: {
            street: "da street",
          },
        })
        .trustLocalhost();
      expect(response.status).toBe(200);
      expect(response.body).toStrictEqual({});

      // get item from db
      dbItem = await Item.findById(testItem._id);

      if (!dbItem) {
        throw new Error("Could not find test item in database anymore");
      }

      // validate changes
      expect(dbItem.address.street).toBe("da street");
      expect(dbItem.address.city).toBe("new value");
      expect(dbItem.address.zip).toBe("new value");
      expect(dbItem.address.country).toBe("new value");
      expect(dbItem.address.lat).toBe(11);
      expect(dbItem.address.long).toBe(22);
      expect(dbItem.equipments.join(",")).toBe("");
    });

    it("can update item without address", async () => {
      // run a request that will work
      const response = await supertest(server.server)
        .patch("/api/items/test-item")
        .send({
          description: "new desc",
        })
        .trustLocalhost();
      expect(response.status).toBe(200);
      expect(response.body).toStrictEqual({});

      // get item from db
      const dbItem = await Item.findById(testItem._id);

      if (!dbItem) {
        throw new Error("Could not find test item in database anymore");
      }

      // validate changes
      expect(dbItem.description).toBe("new desc");
      expect(dbItem.address.street).toBe("da street");
      expect(dbItem.address.city).toBe("new value");
      expect(dbItem.address.zip).toBe("new value");
      expect(dbItem.address.country).toBe("new value");
      expect(dbItem.address.lat).toBe(11);
      expect(dbItem.address.long).toBe(22);
      expect(dbItem.equipments.join(",")).toBe("");
    });
  });

  // *** Remove

  describe("remove", () => {
    // create a model we'll work with
    let testItem = new Item({ name: "test item", slug: "test-item" });
    beforeAll(async () => await testItem.save());

    it("can handle server error", async () => {
      // hijack Item.findBySlug to have a server error
      jest.spyOn(Item, "findBySlug").mockImplementationOnce(
        (slug: string): Promise<IItem> =>
          new Promise((resolve, reject) => {
            let item = new Item();
            item.remove = () => {
              throw new Error("TEST server error");
            };
            resolve(item);
          })
      );

      // mute console
      jest.spyOn(console, "error").mockImplementationOnce(() => {});

      // run a request that will fail
      const response = await supertest(server.server)
        .delete("/api/items/test-item")
        .trustLocalhost();
      expect(response.status).toBe(500);
    });

    it(
      "can handle not found",
      testNotFoundErrorHandling("DELETE", "/api/items/this-item-does-not-exist")
    );

    it("can delete item", async () => {
      // run a request that will work
      const response = await supertest(server.server)
        .delete("/api/items/test-item")
        .trustLocalhost();
      expect(response.status).toBe(200);
      expect(response.body).toStrictEqual({});

      // check item is not in database anymore
      const dbItem = await Item.findById(testItem._id);
      expect(dbItem).toBe(null);
    });
  });
});
