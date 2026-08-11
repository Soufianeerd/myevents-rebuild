const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');
const EXE =
  process.env.HOME + '/.cache/ms-playwright/chromium-1148/chrome-linux/chrome';
(async () => {
  const only = process.argv[2];
  const dir = path.join(__dirname, 'screens');
  let files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.html'))
    .sort();
  if (only) files = files.filter((f) => f.startsWith(only));
  const b = await chromium.launch({
    executablePath: EXE,
    args: [
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--font-render-hinting=none',
      '--force-color-profile=srgb',
    ],
  });
  const ctx = await b.newContext({ deviceScaleFactor: 2 });
  const p = await ctx.newPage();
  fs.mkdirSync(path.join(__dirname, 'png'), { recursive: true });
  for (const f of files) {
    await p.goto('file://' + path.join(dir, f), { waitUntil: 'networkidle' });
    await p.evaluate(() => document.fonts.ready);
    await p.waitForTimeout(500);
    const el = await p.$('#shot');
    await el.screenshot({
      path: path.join(__dirname, 'png', f.replace('.html', '.png')),
    });
    const bb = await el.boundingBox();
    console.log('✓', f, Math.round(bb.width) + '×' + Math.round(bb.height));
  }
  await b.close();
})();
