// // @ts-check
import base from "@repo/eslint-config/base";
import overrides from "@repo/eslint-config/overrides";

export default tseslint.config(
  ...base,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
        allowDefaultProject: true,
      },
    },
  },
  ...overrides
);
