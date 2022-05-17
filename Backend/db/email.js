const nodemailer = require("nodemailer");

const {
  service,
  auth: { user, pass },
} = require("../SQL/email_config");

let transporter = nodemailer.createTransport({
  service,
  auth: {
    user,
    pass,
  },
});

module.exports = transporter;
