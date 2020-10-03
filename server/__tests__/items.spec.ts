import supertest from "supertest";
import * as server from "../src/server";

describe("Items", () => {
  beforeAll(server.setup);
  afterAll(server.stop);

  it("can be retrieved as list", async () => {
    const response = await supertest(server.server)
      .get("/api/items")
      .trustLocalhost();
    expect(response.status).toBe(200);
  });
});
