# Connected Banking — Architecture & Flow

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

## Fee Wallet Flow

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
succeeding on the bank side while fee deduction silently fails, or the reverse.

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
