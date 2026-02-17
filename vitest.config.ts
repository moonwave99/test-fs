import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    coverage: {
      provider: "istanbul",
      include: ["src/"],
    },
    exclude: ["node_modules", "example"],
  },
});
