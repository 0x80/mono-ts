// @ts-check
import baseConfig from "@repo/eslint-config/base";

export default [
  ...baseConfig,
  {
    languageOptions: {
      globals: {
        NodeJS: true,
      },
      parserOptions: {
        projectService: {
          allowDefaultProject: ["*.js"],
        },
        tsconfigRootDir: import.meta.dirname,
        allowDefaultProject: true,
      },
    },
  },
];
