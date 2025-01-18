/*
 * This is a custom ESLint configuration for use with
 * internal (bundled by their consumer) libraries
 * that utilize React.
 *
 * This config extends the Vercel Engineering Style Guide.
 * For more information, see https://github.com/vercel/style-guide
 *
 */

// @ts-check
import tseslint from "typescript-eslint";
// import additionalRules from "./partials/additional-rules.js";
import base from "./base.js";

export default tseslint.config([
  ...base,
  // ...vercelNextConfig,
  // ...additionalRules,
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
