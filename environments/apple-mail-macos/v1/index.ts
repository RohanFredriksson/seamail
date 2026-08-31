/**
 * apple-mail-macos@v1
 *
 * Models Apple Mail on macOS. Apple Mail is built on WebKit and is one of
 * the most permissive email clients - it applies almost no sanitisation and
 * supports most modern CSS. This environment therefore does very little
 * processing and renders through a real WebKit engine, giving genuinely
 * different rendering behaviour from the Chromium-backed environments.
 */
import type { Browser, Page } from "playwright";
import { getWebkit } from "../../../src/browserManager.js";
import type {
  CmailEnvironment,
  DeviceConfig,
  CapabilityMap,
  RenderConditions,
  RenderResult,
  EnvironmentMetadata,
} from "../../../src/types.js";

class AppleMailMacosV1 implements CmailEnvironment {
  readonly metadata: EnvironmentMetadata = {
    client: "apple-mail",
    platform: "macos",
    version: "v1",
    name: "apple-mail-macos@v1",
    fidelity: "high",
    engine: "webkit",
    description:
      "Apple Mail on macOS. Real WebKit rendering engine with minimal " +
      "processing, matching Apple Mail's permissive handling of HTML/CSS.",
  };

  readonly device: DeviceConfig = {
    viewport: { width: 800, height: 900 },
    deviceScaleFactor: 2,
  };

  readonly capabilities: CapabilityMap = {
    flexbox: "supported",
    grid: "supported",
    borderRadius: "supported",
    backgroundImage: "supported",
    mediaQuery: "supported",
    webFonts: "supported",
    svg: "supported",
    darkMode: "supported",
  };

  private browser: Browser | null = null;

  async prepare(): Promise<void> {
    this.browser = await getWebkit();
  }

  async process(html: string): Promise<string> {
    // Apple Mail applies effectively no sanitisation of its own for our purposes.
    return html;
  }

  async render(processedHtml: string, conditions: RenderConditions): Promise<RenderResult> {
    if (!this.browser) throw new Error("apple-mail-macos@v1 not prepared");
    const page: Page = await this.browser.newPage({
      viewport: this.device.viewport,
      deviceScaleFactor: this.device.deviceScaleFactor,
      colorScheme: conditions.colorScheme,
    });
    try {
      if (!conditions.imagesEnabled) {
        await page.route("**/*.{png,jpg,jpeg,gif,webp,svg}", (route) => route.abort());
      }
      await page.setContent(processedHtml, { waitUntil: "networkidle" });
      const screenshot = await page.screenshot({ fullPage: true });
      return { screenshot, processedHtml };
    } finally {
      await page.close();
    }
  }

  async dispose(): Promise<void> {}
}

export function create(): CmailEnvironment {
  return new AppleMailMacosV1();
}
