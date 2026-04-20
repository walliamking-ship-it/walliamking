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
  
  // 获取所有销售订单明细
  const result = await page.evaluate(async ({ cookie }) => {
    const resp = await fetch('https://mz.bizgo.com/CXF/rs/order/sales/pageList', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookie
      },
      body: JSON.stringify({ pageSize: 100, pageNum: 1 })
    });
    return await resp.json();
  }, { cookie: cookieStr });
  
  const orders = result.data?.list || [];
  console.log('销售订单总数:', orders.length);
  
  // 查找托科斯相关的订单和产品
  let tuokesProducts = new Map();
  
  for (const order of orders) {
    if (order.customerName && order.customerName.includes('托科斯')) {
      console.log(`\n订单: ${order.orderNo} - ${order.customerName}`);
      if (order.productList) {
        for (const p of order.productList) {
          if (p.productCode && p.productCode.startsWith('C03')) {
            console.log(`  ${p.productCode} - ${p.productName} - 单价:¥${p.unitPrice} - 数量:${p.qty}`);
            tuokesProducts.set(p.productCode, {
              name: p.productName,
              unitPrice: p.unitPrice
            });
          }
        }
      }
    }
  }
  
  console.log('\n\n=== 托科斯产品销售价格汇总 ===');
  if (tuokesProducts.size > 0) {
    for (const [code, info] of tuokesProducts) {
      console.log(`${code}\t${info.name}\t单价:¥${info.unitPrice}`);
    }
  } else {
    console.log('未找到托科斯相关销售记录');
  }
  
  await browser.close();
}

test();
