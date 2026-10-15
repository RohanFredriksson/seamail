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
import { sanitizeInlineStyle, sanitizeStylesheet } from "../../../src/emailCss.js";
import {
  GMAIL_CSS_POLICY,
  REMOVED_ELEMENTS,
  REMOVED_META_NAMES,
  STRIPPED_ATTRIBUTES,
  UNWRAPPED_ELEMENTS,
} from "./rules.js";
import type {
  SeamailEnvironment,
  DeviceConfig,
  CapabilityMap,
  RenderConditions,
  RenderResult,
  EnvironmentMetadata,
} from "../../../src/types.js";

class GmailDesktopV1 implements SeamailEnvironment {
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
    // display:flex / display:grid are kept, but flex-direction, flex-wrap,
    // justify-content, align-items and grid-template-* are dropped.
    flexbox: "partial",
    grid: "partial",
    borderRadius: "supported",
    backgroundImage: "supported",
    // Width-based queries work; hover / prefers-* / resolution queries are dropped.
    mediaQuery: "partial",
    webFonts: "unsupported",
    svg: "unsupported",
    darkMode: "unsupported",
  };

  private browser: Browser | null = null;

  async prepare(): Promise<void> {
    this.browser = await getChromium();
  }

  async process(html: string): Promise<string> {
    const root = parse(html);

    // Gmail strips script execution entirely.
    root.querySelectorAll("script").forEach((el) => el.remove());

    for (const tag of REMOVED_ELEMENTS) root.querySelectorAll(tag).forEach((el) => el.remove());
    for (const tag of UNWRAPPED_ELEMENTS) {
      root.querySelectorAll(tag).forEach((el) => el.replaceWith(el.innerHTML));
    }
    for (const name of REMOVED_META_NAMES) {
      root.querySelectorAll(`meta[name="${name}"]`).forEach((el) => el.remove());
    }
    for (const attr of STRIPPED_ATTRIBUTES) {
      root.querySelectorAll(`[${attr}]`).forEach((el) => el.removeAttribute(attr));
    }

    root.querySelectorAll("style").forEach((styleEl) => {
      styleEl.set_content(sanitizeStylesheet(styleEl.textContent, GMAIL_CSS_POLICY));
    });
    root.querySelectorAll("[style]").forEach((el) => {
      el.setAttribute(
        "style",
        sanitizeInlineStyle(el.getAttribute("style") ?? "", GMAIL_CSS_POLICY),
      );
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

export function create(): SeamailEnvironment {
  return new GmailDesktopV1();
}
