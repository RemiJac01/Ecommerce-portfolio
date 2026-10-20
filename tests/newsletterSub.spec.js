import { test, expect } from "../fixtures/base.js";
import { blockAds } from "../utils/blockAds.js";

test("Successful newsletter subscription", async ({ page }) => {
  await blockAds(page);
  await page.goto("https://automationexercise.com/");
  const email = `test${Date.now()}@dummy.com`;
  await page.locator('[id="susbscribe_email"]').fill(email);
  await page.locator('[id="subscribe"]').click();
  await expect(
    page.getByText("You have been successfully subscribed!"),
  ).toBeVisible();
});
