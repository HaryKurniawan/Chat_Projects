import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'
import security from 'eslint-plugin-security'
import noUnsanitized from 'eslint-plugin-no-unsanitized'
import react from 'eslint-plugin-react'
import importPlugin from 'eslint-plugin-import'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import noSecrets from 'eslint-plugin-no-secrets'

export default defineConfig([
  globalIgnores(['dist', 'eslint.config.js']),

  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      'no-secrets': noSecrets,
    },

    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,

      react.configs.flat.recommended,
      reactHooks.configs.flat.recommended,

      importPlugin.flatConfigs.recommended,
      jsxA11y.flatConfigs.recommended,

      security.configs.recommended,
      noUnsanitized.configs.recommended,

      reactRefresh.configs.vite,
    ],

    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },

    settings: {
      react: {
        version: 'detect',
      },
    },

    rules: {
      /* =====================
         JavaScript Quality
      ===================== */

      eqeqeq: ['error', 'always'],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'error',
      'no-duplicate-imports': 'error',
      'prefer-const': 'error',
      'no-var': 'error',

      /* =====================
         TypeScript
      ===================== */

      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',

      /* =====================
         React
      ===================== */

      'react/no-danger': 'warn',
      'react/self-closing-comp': 'warn',
      'react/jsx-no-useless-fragment': 'warn',
      'react/jsx-key': 'error',
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

      /* =====================
         Hooks
      ===================== */

      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      /* =====================
         Import
      ===================== */

      'import/no-unresolved': 'off',
      'import/order': [
        'warn',
        {
          groups: ['builtin', 'external', 'internal'],
          'newlines-between': 'always',
        },
      ],
      /* =====================
         Hardcoded Secrets
      ===================== */

      'no-secrets/no-secrets': [
        'error',
        {
          tolerance: 5,
          additionalRegexes: {
            'Hardcoded API Key': /(?:api[_-]?key|apikey)\s*[:=]\s*['"][^'"]{8,}['"]/i,
            'Hardcoded Token': /(?:token|secret|jwt)\s*[:=]\s*['"][^'"]{8,}['"]/i,
            'Hardcoded Password': /(?:password|passwd|pwd)\s*[:=]\s*['"][^'"]{3,}['"]/i,
            'Bearer Token': /Bearer\s+[A-Za-z0-9\-._~+/]+=*/,
            'Private Key': /-----BEGIN\s+(RSA\s+)?PRIVATE\s+KEY-----/,
          },
        },
      ],
    },
  },
])