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
    
    console.log('\n=== 正确测试产品选择 ===');
    await page.goto(`${BASE}/sales-orders`, { waitUntil: 'networkidle', timeout: 15000 });
    await new Promise(r => setTimeout(r, 3000));
    
    const newBtn = page.locator('button:has-text("新建")').first();
    if (await newBtn.isVisible()) {
      await newBtn.click();
      await new Promise(r => setTimeout(r, 3000));
      
      // 添加明细
      const addDetailBtn = page.locator('button:has-text("添加明细")');
      if (await addDetailBtn.isVisible()) {
        await addDetailBtn.click();
        await new Promise(r => setTimeout(r, 2000));
        
        // 获取所有select的信息
        const selectsInfo = await page.evaluate(() => {
          const selects = document.querySelectorAll('select');
          return Array.from(selects).map((s, i) => ({
            index: i,
            optionsCount: s.options.length,
            firstOption: s.options[0]?.text,
            hasEmptyValue: Array.from(s.options).some(o => o.value === '')
          }));
        });
        console.log('所有select:', JSON.stringify(selectsInfo, null, 2));
        
        // 找产品选择器（应该有多个选项且不是客户/状态选择器）
        // 通常产品选择器在明细表格中
        const productSelectIndex = selectsInfo.findIndex((s, i) => 
          i > 0 && s.optionsCount > 2 && !s.firstOption?.includes('客户') && !s.firstOption?.includes('收款')
        );
        console.log('产品选择器索引:', productSelectIndex);
        
        if (productSelectIndex >= 0) {
          const productSelect = page.locator('select').nth(productSelectIndex);
          const productOptions = await productSelect.locator('option').allTextContents();
          console.log('产品选项:', productOptions.slice(0, 5));
          
          // 选择第一个产品
          await productSelect.selectOption({ index: 1 });
          console.log('✅ 已选择产品(index 1)');
          await new Promise(r => setTimeout(r, 3000));
          
          // 检查输入框
          const inputValues = await page.evaluate(() => {
            const inputs = document.querySelectorAll('input[type="number"]');
            return Array.from(inputs).map(i => i.value);
          });
          console.log('输入框值:', inputValues);
          
          // 填写数量
          const inputs = await page.locator('input[type="number"]').all();
          if (inputs.length > 1) {
            await inputs[1].fill('50');
            console.log('✅ 已填写数量');
            await new Promise(r => setTimeout(r, 1000));
          }
          
          // 保存
          const saveBtn = page.locator('button:has-text("保存")');
          if (await saveBtn.isVisible()) {
            console.log('点击保存...');
            await saveBtn.click();
            await new Promise(r => setTimeout(r, 5000));
            
            // 检查是否成功
            const currentUrl = page.url();
            console.log('保存后URL:', currentUrl);
            
            // 检查是否有错误弹窗
            const modalCount = await page.locator('[class*="fixed inset-0"]').count();
            console.log('遮罩层数量:', modalCount);
          }
        }
      }
    }
    
    console.log('\n=== 测试完成 ===');
  } catch (e) {
    console.error('测试异常:', e.message);
    await page.screenshot({ path: '/tmp/select_error.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

test();
