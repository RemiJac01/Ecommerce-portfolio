export async function blockAds(page) {
  await page.route("**/*googlesyndication.com/**", (route) => route.abort());
  await page.route("**/*doubleclick.net/**", (route) => route.abort());
}
