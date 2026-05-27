/**
 * Configuración del frontend. Las URLs apuntan al backend Node.js
 * (carpeta /backend), no al viejo /api PHP que ya no existe.
 *
 * En producción, Nginx en el VPS hace reverse proxy de
 *   https://alejomonardez.com/api  →  http://localhost:3000
 *   https://alejomonardez.com/ai   →  http://localhost:3001
 */
const isProduction = window.location.hostname !== 'localhost';

export const API_URL = import.meta.env.VITE_API_URL
    || (isProduction ? 'https://alejomonardez.com/api' : 'http://localhost:3000');

// Microservicio de IA (carpeta /ai-service)
export const AI_URL = import.meta.env.VITE_AI_URL
    || (isProduction ? 'https://alejomonardez.com/ai' : 'http://localhost:3001');

// Token compartido OPCIONAL para autenticar al servicio de IA
export const AI_TOKEN = import.meta.env.VITE_AI_TOKEN || '';
