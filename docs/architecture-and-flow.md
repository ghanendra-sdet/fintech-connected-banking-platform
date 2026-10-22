# Connected Banking — Architecture & Flow

> This is the internal, system-level "Tech Flow" view. For the non-technical, step-by-step
> merchant/admin walkthrough this diagram is based on, see
> [`user-guide-activate-connected-banking.md`](./user-guide-activate-connected-banking.md). For
> the customer/business-facing journey, see [`business-flow.md`](./business-flow.md). For the
> service-level (microservice) view, see [`service-architecture.md`](./service-architecture.md).
> See [`README.md`](./README.md) for the full documentation map.
>
> Every diagram below is drawn in <a href="https://mermaid.js.org/" target="_blank" rel="noopener noreferrer">Mermaid</a>,
> which GitHub renders natively in-page — nothing here requires opening another site or tool to
> read it.

## Full Onboarding-to-Transaction Flow

```mermaid
flowchart LR
    A["Website Signup"] --> B["Self-Service eKYC<br/>auto-approved"]
    B --> C["Add Bank Account<br/>acct#, IFSC, name"]
    C --> D["Bank Whitelisting (DSP)<br/>manual, business-initiated, bank-side approval"]
    D --> E["Balance Verification<br/>instant once whitelisted"]
    E --> F["Transactions via API / Dashboard"]
```

## Onboarding State Machine (Testing View)

```mermaid
stateDiagram-v2
    [*] --> SIGNED_UP
    SIGNED_UP --> EKYC_COMPLETE
    EKYC_COMPLETE --> ACCOUNT_ADDED
    ACCOUNT_ADDED --> WHITELIST_PENDING
    WHITELIST_PENDING --> WHITELIST_ACTIVE: ✅
    WHITELIST_PENDING --> WHITELIST_FAILED: ❌
    WHITELIST_ACTIVE --> TRANSACTING
    WHITELIST_FAILED --> [*]

    classDef pending fill:#e65100,color:#fff
    classDef good fill:#1b5e20,color:#fff
    classDef bad fill:#b71c1c,color:#fff
    class WHITELIST_PENDING pending
    class WHITELIST_ACTIVE,TRANSACTING good
    class WHITELIST_FAILED bad
```

- **WHITELIST_PENDING** is the highest-risk state to test — it can persist for an unpredictable
  amount of time since it depends on external bank action
- Any transaction attempt while `WHITELIST_PENDING` or `WHITELIST_FAILED` must be blocked with a
  clear error, not silently queued or dropped — see the next section for exactly what happens
  when that block isn't enforced everywhere it needs to be

## The Real Mechanism Behind Defect #1 — A UI-Only Check Is Not a Real Boundary

[`sample-defect-report.md`](../sample-defect-report.md) Defect #1 (a transaction proceeding
despite `WHITELIST_PENDING` status, when called via the API) is a recurring defect *shape*, not
a one-off: any time a state check is enforced only in the dashboard and never independently
re-verified at the API/service layer, the check protects nothing for a client that never touches
that dashboard. Here's exactly where this platform's version of it lives:

```mermaid
flowchart TD
    Request["POST /transactions, account status = WHITELIST_PENDING"] --> UILayer{"🖥️ UI Layer:<br/>does the dashboard block initiation<br/>for a non-whitelisted account?"}
    UILayer -->|Yes, correctly blocked in the UI| Trust["⚠️ Trusted the UI alone — not a real boundary.<br/>API-integrating businesses (this product's PRIMARY users,<br/>per business-overview.md) never go through this UI at all."]
    Trust --> APILayer{"🔌 API/Service Layer:<br/>does the transaction-initiation service<br/>independently re-check whitelisting status?"}
    APILayer -->|"Yes — status re-checked"| Blocked["✅ Request REJECTED — clear 'Bank not yet whitelisted' error"]
    APILayer -->|"❌ No — request proceeds to the bank adapter<br/>(this IS Defect #1's actual root cause)"| Downstream["🚨 Fails downstream with a generic, unhelpful error —<br/>and unnecessarily loads the bank adapter layer<br/>with a request that should never have been sent"]

    classDef gate fill:#4a148c,color:#fff,stroke:#ab47bc,stroke-width:1px
    classDef warn fill:#e65100,color:#fff,stroke:#fb8c00,stroke-width:1px
    classDef good fill:#1b5e20,color:#fff,stroke:#43a047,stroke-width:1px
    classDef bad fill:#b71c1c,color:#fff,stroke:#e53935,stroke-width:1px

    class UILayer,APILayer gate
    class Trust warn
    class Blocked good
    class Downstream bad
```

