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
  
  // 获取销售订单
  console.log('=== 获取销售订单详情 ===');
  const salesOrders = await page.evaluate(async ({ cookie }) => {
    const resp = await fetch('https://mz.bizgo.com/CXF/rs/order/sales/pageList', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cookie': cookie },
      body: JSON.stringify({ pageSize: 20, pageNum: 1 })
    });
    const data = await resp.json();
    return data.data?.list || [];
  }, { cookie: cookieStr });
  
  console.log(`销售订单数: ${salesOrders.length}`);
  
  // 打印第一个订单的所有字段
  if (salesOrders.length > 0) {
    console.log('\n第一个订单的字段:', Object.keys(salesOrders[0]));
    console.log('\n第一个订单数据:');
    for (const [key, value] of Object.entries(salesOrders[0])) {
      console.log(`  ${key}: ${JSON.stringify(value)}`);
    }
  }
  
  await browser.close();
}

test();
