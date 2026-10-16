/**
 * gmail-desktop@v1
 *
 * Models Gmail's web interface on desktop. Gmail renders in whatever
 * browser the user has open, so the underlying engine (Chromium) is
 * genuinely representative. What is simulated is Gmail's server-side
 * sanitisation, derived from Can I Email's gmail / desktop-webmail data
 * (see src/webmailEnvironment.ts).
 */
import { createWebmailEnvironment } from "../../../src/webmailEnvironment.js";
import type { SeamailEnvironment } from "../../../src/types.js";

export function create(): SeamailEnvironment {
  return createWebmailEnvironment({
    key: "gmail-desktop",
    client: "gmail",
    platform: "desktop",
    description:
      "Gmail web interface on desktop. Real Chromium/Blink rendering engine " +
      "with Gmail's HTML/CSS sanitisation derived from Can I Email data.",
  });
}
