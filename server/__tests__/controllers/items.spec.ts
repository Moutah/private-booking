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
      testServerErrorHandling("GET", "/api/items", Item, "find")
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

  // *** Get

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

    it(
      "can handle server error",
      testServerErrorHandling("GET", "/api/items/test-item", Item, "findBySlug")
    );

    it(
      "can handle not found",
      testNotFoundErrorHandling("GET", "/api/items/this-item-does-not-exist")
    );

    it("can get item", async () => {
      // run a request that will not found
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
    let testItem: IItem;
    beforeAll(async () => {
      testItem = new Item({ name: "test item", slug: "test-item" });
      await testItem.save();
    });
    afterAll(async () => {
      await Item.deleteMany({ name: "test item" });
    });

    it(
      "can handle server error",
      testServerErrorHandling(
        "POST",
        "/api/items/test-item",
        Item,
        "findBySlug"
      )
    );

    it(
      "can handle not found",
      testNotFoundErrorHandling("POST", "/api/items/this-item-does-not-exist")
    );

    it("can update item", async () => {
      // run a request that will not found
      const response = await supertest(server.server)
        .post("/api/items/test-item")
        .send({
          description: "new value",
          address: {
            street: "new value",
            city: "new value",
            zip: "new value",
            country: "new value",
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
      expect(dbItem.address.lat).toBe(testItem.address.lat); // untouched
      expect(dbItem.address.long).toBe(testItem.address.long); // untouched
      expect(dbItem.equipments.join(",")).toBe("new value");

      // validate field protection
      expect(dbItem.name).not.toBe("new value");
    });

    it("can update item address partially", async () => {
      // run a request that will not found
      const response = await supertest(server.server)
        .post("/api/items/test-item")
        .send({
          address: {
            lat: 1,
            long: 2,
          },
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
      expect(dbItem.address.lat).toBe(1);
      expect(dbItem.address.long).toBe(2);
    });
  });

  // *** Remove

  describe("remove", () => {
    // create a model we'll work with
    let testItem: IItem;
    beforeAll(async () => {
      testItem = new Item({ name: "test item", slug: "test-item" });
      await testItem.save();
    });

    it(
      "can handle server error",
      testServerErrorHandling(
        "POST",
        "/api/items/test-item/delete",
        Item,
        "findBySlug"
      )
    );

    it(
      "can handle not found",
      testNotFoundErrorHandling(
        "POST",
        "/api/items/this-item-does-not-exist/delete"
      )
    );

    it("can delete item", async () => {
      // run a request that will not found
      const response = await supertest(server.server)
        .post("/api/items/test-item/delete")
        .trustLocalhost();
      expect(response.status).toBe(200);
      expect(response.body).toStrictEqual({});

      // check item is not in database anymore
      const dbItem = await Item.findById(testItem._id);
      expect(dbItem).toBe(null);
    });
  });
});
