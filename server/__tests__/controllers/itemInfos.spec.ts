import supertest from "supertest";
import * as server from "../../src/server";
import Info from "../../src/models/Info";
import Item from "../../src/models/Item";
import { testNotFoundErrorHandling, testServerErrorHandling } from "./utils";

describe("Item infos", () => {
  let item = new Item({ name: "base item infos", slug: "base-item-infos" });
  const baseUrl = `/api/items/${item.slug}`;

  beforeAll(async () => {
    await server.setup();
    await item.save();
  });
  afterAll(async () => {
    await item.remove();
    await server.stop();
  });

  // *** Insert

  describe("insert", () => {
    // cleanup inserted infos
    afterAll(async () => {
      await Info.deleteMany({});
    });

    it("won't store invalid request", async () => {
      // run a request with invalid body
      const response = await supertest(server.server)
        .post(`${baseUrl}/infos`)
        .send({ message: undefined })
        .trustLocalhost();

      // response is failure
      expect(response.status).toBe(422);
      expect(response.body).toMatchObject({
        errors: [
          {
            message: "Info message is required.",
            type: "required",
            path: "message",
          },
          {
            message: "Info title is required.",
            type: "required",
            path: "title",
          },
        ],
      });
    });

    it("can store valid request", async () => {
      // run a request with valid body
      const response = await supertest(server.server)
        .post(`${baseUrl}/infos`)
        .send({ title: "Le test title", message: "Le test message" })
        .trustLocalhost();

      // response is successful with newly created info
      expect(response.status).toBe(201);
      const lastInfo = response.body.infos[response.body.infos.length - 1];
      expect(lastInfo).toBeTruthy();
      expect(lastInfo.title).toBe("Le test title");
      expect(lastInfo.message).toBe("Le test message");
    });
  });

  // *** Update

  describe("update", () => {
    // create and cleanup a model we'll work with
    let testInfo = new Info({
      title: "Le test title",
      message: "Le test message",
      _id: "000000000000000000000001",
    });
    beforeAll(async () => {
      item.infos.push(testInfo);
      await item.save();
    });
    afterAll(async () => {
      await item.infos.id(testInfo._id).remove();
      await item.save();
    });

    it("can handle server error", async () => {
      // hijack Item.findBySlug to have a server error on Item.save()
      const findBySlugBackup = Item.findBySlug;
      Item.findBySlug = jest.fn().mockResolvedValueOnce(
        new Promise((resolve, reject) => {
          resolve({
            save: () => {
              throw new Error("TEST server error");
            },
          });
        })
      );

      // mute console
      jest.spyOn(console, "error").mockImplementationOnce(() => {});

      // run a request that will fail
      const response = await supertest(server.server)
        .patch(`${baseUrl}/infos/${testInfo._id}`)
        // we need to send a body because the error will come after info creation
        .send({
          title: "Le new test title",
          message: "Le new test message",
        })
        .trustLocalhost();
      expect(response.status).toBe(500);

      // restore hijack
      Item.findBySlug = findBySlugBackup;
    });

    it(
      "can handle not found",
      testNotFoundErrorHandling(
        "PATCH",
        `${baseUrl}/infos/000000000000000000000000`
      )
    );

    it("can update info", async () => {
      // run a request that will work
      const response = await supertest(server.server)
        .patch(`${baseUrl}/infos/${testInfo._id}`)
        .send({
          title: "new value",
          message: "new value",
        })
        .trustLocalhost();
      expect(response.status).toBe(200);
      expect(response.body).toStrictEqual({});

      // get info from db
      const dbItem = await Item.findById(item._id);

      if (!dbItem) {
        throw new Error("Could not find test item in database anymore");
      }

      // validate changes
      const lastInfo = dbItem.infos[dbItem.infos.length - 1];
      expect(lastInfo.title).toBe("new value");
      expect(lastInfo.message).toBe("new value");
    });

    it("ignores falsy values for required fields", async () => {
      // run a request that will work
      const response = await supertest(server.server)
        .patch(`${baseUrl}/infos/${testInfo._id}`)
        .send({
          title: "",
          message: "",
        })
        .trustLocalhost();
      expect(response.status).toBe(200);
      expect(response.body).toStrictEqual({});

      // get info from db
      const dbItem = await Item.findById(item._id);

      if (!dbItem) {
        throw new Error("Could not find test item in database anymore");
      }

      // validate changes
      const lastInfo = dbItem.infos[dbItem.infos.length - 1];
      expect(lastInfo.title).toBe("new value");
      expect(lastInfo.message).toBe("new value");
    });
  });

  // *** Remove

  describe("remove", () => {
    // create and cleanup a model we'll work with
    let testInfo = new Info({
      title: "Le test title",
      message: "Le test message",
      _id: "000000000000000000000002",
    });
    beforeAll(async () => {
      item.infos.push(testInfo);
      await item.save();
    });
    afterAll(async () => {
      await item.infos.id(testInfo._id).remove();
      await item.save();
    });

    it("can handle server error", async () => {
      // hijack Item.findBySlug to have a server error on Item.save()
      const findBySlugBackup = Item.findBySlug;
      Item.findBySlug = jest.fn().mockResolvedValueOnce(
        new Promise((resolve, reject) => {
          resolve({
            remove: () => {
              throw new Error("TEST server error");
            },
          });
        })
      );

      // mute console
      jest.spyOn(console, "error").mockImplementationOnce(() => {});

      // run a request that will fail
      const response = await supertest(server.server)
        .delete(`${baseUrl}/infos/${testInfo._id}`)
        .trustLocalhost();
      expect(response.status).toBe(500);

      // restore hijack
      Item.findBySlug = findBySlugBackup;
    });

    it(
      "can handle not found",
      testNotFoundErrorHandling(
        "DELETE",
        `${baseUrl}/infos/000000000000000000000000`
      )
    );

    it("can delete info", async () => {
      // run a request that will work
      const response = await supertest(server.server)
        .delete(`${baseUrl}/infos/${testInfo._id}`)
        .trustLocalhost();
      expect(response.status).toBe(200);
      expect(response.body).toStrictEqual({});

      // get info from db
      const dbItem = await Item.findById(item._id);

      if (!dbItem) {
        throw new Error("Could not find test item in database anymore");
      }

      // check info is not in database anymore
      const match = dbItem.infos.id(testInfo._id);
      expect(match).toBe(null);
    });
  });
});
