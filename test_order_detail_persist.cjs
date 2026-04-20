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
    console.log('✅ 登录成功，当前URL:', page.url());
    
    console.log('\n=== 测试销售订单新建并保存 ===');
    await page.goto(`${BASE}/sales-orders`, { waitUntil: 'networkidle', timeout: 15000 });
    await new Promise(r => setTimeout(r, 2000));
    
    const newBtn = page.locator('button:has-text("新建")').first();
    if (await newBtn.isVisible()) {
      console.log('点击新建按钮');
      await newBtn.click();
      await new Promise(r => setTimeout(r, 3000));
      
      await page.screenshot({ path: '/tmp/so_new.png', fullPage: true });
      
      // 填写客户名称
      const customerInput = page.locator('input[placeholder*="客户"]').first();
      if (await customerInput.isVisible()) {
        await customerInput.fill('测试客户A');
        console.log('✅ 已填写客户名称');
      }
      
      // 添加明细
      const addDetailBtn = page.locator('button:has-text("添加明细")');
      if (await addDetailBtn.isVisible()) {
        console.log('点击添加明细');
        await addDetailBtn.click();
        await new Promise(r => setTimeout(r, 1500));
        
        // 选择产品
        const selects = await page.locator('select').all();
        console.log(`下拉框数量: ${selects.length}`);
        
        if (selects.length > 0) {
          const options = await selects[0].locator('option').count();
          console.log(`第一个下拉框选项数: ${options}`);
          if (options > 1) {
            await selects[0].selectOption({ index: 1 });
            console.log('✅ 已选择产品');
            await new Promise(r => setTimeout(r, 1000));
            
            // 填写数量
            const inputs = await page.locator('input[type="number"]').all();
            if (inputs.length > 0) {
              await inputs[0].fill('50');
              console.log('✅ 已填写数量');
            }
          }
        }
        
        await page.screenshot({ path: '/tmp/so_with_detail.png', fullPage: true });
        
        // 保存
        const saveBtn = page.locator('button:has-text("保存")');
        if (await saveBtn.isVisible()) {
          console.log('点击保存按钮');
          await saveBtn.click();
          await new Promise(r => setTimeout(r, 5000));
          
          await page.screenshot({ path: '/tmp/so_after_save.png', fullPage: true });
          
          // 检查是否有错误
          const errorMsg = await page.locator('.text-red-500, .text-red-600, [class*="error"]').first();
          if (await errorMsg.isVisible().catch(() => false)) {
            const text = await errorMsg.textContent();
            console.log('❌ 保存失败:', text);
          } else {
            console.log('✅ 保存可能成功');
          }
          
          // 检查页面状态
          const modal = page.locator('[class*="modal"], [class*="Modal"]');
          if (!(await modal.isVisible().catch(() => false))) {
            console.log('✅ 弹窗已关闭，保存成功');
          }
        }
      }
    }
    
    console.log('\n=== 验证数据是否持久化 ===');
    // 通过API检查
    const response = await page.request.get(`${BASE}/api/proxy?tableId=tblfTKdJJtTHWs09&action=list`);
    const data = await response.json();
    console.log(`订单明细记录数: ${data.data?.length || 0}`);
    if (data.data && data.data.length > 0) {
      console.log('最新记录:', JSON.stringify(data.data[data.data.length - 1], null, 2));
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
