import { defineConfig } from "tsup";

export default defineConfig({
  entry: [
    "src/index.ts",
    "src/auth.ts",
    "src/utils/**/*.ts",
    "src/controllers/**/*.ts",
  ],
  format: ["cjs", "esm"],
  dts: true,
  clean: true,
  sourcemap: true,
  minify: false,
  splitting: false,
  treeshake: true,
  external: ["@repo/db", "better-auth", "hono"],
});
