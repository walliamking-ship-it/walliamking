const { chromium } = require('playwright');

async function test() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // 登录
  await page.goto('https://mz.bizgo.com/login.html', { waitUntil: 'networkidle', timeout: 30000 });
  await page.fill('input[name="username"]', 'kaimuerren');
  await page.fill('input[name="password"]', '888888');
  await page.locator('button').first().click();
  await new Promise(r => setTimeout(r, 5000));
  
  // 获取cookies
  const cookies = await context.cookies();
  const cookieStr = cookies.map(c => `${c.name}=${c.value}`).join('; ');
  
  // 调用产品价格API (销售价格列表)
  const priceResult = await page.evaluate(async (cookie) => {
    const resp = await fetch('https://mz.bizgo.com/CXF/rs/bss/account/product/pageList', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookie
      },
      body: JSON.stringify({})
    });
    return await resp.json();
  }, cookieStr);
  
  console.log('价格API结果 keys:', Object.keys(priceResult));
  if (priceResult.data) {
    const dataStr = JSON.stringify(priceResult.data);
    console.log('价格数据长度:', dataStr.length);
    console.log('价格数据前500字:', dataStr.substring(0, 500));
  }
  
  await browser.close();
}

test();
