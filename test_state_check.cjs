const { chromium } = require('playwright');

const BASE = 'http://124.222.108.162';

async function test() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
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
    
    // 检查表格状态
    const beforeFill = await page.evaluate(() => {
      const rows = document.querySelectorAll('table tbody tr');
      return Array.from(rows).map(row => {
        const cells = row.querySelectorAll('td');
        return Array.from(cells).map(c => {
          const sel = c.querySelector('select');
          const inp = c.querySelector('input');
          const span = c.querySelector('span');
          if (sel) return 'SEL:' + sel.value;
          if (inp) return 'INP:' + inp.value;
          if (span) return 'SPN:' + span.textContent;
          return c.textContent?.trim() || '';
        });
      });
    });
    console.log('填充前:', JSON.stringify(beforeFill));
    
    // 找到明细行的数量输入框并填充
    const lastRowInputs = page.locator('table tbody tr:last-child input[type="number"]');
    const count = await lastRowInputs.count();
    console.log('数量输入框数量:', count);
    
    if (count >= 2) {
      // 第一个是单价，第二个是数量
      await lastRowInputs.nth(1).fill('100');
      console.log('Filled 100 in quantity input');
      await new Promise(r => setTimeout(r, 2000));
    }
    
    // 再次检查状态
    const afterFill = await page.evaluate(() => {
      const rows = document.querySelectorAll('table tbody tr');
      return Array.from(rows).map(row => {
        const cells = row.querySelectorAll('td');
        return Array.from(cells).map(c => {
          const sel = c.querySelector('select');
          const inp = c.querySelector('input');
          if (sel) return 'SEL:' + sel.value;
          if (inp) return 'INP:' + inp.value;
          return c.textContent?.trim() || '';
        });
      });
    });
    console.log('填充后:', JSON.stringify(afterFill));
    
    // 保存
    await page.locator('button:has-text("保存")').click();
    await new Promise(r => setTimeout(r, 5000));
    
    console.log('\n=== 完成 ===');
  } catch (e) {
    console.error('异常:', e.message);
  } finally {
    await browser.close();
  }
}

test();
