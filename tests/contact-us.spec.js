import { dismissConsent } from "../utils/dismissConsent";
import { test, expect } from "../fixtures/base.js";

test("Contact us page", async ({ page }) => {
  await page.goto("https://automationexercise.com/contact_us");
  await dismissConsent(page);
  await page.locator('[data-qa="name"]').fill("This is a test");
  await page.locator('[data-qa="email"]').fill("test@test.com");
  await page.locator('[data-qa="subject"]').fill("This is a test question");
  await page.locator('[data-qa="message"]').fill("This is a test message!");
  await page
    .locator('[name="upload_file"]')
    .setInputFiles("test_fixtures/Test_data_1.rtf");
  page.on("dialog", (dialog) => dialog.accept()); //dismisses browser dialog pop up
  await page.getByRole("button", { name: "Submit" }).click();
  await expect(
    page
      .locator("#contact-page")
      .getByText("Success! Your details have been submitted successfully."),
  ).toBeVisible();
});
