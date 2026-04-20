const { chromium } = require('playwright');

async function test() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // 登录秒账
  await page.goto('https://mz.bizgo.com/login.html', { waitUntil: 'networkidle', timeout: 30000 });
  await page.fill('input[name="username"]', 'kaimuerren');
  await page.fill('input[name="password"]', '888888');
  await page.locator('button').first().click();
  await new Promise(r => setTimeout(r, 5000));
  
  const cookies = await context.cookies();
  const cookieStr = cookies.map(c => `${c.name}=${c.value}`).join('; ');
  
  // 获取产品数据（带价格）
  console.log('=== 获取产品数据 ===');
  const products = await page.evaluate(async ({ cookie }) => {
    const resp = await fetch('https://mz.bizgo.com/CXF/rs/prod/cacheList', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cookie': cookie },
      body: JSON.stringify({})
    });
    const data = await resp.json();
    return data.data?.fullList || [];
  }, { cookie: cookieStr });
  
  console.log(`产品总数: ${products.length}`);
  
  // 获取客户列表
  console.log('\n=== 获取客户列表 ===');
  // 使用客户ID列表获取客户详情
  const clientIds = await page.evaluate(async ({ cookie }) => {
    const resp = await fetch('https://mz.bizgo.com/CXF/rs/crm/client/pc/cacheList', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cookie': cookie },
      body: JSON.stringify({})
    });
    const data = await resp.json();
    return data.data?.fullClientIdMap?.customer || [];
  }, { cookie: cookieStr });
  
  console.log(`客户ID数量: ${clientIds.length}`);
  
  // 获取销售订单
  console.log('\n=== 获取销售订单 ===');
  const salesOrders = await page.evaluate(async ({ cookie }) => {
    const resp = await fetch('https://mz.bizgo.com/CXF/rs/order/sales/pageList', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cookie': cookie },
      body: JSON.stringify({ pageSize: 50, pageNum: 1 })
    });
    const data = await resp.json();
    return data.data?.list || [];
  }, { cookie: cookieStr });
  
  // 按客户名分组统计
  const customerMap = new Map();
  for (const order of salesOrders) {
    if (order.clientName) {
      if (!customerMap.has(order.clientName)) {
        customerMap.set(order.clientName, { count: 0, total: 0, orders: [] });
      }
      const info = customerMap.get(order.clientName);
      info.count++;
      info.total += parseFloat(order.contractAmt) || 0;
      info.orders.push(order.orderNumber);
    }
  }
  
  console.log('\n客户分布:');
  for (const [name, info] of customerMap) {
    console.log(`  ${name}: ${info.count}单, ¥${info.total.toFixed(2)}, 单号:${info.orders.slice(0,2).join(',')}`);
  }
  
  // 显示一些有价格的产品
  console.log('\n=== 有售价的产品 ===');
  const productsWithPrice = products.filter(p => p.salePrice && p.salePrice > 0);
  console.log(`有售价的产品数量: ${productsWithPrice.length}`);
  for (const p of productsWithPrice.slice(0, 10)) {
    console.log(`  ${p.sku} | ${p.name} | ¥${p.salePrice}`);
  }
  
  await browser.close();
}

test();
