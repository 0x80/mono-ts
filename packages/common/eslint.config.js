// @ts-check
import baseConfig from "@repo/eslint-config/base";
import tseslint from "typescript-eslint";

export default tseslint.config([
  ...baseConfig,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
        allowDefaultProject: true,
      },
    },
  },
]);
