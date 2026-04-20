const { chromium } = require('playwright');

async function test() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1920, height: 1080 });
  
  // 登录
  await page.goto('https://mz.bizgo.com/login.html', { waitUntil: 'networkidle', timeout: 30000 });
  await page.fill('input[name="username"]', 'kaimuerren');
  await page.fill('input[name="password"]', '888888');
  await page.locator('button').first().click();
  await new Promise(r => setTimeout(r, 5000));
  console.log('登录成功');
  
  // 访问产品页面并等待更长时间
  await page.goto('https://mz.bizgo.com/wms/product/list', { timeout: 30000 });
  
  // 等待网络空闲
  try {
    await page.waitForLoadState('networkidle', { timeout: 10000 });
  } catch (e) {
    console.log('等待networkidle超时，继续...');
  }
  await new Promise(r => setTimeout(r, 5000));
  
  console.log('当前URL:', page.url());
  await page.screenshot({ path: '/tmp/mz_products3.png', fullPage: true });
  
  // 获取DOM内容
  const bodyHtml = await page.evaluate(() => document.body.innerHTML);
  console.log('Body HTML长度:', bodyHtml.length);
  console.log('Body HTML前1000字:', bodyHtml.substring(0, 1000));
  
  // 尝试调用产品列表API
  const cookies = await page.context().cookies();
  const cookieStr = cookies.map(c => `${c.name}=${c.value}`).join('; ');
  
  const apiResponse = await page.evaluate(async (cookie) => {
    const resp = await fetch('https://mz.bizgo.com/wms/product/list', {
      headers: { 'Cookie': cookie }
    });
    return await resp.text();
  }, cookieStr);
  
  console.log('API响应长度:', apiResponse.length);
  console.log('API响应:', apiResponse.substring(0, 500));
  
  await browser.close();
}

test();
