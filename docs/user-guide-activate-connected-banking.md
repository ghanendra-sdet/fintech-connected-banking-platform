# User Guide — How to Activate Connected Banking (Non-Technical)

> **Standard Operating Procedure (SOP).** Written for a non-technical audience — a merchant
> activating the service, or a support/ops team member walking a merchant through it — not a
> developer or QA engineer. This is the kind of end-user documentation a QA engineer is often
> asked to produce alongside test cases, since QA typically understands the full flow better
> than anyone else on the team by the time testing is complete.
>
> All screen references, account numbers, and company names below are illustrative/dummy. The
> example bank partner is referred to generically as **"Northbridge Bank"** throughout.
>
> For the QA-facing, technical version of this same flow (state machines, test-case mapping),
> see [`architecture-and-flow.md`](./architecture-and-flow.md). See [`README.md`](./README.md)
> for the full documentation map.

---

## Overview

Activating Connected Banking is a two-sided process: **Admin** sets up the merchant's commercial
configuration first, and then the **merchant** completes a short self-service "Connect Flow" to
link their actual bank account. Neither side can complete their part without the other having
gone first — Admin must configure commercials before the merchant can even see a "Connect Now"
button.

```
ADMIN SIDE (setup)                          MERCHANT SIDE (self-service)
─────────────────────                        ─────────────────────────────
1. Check merchant status
2. Activate merchant
3. Open merchant profile
4. Add Commercial config
5. Create Bank Rule
6. Add Commercial Rule
7. Verify commercials
                          ──────────────▶
                                              8.  See "Connect Now" button
                                              9.  Confirm "Yes, I have an account"
                                              10. Enter bank account details
                                              11. Verify details
                                              12. Accept Terms & Conditions
                                              13. View synced dashboard
                                              14. Fund the wallet (ledger)
                                              15. Add a beneficiary
                                              16. Send a transfer
```

---

## Part 1 — Admin Setup

### Step 1: Confirm the Merchant Is Onboarded

Before Connected Banking can be activated, the merchant must already exist in the system. Go to
**Admin → Settings → Connected Banking** and confirm the merchant appears in the **All Merchants**
list.

### Step 2: Check and Activate the Merchant's Status

On the same screen, every merchant shows one of three statuses:

| Status | Meaning |
|---|---|
| **Active** | Connected Banking is live for this merchant |
| **Inactive** | Was activated previously but is currently switched off |
| **Not Subscribed** | Connected Banking has never been activated for this merchant |

Use the **Filter** option (top-right) to narrow the list to **Not Subscribed** merchants if
you're activating in bulk. Once you've found the merchant, click the **three-dot action menu**
next to their row and choose the option to activate them for the first time. After activation,
confirm the status indicator turns from yellow (Not Subscribed) to **green (Active)**.

### Step 3: Open the Merchant's Profile

Go to **Admin → Merchants**, click the merchant's UID to open their profile, then go to
**Service Management → Connected Banking**.

### Step 4: Add the Commercial Configuration

Click **Add Commercial** (top-right). In the popup:
1. Select the **Channel** from the dropdown
2. A **Virtual Account (VA) Number** is automatically assigned once you select a channel
3. Set the **Whitelisting** toggle ON or OFF, per business requirement
4. Click **Next**

### Step 5: Create the Bank Rule

⚠️ **This step is critical — read carefully.** The bank details entered here must be entered
**exactly the same way** by the merchant later, or their connection will fail.

Enter:
- **Select Bank** (e.g. Northbridge Bank)
- **Account Number**
- **IFSC Code**
- **Daily Limit**

All four fields are mandatory. Double-check the account number and IFSC before saving — this is
the single most common point of failure in the entire activation process.

### Step 6: Add the Commercial Rule

Click **Next** again. In the **Add Rule** popup:
1. Select the payment **Mode(s)**: IMPS, NEFT, RTGS (or All)
2. Choose **Charge Type**: Flat or Percentage
3. Enter the applicable fee value
4. Enter the **per-transaction limit** (minimum and maximum)
5. Click **Submit**

### Step 7: Verify

Confirm the screen shows "Bank rule created successfully" and the commercial details are correct.
If anything needs to change, use the three-dot action menu on that row to edit it.

**Admin setup is now complete.** The merchant can proceed on their side.

---

## Part 2 — Merchant Self-Service Connect Flow

