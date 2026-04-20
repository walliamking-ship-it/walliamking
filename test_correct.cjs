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
    console.log('✅ 登录成功');
    
    console.log('\n=== 正确测试：使用下拉框选择客户 ===');
    await page.goto(`${BASE}/sales-orders`, { waitUntil: 'networkidle', timeout: 15000 });
    await new Promise(r => setTimeout(r, 2000));
    
    // 点击新建
    const newBtn = page.locator('button:has-text("新建")').first();
    await newBtn.click();
    await new Promise(r => setTimeout(r, 3000));
    console.log('✅ 打开新建表单');
    
    // 找到客户下拉框（第一个select）
    const customerSelect = page.locator('select').first();
    const customerOptions = await customerSelect.locator('option').allTextContents();
    console.log('客户选项:', customerOptions.slice(0, 5));
    
    // 选择一个客户（选择第二个选项，跳过"请选择"）
    if (customerOptions.length > 1) {
      await customerSelect.selectOption({ index: 1 });
      console.log('✅ 已选择客户');
      await new Promise(r => setTimeout(r, 1000));
    }
    
    // 点击添加明细
    const addDetailBtn = page.locator('button:has-text("添加明细")');
    if (await addDetailBtn.isVisible()) {
      await addDetailBtn.click();
      await new Promise(r => setTimeout(r, 2000));
      console.log('✅ 已添加明细行');
      
      // 找到产品选择器
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
        // 选择产品
        await productSelect.selectOption({ index: 1 });
        console.log('✅ 已选择产品');
        await new Promise(r => setTimeout(r, 2000));
        
        // 检查输入框
        const inputDetails = await page.evaluate(() => {
          const inputs = document.querySelectorAll('input[type="number"]');
          return Array.from(inputs).map(i => i.value);
        });
        console.log('选择产品后输入框:', inputDetails);
        
        // 填写数量（找到数量输入框）
        const inputs = await page.locator('input[type="number"]').all();
        // 数量输入框通常是第二个（index 1）
        if (inputs.length > 1) {
          await inputs[1].fill('100');
          console.log('✅ 已填写数量');
          await new Promise(r => setTimeout(r, 1000));
        }
        
        // 保存
        const saveBtn = page.locator('button:has-text("保存")');
        if (await saveBtn.isVisible()) {
          console.log('点击保存...');
          await saveBtn.click();
          await new Promise(r => setTimeout(r, 5000));
          
          // 检查结果
          const hasModal = await page.locator('[class*="fixed inset-0"]').first().isVisible().catch(() => false);
          if (!hasModal) {
            console.log('✅ 订单保存成功！');
          } else {
            const error = await page.locator('[class*="red"]').first().textContent().catch(() => '');
            console.log('❌ 保存失败:', error || '未知错误');
          }
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
