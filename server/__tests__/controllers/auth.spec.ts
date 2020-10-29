import supertest from "supertest";
import * as server from "../../src/server";
import User from "../../src/models/User";
import { TOKEN_LIFESPAN } from "../../src/auth";

describe("Auth", () => {
  const user = new User({
    name: "test user",
    email: "test.user@mail.com",
    password: "p@ssw0rd",
  });
  let authenticatedCookie: any;

  beforeAll(async () => {
    await server.setup();
    await user.save();
  });
  afterAll(async () => {
    await user.remove();
    await server.stop();
  });

  describe("Logout", () => {
    it("can log user out", async () => {
      // run login
      const responseLogin = await supertest(server.server)
        .post("/login")
        .send({
          email: user.email,
          password: "p@ssw0rd",
        })
        .trustLocalhost();
      authenticatedCookie = responseLogin.headers["set-cookie"];

      // logout
      const responseLogout = await supertest(server.server)
        .get("/logout")
        .set("Cookie", authenticatedCookie)
        .trustLocalhost();
      expect(responseLogout.status).toBe(302);
      expect(responseLogout.headers.location).toBe("/login");

      // check user has no access anymore
      const responseAfterLogout = await supertest(server.server)
        .get("/")
        .set("Cookie", authenticatedCookie)
        .trustLocalhost();
      expect(responseAfterLogout.status).toBe(302);
      expect(responseAfterLogout.headers.location).toBe("/login");
    });
  });

  describe("Token generator", () => {
    it("fails if invalid credentials are sent", async () => {
      const response = await supertest(server.server)
        .post(`/api/login`)
        .send({
          email: user.email,
          password: "le bad password",
        })
        .trustLocalhost();
      expect(response.status).toBe(401);
    });

    it("can given a new token with user credentials", async () => {
      // get valid JWT for this user
      const response = await supertest(server.server)
        .post(`/api/login`)
        .send({
          email: user.email,
          password: "p@ssw0rd",
        })
        .trustLocalhost();
      expect(response.status).toBe(200);
      expect(response.body.token).toBeTruthy();
      expect(response.body.refreshToken).toBeTruthy();
      expect(response.body.validity).toBe(TOKEN_LIFESPAN - 1);
    });

    it("can give a new token with user current JWT", async () => {
      // make sure the user has a hash
      await user.createRefreshToken();
      const jwt = await user.createRefreshToken();

      // get valid JWT for this user
      const response = await supertest(server.server)
        .post(`/api/refresh-token`)
        .set("Authorization", "Bearer " + jwt)
        .trustLocalhost();
      expect(response.status).toBe(200);
      expect(response.body.token).toBeTruthy();
      expect(response.body.refreshToken).toBeTruthy();
      expect(response.body.validity).toBe(TOKEN_LIFESPAN - 1);
    });

    it("can give a new token with user refresh token", async () => {
      const refreshToken = await user.createRefreshToken();

      // get valid JWT for this user
      const response = await supertest(server.server)
        .post(`/api/refresh-token`)
        .set("Authorization", "Bearer " + refreshToken)
        .trustLocalhost();
      expect(response.status).toBe(200);
      expect(response.body.token).toBeTruthy();
      expect(response.body.refreshToken).toBeTruthy();
      expect(response.body.validity).toBe(TOKEN_LIFESPAN - 1);
    });

    it("fails if req.user does not link to a known user", async () => {
      // mute console
      jest.spyOn(console, "error").mockImplementationOnce(() => {});

      const response = await supertest(server.server)
        .post(`/api/refresh-token`)
        .set("Authorization", "Bearer " + process.env.TEST_TOKEN)
        .trustLocalhost();
      expect(response.status).toBe(401);
    });

    it("fails if refresh token not recognized", async () => {
      let refreshToken = await user.createRefreshToken();

      // generate a new refresh token that will overwrite the one recieved above
      await user.createRefreshToken();

      // get valid JWT for this user
      const response = await supertest(server.server)
        .post(`/api/refresh-token`)
        .set("Authorization", "Bearer " + refreshToken)
        .trustLocalhost();
      expect(response.status).toBe(401);
    });
  });
});
