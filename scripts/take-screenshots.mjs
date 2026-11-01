import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import path from 'node:path';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const outputDir = path.resolve('./screenshots');
const artifactDir = 'C:\\Users\\PC\\.gemini\\antigravity\\brain\\fa5b768a-a18e-422f-bc0d-ea1d26b258bc';

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}
if (!fs.existsSync(artifactDir)) {
  fs.mkdirSync(artifactDir, { recursive: true });
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

function saveToBoth(filename, buffer) {
  const localPath = path.join(outputDir, filename);
  safeWrite(localPath, buffer);
  const artifactPath = path.join(artifactDir, filename);
  safeWrite(artifactPath, buffer);
  console.log(`Saved: ${filename} (local & artifact)`);
}

async function capture() {
  console.log('📸 Launching Edge headless browser...');
  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  // 1. Public Pages (Desktop 1280x900 & Mobile 360x740)
  const publicPages = [
    { url: 'http://localhost:3000', nameBase: 'institutional-homepage' },
    { url: 'http://localhost:3000/about', nameBase: 'about-institutional' },
    { url: 'http://localhost:3000/projects', nameBase: 'projects-listing' },
    { url: 'http://localhost:3000/partners', nameBase: 'partners-listing' },
    { url: 'http://localhost:3000/partners/partner-with-us', nameBase: 'partner-with-us' },
    { url: 'http://localhost:3000/news', nameBase: 'news-listing' },
    { url: 'http://localhost:3000/news/media-gallery', nameBase: 'media-gallery' },
    { url: 'http://localhost:3000/consultation', nameBase: 'consultation-booking' },
    { url: 'http://localhost:3000/ask', nameBase: 'ask-question' },
  ];

  for (const item of publicPages) {
    // Desktop
    console.log(`Capturing Desktop: ${item.nameBase}...`);
    await page.setViewport({ width: 1280, height: 900 });
    await page.goto(item.url, { waitUntil: 'networkidle0', timeout: 30000 });
    let buf = await page.screenshot({ fullPage: false });
    saveToBoth(`${item.nameBase}-desktop.png`, buf);

    // Mobile
    console.log(`Capturing Mobile (360px): ${item.nameBase}...`);
    await page.setViewport({ width: 360, height: 740 });
    await page.goto(item.url, { waitUntil: 'networkidle0', timeout: 30000 });
    buf = await page.screenshot({ fullPage: false });
    saveToBoth(`${item.nameBase}-mobile-360px.png`, buf);
  }

  // 2. Desktop Navigation Dropdown in action
  console.log('Capturing Desktop Navigation Dropdown...');
  await page.setViewport({ width: 1280, height: 900 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0', timeout: 30000 });
  const dropdownButton = await page.$('button[aria-haspopup="true"]');
  if (dropdownButton) {
    await dropdownButton.hover();
    await new Promise(r => setTimeout(r, 600));
    const navBuf = await page.screenshot({ fullPage: false });
    saveToBoth('navigation-dropdown-desktop.png', navBuf);
  }

  // 3. Mobile Navigation Drawer in action
  console.log('Capturing Mobile Navigation Drawer...');
  await page.setViewport({ width: 360, height: 740 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0', timeout: 30000 });
  const mobileMenuToggle = await page.$('button[aria-label="Open menu"]');
  if (mobileMenuToggle) {
    await mobileMenuToggle.click();
    await new Promise(r => setTimeout(r, 600));
    const drawerBuf = await page.screenshot({ fullPage: false });
    saveToBoth('navigation-mobile-drawer.png', drawerBuf);
  }

  // 4. Authenticated Admin Pages
  console.log('Generating ephemeral session to capture Admin Portal...');
  const { DatabaseSync } = await import('node:sqlite');
  const crypto = await import('node:crypto');
  const db = new DatabaseSync('./data/economist.db');
  
  let adminUser = db.prepare(`SELECT id FROM admin_users LIMIT 1`).get();
  let createdEphemeralUser = false;
  let adminId = adminUser?.id;
  if (!adminId) {
    const res = db.prepare(`INSERT INTO admin_users (username, email, password_hash) VALUES ('ephemeral_verify', 'verify@tefpc.or.tz', 'disabled')`).run();
    adminId = Number(res.lastInsertRowid);
    createdEphemeralUser = true;
  }

  const ephemeralToken = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
  db.prepare(`INSERT INTO admin_sessions (token, admin_id, expires_at) VALUES (?, ?, ?)`).run(ephemeralToken, adminId, expiresAt);

  try {
    await page.setCookie({
      name: 'econ_admin_session',
      value: ephemeralToken,
      domain: 'localhost',
      path: '/',
      httpOnly: true,
    });

    const adminPages = [
      { url: 'http://localhost:3000/admin', name: 'admin-dashboard-overview-desktop.png', width: 1280, height: 900 },
      { url: 'http://localhost:3000/admin', name: 'admin-dashboard-overview-mobile-360px.png', width: 360, height: 740 },
      { url: 'http://localhost:3000/admin/navigation', name: 'admin-navigation-editor-desktop.png', width: 1280, height: 900 },
      { url: 'http://localhost:3000/admin/pages', name: 'admin-pages-editor-desktop.png', width: 1280, height: 900 },
      { url: 'http://localhost:3000/admin/slides', name: 'admin-slideshow-manager-desktop.png', width: 1280, height: 900 },
      { url: 'http://localhost:3000/admin/projects', name: 'admin-projects-manager-desktop.png', width: 1280, height: 900 },
      { url: 'http://localhost:3000/admin/partners', name: 'admin-partners-manager-desktop.png', width: 1280, height: 900 },
      { url: 'http://localhost:3000/admin/insights', name: 'admin-news-insights-manager-desktop.png', width: 1280, height: 900 },
    ];

    for (const item of adminPages) {
      console.log(`Capturing ${item.name} (${item.width}x${item.height})...`);
      await page.setViewport({ width: item.width, height: item.height });
      await page.goto(item.url, { waitUntil: 'networkidle0', timeout: 30000 });
      const buf = await page.screenshot({ fullPage: false });
      saveToBoth(item.name, buf);
    }

    // Modal Capture 1: Project Editor with Gallery & Linkages
    console.log('Capturing Admin Project Modal with Gallery & Research/News linkages...');
    await page.goto('http://localhost:3000/admin/projects', { waitUntil: 'networkidle0', timeout: 30000 });
    const clickedProj = await page.evaluate(() => {
      const b = Array.from(document.querySelectorAll('button')).find(el => el.textContent?.includes('Project'));
      if (b) { b.click(); return true; }
      return false;
    });
    if (clickedProj) {
      await new Promise(r => setTimeout(r, 600));
      const projModalBuf = await page.screenshot({ fullPage: false });
      saveToBoth('admin-project-modal-desktop.png', projModalBuf);
    }

    // Modal Capture 2: News Editor with Gallery & Project/Event linkages
    console.log('Capturing Admin News Modal with Gallery & Project/Event linkages...');
    await page.goto('http://localhost:3000/admin/insights', { waitUntil: 'networkidle0', timeout: 30000 });
    const clickedNews = await page.evaluate(() => {
      const b = Array.from(document.querySelectorAll('button')).find(el => el.textContent?.includes('Announcement'));
      if (b) { b.click(); return true; }
      return false;
    });
    if (clickedNews) {
      await new Promise(r => setTimeout(r, 600));
      const newsModalBuf = await page.screenshot({ fullPage: false });
      saveToBoth('admin-news-modal-desktop.png', newsModalBuf);
    }

    // Modal Capture 3: Slide Editor with Event Photo Reuse Picker
    console.log('Capturing Admin Slideshow Modal with Event Photo Reuse...');
    await page.goto('http://localhost:3000/admin/slides', { waitUntil: 'networkidle0', timeout: 30000 });
    const clickedSlide = await page.evaluate(() => {
      const b = Array.from(document.querySelectorAll('button')).find(el => el.textContent?.includes('Slide'));
      if (b) { b.click(); return true; }
      return false;
    });
    if (clickedSlide) {
      await new Promise(r => setTimeout(r, 600));
      const slideModalBuf = await page.screenshot({ fullPage: false });
      saveToBoth('admin-slideshow-modal-desktop.png', slideModalBuf);
    }

  } finally {
    db.prepare(`DELETE FROM admin_sessions WHERE token = ?`).run(ephemeralToken);
    if (createdEphemeralUser) {
      db.prepare(`DELETE FROM admin_users WHERE username = 'ephemeral_verify'`).run();
    }
  }

  await browser.close();
  console.log('🎉 All institutional website transformation screenshots captured successfully!');
}

capture().catch((err) => {
  console.error('Screenshot capture failed:', err);
  process.exit(1);
});
