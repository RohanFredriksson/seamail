# Seamail (Proof of Concept)

Local-first developer tool for testing how HTML emails render across
reproducible, versioned representations of real-world email rendering
environments - and turning those renderings into local visual regression
tests. No hosted service, no accounts, no database: everything runs on your
machine.

## Core idea

A **Seamail environment** (e.g. `gmail-desktop@v1`) is a versioned pipeline:

```
input email -> client-specific processing -> rendering engine -> device/conditions -> screenshot
```

The test runner ([src/runner.ts](src/runner.ts)) only ever talks to environments through
the common [`SeamailEnvironment`](src/types.ts) interface (`prepare` / `process` / `render` /
`dispose`). It has no idea whether an environment is backed by Chromium,
WebKit, or a pure behavioural simulation.

## PoC environments

| Environment            | Engine          | Fidelity   | What it demonstrates |
|-------------------------|-----------------|------------|------------------------|
| `gmail-desktop@v1`      | Chromium        | high       | Real Blink engine + Gmail-style HTML sanitisation |
| `apple-mail-macos@v1`   | WebKit          | high       | A genuinely different, permissive rendering engine |
| `outlook-classic@v1`    | simulated-dom   | simulated  | Word-engine-style CSS stripping (no grid/flexbox/border-radius/media queries), explicitly labelled as a simulation, not real Outlook |

See [environments/](environments) for each implementation.

## Install

```bash
npm install
npx playwright install chromium webkit
```

On Linux distros Playwright doesn't officially support (e.g. Fedora), the
downloaded WebKit build may fail to launch because the system's ICU/libjpeg
versions don't match what it was built against:

```
sudo npx playwright install-deps   # fails: apt-get not found
```

