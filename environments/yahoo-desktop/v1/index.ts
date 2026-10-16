/**
 * yahoo-desktop@v1
 *
 * Yahoo Mail web interface on desktop. Rendered with real Chromium; the client's HTML/CSS stripping is derived
 * from Can I Email's yahoo / desktop-webmail data (see src/webmailEnvironment.ts).
 */
import { createWebmailEnvironment } from "../../../src/webmailEnvironment.js";
import type { SeamailEnvironment } from "../../../src/types.js";

export function create(): SeamailEnvironment {
  return createWebmailEnvironment({
    key: "yahoo-desktop",
    client: "yahoo",
    platform: "desktop",
    description:
      "Yahoo Mail web interface on desktop. Real Chromium rendering with sanitisation derived from Can I Email data.",
  });
}
