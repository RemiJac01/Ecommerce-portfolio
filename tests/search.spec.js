import { test, expect } from "../fixtures/base.js";
import { dismissConsent } from "../utils/dismissConsent.js";

test("Product search", async ({ page }) => {
  await page.goto("https://automationexercise.com/products");
  await dismissConsent(page);
  await page.locator("#search_product").fill("Tshirt");
  await page.locator("#submit_search").click();
  await expect(
    page.locator(".productinfo").getByText("Men Tshirt"),
  ).toBeVisible();
  await expect(page).toHaveURL(/products\?search=/i);
  await expect(page.getByText("SEARCHED PRODUCTS")).toBeVisible();
  await expect(page.locator(".product-image-wrapper").first()).toBeVisible();
});
