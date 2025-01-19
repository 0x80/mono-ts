// @ts-check
/* eslint-disable */
import { FlatCompat } from "@eslint/eslintrc";
import baseConfig from "@repo/eslint-config/base";
import tseslint from "typescript-eslint";

const compat = new FlatCompat({
  // import.meta.dirname is available after Node.js v20.11.0
  baseDirectory: import.meta.dirname,
});

export default tseslint.config(
  ...baseConfig,
  // js.configs.recommended,
  ...compat.config({
    extends: ["next"],
    settings: {
      next: {
        rootDir: "apps/web/",
      },
    },
  }),
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // "@typescript-eslint/no-non-null-assertion": "off", // @TODO enable later
      // "@typescript-eslint/no-confusing-void-expression": "off", // @TODO enable later
      // "@typescript-eslint/no-unsafe-assignment": "off", // @TODO enable later
      // "@typescript-eslint/restrict-template-expressions": "off", // @TODO enable later
      // "@typescript-eslint/no-deprecated": "off",
      "@typescript-eslint/use-unknown-in-catch-callback-variable": "off",
      // "@typescript-eslint/no-unused-vars": [
      //   "warn",
      //   { argsIgnorePattern: "^_" },
      // ],
    },
  }
);
