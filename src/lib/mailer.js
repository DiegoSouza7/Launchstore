const nodemailer = require('nodemailer')

module.exports = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "9222fe8a3c71db",
      pass: "ec8f9089aec51e"
    }
  });
