import mongoose from "mongoose";
import * as db from "../src/db";

jest.mock("mongoose", () => ({
  connect: jest.fn(),
  disconnect: jest.fn((callback: Function) => callback()),
  connection: {
    once: jest.fn((eventName: string, callback: Function) => callback()),
  },
}));

describe("Database", () => {
  it("cannot connect if DB_HOST not set", async () => {
    expect.assertions(1);

    // manually clear env
    const hostBackup = process.env.DB_HOST;
    delete process.env.DB_HOST;

    // connecting will throw an error
    await expect(db.connect()).rejects.toEqual("DB_HOST not set");

    // restore env
    process.env.DB_HOST = hostBackup;
  });

  it("can connect", async () => {
    // check connection not set
    expect(db.connection).toBeUndefined();

    // connect
    await db.connect();

    // mongoose used to connect to MongoDB
    expect(mongoose.connect).toHaveBeenCalledWith(
      process.env.DB_HOST,
      expect.anything()
    );

    // connection is set
    expect(db.connection).toBeTruthy();
  });

  it("can be verbose", async () => {
    const consoleLogSpy = jest
      .spyOn(console, "log")
      .mockImplementation(() => {});

    // connect and disconnect db
    await db.connect();
    await db.disconnect();

    // no logs in test env
    expect(consoleLogSpy).not.toHaveBeenCalled();

    // hijack node env
    process.env.NODE_ENV = "not test lol";

    // connect and disconnect db
    await db.connect();
    await db.disconnect();

    // verbose
    expect(consoleLogSpy).toHaveBeenCalled();

    // restore console
    consoleLogSpy.mockRestore();

    // restore node env
    process.env.NODE_ENV = "test";
  });
});
