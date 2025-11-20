import { test, expect } from '@playwright/test';

test.describe('Seat Selection Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for venue data to load
    await page.waitForSelector('svg', { timeout: 10000 });
    await expect(page.locator('h1')).toContainText('Metropolis Arena');
  });

  test('should load application and display venue', async ({ page }) => {
    // Verify header
    await expect(page.locator('h1')).toBeVisible();
    
    // Verify legend is present
    await expect(page.getByText('Available')).toBeVisible();
    await expect(page.getByText('Selected')).toBeVisible();
    await expect(page.getByText('Reserved')).toBeVisible();
    
    // Verify seat map is rendered
    const svg = page.locator('svg');
    await expect(svg).toBeVisible();
    
    // Verify zoom controls
    await expect(page.getByRole('button', { name: /zoom in/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /zoom out/i })).toBeVisible();
  });

  test('should select a seat and update summary', async ({ page }) => {
    // Find and click an available seat
    const availableSeat = page.locator('svg rect[data-id*="Premium"][fill="#2196F3"]').first();
    await availableSeat.click();
    
    // Verify seat appears in selection summary
    await expect(page.getByText(/1 seat selected/i)).toBeVisible();
    
    // Verify subtotal is displayed
    await expect(page.getByText(/subtotal/i)).toBeVisible();
    await expect(page.getByText('$200')).toBeVisible();
  });

  test('should select multiple seats and calculate total', async ({ page }) => {
    // Select 3 Premium seats
    const premiumSeats = page.locator('svg rect[data-id*="Premium"][fill="#2196F3"]');
    
    for (let i = 0; i < 3; i++) {
      await premiumSeats.nth(i).click();
      await page.waitForTimeout(100); // Small delay for state update
    }
    
    // Verify count
    await expect(page.getByText(/3 seats selected/i)).toBeVisible();
    
    // Verify total (3 × $200 = $600)
    await expect(page.getByText('$600')).toBeVisible();
  });

  test('should deselect a seat when clicked again', async ({ page }) => {
    // Select a seat
    const seat = page.locator('svg rect[data-id*="Premium"][fill="#2196F3"]').first();
    await seat.click();
    await expect(page.getByText(/1 seat selected/i)).toBeVisible();
    
    // Click again to deselect
    await seat.click();
    await expect(page.getByText(/0 seats selected/i)).toBeVisible();
  });

  test('should enforce 8-seat limit', async ({ page }) => {
    // Select 8 seats
    const availableSeats = page.locator('svg rect[data-id*="Premium"][fill="#2196F3"]');
    
    for (let i = 0; i < 8; i++) {
      await availableSeats.nth(i).click();
      await page.waitForTimeout(50);
    }
    
    // Verify 8 seats selected
    await expect(page.getByText(/8 seats selected/i)).toBeVisible();
    
    // Try to select 9th seat
    await availableSeats.nth(8).click();
    
    // Should still show 8 seats
    await expect(page.getByText(/8 seats selected/i)).toBeVisible();
    
    // Verify warning message
    await expect(page.getByText(/maximum.*8.*seats/i)).toBeVisible();
  });

  test('should clear all selections', async ({ page }) => {
    // Select multiple seats
    const seats = page.locator('svg rect[data-id*="Premium"][fill="#2196F3"]');
    await seats.nth(0).click();
    await seats.nth(1).click();
    await seats.nth(2).click();
    
    await expect(page.getByText(/3 seats selected/i)).toBeVisible();
    
    // Click clear button
    await page.getByRole('button', { name: /clear/i }).click();
    
    // Verify all cleared
    await expect(page.getByText(/0 seats selected/i)).toBeVisible();
  });

  test('should display seat details on hover/focus', async ({ page }) => {
    // Hover over a seat
    const seat = page.locator('svg rect[data-id*="Premium"]').first();
    await seat.hover();
    
    // Wait for seat details to update
    await page.waitForTimeout(200);
    
    // Verify seat details section shows information
    const seatDetails = page.locator('.seat-details');
    await expect(seatDetails).toBeVisible();
  });

  test('should work with zoom controls', async ({ page }) => {
    // Get initial zoom level
    const zoomDisplay = page.locator('text=/\\d+%/');
    const initialZoom = await zoomDisplay.textContent();
    
    // Click zoom in
    await page.getByRole('button', { name: /zoom in/i }).click();
    await page.waitForTimeout(300);
    
    // Verify zoom increased
    const newZoom = await zoomDisplay.textContent();
    expect(newZoom).not.toBe(initialZoom);
    
    // Click reset
    await page.getByRole('button', { name: /reset/i }).click();
    await page.waitForTimeout(300);
  });

  test('should select seats from different sections', async ({ page }) => {
    // Select a Premium seat
    await page.locator('svg rect[data-id*="Premium"][fill="#2196F3"]').first().click();
    
    // Select a Gold seat
    await page.locator('svg rect[data-id*="Gold"][fill="#2196F3"]').first().click();
    
    // Verify 2 seats selected
    await expect(page.getByText(/2 seats selected/i)).toBeVisible();
    
    // Verify mixed pricing in summary
    const summary = page.locator('.summary');
    await expect(summary).toContainText('Premium');
    await expect(summary).toContainText('Gold');
  });
});

