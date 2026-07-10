import { test, expect } from "../fixtures/base.js";

test("Product purchase journey", async ({ loggedInPage }) => {
  await loggedInPage.goto("https://automationexercise.com/products");
  await loggedInPage.locator('[data-product-id="1"]').click();
});
