const { chromium } = require('playwright');

const BASE = 'http://124.222.108.162';

async function test() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // 监听网络请求
  page.on('response', async response => {
    if (response.url().includes('/api/proxy')) {
      const status = response.status();
      const url = response.url();
      if (status !== 200) {
        console.log(`API ${url} => ${status}`);
      }
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
    
    console.log('\n=== 测试销售订单新建 ===');
    await page.goto(`${BASE}/sales-orders`, { waitUntil: 'networkidle', timeout: 15000 });
    await new Promise(r => setTimeout(r, 3000));
    
    const newBtn = page.locator('button:has-text("新建")').first();
    if (await newBtn.isVisible()) {
      await newBtn.click();
      await new Promise(r => setTimeout(r, 3000));
      
      // 填写客户
      const customerInput = page.locator('input[placeholder*="客户"]').first();
      if (await customerInput.isVisible()) {
        await customerInput.fill('测试客户D');
        console.log('✅ 已填写客户');
      }
      
      // 添加明细
      const addDetailBtn = page.locator('button:has-text("添加明细")');
      if (await addDetailBtn.isVisible()) {
        await addDetailBtn.click();
        await new Promise(r => setTimeout(r, 2000));
        
        // 获取select元素
        const productSelect = page.locator('select').first();
        const optionsCount = await productSelect.locator('option').count();
        console.log(`产品选项数: ${optionsCount}`);
        
        // 直接用evaluate来测试
        const beforeSelect = await page.evaluate(() => {
          const inputs = document.querySelectorAll('input[type="number"]');
          return Array.from(inputs).map(i => ({ value: i.value, placeholder: i.placeholder }));
        });
        console.log('选择前输入框:', JSON.stringify(beforeSelect));
        
        // 选择产品
        await productSelect.selectOption({ index: 1 });
        console.log('✅ 已选择产品(index 1)');
        await new Promise(r => setTimeout(r, 2000));
        
        const afterSelect = await page.evaluate(() => {
          const inputs = document.querySelectorAll('input[type="number"]');
          return Array.from(inputs).map(i => ({ value: i.value, placeholder: i.placeholder }));
        });
        console.log('选择后输入框:', JSON.stringify(afterSelect));
        
        // 手动触发input事件
        const inputs = await page.locator('input[type="number"]').all();
        if (inputs.length > 1) {
          await inputs[1].click();
          await inputs[1].fill('100');
          console.log('✅ 已填写数量');
          await new Promise(r => setTimeout(r, 1000));
        }
        
        // 检查最终状态
        const finalState = await page.evaluate(() => {
          const inputs = document.querySelectorAll('input[type="number"]');
          return Array.from(inputs).map(i => i.value);
        });
        console.log('最终输入框值:', finalState);
        
        // 保存
        const saveBtn = page.locator('button:has-text("保存")');
        if (await saveBtn.isVisible()) {
          console.log('点击保存...');
          await saveBtn.click();
          await new Promise(r => setTimeout(r, 5000));
          
          // 检查URL
          console.log('当前URL:', page.url());
          
          // 检查是否还有弹窗
          const modal = await page.locator('[class*="modal"], [role="dialog"]').count();
          console.log('弹窗数量:', modal);
        }
      }
    }
    
    console.log('\n=== 测试完成 ===');
  } catch (e) {
    console.error('测试异常:', e.message);
    await page.screenshot({ path: '/tmp/debug_error.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

test();
