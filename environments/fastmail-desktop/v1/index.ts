/**
 * fastmail-desktop@v1
 *
 * Fastmail web interface on desktop. Rendered with real Chromium; the client's HTML/CSS stripping is derived
 * from Can I Email's fastmail / desktop-webmail data (see src/webmailEnvironment.ts).
 */
import { createWebmailEnvironment } from "../../../src/webmailEnvironment.js";
import type { SeamailEnvironment } from "../../../src/types.js";

export function create(): SeamailEnvironment {
  return createWebmailEnvironment({
    key: "fastmail-desktop",
    client: "fastmail",
    platform: "desktop",
    description:
      "Fastmail web interface on desktop. Real Chromium rendering with sanitisation derived from Can I Email data.",
  });
}
