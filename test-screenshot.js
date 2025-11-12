const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto('http://localhost:5173');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'current-layout.png', fullPage: true });
  console.log('Screenshot saved to current-layout.png');
  await browser.close();
})();
