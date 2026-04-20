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
  
  // 获取产品列表（含价格）
  const prodResult = await page.evaluate(async (cookie) => {
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
  
  const products = prodResult.data?.fullList || [];
  
  // 筛选托科斯的产品
  const tuokesProducts = products.filter(p => p.sku && p.sku.startsWith('C03'));
  
  console.log('=== 托科斯产品列表 (C03开头) ===');
  console.log(`共 ${tuokesProducts.length} 个产品:\n`);
  console.log('货号\t\t产品名称\t\t\t\t\t\t售价');
  console.log('----------------------------------------------------------');
  
  for (const p of tuokesProducts) {
    const salePrice = p.salePrice !== undefined && p.salePrice !== null ? `¥${p.salePrice}` : '暂无';
    console.log(`${p.sku}\t${p.name.substring(0, 15).padEnd(15)}\t${salePrice}`);
  }
  
  // 尝试从销售订单历史查看托科斯的价格
  console.log('\n\n=== 从销售订单查看托科斯产品价格 ===');
  
  const salesResult = await page.evaluate(async (cookie) => {
    const resp = await fetch('https://mz.bizgo.com/CXF/rs/order/sales/pageList', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookie
      },
      body: JSON.stringify({ pageSize: 50, pageNum: 1 })
    });
    return await resp.json();
  }, cookieStr);
  
  if (salesResult.data?.list) {
    const sales = salesResult.data.list;
    console.log('最近销售订单数量:', sales.length);
    
    // 查找托科斯相关的订单
    const tuokesSales = sales.filter(s => s.customerName && s.customerName.includes('托科斯'));
    console.log('托科斯相关订单数量:', tuokesSales.length);
    
    for (const s of tuokesSales.slice(0, 5)) {
      console.log(`\n订单号: ${s.orderNo}`);
      console.log(`客户: ${s.customerName}`);
      console.log(`日期: ${s.orderDate}`);
      console.log(`金额: ¥${s.orderAmount}`);
      if (s.productList) {
        for (const item of s.productList) {
          if (item.productCode && item.productCode.startsWith('C03')) {
            console.log(`  - ${item.productCode} ${item.productName} 单价:¥${item.unitPrice} 数量:${item.qty}`);
          }
        }
      }
    }
  }
  
  await browser.close();
}

test();
