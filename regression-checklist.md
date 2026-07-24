# Connected Banking — Regression Checklist & Test Cases

> Sample regression suite structure with dummy data. Format: ID | Scenario | Steps | Expected Result

## 1. Onboarding & eKYC

| ID | Scenario | Steps | Expected Result |
|---|---|---|---|
| TC-001 | Signup with valid details | 1. Go to signup 2. Enter dummy business details 3. Submit | Account created, eKYC step triggered |
| TC-002 | eKYC auto-approval | 1. Complete eKYC with valid dummy ID data | eKYC status becomes APPROVED automatically, no manual step |
| TC-003 | eKYC with invalid data | 1. Submit eKYC with an intentionally invalid dummy document | eKYC rejected with a clear reason, user can retry |
| TC-004 | Add bank account — valid | 1. Enter dummy account number + valid IFSC + company name | Account added, status = WHITELIST_PENDING |
| TC-005 | Add bank account — invalid IFSC | 1. Enter a malformed IFSC | Validation error shown, account not added |
| TC-006 | Add bank account — penny drop failure | 1. Use a dummy account number that fails penny drop validation | Account addition blocked with a clear reason |

## 2. Bank Whitelisting (State Machine)

| ID | Scenario | Steps | Expected Result |
|---|---|---|---|
| TC-007 | Whitelisting pending state visible | 1. Add a bank account 2. View dashboard | Status clearly shows "Pending Whitelisting", not a generic/blank state |
| TC-008 | Transaction blocked while pending | 1. Attempt a transaction while status = WHITELIST_PENDING | Transaction is blocked with a clear error, not silently queued |
| TC-009 | Whitelisting completes → balance appears | 1. Simulate whitelist completion (test env) 2. Refresh dashboard | Balance appears instantly, status becomes ACTIVE |
| TC-010 | Whitelisting failure handling | 1. Simulate a whitelist failure response | Status becomes WHITELIST_FAILED, user sees a clear next step |

## 3. Transactions

| ID | Scenario | Steps | Expected Result |
|---|---|---|---|
| TC-011 | Initiate transaction — happy path | 1. With an ACTIVE account and sufficient fee wallet balance, initiate a dummy ₹500 transaction | Transaction succeeds, status transitions correctly |
| TC-012 | Transaction status polling | 1. Initiate a transaction 2. Poll status endpoint | Status accurately reflects current transaction state at each poll |
| TC-013 | Daily transaction cap enforcement | 1. Simulate reaching the daily transaction cap (test env) 2. Attempt one more transaction | Transaction blocked with a clear limit-exceeded error |
| TC-014 | TPS limit enforcement | 1. Fire transactions above the configured TPS limit (test env) | Excess requests are throttled/rejected gracefully, not silently dropped |

## 4. Fee Wallet Validation

| ID | Scenario | Steps | Expected Result |
|---|---|---|---|
| TC-015 | Sufficient wallet balance | 1. Preload wallet with enough for the fee 2. Initiate transaction | Fee deducted correctly, transaction proceeds |
| TC-016 | Insufficient wallet balance | 1. Wallet balance below required fee 2. Attempt transaction | Transaction blocked *before* hitting the bank, wallet balance unchanged |
| TC-017 | Wallet cannot be withdrawn | 1. Attempt to withdraw/transfer out of the fee wallet | Action is not permitted — wallet is fee-only by design |
| TC-018 | Fee + GST calculation accuracy | 1. Transaction fee ₹6, GST 18% | Total deducted = ₹7.08, matches displayed breakdown exactly |

## 5. Commercial Slab Boundary Testing

| ID | Scenario | Steps | Expected Result |
|---|---|---|---|
| TC-019 | Slab boundary — exactly ₹1,000 | 1. Initiate a transaction of exactly ₹1,000 | Slab A fee applied |
| TC-020 | Slab boundary — ₹1,001 | 1. Initiate a transaction of ₹1,001 | Slab B fee applied (not Slab A) |
| TC-021 | Slab boundary — ₹25,000 vs ₹25,001 | 1. Test both values | Correct slab fee applied at each side of the boundary |

