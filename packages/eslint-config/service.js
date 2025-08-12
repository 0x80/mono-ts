import globals from "globals";
import baseConfig from "./base.js";
import { typescriptOverrides } from "./typescript-overrides.js";

/**
 * A custom ESLint configuration for backend services.
 *
 * @type {import("eslint").Linter.Config[]}
 */
export default [
  ...baseConfig,
  /** Would be nice to have this, but too much work right now */
  // ...tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      globals: {
        ...globals.serviceworker,
        ...globals.browser,
      },
    },
  },
  typescriptOverrides,
];
