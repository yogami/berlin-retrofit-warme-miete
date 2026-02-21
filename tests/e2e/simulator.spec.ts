import { test, expect } from '@playwright/test';

test.describe('Warme Miete Dashboard Flow (ATDD)', () => {
    test('User can simulate deep retrofit and see results', async ({ page }) => {
        await page.goto('/');

        // Verify the application loaded correctly and displays the rebranded title
        await expect(page.locator('h1')).toContainText('Warme Miete');
        await expect(page.locator('text=GreenLease Optimizer')).toBeVisible();

        // The dashboard starts loading data immediately due to useEffect, 
        // but we want to interact with the sliders.
        await expect(page.locator('text=Number of Units')).toBeVisible();
        await expect(page.locator('text=Deep (Heat Pump + Full Env)')).toBeVisible();

        // Select the deepest retrofit options
        await page.locator('input[value="deep"]').check();

        // Let the simulation complete and display metrics
        await expect(page.locator('text=Total Subsidy Stack')).toBeVisible();
        await expect(page.locator('div').filter({ hasText: /^Total Subsidy Stack$/ }).locator('..')).toContainText('€');
        await expect(page.locator('div').filter({ hasText: /^Tenant Net Savings$/ }).locator('..')).toContainText('720');

        // Verify the charts loaded
        await expect(page.locator('.recharts-responsive-container')).toBeVisible();

        // FULL STACK CRUD TEST: Save the Scenario
        page.on('dialog', dialog => dialog.accept()); // Accept the save alert

        // Setup network intercept to mock the POST request to avoid hitting production DB during tests
        await page.route('**/api/simulations', async route => {
            if (route.request().method() === 'POST') {
                await route.fulfill({ status: 200, json: { success: true } });
            } else {
                await route.continue();
            }
        });

        const postPromise = page.waitForResponse(response => response.url().includes('/api/simulations') && response.request().method() === 'POST');
        await page.locator('button', { hasText: 'Save & Broadcast Scenario' }).click();
        await postPromise;

        // Mock the GET request to instantly return our fake saved scenario
        await page.route('**/api/simulations', async route => {
            if (route.request().method() === 'GET') {
                await route.fulfill({
                    status: 200,
                    json: {
                        success: true,
                        data: [{ id: 999, units: 20, buildingAge: '1970', retrofitType: 'deep', createdAt: new Date().toISOString(), hash: 'mock-abc-123-hash' }]
                    }
                });
            } else {
                await route.continue();
            }
        });

        // Trigger the UI to fetch
        await page.evaluate(() => window.dispatchEvent(new Event('scenario-saved')));

        // Verify it appears in the Saved Scenarios list
        await expect(page.locator('h2', { hasText: 'Saved Scenarios' })).toBeVisible({ timeout: 10000 });
        await expect(page.locator('strong', { hasText: '20-Unit 1970 Altbau' })).toBeVisible({ timeout: 10000 });

        // Verify the Cryptographic Badge appears
        await expect(page.locator('text=Verified Proof-of-Execution')).toBeVisible();

        // PARTNER MARKETPLACE DISTRIBUTION
        await page.route('**/api/marketplace/finance', async route => {
            await route.fulfill({ status: 200, json: { success: true, partner: 'KfW/DKB API' } });
        });

        const financePromise = page.waitForResponse(response => response.url().includes('/api/marketplace/finance') && response.request().method() === 'POST');
        await page.locator('button', { hasText: 'DKB Loan' }).click();
        await financePromise;
        await expect(page.locator('text=Sent to KfW/DKB API')).toBeVisible();

        // Mock the DELETE request
        await page.route('**/api/simulations/999', async route => {
            await route.fulfill({ status: 200, json: { success: true } });
        });

        const deletePromise = page.waitForResponse(response => response.url().includes('/api/simulations/999') && response.request().method() === 'DELETE');
        await page.locator('button[title="Delete Record"]').click();
        await deletePromise;

        // Verify deletion
        await expect(page.locator('strong', { hasText: '20-Unit 1970 Altbau' })).not.toBeVisible();
    });
});
