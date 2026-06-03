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
--   - 'Moñi'  / Moñi264412@@   (principal)
--   - 'admin' / contraseña antigua de prod (queda como fallback)
-- Para generar un hash nuevo:  php -r "echo password_hash('TU_PASS', PASSWORD_BCRYPT);"
INSERT INTO admins (id, username, password_hash, created_at) VALUES
(1, 'admin', '$2y$10$Rc/05pY3eTaDetrVj/k2BeHrQRVxbKNL130FkDFAUD03OxaSUeAW.', CURRENT_TIMESTAMP),
(2, 'Moñi',  '$2y$10$picbsgFbrLmwnTbRl/HtN.2NGRpKjDzSlYf9M3uATILaTz9xpsSYi', CURRENT_TIMESTAMP);

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

-- Seed de los 4 proyectos destacados.
-- El campo `images` es un array JSON: la primera es la portada, las siguientes
-- forman parte del carrusel interno de cada proyecto.
-- Subí las imágenes desde el admin (Dashboard → Proyectos → Editar → Agregar imagen).
INSERT INTO projects (slug, title, title_en, category, category_en, badge, badge_en, description_short, description_short_en, description, description_en, images, demo_url, tech, featured, sort_order) VALUES
(
    'fluxa',
    'Fluxa',
    'Fluxa',
    'SaaS / Gestión PyME',
    'SaaS / SMB Management',
    'Gestión Económica',
    'Financial Management',
    'Plataforma SaaS para gestión económica de PyMEs con dashboards integrales para ingresos, asistencia y pagos.',
    'SaaS platform for SMB financial management with comprehensive dashboards for income, attendance, and payments.',
    'Plataforma SaaS para gestión económica de PyMEs: control de ingresos, pagos a empleados y proveedores, liquidaciones, planilla de asistencia, almacenamiento de archivos y dashboards visuales.',
    'SaaS platform for SMB financial management: income tracking, employee and supplier payments, settlements, attendance sheets, file storage and visual dashboards.',
    '[]',
    'https://fluxa.alejomonardez.com',
    '["react","node","tailwind","mysql"]',
    1,
    1
),
(
    'gancho',
    'Gancho',
    'Gancho',
    'SaaS / Automatización Comercial',
    'SaaS / Sales Automation',
    'Carnicería Inteligente',
    'Smart Butcher Shop',
    'Sistema de automatización para carnicerías que optimiza costos por gancho, márgenes y ventas con métricas en tiempo real.',
    'Automation system for butcher shops that optimizes hook costs, margins, and sales with real-time metrics.',
    'Sistema de automatización para carnicerías: cálculo automático de precio por kilo, costo por gancho, margen de ganancia descontando merma y grasa, métodos de pago e historial de ventas con gráficos.',
    'Automation system for butcher shops: automatic price-per-kilo calculation, cost per hook, profit margin after waste and fat deduction, payment methods and sales history with charts.',
    '[]',
    'https://gancho.alejomonardez.com',
    '["react","node","tailwind","mysql"]',
    1,
    2
),
(
    'natasha',
    'Natasha Models',
    'Natasha Models',
    'Plataforma Educativa / App',
    'Educational Platform / App',
    'Academia Virtual',
    'Virtual Academy',
    'Escuela virtual de modelaje con cursos premium, castings interactivos y aplicación móvil optimizada.',
    'Virtual modeling school featuring premium courses, interactive castings, and an optimized mobile app.',
    'Escuela virtual de modelaje con cursos premium y gratuitos, casting, noticias, modelos por categoría, inscripciones a la academia (virtual o presencial), login con Google y app descargable.',
    'Virtual modeling school with premium and free courses, casting, news, models by category, academy enrollment (virtual or in-person), Google login and downloadable app.',
    '[]',
    'https://natashamodel.agency',
    '["react","node","tailwind"]',
    1,
    3
),
(
    'epet',
    'E.P.E.T. N°1 Albardón',
    'E.P.E.T. N°1 Albardón',
    'Institucional',
    'Institutional',
    'Portal Educativo',
    'Educational Portal',
    'Portal educativo institucional para escuela técnica con chatbot inteligente integrado para consultas de la comunidad.',
    'Institutional educational portal for a technical school with an integrated smart chatbot for community inquiries.',
    'Portal institucional de la escuela técnica con sus orientaciones (Minería, Construcción e Informática) y un chatbot integrado para responder consultas sobre la institución.',
    'Institutional portal of the technical school with its specializations (Mining, Construction and Computer Science) and an integrated chatbot to answer questions about the institution.',
    '[]',
    'https://epet.alejomonardez.com',
    '["php","html","css","tailwind"]',
    1,
    4
);

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
