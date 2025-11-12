/**
 * Playwright E2E Test to Generate Documentation Screenshots
 *
 * This test captures screenshots of SwiftAPI's key features for user documentation.
 */

import { test, ElectronApplication, Page, _electron as electron } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs/promises';

let electronApp: ElectronApplication;
let window: Page;

const DOCS_IMAGES_PATH = path.join(__dirname, '../../docs/images');
const SCREENSHOT_DELAY = 1000; // Wait for UI to settle

test.beforeAll(async () => {
  // Ensure docs/images directory exists
  await fs.mkdir(DOCS_IMAGES_PATH, { recursive: true });

  // Launch Electron app
  electronApp = await electron.launch({
    args: [path.join(__dirname, '../../dist/main/index.js')],
  });

  // Get the first window
  window = await electronApp.firstWindow();

  // Wait for app to load
  await window.waitForLoadState('domcontentloaded');
  await window.waitForTimeout(2000);
});

test.afterAll(async () => {
  await electronApp.close();
});

test('D001: Capture main interface overview', async () => {
  await window.waitForTimeout(SCREENSHOT_DELAY);

  await window.screenshot({
    path: path.join(DOCS_IMAGES_PATH, '01-main-interface.png'),
    fullPage: true,
  });
});

test('D002: Capture simple GET request', async () => {
  // Enter URL
  const urlInput = window.locator('input[placeholder*="Enter request URL"]');
  await urlInput.fill('https://api.github.com/users/octocat');

  await window.waitForTimeout(SCREENSHOT_DELAY);

  await window.screenshot({
    path: path.join(DOCS_IMAGES_PATH, '02-enter-url.png'),
    fullPage: true,
  });

  // Click Send button
  const sendButton = window.locator('button.send-button, button:has-text("Send")');
  await sendButton.click();

  // Wait for response
  await window.waitForTimeout(3000);

  await window.screenshot({
    path: path.join(DOCS_IMAGES_PATH, '03-response-received.png'),
    fullPage: true,
  });
});

test('D003: Capture request tabs (Headers, Body, Auth)', async () => {
  // Click on Headers tab
  const headersTab = window.locator('button[role="tab"]:has-text("Headers")');
  await headersTab.click();
  await window.waitForTimeout(SCREENSHOT_DELAY);

  await window.screenshot({
    path: path.join(DOCS_IMAGES_PATH, '04-headers-tab.png'),
    fullPage: true,
  });

  // Click on Body tab
  const bodyTab = window.locator('button[role="tab"]:has-text("Body")');
  await bodyTab.click();
  await window.waitForTimeout(SCREENSHOT_DELAY);

  await window.screenshot({
    path: path.join(DOCS_IMAGES_PATH, '05-body-tab.png'),
    fullPage: true,
  });

  // Click on Authentication tab
  const authTab = window.locator('button[role="tab"]:has-text("Authentication")');
  await authTab.click();
  await window.waitForTimeout(SCREENSHOT_DELAY);

  await window.screenshot({
    path: path.join(DOCS_IMAGES_PATH, '06-authentication-tab.png'),
    fullPage: true,
  });
});

test('D004: Capture Save Request dialog', async () => {
  // Click Save button
  const saveButton = window.locator('button:has-text("Save")').first();
  await saveButton.click();

  await window.waitForTimeout(SCREENSHOT_DELAY);

  await window.screenshot({
    path: path.join(DOCS_IMAGES_PATH, '07-save-request-dialog.png'),
    fullPage: true,
  });

  // Fill in request name
  const requestNameInput = window.locator('input[placeholder*="request name"], input#request-name');
  await requestNameInput.fill('Get GitHub User');

  await window.waitForTimeout(500);

  await window.screenshot({
    path: path.join(DOCS_IMAGES_PATH, '08-save-request-filled.png'),
    fullPage: true,
  });

  // Create new collection
  const newCollectionButton = window.locator('button:has-text("New Collection")');
  await newCollectionButton.click();

  await window.waitForTimeout(500);

  const collectionNameInput = window.locator('input[placeholder*="collection name"]');
  await collectionNameInput.fill('GitHub API');

  await window.waitForTimeout(500);

  await window.screenshot({
    path: path.join(DOCS_IMAGES_PATH, '09-new-collection.png'),
    fullPage: true,
  });

  // Save the request
  const saveRequestButton = window.locator('button:has-text("Save Request")');
  await saveRequestButton.click();

  await window.waitForTimeout(SCREENSHOT_DELAY);

  await window.screenshot({
    path: path.join(DOCS_IMAGES_PATH, '10-request-saved.png'),
    fullPage: true,
  });
});

