/**
 * Shared TypeScript ESLint rule overrides for the Gemini monorepo. These rules
 * are applied across all packages to maintain consistency.
 */
export const typescriptOverrides = {
  files: ["**/*.ts", "**/*.tsx"],
  languageOptions: {
    parserOptions: {
      projectService: true,
      tsconfigRootDir: import.meta.dirname,
    },
  },
  rules: {
    /** Rules we loosen from full strictness */
    "@typescript-eslint/no-confusing-void-expression": "off",
    "@typescript-eslint/restrict-template-expressions": [
      "warn",
      {
        allowBoolean: true,
        allowNullish: true,
        allowNever: true,
      },
    ],
    "@typescript-eslint/no-unused-expressions": [
      "error",
      { allowShortCircuit: true, allowTernary: true, enforceForJSX: true },
    ],
    "@typescript-eslint/no-deprecated": "off",
    "@typescript-eslint/use-unknown-in-catch-callback-variable": "off",
    "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    /**
     * I don't mind enforcing it again, but it will convert everything to
     * interface then, so that will give a lot of noise in the PR
     */
    "@typescript-eslint/consistent-type-definitions": "off",
  },
};

/** Additional overrides specific to packages using MobX */
export const mobxOverrides = {
  rules: {
    "@typescript-eslint/unbound-method": "off", // We use MobX autoBind
  },
};

/** Additional overrides specific to React projects */
export const reactOverrides = {
  rules: {
    /**
     * Not sure that is causing this, maybe something to do with
     * StyledComponents
     */
    "react/no-unknown-property": "off",
  },
};
