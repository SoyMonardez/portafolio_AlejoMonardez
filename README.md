# Portfolio — Alejo Monárdez

Portafolio personal full-stack. JavaScript de punta a punta.

## Stack

- **Frontend:** React 18 + Vite + Tailwind CSS + Framer Motion + GSAP
- **Backend:** Node.js + Express + MySQL 8 ([backend/](backend/))
- **AI Service:** Node.js + Groq (Llama 3.3) ([ai-service/](ai-service/))
- **DB:** MySQL (esquema en [setup.sql](setup.sql))

## Estructura

```
portafolio web moñi/
├── src/              Frontend React
├── public/           Estáticos públicos (incluye notification-sw.js)
├── backend/          API REST Node (auth, proyectos, mensajes, settings, upload)
├── ai-service/       Microservicio de IA para el admin (Groq)
├── uploads/          Imágenes subidas por el admin (gitignored)
├── docs/             Documentación de deploy
├── setup.sql         Esquema de la DB
└── index.html        Entry del frontend
```

## Setup local (3 servicios en paralelo)

```bash
# 1. Frontend (terminal 1)
npm install
npm run dev          # → http://localhost:5173

# 2. Backend (terminal 2)
cd backend
npm install
cp .env.example .env  # editar DB pass, JWT_SECRET, SMTP_*
npm run dev          # → http://localhost:3000

# 3. AI service (terminal 3)
cd ai-service
npm install
cp .env.example .env  # editar GROQ_API_KEY
npm start            # → http://localhost:3001
```

**Base de datos** (una sola vez):
```bash
mysql -u root -p
CREATE DATABASE portfolio_moni CHARACTER SET utf8mb4;
EXIT;
mysql -u root -p portfolio_moni < setup.sql
```

**Crear admin** (después del setup):
```bash
cd backend
node scripts/create-admin.js <usuario> <password>
```

## Deploy en VPS

Ver [docs/DEPLOY.md](docs/DEPLOY.md) — setup completo con PM2 + Nginx + SSL.

## Características destacadas

- **Editor de proyectos asistido por IA** — sugiere título, descripción bilingüe (ES+EN), badge, categoría, tecnologías. Groq + Llama 3.3 70B (gratis).
- **Notificaciones de contacto** — Service Worker + sonido + email automático (Gmail SMTP) cuando alguien escribe desde el formulario.
- **Anti-bot scrapers** — el email del portfolio jamás aparece en plano en el HTML. Se sirve ofuscado (base64+reversed) y se decodifica solo al click. Honeypot + rate limiting en el formulario de contacto.
- **i18n nativo** — todos los proyectos tienen versión ES y EN. Toggle en el header.
- **Auth JWT** — login con bcrypt, tokens firmados, rate limiting en login.

## Convenciones de código

- Backend organizado en capas: `routes → services → repositories → db`. Cada capa solo conoce la de abajo.
- Errores tipados (`HttpError`) que el middleware central serializa.
- `async/await` en todo el stack (sin callbacks).
- Variables sensibles SOLO en `.env`. Nunca commiteadas.
