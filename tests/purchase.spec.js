import { test, expect } from "../fixtures/base.js";

test("Product purchase journey", async ({ loggedInPage }) => {
  await loggedInPage.goto("https://automationexercise.com/products");
  await loggedInPage.locator('[data-product-id="1"]').first().click();
  await loggedInPage.getByRole("link", { name: "View Cart" }).click();
  await loggedInPage.locator("a.check_out").click();
  await loggedInPage.getByRole("link", { name: "Place Order" }).click();
  await loggedInPage.locator("[]");
});
