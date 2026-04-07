import { test, expect } from '@playwright/test';

test.describe('OptiTrack Happy Path', () => {
  test('Login -> Tracking -> Driver Hub Workflow', async ({ page }) => {
    // 1. Authentication
    await page.goto('/login');
    await expect(page).toHaveTitle(/OptiTrack/);
    
    await page.fill('input[placeholder="admin_id"]', 'admin');
    await page.fill('input[placeholder="••••••••"]', 'admin123');
    await page.click('button[type="submit"]');

    // 2. Dashboard Landing
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.locator('text=Operational Hub')).toBeVisible();

    // 3. Live Tracking Tactical View
    await page.click('text=Live Tracking');
    await expect(page).toHaveURL(/.*tracking/);
    
    // Wait for the map to stabilize
    await page.waitForTimeout(2000);
    await expect(page.locator('.leaflet-container')).toBeVisible();

    // 4. Fleet Management
    await page.click('text=Fleet');
    await expect(page).toHaveURL(/.*fleet/);
    await expect(page.locator('text=Fleet Inventory')).toBeVisible();

    // 5. Driver Command Center
    await page.click('text=Drivers');
    await expect(page).toHaveURL(/.*drivers/);
    await expect(page.locator('text=Crew Command Center')).toBeVisible();
    
    // Verify a driver is visible in the grid
    await expect(page.locator('text=License Plate').first()).toBeVisible();
  });
});
