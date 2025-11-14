/**
 * SwiftAPI Training Material Screenshot Generator
 *
 * This E2E test generates screenshots for comprehensive user training material.
 * Covers: Basic Requests, Collections, Environments, and Mock Servers
 */

import { test, Page } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs/promises';

let page: Page;

const TRAINING_IMAGES_PATH = path.join(__dirname, '../../docs/training/images');
const SCREENSHOT_DELAY = 1500; // Wait for UI to settle
const DEV_URL = 'http://localhost:5173';

test.beforeAll(async () => {
  // Ensure training/images directory exists
  await fs.mkdir(TRAINING_IMAGES_PATH, { recursive: true });
});

test.beforeEach(async ({ page: testPage }) => {
  page = testPage;
  await page.goto(DEV_URL);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
});

// ============================================================================
// MODULE 1: GETTING STARTED - FIRST API REQUEST
// ============================================================================

test('T01: Initial landing page', async () => {
  await page.waitForTimeout(SCREENSHOT_DELAY);

  await page.screenshot({
    path: path.join(TRAINING_IMAGES_PATH, 'T01-landing-page.png'),
    fullPage: true,
  });
});

test('T02: Enter first URL', async () => {
  const urlInput = page.locator('input[placeholder*="Enter request URL"]');
  await urlInput.fill('https://api.github.com/users/octocat');

  await page.waitForTimeout(SCREENSHOT_DELAY);

  await page.screenshot({
    path: path.join(TRAINING_IMAGES_PATH, 'T02-enter-url.png'),
    fullPage: true,
  });
});

test('T03: Click Send button', async () => {
  const urlInput = page.locator('input[placeholder*="Enter request URL"]');
  await urlInput.fill('https://api.github.com/users/octocat');

  // Highlight send button
  const sendButton = page.locator('button:has-text("Send")');
  await sendButton.hover();

  await page.waitForTimeout(SCREENSHOT_DELAY);

  await page.screenshot({
    path: path.join(TRAINING_IMAGES_PATH, 'T03-click-send.png'),
    fullPage: true,
  });
});

test('T04: View response', async () => {
  const urlInput = page.locator('input[placeholder*="Enter request URL"]');
  await urlInput.fill('https://api.github.com/users/octocat');

  const sendButton = page.locator('button:has-text("Send")');
  await sendButton.click();

  // Wait for response
  await page.waitForTimeout(3000);

  await page.screenshot({
    path: path.join(TRAINING_IMAGES_PATH, 'T04-view-response.png'),
    fullPage: true,
  });
});

// ============================================================================
// MODULE 2: UNDERSTANDING THE INTERFACE
// ============================================================================

test('T05: Interface overview with annotations', async () => {
  await page.waitForTimeout(SCREENSHOT_DELAY);

  await page.screenshot({
    path: path.join(TRAINING_IMAGES_PATH, 'T05-interface-overview.png'),
    fullPage: true,
  });
});

test('T06: Method selector dropdown', async () => {
  const methodSelector = page.locator('select, button').filter({ hasText: /GET|POST|PUT/ }).first();
  await methodSelector.click();

  await page.waitForTimeout(SCREENSHOT_DELAY);

  await page.screenshot({
    path: path.join(TRAINING_IMAGES_PATH, 'T06-method-selector.png'),
    fullPage: true,
  });
});

test('T07: Request tabs', async () => {
  // Click on Headers tab
  const headersTab = page.locator('button[role="tab"]:has-text("Headers")').first();
  await headersTab.click();

  await page.waitForTimeout(SCREENSHOT_DELAY);

  await page.screenshot({
    path: path.join(TRAINING_IMAGES_PATH, 'T07-request-tabs.png'),
    fullPage: true,
  });
});

// ============================================================================
// MODULE 3: COLLECTIONS - ORGANIZING YOUR WORK
// ============================================================================

test('T08: Collections sidebar', async () => {
  const collectionsTab = page.locator('button:has-text("Collections")');
  await collectionsTab.click();

  await page.waitForTimeout(SCREENSHOT_DELAY);

  await page.screenshot({
    path: path.join(TRAINING_IMAGES_PATH, 'T08-collections-sidebar.png'),
    fullPage: true,
  });
});

test('T09: Create new collection', async () => {
  const collectionsTab = page.locator('button:has-text("Collections")');
  await collectionsTab.click();

  await page.waitForTimeout(500);

  // Click create collection button
  const createButton = page.locator('button:has-text("New Collection"), button:has-text("Create Collection")').first();
  if (await createButton.isVisible()) {
    await createButton.click();
    await page.waitForTimeout(SCREENSHOT_DELAY);
  }

  await page.screenshot({
    path: path.join(TRAINING_IMAGES_PATH, 'T09-create-collection.png'),
    fullPage: true,
  });
});

