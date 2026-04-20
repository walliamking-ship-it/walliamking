const { chromium } = require('playwright');

async function test() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // 收集所有网络请求
  const requests = [];
  page.on('request', req => {
    if (req.url().includes('mz.bizgo.com')) {
      requests.push({
        url: req.url(),
        method: req.method(),
        postData: req.postData()
      });
    }
  });
  
  // 登录
  await page.goto('https://mz.bizgo.com/login.html', { waitUntil: 'networkidle', timeout: 30000 });
  await page.fill('input[placeholder*="账号"]', 'kaimuerren');
  await page.fill('input[placeholder*="密码"]', '888888');
  await page.click('button[type="submit"]');
  await new Promise(r => setTimeout(r, 5000));
  
  console.log('登录成功');
  
  // 访问产品页面
  await page.goto('https://mz.bizgo.com/wms/product/list', { waitUntil: 'networkidle', timeout: 30000 });
  await new Promise(r => setTimeout(r, 5000));
  
  // 打印所有相关的API请求
  console.log('\n=== 网络请求 ===');
  for (const req of requests) {
    if (req.url.includes('api') || req.url.includes('product') || req.url.includes('list')) {
      console.log(`${req.method} ${req.url}`);
      if (req.postData) console.log(`  Body: ${req.postData}`);
    }
  }
  
  await browser.close();
}

test();
