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
    return await resp.json();
  }, cookieStr);
  
  const products = result.data?.fullList || [];
  console.log('产品总数:', products.length);
  
  // 筛选托科斯的产品 (C03开头)
  const tuokesProducts = products.filter(p => p.sku && p.sku.startsWith('C03'));
  console.log('\n=== 托科斯(C03)产品: 共', tuokesProducts.length, '个 ===\n');
  
  // 显示所有托科斯产品
  for (const p of tuokesProducts) {
    console.log(`${p.sku}\t${p.name}\t售价:${p.salePrice || '暂无价格'}`);
  }
  
  await browser.close();
}

test();
