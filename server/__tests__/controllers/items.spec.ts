import fs from "fs";
import supertest from "supertest";
import * as server from "../../src/server";
import Item, { IItem } from "../../src/models/Item";
import { testNotFoundErrorHandling, testServerErrorHandling } from "./utils";
import User, { IUser } from "../../src/models/User";

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
        .set("Authorization", "Bearer " + process.env.TEST_TOKEN)
        .trustLocalhost();
      expect(response.status).toBe(200);
    });
  });

  // *** Insert

  describe("insert", () => {
    // create test user
    let testUser: IUser;
    beforeAll(async () => {
      testUser = new User({
        name: "test user",
        email: "test@mail.com",
        password: "lol-password",
      });
      await testUser.save();
    });

    // cleanup inserted items
    afterAll(async () => {
      await testUser.remove();
      await Item.deleteMany({});
    });

    it("won't store invalid request", async () => {
      // run a request with invalid body
      const response = await supertest(server.server)
        .post("/api/items")
        .set("Authorization", "Bearer " + testUser.createJWT())
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
        .set("Authorization", "Bearer " + testUser.createJWT())
        .send({ name: "item name" })
        .trustLocalhost();

      // response is successful with newly created item
      expect(response.status).toBe(201);
      expect(response.body).toBeTruthy();
      expect(response.body.name).toBe("item name");
      expect(response.body.owner).toBe(testUser._id.toHexString());
      expect(response.body.managers).toStrictEqual([
        testUser._id.toHexString(),
      ]);

      // reload testUser
      testUser = (await User.findById(testUser._id.toHexString())) as IUser;
      expect(testUser.items.map((id) => id.toHexString())).toEqual([
        response.body._id,
      ]);
    });

    it("handles duplicate names", async () => {
      // run a request with the same name as above
      const response = await supertest(server.server)
        .post("/api/items")
        .set("Authorization", "Bearer " + testUser.createJWT())
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
        .set("Authorization", "Bearer " + testUser.createJWT())
        .send({ name: "item name" })
        .trustLocalhost();

      // response is successful with incremented slug
      expect(response.status).toBe(201);
      expect(response.body.slug).toBe("item-name-3");
    });

    it("can handle images upload", async () => {
      // run a request with valid body
      const response = await supertest(server.server)
        .post("/api/items")
        .set("Authorization", "Bearer " + testUser.createJWT())
        .field("name", "Le item with images")
        .attach("images", "__tests__/images/lol.jpg")
        .trustLocalhost();

      // response is successful with newly created post
      expect(response.status).toBe(201);
      expect(response.body).toBeTruthy();
      expect(response.body.name).toBe("Le item with images");
      expect(response.body.images).toStrictEqual([
        `/images/${response.body.slug}/lol.jpg`,
      ]);

      // cleanup
      fs.rmdirSync(`../storage/${response.body.slug}`, { recursive: true });
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
        .set("Authorization", "Bearer " + process.env.TEST_TOKEN)
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
        .set("Authorization", "Bearer " + process.env.TEST_TOKEN)
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
        .set("Authorization", "Bearer " + process.env.TEST_TOKEN)
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
        .set("Authorization", "Bearer " + process.env.TEST_TOKEN)
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
        .set("Authorization", "Bearer " + process.env.TEST_TOKEN)
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
        .set("Authorization", "Bearer " + process.env.TEST_TOKEN)
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

    it("can handle images upload", async () => {
      // run a request with valid body
      const response = await supertest(server.server)
        .patch("/api/items/test-item")
        .set("Authorization", "Bearer " + process.env.TEST_TOKEN)
        .attach("images", "__tests__/images/lol.jpg")
        .trustLocalhost();

      // response is successful with newly created post
      expect(response.status).toBe(200);
      expect(response.body).toStrictEqual({});

      // get item from db
      const dbItem = await Item.findById(testItem._id);

      if (!dbItem) {
        throw new Error("Could not find test item in database anymore");
      }

      // validate changes
      expect(dbItem.images.join(",")).toBe(`/images/${dbItem.slug}/lol.jpg`);

      // cleanup
      fs.rmdirSync(`../storage/${dbItem.slug}`, { recursive: true });
    });
  });

  // *** Unregister

  describe("Unregister", () => {
    let owner: IUser;
    let manager: IUser;
    let user: IUser;
    let troublemaker: IUser;
    let testItem: IItem;

    // create objects
    beforeAll(async () => {
      owner = new User({
        name: "Item's owner",
        email: "owner@mail.com",
        password: "lol-password",
      });

      manager = new User({
        name: "Item manager",
        email: "manager@mail.com",
        password: "lol-password",
      });

      user = new User({
        name: "Item user",
        email: "user@mail.com",
        password: "lol-password",
      });

      troublemaker = new User({
        name: "Troublemaker user",
        email: "troublemaker@mail.com",
        password: "lol-password",
      });

      testItem = new Item({
        name: "test item",
        slug: "test-item",
        owner: owner._id,
        managers: [owner._id, manager._id],
      });

      // register item to users
      owner.items.push(testItem._id);
      manager.items.push(testItem._id);
      user.items.push(testItem._id);
      troublemaker.items.push(testItem._id);

      await owner.save();
      await manager.save();
      await user.save();
      await troublemaker.save();
      await testItem.save();
    });

    // cleanup inserted items
    afterAll(async () => {
      await owner.remove();
      await manager.remove();
      await user.remove();
      await troublemaker.remove();
      await Item.deleteMany({});
    });

    it("will not unregister item's owner", async () => {
      // run a request that will be forbidden
      const response = await supertest(server.server)
        .post("/api/items/test-item/unregister")
        .set("Authorization", "Bearer " + owner.createJWT())
        .trustLocalhost();
      expect(response.status).toBe(403);

      // reload owner
      owner = (await User.findById(owner._id.toHexString())) as IUser;

      // check he's still bound to item
      expect(
        owner.items.some((itemId) => itemId.toHexString() == testItem._id)
      ).toBe(true);
    });

    it("can unregister requestor from item", async () => {
      // run a request that will be work
      const response = await supertest(server.server)
        .post("/api/items/test-item/unregister")
        .set("Authorization", "Bearer " + manager.createJWT())
        .trustLocalhost();
      expect(response.status).toBe(200);

      // reload manager and item
      testItem = (await Item.findById(testItem._id.toHexString())) as IItem;
      manager = (await User.findById(manager._id.toHexString())) as IUser;

      // check manager is not bound to item anymore
      expect(
        manager.items.some((itemId) => itemId.toHexString() == testItem._id)
      ).toBe(false);

      // check he's not manager of item anymore
      expect(testItem.managers.some((userId) => userId == manager._id)).toBe(
        false
      );
    });

    it("will not ban user if not requested by item's manager", async () => {
      // run a request that will be forbidden
      const response = await supertest(server.server)
        .post(`/api/items/test-item/ban/${user._id.toHexString()}`)
        .set("Authorization", "Bearer " + troublemaker.createJWT())
        .trustLocalhost();
      expect(response.status).toBe(403);

      // reload user
      user = (await User.findById(user._id.toHexString())) as IUser;

      // check he's still bound to item
      expect(
        user.items.some((itemId) => itemId.toHexString() == testItem._id)
      ).toBe(true);
    });

    it("can ban user from item", async () => {
      // run a request that will be forbidden
      const response = await supertest(server.server)
        .post(`/api/items/test-item/ban/${troublemaker._id.toHexString()}`)
        .set("Authorization", "Bearer " + owner.createJWT())
        .trustLocalhost();
      expect(response.status).toBe(200);

      // reload troublemaker
      troublemaker = (await User.findById(
        troublemaker._id.toHexString()
      )) as IUser;

      // check he's not bound to item anymore
      expect(
        troublemaker.items.some(
          (itemId) => itemId.toHexString() == testItem._id
        )
      ).toBe(false);
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
        .set("Authorization", "Bearer " + process.env.TEST_TOKEN)
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
        .set("Authorization", "Bearer " + process.env.TEST_TOKEN)
        .trustLocalhost();
      expect(response.status).toBe(200);
      expect(response.body).toStrictEqual({});

      // check item is not in database anymore
      const dbItem = await Item.findById(testItem._id);
      expect(dbItem).toBe(null);
    });
  });
});
