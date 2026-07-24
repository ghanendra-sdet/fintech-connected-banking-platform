# Connected Banking — Architecture & Flow

> This is the internal, system-level "Tech Flow" view. For the non-technical, step-by-step
> merchant/admin walkthrough this diagram is based on, see
> [`user-guide-activate-connected-banking.md`](./user-guide-activate-connected-banking.md). For
> the customer/business-facing journey, see [`business-flow.md`](./business-flow.md). For the
> service-level (microservice) view, see [`service-architecture.md`](./service-architecture.md).
> See [`README.md`](./README.md) for the full documentation map.

## Full Onboarding-to-Transaction Flow

```
┌────────────────┐     ┌──────────────────┐     ┌────────────────────┐
│ Website Signup │────▶│ Self-Service eKYC │────▶│ Add Bank Account   │
└────────────────┘     │  (auto-approved)  │     │ (acct#, IFSC, name)│
                        └───────────────────┘     └──────────┬──────────┘
                                                              │
                                                              ▼
                                              ┌───────────────────────────┐
                                              │  Bank Whitelisting (DSP)  │  ◀── Manual,
                                              │  business-initiated,      │      bank-side
                                              │  bank-side approval       │      approval
                                              └──────────────┬─────────────┘
                                                              │
                                                              ▼
                                              ┌───────────────────────────┐
                                              │  Balance Verification     │
                                              │  (instant once whitelisted)│
                                              └──────────────┬─────────────┘
                                                              │
                                                              ▼
                                              ┌───────────────────────────┐
                                              │ Transactions via API /    │
                                              │ Dashboard                 │
                                              └───────────────────────────┘
```

## Onboarding State Machine (Testing View)

```
SIGNED_UP ──▶ EKYC_COMPLETE ──▶ ACCOUNT_ADDED ──▶ WHITELIST_PENDING ──┬──▶ WHITELIST_ACTIVE ──▶ TRANSACTING
                                                                       └──▶ WHITELIST_FAILED
```

- **WHITELIST_PENDING** is the highest-risk state to test — it can persist for an unpredictable
  amount of time since it depends on external bank action
- Any transaction attempt while `WHITELIST_PENDING` or `WHITELIST_FAILED` must be blocked with a
  clear error, not silently queued or dropped

## Admin Activation Flow (Real, Detailed — Pre-Merchant-Onboarding Setup)

This is the concrete admin-side sequence that must complete *before* a merchant ever sees a
"Connect Now" button — captured from an actual activation SOP walkthrough, not a generic guess.

```
Admin: Settings → Connected Banking → confirm merchant appears in All Merchants list
        │
        ▼
Admin: Check merchant status — Active / Inactive / Not Subscribed
        │  (filter view available to isolate "Not Subscribed" merchants)
        ▼
Admin: Activate merchant (first-time) via row action menu
        │  status indicator: yellow (Not Subscribed) → green (Active)
        ▼
Admin: Open Merchant Profile → Service Management → Connected Banking
        │
        ▼
Admin: Add Commercial → select Channel → VA Number auto-assigned → set Whitelisting toggle
        │
        ▼
Admin: Create Bank Rule → Select Bank, Account Number, IFSC Code, Daily Limit (all mandatory)
        │  ⚠️ these exact values must be re-entered identically by the merchant later —
        │     the single most common activation failure point
        ▼
Admin: Add Commercial Rule → Payment Mode(s) (IMPS/NEFT/RTGS) → Charge Type (Flat/%) →
        fee values → per-transaction min/max limits → Submit
        │
        ▼
Admin: Verify commercials created successfully — merchant can now proceed
```

**Testing implication:** every one of the "all mandatory" fields in Create Bank Rule and Add
Commercial Rule needs an explicit negative test (missing field, invalid IFSC format, daily
limit of zero, min > max on per-transaction limits) — none of this is optional/soft-validated
per the SOP's own "⚠️ critical" framing.

## Merchant Self-Service Connect Flow (Real, Detailed)

```
Merchant sees: "Connected Banking isn't activated on your account yet. Contact support."
        │  (this message persists until Admin's activation flow above completes)
        ▼
Merchant sees: "Connect Now" button appears (only after Admin adds commercials)
        │
        ▼
Merchant clicks Connect Now → popup: "Yes, I have an account" / "No, open a new account" / Cancel
        │
        ├──▶ "No, open a new account" ──▶ redirected to the bank's own site (external, out of scope)
        │
        ▼
"Yes, I have an account" ──▶ enter Account Number, Confirm Account Number, IFSC Code
        │
        │  ⚠️ MUST exactly match what Admin entered in Create Bank Rule — any mismatch fails here
        ▼
Click Verify ──▶ shows verified details + Account Type (defaults "Current Account")
        │
        ▼
Click Continue ──▶ Terms & Conditions page
        │
        │  4 mandatory checkboxes: Account Aggregation, Data Sharing Permissions,
        │  Transaction Monitoring Agreement, Digital Consent with Timestamp
        │  Submit button stays disabled until ALL 4 are checked
        ▼
Click Submit ──▶ confirmation screen showing synced balance from the linked bank account
        │
        ▼
Click View Dashboard ──▶ redirected to the live Connected Banking Dashboard
```