**Why this specific product makes the defect *more* consequential than it would be elsewhere:**
per [`business-overview.md`](./business-overview.md), this platform is "API-driven, not just a
dashboard" — its primary users integrate programmatically and may never touch the UI at all. A
check that only exists in the dashboard protects approximately none of this product's actual
traffic. The fix — enforce the whitelisting check at the API/service layer, not only in the UI —
isn't just good practice here; it's the only version of the fix that covers this product's
actual primary user base.

## Admin Activation Flow (Real, Detailed — Pre-Merchant-Onboarding Setup)

This is the concrete admin-side sequence that must complete *before* a merchant ever sees a
"Connect Now" button — captured from an actual activation SOP walkthrough, not a generic guess.

```mermaid
flowchart TD
    A["🛡️ Admin: Settings -> Connected Banking -><br/>confirm merchant appears in All Merchants list"] --> B["Admin: Check merchant status -<br/>Active / Inactive / Not Subscribed"]
    B --> C["Admin: Activate merchant (first-time)<br/>via row action menu — status: yellow -> green"]
    C --> D["Admin: Open Merchant Profile -><br/>Service Management -> Connected Banking"]
    D --> E["Admin: Add Commercial -> select Channel -><br/>VA Number auto-assigned -> set Whitelisting toggle"]
    E --> F["⚠️ Admin: Create Bank Rule -> Bank, Account Number,<br/>IFSC Code, Daily Limit (all mandatory)"]
    F --> G["Admin: Add Commercial Rule -> Payment Mode(s) -><br/>Charge Type -> fee values -> min/max limits -> Submit"]
    G --> H["✅ Admin: Verify commercials created successfully -<br/>merchant can now proceed"]

    classDef person fill:#1a237e,color:#fff,stroke:#5c6bc0,stroke-width:1px
    classDef warn fill:#e65100,color:#fff,stroke:#fb8c00,stroke-width:1px
    classDef good fill:#1b5e20,color:#fff,stroke:#43a047,stroke-width:1px

    class A,B,C,D,G person
    class E,F warn
    class H good
```

> ⚠️ The exact values entered in **Create Bank Rule** (Account Number, IFSC) must be re-entered
> identically by the merchant later — the single most common activation failure point.

**Testing implication:** every one of the "all mandatory" fields in Create Bank Rule and Add
Commercial Rule needs an explicit negative test (missing field, invalid IFSC format, daily
limit of zero, min > max on per-transaction limits) — none of this is optional/soft-validated
per the SOP's own "⚠️ critical" framing.

## Merchant Self-Service Connect Flow (Real, Detailed)

