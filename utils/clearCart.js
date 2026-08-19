import { expect } from "@playwright/test";

export async function clearCart(page) {
  const deleteButtons = page.locator("a.cart_quantity_delete");
  while ((await deleteButtons.count()) > 0) {
    const countBefore = await deleteButtons.count();
    await deleteButtons.first().click();
    await expect(deleteButtons).toHaveCount(countBefore - 1);
  }
}
