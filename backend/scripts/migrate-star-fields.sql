-- =====================================================
-- Migración: campos editoriales Situación/Tarea/Acción/Resultado
-- =====================================================
-- El modal de detalle de proyecto (home, sección Proyectos) muestra un
-- desglose tipo caso de estudio: Situación -> Tarea -> Acción -> Resultado.
-- Antes solo existía hardcodeado en el fallback estático del frontend
-- (FALLBACK_PROJECTS); esto lo suma a la tabla real para que sea editable
-- desde el admin y persista en la DB.
--
--   LOCAL:  mysql -u root portfolio_moni < backend/scripts/migrate-star-fields.sql
--   VPS:    mysql -u root -p portfolio_moni < backend/scripts/migrate-star-fields.sql
--
-- OJO: `ADD COLUMN IF NOT EXISTS` es una extensión de MariaDB, no existe en
-- MySQL estándar (Oracle) — por eso este ALTER va sin esa cláusula. Como las
-- 8 columnas son nuevas (no existían antes), correrlo una vez es seguro. Si
-- se corre dos veces por error, tira "Duplicate column name" — no corrompe
-- datos, solo hay que no volver a ejecutarlo si ya se aplicó.
-- =====================================================

ALTER TABLE projects
    ADD COLUMN situation    TEXT AFTER description_en,
    ADD COLUMN situation_en TEXT AFTER situation,
    ADD COLUMN task         TEXT AFTER situation_en,
    ADD COLUMN task_en      TEXT AFTER task,
    ADD COLUMN action       TEXT AFTER task_en,
    ADD COLUMN action_en    TEXT AFTER action,
    ADD COLUMN result       TEXT AFTER action_en,
    ADD COLUMN result_en    TEXT AFTER result;
