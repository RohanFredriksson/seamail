#!/usr/bin/env node
/**
 * Reads gimmicks.json and writes one isolated fixture skeleton per gimmick
 * under fixtures/<slug>.html (gitignored, regenerate on demand). Each
 * skeleton is intentionally minimal - fill in markup/CSS that exercises the
 * specific feature named, rather than copying Can I Email's own test pages
 * (not part of the MIT-licensed data).
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { FIXTURE_TEMPLATES } from "./fixture-templates.mjs";

const GIMMICKS_PATH = fileURLToPath(new URL("./gimmicks.json", import.meta.url));
const FIXTURES_DIR = fileURLToPath(new URL("./fixtures/", import.meta.url));

// Many gimmick titles are literally formatted like "<abbr> element" - since
// this text gets interpolated into real HTML (not just a comment), it must
// be escaped or a raw "<abbr>" gets parsed as actual markup instead of
// plain text, corrupting the page (e.g. leaking a stray " element" text
// node) and defeating the whole point of the title being human-readable.
function escapeHtml(value) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function renderFixture(gimmick) {
  const versions = Object.entries(gimmick.outlookWindows)
    .map(([version, code]) => `${version}: ${code}`)
    .join(", ");

  const safeTitle = escapeHtml(gimmick.title);

  const template = FIXTURE_TEMPLATES[gimmick.slug] || {
    body: `<div style="background:#f1f5f9;padding:12px;border:1px solid #cbd5e1;font-weight:bold;">Isolated test fixture for ${safeTitle} (${gimmick.slug})</div>`,
  };

  const headAdditions = template.head ? `\n    ${template.head}` : "";

  return `<!doctype html>
<!--
  Gimmick: ${gimmick.title} (${gimmick.slug})
  Category: ${gimmick.category}
  Outlook Windows support by version: ${versions}
  Reference: ${gimmick.url}
  ${gimmick.notes ? `Notes: ${gimmick.notes}` : ""}
-->
<html>
  <head>
    <meta charset="utf-8" />
    <title>${safeTitle}</title>${headAdditions}
  </head>
  <body style="margin:0;padding:20px;font-family:'Times New Roman',serif;">
    ${template.body}
  </body>
</html>
`;
}

async function main() {
  const raw = await readFile(GIMMICKS_PATH, "utf-8");
  const { gimmicks } = JSON.parse(raw);

  await mkdir(FIXTURES_DIR, { recursive: true });

  for (const gimmick of gimmicks) {
    const outPath = new URL(`./${gimmick.slug}.html`, `file://${FIXTURES_DIR}`);
    await writeFile(outPath, renderFixture(gimmick));
  }

  console.log(`Wrote ${gimmicks.length} fixture skeletons to ${FIXTURES_DIR}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
