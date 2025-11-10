/**
 * Debug test to capture Monaco Editor loading issues
 */

import { test, expect } from '@playwright/test';

test('debug Monaco Editor loading', async ({ page }) => {
  const consoleMessages: string[] = [];
  const consoleErrors: string[] = [];

  // Capture console messages
  page.on('console', msg => {
    const text = `[${msg.type()}] ${msg.text()}`;
    consoleMessages.push(text);
    if (msg.type() === 'error') {
      consoleErrors.push(text);
    }
  });

  // Capture page errors
  page.on('pageerror', error => {
    consoleErrors.push(`[PAGE ERROR] ${error.message}`);
  });

  // Navigate to the app
  await page.goto('http://localhost:5173');

  // Wait for app to load
  await page.waitForSelector('.url-input', { timeout: 5000 });

  // Enter URL and send request
  await page.locator('.url-input').fill('https://jsonplaceholder.typicode.com/users/1');
  await page.locator('.send-button').click();

  // Wait for response
  await page.waitForSelector('text=/200/', { timeout: 10000 });

  // Wait a bit for Monaco to try to load
  await page.waitForTimeout(3000);

  // Take screenshot
  await page.screenshot({ path: 'test-results/monaco-debug.png', fullPage: true });

  // Print all console messages
  console.log('\n=== CONSOLE MESSAGES ===');
  consoleMessages.forEach(msg => console.log(msg));

  // Print errors
  console.log('\n=== ERRORS ===');
  consoleErrors.forEach(err => console.log(err));

  // Check if Monaco loaded
  const monacoElements = await page.locator('[class*="monaco"]').count();
  console.log(`\n=== Monaco elements found: ${monacoElements} ===`);

  // Get the response viewer HTML
  const responseHTML = await page.locator('[style*="border"]').last().innerHTML();
  console.log('\n=== Response Viewer HTML ===');
  console.log(responseHTML.substring(0, 500));
});
