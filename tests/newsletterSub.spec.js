import { test, expect } from "../fixtures/base.js";
import { blockThirdParty } from "../utils/blockThirdParty.js";

test("Successful newsletter subscription", async ({ page }) => {
  await blockThirdParty(page);
  await page.goto("/");
  const email = `test${Date.now()}@dummy.com`;
  await page.locator('[id="susbscribe_email"]').fill(email);
  await page.locator('[id="subscribe"]').click();
  await expect(
    page.getByText("You have been successfully subscribed!"),
  ).toBeVisible();
});
