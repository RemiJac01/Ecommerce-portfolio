import { test, expect } from "@playwright/test";

test("Successful registration", async ({ page }) => {
  await page.goto("https://automationexercise.com/login");
  const consentButton = page.getByRole("button", { name: "Consent" });
  if (await consentButton.isVisible()) {
    await consentButton.click();
  }
  await page.getByPlaceholder("Name").fill("nametest");
  await page.locator('[data-qa="signup-email"]').fill("emailtest@test.com");
  await page.getByRole("button", { name: "Signup" }).click();
});
