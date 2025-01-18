// @ts-check
import nextPlugin from "@vercel/style-guide/eslint/next";
import tseslint from "typescript-eslint";
import baseConfig from "./base.js";

export default tseslint.config(
  ...baseConfig,
  ...nextPlugin.configs.recommended,
  {
    languageOptions: {
      globals: {
        React: true,
        JSX: true,
      },
      parserOptions: {
        ecmaVersion: "latest",
      },
    },
  }
);
