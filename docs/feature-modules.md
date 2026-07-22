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

---

## Coverage Mapping

| Feature Area | Covered in |
|---|---|
| Onboarding & whitelisting | [`test-cases/regression-checklist.md`](../test-cases/regression-checklist.md) TC-001–010 |
| Fee wallet | TC-015–018 |
| Commercial slabs | TC-019–021 |
| Multi-account linking | TC-022–025, derived from [`business-flow.md`](./business-flow.md) |
| Credits/Debits filter isolation | TC-026–027 |
| Mini Statement vs. Transactions reconciliation | TC-028 |
| Cross-report consistency & export format | TC-029–031 |
| Consent management (security-critical) | TC-032–034 |

## Future Test Coverage (Not Yet in `test-cases/`)

- Automating the newly-documented manual test cases (TC-022–034) — consent revocation immediacy
  (TC-033) and Mini Statement reconciliation (TC-028) are the next priority tier given their
  security and financial-reporting impact
- Multi-account linking and consent revocation under concurrent load — the real load test
  (see `test-reports/load-testing-report.md`) validated the core transaction path only, not
  these adjacent flows (see `business-flow.md` section 6 for the full gap analysis)
