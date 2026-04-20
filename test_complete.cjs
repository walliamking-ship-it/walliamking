const { chromium } = require('playwright');

const BASE = 'http://124.222.108.162';

async function test() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('dialog', async dialog => {
    console.log('Dialog:', dialog.message());
    await dialog.dismiss();
  });
  
  try {
    console.log('=== 登录 ===');
    await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
    await page.fill('input[placeholder*="用户名"]', 'admin');
    await page.fill('input[placeholder*="密码"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(5000);
    console.log('✅ 登录成功');
    
    console.log('\n=== 完整流程测试 ===');
    await page.goto(`${BASE}/sales-orders`, { waitUntil: 'networkidle', timeout: 15000 });
    await new Promise(r => setTimeout(r, 2000));
    
    // 新建
    await page.locator('button:has-text("新建")').first().click();
    await new Promise(r => setTimeout(r, 3000));
    console.log('✅ 打开新建表单');
    
    // 选择客户
    await page.locator('select').first().selectOption({ index: 1 });
    console.log('✅ 已选择客户');
    await new Promise(r => setTimeout(r, 1000));
    
    // 添加明细
    await page.locator('button:has-text("添加明细")').click();
    await new Promise(r => setTimeout(r, 2000));
    console.log('✅ 已添加明细');
    
    // 选择产品
    const selects = await page.locator('select').all();
    for (const sel of selects) {
      const firstOpt = await sel.locator('option').first().textContent();
      if (firstOpt?.includes('产品')) {
        await sel.selectOption({ index: 1 });
        console.log('✅ 已选择产品');
        break;
      }
    }
    await new Promise(r => setTimeout(r, 2000));
    
    // 关键：找到明细行中的数量输入框并填写
    // 从表格结构看：序号|产品|物料编码|规格|单位|单价|数量|金额|已送货|备注
    // 数量是第7个td内的input
    const detailQtyInput = page.locator('table tbody tr:last-child input[type="number"]').nth(1);
    if (await detailQtyInput.isVisible()) {
      await detailQtyInput.fill('100');
      console.log('✅ 已填写数量');
      await new Promise(r => setTimeout(r, 1000));
    }
    
    // 验证状态
    const state = await page.evaluate(() => {
      const lastRow = document.querySelectorAll('table tbody tr')[document.querySelectorAll('table tbody tr').length - 1];
      const cells = lastRow.querySelectorAll('td');
      return Array.from(cells).map(c => {
        const inp = c.querySelector('input');
        if (inp) return inp.value;
        return c.textContent?.trim();
      });
    });
    console.log('明细行状态:', state.slice(0, 10));
    
    // 保存
    await page.locator('button:has-text("保存")').click();
    console.log('已点击保存');
    await new Promise(r => setTimeout(r, 5000));
    
    // 检查结果
    const url = page.url();
    const modalCount = await page.locator('[class*="fixed inset-0"]').count();
    console.log('URL:', url);
    console.log('遮罩数量:', modalCount);
    
    if (url.includes('sales-orders') && modalCount === 0) {
      console.log('✅✅ 订单保存成功！');
    } else {
      console.log('❌ 保存失败');
    }
    
    console.log('\n=== 测试完成 ===');
  } catch (e) {
    console.error('测试异常:', e.message);
  } finally {
    await browser.close();
  }
}

test();