test('D005: Capture Collections sidebar', async () => {
  // Collections sidebar should now show the saved request
  await window.waitForTimeout(SCREENSHOT_DELAY);

  await window.screenshot({
    path: path.join(DOCS_IMAGES_PATH, '11-collections-sidebar.png'),
    fullPage: true,
  });

  // Right-click on collection to show context menu
  const collection = window.locator('text="GitHub API"').first();
  await collection.click({ button: 'right' });

  await window.waitForTimeout(500);

  await window.screenshot({
    path: path.join(DOCS_IMAGES_PATH, '12-collection-context-menu.png'),
    fullPage: true,
  });

  // Close context menu
  await window.keyboard.press('Escape');
});

test('D006: Capture Environment management', async () => {
  // Click environment dropdown
  const envDropdown = window.locator('select, button:has-text("Environment")').first();
  await envDropdown.click();

  await window.waitForTimeout(500);

  await window.screenshot({
    path: path.join(DOCS_IMAGES_PATH, '13-environment-dropdown.png'),
    fullPage: true,
  });

  // Click Manage Environments
  const manageEnvButton = window.locator('button:has-text("Manage Environments")');
  if (await manageEnvButton.isVisible()) {
    await manageEnvButton.click();

    await window.waitForTimeout(SCREENSHOT_DELAY);

    await window.screenshot({
      path: path.join(DOCS_IMAGES_PATH, '14-manage-environments.png'),
      fullPage: true,
    });

    // Click Create New Environment
    const createEnvButton = window.locator('button:has-text("Create New Environment")');
    await createEnvButton.click();

    await window.waitForTimeout(500);

    await window.screenshot({
      path: path.join(DOCS_IMAGES_PATH, '15-create-environment.png'),
      fullPage: true,
    });

    // Fill in environment details
    const envNameInput = window.locator('input#env-name');
    await envNameInput.fill('Development');

    await window.waitForTimeout(500);

    await window.screenshot({
      path: path.join(DOCS_IMAGES_PATH, '16-environment-name.png'),
      fullPage: true,
    });

    // Create environment
    const createButton = window.locator('button:has-text("Create")');
    await createButton.click();

    await window.waitForTimeout(SCREENSHOT_DELAY);

    // Add a variable
    const addVarButton = window.locator('button:has-text("Add Variable")');
    await addVarButton.click();

    await window.waitForTimeout(500);

    const varNameInput = window.locator('input[placeholder*="Variable name"]');
    await varNameInput.fill('base_url');

    const varValueInput = window.locator('input[placeholder*="Variable value"]');
    await varValueInput.fill('https://api.github.com');

    await window.waitForTimeout(500);

    await window.screenshot({
      path: path.join(DOCS_IMAGES_PATH, '17-add-variable.png'),
      fullPage: true,
    });

    // Save variable
    const saveVarButton = window.locator('button:has-text("Save")').first();
    await saveVarButton.click();

    await window.waitForTimeout(SCREENSHOT_DELAY);

    await window.screenshot({
      path: path.join(DOCS_IMAGES_PATH, '18-variable-saved.png'),
      fullPage: true,
    });

    // Close dialog
    const closeButton = window.locator('button[aria-label="Close"]');
    await closeButton.click();
  }
});

test('D007: Capture using variables in requests', async () => {
  // Clear URL field and enter variable syntax
  const urlInput = window.locator('input[placeholder*="Enter request URL"]');
  await urlInput.clear();
  await urlInput.fill('{{base_url}}/users/octocat');

  await window.waitForTimeout(SCREENSHOT_DELAY);

  await window.screenshot({
    path: path.join(DOCS_IMAGES_PATH, '19-using-variables.png'),
    fullPage: true,
  });
});

test('D008: Capture keyboard shortcuts tooltip', async () => {
  // Hover over Send button to show tooltip
  const sendButton = window.locator('button.send-button, button:has-text("Send")');
  await sendButton.hover();

  await window.waitForTimeout(1000);

  await window.screenshot({
    path: path.join(DOCS_IMAGES_PATH, '20-keyboard-shortcuts.png'),
    fullPage: true,
  });
});

test('D009: Generate screenshot summary', async () => {
  const screenshotsList = await fs.readdir(DOCS_IMAGES_PATH);
  const screenshots = screenshotsList.filter(f => f.endsWith('.png')).sort();

  console.log('\n📸 Generated Documentation Screenshots:');
  console.log('=====================================');
  screenshots.forEach((screenshot, idx) => {
    console.log(`${idx + 1}. ${screenshot}`);
  });
  console.log(`\nTotal: ${screenshots.length} screenshots`);
  console.log(`Location: ${DOCS_IMAGES_PATH}\n`);
});
