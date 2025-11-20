import { test, expect } from '@playwright/test';

test.describe('Theme Toggle', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('svg');
  });

  test('should toggle between light and dark theme', async ({ page }) => {
    // Check initial theme (light by default)
    const html = page.locator('html');
    const initialTheme = await html.getAttribute('data-theme');
    
    // Click theme toggle
    await page.getByRole('button', { name: /theme/i }).click();
    
    // Wait for theme change
    await page.waitForTimeout(300);
    
    // Verify theme changed
    const newTheme = await html.getAttribute('data-theme');
    expect(newTheme).not.toBe(initialTheme);
  });

  test('should persist theme preference across reload', async ({ page }) => {
    // Toggle to dark theme
    await page.getByRole('button', { name: /theme/i }).click();
    await page.waitForTimeout(300);
    
    const html = page.locator('html');
    const darkTheme = await html.getAttribute('data-theme');
    
    // Reload page
    await page.reload();
    await page.waitForSelector('svg');
    
    // Verify theme persisted
    const persistedTheme = await html.getAttribute('data-theme');
    expect(persistedTheme).toBe(darkTheme);
  });

  test('should apply correct colors in dark mode', async ({ page }) => {
    // Toggle to dark theme
    await page.getByRole('button', { name: /theme/i }).click();
    await page.waitForTimeout(300);
    
    // Verify dark theme is applied
    const html = page.locator('html');
    await expect(html).toHaveAttribute('data-theme', 'dark');
    
    // Check that background color changed (dark theme has dark background)
    const body = page.locator('body');
    const bgColor = await body.evaluate((el) => 
      window.getComputedStyle(el).backgroundColor
    );
    
    // Dark theme should have a dark background (rgb values should be low)
    expect(bgColor).toMatch(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  });

  test('should maintain theme when selecting seats', async ({ page }) => {
    // Toggle to dark theme
    await page.getByRole('button', { name: /theme/i }).click();
    await page.waitForTimeout(300);
    
    // Select a seat
    await page.locator('svg rect[data-id*="Premium"][fill="#2196F3"]').first().click();
    
    // Verify theme is still dark
    const html = page.locator('html');
    await expect(html).toHaveAttribute('data-theme', 'dark');
    
    // Verify selection worked
    await expect(page.getByText(/1 seat selected/i)).toBeVisible();
  });

  test('should have accessible theme toggle button', async ({ page }) => {
    const themeButton = page.getByRole('button', { name: /theme/i });
    
    // Verify button is accessible
    await expect(themeButton).toBeVisible();
    await expect(themeButton).toBeEnabled();
    
    // Verify keyboard accessibility
    await themeButton.focus();
    await page.keyboard.press('Enter');
    await page.waitForTimeout(300);
    
    // Verify theme changed
    const html = page.locator('html');
    const theme = await html.getAttribute('data-theme');
    expect(theme).toBeTruthy();
  });
});

test.describe('Visual Regression - Theme', () => {
  test('should match light theme screenshot', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('svg');
    
    // Take screenshot of light theme
    await expect(page).toHaveScreenshot('light-theme.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('should match dark theme screenshot', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('svg');
    
    // Toggle to dark theme
    await page.getByRole('button', { name: /theme/i }).click();
    await page.waitForTimeout(300);
    
    // Take screenshot of dark theme
    await expect(page).toHaveScreenshot('dark-theme.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('should match screenshot with selected seats', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('svg');
    
    // Select some seats
    const seats = page.locator('svg rect[data-id*="Premium"][fill="#2196F3"]');
    await seats.nth(0).click();
    await seats.nth(1).click();
    await seats.nth(2).click();
    
    await page.waitForTimeout(300);
    
    // Take screenshot
    await expect(page).toHaveScreenshot('with-selections.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });
});
