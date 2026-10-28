// Find Playwright and a Chrome, or connect to a remote browser over CDP.
import fs from 'node:fs';
import os from 'node:os';
import { createRequire } from 'node:module';
import path from 'node:path';

// Software WebGL in headless Chrome, so 3D pages render the same on any machine
// (CI boxes and servers have no GPU). Pass --gpu to use the real GPU instead.
export const SOFTWARE_GL = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'];

export async function loadPlaywright() {
  const tries = ['playwright', 'playwright-core'];
  const req = createRequire(path.join(process.cwd(), 'noop.js'));
  for (const name of tries) {
    try { return await import(name); } catch {}
    try { return await import(req.resolve(name)); } catch {}
  }
  throw new Error('Playwright not found. Install it next to your project:\n  npm i -D playwright && npx playwright install chromium\n(or npm i -D playwright-core and point --chrome at an installed Chrome)');
}

const CHROME_PATHS = [
  process.env.CHROME_PATH,
  '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium', '/usr/bin/chromium-browser',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
].filter(Boolean);

function playwrightCacheShells() {
  const dirs = [process.env.PLAYWRIGHT_BROWSERS_PATH, path.join(os.homedir(), '.cache/ms-playwright'),
    path.join(os.homedir(), 'Library/Caches/ms-playwright'), path.join(os.homedir(), 'AppData/Local/ms-playwright')].filter(Boolean);
  const out = [];
  for (const d of dirs) {
    let names = [];
    try { names = fs.readdirSync(d); } catch { continue; }
    for (const n of names.sort().reverse()) {
      for (const rel of ['chrome-headless-shell-linux64/chrome-headless-shell', 'chrome-linux/chrome', 'chrome-linux64/chrome',
        'chrome-headless-shell-mac-arm64/chrome-headless-shell', 'chrome-headless-shell-mac-x64/chrome-headless-shell',
        'chrome-mac/Chromium.app/Contents/MacOS/Chromium', 'chrome-win/chrome.exe', 'chrome-headless-shell-win64/chrome-headless-shell.exe']) {
        if (/^chromium/.test(n)) out.push(path.join(d, n, rel));
      }
    }
  }
  return out;
}

export async function openBrowser({ chrome, cdp, gpu = false, headed = false } = {}) {
  const pw = await loadPlaywright();
  const chromium = pw.chromium || pw.default?.chromium;
  if (cdp) {
    const browser = await chromium.connectOverCDP(cdp);
    return { browser, pw, how: 'remote (CDP)', remote: true };
  }
  const args = gpu ? [] : SOFTWARE_GL;
  const attempts = [];
  if (chrome) attempts.push({ executablePath: chrome });
  attempts.push({});                                   // Playwright's own downloaded browser
  attempts.push({ channel: 'chrome' });                // installed Google Chrome
  for (const p of [...CHROME_PATHS, ...playwrightCacheShells()]) if (fs.existsSync(p)) attempts.push({ executablePath: p });
  const errors = [];
  for (const a of attempts) {
    try {
      const browser = await chromium.launch({ ...a, headless: !headed, args });
      return { browser, pw, how: a.executablePath ? `local ${a.executablePath}` : a.channel ? 'local Chrome (channel)' : 'Playwright Chromium', remote: false };
    } catch (e) { errors.push((a.executablePath || a.channel || 'bundled') + ': ' + String(e.message).split('\n')[0]); }
  }
  throw new Error('Could not start Chrome. Tried:\n  ' + errors.join('\n  ') + '\nFix: npx playwright install chromium   (or pass --chrome /path/to/chrome)');
}
