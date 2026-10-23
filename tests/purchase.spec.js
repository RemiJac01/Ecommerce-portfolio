import { test, expect } from "../fixtures/base.js";
import { PaymentPage } from "../pages/PaymentPage.js";
import { clearCart } from "../utils/clearCart.js";
import { blockThirdParty } from "../utils/blockThirdParty.js";

test("Product purchase journey", async ({ loggedInPage }) => {
  test.setTimeout(60000); //Checkout transition is slow on CI infrastructure, default 30s is not enough
  await blockThirdParty(loggedInPage);
  await loggedInPage.goto("/view_cart");
  await clearCart(loggedInPage);
  const paymentActions = new PaymentPage(loggedInPage);
  await loggedInPage.goto("/products");
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
