const { chromium } = require('playwright');

async function test() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    console.log('=== 登录秒账 ===');
    await page.goto('https://mz.bizgo.com/login.html', { waitUntil: 'networkidle', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2000));
    
    // 输入账号密码
    await page.fill('input[placeholder*="账号"], input[name="username"], input[type="text"]', 'kaimuerren');
    await page.fill('input[placeholder*="密码"], input[name="password"], input[type="password"]', '888888');
    
    // 点击登录按钮
    await page.click('button[type="submit"], button:has-text("登录"), button:has-text("登 录")');
    await new Promise(r => setTimeout(r, 5000));
    
    console.log('登录后URL:', page.url());
    
    // 检查是否登录成功
    if (page.url().includes('login')) {
      console.log('登录可能失败');
    } else {
      console.log('登录成功!');
      
      // 访问产品列表页面
      await page.goto('https://mz.bizgo.com/wms/product/list', { waitUntil: 'networkidle', timeout: 30000 });
      await new Promise(r => setTimeout(r, 3000));
      console.log('产品页URL:', page.url());
      
      // 获取页面内容
      const bodyText = await page.locator('body').textContent();
      console.log('页面内容(前500字):', bodyText.substring(0, 500));
    }
    
  } catch (e) {
    console.error('错误:', e.message);
  } finally {
    await browser.close();
  }
}

test();