test('T10: Save request dialog', async () => {
  // Make a request first
  const urlInput = page.locator('input[placeholder*="Enter request URL"]');
  await urlInput.fill('https://api.github.com/users/octocat');

  const sendButton = page.locator('button:has-text("Send")');
  await sendButton.click();
  await page.waitForTimeout(2000);

  // Click Save button
  const saveButton = page.locator('button:has-text("Save")');
  if (await saveButton.isVisible()) {
    await saveButton.click();
    await page.waitForTimeout(SCREENSHOT_DELAY);

    await page.screenshot({
      path: path.join(TRAINING_IMAGES_PATH, 'T10-save-request.png'),
      fullPage: true,
    });
  }
});

// ============================================================================
// MODULE 4: ENVIRONMENTS - MANAGING VARIABLES
// ============================================================================

test('T11: Environment selector', async () => {
  const envSelector = page.locator('select[aria-label*="nvironment"], button[aria-label*="nvironment"]').first();
  await envSelector.hover();

  await page.waitForTimeout(SCREENSHOT_DELAY);

  await page.screenshot({
    path: path.join(TRAINING_IMAGES_PATH, 'T11-environment-selector.png'),
    fullPage: true,
  });
});

test('T12: Using variables in URL', async () => {
  const urlInput = page.locator('input[placeholder*="Enter request URL"]');
  await urlInput.fill('{{base_url}}/users/{{user_id}}');

  await page.waitForTimeout(SCREENSHOT_DELAY);

  await page.screenshot({
    path: path.join(TRAINING_IMAGES_PATH, 'T12-variables-in-url.png'),
    fullPage: true,
  });
});

// ============================================================================
// MODULE 5: MOCK SERVERS - TESTING WITHOUT BACKEND
// ============================================================================

test('T13: Mock Servers panel', async () => {
  const mockServersTab = page.locator('button:has-text("Mock Servers")');
  await mockServersTab.click();

  await page.waitForTimeout(SCREENSHOT_DELAY);

  await page.screenshot({
    path: path.join(TRAINING_IMAGES_PATH, 'T13-mock-servers-panel.png'),
    fullPage: true,
  });
});

test('T14: Create mock server', async () => {
  const mockServersTab = page.locator('button:has-text("Mock Servers")');
  await mockServersTab.click();
  await page.waitForTimeout(500);

  const createButton = page.locator('button:has-text("New Server"), button:has-text("Create Mock Server")').first();
  if (await createButton.isVisible()) {
    await createButton.click();
    await page.waitForTimeout(SCREENSHOT_DELAY);

    await page.screenshot({
      path: path.join(TRAINING_IMAGES_PATH, 'T14-create-mock-server.png'),
      fullPage: true,
    });
  }
});

// ============================================================================
// MODULE 6: ADVANCED FEATURES
// ============================================================================

test('T15: Dark mode toggle', async () => {
  const themeToggle = page.locator('button[aria-label*="Toggle theme"], button[aria-label*="theme"]');
  await themeToggle.hover();

  await page.waitForTimeout(SCREENSHOT_DELAY);

  await page.screenshot({
    path: path.join(TRAINING_IMAGES_PATH, 'T15-theme-toggle.png'),
    fullPage: true,
  });
});

test('T16: Request history', async () => {
  const historyTab = page.locator('button:has-text("History")');
  await historyTab.click();

  await page.waitForTimeout(SCREENSHOT_DELAY);

  await page.screenshot({
    path: path.join(TRAINING_IMAGES_PATH, 'T16-request-history.png'),
    fullPage: true,
  });
});

test('T17: Response tabs (Headers, Cookies)', async () => {
  // Make a request
  const urlInput = page.locator('input[placeholder*="Enter request URL"]');
  await urlInput.fill('https://httpbin.org/get');

  const sendButton = page.locator('button:has-text("Send")');
  await sendButton.click();
  await page.waitForTimeout(2500);

  // Click Headers tab in response
  const responseHeadersTab = page.locator('button[role="tab"]:has-text("Headers")').last();
  if (await responseHeadersTab.isVisible()) {
    await responseHeadersTab.click();
    await page.waitForTimeout(SCREENSHOT_DELAY);

    await page.screenshot({
      path: path.join(TRAINING_IMAGES_PATH, 'T17-response-tabs.png'),
      fullPage: true,
    });
  }
});

test('T18: Generate summary', async () => {
  const screenshotsList = await fs.readdir(TRAINING_IMAGES_PATH);
  const screenshots = screenshotsList.filter((f) => f.endsWith('.png')).sort();

  console.log('\n📸 Generated Training Screenshots:');
  console.log('====================================');
  screenshots.forEach((screenshot, idx) => {
    console.log(`${idx + 1}. ${screenshot}`);
  });
  console.log(`\nTotal: ${screenshots.length} screenshots`);
  console.log(`Location: ${TRAINING_IMAGES_PATH}\n`);
});
