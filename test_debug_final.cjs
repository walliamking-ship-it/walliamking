const { chromium } = require('playwright');

const BASE = 'http://124.222.108.162';

async function test() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('console', msg => {
    console.log('[CONSOLE]', msg.text());
  });
  
  try {
    console.log('=== 登录 ===');
    await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
    await page.fill('input[placeholder*="用户名"]', 'admin');
    await page.fill('input[placeholder*="密码"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(5000);
    
    console.log('\n=== 测试 ===');
    await page.goto(`${BASE}/sales-orders`, { waitUntil: 'networkidle', timeout: 15000 });
    await new Promise(r => setTimeout(r, 2000));
    
    await page.locator('button:has-text("新建")').first().click();
    await new Promise(r => setTimeout(r, 3000));
    
    // 选择客户
    await page.locator('select').first().selectOption({ index: 1 });
    await new Promise(r => setTimeout(r, 1000));
    
    // 添加明细
    await page.locator('button:has-text("添加明细")').click();
    await new Promise(r => setTimeout(r, 2000));
    
    // 选择产品
    const selects = await page.locator('select').all();
    for (const sel of selects) {
      const firstOpt = await sel.locator('option').first().textContent();
      if (firstOpt?.includes('产品')) {
        await sel.selectOption({ index: 1 });
        break;
      }
    }
    await new Promise(r => setTimeout(r, 2000));
    
    // 填数量
    const detailQtyInput = page.locator('table tbody tr:last-child input[type="number"]').nth(1);
    await detailQtyInput.fill('100');
    console.log('Filled quantity');
    await new Promise(r => setTimeout(r, 1000));
    
    console.log('\n--- 点击保存 ---');
    await page.locator('button:has-text("保存")').click();
    await new Promise(r => setTimeout(r, 8000));
    
    console.log('\n=== 完成 ===');
  } catch (e) {
    console.error('异常:', e.message);
  } finally {
    await browser.close();
  }
}

test();
