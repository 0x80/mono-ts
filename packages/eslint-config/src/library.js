// @ts-check
import tseslint from "typescript-eslint";
import baseConfig from "./base.js";

export default tseslint.config([
  ...baseConfig,
  {
    languageOptions: {
      globals: {
        React: true,
        JSX: true,
      },
      parserOptions: {
        ecmaVersion: "latest",
      },
      sourceType: "module",
    },
  },
]);
