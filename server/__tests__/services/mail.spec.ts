import nodemailer from "nodemailer";
import {
  setupMailer,
  sender,
  transport,
  sendMail,
  sendMailCallToAction,
} from "../../src/services/mail";

jest.mock("nodemailer", () => ({
  createTransport: jest.fn(() => ({
    sendMail: jest.fn(),
  })),
}));

describe("Mail service", () => {
  describe("setup", () => {
    it("fails if env is missing some variables", async () => {
      // unset env
      const backupEnv = {
        MAIL_HOST: process.env.MAIL_HOST,
        MAIL_PORT: process.env.MAIL_PORT,
        MAIL_USERNAME: process.env.MAIL_USERNAME,
        MAIL_PASSWORD: process.env.MAIL_PASSWORD,
        MAIL_FROM_NAME: process.env.MAIL_FROM_NAME,
        MAIL_FROM_ADDRESS: process.env.MAIL_FROM_ADDRESS,
      };
      delete process.env.MAIL_HOST;
      delete process.env.MAIL_PORT;
      delete process.env.MAIL_USERNAME;
      delete process.env.MAIL_PASSWORD;
      delete process.env.MAIL_FROM_NAME;
      delete process.env.MAIL_FROM_ADDRESS;

      // setup will throw
      expect(setupMailer).toThrowError();

      // restore env
      process.env.MAIL_HOST = backupEnv.MAIL_HOST;
      process.env.MAIL_PORT = backupEnv.MAIL_PORT;
      process.env.MAIL_USERNAME = backupEnv.MAIL_USERNAME;
      process.env.MAIL_PASSWORD = backupEnv.MAIL_PASSWORD;
      process.env.MAIL_FROM_NAME = backupEnv.MAIL_FROM_NAME;
      process.env.MAIL_FROM_ADDRESS = backupEnv.MAIL_FROM_ADDRESS;
    });

    it("sets transport and sender", async () => {
      // run the setup
      setupMailer();

      // nodemailer called
      expect(nodemailer.createTransport).toHaveBeenCalled();

      // singletons set
      expect(sender).toBeTruthy();
      expect(transport).toBeTruthy();
    });
  });

  describe("send", () => {
    const to = "recipient@mail.com";
    const subject = "Le test subject";

    it("can send mail", async () => {
      await sendMail(to, subject, `<h1>Salut monde</h1>`);
      expect(transport.sendMail).toHaveBeenCalled();
    });

    it("can send mail with call to action", async () => {
      await sendMailCallToAction(
        to,
        subject,
        `<h1>Salut monde</h1>`,
        "action",
        "https://action.target.com"
      );
      expect(transport.sendMail).toHaveBeenCalled();
    });

    it("can handle transport error", async () => {
      expect.assertions(1);

      jest
        .spyOn(transport, "sendMail")
        .mockRejectedValueOnce(new Error("test error"));

      // mute console
      jest.spyOn(console, "error").mockImplementationOnce(() => {});

      await expect(
        sendMail(to, subject, `<h1>Salut monde</h1>`)
      ).rejects.toMatchObject({
        message: "test error",
      });
    });
  });
});
