module.exports = {
  parser: "@typescript-eslint/parser",
  extends: [
    "turbo",
    "prettier",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
  ],
  plugins: ["@typescript-eslint"],
  rules: {
    "@next/next/no-html-link-for-pages": "off",
    // @TODO figure out how to use this
    "turbo/no-undeclared-env-vars": "off",
    "@typescript-eslint/no-unused-vars": [
      "error",
      { args: "after-used", argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
    ],
  },
};
