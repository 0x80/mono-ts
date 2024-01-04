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
    node: true,
    browser: true,
  },
};
