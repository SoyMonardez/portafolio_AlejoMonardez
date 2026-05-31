#!/usr/bin/env bash
# =====================================================================
# Setup nginx + SSL en el VPS (correr UNA VEZ después de:
#   1. Que el DNS de alejomonardez.com apunte a la IP del VPS
#   2. Que deploy_to_vps.sh ya haya levantado los containers
#
# Ejecutar ASÍ desde tu máquina local:
#   ssh root@177.7.53.193 'bash -s' < setup_nginx_ssl_vps.sh
# =====================================================================

set -euo pipefail

DOMAIN="alejomonardez.com"
WWW_DOMAIN="www.alejomonardez.com"

# Instalar nginx + certbot si faltan
if ! command -v nginx >/dev/null; then
    apt-get update
    apt-get install -y nginx certbot python3-certbot-nginx
fi

# Config nginx para proxear al container frontend (puerto 8080)
cat > /etc/nginx/sites-available/portfolio <<'NGINX'
server {
    listen 80;
    server_name alejomonardez.com www.alejomonardez.com;

    client_max_body_size 12M;

    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 60s;
    }
}
NGINX

# Activar
ln -sf /etc/nginx/sites-available/portfolio /etc/nginx/sites-enabled/portfolio
rm -f /etc/nginx/sites-enabled/default

# Test config y reload
nginx -t
systemctl reload nginx

echo ""
echo "✓ Nginx configurado. Probando si el DNS apunta acá..."
if dig +short "$DOMAIN" | grep -q .; then
    echo "  DNS de $DOMAIN responde."
    echo ""
    echo "→ Solicitando certificado SSL de Let's Encrypt..."
    certbot --nginx -d "$DOMAIN" -d "$WWW_DOMAIN" --non-interactive --agree-tos --register-unsafely-without-email --redirect
    echo ""
    echo "✓ HTTPS activo. Visitá https://$DOMAIN"
else
    echo "  ⚠ El DNS de $DOMAIN todavía no apunta a este VPS."
    echo "  Configurá en tu proveedor:"
    echo "    A    @     →  $(curl -sf ifconfig.me)"
    echo "    A    www   →  $(curl -sf ifconfig.me)"
    echo "  Esperá la propagación (5-30 min) y volvé a correr:"
    echo "    certbot --nginx -d $DOMAIN -d $WWW_DOMAIN"
fi
