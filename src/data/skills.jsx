import {
    // Frontend
    SiReact, SiNextdotjs, SiVuedotjs, SiAngular, SiSvelte,
    SiTailwindcss, SiBootstrap, SiSass, SiHtml5, SiCss3,
    SiJavascript, SiTypescript, SiRedux, SiVite, SiWebpack,
    SiFramer, SiGreensock,
    // Backend
    SiNodedotjs, SiExpress, SiNestjs, SiPhp, SiLaravel,
    SiPython, SiDjango, SiFlask, SiSpring, SiDotnet,
    SiGo, SiRust, SiRubyonrails,
    // Bases de datos
    SiMysql, SiPostgresql, SiMongodb, SiRedis, SiSqlite,
    SiFirebase, SiSupabase,
    // DevOps / Cloud
    SiAmazon, SiGooglecloud, SiDocker,
    SiKubernetes, SiNginx, SiVercel, SiNetlify, SiCloudflare,
    SiGithubactions, SiJenkins,
    // Herramientas
    SiGit, SiGithub, SiGitlab, SiBitbucket, SiXampp,
    SiPostman, SiFigma, SiJira, SiNotion, SiLinux,
    // Otros
    SiGraphql, SiPrisma, SiStripe, SiOpenai, SiTensorflow
} from 'react-icons/si';
import { FaJava, FaAws } from 'react-icons/fa';
import React from 'react';

/**
 * Catálogo central de skills/tecnologías disponibles para asociar a un proyecto.
 * Agregá nuevas acá cuando aprendas algo nuevo — aparecerá automáticamente en el admin.
 *
 * Cada entrada: { key, name, category, icon }
 *   - key: identificador único (lo que se guarda en la BD dentro de project.tech)
 *   - name: nombre legible para mostrar en chips
 *   - category: para agrupar en el selector del admin
 *   - icon: componente JSX de react-icons
 */
export const SKILLS = [
    // Lenguajes
    { key: 'javascript',  name: 'JavaScript',  category: 'Lenguajes', icon: <SiJavascript /> },
    { key: 'typescript',  name: 'TypeScript',  category: 'Lenguajes', icon: <SiTypescript /> },
    { key: 'python',      name: 'Python',      category: 'Lenguajes', icon: <SiPython /> },
    { key: 'java',        name: 'Java',        category: 'Lenguajes', icon: <FaJava /> },
    { key: 'php',         name: 'PHP',         category: 'Lenguajes', icon: <SiPhp /> },
    { key: 'go',          name: 'Go',          category: 'Lenguajes', icon: <SiGo /> },
    { key: 'rust',        name: 'Rust',        category: 'Lenguajes', icon: <SiRust /> },
    { key: 'csharp',      name: 'C# / .NET',   category: 'Lenguajes', icon: <SiDotnet /> },

    // Frontend
    { key: 'html',        name: 'HTML',        category: 'Frontend',  icon: <SiHtml5 /> },
    { key: 'css',         name: 'CSS',         category: 'Frontend',  icon: <SiCss3 /> },
    { key: 'tailwind',    name: 'Tailwind CSS',category: 'Frontend',  icon: <SiTailwindcss /> },
    { key: 'bootstrap',   name: 'Bootstrap',   category: 'Frontend',  icon: <SiBootstrap /> },
    { key: 'sass',        name: 'Sass',        category: 'Frontend',  icon: <SiSass /> },
    { key: 'react',       name: 'React',       category: 'Frontend',  icon: <SiReact /> },
    { key: 'nextjs',      name: 'Next.js',     category: 'Frontend',  icon: <SiNextdotjs /> },
    { key: 'vue',         name: 'Vue.js',      category: 'Frontend',  icon: <SiVuedotjs /> },
    { key: 'angular',     name: 'Angular',     category: 'Frontend',  icon: <SiAngular /> },
    { key: 'svelte',      name: 'Svelte',      category: 'Frontend',  icon: <SiSvelte /> },
    { key: 'redux',       name: 'Redux',       category: 'Frontend',  icon: <SiRedux /> },
    { key: 'vite',        name: 'Vite',        category: 'Frontend',  icon: <SiVite /> },
    { key: 'webpack',     name: 'Webpack',     category: 'Frontend',  icon: <SiWebpack /> },
    { key: 'framer',      name: 'Framer Motion', category: 'Frontend',icon: <SiFramer /> },
    { key: 'gsap',        name: 'GSAP',        category: 'Frontend',  icon: <SiGreensock /> },

    // Backend
    { key: 'node',        name: 'Node.js',     category: 'Backend',   icon: <SiNodedotjs /> },
    { key: 'express',     name: 'Express',     category: 'Backend',   icon: <SiExpress /> },
    { key: 'nestjs',      name: 'NestJS',      category: 'Backend',   icon: <SiNestjs /> },
    { key: 'laravel',     name: 'Laravel',     category: 'Backend',   icon: <SiLaravel /> },
    { key: 'django',      name: 'Django',      category: 'Backend',   icon: <SiDjango /> },
    { key: 'flask',       name: 'Flask',       category: 'Backend',   icon: <SiFlask /> },
    { key: 'spring',      name: 'Spring Boot', category: 'Backend',   icon: <SiSpring /> },
    { key: 'rails',       name: 'Ruby on Rails',category:'Backend',   icon: <SiRubyonrails /> },
    { key: 'graphql',     name: 'GraphQL',     category: 'Backend',   icon: <SiGraphql /> },
    { key: 'prisma',      name: 'Prisma',      category: 'Backend',   icon: <SiPrisma /> },

    // Bases de datos
    { key: 'mysql',       name: 'MySQL',       category: 'Bases de datos', icon: <SiMysql /> },
    { key: 'postgres',    name: 'PostgreSQL',  category: 'Bases de datos', icon: <SiPostgresql /> },
    { key: 'sqlite',      name: 'SQLite',      category: 'Bases de datos', icon: <SiSqlite /> },
    { key: 'mongodb',     name: 'MongoDB',     category: 'Bases de datos', icon: <SiMongodb /> },
    { key: 'redis',       name: 'Redis',       category: 'Bases de datos', icon: <SiRedis /> },
    { key: 'firebase',    name: 'Firebase',    category: 'Bases de datos', icon: <SiFirebase /> },
    { key: 'supabase',    name: 'Supabase',    category: 'Bases de datos', icon: <SiSupabase /> },

    // DevOps / Cloud
    { key: 'aws',         name: 'AWS',         category: 'Cloud & DevOps', icon: <FaAws /> },
    { key: 'gcp',         name: 'Google Cloud',category: 'Cloud & DevOps', icon: <SiGooglecloud /> },
    { key: 'azure',       name: 'Azure',       category: 'Cloud & DevOps', icon: <SiAmazon /> },
    { key: 'docker',      name: 'Docker',      category: 'Cloud & DevOps', icon: <SiDocker /> },
    { key: 'kubernetes',  name: 'Kubernetes',  category: 'Cloud & DevOps', icon: <SiKubernetes /> },
    { key: 'nginx',       name: 'Nginx',       category: 'Cloud & DevOps', icon: <SiNginx /> },
    { key: 'vercel',      name: 'Vercel',      category: 'Cloud & DevOps', icon: <SiVercel /> },
    { key: 'netlify',     name: 'Netlify',     category: 'Cloud & DevOps', icon: <SiNetlify /> },
    { key: 'cloudflare',  name: 'Cloudflare',  category: 'Cloud & DevOps', icon: <SiCloudflare /> },
    { key: 'gh-actions',  name: 'GitHub Actions',category:'Cloud & DevOps',icon: <SiGithubactions /> },
    { key: 'jenkins',     name: 'Jenkins',     category: 'Cloud & DevOps', icon: <SiJenkins /> },

    // Herramientas
    { key: 'git',         name: 'Git',         category: 'Herramientas', icon: <SiGit /> },
    { key: 'github',      name: 'GitHub',      category: 'Herramientas', icon: <SiGithub /> },
    { key: 'gitlab',      name: 'GitLab',      category: 'Herramientas', icon: <SiGitlab /> },
    { key: 'bitbucket',   name: 'Bitbucket',   category: 'Herramientas', icon: <SiBitbucket /> },
    { key: 'xampp',       name: 'XAMPP',       category: 'Herramientas', icon: <SiXampp /> },
    { key: 'postman',     name: 'Postman',     category: 'Herramientas', icon: <SiPostman /> },
    { key: 'figma',       name: 'Figma',       category: 'Herramientas', icon: <SiFigma /> },
    { key: 'jira',        name: 'Jira',        category: 'Herramientas', icon: <SiJira /> },
    { key: 'notion',      name: 'Notion',      category: 'Herramientas', icon: <SiNotion /> },
    { key: 'linux',       name: 'Linux',       category: 'Herramientas', icon: <SiLinux /> },

    // IA / Otros
    { key: 'openai',      name: 'OpenAI API',  category: 'IA & Otros', icon: <SiOpenai /> },
    { key: 'tensorflow',  name: 'TensorFlow',  category: 'IA & Otros', icon: <SiTensorflow /> },
    { key: 'stripe',      name: 'Stripe',      category: 'IA & Otros', icon: <SiStripe /> },
];

