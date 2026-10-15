# Client conformance (Gmail, Apple Mail)

Automated feedback loop for the non-Outlook environments. It needs no
Windows box, no real client and no screenshots of third-party software - the
ground truth is [Can I Email](https://www.caniemail.com)'s per-feature support
data (MIT), cached in `support.json`.

```bash
npm run conformance                         # all non-Outlook envs
npm run conformance -- --env gmail-desktop  # one env
npm run conformance -- --slug css-position  # one feature
npm run conformance -- --json out.json      # machine-readable rows
npm run conformance:fetch                   # refresh support.json from caniemail.com
```

For every feature that has a fixture (`../outlook-ground-truth/fixture-templates.mjs`
plus `extra-templates.mjs`), the runner renders the fixture in the
environment's engine twice - raw and after `env.process()` - and scores the
environment against the client's documented support:

| Client says  | Environment must...                                  | Failure verdict |
| ------------ | ---------------------------------------------------- | --------------- |
| `y`          | leave the HTML and the pixels unchanged              | `over-stripped` |
| `n`          | change the HTML or the pixels (strip/neutralise it)  | `not-stripped`  |
| `a` (partial)| nothing - reported as `info`                         | -               |

Fixtures that bundle a supported feature with an unsupported one, state-only
pseudo-classes (`:active`...), and dataset rows that describe much older
engines than the one we render with are listed with a reason in
`known-exceptions.json` and reported as `excused`.

The rules being scored live next to each environment
(`environments/*/v1/rules.ts`) as data, evaluated by `src/emailCss.ts`.
Workflow: run, read the failures, adjust the rules, re-run.

Limits: this checks that the *sanitisation* matches the client, not that
every pixel of Gmail's own chrome/typography matches. It cannot see
features whose fixture has no visual effect and which the environment does
not touch in HTML either.
