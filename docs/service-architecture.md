# Connected Banking — Service Architecture (Behind the Scenes)

> A distributed system view of Connected Banking, useful for understanding integration test
> boundaries. Complements [`feature-modules.md`](./feature-modules.md) with the service-level
> decomposition behind each screen.

## Why This View Matters for QA

The onboarding flow documented in [`architecture-and-flow.md`](./architecture-and-flow.md) maps
onto several distinct services — knowing which service owns which state transition helps target
root-cause analysis when the dashboard shows an inconsistent whitelisting status.

## Service Groups

### Identity & Merchant
- Authentication Service
- Merchant Validation Service
- Merchant Permission Service

### Bank Account Lifecycle
- Bank Account Service
- Bank Account Linking Service
- Bank Account Overview Service
- Bank Account Verification Service
- Bank Balance Service

### Transactions
- Transaction Service
- Transaction Search Service
- Mini Statement Service
- Statement Download Service
- Account Summary Service

### Onboarding & Consent
- Service Activation Service
- Consent Management Service
- Commercial Lifecycle Service

### Reporting
- Banking Report Service
- Account Report Service
- Transaction Report Service
- Export Service
- Download Service

### Platform Cross-Cutting Services
- Connected Banking Dashboard Service
- Audit Log Service
- Activity Log Service
- API Validation Service
- Search Service
- Filter Service
- Notification Service
- Reconciliation Service

## Why Bank Account Linking Is Split From Verification

**Bank Account Linking Service** handles the self-service part (account number, IFSC, company
name), while **Bank Account Verification Service** handles confirming the account is real
(penny drop, format checks) — and the separate, bank-side **whitelisting** step (documented in
`architecture-and-flow.md`) sits outside both. This three-way split is exactly why the
onboarding state machine has more states than a simple "linked / not linked" toggle, and why
testing has to verify each transition independently:

- Linking succeeds, verification pending
- Verification succeeds, whitelisting pending
- Whitelisting succeeds, balance/transactions become available

A defect where the UI shows "Active" before whitelisting has actually completed is a classic
symptom of the Bank Account Overview Service and the whitelisting state source drifting out of
sync — a good example of why cross-service consistency, not just each service in isolation, is
a core test target.

## Integration Test Boundaries (Suggested)

| Boundary | What to Verify |
|---|---|
| Bank Account Linking Service → Verification Service | An unverified account cannot appear as "Active" anywhere in the UI |
| Verification Service → Bank Balance Service | Balance only becomes available after both verification and whitelisting are complete |
| Consent Management Service → Transaction Service | Transaction data is only retrievable while consent is active — a consent revocation should immediately restrict access |
| Mini Statement Service vs. Transaction Service | Totals reconcile exactly between the two views (see [`feature-modules.md`](./feature-modules.md)) |
