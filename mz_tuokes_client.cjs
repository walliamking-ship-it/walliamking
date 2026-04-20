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
  
  // 获取客户数据
  const result = await page.evaluate(async ({ cookie }) => {
    const resp = await fetch('https://mz.bizgo.com/CXF/rs/crm/client/pc/cacheList', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookie
      },
      body: JSON.stringify({})
    });
    return await resp.json();
  }, { cookie: cookieStr });
  
  console.log('API返回keys:', Object.keys(result));
  
  // 检查数据结构
  const data = result.data;
  if (data && typeof data === 'object') {
    console.log('data是对象，包含的key:', Object.keys(data).slice(0, 10));
    
    // 检查fullClientIdMap
    if (data.fullClientIdMap) {
      console.log('fullClientIdMap keys:', Object.keys(data.fullClientIdMap));
    }
    
    // 尝试获取fullList
    if (data.fullList) {
      console.log('fullList长度:', data.fullList.length);
      // 查找托科斯
      for (const c of data.fullList) {
        if (c.name && (c.name.includes('托科斯') || c.name.includes('C03'))) {
          console.log(`找到客户: ${c.name} (ID:${c.id})`);
        }
      }
    }
  }
  
  await browser.close();
}

test();
