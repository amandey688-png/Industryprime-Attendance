import { defineConfig, devices } from "@playwright/test";

import { e2eBaseUrlFromEnv, isUsableE2eBaseUrl } from "./e2e/env-guards";

/**
 * Staging smoke: set in CI (or locally):
 *   E2E_BASE_URL or E2E_STAGING_URL — real https origin (not example.com placeholders)
 *   E2E_USER_EMAIL     — test login email
 *   E2E_USER_PASSWORD  — test login password (min 8 characters)
 */
const rawBase = e2eBaseUrlFromEnv();
const baseURL =
  rawBase && isUsableE2eBaseUrl(rawBase)
    ? rawBase.replace(/\/$/, "")
    : "http://127.0.0.1:3000";

export default defineConfig({
  testDir: "e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? "github" : "list",
  timeout: 60_000,
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "smoke-chromium",
      testMatch: /smoke.*\.spec\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
