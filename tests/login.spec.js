import { test, expect } from "../fixtures/base.js";
import { LoginPage } from "../pages/LoginPage.js";

const invalidLogins = [
  {
    username: "incorrect@email.com",
    password: "PW123",
    error: "Your email or password is incorrect!",
  },
  {
    username: "PWtest@PW.com",
    password: "PW123456",
    error: "Your email or password is incorrect!",
  },
];

for (const arrayData of invalidLogins) {
  test(`Incorrect UN & PW tests for ${arrayData.username}`, async ({
    page,
  }) => {
    await page.goto("https://automationexercise.com/login");
    const consentButton = page.getByRole("button", { name: "Consent" });
    if (await consentButton.isVisible()) {
      await consentButton.click();
    }
    const signInPage = new LoginPage(page);
    await signInPage.login(arrayData.username, arrayData.password);
    await expect(page.getByText(arrayData.error)).toBeVisible();
  });
}

test("Login", async ({ page }) => {
  await page.goto("https://automationexercise.com/login");
  const consentButton = page.getByRole("button", { name: "Consent" });
  if (await consentButton.isVisible()) {
    await consentButton.click();
  }
  const signInPage = new LoginPage(page);
  await signInPage.login("PWtest@PW.com", "PW123");
  await expect(page).toHaveURL("https://automationexercise.com/");
  await expect(
    page
      .getByText(
        "All QA engineers can use this website for automation practice and API testing either they are at beginner or advance level. This is for everybody to help them brush up their automation skills.",
      )
      .first(),
  ).toBeVisible();
});
