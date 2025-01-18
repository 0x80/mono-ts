import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
  },
  format: ["esm"],
  target: "es2022",
  sourcemap: true,

  /**
   * Do not use tsup for generating d.ts files because it can not generate type
   * the definition maps required for go-to-definition to work in our IDE. We
   * use tsc for that.
   */
});
