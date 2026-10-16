/**
 * Catalog mapping Can I Email feature slugs to the concrete HTML/CSS
 * constructs a client removes when it does not support that feature.
 *
 * A webmail environment is then just "the catalog entries for every feature
 * the dataset marks unsupported ("n") for that client" - see
 * src/webmailEnvironment.ts. Keeping the knowledge here, once, is what lets
 * Gmail, Yahoo, Outlook.com, Proton and Fastmail share one implementation.
 */
import type { CssPolicy } from "./emailCss.js";

/** Anything with a RegExp-style `test`, so selector rules can be regexes or functions. */
interface Matcher {
  test(selector: string): boolean;
}

/** Identifies an image format by file extension, MIME type, or "any data: URI". */
export interface ImageSpec {
  extensions?: string[];
  mimeTypes?: string[];
  dataUri?: boolean;
}

export function matchesImage(src: string, spec: ImageSpec): boolean {
  const value = src.trim().toLowerCase();
  if (value.startsWith("data:")) {
    if (spec.dataUri) return true;
    return (spec.mimeTypes ?? []).some((m) => value.startsWith(`data:${m}`));
  }
  const path = value.split(/[?#]/)[0];
  return (spec.extensions ?? []).some((ext) => path.endsWith(`.${ext}`));
}

/** Removes <img> elements whose source is in one of the given unsupported formats. */
export function removeUnsupportedImages(
  root: import("node-html-parser").HTMLElement,
  specs: ImageSpec[],
): void {
  if (specs.length === 0) return;
  root.querySelectorAll("img").forEach((img) => {
    const src = img.getAttribute("src") ?? "";
    if (specs.some((spec) => matchesImage(src, spec))) img.remove();
  });
}

export interface FeatureRule {
  /** Image formats the client does not display; matching <img> elements are removed. */
  images?: ImageSpec[];
  /** CSS property names (vendor prefix ignored) to drop. */
  properties?: RegExp[];
  /** Declarations whose value matches are dropped, whatever the property. */
  values?: RegExp[];
  /** Rules whose selector matches are dropped. */
  selectors?: Matcher[];
  /** Rules whose full selector list matches are dropped. */
  selectorLists?: ((selectors: string[]) => boolean)[];
  /** At-rule names dropped entirely. */
  atRules?: string[];
  /** `@media` blocks whose condition matches are dropped. */
  mediaFeatures?: RegExp[];
  /** Strip nested rules (CSS nesting). */
  nesting?: boolean;
  /** CSS selectors of elements removed together with their content. */
  removeElements?: string[];
  /** Tag names whose tags are removed but whose content survives. */
  unwrapElements?: string[];
  /** Attributes stripped from every element. */
  attributes?: string[];
  /** Attributes stripped from <body> only. */
  bodyAttributes?: string[];
}

const pseudo = (...names: string[]): FeatureRule => ({
  selectors: [new RegExp(`:(?:${names.join("|")})(?![\\w-])`, "i")],
});
const props = (...res: RegExp[]): FeatureRule => ({ properties: res });
const prop = (name: string): FeatureRule => props(new RegExp(`^${name}$`));
const val = (...res: RegExp[]): FeatureRule => ({ values: res });
const media = (re: RegExp): FeatureRule => ({ mediaFeatures: [re] });
const removeInput = (type: string): FeatureRule => ({
  removeElements: [`input[type="${type}"]`],
});
const unwrap = (...tags: string[]): FeatureRule => ({ unwrapElements: tags });
const image = (spec: ImageSpec): FeatureRule => ({ images: [spec] });
const attr = (...names: string[]): FeatureRule => ({ attributes: names });

/** Splits a selector on combinators outside brackets/parens, for the combinator tests below. */
const hasCombinator = (sel: string, ch: string) =>
  new RegExp(`\\s*\\${ch}\\s*`).test(sel.replace(/\([^)]*\)|\[[^\]]*\]/g, ""));

