export class PaymentPage {
  constructor(page) {
    this.page = page;
    this.nameOnCard = page.locator('[data-qa="name-on-card"]');
    this.cardNumber = page.locator('[data-qa="card-number"]');
    this.cvc = page.locator('[data-qa="cvc"]');
    this.expiryMonth = page.locator('[data-qa="expiry-month"]');
    this.expiryYear = page.locator('[data-qa="expiry-year"]');
    this.payConfirmButton = page.getByRole("button", {
      name: "Pay and Confirm Order",
    });
  }

  async paymentConfirm(nameOnCard, cardNumber, cvc, expiryMonth, expiryYear) {
    await this.nameOnCard.fill(nameOnCard);
    await this.cardNumber.fill(cardNumber);
    await this.cvc.fill(cvc);
    await this.expiryMonth.fill(expiryMonth);
    await this.expiryYear.fill(expiryYear);
    await this.payConfirmButton.click();
  }
}
