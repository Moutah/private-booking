import supertest from "supertest";
import * as server from "../../src/server";
import User from "../../src/models/User";
import { TOKEN_LIFESPAN } from "../../src/auth";

describe("Auth", () => {
  beforeAll(server.setup);
  afterAll(server.stop);

  describe("Logout", () => {
    const user = new User({
      name: "test user",
      email: "test.user@mail.com",
      password: "p@ssw0rd",
    });
    let authenticatedCookie: any;

    beforeAll(async () => {
      await user.save();
    });
    afterAll(async () => {
      await user.remove();
    });

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
    it("fails if req.user does not link to a known user", async () => {
      // mute console
      jest.spyOn(console, "error").mockImplementationOnce(() => {});

      const response = await supertest(server.server)
        .get(`/api/new-token`)
        .set("Authorization", "Bearer " + process.env.TEST_TOKEN)
        .trustLocalhost();
      expect(response.status).toBe(500);
    });

    it("can given a new token", async () => {
      // create test user
      const user = new User({
        name: "test user",
        email: "test@mail.com",
        password: "lol-password",
      });
      await user.save();

      // get valid JWT for this user
      const jwt = user.createJWT();

      const response = await supertest(server.server)
        .get(`/api/new-token`)
        .set("Authorization", "Bearer " + jwt)
        .trustLocalhost();
      expect(response.status).toBe(200);
      expect(response.body.token).toBeTruthy();
      expect(response.body.expiresIn).toBe(TOKEN_LIFESPAN - 1);

      // remove test user
      await user.remove();
    });
  });
});
