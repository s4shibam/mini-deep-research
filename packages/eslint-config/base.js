import js from '@eslint/js'
import eslintConfigPrettier from 'eslint-config-prettier'
import turboPlugin from 'eslint-plugin-turbo'
import tseslint from 'typescript-eslint'
import onlyWarn from 'eslint-plugin-only-warn'

/** @type {import("eslint").Linter.Config[]} */
export const config = [
  js.configs.recommended,
  eslintConfigPrettier,
  ...tseslint.configs.recommended,
  {
    plugins: {
      turbo: turboPlugin
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'turbo/no-undeclared-env-vars': 'off'
    }
  },
  {
    plugins: {
      onlyWarn
    }
  },
  {
    ignores: ['dist/**']
  }
]