## 6. Multi-Account Linking

> Closes gaps flagged in [`docs/feature-modules.md`](./docs/feature-modules.md) — derived from
> [`docs/business-flow.md`](./docs/business-flow.md).

| ID | Scenario | Steps | Expected Result |
|---|---|---|---|
| TC-022 | Link a second bank account | 1. With Account A already ACTIVE, link a dummy Account B | Account B enters its own independent WHITELIST_PENDING cycle |
| TC-023 | Second account linking doesn't affect the first | 1. During Account B's verification, check Account A | Account A's status, balance, and transaction history remain completely unchanged |
| TC-024 | Dashboard aggregates both accounts correctly | 1. Once both accounts are ACTIVE, view the dashboard | Combined/account-scoped views (per product design) correctly reflect both accounts, no data merged incorrectly |
| TC-025 | Transaction search scoped to the correct account | 1. Search transactions while Account B is selected | Only Account B's transactions appear — never mixed with Account A's |

## 7. Transaction & Reporting Reconciliation

| ID | Scenario | Steps | Expected Result |
|---|---|---|---|
| TC-026 | Credits filter excludes debits | 1. Apply a Credits-only filter on a mixed dummy transaction set | Zero debit entries appear in the filtered results |
| TC-027 | Debits filter excludes credits | 1. Apply a Debits-only filter | Zero credit entries appear |
| TC-028 | Mini Statement matches full Transactions view | 1. Generate a Mini Statement for a date range 2. Compare totals to the full Transactions view for the same range | Totals match exactly — no drift between the two code paths |
| TC-029 | Cross-report consistency | 1. Generate Account Report, Banking Report, and Transaction Report for the same date range | All three report the same underlying totals — any mismatch is reportable even before knowing which report is wrong |
| TC-030 | Export format validation — CSV | 1. Download a Transaction Report as CSV | File opens correctly, totals match on-screen data |
| TC-031 | Export format validation — PDF | 1. Download the same report as PDF | Renders correctly, totals match the CSV export |

## 8. Consent Management (Security-Critical)

| ID | Scenario | Steps | Expected Result |
|---|---|---|---|
| TC-032 | Consent active — data accessible | 1. With consent ACTIVE, query transactions/balance | Data returned normally |
| TC-033 | Consent revoked — access cut off immediately | 1. Revoke consent for a dummy account 2. Immediately attempt to query transactions/balance | Access is denied **immediately** — not after a cache expiry or next scheduled sync |
| TC-034 | Revoked consent blocks new transactions | 1. With consent revoked, attempt to initiate a transaction | Blocked with a clear consent-required error |

## 9. Admin Activation & Commercial Setup

> Derived from the real activation SOP — see
> [`docs/user-guide-activate-connected-banking.md`](./docs/user-guide-activate-connected-banking.md)
> and [`docs/architecture-and-flow.md`](./docs/architecture-and-flow.md).

| ID | Scenario | Steps | Expected Result |
|---|---|---|---|
| TC-035 | Filter merchant list by "Not Subscribed" | 1. Go to Admin → Settings → Connected Banking 2. Apply the "Not Subscribed" filter | Only merchants never activated for Connected Banking are shown |
| TC-036 | Activate a Not Subscribed merchant | 1. Select a dummy Not Subscribed merchant 2. Activate via the action menu | Status indicator changes from yellow to green (Active) |
| TC-037 | Create Bank Rule — missing mandatory field | 1. Open Create Bank Rule 2. Leave IFSC Code blank 3. Attempt to proceed | Blocked with a clear "required field" error; cannot proceed to the next step |
| TC-038 | Create Bank Rule — invalid IFSC format | 1. Enter a malformed dummy IFSC | Validation error shown before the rule can be saved |
| TC-039 | Add Commercial Rule — per-transaction min greater than max | 1. Enter a minimum transaction limit greater than the maximum | Blocked with a clear validation error |
| TC-040 | Add Commercial Rule — no payment mode selected | 1. Attempt to submit without selecting IMPS/NEFT/RTGS | Submit blocked — at least one mode must be selected |
| TC-041 | Commercial creation confirmation | 1. Complete Create Bank Rule + Add Commercial Rule with valid dummy data | "Bank rule created successfully" confirmation shown, commercial appears in the merchant's Connected Banking configuration list |

