import { test as base } from "@playwright/test";

export const test = base.extend({
  loggedInPage: async ({ page }, use) => {
    await page.goto("https://automationexercise.com/login");
    const consentButton = page.getByRole("button", { name: "Consent" });
    if (await consentButton.isVisible()) {
      await consentButton.click();
    }
    await page.locator('[data-qa="login-email"]').fill("PWtest@PW.com");
    await page.locator('[data-qa="login-password"]').fill("PW123");
    await page.getByRole("button", { name: "Login" }).click();
    await use(page);
  },
});

export { expect } from "@playwright/test";
