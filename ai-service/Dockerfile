# =====================================================================
# AI Service — proxy a Groq (Llama 3.3)
# Servicio simple: solo Express + fetch a la API de Groq.
# =====================================================================

FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev --no-audit --no-fund

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

RUN apk add --no-cache wget

COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY server.js ./
COPY skills-catalog.js ./

RUN addgroup -S app && adduser -S app -G app && chown -R app:app /app
USER app

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3001/health || exit 1

CMD ["node", "server.js"]
