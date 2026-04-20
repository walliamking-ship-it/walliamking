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
    
    console.log('\n=== 检查产品和选择 ===');
    await page.goto(`${BASE}/sales-orders`, { waitUntil: 'networkidle', timeout: 15000 });
    await new Promise(r => setTimeout(r, 3000));
    
    const newBtn = page.locator('button:has-text("新建")').first();
    if (await newBtn.isVisible()) {
      await newBtn.click();
      await new Promise(r => setTimeout(r, 3000));
      
      // 检查products数据
      const productsData = await page.evaluate(async () => {
        // 尝试获取products
        const select = document.querySelector('select');
        if (!select) return null;
        
        const options = Array.from(select.options).slice(0, 3).map(o => ({
          value: o.value,
          text: o.text
        }));
        
        return { options };
      });
      console.log('产品下拉框选项:', JSON.stringify(productsData, null, 2));
      
      // 获取第一个选项的值
      const firstOptionValue = await page.locator('select option:nth-child(2)').getAttribute('value');
      console.log('第一个产品选项的value:', firstOptionValue);
      
      // 添加明细
      const addDetailBtn = page.locator('button:has-text("添加明细")');
      if (await addDetailBtn.isVisible()) {
        await addDetailBtn.click();
        await new Promise(r => setTimeout(r, 2000));
        
        // 选择产品
        const productSelect = page.locator('select').first();
        await productSelect.selectOption({ index: 1 });
        console.log('✅ 已选择产品');
        await new Promise(r => setTimeout(r, 3000));
        
        // 检查DOM状态
        const tableState = await page.evaluate(() => {
          const rows = document.querySelectorAll('table tbody tr');
          return Array.from(rows).map(row => {
            const cells = row.querySelectorAll('td');
            return Array.from(cells).map(c => c.textContent?.trim()).slice(0, 8);
          });
        });
        console.log('表格状态:', JSON.stringify(tableState, null, 2));
        
        // 检查输入框
        const inputValues = await page.evaluate(() => {
          const inputs = document.querySelectorAll('input');
          return Array.from(inputs).map(i => ({
            type: i.type,
            value: i.value,
            placeholder: i.placeholder
          }));
        });
        console.log('输入框状态:', JSON.stringify(inputValues.slice(0, 10), null, 2));
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
