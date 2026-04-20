const { chromium } = require('playwright');

const BASE = 'http://124.222.108.162';

async function test() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // 监听API请求
  const apiRequests = [];
  const apiResponses = [];
  
  page.on('request', req => {
    if (req.url().includes('/api/')) {
      apiRequests.push({
        url: req.url(),
        method: req.method(),
        postData: req.postData()
      });
    }
  });
  
  page.on('response', async res => {
    if (res.url().includes('/api/')) {
      try {
        const body = await res.json();
        apiResponses.push({
          url: res.url(),
          status: res.status(),
          body: body
        });
      } catch (e) {
        apiResponses.push({
          url: res.url(),
          status: res.status(),
          body: 'non-json'
        });
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
    
    console.log('\n=== 测试订单保存 ===');
    await page.goto(`${BASE}/sales-orders`, { waitUntil: 'networkidle', timeout: 15000 });
    await new Promise(r => setTimeout(r, 2000));
    
    const newBtn = page.locator('button:has-text("新建")').first();
    await newBtn.click();
    await new Promise(r => setTimeout(r, 3000));
    
    // 填客户
    const customerInput = page.locator('input[placeholder*="客户"]').first();
    await customerInput.fill('API测试客户');
    
    // 添加明细
    const addDetailBtn = page.locator('button:has-text("添加明细")');
    await addDetailBtn.click();
    await new Promise(r => setTimeout(r, 2000));
    
    // 选择产品
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
      await productSelect.selectOption({ index: 1 });
      await new Promise(r => setTimeout(r, 2000));
      
      // 填写数量
      const inputs = await page.locator('input[type="number"]').all();
      // 找到数量输入框（placeholder为空或为0的）
      for (const inp of inputs) {
        const ph = await inp.getAttribute('placeholder');
        const type = await inp.getAttribute('type');
        if (type === 'number' && (ph === '' || ph === '0')) {
          await inp.fill('100');
          break;
        }
      }
      console.log('✅ 已填写数量');
      await new Promise(r => setTimeout(r, 1000));
      
      // 保存
      const saveBtn = page.locator('button:has-text("保存")');
      await saveBtn.click();
      await new Promise(r => setTimeout(r, 5000));
      
      // 打印API请求和响应
      console.log('\n=== API请求 ===');
      apiRequests.forEach((req, i) => {
        console.log(`[${i}] ${req.method} ${req.url}`);
        if (req.postData) {
          try {
            const data = JSON.parse(req.postData);
            console.log('    Body:', JSON.stringify(data, null, 2).slice(0, 500));
          } catch (e) {
            console.log('    Body:', req.postData);
          }
        }
      });
      
      console.log('\n=== API响应 ===');
      apiResponses.forEach((res, i) => {
        console.log(`[${i}] ${res.status} ${res.url}`);
        if (res.body && typeof res.body === 'object') {
          console.log('    Response:', JSON.stringify(res.body).slice(0, 500));
        }
      });
    }
    
    console.log('\n=== 测试完成 ===');
  } catch (e) {
    console.error('测试异常:', e.message);
  } finally {
    await browser.close();
  }
}

test();
