# Connected Banking — Feature & Module Breakdown

> Detailed feature inventory used to scope test coverage. Complements
> [`business-overview.md`](./business-overview.md) (the "why") with the concrete "what".

## Bank Accounts

- Link Bank Account
- Account Overview
- Balance

## Transactions

- Credits
- Debits
- Transaction Search
- Mini Statement
- Download
- Search
- Filter

**Test implication:** Credits and Debits should be tested as distinct categories with their own
filters — a common defect pattern is a "Credits only" filter that still leaks debit entries, or
vice versa, especially once mini-statement pagination is involved.

## Mini Statement

- Search
- Filter
- Download

**Test implication:** the mini statement is often generated from a different code path than the
main transaction list (optimized for a shorter, printable view) — reconciling that its totals
match the main Transactions view exactly is a high-value regression case.

## Reports

- Account Report
- Banking Report
- Transaction Report

## Admin Activation & Commercial Setup

- Merchant status check (Active / Inactive / Not Subscribed) and filtering
- Merchant activation (first-time)
- Add Commercial (Channel selection, auto-assigned Virtual Account Number, Whitelisting toggle)
- Create Bank Rule (Select Bank, Account Number, IFSC Code, Daily Limit)
- Add Commercial Rule (Payment Mode, Charge Type, fee values, per-transaction min/max)

**Test implication:** this is entirely admin-side setup that must complete correctly *before* a
merchant can even attempt to connect — see
[`user-guide-activate-connected-banking.md`](./user-guide-activate-connected-banking.md) for the
full non-technical walkthrough this is based on.

## Merchant Connect Flow

- Connect Now entry point (conditional on Admin setup being complete)
- Account Number / Confirm Account Number / IFSC entry and verification against Admin's Bank Rule
- Terms & Conditions (4 mandatory consent checkboxes)
- Synced-balance confirmation and dashboard redirect

## Wallet (Ledger) & Beneficiary Management

- Ledger recharge (instant for whitelisted accounts, Pending + Admin approval for non-whitelisted)
- Bank Widget vs. Ledger Widget (two distinct balances, easily confused)
- Add Beneficiary (Account Number, Confirm Account Number, IFSC, Beneficiary Name, Bank Name)
- Transfer (amount, beneficiary, payment mode, review & confirm)

---

## Coverage Mapping

| Feature Area | Covered in |
|---|---|
| Onboarding & whitelisting | [`regression-checklist.md`](../regression-checklist.md) TC-001–010 |
| Fee wallet | TC-015–018 |
| Commercial slabs | TC-019–021 |
| Multi-account linking | TC-022–025, derived from [`business-flow.md`](./business-flow.md) |
| Credits/Debits filter isolation | TC-026–027 |
| Mini Statement vs. Transactions reconciliation | TC-028 |
| Cross-report consistency & export format | TC-029–031 |
| Consent management (security-critical) | TC-032–034 |
| Admin activation & commercial setup | TC-035–041, derived from the real activation SOP |
| Merchant Connect Flow (account match, T&C gate) | TC-042–048 |
| Wallet recharge, beneficiary & transfer | TC-049–058 |
| Cross-screen UI consistency | TC-059–065, see [`ui-consistency.md`](./ui-consistency.md) |

## Future Test Coverage (Not Yet in `regression-checklist.md`)

- Automating the newly-documented manual test cases (TC-022–058) — consent revocation immediacy
  (TC-033), Mini Statement reconciliation (TC-028), and the Pending-recharge Admin
  approve/cancel flow (TC-051–052) are the next priority tier given their security and
  financial-reporting impact
- Multi-account linking and consent revocation under concurrent load — the real load test
  (see [`../load-testing-report.md`](../load-testing-report.md)) validated the core transaction
  path only, not these adjacent flows (see [`business-flow.md`](./business-flow.md) section 6 for
  the full gap analysis)
- End-to-end chained regression combining the full real flow: Admin activation → merchant
  Connect Flow → wallet recharge → add beneficiary → transfer, as one continuous journey rather
  than testing each phase in isolation
