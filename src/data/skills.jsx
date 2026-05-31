import {
    // Lenguajes
    SiJavascript, SiTypescript, SiPython, SiPhp, SiGo, SiRust, SiRuby,
    // Frontend
    SiHtml5, SiCss3, SiTailwindcss, SiBootstrap, SiSass,
    SiReact, SiNextdotjs, SiVuedotjs, SiAngular, SiSvelte,
    SiRedux, SiVite, SiWebpack, SiFramer, SiGreensock,
    SiStorybook,
    // Backend — Node / JS
    SiNodedotjs, SiExpress, SiNestjs, SiFastify, SiBun, SiDeno,
    SiPassport, SiSequelize, SiPrisma, SiDrizzle, SiZod,
    SiSocketdotio, SiGraphql,
    // Backend — Python
    SiDjango, SiFlask, SiFastapi, SiPydantic,
    // Backend — otros lenguajes
    SiLaravel, SiSpring, SiDotnet,
    // Python científico / datos
    SiPandas, SiNumpy, SiScikitlearn, SiJupyter, SiAnaconda, SiOpencv,
    // IA / ML
    SiOpenai, SiAnthropic, SiGooglegemini, SiHuggingface,
    SiTensorflow, SiPytorch, SiKeras, SiLangchain, SiOllama,
    // Bases de datos
    SiMysql, SiPostgresql, SiMariadb, SiSqlite,
    SiMongodb, SiRedis, SiFirebase, SiSupabase,
    SiElasticsearch, SiInfluxdb, SiApachecassandra, SiPlanetscale, SiClickhouse,
    // Cloud & DevOps
    SiAmazon, SiGooglecloud, SiDocker, SiKubernetes,
    SiNginx, SiVercel, SiNetlify, SiCloudflare,
    SiGithubactions, SiJenkins, SiTerraform, SiAnsible,
    SiGrafana, SiPrometheus, SiDatadog, SiSentry,
    SiRabbitmq, SiApachekafka,
    // Seguridad
    SiAuth0, SiLetsencrypt, SiHashicorp, SiVault, SiClerk,
    // Testing
    SiJest, SiVitest, SiCypress, SiTestinglibrary,
    // Mobile
    SiFlutter, SiExpo, SiCapacitor, SiIonic,
    // Herramientas
    SiGit, SiGithub, SiGitlab, SiBitbucket, SiXampp,
    SiPostman, SiFigma, SiJira, SiNotion, SiLinux,
    SiNpm, SiYarn, SiPnpm, SiTurborepo, SiMeilisearch,
    // Pagos
    SiStripe,
} from 'react-icons/si';
import { FaJava, FaAws, FaMicrosoft, FaShieldAlt, FaKey, FaRobot } from 'react-icons/fa';
import React from 'react';

/**
 * Catálogo central de skills/tecnologías disponibles para asociar a un proyecto.
 * Cada entrada: { key, name, category, icon }
 *   - key: identificador único (guardado en BD en project.tech[])
 *   - name: nombre legible para chips
 *   - category: grupo en el selector del admin
 *   - icon: componente JSX de react-icons
 */
