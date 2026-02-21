import { test, expect } from '@playwright/test';

test.describe('Geospatial Intelligence Engine (ATDD)', () => {
    test.setTimeout(60000);

    test('User can interact with the CO2 Risk Map and generate a Green Lease', async ({ page }) => {
        // 1. Initial Load & Toggle Verification
        await page.goto('/');
        await expect(page.locator('h1')).toContainText('Warme Miete');

        // Ensure the new UI toggle for the Map is present
        const mapToggle = page.getByRole('button', { name: /CO2 Risk Map/i });
        await expect(mapToggle).toBeVisible({ timeout: 15000 });
        await mapToggle.click();

        // Ensure the Map container rendered and is set to "Sim Mode" against Neukölln dataset
        await page.waitForTimeout(1000); // Give Leaflet canvas time to mount
        await expect(page.locator('text=Sim (10k Cache)')).toBeVisible();

        // 2. Map Interaction
        // We will mock the clicking of a high-risk (red) building marker.
        // The mock dataset should have a specific address we can target via its popup.
        // Let's assume one is 'Karl-Marx-Straße 111, Berlin'

        // Wait for markers to render (SVG paths in Leaflet)
        await page.waitForSelector('path.high-liability-marker.leaflet-interactive', { state: 'visible', timeout: 15000 });
        const highRiskMarker = page.locator('path.high-liability-marker.leaflet-interactive').first();
        await page.waitForTimeout(500); // Let Leaflet settle
        await highRiskMarker.dispatchEvent('click'); // Bypasses SVG occlusion that blocks force-click

        // 3. Workflow Hook (The auto-fill)
        // Clicking the marker should automatically configure the SimulatorEngine
        // and instantly open the DealCloserModal, pre-filled with the building's PII.

        await expect(page.locator('h2', { hasText: 'Generate Green Lease' })).toBeVisible({ timeout: 15000 });
        await expect(page.locator('input[placeholder="e.g. Karl-Marx-Allee 34, 10178 Berlin"]')).toHaveValue(/Berlin/i);

        // Fill in required PII for the PDF Generator
        await page.locator('input[placeholder="Vonovia SE"]').fill('Deutsche Wohnen');
        await page.locator('input[placeholder="Max Mustermann"]').fill('Erika Musterfrau');

        // 4. Mathematical Domain Execution
        // The PDF generation should function exactly as before, but using the ingested A/V ratio.
        const downloadPromise = page.waitForEvent('download');
        await page.locator('button', { hasText: 'Download Legal Addendum' }).click();
        const download = await downloadPromise;

        // Verify the GreenLease PDF was spat out correctly, proving the zero-friction funnel
        expect(download.suggestedFilename()).toContain('GreenLease_');

        // Modal closes
        await expect(page.locator('h2', { hasText: 'Generate Green Lease' })).not.toBeVisible();
    });
});
