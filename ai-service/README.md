# AI Service — Portfolio Admin

Microservicio Node.js que asiste al admin del portfolio con IA (Groq + Llama 3.3).

## Qué hace

- **`POST /assist`** — endpoint principal. Toma lo que el usuario tenga cargado y devuelve:
  - Título / badge / descripción optimizados en **ES + EN**
  - 3 sugerencias alternativas de título
  - Keys de tecnologías inferidas (del catálogo `src/data/skills.jsx`)
- **`POST /suggest-title`** — 5 nombres creativos a partir de descripción/categoría
- **`POST /suggest-tech`** — infiere stack tecnológico desde texto libre
- **`GET  /health`** — ping

## Setup (1 vez)

```bash
cd ai-service
npm install
cp .env.example .env
# editar .env y poner tu GROQ_API_KEY (gratis en https://console.groq.com/keys)
```

## Correr

```bash
npm run dev   # con auto-reload
# o
npm start
```

Por defecto escucha en `http://localhost:3001`.

## Frontend

El `ProjectEditor` llama a la URL definida en `src/config.js` → `AI_URL`.
En desarrollo apunta a `http://localhost:3001`. En producción, cambiarla por la URL pública del servicio (ver "Deploy" más abajo).

## Seguridad

Si seteás `AI_SHARED_TOKEN` en `.env`, el servicio rechaza pedidos sin ese header `Authorization`.
Útil cuando lo deployás público para que no te consuman la cuota de Groq.

El frontend manda el mismo token (lee `VITE_AI_TOKEN` desde `.env` del proyecto raíz si existe).

## Deploy gratuito

Hostinger no corre Node, así que tenés 3 opciones:

1. **Local only** — correrlo en tu máquina cuando uses el admin (más simple, sin costo, sin deploy)
2. **Render.com** — Free web service, deploy desde GitHub. Sleeps tras 15min de inactividad.
3. **Fly.io / Railway** — siempre activo, requieren tarjeta pero tienen free tier.

Para 1: solo `npm start` y listo. Asegurate de que en producción del frontend, `AI_URL` apunte a tu IP local pública o usá un túnel (ngrok, cloudflared).
