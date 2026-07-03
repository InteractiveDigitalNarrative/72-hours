---
name: run-72hours-react
description: Run, launch, build, or screenshot the 72hours emergency-preparedness game (React + Vite + Ink). Use to start the dev server, drive the game in a headless browser, take screenshots, or jump straight to a mid-game slice for quick testing without playing the intro.
---

# run-72hours-react

Web app (React 19 + Vite + Ink narrative). Base path is **`/storm-alert/`**. Driven by a
zero-dependency CDP driver against the installed Google Chrome. Paths below are from repo root.

## Prerequisites
- Node ≥ 22 (built-in `WebSocket`), Google Chrome installed (override `CHROME_BIN` if needed).
- `npm install` once.

## Build / run
```bash
npm run compile-ink   # compile both .ink stories → .js (after any .ink edit)
npm run dev           # dev server → http://localhost:5173/storm-alert/
npm run build         # production build to dist/
```

## Drive it (agent path)
Dev server must be running first. Then:
```bash
node .claude/skills/run-72hours-react/driver.mjs smoke              # click-through + screenshots
node .claude/skills/run-72hours-react/driver.mjs shot <url> <name>  # one screenshot
```
Screenshots land in `/tmp/72h-shots` (override `OUT_DIR`). `smoke` walks language → English →
demography → menu → start → household.

## Quick testing — jump to a slice (DEV only)
Skip the whole intro and land on a specific scene with `?scene=<key>` (dev build only). App
auto-advances into the game and `InkStory` seeds a household + Ink vars, then `ChoosePathString`
to the knot. Defined in `DEV_SCENES` in [src/components/InkStory.jsx](src/components/InkStory.jsx).

| `?scene=` | Lands on |
|-----------|----------|
| `flashlight-nolight` | Flashlight-search overlay, NO light prepared (instant) |
| `flashlight-light` | Flashlight-search overlay, light prepared in known spot |
| `crisis-nolight` / `crisis-light` | Crisis night from `wake_up` (a couple clicks to the overlay) |
| `call-power` | Power-outage emergency call, phone drained |

```bash
# e.g. screenshot the no-light flashlight slice
node .claude/skills/run-72hours-react/driver.mjs shot \
  "http://localhost:5173/storm-alert/?scene=flashlight-nolight" flashlight-nolight
```
Optional `&lang=et`. Also in dev: `window.story.ChoosePathString('<knot>')` from the browser
console to jump anywhere manually. All of this is dead-code-stripped from the production build.

### Headless Ink logic check (no browser)
To assert narrative branches without rendering, load `ink.js` in a Node `vm` sandbox and run the
compiled story (`storyContent` / `storyContentET` from `public/ink/*.js`). See the pattern in the
scratchpad `sim.cjs` used to verify the crisis branches: `new inkjs.Story(json)` →
`story.variablesState[...] = ...` → `story.ChoosePathString(knot)` → `Continue()`.

## Gotchas
- **Base path `/storm-alert/`** — bare `http://localhost:5173/` shows nothing.
- `ink.js` is a UMD bundle whose `this`-based global detection misfires under plain `require`;
  load it in a `vm` context (sandbox with `module`/`exports`/`globalThis`) to get `Story`.
- Ink: inline `~` inside `{ }` is illegal — put assignments on their own line in a multiline conditional.
- Dev scene jumps require the dev server (`import.meta.env.DEV`); they no-op in prod.
- Stray Chrome holding port 9222 after an interrupted run: `pkill -f chrome-72h`.
