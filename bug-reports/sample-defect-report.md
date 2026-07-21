# Sample Defect Report — Connected Banking

> Template + worked examples using dummy data. Reflects defect themes commonly found in
> Connected Banking regression: whitelisting state inconsistency, fee wallet edge cases, and
> commercial slab boundary errors.

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

