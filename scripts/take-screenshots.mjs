import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import path from 'node:path';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const outputDir = path.resolve('./screenshots');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

function safeWrite(filePath, buffer) {
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      if (fs.existsSync(filePath)) {
        try { fs.unlinkSync(filePath); } catch (e) {}
      }
      fs.writeFileSync(filePath, buffer);
      return;
    } catch (err) {
      if (attempt === 4) throw err;
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 300);
    }
  }
}

async function capture() {
  console.log('📸 Launching Edge headless browser...');
  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  const captures = [
    { url: 'http://localhost:3000', name: 'homepage-desktop.png', width: 1280, height: 900 },
    { url: 'http://localhost:3000', name: 'homepage-mobile-360px.png', width: 360, height: 740 },
    { url: 'http://localhost:3000/insights/addressing-income-inequality-africa-fiscal-monetary', name: 'article-desktop.png', width: 1280, height: 900 },
    { url: 'http://localhost:3000/insights/addressing-income-inequality-africa-fiscal-monetary', name: 'article-mobile-360px.png', width: 360, height: 740 },
    { url: 'http://localhost:3000/consultation', name: 'booking-flow-desktop.png', width: 1280, height: 900 },
    { url: 'http://localhost:3000/consultation', name: 'booking-flow-mobile-360px.png', width: 360, height: 740 },
    { url: 'http://localhost:3000/admin/login', name: 'admin-login.png', width: 1280, height: 800 },
  ];

  for (const item of captures) {
    console.log(`Capturing ${item.name} (${item.width}x${item.height})...`);
    await page.setViewport({ width: item.width, height: item.height });
    await page.goto(item.url, { waitUntil: 'networkidle0', timeout: 30000 });
    const filePath = path.join(outputDir, item.name);
    const buffer = await page.screenshot({ fullPage: false });
    safeWrite(filePath, buffer);
    console.log(`Saved: ${filePath}`);
  }

  // Also capture authenticated admin dashboard
  console.log('Logging in to capture Admin Dashboard...');
  await page.setViewport({ width: 1280, height: 900 });
  await page.goto('http://localhost:3000/admin/login', { waitUntil: 'networkidle0' });
  await page.type('#admin-username', 'leadadmin');
  await page.type('#admin-password', 'SecretAdmin123!');
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle0' }),
    page.click('button[type="submit"]'),
  ]);

  const adminDashboardPath = path.join(outputDir, 'admin-dashboard-desktop.png');
  const adminBuf = await page.screenshot({ fullPage: false });
  safeWrite(adminDashboardPath, adminBuf);
  console.log(`Saved: ${adminDashboardPath}`);

  await browser.close();
  console.log('🎉 All requested screenshots captured successfully!');
}

capture().catch((err) => {
  console.error('Screenshot capture failed:', err);
  process.exit(1);
});
