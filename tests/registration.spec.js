import { test, expect } from "@playwright/test";

test("Successful registration", async ({ page }) => {
  await page.goto("https://automationexercise.com/login");
  await page.getByRole("button", { name: "Consent" }).click();
  await page.getByPlaceholder("Name").fill("nametest");
  await page.locator('[data-qa="signup-email"]').fill("emailtest@test.com");
  await page.getByRole("button", { name: "Signup" }).click();
});
