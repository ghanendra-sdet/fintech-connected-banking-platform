# Connected Banking — Automation Framework

Automation for the Connected Banking onboarding-to-transaction journey, built with
**Playwright + TypeScript** using the **Page Object Model (POM)**.

> Automated scenarios trace to [`../regression-checklist.md`](../regression-checklist.md) and the
> real activation flow in [`../docs/user-guide-activate-connected-banking.md`](../docs/user-guide-activate-connected-banking.md).
> See [`../docs/README.md`](../docs/README.md) for the full documentation map.

## Why Playwright + TypeScript

- Native auto-waiting handles the async, state-machine-like nature of bank whitelisting well —
  no manual polling loops needed for most UI assertions
- Built-in API request context supports mixed UI + API tests (e.g. trigger whitelisting via a
  test-only API, then assert the dashboard reflects it)
- TypeScript keeps page objects and shared fixtures maintainable as the onboarding flow grows

## Suggested Project Structure

```
automation/
├── README.md
├── playwright.config.ts
├── pages/
│   ├── SignupPage.ts
│   ├── EkycPage.ts
│   ├── AddBankAccountPage.ts
│   ├── DashboardPage.ts
│   └── TransactionPage.ts
├── fixtures/
│   └── dummy-business.ts
└── tests/
    ├── sample-onboarding.spec.ts
    └── ...
```

> This repo currently includes one representative sample (`sample-onboarding.spec.ts`) rather
> than the full framework, to keep the portfolio focused.

## Test Data Policy

All automation uses **dummy data only**:
- Dummy company names and dummy account numbers
- Dummy IFSC codes that pass format validation but map to no real bank
- Fee wallet amounts generated at runtime, never fixed production values

## Priority Automated Scenarios

1. Signup & eKYC completion
2. Add bank account (valid / invalid IFSC & account number)
3. Bank whitelisting status reflected correctly on dashboard
4. Balance verification post-whitelisting
5. Transaction initiation and status polling
6. Fee wallet deduction and insufficient-balance blocking

Admin activation, the Connect Flow's account-match validation, and consent revocation immediacy
(see [`../docs/feature-modules.md`](../docs/feature-modules.md) Future Test Coverage) are the
next priority tier — currently manual-only.
