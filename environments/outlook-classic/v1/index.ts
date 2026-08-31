/**
 * outlook-classic@v1
 *
 * IMPORTANT: This is an explicit SIMULATION, not a reproduction of the real
 * Microsoft Word/Outlook rendering engine (MSHTML/Word). There is no
 * practical way to run the actual Word engine headlessly and locally.
 *
 * Instead this environment applies a set of transformations that encode
 * well-known Outlook "Word engine" rendering behaviour - no CSS Grid/Flexbox,
 * no border-radius, no background-image outside VML hacks, no @media
 * queries (Outlook is not responsive), unreliable web fonts, no inline SVG -
 * and renders the resulting HTML with Chromium purely as a drawing surface.
 * The fidelity is honestly reported as "simulated".
 */
import { parse } from "node-html-parser";
import type { Browser, Page } from "playwright";
import { getChromium } from "../../../src/browserManager.js";
import type {
  CmailEnvironment,
  DeviceConfig,
  CapabilityMap,
  RenderConditions,
  RenderResult,
  EnvironmentMetadata,
} from "../../../src/types.js";

// Declarations the Word rendering engine is known to ignore or mishandle.
const STRIPPED_DECLARATIONS: RegExp[] = [
  /display\s*:\s*(inline-)?flex\s*;?/gi,
  /display\s*:\s*(inline-)?grid\s*;?/gi,
  /border-radius\s*:[^;]+;?/gi,
  /box-shadow\s*:[^;]+;?/gi,
  /background-image\s*:[^;]+;?/gi,
  /transform\s*:[^;]+;?/gi,
  /gap\s*:[^;]+;?/gi,
  /backdrop-filter\s*:[^;]+;?/gi,
  /grid-template-columns\s*:[^;]+;?/gi,
  /grid-template-rows\s*:[^;]+;?/gi,
  /flex-direction\s*:[^;]+;?/gi,
  /flex\s*:[^;]+;?/gi,
  /justify-content\s*:[^;]+;?/gi,
  /align-items\s*:[^;]+;?/gi,
];

const FIXED_WIDTH = 600;

function stripAtMediaBlocks(css: string): string {
  // Remove top-level @media {...} blocks (single level of nested braces is
  // sufficient for our fixtures; Outlook ignores media queries entirely).
  let result = "";
  const depth = 0;
  let i = 0;
  while (i < css.length) {
    if (css.startsWith("@media", i) && depth === 0) {
      // consume until matching closing brace of the @media block
      const j = css.indexOf("{", i);
      if (j === -1) break;
      let d = 1;
      let k = j + 1;
      while (k < css.length && d > 0) {
        if (css[k] === "{") d++;
        else if (css[k] === "}") d--;
        k++;
      }
      i = k;
      continue;
    }
    result += css[i];
    i++;
  }
  return result;
}

function stripFontFaceBlocks(css: string): string {
  return css.replace(/@font-face\s*\{[^}]*\}/gi, "");
}

function stripProperties(css: string): string {
  let out = css;
  for (const decl of STRIPPED_DECLARATIONS) {
    out = out.replace(decl, "");
  }
  return out;
}

class OutlookClassicV1 implements CmailEnvironment {
  readonly metadata: EnvironmentMetadata = {
    client: "outlook",
    platform: "windows",
    version: "v1",
    name: "outlook-classic@v1",
    fidelity: "simulated",
    engine: "simulated-dom",
    description:
      "Outlook 'classic' desktop (Word rendering engine). This is a " +
      "behavioural SIMULATION: HTML/CSS is rewritten to emulate known Word " +
      "engine limitations, then rendered with Chromium purely as a drawing " +
      "surface. It is not a real Word/Outlook rendering engine.",
  };

  readonly device: DeviceConfig = {
    viewport: { width: FIXED_WIDTH + 40, height: 900 },
    deviceScaleFactor: 1,
  };

  readonly capabilities: CapabilityMap = {
    flexbox: "unsupported",
    grid: "unsupported",
    borderRadius: "unsupported",
    backgroundImage: "unsupported",
    mediaQuery: "unsupported",
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

    root.querySelectorAll("script").forEach((el) => el.remove());
    root.querySelectorAll('link[rel="stylesheet"]').forEach((el) => el.remove());

    // Word does not render inline SVG - replace with a visible placeholder.
    root.querySelectorAll("svg").forEach((el) => {
      const placeholder = parse(
        '<div style="border:1px dashed #999;background:#eee;color:#999;' +
          "display:inline-block;text-align:center;font-family:'Times New Roman',serif;" +
          'font-size:11px;width:100px;height:60px;line-height:60px;">[svg unsupported]</div>',
      );
      el.replaceWith(placeholder);
    });

    // Rewrite <style> blocks to strip modern layout/visual CSS and media queries.
    root.querySelectorAll("style").forEach((styleEl) => {
      let css = styleEl.textContent;
      css = stripAtMediaBlocks(css);
      css = stripFontFaceBlocks(css);
      css = stripProperties(css);
      styleEl.set_content(css);
    });

    // Rewrite inline styles similarly.
    root.querySelectorAll("[style]").forEach((el) => {
      let inline = el.getAttribute("style") ?? "";
      inline = stripProperties(inline);
      el.setAttribute("style", inline);
    });

    // Outlook renders in a fixed-width reading pane, never responsively.
    const body = root.querySelector("body");
    if (body) {
      body.setAttribute(
        "style",
        `${body.getAttribute("style") ?? ""};max-width:${FIXED_WIDTH}px;margin:0 auto;` +
          `font-family:'Times New Roman',serif;`,
      );
    }

    return root.toString();
  }

  async render(processedHtml: string, conditions: RenderConditions): Promise<RenderResult> {
    if (!this.browser) throw new Error("outlook-classic@v1 not prepared");
    const page: Page = await this.browser.newPage({
      viewport: this.device.viewport,
      deviceScaleFactor: this.device.deviceScaleFactor,
      // Outlook classic does not support dark mode / prefers-color-scheme.
      colorScheme: "light",
    });
    try {
      // Outlook does not download background images at all.
      await page.route("**/*.{png,jpg,jpeg,gif,webp,svg}", (route) => {
        const url = route.request().url();
        // Still allow plain <img> content images through; background-image
        // declarations were already stripped from CSS above.
        void url;
        if (!conditions.imagesEnabled) {
          route.abort();
        } else {
          route.continue();
        }
      });
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
  return new OutlookClassicV1();
}
