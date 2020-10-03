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
    const serverSpyListen = jest.spyOn(server.server, "listen");
    const testPort = 1234;

    // server not activated
    expect(server.server.listening).toBe(false);

    // start server
    await server.start(testPort);

    // check that server is active and listening to the right port
    expect(serverSpyListen).toHaveBeenCalledWith(testPort, expect.anything());
    expect(server.server.listening).toBe(true);

    // cleanup
    await server.stop();
  });

  it("can be stopped", async () => {
    // start server
    await server.start(1234);
    expect(server.server.listening).toBe(true);

    // close server
    await server.stop();
    expect(server.server.listening).toBe(false);
  });

  it("uses express.static assets if CLIENT_BUILD_PATH set in env", async () => {
    const serverSpyUse = jest.spyOn(server.app, "use");
    const baseUseCount = 6;

    // manually unset env
    delete process.env.CLIENT_BUILD_PATH;

    // setup server
    await server.setup();
    expect(serverSpyUse).toHaveBeenCalledTimes(baseUseCount);

    // manually set env
    process.env.CLIENT_BUILD_PATH = "some value";

    // reset spy count
    serverSpyUse.mockClear();

    // setup server
    await server.setup();
    expect(serverSpyUse).toHaveBeenCalledTimes(baseUseCount + 1);
  });

  it("can be verbose", async () => {
    const consoleLogSpy = jest.spyOn(console, "log");

    // start and stop server
    await server.start(1234);
    await server.stop();

    // no logs in test env
    expect(consoleLogSpy).not.toHaveBeenCalled();

    // hijack node env
    process.env.NODE_ENV = "not test lol";

    // start and stop server
    await server.start(1234);
    await server.stop();

    // verbose
    expect(consoleLogSpy).toHaveBeenCalled();

    // restore node env
    process.env.NODE_ENV = "test";
  });
});
