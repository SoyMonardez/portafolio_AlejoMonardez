# =====================================================================
# Backend Node.js — portfolio API REST
# Multi-stage para que la imagen final sea chica (~150 MB).
# =====================================================================

# ---- Stage 1: instalar dependencias de producción ----
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev --no-audit --no-fund

# ---- Stage 2: imagen final ----
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# wget para healthcheck, su-exec para dropear root en el entrypoint
RUN apk add --no-cache wget su-exec

COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY src ./src
COPY scripts ./scripts
COPY entrypoint.sh /entrypoint.sh

# Usuario non-root (lo usa el entrypoint via su-exec después de chownear el volumen)
RUN addgroup -S app && adduser -S app -G app \
    && chown -R app:app /app \
    && chmod +x /entrypoint.sh

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Arranca como root para chownear el volumen y baja a `app` para correr el server
ENTRYPOINT ["/entrypoint.sh"]
