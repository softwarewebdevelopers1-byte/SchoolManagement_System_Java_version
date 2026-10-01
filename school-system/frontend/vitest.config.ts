import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    include: [
      "src/lib/api.cache.test.ts",
      "src/lib/api.network-log.test.ts",
      "src/lib/api.subjects.test.ts",
      "src/lib/api.users.test.ts",
    ],
  },
});