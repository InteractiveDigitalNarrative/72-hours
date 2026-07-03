---
name: responsive-audit
description: Audit the 72hours game for responsive web design across phones, tablets, and desktops. Use when asked to check responsiveness, test mobile/tablet/desktop layout, find overflow or tap-target issues, screenshot the game at different screen sizes, or review the UI across devices.
---

# Responsive audit — 72hours-react

Drives the running game through its full flow at 6 device viewports using headless
Google Chrome over CDP (zero deps — Node's built-in WebSocket), screenshots every
screen per device, and flags horizontal overflow + sub-44px tap targets.

Driver: `.claude/skills/responsive-audit/responsive.mjs` (paths below are from repo root).

## Prerequisites

- Google Chrome installed (macOS default path baked in; override with `CHROME_BIN`).
- Node ≥ 22 (built-in `WebSocket`). Verified on Node 25.
- No npm install needed for the driver.

## Run (agent path)

Dev server MUST be running first (separate shell, stays up):

```bash
npm run compile-ink   # only if .ink changed
npm run dev           # serves http://localhost:5173/storm-alert/
```

Then run the audit:

```bash
node .claude/skills/responsive-audit/responsive.mjs            # all 6 devices
node .claude/skills/responsive-audit/responsive.mjs iphone-se  # one device
```

Devices: `iphone-se` (375×667), `iphone-14pm` (430×932), `ipad` (768×1024),
`ipad-land` (1024×768), `laptop` (1366×768), `desktop` (1920×1080).

Output (default `/tmp/72h-responsive`, override `OUT_DIR`):
- `<device>/01-language.png … 07-preparation.png` — one shot per screen.
- `summary.json` — per-screen `overflowX`, overflow `offenders`, `small` tap targets.

Console prints `ok` or flags per screen. After it finishes, **Read the PNGs** — the
programmatic flags catch overflow/tap-size but not visual problems (clipping,
overlap, unreadable contrast, broken spacing). Judge those from the images.

### Screens covered (flow walked per device)

language → demography → menu → household setup → household filled → preparation intro.

## Interpreting results

- `H-OVERFLOW <px> <selectors>` — page scrolls sideways. Real bug. Find the offending
  `.class` and constrain width / fix padding.
- `SMALL-TAP <label> [WxH]` — interactive element under 44×44 CSS px on a touch device
  (Apple HIG / WCAG 2.5.5). Bump min-height/padding.
- Known baseline (current `main`): no horizontal overflow anywhere; demography pill
  buttons (~33–38px tall), the `⚙` settings button (40×36), the `×` remove chip
  (24×24), and full-width action buttons (~39–43px tall) all fall under 44px on touch.

## Gotchas

- **Base path is `/storm-alert/`** — vite serves there, not `/`. `APP_URL` accounts for it.
- Flow is **best-effort**: each step clicks by visible text and skips silently if a
  button isn't present, so deep screens never abort the whole run. If a screen shot
  looks like the previous one, that click was a no-op (text/label changed) — update the
  `clickText(...)` call in `walk()`.
- Desktop/laptop (mouse) viewports skip the tap-target check (`mobile:false`); that's
  intentional — 44px minimums are a touch concern.
- Driver auto-launches and SIGKILLs its own Chrome (`--user-data-dir=/tmp/chrome-72h-responsive`).
  If a run is interrupted, a stray Chrome may hold port 9222: `pkill -f chrome-72h-responsive`.
- `HEADLESS=0 node ... <device>` opens a real window to watch the flow live.

## Troubleshooting

- `FAIL: no page target on CDP endpoint` — port 9222 busy from a prior run. `pkill -f chrome-72h-responsive` and retry.
- All screens identical / stuck on language — dev server not up, or wrong `APP_URL`. `curl -sI http://localhost:5173/storm-alert/` should be `200`.
- `Chrome not found at ...` — set `CHROME_BIN` to your Chrome/Chromium binary.
