// Catálogo plano de skills disponibles — mantener en sync con src/data/skills.jsx
// Solo necesitamos las `key`s para que la IA pueda elegir entre ellas.
export const SKILL_KEYS = [
    // Lenguajes
    'javascript', 'typescript', 'python', 'java', 'php', 'go', 'rust', 'csharp',
    // Frontend
    'html', 'css', 'tailwind', 'bootstrap', 'sass', 'react', 'nextjs', 'vue',
    'angular', 'svelte', 'redux', 'vite', 'webpack', 'framer', 'gsap',
    // Backend
    'node', 'express', 'nestjs', 'laravel', 'django', 'flask', 'spring',
    'rails', 'graphql', 'prisma',
    // Bases de datos
    'mysql', 'postgres', 'sqlite', 'mongodb', 'redis', 'firebase', 'supabase',
    // Cloud & DevOps
    'aws', 'gcp', 'azure', 'docker', 'kubernetes', 'nginx', 'vercel', 'netlify',
    'cloudflare', 'gh-actions', 'jenkins',
    // Herramientas
    'git', 'github', 'gitlab', 'bitbucket', 'xampp', 'postman', 'figma',
    'jira', 'notion', 'linux',
    // IA & Otros
    'openai', 'tensorflow', 'stripe',
];
