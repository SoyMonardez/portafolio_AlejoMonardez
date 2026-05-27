# Backend del Portfolio

API REST en Node.js + Express + MySQL. Reemplaza completamente la carpeta `/api` de PHP.

## Estructura

```
backend/src/
├── config/         configuración: env, db pool, mailer
├── repositories/   acceso a DB (SQL puro)
├── services/       lógica de negocio
├── routes/         handlers HTTP (thin)
├── middlewares/    auth JWT, errores, rate-limit
├── utils/          slug, errores tipados, ofuscación
├── app.js          construye la Express app
└── server.js       entry point (arranca server + chequea DB)
```

Cada capa solo conoce la de abajo: `routes → services → repositories → db`. Permite testear y mantener fácil.

## Setup local

```bash
cd backend
npm install
cp .env.example .env
# editar .env: DB pass, JWT_SECRET, SMTP_*
npm run dev
```

Por defecto escucha en `http://localhost:3000`.

## Endpoints

| Método | Path | Auth | Descripción |
|---|---|---|---|
| POST | `/auth/login` | — | Login admin → JWT |
| GET | `/projects` | — | Lista pública (`?featured=1` filtra) |
| POST | `/projects` | ✓ | Crear |
| PUT | `/projects/:id` | ✓ | Actualizar |
| DELETE | `/projects/:id` | ✓ | Eliminar |
| POST | `/upload` | ✓ | Subir imagen (multipart `file`) |
| GET | `/messages` | ✓ | Inbox |
| DELETE | `/messages/:id` | ✓ | Borrar mensaje |
| POST | `/contact` | — | Formulario público (rate-limited) |
| GET | `/settings` | — | Settings públicas (emails ofuscados) |
| GET | `/settings/raw` | ✓ | Settings sin ofuscar |
| PUT | `/settings` | ✓ | Actualizar settings |

## Notificaciones por email (Gmail SMTP)

1. Activá 2FA en tu cuenta Google.
2. Generá un App Password en https://myaccount.google.com/apppasswords (selección: "Mail" + "Other").
3. Pegá el password de 16 chars en `SMTP_PASS` en `.env`.
4. Reiniciá el server. Al loguearse verás `Notificaciones por email: ON`.

## Deploy en tu VPS de Hostinger

Ver [../docs/DEPLOY.md](../docs/DEPLOY.md) para el setup completo con PM2 + Nginx.
