#!/usr/bin/env node
// host.mjs — serve the 72hours game on the local network so phones/tablets on
// the SAME wifi can open it in a browser.
//
// Detects the LAN IPv4, prints the device-reachable URL (with the /storm-alert/
// base path), optionally renders a QR code (if `qrencode` is installed), then
// runs vite bound to 0.0.0.0 and stays in the foreground.
//
// Usage:
//   node host.mjs            # live dev server (HMR) on the LAN   [default]
//   node host.mjs preview    # serve the built dist/ (run `npm run build` first)
//
// Env: PORT (default 5173 dev / 4173 preview), BASE (default /storm-alert/)

import { spawn, execSync } from 'node:child_process';
import { networkInterfaces } from 'node:os';

const mode = process.argv[2] === 'preview' ? 'preview' : 'dev';
const PORT = process.env.PORT || (mode === 'preview' ? '4173' : '5173');
const BASE = process.env.BASE || '/storm-alert/';

function lanIPs() {
  const out = [];
  for (const [name, addrs] of Object.entries(networkInterfaces()))
    for (const a of addrs)
      if (a.family === 'IPv4' && !a.internal) out.push({ name, ip: a.address });
  return out;
}

const ips = lanIPs();
if (!ips.length) {
  console.error('No LAN IPv4 found — are you connected to wifi/ethernet?');
  process.exit(1);
}
// Prefer common private ranges (192.168.* / 10.*) over things like 172.* VPNs.
ips.sort((a, b) => (a.ip.startsWith('192.168') ? -1 : 0) - (b.ip.startsWith('192.168') ? -1 : 0));
const primary = ips[0];
const url = `http://${primary.ip}:${PORT}${BASE}`;

console.log('\n  72hours — hosting on your local network');
console.log('  ' + '─'.repeat(46));
console.log(`  Mode:   ${mode}${mode === 'preview' ? ' (built dist/)' : ' (live HMR)'}`);
console.log(`  Open on any device on the SAME wifi:\n`);
console.log(`     \x1b[1m\x1b[36m${url}\x1b[0m\n`);
if (ips.length > 1)
  console.log('  Other interfaces: ' + ips.slice(1).map((x) => `http://${x.ip}:${PORT}${BASE}`).join('  '));

// Optional QR for quick phone scanning.
try {
  execSync('command -v qrencode', { stdio: 'ignore' });
  console.log('');
  execSync(`qrencode -t ANSIUTF8 ${JSON.stringify(url)}`, { stdio: 'inherit' });
} catch {
  console.log('  (install `qrencode` to print a scannable QR here)');
}
console.log('  ' + '─'.repeat(46));
console.log('  Ctrl-C to stop.\n');

// Hand off to vite, bound to all interfaces.
const args = mode === 'preview'
  ? ['vite', 'preview', '--host', '0.0.0.0', '--port', PORT]
  : ['vite', '--host', '0.0.0.0', '--port', PORT];
const child = spawn('npx', args, { stdio: 'inherit' });
child.on('exit', (code) => process.exit(code ?? 0));
process.on('SIGINT', () => child.kill('SIGINT'));
process.on('SIGTERM', () => child.kill('SIGTERM'));
