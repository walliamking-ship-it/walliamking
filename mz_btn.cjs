const { chromium } = require('playwright');

async function test() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1920, height: 1080 });
  
  await page.goto('https://mz.bizgo.com/login.html', { waitUntil: 'networkidle', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));
  
  // 查找所有按钮
  const buttons = await page.locator('button').all();
  console.log('按钮数量:', buttons.length);
  for (let i = 0; i < buttons.length; i++) {
    const btn = buttons[i];
    const text = await btn.textContent();
    const type = await btn.getAttribute('type');
    console.log(`  [${i}] text="${text}", type=${type}`);
  }
  
  await browser.close();
}

test();
