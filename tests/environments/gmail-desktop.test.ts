/**
 * Level 2 "environment test": verifies gmail-desktop@v1's declared HTML/CSS
 * sanitisation behaviour actually holds, independent of any browser render.
 */
import { describe, expect, it } from "vitest";
import { create } from "../../environments/gmail-desktop/v1/index.js";
import type { RenderConditions } from "../../src/types.js";

const conditions: RenderConditions = { colorScheme: "light", imagesEnabled: true };

describe("gmail-desktop@v1 process()", () => {
  it("strips <script> tags", async () => {
    const env = create();
    const out = await env.process(
      "<html><body><script>alert(1)</script></body></html>",
      conditions,
    );
    expect(out).not.toContain("<script");
  });

  it("strips remote stylesheet links", async () => {
    const env = create();
    const out = await env.process(
      '<html><head><link rel="stylesheet" href="https://example.com/x.css"></head><body></body></html>',
      conditions,
    );
    expect(out).not.toContain("stylesheet");
  });

  it("strips unsupported properties from <style> blocks", async () => {
    const env = create();
    const out = await env.process(
      "<html><head><style>.a { position: absolute; color: red; }</style></head><body></body></html>",
      conditions,
    );
    expect(out).not.toContain("position");
    expect(out).toContain("color: red");
  });

  it("strips unsupported properties from inline style attributes", async () => {
    const env = create();
    const out = await env.process(
      '<html><body><div style="behavior:url(x); color: blue;"></div></body></html>',
      conditions,
    );
    expect(out).not.toContain("behavior");
    expect(out).toContain("color: blue");
  });
});