### Step 8: Start the Connect Flow

Before Admin completes their setup, the merchant sees: *"Connected Banking isn't activated on
your account yet. To activate it, contact support."* Once Admin finishes Part 1, this is
replaced with a **Connect Now** button.

Click **Connect Now**. A popup asks: **Yes, I have an account** / **No, open a new account** /
**Cancel**.

- Choosing **"No, open a new account"** redirects to the bank's own website in a new tab (outside
  this platform)
- To continue activation here, choose **"Yes, I have an account"**

### Step 9: Enter Bank Account Details

Enter your **Account Number**, **Confirm Account Number**, and **IFSC Code**.

🔑 **These must match exactly** what Admin entered in Step 5. A mismatch here is the single most
common activation failure — if you see an "Account numbers do not match" or similar error, stop
and double-check with whoever completed the Admin-side setup before retrying.

### Step 10: Verify and Continue

Click **Verify**. The screen shows your submitted details plus an **Account Type** (defaults to
"Current Account"). Review everything carefully, then click **Continue**.

### Step 11: Accept Terms & Conditions

Four checkboxes must **all** be checked before the Submit button becomes available:

1. **Account Aggregation** — permission to securely connect and display your bank account
   information
2. **Data Sharing Permissions** — permission to share financial data with authorized partners
3. **Transaction Monitoring Agreement** — enabling transaction tracking for fraud detection and
   reporting
4. **Digital Consent with Timestamp** — your consent is recorded digitally with date/time for
   compliance

Click **Submit** once all four are checked.

### Step 12: View Your Dashboard

You'll see a confirmation screen with your **synced balance** from the linked bank account.
Click **View Dashboard** to go to your live Connected Banking Dashboard.

---

## Part 3 — Using Connected Banking

### Understanding the Two Balances

Your dashboard shows **two different balances** — don't confuse them:

| Widget | Shows | Used For |
|---|---|---|
| **Bank widget** (e.g. "Northbridge Bank") | Your actual linked bank account balance | Reference only |
| **Ledger widget** | Your platform wallet balance | Actually performing transactions |

You must **fund the Ledger** before you can send any transfers — your bank balance alone doesn't
let you transact.

### Step 13: Fund Your Wallet (Ledger)

- If your account is **whitelisted**: funds add to your wallet **instantly**
- If your account is **not whitelisted**: the top-up goes into a **Pending** state and needs
  approval. Contact Support — an Admin will review the Pending item and either **Approve** or
  **Cancel** it.

### Step 14: Add a Beneficiary

From **Quick Links → Beneficiary**, enter the beneficiary's **Account Number**, **Confirm
Account Number**, **IFSC Code**, **Beneficiary Name**, and **Bank Name**, then click **Verify**.
Once verified, they're saved for future payments — searchable by name.

### Step 15: Send a Transfer

Click the **Transfer** action (from Recent Transactions or Quick Links). In the popup:
1. Enter the **amount**
2. Select a **beneficiary** (or add a new one)
3. Choose the **payment mode** — IMPS, NEFT, or RTGS (availability depends on what Admin
   configured in Step 6)
4. Add **remarks**
5. Select which linked **bank account** to send from
6. Click **Proceed**

You'll see a **Review & Confirm Transfer** screen — check everything, then click **Confirm and
Send**. The transaction is initiated, and the applicable fee is deducted from your Ledger based
on whether it succeeds or fails.

---

## Quick Troubleshooting

| Problem | Likely Cause |
|---|---|
| "Connect Now" button never appears | Admin hasn't completed Part 1 (commercial configuration) yet |
| Account verification fails at Step 9 | Account number/IFSC don't exactly match what Admin entered in Step 5 |
| Submit button greyed out on Terms & Conditions | Not all 4 checkboxes are checked |
| Wallet top-up stuck as Pending | Account isn't whitelisted — needs Admin approval |
| A payment mode (IMPS/NEFT/RTGS) is missing from the transfer screen | That mode wasn't enabled in Admin's Commercial Rule setup (Step 6) |

---

**See also:** [`../regression-checklist.md`](../regression-checklist.md) sections 9–11 for the
concrete test cases derived from every step above, and
[`ui-consistency.md`](./ui-consistency.md) for how the Bank Widget/Ledger Widget distinction
(Part 3) must render consistently.
