import { Resend } from "resend";

import { env } from "./env.js";

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

interface SendWelcomeEmailInput {
  to: string;
  studentName: string;
  loginEmail: string;
  password: string;
}

export const sendWelcomeEmail = async (
  dto: SendWelcomeEmailInput,
): Promise<void> => {
  const subject = "Bem-vindo ao TreinoPro.AI";
  const html = `
    <p>Olá, ${dto.studentName}!</p>
    <p>Seu personal trainer cadastrou você no TreinoPro.AI. Use os dados abaixo para acessar o app:</p>
    <p><strong>Login:</strong> ${dto.loginEmail}<br /><strong>Senha:</strong> ${dto.password}</p>
  `;

  if (!resend) {
    console.log(
      `[email] (modo dev, não enviado) Para: ${dto.to} | Assunto: ${subject} | Login: ${dto.loginEmail} | Senha: ${dto.password}`,
    );
    return;
  }

  await resend.emails.send({
    from: env.EMAIL_FROM,
    to: dto.to,
    subject,
    html,
  });
};
