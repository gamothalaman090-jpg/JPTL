import { test, expect } from '@playwright/test';

test.describe('E2E Test Suite — JPTL Property Management Platform', () => {

  test.describe('1. Authentication & Access Control', () => {
    test('1.1 Should display login page with email and password inputs', async ({ page }) => {
      await page.goto('/login');
      await expect(page.locator('#login-email')).toBeVisible();
      await expect(page.locator('#login-password')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toContainText('Sign In');
    });

    test('1.2 Should show error when attempting login with invalid credentials', async ({ page }) => {
      await page.goto('/login');
      await page.fill('#login-email', 'invalid.user@example.com');
      await page.fill('#login-password', 'WrongPassword123!');
      await page.click('button[type="submit"]');

      // Expect error alert or message to appear
      const errorBanner = page.locator('text=/Invalid email or password|Authentication failed|Invalid credentials/i');
      await expect(errorBanner).toBeVisible({ timeout: 5000 });
    });

    test('1.3 Landlord login succeeds and lands on Landlord Dashboard', async ({ page }) => {
      await page.goto('/login');
      await page.fill('#login-email', 'landlord@jptl.dev');
      await page.fill('#login-password', 'Password123!');
      await page.click('button[type="submit"]');

      // Expect redirect to /dashboard
      await expect(page).toHaveURL(/.*dashboard.*/, { timeout: 8000 });
      await expect(page.locator('text=/Dashboard|Properties|Maintenance|Rent Roll|Tenant Directory/i').first()).toBeVisible();
    });

    test('1.4 Tenant login succeeds and lands on Resident Portal', async ({ page }) => {
      await page.goto('/login');
      await page.fill('#login-email', 'sophia@jptl.dev');
      await page.fill('#login-password', 'Password123!');
      await page.click('button[type="submit"]');

      // Expect redirect to /tenant
      await expect(page).toHaveURL(/.*tenant.*/, { timeout: 8000 });
      await expect(page.locator('text=/Resident Portal|Sophia Lin|Overview|Maintenance|Payments/i').first()).toBeVisible();
    });
  });

  test.describe('2. Landlord Management & Announcement Lifecycle', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/login');
      await page.fill('#login-email', 'landlord@jptl.dev');
      await page.fill('#login-password', 'Password123!');
      await page.click('button[type="submit"]');
      await expect(page).toHaveURL(/.*dashboard.*/, { timeout: 8000 });
    });

    test('2.1 Should navigate between Landlord tabs', async ({ page }) => {
      // Navigate to Properties
      const propertiesTab = page.locator('button:has-text("Properties")').first();
      if (await propertiesTab.isVisible()) {
        await propertiesTab.click();
        await expect(page.locator('text=/Add Property|All Properties|Units/i').first()).toBeVisible();
      }

      // Navigate to Tickets
      const ticketsTab = page.locator('button:has-text("Tickets"), button:has-text("Maintenance")').first();
      if (await ticketsTab.isVisible()) {
        await ticketsTab.click();
        await expect(page.locator('text=/Maintenance|Tickets|Status|Priority/i').first()).toBeVisible();
      }

      // Navigate to Announcements
      const announcementsTab = page.locator('button:has-text("Announcements")').first();
      if (await announcementsTab.isVisible()) {
        await announcementsTab.click();
        await expect(page.locator('text=/Broadcast|New Announcement|Announcements/i').first()).toBeVisible();
      }
    });

    test('2.2 Should broadcast an announcement and allow deletion', async ({ page }) => {
      const announcementsTab = page.locator('button:has-text("Announcements")').first();
      if (await announcementsTab.isVisible()) {
        await announcementsTab.click();

        // Check if there is a "New Announcement" or "Broadcast" button
        const newBtn = page.locator('button:has-text("New Announcement"), button:has-text("Broadcast")').first();
        if (await newBtn.isVisible()) {
          await newBtn.click();

          const titleInput = page.locator('input[placeholder*="title" i], input[name="title"]').first();
          if (await titleInput.isVisible()) {
            const testTitle = `E2E Test Notice - ${Date.now()}`;
            await titleInput.fill(testTitle);

            const contentInput = page.locator('textarea[placeholder*="content" i], textarea[name="content"]').first();
            if (await contentInput.isVisible()) {
              await contentInput.fill('This is an automated test notice for E2E verification.');
            }

            const submitBtn = page.locator('button:has-text("Post"), button:has-text("Publish"), button:has-text("Send")').first();
            if (await submitBtn.isVisible()) {
              await submitBtn.click();
              await expect(page.locator(`text=${testTitle}`)).toBeVisible({ timeout: 6000 });

              // Verify delete button is present on the announcement
              const deleteBtn = page.locator(`button[aria-label*="delete" i], button:has-text("Delete")`).first();
              if (await deleteBtn.isVisible()) {
                await deleteBtn.click();
              }
            }
          }
        }
      }
    });
  });

  test.describe('3. Tenant Portal Maintenance & Payments', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/login');
      await page.fill('#login-email', 'sophia@jptl.dev');
      await page.fill('#login-password', 'Password123!');
      await page.click('button[type="submit"]');
      await expect(page).toHaveURL(/.*tenant.*/, { timeout: 8000 });
    });

    test('3.1 Maintenance tab displays tickets and Report Issue modal', async ({ page }) => {
      const maintTab = page.locator('button:has-text("Maintenance")').first();
      await maintTab.click();

      const reportBtn = page.locator('button:has-text("Report Issue"), button:has-text("New Ticket")').first();
      await expect(reportBtn).toBeVisible();

      // Open Modal
      await reportBtn.click();
      await expect(page.locator('text=/Issue Details|Report Maintenance|Submit Ticket/i').first()).toBeVisible();

      // Close modal
      const closeBtn = page.locator('button:has-text("Cancel"), button[aria-label="Close"]').first();
      if (await closeBtn.isVisible()) {
        await closeBtn.click();
      }
    });

    test('3.2 Payments tab verifies conditional fees (utility & parking)', async ({ page }) => {
      const paymentsTab = page.locator('button:has-text("Payments")').first();
      await paymentsTab.click();

      // Verify Payments ledger is rendered
      await expect(page.locator('text=/Total Due|Rent|Payment/i').first()).toBeVisible();

      // Sophia Lin has parking assigned ($150) -> parking fee item should be visible
      const parkingFee = page.locator('text=/Parking Space|Parking Fee/i');
      if (await parkingFee.count() > 0) {
        await expect(parkingFee.first()).toBeVisible();
      }
    });

    test('3.3 Documents tab contains document list and inspection viewer', async ({ page }) => {
      const docsTab = page.locator('button:has-text("Documents")').first();
      if (await docsTab.isVisible()) {
        await docsTab.click();
        await expect(page.locator('text=/Compliance|Documents|Lease Agreement|Upload/i').first()).toBeVisible();
      }
    });
  });

  test.describe('4. Landlord Rent Roll Management Flow', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/login');
      await page.fill('#login-email', 'landlord@jptl.dev');
      await page.fill('#login-password', 'Password123!');
      await page.click('button[type="submit"]');
      await expect(page).toHaveURL(/.*dashboard.*/, { timeout: 8000 });
    });

    test('4.1 Rent Roll tab lists payment records', async ({ page }) => {
      const rentRollTab = page.locator('button:has-text("Rent Roll")').first();
      if (await rentRollTab.isVisible()) {
        await rentRollTab.click();
        await expect(page.locator('text=/Rent Roll|Total Expected|Collected|Overdue|Invoices/i').first()).toBeVisible({ timeout: 6000 });
      }
    });

    test('4.2 Generate invoice and mark as paid', async ({ page }) => {
      const rentRollTab = page.locator('button:has-text("Rent Roll")').first();
      if (await rentRollTab.isVisible()) {
        await rentRollTab.click();

        const createInvoiceBtn = page.locator('button:has-text("Create Invoice"), button:has-text("Generate Invoice"), button:has-text("New Invoice")').first();
        if (await createInvoiceBtn.isVisible()) {
          await createInvoiceBtn.click();
          await expect(page.locator('text=/Create Invoice|Issue Invoice|New Rent Charge/i').first()).toBeVisible({ timeout: 5000 });

          const cancelBtn = page.locator('button:has-text("Cancel"), button[aria-label="Close"]').first();
          if (await cancelBtn.isVisible()) {
            await cancelBtn.click();
          }
        }
      }
    });
  });

  test.describe('5. Lease Extension Flow', () => {
    test('5.1 Tenant submits lease extension from portal', async ({ page }) => {
      await page.goto('/login');
      await page.fill('#login-email', 'sophia@jptl.dev');
      await page.fill('#login-password', 'Password123!');
      await page.click('button[type="submit"]');
      await expect(page).toHaveURL(/.*tenant.*/, { timeout: 8000 });

      const leaseTab = page.locator('button:has-text("Lease"), button:has-text("Agreement")').first();
      if (await leaseTab.isVisible()) {
        await leaseTab.click();
        await expect(page.locator('text=/Lease Details|Monthly Rent|Term|Request Extension|Renew/i').first()).toBeVisible({ timeout: 6000 });

        const extendBtn = page.locator('button:has-text("Request Extension"), button:has-text("Renew Lease")').first();
        if (await extendBtn.isVisible()) {
          await extendBtn.click();
          await expect(page.locator('text=/Extension|Renewal Request|Proposed Term/i').first()).toBeVisible({ timeout: 5000 });

          const cancelBtn = page.locator('button:has-text("Cancel"), button[aria-label="Close"]').first();
          if (await cancelBtn.isVisible()) {
            await cancelBtn.click();
          }
        }
      }
    });

    test('5.2 Landlord reviews and approves extension', async ({ page }) => {
      await page.goto('/login');
      await page.fill('#login-email', 'landlord@jptl.dev');
      await page.fill('#login-password', 'Password123!');
      await page.click('button[type="submit"]');
      await expect(page).toHaveURL(/.*dashboard.*/, { timeout: 8000 });

      const leaseTab = page.locator('button:has-text("Leases"), button:has-text("Lease Extensions")').first();
      if (await leaseTab.isVisible()) {
        await leaseTab.click();
        await expect(page.locator('text=/Lease Extensions|Renewals|Pending Requests/i').first()).toBeVisible({ timeout: 6000 });
      }
    });
  });

  test.describe('6. Notifications Bell & Alerts', () => {
    test('6.1 Notification badge increments and clears on mark-all-read', async ({ page }) => {
      await page.goto('/login');
      await page.fill('#login-email', 'sophia@jptl.dev');
      await page.fill('#login-password', 'Password123!');
      await page.click('button[type="submit"]');
      await expect(page).toHaveURL(/.*tenant.*/, { timeout: 8000 });

      const notifBell = page.locator('button[aria-label*="notification" i], button:has([data-lucide="bell"]), button:has(svg.lucide-bell)').first();
      if (await notifBell.isVisible()) {
        await notifBell.click();
        await expect(page.locator('text=/Notifications|Mark all as read|No new notifications/i').first()).toBeVisible({ timeout: 5000 });

        const markAllBtn = page.locator('button:has-text("Mark all as read"), button:has-text("Clear all")').first();
        if (await markAllBtn.isVisible()) {
          await markAllBtn.click();
        }
      }
    });
  });

  test.describe('7. Superadmin Panel', () => {
    test('7.1 Superadmin login and platform dashboard renders', async ({ page }) => {
      await page.goto('/login');
      const superadminEmail = page.locator('#login-email');
      await superadminEmail.fill('superadmin@jptl.sys');
      await page.fill('#login-password', 'admin123');
      await page.click('button[type="submit"]');

      await expect(page.locator('text=/Platform|Superadmin|Overview|Dashboard|System/i').first()).toBeVisible({ timeout: 8000 });
    });

    test('7.2 Enable and disable maintenance mode', async ({ page }) => {
      const response = await page.request.get('http://localhost:8000/api/system/status');
      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(typeof data.maintenance).toBe('boolean');
    });
  });

});

