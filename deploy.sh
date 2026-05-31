#!/bin/bash
# =====================================================================
# Script de deploy / update en el VPS.
# Subilo al servidor y corré:  bash deploy.sh
#
# Hace en orden:
#   1. git pull
#   2. rebuild de containers que cambiaron
#   3. healthcheck de cada servicio
# =====================================================================

set -euo pipefail

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}━━━ Portfolio · Deploy ━━━${NC}"

# Verificar que estamos en la carpeta correcta
if [ ! -f "docker-compose.yml" ]; then
    echo -e "${RED}❌ No se encontró docker-compose.yml — ejecutá esto desde la raíz del proyecto.${NC}"
    exit 1
fi

# Verificar .env
if [ ! -f ".env" ]; then
    echo -e "${RED}❌ Falta .env — copialo desde .env.docker.example y completalo.${NC}"
    exit 1
fi

echo -e "${YELLOW}→ git pull${NC}"
git pull

echo -e "${YELLOW}→ docker compose up -d --build${NC}"
docker compose up -d --build

echo -e "${YELLOW}→ Esperando que los servicios respondan...${NC}"
sleep 8

# Healthchecks
check() {
    local name=$1
    local url=$2
    if curl -sf -o /dev/null --max-time 5 "$url"; then
        echo -e "  ${GREEN}✓${NC} $name"
    else
        echo -e "  ${RED}✗${NC} $name (${url}) — revisar logs"
    fi
}

echo ""
echo -e "${YELLOW}━━━ Health checks ━━━${NC}"
check "frontend" "http://localhost:${HOST_PORT:-8080}/health"
check "backend"  "http://localhost:${HOST_PORT:-8080}/api/health"
check "ai"       "http://localhost:${HOST_PORT:-8080}/ai/health"

echo ""
echo -e "${GREEN}✓ Deploy completado.${NC}"
echo "  Logs:  docker compose logs -f"
echo "  Stop:  docker compose down"
