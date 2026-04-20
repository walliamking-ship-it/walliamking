const { chromium } = require('playwright');

const BASE = 'http://124.222.108.162';

async function test() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // 捕获控制台错误
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('Console Error:', msg.text());
    }
  });
  
  page.on('pageerror', err => {
    console.log('Page Error:', err.message);
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
    await new Promise(r => setTimeout(r, 2000));
    
    const newBtn = page.locator('button:has-text("新建")').first();
    if (await newBtn.isVisible()) {
      await newBtn.click();
      await new Promise(r => setTimeout(r, 3000));
      
      // 填写客户
      const customerInput = page.locator('input[placeholder*="客户"]').first();
      if (await customerInput.isVisible()) {
        await customerInput.fill('测试客户C');
        console.log('✅ 已填写客户');
      }
      
      // 添加明细并选择产品
      const addDetailBtn = page.locator('button:has-text("添加明细")');
      if (await addDetailBtn.isVisible()) {
        await addDetailBtn.click();
        await new Promise(r => setTimeout(r, 1500));
        
        const selects = await page.locator('select').all();
        if (selects.length > 0) {
          const options = await selects[0].locator('option').count();
          console.log(`产品选项数: ${options}`);
          
          // 选择第二个产品
          if (options > 1) {
            await selects[0].selectOption({ index: 1 });
            console.log('✅ 已选择产品');
            await new Promise(r => setTimeout(r, 1500));
            
            // 检查填充的数据
            const rowData = await page.evaluate(() => {
              const inputs = document.querySelectorAll('input[type="number"]');
              return {
                inputCount: inputs.length,
                values: Array.from(inputs).map(i => i.value)
              };
            });
            console.log('数字输入框数量:', rowData.inputCount);
            console.log('输入框值:', rowData.values);
            
            // 填写数量
            const inputs = await page.locator('input[type="number"]').all();
            if (inputs.length > 1) {
              await inputs[1].fill('100');
              console.log('✅ 已填写数量');
            }
          }
        }
        
        // 尝试保存
        const saveBtn = page.locator('button:has-text("保存")');
        if (await saveBtn.isVisible()) {
          console.log('点击保存...');
          await saveBtn.click();
          await new Promise(r => setTimeout(r, 5000));
          
          // 检查弹窗是否关闭
          const modal = page.locator('[class*="fixed inset-0"]').first();
          const isModalVisible = await modal.isVisible().catch(() => false);
          console.log('弹窗是否可见:', isModalVisible);
          
          // 检查是否有错误提示
          const errorTexts = await page.locator('[class*="red"], [class*="error"], .text-red').allTextContents();
          if (errorTexts.length > 0) {
            console.log('错误提示:', errorTexts);
          }
          
          // 检查页面URL
          console.log('当前URL:', page.url());
        }
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
