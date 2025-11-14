/**
 * Playwright E2E Test to Generate Documentation Screenshots (Browser Mode)
 *
 * This test captures screenshots of SwiftAPI's key features using the browser dev server.
 */

import { test, Page } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs/promises';

let page: Page;

const DOCS_IMAGES_PATH = path.join(__dirname, '../../docs/images');
const SCREENSHOT_DELAY = 1000; // Wait for UI to settle
const DEV_URL = 'http://localhost:5173';

test.beforeAll(async () => {
  // Ensure docs/images directory exists
  await fs.mkdir(DOCS_IMAGES_PATH, { recursive: true });
});

test.beforeEach(async ({ page: testPage }) => {
  page = testPage;
  await page.goto(DEV_URL);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
});

test('S001: Capture main interface overview', async () => {
  await page.waitForTimeout(SCREENSHOT_DELAY);

  await page.screenshot({
    path: path.join(DOCS_IMAGES_PATH, '01-main-interface.png'),
    fullPage: true,
  });
});

test('S002: Capture dark mode', async () => {
  // Click theme toggle button
  const themeToggle = page.locator('button[aria-label="Toggle theme"]');
  await themeToggle.click();

  await page.waitForTimeout(SCREENSHOT_DELAY);

  await page.screenshot({
    path: path.join(DOCS_IMAGES_PATH, '02-dark-mode.png'),
    fullPage: true,
  });

  // Toggle back to light mode
  await themeToggle.click();
  await page.waitForTimeout(500);
});

test('S003: Capture simple GET request', async () => {
  // Enter URL
  const urlInput = page.locator('input[placeholder*="Enter request URL"]');
  await urlInput.fill('https://api.github.com/users/octocat');

  await page.waitForTimeout(SCREENSHOT_DELAY);

  await page.screenshot({
    path: path.join(DOCS_IMAGES_PATH, '03-enter-url.png'),
    fullPage: true,
  });

  // Click Send button
  const sendButton = page.locator('button:has-text("Send")');
  await sendButton.click();

  // Wait for response
  await page.waitForTimeout(3000);

  await page.screenshot({
    path: path.join(DOCS_IMAGES_PATH, '04-response-received.png'),
    fullPage: true,
  });
});

test('S004: Capture response tabs', async () => {
  // First make a request to have response data
  const urlInput = page.locator('input[placeholder*="Enter request URL"]');
  await urlInput.fill('https://httpbin.org/get');

  const sendButton = page.locator('button:has-text("Send")');
  await sendButton.click();
  await page.waitForTimeout(3000);

  // Click on Headers tab in response viewer
  const responseHeadersTab = page.locator('button[role="tab"]:has-text("Headers")').last();
  await responseHeadersTab.click();
  await page.waitForTimeout(SCREENSHOT_DELAY);

  await page.screenshot({
    path: path.join(DOCS_IMAGES_PATH, '05-response-headers.png'),
    fullPage: true,
  });

  // Click on Cookies tab
  const cookiesTab = page.locator('button[role="tab"]:has-text("Cookies")');
  if (await cookiesTab.isVisible()) {
    await cookiesTab.click();
    await page.waitForTimeout(SCREENSHOT_DELAY);

    await page.screenshot({
      path: path.join(DOCS_IMAGES_PATH, '06-response-cookies.png'),
      fullPage: true,
    });
  }
});

test('S005: Capture request tabs (Headers, Body, Auth)', async () => {
  // Click on Headers tab
  const headersTab = page.locator('button[role="tab"]:has-text("Headers")').first();
  await headersTab.click();
  await page.waitForTimeout(SCREENSHOT_DELAY);

  await page.screenshot({
    path: path.join(DOCS_IMAGES_PATH, '07-request-headers-tab.png'),
    fullPage: true,
  });

  // Click on Body tab
  const bodyTab = page.locator('button[role="tab"]:has-text("Body")');
  await bodyTab.click();
  await page.waitForTimeout(SCREENSHOT_DELAY);

  await page.screenshot({
    path: path.join(DOCS_IMAGES_PATH, '08-request-body-tab.png'),
    fullPage: true,
  });

  // Click on Authentication tab
  const authTab = page.locator('button[role="tab"]:has-text("Authentication")');
  await authTab.click();
  await page.waitForTimeout(SCREENSHOT_DELAY);

  await page.screenshot({
    path: path.join(DOCS_IMAGES_PATH, '09-authentication-tab.png'),
    fullPage: true,
  });
});

test('S006: Capture Collections sidebar', async () => {
  // Click Collections tab
  const collectionsTab = page.locator('button:has-text("Collections")');
  await collectionsTab.click();
  await page.waitForTimeout(SCREENSHOT_DELAY);

  await page.screenshot({
    path: path.join(DOCS_IMAGES_PATH, '10-collections-sidebar.png'),
    fullPage: true,
  });
});

test('S007: Capture History panel', async () => {
  // Click History tab
  const historyTab = page.locator('button:has-text("History")');
  await historyTab.click();
  await page.waitForTimeout(SCREENSHOT_DELAY);

  await page.screenshot({
    path: path.join(DOCS_IMAGES_PATH, '11-history-panel.png'),
    fullPage: true,
  });
});

test('S008: Capture Mock Servers panel', async () => {
  // Click Mock Servers tab
  const mockServersTab = page.locator('button:has-text("Mock Servers")');
  await mockServersTab.click();
  await page.waitForTimeout(SCREENSHOT_DELAY);

  await page.screenshot({
    path: path.join(DOCS_IMAGES_PATH, '12-mock-servers-panel.png'),
    fullPage: true,
  });
});

test('S009: Generate screenshot summary', async () => {
  const screenshotsList = await fs.readdir(DOCS_IMAGES_PATH);
  const screenshots = screenshotsList.filter((f) => f.endsWith('.png')).sort();

  console.log('\n📸 Generated Documentation Screenshots:');
  console.log('=====================================');
  screenshots.forEach((screenshot, idx) => {
    console.log(`${idx + 1}. ${screenshot}`);
  });
  console.log(`\nTotal: ${screenshots.length} screenshots`);
  console.log(`Location: ${DOCS_IMAGES_PATH}\n`);
});
