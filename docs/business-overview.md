# Connected Banking — Business Overview

> **Start here if you're new to fintech QA, in HR, or from a non-QA technical role.** This
> document explains what a Connected Banking product does and why it matters, before you look at
> any test case or code. See [`README.md`](./README.md) for the full documentation map if you
> landed here directly.

## 1. What problem does it solve?

Businesses that hold accounts across multiple banks traditionally have to log into each bank's
own net-banking portal separately, and integrating each bank's API individually can take weeks —
IP whitelisting, legal approvals, and validation per bank. A Connected Banking platform collapses
all of that into **one login and one unified API**.

## 2. Core Product Pillars

### Self-Service Model
- 100% self-service sign-up and onboarding
- eKYC is fully automated — no manual approval required
- Users can independently create accounts and start using the service without support
  intervention

### API-Driven Solution
- One unified API for banking integrations, instead of separate integrations per bank
- Avoids the complexity of multiple bank API setups (IP whitelisting, legal approvals,
  validations)

### Consolidated Financial Management
- A unified dashboard for payments, balance tracking, and transaction reporting
- Removes the need to monitor balances across multiple separate bank portals

### Alternative to Net Banking
- Functions as the business's own net banking system — a single window across multiple
  linked accounts

### Dedicated Fee Wallet
- Customer funds always stay in the customer's own bank account — the platform never holds
  customer money
- A separate, dedicated wallet exists purely for the platform's own service fee, which must be
  pre-funded before a transaction is attempted
- This wallet cannot be withdrawn from; it exists only to pay the service fee

## 3. Onboarding, In Plain Terms

1. **Sign up & complete eKYC** — automated, no waiting on manual approval
2. **Add a bank account** — account number, IFSC, and company name
3. **Bank whitelisting (the one manual step)** — the business must ask their own bank to
   whitelist the platform as an approved Digital Service Provider (DSP) and enable the
   platform's IP for API calls. Without this step, no transaction can process, no matter how
   complete everything else is.
4. **Balance verification & transactions** — once whitelisted, balance appears instantly and
   the business can transact via API or dashboard

## 4. Glossary

| Term | Meaning |
|---|---|
| **eKYC** | Electronic Know Your Customer — automated identity verification during signup |
| **DSP** | Digital Service Provider — the status a bank grants to whitelist a platform for API access |
| **Penny Drop** | A ₹1 test transaction used to validate that a bank account is real and active |
| **IFSC** | Indian Financial System Code — identifies a specific bank branch |
| **TPS** | Transactions Per Second — a throughput/capacity limit |
| **Fee Wallet** | A separate, pre-fundable balance used only to pay the platform's own service fees |
| **Whitelisting** | The bank-side approval step that allows a platform's IP to make API calls against an account |

## 5. Why the Onboarding Flow Order Matters for Testing

Because bank whitelisting is a manual, bank-side step outside the platform's control, a huge
class of real-world defects in this domain are about **state consistency while waiting on an
external approval**:

- Does the dashboard correctly show "pending whitelisting" vs. "active" vs. "failed"?
- If whitelisting completes on the bank's side, how quickly does the platform reflect it?
- What happens if a transaction is attempted before whitelisting completes?
- What happens if the fee wallet has enough for a smaller transaction's fee but not a larger one?

This is why the regression suite treats onboarding as a state machine to be tested at every
transition, not just a linear happy path.

## 6. Differentiation & Target Market (For Context)

- This category of product is purpose-built for **API-driven transactional banking** — geared
  toward businesses integrating banking into their own ERP or finance systems — as opposed to
  competitor products that bundle accounting, payroll, and tax dashboards on top of banking.
- Typical target users: businesses managing multiple bank accounts (vendor payments, salary
  processing), enterprises integrating ERPs with banking via API, and large-transaction-volume
  platforms such as crypto exchanges or other high-throughput fintech businesses.

## 7. Involved Parties (Stakeholders)

| Stakeholder | Why They Care |
|---|---|
| **Business / Merchant** | Needs reliable multi-bank visibility and transaction execution |
| **Merchant Admins** | Configure linked accounts, monitor whitelisting status |
| **Banks** | The source of truth for balance/transactions; the whitelisting gatekeeper |
| **Finance Team** | Owns fee wallet accuracy and reconciliation correctness |
| **Treasury Team** | Cares about accurate real-time balance visibility across accounts |
| **Operations Team** | Monitors onboarding health, Pending-recharge approvals |
| **Compliance Team** | Cares about consent management and audit trail completeness |

## 8. Dependencies

**This product's own internal services** — see [`service-architecture.md`](./service-architecture.md)
for the full ~29-service breakdown (Bank Account lifecycle, Transactions, Reporting, Consent).

**Shared, company-wide platform services** — see [`shared-platform-services.md`](./shared-platform-services.md)
for the engines this product consumes rather than reimplements: Authentication, Merchant
Onboarding, Commercial/GST/Reconciliation Engines, Audit Logs.

**External, third-party dependencies:**

- **Banking APIs** / **Account Aggregator APIs** — the actual bank-side data source
- **Banking Networks** — IMPS/NEFT/RTGS rails for transaction execution
- **OTP Services** — identity verification during onboarding
- **Notification Services** — whitelisting status and transaction alerts

## 9. Cross-Module Dependencies (Conceptual, Within the Platform)

- **AI Dispute Resolution Engine** — handles merchant support issues raised about whitelisting
  confusion, disputes, and account detail changes, as part of the shared cross-product support
  layer

See [`architecture-and-flow.md`](./architecture-and-flow.md) for the detailed flow diagrams, and
[`ui-consistency.md`](./ui-consistency.md) for how this data must render consistently across
every screen — especially the Bank Widget vs. Ledger Widget distinction.
