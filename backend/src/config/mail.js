// mail.js
const nodemailer = require('nodemailer');
require('dotenv').config({ quiet: true });

let transporter;

// Si no hay SMTP configurado (p.ej. en desarrollo local sin credenciales),
// getTransporter() retorna null y el mail.service registra el correo en consola
// en vez de fallar.
function getTransporter() {
  if (transporter !== undefined) return transporter;

  if (!process.env.SMTP_HOST) {
    transporter = null;
    return transporter;
  }

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }
      : undefined,
  });

  return transporter;
}

module.exports = { getTransporter };
