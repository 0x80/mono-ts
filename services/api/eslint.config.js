// @ts-check
import base from "@repo/eslint-config/base";
import overrides from "@repo/eslint-config/overrides";
import tseslint from "typescript-eslint";

export default tseslint.config(
  ...base,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  ...overrides
);
