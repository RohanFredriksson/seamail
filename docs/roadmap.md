# Cmail Roadmap — Path to Initial Release

Tracking checklist derived from [release-plan.md](./release-plan.md). Status
reflects the repo as of 2026-09-01. Update checkboxes as work lands; keep
notes short (evidence, not essays).

Target for "initial release" = **Alpha** (per release-plan.md §30): installable
CLI, config, 3+ stable environments, versioning, snapshots, visual regression,
CI-compatible exit codes, basic reporting, docs. Not 1.0.

## Milestone 0 — Developer Preview (harden the PoC)

- [x] CLI separated from core (`src/cli.ts` vs `runner.ts`/`registry.ts`/etc.)
- [x] Environments separated from runner (`environments/*/v1/index.ts` + `CmailEnvironment` interface)
- [x] Snapshot logic separated from rendering (`src/snapshot.ts`, `src/diff.ts`)
- [x] Config parsing separated from execution (`src/config.ts`)
- [x] TypeScript project config (`tsconfig.json`, `npm run typecheck`)
- [x] Linting (`eslint.config.js`, `npm run lint`)
- [x] Formatting (`prettier`, `.prettierignore` excludes fixtures/docs)
- [x] Unit tests (`tests/*.test.ts` for diff/lockfile/registry/snapshot)
- [x] Environment/fixture-level tests (`tests/environments/*.test.ts`, Level 2)
- [x] CI workflow (`.github/workflows/ci.yml`)
- [x] Clone → install → configure → `cmail test` → update → regress → inspect
      workflow works end-to-end (verified per repo memory)

**Milestone 0 status: complete.**

## Milestone 1 — Public API definition

- [x] CLI commands defined: `test`, `test --update`, `open`, `inspect`, `list`
- [x] `cmail list` (list available environments) — implemented
- [ ] `cmail init` (scaffold config in existing project) — not implemented
- [x] Config API with sensible defaults (`cmail.config.ts`, `defineConfig`)
- [x] Environment identifier scheme (`name@version`, e.g. `gmail-desktop@v1`)
- [x] Environment metadata (`client`, `platform`, `version`, `fidelity`,
      `engine`, `description` in `src/types.ts`)
- [ ] Explicit "what's public API vs internal" note in docs (currently implicit)

## Milestone 2 — Environment & lockfile formalization

- [x] `FidelityLevel` type (`exact`/`high`/`simulated`/`analytical`) + documented per-env in README table
- [x] Capability map per environment (`CapabilityMap`, surfaced via `cmail inspect`)
- [x] Conditions modeled as env+condition, not separate envs (`RenderConditions`: colorScheme, imagesEnabled)
- [x] Lockfile pins environment versions (`cmail.lock`, `src/lockfile.ts`), auto-created
- [ ] Lockfile also pins renderer/engine versions (currently only env version, not e.g. Playwright/browser build) — confirm if needed for repro
- [x] Registry resolves `name@version` -> implementation (`src/registry.ts`)
- [ ] Compatibility rules documented as data (not just code) per environment — currently implicit in `process()` implementations, not separately declared/testable metadata

## Milestone 3 — Stabilize the 3 PoC environments + fixtures

- [x] `gmail-desktop@v1`, `apple-mail-macos@v1`, `outlook-classic@v1` implemented and tested
- [x] Fixtures: basic, torture (flex/grid/border-radius/bg-image/media-queries/dark-mode/svg)
- [ ] Broaden fixture suite per release-plan §35 (table email, multi-column,
      image-heavy, typography, buttons, nested-table, malformed HTML) — only
      basic + torture exist today
- [ ] Per-environment validation suite proving each documented compatibility
      claim (partially covered by Level 2 tests; not exhaustive)

## Milestone 4 — Snapshot & diff hardening

