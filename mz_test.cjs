const { chromium } = require('playwright');

const BASE_URL = 'https://mz.bizgo.com';

async function test() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    console.log('=== 访问秒账 ===');
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await new Promise(r => setTimeout(r, 3000));
    
    console.log('当前URL:', page.url());
    console.log('页面标题:', await page.title());
    
    // 检查是否需要登录
    const bodyText = await page.locator('body').textContent();
    if (bodyText.includes('登录') || bodyText.includes('login')) {
      console.log('需要登录');
    } else {
      console.log('已登录');
      // 尝试查找产品菜单
      const menuItems = await page.locator('text=/产品|产品管理|货品/').all();
      console.log('找到菜单项:', menuItems.length);
    }
    
  } catch (e) {
    console.error('错误:', e.message);
  } finally {
    await browser.close();
  }
}

test();
