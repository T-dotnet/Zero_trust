import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  testMatch: "mvp.spec.ts",
  fullyParallel: false,
  timeout: 45_000,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3000",
    viewport: { width: 1536, height: 1024 },
    launchOptions: {
      executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
      args: ["--no-sandbox", "--disable-dev-shm-usage"],
    },
  },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000/api/health",
    reuseExistingServer: true,
  },
});
