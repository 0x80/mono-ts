/** Configuration for backend services. Currently the same as "library". */
/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: ["./partials/base.js", "./partials/additional-rules.js"],
  globals: {
    React: true,
    JSX: true,
  },
  env: {
    node: true,
  },
};
