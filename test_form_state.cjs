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
    const customerSelect = page.locator('select').first();
    await customerSelect.selectOption({ index: 1 });
    console.log('✅ 已选择客户');
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
    console.log('✅ 已选择产品');
    await new Promise(r => setTimeout(r, 2000));
    
    // 填数量
    const detailQtyInput = page.locator('table tbody tr:last-child input[type="number"]').nth(1);
    await detailQtyInput.fill('100');
    console.log('✅ 已填写数量');
    await new Promise(r => setTimeout(r, 1000));
    
    // 检查表单状态
    const formState = await page.evaluate(() => {
      // 尝试找到React组件状态
      const modal = document.querySelector('[class*="fixed inset-0"]');
      if (!modal) return { error: '没有找到弹窗' };
      
      // 获取客户选择器的值
      const customerSelect = modal.querySelector('select');
      return {
        customerValue: customerSelect?.value,
        customerText: customerSelect?.querySelector('option:checked')?.textContent,
        hasModal: true
      };
    });
    console.log('表单状态:', JSON.stringify(formState));
    
    // 保存
    console.log('\n--- 点击保存 ---');
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
