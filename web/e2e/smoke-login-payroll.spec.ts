import { test, expect } from "@playwright/test";

import { hasRunnableStagingE2e } from "./env-guards";

const skipReason =
  "Set a real staging origin and credentials: E2E_BASE_URL or E2E_STAGING_URL (https only, not *.example.com), " +
  "E2E_USER_EMAIL (valid email), E2E_USER_PASSWORD (min 8 chars). " +
  "CI maps E2E_STAGING_URL → E2E_BASE_URL.";

test.describe("staging smoke: login → payroll", () => {
  test.beforeEach(() => {
    test.skip(!hasRunnableStagingE2e(), skipReason);
  });

  test("signs in and reaches payroll", async ({ page }) => {
    const email = process.env.E2E_USER_EMAIL!.trim();
    const password = process.env.E2E_USER_PASSWORD!;

    await page.goto("/login", { waitUntil: "domcontentloaded" });

    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: "Login" }).click();

    await expect(page).toHaveURL(/\/(dashboard|payroll)/, { timeout: 45_000 });

    await page.goto("/payroll", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/payroll/);

    await expect(page.getByRole("heading", { name: "Payroll", exact: true })).toBeVisible({
      timeout: 20_000,
    });
  });
});
