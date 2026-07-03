---
name: host-game
description: Host the 72hours game on the local network (LAN/wifi) so phones, tablets, or other computers on the same wifi can open and play-test it in a browser. Use when asked to host the game, serve it over wifi/LAN, test on a real phone, share a local URL, or get a device-reachable address with a QR code.
---

# host-game — serve the game on your wifi

Runs vite bound to all interfaces and prints the URL other devices on the **same
wifi** open in their browser. Detects your LAN IP, includes the `/storm-alert/`
base path, and prints a QR code if `qrencode` is installed.

Driver: `.claude/skills/host-game/host.mjs` (paths from repo root).

## Prerequisites

- Host machine + phone/tablet on the **same wifi network**.
- Node ≥ 18, project deps installed (`npm install`).
- Optional: `qrencode` for a scannable QR (`brew install qrencode`).

## Run

```bash
node .claude/skills/host-game/host.mjs            # live dev server (HMR)
node .claude/skills/host-game/host.mjs preview    # serve built dist/ (run `npm run build` first)
```

It prints, e.g.:

```
  Open on any device on the SAME wifi:
     http://192.168.1.242:5173/storm-alert/
```

Type that URL into the phone's browser (or scan the QR). Stays in the foreground;
Ctrl-C to stop. Run it in the background if you need the shell back.

Env overrides: `PORT` (default 5173 dev / 4173 preview), `BASE` (default `/storm-alert/`).

## dev vs preview

- **dev** (default) — live, hot-reloads as you edit. Best for iterating with a phone in hand.
- **preview** — serves the production `dist/` build; closest to the deployed experience.
  Run `npm run compile-ink && npm run build` first.

## Gotchas

- **The path matters.** `http://<ip>:5173/` alone shows nothing — vite serves under
  `/storm-alert/`. The script prints the full correct URL; use it verbatim.
- **Same wifi required.** Guest networks / "client isolation" / AP isolation on the
  router block device-to-device traffic — the URL will time out even with the right IP.
  VPN on either device also breaks it.
- **macOS firewall** may prompt to allow incoming connections for node — allow it.
- Multiple IPs (VPN, docker, multiple adapters)? The script prints the others under
  "Other interfaces"; pick the `192.168.*` / `10.*` one matching your wifi.
- Verified reachable this session: `curl -s -o /dev/null -w '%{http_code}'
  http://192.168.1.242:5173/storm-alert/` → `200`.

## Troubleshooting

- Phone can't connect — confirm same wifi, disable VPNs, allow the macOS firewall prompt,
  re-check the IP (it changes between networks; re-run the script).
- Port already in use — another vite is running: `pkill -f vite`, or set `PORT=5174`.
