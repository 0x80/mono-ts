import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import legacyConfig from "./legacy.js";

/**
 * A legacy ESLint configuration for React packages that don't need strict type
 * checking. This is intended for legacy React code that won't be updated
 * frequently.
 *
 * @type {import("eslint").Linter.Config[]}
 */
export default [
  ...legacyConfig,
  pluginReact.configs.flat.recommended,
  {
    languageOptions: {
      ...pluginReact.configs.flat.recommended.languageOptions,
      globals: {
        ...globals.serviceworker,
        ...globals.browser,
      },
    },
  },
  {
    plugins: {
      "react-hooks": pluginReactHooks,
    },
    settings: { react: { version: "detect" } },
    rules: {
      ...pluginReactHooks.configs.recommended.rules,
      // React scope no longer necessary with new JSX transform.
      "react/react-in-jsx-scope": "off",
      // Disable prop-types rule since we're using TypeScript
      "react/prop-types": "off",
    },
  },
];
