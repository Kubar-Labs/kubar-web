import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // .checks holds scratch copies of the app (the build served on 3400), tests included.
    exclude: [...configDefaults.exclude, "e2e/**", ".checks/**"],
  },
});