## 10. Merchant Connect Flow Validation

| ID | Scenario | Steps | Expected Result |
|---|---|---|---|
| TC-042 | Connect Now hidden until Admin setup complete | 1. As a dummy merchant with no commercial configured yet, view Connected Banking | "Contact support" message shown — no Connect Now button |
| TC-043 | Connect Now appears after Admin setup | 1. Complete Admin setup (TC-041) 2. Refresh the merchant's Connected Banking page | "Connect Now" button is now visible |
| TC-044 | Account number mismatch blocks verification | 1. Click Connect Now → "Yes, I have an account" 2. Enter an account number that does NOT match what Admin configured | Clear "Account numbers do not match" (or equivalent) error — verification blocked |
| TC-045 | Confirm Account Number field must match Account Number | 1. Enter different values in Account Number and Confirm Account Number | Inline mismatch error shown before Verify can be submitted |
| TC-046 | Terms & Conditions — Submit disabled until all 4 checked | 1. Reach the Terms & Conditions screen 2. Check only 3 of the 4 boxes | Submit button remains disabled/hidden |
| TC-047 | Terms & Conditions — Submit enabled once all 4 checked | 1. Check all 4 boxes | Submit becomes available; submitting proceeds to the synced-balance confirmation screen |
| TC-048 | "No, open a new account" redirects externally | 1. Click Connect Now → "No, open a new account" | Redirected to the bank's own site in a new tab; Connected Banking Connect Flow is not affected/left in a broken state |

## 11. Wallet Recharge, Beneficiary & Transfer

| ID | Scenario | Steps | Expected Result |
|---|---|---|---|
| TC-049 | Ledger recharge from a whitelisted account | 1. Recharge the Ledger from a whitelisted dummy account | Funds credited instantly, no Pending state |
| TC-050 | Ledger recharge from a non-whitelisted account | 1. Recharge the Ledger from a non-whitelisted dummy account | Recharge enters a distinct PENDING state, clearly distinguishable from success/failure in the UI |
| TC-051 | Admin approves a Pending recharge | 1. As Admin, open the Pending IRN 2. Status Update → Approve | Funds credited to the merchant's Ledger, status updates from Pending |
| TC-052 | Admin cancels a Pending recharge | 1. As Admin, open the Pending IRN 2. Status Update → Cancel | Recharge rejected, merchant notified, Ledger unchanged |
| TC-053 | Bank Widget balance vs. Ledger Widget balance are independent | 1. Note the Bank Widget balance 2. Recharge and spend from the Ledger | Bank Widget balance is unaffected by Ledger activity — they track different things |
| TC-054 | Add beneficiary — valid details | 1. Enter dummy Account Number, Confirm Account Number, IFSC, Beneficiary Name, Bank Name 2. Verify | Beneficiary saved, selectable in future transfers |
| TC-055 | Add beneficiary — account number mismatch | 1. Enter different values in Account Number and Confirm Account Number | Blocked with a clear mismatch error |
| TC-056 | Transfer — payment mode availability reflects commercial config | 1. As a merchant whose Admin only enabled IMPS (TC-040-adjacent setup) 2. Open the Transfer popup | Only IMPS is selectable; NEFT/RTGS are disabled or hidden |
| TC-057 | Transfer — review screen matches entered details exactly | 1. Fill the Transfer popup 2. Proceed to Review & Confirm | Amount, beneficiary, and mode shown on the review screen exactly match what was entered |
| TC-058 | Transfer — fee deducted regardless of transaction outcome | 1. Send a transfer that succeeds 2. Send a transfer that fails (simulated, test env) | Applicable commercial fee is deducted from the Ledger in both cases, per the defined fee rule |

