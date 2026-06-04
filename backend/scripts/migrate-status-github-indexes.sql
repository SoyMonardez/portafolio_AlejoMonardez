-- =====================================================
-- Migración: columnas status/github_url + índices
-- =====================================================
-- Alinea una DB EXISTENTE con el código actual sin borrar datos.
-- A diferencia de setup.sql (que dropea y recrea), esto es seguro en prod.
--
--   LOCAL:  mysql -u root portfolio_moni < backend/scripts/migrate-status-github-indexes.sql
--   VPS:    mysql -u root -p portfolio_moni < backend/scripts/migrate-status-github-indexes.sql
--
-- Idempotente: usa IF NOT EXISTS (MariaDB 10.0+ / MySQL 8 para índices).
-- Si tu motor no soporta IF NOT EXISTS en ADD COLUMN, corré solo las líneas
-- que falten (dará error "Duplicate column" en las que ya existan, sin daño).
-- =====================================================

-- projects: columnas que el código ya lee/escribe pero faltaban en el schema.
-- `credentials` se introdujo en el commit de SEO/credenciales pero las DB
-- creadas desde db_export.sql (dump viejo) no la tienen → SELECT rompía con 500.
ALTER TABLE projects
    ADD COLUMN IF NOT EXISTS status      VARCHAR(20)  DEFAULT 'production' AFTER demo_url,
    ADD COLUMN IF NOT EXISTS github_url  VARCHAR(255) DEFAULT ''           AFTER status,
    ADD COLUMN IF NOT EXISTS credentials JSON         NULL                 AFTER tech;

-- Índices para las consultas calientes (listado público y bandeja)
ALTER TABLE projects
    ADD INDEX IF NOT EXISTS idx_featured_sort (featured, sort_order);

ALTER TABLE messages
    ADD INDEX IF NOT EXISTS idx_created_at (created_at);
