/**
 * Shared implementation for Chromium-rendered webmail clients (Gmail, Yahoo,
 * Outlook.com, Proton, Fastmail). The engine is real Blink; what differs
 * per client is which HTML/CSS features it strips, and that is *derived*
 * from the Can I Email dataset via the feature catalog, not hand-written.
 */
import { parse } from "node-html-parser";
import type { Browser, Page } from "playwright";
import { getChromium, newSecurePage } from "./browserManager.js";
import { deriveCapabilities, unsupportedFeatures } from "./clientSupport.js";
import { sanitizeInlineStyle, sanitizeStylesheet } from "./emailCss.js";
import { buildClientPolicy, removeUnsupportedImages } from "./featureRules.js";
import type {
  CapabilityMap,
  DeviceConfig,
  EnvironmentMetadata,
  RenderConditions,
  RenderResult,
  SeamailEnvironment,
} from "./types.js";

export interface WebmailSpec {
  /** Key into the support dataset and registry base name, e.g. "gmail-desktop". */
  key: string;
  client: string;
  platform: string;
  description: string;
  viewport?: { width: number; height: number };
}

class WebmailEnvironment implements SeamailEnvironment {
  readonly metadata: EnvironmentMetadata;
  readonly device: DeviceConfig;
  readonly capabilities: CapabilityMap;
  private browser: Browser | null = null;
  private readonly policy;

  constructor(private readonly spec: WebmailSpec) {
    this.metadata = {
      client: spec.client,
      platform: spec.platform,
      version: "v1",
      name: `${spec.key}@v1`,
      fidelity: "high",
      engine: "chromium",
      description: spec.description,
    };
    this.device = { viewport: spec.viewport ?? { width: 700, height: 900 }, deviceScaleFactor: 1 };
    this.capabilities = deriveCapabilities(spec.key);
    this.policy = buildClientPolicy(unsupportedFeatures(spec.key));
  }

  async prepare(): Promise<void> {
    this.browser = await getChromium();
  }

  async process(html: string): Promise<string> {
    const root = parse(html);
    const { css, html: ops } = this.policy;

    // No webmail client executes script or fetches remote stylesheets.
    root.querySelectorAll("script").forEach((el) => el.remove());
    root.querySelectorAll('link[rel="stylesheet"]').forEach((el) => el.remove());

    for (const selector of ops.removeElements) {
      root.querySelectorAll(selector).forEach((el) => el.remove());
    }
    removeUnsupportedImages(root, ops.images);
    for (const tag of ops.unwrapElements) {
      root.querySelectorAll(tag).forEach((el) => el.replaceWith(el.innerHTML));
    }
    for (const name of ops.attributes) {
      root.querySelectorAll(`[${name}]`).forEach((el) => el.removeAttribute(name));
    }
    for (const name of ops.bodyAttributes) {
      root.querySelectorAll("body").forEach((el) => el.removeAttribute(name));
    }

    root.querySelectorAll("style").forEach((el) => {
      el.set_content(sanitizeStylesheet(el.textContent, css));
    });
    root.querySelectorAll("[style]").forEach((el) => {
      el.setAttribute("style", sanitizeInlineStyle(el.getAttribute("style") ?? "", css));
    });

    return root.toString();
  }

  async render(processedHtml: string, conditions: RenderConditions): Promise<RenderResult> {
    if (!this.browser) throw new Error(`${this.spec.key}@v1 not prepared`);
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
    // Shared browser lifecycle is owned by browserManager.
  }
}

export function createWebmailEnvironment(spec: WebmailSpec): SeamailEnvironment {
  return new WebmailEnvironment(spec);
}

/** The unsupported features of a client that the catalog has no rule for (coverage gaps). */
export function unmodelledFeatures(key: string): string[] {
  return buildClientPolicy(unsupportedFeatures(key)).unmodelled;
}
