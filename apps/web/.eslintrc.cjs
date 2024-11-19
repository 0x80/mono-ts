/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  extends: ["@repo/eslint-config/next.js","next/core-web-vitals"],
  "plugins": [
    //...
    "tss-unused-classes"
  ],
  "rules": {
    "tss-unused-classes/unused-classes": "warn",
    '@typescript-eslint/no-floating-promises': 'off', // Disable the rule

    
  },
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
