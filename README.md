# Ecommerce Portfolio

Automated tests for [automationexercise.com](https://automationexercise.com) built with Playwright as part of my QA (Quality Assurance) learning journey.

## Project Summary

This project demonstrates:

- Testing a real e-commerce site used by actual users
- Handling real-world challenges such as GDPR (General Data Protection Regulation) consent popups
- Dynamic test data generation to avoid duplicate registration failures
- Conditional logic to handle environment differences between local and CI (Continuous Integration)
- Cross-browser testing across Chromium, Firefox, and Safari
- Use of `data-qa` attributes for stable, test-specific locators
- Fixture-based authentication for reusable logged-in state across tests

## Tests

### registration.spec.js

- Successful user registration — covers consent popup handling, dynamic email generation, full account information form including radio buttons, dropdowns, and text fields, with URL and text assertions on completion

### purchase.spec.js

- Complete purchase journey — logs in via fixture, adds product to cart, navigates through checkout and payment forms, with URL and confirmation text assertions on completion

## Setup

### 1. Install Homebrew (Mac package manager)

`/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"`

### 2. Install Node.js

`brew install node`

### 3. Clone the repository

`git clone https://github.com/RemiJac01/ecommerce-portfolio.git`

### 4. Navigate into the project folder

`cd ecommerce-portfolio`

### 5. Install Playwright

`npm init playwright@latest`

### 6. Run the tests

`npx playwright test`
