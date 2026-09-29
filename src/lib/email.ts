import nodemailer, { type Transporter } from "nodemailer";

let transporter: Transporter | null = null;
let transporterChecked = false;

function getTransporter(): Transporter | null {
  if (transporterChecked) return transporter;
  transporterChecked = true;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) return null;

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  return transporter;
}

export function emailIsConfigured() {
  return getTransporter() !== null;
}

export async function sendEmail({ to, subject, text }: { to: string; subject: string; text: string }) {
  const t = getTransporter();
  if (!t) throw new Error("Email sending is not configured (missing SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS)");

  await t.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    text,
  });
}
