-- =====================================================
-- SETUP COMPLETO portfolio_moni
-- =====================================================
-- ÚSALO ASÍ:
--   - LOCAL (XAMPP): phpMyAdmin → crear DB `portfolio_moni` → Importar este archivo.
--   - VPS HOSTINGER: mysql -u root -p portfolio_moni < setup.sql
--
-- Para crear/cambiar admins después del setup:
--   cd backend && node scripts/create-admin.js <username> <password>
--
-- El script BORRA cualquier tabla previa y recrea todo desde cero.
-- =====================================================

SET FOREIGN_KEY_CHECKS = 0;

-- Limpieza
DROP TABLE IF EXISTS settings;
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS admins;

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- TABLA: admins
-- =====================================================
CREATE TABLE admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Usuarios admin.
-- NO se siembran credenciales en este archivo (quedarían versionadas en git).
-- Creá el/los admin después del setup con el script CLI, que hashea la
-- contraseña con bcrypt y nunca la deja en texto plano en el repo:
--
--   cd backend && node scripts/create-admin.js <username> <password>
--
-- El script usa INSERT ... ON DUPLICATE KEY UPDATE, así que sirve tanto para
-- crear el primer admin como para rotar la contraseña de uno existente.

-- =====================================================
-- TABLA: messages (bandeja del formulario de contacto)
-- =====================================================
CREATE TABLE messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(50) DEFAULT '',
    message TEXT NOT NULL,
    is_read TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- La bandeja se lista siempre ordenada por fecha desc.
    KEY idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLA: projects (catálogo de trabajos)
