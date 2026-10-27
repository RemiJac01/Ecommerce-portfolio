import { test, expect } from "../fixtures/base.js";
import { clearCart } from "../utils/clearCart.js";
import { blockThirdParty } from "../utils/blockThirdParty.js";
import { productOne } from "../test_data/data.js";

test("cart quantity and price test", async ({ page }) => {
  await blockThirdParty(page);
  await page.goto("/products");
  await clearCart(page);
  await page.locator(`[data-product-id="${productOne.id}"]`).first().click();
  await page.locator(".close-modal").click();
  await page.locator(`[data-product-id="${productOne.id}"]`).first().click();
  await page.getByRole("link", { name: "View Cart" }).click();
  await expect(page.locator(".cart_quantity")).toHaveText("2");
  await expect(page.locator(".cart_total_price")).toHaveText(
    productOne.expectedCartTotal,
  );
});
