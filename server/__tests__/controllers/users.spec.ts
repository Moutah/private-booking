import supertest from "supertest";
import * as server from "../../src/server";
import jsonwebtoken from "jsonwebtoken";
import User, { IUser } from "../../src/models/User";

let adminUser: IUser;
let alice: IUser;
let bob: IUser;

describe("Users", () => {
  // create test user
  beforeAll(async () => {
    adminUser = new User({
      name: "Cthuluhu",
      email: "test.admin@mail.com",
      password: "lol-password",
      isAdmin: true,
    });
    alice = new User({
      name: "Alice",
      email: "alice@mail.com",
      password: "lol-password",
    });
    bob = new User({
      name: "bob",
      email: "bob@mail.com",
      password: "lol-password",
    });

    await server.setup();
    await adminUser.save();
    await alice.save();
    await bob.save();
  });

  // cleanup inserted items
  afterAll(async () => {
    await adminUser.remove();
    await alice.remove();
    await bob.remove();
    await server.stop();
  });

  describe("me", () => {
    it("cannot get me with bad user in JWT", async () => {
      // run a request that will work
      const response = await supertest(server.server)
        .get("/api/users/me")
        .set("Authorization", "Bearer " + process.env.TEST_TOKEN)
        .trustLocalhost();
      expect(response.status).toBe(404);
    });

    it("can get me", async () => {
      // run a request that will work
      const response = await supertest(server.server)
        .get("/api/users/me")
        .set("Authorization", "Bearer " + alice.createJWT())
        .trustLocalhost();
      expect(response.status).toBe(200);
      expect(response.body._id).toBe(alice._id.toHexString());
      expect(response.body.email).toBe(alice.email);
      expect(response.body.name).toBe(alice.name);
      expect(response.body.password).toBeUndefined();
    });

    test.todo("can update me");

    test.todo("can update my profile picture");
  });

  describe("update", () => {
    test.todo("cannot be done by non-admin user");

    test.todo("can be done by admin user");
  });

  describe("remove", () => {
    test.todo("cannot be done by non-admin user");

    test.todo("can be done by admin user");
  });
});
