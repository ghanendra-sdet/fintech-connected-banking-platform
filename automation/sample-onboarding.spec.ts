/**
 * Sample Playwright + TypeScript regression test for the Connected Banking
 * onboarding-to-transaction flow. Uses the Page Object Model pattern.
 * All data below is DUMMY/SAMPLE data for portfolio demonstration only —
 * no real credentials, bank details, or endpoints.
 */

import { test, expect, Page } from '@playwright/test';

// ── Dummy test data ─────────────────────────────────────────────
const DUMMY_BUSINESS = {
  name: 'Demo Business Pvt Ltd',
  email: 'demo.business@example.com',
};

const DUMMY_BANK_ACCOUNT = {
  accountNumber: '000123456789',
  ifsc: 'DEMO0001234',
};

// ── Page Objects ─────────────────────────────────────────────────
class SignupPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/signup');
  }

  async signUp(name: string, email: string) {
    await this.page.getByLabel('Business Name').fill(name);
    await this.page.getByLabel('Email').fill(email);
    await this.page.getByRole('button', { name: 'Sign Up' }).click();
  }
}

class AddBankAccountPage {
  constructor(private page: Page) {}

  async addAccount(accountNumber: string, ifsc: string) {
    await this.page.getByLabel('Account Number').fill(accountNumber);
    await this.page.getByLabel('IFSC').fill(ifsc);
    await this.page.getByRole('button', { name: 'Add Account' }).click();
  }

  async getWhitelistStatusText() {
    return this.page.getByTestId('whitelist-status').innerText();
  }
}

class DashboardPage {
  constructor(private page: Page) {}

  async getBalanceText() {
    return this.page.getByTestId('account-balance').innerText();
  }
}

class TransactionPage {
  constructor(private page: Page) {}

  async initiateTransaction(amount: string) {
    await this.page.getByLabel('Amount').fill(amount);
    await this.page.getByRole('button', { name: 'Initiate Transaction' }).click();
  }

  async getErrorMessage() {
    return this.page.getByTestId('transaction-error').innerText();
  }
}

// ── Tests ────────────────────────────────────────────────────────
test.describe('Connected Banking — Onboarding & Transaction Flow', () => {
  test('business can sign up and reach the add-account step', async ({ page }) => {
    const signup = new SignupPage(page);
    await signup.goto();
    await signup.signUp(DUMMY_BUSINESS.name, DUMMY_BUSINESS.email);

    await expect(page).toHaveURL(/add-bank-account|dashboard/);
  });

  test('adding a bank account shows Pending Whitelisting, not a blank state', async ({ page }) => {
    const signup = new SignupPage(page);
    const addAccount = new AddBankAccountPage(page);

    await signup.goto();
    await signup.signUp(DUMMY_BUSINESS.name, DUMMY_BUSINESS.email);
    await addAccount.addAccount(DUMMY_BANK_ACCOUNT.accountNumber, DUMMY_BANK_ACCOUNT.ifsc);

    await expect(addAccount.getWhitelistStatusText()).resolves.toMatch(/Pending Whitelisting/i);
  });

  test('transaction is blocked while whitelisting is pending', async ({ page }) => {
    const signup = new SignupPage(page);
    const addAccount = new AddBankAccountPage(page);
    const transaction = new TransactionPage(page);

    await signup.goto();
    await signup.signUp(DUMMY_BUSINESS.name, DUMMY_BUSINESS.email);
    await addAccount.addAccount(DUMMY_BANK_ACCOUNT.accountNumber, DUMMY_BANK_ACCOUNT.ifsc);

    // Whitelisting is still pending — attempting a transaction must be blocked
    await page.goto('/transactions/new');
    await transaction.initiateTransaction('500');

    await expect(transaction.getErrorMessage()).resolves.toMatch(/whitelist/i);
  });

  test('balance appears instantly once whitelisting is simulated as complete', async ({ page }) => {
    const dashboard = new DashboardPage(page);

    // In a real suite, whitelisting completion would be triggered via a
    // test-only API/DB seed rather than waiting on an actual bank.
    await page.goto('/dashboard?simulateWhitelisted=true');

    const balanceText = await dashboard.getBalanceText();
    expect(balanceText).not.toBe('');
    expect(balanceText).not.toMatch(/pending/i);
  });
});
