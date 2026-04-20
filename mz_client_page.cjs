const { chromium } = require('playwright');

async function test() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // 收集所有网络请求
  const apiRequests = [];
  page.on('request', req => {
    const url = req.url();
    if (url.includes('mz.bizgo.com') && (url.includes('client') || url.includes('Customer') || url.includes('customer'))) {
      apiRequests.push({ url, method: req.method() });
    }
  });
  
  // 登录
  await page.goto('https://mz.bizgo.com/login.html', { waitUntil: 'networkidle', timeout: 30000 });
  await page.fill('input[name="username"]', 'kaimuerren');
  await page.fill('input[name="password"]', '888888');
  await page.locator('button').first().click();
  await new Promise(r => setTimeout(r, 5000));
  
  // 访问客户管理页面
  await page.goto('https://mz.bizgo.com/wms/customer/list', { waitUntil: 'networkidle', timeout: 30000 });
  await new Promise(r => setTimeout(r, 3000));
  
  console.log('客户页面API请求:');
  for (const req of apiRequests) {
    console.log(`  ${req.method} ${req.url}`);
  }
  
  await browser.close();
}

test();
