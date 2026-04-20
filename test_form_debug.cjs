const { chromium } = require('playwright');

const BASE = 'http://124.222.108.162';

async function test() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // 捕获alert
  page.on('dialog', async dialog => {
    console.log('Dialog:', dialog.message());
    await dialog.dismiss();
  });
  
  // 捕获console
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('Console Error:', msg.text());
    }
  });
  
  try {
    console.log('=== 登录 ===');
    await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
    await page.fill('input[placeholder*="用户名"]', 'admin');
    await page.fill('input[placeholder*="密码"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(5000);
    console.log('✅ 登录成功');
    
    console.log('\n=== 测试表单保存 ===');
    await page.goto(`${BASE}/sales-orders`, { waitUntil: 'networkidle', timeout: 15000 });
    await new Promise(r => setTimeout(r, 2000));
    
    // 新建
    const newBtn = page.locator('button:has-text("新建")').first();
    await newBtn.click();
    await new Promise(r => setTimeout(r, 3000));
    console.log('✅ 打开新建表单');
    
    // 选择客户（下拉框第一个）
    const customerSelect = page.locator('select').first();
    await customerSelect.selectOption({ index: 1 });
    console.log('✅ 已选择客户');
    await new Promise(r => setTimeout(r, 1000));
    
    // 添加明细
    const addDetailBtn = page.locator('button:has-text("添加明细")');
    await addDetailBtn.click();
    await new Promise(r => setTimeout(r, 2000));
    console.log('✅ 已添加明细');
    
    // 找到产品选择器并选择
    const selects = await page.locator('select').all();
    let productSelect = null;
    for (const sel of selects) {
      const firstOpt = await sel.locator('option').first().textContent();
      if (firstOpt?.includes('产品')) {
        productSelect = sel;
        break;
      }
    }
    
    if (productSelect) {
      await productSelect.selectOption({ index: 1 });
      console.log('✅ 已选择产品');
      await new Promise(r => setTimeout(r, 2000));
      
      // 检查产品选择后的状态
      const tableState = await page.evaluate(() => {
        const rows = document.querySelectorAll('table tbody tr');
        return Array.from(rows).map(row => {
          const cells = row.querySelectorAll('td');
          return Array.from(cells).map(c => {
            const input = c.querySelector('input');
            const select = c.querySelector('select');
            if (input) return `[INP:${input.value}]`;
            if (select) return `[SEL:${select.value}]`;
            return c.textContent?.trim();
          });
        });
      });
      console.log('表格状态:', JSON.stringify(tableState, null, 2));
      
      // 找到明细行中的数量输入框（第二个数字输入框）
      const qtyInput = await page.locator('table input[type="number"]').nth(1);
      if (await qtyInput.isVisible()) {
        await qtyInput.fill('100');
        console.log('✅ 已填写数量');
        await new Promise(r => setTimeout(r, 1000));
      }
      
      // 保存
      const saveBtn = page.locator('button:has-text("保存")');
      await saveBtn.click();
      console.log('已点击保存');
      await new Promise(r => setTimeout(r, 5000));
      
      // 检查结果
      const currentUrl = page.url();
      console.log('当前URL:', currentUrl);
      
      const modalCount = await page.locator('[class*="fixed inset-0"]').count();
      console.log('遮罩数量:', modalCount);
      
      if (currentUrl.includes('sales-orders') && modalCount === 0) {
        console.log('✅ 保存成功！');
      } else {
        console.log('❌ 保存可能失败');
      }
    }
    
    console.log('\n=== 测试完成 ===');
  } catch (e) {
    console.error('测试异常:', e.message);
  } finally {
    await browser.close();
  }
}

test();
