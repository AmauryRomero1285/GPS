const { getTransporter } = require("../config/mail");

function frontendUrl() {
  return process.env.FRONTEND_URL || "http://localhost:5173";
}

function apiUrl() {
  return process.env.APP_URL || `http://localhost:${process.env.PORT || 4000}`;
}

async function sendMail({ to, subject, text, html }) {
  const transporter = getTransporter();
  const from =
    process.env.SMTP_FROM || "GPS Tracker <no-reply@gps-tracker.local>";

  if (!transporter) {
    console.log(
      `[mail] SMTP no configurado, correo simulado -> to: ${to} | subject: ${subject}\n${text}`,
    );
    return;
  }

  // Un fallo de entrega (SMTP caído, credenciales revocadas, red) no debe tumbar
  // la petición que lo disparó: el registro/reenvío ya persistió en la BD.
  try {
    transporter.sendMail({ from, to, subject, text, html });
  } catch (error) {
    console.error(`[mail] Falló el envío a ${to}:`, error.message);
  }
}

async function sendVerificationEmail(user, token) {
  const verifyUrl = `${apiUrl()}/api/auth/verify/${token}`;
  const logo = `${apiUrl()}/assets/icon.png`;

  const html = `
    <div style="font-family: Inter, Arial, sans-serif; color: #0f172a;">
      <div style="display:flex;align-items:center;gap:12px">
        <img src="${logo}" alt="locfar" style="width:48px;height:48px;border-radius:8px" />
        <h2 style="margin:0">Bienvenido a locfar</h2>
      </div>
      <p>Hola <strong>${user.name}</strong>,</p>
      <p>Gracias por crear una cuenta en <strong>locfar</strong>. Para activar tu cuenta, haz clic en el siguiente botón:</p>
      <p><a href="${verifyUrl}" style="display:inline-block;padding:10px 14px;border-radius:8px;background:#111827;color:#fff;text-decoration:none">Verificar cuenta</a></p>
      <p style="color:#6b7280;font-size:13px">Si el botón no funciona, copia y pega esta URL en tu navegador:</p>
      <pre style="background:#f3f4f6;padding:8px;border-radius:6px;overflow:auto">${verifyUrl}</pre>
      <p style="margin-top:18px;color:#94a3b8;font-size:13px">— El equipo de locfar</p>
    </div>
  `;

  await sendMail({
    to: user.email,
    subject: "Verifica tu cuenta — locfar",
    text: `Hola ${user.name}, verifica tu cuenta: ${verifyUrl}`,
    html,
  });
}

async function sendDeviceShareInvitation({
  toEmail,
  deviceName,
  inviterName,
  permissionLevel,
  token,
}) {
  const acceptUrl = `${frontendUrl()}/devices/shares/accept?token=${token}`;
  const html = `
    <div style="font-family:Inter, Arial, sans-serif;color:#0f172a">
      <p><strong>${inviterName}</strong> ha compartido el dispositivo <strong>${deviceName}</strong> contigo.</p>
      <p>Permiso: <strong>${permissionLevel}</strong></p>
      <p>Puedes aceptar la invitación aquí:</p>
      <p><a href="${acceptUrl}" style="color:#111827">${acceptUrl}</a></p>
      <p style="color:#94a3b8;font-size:13px">Si no esperabas esta invitación, ignora este correo.</p>
    </div>
  `;

  await sendMail({
    to: toEmail,
    subject: `${inviterName} compartió el dispositivo "${deviceName}" contigo`,
    text: `${inviterName} ha compartido el dispositivo "${deviceName}" contigo. Acepta en: ${acceptUrl}`,
    html,
  });
}

async function sendPasswordResetEmail(user, token) {
  const resetUrl = `${frontendUrl()}/reset-password?token=${token}&email=${encodeURIComponent(user.email)}`;
  const html = `
    <div style="font-family:Inter, Arial, sans-serif;color:#0f172a">
      <p>Hola <strong>${user.name}</strong>,</p>
      <p>Has solicitado restablecer tu contraseña. Usa el siguiente código para continuar:</p>
      <p style="font-size:20px;letter-spacing:4px;font-weight:700;background:#f3f4f6;padding:10px;border-radius:8px;display:inline-block">${token}</p>
      <p>O haz clic en el enlace para restablecerla:</p>
      <p><a href="${resetUrl}" style="color:#111827">Restablecer contraseña</a></p>
      <p style="color:#94a3b8;font-size:13px">Este enlace expirará en 1 hora. Si no solicitaste este cambio, ignora este mensaje.</p>
    </div>
  `;

  await sendMail({
    to: user.email,
    subject: "Restablece tu contraseña — locfar",
    text: `Hola ${user.name}, usa el código ${token} para restablecer tu contraseña o visita: ${resetUrl}`,
    html,
  });
}

module.exports = {
  sendMail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendDeviceShareInvitation,
};
