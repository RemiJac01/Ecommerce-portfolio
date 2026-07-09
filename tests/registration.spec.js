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
  await page.locator('[value="Mr"]').click();
  await page.locator('[data-qa="password"]').fill("secretpassword");
  await page.locator('[data-qa="days"]').selectOption("1");
  await page.locator('[data-qa="months"]').selectOption("5");
  await page.locator('[data-qa="years"]').selectOption("1980");
  await page.locator('[data-qa="first_name"]').fill("Test");
  await page.locator('[data-qa="last_name"]').fill("Testing");
  await page.locator('[data-qa="address"]').fill("1 Upwood Road");
  await page.locator('[data-qa="country"]').selectOption("Australia");
  await page.locator('[data-qa="state"]').fill("Queensland");
  await page.locator('[data-qa="city"]').fill("Sydney");
  await page.locator('[data-qa="zipcode"]').fill("2000");
  await page.locator('[data-qa="mobile_number"]').fill("07949532458");
  await page.getByRole("button", { name: "Create Account" }).click();
  await expect(page).toHaveURL(
    "https://automationexercise.com/account_created",
  );
  await expect(page.getByText("Account Created!")).toBeVisible();
});
