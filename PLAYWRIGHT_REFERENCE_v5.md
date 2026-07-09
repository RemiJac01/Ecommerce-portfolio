# Playwright Reference Guide (v5)

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
- [getByRole()](#getbyrole)
- [getByLabel()](#getbylabel)
- [getByText()](#getbytext)
- [getByPlaceholder()](#getbyplaceholder)
- [locator() — CSS attribute selectors](#locator--css-attribute-selectors)
- [Picking one from many — first() last() all()](#picking-one-element-from-many)

**Actions**
- [Actions table — click, fill, check, selectOption etc](#actions)

**Assertions**
- [Assertions table — toBeVisible, toBe, toHaveURL etc](#assertions)

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

**Reference**
- [Terminal commands](#terminal-commands)
- [Git commands](#git-commands)
- [CI — Continuous Integration](#ci-continuous-integration)
- [Errors you will see](#errors-you-will-see)
- [Common mistakes](#common-mistakes-to-watch-out-for)

---

## Core concepts

### `page`
Represents the browser tab Playwright controls. Every action you take in the browser goes through `page`. Think of it as a remote control for one tab.

```javascript
await page.goto('https://example.com');   // navigate to a URL
await page.getByLabel('Username').fill('tomsmith');  // type into a field
await page.getByRole('button', { name: 'Login' }).click();  // click a button
```

---

### `async` and `await`

`async` on a function means "this function contains things that take time".
`await` on a line means "wait for this to finish before moving to the next line".

Without `await`, Playwright would try to click a button before the page had even loaded.

```javascript
// correct - waits for the page to load before clicking
await page.goto('https://example.com');
await page.getByRole('button', { name: 'Submit' }).click();
```

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
await expect(page).toHaveTitle(/My App/);
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

for (const fruit of fruits) {
  console.log(fruit);
}
// prints: apple, then banana, then orange
```

**Reading it in plain English:** `for (const fruit of fruits)` means "go through each item in `fruits` one at a time, calling the current item `fruit`".

**In Playwright tests**, loops are used to run the same test multiple times with different data:

```javascript
for (const data of invalidCredentials) {
  test(`failed login with ${data.username}`, async ({ page }) => {
    await loginPage.login(data.username, data.password);
    await expect(page.getByText(data.error)).toBeVisible();
  });
}
```

The loop runs once per item in the array — two items means two tests, ten items means ten tests.

**Key rule:** The name you choose inside the loop (e.g. `fruit`, `data`, `checkbox`) represents whichever single item the loop is currently on. Pick a name that makes sense for what each item represents.

---

### `if` statements

A way of running code only when a certain condition is true. If the condition is false, the code inside is skipped entirely.

```javascript
if (condition) {
  // this only runs if condition is true
}
```

**In Playwright tests**, `if` statements are commonly used to handle elements that only appear in certain situations — like a consent popup that only appears for users in the EU:

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

**When to use it:** When an element doesn't always appear on the page — popups, banners, cookie notices, ads.

---

### Dynamic test data with `Date.now()`

`Date.now()` returns the current time as a number — the number of milliseconds since 1st January 1970. Because time never repeats, this number is always unique.

This is useful when your test needs data that must be different every run — like an email address for registration:

```javascript
// Date.now() generates a unique timestamp so every test run uses a different email, preventing duplicate registration failures
const email = `test${Date.now()}@test.com`;
```

Each run produces a different number, so each run gets a different email — e.g. `test1783430236520@test.com`.

**When to use it:** Any time you need test data that must be unique per run — emails, usernames, order references.

---

## Finding elements (locators)

These are the ways you find things on a page to interact with or check.

### `getByRole()`
The preferred way to find elements in Playwright. Finds an element by its **role** (what type of element it is) and optionally its **name** (what it says).

```javascript
page.getByRole('button', { name: 'Login' })   // a button that says Login
page.getByRole('link', { name: 'Logout' })    // a link that says Logout
page.getByRole('checkbox')                     // a checkbox
page.getByRole('textbox')                      // a text input
```

**Important habit:** Before writing any `getByRole`, inspect the element in your browser first. Identify the HTML tag, then match it to the correct role below.

#### Roles table

| Role | What it matches | HTML tag |
|------|----------------|----------|
| `'button'` | A clickable button | `<button>` |
| `'link'` | A clickable link | `<a>` |
| `'checkbox'` | A tick box | `<input type="checkbox">` |
| `'radio'` | A radio button (select one from a group) | `<input type="radio">` |
| `'textbox'` | A text input field | `<input type="text">` |
| `'heading'` | A heading | `<h1>`, `<h2>` etc |

---

### `getByLabel()`
Finds an input field by the label text next to it. Great for forms.

```javascript
page.getByLabel('Username')
page.getByLabel('Password')
```

---

### `getByText()`
Finds any element that contains specific text. Useful for checking messages appear.

```javascript
page.getByText('Your username is invalid!')
```

---

### `getByPlaceholder()`
Finds an input by its placeholder text (the grey hint text inside an empty field).

```javascript
page.getByPlaceholder('Enter your email')
```

---

### `locator()` — CSS attribute selectors

`page.locator()` is Playwright's most flexible locator. It accepts CSS (Cascading Style Sheets) selectors — a standard way of targeting HTML elements.

The most useful pattern is targeting by attribute value:

```javascript
page.locator('[data-qa="signup-email"]')   // finds element where data-qa="signup-email"
page.locator('[value="Mr"]')               // finds element where value="Mr"
page.locator('[id="password"]')            // finds element where id="password"
```

**Pattern:** `[attribute="value"]` — square brackets, attribute name, equals sign, value in quotes.

**When to use it:** When `getByRole`, `getByLabel`, or `getByPlaceholder` aren't specific enough, or when the element has a `data-qa` attribute.

---

## Picking one element from many

When a locator matches more than one element on the page, Playwright needs help knowing which one you mean.

### `.first()`
Picks the first matching element.

```javascript
page.getByRole('checkbox').first()
```

### `.last()`
Picks the last matching element.

```javascript
page.getByRole('checkbox').last()
```

### `.all()`
Returns every matching element as an array (a list). Used when you want to loop through all matching elements. Needs `await`.

```javascript
const checkboxes = await page.getByRole('checkbox').all();
```

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
| `.selectOption('value')` | Selects an option from a dropdown — pass the option's value as a string |

**Note on `.selectOption()`:** The value you pass must match the `value` attribute of the `<option>` tag in the HTML, not necessarily the visible text.

```javascript
// selects the option where value="5" (which displays as "May")
await page.locator('[data-qa="months"]').selectOption("5");
```

---

## Assertions

Things you check with `expect()`. Always need `()` at the end.

| Assertion | What it checks |
|-----------|---------------|
| `toHaveURL('...')` | The page URL (Uniform Resource Locator) matches |
| `toHaveTitle(/.../)` | The page title matches |
| `toBeVisible()` | The element is visible on screen |
| `toBeChecked()` | A checkbox is checked |
| `toContainText('...')` | An element contains this text |
| `toHaveValue('...')` | An input field has this value |
| `toBe(value)` | A value equals exactly what you specify — used for numbers and strings, not page elements |
| `isVisible()` | Returns true or false — used inside `if` statements, not `expect()` |

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
Groups related tests together under a label. Makes test reports easier to read.

```javascript
test.describe('Login page', () => {

  test('successful login', async ({ page }) => { ... });
  test('failed login', async ({ page }) => { ... });

}); // end describe('Login page')
```

---

### `test.beforeEach()`
Runs automatically before every test in the file or describe block. Use it for setup every test needs.

```javascript
test.beforeEach(async ({ page }) => {
  await page.goto('https://example.com/login');
});
```

---

### `test.only()` and `test.skip()`

`test.only()` — runs only that one test, skips everything else. Useful when debugging.
**Never push `test.only` to GitHub** — it causes all other tests to be skipped in CI (Continuous Integration).

`test.skip()` — skips that test and runs everything else. Useful when a test is failing due to a known bug.

---

## How to organise test files

- One spec (specification — a test file) per page or feature
- Name files clearly: `login.spec.js`, `checkboxes.spec.js`
- Never nest one `test()` block inside another
- One test should verify one thing — independent assertions belong in separate tests

---

## Data-driven testing

Running the same test multiple times with different data, using an **array** (a list) and a **`for` loop**.

**Step 1 — define your data array:**
Each item in the array is one test run. Each item can have multiple fields.

```javascript
const invalidCredentials = [
  { username: 'wronguser', password: 'SuperSecretPassword!', error: 'Your username is invalid!' },
  { username: 'tomsmith',  password: 'wrongpassword',        error: 'Your password is invalid!' },
];
```

**Step 2 — write the `for` loop:**
`for (const data of invalidCredentials)` means "go through each item in the array one at a time, calling it `data`".

```javascript
for (const data of invalidCredentials) {
  test(`failed login with ${data.username}`, async ({ page }) => {
    await loginPage.login(data.username, data.password);
    await expect(page.getByText(data.error)).toBeVisible();
  });
}
```

The loop runs once per item — two items means two tests, five items means five tests.

**Accessing fields:** Use `data.fieldname` — e.g. `data.username`, `data.error`.

**When to use it:** When you need to run the same test logic with different inputs. Avoids writing identical test blocks over and over.

---

## Page Object Model (POM)

A way of organising code so that all locators and actions for a page live in one separate file. Tests then use that file instead of writing locators directly.

**When to use it:** When the same locators or actions appear across multiple tests. See YAGNI.

**File: `pages/LoginPage.js`**
```javascript
export class LoginPage {

  constructor(page) {
    this.page = page;
    this.usernameField = page.getByLabel('Username');
    this.passwordField = page.getByLabel('Password');
    this.loginButton = page.getByRole('button', { name: 'Login' });
  }

  async login(username, password) {
    await this.usernameField.fill(username);
    await this.passwordField.fill(password);
    await this.loginButton.click();
  }
}
```

**Key terms:**
- `class` — a blueprint. Defines what a page object is and what it can do.
- `constructor` — runs automatically when you write `new LoginPage(page)`. Sets up all the locators.
- `this` — refers to the current instance of the class. `this.usernameField` means "save this on the current LoginPage".
- `export` — makes the class available to other files.
- `import` — brings it in to your test file.

**Using it in a test:**
```javascript
import { LoginPage } from '../pages/LoginPage.js';

const loginPage = new LoginPage(page);
await loginPage.login('tomsmith', 'SuperSecretPassword!');
```

---

## Fixtures

Reusable setup code that any test can use by asking for it by name — just like `page`. Unlike `beforeEach`, fixtures only run for tests that specifically request them.

**File: `fixtures/base.js`**
```javascript
import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage.js';

export const test = base.extend({
  loggedInPage: async ({ page }, use) => {
    await page.goto('https://example.com/login');
    const loginPage = new LoginPage(page);
    await loginPage.login('tomsmith', 'SuperSecretPassword!');
    await use(page); // everything before use() is setup — hands the page to the test
  },
});

export { expect } from '@playwright/test';
```

**Using a fixture in a test:**
```javascript
import { test, expect } from '../fixtures/base.js';

test('logged in user can logout', async ({ loggedInPage }) => {
  await loggedInPage.getByRole('link', { name: 'Logout' }).click();
});
```

**Key difference from `beforeEach`:** A fixture only runs for tests that ask for it by name. `beforeEach` runs for every test in the file regardless.

---

## API testing

Testing an API (Application Programming Interface) directly without a browser. Faster than UI (User Interface) testing — goes straight to the data.

Uses `request` instead of `page`:

```javascript
test('GET post returns 200 status', async ({ request }) => {
  // send a GET request to the endpoint
  const response = await request.get('https://jsonplaceholder.typicode.com/posts/1');

  // check the status code
  await expect(response.status()).toBe(200);

  // parse the response body — converts raw text into a JavaScript object you can read
  const body = await response.json();

  // assert specific field values using dot notation
  await expect(body.userId).toBe(1);
});
```

**HTTP (HyperText Transfer Protocol) request types:**

| Request | What it does |
|---------|-------------|
| `GET` | Retrieves data |
| `POST` | Sends new data |
| `PUT` | Updates existing data |
| `DELETE` | Removes data |

**Common status codes:**

| Code | Meaning |
|------|---------|
| `200` | OK — request succeeded |
| `404` | Not Found — endpoint doesn't exist |
| `500` | Server Error — something broke on the server |

**Notes:**
- Never use `--headed` for API tests — there's no browser to open
- `response.json()` parses the raw response into a JavaScript object so you can access individual fields with `body.fieldname`

---

## Tags and smoke tests

Tags let you label tests so you can run specific groups with one command.

```javascript
test('successful login @smoke', async ({ page }) => { ... });
```

```
npx playwright test --grep "@smoke"
```

A **smoke test** is a quick check of the most critical features — named after hardware testing where "no smoke" means the basics are working.

---

## Comments — when to use them

A comment should add context the code itself doesn't make obvious. If someone can read the code and immediately understand what and why, the comment is noise.

```javascript
// USEFUL — explains WHY, not just WHAT
// Date.now() generates a unique timestamp so every test run uses a different email
const email = `test${Date.now()}@test.com`;

// USELESS — the code already says this
// click the login button
await page.getByRole('button', { name: 'Login' }).click();
```

Good test names often make comments inside tests unnecessary.

---

## YAGNI

**You Aren't Gonna Need It** — don't over-engineer. Only add structure (like a POM or fixture) when the problem actually exists, not in anticipation of it. A test suite that's simple and works is better than one that's complex and hard to maintain.

---

## The test pyramid

The ideal balance of tests in a real QA team:

- **Many API tests** — fast, reliable, test data and business logic directly
- **Fewer UI tests** — slower, test that the interface works for real users

API tests run in milliseconds. UI tests run in seconds. At scale, that difference matters a lot.

---

## HTML basics for Playwright

### What is HTML?

HTML (HyperText Markup Language) is the code that builds every webpage. It's made up of **tags** — words in angle brackets like `<button>` or `<input>`. Each tag creates something on the page — a button, a text field, a link. These things are called **elements**.

When you inspect an element in your browser, you're looking at the HTML that created it. Understanding the HTML helps you write the right Playwright locator.

---

### Common HTML elements and their roles

| HTML tag | What it creates | Playwright role |
|----------|----------------|----------------|
| `<button>` | A clickable button | `'button'` |
| `<a>` | A clickable link | `'link'` |
| `<input type="text">` | A text input field | `'textbox'` |
| `<input type="email">` | An email input field | `'textbox'` |
| `<input type="password">` | A password field | no role — use `locator` |
| `<input type="checkbox">` | A tick box | `'checkbox'` |
| `<input type="radio">` | A radio button (one from a group) | `'radio'` |
| `<select>` | A dropdown menu | use `locator` + `.selectOption()` |
| `<h1>`, `<h2>` etc | A heading | `'heading'` |

**The key habit:** Before writing any locator, right-click the element in your browser → click Inspect → look at the HTML tag. That tells you which locator to use.

---

### Attributes — how to find the right locator

An **attribute** is extra information inside an HTML tag. For example:

```html
<input type="email" placeholder="Email Address" name="email" data-qa="signup-email">
```

Here `type`, `placeholder`, `name`, and `data-qa` are all attributes. Each one can be used as a locator:

| Attribute | Playwright locator |
|-----------|-------------------|
| `placeholder="Email Address"` | `page.getByPlaceholder('Email Address')` |
| `data-qa="signup-email"` | `page.locator('[data-qa="signup-email"]')` |
| `value="Mr"` | `page.locator('[value="Mr"]')` |
| `id="password"` | `page.locator('#password')` or `page.locator('[id="password"]')` |

**Choosing the right one:** Use `data-qa` when available — it's the most stable. Fall back to `placeholder`, then `id`, then other attributes.

---

### `data-qa` attributes

`data-qa` is a custom attribute developers add specifically for QA (Quality Assurance) engineers to use in their tests. The `qa` stands for Quality Assurance.

```html
<input data-qa="signup-email" type="email" placeholder="Email Address">
```

In Playwright:
```javascript
await page.locator('[data-qa="signup-email"]').fill('test@test.com');
```

**Why it's the best locator when available:**
- Added specifically for testing — it won't change for design reasons
- Unique — identifies exactly what the element is for
- Stable — doesn't change when the page is restyled

---

## Terminal commands

| Command | What it does |
|---------|-------------|
| `npx playwright test` | Runs all tests |
| `npx playwright test login.spec.js` | Runs one specific file |
| `npx playwright test --headed` | Runs with the browser visible (not for API tests) |
| `npx playwright test --grep "test name"` | Runs only tests whose name matches |
| `npx playwright test --project=chromium` | Runs tests in one browser only |
| `npx playwright show-report` | Opens the HTML test report |
| `npx playwright codegen https://...` | Opens the recorder |
| `npx playwright test --ui` | Opens the interactive UI mode for stepping through tests |

> Press `Ctrl+C` to quit the report server. The terminal won't accept new commands until you do.

---

## Git commands

Git saves snapshots of your code over time. GitHub stores your code online.

| Command | What it does |
|---------|-------------|
| `git add .` | Stages all changed files ready to commit |
| `git commit -m "message"` | Saves a snapshot with a description |
| `git push` | Sends your commits up to GitHub |
| `git status` | Shows what files have changed |
| `git log` | Shows your commit history |

---

## CI (Continuous Integration)

Every time you push code to GitHub, it automatically runs all your tests in the cloud. A green tick means all tests passed. A red cross means something broke.

CI runs on every push regardless of what changed — even a README update triggers the full test suite.

---

## Errors you will see

### `TimeoutError`
Playwright waited 30 seconds for an element and couldn't find it.
**Usually means:** wrong role, wrong locator, element not on the page. Always inspect the HTML before writing locators.

### `expect(...).toBeVisible() failed`
The assertion check failed — the element wasn't visible.
**Usually means:** the action before it didn't work, or the wrong locator.

### `strict mode violation`
Your locator matched more than one element.
**Fix:** Add `{ name: '...' }` or use `.first()` or `.last()` or a more specific locator like `data-qa`.

### `Unterminated string constant`
A string is missing its closing quote `'` or backtick `` ` ``.

### `'import' and 'export' may only appear at the top level`
You've put an `import` or `export` inside a function or block. They must sit at the very top of the file.

---

## Common mistakes to watch out for

- Missing `()` at the end of `.click()`, `.toBeVisible()`, `.toBeChecked()` etc
- Missing closing quote `'` or backtick at the end of a string
- Using `'button'` as a role when the element is actually a `'link'` — always inspect the HTML first
- Using the same `const` name twice in one test
- Putting `export` or `import` inside a block instead of at the top of the file
- Using `--headed` on API tests — there's no browser to open
- Pushing `test.only` to GitHub — it causes all other tests to be skipped in CI
- Using CSS text that appears uppercase on screen — check the actual HTML text, CSS can make text appear different from what it really is

---

*Add new things here as you learn them — this file is yours to grow.*
