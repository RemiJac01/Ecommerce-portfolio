import { test, expect } from "../fixtures/base.js";
import { blockThirdParty } from "../utils/blockThirdParty.js";

test("Product detail page", async ({ page }) => {
  await blockThirdParty(page);
  await page.goto("/products");
  await page.locator('[href="/product_details/5"]').click();
  await expect(page.getByText("Winter Top")).toBeVisible();
  await expect(page.getByText("Category: Women > Tops")).toBeVisible();
  await expect(page.getByText("Rs. 600")).toBeVisible();
  await expect(page.locator(".view-product").getByRole("img")).toHaveAttribute(
    "src",
    "/get_product_picture/5",
  );
});
