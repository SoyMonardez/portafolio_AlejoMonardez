# Deploy en VPS Hostinger

Guía para desplegar todo el stack (frontend + backend + ai-service) en tu VPS.
Asumimos Ubuntu 22.04+ y dominio `alejomonardez.com` apuntando a la IP del VPS.

## Arquitectura final

```
Internet
   │
   ▼
Nginx (puerto 80/443, SSL con Let's Encrypt)
   │
   ├──  /            →  /var/www/portfolio/dist/         (estático, React build)
   ├──  /api/*       →  http://localhost:3000            (backend Node)
   ├──  /ai/*        →  http://localhost:3001            (ai-service)
   └──  /uploads/*   →  /var/www/portfolio/uploads/      (estático)
```

## 1. Servidor base

```bash
# Conectarte al VPS
ssh root@TU_IP

# Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
apt install -y nodejs

# MySQL
apt install -y mysql-server
mysql_secure_installation

# PM2 (process manager) + Nginx
npm install -g pm2
apt install -y nginx certbot python3-certbot-nginx
```

## 2. Código y base de datos

```bash
mkdir -p /var/www/portfolio
cd /var/www/portfolio
# Subí el código (git clone, scp, rsync, lo que prefieras)

# Crear DB
mysql -u root -p
CREATE DATABASE portfolio_moni CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'portfolio'@'localhost' IDENTIFIED BY 'CONTRASEÑA_FUERTE';
GRANT ALL ON portfolio_moni.* TO 'portfolio'@'localhost';
EXIT;

mysql -u portfolio -p portfolio_moni < setup.sql
```

## 3. Backend (Node)

```bash
cd /var/www/portfolio/backend
npm install --omit=dev
cp .env.example .env
nano .env   # llenar: DB_PASS, JWT_SECRET (random 48 bytes), SMTP_*

# Crear admin
node scripts/create-admin.js alejo TuPasswordFuerte

# Arrancar con PM2
pm2 start src/server.js --name portfolio-api
pm2 save
pm2 startup   # ejecutá la línea que te imprime — hace que arranque al boot
```

## 4. AI Service

```bash
cd /var/www/portfolio/ai-service
npm install --omit=dev
cp .env.example .env
nano .env   # llenar GROQ_API_KEY

pm2 start server.js --name portfolio-ai
pm2 save
```

## 5. Frontend (build estático)

```bash
cd /var/www/portfolio
npm install
npm run build
# Resultado: ./dist
```

## 6. Nginx

```bash
nano /etc/nginx/sites-available/portfolio
```

```nginx
server {
    listen 80;
    server_name alejomonardez.com www.alejomonardez.com;
    root /var/www/portfolio/dist;
    index index.html;

    client_max_body_size 10M;

    # Backend Node
    location /api/ {
        proxy_pass http://localhost:3000/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # AI Service
    location /ai/ {
        proxy_pass http://localhost:3001/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Uploads (servidos directo por Nginx, mucho más rápido)
    location /uploads/ {
        alias /var/www/portfolio/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

```bash
ln -s /etc/nginx/sites-available/portfolio /etc/nginx/sites-enabled/
nginx -t   # test config
systemctl reload nginx

# SSL
certbot --nginx -d alejomonardez.com -d www.alejomonardez.com
```

## 7. Actualizaciones futuras

```bash
cd /var/www/portfolio
git pull

# Backend o ai-service
cd backend && npm install --omit=dev && pm2 restart portfolio-api
cd ../ai-service && npm install --omit=dev && pm2 restart portfolio-ai

# Frontend
cd .. && npm install && npm run build
# Nginx sirve dist/ automáticamente, no hace falta restart
```

## 8. Setup del CORS

En `backend/.env`:
```
CORS_ORIGINS=https://alejomonardez.com,https://www.alejomonardez.com
```

## 9. Gmail App Password (notificaciones)

1. Activá 2FA: https://myaccount.google.com/security
2. Generá App Password: https://myaccount.google.com/apppasswords
   - App: Mail · Device: Other → "Portfolio"
3. Pegá los 16 chars en `backend/.env`:
   ```
   SMTP_USER=tucorreo@gmail.com
   SMTP_PASS=xxxxxxxxxxxxxxxx
   NOTIFY_TO=tucorreo@gmail.com
   ```
4. `pm2 restart portfolio-api`

## Verificación

```bash
# ¿Los servicios están vivos?
pm2 list

# Logs en vivo
pm2 logs portfolio-api
pm2 logs portfolio-ai

# Health checks
curl https://alejomonardez.com/api/health
curl https://alejomonardez.com/ai/health
```
