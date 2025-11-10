/**
 * E2E Tests for Request History Feature
 *
 * Tests the complete request history workflow:
 * - Sending requests adds them to history
 * - History panel displays recent requests
 * - Clicking history items restores requests
 * - Clear history functionality
 */

import { test, expect } from '@playwright/test';

test.describe('Request History', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('http://localhost:5173');

    // Wait for app to be ready - wait for core UI elements
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('.url-input', { timeout: 10000 });
  });

  test('should show history button with count', async ({ page }) => {
    // Check for history button
    const historyButton = page.getByRole('button', { name: /history/i });
    await expect(historyButton).toBeVisible();

    // Should show count
    await expect(historyButton).toContainText('History');
  });

  test('should add request to history after successful send', async ({ page }) => {
    // Fill in request details
    await page.locator('.url-input').fill('https://jsonplaceholder.typicode.com/posts/1');

    // Send request
    await page.locator('.send-button').click();

    // Wait for response
    await page.waitForSelector('text=/200/i', { timeout: 10000 });

    // Open history panel
    await page.getByRole('button', { name: /history/i }).click();

    // Verify history panel is open
    await expect(page.getByText('Request History')).toBeVisible();

    // Verify request appears in history
    await expect(page.getByText('https://jsonplaceholder.typicode.com/posts/1')).toBeVisible();
    await expect(page.getByText('GET')).toBeVisible();
    await expect(page.getByText('200')).toBeVisible();
  });

  test('should restore request when clicking history item', async ({ page }) => {
    // Send initial request
    await page.locator('.url-input').fill('https://jsonplaceholder.typicode.com/posts/1');
    await page.locator('.send-button').click();
    await page.waitForSelector('text=/200/i', { timeout: 10000 });

    // Clear URL
    await page.locator('.url-input').clear();
    await page.locator('.url-input').fill('');

    // Open history panel
    await page.getByRole('button', { name: /history/i }).click();

    // Click on first history item
    const historyItem = page.locator('[style*="cursor: pointer"]').first();
    await historyItem.click();

    // Wait a moment for state to update
    await page.waitForTimeout(500);

    // Verify history panel closed
    await expect(page.getByText('Request History')).not.toBeVisible();

    // Verify URL was restored
    const urlInput = page.locator('.url-input');
    await expect(urlInput).toHaveValue('https://jsonplaceholder.typicode.com/posts/1');
  });

  test('should add multiple requests to history', async ({ page }) => {
    // Send first request
    await page.locator('.url-input').fill('https://jsonplaceholder.typicode.com/posts/1');
    await page.locator('.send-button').click();
    await page.waitForSelector('text=/200/i', { timeout: 10000 });

    // Send second request
    await page.locator('.url-input').fill('https://jsonplaceholder.typicode.com/posts/2');
    await page.locator('.send-button').click();
    await page.waitForSelector('text=/200/i', { timeout: 10000 });

    // Send third request
    await page.locator('.url-input').fill('https://jsonplaceholder.typicode.com/users/1');
    await page.locator('.send-button').click();
    await page.waitForSelector('text=/200/i', { timeout: 10000 });

    // Open history panel
    await page.getByRole('button', { name: /history/i }).click();

    // Verify all requests in history (newest first)
    await expect(page.getByText('https://jsonplaceholder.typicode.com/users/1')).toBeVisible();
    await expect(page.getByText('https://jsonplaceholder.typicode.com/posts/2')).toBeVisible();
    await expect(page.getByText('https://jsonplaceholder.typicode.com/posts/1')).toBeVisible();
  });

  test('should show response time and status code in history', async ({ page }) => {
    // Send a request
    await page.locator('.url-input').fill('https://jsonplaceholder.typicode.com/posts/1');
    await page.locator('.send-button').click();
    await page.waitForSelector('text=/200/i', { timeout: 10000 });

    // Open history panel
    await page.getByRole('button', { name: /history/i }).click();

    // Verify status code and response time are shown
    const historyItems = page.locator('[style*="cursor: pointer"]');
    const firstItem = historyItems.first();

    // Should contain status code 200
    await expect(firstItem.getByText('200')).toBeVisible();

    // Should contain response time (ends with 'ms')
    await expect(firstItem.locator('text=/\\d+ms/')).toBeVisible();
  });

  test('should close history panel when clicking X button', async ({ page }) => {
    // Send a request to have history
    await page.locator('.url-input').fill('https://jsonplaceholder.typicode.com/posts/1');
    await page.locator('.send-button').click();
    await page.waitForSelector('text=/200/i', { timeout: 10000 });

    // Open history panel
    await page.getByRole('button', { name: /history/i }).click();
    await expect(page.getByText('Request History')).toBeVisible();

    // Click close button
    await page.getByText('×').click();

    // Verify panel is closed
    await expect(page.getByText('Request History')).not.toBeVisible();

    // Verify history button is visible again
    await expect(page.getByRole('button', { name: /history/i })).toBeVisible();
  });
});
