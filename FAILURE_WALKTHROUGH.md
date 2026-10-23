# Failure Walkthrough

One worked example of investigating a test failure, from symptom to verified fix. Included because a green suite shows the end state but not the reasoning, and the reasoning is the part that transfers.

---

## Symptom

The data-driven category filter test began failing in CI while passing consistently on my machine. The failure was intermittent: the same commit could pass one run and fail the next, and when it failed, the specific details differed between runs.

Failing step was the click on a sub-category link inside the accordion menu.

## Evidence

```
Error: locator.click: Error: strict mode violation:
getByRole('link', { name: 'Dress' }) resolved to 4 elements:

  1) <a href="/category_products/1">Dress </a>
     aka locator('#Women').getByRole('link', { name: 'Dress' })
  2) <div role="link" aria-label="Dresses" class="google-anno-skip goog-rentry">…</div>
     aka getByRole('link', { name: 'Dresses', exact: true })
  3) <div role="link" aria-label="Explore Trendy Dresses" class="google-anno-skip goog-rentry">…</div>
     aka getByRole('link', { name: 'Explore Trendy Dresses' })
  4) <a href="#" class="google-anno">…</a>
     aka getByRole('link', { name: 'Dress' }).nth(3)
```

A strict mode violation means the locator matched more than one element, so Playwright refused to guess which was intended.

## Investigation

Read the call log rather than the headline. The headline said the click failed; the useful detail was the list of what it matched.

Of the four matches, only the first was the site's own menu link. The other three carried `google-anno` and `goog-rentry` classes and had labels such as "Dresses" and "Explore Trendy Dresses". These were Google ad elements, injected into the page at runtime, that happened to contain the word the locator was matching on.

That explained the two things which had made the failure confusing:

- **Why CI only.** The ads loaded reliably in the CI environment and inconsistently on my machine.
- **Why the details changed between runs.** Ad content is served dynamically, so the injected elements differed each time.

## What I tried first, and why it was wrong

**Attempt one: scope the locator to the accordion panel.**

```javascript
await page
  .locator(`#${item.parent}`)
  .getByRole("link", { name: item.child })
  .click();
```

This fixed the sub-category click, since the injected ads sat outside that container. The next CI run then failed on the _parent_ click instead, where an ad labelled "Women's Clothing" matched a locator looking for "Women".

**Attempt two: exact name matching.**

```javascript
await page.getByRole("link", { name: item.parent, exact: true }).click();
```

The reasoning was sound, since none of the ad labels matched the parent name exactly. It failed for an unrelated reason: the real link's accessible name is `" Women "` with surrounding whitespace, so an exact match against `"Women"` found nothing and timed out.

Both attempts moved the problem rather than removing it. That was the signal that the diagnosis was still at the wrong level.

## Root cause and fix

The root cause was not the locators. It was that third-party ad scripts were loading at all.

Fixed by intercepting those requests at the network level and aborting them, so the ads never reach the page:

```javascript
// utils/blockThirdParty.js
export async function blockThirdParty(page) {
  await page.route("**/*googlesyndication.com/**", (route) => route.abort());
  await page.route("**/*doubleclick.net/**", (route) => route.abort());
  await page.route("**/*fundingchoicesmessages.google.com/**", (route) =>
    route.abort(),
  );
}
```

Called before navigation, so the rules are in place before the page makes any requests:

```javascript
await blockThirdParty(page);
await page.goto("/products");
```

## Regression check

Full suite across Chromium, Firefox and WebKit.

The category test passed. So did several failures elsewhere that had been treated as separate problems: intermittent failures in the cart, contact form and purchase tests, and registration and login failures on WebKit. All had shared the same cause.

A WebKit skip added earlier to the category test, under the assumption that an accordion animation was at fault, was removed. The engine had never been the problem.

The fix was verified a second time by deliberately reintroducing the failure. Commenting out the `blockThirdParty` call reproduces failures on the same tests, confirming the utility is what is holding them green rather than coincidence.

## What it taught me

When the same class of failure appears across several tests, the useful question is what they share rather than what distinguishes them. Two of my three attempts here were correct fixes to the wrong problem, and the clue was that each one moved the failure somewhere else instead of removing it.
