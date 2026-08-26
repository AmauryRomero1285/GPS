const { getResendClient } = require("../config/mail");

async function sendMail({ to, subject, text, html }) {
  const resend = getResendClient();
  const from = process.env.EMAIL_FROM || "locfar <support@locfar.app>";

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
    console.error(
      `[mail] Error crítico enviando correo a ${to}:`,
      error.message,
    );
  }
}
