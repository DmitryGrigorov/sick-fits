import nodemailer from 'nodemailer';

const transport = process.env.MAIL_HOST
  ? nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: Number(process.env.MAIL_PORT) || 587,
      auth:
        process.env.MAIL_USER && process.env.MAIL_PASS
          ? {
              user: process.env.MAIL_USER,
              pass: process.env.MAIL_PASS,
            }
          : undefined,
    })
  : nodemailer.createTransport({ jsonTransport: true });

const makeANiceEmail = (text: string): string => `
  <div class="email"
    style="
      border: 1px solid black;
      padding: 20px;
      font-family: sans-serif;
      line-height: 2;
      font-size: 20px;
    "
  >
    <h2>Hello There!</h2>
    <p>${text}</p>

    <p>Kind regards</p>
    <p>Sick Fits</p>
  </div>
`;

export { transport, makeANiceEmail };
