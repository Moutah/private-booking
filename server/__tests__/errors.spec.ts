import supertest from "supertest";
import * as server from "../src/server";
import User from "../src/models/User";

describe("Error handler", () => {
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

  it("can handle not found", async () => {
    // run login
    const responseLogin = await supertest(server.server)
      .post("/login")
      .send({
        email: user.email,
        password: "p@ssw0rd",
      })
      .trustLocalhost();
    const authenticatedCookie = responseLogin.headers["set-cookie"];

    const response = await supertest(server.server)
      .get("/unknown/route")
      .set("Cookie", authenticatedCookie)
      .trustLocalhost();
    expect(response.status).toBe(404);
    expect(response.text).toBe("Not found");
  });
});
