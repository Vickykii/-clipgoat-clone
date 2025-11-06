import { test, expect } from "@playwright/test";

test("landing page loads", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { name: /ClipForge/i })).toBeVisible();
});
