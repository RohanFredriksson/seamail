/**
 * Level 2 "environment test": apple-mail-macos@v1 claims near-zero
 * sanitisation, so process() must be an identity transform.
 */
import { describe, expect, it } from "vitest";
import { create } from "../../environments/apple-mail-macos/v1/index.js";
import type { RenderConditions } from "../../src/types.js";

const conditions: RenderConditions = { colorScheme: "light", imagesEnabled: true };

describe("apple-mail-macos@v1 process()", () => {
  it("passes HTML through unchanged", async () => {
    const env = create();
    const html =
      "<html><head><style>.a{position:absolute;}</style></head>" +
      "<body><script>alert(1)</script><svg></svg></body></html>";
    const out = await env.process(html, conditions);
    expect(out).toBe(html);
  });
});
