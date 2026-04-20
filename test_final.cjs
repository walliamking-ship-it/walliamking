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
    
    console.log('\n=== 测试完整流程 ===');
    await page.goto(`${BASE}/sales-orders`, { waitUntil: 'networkidle', timeout: 15000 });
    await new Promise(r => setTimeout(r, 2000));
    
    // 点击新建
    const newBtn = page.locator('button:has-text("新建")').first();
    if (await newBtn.isVisible()) {
      await newBtn.click();
      await new Promise(r => setTimeout(r, 3000));
      console.log('✅ 打开新建表单');
      
      // 填写客户名称
      const customerInput = page.locator('input[placeholder*="客户"]').first();
      if (await customerInput.isVisible()) {
        await customerInput.fill('测试客户Final');
        console.log('✅ 已填写客户');
      }
      
      // 点击添加明细
      const addDetailBtn = page.locator('button:has-text("添加明细")');
      if (await addDetailBtn.isVisible()) {
        await addDetailBtn.click();
        await new Promise(r => setTimeout(r, 2000));
        console.log('✅ 已添加明细行');
        
        // 找产品选择器（最后一个select，有"请选择产品"选项）
        const selects = await page.locator('select').all();
        console.log(`找到 ${selects.length} 个选择器`);
        
        // 找到产品选择器
        let productSelect = null;
        for (const sel of selects) {
          const firstOption = await sel.locator('option').first().textContent();
          if (firstOption?.includes('产品')) {
            productSelect = sel;
            const optCount = await sel.locator('option').count();
            console.log(`找到产品选择器，选项数: ${optCount}`);
            break;
          }
        }
        
        if (productSelect) {
          // 选择第一个产品
          await productSelect.selectOption({ index: 1 });
          console.log('✅ 已选择产品');
          await new Promise(r => setTimeout(r, 2000));
          
          // 检查输入框值
          const inputValues = await page.evaluate(() => {
            const inputs = document.querySelectorAll('input[type="number"]');
            return Array.from(inputs).map(i => i.value);
          });
          console.log('选择产品后的输入框:', inputValues);
          
          // 填写数量
          const inputs = await page.locator('input[type="number"]').all();
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
            const currentUrl = page.url();
            console.log('保存后URL:', currentUrl);
            
            // 检查是否有错误
            const errorText = await page.locator('[class*="red"], [class*="error"]').first().textContent().catch(() => '');
            if (errorText) {
              console.log('错误:', errorText);
            } else {
              console.log('✅ 保存成功！');
            }
          }
        }
      }
    }
    
    console.log('\n=== 测试完成 ===');
  } catch (e) {
    console.error('测试异常:', e.message);
    await page.screenshot({ path: '/tmp/final_error.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

test();
