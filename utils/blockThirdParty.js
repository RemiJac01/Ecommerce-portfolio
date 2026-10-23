export async function blockThirdParty(page) {
  await page.route("**/*googlesyndication.com/**", (route) => route.abort());
  await page.route("**/*doubleclick.net/**", (route) => route.abort());
  await page.route("**/*fundingchoicesmessages.google.com/**", (route) =>
    route.abort(),
  );
}
