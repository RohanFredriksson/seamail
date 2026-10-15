/**
 * Gmail (desktop webmail) sanitisation rules, as data.
 *
 * Source of truth: Can I Email's support data for gmail / desktop-webmail
 * (https://www.caniemail.com, MIT) - see tools/client-conformance, which
 * scores these rules against that dataset. Where Can I Email reports a
 * feature as "n" (unsupported) Gmail drops it; "partial" features are
 * treated as supported unless noted.
 */
import type { CssPolicy } from "../../../src/emailCss.js";

const VENDOR_PREFIX = /^-(?:webkit|moz|ms|o)-/;

/** Properties Gmail drops (matched after removing any vendor prefix). */
const UNSUPPORTED_PROPERTIES: RegExp[] = [
  /^(?:position|behavior|-moz-binding)$/,
  /^(?:top|right|bottom|left|inset(?:-.+)?|z-index)$/,
  /^accent-color$/,
  /^align-items$/,
  /^animation(?:-.+)?$/,
  /^aspect-ratio$/,
  /^backdrop-filter$/,
  /^(?:block|inline)-size$/,
  /^(?:min|max)-(?:block|inline)-size$/,
  /^border-image(?:-.+)?$/,
  /^border-(?:inline|block)(?:-.+)?$/,
  /^border-(?:start|end)-(?:start|end)-radius$/,
  /^(?:margin|padding)-(?:inline|block)(?:-.+)?$/,
  /^box-shadow$/,
  /^clip-path$/,
  /^color-scheme$/,
  /^cursor$/,
  /^filter$/,
  /^flex-(?:direction|wrap|flow)$/,
  /^grid-template(?:-.+)?$/,
  /^hyphen(?:s|ate-.+)$/,
  /^justify-content$/,
  /^list-style-image$/,
  /^mask(?:-.+)?$/,
  /^orphans$/,
  /^widows$/,
  /^outline-offset$/,
  /^overflow-wrap$/,
  /^resize$/,
  /^scroll-snap(?:-.+)?$/,
  /^shape-(?:margin|outside)$/,
  /^tab-size$/,
  /^text-decoration-(?:skip-ink|thickness)$/,
  /^text-emphasis-position$/,
  /^text-shadow$/,
  /^text-underline-offset$/,
  /^text-wrap$/,
  /^transform(?:-.+)?$/,
  /^transition(?:-.+)?$/,
  /^user-select$/,
  /^visibility$/,
  /^white-space-collapse$/,
];

/** Values Gmail does not understand, whatever property they appear on. */
const UNSUPPORTED_VALUES: RegExp[] = [
  /\b(?:oklch|oklab|lab|lch|hwb|color-mix|color)\(/i, // modern colour spaces
  /\b(?:rgba?|hsla?)\([^)]*\//i, // slash alpha syntax
  /\blight-dark\(/i,
  /\bconic-gradient\(/i,
];

const UNSUPPORTED_PSEUDO_CLASSES = [
  "active",
  "checked",
  "default",
  "first-child",
  "first-of-type",
  "focus",
  "focus-visible",
  "focus-within",
  "has",
  "lang",
  "last-child",
  "last-of-type",
  "link",
  "not",
  "nth-child",
  "nth-last-child",
  "nth-last-of-type",
  "nth-of-type",
  "only-child",
  "only-of-type",
  "target",
  "visited",
];
const UNSUPPORTED_PSEUDO_ELEMENTS = [
  "after",
  "before",
  "first-letter",
  "first-line",
  "marker",
  "placeholder",
];

const UNSUPPORTED_SELECTOR_RE = new RegExp(
  `::?(?:${[...UNSUPPORTED_PSEUDO_CLASSES, ...UNSUPPORTED_PSEUDO_ELEMENTS].join("|")})(?![\\w-])`,
  "i",
);

/** @media features Gmail ignores (the whole block is dropped). */
const UNSUPPORTED_MEDIA_FEATURE_RE =
  /\b(?:hover|prefers-color-scheme|prefers-reduced-motion|(?:-webkit-)?(?:min-|max-)?device-pixel-ratio|(?:min-|max-)?resolution)\b/i;

export const GMAIL_CSS_POLICY: CssPolicy = {
  dropDeclaration(prop, value) {
    if (prop.startsWith("--")) return true; // custom property declarations
    const name = prop.replace(VENDOR_PREFIX, "");
    if (UNSUPPORTED_PROPERTIES.some((re) => re.test(name))) return true;
    return UNSUPPORTED_VALUES.some((re) => re.test(value));
  },
  dropSelector: (selector) => UNSUPPORTED_SELECTOR_RE.test(selector),
  dropAtRule(name, prelude) {
    switch (name) {
      case "import":
      case "keyframes":
      case "supports":
        return true;
      case "font-face":
        // Roboto / Google Sans work only because Gmail embeds them itself.
        return true;
      case "media":
        return UNSUPPORTED_MEDIA_FEATURE_RE.test(prelude);
      default:
        return false;
    }
  },
  dropNesting: true,
};

/** Elements removed outright, including their content. */
export const REMOVED_ELEMENTS = [
  "audio",
  "video",
  "dialog",
  "meter",
  "progress",
  "object",
  "svg",
  "marquee",
  "link",
  "source",
];

/** Elements whose tags are dropped but whose content survives. */
export const UNWRAPPED_ELEMENTS = ["picture", "ruby", "rt", "rp", "bdi"];

/** Attributes Gmail strips from every element. */
export const STRIPPED_ATTRIBUTES = [
  "aria-describedby",
  "aria-labelledby",
  "command",
  "commandfor",
  "hidden",
  "inert",
  "loading",
  "popover",
  "popovertarget",
  "popovertargetaction",
  "required",
  "srcset",
  "target",
];

/** `<meta name="...">` values Gmail ignores. */
export const REMOVED_META_NAMES = ["color-scheme", "supported-color-schemes"];
