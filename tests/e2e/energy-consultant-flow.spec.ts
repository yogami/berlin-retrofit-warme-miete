import { test, expect } from '@playwright/test';

test.describe('Energy Consultant Lead Generator (Story #1)', () => {
    test('Energy consultant can filter high liability buildings and generate a proposal', async ({ page }) => {
        await page.goto('/');

        // 1. Switch persona to "Energy Consultant"
        await page.locator('button', { hasText: 'Consultant Mode' }).click();

        // 2. Map should be visible and we filter for >€8k/yr CO2 tax exposure
        await expect(page.locator('.leaflet-container')).toBeVisible();
        await page.locator('select[name="filter-liability"]').selectOption('high_tax');

        // 3. Ensure the map re-renders markers
        // This expects specific data points from the mock to appear
        await page.waitForTimeout(500); // give map time to re-cluster

        // 4. Click a red, high-liability building marker
        await page.locator('.high-liability-marker').first().click();

        // 5. Verify the lead panel opens with financial estimations
        const leadPanel = page.locator('.consultant-lead-panel');
        await expect(leadPanel).toBeVisible();
        await expect(leadPanel).toContainText('Estimated Tax: >€8,000/yr');

        // 6. Generate the iSFP Proposal
        const popupPromise = page.waitForEvent('popup');
        await page.locator('button', { hasText: 'Send Proposal' }).click();

        // Wait for the simulated email / PDF to open verifying the lead was processed
        const popup = await popupPromise;
        await popup.waitForLoadState();
        expect(await popup.title()).toContain('iSFP_Proposal');
    });
});
