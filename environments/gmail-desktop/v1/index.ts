/**
 * gmail-desktop@v1
 *
 * Models Gmail's web interface on desktop. Gmail renders in whatever
 * browser the user has open, so the underlying engine here (Chromium) is
 * genuinely representative. What is simulated is Gmail's server-side HTML
 * sanitisation: it strips <script>, remote stylesheets, and a handful of
 * dangerous/ignored CSS properties before the message ever reaches the DOM.
 */
import { parse } from "node-html-parser";
import type { Browser, Page } from "playwright";
import { getChromium, newSecurePage } from "../../../src/browserManager.js";
import type {
  CmailEnvironment,
  DeviceConfig,
  CapabilityMap,
  RenderConditions,
  RenderResult,
  EnvironmentMetadata,
} from "../../../src/types.js";

const UNSUPPORTED_PROPERTIES = ["position", "behavior", "-moz-binding"];

class GmailDesktopV1 implements CmailEnvironment {
  readonly metadata: EnvironmentMetadata = {
    client: "gmail",
    platform: "desktop",
    version: "v1",
    name: "gmail-desktop@v1",
    fidelity: "high",
    engine: "chromium",
    description:
      "Gmail web interface on desktop. Real Chromium/Blink rendering engine " +
      "with an approximation of Gmail's known HTML/CSS sanitisation rules.",
  };

  readonly device: DeviceConfig = {
    viewport: { width: 700, height: 900 },
    deviceScaleFactor: 1,
  };

  readonly capabilities: CapabilityMap = {
    flexbox: "supported",
    grid: "supported",
    borderRadius: "supported",
    backgroundImage: "supported",
    mediaQuery: "supported",
    webFonts: "partial",
    svg: "supported",
    darkMode: "partial",
  };

  private browser: Browser | null = null;

  async prepare(): Promise<void> {
    this.browser = await getChromium();
  }

  async process(html: string): Promise<string> {
    const root = parse(html);

    // Gmail strips script execution entirely.
    root.querySelectorAll("script").forEach((el) => el.remove());
    // Gmail does not fetch remote stylesheets - only inline <style>/style attrs survive.
    root.querySelectorAll('link[rel="stylesheet"]').forEach((el) => el.remove());

    // Strip a small set of properties Gmail is known to drop.
    root.querySelectorAll("style").forEach((styleEl) => {
      let css = styleEl.textContent;
      for (const prop of UNSUPPORTED_PROPERTIES) {
        css = css.replace(new RegExp(`${prop}\\s*:[^;]+;?`, "gi"), "");
      }
      styleEl.set_content(css);
    });
    root.querySelectorAll("[style]").forEach((el) => {
      let inline = el.getAttribute("style") ?? "";
      for (const prop of UNSUPPORTED_PROPERTIES) {
        inline = inline.replace(new RegExp(`${prop}\\s*:[^;]+;?`, "gi"), "");
      }
      el.setAttribute("style", inline);
    });

    return root.toString();
  }

  async render(processedHtml: string, conditions: RenderConditions): Promise<RenderResult> {
    if (!this.browser) throw new Error("gmail-desktop@v1 not prepared");
    const page: Page = await newSecurePage(this.browser, {
      viewport: this.device.viewport,
      deviceScaleFactor: this.device.deviceScaleFactor,
      colorScheme: conditions.colorScheme,
      blockImages: !conditions.imagesEnabled,
    });
    try {
      await page.setContent(processedHtml, { waitUntil: "networkidle" });
      const screenshot = await page.screenshot({ fullPage: true });
      return { screenshot, processedHtml };
    } finally {
      await page.close();
    }
  }

  async dispose(): Promise<void> {
    // Shared browser lifecycle is owned by browserManager, nothing to do here.
  }
}

export function create(): CmailEnvironment {
  return new GmailDesktopV1();
}
