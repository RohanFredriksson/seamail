#!/usr/bin/env node
/**
 * Fetches the Can I Email dataset (MIT-licensed, https://www.caniemail.com)
 * and extracts the latest reported support code per feature for the real
 * clients that seamail's non-Outlook environments model:
 *
 *   gmail-desktop@v1        <- gmail / desktop-webmail
 *   apple-mail-macos@v1     <- apple-mail / macos
 *   yahoo-desktop@v1        <- yahoo / desktop-webmail
 *   outlook-com@v1          <- outlook / outlook-com
 *   protonmail-desktop@v1   <- protonmail / desktop-webmail
 *   fastmail-desktop@v1     <- fastmail / desktop-webmail
 *
 * Output: src/data/caniemail-support.json (checked in so the oracle and the
 * environments that are derived from it are reviewable and stable).
 */
import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const DATA_URL = "https://www.caniemail.com/api/data.json";
const OUT_PATH = fileURLToPath(new URL("../../src/data/caniemail-support.json", import.meta.url));

const TARGETS = {
  "gmail-desktop": ["gmail", "desktop-webmail"],
  "apple-mail-macos": ["apple-mail", "macos"],
  "yahoo-desktop": ["yahoo", "desktop-webmail"],
  "outlook-com": ["outlook", "outlook-com"],
  "protonmail-desktop": ["protonmail", "desktop-webmail"],
  "fastmail-desktop": ["fastmail", "desktop-webmail"],
};

const baseCode = (code) => code.trim().split(/\s/)[0];

/** Last entry wins: the dataset lists versions oldest -> newest. */
function latest(versions) {
  const keys = Object.keys(versions ?? {});
  if (keys.length === 0) return null;
  const key = keys[keys.length - 1];
  return { version: key, code: baseCode(versions[key]), raw: versions[key] };
}

const res = await fetch(DATA_URL);
if (!res.ok) throw new Error(`Failed to fetch ${DATA_URL}: ${res.status}`);
const json = await res.json();

const features = [];
for (const f of json.data) {
  if (f.category !== "css" && f.category !== "html") continue;
  const support = {};
  for (const [env, [client, platform]] of Object.entries(TARGETS)) {
    const entry = latest(f.stats?.[client]?.[platform]);
    if (entry) support[env] = entry;
  }
  if (Object.keys(support).length === 0) continue;
  features.push({
    slug: f.slug,
    title: f.title,
    category: f.category,
    url: f.url,
    support,
    notesByNum: f.notes_by_num ?? null,
  });
}
features.sort((a, b) => a.slug.localeCompare(b.slug));

await writeFile(
  OUT_PATH,
  JSON.stringify({ source: DATA_URL, fetchedAt: new Date().toISOString(), features }, null, 2) +
    "\n",
);
console.log(`Wrote ${features.length} features to support.json`);
