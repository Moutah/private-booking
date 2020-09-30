import mongoose from "mongoose";
import * as db from "../src/db";

jest.mock("mongoose", () => ({
  connect: jest.fn(),
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
});
