import { test, expect } from "../fixtures/base.js";
import { dismissConsent } from "../utils/dismissConsent.js";
import { PaymentPage } from "../pages/PaymentPage.js";

test("Product purchase journey", async ({ loggedInPage }) => {
  const paymentActions = new PaymentPage(loggedInPage);
  await loggedInPage.goto("https://automationexercise.com/products");
  await dismissConsent(loggedInPage);
  await loggedInPage.locator('[data-product-id="1"]').first().click();
  await loggedInPage.getByRole("link", { name: "View Cart" }).click();
  await loggedInPage.locator("a.check_out").click();
  await loggedInPage.getByRole("link", { name: "Place Order" }).click();
  await paymentActions.paymentConfirm(
    "PWTest",
    "1234-5678-91011",
    "235",
    "12",
    "2030",
  );
  await expect(loggedInPage).toHaveURL(/payment_done\/\d+/);
  await expect(
    loggedInPage.getByText("Congratulations! Your order has been confirmed!"),
  ).toBeVisible();
});
