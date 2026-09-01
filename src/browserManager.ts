/**
 * Manages the (small number of) shared Playwright browser instances used by
 * environments. Environments never launch their own browsers directly - they
 * borrow pages from here, so the runner controls process lifecycle centrally.
 */
import { createRequire } from "node:module";
import { chromium, webkit, type Browser } from "playwright";
import { CmailError } from "./errors.js";

const require = createRequire(import.meta.url);
const PLAYWRIGHT_VERSION: string = (require("playwright/package.json") as { version: string })
  .version;

let chromiumBrowser: Browser | null = null;
let webkitBrowser: Browser | null = null;

async function launch(engine: "chromium" | "webkit"): Promise<Browser> {
  try {
    return await (engine === "chromium" ? chromium : webkit).launch({ headless: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes("Executable doesn't exist")) {
      throw new CmailError(
        `${engine} browser is not installed. Run "npx playwright install ${engine}" and try again. ` +
          (engine === "webkit"
            ? "On unsupported Linux distros you may also need ./scripts/fix-webkit-linux-deps.sh."
            : ""),
        { cause: err },
      );
    }
    if (engine === "webkit" && /libicudata|libjpeg|shared librar/i.test(message)) {
      throw new CmailError(
        `webkit failed to launch due to missing/incompatible system libraries (common on ` +
          `unsupported Linux distros like Fedora). Run ./scripts/fix-webkit-linux-deps.sh and try again.`,
        { cause: err },
      );
    }
    throw new CmailError(`Failed to launch ${engine}: ${message}`, { cause: err });
  }
}

export async function getChromium(): Promise<Browser> {
  if (!chromiumBrowser) {
    chromiumBrowser = await launch("chromium");
  }
  return chromiumBrowser;
}

export async function getWebkit(): Promise<Browser> {
  if (!webkitBrowser) {
    webkitBrowser = await launch("webkit");
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
