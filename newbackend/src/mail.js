const nodemailer = require('nodemailer');

const transport = nodemailer.createTransport({
  host: "smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "f38de1d5e70afe",
    pass: "3c1f0ecf10d7c8"
  }
});

const makeANiceEmail = text => `
  <div className="email"
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
    <p>Dmitry Grigorov</p>
  </div>
`;

exports.transport = transport;
exports.makeANiceEmail = makeANiceEmail;