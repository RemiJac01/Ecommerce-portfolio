import { test as base } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage.js";

export const test = base.extend({
  loggedInPage: async ({ page }, use) => {
    await page.goto("https://automationexercise.com/login");
    const consentButton = page.getByRole("button", { name: "Consent" });
    if (await consentButton.isVisible()) {
      await consentButton.click();
    }
    const loginPage = new LoginPage(page);
    await loginPage.login("PWtest@PW.com", "PW123");
    await use(page);
  },
});

export { expect } from "@playwright/test";
