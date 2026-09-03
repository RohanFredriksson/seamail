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

const GIMMICKS_PATH = fileURLToPath(new URL("./gimmicks.json", import.meta.url));
const FIXTURES_DIR = fileURLToPath(new URL("./fixtures/", import.meta.url));

function renderFixture(gimmick) {
  const versions = Object.entries(gimmick.outlookWindows)
    .map(([version, code]) => `${version}: ${code}`)
    .join(", ");

  return `<!doctype html>
<!--
  Gimmick: ${gimmick.title} (${gimmick.slug})
  Category: ${gimmick.category}
  Outlook Windows support by version: ${versions}
  Reference: ${gimmick.url}
  ${gimmick.notes ? `Notes: ${gimmick.notes}` : ""}

  TODO: replace the placeholder below with the minimal markup/CSS needed to
  exercise this specific feature in isolation, then run capture.ps1 on a
  Windows machine with Outlook installed to get a ground-truth screenshot.
-->
<html>
  <head>
    <meta charset="utf-8" />
    <title>${gimmick.title}</title>
  </head>
  <body style="margin:0;padding:20px;font-family:'Times New Roman',serif;">
    <!-- TODO: minimal isolated markup for "${gimmick.title}" goes here -->
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
