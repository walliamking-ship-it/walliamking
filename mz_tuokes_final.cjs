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
  
  const cookies = await context.cookies();
  const cookieStr = cookies.map(c => `${c.name}=${c.value}`).join('; ');
  
  // 获取客户数据中的ID列表
  const clientData = await page.evaluate(async ({ cookie }) => {
    const resp = await fetch('https://mz.bizgo.com/CXF/rs/crm/client/pc/cacheList', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookie
      },
      body: JSON.stringify({})
    });
    const data = await resp.json();
    return data.data?.fullClientIdMap?.customer || [];
  }, { cookie: cookieStr });
  
  console.log('客户ID数量:', clientData.length);
  
  // 获取产品数据
  const prodData = await page.evaluate(async ({ cookie }) => {
    const resp = await fetch('https://mz.bizgo.com/CXF/rs/prod/cacheList', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookie
      },
      body: JSON.stringify({})
    });
    const data = await resp.json();
    return data.data?.fullList || [];
  }, { cookie: cookieStr });
  
  console.log('产品总数:', prodData.length);
  
  // 筛选托科斯产品
  const tuokesProds = prodData.filter(p => p.sku && p.sku.startsWith('C03'));
  console.log('\n=== 托科斯产品 (C03开头) ===');
  console.log(`共 ${tuokesProds.length} 个产品:\n`);
  console.log('货号\t\t产品名称\t\t\t\t\t\t\t\t\t售价');
  console.log('------------------------------------------------------------------');
  
  for (const p of tuokesProds) {
    const salePrice = p.salePrice !== undefined && p.salePrice !== null ? `¥${p.salePrice}` : '暂无';
    const name = (p.name || '').substring(0, 20);
    console.log(`${p.sku}\t${name.padEnd(20)}\t${salePrice}`);
  }
  
  // 尝试从产品详情中获取价格信息
  console.log('\n\n=== 尝试获取产品详情（含价格）===');
  
  // 获取产品ID列表前几个
  const tuokesIds = tuokesProds.slice(0, 5).map(p => p.id);
  console.log('托科斯产品IDs:', tuokesIds);
  
  const prodDetail = await page.evaluate(async ({ cookie, ids }) => {
    const resp = await fetch('https://mz.bizgo.com/CXF/rs/prod/cache/batch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookie
      },
      body: JSON.stringify({ ids: ids })
    });
    return await resp.json();
  }, { cookie: cookieStr, ids: tuokesIds });
  
  console.log('产品详情返回:', JSON.stringify(prodDetail).substring(0, 500));
  
  await browser.close();
}

test();
