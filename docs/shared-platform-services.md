# Connected Banking — Shared Platform Services

> Connected Banking doesn't run in isolation — it's one of several products (Collection, Payout,
> Connected Banking, BBPS, Reseller, and others) built on top of a **common company-wide
> platform layer**. This document lists the shared services this product depends on, separate
> from the ~29 services enumerated in [`service-architecture.md`](./service-architecture.md)
> that belong to Connected Banking specifically.

## Why "Shared Platform" Matters for Testing

A defect in a shared service doesn't stay contained to one product. A bug in the company-wide
**Reconciliation Engine**, for example, doesn't just affect Connected Banking's bank-vs-platform
matching — it silently affects Collection's settlement reconciliation and Payout's ledger
reconciliation too. This is why a change to a shared service should trigger **cross-product
smoke testing**, not just regression scoped to whichever product initiated the change.

## Shared Platform Services (Company-Wide)

### Identity & Access
- Authentication
- Authorization
- OTP Service
- User Management
- Role & Permission Service

### Merchant Lifecycle
- Merchant Management
- Merchant Onboarding
- Merchant Activation
- Merchant Profile

### Financial Engines
- Commercial Engine
- GST Engine
- Ledger Engine
- Settlement Engine
- Reconciliation Engine

### Reporting & Data Export
- Report Engine
- Export Engine
- Download Engine
- Dashboard Service
- Search Engine
- Filter Engine

### Platform Infrastructure
- Audit Logs
- Activity Logs
- Notification Service
- API Gateway
- Validation Service
- File Upload Service
- File Download Service
- Scheduler / Background Workers

## How Connected Banking Depends on These

- **Merchant Onboarding / Activation** — the self-service signup and eKYC flow (see
  `architecture-and-flow.md`) hands off to the same shared Merchant Onboarding/Activation
  services used across the platform, with Connected Banking-specific bank linking layered on top
- **Commercial Engine / GST Engine** — the fee wallet model's slab-based fee and GST calculation
  (see the README's Fee Wallet Model) is Connected Banking-specific *configuration* on top of the
  shared Commercial/GST Engines, not a separate calculation implementation
- **Reconciliation Engine** — this is the most load-bearing shared dependency for this product:
  the entire "platform vs. bank as two independent sources of truth" problem described in
  [`business-flow.md`](./business-flow.md) section 1 is ultimately a Reconciliation Engine
  correctness question, shared with every other product that reconciles against bank-side data
- **Audit Logs / API Gateway** — consent-sensitive actions (grant/revoke, see `business-flow.md`
  section 4) are exactly the kind of security-relevant events that need reliable platform-wide
  audit logging and consistent API-layer enforcement, not a Connected-Banking-only mechanism

## Platform Summary (Company-Wide Context)

| Product | Approx. Services |
|---|---|
| Collection | 38 |
| Payout | 35 |
| Connected Banking | 28 |
| Shared Platform | 28 |

**~70–80 unique logical services** across the platform in total — many shared rather than
independently reimplemented per product.

> These are approximate, company-wide framing numbers. Connected Banking's own precise,
> exhaustively-enumerated service list (29 services) is in
> [`service-architecture.md`](./service-architecture.md).

## Testing Implication: Blast Radius

When scoping regression for a change to any shared service, ask: *which other products also
depend on this service?* The Reconciliation Engine and Commercial/GST Engine are the two shared
dependencies most worth flagging for Connected Banking specifically — a regression in either
could produce exactly the kind of "platform vs. bank drift" or fee-miscalculation defects
documented in [`bug-reports/`](../sample-defect-report.md), without any code in Connected Banking itself
having changed.