export const SKILLS = [
    // ── Lenguajes ───────────────────────────────────────────────────────────
    { key: 'javascript',  name: 'JavaScript',   category: 'Lenguajes', icon: <SiJavascript /> },
    { key: 'typescript',  name: 'TypeScript',   category: 'Lenguajes', icon: <SiTypescript /> },
    { key: 'python',      name: 'Python',       category: 'Lenguajes', icon: <SiPython /> },
    { key: 'java',        name: 'Java',         category: 'Lenguajes', icon: <FaJava /> },
    { key: 'php',         name: 'PHP',          category: 'Lenguajes', icon: <SiPhp /> },
    { key: 'go',          name: 'Go',           category: 'Lenguajes', icon: <SiGo /> },
    { key: 'rust',        name: 'Rust',         category: 'Lenguajes', icon: <SiRust /> },
    { key: 'ruby',        name: 'Ruby',         category: 'Lenguajes', icon: <SiRuby /> },
    { key: 'csharp',      name: 'C# / .NET',    category: 'Lenguajes', icon: <SiDotnet /> },

    // ── Frontend ─────────────────────────────────────────────────────────────
    { key: 'html',        name: 'HTML',         category: 'Frontend',  icon: <SiHtml5 /> },
    { key: 'css',         name: 'CSS',          category: 'Frontend',  icon: <SiCss3 /> },
    { key: 'tailwind',    name: 'Tailwind CSS', category: 'Frontend',  icon: <SiTailwindcss /> },
    { key: 'bootstrap',   name: 'Bootstrap',    category: 'Frontend',  icon: <SiBootstrap /> },
    { key: 'sass',        name: 'Sass',         category: 'Frontend',  icon: <SiSass /> },
    { key: 'react',       name: 'React',        category: 'Frontend',  icon: <SiReact /> },
    { key: 'nextjs',      name: 'Next.js',      category: 'Frontend',  icon: <SiNextdotjs /> },
    { key: 'vue',         name: 'Vue.js',       category: 'Frontend',  icon: <SiVuedotjs /> },
    { key: 'angular',     name: 'Angular',      category: 'Frontend',  icon: <SiAngular /> },
    { key: 'svelte',      name: 'Svelte',       category: 'Frontend',  icon: <SiSvelte /> },
    { key: 'redux',       name: 'Redux',        category: 'Frontend',  icon: <SiRedux /> },
    { key: 'vite',        name: 'Vite',         category: 'Frontend',  icon: <SiVite /> },
    { key: 'webpack',     name: 'Webpack',      category: 'Frontend',  icon: <SiWebpack /> },
    { key: 'framer',      name: 'Framer Motion',category: 'Frontend',  icon: <SiFramer /> },
    { key: 'gsap',        name: 'GSAP',         category: 'Frontend',  icon: <SiGreensock /> },
    { key: 'storybook',   name: 'Storybook',    category: 'Frontend',  icon: <SiStorybook /> },

    // ── Backend — Node / JS ──────────────────────────────────────────────────
    { key: 'node',        name: 'Node.js',      category: 'Backend · Node/JS', icon: <SiNodedotjs /> },
    { key: 'express',     name: 'Express',      category: 'Backend · Node/JS', icon: <SiExpress /> },
    { key: 'nestjs',      name: 'NestJS',       category: 'Backend · Node/JS', icon: <SiNestjs /> },
    { key: 'fastify',     name: 'Fastify',      category: 'Backend · Node/JS', icon: <SiFastify /> },
    { key: 'bun',         name: 'Bun',          category: 'Backend · Node/JS', icon: <SiBun /> },
    { key: 'deno',        name: 'Deno',         category: 'Backend · Node/JS', icon: <SiDeno /> },
    { key: 'passport',    name: 'Passport.js',  category: 'Backend · Node/JS', icon: <SiPassport /> },
    { key: 'sequelize',   name: 'Sequelize',    category: 'Backend · Node/JS', icon: <SiSequelize /> },
    { key: 'prisma',      name: 'Prisma',       category: 'Backend · Node/JS', icon: <SiPrisma /> },
    { key: 'drizzle',     name: 'Drizzle ORM',  category: 'Backend · Node/JS', icon: <SiDrizzle /> },
    { key: 'zod',         name: 'Zod',          category: 'Backend · Node/JS', icon: <SiZod /> },
    { key: 'socketio',    name: 'Socket.io',    category: 'Backend · Node/JS', icon: <SiSocketdotio /> },
    { key: 'graphql',     name: 'GraphQL',      category: 'Backend · Node/JS', icon: <SiGraphql /> },

    // ── Backend — Python ─────────────────────────────────────────────────────
    { key: 'django',      name: 'Django',       category: 'Backend · Python', icon: <SiDjango /> },
    { key: 'flask',       name: 'Flask',        category: 'Backend · Python', icon: <SiFlask /> },
    { key: 'fastapi',     name: 'FastAPI',      category: 'Backend · Python', icon: <SiFastapi /> },
    { key: 'pydantic',    name: 'Pydantic',     category: 'Backend · Python', icon: <SiPydantic /> },

    // ── Backend — otros ──────────────────────────────────────────────────────
    { key: 'laravel',     name: 'Laravel',      category: 'Backend · Otros', icon: <SiLaravel /> },
    { key: 'spring',      name: 'Spring Boot',  category: 'Backend · Otros', icon: <SiSpring /> },

    // ── Python científico / datos ────────────────────────────────────────────
    { key: 'pandas',      name: 'Pandas',       category: 'Python · Data', icon: <SiPandas /> },
    { key: 'numpy',       name: 'NumPy',        category: 'Python · Data', icon: <SiNumpy /> },
    { key: 'sklearn',     name: 'Scikit-learn', category: 'Python · Data', icon: <SiScikitlearn /> },
    { key: 'opencv',      name: 'OpenCV',       category: 'Python · Data', icon: <SiOpencv /> },
    { key: 'jupyter',     name: 'Jupyter',      category: 'Python · Data', icon: <SiJupyter /> },
    { key: 'anaconda',    name: 'Anaconda',     category: 'Python · Data', icon: <SiAnaconda /> },

    // ── IA / ML ──────────────────────────────────────────────────────────────
    { key: 'openai',      name: 'OpenAI API',   category: 'IA & ML', icon: <SiOpenai /> },
    { key: 'anthropic',   name: 'Anthropic / Claude', category: 'IA & ML', icon: <SiAnthropic /> },
    { key: 'gemini',      name: 'Google Gemini',category: 'IA & ML', icon: <SiGooglegemini /> },
    { key: 'groq',        name: 'Groq API',     category: 'IA & ML', icon: <FaRobot /> },
    { key: 'huggingface', name: 'Hugging Face', category: 'IA & ML', icon: <SiHuggingface /> },
    { key: 'langchain',   name: 'LangChain',    category: 'IA & ML', icon: <SiLangchain /> },
    { key: 'ollama',      name: 'Ollama',       category: 'IA & ML', icon: <SiOllama /> },
    { key: 'tensorflow',  name: 'TensorFlow',   category: 'IA & ML', icon: <SiTensorflow /> },
    { key: 'pytorch',     name: 'PyTorch',      category: 'IA & ML', icon: <SiPytorch /> },
    { key: 'keras',       name: 'Keras',        category: 'IA & ML', icon: <SiKeras /> },

    // ── Bases de datos ───────────────────────────────────────────────────────
    { key: 'mysql',       name: 'MySQL',        category: 'Bases de datos', icon: <SiMysql /> },
    { key: 'postgres',    name: 'PostgreSQL',   category: 'Bases de datos', icon: <SiPostgresql /> },
    { key: 'mariadb',     name: 'MariaDB',      category: 'Bases de datos', icon: <SiMariadb /> },
    { key: 'sqlite',      name: 'SQLite',       category: 'Bases de datos', icon: <SiSqlite /> },
    { key: 'mongodb',     name: 'MongoDB',      category: 'Bases de datos', icon: <SiMongodb /> },
    { key: 'redis',       name: 'Redis',        category: 'Bases de datos', icon: <SiRedis /> },
    { key: 'firebase',    name: 'Firebase',     category: 'Bases de datos', icon: <SiFirebase /> },
    { key: 'supabase',    name: 'Supabase',     category: 'Bases de datos', icon: <SiSupabase /> },
    { key: 'elasticsearch', name: 'Elasticsearch', category: 'Bases de datos', icon: <SiElasticsearch /> },
    { key: 'influxdb',    name: 'InfluxDB',     category: 'Bases de datos', icon: <SiInfluxdb /> },
    { key: 'cassandra',   name: 'Cassandra',    category: 'Bases de datos', icon: <SiApachecassandra /> },
    { key: 'planetscale', name: 'PlanetScale',  category: 'Bases de datos', icon: <SiPlanetscale /> },
    { key: 'clickhouse',  name: 'ClickHouse',   category: 'Bases de datos', icon: <SiClickhouse /> },
    { key: 'meilisearch', name: 'Meilisearch',  category: 'Bases de datos', icon: <SiMeilisearch /> },

    // ── Cloud & DevOps ───────────────────────────────────────────────────────
    { key: 'aws',         name: 'AWS',          category: 'Cloud & DevOps', icon: <FaAws /> },
    { key: 'gcp',         name: 'Google Cloud', category: 'Cloud & DevOps', icon: <SiGooglecloud /> },
    { key: 'azure',       name: 'Azure',        category: 'Cloud & DevOps', icon: <FaMicrosoft /> },
    { key: 'docker',      name: 'Docker',       category: 'Cloud & DevOps', icon: <SiDocker /> },
    { key: 'kubernetes',  name: 'Kubernetes',   category: 'Cloud & DevOps', icon: <SiKubernetes /> },
    { key: 'nginx',       name: 'Nginx',        category: 'Cloud & DevOps', icon: <SiNginx /> },
    { key: 'vercel',      name: 'Vercel',       category: 'Cloud & DevOps', icon: <SiVercel /> },
    { key: 'netlify',     name: 'Netlify',      category: 'Cloud & DevOps', icon: <SiNetlify /> },
    { key: 'cloudflare',  name: 'Cloudflare',   category: 'Cloud & DevOps', icon: <SiCloudflare /> },
    { key: 'gh-actions',  name: 'GitHub Actions',category:'Cloud & DevOps', icon: <SiGithubactions /> },
    { key: 'jenkins',     name: 'Jenkins',      category: 'Cloud & DevOps', icon: <SiJenkins /> },
    { key: 'terraform',   name: 'Terraform',    category: 'Cloud & DevOps', icon: <SiTerraform /> },
    { key: 'ansible',     name: 'Ansible',      category: 'Cloud & DevOps', icon: <SiAnsible /> },
    { key: 'rabbitmq',    name: 'RabbitMQ',     category: 'Cloud & DevOps', icon: <SiRabbitmq /> },
    { key: 'kafka',       name: 'Apache Kafka', category: 'Cloud & DevOps', icon: <SiApachekafka /> },
    { key: 'grafana',     name: 'Grafana',      category: 'Cloud & DevOps', icon: <SiGrafana /> },
    { key: 'prometheus',  name: 'Prometheus',   category: 'Cloud & DevOps', icon: <SiPrometheus /> },
    { key: 'datadog',     name: 'Datadog',      category: 'Cloud & DevOps', icon: <SiDatadog /> },
    { key: 'sentry',      name: 'Sentry',       category: 'Cloud & DevOps', icon: <SiSentry /> },

    // ── Seguridad ────────────────────────────────────────────────────────────
    { key: 'auth0',       name: 'Auth0',        category: 'Seguridad', icon: <SiAuth0 /> },
    { key: 'clerk',       name: 'Clerk',        category: 'Seguridad', icon: <SiClerk /> },
    { key: 'letsencrypt', name: "Let's Encrypt",category: 'Seguridad', icon: <SiLetsencrypt /> },
    { key: 'vault',       name: 'HashiCorp Vault',category:'Seguridad', icon: <SiVault /> },
    { key: 'jwt',         name: 'JWT',          category: 'Seguridad', icon: <FaKey /> },
    { key: 'oauth',       name: 'OAuth 2.0',    category: 'Seguridad', icon: <FaShieldAlt /> },
    { key: 'bcrypt',      name: 'bcrypt',       category: 'Seguridad', icon: <FaShieldAlt /> },

    // ── Testing ──────────────────────────────────────────────────────────────
    { key: 'jest',        name: 'Jest',         category: 'Testing', icon: <SiJest /> },
    { key: 'vitest',      name: 'Vitest',       category: 'Testing', icon: <SiVitest /> },
    { key: 'cypress',     name: 'Cypress',      category: 'Testing', icon: <SiCypress /> },
    { key: 'testing-lib', name: 'Testing Library',category:'Testing', icon: <SiTestinglibrary /> },

    // ── Mobile ───────────────────────────────────────────────────────────────
    { key: 'react-native',name: 'React Native', category: 'Mobile', icon: <SiReact /> },
    { key: 'flutter',     name: 'Flutter',      category: 'Mobile', icon: <SiFlutter /> },
    { key: 'expo',        name: 'Expo',         category: 'Mobile', icon: <SiExpo /> },
    { key: 'capacitor',   name: 'Capacitor',    category: 'Mobile', icon: <SiCapacitor /> },
    { key: 'ionic',       name: 'Ionic',        category: 'Mobile', icon: <SiIonic /> },

    // ── Herramientas ─────────────────────────────────────────────────────────
    { key: 'git',         name: 'Git',          category: 'Herramientas', icon: <SiGit /> },
    { key: 'github',      name: 'GitHub',       category: 'Herramientas', icon: <SiGithub /> },
    { key: 'gitlab',      name: 'GitLab',       category: 'Herramientas', icon: <SiGitlab /> },
    { key: 'bitbucket',   name: 'Bitbucket',    category: 'Herramientas', icon: <SiBitbucket /> },
    { key: 'xampp',       name: 'XAMPP',        category: 'Herramientas', icon: <SiXampp /> },
    { key: 'postman',     name: 'Postman',      category: 'Herramientas', icon: <SiPostman /> },
    { key: 'figma',       name: 'Figma',        category: 'Herramientas', icon: <SiFigma /> },
    { key: 'jira',        name: 'Jira',         category: 'Herramientas', icon: <SiJira /> },
    { key: 'notion',      name: 'Notion',       category: 'Herramientas', icon: <SiNotion /> },
    { key: 'linux',       name: 'Linux',        category: 'Herramientas', icon: <SiLinux /> },
    { key: 'npm',         name: 'npm',          category: 'Herramientas', icon: <SiNpm /> },
    { key: 'yarn',        name: 'Yarn',         category: 'Herramientas', icon: <SiYarn /> },
    { key: 'pnpm',        name: 'pnpm',         category: 'Herramientas', icon: <SiPnpm /> },
    { key: 'turborepo',   name: 'Turborepo',    category: 'Herramientas', icon: <SiTurborepo /> },

    // ── Pagos ────────────────────────────────────────────────────────────────
    { key: 'stripe',      name: 'Stripe',       category: 'Pagos & API', icon: <SiStripe /> },
];

