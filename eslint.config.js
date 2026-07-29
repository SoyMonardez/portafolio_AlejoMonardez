import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

const unused = ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^[A-Z_]', caughtErrorsIgnorePattern: '^_' }]

export default defineConfig([
  globalIgnores(['dist', 'node_modules', 'uploads', '.agents', '.agent', '.claude']),
  {
    files: ['src/**/*.{js,jsx}'],
    extends: [js.configs.recommended, reactHooks.configs.flat.recommended, reactRefresh.configs.vite],
    languageOptions: {
      ecmaVersion: 'latest',
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true }, sourceType: 'module' },
    },
    rules: {
      'no-unused-vars': unused,
      // Estas reglas experimentales de React 19 generan falsos positivos en
      // componentes que sincronizan imágenes, refs y navegación del browser.
      'react-hooks/refs': 'off',
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/immutability': 'off',
      'react-refresh/only-export-components': 'off',
    },
  },
  {
    files: ['public/**/*.js'],
    extends: [js.configs.recommended],
    languageOptions: { ecmaVersion: 'latest', globals: { ...globals.browser, ...globals.serviceworker } },
    rules: { 'no-unused-vars': unused },
  },
  {
    files: ['backend/**/*.js', 'ai-service/**/*.js', 'scripts/**/*.js', '*.config.js'],
    extends: [js.configs.recommended],
    languageOptions: { ecmaVersion: 'latest', globals: globals.node, parserOptions: { sourceType: 'module' } },
    rules: { 'no-unused-vars': unused },
  },
])
