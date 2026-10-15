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

describe("gmail-desktop@v1 process() - Can I Email derived rules", () => {
  const run = (html: string) => create().process(html, conditions);

  it("does not mistake background-position for position", async () => {
    const out = await run(
      '<div style="background-position: center; position: absolute; color: red"></div>',
    );
    expect(out).toContain("background-position: center");
    expect(out).not.toMatch(/(?<![-\w])position:\s*absolute/);
  });

  it("drops unsupported selectors but keeps hover rules", async () => {
    const out = await run(
      "<style>li:first-child { color: red } a::before { content: 'x' } a:hover { color: blue }</style>",
    );
    expect(out).not.toContain("first-child");
    expect(out).not.toContain("::before");
    expect(out).toContain("a:hover");
  });

  it("drops @supports, @keyframes and unsupported @media but keeps width queries", async () => {
    const out = await run(
      "<style>@supports (display:grid){.a{color:red}} @keyframes k{from{opacity:0}} " +
        "@media (prefers-color-scheme: dark){.b{color:red}} @media (max-width:600px){.c{color:green}}</style>",
    );
    expect(out).not.toContain("@supports");
    expect(out).not.toContain("@keyframes");
    expect(out).not.toContain("prefers-color-scheme");
    expect(out).toContain("@media (max-width:600px)");
    expect(out).toMatch(/color:\s*green/);
  });

  it("drops custom property declarations and modern colour functions", async () => {
    const out = await run(
      '<div style="--x: 1px; color: oklch(0.6 0.2 25); background: #fff; flex-direction: column"></div>',
    );
    expect(out).not.toContain("--x");
    expect(out).not.toContain("oklch");
    expect(out).not.toContain("flex-direction");
    expect(out).toContain("background: #fff");
  });

  it("removes svg/video elements and strips unsupported attributes", async () => {
    const out = await run(
      '<svg><rect/></svg><video src="a.mp4"></video><a href="#" target="_blank" hidden>x</a>',
    );
    expect(out).not.toContain("<svg");
    expect(out).not.toContain("<video");
    expect(out).not.toContain("target=");
    expect(out).not.toContain("hidden");
  });
});
