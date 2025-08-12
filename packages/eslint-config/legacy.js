import js from "@eslint/js";
import onlyWarn from "eslint-plugin-only-warn";
import turboPlugin from "eslint-plugin-turbo";
import tseslint from "typescript-eslint";

/**
 * A legacy ESLint configuration for packages that don't need strict type
 * checking. This is intended for legacy code that won't be updated frequently.
 *
 * @type {import("eslint").Linter.Config[]}
 */
export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  // Note: We intentionally exclude strictTypeChecked for legacy packages
  {
    plugins: {
      turbo: turboPlugin,
    },
    rules: {
      ...turboPlugin.configs.recommended.rules,
    },
  },
  {
    plugins: {
      onlyWarn,
    },
  },
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      /** Basic rules for legacy code - less strict than main config */
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-expressions": [
        "error",
        { allowShortCircuit: true, allowTernary: true, enforceForJSX: true },
      ],
    },
  },
  {
    ignores: ["dist/**", "node_modules/**", "isolate/**", "*.{js,ts}"],
  },
];
