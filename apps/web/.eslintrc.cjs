// @ts-check
const { defineConfig } = require("eslint-define-config");

module.exports = defineConfig({
  root: true,
  extends: ["@repo/custom", "next/core-web-vitals"],
  overrides: [
    {
      files: ["*.mjs"],
      parser: "espree",
      parserOptions: {
        ecmaVersion: 2022,
      },
    },
  ],
});
