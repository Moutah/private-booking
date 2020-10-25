import nodemailer, { Transporter } from "nodemailer";

export let transport: Transporter;
export let sender: string;

/**
 * Create a mailer transport with details from environment variables.
 * @throws `Error` if missing informations
 */
export const setupMailer = () => {
  if (
    !process.env.MAIL_HOST ||
    !process.env.MAIL_PORT ||
    !process.env.MAIL_USERNAME ||
    !process.env.MAIL_PASSWORD ||
    !process.env.MAIL_FROM_NAME ||
    !process.env.MAIL_FROM_ADDRESS
  ) {
    throw new Error("Unable to create mail transport, not enough info in env");
  }

  transport = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: parseInt(process.env.MAIL_PORT),
    secure: true, // use TLS
    auth: {
      user: process.env.MAIL_USERNAME,
      pass: process.env.MAIL_PASSWORD,
    },
  });

  sender = `${process.env.MAIL_FROM_NAME} <${process.env.MAIL_FROM_ADDRESS}>`;
};

/**
 * Sends a mail to given `to` address, with given `subject` and `body` using
 * env.MAIL_FROM_NAME and env.MAIL_FROM_ADDRESS.
 * @param to Recipient email address
 * @param subject
 * @param body HTML
 */
export const sendMail = async (to: string, subject: string, body: string) => {
  try {
    await transport.sendMail({
      from: sender,
      to,
      subject,
      html: dressHtml(body),
    });
  } catch (err) {
    console.error("Unable to send email");
    throw err;
  }
};

/**
 * Sends a mail to given `to` address, with given `subject` and `body` using
 * env.MAIL_FROM_NAME and env.MAIL_FROM_ADDRESS. Adds an link button at the
 * end of `body` with `action` and `actionTarget`.
 * @param to Recipient email address
 * @param subject
 * @param body HTML
 * @param action text
 * @param actionTarget URL
 */
export const sendMailCallToAction = async (
  to: string,
  subject: string,
  body: string,
  action: string,
  actionTarget: string
) =>
  sendMail(
    to,
    subject,
    body +
      `<div>
        <a href="${actionTarget}">${action}</a>
      </div>`
  );

/**
 * Wraps given HTML `content` in mail's common body.
 * @param content HTML
 */
const dressHtml = (content: string) => `<div>
  ${content}
</div>`;
