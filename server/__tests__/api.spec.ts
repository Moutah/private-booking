import supertest from "supertest";
import * as server from "../src/server";

describe("Api", () => {
  beforeAll(server.setup);
  afterAll(server.stop);

  it("can play ping-pong", async () => {
    const response = await supertest(server.server)
      .get("/api/ping")
      .trustLocalhost();
    expect(response.status).toBe(200);
    expect(response.body).toBe("pong");
  });
});
