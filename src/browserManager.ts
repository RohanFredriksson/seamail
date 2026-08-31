/**
 * Manages the (small number of) shared Playwright browser instances used by
 * environments. Environments never launch their own browsers directly - they
 * borrow pages from here, so the runner controls process lifecycle centrally.
 */
import { createRequire } from "node:module";
import { chromium, webkit, type Browser } from "playwright";

const require = createRequire(import.meta.url);
const PLAYWRIGHT_VERSION: string = (require("playwright/package.json") as { version: string })
  .version;

let chromiumBrowser: Browser | null = null;
let webkitBrowser: Browser | null = null;

export async function getChromium(): Promise<Browser> {
  if (!chromiumBrowser) {
    chromiumBrowser = await chromium.launch({ headless: true });
  }
  return chromiumBrowser;
}

export async function getWebkit(): Promise<Browser> {
  if (!webkitBrowser) {
    webkitBrowser = await webkit.launch({ headless: true });
  }
  return webkitBrowser;
}

/** Resolves the actual installed engine + Playwright versions for lockfile pinning. */
export async function getEngineVersions(
  engine: "chromium" | "webkit",
): Promise<{ engineVersion: string; playwrightVersion: string }> {
  const browser = engine === "chromium" ? await getChromium() : await getWebkit();
  return { engineVersion: browser.version(), playwrightVersion: PLAYWRIGHT_VERSION };
}

export async function closeAllBrowsers(): Promise<void> {
  await Promise.all([chromiumBrowser?.close(), webkitBrowser?.close()]);
  chromiumBrowser = null;
  webkitBrowser = null;
}
