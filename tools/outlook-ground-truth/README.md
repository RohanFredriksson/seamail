# Outlook ground-truth tooling

Not part of the Seamail CLI or its CI. This is a manual, local workflow for
closing the fidelity gap between `outlook-classic@v1` (an explicit
**simulation**, see [environments/outlook-classic/v1/index.ts](../../environments/outlook-classic/v1/index.ts))
and how real Outlook desktop actually renders. It requires a Windows machine
with a real Outlook desktop install, which this project (and its CI) does not
have — so this is run locally, on-demand, by whoever has access to one, not
automated.

Two things feed it:

1. [Can I Email](https://www.caniemail.com) — a maintained, MIT-licensed
   dataset (queried via its public `api/data.json`) of CSS/HTML feature
   support per email client, including several Outlook desktop versions
   (2007–2021). Used here to derive one isolated "gimmick" fixture per
   CSS/HTML feature Outlook Windows renders as unsupported/partial, so each
   fixture demonstrates exactly one quirk instead of a combined torture test.
2. Real Outlook, driven via COM automation, to produce ground-truth
   screenshots of those fixtures to compare against Seamail's simulated
   render.

## Workflow

1. `node fetch-gimmicks.mjs` (any OS, only needs network access) — fetches
   the current Can I Email dataset, filters it down to CSS/HTML features
   where Outlook Windows (any version) is reported `n` (unsupported) or `a`
   (partial/buggy), and writes `gimmicks.json`. This file is checked in so
   the fixture list is reviewable and stable between runs; re-run and diff
   it when you want to pick up upstream data changes.
2. `node generate-fixtures.mjs` (any OS) — reads `gimmicks.json` and writes
   one isolated HTML fixture per gimmick under `fixtures/<slug>.html`
   (gitignored, regenerated from `gimmicks.json`). Each fixture is a
   skeleton with a TODO: fill in the minimal markup/CSS that exercises that
   specific feature (deliberately not copying Can I Email's own test pages,
   which are not part of the MIT-licensed data).
3. On a **Windows machine with Outlook desktop installed**: run
   `capture.ps1` (PowerShell). For each fixture under `fixtures/`, it creates
   an Outlook `MailItem`, sets its `HTMLBody`, displays it, and saves a
   screenshot of the reading pane to `captures/<slug>.png` (gitignored —
   these are derived from licensed software and are specific to whatever
   Outlook build produced them; don't commit or redistribute them).
4. Manually compare each `captures/<slug>.png` against what
   `outlook-classic@v1` produces for the same fixture (e.g. via
   `seamail test -u` + `seamail open` against a matching local fixture under
   the main [fixtures/](../../fixtures/) directory). Use discrepancies to
   refine `STRIPPED_DECLARATIONS`, the VML approximation, or the capability
   map in `environments/outlook-classic/v1/index.ts`.

## Why this is gitignored / not in CI

- Real Outlook is licensed desktop software; this repo can't run it in a
  public Linux CI runner, and screenshots produced by it are derivatives of
  that software, not something to redistribute.
- Fixtures are deterministic, disposable output of `generate-fixtures.mjs` —
  regenerate rather than version them.
- What's tracked instead: `fetch-gimmicks.mjs`, `generate-fixtures.mjs`,
  `capture.ps1`, this README, and `gimmicks.json` (a reviewable data
  snapshot, not a build artefact).
