import { test, expect } from "../fixtures/base.js";
import { dismissConsent } from "../utils/dismissConsent.js";

const categories = [
  { parent: "Women", child: "Dress", heading: "WOMEN - DRESS PRODUCTS" },
];

for (const item of categories) {
  test(`Filter by ${item.parent} - ${item.child}`, async ({ page }) => {
    await page.goto("/products");
    await dismissConsent(page);
    await page.locator(`[href="#${item.parent}"]`).click();
    await page
      .locator(`#${item.parent}`)
      .getByRole("link", { name: item.child, exact: true })
      .click();
    await expect(page.getByText(new RegExp(item.heading, "i"))).toBeVisible();
  });
}
