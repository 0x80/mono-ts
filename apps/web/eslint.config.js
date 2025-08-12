// @ts-check
/* eslint-disable */
import { FlatCompat } from "@eslint/eslintrc";
import baseConfig from "@repo/eslint-config/base";

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

export default [
  ...baseConfig,
  ...compat.config({
    extends: ["next"],
    settings: {
      next: {
        rootDir: "apps/web/", // required for monorepos
      },
    },
  }),
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "@typescript-eslint/use-unknown-in-catch-callback-variable": "off",
      "no-html-link-for-pages": "off",
    },
  },
];
