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
  
  // 尝试价格清单API
  const apis = [
    '/CXF/rs/bss/price/list',
    '/CXF/rs/bss/price/pageList',
    '/CXF/rs/prod/price/list',
    '/CXF/rs/order/price/list',
    '/CXF/rs/crm/price/list',
  ];
  
  for (const api of apis) {
    const result = await page.evaluate(async (cookie, apiPath) => {
      try {
        const resp = await fetch(`https://mz.bizgo.com${apiPath}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cookie': cookie
          },
          body: JSON.stringify({})
        });
        const data = await resp.json();
        return { success: true, keys: Object.keys(data), hasData: !!data.data };
      } catch (e) {
        return { success: false, error: e.message };
      }
    }, cookieStr, api);
    
    console.log(`${api}: ${result.success ? 'OK - keys:' + result.keys.join(',') : '失败:' + result.error}`);
  }
  
  await browser.close();
}

test();
