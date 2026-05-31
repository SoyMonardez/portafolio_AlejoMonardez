#!/usr/bin/env bash
# =====================================================================
# Deploy local → VPS Hostinger (177.7.53.193)
#
# Lo que hace:
#   1. Empaqueta el proyecto con tar (excluye node_modules, .git, etc.)
#   2. Lo sube por SSH al VPS
#   3. Instala Docker si falta
#   4. Levanta el stack con docker compose
#   5. Healthcheck de los 3 servicios
#
# Usa tar+ssh para que funcione en Git Bash, WSL, Linux y Mac sin extras.
#
# Uso:   bash deploy_to_vps.sh
# =====================================================================

set -euo pipefail

VPS_IP="177.7.53.193"
VPS_USER="root"
VPS_PATH="/var/www/portfolio"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}  Portfolio · Deploy a VPS ${VPS_IP}${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Verificar .env
if [ ! -f ".env" ]; then
    echo -e "${RED}❌ Falta .env en la raíz. Generalo primero.${NC}"
    exit 1
fi

# Verificar SSH
echo -e "${YELLOW}→ Probando SSH a ${VPS_USER}@${VPS_IP}...${NC}"
if ! ssh -o ConnectTimeout=10 -o BatchMode=yes "${VPS_USER}@${VPS_IP}" "echo ok" >/dev/null 2>&1; then
    echo -e "${RED}❌ SSH falló. Asegurate de que tu clave esté en el VPS, o usá ssh-agent.${NC}"
    exit 1
fi
echo -e "${GREEN}  ✓ SSH OK${NC}"

# Paso 1: instalar Docker en el VPS si falta
echo ""
echo -e "${YELLOW}→ Verificando Docker en el VPS...${NC}"
ssh "${VPS_USER}@${VPS_IP}" 'bash -s' <<'REMOTE'
set -e
if ! command -v docker >/dev/null; then
    echo "  Instalando Docker..."
    curl -fsSL https://get.docker.com | sh
fi
if ! docker compose version >/dev/null 2>&1; then
    echo "  Instalando docker compose plugin..."
    apt-get install -y docker-compose-plugin >/dev/null
fi
mkdir -p /var/www/portfolio
echo "  Docker:  $(docker --version)"
echo "  Compose: $(docker compose version)"
REMOTE

# Paso 2: empaquetar y subir
echo ""
echo -e "${YELLOW}→ Empaquetando y subiendo proyecto...${NC}"
tar czf - \
    --exclude='node_modules' \
    --exclude='.git' \
    --exclude='.claude' \
    --exclude='.agent' \
    --exclude='dist' \
    --exclude='*.log' \
    --exclude='.mcp.json' \
    --exclude='deploy_to_vps.sh' \
    --exclude='setup_nginx_ssl_vps.sh' \
    -C . . | \
ssh "${VPS_USER}@${VPS_IP}" "mkdir -p ${VPS_PATH} && tar xzf - -C ${VPS_PATH} && echo '  ✓ Archivos copiados.'"

# Paso 3: docker compose up
echo ""
echo -e "${YELLOW}→ Levantando containers (puede tardar 2-5 min la primera vez)...${NC}"
ssh "${VPS_USER}@${VPS_IP}" "cd ${VPS_PATH} && docker compose up -d --build 2>&1 | tail -40"

# Paso 4: healthchecks
echo ""
echo -e "${YELLOW}→ Esperando healthchecks (30s)...${NC}"
sleep 30

ssh "${VPS_USER}@${VPS_IP}" 'bash -s' <<'REMOTE'
echo "Containers:"
docker ps --format "  {{.Names}}: {{.Status}}"
echo ""
echo "Health:"
for entry in "frontend:8080/health" "backend:8080/api/health" "ai:8080/ai/health"; do
    name="${entry%%:*}"
    url="${entry#*:}"
    if curl -sf -o /dev/null --max-time 5 "http://localhost:${url}"; then
        echo "  ✓ $name"
    else
        echo "  ✗ $name (http://localhost:${url})"
    fi
done
REMOTE

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  ✓ Deploy completado${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Tu portfolio ya está accesible en:"
echo "  http://${VPS_IP}:8080"
echo ""
echo "Logs en vivo:"
echo "  ssh ${VPS_USER}@${VPS_IP} \"cd ${VPS_PATH} && docker compose logs -f\""
echo ""
echo "Próximos pasos:"
echo "  1. DNS: en tu proveedor agregá un A record"
echo "       @     →  ${VPS_IP}"
echo "       www   →  ${VPS_IP}"
echo "  2. SSL + dominio: ssh ${VPS_USER}@${VPS_IP} 'bash -s' < setup_nginx_ssl_vps.sh"
