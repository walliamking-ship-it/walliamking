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
    await page.waitForTimeout(5000);  // 等待登录完成
    console.log('当前URL:', page.url());
    
    console.log('\n=== 测试销售订单订单明细 ===');
    await page.goto(`${BASE}/sales-orders`, { waitUntil: 'networkidle', timeout: 15000 });
    await new Promise(r => setTimeout(r, 2000));
    
    const newBtn = page.locator('button:has-text("新建")').first();
    if (await newBtn.isVisible()) {
      console.log('点击新建按钮');
      await newBtn.click();
      await new Promise(r => setTimeout(r, 3000));
      
      await page.screenshot({ path: '/tmp/sales_order_new.png', fullPage: true });
      console.log('截图: /tmp/sales_order_new.png');
      
      const addDetailBtn = page.locator('button:has-text("添加明细")');
      if (await addDetailBtn.isVisible()) {
        console.log('✅ 找到"添加明细"按钮');
        await addDetailBtn.click();
        await new Promise(r => setTimeout(r, 1500));
        
        const rows = await page.locator('table tbody tr').count();
        console.log(`✅ 明细行数: ${rows}`);
        
        await page.screenshot({ path: '/tmp/sales_order_detail_added.png', fullPage: true });
        
        // 尝试选择产品
        const selects = await page.locator('select').all();
        console.log(`下拉框数量: ${selects.length}`);
        
        if (selects.length > 0) {
          const options = await selects[0].locator('option').count();
          console.log(`第一个下拉框选项数: ${options}`);
          if (options > 1) {
            await selects[0].selectOption({ index: 1 });
            console.log('✅ 已选择产品');
            await new Promise(r => setTimeout(r, 1000));
            
            const inputs = await page.locator('input[type="number"]').all();
            if (inputs.length > 0) {
              await inputs[0].fill('100');
              console.log('✅ 已填写数量');
            }
          }
        }
        
        await page.screenshot({ path: '/tmp/sales_order_with_detail.png', fullPage: true });
        
        // 测试保存
        const saveBtn = page.locator('button:has-text("保存")');
        if (await saveBtn.isVisible()) {
          console.log('点击保存按钮');
          await saveBtn.click();
          await new Promise(r => setTimeout(r, 3000));
          
          await page.screenshot({ path: '/tmp/sales_order_saved.png', fullPage: true });
        }
        
      } else {
        console.log('❌ 未找到"添加明细"按钮');
        const btns = await page.locator('button').allTextContents();
        console.log('按钮列表:', btns.slice(0, 15));
      }
    } else {
      console.log('❌ 未找到新建按钮');
    }
    
    console.log('\n=== 测试完成 ===');
  } catch (e) {
    console.error('测试失败:', e.message);
    await page.screenshot({ path: '/tmp/test_error.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

test();
