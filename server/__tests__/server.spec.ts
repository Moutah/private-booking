import { mocked } from "ts-jest/utils";
import * as db from "../src/db";
import * as server from "../src/server";

jest.mock("../src/db");

const mockedDb = mocked(db, true);

describe("Server", () => {
  it("can be setup", async () => {
    await server.setup();
    expect(mockedDb.connect).toHaveBeenCalled();
  });

  it("can be started with a given port", async () => {
    const serverSpyListen = jest.spyOn(server.app, "listen");
    const testPort = 1234;

    // server not activated
    expect(server.activeServer).toBeUndefined();

    // start server
    await server.start(testPort);

    // check that server is active and listening to the right port
    expect(serverSpyListen).toHaveBeenCalledWith(testPort, expect.anything());
    expect(server.activeServer.listening).toBe(true);

    // cleanup
    await server.stop();
  });

  it("can be stopped", async () => {
    // start server
    await server.start(1234);
    expect(server.activeServer.listening).toBe(true);

    // close server
    await server.stop();
    expect(server.activeServer.listening).toBe(false);
  });

  it("uses express.static assets if CLIENT_BUILD_PATH set in env", async () => {
    const serverSpyUse = jest.spyOn(server.app, "use");

    // manually unset env
    delete process.env.CLIENT_BUILD_PATH;
    // process.env.CLIENT_BUILD_PATH = undefined;

    // setup server
    await server.setup();
    expect(serverSpyUse).toHaveBeenCalledTimes(3);

    // manually set env
    process.env.CLIENT_BUILD_PATH = "some value";

    // reset spy count
    serverSpyUse.mockClear();

    // setup server
    await server.setup();
    expect(serverSpyUse).toHaveBeenCalledTimes(4);
  });
});
