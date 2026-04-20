const { chromium } = require('playwright');

async function test() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.goto('https://mz.bizgo.com/login.html', { waitUntil: 'networkidle', timeout: 30000 });
  
  // 查找验证码图片
  const captchaImg = page.locator('img[src*="captcha"], img[src*="code"], img[src*="auth"]').first();
  if (await captchaImg.isVisible()) {
    const src = await captchaImg.getAttribute('src');
    console.log('验证码图片src:', src);
    
    // 尝试获取验证码图片内容
    const imgBuffer = await page.evaluate(async (src) => {
      const resp = await fetch(src);
      const buf = await resp.arrayBuffer();
      return Buffer.from(buf).toString('base64');
    }, src);
    
    if (imgBuffer) {
      require('fs').writeFileSync('/tmp/captcha.png', Buffer.from(imgBuffer, 'base64'));
      console.log('验证码图片保存到 /tmp/captcha.png');
    }
  }
  
  await browser.close();
}

test();
