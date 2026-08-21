const { getTransporter } = require('../config/mail');

function frontendUrl() {
  return process.env.FRONTEND_URL || 'http://localhost:5173';
}

function apiUrl() {
  return process.env.APP_URL || `http://localhost:${process.env.PORT || 4000}`;
}

async function sendMail({ to, subject, text, html }) {
  const transporter = getTransporter();
  const from = process.env.SMTP_FROM || 'GPS Tracker <no-reply@gps-tracker.local>';

  if (!transporter) {
    console.log(`[mail] SMTP no configurado, correo simulado -> to: ${to} | subject: ${subject}\n${text}`);
    return;
  }

  await transporter.sendMail({ from, to, subject, text, html });
}

async function sendVerificationEmail(user, token) {
  const verifyUrl = `${apiUrl()}/api/auth/verify/${token}`;

  await sendMail({
    to: user.email,
    subject: 'Verifica tu cuenta - GPS Tracker',
    text: `Hola ${user.name}, verifica tu cuenta visitando: ${verifyUrl}`,
    html: `<p>Hola ${user.name},</p><p>Verifica tu cuenta haciendo clic en el siguiente enlace:</p><p><a href="${verifyUrl}">${verifyUrl}</a></p>`,
  });
}

async function sendDeviceShareInvitation({ toEmail, deviceName, inviterName, permissionLevel, token }) {
  const acceptUrl = `${frontendUrl()}/devices/shares/accept?token=${token}`;

  await sendMail({
    to: toEmail,
    subject: `${inviterName} compartió el dispositivo "${deviceName}" contigo`,
    text: `${inviterName} quiere compartir el dispositivo "${deviceName}" contigo (permiso: ${permissionLevel}). Inicia sesión y acepta la invitación en: ${acceptUrl}`,
    html: `<p>${inviterName} quiere compartir el dispositivo <strong>${deviceName}</strong> contigo (permiso: ${permissionLevel}).</p><p>Inicia sesión y acepta la invitación en: <a href="${acceptUrl}">${acceptUrl}</a></p>`,
  });
}

module.exports = { sendMail, sendVerificationEmail, sendDeviceShareInvitation };
