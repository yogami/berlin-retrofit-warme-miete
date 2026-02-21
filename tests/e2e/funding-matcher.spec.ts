import { test, expect } from '@playwright/test';

test.describe('Landlord Funding Matcher (Story #5)', () => {
    test('Landlord can compare NPV of multiple funding options and apply', async ({ page }) => {
        await page.goto('/');

        // 1. Enter Deal Maker logic by switching tabs
        await page.locator('button', { hasText: 'Deal Maker' }).click();
        await page.locator('input[value="deep"]').check();

        // 2. Scroll to / Locate the new Funding Matcher section
        const matcherSection = page.locator('.funding-matcher-section');
        await expect(matcherSection).toBeVisible();

        // 3. Verify side-by-side comparison exists
        await expect(matcherSection).toContainText('KfW Loan');
        await expect(matcherSection).toContainText('BEW Escrow');
        await expect(matcherSection).toContainText('Combo (RECOMMENDED)');

        // 4. Validate deterministic math logic (checking for presence of NPV calculations)
        // Ensure no "magic numbers" — the NPV MUST be positive for the combo
        await expect(page.locator('.combo-npv')).toContainText('+€');

        // 5. Select the Combo path and trigger 1-click apply
        await page.locator('button[data-funding="combo"]').click();

        // 6. Application modal should show generating documents securely
        await expect(page.locator('.application-modal')).toBeVisible();
        await expect(page.locator('.application-modal')).toContainText('Generating auto-filled applications');

        // 7. Verify process completion
        await page.locator('button', { hasText: 'Sign & Dispatch' }).click();
        await expect(page.locator('.progress-tracker')).toContainText('BEW Approved (Escrow Ready)');
    });
});
