# Connected Banking — UI Consistency

> The same account/transaction data surfaces across the Dashboard, Bank Widget, Ledger Widget,
> Transaction views, Mini Statement, and Reports (see [`feature-modules.md`](./feature-modules.md)).
> This document covers whether it's represented **consistently** across all of them.

## Why This Matters More Here Than in Most Modules

Connected Banking already has two genuinely different balances shown side by side — the **Bank
Widget** (actual bank balance) and the **Ledger Widget** (platform wallet balance), per
[`architecture-and-flow.md`](./architecture-and-flow.md). This is the single highest-risk area
for UI confusion in the entire product: if these two widgets are not *clearly and consistently*
distinguished everywhere they appear, merchants will misunderstand which balance they can
actually transact against.

## 1. Status Badge Consistency

| Status | Expected Label | Expected Color (convention) |
|---|---|---|
| ACTIVE (whitelisted) | "Active" | Green |
| WHITELIST_PENDING | "Pending Whitelisting" | Amber |
| WHITELIST_FAILED | "Whitelisting Failed" | Red |
| Ledger recharge PENDING (non-whitelisted) | "Pending Approval" | Amber — must be visually distinct from a failed recharge (see the sample defect in [`sample-defect-report.md`](../sample-defect-report.md)) |
| Ledger recharge FAILED | "Failed" | Red |

## 2. Bank Widget vs. Ledger Widget Labeling

- Every screen that shows either balance must **clearly label which one it is** — never just a
  bare number
- The two widgets should use visually distinct treatments (not just a text label difference) so
  a merchant scanning quickly doesn't confuse them
- Quick Links available under each widget (Beneficiary/Reports under Bank; Whitelisting under
  Ledger, per the real activation flow) should stay logically grouped under the correct widget in
  every layout/viewport

## 3. Currency & Number Formatting

| Element | Convention to Verify |
|---|---|
| Currency symbol | Consistent ₹ placement across Dashboard, Mini Statement, Reports, and exports |
| Decimal places | Always 2 decimal places, no screen truncating |
| Thousands separator | Consistent Indian numbering across UI and exported reports |
| Fee vs. transaction amount | Always clearly distinguished — the fee wallet deduction must never be visually merged with the transaction amount itself |

## 4. Terminology Consistency

The glossary in [`business-overview.md`](./business-overview.md) defines canonical terms — watch
for drift on:

- "Ledger" vs. "Wallet" vs. "Fee Wallet" used interchangeably for the same balance
- "Whitelisting" vs. "DSP Approval" vs. "Bank Approval" for the same manual step
- "Mini Statement" vs. "Statement" vs. "Recent Activity" as labels for the same feature

## 5. Empty States & Error Messages

- Does Transaction Search, Mini Statement, and Reports each show a deliberate empty state when
  there's no data, not a blank screen?
- Is the "Account numbers do not match" validation error (see
  [`user-guide-activate-connected-banking.md`](./user-guide-activate-connected-banking.md) Step
  9) worded identically regardless of which field (Account Number vs. Confirm Account Number)
  triggered it?
- Does the Terms & Conditions screen give consistent, clear feedback about *which* of the 4
  checkboxes are still unchecked, not just a disabled Submit button with no explanation?

## 6. Cross-Browser & Responsive Consistency

- Do the Bank Widget and Ledger Widget remain clearly distinguished on smaller viewports, where
  space constraints often push UI designers toward stripping "unnecessary" labels?
- Do status badges and the Connect Flow's multi-step popups render identically across Chrome,
  Firefox, and Safari/WebKit?

## 7. Accessibility Consistency

- Are ACTIVE / PENDING / FAILED states distinguishable by more than color alone?
- Is the Bank Widget vs. Ledger Widget distinction accessible to screen readers (not conveyed by
  layout/color position alone)?

---

## Coverage Mapping

See [`../regression-checklist.md`](../regression-checklist.md) section 12 for the UI consistency
test cases (TC-059–065) derived from this document.
