/**
 * Manages the (small number of) shared Playwright browser instances used by
 * environments. Environments never launch their own browsers directly - they
 * borrow pages from here, so the runner controls process lifecycle centrally.
 */
import { createRequire } from "node:module";
import { chromium, webkit, type Browser, type Page } from "playwright";
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

export interface SecurePageOptions {
  viewport: { width: number; height: number };
  deviceScaleFactor?: number;
  colorScheme: "light" | "dark";
  /** Simulate the email client's "images blocked" preview state. */
  blockImages?: boolean;
}

/**
 * Opens a page with Cmail's default security/reproducibility policy: no
 * JavaScript execution (real email clients never run script in a message),
 * and no live external network requests (only data:/blob:/about: content is
 * rendered) so that snapshot tests never depend on the network and never
 * leak fixture content to remote hosts. See docs/roadmap.md Milestone 9.
 */
export async function newSecurePage(browser: Browser, opts: SecurePageOptions): Promise<Page> {
  const page = await browser.newPage({
    viewport: opts.viewport,
    deviceScaleFactor: opts.deviceScaleFactor,
    colorScheme: opts.colorScheme,
    javaScriptEnabled: false,
  });
  await page.route("**/*", (route) => {
    const request = route.request();
    if (/^https?:\/\//i.test(request.url())) {
      route.abort();
      return;
    }
    if (opts.blockImages && request.resourceType() === "image") {
      route.abort();
      return;
    }
    route.continue();
  });
  return page;
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
