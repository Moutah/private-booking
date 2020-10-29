import supertest from "supertest";
import * as server from "../../src/server";
import Booking from "../../src/models/Booking";
import Item from "../../src/models/Item";
import User from "../../src/models/User";
import {
  mockFindById,
  testNotFoundErrorHandling,
  testServerErrorHandling,
} from "./utils";

describe("Bookings", () => {
  let item = new Item({
    name: "base item bookings",
    slug: "base-item-bookings",
  });
  const manager = new User({
    name: "manager",
    email: "manager@mail.com",
    items: [item._id],
  });
  item.managers.push(manager._id);
  const baseUrl = `/api/items/${item.slug}`;

  beforeAll(async () => {
    await server.setup();
    await item.save();
    await manager.save();
  });
  afterAll(async () => {
    await manager.remove();
    await item.remove();
    await server.stop();
  });

  // *** Index

  describe("index", () => {
    it(
      "can handle server error",
      testServerErrorHandling(`${baseUrl}/bookings`, Booking, "find")
    );

    it("can return list of bookings", async () => {
      // get bookings
      const response = await supertest(server.server)
        .get(`${baseUrl}/bookings`)
        .set("Authorization", "Bearer " + process.env.TEST_TOKEN)
        .trustLocalhost();
      expect(response.status).toBe(200);
    });
  });

  // *** Insert

  describe("insert", () => {
    // cleanup inserted bookings
    afterAll(async () => {
      await Booking.deleteMany({});
    });

    it("won't store invalid request", async () => {
      // run a request with invalid body
      const response = await supertest(server.server)
        .post(`${baseUrl}/bookings`)
        .set("Authorization", "Bearer " + process.env.TEST_TOKEN)
        .send({ message: undefined })
        .trustLocalhost();

      // response is failure
      expect(response.status).toBe(422);
      expect(response.body).toMatchObject({
        errors: [
          {
            message: "Booking date is required.",
            type: "required",
            path: "date",
          },
        ],
      });
    });

    it("can store valid request", async () => {
      // run a request with valid body
      const now = new Date();
      const response = await supertest(server.server)
        .post(`${baseUrl}/bookings`)
        .set("Authorization", "Bearer " + process.env.TEST_TOKEN)
        .send({ date: now })
        .trustLocalhost();

      // response is successful with newly created booking
      expect(response.status).toBe(201);
      expect(response.body).toBeTruthy();
      expect(response.body.date).toBe(now.toJSON());
      expect(response.body.status).toBe("pending");
      expect(response.body.user).toBe(process.env.TEST_USER_ID);
    });
  });

  // *** Get

  describe("get", () => {
    // create and cleanup a model we'll work with
    let testBooking = new Booking({
      date: new Date(),
      item: item._id,
    });
    beforeAll(async () => {
      await testBooking.save();
    });
    afterAll(async () => {
      await Booking.deleteMany({});
    });

    it(
      "can handle server error",
      testServerErrorHandling(
        `${baseUrl}/bookings/${testBooking._id}`,
        Booking,
        "findById"
      )
    );

    it(
      "can handle not found",
      testNotFoundErrorHandling(
        "GET",
        `${baseUrl}/bookings/000000000000000000000000`
      )
    );

    it("can get booking", async () => {
      // run a request that will work
      const response = await supertest(server.server)
        .get(`${baseUrl}/bookings/${testBooking._id}`)
        .set("Authorization", "Bearer " + process.env.TEST_TOKEN)
        .trustLocalhost();
      expect(response.status).toBe(200);
      expect(response.body._id).toBe(testBooking._id.toHexString());
    });
  });

  // *** Update

  describe("update", () => {
    let bookingAuthor = new User({
      name: "user",
      email: "user@mail.com",
      items: [item._id],
    });
    let testBooking = new Booking({
      date: new Date(),
      item: item._id,
      user: bookingAuthor._id,
    });

    // create and cleanup a model we'll work with
    beforeAll(async () => {
      await bookingAuthor.save();
      await testBooking.save();
    });
    afterAll(async () => {
      await bookingAuthor.remove();
      await Booking.deleteMany({});
    });

    it("can handle server error", async () => {
      // hijack post.findById to have a server error on Booking.save()
      const findByIdBackup = Booking.findById;
      Booking.findById = mockFindById({
        save: () => {
          throw new Error("TEST server error");
        },
      });

      // mute console
      jest.spyOn(console, "error").mockImplementationOnce(() => {});

      // run a request that will fail
      const response = await supertest(server.server)
        .patch(`${baseUrl}/bookings/${testBooking._id}`)
        .set("Authorization", "Bearer " + process.env.TEST_TOKEN)
        .trustLocalhost();
      expect(response.status).toBe(500);

      // restore hijack
      Booking.findById = findByIdBackup;
    });

    it(
      "can handle not found",
      testNotFoundErrorHandling(
        "PATCH",
        `${baseUrl}/bookings/000000000000000000000000`
      )
    );

    it("author can update booking", async () => {
      // run a request that will work
      const now = new Date();
      const response = await supertest(server.server)
        .patch(`${baseUrl}/bookings/${testBooking._id}`)
        .set("Authorization", "Bearer " + bookingAuthor.createJWT())
        .send({
          comment: "new value",
          createdAt: now,
        })
        .trustLocalhost();
      expect(response.status).toBe(200);
      expect(response.body).toStrictEqual({});

      // get booking from db
      const dbBooking = await Booking.findById(testBooking._id);

      if (!dbBooking) {
        throw new Error("Could not find test booking in database anymore");
      }

      // validate changes
      expect(dbBooking.comment).toBe("new value");

      // validate field protection
      expect(dbBooking.createdAt).not.toBe(now.toJSON());
    });

    it("manager can update booking", async () => {
      // run a request that will work but has no effect
      const responseNoEffect = await supertest(server.server)
        .patch(`${baseUrl}/bookings/${testBooking._id}`)
        .set("Authorization", "Bearer " + manager.createJWT())
        .send({ status: "new value" })
        .trustLocalhost();
      expect(responseNoEffect.status).toBe(200);

      // get booking from db
      const dbBooking = await Booking.findById(testBooking._id);

      if (!dbBooking) {
        throw new Error("Could not find test booking in database anymore");
      }

      // validate status is protected
      expect(dbBooking.status).toBe("new value");
    });

    it("someone else cannot update booking", async () => {
      const troublemaker = new User({
        name: "troublemaker",
        email: "troublemaker@mail.com",
        items: [item._id],
      });
      await troublemaker.save();

      // run a request that will work but has no effect
      const responseNoEffect = await supertest(server.server)
        .patch(`${baseUrl}/bookings/${testBooking._id}`)
        .set("Authorization", "Bearer " + troublemaker.createJWT())
        .send({ comment: "lulz h4ck3d" })
        .trustLocalhost();
      expect(responseNoEffect.status).toBe(403);

      // get booking from db
      let dbBooking = await Booking.findById(testBooking._id);

      if (!dbBooking) {
        throw new Error("Could not find test booking in database anymore");
      }

      // validate status is protected
      expect(dbBooking.status).not.toBe("lulz h4ck3d");

      // cleanup
      await troublemaker.remove();
    });
  });

  // *** Remove

  describe("remove", () => {
    // create a model we'll work with
    let testBooking = new Booking({
      date: new Date(),
      item: item._id,
    });
    beforeAll(async () => {
      await testBooking.save();
    });

    it("can handle server error", async () => {
      // hijack post.findById to have a server error on Booking.save()
      const findByIdBackup = Booking.findById;
      Booking.findById = mockFindById({
        remove: () => {
          throw new Error("TEST server error");
        },
      });

      // mute console
      jest.spyOn(console, "error").mockImplementationOnce(() => {});

      // run a request that will fail
      const response = await supertest(server.server)
        .delete(`${baseUrl}/bookings/${testBooking._id}`)
        .set("Authorization", "Bearer " + process.env.TEST_TOKEN)
        .trustLocalhost();
      expect(response.status).toBe(500);

      // restore hijack
      Booking.findById = findByIdBackup;
    });

    it(
      "can handle not found",
      testNotFoundErrorHandling(
        "DELETE",
        `${baseUrl}/bookings/000000000000000000000000`
      )
    );

    it("can delete booking", async () => {
      // run a request that will work
      const response = await supertest(server.server)
        .delete(`${baseUrl}/bookings/${testBooking._id}`)
        .set("Authorization", "Bearer " + process.env.TEST_TOKEN)
        .trustLocalhost();
      expect(response.status).toBe(200);
      expect(response.body).toStrictEqual({});

      // check booking is not in database anymore
      const dbBooking = await Booking.findById(testBooking._id);
      expect(dbBooking).toBe(null);
    });
  });
});