-- =====================================================
CREATE TABLE projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    slug VARCHAR(100) NOT NULL UNIQUE,
    title VARCHAR(150) NOT NULL,
    title_en VARCHAR(150) DEFAULT '',
    category VARCHAR(100) DEFAULT '',
    category_en VARCHAR(100) DEFAULT '',
    badge VARCHAR(100) DEFAULT '',
    badge_en VARCHAR(100) DEFAULT '',
    description_short TEXT,
    description_short_en TEXT,
    description TEXT NOT NULL,
    description_en TEXT,
    situation TEXT,
    situation_en TEXT,
    task TEXT,
    task_en TEXT,
    action TEXT,
    action_en TEXT,
    result TEXT,
    result_en TEXT,
    images JSON NOT NULL,
    demo_url VARCHAR(255) DEFAULT '',
    status VARCHAR(20) DEFAULT 'production',   -- 'production' | 'demo' | 'wip'
    github_url VARCHAR(255) DEFAULT '',
    tech JSON NOT NULL,
    credentials JSON NULL,
    featured TINYINT(1) DEFAULT 0,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    -- El listado público filtra por featured y ordena por sort_order.
    KEY idx_featured_sort (featured, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed editorial de proyectos verificados.
-- Las imágenes y enlaces opcionales se administran desde el Dashboard.
INSERT INTO projects (slug, title, title_en, category, category_en, badge, badge_en, description_short, description_short_en, description, description_en, images, demo_url, status, github_url, tech, credentials, featured, sort_order) VALUES
('miturno','MiTurno','MiTurno','Producto personal','Personal product','SaaS de turnos','Scheduling SaaS','Plataforma SaaS multi-tenant para reservas y gestión de negocios de servicios.','Multi-tenant SaaS for bookings and service-business management.','Centraliza reservas, clientes, servicios y disponibilidad en un mismo sistema, con integraciones de WhatsApp e inteligencia artificial aplicadas a la gestión.','It centralizes bookings, clients, services, and availability in one system, with WhatsApp and applied AI integrations.','[]','','wip','','["python","fastapi","postgres","react","docker"]','[]',1,1),
('finbot-whatsapp','FinBot WhatsApp','FinBot WhatsApp','Producto personal','Personal product','Automatización financiera','Financial automation','Asistente por WhatsApp para registrar y consultar movimientos financieros mediante texto o audio.','WhatsApp assistant for recording and querying financial transactions through text or audio.','Convierte mensajes y audios en movimientos estructurados para facilitar el registro, la categorización y las consultas financieras desde una conversación.','It turns messages and audio into structured transactions for recording, categorizing, and querying finances from a conversation.','[]','','wip','','["python","fastapi","postgres","groq"]','[]',1,2),
('fluxa','Fluxa','Fluxa','Producto personal','Personal product','Gestión operativa','Operations management','Sistema para gestionar proyectos, trabajadores, asistencias, ingresos, gastos y métricas.','System for managing projects, workers, attendance, income, expenses, and metrics.','Reúne información operativa y financiera en paneles de gestión para evitar planillas separadas y facilitar el seguimiento de la actividad.','It brings operational and financial information into management dashboards, replacing disconnected spreadsheets and simplifying activity tracking.','[]','https://fluxa.alejomonardez.com','production','','["react","node","express","mysql","docker"]','[]',1,3),
('etan-construcciones','Etán Construcciones','Etán Construcciones','Trabajo freelance','Freelance work','Sitio y gestión','Website and management','Sitio institucional y panel de gestión para una empresa constructora.','Institutional website and management panel for a construction company.','Presenta los servicios y proyectos de la empresa y suma herramientas de administración para organizar el contenido.','It presents the company services and projects and adds administration tools for organizing content.','[]','','production','','["react","node","postgres","docker"]','[]',1,4),
('cloudmenu','CloudMenu','CloudMenu','Producto personal','Personal product','Carta digital','Digital menu','Carta digital PWA con panel administrativo, códigos QR, estadísticas y gestión de productos.','Digital-menu PWA with an admin panel, QR codes, analytics, and product management.','Permite mantener una carta gastronómica actualizada y administrar productos, disponibilidad y contenido desde un panel.','It keeps a restaurant menu up to date and manages products, availability, and content from an admin panel.','[]','https://cloudmenu.alejomonardez.com','production','','["php","javascript","mysql","docker"]','[]',0,5),
('natasha','Natasha Models','Natasha Models','Trabajo freelance','Freelance work','Plataforma educativa','Education platform','Plataforma para una academia de modelaje con cursos, modelos, inscripciones y noticias.','Platform for a modeling academy with courses, model profiles, enrollment, and news.','Organiza la propuesta educativa y la información institucional en una experiencia web con gestión de contenidos.','It organizes educational offerings and institutional information in a web experience with content management.','[]','https://natashamodel.agency','production','','["react","node","express","postgres"]','[]',0,6),
('portfolio-personal','Portfolio personal','Personal portfolio','Portfolio personal','Personal portfolio','CMS e i18n','CMS and i18n','Portfolio full-stack con CMS, panel administrativo, contenido bilingüe e integración de IA.','Full-stack portfolio with a CMS, admin dashboard, bilingual content, and AI integration.','Este sitio combina una interfaz pública con administración de proyectos, ajustes, mensajes y publicación de contenido.','This site combines a public interface with project, settings, message, and content-publishing administration.','[]','https://alejomonardez.com','production','','["react","node","express","mysql","docker","nginx"]','[]',0,7);

-- =====================================================
-- TABLA: settings (configuración global key/value)
-- =====================================================
-- Almacena redes sociales y cualquier otra config editable desde el admin.
CREATE TABLE settings (
    setting_key   VARCHAR(100) PRIMARY KEY,
    setting_value TEXT NOT NULL,
    updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO settings (setting_key, setting_value) VALUES
    ('social_github',    'https://github.com/SoyMonardez'),
    ('social_whatsapp',  'https://wa.me/2646296764'),
    ('social_email',     'contact@alejomonardez.com'),
    ('social_linkedin',  ''),
    ('social_instagram', '');

-- =====================================================
-- TABLAS: chatbot de Instagram (atención automatizada)
-- =====================================================
-- instagram_chats: un registro por persona que escribe al DM.
--   status:      bot_active | pending_human | human_handled | closed
--   bot_enabled: override manual para apagar el bot en un chat puntual.
CREATE TABLE instagram_chats (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    ig_user_id VARCHAR(64) NOT NULL UNIQUE,
    username VARCHAR(120) DEFAULT '',
    status ENUM('bot_active','pending_human','human_handled','closed') NOT NULL DEFAULT 'bot_active',
    bot_enabled TINYINT(1) NOT NULL DEFAULT 1,
    last_intent VARCHAR(40) DEFAULT '',
    last_interaction TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_last (last_interaction)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- instagram_messages: historial de cada mensaje (entrante y saliente).
--   `mid` es el id de mensaje de Meta — UNIQUE para deduplicar reentregas del webhook.
CREATE TABLE instagram_messages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    chat_id BIGINT NOT NULL,
    direction ENUM('inbound','outbound') NOT NULL,
    sender ENUM('customer','bot','human') NOT NULL,
    text TEXT,
    intent VARCHAR(40) DEFAULT '',
    mid VARCHAR(190) DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_chat (chat_id),
    UNIQUE KEY uniq_mid (mid),
    CONSTRAINT fk_msg_chat FOREIGN KEY (chat_id) REFERENCES instagram_chats(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
