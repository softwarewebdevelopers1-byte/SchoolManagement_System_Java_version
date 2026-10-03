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
      "src/components/shared/notifications/NotificationContext.test.tsx",
      "src/components/shared/ArchivesView.test.tsx",
      "src/lib/api.download.test.ts",
    ],
  },
});