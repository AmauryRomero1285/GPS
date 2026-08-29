const { getResendClient } = require("../config/mail");

/**
 * Retorna la URL base de la API.
 * En producción se prioriza process.env.API_URL o la URL del dominio real.
 */
function apiUrl() {
  return process.env.API_URL || "https://locfar.app";
}

async function sendMail({ to, subject, text, html }) {
  const resend = getResendClient();
  const from =
    process.env.EMAIL_FROM || "GPS Tracker <onboarding@resend.dev>";

  if (!resend) {
    console.log(
      `[mail] Resend API Key no configurada, correo simulado -> to: ${to} | subject: ${subject}\n${text}`,
    );
    return;
  }

  // Un fallo de entrega no debe tumbar la petición que lo disparó.
  try {
    const { data, error } = await resend.emails.send({
      from,
      to: [to],
      subject,
      text,
      html,
    });

    if (error) {
      console.error(`[mail] Falló el envío de Resend a ${to}:`, error.message);
    } else {
      console.log(`[mail] Correo enviado con éxito a ${to}. ID:`, data?.id);
    }
  } catch (error) {
    console.error(`[mail] Error crítico enviando correo a ${to}:`, error.message);
  }
}

async function sendVerificationEmail(user, token) {
  // La verificación apunta directamente al endpoint de la API
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

async function sendPasswordResetEmail(user, token) {
  // Para móviles/APK se destaca el token numérico/alfanumérico directamente en el correo
  const html = `
    <div style="font-family:Inter, Arial, sans-serif;color:#0f172a">
      <p>Hola <strong>${user.name}</strong>,</p>
      <p>Has solicitado restablecer tu contraseña. Ingresa el siguiente código en tu aplicación para continuar:</p>
      <p style="font-size:24px;letter-spacing:4px;font-weight:700;background:#f3f4f6;padding:12px 16px;border-radius:8px;display:inline-block;color:#111827">${token}</p>
      <p style="color:#94a3b8;font-size:13px">Este código expirará pronto. Si no solicitaste este cambio, ignora este mensaje.</p>
      <p style="margin-top:18px;color:#94a3b8;font-size:13px">— El equipo de locfar</p>
    </div>
  `;

  await sendMail({
    to: user.email,
    subject: "Restablece tu contraseña — locfar",
    text: `Hola ${user.name}, usa el código ${token} para restablecer tu contraseña en la aplicación locfar.`,
    html,
  });
}

module.exports = {
  sendMail,
  sendVerificationEmail,
  sendPasswordResetEmail,
};