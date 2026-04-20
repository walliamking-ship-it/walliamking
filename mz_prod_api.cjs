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
  console.log('Cookie:', cookieStr.substring(0, 100) + '...');
  
  // 调用产品列表API
  const result = await page.evaluate(async (cookie) => {
    const resp = await fetch('https://mz.bizgo.com/CXF/rs/prod/cacheList', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookie
      },
      body: JSON.stringify({})
    });
    const data = await resp.json();
    return data;
  }, cookieStr);
  
  console.log('\n=== 产品列表API结果 ===');
  if (result.data) {
    console.log('产品总数:', result.data.length);
    // 显示前10个产品
    for (const p of result.data.slice(0, 10)) {
      console.log(`  ${p.productCode} - ${p.productName} - 客户:${p.customerName || '-'} - 售价:${p.salePrice}`);
    }
  } else {
    console.log('结果:', JSON.stringify(result).substring(0, 500));
  }
  
  await browser.close();
}

test();
