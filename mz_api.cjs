const { chromium } = require('playwright');

async function test() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // 登录
  await page.goto('https://mz.bizgo.com/login.html', { waitUntil: 'networkidle', timeout: 30000 });
  await page.fill('input[placeholder*="账号"], input[name="username"], input[type="text"]', 'kaimuerren');
  await page.fill('input[placeholder*="密码"], input[name="password"], input[type="password"]', '888888');
  await page.click('button[type="submit"], button:has-text("登录"), button:has-text("登 录")');
  await new Promise(r => setTimeout(r, 5000));
  
  console.log('登录成功，URL:', page.url());
  
  // 获取所有cookies
  const cookies = await context.cookies();
  console.log('Cookies:', JSON.stringify(cookies));
  
  // 获取localStorage
  const localStorage = await page.evaluate(() => {
    return window.localStorage;
  });
  console.log('LocalStorage:', JSON.stringify(localStorage));
  
  await browser.close();
}

test();
