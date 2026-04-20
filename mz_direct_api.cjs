const { chromium } = require('playwright');

async function test() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // 登录获取cookies
  await page.goto('https://mz.bizgo.com/login.html', { waitUntil: 'networkidle', timeout: 30000 });
  await page.fill('input[name="username"]', 'kaimuerren');
  await page.fill('input[name="password"]', '888888');
  await page.locator('button').first().click();
  await new Promise(r => setTimeout(r, 5000));
  
  // 获取cookies
  const cookies = await context.cookies();
  const sessionCookie = cookies.find(c => c.name === 'sid');
  const routeCookie = cookies.find(c => c.name === 'route');
  
  console.log('Session Cookie:', sessionCookie?.value);
  console.log('Route Cookie:', routeCookie?.value);
  
  // 使用fetch直接调用API（通过页面的context）
  const apiResult = await page.evaluate(async () => {
    // 调用产品列表API
    const resp = await fetch('/wms/product/list');
    const text = await resp.text();
    return { status: resp.status, text: text };
  });
  
  console.log('API结果:', JSON.stringify(apiResult));
  
  // 尝试调用另一个API
  const apiResult2 = await page.evaluate(async () => {
    const resp = await fetch('/api/product/list');
    const text = await resp.text();
    return { status: resp.status, text: text };
  });
  
  console.log('API2结果:', JSON.stringify(apiResult2));
  
  await browser.close();
}

test();
