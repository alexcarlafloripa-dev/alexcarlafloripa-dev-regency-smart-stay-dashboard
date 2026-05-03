/**
 * emailService.ts — Envio de e-mail com anexo via SMTP/Nodemailer
 *
 * Configuração via variáveis de ambiente:
 *   EMAIL_HOST     — servidor SMTP (ex: smtp.gmail.com)
 *   EMAIL_PORT     — porta SMTP (ex: 587)
 *   EMAIL_USER     — usuário/e-mail remetente
 *   EMAIL_PASS     — senha ou App Password
 *   EMAIL_FROM     — nome exibido no remetente (opcional)
 */

import nodemailer from "nodemailer";

interface SendReservationEmailOptions {
  to: string[];
  subject: string;
  html: string;
  attachments?: Array<{
    filename: string;
    content: Buffer;
    contentType?: string;
  }>;
}

function createTransporter() {
  const host = process.env.EMAIL_HOST;
  const port = parseInt(process.env.EMAIL_PORT || "587", 10);
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!host || !user || !pass) {
    console.warn("[EmailService] Credenciais SMTP não configuradas. E-mail não será enviado.");
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

export async function sendReservationEmail(options: SendReservationEmailOptions): Promise<boolean> {
  const transporter = createTransporter();
  if (!transporter) return false;

  const from = process.env.EMAIL_FROM
    ? `"${process.env.EMAIL_FROM}" <${process.env.EMAIL_USER}>`
    : process.env.EMAIL_USER;

  try {
    await transporter.sendMail({
      from,
      to: options.to.join(", "),
      subject: options.subject,
      html: options.html,
      attachments: options.attachments?.map(att => ({
        filename: att.filename,
        content: att.content,
        contentType: att.contentType || "application/octet-stream",
      })),
    });
    console.log(`[EmailService] E-mail enviado para: ${options.to.join(", ")}`);
    return true;
  } catch (err) {
    console.error("[EmailService] Falha ao enviar e-mail:", err);
    return false;
  }
}

export function buildReservationEmailHtml(data: {
  nomeCliente: string;
  nomeCorretor: string;
  telefoneCorretor: string;
  unitCota: string;
  unitTipologia?: string;
  unitAndar?: string;
  unitValorTotal?: string;
  createdAt: Date;
  driveLink?: string | null;
}): string {
  const dataFormatada = data.createdAt.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; color: #333; background: #f5f5f5; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .header { background: #8B4513; color: #fff; padding: 24px 32px; }
    .header h1 { margin: 0; font-size: 22px; }
    .header p { margin: 4px 0 0; opacity: 0.85; font-size: 14px; }
    .body { padding: 32px; }
    .section { margin-bottom: 24px; }
    .section h2 { font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; color: #8B4513; margin: 0 0 12px; }
    .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f0f0f0; font-size: 14px; }
    .row:last-child { border-bottom: none; }
    .label { color: #666; }
    .value { font-weight: 600; color: #222; }
    .unit-badge { background: #8B4513; color: #fff; display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 16px; font-weight: 700; margin-bottom: 8px; }
    .footer { background: #f9f6f3; padding: 20px 32px; font-size: 12px; color: #999; text-align: center; }
    .alert { background: #fff8f0; border-left: 4px solid #8B4513; padding: 12px 16px; border-radius: 4px; font-size: 13px; color: #555; margin-top: 16px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Nova Ficha de Reserva</h1>
      <p>Regency Square Smart Stay — Canasvieiras, Florianópolis</p>
    </div>
    <div class="body">
      <p style="font-size:14px;color:#555;margin:0 0 24px;">
        Uma nova ficha de reserva foi preenchida em <strong>${dataFormatada}</strong>. 
        O documento Word completo está em anexo.
      </p>

      <div class="section">
        <h2>Unidade Reservada</h2>
        <div class="unit-badge">${data.unitCota}</div>
        <div class="row">
          <span class="label">Tipologia</span>
          <span class="value">${data.unitTipologia || "—"}</span>
        </div>
        <div class="row">
          <span class="label">Andar</span>
          <span class="value">${data.unitAndar || "—"}</span>
        </div>
        ${data.unitValorTotal ? `
        <div class="row">
          <span class="label">Valor Total</span>
          <span class="value">R$ ${Number(data.unitValorTotal).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
        </div>` : ""}
      </div>

      <div class="section">
        <h2>Cliente</h2>
        <div class="row">
          <span class="label">Nome</span>
          <span class="value">${data.nomeCliente}</span>
        </div>
      </div>

      <div class="section">
        <h2>Corretor Responsável</h2>
        <div class="row">
          <span class="label">Nome</span>
          <span class="value">${data.nomeCorretor}</span>
        </div>
        <div class="row">
          <span class="label">Telefone</span>
          <span class="value">${data.telefoneCorretor}</span>
        </div>
      </div>

      <div class="alert">
        📎 A ficha de reserva completa em formato Word (.docx) está em anexo. 
        Abra, revise, converta para PDF e encaminhe para assinatura digital.
      </div>
      ${data.driveLink ? `
      <div style="text-align:center;margin-top:24px;">
        <a href="${data.driveLink}" target="_blank" style="display:inline-block;background:#8B4513;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:700;letter-spacing:0.03em;">
          📂 Abrir Pasta no Google Drive
        </a>
        <p style="font-size:11px;color:#999;margin-top:8px;">Clique para acessar todos os documentos desta reserva</p>
      </div>` : ''}
    </div>
    <div class="footer">
      Regency Square Smart Stay · Canasvieiras, Florianópolis/SC · Mensagem automática gerada pelo sistema de reservas.
    </div>
  </div>
</body>
</html>
  `.trim();
}
