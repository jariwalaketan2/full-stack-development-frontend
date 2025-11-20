import { Page, expect } from '@playwright/test';

/**
 * Helper utilities for E2E tests
 */

/**
 * Wait for venue to load completely
 */
export async function waitForVenueLoad(page: Page) {
  await page.waitForSelector('svg', { timeout: 10000 });
  await expect(page.locator('h1')).toContainText('Metropolis Arena');
}

/**
 * Select multiple seats by count
 */
export async function selectSeats(page: Page, count: number, section = 'Premium') {
  const seats = page.locator(`svg rect[data-id*="${section}"][fill="#2196F3"]`);
  
  for (let i = 0; i < count; i++) {
    await seats.nth(i).click();
    await page.waitForTimeout(50);
  }
}

/**
 * Get current selection count
 */
export async function getSelectionCount(page: Page): Promise<number> {
  const text = await page.locator('.summary').textContent();
  const match = text?.match(/(\d+)\s+seat/i);
  return match ? parseInt(match[1]) : 0;
}

/**
 * Clear all selections
 */
export async function clearSelections(page: Page) {
  const clearButton = page.getByRole('button', { name: /clear/i });
  if (await clearButton.isVisible()) {
    await clearButton.click();
  }
}

/**
 * Toggle theme
 */
export async function toggleTheme(page: Page) {
  await page.getByRole('button', { name: /theme/i }).click();
  await page.waitForTimeout(300);
}

/**
 * Get current theme
 */
export async function getCurrentTheme(page: Page): Promise<string | null> {
  return await page.locator('html').getAttribute('data-theme');
}

/**
 * Zoom in/out
 */
export async function zoom(page: Page, direction: 'in' | 'out', times = 1) {
  const button = page.getByRole('button', { 
    name: direction === 'in' ? /zoom in/i : /zoom out/i 
  });
  
  for (let i = 0; i < times; i++) {
    await button.click();
    await page.waitForTimeout(100);
  }
}

/**
 * Reset zoom
 */
export async function resetZoom(page: Page) {
  await page.getByRole('button', { name: /reset/i }).click();
  await page.waitForTimeout(300);
}

/**
 * Get current zoom level
 */
export async function getZoomLevel(page: Page): Promise<number> {
  const text = await page.locator('text=/\\d+%/').textContent();
  return text ? parseInt(text) : 100;
}

/**
 * Navigate with keyboard
 */
export async function navigateWithKeyboard(
  page: Page, 
  direction: 'up' | 'down' | 'left' | 'right',
  times = 1
) {
  await page.locator('svg').focus();
  
  const keyMap = {
    up: 'ArrowUp',
    down: 'ArrowDown',
    left: 'ArrowLeft',
    right: 'ArrowRight',
  };
  
  for (let i = 0; i < times; i++) {
    await page.keyboard.press(keyMap[direction]);
    await page.waitForTimeout(50);
  }
}

/**
 * Select seat with keyboard
 */
export async function selectSeatWithKeyboard(page: Page, key: 'Enter' | 'Space' = 'Enter') {
  await page.keyboard.press(key);
  await page.waitForTimeout(100);
}

/**
 * Check if focus indicator is visible
 */
export async function isFocusIndicatorVisible(page: Page): Promise<boolean> {
  const indicator = page.locator('.keyboard-focus-indicator');
  return await indicator.isVisible();
}

/**
 * Get total price from summary
 */
export async function getTotalPrice(page: Page): Promise<number> {
  const text = await page.locator('.summary').textContent();
  const match = text?.match(/\$(\d+)/);
  return match ? parseInt(match[1]) : 0;
}

/**
 * Mock API response
 */
export async function mockVenueAPI(page: Page, response: any) {
  await page.route('**/venue.json', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(response),
    });
  });
}

/**
 * Mock API failure
 */
export async function mockAPIFailure(page: Page, statusCode = 500) {
  await page.route('**/venue.json', (route) => {
    route.fulfill({
      status: statusCode,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Server error' }),
    });
  });
}

/**
 * Wait for loading to complete
 */
export async function waitForLoadingComplete(page: Page) {
  // Wait for loading indicators to disappear
  await page.waitForSelector('svg', { timeout: 10000 });
  await page.waitForLoadState('networkidle');
}

/**
 * Take screenshot with timestamp
 */
export async function takeTimestampedScreenshot(page: Page, name: string) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  await page.screenshot({ 
    path: `test-results/${name}-${timestamp}.png`,
    fullPage: true 
  });
}

/**
 * Check if element is in viewport
 */
export async function isInViewport(page: Page, selector: string): Promise<boolean> {
  return await page.locator(selector).evaluate((el) => {
    const rect = el.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= window.innerHeight &&
      rect.right <= window.innerWidth
    );
  });
}

/**
 * Scroll element into view
 */
export async function scrollIntoView(page: Page, selector: string) {
  await page.locator(selector).evaluate((el) => {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
  await page.waitForTimeout(300);
}

/**
 * Get performance metrics
 */
export async function getPerformanceMetrics(page: Page) {
  return await page.evaluate(() => {
    const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    return {
      domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
      loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
      domInteractive: perfData.domInteractive - perfData.fetchStart,
      firstPaint: performance.getEntriesByType('paint')[0]?.startTime || 0,
    };
  });
}

/**
 * Measure action duration
 */
export async function measureAction(action: () => Promise<void>): Promise<number> {
  const start = Date.now();
  await action();
  return Date.now() - start;
}

/**
 * Wait for animation to complete
 */
export async function waitForAnimation(page: Page, selector: string) {
  await page.locator(selector).evaluate((el) => {
    return Promise.all(
      el.getAnimations().map((animation) => animation.finished)
    );
  });
}

/**
 * Check accessibility violations (basic check)
 */
export async function checkBasicAccessibility(page: Page) {
  // Check for basic accessibility issues
  const issues = await page.evaluate(() => {
    const problems: string[] = [];
    
    // Check for images without alt text
    const images = document.querySelectorAll('img:not([alt])');
    if (images.length > 0) {
      problems.push(`${images.length} images without alt text`);
    }
    
    // Check for buttons without accessible names
    const buttons = document.querySelectorAll('button:not([aria-label]):not([title])');
    buttons.forEach((btn) => {
      if (!btn.textContent?.trim()) {
        problems.push('Button without accessible name');
      }
    });
    
    // Check for form inputs without labels
    const inputs = document.querySelectorAll('input:not([aria-label]):not([id])');
    if (inputs.length > 0) {
      problems.push(`${inputs.length} inputs without labels`);
    }
    
    return problems;
  });
  
  return issues;
}

/**
 * Simulate slow network
 */
export async function simulateSlowNetwork(page: Page) {
  const client = await page.context().newCDPSession(page);
  await client.send('Network.emulateNetworkConditions', {
    offline: false,
    downloadThroughput: 50 * 1024, // 50 KB/s
    uploadThroughput: 20 * 1024,   // 20 KB/s
    latency: 500,                   // 500ms latency
  });
}

/**
 * Reset network conditions
 */
export async function resetNetworkConditions(page: Page) {
  const client = await page.context().newCDPSession(page);
  await client.send('Network.emulateNetworkConditions', {
    offline: false,
    downloadThroughput: -1,
    uploadThroughput: -1,
    latency: 0,
  });
}
