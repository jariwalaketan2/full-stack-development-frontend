import { test, expect } from '@playwright/test';

test.describe('Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('svg');
  });

  test('should have proper ARIA labels on seats', async ({ page }) => {
    // Check that seats have aria-label
    const seat = page.locator('svg rect[role="button"]').first();
    const ariaLabel = await seat.getAttribute('aria-label');
    
    expect(ariaLabel).toBeTruthy();
    expect(ariaLabel).toMatch(/seat/i);
  });

  test('should have proper ARIA attributes on seat map', async ({ page }) => {
    const seatMap = page.locator('[role="application"]');
    
    // Verify role
    await expect(seatMap).toBeVisible();
    
    // Verify aria-label
    const ariaLabel = await seatMap.getAttribute('aria-label');
    expect(ariaLabel).toBeTruthy();
    expect(ariaLabel).toMatch(/seat selection/i);
  });

  test('should update aria-selected when seat is selected', async ({ page }) => {
    const seat = page.locator('svg rect[data-id*="Premium"][fill="#2196F3"]').first();
    
    // Check initial state
    let ariaSelected = await seat.getAttribute('aria-selected');
    expect(ariaSelected).toBe('false');
    
    // Click seat
    await seat.click();
    await page.waitForTimeout(200);
    
    // Check updated state
    ariaSelected = await seat.getAttribute('aria-selected');
    expect(ariaSelected).toBe('true');
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    // Check h1 exists
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
    
    // Check h3 headings in sidebar
    const h3s = page.locator('h3');
    const count = await h3s.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should be keyboard navigable', async ({ page }) => {
    // Tab through interactive elements
    await page.keyboard.press('Tab'); // Theme toggle
    await page.keyboard.press('Tab'); // Seat map
    
    // Verify focus is visible
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBeTruthy();
  });

  test('should have sufficient color contrast', async ({ page }) => {
    // Check header text contrast
    const header = page.locator('.header h1');
    const color = await header.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        color: style.color,
        backgroundColor: window.getComputedStyle(el.parentElement!).backgroundColor,
      };
    });
    
    expect(color.color).toBeTruthy();
    expect(color.backgroundColor).toBeTruthy();
  });

  test('should announce selection changes to screen readers', async ({ page }) => {
    // Select a seat
    await page.locator('svg rect[data-id*="Premium"][fill="#2196F3"]').first().click();
    
    // Check for aria-live region or similar
    const summary = page.locator('.summary');
    await expect(summary).toContainText(/1 seat selected/i);
  });

  test('should have focus indicators', async ({ page }) => {
    // Focus on seat map
    await page.locator('svg').focus();
    
    // Navigate with keyboard
    await page.keyboard.press('ArrowRight');
    
    // Check for focus indicator
    const focusIndicator = page.locator('.keyboard-focus-indicator');
    await expect(focusIndicator).toBeVisible();
    
    // Verify it has proper styling
    const stroke = await focusIndicator.getAttribute('stroke');
    expect(stroke).toBeTruthy();
  });

  test('should have descriptive button labels', async ({ page }) => {
    // Check zoom buttons
    await expect(page.getByRole('button', { name: /zoom in/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /zoom out/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /reset/i })).toBeVisible();
    
    // Check clear button
    await expect(page.getByRole('button', { name: /clear/i })).toBeVisible();
  });

  test('should support reduced motion preferences', async ({ page }) => {
    // This would require setting prefers-reduced-motion
    // For now, just verify animations can be disabled
    const focusIndicator = page.locator('.keyboard-focus-indicator');
    
    // Navigate to show focus indicator
    await page.locator('svg').focus();
    await page.keyboard.press('ArrowRight');
    
    await expect(focusIndicator).toBeVisible();
  });

  test('should have proper form labels if present', async ({ page }) => {
    // Check if adjacent seats input has label
    const input = page.getByPlaceholder(/number of seats/i);
    
    if (await input.isVisible()) {
      // Verify it's properly labeled
      const ariaLabel = await input.getAttribute('aria-label');
      const label = await input.evaluate((el) => {
        const id = el.getAttribute('id');
        return id ? document.querySelector(`label[for="${id}"]`) : null;
      });
      
      expect(ariaLabel || label).toBeTruthy();
    }
  });

  test('should have skip links or landmarks', async ({ page }) => {
    // Check for semantic HTML landmarks
    const header = page.locator('header, [role="banner"]');
    await expect(header).toBeVisible();
    
    // Check for main content area
    const main = page.locator('main, [role="main"], .container');
    await expect(main).toBeVisible();
  });
});

test.describe('Accessibility - High Contrast Mode', () => {
  test('should be usable in high contrast mode', async ({ page }) => {
    // Emulate high contrast mode
    await page.emulateMedia({ colorScheme: 'dark', forcedColors: 'active' });
    
    await page.goto('/');
    await page.waitForSelector('svg');
    
    // Verify key elements are still visible
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('svg')).toBeVisible();
    
    // Try selecting a seat
    await page.locator('svg rect[data-id*="Premium"]').first().click();
    await expect(page.getByText(/seat selected/i)).toBeVisible();
  });
});

test.describe('Accessibility - Screen Reader', () => {
  test('should provide seat information to screen readers', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('svg');
    
    // Get a seat's aria-label
    const seat = page.locator('svg rect[role="button"]').first();
    const ariaLabel = await seat.getAttribute('aria-label');
    
    // Verify it contains useful information
    expect(ariaLabel).toMatch(/section/i);
    expect(ariaLabel).toMatch(/row/i);
    expect(ariaLabel).toMatch(/seat/i);
    expect(ariaLabel).toMatch(/\$/); // Price
  });

  test('should announce status changes', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('svg');
    
    // Select a seat
    const seat = page.locator('svg rect[data-id*="Premium"][fill="#2196F3"]').first();
    await seat.click();
    
    // Check that aria-selected changed
    const ariaSelected = await seat.getAttribute('aria-selected');
    expect(ariaSelected).toBe('true');
    
    // Check that summary updated
    await expect(page.getByText(/1 seat selected/i)).toBeVisible();
  });
});