export const FEATURE_RULES: Record<string, FeatureRule> = {
  // ---- at-rules -------------------------------------------------------
  "css-at-font-face": { atRules: ["font-face"] },
  "css-at-import": { atRules: ["import"] },
  "css-at-keyframes": { atRules: ["keyframes"] },
  "css-at-supports": { atRules: ["supports"] },
  "css-at-media-device-pixel-ratio": media(/device-pixel-ratio|resolution/i),
  "css-at-media-hover": media(/\bhover\b/i),
  "css-at-media-orientation": media(/\borientation\b/i),
  "css-at-media-prefers-color-scheme": media(/prefers-color-scheme/i),
  "css-at-media-prefers-reduced-motion": media(/prefers-reduced-motion/i),
  "css-nesting": { nesting: true },

  // ---- properties -----------------------------------------------------
  "css-accent-color": prop("accent-color"),
  "css-align-items": prop("align-items"),
  "css-animation": props(/^animation(?:-.+)?$/),
  "css-aspect-ratio": prop("aspect-ratio"),
  "css-backdrop-filter": prop("backdrop-filter"),
  "css-background-blend-mode": prop("background-blend-mode"),
  "css-background-clip": prop("background-clip"),
  "css-background-origin": prop("background-origin"),
  "css-block-inline-size": props(/^(?:block|inline)-size$/),
  "css-border-image": props(/^border-image(?:-.+)?$/),
  "css-border-inline-block": props(/^border-(?:inline|block)(?:-(?:start|end))?$/),
  "css-border-inline-block-individual": props(
    /^border-(?:inline|block)(?:-(?:start|end))?-(?:color|style|width)$/,
  ),
  "css-border-inline-block-longhand": props(
    /^border-(?:inline|block)-(?:start|end)-(?:color|style|width)$/,
  ),
  "css-border-radius-logical": props(/^border-(?:start|end)-(?:start|end)-radius$/),
  "css-box-shadow": prop("box-shadow"),
  "css-box-sizing": prop("box-sizing"),
  "css-clip-path": prop("clip-path"),
  "css-color-scheme": prop("color-scheme"),
  "css-column-count": prop("column-count"),
  "css-column-layout-properties": props(/^column-(?!count$).+$/, /^columns$/),
  "css-cursor": prop("cursor"),
  "css-filter": prop("filter"),
  "css-flex-direction": props(/^flex-(?:direction|flow)$/),
  "css-flex-wrap": props(/^flex-wrap$/),
  "css-font-kerning": prop("font-kerning"),
  "css-font-stretch": prop("font-stretch"),
  "css-gap": props(/^(?:grid-)?(?:row-|column-)?gap$/),
  "css-grid-template": props(/^grid-template(?:-.+)?$/),
  "css-height": prop("height"),
  "css-hyphenate-character": prop("hyphenate-character"),
  "css-hyphenate-limit-chars": prop("hyphenate-limit-chars"),
  "css-hyphens": prop("hyphens"),
  "css-inline-size": prop("inline-size"),
  "css-inset": props(/^inset(?:-.+)?$/),
  "css-justify-content": prop("justify-content"),
  "css-left-right-top-bottom": props(/^(?:top|right|bottom|left)$/),
  "css-list-style-image": prop("list-style-image"),
  "css-margin-block-start-end": props(/^margin-block-(?:start|end)$/),
  "css-margin-inline-block": props(/^margin-(?:inline|block)$/),
  "css-margin-inline-start-end": props(/^margin-inline-(?:start|end)$/),
  "css-mask-image": props(/^mask(?:-.+)?$/),
  "css-max-block-size": prop("max-block-size"),
  "css-max-inline-size": prop("max-inline-size"),
  "css-min-block-size": prop("min-block-size"),
  "css-min-inline-size": prop("min-inline-size"),
  "css-mix-blend-mode": prop("mix-blend-mode"),
  "css-object-fit": prop("object-fit"),
  "css-object-position": prop("object-position"),
  "css-orphans": prop("orphans"),
  "css-outline-offset": prop("outline-offset"),
  "css-overflow-wrap": prop("overflow-wrap"),
  "css-padding-block-start-end": props(/^padding-block-(?:start|end)$/),
  "css-padding-inline-block": props(/^padding-(?:inline|block)$/),
  "css-padding-inline-start-end": props(/^padding-inline-(?:start|end)$/),
  "css-position": props(/^(?:position|behavior|-moz-binding)$/),
  "css-resize": prop("resize"),
  "css-scroll-snap": props(/^scroll-snap(?:-.+)?$/),
  "css-shape-margin": prop("shape-margin"),
  "css-shape-outside": prop("shape-outside"),
  "css-tab-size": prop("tab-size"),
  "css-text-align-last": prop("text-align-last"),
  "css-text-decoration-skip-ink": prop("text-decoration-skip-ink"),
  "css-text-decoration-thickness": prop("text-decoration-thickness"),
  "css-text-emphasis": props(/^text-emphasis(?:-(?!position$).+)?$/),
  "css-text-emphasis-position": prop("text-emphasis-position"),
  "css-text-orientation": prop("text-orientation"),
  "css-text-overflow": prop("text-overflow"),
  "css-text-shadow": prop("text-shadow"),
  "css-text-underline-offset": prop("text-underline-offset"),
  "css-text-underline-position": prop("text-underline-position"),
  "css-text-wrap": prop("text-wrap"),
  "css-transform": props(/^transform(?:-.+)?$/),
  "css-transition": props(/^transition(?:-.+)?$/),
  "css-user-select": prop("user-select"),
  "css-visibility": prop("visibility"),
  "css-white-space-collapse": prop("white-space-collapse"),
  "css-widows": prop("widows"),
  "css-word-break": prop("word-break"),
  "css-writing-mode": prop("writing-mode"),
  "css-z-index": prop("z-index"),

  // ---- values ---------------------------------------------------------
  "css-conic-gradient": val(/\b(?:repeating-)?conic-gradient\(/i),
  "css-linear-gradient": val(/\b(?:repeating-)?linear-gradient\(/i),
  "css-radial-gradient": val(/\b(?:repeating-)?radial-gradient\(/i),
  "css-function-clamp": val(/(?<![\w-])clamp\(/i),
  "css-function-max": val(/(?<![\w-])max\(/i),
  "css-function-min": val(/(?<![\w-])min\(/i),
  "css-function-light-dark": val(/\blight-dark\(/i),
  "css-intrinsic-size": val(/\b(?:fit|min|max)-content\b/i),
  "css-modern-color": val(
    /\b(?:oklch|oklab|lab|lch|hwb|color-mix|color)\(/i,
    /\b(?:rgba?|hsla?)\([^)]*\//i,
  ),
  "css-unit-calc": val(/(?<![\w-])calc\(/i),
  "css-unit-ch": val(/\d\s*ch\b/i),
  "css-unit-initial": val(/\binitial\b/i),
  "css-unit-rem": val(/\d\s*rem\b/i),
  "css-unit-vh": val(/\d\s*vh\b/i),
  "css-unit-vw": val(/\d\s*vw\b/i),
  "css-unit-vmax": val(/\d\s*vmax\b/i),
  "css-unit-vmin": val(/\d\s*vmin\b/i),
  "css-variables": { properties: [/^--.+$/] },

  // ---- selectors ------------------------------------------------------
  "css-pseudo-class-active": pseudo("active"),
  "css-pseudo-class-checked": pseudo("checked"),
  "css-pseudo-class-default": pseudo("default"),
  "css-pseudo-class-first-child": pseudo("first-child"),
  "css-pseudo-class-first-of-type": pseudo("first-of-type"),
  "css-pseudo-class-focus": pseudo("focus"),
  "css-pseudo-class-focus-visible": pseudo("focus-visible"),
  "css-pseudo-class-focus-within": pseudo("focus-within"),
  "css-pseudo-class-has": pseudo("has"),
  "css-pseudo-class-hover": pseudo("hover"),
  "css-pseudo-class-lang": pseudo("lang"),
  "css-pseudo-class-last-child": pseudo("last-child"),
  "css-pseudo-class-last-of-type": pseudo("last-of-type"),
  "css-pseudo-class-link": pseudo("link"),
  "css-pseudo-class-not": pseudo("not"),
  "css-pseudo-class-nth-child": pseudo("nth-child"),
  "css-pseudo-class-nth-last-child": pseudo("nth-last-child"),
  "css-pseudo-class-nth-last-of-type": pseudo("nth-last-of-type"),
  "css-pseudo-class-nth-of-type": pseudo("nth-of-type"),
  "css-pseudo-class-only-child": pseudo("only-child"),
  "css-pseudo-class-only-of-type": pseudo("only-of-type"),
  "css-pseudo-class-target": pseudo("target"),
  "css-pseudo-class-visited": pseudo("visited"),
  "css-pseudo-element-after": { selectors: [/::?after(?![\w-])/i] },
  "css-pseudo-element-before": { selectors: [/::?before(?![\w-])/i] },
  "css-pseudo-element-first-letter": { selectors: [/::?first-letter(?![\w-])/i] },
  "css-pseudo-element-first-line": { selectors: [/::?first-line(?![\w-])/i] },
  "css-pseudo-element-marker": { selectors: [/::marker(?![\w-])/i] },
  "css-pseudo-element-placeholder": { selectors: [/::?(?:-\w+-)?placeholder/i] },
  "css-selector-adjacent-sibling": {
    selectors: [{ test: (s) => hasCombinator(s, "+") }],
  },
  "css-selector-attribute": { selectors: [/\[[^\]]+\]/] },
  "css-selector-chaining": { selectors: [/(?:\.[\w-]+){2,}|[\w\]]#[\w-]+|#[\w-]+\.[\w-]+/] },
  "css-selector-child": { selectors: [{ test: (s) => hasCombinator(s, ">") }] },
  "css-selector-class": { selectors: [/\.[a-zA-Z_-]/] },
  "css-selector-descendant": {
    selectors: [{ test: (s) => /\S\s+[^\s>+~]/.test(s.replace(/\s*[>+~]\s*/g, ">")) }],
  },
  "css-selector-general-sibling": { selectors: [{ test: (s) => hasCombinator(s, "~") }] },
  "css-selector-grouping": { selectorLists: [(list) => list.length > 1] },
  "css-selector-id": { selectors: [/#[a-zA-Z_-]/] },
  "css-selector-type": { selectors: [/(?:^|[\s>+~(])[a-zA-Z][\w-]*/] },
  "css-selector-universal": { selectors: [/(?:^|[\s>+~(])\*/] },

  // ---- html -----------------------------------------------------------
  "html-abbr": unwrap("abbr"),
  "html-acronym": unwrap("acronym"),
  "html-aria-describedby": attr("aria-describedby"),
  "html-aria-hidden": attr("aria-hidden"),
  "html-aria-label": attr("aria-label"),
  "html-aria-labelledby": attr("aria-labelledby"),
  "html-aria-live": attr("aria-live"),
  "html-audio": { removeElements: ["audio"] },
  "html-bdi": unwrap("bdi"),
  "html-body": { bodyAttributes: ["style", "class", "bgcolor", "background"] },
  "html-button-reset": { removeElements: ['button[type="reset"]'] },
  "html-button-submit": { removeElements: ['button[type="submit"]', "button:not([type])"] },
  "html-command-attribute": attr("command", "commandfor"),
  "html-dialog": { removeElements: ["dialog"] },
  "html-form": unwrap("form"),
  "html-hidden": attr("hidden"),
  "html-inert-attribute": attr("inert"),
  "css-inert-attribute": attr("inert"),
  "html-input-checkbox": removeInput("checkbox"),
  "html-input-hidden": removeInput("hidden"),
  "html-input-radio": removeInput("radio"),
  "html-input-reset": removeInput("reset"),
  "html-input-submit": removeInput("submit"),
  "html-input-text": removeInput("text"),
  "html-link": { removeElements: ["link"] },
  "html-loading-attribute": attr("loading"),
  "html-marquee": { removeElements: ["marquee"] },
  "html-meta-color-scheme": {
    removeElements: ['meta[name="color-scheme"]', 'meta[name="supported-color-schemes"]'],
  },
  "html-meter": { removeElements: ["meter"] },
  "html-object": { removeElements: ["object"] },
  "html-picture": { removeElements: ["source"], unwrapElements: ["picture"] },
  "html-popover": attr("popover", "popovertarget", "popovertargetaction"),
  "html-progress": { removeElements: ["progress"] },
  "html-required": attr("required"),
  "html-rp": unwrap("rp"),
  "html-rt": unwrap("rt"),
  "html-ruby": unwrap("ruby"),
  "html-semantics": unwrap(
    "header",
    "footer",
    "nav",
    "main",
    "section",
    "article",
    "aside",
    "figure",
    "figcaption",
  ),
  "html-srcset": attr("srcset"),
  "html-svg": { removeElements: ["svg"] },
  "html-target": attr("target"),
  "html-video": { removeElements: ["video"] },

  // ---- image formats --------------------------------------------------
  "image-apng": image({ extensions: ["apng"], mimeTypes: ["image/apng"] }),
  "image-avif": image({ extensions: ["avif"], mimeTypes: ["image/avif"] }),
  "image-base64": image({ dataUri: true }),
  "image-bmp": image({ extensions: ["bmp"], mimeTypes: ["image/bmp"] }),
  "image-gif": image({ extensions: ["gif"], mimeTypes: ["image/gif"] }),
  "image-hdr": image({ extensions: ["hdr"], mimeTypes: ["image/vnd.radiance"] }),
  "image-heif": image({
    extensions: ["heif", "heic"],
    mimeTypes: ["image/heif", "image/heic"],
  }),
  "image-ico": image({
    extensions: ["ico"],
    mimeTypes: ["image/x-icon", "image/vnd.microsoft.icon"],
  }),
  "image-jpg": image({ extensions: ["jpg", "jpeg"], mimeTypes: ["image/jpeg"] }),
  "image-mp4": image({ extensions: ["mp4"], mimeTypes: ["video/mp4"] }),
  "image-png": image({ extensions: ["png"], mimeTypes: ["image/png"] }),
  "image-svg": image({ extensions: ["svg"], mimeTypes: ["image/svg+xml"] }),
  "image-tiff": image({ extensions: ["tif", "tiff"], mimeTypes: ["image/tiff"] }),
  "image-webp": image({ extensions: ["webp"], mimeTypes: ["image/webp"] }),
};

/** HTML-side operations aggregated from a set of feature rules. */
export interface HtmlOps {
  removeElements: string[];
  unwrapElements: string[];
  attributes: string[];
  bodyAttributes: string[];
  images: ImageSpec[];
}

export interface ClientPolicy {
  css: CssPolicy;
  html: HtmlOps;
  /** Unsupported feature slugs that have no entry in FEATURE_RULES. */
  unmodelled: string[];
}

const VENDOR_PREFIX = /^-(?:webkit|moz|ms|o)-/;

/** Builds the CSS + HTML policy for a client from the slugs it does not support. */
export function buildClientPolicy(unsupported: string[]): ClientPolicy {
  const rules: FeatureRule[] = [];
  const unmodelled: string[] = [];
  for (const slug of unsupported) {
    const rule = FEATURE_RULES[slug];
    if (rule) rules.push(rule);
    else unmodelled.push(slug);
  }
  const all = <K extends keyof FeatureRule>(key: K) =>
    rules.flatMap((r) => (r[key] as unknown[] | undefined) ?? []);

  const properties = all("properties") as RegExp[];
  const values = all("values") as RegExp[];
  const selectors = all("selectors") as Matcher[];
  const selectorLists = all("selectorLists") as ((s: string[]) => boolean)[];
  const atRules = new Set(all("atRules") as string[]);
  const mediaFeatures = all("mediaFeatures") as RegExp[];

  const css: CssPolicy = {
    dropDeclaration(prop, value) {
      const name = prop.replace(VENDOR_PREFIX, "");
      return properties.some((re) => re.test(name)) || values.some((re) => re.test(value));
    },
    dropSelector: (selector) => selectors.some((re) => re.test(selector)),
    dropSelectorList: (list) => selectorLists.some((fn) => fn(list)),
    dropAtRule: (name, prelude) =>
      atRules.has(name) || (name === "media" && mediaFeatures.some((re) => re.test(prelude))),
    dropNesting: rules.some((r) => r.nesting),
  };

  return {
    css,
    html: {
      removeElements: all("removeElements") as string[],
      unwrapElements: all("unwrapElements") as string[],
      attributes: all("attributes") as string[],
      bodyAttributes: all("bodyAttributes") as string[],
      images: all("images") as ImageSpec[],
    },
    unmodelled,
  };
}
