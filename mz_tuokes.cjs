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
  console.log('\n=== 托科斯(C03)产品数量:', tuokesProducts.length, '===');
  
  // 获取客户列表来查找托科斯的客户ID
  const clients = await page.evaluate(async (cookie) => {
    const resp = await fetch('https://mz.bizgo.com/CXF/rs/crm/client/pc/cacheList', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookie
      },
      body: JSON.stringify({})
    });
    return await resp.json();
  }, cookieStr);
  
  const tuokesClient = (clients.data || []).find(c => c.name && c.name.includes('托科斯'));
  console.log('\n托科斯客户信息:', tuokesClient ? `${tuokesClient.name} (ID:${tuokesClient.id})` : '未找到');
  
  // 显示托科斯的产品（如果有价格信息）
  if (tuokesProducts.length > 0) {
    console.log('\n托科斯产品列表:');
    for (const p of tuokesProducts.slice(0, 50)) {
      console.log(`  ${p.sku} - ${p.name} - 售价:${p.salePrice || '-'}`);
    }
  } else {
    // 如果没有C03开头的，尝试按客户筛选
    console.log('\n未找到C03开头的产品，尝试其他方式...');
    const tuokesProducts2 = products.filter(p => p.customerName && p.customerName.includes('托科斯'));
    console.log('按客户名筛选托科斯产品:', tuokesProducts2.length);
    for (const p of tuokesProducts2.slice(0, 20)) {
      console.log(`  ${p.sku} - ${p.name} - 客户:${p.customerName} - 售价:${p.salePrice || '-'}`);
    }
  }
  
  await browser.close();
}

test();
