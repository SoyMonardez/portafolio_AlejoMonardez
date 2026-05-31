# Deploy en VPS Hostinger con Docker

Guía completa para deployar todo el stack en tu VPS de Hostinger usando Docker.
Asumimos Ubuntu 22.04+ con dominio `alejomonardez.com` apuntando a la IP del VPS.

## Arquitectura final

```
Internet
   │
   ▼
Nginx del host (puerto 80/443, SSL con Certbot)
   │
   ▼ proxy_pass
localhost:8080
   │
   ▼
┌──────────────────────────────────────────────┐
│  Container "frontend" (Nginx interno)        │
│                                              │
│  /            → SPA estático (dist/)         │
│  /api/*       → backend:3000                 │
│  /ai/*        → ai-service:3001              │
│  /uploads/*   → volumen compartido           │
└──────────────────────────────────────────────┘
              │           │
              ▼           ▼
       ┌──────────┐  ┌──────────┐
       │ backend  │  │ ai-svc   │
       │  Node    │  │  Node    │
       └────┬─────┘  └──────────┘
            │
            ▼
       ┌──────────┐
       │  mysql   │
       │   8.0    │
       └──────────┘
```

---

## 1. Preparar el VPS (una sola vez)

```bash
ssh root@TU_IP_DEL_VPS

# Docker + compose plugin
curl -fsSL https://get.docker.com | sh
apt install -y docker-compose-plugin git nginx certbot python3-certbot-nginx

# Verificar
docker --version
docker compose version
```

## 2. Clonar el código

```bash
mkdir -p /var/www
cd /var/www
git clone https://github.com/TU_USUARIO/portafolio.git portfolio
cd portfolio
```

## 3. Configurar variables de entorno

```bash
cp .env.docker.example .env
nano .env
```

Completá todos los valores. Para generar el `JWT_SECRET`:
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

> **Importante:** asegurate de que `db_export.sql` esté en la raíz del proyecto.
> Es el dump de tu DB local. Se carga automáticamente la primera vez que arranca MySQL.

## 4. Levantar el stack

```bash
docker compose up -d --build
```

Verificá que todo levantó:
```bash
docker compose ps
```

Tienen que aparecer 4 containers en estado `healthy` o `running`:
- `portfolio-mysql`
- `portfolio-backend`
- `portfolio-ai`
- `portfolio-frontend`

Logs en vivo:
```bash
docker compose logs -f                    # todos
docker compose logs -f backend            # solo uno
```

## 5. Configurar el Nginx del host (TLS + dominio)

```bash
nano /etc/nginx/sites-available/portfolio
```

```nginx
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
    }
}
```

Activar y certificado:
```bash
ln -s /etc/nginx/sites-available/portfolio /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

certbot --nginx -d alejomonardez.com -d www.alejomonardez.com
```

Listo — `https://alejomonardez.com` ya debería responder con tu portfolio.

---

## Operaciones comunes

### Actualizar después de hacer `git push`

```bash
cd /var/www/portfolio
git pull
docker compose up -d --build
```

Compose rebuildea solo los containers que cambiaron. Tarda ~30s normalmente.

### Crear/cambiar un admin

```bash
docker compose exec backend node scripts/create-admin.js alejo NuevoPassword
```

### Backup manual de la DB

```bash
docker compose exec mysql mysqldump -u root -p"$MYSQL_ROOT_PASSWORD" portfolio_moni \
    > backups/portfolio_$(date +%Y%m%d_%H%M).sql
```

### Backup automático (cron diario)

```bash
crontab -e
```
```
0 3 * * * cd /var/www/portfolio && docker compose exec -T mysql mysqldump -u root -p"$MYSQL_ROOT_PASSWORD" portfolio_moni | gzip > /var/backups/portfolio_$(date +\%Y\%m\%d).sql.gz
```

### Restart de un servicio puntual

```bash
docker compose restart backend
```

### Ver uso de recursos

```bash
docker stats
```

### Reset total (borra DB y uploads — ¡usar con cuidado!)

```bash
docker compose down -v
docker compose up -d --build
```

### Acceder a la DB

```bash
docker compose exec mysql mysql -u root -p portfolio_moni
```

---

## Troubleshooting

**El backend no arranca, log dice "No se pudo conectar a MySQL"**
- MySQL tarda ~20-30s la primera vez. El backend reintenta vía healthcheck. Esperá un minuto.

**El email no llega**
- Verificá los logs: `docker compose logs backend | grep mail`
- Si dice `BadCredentials`: tu `SMTP_PASS` está mal. Generá nueva App Password en Google.

**Imágenes subidas no se ven**
- Verificá que el volumen `uploads_data` esté montado en ambos containers: `docker compose config | grep -A2 uploads`

**Puerto 8080 ocupado en el host**
- Cambiá `HOST_PORT=8081` en `.env` y reiniciá: `docker compose up -d`
