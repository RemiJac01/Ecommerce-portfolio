import { test, expect } from "../fixtures/base.js";
import { blockThirdParty } from "../utils/blockThirdParty.js";

test("Product search", async ({ page }) => {
  await blockThirdParty(page);
  await page.goto("/products");
  await page.locator("#search_product").fill("Tshirt");
  await page.locator("#submit_search").click();
  await expect(
    page.locator(".productinfo").getByText("Men Tshirt"),
  ).toBeVisible();
  await expect(page).toHaveURL(/products\?search=/i);
  await expect(page.getByText("SEARCHED PRODUCTS")).toBeVisible();
});
