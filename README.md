# Cmail (Proof of Concept)

Local-first developer tool for testing how HTML emails render across
reproducible, versioned representations of real-world email rendering
environments - and turning those renderings into local visual regression
tests. No hosted service, no accounts, no database: everything runs on your
machine.

## Core idea

A **Cmail environment** (e.g. `gmail-desktop@v1`) is a versioned pipeline:

```
input email -> client-specific processing -> rendering engine -> device/conditions -> screenshot
```

The test runner ([src/runner.ts](src/runner.ts)) only ever talks to environments through
the common [`CmailEnvironment`](src/types.ts) interface (`prepare` / `process` / `render` /
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
npm run cmail -- test --update

# change fixtures/torture/torture.html, then:
npm run cmail -- test
```

`cmail test`:
1. loads `cmail.config.ts`
2. discovers emails matching `emails`
3. resolves + pins environments via `cmail.lock`
4. renders every email x environment x variant
5. compares against `cmail/snapshots/*` (or creates them with `--update`)
6. writes results + diff images to `cmail/results/`
7. prints a pass/fail summary and exits non-zero on regression

Other commands:

```bash
npm run cmail -- open      # open the local static HTML report
npm run cmail -- inspect   # print known capability support per environment
```

## Fixtures

- `fixtures/torture/torture.html` - deliberately difficult fixture (nested
  tables, flexbox, grid, border-radius, background images, web-font
  fallback, inline SVG, media queries, dark-mode CSS) used to prove that
  the three environments produce materially different renderings.
- `fixtures/basic/basic.html` - a plain, well-behaved table-based email
  used to sanity check the base pipeline.

## Out of scope for this PoC

No hosted service, accounts, database, remote dashboard, dozens of email
clients, template engines (MJML/React Email/etc.), or automatic
environment updates. See the project brief for the full list.
