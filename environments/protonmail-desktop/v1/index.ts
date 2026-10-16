/**
 * protonmail-desktop@v1
 *
 * Proton Mail web interface on desktop. Rendered with real Chromium; the client's HTML/CSS stripping is derived
 * from Can I Email's protonmail / desktop-webmail data (see src/webmailEnvironment.ts).
 */
import { createWebmailEnvironment } from "../../../src/webmailEnvironment.js";
import type { SeamailEnvironment } from "../../../src/types.js";

export function create(): SeamailEnvironment {
  return createWebmailEnvironment({
    key: "protonmail-desktop",
    client: "protonmail",
    platform: "desktop",
    description:
      "Proton Mail web interface on desktop. Real Chromium rendering with sanitisation derived from Can I Email data.",
  });
}
