/** @type {import("eslint").Linter.Config} */
module.exports = {
  plugins: ["@typescript-eslint", "unused-imports"],
  rules: {
    "@typescript-eslint/no-unused-vars": [
      "error",
      { args: "after-used", argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
    ],
    "@typescript-eslint/no-floating-promises": "error",
    "@typescript-eslint/no-misused-promises": "warn",
    "@typescript-eslint/consistent-type-imports": "warn",
    "@typescript-eslint/consistent-type-definitions": ["warn", "type"],
    "@typescript-eslint/no-import-type-side-effects": "warn",
    "array-callback-return": "warn",
    "unused-imports/no-unused-imports": "warn",
    "no-template-curly-in-string": "error",
  },
};
