import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    events: "src/events/index.ts",
    index: "src/index.ts",
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
