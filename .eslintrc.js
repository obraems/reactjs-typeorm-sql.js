module.exports = {
  env: {
    browser: true,
    es2021: true,
    'jest/globals': true,
  },
  extends: [
    'plugin:react/recommended',
    'airbnb',
    'plugin:@typescript-eslint/recommended', // Ajout de la configuration TypeScript ESLint
  ],
  overrides: [],
  parser: '@typescript-eslint/parser', // Utilisation du parser TypeScript
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true, // Support JSX
    },
  },
  plugins: [
    'react',
    'jest',
    '@typescript-eslint', // Ajout du plugin TypeScript ESLint
  ],
  globals: {
    APP_ENV: 'readonly',
    fetchMock: 'readonly',
  },
  rules: {
    'no-console': ['error', {
      allow: ['warn', 'error'],
    }],
    'no-underscore-dangle': 'off',
    'react/prop-types': 'off',
    'react/jsx-filename-extension': [1, { extensions: ['.js', '.jsx', '.ts', '.tsx'] }], // Autoriser JSX dans les fichiers .tsx
    '@typescript-eslint/no-unused-vars': ['error'], // Exemple de règle spécifique à TypeScript
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'never',
        jsx: 'never',
        ts: 'never',
        tsx: 'never',
      },
    ],
    'no-use-before-define': 'off', // Désactiver la règle par défaut
    '@typescript-eslint/no-use-before-define': ['error'], // Utiliser la version spécifique à TypeScript
  },
  settings: {
    'import/resolver': {
      typescript: {}, // Ajout du résolveur TypeScript
    },
    react: {
      version: 'detect', // Détection automatique de la version de React
    },
  },
};
