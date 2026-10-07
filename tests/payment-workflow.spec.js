const { test, expect } = require('@playwright/test');

test.describe('Non-simulated rent payment review', () => {
  test('opening and canceling advance payment does not create a server draft', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    let draftRequests = 0;
    page.on('request', (request) => {
      if (request.method() === 'POST' && request.url().includes('/tenant/payments/advance-invoice')) draftRequests += 1;
    });
    await page.goto('/login');
    await page.fill('#login-email', 'sophia@jptl.dev');
    await page.fill('#login-password', 'Password123!');
    await page.locator('button[type="submit"]').click();
    await expect(page).toHaveURL(/tenant/i, { timeout: 15000 });
    await page.getByRole('button', { name: /Pay in Advance/i }).first().click();
    const dialog = page.getByRole('dialog', { name: /Pay Rent in Advance/i });
    await expect(dialog).toBeVisible();
    await dialog.getByRole('button', { name: 'Cancel' }).click();
    await expect(dialog).toBeHidden();
    expect(draftRequests).toBe(0);
    await context.close();
  });

  test('QR payment option upload shows its selected filename and preview', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto('/login');
    await page.fill('#login-email', 'landlord@jptl.dev');
    await page.fill('#login-password', 'Password123!');
    await page.locator('button[type="submit"]').click();
    await expect(page).toHaveURL(/dashboard/i, { timeout: 15000 });
    await page.getByRole('button', { name: 'Rent Roll' }).click();
    await page.getByRole('button', { name: 'Payment options' }).click();
    const qrInput = page.locator('input[type="file"]').first();
    await qrInput.setInputFiles({
      name: 'sample-qr.png',
      mimeType: 'image/png',
      buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/pWQAAAAASUVORK5CYII=', 'base64'),
    });
    await expect(page.getByText('sample-qr.png')).toBeVisible();
    await expect(page.getByAltText('Selected payment QR preview')).toBeVisible();
    await context.close();
  });

  test('tenant requests onsite payment and landlord approves it', async ({ browser }) => {
    const tenantContext = await browser.newContext();
    const tenantPage = await tenantContext.newPage();
    await tenantPage.goto('/login');
    await tenantPage.fill('#login-email', 'sophia@jptl.dev');
    await tenantPage.fill('#login-password', 'Password123!');
    await tenantPage.locator('button[type="submit"]').click();
    await expect(tenantPage).toHaveURL(/tenant/i, { timeout: 15000 });
    await tenantPage.getByRole('button', { name: /Rent & Payments/i }).click();
    const submitButton = tenantPage.getByRole('button', { name: /Pay Rent Now/i });
    await expect(submitButton).toBeEnabled({ timeout: 15000 });
    await submitButton.click();
    const paymentDialog = tenantPage.getByRole('dialog');
    const invoiceLabel = (await paymentDialog.locator('p').first().innerText()).split(' · ')[0];
    await paymentDialog.getByRole('button', { name: 'I paid onsite' }).click();
    await paymentDialog.getByRole('button', { name: /I paid onsite/i }).click();
    await expect(paymentDialog.getByRole('heading', { name: /Submitted for landlord review/i })).toBeVisible({ timeout: 15000 });
    await tenantContext.close();

    const landlordContext = await browser.newContext();
    const landlordPage = await landlordContext.newPage();
    await landlordPage.goto('/login');
    await landlordPage.fill('#login-email', 'landlord@jptl.dev');
    await landlordPage.fill('#login-password', 'Password123!');
    await landlordPage.locator('button[type="submit"]').click();
    await expect(landlordPage).toHaveURL(/dashboard/i, { timeout: 15000 });
    await landlordPage.getByRole('button', { name: /Rent Roll/i }).click();
    await landlordPage.getByRole('button', { name: 'Needs review' }).click();
    const paymentRow = landlordPage.locator('article').filter({ hasText: invoiceLabel }).first();
    await expect(paymentRow.getByText(/Awaiting review/i)).toBeVisible({ timeout: 15000 });
    await paymentRow.getByRole('button', { name: /Approve/i }).click();
    await expect(paymentRow.getByText(/Awaiting review/i)).toHaveCount(0, { timeout: 15000 });
    await landlordContext.close();
  });
});
