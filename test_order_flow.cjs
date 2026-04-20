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
    
    console.log('\n=== 测试订单明细流程 ===');
    await page.goto(`${BASE}/sales-orders`, { waitUntil: 'networkidle', timeout: 15000 });
    await new Promise(r => setTimeout(r, 2000));
    
    // 新建
    const newBtn = page.locator('button:has-text("新建")').first();
    await newBtn.click();
    await new Promise(r => setTimeout(r, 3000));
    
    // 填客户
    const customerInput = page.locator('input[placeholder*="客户"]').first();
    await customerInput.fill('测试客户Flow');
    console.log('✅ 已填客户');
    
    // 添加明细
    const addDetailBtn = page.locator('button:has-text("添加明细")');
    await addDetailBtn.click();
    await new Promise(r => setTimeout(r, 2000));
    
    // 找产品选择器
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
      console.log('✅ 已选产品');
      await new Promise(r => setTimeout(r, 2000));
      
      // 获取输入框详情
      const inputDetails = await page.evaluate(() => {
        const inputs = document.querySelectorAll('input');
        return Array.from(inputs).map(i => ({
          type: i.type,
          value: i.value,
          placeholder: i.placeholder,
          className: i.className
        }));
      });
      console.log('\n所有输入框详情:');
      inputDetails.forEach((inp, i) => {
        console.log(`  [${i}] type=${inp.type}, value=${inp.value || '(空)'}, placeholder=${inp.placeholder || '(无)'}`);
      });
      
      // 数量输入框（placeholder为空的）
      const inputs = await page.locator('input[type="number"]').all();
      const qtyInput = inputs.find(async inp => {
        const ph = await inp.getAttribute('placeholder');
        return ph === '';
      });
      
      if (qtyInput) {
        await qtyInput.fill('100');
        console.log('\n✅ 已填数量100');
        await new Promise(r => setTimeout(r, 1000));
      }
      
      // 保存
      const saveBtn = page.locator('button:has-text("保存")');
      await saveBtn.click();
      await new Promise(r => setTimeout(r, 5000));
      
      // 检查结果
      const hasModal = await page.locator('[class*="fixed inset-0"]').first().isVisible().catch(() => false);
      console.log('\n保存后弹窗可见:', hasModal);
      
      if (!hasModal) {
        console.log('✅ 订单保存成功！');
      } else {
        const error = await page.locator('[class*="red"]').first().textContent().catch(() => '');
        console.log('❌ 保存失败:', error || '未知错误');
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
