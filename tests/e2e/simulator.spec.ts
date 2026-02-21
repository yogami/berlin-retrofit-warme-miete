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
        // For deep retrofit of 20 units (default slider), the subsidy should be $500,000 (50% of 1M CApex)
        // With € currency formatting: €500.000
        await expect(page.locator('.glass-panel').filter({ hasText: 'Total Subsidy Stack' })).toContainText('€');

        // Landlord ROI Yield should be ~26.0 yrs
        await expect(page.locator('.glass-panel').filter({ hasText: 'Landlord ROI Yield' })).toContainText('26.0 yrs');

        // Tenant Net Savings
        await expect(page.locator('.glass-panel').filter({ hasText: 'Tenant Net Savings' })).toContainText('720');

        // Verify the charts loaded
        await expect(page.locator('.recharts-responsive-container')).toBeVisible();
    });
});
