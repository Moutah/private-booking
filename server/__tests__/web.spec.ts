import supertest from "supertest";
import * as server from "../src/server";

describe("Web", () => {
  beforeAll(server.setup);
  afterAll(server.stop);

  it("redirects to / as fallback", async () => {
    const response = await supertest(server.server)
      .get("/unknown/route")
      .trustLocalhost();
    expect(response.status).toBe(302);
    expect(response.headers.location).toBe("/");
  });
});
