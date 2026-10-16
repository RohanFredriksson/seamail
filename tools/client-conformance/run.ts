/**
 * Client conformance oracle for the non-Outlook environments.
 *
 * Ground truth: Can I Email's per-feature support data for the real client
 * (support.json). For every feature with a fixture we render the fixture in
 * the environment's own engine twice - once raw, once after env.process() -
 * and check the environment's behaviour against the documented support:
 *
 *   y (supported)    -> processing must NOT change the rendering ("over-stripped" otherwise)
 *   n (unsupported)  -> processing MUST change the HTML or the pixels ("not-stripped" otherwise)
 *   a (partial)      -> informational only
 *
 * Usage: tsx tools/client-conformance/run.ts [--env gmail-desktop] [--json out.json]
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { parse } from "node-html-parser";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";
import { FIXTURE_TEMPLATES } from "../outlook-ground-truth/fixture-templates.mjs";
import { EXTRA_TEMPLATES } from "./extra-templates.mjs";
import { listAllEnvironmentRefs, loadEnvironment } from "../../src/registry.js";
import { closeAllBrowsers } from "../../src/browserManager.js";
import { DEFAULT_CONDITIONS } from "../../src/types.js";

interface Template {
  head?: string;
  /** Inline style for <body> itself (only for fixtures that test body handling). */
  bodyStyle?: string;
  body: string;
}
interface Feature {
  slug: string;
  title: string;
  support: Record<string, { code: string; raw: string; version: string }>;
}

const HERE = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATES = { ...FIXTURE_TEMPLATES, ...EXTRA_TEMPLATES } as Record<string, Template>;

function buildFixture(slug: string, title: string, t: Template): string {
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${title.replace(/</g, "&lt;")}</title>${t.head ? `\n    ${t.head}` : ""}
  </head>
  <body${t.bodyStyle ? ` style="${t.bodyStyle}"` : ""}>
    <div style="padding:20px;font-family:'Times New Roman',serif;">
    ${t.body}
    </div>
  </body>
</html>
`;
}

/**
 * Canonical form for "did processing change anything?". Sanitisers re-emit
 * CSS with their own whitespace/semicolons, which is not a behavioural change.
 */
const tokens = (html: string) =>
  new Set(
    normalize(html)
      .split(/[;{}<>]/)
      .filter(Boolean),
  );
function removedTokens(before: string, after: string): string[] {
  const kept = tokens(after);
  return [...tokens(before)].filter((t) => !kept.has(t)).slice(0, 6);
}

const normalize = (html: string) =>
  parse(html)
    .toString()
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s+/g, " ")
    .replace(/\s*\/?>\s*/g, ">")
    .replace(/\s*</g, "<")
    .replace(/\s*([:;{},])\s*/g, "$1")
    .replace(/;(?=["'}])/g, "")
    .trim();

function pixelsDiffer(a: Buffer, b: Buffer): number {
  const pa = PNG.sync.read(a);
  const pb = PNG.sync.read(b);
  if (pa.width !== pb.width || pa.height !== pb.height) return Infinity;
  return pixelmatch(pa.data, pb.data, undefined, pa.width, pa.height, { threshold: 0.1 });
}

export type Verdict = "pass" | "over-stripped" | "not-stripped" | "info" | "excused";
interface Row {
  env: string;
  slug: string;
  expected: string;
  htmlChanged: boolean;
  pixelsChanged: number;
  verdict: Verdict;
  /** Tokens present before processing but missing after (and vice versa), for diagnosis. */
  removed: string[];
}

const args = process.argv.slice(2);
const argVal = (flag: string) => {
  const i = args.indexOf(flag);
  return i >= 0 ? args[i + 1] : undefined;
};
const onlyEnv = argVal("--env");
const jsonOut = argVal("--json");
const onlySlug = argVal("--slug");

const { features } = JSON.parse(
  await readFile(path.join(HERE, "../../src/data/caniemail-support.json"), "utf-8"),
) as {
  features: Feature[];
};

const EXCEPTIONS = JSON.parse(
  await readFile(path.join(HERE, "known-exceptions.json"), "utf-8"),
) as Record<string, Record<string, string>>;

const rows: Row[] = [];
const refs = listAllEnvironmentRefs().filter((r) =>
  onlyEnv ? r.base === onlyEnv : r.base !== "outlook-classic",
);

try {
  for (const ref of refs) {
    const env = await loadEnvironment(ref);
    await env.prepare();
    for (const f of features) {
      const exp = f.support[ref.base];
      const tpl = TEMPLATES[f.slug];
      if (!exp || !tpl || (onlySlug && f.slug !== onlySlug)) continue;
      process.stderr.write(`${ref.base} ${f.slug}\n`);
      const html = buildFixture(f.slug, f.title, tpl);
      // Chromium occasionally dies mid-run on long batches; relaunch and retry once.
      const attempt = async () => {
        const processed = await env.process(html, DEFAULT_CONDITIONS);
        const raw = await env.render(html, DEFAULT_CONDITIONS);
        const out = await env.render(processed, DEFAULT_CONDITIONS);
        return {
          htmlChanged: normalize(html) !== normalize(processed),
          removed: removedTokens(html, processed),
          pixelsChanged: pixelsDiffer(raw.screenshot, out.screenshot),
        };
      };
      let result;
      try {
        result = await attempt();
      } catch {
        await closeAllBrowsers();
        await env.prepare();
        result = await attempt();
      }
      const { htmlChanged, pixelsChanged, removed } = result;
      const changed = htmlChanged || pixelsChanged > 0;
      let verdict: Verdict = "info";
      if (exp.code === "y") verdict = changed ? "over-stripped" : "pass";
      else if (exp.code === "n") verdict = changed ? "pass" : "not-stripped";
      // Fixtures that bundle a supported feature with an unsupported one (e.g. display:flex
      // next to justify-content) legitimately change; those are listed in known-exceptions.json.
      if (
        (verdict === "over-stripped" || verdict === "not-stripped") &&
        EXCEPTIONS[ref.base]?.[f.slug]
      ) {
        verdict = "excused";
      }
      rows.push({
        env: ref.base,
        slug: f.slug,
        expected: exp.raw,
        htmlChanged,
        pixelsChanged: Number.isFinite(pixelsChanged) ? pixelsChanged : -1,
        verdict,
        removed,
      });
    }
    await env.dispose();
  }
} finally {
  await closeAllBrowsers();
}

for (const ref of refs) {
  const mine = rows.filter((r) => r.env === ref.base);
  const count = (v: Verdict) => mine.filter((r) => r.verdict === v).length;
  const scored = count("pass") + count("over-stripped") + count("not-stripped");
  console.log(
    `\n${ref.full}: ${count("pass")}/${scored} conform (${((100 * count("pass")) / Math.max(scored, 1)).toFixed(1)}%)` +
      `  over-stripped=${count("over-stripped")} not-stripped=${count("not-stripped")} partial(info)=${count("info")} excused=${count("excused")}`,
  );
  for (const r of mine.filter(
    (r) => r.verdict === "over-stripped" || r.verdict === "not-stripped",
  )) {
    console.log(
      `  ${r.verdict.padEnd(13)} ${r.slug}  (client says: ${r.expected})${r.removed.length ? `  dropped: ${r.removed.join(" | ")}` : ""}`,
    );
  }
}
if (jsonOut) {
  await mkdir(path.dirname(path.resolve(jsonOut)), { recursive: true });
  await writeFile(jsonOut, JSON.stringify(rows, null, 2) + "\n");
}

if (rows.some((r) => r.verdict === "over-stripped" || r.verdict === "not-stripped")) {
  process.exitCode = 1;
}
