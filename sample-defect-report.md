# Sample Defect Report — Connected Banking

> Template + worked examples using dummy data. Reflects defect themes commonly found in
> Connected Banking regression. Several defects below map to flows in
> [`docs/business-flow.md`](./docs/business-flow.md) and the real activation SOP in
> [`docs/user-guide-activate-connected-banking.md`](./docs/user-guide-activate-connected-banking.md)
> — see [`docs/README.md`](./docs/README.md) for the full documentation map.

## Defect Theme Taxonomy

Recurring defect themes tracked for this module:

- Whitelisting state inconsistency
- Fee wallet edge cases
- Commercial slab boundary errors
- Cross-account data leakage (multi-account isolation)
- Report/reconciliation drift (platform vs. bank, or report vs. report)
- Consent management timing issues
- API validation defects
- Dashboard issues
- Export/download issues
- Search/filter issues

**Severity categories used:** Minor, Major, Critical, Blocker.

---

## Defect #1

| Field | Value |
|---|---|
| **ID** | BUG-CB-2031 (sample) |
| **Title** | Transaction succeeds despite account status showing "Pending Whitelisting" |
| **Severity** | Critical |
| **Module** | Connected Banking → Onboarding / Transactions |
| **Environment** | UAT (dummy data) |

**Steps to Reproduce**
1. Add a dummy bank account, leaving whitelisting status as PENDING
2. Immediately attempt a transaction via the API (not the UI)
3. Observe the response

**Expected Result**
The transaction should be rejected with a clear "Bank not yet whitelisted" error — the API layer
should enforce the same state check as the UI.

**Actual Result**
The API accepts the transaction request and it proceeds to a bank adapter call, which then fails
downstream with an unrelated generic error, rather than being blocked upfront with a clear reason.

**Impact**
Confusing failure mode for API-integrating businesses (the primary user of this product) — they
see a generic downstream error instead of an actionable "whitelist your bank first" message. Also
risks unnecessary load on the bank adapter layer for requests that should never have been sent.

**Suggested Fix**
Enforce the whitelisting state check at the API gateway/service layer, not only in the UI, so both
entry points behave consistently.

---

## Defect #2

| Field | Value |
|---|---|
| **ID** | BUG-CB-2058 (sample) |
| **Title** | Commercial slab boundary off-by-one at ₹25,000 |
| **Severity** | Major |
| **Module** | Connected Banking → Commercial / Fee Engine |
| **Environment** | UAT (dummy data) |

**Steps to Reproduce**
1. Initiate a transaction of exactly ₹25,000 (upper boundary of the middle slab)
2. Check the fee applied
3. Initiate a transaction of ₹25,001 (lower boundary of the next slab)
4. Compare fees

**Expected Result**
₹25,000 should be charged at the middle slab's fee; ₹25,001 should be charged at the next slab's
(higher) fee — a clean boundary with no overlap or gap.

**Actual Result**
Both ₹25,000 and ₹25,001 are charged the middle slab's fee — the boundary condition uses `<`
instead of `<=` in the slab lookup, off by one transaction amount unit.

**Impact**
Under-billing at the boundary — small per-transaction impact, but compounds at scale and is a
data-integrity issue for financial reporting.

**Suggested Fix**
Correct the slab boundary comparison operator and add explicit boundary-value unit tests for
every slab transition.

---

## Defect #3

| Field | Value |
|---|---|
| **ID** | BUG-CB-2073 (sample) |
| **Title** | Mini Statement total doesn't match the full Transactions view for the same date range |
| **Severity** | Major |
| **Module** | Connected Banking → Mini Statement / Transactions |
| **Environment** | UAT (dummy data) |

**Steps to Reproduce**
1. Generate a Mini Statement for a dummy account, date range = last 7 days
2. Independently sum the same 7 days in the full Transactions view

**Expected Result**
Both totals should be identical — the Mini Statement is meant to be a shorter *view* of the same
underlying data, not a separately-computed one.

**Actual Result**
Mini Statement total is ₹340 lower. Investigation shows the Mini Statement service excludes
transactions still in a `PENDING` bank-confirmation state, while the full Transactions view
includes them — an undocumented behavioral difference between the two code paths.

**Impact**
A business reconciling their own books against the Mini Statement (a common use case, since it's
the "quick view") would see a number that doesn't match the platform's own full transaction data
— confusing and erodes trust in either view being authoritative.

**Suggested Fix**
Either make both views apply the same inclusion rule for pending transactions, or clearly label
the Mini Statement's totals as "confirmed only" so the difference is intentional and visible,
not a silent discrepancy.

---

## Defect #4

| Field | Value |
|---|---|
| **ID** | BUG-CB-2089 (sample) |
| **Title** | Revoked consent still allows transaction data access for ~90 seconds |
| **Severity** | Critical |
| **Module** | Connected Banking → Consent Management |
| **Environment** | UAT (dummy data) |

**Steps to Reproduce**
1. With consent ACTIVE for a dummy account, note that transaction queries succeed
2. Revoke consent for that account
3. Immediately (within 1–2 minutes) query transactions again

**Expected Result**
Access should be denied immediately upon revocation — consent is a security boundary, not a
soft preference.

**Actual Result**
Transaction queries continue to succeed for approximately 90 seconds after revocation, because
the Consent Management Service's revocation event is only picked up by a background cache
refresh cycle rather than invalidating access synchronously.

**Impact**
A real unauthorized-access window — data continues to be accessible after the business
explicitly withdrew permission for it. This is a compliance-relevant defect, not just a
functional one.

**Suggested Fix**
Consent revocation should synchronously invalidate any cached consent-check state (or the
access-check should query consent status directly rather than trusting a cache), closing the
window to effectively zero.

---

## Defect #5

| Field | Value |
|---|---|
| **ID** | BUG-CB-2104 (sample) |
| **Title** | Pending wallet recharge (non-whitelisted account) is visually identical to a failed recharge |
| **Severity** | Major |
| **Module** | Connected Banking → Wallet / Ledger Recharge |
| **Environment** | UAT (dummy data) |

**Steps to Reproduce**
1. Recharge the Ledger from a dummy non-whitelisted bank account
2. Observe the transaction status in the Recent Transactions list

**Expected Result**
A recharge awaiting Admin approval should show a clearly distinct **Pending** status — visually
and textually different from a failed transaction (per the real activation flow's Pending →
Admin Approve/Cancel design).

**Actual Result**
The recharge shows a red "Failed" badge identical in styling to genuinely failed transactions.
The item is, in fact, sitting in the Admin's Pending approval queue and will succeed once
approved — but nothing in the merchant-facing UI indicates that.

**Impact**
Merchants seeing a "Failed" badge reasonably conclude the recharge didn't work and may retry
it, attempt to recharge again, or contact support unnecessarily — all while the original
recharge is still pending and could later succeed, risking a double-recharge if the merchant
retries and both eventually get approved.

**Suggested Fix**
Give Pending recharges awaiting Admin approval their own distinct status badge/color (e.g.
amber, "Pending Approval") — never overlapping visually or textually with a genuinely failed
transaction.

---

## Defect Reporting Template (blank)

| Field | Value |
|---|---|
| **ID** | |
| **Title** | |
| **Severity** | Minor / Major / Critical / Blocker |
| **Module** | |
| **Environment** | |

**Steps to Reproduce**
1.
2.
3.

**Expected Result**


**Actual Result**


**Impact**


**Suggested Fix**

