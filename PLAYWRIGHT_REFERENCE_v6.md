# Playwright Reference Guide (v6)

A plain-English reference for everything you learn as you go.

---

## Table of Contents

**Core concepts**
- [page](#page)
- [async and await](#async-and-await)
- [test()](#test)
- [expect()](#expect)
- [const](#const)
- [for loops](#for-loops)
- [if statements](#if-statements)
- [Dynamic test data with Date.now()](#dynamic-test-data-with-datenow)

**Finding elements**
- [The seven built-in locators](#the-seven-built-in-locators)
- [getByRole()](#getbyrole)
- [getByText()](#getbytext)
- [getByLabel()](#getbylabel)
- [getByPlaceholder()](#getbyplaceholder)
- [getByAltText()](#getbyalttext)
- [getByTitle()](#getbytitle)
- [getByTestId()](#getbytestid)
- [locator() — CSS selectors](#locator--css-selectors)
- [Locating by the name attribute](#locating-by-the-name-attribute)
- [The a.check_out tag-and-class combo](#the-acheck_out-tag-and-class-combo)
- [Picking one from many — first() last() all()](#picking-one-element-from-many)

**Input types and roles**
- [Input type to role mapping](#input-type-to-role-mapping)

**Actions**
- [Actions table — click, fill, check, selectOption](#actions)
- [setInputFiles — uploading files](#setinputfiles--uploading-files)

**Assertions**
- [Assertions table](#assertions)
- [Regex assertions](#regex-assertions)

**Handling dialogs**
- [Native dialog handler](#native-dialog-handler)

**Test organisation**
- [Test file structure](#test-file-structure)
- [test.describe()](#testdescribe)
- [test.beforeEach()](#testbeforeeach)
- [test.only() and test.skip()](#testonly-and-testskip)
- [How to organise test files](#how-to-organise-test-files)

**Patterns**
- [Data-driven testing — arrays and for loops](#data-driven-testing)
- [Page Object Model (POM)](#page-object-model-pom)
- [Fixtures](#fixtures)
- [Utility functions](#utility-functions)
- [API testing](#api-testing)
- [Tags and smoke tests](#tags-and-smoke-tests)
- [Comments — when to use them](#comments--when-to-use-them)
- [YAGNI](#yagni)
- [The test pyramid](#the-test-pyramid)

**HTML basics for Playwright**
- [What is HTML?](#what-is-html)
- [Common HTML elements and their roles](#common-html-elements-and-their-roles)
- [Attributes — how to find the right locator](#attributes--how-to-find-the-right-locator)
- [data-qa attributes](#data-qa-attributes)

**Reading errors**
- [How to read a Playwright error](#how-to-read-a-playwright-error)

**Reference**
- [Terminal commands](#terminal-commands)
- [Git commands](#git-commands)
- [CI — Continuous Integration](#ci-continuous-integration)
- [Errors you will see](#errors-you-will-see)
- [Common mistakes](#common-mistakes-to-watch-out-for)

**Terms / glossary**
- [Glossary](#glossary)

---

## Core concepts

### `page`
Represents the browser tab Playwright controls. Every action you take in the browser goes through `page`. Think of it as a remote control for one tab.

```javascript
await page.goto('https://example.com');   // navigate to a URL
await page.getByLabel('Username').fill('tomsmith');  // type into a field
await page.getByRole('button', { name: 'Login' }).click();  // click a button
```

Note: when a test uses a fixture, the browser tab may be handed to it under a different name (e.g. `loggedInPage`). It's still the same `page` — just renamed on the way out of the fixture.

---

### `async` and `await`

`async` on a function means "this function contains things that take time".
`await` on a line means "wait for this to finish before moving to the next line".

Without `await`, Playwright would try to click a button before the page had even loaded.

```javascript
await page.goto('https://example.com');
await page.getByRole('button', { name: 'Submit' }).click();
```

**When you DON'T need `await`:** registering a listener (like a dialog handler) is instant — it just leaves a note for later, so there's nothing to wait for. See [Native dialog handler](#native-dialog-handler).

---

### `test()`
Defines one test. Takes two things: a name (what the test does) and a function (what it actually runs).

```javascript
test('user can log in', async ({ page }) => {
  // test steps go here
});
```

The name shows up in your test report — make it descriptive so failures are easy to identify.

---

### `expect()`
The assertion — the part that actually checks something is true. If the check fails, the test fails.

```javascript
await expect(page).toHaveURL('https://example.com/dashboard');
await expect(page.getByText('Welcome')).toBeVisible();
```

Without assertions, your test just clicks around without verifying anything worked.

---

### `const`
A way of saving something to a name so you can reuse it without writing it out again.

```javascript
const checkbox1 = page.getByRole('checkbox').first();
await checkbox1.check();
await expect(checkbox1).toBeChecked();
```

The value saved with `const` cannot be reassigned — it stays as what you set it to.

---

### `for` loops

A way of repeating the same code once for every item in a list (array). Instead of writing the same thing multiple times, you write it once and let the loop handle the repetition.

```javascript
const fruits = ['apple', 'banana', 'orange'];

for (const item of fruits) {
  console.log(item);
}
// prints: apple, then banana, then orange
```

**The conveyor-belt mental model:**
- The array (`fruits`) is the whole conveyor belt holding every item.
- The loop variable (`item`) is a basket that holds ONE item at a time.
- Each spin of the loop, the basket empties and the next item drops in.

**Reading it in plain English:** `for (const item of fruits)` means "go through each item in `fruits` one at a time, calling the current one `item`".

**With objects** — each item can hold several fields, and you dig into them with a dot:

```javascript
const fruits = [
  { name: 'apple', color: 'red' },
  { name: 'banana', color: 'yellow' },
];

for (const item of fruits) {
  console.log(item.color);   // red, then yellow
}
```

**In Playwright tests**, loops run the same test with different data (see [Data-driven testing](#data-driven-testing)). The loop runs once per item — two items means two tests.

**Key rule:** The name you choose (`item`, `data`, `arrayData`) is your choice — pick one that describes what a single item represents. The array name must match what you actually called your array.

---

### `if` statements

A way of running code only when a certain condition is true. If the condition is false, the code inside is skipped entirely.

```javascript
if (condition) {
  // this only runs if condition is true
}
```

**In Playwright tests**, `if` statements handle elements that only sometimes appear — like a consent popup that only shows for users in certain regions:

```javascript
const consentButton = page.getByRole('button', { name: 'Consent' });
if (await consentButton.isVisible()) {
  await consentButton.click();
}
```

Breaking it down:
1. `const consentButton` — save the locator so we can use it twice without repeating it
2. `if (await consentButton.isVisible())` — check if the button is actually on the page right now
3. `await consentButton.click()` — only runs if the button was visible; if not, skips straight past

**When to use it:** popups, banners, cookie notices, ads — anything that doesn't always appear.

---

### Dynamic test data with `Date.now()`

`Date.now()` returns the current time as a number — milliseconds since 1st January 1970. Because time never repeats, this number is always unique.

Useful when a test needs data that must differ every run — like a registration email:

```javascript
// Date.now() generates a unique timestamp so every test run uses a different email,
// preventing duplicate registration failures
const email = `test${Date.now()}@test.com`;
```

Each run produces a different number → a different email (e.g. `test1783430236520@test.com`).

**When to use it:** emails, usernames, order references — anything that must be unique per run.

---

## Finding elements (locators)

### The seven built-in locators

Playwright has seven built-in locators, designed to find elements the way a user or screen reader would. In rough order of preference:

| Locator | Finds by | Example |
|---------|----------|---------|
| `getByRole()` | element type + accessible name | `getByRole('button', { name: 'Login' })` |
| `getByText()` | visible text content | `getByText('Welcome back')` |
| `getByLabel()` | the label next to a form field | `getByLabel('Username')` |
| `getByPlaceholder()` | placeholder hint text in an input | `getByPlaceholder('Email Address')` |
| `getByAltText()` | an image's alt text | `getByAltText('Company logo')` |
| `getByTitle()` | an element's title attribute | `getByTitle('Close')` |
| `getByTestId()` | the test-id attribute (default `data-testid`) | `getByTestId('signup-email')` |

When none of these fit, fall back to `page.locator()` with a CSS selector. Full docs: [playwright.dev/docs/locators](https://playwright.dev/docs/locators) and [playwright.dev/docs/api/class-locator](https://playwright.dev/docs/api/class-locator).

---

### `getByRole()`
The preferred locator. Finds an element by its **role** (what type of element it is) and optionally its **name** (its accessible name — usually the visible text).

```javascript
page.getByRole('button', { name: 'Login' })   // a button that says Login
page.getByRole('link', { name: 'Logout' })    // a link that says Logout
page.getByRole('checkbox')                     // a checkbox
```

Name matching is **case-insensitive** by default, so `{ name: 'submit' }` matches a button reading "Submit".

**Important habit:** inspect the element first, identify the HTML tag, then match it to the correct role (see [Input type to role mapping](#input-type-to-role-mapping)).

---

### `getByText()`
Finds any element containing specific text. Good for checking messages appear.

```javascript
page.getByText('Your email or password is incorrect!')
```

**Scoping tip:** if the same text appears more than once, scope it inside a container to target the right one:

```javascript
page.locator('.productinfo').getByText('Men Tshirt')
```

---

### `getByLabel()`
Finds a form field by the label text next to it.

```javascript
page.getByLabel('Username')
```

---

### `getByPlaceholder()`
Finds an input by its placeholder text (the grey hint inside an empty field).

```javascript
page.getByPlaceholder('Email Address')
```

---

### `getByAltText()`
Finds an image by its `alt` text (the description that shows if an image fails to load).

```javascript
page.getByAltText('Company logo')
```

---

### `getByTitle()`
Finds an element by its `title` attribute (the tooltip text that appears on hover).

```javascript
page.getByTitle('Close')
```

---

### `getByTestId()`
Finds an element by its test-id attribute. **By default this looks for `data-testid`** — NOT `data-qa`.

```javascript
page.getByTestId('signup-email')   // looks for data-testid="signup-email"
```

**Gotcha:** if a site uses `data-qa` instead of `data-testid` (like automationexercise.com), `getByTestId` won't find it. Either configure the test-id attribute in `playwright.config.js`, or just use `page.locator('[data-qa="..."]')` instead — which is the simpler route.

---

### `locator()` — CSS selectors

`page.locator()` is the most flexible locator. It takes CSS (Cascading Style Sheets) selectors. The patterns you'll use most:

```javascript
page.locator('[data-qa="signup-email"]')  // by attribute
page.locator('[name="upload_file"]')       // by name attribute
page.locator('[value="Mr"]')               // by value attribute
page.locator('#password')                   // by id (# means id)
page.locator('.productinfo')                // by class (. means class)
page.locator('a.check_out')                 // by tag + class combined
```

**Attribute pattern:** `[attribute="value"]` — square brackets, attribute name, equals, value in quotes.
**`#` means id**, **`.` means class**.

**When to use it:** when the built-in locators aren't specific enough, or the element only has a `data-qa`, `name`, `id`, or class to grab it by.

---

### Locating by the `name` attribute

Some elements have no `data-qa`, no `id`, and no useful role — but do have a `name` attribute. A file input is the classic example:

```html
<input type="file" class="form-control" name="upload_file">
```

Target it with the attribute-selector pattern, same as `data-qa`, just a different attribute:

```javascript
page.locator('[name="upload_file"]')
```

`name` is a standard HTML attribute the browser uses for form submission. It's not added for testing (so less ideal than `data-qa`), but perfectly usable when nothing better is available.

---

### The `a.check_out` tag-and-class combo

You can combine an HTML tag with a class in one CSS selector: `tag.class`.

```javascript
page.locator('a.check_out')   // an <a> element that has the class "check_out"
```

This means "find an `<a>` element that also has the class `check_out`". It's more specific than `.check_out` alone (which would match any element type with that class).

**Real example:** the "Proceed To Checkout" control on automationexercise.com is an `<a>` styled as a button, with no `data-qa`. `getByRole('link')` didn't reliably click it, so `a.check_out` was the fix.

**Prettier gotcha:** on save, Prettier can silently change `a.check_out` into `a.check.out` (underscore → dot). If a `check_out` locator suddenly stops working after a save, check for this.

---

## Picking one element from many

When a locator matches more than one element, Playwright's **strict mode** refuses to guess which one you meant, and the test fails with a "strict mode violation". You narrow it down:

### `.first()`
```javascript
page.locator('[data-product-id="1"]').first()
```

### `.last()`
```javascript
page.getByRole('checkbox').last()
```

### `.all()`
Returns every matching element as an array, for looping. Needs `await`.

```javascript
const checkboxes = await page.getByRole('checkbox').all();
```

---

## Input types and roles

### Input type to role mapping

`<input>` is a single HTML tag, but its **role** — and therefore how you locate it — changes completely depending on its `type` attribute. This trips people up constantly. There is no `"input"` role.

| HTML | Role | How to locate it |
|------|------|------------------|
| `<input type="text">` | `textbox` | `getByRole('textbox')` or by placeholder/label |
| `<input type="email">` | `textbox` | same as text |
| `<input type="password">` | *(no role)* | `locator('[data-qa="..."]')` or by another attribute |
| `<input type="submit">` | `button` | `getByRole('button', { name: <value> })` — name comes from the `value` attribute |
| `<input type="checkbox">` | `checkbox` | `getByRole('checkbox')` |
| `<input type="radio">` | `radio` | `getByRole('radio')` or `locator('[value="Mr"]')` |
| `<input type="file">` | *(no role)* | `locator('[name="..."]')` + `.setInputFiles()` |

**Two big gotchas:**
- `<input type="submit">` **looks like a button and IS a button by role** — even though the tag is `<input>`. Its accessible name comes from the `value` attribute, not from text between tags.
- `<input type="file">` **looks like a button but is NOT one.** The "Choose file" control you see is the browser's rendering of a file input. It has no button role — locate it by `name` and use `setInputFiles`.

---

## Actions

Things you do to elements once you've found them. Always need `()` at the end.

| Action | What it does |
|--------|-------------|
| `.click()` | Clicks the element |
| `.fill('text')` | Types into an input field (clears it first) |
| `.press('Enter')` | Presses a keyboard key |
| `.check()` | Checks a checkbox |
| `.uncheck()` | Unchecks a checkbox |
| `.selectOption('value')` | Selects a dropdown option — pass the option's `value`, not its visible text |
| `.setInputFiles('path')` | Attaches a file to a file input — see below |

**Note on `.selectOption()`:** the value must match the `value` attribute of the `<option>` in the HTML, not necessarily the visible text.

```javascript
// selects the option where value="5" (which displays as "May")
await page.locator('[data-qa="months"]').selectOption('5');
```

---

### `setInputFiles` — uploading files

`setInputFiles()` attaches a file directly to an `<input type="file">`. Crucially, it does **not** click anything and does **not** open the operating system's file picker — it hands the file straight to the input in one step.

```javascript
// setInputFiles attaches a file directly to a file input — no clicking, no OS file picker.
// It locates the <input type="file"> and hands it the file path in one step.
await page.locator('[name="upload_file"]').setInputFiles('test_fixtures/Test_data_1.rtf');
```

**Key points:**
- You do NOT click the "Choose file" button first. `setInputFiles` replaces that whole interaction.
- The file must actually exist. Keep test files **inside the project** (e.g. a `test_fixtures/` folder) and use a **relative path** — an absolute path like `/Users/you/Desktop/...` will fail in CI because that file doesn't exist on the CI machine.
- Avoid spaces in fixture filenames — use `Test_data_1.rtf`, not `Test data 1.rtf`.

---

## Assertions

Things you check with `expect()`. Always need `()` at the end.

| Assertion | What it checks |
|-----------|---------------|
| `toHaveURL('...')` | The page URL matches (string or regex) |
| `toHaveTitle(/.../)` | The page title matches |
| `toBeVisible()` | The element is visible on screen |
| `toBeChecked()` | A checkbox is checked |
| `toContainText('...')` | An element contains this text |
| `toHaveValue('...')` | An input field has this value |
| `toBe(value)` | A value equals exactly this — for numbers and strings, not page elements |
| `isVisible()` | Returns true/false — used inside `if` statements, NOT inside `expect()` |

---

### Regex assertions

A **regex** (regular expression) is a pattern that matches a range of strings rather than one exact string. Wrapped in forward slashes `/ /` instead of quotes.

Use it when part of what you're matching is **dynamic** — a URL with an order number that changes every run, for example.

```javascript
// exact string — fragile, breaks if the number changes
await expect(page).toHaveURL('https://automationexercise.com/payment_done/500');

// regex — matches payment_done/ followed by ANY number
await expect(page).toHaveURL(/payment_done\/\d+/);
```

**Regex building blocks you've used:**

| Piece | Means |
|-------|-------|
| `/ /` | the wrapper — marks this as a regex, like quotes mark a string |
| `\d` | any single digit (0–9) |
| `+` | one or more of the thing before it — so `\d+` is "one or more digits" |
| `\/` | a literal forward slash (the `\` escapes it, so it isn't read as the end of the regex) |
| `\?` | a literal question mark (`?` is special in regex, so it's escaped) |
| `\.` | a literal dot (`.` is special too) |
| `i` (after closing slash) | case-insensitive flag — `/tshirt/i` matches Tshirt, TSHIRT, tshirt |

**Examples:**
```javascript
await expect(page).toHaveURL(/products\?search=/i);   // contains products?search=, any case
await expect(page).toHaveURL(/payment_done\/\d+/);    // payment_done/ then any number
await expect(page).toHaveTitle(/Playwright/);          // title contains "Playwright"
```

**Trade-off:** regex is more forgiving (survives dynamic values) but less strict (a wrong-but-similar value could slip through). Use exact strings when the value is fixed, regex when part of it varies.

---

## Handling dialogs

### Native dialog handler

Some sites fire a **native browser dialog** on an action — the JavaScript `alert` / `confirm` / `prompt` kind (an OS-level popup, not an HTML element on the page). You can't click these with a normal locator.

By default, Playwright **auto-dismisses** any dialog it isn't told to handle (equivalent to pressing Cancel) and carries on. So a test can pass without handling it — but it isn't testing the real "user pressed OK" flow.

To handle one properly, register a listener **before** the action that triggers it:

```javascript
page.on('dialog', (dialog) => dialog.accept());   // accept = press OK
await page.getByRole('button', { name: 'Submit' }).click();
```

Breaking it down:
1. `page.on('dialog', ...)` — registers a listener: "whenever a dialog appears, run this."
2. `(dialog) => dialog.accept()` — the function that runs. `.accept()` = OK, `.dismiss()` = Cancel.

**Two critical points:**
- **Placement:** the listener must be registered BEFORE the click that triggers the dialog. Register it after, and the dialog appears and vanishes before Playwright is listening.
- **No `await`:** registering a listener is instant — it just leaves a note for later. There's nothing to wait for, so no `await`. (Contrast with `.click()`, which does something now and takes time.) Think: `.click()` is doing a task; `page.on(...)` is setting an alarm.

---

## Test file structure

```javascript
// 1. always at the top
import { test, expect } from '@playwright/test';

// 2. one test() block per test
test('descriptive name of what this test checks', async ({ page }) => {

  // 3. navigate to the page
  await page.goto('https://example.com');

  // 4. interact with the page
  await page.getByLabel('Username').fill('tomsmith');

  // 5. assert something is true
  await expect(page).toHaveURL('https://example.com/dashboard');

});
```

---

## Organising tests

### `test.describe()`
Groups related tests under a label. Makes reports easier to read.

```javascript
test.describe('Login page', () => {
  test('successful login', async ({ page }) => { ... });
  test('failed login', async ({ page }) => { ... });
});
```

### `test.beforeEach()`
Runs automatically before every test in the file (or describe block). For setup every test needs.

```javascript
test.beforeEach(async ({ page }) => {
  await page.goto('https://example.com/login');
});
```

### `test.only()` and `test.skip()`
`test.only()` — runs only that one test. Useful when debugging. **Never push `test.only` to GitHub** — it skips all other tests in CI.
`test.skip()` — skips that test, runs the rest. For a test failing on a known bug.

---

## How to organise test files

- One spec (test file) per page or feature
- Name files clearly: `login.spec.js`, `contact-us.spec.js` (kebab-case for multi-word)
- Never nest one `test()` block inside another
- One test verifies one thing — independent assertions belong in separate tests

---

## Data-driven testing

Running the same test multiple times with different data, using an **array** and a **`for` loop**.

**Step 1 — define your data array.** One array, holding multiple objects. Each object is one test run.

```javascript
const invalidLogins = [
  { username: 'incorrect@email.com', password: 'PW123',    error: 'Your email or password is incorrect!' },
  { username: 'real@email.com',      password: 'wrongpass', error: 'Your email or password is incorrect!' },
];
```

**Step 2 — write the `for` loop.** `for (const arrayData of invalidLogins)` means "go through each item, calling the current one `arrayData`".

```javascript
for (const arrayData of invalidLogins) {
  test(`Incorrect login for ${arrayData.username}`, async ({ page }) => {
    // ... attempt login with arrayData.username / arrayData.password ...
    await expect(page.getByText(arrayData.error)).toBeVisible();
  });
}
```

**Dynamic test names — the `${}` bit:** because the loop makes multiple tests, each needs a UNIQUE name or Playwright rejects duplicates. Backticks `` ` `` plus `${arrayData.username}` drop the current username into the name, so each generated test is named differently. `${}` is a fill-in-the-blank template — it only works inside backticks, not normal quotes.

**Accessing fields:** `arrayData.username`, `arrayData.error` — the item name, a dot, the field name.

---

## Page Object Model (POM)

Organising code so all locators and actions for a page live in one separate file. Tests use that file instead of writing locators directly.

**The point of it:** maintenance. If a locator changes, you update ONE file instead of every test that used it.

**When to use it:** when the same locators/actions appear across multiple tests (see YAGNI).

**File: `pages/LoginPage.js`**
```javascript
export class LoginPage {
  constructor(page) {
    this.page = page;
    this.emailField = page.locator('[data-qa="login-email"]');
    this.passwordField = page.locator('[data-qa="login-password"]');
    this.loginButton = page.getByRole('button', { name: 'Login' });
  }

  async login(email, password) {
    await this.emailField.fill(email);
    await this.passwordField.fill(password);
    await this.loginButton.click();
  }
}
```

**Key terms:**
- `class` — a blueprint / toolkit. Defines what a page object is and what it can do. NOT a place — creating one does not navigate anywhere.
- `constructor` — runs automatically when you write `new LoginPage(page)`. Sets up the locators.
- `this` — the current instance. `this.emailField` means "save this on the current LoginPage".
- `export` / `import` — makes the class available to, and brings it into, other files.

**Using it in a test:**
```javascript
import { LoginPage } from '../pages/LoginPage.js';

// class name is capital LoginPage; variable is your choice.
// A distinct variable name (loginActions) avoids confusing it with the class.
const loginActions = new LoginPage(page);
await loginActions.login('test@test.com', 'PW123');
```

**Credentials vs locators:** the POM holds the *locators*; the test passes in the *credentials*. That split is deliberate — it means one POM works for valid logins, wrong-password tests, admin logins, etc. The POM doesn't care what the credentials are.

---

## Fixtures

Reusable setup code any test can request by name — just like `page`. Unlike `beforeEach`, a fixture only runs for tests that specifically ask for it.

**File: `fixtures/base.js`**
```javascript
import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage.js';
import { dismissConsent } from '../utils/dismissConsent.js';

export const test = base.extend({
  loggedInPage: async ({ page }, use) => {
    await page.goto('https://automationexercise.com/login');
    await dismissConsent(page);
    const loginActions = new LoginPage(page);
    await loginActions.login('PWtest@PW.com', 'PW123');
    // Required Playwright syntax — the fixture pauses here and lets the test run.
    await use(page);
  },
});

export { expect } from '@playwright/test';
```

**Using it:**
```javascript
import { test, expect } from '../fixtures/base.js';

test('purchase journey', async ({ loggedInPage }) => {
  await loggedInPage.goto('https://automationexercise.com/products');
  // ... already logged in ...
});
```

**How `use(page)` works:** everything ABOVE `use(page)` is setup (runs before the test). `use(page)` hands the browser tab to the test — the test body runs at that point, in its own spec file. Anything BELOW `use(page)` would be cleanup (runs after). It's a pause button, not a normal function call, and it takes no `await`-able result of its own beyond the handover.

**Difference from `beforeEach`:** a fixture only runs for tests that name it; `beforeEach` runs for every test in the file regardless.

**Naming note:** the tab arrives in the test under whatever name the fixture exposes (`loggedInPage`). It's still the same `page` object — just renamed. When calling a utility inside such a test, pass the name you actually have: `dismissConsent(loggedInPage)`.

---

## Utility functions

A **utility** is a reusable helper function that doesn't belong to any one page or test. When the same few lines appear in several places and aren't specific to a single page (so a POM doesn't fit), extract them into a `utils/` file.

**File: `utils/dismissConsent.js`**
```javascript
export async function dismissConsent(page) {
  const consentButton = page.getByRole('button', { name: 'Consent' });
  if (await consentButton.isVisible()) {
    await consentButton.click();
  }
}
```

**Anatomy of a function:**
- **name** — how you call it (`dismissConsent`)
- **parameters** — inputs it needs, in the brackets (`page`)
- **body** — the code that runs, in the curly braces
- `export` makes it usable in other files; `async` marks it as containing `await`s

**Using it:**
```javascript
import { dismissConsent } from '../utils/dismissConsent.js';

await dismissConsent(page);          // pass whatever tab you have
await dismissConsent(loggedInPage);  // e.g. inside a fixture-based test
```

The parameter is named `page` inside the function, but that's just a label — you pass in whatever browser tab you actually have at the call site.

**Why extract it:** the consent popup appears on multiple pages (login, products, and mid-flow on the registration form). One helper called from anywhere means if the consent locator ever changes, you fix it in one place.

---

## API testing

Testing an API (Application Programming Interface) directly without a browser. Faster than UI testing — goes straight to the data. Uses `request` instead of `page`.

```javascript
test('GET post returns 200 status', async ({ request }) => {
  const response = await request.get('https://jsonplaceholder.typicode.com/posts/1');
  await expect(response.status()).toBe(200);

  // parse the response body into a JavaScript object you can read
  const body = await response.json();
  await expect(body.userId).toBe(1);
});
```

**HTTP request types:** `GET` retrieves, `POST` sends new data, `PUT` updates, `DELETE` removes.
**Common status codes:** `200` OK, `404` Not Found, `500` Server Error.
**Notes:** never use `--headed` for API tests (no browser). `response.json()` turns the raw response into an object you read with `body.fieldname`.

---

## Tags and smoke tests

Tags label tests so you can run groups of them.

```javascript
test('successful login @smoke', async ({ page }) => { ... });
```
```
npx playwright test --grep "@smoke"
```

A **smoke test** is a quick check of the most critical features — from hardware testing, where "no smoke" means the basics work.

---

## Comments — when to use them

A comment should add context the code doesn't already make obvious. If the code already says it, the comment is noise.

```javascript
// USEFUL — explains WHY and clarifies non-obvious behaviour
// setInputFiles attaches a file directly — no clicking, no OS file picker.
await page.locator('[name="upload_file"]').setInputFiles('test_fixtures/Test_data_1.rtf');

// USELESS — the code already says this
// click the login button
await page.getByRole('button', { name: 'Login' }).click();
```

Good comments mark genuine trip-hazards (like `new LoginPage(page)` not being navigation, or `setInputFiles` not clicking). Good test names make most in-test comments unnecessary.

---

## YAGNI

**You Aren't Gonna Need It** — don't add structure (POM, fixture, utility) before the problem actually exists. Meeting the same problem two or three times is the signal that structure has earned its place. A simple suite that works beats a complex one that's hard to maintain.

---

## The test pyramid

The ideal balance in a real QA team:
- **Many API tests** — fast, reliable, test data and logic directly (milliseconds)
- **Fewer UI tests** — slower, test that the interface works for real users (seconds)

At scale, that difference matters a lot.

---

## HTML basics for Playwright

### What is HTML?

HTML (HyperText Markup Language) is the code that builds every webpage. It's made of **tags** — words in angle brackets like `<button>` or `<input>`. Each tag creates something on the page — a button, a field, a link. Those things are called **elements**. Inspecting an element shows you the HTML that made it, which tells you which locator to use.

---

### Common HTML elements and their roles

| HTML tag | What it creates | Playwright role |
|----------|----------------|----------------|
| `<button>` | A clickable button | `'button'` |
| `<a>` | A clickable link | `'link'` |
| `<input type="text">` | A text input | `'textbox'` |
| `<input type="email">` | An email input | `'textbox'` |
| `<input type="password">` | A password field | no role — use `locator` |
| `<input type="submit">` | A submit button | `'button'` (name from `value`) |
| `<input type="checkbox">` | A tick box | `'checkbox'` |
| `<input type="radio">` | A radio button | `'radio'` |
| `<input type="file">` | A file upload | no role — `locator` + `setInputFiles` |
| `<select>` | A dropdown | `locator` + `.selectOption()` |
| `<h1>`, `<h2>` etc | A heading | `'heading'` |

Some tags you'll see inside others: `<u>` just underlines text, `<i>` often holds an icon, `<span>` and `<p>` wrap text. They don't change how you locate the parent — Playwright reads the visible text regardless.

**The key habit:** before writing any locator, right-click the element → Inspect → read the tag and attributes.

---

### Attributes — how to find the right locator

An **attribute** is extra info inside a tag:

```html
<input type="email" placeholder="Email Address" name="email" data-qa="signup-email">
```

Each attribute can drive a locator:

| Attribute | Locator |
|-----------|---------|
| `placeholder="Email Address"` | `getByPlaceholder('Email Address')` |
| `data-qa="signup-email"` | `locator('[data-qa="signup-email"]')` |
| `name="email"` | `locator('[name="email"]')` |
| `value="Mr"` | `locator('[value="Mr"]')` |
| `id="password"` | `locator('#password')` |
| `class="check_out"` | `locator('.check_out')` or `locator('a.check_out')` |

**Preference order:** `data-qa` (most stable) → placeholder / label / role (user-facing) → `name` / `id` → class → CSS/other.

---

### `data-qa` attributes

`data-qa` is a custom attribute developers add specifically for QA engineers. It's the most stable locator because it exists only for testing — it won't change when the page is restyled.

```javascript
await page.locator('[data-qa="signup-email"]').fill('test@test.com');
```

Note: `getByTestId()` defaults to `data-testid`, NOT `data-qa` — so on a `data-qa` site, use `locator('[data-qa="..."]')`.

---

## Reading errors

### How to read a Playwright error

Playwright errors are written for engineers, so they look intimidating. The skill is filtering: most of the message is noise, and one part is the signal.

**The method:**
1. **Find the line that echoes YOUR code back.** Playwright reproduces the locator or line it choked on — that's where the problem is. Everything else describes internal steps you can ignore.
2. **Compare that echoed code to what you intended.** The bug is almost always a small difference — a missing quote, a typo, wrong case.
3. **Ignore the jargon around it.** "Unexpected token while parsing css selector" just means "your selector is malformed" — the *why* is in the echoed line, not the jargon.

**Worked example:**
```
Error: locator.setInputFiles: Unexpected token "" while parsing css selector "[name="upload_file]".
```
The scary part is "Unexpected token while parsing css selector". The signal is the echoed selector: `[name="upload_file]` — missing its closing quote. Fix the quote, ignore the rest.

**Other common signals:**
- `strict mode violation ... resolved to N elements` → your locator matched more than one; add `.first()` or scope it.
- `Test timeout of 30000ms exceeded ... waiting for <locator>` → Playwright never found that element; wrong locator, or something (a popup) is blocking it.
- `<div class="fc-consent-root"> ... intercepts pointer events` → the consent popup is covering the thing you're clicking; dismiss consent first.

---

## Terminal commands

| Command | What it does |
|---------|-------------|
| `npx playwright test` | Runs all tests |
| `npx playwright test login.spec.js` | Runs one file |
| `npx playwright test --headed` | Runs with the browser visible (not for API tests) |
| `npx playwright test --project=chromium` | Runs in one browser only |
| `npx playwright test --grep "name"` | Runs tests whose name matches |
| `npx playwright test --ui` | Interactive UI mode — step through tests, see each action |
| `npx playwright show-report` | Opens the HTML report |
| `npx playwright codegen https://...` | Opens the recorder |

> Press `Ctrl+C` to quit the report server.
> There is **no** command-line flag for slow motion — `slowMo` only works set in `playwright.config.js`. UI mode (`--ui`) is the better way to watch a test step by step.

---

## Git commands

| Command | What it does |
|---------|-------------|
| `git add .` | Stages all changed files |
| `git commit -m "message"` | Saves a snapshot with a description |
| `git push` | Sends commits to GitHub |
| `git status` | Shows what changed |
| `git log` | Shows commit history |

> Git only pushes what's currently in the files — it doesn't matter which tool wrote them. Uncommitted work all goes in one commit.

---

## CI (Continuous Integration)

Every push to GitHub automatically runs all tests in the cloud. Green tick = all passed. Red cross = something broke. CI runs on every push regardless of what changed — even a README edit triggers the full suite.

**Local vs CI differences to watch for:**
- Region-based popups (consent) may appear locally but not on CI's servers, or vice versa — handle them conditionally with `if (await ...isVisible())`.
- Absolute file paths that exist on your machine won't exist on CI — use relative paths inside the project.

---

## Errors you will see

### `TimeoutError` / `Test timeout of 30000ms exceeded`
Playwright waited and never found/reached the element.
**Usually:** wrong locator, element not on the page, or something (a popup) blocking it. Read the "waiting for" line to see what it was after.

### `strict mode violation`
Your locator matched more than one element.
**Fix:** `.first()` / `.last()`, scope inside a container, or use a more specific locator.

### `expect(...).toBeVisible() failed`
The assertion failed — the element wasn't visible.
**Usually:** the previous action didn't work, or the wrong locator.

### `Unexpected token ... while parsing css selector`
A malformed selector — almost always a missing or mismatched quote. Look at the echoed selector.

### `Unterminated string constant`
A string is missing its closing quote `'` or backtick `` ` ``.

### `duplicate test title`
Two tests share a name — common when a `for` loop builds tests without a dynamic `${}` name.

### `'import' and 'export' may only appear at the top level`
An `import`/`export` is inside a function or block. They must sit at the very top of the file.

### `... intercepts pointer events`
Something (usually a popup/overlay) is covering the element you're trying to click. Dismiss it first.

---

## Common mistakes to watch out for

- Missing `()` at the end of `.click()`, `.toBeVisible()`, etc.
- Missing closing quote `'`, `"`, or backtick at the end of a string
- Using `'button'` as a role when the element is a `'link'` — inspect first
- Using the same `const` name twice in one test
- `import`/`export` inside a block instead of at the top of the file
- `--headed` on API tests — there's no browser
- Pushing `test.only` to GitHub — it skips every other test in CI
- Asserting an exact URL when part of it is dynamic — use a regex
- A `for` loop building tests with a fixed name — use `${}` for unique names
- Absolute file paths in `setInputFiles` — use a relative path inside the project
- Prettier turning `a.check_out` into `a.check.out` on save
- Registering a dialog handler AFTER the click that triggers it — must be before
- Trusting a passing test that has no assertion — clicking isn't verifying
- CSS `text-transform: uppercase` — the on-screen CAPS may differ from the real HTML text; assert the real text

---

## Glossary

| Term | Plain-English meaning |
|------|----------------------|
| **element** | A thing on the page created by an HTML tag — a button, field, link, etc. |
| **tag** | A word in angle brackets that creates an element, e.g. `<button>`. |
| **attribute** | Extra info inside a tag, e.g. `name="email"`, `data-qa="..."`. |
| **role** | What *type* an element is for accessibility purposes (button, textbox, link). What `getByRole` matches. |
| **accessible name** | The name a screen reader would read for an element — usually its visible text, or its `value` for a submit input. |
| **locator** | An object describing how to find element(s) on the page. Re-evaluated fresh each time it's used. |
| **selector** | The string inside `locator()` that describes what to find, e.g. `[data-qa="x"]`. |
| **CSS selector** | A standard pattern language for targeting elements — `#id`, `.class`, `tag.class`, `[attr="val"]`. |
| **assertion** | A check inside `expect()` that must be true or the test fails. |
| **regex** | A pattern that matches a range of strings instead of one exact string. Wrapped in `/ /`. |
| **strict mode** | Playwright's rule that a locator used for an action must match exactly one element. |
| **fixture** | Reusable setup code a test requests by name (e.g. `loggedInPage`). |
| **POM (Page Object Model)** | A file holding one page's locators and actions, so tests don't repeat them. |
| **utility** | A reusable helper function not tied to any one page (e.g. `dismissConsent`). |
| **parameter** | A named input a function expects, listed in its brackets. |
| **argument** | The actual value you pass in when calling a function. |
| **array** | An ordered list, written in `[ ]`. |
| **object** | A bundle of `key: value` fields, written in `{ }`. |
| **string** | Text, wrapped in quotes `'...'` / `"..."`, or backticks for templates. |
| **template literal** | A backtick string that can embed values with `${...}`. |
| **dialog** | A native browser popup (`alert`/`confirm`/`prompt`) — not an HTML element. |
| **flaky test** | A test that passes sometimes and fails others without the code changing. |
| **happy path** | The main successful journey through a feature. |
| **CI** | Continuous Integration — automatic test runs on every push. |
| **API** | Application Programming Interface — lets you test data/logic without a browser. |
| **YAGNI** | "You Aren't Gonna Need It" — don't build structure before it's needed. |

---

*Add new things here as you learn them — this file is yours to grow.*
