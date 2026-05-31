/**
 * Configuración del frontend.
 *
 * En producción usamos URLs RELATIVAS (/api, /ai). El Nginx interno del container
 * frontend hace reverse proxy a los servicios backend y ai-service en la red Docker.
 * Esto hace que el sitio funcione igual de bien si lo accedés por:
 *   - http://IP:8080
 *   - http://alejomonardez.com
 *   - https://alejomonardez.com
 *
 * En dev (localhost) apuntamos directo a los puertos del backend Node y ai-service.
 */
const isProduction = window.location.hostname !== 'localhost';

export const API_URL = import.meta.env.VITE_API_URL
    || (isProduction ? '/api' : 'http://localhost:3000');

// Microservicio de IA (carpeta /ai-service)
export const AI_URL = import.meta.env.VITE_AI_URL
    || (isProduction ? '/ai' : 'http://localhost:3001');

// Token compartido OPCIONAL para autenticar al servicio de IA
export const AI_TOKEN = import.meta.env.VITE_AI_TOKEN || '';
