import tseslint from "typescript-eslint";

export default tseslint.config({
  rules: {
    // "@typescript-eslint/no-non-null-assertion": "off", // @TODO enable later
    // "@typescript-eslint/no-confusing-void-expression": "off", // @TODO enable later
    // "@typescript-eslint/no-unsafe-assignment": "off", // @TODO enable later
    // "@typescript-eslint/restrict-template-expressions": "off", // @TODO enable later
    // "@typescript-eslint/no-deprecated": "off",
    "@typescript-eslint/use-unknown-in-catch-callback-variable": "off",
    "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
  },
});