test.describe('Selection Persistence', () => {
  test('should persist selections across page reload', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('svg');
    
    // Select seats
    const seats = page.locator('svg rect[data-id*="Premium"][fill="#2196F3"]');
    await seats.nth(0).click();
    await seats.nth(1).click();
    
    await expect(page.getByText(/2 seats selected/i)).toBeVisible();
    
    // Reload page
    await page.reload();
    await page.waitForSelector('svg');
    
    // Verify selections persisted
    await expect(page.getByText(/2 seats selected/i)).toBeVisible();
  });

  test('should clear persisted selections', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('svg');
    
    // Select seats
    await page.locator('svg rect[data-id*="Premium"][fill="#2196F3"]').first().click();
    await expect(page.getByText(/1 seat selected/i)).toBeVisible();
    
    // Clear selections
    await page.getByRole('button', { name: /clear/i }).click();
    
    // Reload
    await page.reload();
    await page.waitForSelector('svg');
    
    // Verify cleared
    await expect(page.getByText(/0 seats selected/i)).toBeVisible();
  });
});

test.describe('Keyboard Navigation', () => {
  test('should navigate seats with arrow keys', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('svg');
    
    // Focus on the seat map
    await page.locator('svg').focus();
    
    // Press arrow keys to navigate
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowDown');
    
    // Verify focus indicator is visible
    const focusIndicator = page.locator('.keyboard-focus-indicator');
    await expect(focusIndicator).toBeVisible();
  });

  test('should select seat with Enter key', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('svg');
    
    // Focus on seat map
    await page.locator('svg').focus();
    
    // Navigate to a seat
    await page.keyboard.press('ArrowRight');
    
    // Press Enter to select
    await page.keyboard.press('Enter');
    
    // Verify selection
    await expect(page.getByText(/1 seat selected/i)).toBeVisible();
  });

  test('should select seat with Space key', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('svg');
    
    await page.locator('svg').focus();
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('Space');
    
    await expect(page.getByText(/1 seat selected/i)).toBeVisible();
  });

  test('should clear selection with Escape key', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('svg');
    
    // Select a seat
    await page.locator('svg rect[data-id*="Premium"][fill="#2196F3"]').first().click();
    await expect(page.getByText(/1 seat selected/i)).toBeVisible();
    
    // Press Escape
    await page.keyboard.press('Escape');
    
    // Verify cleared
    await expect(page.getByText(/0 seats selected/i)).toBeVisible();
  });
});

test.describe('Adjacent Seats Feature', () => {
  test('should find and select adjacent seats', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('svg');
    
    // Enter number of adjacent seats
    const input = page.getByPlaceholder(/number of seats/i);
    if (await input.isVisible()) {
      await input.fill('3');
      await page.getByRole('button', { name: /find.*adjacent/i }).click();
      
      // Verify 3 seats selected
      await expect(page.getByText(/3 seats selected/i)).toBeVisible();
    }
  });
});
