import supertest from "supertest";
import * as server from "../../src/server";
import jsonwebtoken from "jsonwebtoken";
import User from "../../src/models/User";
import { TOKEN_LIFESPAN } from "../../src/auth";

describe("Auth", () => {
  beforeAll(server.setup);
  afterAll(server.stop);

  it("sets TOKEN_LIFESPAN to 1h by default", async () => {
    expect.assertions(1);

    // manually clear env
    const tokenLifespanBackup = process.env.TOKEN_LIFESPAN;
    delete process.env.TOKEN_LIFESPAN;

    // restart server
    await server.stop();
    await server.setup();

    // test default value
    expect(TOKEN_LIFESPAN).toBe(60 * 60);

    // restore env
    process.env.TOKEN_LIFESPAN = tokenLifespanBackup;
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

  it("allows request if valid JWT provided", async () => {
    const response = await supertest(server.server)
      .get(`/api/ping`)
      .set("Authorization", "Bearer " + process.env.TEST_TOKEN)
      .trustLocalhost();
    expect(response.status).toBe(200);
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
