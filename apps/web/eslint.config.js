// @ts-check
/* eslint-disable */
import { FlatCompat } from "@eslint/eslintrc";
import baseConfig from "@repo/eslint-config/base";
import tseslint from "typescript-eslint";

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

export default tseslint.config(
  ...baseConfig,
  ...compat.config({
    extends: ["next"],
    settings: {
      next: {
        rootDir: "apps/web/", // required for monorepos
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
      "@typescript-eslint/use-unknown-in-catch-callback-variable": "off",
    },
  }
);
