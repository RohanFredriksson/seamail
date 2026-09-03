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
 * queries (Outlook is not responsive), unreliable web fonts, no inline SVG,
 * real evaluation of "mso" conditional comments (the standard technique
 * email developers use to target Outlook specifically), and an approximation
 * of common VML shapes (bulletproof buttons, background fills) - and renders
 * the resulting HTML with Chromium purely as a drawing surface. The fidelity
 * is honestly reported as "simulated".
 */
import { parse } from "node-html-parser";
import type { Browser, Page } from "playwright";
import { getChromium, newSecurePage } from "../../../src/browserManager.js";
import type {
  SeamailEnvironment,
  DeviceConfig,
  CapabilityMap,
  RenderConditions,
  RenderResult,
  EnvironmentMetadata,
} from "../../../src/types.js";

// Declarations the Word rendering engine is known to ignore or mishandle.
// NOTE: order matters for property names that are substrings of one another
// (e.g. "-webkit-filter"/"filter", "-webkit-mask-image"/"mask-image") - the
// more specific/prefixed variant must be stripped first, otherwise stripping
// the shorter name first would match inside the longer one and leave a
// dangling prefix fragment behind (this exact bug previously affected
// `transform` incorrectly eating `text-transform`, see the lookbehind below).
const STRIPPED_DECLARATIONS: RegExp[] = [
  /display\s*:\s*(inline-)?flex\s*;?/gi,
  /display\s*:\s*(inline-)?grid\s*;?/gi,
  /display\s*:\s*inline-block\s*;?/gi,
  /border-radius\s*:[^;]+;?/gi,
  /border-(?:start|end)-(?:start|end)-radius\s*:[^;]+;?/gi,
  /box-shadow\s*:[^;]+;?/gi,
  /background-image\s*:[^;]+;?/gi,
  // negative lookbehind so this doesn't also eat `text-transform` (Word DOES
  // support text-transform - stripping it was a confirmed bug).
  /(?<!text-)transform\s*:[^;]+;?/gi,
  /gap\s*:[^;]+;?/gi,
  /backdrop-filter\s*:[^;]+;?/gi,
  /grid-template-columns\s*:[^;]+;?/gi,
  /grid-template-rows\s*:[^;]+;?/gi,
  /flex-direction\s*:[^;]+;?/gi,
  /flex\s*:[^;]+;?/gi,
  /justify-content\s*:[^;]+;?/gi,
  /align-items\s*:[^;]+;?/gi,
  /animation(?:-[a-z-]+)?\s*:[^;]+;?/gi,
  /accent-color\s*:[^;]+;?/gi,
  /caption-side\s*:[^;]+;?/gi,
  /clip-path\s*:[^;]+;?/gi,
  /-webkit-filter\s*:[^;]+;?/gi,
  /filter\s*:[^;]+;?/gi,
  /-webkit-mask-image\s*:[^;]+;?/gi,
  /mask-image\s*:[^;]+;?/gi,
  /mix-blend-mode\s*:[^;]+;?/gi,
  /opacity\s*:[^;]+;?/gi,
  /outline(?:-color|-style|-width|-offset)?\s*:[^;]+;?/gi,
  /text-decoration-color\s*:[^;]+;?/gi,
  /text-decoration-style\s*:[^;]+;?/gi,
  /text-shadow\s*:[^;]+;?/gi,
  /-webkit-text-emphasis(?:-[a-z-]+)?\s*:[^;]+;?/gi,
  /text-emphasis(?:-[a-z-]+)?\s*:[^;]+;?/gi,
  /visibility\s*:[^;]+;?/gi,
  /writing-mode\s*:[^;]+;?/gi,
  /text-orientation\s*:[^;]+;?/gi,
  /border-image(?:-[a-z-]+)?\s*:[^;]+;?/gi,
  // CSS logical (block/inline axis) box-model properties - Word ignores all
  // of these regardless of physical direction, treat as one broad category.
  /(?:min-|max-)?(?:block|inline)-size\s*:[^;]+;?/gi,
  /border-(?:block|inline)(?:-start|-end)?(?:-color|-style|-width)?\s*:[^;]+;?/gi,
  /margin-(?:block|inline)(?:-start|-end)?\s*:[^;]+;?/gi,
  /padding-(?:block|inline)(?:-start|-end)?\s*:[^;]+;?/gi,
  /inset(?:-block|-inline)?(?:-start|-end)?\s*:[^;]+;?/gi,
  // Colour/gradient functions Word can't evaluate, wherever they appear in a
  // value (e.g. inside a `background:` shorthand, not just `background-image`).
  /[a-z-]+\s*:\s*[^;]*(?:linear-gradient|radial-gradient|conic-gradient|light-dark\(|oklch\(|rgba\()[^;]*;?/gi,
  // CSS Custom Properties are entirely unresolved by Word.
  /--[a-z][a-z0-9-]*\s*:[^;]+;?/gi,
  /[a-z-]+\s*:\s*[^;]*var\(--[^;]*\)[^;]*;?/gi,
];

const FIXED_WIDTH = 600;

function stripBalancedAtRuleBlocks(css: string, atRuleNames: RegExp): string {
  // Remove top-level @-rule {...} blocks, correctly balancing any braces
  // nested inside (e.g. @keyframes has nested `from {}`/`to {}` blocks, which
  // a simple non-nested regex like /@foo\s*\{[^}]*\}/ can't handle).
  let result = "";
  let i = 0;
  while (i < css.length) {
    const rest = css.slice(i);
    const match = atRuleNames.exec(rest);
    if (match && match.index === 0) {
      const j = css.indexOf("{", i);
      if (j === -1) {
        result += css[i];
        i++;
        continue;
      }
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

function stripAtMediaBlocks(css: string): string {
  return stripBalancedAtRuleBlocks(css, /^@media\b/i);
}

function stripAtKeyframesBlocks(css: string): string {
  return stripBalancedAtRuleBlocks(css, /^@(?:-webkit-|-moz-|-o-)?keyframes\b/i);
}

function stripFontFaceBlocks(css: string): string {
  return css.replace(/@font-face\s*\{[^}]*\}/gi, "");
}

// Real Outlook drops the WHOLE `text-decoration` shorthand when it carries
// extra style/color extensions (e.g. `underline double #e11d48`), but DOES
// honour a plain single-keyword form (`underline`/`line-through`/`none`).
function normalizeTextDecoration(css: string): string {
  return css.replace(/text-decoration(?!-)\s*:\s*([^;]+);?/gi, (_match, value: string) => {
    const trimmed = value.trim();
    if (/^(?:underline|line-through|overline|none)$/i.test(trimmed)) {
      return `text-decoration:${trimmed.toLowerCase()};`;
    }
    return "";
  });
}

function stripProperties(css: string): string {
  let out = normalizeTextDecoration(css);
  for (const decl of STRIPPED_DECLARATIONS) {
    out = out.replace(decl, "");
  }
  return out;
}

/**
 * Word's conditional-comment evaluator recognises "mso" expressions and acts
 * on them for real - unlike standard browsers, which only ever see inert
 * HTML comments. This inverts what Chromium would do natively: reveal
 * [if mso] content (Outlook shows it) and strip [if !mso] content (Outlook
 * hides it), including the common "downlevel-revealed" <!--> trick used to
 * show [if !mso] blocks to everyone except Outlook, and the bare
 * (non-comment) <![if mso]> form Word also recognises inside VML markup.
 */
function resolveMsoConditionals(html: string): string {
  let out = html;
  // [if !mso] wrapped with the <!--> downlevel-revealed trick - hidden in Outlook.
  out = out.replace(/<!--\[if\s+!\s*mso\]>\s*<!-->([\s\S]*?)<!--\s*<!\[endif\]-->/gi, "");
  // [if !mso] without the trick - also hidden in Outlook.
  out = out.replace(/<!--\[if\s+!\s*mso\]>([\s\S]*?)<!\[endif\]-->/gi, "");
  // bare (non-comment) [if !mso] form, used inside VML markup - hidden in Outlook.
  out = out.replace(/<!\[if\s+!\s*mso\]>([\s\S]*?)<!\[endif\]>/gi, "");
  // [if mso] / [if gte mso N] / [if lte mso N] - revealed in Outlook.
  out = out.replace(/<!--\[if\s+(?:gte|lte)\s+mso(?:\s+\d+)?\]>([\s\S]*?)<!\[endif\]-->/gi, "$1");
  out = out.replace(/<!--\[if\s+mso(?:\s+\d+)?\]>([\s\S]*?)<!\[endif\]-->/gi, "$1");
  // bare (non-comment) [if mso] form - revealed in Outlook.
  out = out.replace(/<!\[if\s+(?:gte|lte)\s+mso(?:\s+\d+)?\]>([\s\S]*?)<!\[endif\]>/gi, "$1");
  out = out.replace(/<!\[if\s+mso(?:\s+\d+)?\]>([\s\S]*?)<!\[endif\]>/gi, "$1");
  return out;
}

function extractAttr(attrs: string, name: string): string | undefined {
  const match = new RegExp(`${name}\\s*=\\s*"([^"]*)"`, "i").exec(attrs);
  return match ? match[1] : undefined;
}

function extractPixelSize(style: string): { width?: number; height?: number } {
  const width = /width\s*:\s*([\d.]+)px/i.exec(style);
  const height = /height\s*:\s*([\d.]+)px/i.exec(style);
  return {
    width: width ? parseFloat(width[1]) : undefined,
    height: height ? parseFloat(height[1]) : undefined,
  };
}

// Marks elements generated by the VML approximation so the later inline-style
// stripping pass leaves their background-image/border-radius alone - those
// ARE how Outlook really renders VML shapes, unlike ordinary author CSS.
const VML_MARKER = 'data-seamail-vml="1"';

function approximateRoundRect(attrs: string, inner: string): string {
  const href = extractAttr(attrs, "href");
  const style = extractAttr(attrs, "style") ?? "";
  const { width, height } = extractPixelSize(style);
  const arcsize = parseFloat(extractAttr(attrs, "arcsize") ?? "0");
  const fillcolor = extractAttr(attrs, "fillcolor");
  const strokecolor = extractAttr(attrs, "strokecolor");
  const radius = height && arcsize ? Math.round((height * arcsize) / 100) : 0;

  const content = inner.replace(/<w:anchorlock\s*\/?>/gi, "").replace(/<\/?center[^>]*>/gi, "");

  const divStyle = [
    width !== undefined ? `width:${width}px` : "",
    height !== undefined ? `height:${height}px` : "",
    height !== undefined ? `line-height:${height}px` : "",
    `border-radius:${radius}px`,
    fillcolor ? `background-color:${fillcolor}` : "",
    strokecolor ? `border:1px solid ${strokecolor}` : "border:none",
    "display:inline-block",
    "text-align:center",
    "font-family:'Times New Roman',serif",
  ]
    .filter(Boolean)
    .join(";");

  const tag = href ? "a" : "div";
  const hrefAttr = href ? ` href="${href}"` : "";
  return `<${tag}${hrefAttr} ${VML_MARKER} style="${divStyle}">${content.trim()}</${tag}>`;
}

function approximateFillRect(attrs: string, inner: string): string {
  const style = extractAttr(attrs, "style") ?? "";
  const { width, height } = extractPixelSize(style);
  const fillMatch = /<v:fill\b([^>]*)\/?>/i.exec(inner);
  const fillAttrs = fillMatch ? fillMatch[1] : "";
  const src = extractAttr(fillAttrs, "src");
  const color = extractAttr(fillAttrs, "color");
  const textboxMatch = /<v:textbox\b[^>]*>([\s\S]*?)<\/v:textbox>/i.exec(inner);
  const content = textboxMatch ? textboxMatch[1] : "";

  const divStyle = [
    width !== undefined ? `width:${width}px` : "",
    height !== undefined ? `height:${height}px` : "",
    src ? `background-image:url(${src})` : "",
    src ? "background-size:cover" : "",
    color ? `background-color:${color}` : "",
  ]
    .filter(Boolean)
    .join(";");

  return `<div ${VML_MARKER} style="${divStyle}">${content.trim()}</div>`;
}

/**
 * Word actually draws VML shapes (rounded-corner buttons, tiled background
 * fills) - the one place "real" Outlook exceeds a plain drawing surface.
 * Chromium can't interpret VML, so approximate the common bulletproof-button
 * and background-fill patterns as plain HTML/CSS, and unwrap anything else
 * (v:/w: namespaced tags) so unrecognised VML doesn't leak into the render.
 */
function approximateVmlShapes(html: string): string {
  let out = html.replace(
    /<v:roundrect\b([^>]*)>([\s\S]*?)<\/v:roundrect>/gi,
    (_m, attrs: string, inner: string) => approximateRoundRect(attrs, inner),
  );
  out = out.replace(/<v:rect\b([^>]*)>([\s\S]*?)<\/v:rect>/gi, (_m, attrs: string, inner: string) =>
    approximateFillRect(attrs, inner),
  );

  // Unwrap any remaining paired v:* tags, keeping their inner content.
  const pairedVmlTag = /<v:([a-z]+)\b[^>]*>([\s\S]*?)<\/v:\1>/gi;
  while (pairedVmlTag.test(out)) {
    out = out.replace(pairedVmlTag, "$2");
  }

  // Drop any leftover self-closing/unmatched VML or Word-namespace tags.
  out = out.replace(/<\/?(?:v|w):[a-z0-9]+\b[^>]*\/?>/gi, "");

  return out;
}

// Sizing (width/height and their min-/max- variants) on plain block elements
// is not reliably honoured by real Outlook - it collapses to content size
// regardless of value syntax. Tables/cells and images DO honour it reliably.
const SIZING_SAFE_TAGS = new Set([
  "table",
  "td",
  "th",
  "tr",
  "thead",
  "tbody",
  "tfoot",
  "col",
  "colgroup",
  "img",
]);

// Negative lookbehind so this only matches a bare `width`/`height` (with an
// optional min-/max- prefix), not the tail end of an unrelated property like
// `border-width`/`column-width`/`outline-width`.
const SIZING_PROPS_RE = /(?<![a-z-])(?:min-|max-)?(?:width|height)\s*:[^;]+;?/gi;

function stripSizingOnNonTableElements(inline: string, tagName: string): string {
  if (SIZING_SAFE_TAGS.has(tagName.toLowerCase())) return inline;
  return inline.replace(SIZING_PROPS_RE, "");
}

// Elements using `display:flex`/`inline-flex` or `position:absolute`/
// `position:relative` lose their ENTIRE inline style attribute in real
// Outlook, not just the unsupported declaration - a more severe behaviour
// than simple per-property stripping.
const WHOLE_STYLE_DROP_TRIGGER_RE =
  /display\s*:\s*(?:inline-)?flex\b|position\s*:\s*(?:absolute|relative)\b/i;

// HTML5 semantic sectioning elements don't get their default `display:block`
// UA-stylesheet treatment from Word - they render as unknown/inline elements.
const SEMANTIC_BLOCK_ELEMENTS = new Set([
  "header",
  "footer",
  "article",
  "section",
  "aside",
  "nav",
  "main",
  "figure",
  "figcaption",
]);

/**
 * Real Outlook's CSS selector matching is extremely primitive: only a
 * single simple type/class/ID selector is honoured. Combinators (`+`, `>`,
 * `~`), attribute selectors, the universal selector, pseudo-classes/
 * elements, and even compound/chained class selectors (`.a.b.c`) are all
 * ignored. This also naturally handles native CSS nesting (`&`), since a
 * nested rule's flattened selector is never a single simple selector.
 */
const SIMPLE_SELECTOR_RE =
  /^[a-zA-Z][a-zA-Z0-9]*$|^\.[a-zA-Z_-][a-zA-Z0-9_-]*$|^#[a-zA-Z_-][a-zA-Z0-9_-]*$/;

function isSimpleSelector(selector: string): boolean {
  return SIMPLE_SELECTOR_RE.test(selector.trim());
}

// Strips any nested `{ ... }` blocks from a rule body (CSS nesting is
// unsupported), keeping only the flat declarations around them.
function stripNestedBlocks(body: string): string {
  let out = "";
  let i = 0;
  while (i < body.length) {
    const idx = body.indexOf("{", i);
    if (idx === -1) {
      out += body.slice(i);
      break;
    }
    out += body.slice(i, idx);
    let depth = 1;
    let k = idx + 1;
    while (k < body.length && depth > 0) {
      if (body[k] === "{") depth++;
      else if (body[k] === "}") depth--;
      k++;
    }
    i = k;
  }
  return out;
}

// Keeps only the comma-separated selector parts that are a single simple
// selector, dropping the rest. Returns null if none of the parts qualify.
function filterSimpleSelectorParts(selectorText: string): string | null {
  const parts = selectorText
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  const kept = parts.filter((part) => isSimpleSelector(part));
  if (kept.length === 0) return null;
  return kept.join(", ");
}

/**
 * Parses a stylesheet at the top level (assumes @media/@keyframes/@font-face
 * blocks have already been stripped) and drops any rule whose selector isn't
 * a single simple type/class/ID selector, and any nested block inside a
 * rule's body (native CSS nesting).
 */
function filterUnsupportedSelectors(css: string): string {
  let out = "";
  let i = 0;
  while (i < css.length) {
    const braceIdx = css.indexOf("{", i);
    if (braceIdx === -1) {
      out += css.slice(i);
      break;
    }
    const selectorText = css.slice(i, braceIdx).trim();
    let depth = 1;
    let k = braceIdx + 1;
    while (k < css.length && depth > 0) {
      if (css[k] === "{") depth++;
      else if (css[k] === "}") depth--;
      k++;
    }
    const bodyFull = css.slice(braceIdx + 1, k - 1);
    if (selectorText.length > 0) {
      const flatBody = stripNestedBlocks(bodyFull);
      const keptSelector = filterSimpleSelectorParts(selectorText);
      if (keptSelector) {
        out += `${keptSelector}{${flatBody}}`;
      }
    }
    i = k;
  }
  return out;
}

function inputTypeOf(el: import("node-html-parser").HTMLElement): string {
  return (el.getAttribute("type") ?? "text").toLowerCase();
}

/**
 * Real form controls behave very differently from their native widgets in
 * Outlook: `<button>`/submit/reset lose their box styling entirely (submit/
 * reset become bracket-notation text, plain `<button>` becomes bare text),
 * checkbox/radio become bracket/paren placeholders, `<textarea>` disappears
 * completely, `<select>` becomes bracket-notation text, and a plain
 * `<input type="text">` shows its literal value as plain text with no box.
 */
function simulateFormControls(root: import("node-html-parser").HTMLElement): void {
  root.querySelectorAll("button").forEach((el) => {
    el.replaceWith(el.text.trim());
  });

  root.querySelectorAll("input").forEach((el) => {
    const type = inputTypeOf(el);
    if (type === "hidden") return;
    const value = el.getAttribute("value") ?? "";
    if (type === "submit") {
      el.replaceWith(`[${value || "Submit"}]`);
    } else if (type === "reset") {
      el.replaceWith(`[${value || "Reset"}]`);
    } else if (type === "checkbox") {
      el.replaceWith(el.hasAttribute("checked") ? "[X]" : "[ ]");
    } else if (type === "radio") {
      el.replaceWith(el.hasAttribute("checked") ? "(X)" : "( )");
    } else {
      el.replaceWith(value);
    }
  });

  root.querySelectorAll("textarea").forEach((el) => el.remove());

  root.querySelectorAll("select").forEach((el) => {
    const selected = el.querySelector("option[selected]") ?? el.querySelector("option");
    const label = selected ? selected.text.trim() : "";
    el.replaceWith(`[${label} \u2228]`);
  });
}

class OutlookClassicV1 implements SeamailEnvironment {
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
    msoConditionalComments: "supported",
    vmlShapes: "partial",
  };

  private browser: Browser | null = null;

  async prepare(): Promise<void> {
    this.browser = await getChromium();
  }

  async process(html: string): Promise<string> {
    const root = parse(approximateVmlShapes(resolveMsoConditionals(html)));

    root.querySelectorAll("script").forEach((el) => el.remove());
    root.querySelectorAll('link[rel="stylesheet"]').forEach((el) => el.remove());

    // The HTML5 boolean `hidden` attribute is completely ignored by Word.
    root.querySelectorAll("[hidden]").forEach((el) => el.removeAttribute("hidden"));

    // Word leaves NO visual trace of inline SVG at all (not even a
    // placeholder box) - just remove the element entirely.
    root.querySelectorAll("svg").forEach((el) => el.remove());

    simulateFormControls(root);

    // Rewrite <style> blocks to strip modern layout/visual CSS, media
    // queries, and any rule using a selector Word's primitive CSS parser
    // doesn't support.
    root.querySelectorAll("style").forEach((styleEl) => {
      let css = styleEl.textContent;
      css = stripAtMediaBlocks(css);
      css = stripAtKeyframesBlocks(css);
      css = stripFontFaceBlocks(css);
      css = filterUnsupportedSelectors(css);
      css = stripProperties(css);
      styleEl.set_content(css);
    });

    // HTML5 semantic sectioning elements don't get default block display in
    // Word - force them inline unless the fixture's own inline CSS already
    // sets a display value.
    for (const tag of SEMANTIC_BLOCK_ELEMENTS) {
      root.querySelectorAll(tag).forEach((el) => {
        const style = el.getAttribute("style") ?? "";
        if (!/display\s*:/i.test(style)) {
          el.setAttribute("style", `${style};display:inline;`);
        }
      });
    }

    // Rewrite inline styles similarly, except elements the VML
    // approximation generated - their background-image/border-radius ARE
    // how Outlook really renders VML, unlike ordinary author CSS.
    root.querySelectorAll("[style]").forEach((el) => {
      if (el.getAttribute("data-seamail-vml")) return;
      const original = el.getAttribute("style") ?? "";
      // display:flex/inline-flex or position:absolute/relative drop the
      // ENTIRE inline style attribute in real Outlook, not just that one
      // declaration.
      if (WHOLE_STYLE_DROP_TRIGGER_RE.test(original)) {
        el.removeAttribute("style");
        return;
      }
      let inline = stripProperties(original);
      inline = stripSizingOnNonTableElements(inline, el.tagName ?? "");
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
    const page: Page = await newSecurePage(this.browser, {
      viewport: this.device.viewport,
      deviceScaleFactor: this.device.deviceScaleFactor,
      // Outlook classic does not support dark mode / prefers-color-scheme.
      colorScheme: "light",
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

  async dispose(): Promise<void> {}
}

export function create(): SeamailEnvironment {
  return new OutlookClassicV1();
}
