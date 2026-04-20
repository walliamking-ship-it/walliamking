const { chromium } = require('playwright');

async function test() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.goto('https://mz.bizgo.com/login.html', { waitUntil: 'networkidle', timeout: 30000 });
  
  // 查找所有输入框
  const inputs = await page.locator('input').all();
  console.log('输入框数量:', inputs.length);
  
  for (let i = 0; i < inputs.length; i++) {
    const inp = inputs[i];
    const placeholder = await inp.getAttribute('placeholder');
    const type = await inp.getAttribute('type');
    const name = await inp.getAttribute('name');
    console.log(`  [${i}] type=${type}, name=${name}, placeholder=${placeholder}`);
  }
  
  await browser.close();
}

test();
