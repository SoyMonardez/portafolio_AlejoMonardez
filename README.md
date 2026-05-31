# Portfolio — Alejo Monárdez

Portafolio personal full-stack. JavaScript de punta a punta, deploy con Docker.

## Stack

- **Frontend:** React 18 + Vite + Tailwind + Framer Motion + GSAP
- **Backend:** Node.js + Express + MySQL 8 ([backend/](backend/))
- **AI Service:** Node.js + Groq (Llama 3.3) ([ai-service/](ai-service/))
- **Deploy:** Docker Compose (4 containers) + Nginx + Certbot

## Estructura

```
portafolio web moñi/
├── src/              Frontend React
├── public/           Estáticos públicos
├── backend/          API REST Node (auth, proyectos, mensajes, settings, upload)
│   └── Dockerfile
├── ai-service/       Microservicio de IA para el admin
│   └── Dockerfile
├── nginx/            Config del Nginx interno del container frontend
├── uploads/          Imágenes + CV subidos (volumen persistente en prod)
├── docs/             DEPLOY.md con la guía completa
├── Dockerfile        Frontend (build Vite + serve Nginx)
├── docker-compose.yml
├── deploy.sh         Script de deploy/update en el VPS
├── db_export.sql     Dump de la DB (se carga al levantar mysql por primera vez)
└── setup.sql         Template del esquema (alternativa a db_export.sql)
```

## Setup local (sin Docker, para desarrollo)

```bash
# Frontend, backend y ai-service en paralelo (3 terminales en una):
npm install
npm run dev          # arranca los 3 servicios con concurrently
```

URLs:
- Frontend → http://localhost:5173
- Backend  → http://localhost:3000
- AI       → http://localhost:3001

**Configurar entornos** (una sola vez):
```bash
cd backend     && cp .env.example .env && nano .env
cd ../ai-service && cp .env.example .env && nano .env
```

**Crear admin**:
```bash
cd backend && node scripts/create-admin.js <usuario> <password>
```

**Base de datos local** (XAMPP):
```bash
mysql -u root portfolio_moni < setup.sql
```

## Deploy con Docker (VPS Hostinger)

```bash
# Una sola vez en el VPS:
git clone <tu-repo> /var/www/portfolio
cd /var/www/portfolio
cp .env.docker.example .env
nano .env   # completar todos los valores

# Levantar todo:
docker compose up -d --build

# Updates futuros:
bash deploy.sh
```

Guía detallada (Nginx, SSL, backups, troubleshooting): **[docs/DEPLOY.md](docs/DEPLOY.md)**

## Características destacadas

- **Editor de proyectos asistido por IA** — sugiere título, descripción bilingüe (ES+EN), badge, categoría, tecnologías. Soporta upload de manifest (package.json, requirements.txt, etc.) para inferir el stack.
- **Notificaciones de contacto** — Service Worker + sonido + email automático (Gmail SMTP) cuando alguien escribe.
- **Anti-bot scrapers** — email ofuscado server-side, decode on-click. Honeypot + rate limiting en el formulario.
- **CV upload desde admin** — reemplazás el PDF cuando querés, cache-busting automático.
- **i18n nativo** — proyectos en ES y EN, toggle en el header. Mensajes de WhatsApp y email pre-llenados por idioma.
- **Auth JWT** — login con bcrypt, tokens firmados, rate limiting.

## Convenciones

- Backend en capas: `routes → services → repositories → db`.
- Errores tipados (`HttpError`) con middleware central.
- async/await en todo el stack.
- Secretos solo en `.env` (gitignored).
- Docker images multi-stage, usuarios no-root, healthchecks.
