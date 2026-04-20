const { chromium } = require('playwright');

async function test() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // 设置视口
  await page.setViewportSize({ width: 1920, height: 1080 });
  
  await page.goto('https://mz.bizgo.com/login.html', { waitUntil: 'networkidle', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));
  
  // 截图登录页
  await page.screenshot({ path: '/tmp/mz_login.png' });
  console.log('登录页截图保存');
  
  // 填写登录信息
  await page.fill('input[name="username"]', 'kaimuerren');
  await page.fill('input[name="password"]', '888888');
  
  await page.screenshot({ path: '/tmp/mz_login_filled.png' });
  console.log('填写后截图保存');
  
  // 点击登录
  await page.click('button[type="submit"]');
  await new Promise(r => setTimeout(r, 5000));
  
  await page.screenshot({ path: '/tmp/mz_after_login.png' });
  console.log('登录后截图，URL:', page.url());
  
  await browser.close();
}

test();
