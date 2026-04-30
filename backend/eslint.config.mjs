import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import noSecrets from 'eslint-plugin-no-secrets';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: {
      'no-secrets': noSecrets,
    },
    rules: {
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
  }
);
