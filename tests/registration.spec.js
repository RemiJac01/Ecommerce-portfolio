import { test, expect } from "@playwright/test";

test("Successful registration", async ({ page }) => {
  await page.goto("https://automationexercise.com/login");
  const consentButton = page.getByRole("button", { name: "Consent" });
  if (await consentButton.isVisible()) {
    await consentButton.click();
  }
  await page.getByPlaceholder("Name").fill("nametest");
  const email = `test${Date.now()}@test.com`;
  await page.locator('[data-qa="signup-email"]').fill(email);
  await page.getByRole("button", { name: "Signup" }).click();
  await expect(page.getByText("Enter account information")).toBeVisible();
});
