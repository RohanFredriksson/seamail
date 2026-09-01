/**
 * Level 2 "environment test": verifies outlook-classic@v1's declared Word
 * engine limitations are actually applied by process(), independent of any
 * browser render.
 */
import { describe, expect, it } from "vitest";
import { create } from "../../environments/outlook-classic/v1/index.js";
import type { RenderConditions } from "../../src/types.js";

const conditions: RenderConditions = { colorScheme: "light", imagesEnabled: true };

describe("outlook-classic@v1 process()", () => {
  it("strips flexbox/grid/border-radius/background-image declarations", async () => {
    const env = create();
    const out = await env.process(
      "<html><head><style>.a { display: flex; display: grid; border-radius: 4px; " +
        "background-image: url(x.png); color: red; }</style></head><body></body></html>",
      conditions,
    );
    expect(out).not.toMatch(/display\s*:\s*flex/);
    expect(out).not.toMatch(/display\s*:\s*grid/);
    expect(out).not.toContain("border-radius");
    expect(out).not.toContain("background-image");
    expect(out).toContain("color: red");
  });

  it("strips @media blocks entirely", async () => {
    const env = create();
    const out = await env.process(
      "<html><head><style>.a{color:red;}@media (max-width:600px){.a{color:blue;}}</style></head>" +
        "<body></body></html>",
      conditions,
    );
    expect(out).not.toContain("@media");
    expect(out).not.toContain("color:blue");
    expect(out).toContain("color:red");
  });

  it("strips @font-face blocks", async () => {
    const env = create();
    const out = await env.process(
      '<html><head><style>@font-face{font-family:"Foo";src:url(x.woff);}.a{color:red;}</style>' +
        "</head><body></body></html>",
      conditions,
    );
    expect(out).not.toContain("@font-face");
    expect(out).toContain("color:red");
  });

  it("replaces inline SVG with a visible placeholder", async () => {
    const env = create();
    const out = await env.process(
      '<html><body><svg><circle r="5"/></svg></body></html>',
      conditions,
    );
    expect(out).not.toContain("<svg");
    expect(out).toContain("[svg unsupported]");
  });

  it("constrains the body to a fixed reading-pane width", async () => {
    const env = create();
    const out = await env.process("<html><body>hi</body></html>", conditions);
    expect(out).toMatch(/max-width:600px/);
  });

  it("reveals [if mso] conditional comment content", async () => {
    const env = create();
    const out = await env.process(
      "<html><body><!--[if mso]><p>mso only</p><![endif]--></body></html>",
      conditions,
    );
    expect(out).toContain("mso only");
  });

  it("reveals [if gte mso 9] conditional comment content", async () => {
    const env = create();
    const out = await env.process(
      "<html><body><!--[if gte mso 9]><p>mso 9+</p><![endif]--></body></html>",
      conditions,
    );
    expect(out).toContain("mso 9+");
  });

  it("strips [if !mso] conditional comment content (plain form)", async () => {
    const env = create();
    const out = await env.process(
      "<html><body><!--[if !mso]><p>not mso</p><![endif]--></body></html>",
      conditions,
    );
    expect(out).not.toContain("not mso");
  });

  it("strips [if !mso] content wrapped in the downlevel-revealed <!--> trick", async () => {
    const env = create();
    const out = await env.process(
      "<html><body><!--[if !mso]><!--><p>not mso</p><!--<![endif]--></body></html>",
      conditions,
    );
    expect(out).not.toContain("not mso");
  });

  it("approximates a v:roundrect bulletproof button as a rounded, filled link", async () => {
    const env = create();
    const out = await env.process(
      '<html><body><!--[if mso]>' +
        '<v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" href="https://example.com" ' +
        'style="height:40px;width:200px;" arcsize="10%" fillcolor="#2575fc" strokecolor="#2575fc">' +
        '<w:anchorlock/><center>Shop now</center></v:roundrect><![endif]-->' +
        "</body></html>",
      conditions,
    );
    expect(out).toContain("Shop now");
    expect(out).toContain('href="https://example.com"');
    expect(out).toMatch(/background-color:#2575fc/);
    expect(out).toMatch(/border-radius:4px/);
    expect(out).not.toContain("v:roundrect");
  });

  it("approximates a v:rect + v:fill VML background as a plain background-image div", async () => {
    const env = create();
    const out = await env.process(
      '<html><body><!--[if mso]>' +
        '<v:rect xmlns:v="urn:schemas-microsoft-com:vml" style="width:600px;height:200px;">' +
        '<v:fill type="tile" src="https://example.com/bg.png" color="#6a11cb"/>' +
        '<v:textbox inset="0,0,0,0"><p>Overlay text</p></v:textbox>' +
        "</v:rect><![endif]-->" +
        "</body></html>",
      conditions,
    );
    expect(out).toContain("Overlay text");
    expect(out).toMatch(/background-image:url\(https:\/\/example\.com\/bg\.png\)/);
    expect(out).not.toContain("v:rect");
    expect(out).not.toContain("v:fill");
  });

  it("unwraps unrecognised VML/Word tags while keeping their content", async () => {
    const env = create();
    const out = await env.process(
      '<html><body><!--[if mso]><v:shape><v:textbox><p>fallback text</p></v:textbox></v:shape><![endif]--></body></html>',
      conditions,
    );
    expect(out).toContain("fallback text");
    expect(out).not.toMatch(/<\/?v:/);
    expect(out).not.toMatch(/<\/?w:/);
  });
});
