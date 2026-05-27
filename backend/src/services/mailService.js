import { getMailer, isMailerEnabled } from '../config/mailer.js';
import { env } from '../config/env.js';

/**
 * Envía notificaciones por email. Falla silencioso (loguea pero no propaga)
 * para que un error en SMTP nunca tire abajo el formulario de contacto.
 *
 * El template está pensado para verse bien en Gmail / Outlook / Apple Mail.
 * Usa tablas e inline-styles porque los clientes de correo no soportan flex/grid
 * ni hojas de estilo externas.
 */
export const mailService = {
    async notifyNewMessage({ name, email, phone, message }) {
        if (!isMailerEnabled()) {
            console.warn('[mail] SMTP no configurado — skip notify');
            return false;
        }

        const mailer  = getMailer();
        const subject = `★ Nuevo mensaje de ${name} — alejomonardez.com`;

        const html = renderHtml({ name, email, phone, message });
        const text = renderPlainText({ name, email, phone, message });

        try {
            await mailer.sendMail({
                from:    `"Alejo Monárdez · Portfolio" <${env.smtp.user}>`,
                to:      env.smtp.notifyTo,
                replyTo: `"${name}" <${email}>`,           // responder desde Gmail = responde al contacto
                subject,
                html,
                text,
                headers: {
                    'X-Portfolio-Source': 'contact-form',
                    'X-Priority': '1',
                },
            });
            return true;
        } catch (err) {
            console.error('[mail] Error enviando notificación:', err.message);
            return false;
        }
    },
};

// ============================================================
// Helpers de renderizado — separados de la lógica de envío
// ============================================================

const escape = (s) => String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

function renderPlainText({ name, email, phone, message }) {
    return [
        '★ NUEVO MENSAJE — alejomonardez.com',
        '',
        `De:      ${name} <${email}>`,
        phone ? `Tel:     ${phone}` : null,
        `Fecha:   ${new Date().toLocaleString('es-AR', { dateStyle: 'long', timeStyle: 'short' })}`,
        '',
        '─────────────────────────────',
        message,
        '─────────────────────────────',
        '',
        'Respondé directamente a este email (replyTo configurado al contacto).',
        'O entrá al panel: https://alejomonardez.com/admin',
    ].filter(Boolean).join('\n');
}

