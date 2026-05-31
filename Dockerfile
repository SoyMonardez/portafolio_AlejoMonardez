# =====================================================================
# Frontend — Vite build + Nginx serve
# Stage 1 compila el bundle estático, stage 2 lo sirve con Nginx
# y proxea /api, /ai, /uploads a los otros containers.
# =====================================================================

# ---- Stage 1: build del bundle estático ----
FROM node:20-alpine AS builder
WORKDIR /app

# Cache de deps
COPY package.json package-lock.json* ./
RUN npm ci --no-audit --no-fund

# Código fuente y assets
COPY index.html ./
COPY vite.config.js ./
COPY tailwind.config.js ./
COPY postcss.config.js ./
COPY src ./src
COPY public ./public

# Build de producción → /app/dist
RUN npm run build

# ---- Stage 2: imagen final con Nginx ----
FROM nginx:alpine AS runtime

# curl para el healthcheck (~2 MB; nginx:alpine no trae nada de eso por defecto)
RUN apk add --no-cache curl

# Reemplazamos la config default
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

# Copiamos el bundle compilado
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -fsS http://localhost/health || exit 1
