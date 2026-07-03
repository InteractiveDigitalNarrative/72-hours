#!/usr/bin/env node
// responsive.mjs — multi-device responsiveness audit for 72hours-react.
//
// Zero-dependency CDP driver (Node >= 22 global WebSocket) that drives the
// *installed* Google Chrome headless. Walks the game flow once PER device
// viewport, emulating screen size + touch, and screenshots every screen.
// Also flags horizontal overflow and tiny tap targets programmatically.
//
// Requires a vite dev server already running (npm run dev).
//   default APP_URL = http://localhost:5173/storm-alert/  (base /storm-alert/)
//
// Usage:
//   node responsive.mjs            # all devices, full flow
//   node responsive.mjs <device>   # one device (key from DEVICES below)
//
// Env: APP_URL, CHROME_BIN, CDP_PORT, OUT_DIR, HEADLESS=0

import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync, existsSync, rmSync } from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';

const APP_URL = process.env.APP_URL || 'http://localhost:5173/storm-alert/';
const PORT = Number(process.env.CDP_PORT || 9222);
const OUT_DIR = process.env.OUT_DIR || '/tmp/72h-responsive';
const HEADLESS = process.env.HEADLESS !== '0';
const CHROME_BIN =
  process.env.CHROME_BIN ||
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

// width, height, deviceScaleFactor, mobile(touch)
const DEVICES = {
  'iphone-se':   { w: 375,  h: 667,  dsf: 2, mobile: true  },
  'iphone-14pm': { w: 430,  h: 932,  dsf: 3, mobile: true  },
  'ipad':        { w: 768,  h: 1024, dsf: 2, mobile: true  },
  'ipad-land':   { w: 1024, h: 768,  dsf: 2, mobile: true  },
  'laptop':      { w: 1366, h: 768,  dsf: 1, mobile: false },
  'desktop':     { w: 1920, h: 1080, dsf: 1, mobile: false },
};

// ---------------------------------------------------------------- CDP client
class CDP {
  #ws; #id = 0; #pending = new Map();
  constructor(ws) { this.#ws = ws; }

  static async attach(port) {
    let targets;
    for (let i = 0; i < 40; i++) {
      try {
        targets = await (await fetch(`http://localhost:${port}/json`)).json();
        if (targets.some((t) => t.type === 'page')) break;
      } catch {}
      await sleep(250);
    }
    const page = targets.find((t) => t.type === 'page');
    if (!page) throw new Error('no page target on CDP endpoint');
    const ws = new WebSocket(page.webSocketDebuggerUrl);
    await new Promise((res, rej) => { ws.onopen = res; ws.onerror = (e) => rej(new Error(e.message)); });
    const cdp = new CDP(ws);
    ws.onmessage = (ev) => cdp.#onMessage(ev.data);
    return cdp;
  }
  #onMessage(data) {
    const m = JSON.parse(data);
    if (m.id && this.#pending.has(m.id)) {
      const { res, rej } = this.#pending.get(m.id); this.#pending.delete(m.id);
      m.error ? rej(new Error(JSON.stringify(m.error))) : res(m.result);
    }
  }
  send(method, params = {}) {
    const id = ++this.#id;
    this.#ws.send(JSON.stringify({ id, method, params }));
    return new Promise((res, rej) => this.#pending.set(id, { res, rej }));
  }
  async eval(expression) {
    const r = await this.send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) throw new Error('eval: ' + JSON.stringify(r.exceptionDetails));
    return r.result.value;
  }
  async setDevice(d) {
    await this.send('Emulation.setDeviceMetricsOverride', {
      width: d.w, height: d.h, deviceScaleFactor: d.dsf, mobile: d.mobile,
    });
    await this.send('Emulation.setTouchEmulationEnabled', { enabled: d.mobile });
  }
  async navigate(url) { await this.send('Page.enable'); await this.send('Page.navigate', { url }); await sleep(1300); }
  async screenshot(file) {
    const { data } = await this.send('Page.captureScreenshot', { format: 'png' });
    writeFileSync(file, Buffer.from(data, 'base64'));
  }
  async clickText(text, selector = 'button, a, .menu-btn, .lang-btn, .choice, .setup-btn') {
    return this.eval(`(() => {
      const want = ${JSON.stringify(text.toLowerCase())};
      const el = [...document.querySelectorAll(${JSON.stringify(selector)})]
        .find(e => (e.innerText||e.textContent||'').toLowerCase().includes(want));
      if (!el) return false; el.click(); return true;
    })()`);
  }
  text() { return this.eval('document.body.innerText.replace(/\\s+/g," ").trim().slice(0,200)'); }