function renderHtml({ name, email, phone, message }) {
    const date = new Date().toLocaleString('es-AR', {
        dateStyle: 'long',
        timeStyle: 'short',
    });

    // Botones de acción rápida — abren WhatsApp / mailto / panel
    const replyMailUrl = `mailto:${email}?subject=${encodeURIComponent('Re: tu consulta — alejomonardez.com')}&body=${encodeURIComponent(`Hola ${name},\n\nGracias por escribirme.\n\n— Tu mensaje —\n${message}\n— Fin —\n\n`)}`;
    const phoneDigits  = phone ? phone.replace(/\D/g, '') : '';
    const whatsappUrl  = phoneDigits.length >= 6
        ? `https://wa.me/${phoneDigits}?text=${encodeURIComponent(`Hola ${name}, te respondo por tu consulta en alejomonardez.com:\n\n> ${message.slice(0, 100)}${message.length > 100 ? '...' : ''}\n\n`)}`
        : null;

    const phoneRow = phone ? `
      <tr>
        <td style="padding:14px 0 14px 24px;color:#888;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;width:90px;border-top:1px solid #1f1f1f;">Tel</td>
        <td style="padding:14px 24px 14px 0;color:#fff;font-size:14px;border-top:1px solid #1f1f1f;">
          <a href="tel:${escape(phone)}" style="color:#fff;text-decoration:none;">${escape(phone)}</a>
        </td>
      </tr>` : '';

    const whatsappButton = whatsappUrl ? `
      <a href="${whatsappUrl}" style="display:inline-block;background:#25D366;color:#0a0a0a;padding:12px 24px;text-decoration:none;font-size:11px;letter-spacing:0.25em;text-transform:uppercase;font-weight:bold;margin:0 4px 8px 0;">
        WhatsApp →
      </a>` : '';

    return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Nuevo mensaje — alejomonardez.com</title>
</head>
<body style="margin:0;padding:0;background:#000;font-family:'Helvetica Neue',Arial,sans-serif;color:#fff;-webkit-font-smoothing:antialiased;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#000;">
    <tr>
      <td align="center" style="padding:48px 16px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;width:100%;background:#0a0a0a;border:1px solid #1f1f1f;">

          <!-- Header monograma -->
          <tr>
            <td style="padding:32px 32px 24px 32px;border-bottom:1px solid #1f1f1f;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="font-size:10px;letter-spacing:0.4em;text-transform:uppercase;color:#666;">
                    alejomonardez.com
                  </td>
                  <td align="right" style="font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#666;">
                    ${escape(date)}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Título serif estilo editorial -->
          <tr>
            <td style="padding:48px 32px 8px 32px;">
              <p style="margin:0 0 12px 0;font-size:10px;letter-spacing:0.4em;text-transform:uppercase;color:#888;">
                ★ Nuevo mensaje
              </p>
              <h1 style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:36px;font-weight:normal;line-height:1.1;color:#fff;letter-spacing:-0.5px;">
                ${escape(name)}
              </h1>
              <p style="margin:8px 0 0 0;font-size:13px;color:#888;">
                te escribió desde el formulario de contacto.
              </p>
            </td>
          </tr>

          <!-- Tabla de metadatos -->
          <tr>
            <td style="padding:32px 0 0 0;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">
                <tr>
                  <td style="padding:14px 0 14px 24px;color:#888;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;width:90px;border-top:1px solid #1f1f1f;">Email</td>
                  <td style="padding:14px 24px 14px 0;color:#fff;font-size:14px;border-top:1px solid #1f1f1f;">
                    <a href="mailto:${escape(email)}" style="color:#fff;text-decoration:underline;text-underline-offset:3px;">${escape(email)}</a>
                  </td>
                </tr>
                ${phoneRow}
              </table>
            </td>
          </tr>

          <!-- Mensaje en blockquote -->
          <tr>
            <td style="padding:40px 32px 0 32px;">
              <p style="margin:0 0 12px 0;font-size:10px;letter-spacing:0.4em;text-transform:uppercase;color:#666;">
                Mensaje
              </p>
              <div style="border-left:2px solid #fff;padding:4px 0 4px 20px;">
                <p style="margin:0;font-size:15px;line-height:1.7;color:#e5e5e5;white-space:pre-wrap;font-family:Georgia,'Times New Roman',serif;font-style:italic;">${escape(message)}</p>
              </div>
            </td>
          </tr>

          <!-- CTAs -->
          <tr>
            <td style="padding:40px 32px 32px 32px;">
              <p style="margin:0 0 16px 0;font-size:10px;letter-spacing:0.4em;text-transform:uppercase;color:#666;">
                Responder
              </p>
              ${whatsappButton}
              <a href="${replyMailUrl}" style="display:inline-block;background:#fff;color:#000;padding:12px 24px;text-decoration:none;font-size:11px;letter-spacing:0.25em;text-transform:uppercase;font-weight:bold;margin:0 4px 8px 0;">
                Email →
              </a>
              <a href="https://alejomonardez.com/admin" style="display:inline-block;background:transparent;border:1px solid #333;color:#fff;padding:11px 23px;text-decoration:none;font-size:11px;letter-spacing:0.25em;text-transform:uppercase;margin:0 4px 8px 0;">
                Panel
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 32px 32px 32px;border-top:1px solid #1f1f1f;">
              <p style="margin:0;font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:#555;line-height:1.7;">
                Notificación automática · alejomonardez.com<br>
                Respondé este email para contactar directo a <span style="color:#888;">${escape(name)}</span>.
              </p>
            </td>
          </tr>

        </table>

        <!-- Mini-firma fuera del card -->
        <p style="margin:24px 0 0 0;font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:#444;text-align:center;">
          ALEJO · MONÁRDEZ · SOFTWARE · ENGINEER
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
