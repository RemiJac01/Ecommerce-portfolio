import { test as base } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage.js";
import { dismissConsent } from "../utils/dismissConsent.js";

export const test = base.extend({
  loggedInPage: async ({ page }, use) => {
    await page.goto("https://automationexercise.com/login");
    await dismissConsent(page);

    const loginActions = new LoginPage(page);
    await loginActions.login("PWtest@PW.com", "PW123");
    // Required Playwright syntax — this is where the fixture pauses and lets the test run.
    await use(page);
  },
});

export { expect } from "@playwright/test";
