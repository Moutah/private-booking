import supertest from "supertest";
import * as server from "../../src/server";
import Place from "../../src/models/Place";
import Item from "../../src/models/Item";
import { testNotFoundErrorHandling, testServerErrorHandling } from "./utils";

describe("Item places", () => {
  let item = new Item({ name: "base item places", slug: "base-item-places" });
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
    // cleanup inserted places
    afterAll(async () => {
      await Place.deleteMany({});
    });

    it("won't store invalid request", async () => {
      // run a request with invalid body
      const response = await supertest(server.server)
        .post(`${baseUrl}/places`)
        .send({ description: undefined })
        .trustLocalhost();

      // response is failure
      expect(response.status).toBe(422);
      expect(response.body).toMatchObject({
        errors: [
          {
            message: "Place description is required.",
            type: "required",
            path: "description",
          },
          {
            message: "Place name is required.",
            type: "required",
            path: "name",
          },
        ],
      });
    });

    it("can store valid request", async () => {
      // run a request with valid body
      const response = await supertest(server.server)
        .post(`${baseUrl}/places`)
        .send({ name: "Le test name", description: "Le test description" })
        .trustLocalhost();

      // response is successful with newly created place
      expect(response.status).toBe(201);
      const lastPlace = response.body.places[response.body.places.length - 1];
      expect(lastPlace).toBeTruthy();
      expect(lastPlace.name).toBe("Le test name");
      expect(lastPlace.description).toBe("Le test description");
    });
  });

  // *** Update

  describe("update", () => {
    // create and cleanup a model we'll work with
    let testPlace = new Place({
      name: "Le test name",
      description: "Le test description",
      _id: "000000000000000000000001",
    });
    beforeAll(async () => {
      item.places.push(testPlace);
      await item.save();
    });
    afterAll(async () => {
      await item.places.id(testPlace._id).remove();
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
        .patch(`${baseUrl}/places/${testPlace._id}`)
        // we need to send a body because the error will come after place creation
        .send({
          name: "Le new test name",
          description: "Le new test description",
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
        `${baseUrl}/places/000000000000000000000000`
      )
    );

    it("can update place", async () => {
      // run a request that will work
      const response = await supertest(server.server)
        .patch(`${baseUrl}/places/${testPlace._id}`)
        .send({
          name: "new value",
          description: "new value",
        })
        .trustLocalhost();
      expect(response.status).toBe(200);
      expect(response.body).toStrictEqual({});

      // get place from db
      const dbItem = await Item.findById(item._id);

      if (!dbItem) {
        throw new Error("Could not find test item in database anymore");
      }

      // validate changes
      const lastPlace = dbItem.places[dbItem.places.length - 1];
      expect(lastPlace.name).toBe("new value");
      expect(lastPlace.description).toBe("new value");
    });

    it("ignores falsy values for required fields", async () => {
      // run a request that will work
      const response = await supertest(server.server)
        .patch(`${baseUrl}/places/${testPlace._id}`)
        .send({
          name: "",
          description: "",
        })
        .trustLocalhost();
      expect(response.status).toBe(200);
      expect(response.body).toStrictEqual({});

      // get place from db
      const dbItem = await Item.findById(item._id);

      if (!dbItem) {
        throw new Error("Could not find test item in database anymore");
      }

      // validate changes
      const lastPlace = dbItem.places[dbItem.places.length - 1];
      expect(lastPlace.name).toBe("new value");
      expect(lastPlace.description).toBe("new value");
    });
  });

  // *** Remove

  describe("remove", () => {
    // create and cleanup a model we'll work with
    let testPlace = new Place({
      name: "Le test name",
      description: "Le test description",
      _id: "000000000000000000000002",
    });
    beforeAll(async () => {
      item.places.push(testPlace);
      await item.save();
    });
    afterAll(async () => {
      await item.places.id(testPlace._id).remove();
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
        .delete(`${baseUrl}/places/${testPlace._id}`)
        .trustLocalhost();
      expect(response.status).toBe(500);

      // restore hijack
      Item.findBySlug = findBySlugBackup;
    });

    it(
      "can handle not found",
      testNotFoundErrorHandling(
        "DELETE",
        `${baseUrl}/places/000000000000000000000000`
      )
    );

    it("can delete place", async () => {
      // run a request that will work
      const response = await supertest(server.server)
        .delete(`${baseUrl}/places/${testPlace._id}`)
        .trustLocalhost();
      expect(response.status).toBe(200);
      expect(response.body).toStrictEqual({});

      // get place from db
      const dbItem = await Item.findById(item._id);

      if (!dbItem) {
        throw new Error("Could not find test item in database anymore");
      }

      // check place is not in database anymore
      const match = dbItem.places.id(testPlace._id);
      expect(match).toBe(null);
    });
  });
});
