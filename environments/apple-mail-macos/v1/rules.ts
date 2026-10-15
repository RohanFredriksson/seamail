/**
 * Apple Mail (macOS) rules, as data. Apple Mail is WebKit and passes almost
 * everything through; the few exceptions below come from Can I Email's
 * recent (2024+) test results for apple-mail / macos. Older "n" results
 * (macOS 10.15 / 12.4 era) are deliberately NOT modelled: this environment
 * renders with a current WebKit, which supports those features, and the
 * conformance tool lists them in known-exceptions.json instead.
 */
import type { CssPolicy } from "../../../src/emailCss.js";

const STRIPPED_PROPERTIES = new Set(["hyphenate-limit-chars", "text-justify"]);

export const APPLE_MAIL_CSS_POLICY: CssPolicy = {
  dropDeclaration: (prop) => STRIPPED_PROPERTIES.has(prop.replace(/^-webkit-/, "")),
};
