# Test Strategy

A short strategy document for this test automation framework. It covers what this suite tests, how I made decisions about coverage, and the principles behind the architecture.

## Scope

This framework validates the critical user journeys on [automationexercise.com](https://automationexercise.com): registration, login, product discovery and search, cart and checkout, payment, and ancillary flows such as the contact form and newsletter subscription. Together these cover the full value chain of an e-commerce site, from first visit through to purchase and post-purchase engagement.

The site was chosen as a target because it exposes a wide enough feature set to exercise most common automation techniques (forms, authentication, dynamic data, a shopping journey, cross-page state, file upload, native dialogs) while also being a genuinely hostile real-world environment thanks to third-party ads and a consent popup. That hostility is useful: it forces honest decisions about flakiness and resilience that a clean demo site would not.

## Approach

The suite is built on a small number of guiding principles:

- **Risk-based prioritisation.** Coverage weight follows real user and business risk. Login, checkout, payment, and cart calculation are tested most thoroughly because failures there cost revenue and trust. Lower-impact areas receive lighter coverage.
- **One behaviour per test.** Each test verifies one thing clearly, so a failure points at a single cause and the suite stays diagnosable.
- **Known starting state.** Tests that depend on state (such as a cart being empty) set up that state themselves rather than inheriting it from previous runs. This removes a whole class of cross-test contamination.
- **Root-cause over symptom.** When the same problem shows up across multiple tests, it is fixed at the source rather than patched locally. The clearest example is network-level blocking of ads and the consent popup, which removed flakiness across the whole suite from a single utility.
- **YAGNI.** Structure is added when it earns its place. Page objects, fixtures, and utilities exist because they are used more than once, not because the framework "should" have them.

## Test types used

- **UI end-to-end tests.** The majority of the suite, exercising full user journeys through the browser.
- **Negative testing.** Invalid credentials on login, an empty required field on contact-us, both verifying the system behaves correctly when the user does not.
- **Data-driven testing.** `for` loops over arrays of test data for cases where the behaviour is identical but the inputs vary, such as invalid credential sets and category filters.
- **Cross-browser testing.** The full suite runs on Chromium, Firefox, and WebKit on every push.
- **API testing.** Not implemented in this framework, but used in prior roles (Postman at Adverty and Experian) and would be the natural next layer here to strengthen the test pyramid.

## Tools and architecture

- **Playwright.** Chosen for cross-browser support out of the box, built-in auto-waiting that reduces flaky code, strong first-class locators, and modern debugging tools (trace viewer, UI mode, codegen).
- **Page Object Model.** Used selectively where locators and actions are reused across tests (`LoginPage`, `PaymentPage`). Not applied to every page, in line with YAGNI.
- **Fixtures.** `loggedInPage` provides reusable authenticated state for tests that need it, without forcing every test in the file to pay the setup cost (as a `beforeEach` would).
- **Utilities.** Cross-cutting helpers extracted when a pattern is used more than once (`blockAds`, `clearCart`, `dismissConsent`).
- **GitHub Actions CI.** The full suite runs on every push, with retries configured for CI only. Local runs do not retry, so flakiness is surfaced during development rather than hidden.

## Risk and mitigation

The highest-risk areas on an e-commerce site are the ones that affect revenue, trust, or regulatory exposure. In this suite:

- **Checkout and payment** — mitigated by an end-to-end purchase test that goes through add-to-cart, checkout, and payment, with a regex URL assertion on the dynamic order confirmation page and a text assertion on the confirmation message. The test starts from a known-empty cart to guarantee predictable state.
- **Login** — mitigated by a positive login test using the `LoginPage` POM, plus a data-driven set of negative tests covering wrong email and wrong password, each asserting the specific error message.
- **Cart calculation** — mitigated by a dedicated test that adds the same item twice and asserts the calculated line total, verifying real business logic (price × quantity) rather than just that items were added.
- **Cross-browser consistency** — mitigated by running the full suite on Chromium, Firefox, and WebKit. This has already caught genuine engine-specific issues that would be invisible in single-browser testing.
- **Third-party interference** — the site serves ads and a consent popup that intermittently cover elements and inject fake links. Mitigated by blocking these at the network level so they never load, rather than working around them per-test.

## Out of scope

Several areas are deliberately not covered by this framework, with reasons:

- **Admin and backend testing.** No admin access to the target site.
- **Performance and load testing.** Different tooling (k6, JMeter) and a different objective. Would be a separate workstream in a real product.
- **Mobile device testing.** Playwright can emulate viewports, but true device coverage requires a device lab or a service like BrowserStack. Out of scope here.
- **Visual regression testing.** Would require baseline images and a tool such as Percy or Applitools. Not configured for this framework.
- **Deep API testing.** The framework is UI-focused. In a real product this would be an essential companion layer (and the one I would build first, per the test pyramid).
- **Accessibility testing.** Would use `axe-core` or similar. Out of scope here but a natural extension.
- **Security testing.** A specialised domain requiring different tooling and expertise.

## What would be different for a production framework

This is a portfolio project, not a production-ready test suite. In a real product I would additionally:

- Build an API test layer first, so the suite follows the test pyramid rather than being entirely UI-driven.
- Centralise test data (credentials, product IDs, expected prices) rather than hardcoding in each spec.
- Introduce environment-specific configuration for dev, staging, and prod.
- Add visual regression and accessibility coverage.
- Integrate with the team's issue tracker so test failures link to tickets automatically.
- Instrument the suite with reporting (Allure or similar) for trend data across runs.
