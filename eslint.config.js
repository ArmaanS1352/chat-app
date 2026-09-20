import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      ...js.configs.recommended.rules,

      "no-unused-vars": "off",
      "no-useless-assignment": "warn",
      "no-unused-private-class-members": "off",
      "no-unused-labels": "off",
      "no-redeclare": "off",
      "@typescript-eslint/no-unused-vars": "off",
      // Correct AST selector for console.log[array2]
      "no-restricted-syntax": [
        "error",
        {
          "selector": "MemberExpression[computed=true] > MemberExpression[object.name='console'][property.name='log']",
          "message": "Did you mean console.log(value)? Bracket access on console.log is almost always a mistake."
        }
      ]
    }

  },
])
