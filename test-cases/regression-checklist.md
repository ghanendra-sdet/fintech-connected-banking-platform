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

## 6. Full Regression Checklist

- [ ] Signup & eKYC
- [ ] Add Bank Account (valid/invalid data)
- [ ] Bank Whitelisting status propagation
- [ ] Balance Verification
- [ ] Transaction Initiation
- [ ] Transaction Status Polling
- [ ] Fee Wallet Deduction
- [ ] Insufficient Wallet Balance Handling
- [ ] Commercial Slab Boundaries
- [ ] Transaction Limits (daily cap, TPS, count)
- [ ] Dashboard — Balance & Transaction Reporting

## 7. Priority Automation Candidates

1. Signup & eKYC completion
2. Add bank account (valid / invalid)
3. Whitelisting status propagation to dashboard
4. Balance verification post-whitelisting
5. Transaction initiation and status polling
6. Fee wallet deduction / insufficient-balance blocking

See [`automation/`](../automation) for the Playwright implementation.
