/**
 * E2E Tests for Authentication Feature
 *
 * Tests the complete authentication workflow:
 * - Select different auth types
 * - Enter credentials
 * - Verify auth headers are sent correctly
 * - Test all 4 auth methods: None, API Key, Bearer, Basic
 */

import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('http://localhost:5173');

    // Wait for app to be ready - wait for core UI elements
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('.url-input', { timeout: 10000 });
  });

  test('should show Authentication dropdown with default "No Auth"', async ({ page }) => {
    // Find Authentication section
    const authLabel = page.getByText('Authentication', { exact: true });
    await expect(authLabel).toBeVisible();

    // Find dropdown (last select element on page)
    const authDropdown = page.locator('select').last();
    await expect(authDropdown).toBeVisible();

    // Verify default value is "No Auth"
    await expect(authDropdown).toHaveValue('none');
  });

  test('should show API Key inputs when selecting API Key auth', async ({ page }) => {
    // Select API Key from dropdown
    const authDropdown = page.locator('select').last();
    await authDropdown.selectOption('api_key');

    // Verify API Key inputs appear
    await expect(page.getByPlaceholder(/header name/i)).toBeVisible();
    await expect(page.getByPlaceholder(/api key value/i)).toBeVisible();
  });

  test('should show Bearer Token input when selecting Bearer auth', async ({ page }) => {
    // Select Bearer from dropdown
    const authDropdown = page.locator('select').last();
    await authDropdown.selectOption('bearer');

    // Verify Bearer input appears
    await expect(page.getByPlaceholder(/bearer token/i)).toBeVisible();

    // Verify API Key inputs are gone
    await expect(page.getByPlaceholder(/header name/i)).not.toBeVisible();
  });

  test('should show username/password inputs when selecting Basic Auth', async ({ page }) => {
    // Select Basic Auth from dropdown
    const authDropdown = page.locator('select').last();
    await authDropdown.selectOption('basic');

    // Verify username and password inputs appear
    await expect(page.getByPlaceholder('Username')).toBeVisible();
    await expect(page.getByPlaceholder('Password')).toBeVisible();
  });

  test('should hide all auth inputs when selecting No Auth', async ({ page }) => {
    // First set to API Key to have inputs visible
    const authDropdown = page.locator('select').last();
    await authDropdown.selectOption('api_key');
    await expect(page.getByPlaceholder(/header name/i)).toBeVisible();

    // Switch to No Auth
    await authDropdown.selectOption('none');

    // Verify all auth inputs are hidden
    await expect(page.getByPlaceholder(/header name/i)).not.toBeVisible();
    await expect(page.getByPlaceholder(/bearer token/i)).not.toBeVisible();
    await expect(page.getByPlaceholder('Username')).not.toBeVisible();
    await expect(page.getByPlaceholder('Password')).not.toBeVisible();
  });

  test('should send request with Bearer token', async ({ page }) => {
    // Set up Bearer auth
    const authDropdown = page.locator('select').last();
    await authDropdown.selectOption('bearer');

    const bearerInput = page.getByPlaceholder(/bearer token/i);
    await bearerInput.fill('test-bearer-token-123');

    // Set URL to httpbin which echoes headers back
    await page.locator('.url-input').fill('https://httpbin.org/headers');

    // Send request
    await page.locator('.send-button').click();

    // Wait for response
    await page.waitForSelector('text=/200/i', { timeout: 15000 });

    // Verify response contains our auth header
    const responseContainer = page.locator('[class*="monaco-editor"]').or(page.locator('pre'));
    await expect(responseContainer).toBeVisible();

    // Get text content and verify
    const responseBody = await page.textContent('body');
    expect(responseBody).toContain('Bearer test-bearer-token-123');
  });

  test('should send request with API Key', async ({ page }) => {
    // Set up API Key auth
    const authDropdown = page.locator('select').last();
    await authDropdown.selectOption('api_key');

    // Fill in API Key details
    await page.getByPlaceholder(/header name/i).fill('X-Custom-API-Key');
    await page.getByPlaceholder(/api key value/i).fill('my-secret-key-456');

    // Set URL to httpbin
    await page.locator('.url-input').fill('https://httpbin.org/headers');

    // Send request
    await page.locator('.send-button').click();

    // Wait for response
    await page.waitForSelector('text=/200/i', { timeout: 15000 });

    // Verify response contains custom header
    const responseBody = await page.textContent('body');
    expect(responseBody).toContain('X-Custom-API-Key');
    expect(responseBody).toContain('my-secret-key-456');
  });

  test('should send request with Basic Auth', async ({ page }) => {
    // Set up Basic Auth
    const authDropdown = page.locator('select').last();
    await authDropdown.selectOption('basic');

    // Fill in credentials
    await page.getByPlaceholder('Username').fill('testuser');
    await page.getByPlaceholder('Password').fill('testpass');

    // Use httpbin's basic auth endpoint that accepts testuser/testpass
    await page.locator('.url-input').fill('https://httpbin.org/basic-auth/testuser/testpass');

    // Send request
    await page.locator('.send-button').click();

    // Wait for response - should succeed with 200
    await page.waitForSelector('text=/200/i', { timeout: 15000 });

    // Verify successful authentication
    const responseBody = await page.textContent('body');
    expect(responseBody).toContain('authenticated');
    expect(responseBody).toContain('true');
  });

  test('should send request without auth when set to No Auth', async ({ page }) => {
    // Set to No Auth (default)
    const authDropdown = page.locator('select').last();
    await authDropdown.selectOption('none');

    // Set URL
    await page.locator('.url-input').fill('https://httpbin.org/headers');

    // Send request
    await page.locator('.send-button').click();

    // Wait for response
    await page.waitForSelector('text=/200/i', { timeout: 15000 });

    // Get response
    const responseBody = await page.textContent('body');

    // Should not have Bearer prefix in Authorization
    if (responseBody.includes('Authorization')) {
      expect(responseBody).not.toContain('Bearer test-bearer');
    }
  });

  test('should persist auth settings when switching between requests', async ({ page }) => {
    // Set up Bearer auth
    const authDropdown = page.locator('select').last();
    await authDropdown.selectOption('bearer');
    const bearerInput = page.getByPlaceholder(/bearer token/i);
    await bearerInput.fill('persistent-token');

    // Send first request
    await page.locator('.url-input').fill('https://httpbin.org/get');
    await page.locator('.send-button').click();
    await page.waitForSelector('text=/200/i', { timeout: 15000 });

    // Change URL and send another request
    await page.locator('.url-input').fill('https://httpbin.org/headers');
    await page.locator('.send-button').click();
    await page.waitForSelector('text=/200/i', { timeout: 15000 });

    // Verify auth is still set
    await expect(authDropdown).toHaveValue('bearer');
    await expect(bearerInput).toHaveValue('persistent-token');

    // Verify request still includes auth
    const responseBody = await page.textContent('body');
    expect(responseBody).toContain('Bearer persistent-token');
  });

  test('should update auth when changing credentials', async ({ page }) => {
    // Set up API Key
    const authDropdown = page.locator('select').last();
    await authDropdown.selectOption('api_key');

    const headerInput = page.getByPlaceholder(/header name/i);
    const valueInput = page.getByPlaceholder(/api key value/i);

    // Set initial values
    await headerInput.fill('X-Initial-Key');
    await valueInput.fill('initial-value');

    // Send request
    await page.locator('.url-input').fill('https://httpbin.org/headers');
    await page.locator('.send-button').click();
    await page.waitForSelector('text=/200/i', { timeout: 15000 });

    let responseBody = await page.textContent('body');
    expect(responseBody).toContain('X-Initial-Key');
    expect(responseBody).toContain('initial-value');

    // Update credentials
    await headerInput.fill('X-Updated-Key');
    await valueInput.fill('updated-value');

    // Send another request
    await page.locator('.send-button').click();
    await page.waitForSelector('text=/200/i', { timeout: 15000 });

    // Wait for response to update
    await page.waitForTimeout(1000);

    // Verify updated auth is used
    responseBody = await page.textContent('body');
    expect(responseBody).toContain('X-Updated-Key');
    expect(responseBody).toContain('updated-value');
    expect(responseBody).not.toContain('X-Initial-Key');
  });
});
