# Ecommerce Test Automation Framework

![Playwright Tests](https://github.com/RemiJac01/ecommerce-portfolio/actions/workflows/playwright.yml/badge.svg)

A Playwright test automation framework for [automationexercise.com](https://automationexercise.com), a live e-commerce site. Built to demonstrate a maintainable, real-world QA automation approach: Page Object Model, fixtures, reusable utilities, data-driven tests, and CI running across three browsers.

## What this demonstrates

- **A structured framework, not just scripts.** Separation of concerns across tests, page objects, fixtures, and utilities, so the suite stays readable and maintainable as it grows.
- **Handling a genuinely hostile real-world site.** The target site serves third-party Google ads and a GDPR consent popup that intermittently cover elements, inject fake links, and behave differently across browsers and between local and CI runs. The framework handles all of this (see "Handling flakiness" below).
- **Cross-browser coverage.** The full suite runs on Chromium, Firefox, and WebKit on every push via GitHub Actions.
- **Real assertions, not just actions.** Every test verifies an outcome (URL, confirmation text, calculated totals, error messages), not just that steps ran.

## Handling flakiness (the interesting part)

The target site is deliberately awkward to automate, which made it a good test of real QA problem-solving:

- **Network-level blocking of third-party noise.** Google ads and the consent popup were causing intermittent failures across multiple tests, differently on each run. Rather than patching each test individually, the framework blocks these requests at the network level (`utils/blockAds.js`) so they never load. One root-cause fix removed flakiness across the whole suite and resolved WebKit failures that symptom-level workarounds could not.
- **Race-condition handling in cart clearing.** The cart-clearing utility (`utils/clearCart.js`) re-queries the DOM on each iteration and waits for the item count to drop before continuing, avoiding a race where the loop outpaced the site's re-render.
- **Resilient locators and assertions.** Locators target stable attributes (`data-qa`, `href`) over fragile ones. URL assertions use regex to tolerate dynamic values such as order IDs.
- **Known starting state.** Tests that depend on cart state clear it first, so a previous run cannot contaminate the next.

## Framework structure

- `tests/` — spec files, one per feature
- `pages/` — Page Object Models (`LoginPage`, `PaymentPage`)
- `fixtures/` — custom fixtures (`loggedInPage` for reusable authenticated state)
- `utils/` — reusable helpers (`blockAds`, `clearCart`, `dismissConsent`)
- `test_fixtures/` — static test data (file upload)
- `playwright.config.js` — base URL, cross-browser projects, CI retry config

## Test coverage

| Spec                    | What it covers                                                                                                                                   |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `registration.spec.js`  | Full user registration, dynamic email generation, radio buttons, dropdowns, two-page flow, URL and text assertions                               |
| `login.spec.js`         | Successful login via the `LoginPage` POM, plus data-driven negative tests looping over invalid credential sets, each asserting the correct error |
| `purchase.spec.js`      | End-to-end purchase, logged-in via fixture, known-state cart, checkout and payment via the `PaymentPage` POM, regex URL assertion on completion  |
| `cart.spec.js`          | Cart line-total calculation, adds the same item twice, asserts the quantity cell and the calculated total (price × quantity)                     |
| `search.spec.js`        | Product search, asserts the results heading, the search URL parameter, and that relevant products return                                         |
| `contact-us.spec.js`    | Contact form with file upload and native dialog handling, plus a negative test proving an empty required field blocks submission                 |
| `newsletterSub.spec.js` | Newsletter subscription with a unique generated email and success assertion                                                                      |
| `category.spec.js`      | Data-driven category filtering across an accordion menu, scoped locators to avoid ad interference, regex heading assertions                      |

## Key techniques used

- Page Object Model for maintainable, centralised locators and actions
- Fixtures for reusable logged-in state (only tests that request it pay the setup cost)
- Data-driven testing with arrays and loops to cover multiple cases from one test body
- Reusable utility functions for cross-cutting setup (ad/consent blocking, cart clearing)
- `data-qa` and other stable attribute locators
- Regex assertions for dynamic URLs and headings
- Dynamic test data (`Date.now()`) to avoid duplicate-data failures
- Native dialog handling, file uploads, and conditional handling of environment differences

## Running the tests

Requires [Node.js](https://nodejs.org).

```bash
# Clone and enter the project
git clone https://github.com/RemiJac01/ecommerce-portfolio.git
cd ecommerce-portfolio

# Install dependencies and browsers
npm install
npx playwright install

# Run the full suite (all browsers)
npx playwright test

# Run a single file, headed, in one browser
npx playwright test login.spec.js --headed --project=chromium

# Open the HTML report
npx playwright show-report
```

## CI

Every push triggers a GitHub Actions workflow that runs the full suite across Chromium, Firefox, and WebKit. A green badge above means the suite is passing.
