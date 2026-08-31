/**
 * Manages the (small number of) shared Playwright browser instances used by
 * environments. Environments never launch their own browsers directly - they
 * borrow pages from here, so the runner controls process lifecycle centrally.
 */
import { chromium, webkit, type Browser } from "playwright";

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

export async function closeAllBrowsers(): Promise<void> {
  await Promise.all([chromiumBrowser?.close(), webkitBrowser?.close()]);
  chromiumBrowser = null;
  webkitBrowser = null;
}