// Mapa rápido para buscar por key
export const SKILLS_BY_KEY = SKILLS.reduce((acc, s) => {
    acc[s.key] = s;
    return acc;
}, {});

// Aliases para tolerar valores legacy (los antiguos guardaban "React", "Tailwind CSS", etc.)
const NAME_ALIASES = {
    'react': 'react',
    'next.js': 'nextjs',
    'next': 'nextjs',
    'tailwind css': 'tailwind',
    'tailwind': 'tailwind',
    'tealwin': 'tailwind',
    'node.js': 'node',
    'node': 'node',
    'express': 'express',
    'php': 'php',
    'laravel': 'laravel',
    'mysql': 'mysql',
    'xampp': 'xampp',
    'html': 'html',
    'css': 'css',
    'javascript': 'javascript',
    'typescript': 'typescript',
    'python': 'python',
    'java': 'java',
    'go': 'go',
    'rust': 'rust',
    'postgresql': 'postgres',
    'postgres': 'postgres',
    'mongodb': 'mongodb',
    'redis': 'redis',
    'aws': 'aws',
    'docker': 'docker',
    'kubernetes': 'kubernetes',
    'firebase': 'firebase',
    'graphql': 'graphql',
    'sql': 'mysql',
};

/**
 * Resuelve una skill desde un string (acepta key, nombre, alias).
 * Devuelve la entrada del catálogo o un fallback { key, name, icon: null }.
 */
export function resolveSkill(value) {
    if (!value) return null;
    const lower = String(value).toLowerCase().trim();
    if (SKILLS_BY_KEY[lower]) return SKILLS_BY_KEY[lower];
    if (NAME_ALIASES[lower] && SKILLS_BY_KEY[NAME_ALIASES[lower]]) return SKILLS_BY_KEY[NAME_ALIASES[lower]];
    // Fallback: devolver un objeto mínimo para que igual se renderice como chip de texto
    return { key: lower, name: value, category: 'Otros', icon: null };
}

// Categorías ordenadas (para el selector del admin)
export const SKILL_CATEGORIES = [
    'Lenguajes',
    'Frontend',
    'Backend',
    'Bases de datos',
    'Cloud & DevOps',
    'Herramientas',
    'IA & Otros'
];
