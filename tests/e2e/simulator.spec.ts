import { test, expect } from '@playwright/test';

test.describe('Warme Miete Enterprise Trust Flow (ATDD)', () => {
    test.setTimeout(60000);

    test('User can simulate deep retrofit, verify PoE, route to marketplace, and draft Green Lease', async ({ page }) => {
        // Run against the local dev server or the production URL provided by Playwright config
        await page.goto('/');

        // 1. Verify Core Load
        await expect(page.locator('h1')).toContainText('Warme Miete');
        await expect(page.locator('text=Number of Units')).toBeVisible();

        // 2. Trigger Simulation
        await page.locator('input[value="deep"]').check();
        await expect(page.locator('text=Total Subsidy Stack')).toBeVisible();

        // 3. Save Scenario (Intercept to avoid polluting live DB if needed, but we'll test the real flow)
        page.on('dialog', dialog => dialog.accept());
        await page.locator('button', { hasText: 'Save & Broadcast Scenario' }).click();

        // 4. Verify Proof of Execution
        await expect(page.locator('h2', { hasText: 'Saved Scenarios' })).toBeVisible({ timeout: 15000 });
        await expect(page.locator('text=Verified Proof-of-Execution').first()).toBeVisible();

        // 5. Partner Disptach (Mocking the external banking API)
        await page.route('**/api/marketplace/finance', async route => {
            await route.fulfill({ status: 200, json: { success: true, partner: 'KfW/DKB API' } });
        });
        await page.locator('button', { hasText: 'DKB Loan' }).first().click();
        await expect(page.locator('text=Sent to KfW/DKB API')).toBeVisible();

        // 6. The Deal Closer Widget (Phase 5)
        // Click the Pen icon (we can target it by title attribute)
        await page.locator('button[title="Draft Green Lease"]').first().click();

        // Verify Modal Opened
        await expect(page.locator('h2', { hasText: 'Generate Green Lease' })).toBeVisible();

        // Fill Ephemeral PII
        await page.fill('input[placeholder="e.g. Karl-Marx-Allee 34, 10178 Berlin"]', 'E2E Test Street 1');
        await page.fill('input[placeholder="Vonovia SE"]', 'E2E Landlord Corp');
        await page.fill('input[placeholder="Max Mustermann"]', 'E2E Tenant Jane');

        // Trigger PDF Download
        // Playwright handles downloads specifically
        const downloadPromise = page.waitForEvent('download');
        await page.locator('button', { hasText: 'Download Legal Addendum' }).click();
        const download = await downloadPromise;

        // Verify it was generated and named correctly
        expect(download.suggestedFilename()).toContain('GreenLease_');

        // Verify Modal Closed
        await expect(page.locator('h2', { hasText: 'Generate Green Lease' })).not.toBeVisible();

        // 7. Cleanup (Delete the record we just made)
        await page.locator('button[title="Delete Record"]').first().click();
    });
});