// Mapa rápido para buscar por key
export const SKILLS_BY_KEY = SKILLS.reduce((acc, s) => {
    acc[s.key] = s;
    return acc;
}, {});

// Aliases para tolerar valores legacy
const NAME_ALIASES = {
    'react': 'react',
    'next.js': 'nextjs', 'next': 'nextjs',
    'tailwind css': 'tailwind', 'tailwind': 'tailwind', 'tealwin': 'tailwind',
    'node.js': 'node', 'node': 'node',
    'express': 'express',
    'php': 'php', 'laravel': 'laravel',
    'mysql': 'mysql', 'xampp': 'xampp',
    'html': 'html', 'css': 'css',
    'javascript': 'javascript', 'typescript': 'typescript',
    'python': 'python', 'java': 'java',
    'go': 'go', 'rust': 'rust',
    'postgresql': 'postgres', 'postgres': 'postgres',
    'mongodb': 'mongodb', 'redis': 'redis',
    'aws': 'aws', 'docker': 'docker',
    'kubernetes': 'kubernetes', 'firebase': 'firebase',
    'graphql': 'graphql', 'sql': 'mysql',
    'fastapi': 'fastapi', 'django': 'django', 'flask': 'flask',
    'openai': 'openai', 'openai api': 'openai',
    'anthropic': 'anthropic', 'claude': 'anthropic',
    'hugging face': 'huggingface', 'huggingface': 'huggingface',
    'langchain': 'langchain', 'ollama': 'ollama',
    'pytorch': 'pytorch', 'tensorflow': 'tensorflow', 'keras': 'keras',
    'socket.io': 'socketio', 'socketio': 'socketio',
    'prisma': 'prisma', 'drizzle': 'drizzle',
    'jest': 'jest', 'vitest': 'vitest', 'cypress': 'cypress',
    'flutter': 'flutter', 'expo': 'expo',
    'stripe': 'stripe',
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
    return { key: lower, name: value, category: 'Otros', icon: null };
}

// Categorías ordenadas (para el selector del admin)
export const SKILL_CATEGORIES = [
    'Lenguajes',
    'Frontend',
    'Backend · Node/JS',
    'Backend · Python',
    'Backend · Otros',
    'Python · Data',
    'IA & ML',
    'Bases de datos',
    'Cloud & DevOps',
    'Seguridad',
    'Testing',
    'Mobile',
    'Herramientas',
    'Pagos & API',
];
