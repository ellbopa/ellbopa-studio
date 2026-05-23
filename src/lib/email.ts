import nodemailer from "nodemailer";

type EmailOptions = {
  to: string;
  subject: string;
  html: string;
};

function ellbopaShell(content: string) {
  return `
  <div style="margin:0;background:#050505;color:#fff;font-family:Arial,sans-serif;padding:32px">
    <div style="max-width:620px;margin:0 auto;border:1px solid rgba(217,164,65,.24);border-radius:18px;background:linear-gradient(145deg,#151518,#070707);overflow:hidden">
      <div style="padding:28px;border-bottom:1px solid rgba(255,255,255,.08)">
        <div style="font-size:12px;letter-spacing:4px;color:#d9a441;text-transform:uppercase">Ellbopa Music</div>
        <h1 style="margin:10px 0 0;font-size:30px;line-height:1.05">Tu sonido premium empieza aqui</h1>
      </div>
      <div style="padding:28px;color:#e8e8e8;line-height:1.7">${content}</div>
      <div style="padding:22px 28px;color:#9b9b9b;font-size:12px;border-top:1px solid rgba(255,255,255,.08)">
        Santo Domingo RD · Invivienda / Los Mina · WhatsApp +1 809-590-3643
      </div>
    </div>
  </div>`;
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    console.log(`[email:dev] ${subject} -> ${to}`);
    console.log(html);
    return;
  }

  const transporter = nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: { user, pass }
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM ?? "Ellbopa Music <no-reply@ellbopastudio.com>",
    to,
    subject,
    html
  });
}

export async function sendOtpEmail(to: string, code: string) {
  await sendEmail({
    to,
    subject: "Tu codigo Ellbopa Music",
    html: ellbopaShell(`
      <p>Usa este codigo para verificar tu cuenta. Expira en 10 minutos.</p>
      <div style="margin:26px 0;padding:18px 22px;border-radius:14px;background:#0b0b0c;border:1px solid rgba(229,9,20,.45);font-size:34px;font-weight:800;letter-spacing:10px;color:#d9a441;text-align:center">${code}</div>
      <p>Si no creaste esta cuenta, puedes ignorar este mensaje.</p>
    `)
  });
}

export async function sendResetEmail(to: string, resetUrl: string) {
  await sendEmail({
    to,
    subject: "Recupera tu acceso a Ellbopa Music",
    html: ellbopaShell(`
      <p>Recibimos una solicitud para cambiar tu password.</p>
      <p><a href="${resetUrl}" style="display:inline-block;background:#e50914;color:#fff;padding:13px 18px;border-radius:10px;text-decoration:none;font-weight:800">Cambiar password</a></p>
      <p>Este enlace expira en 30 minutos.</p>
    `)
  });
}

export async function sendPaymentEmail(to: string, title: string, amount: string, downloadUrl?: string) {
  await sendEmail({
    to,
    subject: "Pago confirmado en Ellbopa Music",
    html: ellbopaShell(`
      <p>Confirmamos tu pago de <strong>${amount}</strong> para <strong>${title}</strong>.</p>
      <p>Tu orden ya fue actualizada automaticamente. Si es una reserva, queda separada tras el deposito obligatorio.</p>
      ${
        downloadUrl
          ? `<p><a href="${downloadUrl}" style="display:inline-block;background:#e50914;color:#fff;padding:13px 18px;border-radius:10px;text-decoration:none;font-weight:800">Abrir descarga privada</a></p><p style="font-size:13px;color:#aaa">Este link requiere iniciar sesion con la misma cuenta que hizo la compra.</p>`
          : ""
      }
    `)
  });
}
