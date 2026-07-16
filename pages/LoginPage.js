export class LoginPage {
  constructor(page) {
    this.page = page;
    this.emailField = page.locator('[data-qa="login-email"]');
    this.passwordField = page.locator('[data-qa="login-password"]');
    this.loginButton = page.getByRole("button", { name: "Login" });
  }

  async login(email, password) {
    await this.emailField.fill(email);
    await this.passwordField.fill(password);
    await this.loginButton.click();
  }
}
