const { chromium } = require('playwright');

async function test() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // 收集所有网络请求
  const requests = [];
  page.on('request', req => {
    const url = req.url();
    if (url.includes('mz.bizgo.com') && !url.includes('static') && !url.includes('.js') && !url.includes('.css') && !url.includes('.png') && !url.includes('.jpg')) {
      requests.push({ url, method: req.method() });
    }
  });
  
  // 登录
  await page.goto('https://mz.bizgo.com/login.html', { waitUntil: 'networkidle', timeout: 30000 });
  await page.fill('input[name="username"]', 'kaimuerren');
  await page.fill('input[name="password"]', '888888');
  await page.locator('button').first().click();
  await new Promise(r => setTimeout(r, 5000));
  
  console.log('登录后URL:', page.url());
  
  // 访问产品页面
  await page.goto('https://mz.bizgo.com/wms/product/list', { waitUntil: 'networkidle', timeout: 30000 });
  await new Promise(r => setTimeout(r, 3000));
  
  // 打印所有API请求
  console.log('\n=== 产品页网络请求 ===');
  for (const req of requests) {
    console.log(`${req.method} ${req.url}`);
  }
  
  await browser.close();
}

test();
