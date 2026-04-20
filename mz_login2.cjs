const { chromium } = require('playwright');

async function test() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1920, height: 1080 });
  
  await page.goto('https://mz.bizgo.com/login.html', { waitUntil: 'networkidle', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));
  
  // 填写登录信息
  await page.fill('input[name="username"]', 'kaimuerren');
  await page.fill('input[name="password"]', '888888');
  await new Promise(r => setTimeout(r, 500));
  
  // 点击登录按钮 (第一个)
  await page.locator('button').first().click();
  await new Promise(r => setTimeout(r, 5000));
  
  console.log('登录后URL:', page.url());
  await page.screenshot({ path: '/tmp/mz_loggedin.png', fullPage: true });
  
  // 如果成功，访问产品页面
  if (!page.url().includes('login')) {
    console.log('登录成功!');
    
    // 等待产品页面加载
    await page.goto('https://mz.bizgo.com/wms/product/list', { waitUntil: 'networkidle', timeout: 30000 });
    await new Promise(r => setTimeout(r, 5000));
    
    await page.screenshot({ path: '/tmp/mz_products2.png', fullPage: true });
    console.log('产品页截图保存');
    
    // 获取页面内容
    const content = await page.content();
    console.log('页面HTML长度:', content.length);
  }
  
  await browser.close();
}

test();
