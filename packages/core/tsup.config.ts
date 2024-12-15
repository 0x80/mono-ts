import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    /**
     * Directories and files should be bundled so that the resulting files line
     * up with the TSC generated type definitions.
     */
    "utils/index": "src/utils/index.ts",

    /** Files */
    firebase: "src/firebase.ts",
  },
  format: ["esm"],
  target: "es2022",
  sourcemap: true,
  // treeshake: true,

  /**
   * Do not use tsup for generating d.ts files because it can not generate type
   * the definition maps required for go-to-definition to work in our IDE. We
   * use tsc for that.
   */
});
