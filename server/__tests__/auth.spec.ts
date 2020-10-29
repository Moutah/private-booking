import supertest from "supertest";
import * as server from "../src/server";
import jsonwebtoken from "jsonwebtoken";
import {
  TOKEN_LIFESPAN,
  TOKEN_PASSWORD_RESET_LIFESPAN,
  TOKEN_REFRESH_LIFESPAN,
  TOKEN_REGISTER_LIFESPAN,
} from "../src/auth";
import User from "../src/models/User";

describe("Auth", () => {
  const user = new User({
    name: "test user",
    email: "test.user@mail.com",
    password: "p@ssw0rd",
  });

  beforeAll(async () => {
    await server.setup();
    await user.save();
  });
  afterAll(async () => {
    await user.remove();
    await server.stop();
  });

  describe("JWT", () => {
    it("sets TOKEN_LIFESPAN default", async () => {
      // manually clear env
      const tokenLifespanBackup = process.env.TOKEN_LIFESPAN;
      const tokenRefreshLifespanBackup = process.env.TOKEN_REFRESH_LIFESPAN;
      const tokenRegisterLifespanBackup = process.env.TOKEN_REGISTER_LIFESPAN;
      const tokenPasswordResetLifespanBackup =
        process.env.TOKEN_PASSWORD_RESET_LIFESPAN;
      delete process.env.TOKEN_LIFESPAN;
      delete process.env.TOKEN_REFRESH_LIFESPAN;
      delete process.env.TOKEN_REGISTER_LIFESPAN;
      delete process.env.TOKEN_PASSWORD_RESET_LIFESPAN;

      // restart server
      await server.stop();
      await server.setup();

      // test default value
      expect(TOKEN_LIFESPAN()).toBe(60 * 60);
      expect(TOKEN_REFRESH_LIFESPAN()).toBe(30 * 24 * 60 * 60);
      expect(TOKEN_REGISTER_LIFESPAN()).toBe(30 * 24 * 60 * 60);
      expect(TOKEN_PASSWORD_RESET_LIFESPAN()).toBe(60 * 60);

      // restore env
      process.env.TOKEN_LIFESPAN = tokenLifespanBackup;
      process.env.TOKEN_REFRESH_LIFESPAN = tokenRefreshLifespanBackup;
      process.env.TOKEN_REGISTER_LIFESPAN = tokenRegisterLifespanBackup;
      process.env.TOKEN_PASSWORD_RESET_LIFESPAN = tokenPasswordResetLifespanBackup;
    });

    it("aborts request with 401 if no JWT provided", async () => {
      const response = await supertest(server.server)
        .get(`/api/ping`)
        .trustLocalhost();
      expect(response.status).toBe(401);
    });

    it("aborts request with 401 if JWT expired", async () => {
      const expiredToken = jsonwebtoken.sign(
        {
          sub: "000000000000000000000000",
          name: "test token",
          exp: 1, // Epoch
        },
        process.env.APP_KEY as string
      );

      const response = await supertest(server.server)
        .get(`/api/ping`)
        .set("Authorization", "Bearer " + expiredToken)
        .trustLocalhost();
      expect(response.status).toBe(401);
    });

    it("does not accept refresh token", async () => {
      const refreshToken = await user.createRefreshToken();

      const response = await supertest(server.server)
        .get(`/api/ping`)
        .set("Authorization", "Bearer " + refreshToken)
        .trustLocalhost();
      expect(response.status).toBe(401);
    });

    it("allows request if valid JWT provided", async () => {
      const response = await supertest(server.server)
        .get(`/api/ping`)
        .set("Authorization", "Bearer " + process.env.TEST_TOKEN)
        .trustLocalhost();
      expect(response.status).toBe(200);
    });
  });

  describe("Local", () => {
    let authenticatedCookie: any;

    it("redirects to /login if no authenticated session active.", async () => {
      // accessing protected route is redirected to /login
      const response = await supertest(server.server).get("/").trustLocalhost();
      expect(response.status).toBe(302);
      expect(response.headers.location).toBe("/login");
    });

    it("does not authenticate user with unknown user mail sent to /login.", async () => {
      // run login
      const responseLogin = await supertest(server.server)
        .post("/login")
        .send({
          email: "unkown",
          password: "le bad password",
        })
        .trustLocalhost();

      // redirects to /login
      expect(responseLogin.status).toBe(302);
      expect(responseLogin.headers.location).toBe("/login");

      // accessing protected route with cookie for session is not ok
      const responseProtected = await supertest(server.server)
        .get("/")
        .set("Cookie", responseLogin.headers["set-cookie"])
        .trustLocalhost();
      expect(responseProtected.status).toBe(302);
      expect(responseProtected.headers.location).toBe("/login");
    });

    it("does not authenticate user with bad password sent to /login.", async () => {
      // run login
      const responseLogin = await supertest(server.server)
        .post("/login")
        .send({
          email: user.email,
          password: "le bad password",
        })
        .trustLocalhost();

      // redirects to /login
      expect(responseLogin.status).toBe(302);
      expect(responseLogin.headers.location).toBe("/login");

      // accessing protected route with cookie for session is not ok
      const responseProtected = await supertest(server.server)
        .get("/")
        .set("Cookie", responseLogin.headers["set-cookie"])
        .trustLocalhost();
      expect(responseProtected.status).toBe(302);
      expect(responseProtected.headers.location).toBe("/login");
    });

    it("can authenticate user with valid credentials sent to /login.", async () => {
      // run login
      const responseLogin = await supertest(server.server)
        .post("/login")
        .send({
          email: user.email,
          password: "p@ssw0rd",
        })
        .trustLocalhost();

      // redirects to /
      expect(responseLogin.status).toBe(302);
      expect(responseLogin.headers.location).toBe("/");

      // accessing protected route with cookie for session is ok
      const responseProtected = await supertest(server.server)
        .get("/")
        .set("Cookie", responseLogin.headers["set-cookie"])
        .trustLocalhost();
      expect(responseProtected.status).toBe(200);

      authenticatedCookie = responseLogin.headers["set-cookie"];
    });

    it("can handle database error during authentification", async () => {
      // hijack `User.findOne()` to simulate a database error
      User.findOne = jest.fn().mockImplementationOnce(() => ({
        select: jest.fn().mockImplementationOnce(() => ({
          exec: jest
            .fn()
            .mockImplementationOnce((callback) =>
              callback(new Error("test error"), null)
            ),
        })),
      }));

      // mute console
      jest.spyOn(console, "error").mockImplementationOnce(() => {});

      // run login
      const responseLogin = await supertest(server.server)
        .post("/login")
        .send({
          email: user.email,
          password: "p@ssw0rd",
        })
        .trustLocalhost();
      expect(responseLogin.status).toBe(500);
    });

    it("can handle database error during session user deserialization", async () => {
      // hijack `User.findById()` to simulate a database error
      User.findById = jest
        .fn()
        .mockImplementationOnce((id, callback) =>
          callback(new Error("test error"), null)
        );

      // mute console
      jest.spyOn(console, "error").mockImplementationOnce(() => {});

      // accessing protected route with cookie for session will server error
      const responseProtected = await supertest(server.server)
        .get("/")
        .set("Cookie", authenticatedCookie)
        .trustLocalhost();
      expect(responseProtected.status).toBe(500);
    });
  });
});
