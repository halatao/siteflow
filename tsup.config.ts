import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/next/index.ts", "src/cli/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
  sourcemap: true,
  splitting: false,
  target: "node18",
  platform: "node",
  shims: false,
});
