// Rulează tests/smoke.html într-un Chrome fără ecran și iese cu cod de eroare dacă ceva nu merge.
// Folosit de GitHub Actions (.github/workflows/smoke.yml). Local:
//   python3 serve.py 8787 &   apoi   npm i --no-save puppeteer-core && node tests/smoke.mjs
import puppeteer from 'puppeteer-core';

const url = process.env.SMOKE_URL || 'http://localhost:8787/tests/smoke.html';
const chrome = process.env.CHROME_PATH || '/usr/bin/google-chrome';

const browser = await puppeteer.launch({ executablePath: chrome, headless: true, args: ['--no-sandbox', '--window-size=1366,800'] });
try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 800 });
  await page.goto(url, { waitUntil: 'load' });
  await page.waitForFunction(() => window.__smoke && window.__smoke.done, { timeout: 120000, polling: 500 });
  const r = await page.evaluate(() => window.__smoke);
  for (const x of r.results) console.log((x.ok ? '✔ ' : '✘ ') + x.name + (x.detail ? '  — ' + x.detail : ''));
  console.log(`\n${r.total - r.failed}/${r.total} verificări trecute`);
  process.exitCode = r.failed ? 1 : 0;
} finally {
  await browser.close();
}
