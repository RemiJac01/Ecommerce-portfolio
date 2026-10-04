# Bug Report Example

A sample bug report, written in the format I would use in a real QA role. The bug below is a genuine finding from manual exploration of [automationexercise.com](https://automationexercise.com) during the build of this test framework.

Including this in the portfolio because automation repos rarely show the manual QA craft that sits alongside the automation: observing, isolating, and documenting defects clearly enough for a developer to act on without a follow-up conversation.

---

## BUG-001: Quantity field in cart appears editable but does not accept input

**Reported by:** Remi Jacobsson
**Date:** 2026-09-29
**Environment:** Chrome 128 on macOS 14.5
**Build / URL:** https://automationexercise.com (production)

### Summary

On the cart page, the "Quantity" field for each item is rendered as an input element and visually appears editable (cursor changes, field accepts focus), but any attempt to change the value is silently discarded. Users have no way to adjust the quantity of an item already in the cart.

### Severity: Medium

Not a blocker (the user can work around it by removing the item and re-adding it from the product page), but misleading UI costs user trust and increases abandonment risk on checkout. For an e-commerce site, friction in the cart is directly tied to revenue.

### Priority: Medium

Visible on every cart interaction. Should be fixed in the next cart-related release.

### Steps to Reproduce

1. Navigate to https://automationexercise.com/products
2. Click "Add to cart" on any product
3. Click "Continue Shopping" on the confirmation modal
4. Click the "Cart" link in the top navigation
5. In the Quantity column for the added item, click into the quantity field
6. Attempt to change the value (e.g. type "3" or use arrow keys)
7. Click elsewhere on the page or press Tab to blur the field

### Expected Result

The quantity updates to the new value. The line total (price × quantity) recalculates accordingly.

### Actual Result

The field accepts focus and appears editable, but the entered value is discarded on blur. The displayed quantity reverts to its original value. The line total does not update. No error message or feedback is shown to the user.

### Evidence

- Confirmed in Chrome, Firefox, and Safari (WebKit)
- Confirmed with keyboard entry and up/down arrow buttons
- Field has `name="quantity"` and `type="button"` in the DOM, suggesting it is styled as an input but not wired to a change handler
- Screenshot: [would attach `cart-quantity-bug.png` here in a real report]

### Suggested Fix

Either:

- Wire the quantity field to a change handler that updates the cart state and recalculates the line total, or
- Disable editing on the field and surface the limitation clearly (e.g. "To change quantity, remove and re-add the item"), so users are not misled by an input that does not function.

The first option is the better user experience and matches typical e-commerce conventions.

### Additional Notes

Discovered during exploratory testing while building automated coverage for cart behaviour. The test suite was adapted to assert on the correct line-total calculation when the same item is added multiple times (via the "Add to cart" flow), since that is the only way users can actually increase quantity on this site.
