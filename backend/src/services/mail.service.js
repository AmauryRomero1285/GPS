const fs = require("fs");
const path = require("path");
const { getResendClient } = require("../config/mail");

/**
 * Retorna la URL base de la API.
 */
function apiUrl() {
  return process.env.API_URL || "https://locfar.app";
}


 // Carga una plantilla HTML e inyecta las variables dinamicas {{key}}.
 
function renderTemplate(templateName, variables = {}) {
  const templatePath = path.join(__dirname, "..", "templates", `${templateName}.html`);
  let content = fs.readFileSync(templatePath, "utf8");

  Object.keys(variables).forEach((key) => {
    const regex = new RegExp(`{{${key}}}`, "g");
    content = content.replace(regex, variables[key] || "");
  });

  return content;
}

async function sendMail({ to, subject, text, html }) {
  const resend = getResendClient();
  const from = process.env.EMAIL_FROM || "GPS Tracker <onboarding@resend.dev>";

  if (!resend) {
    console.log(
      `[mail] Resend API Key no configurada, correo simulado -> to: ${to} | subject: ${subject}\n${text}`,
    );
    return;
  }

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
  const verifyUrl = `${apiUrl()}/api/auth/verify/${token}`;
  const logo = `${apiUrl()}/public/assets/icon.png`;

  const html = renderTemplate("email-verification", {
    userName: user.name,
    verifyUrl,
    logo,
  });

  await sendMail({
    to: user.email,
    subject: "Verifica tu cuenta — locfar",
    text: `Hola ${user.name}, verifica tu cuenta ingresando a: ${verifyUrl}`,
    html,
  });
}

async function sendPasswordResetEmail(user, token) {
  const logo = `${apiUrl()}/public/assets/icon.png`;

  const html = renderTemplate("password-reset", {
    userName: user.name,
    token,
    logo,
  });

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