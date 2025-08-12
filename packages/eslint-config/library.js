import baseConfig from "./base.js";
import { typescriptOverrides } from "./typescript-overrides.js";

/**
 * A custom ESLint configuration for libraries.
 *
 * @type {import("eslint").Linter.Config[]}
 */
export default [...baseConfig, typescriptOverrides];