```mermaid
flowchart TD
    A["🧑 Merchant sees: 'Connected Banking isn't activated yet.<br/>Contact support.' — persists until Admin's flow completes"] --> B["'Connect Now' button appears<br/>only after Admin adds commercials"]
    B --> C{"Click Connect Now"}
    C -->|"No, open a new account"| Ext["🌐 Redirected to the bank's own site<br/>(external, out of scope)"]
    C -->|"Yes, I have an account"| D["Enter Account Number, Confirm Account Number, IFSC Code"]
    D --> E{"⚠️ Click Verify —<br/>MUST exactly match what Admin entered"}
    E -->|Match| F["✅ Shows verified details + Account Type<br/>(defaults 'Current Account')"]
    E -->|Mismatch| Fail["❌ Inline 'Account numbers do not match' error"]
    F --> G["Click Continue -> Terms & Conditions page<br/>4 mandatory checkboxes"]
    G --> H["Click Submit -> confirmation screen,<br/>synced balance shown"]
    H --> I["✅ Click View Dashboard -> live Connected Banking Dashboard"]

    classDef person fill:#1a237e,color:#fff,stroke:#5c6bc0,stroke-width:1px
    classDef gate fill:#4a148c,color:#fff,stroke:#ab47bc,stroke-width:1px
    classDef good fill:#1b5e20,color:#fff,stroke:#43a047,stroke-width:1px
    classDef bad fill:#b71c1c,color:#fff,stroke:#e53935,stroke-width:1px

    class A person
    class C,E gate
    class F,H,I good
    class Fail bad
```

**Testing implication:** the account-number/IFSC match check (merchant-entered vs. admin-entered)
is the highest-value negative test in this entire flow — the real product surfaces this as an
inline "Account numbers do not match" validation error, which needs its own dedicated test
rather than being assumed to work because the happy path does.

## Dashboard: Two Distinct Balances (Bank Widget vs. Ledger Widget)

A completed Connect Flow lands the merchant on a dashboard with **two separate balance widgets**
that are easy to conflate but serve entirely different purposes:

| | Bank Widget (e.g. "Northbridge Bank") | Ledger Widget |
|---|---|---|
| **Shows** | The actual linked bank account balance | The platform wallet (fee) balance |
| **Quick Links** | Beneficiary, Reports, All Transactions | Whitelisting |
| **Purpose** | Reference only | Required to actually perform transactions |

**Testing implication:** a merchant can have a large Bank Widget balance and still be unable to
transact because the Ledger is empty — this is a common source of confused support tickets and
deserves explicit UI-copy and empty-state test coverage, not just "does the number display
correctly."

## Wallet (Ledger) Recharge Flow — Whitelisted vs. Non-Whitelisted

```mermaid
flowchart TD
    Start["🧑 Merchant initiates a Ledger top-up"] --> Check{"Account whitelisted?"}
    Check -->|Yes| Instant["✅ Funds added to wallet INSTANTLY"]
    Check -->|No| Pending["⏳ Transaction enters PENDING state"]
    Pending --> Support["Merchant contacts Support"]
    Support --> Review["🛡️ Admin reviews the Pending IRN -><br/>three-dot action menu -> Status Update"]
    Review -->|Approve| Credit["✅ Funds credited to Ledger"]
    Review -->|Cancel| Reject["❌ Top-up rejected, merchant notified"]

    classDef gate fill:#4a148c,color:#fff,stroke:#ab47bc,stroke-width:1px
    classDef good fill:#1b5e20,color:#fff,stroke:#43a047,stroke-width:1px
    classDef warn fill:#e65100,color:#fff,stroke:#fb8c00,stroke-width:1px
    classDef bad fill:#b71c1c,color:#fff,stroke:#e53935,stroke-width:1px

    class Check,Review gate
    class Instant,Credit good
    class Pending warn
    class Reject bad
```

**Testing implication:** a Pending recharge must be a first-class, trackable state — it should
never look identical to a failed or a successful recharge in the UI, since the merchant's next
action (wait vs. contact support vs. retry) depends entirely on correctly recognizing which
state they're in. [`sample-defect-report.md`](../sample-defect-report.md) Defect #5 is exactly
this guarantee failing — see the sequence below for the actual mechanism.

## The Real Mechanism Behind Defect #4 — Consent Revocation as a Cache-Invalidation Race

