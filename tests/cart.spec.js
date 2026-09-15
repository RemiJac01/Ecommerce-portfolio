import { test, expect } from "../fixtures/base.js";
import { clearCart } from "../utils/clearCart.js";
import { dismissConsent } from "../utils/dismissConsent.js";

test("cart quantity and price test", async ({ page }) => {
  await page.goto("/products");
  await dismissConsent(page);
  await clearCart(page);
  await page.locator('[data-product-id="1"]').first().click();
  await page.locator(".close-modal").click();
  await page.locator('[data-product-id="1"]').first().click();
  await page.getByRole("link", { name: "View Cart" }).click();
  await expect(page.locator(".cart_quantity")).toHaveText("2");
  await expect(page.locator(".cart_total_price")).toHaveText("Rs. 1000");
});