- [x] Deterministic snapshot paths, update mode, comparison mode (`src/snapshot.ts`)
- [x] Diff generation with configurable threshold (`src/diff.ts`, `diffThreshold`)
- [x] Diff % reported, dimension-mismatch handled distinctly (`cli.ts printSummary`)
- [ ] Distinguish meaningful vs. insignificant diffs beyond a flat pixel threshold (e.g. anti-aliasing tolerance) — not yet addressed

## Milestone 5 — CLI output & error handling

- [x] Human-readable pass/fail summary grouped by environment
- [ ] Machine-readable output (JSON/JUnit) — not implemented
- [x] User-facing error handling pass: invalid config, missing email file,
      unsupported environment/version, browser launch failure, corrupt
      lockfile now raise a `CmailError` (`src/errors.ts`) with an actionable
      message instead of a raw stack (config validation in `config.ts`,
      registry lookups in `registry.ts`, browser launch in
      `browserManager.ts`, lockfile parsing in `lockfile.ts`). Missing
      snapshot and unsupported condition at runtime (non-TS callers) still
      need a look.
- [x] `--verbose`/debug mode: default prints a short red message + hint;
      `--verbose` prints the full `CmailError`/cause chain of stack traces
      (`src/cli.ts`)

## Milestone 6 — Local reporting

- [x] Static HTML report generated locally (`src/report.ts`, `cmail open`)
- [x] Report shows expected/actual/diff per result (verify field coverage)
- [ ] Confirm report includes environment metadata (fidelity/engine) — check `report.ts`

## Milestone 7 — CI/CD & cross-platform

- [x] Deterministic exit codes (`summary.exitCode`)
- [x] CI workflow exists and runs on push/PR (Linux only)
- [ ] Document/test on macOS and Windows hosts — only Linux verified so far
      (WebKit-on-Fedora shim is Linux-specific tooling)
- [ ] Document supported host matrix vs. target environment platform distinction
- [ ] Machine-readable CI output (depends on Milestone 5)

## Milestone 8 — Gmail Mobile (4th environment)

- [ ] Not started. Next environment after stabilizing the first 3, per
      release-plan §11 ordering.

## Milestone 9 — Security & external resources

- [ ] Explicit policy for external network requests during rendering
      (block/allow/mock/configurable) — no evidence of network blocking today;
      Playwright pages likely allow outbound requests by default
- [ ] Explicit policy for JS execution / filesystem access from rendered HTML
- [ ] Document these decisions (currently undocumented)

## Milestone 10 — Documentation

- [x] README: what it is, install, quick start, fixtures, environments table, out-of-scope
- [ ] Configuration reference (all `cmail.config.ts` options)
- [ ] CI usage doc (example workflow for consumers, not just this repo's own CI)
- [ ] Supported platforms doc
- [ ] Limitations doc (simulations ≠ real clients, screenshots ≠ pixel-perfect proof)
- [ ] Troubleshooting doc (beyond the WebKit/Fedora note)
- [ ] Contributing / environment development guide

## Milestone 11 — Packaging & distribution

- [ ] `package.json` currently `"private": true` — must flip before publishing
- [ ] License field/file missing
- [ ] Verify `bin/cmail.mjs` works when installed as a dependency (not just via `npm run cmail`)
- [ ] Decide npm publish process, `.npmignore`/`files` allowlist
- [ ] Versioning policy doc (semver once public API stabilizes)

---

## Suggested next 5 concrete tasks (highest leverage toward Alpha)

1. ~~Add `cmail list`~~ — done.
2. Write the Limitations + Configuration Reference docs (Milestone 10) — required before any external user.
3. ~~Audit error paths and add friendly messages~~ — done (see Milestone 5).
4. Decide and document the external-resource/network policy (Milestone 9) —
   currently an open security question, cheap to decide now, expensive to
   change after users depend on either behavior.
5. Flip `package.json` to publishable (`private: false`, license, verify `bin`
   works from a tarball install) — unblocks everything else being moot until
   Cmail is actually installable outside this repo.
