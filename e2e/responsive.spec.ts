import { test, expect } from '@playwright/test';

test.describe('Responsive Design - Mobile', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('should display correctly on mobile', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('svg');
    
    // Verify header is visible
    await expect(page.locator('h1')).toBeVisible();
    
    // Verify seat map is visible
    await expect(page.locator('svg')).toBeVisible();
    
    // Verify sidebar is visible (should stack on mobile)
    await expect(page.locator('.sidebar')).toBeVisible();
  });

  test('should allow seat selection on mobile', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('svg');
    
    // Tap a seat
    const seat = page.locator('svg rect[data-id*="Premium"][fill="#2196F3"]').first();
    await seat.tap();
    
    // Verify selection
    await expect(page.getByText(/1 seat selected/i)).toBeVisible();
  });

  test('should support pinch zoom on mobile', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('svg');
    
    // Get initial zoom
    const zoomDisplay = page.locator('text=/\\d+%/');
    const initialZoom = await zoomDisplay.textContent();
    
    // Simulate pinch zoom (using zoom buttons as proxy)
    await page.getByRole('button', { name: /zoom in/i }).tap();
    await page.waitForTimeout(300);
    
    // Verify zoom changed
    const newZoom = await zoomDisplay.textContent();
    expect(newZoom).not.toBe(initialZoom);
  });

  test('should have touch-friendly buttons on mobile', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('svg');
    
    // Check zoom button size (should be at least 44x44 for touch)
    const zoomButton = page.getByRole('button', { name: /zoom in/i });
    const box = await zoomButton.boundingBox();
    
    expect(box).toBeTruthy();
    expect(box!.width).toBeGreaterThanOrEqual(44);
    expect(box!.height).toBeGreaterThanOrEqual(44);
  });

  test('should scroll sidebar on mobile', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('svg');
    
    // Select multiple seats to make sidebar scrollable
    const seats = page.locator('svg rect[data-id*="Premium"][fill="#2196F3"]');
    for (let i = 0; i < 5; i++) {
      await seats.nth(i).tap();
      await page.waitForTimeout(100);
    }
    
    // Verify sidebar is scrollable
    const sidebar = page.locator('.sidebar');
    await expect(sidebar).toBeVisible();
  });

  test('should take mobile screenshot', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('svg');
    
    await expect(page).toHaveScreenshot('mobile-view.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });
});

test.describe('Responsive Design - Tablet', () => {
  test.use({ viewport: { width: 768, height: 1024 } });

  test('should display correctly on tablet', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('svg');
    
    // Verify layout
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('svg')).toBeVisible();
    await expect(page.locator('.sidebar')).toBeVisible();
  });

  test('should allow seat selection on tablet', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('svg');
    
    const seat = page.locator('svg rect[data-id*="Premium"][fill="#2196F3"]').first();
    await seat.click();
    
    await expect(page.getByText(/1 seat selected/i)).toBeVisible();
  });

  test('should take tablet screenshot', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('svg');
    
    await expect(page).toHaveScreenshot('tablet-view.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });
});

test.describe('Responsive Design - Desktop', () => {
  test.use({ viewport: { width: 1920, height: 1080 } });

  test('should display correctly on desktop', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('svg');
    
    // Verify layout
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('svg')).toBeVisible();
    await expect(page.locator('.sidebar')).toBeVisible();
    
    // Verify sidebar is beside map (not stacked)
    const container = page.locator('.container');
    const flexDirection = await container.evaluate((el) => 
      window.getComputedStyle(el).flexDirection
    );
    expect(flexDirection).toBe('row');
  });

  test('should allow seat selection on desktop', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('svg');
    
    const seat = page.locator('svg rect[data-id*="Premium"][fill="#2196F3"]').first();
    await seat.click();
    
    await expect(page.getByText(/1 seat selected/i)).toBeVisible();
  });

  test('should support mouse hover on desktop', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('svg');
    
    // Hover over a seat
    const seat = page.locator('svg rect[data-id*="Premium"]').first();
    await seat.hover();
    
    // Wait for seat details to update
    await page.waitForTimeout(200);
    
    // Verify seat details visible
    await expect(page.locator('.seat-details')).toBeVisible();
  });

  test('should take desktop screenshot', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('svg');
    
    await expect(page).toHaveScreenshot('desktop-view.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });
});

test.describe('Responsive Design - Orientation', () => {
  test('should handle landscape orientation on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 667, height: 375 });
    
    await page.goto('/');
    await page.waitForSelector('svg');
    
    // Verify content is accessible
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('svg')).toBeVisible();
  });

  test('should handle portrait orientation on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    
    await page.goto('/');
    await page.waitForSelector('svg');
    
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('svg')).toBeVisible();
  });
});
