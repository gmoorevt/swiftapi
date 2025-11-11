/**
 * E2E Test: Collections Feature
 *
 * Tests the collections sidebar, save dialog, and request loading
 */

import { test, expect } from '@playwright/test';

test.describe('Collections Feature', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('domcontentloaded');
    // Wait for the app to render
    await page.waitForSelector('aside[aria-label="Collections"]', { timeout: 10000 });
  });

  test('should show collections sidebar with empty state', async ({ page }) => {
    // Verify sidebar is visible
    const sidebar = page.locator('aside[aria-label="Collections"]');
    await expect(sidebar).toBeVisible();

    // Verify empty state message
    await expect(page.getByText(/no collections yet/i)).toBeVisible();

    // Verify "Create Collection" button exists
    await expect(page.getByRole('button', { name: /create collection/i })).toBeVisible();
  });

  test('should create a new collection', async ({ page }) => {
    // Click Create Collection button
    await page.getByRole('button', { name: /create collection/i }).click();

    // Type collection name
    const input = page.getByPlaceholder(/collection name/i);
    await expect(input).toBeVisible();
    await input.fill('Test Collection');
    await input.press('Enter');

    // Verify collection appears in sidebar
    await expect(page.getByText(/Test Collection/)).toBeVisible();
  });

  test('should show Save button and open dialog', async ({ page }) => {
    // Verify Save button exists
    const saveButton = page.getByRole('button', { name: /save request/i });
    await expect(saveButton).toBeVisible();

    // Click Save button
    await saveButton.click();

    // Verify dialog opens
    await expect(page.getByText(/save request to collection/i)).toBeVisible();
  });

  test('should create collection from save dialog', async ({ page }) => {
    // Click Save button
    await page.getByRole('button', { name: /save request/i }).click();

    // Select "Create new collection" option
    const collectionSelect = page.locator('select').first();
    await collectionSelect.selectOption({ label: 'Create new collection' });

    // Fill in new collection name
    const collectionInput = page.getByPlaceholder(/new collection name/i);
    await expect(collectionInput).toBeVisible();
    await collectionInput.fill('API Tests');

    // Fill in request name
    const requestInput = page.getByPlaceholder(/request name/i);
    await requestInput.fill('Get Users');

    // Click Save
    await page.getByRole('button', { name: /^save$/i }).click();

    // Verify success message
    await expect(page.getByText(/saved successfully/i)).toBeVisible();

    // Close dialog
    await page.waitForTimeout(1500); // Wait for auto-close

    // Verify collection appears in sidebar
    await expect(page.getByText(/API Tests/)).toBeVisible();
  });

  test('should save request with variables preserved', async ({ page }) => {
    // First create a collection
    await page.getByRole('button', { name: /create collection/i }).click();
    const collectionInput = page.getByPlaceholder(/collection name/i);
    await collectionInput.fill('Variables Test');
    await collectionInput.press('Enter');

    // Enter URL with variables
    const urlInput = page.locator('input[placeholder*="Enter URL"]');
    await urlInput.fill('https://api.example.com/{{endpoint}}');

    // Click Save
    await page.getByRole('button', { name: /save request/i }).click();

    // Fill save dialog
    const requestNameInput = page.getByPlaceholder(/request name/i);
    await requestNameInput.fill('Test Request');

    // Select the collection
    const select = page.locator('select').first();
    await select.selectOption({ label: 'Variables Test' });

    // Save
    await page.getByRole('button', { name: /^save$/i }).click();

    // Wait for success and close
    await page.waitForTimeout(1500);

    // Verify the URL still contains variables
    const currentUrl = await urlInput.inputValue();
    expect(currentUrl).toContain('{{endpoint}}');
  });

  test('should expand collection and show saved request', async ({ page }) => {
    // Create collection and save a request
    await page.getByRole('button', { name: /create collection/i }).click();
    const collectionInput = page.getByPlaceholder(/collection name/i);
    await collectionInput.fill('My Collection');
    await collectionInput.press('Enter');

    // Save a request
    await page.getByRole('button', { name: /save request/i }).click();
    const requestInput = page.getByPlaceholder(/request name/i);
    await requestInput.fill('Test Request');
    const select = page.locator('select').first();
    await select.selectOption({ label: 'My Collection' });
    await page.getByRole('button', { name: /^save$/i }).click();
    await page.waitForTimeout(1500);

    // Click collection to expand
    await page.getByText(/My Collection/).click();

    // Verify request appears
    await expect(page.getByText('Test Request')).toBeVisible();
  });

  test('should load saved request when clicked', async ({ page }) => {
    // Create collection
    await page.getByRole('button', { name: /create collection/i }).click();
    const collectionInput = page.getByPlaceholder(/collection name/i);
    await collectionInput.fill('Load Test');
    await collectionInput.press('Enter');

    // Enter URL
    const urlInput = page.locator('input[placeholder*="Enter URL"]');
    await urlInput.fill('https://api.example.com/test');

    // Save request
    await page.getByRole('button', { name: /save request/i }).click();
    const requestInput = page.getByPlaceholder(/request name/i);
    await requestInput.fill('Load Test Request');
    const select = page.locator('select').first();
    await select.selectOption({ label: 'Load Test' });
    await page.getByRole('button', { name: /^save$/i }).click();
    await page.waitForTimeout(1500);

    // Change URL to something different
    await urlInput.fill('https://different-url.com');

    // Expand collection
    await page.getByText(/Load Test/).click();

    // Click the saved request
    await page.getByText('Load Test Request').click();

    // Verify URL is loaded
    await page.waitForTimeout(500);
    const loadedUrl = await urlInput.inputValue();
    expect(loadedUrl).toBe('https://api.example.com/test');
  });
});