If that happens, run the bundled fix instead (no system files are modified;
it only downloads the exact Ubuntu libraries into a local cache directory
and points WebKit's own launcher at them):

```bash
./scripts/fix-webkit-linux-deps.sh
```


## Run the P0 demonstration

```bash
# create baseline snapshots
npm run seamail -- test --update

# change fixtures/torture/torture.html, then:
npm run seamail -- test
```

`seamail test`:
1. loads `seamail.config.ts`
2. discovers emails matching `emails`
3. resolves + pins environments via `seamail.lock`
4. renders every email x environment x variant
5. compares against `seamail/snapshots/*` (or creates them with `--update`)
6. writes results + diff images to `seamail/results/`
7. prints a pass/fail summary and exits non-zero on regression

Other commands:

```bash
npm run seamail -- open      # open the local static HTML report
npm run seamail -- inspect   # print known capability support per environment
npm run seamail -- list      # list all available environments
```

All commands accept `-c, --config <path>` (default `seamail.config.ts`) and the
top-level `-v, --verbose` flag (show full error stack traces).

## Configuration reference

`seamail.config.ts` must export a default config built with `defineConfig()`
(see [src/config.ts](src/config.ts)). If you installed Seamail as a
dependency, import from the package name; this repo's own
`seamail.config.ts` imports from `./src/config.js` directly since it lives
inside the source tree:

```ts
import { defineConfig } from "seamail";

export default defineConfig({
  emails: "fixtures/torture/*.html",
  environments: ["gmail-desktop", "apple-mail-macos", "outlook-classic"],
  variants: ["light", "dark"],
  outputDir: "seamail",
  diffThreshold: 0.005,
});
```

| Field | Type | Required | Default | Meaning |
|---|---|---|---|---|
| `emails` | `string` | yes | - | Glob (relative to the config file) matching input email HTML files, e.g. `"emails/*.html"`. Must match at least one file. |
| `environments` | `string[]` | yes | - | Environment names to test against, optionally pinned to a version with `name@version` (e.g. `"gmail-desktop@v1"`). Unversioned names resolve via `seamail.lock`, falling back to each environment's current default version. Run `seamail list` to see all known names. |
| `variants` | `("light" \| "dark")[]` | no | `["light"]` | Colour-scheme conditions to render each email x environment under. Every environment renders once per variant (`imagesEnabled` is currently always `true`; there is no config field for it yet). |
| `outputDir` | `string` | no | `"seamail"` | Directory (relative to the config file) where `snapshots/`, `results/`, and `report.html` are written. |
| `diffThreshold` | `number` (0-1) | no | `0.005` | Maximum proportion of differing pixels before a comparison is reported as a regression (`fail`). |

Invalid values in any of these fields raise a `SeamailError` naming the exact
problem field instead of failing later with an unrelated error.

## Fixtures

- `fixtures/torture/torture.html` - deliberately difficult fixture (nested
  tables, flexbox, grid, border-radius, background images, web-font
  fallback, inline SVG, media queries, dark-mode CSS) used to prove that
  the three environments produce materially different renderings.
- `fixtures/basic/basic.html` - a plain, well-behaved table-based email
  used to sanity check the base pipeline.

## Security & resource policy

Every environment renders through a shared "secure page" default
(`src/browserManager.ts`):

- **No JavaScript execution.** Real email clients never run script in a
  message, so pages are opened with `javaScriptEnabled: false`.
- **No live network requests.** Any `http(s)://` request (images, fonts,
  stylesheets, XHR/fetch) is aborted. Only inline/embedded content
  (`data:` URIs, inline `<style>`, etc.) is rendered. This keeps rendering
  deterministic (no dependency on network availability or remote content
  that can change between runs) and means fixture HTML never leaks to, or
  triggers requests against, third-party hosts (e.g. tracking pixels).
- The `imagesEnabled` render condition (used for light/dark + images-off
  variants) is layered on top of this: when `false`, all image requests
  (including `data:` image URIs) are aborted regardless of source.

Practical implication: fixtures must be self-contained. Reference images as
`data:` URIs or inline SVG rather than remote URLs; remote `<a href>` links
are fine (never navigated), but remote `<img src>`/`background-image`/
`@font-face`/`@import` will simply not load.

## Limitations

Be explicit with yourself and your team about what Seamail does and does not
prove:

- **Simulations are not real clients.** `outlook-classic@v1` is an explicit
  behavioural simulation (CSS/HTML rewriting + Chromium as a drawing
  surface) - it is not the real Word/Outlook rendering engine, which cannot
  be run headlessly. Its `fidelity: "simulated"` label (surfaced by `seamail
  inspect`/`seamail list`) exists specifically so this isn't mistaken for a
  guarantee. Even the `"high"` fidelity Chromium/WebKit environments
  approximate each client's known sanitisation rules in code - they are not
  pulling those rules from the real client at runtime.
- **A passing screenshot comparison is not proof of pixel-perfect real-world
  rendering.** It proves the output hasn't regressed relative to your own
  previously accepted baseline for that specific environment representation.
- **Seamail host platform ≠ target client platform.** Seamail runs wherever
  Node + Playwright run (e.g. Linux, macOS, Windows), but that only affects
  where the *tooling* runs - `apple-mail-macos@v1` can be (and normally is)
  tested from Linux/Windows, because the environment is a WebKit-based
  representation, not the literal macOS Mail.app.
- **No live network / no remote images.** See "Security & resource policy"
  above - emails that rely on remotely-hosted images/fonts/stylesheets will
  render with those resources missing. There's real value in supporting
  this (opt-in, cached) later; see `docs/roadmap.md` Milestone 9.
- **Only tested on Linux so far.** macOS/Windows are intended targets but not
  yet verified in CI.
- **Only 3 environments today**, all desktop. No mobile clients (Gmail
  Mobile, Apple Mail iOS) yet.

## Versioning

Seamail uses semantic versioning (`MAJOR.MINOR.PATCH`). Before 1.0, breaking
changes may land in minor releases (still documented in release notes).
After 1.0: MAJOR = breaking CLI/config/environment-identifier changes, MINOR
= backwards-compatible functionality, PATCH = fixes with no contract change.
Environment versions (e.g. `gmail-desktop@v2`) are versioned independently
of the Seamail package version - a Seamail patch release never implies an
environment behaviour change, and vice versa.

## License

[MIT](LICENSE)

## Out of scope for this PoC

No hosted service, accounts, database, remote dashboard, dozens of email
clients, template engines (MJML/React Email/etc.), or automatic
environment updates. See the project brief for the full list.
