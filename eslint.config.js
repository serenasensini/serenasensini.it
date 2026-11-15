import js from '@eslint/js';
import globals from 'globals';

export default [
  { ignores: ['dist/', 'node_modules/'] },
  js.configs.recommended,
  { files: ['**/*.mjs', '*.js'], languageOptions: { globals: globals.node } },
  {
    files: ['src/scripts/**/*.js'],
    languageOptions: { sourceType: 'script', globals: globals.browser },
  },
];
