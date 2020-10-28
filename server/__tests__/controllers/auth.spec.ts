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
    server.setup();
    await user.save();
  });
  afterAll(async () => {
    await user.remove();
    server.stop();
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

    it("can given a new token", async () => {
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
      expect(response.body.expiresIn).toBe(TOKEN_LIFESPAN - 1);
    });
  });
});
