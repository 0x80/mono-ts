import config from "@repo/eslint-config/service";

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...config,
  {
    ignores: ["dist/**", "node_modules/**", "*.{js,ts}"],
  },
];
