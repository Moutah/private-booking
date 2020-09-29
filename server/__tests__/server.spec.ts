import { mocked } from "ts-jest/utils";
import * as db from "../src/db";
import * as server from "../src/server";
jest.mock("../src/db");

const mockedDb = mocked(db, true);

describe("Server", () => {
  it("passes", () => {
    expect(1).toBeTruthy();
  });

  it("can be setup", async () => {
    await server.setup();
    expect(mockedDb.connect).toHaveBeenCalled();
  });
});
