import supertest from "supertest";
import * as server from "../../src/server";
import User from "../../src/models/user";
import { sendMailCallToAction } from "../../src/services/mail";

jest.mock("../../src/services/mail");

describe("User", () => {
  const user = new User({
    name: "test user",
    email: "test.user@mail.com",
    // blank password means the user is not yet registred
  });

  beforeAll(async () => {
    await server.setup();
    await user.save();
  });
  afterAll(async () => {
    await user.remove();
    await server.stop();
  });

  it("can be notified of invitation to the platform", async () => {
    await user.notifyNewAccess("test item");
    expect(sendMailCallToAction).toHaveBeenCalledWith(
      user.email,
      "You've been invited to join Private Booking!",
      expect.anything(),
      expect.anything(),
      expect.anything()
    );
  });

  it("can be notified of invitation to a new item", async () => {
    // add password to mark the user as registred
    user.password = "le password";
    await user.save();

    await user.notifyNewAccess("test item");
    expect(sendMailCallToAction).toHaveBeenCalledWith(
      user.email,
      "You've been invited to join test item!",
      expect.anything(),
      expect.anything(),
      expect.anything()
    );
  });
});
