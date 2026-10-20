import { test as base } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage.js";
import { blockAds } from "../utils/blockAds.js";

//A fixture answers "what state does a test need to start in?"
//Fixture = what state a test starts in (loggedInPage delivers an already-logged-in tab)

export const test = base.extend({
  loggedInPage: async ({ page }, use) => {
    await blockAds(page);
    await page.goto("/login");

    const loginActions = new LoginPage(page);
    await loginActions.login("PWtest@PW.com", "PW123");
    // Required Playwright syntax — this is where the fixture pauses and lets the test run.
    await use(page);
  },
});

export { expect } from "@playwright/test";