```mermaid
sequenceDiagram
    participant Business as 🧑 Business
    participant ConsentSvc as Consent Management Service
    participant Cache as ⚠️ Access-Check Cache
    participant TxnAPI as Transaction Query API

    Business->>ConsentSvc: Revokes consent for Account X
    ConsentSvc->>ConsentSvc: Consent status updated to REVOKED (authoritative)
    rect rgb(183, 28, 28)
    Note over Cache: Cache still holds the OLD "ACTIVE" value —<br/>only refreshed on its own background cycle<br/>(this IS Defect #4's actual root cause)
    Business->>TxnAPI: Queries transactions for Account X (seconds later)
    TxnAPI->>Cache: Checks cached consent status
    Cache-->>TxnAPI: "ACTIVE" — WRONG, stale
    TxnAPI-->>Business: Data returned — a real ~90-second unauthorized-access window
    end
```

**Why "eventually consistent" is the wrong model for a security boundary specifically:** a
background cache-refresh cycle is a completely reasonable pattern for data where a few seconds
of staleness is harmless. Consent is not that kind of data — per
[`sample-defect-report.md`](../sample-defect-report.md), "consent is a security boundary, not a
soft preference," and the fix is exactly what that distinction implies: either invalidate the
cache synchronously on revocation, or skip the cache entirely for this specific check and query
consent status directly. The ~90-second window in this defect is the gap between "the system of
record changed" and "every reader of that data found out" — caused here by caching rather than
by request timing, but the lesson is the same either way: a security-relevant revocation has to
propagate before anything is allowed to act as if it hadn't happened.

## Fee Wallet Flow (Fee Deduction on Transactions)

```mermaid
flowchart TD
    Cust["🏦 Customer's Own Bank Account<br/>funds never touched by the platform for fees"] --> Txn["💳 Transaction Processed"]
    Txn --> Check{"👛 Fee Wallet has sufficient balance?"}
    Check -->|Yes| Deduct["✅ Fee + GST deducted from wallet"]
    Check -->|No| Block["❌ Transaction blocked BEFORE processing"]

    classDef service fill:#004d40,color:#fff,stroke:#26a69a,stroke-width:1px
    classDef gate fill:#4a148c,color:#fff,stroke:#ab47bc,stroke-width:1px
    classDef good fill:#1b5e20,color:#fff,stroke:#43a047,stroke-width:1px
    classDef bad fill:#b71c1c,color:#fff,stroke:#e53935,stroke-width:1px

    class Cust,Txn service
    class Check gate
    class Deduct good
    class Block bad
```

**Testing implication:** the fee check and the transaction itself are two separate systems of
record (customer's bank balance vs. platform's fee wallet balance). A common defect pattern in
this category of product is these two checks becoming inconsistent — e.g. a transaction
succeeding on the bank side while fee deduction silently fails, or the reverse.

## Commercial Slab Boundary Map (Illustrative)

| Slab | Range | Fee |
|---|---|---|
| A | ₹0 – ₹1,000 | X |
| B | ₹1,001 – ₹25,000 | Y |
| C | ₹25,001 – ₹1,00,000 | Z |

Boundary values (₹1,000 vs. ₹1,001, ₹25,000 vs. ₹25,001) are the highest-value test points —
[`sample-defect-report.md`](../sample-defect-report.md) Defect #2 is exactly an off-by-one at the
₹25,000/₹25,001 boundary, where a `<` instead of `<=` comparison let both amounts fall into the
same (wrong, for one of them) slab.

## System Interaction Map

```mermaid
flowchart TD
    Business(["🧑 Business — self-serve onboarding"]) --> CBP["Connected Banking Platform<br/>(API + UI)"]
    CBP --> Bank["🏦 Bank<br/>via DSP-whitelisted API"]
    CBP --> CommE["Commercial / Fee Engine"]
    CommE --> Wallet["👛 Fee Wallet"]

    classDef person fill:#1a237e,color:#fff,stroke:#5c6bc0,stroke-width:1px
    classDef service fill:#004d40,color:#fff,stroke:#26a69a,stroke-width:1px

    class Business person
    class CBP,Bank,CommE,Wallet service
```

---

See [`load-testing-report.md`](../load-testing-report.md) for the real, executed load test
behind this architecture's throughput and latency characteristics (405,067 transactions, ~80.2
TPS sustained, 0.001% error rate) — those are genuine results, not an illustrative figure like
the slab map above.
