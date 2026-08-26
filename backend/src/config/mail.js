// config/mail.js
const { Resend } = require("resend");
require("dotenv").config({ quiet: true });

let resendInstance;

function getResendClient() {
  if (resendInstance !== undefined) return resendInstance;

  if (!process.env.RESEND_API_KEY) {
    resendInstance = null;
    return resendInstance;
  }

  resendInstance = new Resend(process.env.RESEND_API_KEY);
  return resendInstance;
}

module.exports = { getResendClient };