## 12. UI Consistency

> Derived from [`docs/ui-consistency.md`](./docs/ui-consistency.md) — cross-screen consistency,
> not single-screen correctness.

| ID | Scenario | Steps | Expected Result |
|---|---|---|---|
| TC-059 | Bank Widget vs. Ledger Widget always labeled | 1. View the dashboard after Connect Flow completes | Both widgets carry clear, distinct labels — never a bare unlabeled number |
| TC-060 | Pending recharge visually distinct from Failed | 1. Trigger a non-whitelisted wallet recharge (Pending) 2. Compare against a genuinely Failed transaction | Different color/label — never overlapping (see [`sample-defect-report.md`](./sample-defect-report.md)) |
| TC-061 | Currency formatting consistency | 1. View the same amount on Dashboard, Mini Statement, and an exported Report | Decimal places, thousands separator, and ₹ placement match exactly |
| TC-062 | Terminology consistency: Ledger vs. Wallet | 1. Compare labels referring to the platform balance across Dashboard, Quick Links, and Reports | Identical terminology used everywhere — no "Wallet" in one place and "Ledger" in another |
| TC-063 | "Account numbers do not match" error consistency | 1. Trigger the mismatch error at Account Number field 2. Trigger it at Confirm Account Number field | Identical error wording regardless of which field triggered it |
| TC-064 | Terms & Conditions shows which checkboxes are unchecked | 1. Check 2 of 4 boxes 2. Attempt to identify what's missing from the UI alone | Clear indication of which specific checkboxes remain, not just a disabled Submit button |
| TC-065 | Status badges distinguishable without color | 1. View Active/Pending Whitelisting/Failed badges with color/grayscale rendering simulated | Each remains distinguishable via icon/text label alone |

## 13. Full Regression Checklist

- [ ] Signup & eKYC
- [ ] Add Bank Account (valid/invalid data)
- [ ] Bank Whitelisting status propagation
- [ ] Balance Verification
- [ ] Multi-Account Linking (independent lifecycle, dashboard aggregation, search scoping)
- [ ] Transaction Initiation
- [ ] Transaction Status Polling
- [ ] Credits/Debits Filter Isolation
- [ ] Mini Statement vs. Transactions Reconciliation
- [ ] Cross-Report Consistency (Account / Banking / Transaction Reports)
- [ ] Export Format Validation (CSV / PDF)
- [ ] Consent Management (grant / revoke / immediate access cutoff)
- [ ] Fee Wallet Deduction
- [ ] Insufficient Wallet Balance Handling
- [ ] Commercial Slab Boundaries
- [ ] Transaction Limits (daily cap, TPS, count)
- [ ] Dashboard — Balance & Transaction Reporting
- [ ] Admin Activation & Commercial Setup (mandatory field validation)
- [ ] Merchant Connect Flow (account match validation, T&C gate)
- [ ] Wallet Recharge (whitelisted instant / non-whitelisted Pending+Approval)
- [ ] Beneficiary Add & Verification
- [ ] Transfer (mode availability, review accuracy, fee deduction)
- [ ] UI Consistency (widget labeling, status badges, formatting, terminology, accessibility)

## 14. Priority Automation Candidates

1. Signup & eKYC completion
2. Add bank account (valid / invalid)
3. Whitelisting status propagation to dashboard
4. Balance verification post-whitelisting
5. Transaction initiation and status polling
6. Fee wallet deduction / insufficient-balance blocking

Consent revocation immediacy (TC-033) and Mini Statement reconciliation (TC-028) are the next
priority tier for automation, given their security and financial-reporting impact — currently
documented as manual test cases only.

See [`automation/`](./automation) for the Playwright implementation.
