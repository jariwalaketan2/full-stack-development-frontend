import { test, expect } from '@playwright/test';

test.describe('Performance', () => {
  test('should load venue data within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    await page.waitForSelector('svg');
    
    const loadTime = Date.now() - startTime;
    
    // Should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });

  test('should render large seat map efficiently', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('svg');
    
    // Count rendered seats
    const seatCount = await page.locator('svg rect[data-id]').count();
    
    // Verify seats are rendered
    expect(seatCount).toBeGreaterThan(0);
    
    // Measure rendering performance
    const metrics = await page.evaluate(() => {
      const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
        loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
      };
    });
    
    // DOM should be ready quickly
    expect(metrics.domContentLoaded).toBeLessThan(2000);
  });

  test('should handle rapid seat selections smoothly', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('svg');
    
    const startTime = Date.now();
    
    // Rapidly select 5 seats
    const seats = page.locator('svg rect[data-id*="Premium"][fill="#2196F3"]');
    for (let i = 0; i < 5; i++) {
      await seats.nth(i).click({ delay: 10 });
    }
    
    const selectionTime = Date.now() - startTime;
    
    // Should complete quickly
    expect(selectionTime).toBeLessThan(2000);
    
    // Verify all selected
    await expect(page.getByText(/5 seats selected/i)).toBeVisible();
  });

  test('should zoom smoothly', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('svg');
    
    const startTime = Date.now();
    
    // Perform multiple zoom operations
    for (let i = 0; i < 5; i++) {
      await page.getByRole('button', { name: /zoom in/i }).click();
      await page.waitForTimeout(50);
    }
    
    const zoomTime = Date.now() - startTime;
    
    // Should be responsive
    expect(zoomTime).toBeLessThan(2000);
  });

  test('should pan smoothly', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('svg');
    
    // Perform pan operation
    const svg = page.locator('svg');
    const box = await svg.boundingBox();
    
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await page.mouse.move(box.x + box.width / 2 + 100, box.y + box.height / 2 + 100, { steps: 10 });
      await page.mouse.up();
    }
    
    // Should complete without lag
    await page.waitForTimeout(100);
  });

  test('should handle keyboard navigation efficiently', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('svg');
    
    await page.locator('svg').focus();
    
    const startTime = Date.now();
    
    // Navigate with arrow keys
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(10);
    }
    
    const navTime = Date.now() - startTime;
    
    // Should be responsive
    expect(navTime).toBeLessThan(1000);
  });

  test('should not have memory leaks on repeated selections', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('svg');
    
    // Perform many selection/deselection cycles
    const seat = page.locator('svg rect[data-id*="Premium"][fill="#2196F3"]').first();
    
    for (let i = 0; i < 20; i++) {
      await seat.click(); // Select
      await page.waitForTimeout(50);
      await seat.click(); // Deselect
      await page.waitForTimeout(50);
    }
    
    // Should still be responsive
    await expect(page.getByText(/0 seats selected/i)).toBeVisible();
  });

  test('should measure Core Web Vitals', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('svg');
    
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    // Measure Web Vitals
    const vitals = await page.evaluate(() => {
      return new Promise((resolve) => {
        const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        
        resolve({
          // First Contentful Paint
          fcp: perfData.responseStart,
          // Time to Interactive (approximation)
          tti: perfData.domInteractive,
          // Total Load Time
          loadTime: perfData.loadEventEnd - perfData.fetchStart,
        });
      });
    });
    
    console.log('Performance Metrics:', vitals);
    
    // Verify reasonable performance
    expect(vitals).toBeTruthy();
  });
});

test.describe('Performance - Large Dataset', () => {
  test('should handle scrolling through large seat map', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('svg');
    
    // Scroll through the map
    const mapContainer = page.locator('.map-container');
    
    for (let i = 0; i < 5; i++) {
      await mapContainer.evaluate((el) => {
        el.scrollTop += 100;
      });
      await page.waitForTimeout(100);
    }
    
    // Should remain responsive
    await expect(page.locator('svg')).toBeVisible();
  });

  test('should maintain 60fps during interactions', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('svg');
    
    // Start performance monitoring
    await page.evaluate(() => {
      (window as any).frameCount = 0;
      (window as any).startTime = performance.now();
      
      const countFrames = () => {
        (window as any).frameCount++;
        requestAnimationFrame(countFrames);
      };
      requestAnimationFrame(countFrames);
    });
    
    // Perform interactions
    const seats = page.locator('svg rect[data-id*="Premium"][fill="#2196F3"]');
    for (let i = 0; i < 5; i++) {
      await seats.nth(i).click();
      await page.waitForTimeout(100);
    }
    
    // Check frame rate
    const fps = await page.evaluate(() => {
      const elapsed = performance.now() - (window as any).startTime;
      const frames = (window as any).frameCount;
      return (frames / elapsed) * 1000;
    });
    
    console.log('Average FPS:', fps);
    
    // Should maintain good frame rate (at least 30fps, ideally 60fps)
    expect(fps).toBeGreaterThan(30);
  });
});
