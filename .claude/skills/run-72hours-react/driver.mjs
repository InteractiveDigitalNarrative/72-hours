#!/usr/bin/env node
// driver.mjs — zero-dependency CDP driver for the 72hours-react web app.
//
// Drives the *installed* Google Chrome in headless mode over the Chrome
// DevTools Protocol, using Node's built-in global WebSocket (Node >= 22).
// No puppeteer / playwright / chromium-cli needed.
//
// Assumes a vite dev server is already running. Default app URL:
//   http://localhost:5173/storm-alert/   (note the /storm-alert/ base path)
//
// Usage:
//   node driver.mjs smoke              # full launch + click-through + screenshots
//   node driver.mjs shot [url] [out]   # one screenshot of a URL
//
// Env overrides: APP_URL, CHROME_BIN, CDP_PORT, OUT_DIR, HEADLESS=0

import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';

const APP_URL = process.env.APP_URL || 'http://localhost:5173/storm-alert/';
const PORT = Number(process.env.CDP_PORT || 9222);
const OUT_DIR = process.env.OUT_DIR || '/tmp/72h-shots';
const HEADLESS = process.env.HEADLESS !== '0';
const CHROME_BIN =
  process.env.CHROME_BIN ||
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

// ---------------------------------------------------------------- CDP client
class CDP {
  #ws;
  #id = 0;
  #pending = new Map();
  constructor(ws) { this.#ws = ws; }

  static async attach(port) {
    // Get the page target's websocket URL.
    let targets;
    for (let i = 0; i < 30; i++) {
      try {
        const r = await fetch(`http://localhost:${port}/json`);
        targets = await r.json();
        if (targets.some((t) => t.type === 'page')) break;
      } catch {}
      await sleep(250);
    }
    const page = targets.find((t) => t.type === 'page');
    if (!page) throw new Error('no page target on CDP endpoint');
    const ws = new WebSocket(page.webSocketDebuggerUrl);
    await new Promise((res, rej) => {
      ws.onopen = res;
      ws.onerror = (e) => rej(new Error('ws connect failed: ' + e.message));
    });
    const cdp = new CDP(ws);
    ws.onmessage = (ev) => cdp.#onMessage(ev.data);
    return cdp;
  }

  #onMessage(data) {
    const msg = JSON.parse(data);
    if (msg.id && this.#pending.has(msg.id)) {
      const { res, rej } = this.#pending.get(msg.id);
      this.#pending.delete(msg.id);
      if (msg.error) rej(new Error(JSON.stringify(msg.error)));
      else res(msg.result);
    }
  }

  send(method, params = {}) {
    const id = ++this.#id;
    this.#ws.send(JSON.stringify({ id, method, params }));
    return new Promise((res, rej) => this.#pending.set(id, { res, rej }));
  }

  // Evaluate an expression in the page, return the JS value.
  async eval(expression) {
    const r = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    if (r.exceptionDetails)
      throw new Error('eval: ' + JSON.stringify(r.exceptionDetails));
    return r.result.value;
  }

  async navigate(url) {
    await this.send('Page.enable');
    await this.send('Page.navigate', { url });
    await sleep(1200); // let React mount
  }

  async screenshot(name) {
    const { data } = await this.send('Page.captureScreenshot', { format: 'png' });
    const file = `${OUT_DIR}/${name}.png`;
    writeFileSync(file, Buffer.from(data, 'base64'));
    return file;
  }

  // Click first element whose visible text contains `text` (case-insensitive),
  // optionally restricted to a CSS selector. Returns true if clicked.
  async clickText(text, selector = 'button, a, .menu-btn, .lang-btn, .choice') {
    return this.eval(`(() => {
      const want = ${JSON.stringify(text.toLowerCase())};
      const els = [...document.querySelectorAll(${JSON.stringify(selector)})];
      const el = els.find(e => (e.innerText || e.textContent || '').toLowerCase().includes(want));
      if (!el) return false;
      el.click();
      return true;
    })()`);
  }

  async clickSel(selector) {
    return this.eval(`(() => {
      const el = document.querySelector(${JSON.stringify(selector)});
      if (!el) return false; el.click(); return true;
    })()`);
  }

  // Visible body text, collapsed — handy for asserting state.
  text() {
    return this.eval('document.body.innerText.replace(/\\s+/g," ").trim().slice(0,600)');
  }
}

// ---------------------------------------------------------------- Chrome mgmt
function launchChrome() {
  if (!existsSync(CHROME_BIN))
    throw new Error(`Chrome not found at ${CHROME_BIN} — set CHROME_BIN`);
  const args = [
    HEADLESS ? '--headless=new' : '--new-window',
    `--remote-debugging-port=${PORT}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--user-data-dir=/tmp/chrome-72h-driver',
    '--window-size=1280,900',
    'about:blank',
  ];
  const proc = spawn(CHROME_BIN, args, { stdio: 'ignore', detached: false });
  return proc;
}

// ---------------------------------------------------------------- flows
async function smoke() {
  mkdirSync(OUT_DIR, { recursive: true });
  const chrome = launchChrome();
  let cdp;
  try {
    cdp = await CDP.attach(PORT);
    await cdp.navigate(APP_URL);

    console.log('1. language screen:', (await cdp.text()).slice(0, 80));
    let s = await cdp.screenshot('01-language');
    console.log('   shot:', s);

    if (!(await cdp.clickText('English'))) throw new Error('English button not found');
    await sleep(1000);
    console.log('2. after English ->', (await cdp.text()).slice(0, 80));
    await cdp.screenshot('02-demography');

    // Demography screen has a skip path; try skip, else continue.
    await cdp.clickText('skip').catch(() => {});
    await cdp.clickText('continue').catch(() => {});
    await sleep(1200);
    await cdp.screenshot('03-after-demography');

    // Loading screen -> ENTER
    await cdp.clickText('enter').catch(() => {});
    await sleep(1500);
    const menuTxt = await cdp.text();
    console.log('3. menu/loading ->', menuTxt.slice(0, 120));
    await cdp.screenshot('04-menu');

    // Start the game.
    const started = await cdp.clickText('start');
    await sleep(2000);
    console.log('4. start clicked:', started, '->', (await cdp.text()).slice(0, 120));
    const gameShot = await cdp.screenshot('05-game');
    console.log('   shot:', gameShot);

    console.log('\nSMOKE OK — screenshots in', OUT_DIR);
  } finally {
    try { await cdp?.send('Browser.close'); } catch {}
    try { chrome.kill('SIGKILL'); } catch {}
  }
}

async function shot() {
  const url = process.argv[3] || APP_URL;
  const out = process.argv[4] || 'shot';
  mkdirSync(OUT_DIR, { recursive: true });
  const chrome = launchChrome();
  try {
    const cdp = await CDP.attach(PORT);
    await cdp.navigate(url);
    const f = await cdp.screenshot(out);
    console.log('shot:', f);
    await cdp.send('Browser.close').catch(() => {});
  } finally {
    chrome.kill('SIGKILL');
  }
}

const cmd = process.argv[2] || 'smoke';
const fns = { smoke, shot };
if (!fns[cmd]) { console.error('unknown command:', cmd); process.exit(2); }
fns[cmd]().catch((e) => { console.error('FAIL:', e.message); process.exit(1); });
