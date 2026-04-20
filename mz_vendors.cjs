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
  
  // 获取供应商列表
  console.log('=== 获取供应商列表 ===');
  const vendorIds = await page.evaluate(async ({ cookie }) => {
    const resp = await fetch('https://mz.bizgo.com/CXF/rs/crm/client/pc/cacheList', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cookie': cookie },
      body: JSON.stringify({})
    });
    const data = await resp.json();
    return data.data?.fullClientIdMap?.vendor || [];
  }, { cookie: cookieStr });
  
  console.log(`供应商ID数量: ${vendorIds.length}`);
  
  // 获取采购订单
  console.log('\n=== 获取采购订单 ===');
  const purchaseOrders = await page.evaluate(async ({ cookie }) => {
    const resp = await fetch('https://mz.bizgo.com/CXF/rs/order/purchase/pageList', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cookie': cookie },
      body: JSON.stringify({ pageSize: 30, pageNum: 1 })
    });
    const data = await resp.json();
    return data.data?.list || [];
  }, { cookie: cookieStr });
  
  console.log(`采购订单数: ${purchaseOrders.length}`);
  
  // 按供应商分组
  const vendorMap = new Map();
  for (const order of purchaseOrders) {
    if (order.vendorName) {
      if (!vendorMap.has(order.vendorName)) {
        vendorMap.set(order.vendorName, { count: 0, total: 0 });
      }
      const info = vendorMap.get(order.vendorName);
      info.count++;
      info.total += parseFloat(order.contractAmt) || 0;
    }
  }
  
  console.log('\n供应商分布:');
  for (const [name, info] of vendorMap) {
    console.log(`  ${name}: ${info.count}单, ¥${info.total.toFixed(2)}`);
  }
  
  // 显示采购订单示例
  console.log('\n采购订单示例:');
  for (const order of purchaseOrders.slice(0, 5)) {
    console.log(`  ${order.orderNumber} | ${order.vendorName} | ¥${order.contractAmt} | ${order.orderDate}`);
  }
  
  // 获取产品数据
  console.log('\n=== 获取产品列表 ===');
  const products = await page.evaluate(async ({ cookie }) => {
    const resp = await fetch('https://mz.bizgo.com/CXF/rs/prod/cacheList', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cookie': cookie },
      body: JSON.stringify({})
    });
    const data = await resp.json();
    return data.data?.fullList || [];
  }, { cookie: cookieStr });
  
  // 按货号前缀分组
  const skuPrefixes = new Set();
  for (const p of products) {
    if (p.sku && p.sku.length >= 3) {
      skuPrefixes.add(p.sku.substring(0, 3));
    }
  }
  console.log('产品货号前缀:', Array.from(skuPrefixes).sort().join(', '));
  
  // 显示各类型产品示例
  console.log('\n各类型产品示例:');
  const typeMap = new Map();
  for (const p of products) {
    if (p.sku && p.sku.length >= 3) {
      const prefix = p.sku.substring(0, 3);
      if (!typeMap.has(prefix)) {
        typeMap.set(prefix, []);
      }
      typeMap.get(prefix).push(p);
    }
  }
  for (const [prefix, prods] of typeMap) {
    const sample = prods[0];
    console.log(`  ${prefix}: ${sample.sku} - ${sample.name}`);
  }
  
  await browser.close();
}

test();
