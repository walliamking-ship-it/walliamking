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
    
    console.log('\n=== 测试产品数据加载 ===');
    await page.goto(`${BASE}/products`, { waitUntil: 'networkidle', timeout: 15000 });
    await new Promise(r => setTimeout(r, 3000));
    
    // 检查产品数量
    const productCount = await page.locator('table tbody tr').count();
    console.log(`产品列表行数: ${productCount}`);
    
    // 获取产品数据
    const products = await page.evaluate(() => {
      const rows = document.querySelectorAll('table tbody tr');
      return Array.from(rows).slice(0, 3).map(row => {
        const cells = row.querySelectorAll('td');
        return {
          cellsCount: cells.length,
          text: Array.from(cells).map(c => c.textContent?.trim()).slice(0, 4)
        };
      });
    });
    console.log('产品数据:', JSON.stringify(products, null, 2));
    
    // 通过API检查
    const response = await page.request.get(`${BASE}/api/proxy?tableId=tblVj4gqWCKr06qO&action=list`);
    const data = await response.json();
    console.log(`API产品数量: ${data.data?.length || 0}`);
    if (data.data && data.data.length > 0) {
      console.log('第一个产品:', JSON.stringify(data.data[0]));
    }
    
    console.log('\n=== 测试完成 ===');
  } catch (e) {
    console.error('测试异常:', e.message);
  } finally {
    await browser.close();
  }
}

test();
