#!/bin/sh
# Arregla permisos del volumen al inicio (corre como root),
# después baja privilegios y arranca el server como usuario `app`.
set -e

mkdir -p /var/www/uploads/projects /var/www/uploads/cv
chown -R app:app /var/www/uploads

exec su-exec app node src/server.js