**Testing implication:** the account-number/IFSC match check (merchant-entered vs. admin-entered)
is the highest-value negative test in this entire flow — the real product surfaces this as an
inline "Account numbers do not match" validation error, which needs its own dedicated test
rather than being assumed to work because the happy path does.

## Dashboard: Two Distinct Balances (Bank Widget vs. Ledger Widget)

A completed Connect Flow lands the merchant on a dashboard with **two separate balance widgets**
that are easy to conflate but serve entirely different purposes:

```
┌─────────────────────────┐          ┌─────────────────────────┐
│      Bank Widget         │          │      Ledger Widget       │
│  (e.g. "Northbridge Bank")│          │                          │
│                           │          │                          │
│  Shows: actual linked     │          │  Shows: platform wallet  │
│  bank account balance     │          │  balance                 │
│                           │          │                          │
│  Quick Links: Beneficiary,│          │  Quick Links: Whitelisting│
│  Reports, All Transactions│          │                          │
└─────────────────────────┘          └─────────────────────────┘
        Reference only                  Required to actually
                                         perform transactions
```

**Testing implication:** a merchant can have a large Bank Widget balance and still be unable to
transact because the Ledger is empty — this is a common source of confused support tickets and
deserves explicit UI-copy and empty-state test coverage, not just "does the number display
correctly."

## Wallet (Ledger) Recharge Flow — Whitelisted vs. Non-Whitelisted

```
Merchant initiates a Ledger top-up
        │
        ├──▶ Account IS whitelisted ──▶ Funds added to wallet INSTANTLY
        │
        └──▶ Account is NOT whitelisted ──▶ Transaction enters PENDING state
                        │
                        ▼
                 Merchant contacts Support
                        │
                        ▼
                 Admin reviews the Pending IRN → three-dot action menu →
                 Status Update → Approve or Cancel
                        │
                        ├──▶ Approve ──▶ Funds credited to Ledger
                        └──▶ Cancel  ──▶ Top-up rejected, merchant notified
```

**Testing implication:** a Pending recharge must be a first-class, trackable state — it should
never look identical to a failed or a successful recharge in the UI, since the merchant's next
action (wait vs. contact support vs. retry) depends entirely on correctly recognizing which
state they're in.

## Fee Wallet Flow (Fee Deduction on Transactions)

```
                     ┌─────────────────────────────┐
                     │  Customer's Own Bank Account │
                     │  (funds never touched by     │
                     │   the platform for fees)     │
                     └───────────────┬───────────────┘
                                     │  transaction amount
                                     ▼
                        ┌─────────────────────────┐
                        │  Transaction Processed   │
                        └────────────┬──────────────┘
                                     │
                     ┌───────────────┴────────────────┐
                     │                                 │
                     ▼                                 ▼
       ┌───────────────────────────┐     ┌───────────────────────────┐
       │  Fee Wallet has sufficient │     │  Fee Wallet balance too   │
       │  balance → fee + GST       │     │  low → transaction        │
       │  deducted from wallet      │     │  blocked before processing│
       └───────────────────────────┘     └───────────────────────────┘
```

**Testing implication:** the fee check and the transaction itself are two separate systems of
record (customer's bank balance vs. platform's fee wallet balance). A common defect pattern in
this category of product is these two checks becoming inconsistent — e.g. a transaction
succeeding on the bank side while fee deduction silently fails, or the reverse. Per the real
product flow above, this is called the **Ledger**, and fee deduction happens after the transfer
either succeeds or fails — both outcomes trigger a commercial deduction per the SOP.

## Commercial Slab Boundary Map (Illustrative)

```
₹0 ─────────── ₹1,000 ─────────── ₹25,000 ─────────── ₹1,00,000
     Slab A         Slab B              Slab C
     (Fee: X)        (Fee: Y)            (Fee: Z)
```

Boundary values (₹1,000 vs. ₹1,001, ₹25,000 vs. ₹25,001) are the highest-value test points —
off-by-one slab errors directly affect billing accuracy.

## System Interaction Map

```
  ┌──────────────┐        ┌────────────────────────┐        ┌──────────────────┐
  │   Business    │──────▶│  Connected Banking       │──────▶│  Bank (via DSP    │
  │  (self-serve  │       │  Platform (API + UI)     │       │  whitelisted API) │
  │   onboarding) │       └──────────┬────────────────┘       └──────────────────┘
  └──────────────┘                  │
                                     ▼
                        ┌─────────────────────────┐
                        │  Commercial / Fee Engine │
                        └────────────┬──────────────┘
                                     │
                                     ▼
                        ┌─────────────────────────┐
                        │      Fee Wallet          │
                        └─────────────────────────┘
```
