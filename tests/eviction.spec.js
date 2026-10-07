import { test, expect } from '@playwright/test';

test.describe('Eviction notice and override flows', () => {
  test('landlord can issue a 40-day notice from the dashboard', async ({ page }) => {
    await page.goto('/login');
    await page.fill('#login-email', 'landlord@jptl.dev');
    await page.fill('#login-password', 'Password123!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*dashboard.*/, { timeout: 10000 });

    await page.getByRole('button', { name: 'Eviction Notices' }).click();
    await expect(page.getByRole('heading', { name: 'Eviction Notices' })).toBeVisible();
    await page.getByRole('button', { name: 'Issue 40-Day Notice' }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByRole('heading', { name: 'Issue 40-Day Notice' })).toBeVisible();
    await dialog.getByLabel('Tenant and lease').selectOption({ index: 1 });
    const reason = `Playwright test notice ${Date.now()}`;
    await dialog.getByLabel('Reason for notice').fill(reason);
    await dialog.getByRole('button', { name: 'Issue Notice' }).click();

    await expect(page.getByText(reason)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/Move-out:/)).toBeVisible();
  });

  test('Evict Override requires a reason before it can be confirmed', async ({ page }) => {
    await page.goto('/login');
    await page.fill('#login-email', 'landlord@jptl.dev');
    await page.fill('#login-password', 'Password123!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*dashboard.*/, { timeout: 10000 });

    await page.getByRole('button', { name: 'Eviction Notices' }).click();
    await page.getByRole('button', { name: 'Evict Override' }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByText(/immediately ends the lease/i)).toBeVisible();
    await dialog.getByLabel('Tenant and lease').selectOption({ index: 1 });
    await expect(dialog.getByRole('button', { name: 'Confirm Evict Override' })).toBeDisabled();
    await dialog.getByLabel('Override reason').fill('Confirmed by test only');
    await expect(dialog.getByRole('button', { name: 'Confirm Evict Override' })).toBeEnabled();
    await dialog.getByRole('button', { name: 'Keep Notice' }).click();
  });

  test('landlord can cancel an active 40-day notice', async ({ page }) => {
    await page.goto('/login');
    await page.fill('#login-email', 'landlord@jptl.dev');
    await page.fill('#login-password', 'Password123!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*dashboard.*/, { timeout: 10000 });
    await page.getByRole('button', { name: 'Eviction Notices' }).click();
    await page.getByRole('button', { name: 'Issue 40-Day Notice' }).click();
    let dialog = page.getByRole('dialog');
    await dialog.getByLabel('Tenant and lease').selectOption({ index: 1 });
    await dialog.getByLabel('Reason for notice').fill(`Cancel flow test ${Date.now()}`);
    await dialog.getByRole('button', { name: 'Issue Notice' }).click();
    const noticeCard = page.locator('article').filter({ hasText: 'Cancel flow test' }).first();
    await expect(noticeCard).toBeVisible({ timeout: 10000 });
    await noticeCard.getByRole('button', { name: 'Cancel Notice' }).click();
    dialog = page.getByRole('dialog');
    await expect(dialog.getByRole('heading', { name: 'Cancel 40-Day Notice?' })).toBeVisible();
    await dialog.getByLabel('Cancellation reason (optional)').fill('Canceled by landlord after review');
    await dialog.getByRole('button', { name: 'Cancel Notice' }).click();
    await expect(noticeCard.getByText('canceled', { exact: true })).toBeVisible({ timeout: 10000 });
    await noticeCard.getByRole('button', { name: 'Delete canceled notice' }).click();
    dialog = page.getByRole('dialog');
    await expect(dialog.getByRole('heading', { name: 'Delete Canceled Notice?' })).toBeVisible();
    await dialog.getByRole('button', { name: 'Delete Notice' }).click();
    await expect(noticeCard).toHaveCount(0, { timeout: 10000 });
  });

  test('tenant Notices page loads with notices or an empty state', async ({ page }) => {
    await page.goto('/login');
    await page.fill('#login-email', 'sophia@jptl.dev');
    await page.fill('#login-password', 'Password123!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*tenant.*/, { timeout: 10000 });

    await page.getByRole('button', { name: 'Notices' }).click();
    await expect(page.getByRole('heading', { name: 'Notices', exact: true })).toBeVisible();
    await expect(page.getByText(/No notices|40-Day Eviction Notice/).first()).toBeVisible({ timeout: 10000 });
  });
});
