import { test, expect } from '@playwright/test';

test.describe('Contractor Marketplace (Story #4)', () => {
    test('Contractor can view signed Green Leases and place a bid', async ({ page }) => {
        // Assume contractors access a specific ecosystem portal
        await page.goto('/marketplace');

        // 1. Verify Marketplace loaded
        await expect(page.locator('h1')).toContainText('Contractor Marketplace');

        // 2. Filter for specific jobs (e.g. Heat Pump, >€300k budget)
        await page.fill('input[placeholder="Min Budget"]', '300000');
        await page.locator('button', { hasText: 'Apply Filters' }).click();

        // 3. Identify a "Hot Lead" (Signed Green Lease)
        const leadCard = page.locator('.hot-lead-card').first();
        await expect(leadCard).toBeVisible();
        await expect(leadCard).toContainText('Status: Signed Green Lease');
        await expect(leadCard).toContainText('Scope: Full Retrofit');

        // 4. Submit a competitive bid
        await leadCard.locator('button', { hasText: 'Submit Bid' }).click();

        const bidModal = page.locator('.bid-modal');
        await expect(bidModal).toBeVisible();

        await page.fill('input[name="bidAmount"]', '420000');
        await page.fill('input[name="timeline"]', '4 Months');
        await page.locator('button', { hasText: 'Confirm Bid' }).click();

        // 5. Verify Success
        await expect(page.locator('.toast-success')).toContainText('Bid successfully submitted to Landlord');
    });
});
