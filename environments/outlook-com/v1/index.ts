/**
 * outlook-com@v1
 *
 * Outlook.com (Microsoft's webmail). Rendered with real Chromium; the client's HTML/CSS stripping is derived
 * from Can I Email's outlook / outlook-com data (see src/webmailEnvironment.ts).
 */
import { createWebmailEnvironment } from "../../../src/webmailEnvironment.js";
import type { SeamailEnvironment } from "../../../src/types.js";

export function create(): SeamailEnvironment {
  return createWebmailEnvironment({
    key: "outlook-com",
    client: "outlook",
    platform: "web",
    description:
      "Outlook.com (Microsoft's webmail). Real Chromium rendering with sanitisation derived from Can I Email data.",
  });
}
