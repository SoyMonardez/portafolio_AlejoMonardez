import nodemailer from 'nodemailer';
import { env } from './env.js';

/**
 * Transporter de Nodemailer (Gmail SMTP).
 * Se crea lazy: solo cuando hay credenciales configuradas, así el server arranca
 * aunque todavía no hayas pegado el app password.
 */
let transporter = null;

export function getMailer() {
    if (transporter) return transporter;
    if (!env.smtp.user || !env.smtp.pass) return null;

    transporter = nodemailer.createTransport({
        host:   env.smtp.host,
        port:   env.smtp.port,
        secure: env.smtp.secure,
        auth: {
            user: env.smtp.user,
            pass: env.smtp.pass,
        },
    });
    return transporter;
}

/**
 * Detecta valores reales (no placeholders del .env.example).
 */
const PLACEHOLDERS = ['tu_correo@gmail.com', 'app_password_de_16_chars', 'tu_api_key_aqui'];
const isReal = (v) => !!v && !PLACEHOLDERS.includes(v);

export function isMailerEnabled() {
    return isReal(env.smtp.user) && isReal(env.smtp.pass) && isReal(env.smtp.notifyTo);
}
