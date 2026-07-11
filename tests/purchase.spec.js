import { test, expect } from "../fixtures/base.js";

test("Product purchase journey", async ({ loggedInPage }) => {
  await loggedInPage.goto("https://automationexercise.com/products");
  await loggedInPage.locator('[data-product-id="1"]').first().click();
  await loggedInPage.getByRole("link", { name: "View Cart" }).click();
  await loggedInPage.locator("a.check_out").click();
  await loggedInPage.getByRole("link", { name: "Place Order" }).click();
  await loggedInPage.locator('[data-qa="name-on-card"]').fill("PWTest");
  await loggedInPage.locator('[data-qa="card-number"]').fill("1234-5678-91011");
  await loggedInPage.locator('[data-qa="cvc"]').fill("235");
  await loggedInPage.locator('[data-qa="expiry-month"]').fill("12");
  await loggedInPage.locator('[data-qa="expiry-year"]').fill("2030");
  await loggedInPage
    .getByRole("button", { name: "Pay and Confirm Order" })
    .click();
  await expect(loggedInPage).toHaveURL(
    "https://automationexercise.com/payment_done/500",
  );
  await expect(
    loggedInPage.getByText("Congratulations! Your order has been confirmed!"),
  ).toBeVisible();
});