  // Layout health: horizontal overflow + small tap targets (<44px) on mobile.
  audit() {
    return this.eval(`(() => {
      const de = document.documentElement;
      const overflowX = de.scrollWidth - de.clientWidth;
      const offenders = [...document.querySelectorAll('*')]
        .filter(e => e.getBoundingClientRect().right > de.clientWidth + 1)
        .slice(0, 6)
        .map(e => (e.className && typeof e.className === 'string' ? '.'+e.className.split(' ')[0] : e.tagName.toLowerCase()));
      const small = [...document.querySelectorAll('button, a, [role=button]')]
        .filter(e => { const r = e.getBoundingClientRect(); return r.width>0 && (r.height<44 || r.width<44); })
        .slice(0, 6)
        .map(e => (e.innerText||e.tagName).trim().slice(0,24) + ' ['+Math.round(e.getBoundingClientRect().width)+'x'+Math.round(e.getBoundingClientRect().height)+']');
      return { overflowX, offenders, small };
    })()`);
  }
}

// ---------------------------------------------------------------- chrome
function launchChrome() {
  if (!existsSync(CHROME_BIN)) throw new Error(`Chrome not found at ${CHROME_BIN} — set CHROME_BIN`);
  return spawn(CHROME_BIN, [
    HEADLESS ? '--headless=new' : '--new-window',
    `--remote-debugging-port=${PORT}`,
    '--no-first-run', '--no-default-browser-check',
    '--user-data-dir=/tmp/chrome-72h-responsive',
    'about:blank',
  ], { stdio: 'ignore' });
}

// ---------------------------------------------------------------- flow
// Each step: navigate/click, label, then screenshot+audit. Best-effort —
// missing buttons are skipped so deep screens don't abort the run.
async function walk(cdp, dir) {
  mkdirSync(dir, { recursive: true });
  const report = [];
  const cap = async (name) => {
    await cdp.screenshot(`${dir}/${name}.png`);
    const a = await cdp.audit();
    report.push({ screen: name, ...a });
  };

  await cdp.navigate(APP_URL);
  await cap('01-language');

  await cdp.clickText('English'); await sleep(900);
  await cap('02-demography');

  await cdp.clickText('skip').catch(()=>{});
  await cdp.clickText('continue').catch(()=>{});
  await sleep(1100);
  await cap('03-after-demography');

  await cdp.clickText('enter').catch(()=>{});
  await sleep(1300);
  await cap('04-menu');

  await cdp.clickText('start'); await sleep(1600);
  await cap('05-household');

  // Pick a fuller household, then start preparing, to reach the game UI.
  await cdp.clickText('elderly').catch(()=>{});
  await cdp.clickText('child').catch(()=>{});
  await sleep(400);
  await cap('06-household-filled');

  await cdp.clickText('done').catch(()=>{});
  await sleep(1800);
  await cap('07-preparation');

  return report;
}

async function run() {
  const only = process.argv[2];
  const devices = only ? { [only]: DEVICES[only] } : DEVICES;
  if (only && !DEVICES[only]) { console.error('unknown device:', only, '\n', Object.keys(DEVICES).join(', ')); process.exit(2); }

  rmSync(OUT_DIR, { recursive: true, force: true });
  mkdirSync(OUT_DIR, { recursive: true });
  const chrome = launchChrome();
  const summary = {};
  let cdp;
  try {
    cdp = await CDP.attach(PORT);
    for (const [key, d] of Object.entries(devices)) {
      console.log(`\n=== ${key}  ${d.w}x${d.h} dsf${d.dsf} ${d.mobile?'touch':'mouse'} ===`);
      await cdp.setDevice(d);
      const rep = await walk(cdp, `${OUT_DIR}/${key}`);
      summary[key] = rep;
      for (const r of rep) {
        const flags = [];
        if (r.overflowX > 0) flags.push(`H-OVERFLOW ${r.overflowX}px ${r.offenders.join(',')}`);
        if (d.mobile && r.small.length) flags.push(`SMALL-TAP ${r.small.join(' | ')}`);
        console.log(`  ${r.screen}: ${flags.length ? flags.join('  ;  ') : 'ok'}`);
      }
    }
    writeFileSync(`${OUT_DIR}/summary.json`, JSON.stringify(summary, null, 2));
    console.log(`\nScreenshots + summary.json in ${OUT_DIR}`);
  } finally {
    try { await cdp?.send('Browser.close'); } catch {}
    try { chrome.kill('SIGKILL'); } catch {}
  }
}

run().catch((e) => { console.error('FAIL:', e.message); process.exit(1); });
