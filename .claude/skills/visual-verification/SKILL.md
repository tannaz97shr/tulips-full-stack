---
name: visual-verification
description: Verify a Tulips UI/frontend change actually renders correctly in a browser before calling the work done — start the dev server, drive it headlessly with Playwright, capture the standard screenshot set, and tear down cleanly. Matches the CLAUDE.md rule to check UI changes in a browser, not just via lint/typecheck.
---

# Visual verification

Why this order matters: polling beats a fixed `sleep` because dev-server startup
time varies and a fixed sleep is either too slow or flaky; the screenshot script
has to live inside the project so Node's ESM resolver can find `playwright` in
`node_modules`; and the teardown targets the actual port-listener instead of a
`pkill -f` pattern that could match (and kill) the agent's own process.

## 1. Start the dev server without sleeping

Background the server, redirect its output to a log file, and poll the port
with `curl` inside a bounded `timeout` loop instead of guessing a sleep
duration:

```bash
(bun run dev > /tmp/tulips-dev.log 2>&1 &) && timeout 40 bash -c 'until curl -sf http://localhost:3000 >/dev/null; do sleep 1; done' && echo "SERVER UP"
```

If the poll times out, read `/tmp/tulips-dev.log` before assuming the port is
just slow to come up — it usually means the server failed to start.

## 2. Drive it with Playwright directly

`chromium-cli` is not available in this sandbox, so use Playwright's own API
rather than an external CLI wrapper. One-time setup if not already installed:

```bash
bun add -D playwright
bunx playwright install chromium --with-deps
```

## 3. Write the screenshot script inside the project root, not a scratchpad

Writing the script to a tmp/scratchpad directory outside the project causes
`ERR_MODULE_NOT_FOUND` for `playwright` — Node's ESM resolver walks up
`node_modules` from the script's own file path, and it won't find anything
outside the repo. Setting `NODE_PATH` does **not** fix this; `NODE_PATH` only
affects CommonJS `require` resolution, not ESM `import`.

Fix: write the script as a temp file inside the project root, e.g.
`.tmp-screenshot.mjs`, so the normal `node_modules` walk-up finds
`playwright`. Run it from there, then delete it when done — never commit it.

## 4. Standard screenshot set

For each of the current pages — **Home, Products, Product detail** (extend
this list as new routes are added) — capture:

- Mobile viewport, 390px wide
- Desktop viewport, 1280px wide
- A couple of dark-theme variants
- Mobile drawer open and closed states

Naming convention: `{viewport}-{page}.png`, e.g. `desktop-home.png`,
`mobile-home.png`.

## 5. Click-test the theme toggle, don't just eyeball it

Click the toggle, then read back `document.documentElement`'s dark class and
the `localStorage` theme value from inside the page rather than relying on a
visual check of the screenshot alone. Log in this format:

```
[theme-mobile] isDark=true stored=dark
```

## 6. Check console/page errors on every run

Attach `page.on('console')` and `page.on('pageerror')` listeners in the
script and surface any failures. A screenshot that looks fine can still be
sitting on top of a console error — don't rely on the visual pass alone.

## 7. Tear down: kill the port-listener, not `pkill -f`

```bash
lsof -ti:3000 -sTCP:LISTEN | xargs -r kill
```

Avoid `pkill -f` with a broad pattern (e.g. matching `node` or `next`) — it
risks matching and killing the agent's own process, not just the dev server.
