# OrangeHRM Playwright Lab

A small Playwright + TypeScript project for learning UI test automation. CI, Allure, and agent integration are intentionally left for later.

## Setup

1. Install Node.js (22 recommended).
2. Run `npm install`.
3. Run `npx playwright install chromium`.
4. Copy `.env.example` to `.env` and set credentials for an instance you are authorized to test.
5. Run `npm test`.

The starter test performs a login and checks the dashboard. The default URL points to OrangeHRM's shared public demo; use only low-impact checks there. For tests that create, update, or delete records, switch `ORANGEHRM_BASE_URL` to an instance dedicated to your tests.

## Layout

- `tests/specs/`: executable test cases
- `tests/pages/`: page objects and UI actions
- `tests/fixtures/`: shared Playwright fixtures (add when needed)
- `tests/data/`: non-secret test data
- `tests/support/`: reusable helpers
- `docs/reference/`: the four supplied reference documents

Selectors and assertions in the starter login test are a first draft and should be checked against the target instance before relying on the result.
