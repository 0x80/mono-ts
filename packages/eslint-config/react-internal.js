/*
 * This is a custom ESLint configuration for use with
 * internal (bundled by their consumer) libraries
 * that utilize React.
 *
 * This config extends the Vercel Engineering Style Guide.
 * For more information, see https://github.com/vercel/style-guide
 *
 */

/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: [
    "./partials/base.js",
    require.resolve("@vercel/style-guide/eslint/next"),
    "./partials/additional-rules.js",
  ],
  globals: {
    React: true,
    JSX: true,
  },
  env: {
    browser: true,
  },
};
