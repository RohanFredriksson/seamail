#!/usr/bin/env node
/**
 * One-off cleanup for captures/*.png taken before capture.ps1 cropped to the
 * message body itself: those screenshots are full-primary-screen grabs that
 * include the Outlook ribbon, To/Cc/Subject header, and taskbar around the
 * actual reading pane content.
 *
 * This crops every existing capture in place to the fixed region measured
 * from the original screenshots (same Outlook window layout/DPI for the
 * whole batch - verified pixel-identical header/taskbar boundaries across
 * multiple captures). Re-run generate-fixtures + capture.ps1 from scratch
 * instead of this script for any future capture batch; capture.ps1 now crops
 * to the reading pane at capture time.
 */
import { readFile, writeFile, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { PNG } from "pngjs";

const CAPTURES_DIR = fileURLToPath(new URL("./captures/", import.meta.url));

// Measured from the raw captures: dark ribbon/header chrome ends and the
// white reading-pane background begins at y=330; the taskbar begins at
// y=1032. Full screen width (0-1920) is message body, no side chrome.
const CROP = { x: 0, y: 330, width: 1920, height: 1032 - 330 };

function cropPng(png, { x, y, width, height }) {
  const cropped = new PNG({ width, height });
  PNG.bitblt(png, cropped, x, y, width, height, 0, 0);
  return cropped;
}

async function main() {
  const files = (await readdir(CAPTURES_DIR)).filter((f) => f.endsWith(".png"));
  if (files.length === 0) {
    console.log(`No PNGs found in ${CAPTURES_DIR}`);
    return;
  }

  let cropped = 0;
  let skipped = 0;

  for (const file of files) {
    const filePath = new URL(file, `file://${CAPTURES_DIR}`);
    const raw = await readFile(filePath);
    const png = PNG.sync.read(raw);

    if (png.width < CROP.x + CROP.width || png.height < CROP.y + CROP.height) {
      console.warn(`Skipping ${file}: ${png.width}x${png.height} is smaller than expected crop region`);
      skipped++;
      continue;
    }
    if (png.width === CROP.width && png.height === CROP.height) {
      // Already cropped (e.g. re-running this script, or captured by the updated capture.ps1).
      skipped++;
      continue;
    }

    const result = cropPng(png, CROP);
    await writeFile(filePath, PNG.sync.write(result));
    cropped++;
  }

  console.log(`Cropped ${cropped} capture(s), skipped ${skipped}, in ${CAPTURES_DIR}`);
}

main();
