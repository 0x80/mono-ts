/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  extends: ["@repo/eslint-config/next.js"],
  /** A workaround to have the next.config use the mjs extension */
  overrides: [
    {
      files: ["*.mjs"],
      parser: "espree",
      parserOptions: {
        ecmaVersion: 2022,
      },
    },
  ],
};
