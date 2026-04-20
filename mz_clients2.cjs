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
  
  // 获取客户列表 - 尝试不同的API
  const result = await page.evaluate(async ({ cookie }) => {
    // 尝试带分页的客户列表API
    const resp = await fetch('https://mz.bizgo.com/CXF/rs/crm/client/list', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookie
      },
      body: JSON.stringify({ pageSize: 100, pageNum: 1 })
    });
    return await resp.json();
  }, { cookie: cookieStr });
  
  console.log('客户列表API结果:', Object.keys(result));
  if (result.data) {
    const clients = result.data.list || [];
    console.log('客户数量:', clients.length);
    
    // 查找托科斯
    for (const c of clients) {
      if (c.name && (c.name.includes('托科斯') || c.name.includes('托克斯') || c.name.includes('C03'))) {
        console.log(`找到: ${c.name} (ID:${c.id})`);
      }
    }
    
    // 显示前10个客户
    console.log('\n前10个客户:');
    for (const c of clients.slice(0, 10)) {
      console.log(`  ${c.name} (${c.classifyName || '-'})`);
    }
  }
  
  await browser.close();
}

test();
