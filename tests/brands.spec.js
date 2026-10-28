import { test, expect } from "../fixtures/base";
import { blockThirdParty } from "../utils/blockThirdParty";

test("brand filtering", async ({ page }) => {
  await blockThirdParty(page);
  await page.goto("/products");
  await page.getByRole("link", { name: "Polo" }).click();
  await expect(page.getByText("Brand - Polo Products")).toBeVisible();
  await expect(page).toHaveURL(/brand_products\/Polo/);
});
