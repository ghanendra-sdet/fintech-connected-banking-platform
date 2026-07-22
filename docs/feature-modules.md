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
| Bank Account linking, Balance, Transactions, Mini Statement | Candidate for expansion — see below |

## Future Test Coverage (Not Yet in `test-cases/`)

- Multi-account linking — does adding a second bank account to the same business affect the
  first account's whitelisting state or balance display?
- Credits vs. Debits filter isolation
- Mini Statement vs. full Transactions view reconciliation (totals must match exactly)
- Download/export format validation (CSV/PDF) for Banking and Transaction Reports
