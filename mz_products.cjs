const { chromium } = require('playwright');

async function test() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // 登录
  await page.goto('https://mz.bizgo.com/login.html', { waitUntil: 'networkidle', timeout: 30000 });
  await page.fill('input[placeholder*="账号"], input[name="username"], input[type="text"]', 'kaimuerren');
  await page.fill('input[placeholder*="密码"], input[name="password"], input[type="password"]', '888888');
  await page.click('button[type="submit"], button:has-text("登录"), button:has-text("登 录")');
  await new Promise(r => setTimeout(r, 5000));
  console.log('登录成功');
  
  // 访问产品列表
  await page.goto('https://mz.bizgo.com/wms/product/list', { waitUntil: 'networkidle', timeout: 30000 });
  await new Promise(r => setTimeout(r, 5000));
  
  // 截图
  await page.screenshot({ path: '/tmp/mz_products.png', fullPage: true });
  console.log('截图保存到 /tmp/mz_products.png');
  
  // 尝试查找表格内容
  const tableRows = await page.locator('table tbody tr, .el-table__row, [class*="table"] tr').all();
  console.log('表格行数:', tableRows.length);
  
  // 尝试获取搜索框并搜索托科斯
  const searchInput = page.locator('input[placeholder*="搜索"], input[placeholder*="产品"], input[aria-label*="搜索"]').first();
  if (await searchInput.isVisible()) {
    await searchInput.fill('托科斯');
    await searchInput.press('Enter');
    await new Promise(r => setTimeout(r, 3000));
    console.log('搜索托科斯完成');
    await page.screenshot({ path: '/tmp/mz_search.png', fullPage: true });
  }
  
  // 获取页面所有文本
  const allText = await page.locator('body').textContent();
  console.log('\n=== 页面文本(前2000字) ===');
  console.log(allText.substring(0, 2000));
  
  await browser.close();
}

test();
