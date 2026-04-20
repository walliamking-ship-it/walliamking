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
  
  // 获取客户数据
  console.log('\n=== 获取客户数据 ===');
  const clientData = await page.evaluate(async ({ cookie }) => {
    const resp = await fetch('https://mz.bizgo.com/CXF/rs/crm/client/pc/cacheList', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cookie': cookie },
      body: JSON.stringify({})
    });
    const data = await resp.json();
    // 返回fullClientIdMap中的customer ID列表
    return data.data?.fullClientIdMap?.customer || [];
  }, { cookie: cookieStr });
  
  console.log(`客户ID数量: ${clientData.length}`);
  
  // 获取销售订单
  console.log('\n=== 获取销售订单 ===');
  const salesOrders = await page.evaluate(async ({ cookie }) => {
    const resp = await fetch('https://mz.bizgo.com/CXF/rs/order/sales/pageList', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cookie': cookie },
      body: JSON.stringify({ pageSize: 100, pageNum: 1 })
    });
    const data = await resp.json();
    return data.data?.list || [];
  }, { cookie: cookieStr });
  
  console.log(`销售订单总数: ${salesOrders.length}`);
  
  // 显示前5个客户相关的订单
  console.log('\n=== 销售订单示例 ===');
  for (const order of salesOrders.slice(0, 10)) {
    console.log(`${order.orderNo} | ${order.customerName} | ¥${order.orderAmount} | ${order.orderDate}`);
  }
  
  // 显示一些产品示例
  console.log('\n=== 产品示例（前20个）===');
  for (const p of products.slice(0, 20)) {
    console.log(`${p.sku} | ${p.name} | 售价:${p.salePrice || '-'}`);
  }
  
  await browser.close();
}

test();
