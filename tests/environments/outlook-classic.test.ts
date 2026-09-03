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

  it("does not strip text-transform (transform regex must not eat it)", async () => {
    const env = create();
    const out = await env.process(
      "<html><head><style>.a{text-transform:uppercase;transform:rotate(5deg);}</style></head>" +
        "<body></body></html>",
      conditions,
    );
    expect(out).toContain("text-transform:uppercase");
    expect(out).not.toMatch(/(?<!text-)transform\s*:\s*rotate/);
  });

  it("strips @keyframes blocks (including nested from/to braces) and animation properties", async () => {
    const env = create();
    const out = await env.process(
      "<html><head><style>@keyframes fade{from{opacity:0;}to{opacity:1;}}" +
        ".a{animation:fade 2s;animation-play-state:running;color:red;}</style></head>" +
        "<body></body></html>",
      conditions,
    );
    expect(out).not.toContain("@keyframes");
    expect(out).not.toContain("animation");
    expect(out).toContain("color:red");
  });

  it("strips accent-color/caption-side/clip-path/filter/mask-image/mix-blend-mode/opacity/outline/text-shadow/text-emphasis/visibility/writing-mode/border-image/inline-block", async () => {
    const env = create();
    const out = await env.process(
      "<html><head><style>.a{" +
        "accent-color:red;caption-side:bottom;clip-path:circle(50%);" +
        "filter:blur(2px);-webkit-filter:blur(2px);mask-image:linear-gradient(black,transparent);" +
        "-webkit-mask-image:linear-gradient(black,transparent);mix-blend-mode:difference;" +
        "opacity:0.5;outline:1px solid red;outline-offset:2px;text-shadow:1px 1px red;" +
        "text-emphasis:filled;-webkit-text-emphasis:filled;visibility:hidden;" +
        "writing-mode:vertical-rl;border-image:linear-gradient(red,blue) 1;" +
        "display:inline-block;color:blue;}</style></head><body></body></html>",
      conditions,
    );
    expect(out).not.toContain("accent-color");
    expect(out).not.toContain("caption-side");
    expect(out).not.toContain("clip-path");
    expect(out).not.toContain("filter");
    expect(out).not.toContain("mask-image");
    expect(out).not.toContain("mix-blend-mode");
    expect(out).not.toContain("opacity");
    expect(out).not.toContain("outline");
    expect(out).not.toContain("text-shadow");
    expect(out).not.toContain("text-emphasis");
    expect(out).not.toContain("visibility");
    expect(out).not.toContain("writing-mode");
    expect(out).not.toContain("border-image");
    expect(out).not.toContain("inline-block");
    expect(out).toContain("color:blue");
  });

  it("keeps a plain single-keyword text-decoration but strips the multi-value shorthand", async () => {
    const env = create();
    const out = await env.process(
      "<html><head><style>.a{text-decoration:underline;}" +
        ".b{text-decoration:underline double #e11d48;}</style></head><body></body></html>",
      conditions,
    );
    expect(out).toMatch(/\.a\{text-decoration:underline;\}/);
    expect(out).not.toContain("double");
    expect(out).not.toContain("#e11d48");
  });

  it("strips gradient/light-dark/oklch/rgba color functions from any value", async () => {
    const env = create();
    const out = await env.process(
      "<html><head><style>" +
        ".a{background:linear-gradient(45deg,red,blue);}" +
        ".b{background:radial-gradient(circle,red,blue);}" +
        ".c{background:conic-gradient(red,blue);}" +
        ".d{background:light-dark(#111,#eee);}" +
        ".e{color:oklch(0.6 0.25 25);}" +
        ".f{background:rgba(37,99,235,0.7);}" +
        ".g{background:#2563eb;}</style></head><body></body></html>",
      conditions,
    );
    expect(out).not.toContain("linear-gradient");
    expect(out).not.toContain("radial-gradient");
    expect(out).not.toContain("conic-gradient");
    expect(out).not.toContain("light-dark");
    expect(out).not.toContain("oklch");
    expect(out).not.toContain("rgba");
    expect(out).toContain("background:#2563eb");
  });

  it("strips CSS logical box-model properties (block/inline axis)", async () => {
    const env = create();
    const out = await env.process(
      "<html><head><style>.a{" +
        "block-size:60px;inline-size:180px;max-inline-size:140px;min-block-size:70px;" +
        "border-block-start:3px solid red;border-inline:3px solid blue;" +
        "margin-inline:30px;margin-block-start:20px;" +
        "padding-inline-start:35px;padding-block:20px;" +
        "inset:10px 20px;inset-inline-start:40px;" +
        "border-start-start-radius:16px;border-end-end-radius:16px;" +
        "color:green;}</style></head><body></body></html>",
      conditions,
    );
    expect(out).not.toMatch(/block-size/);
    expect(out).not.toMatch(/border-(?:block|inline)/);
    expect(out).not.toMatch(/margin-(?:block|inline)/);
    expect(out).not.toMatch(/padding-(?:block|inline)/);
    expect(out).not.toMatch(/\binset\b/);
    expect(out).not.toMatch(/border-(?:start|end)-(?:start|end)-radius/);
    expect(out).toContain("color:green");
  });

  it("strips CSS custom property declarations and var() references", async () => {
    const env = create();
    const out = await env.process(
      "<html><head><style>:root{--main-color:#2563eb;}" +
        ".a{background:var(--main-color);color:#fff;}</style></head><body></body></html>",
      conditions,
    );
    expect(out).not.toContain("--main-color");
    expect(out).not.toContain("var(");
    expect(out).toContain("color:#fff");
  });

  it("removes inline SVG entirely, leaving no visual trace", async () => {
    const env = create();
    const out = await env.process(
      '<html><body><svg><circle r="5"/></svg></body></html>',
      conditions,
    );
    expect(out).not.toContain("<svg");
    expect(out).not.toContain("svg unsupported");
  });

  it("strips width/height (and min-/max- variants) on plain divs but keeps them on tables/img", async () => {
    const env = create();
    const out = await env.process(
      '<html><body>' +
        '<div style="width:180px;height:60px;min-width:10px;max-width:150px;border:1px solid #000;">div</div>' +
        '<table style="width:300px;"><tr><td style="width:50px;">cell</td></tr></table>' +
        '<img src="x.png" style="width:100px;height:80px;"/>' +
        "</body></html>",
      conditions,
    );
    expect(out).not.toMatch(/div"[^>]*width/);
    expect(out).toMatch(/border:1px solid #000/);
    expect(out).toMatch(/table[^>]*style="width:300px/);
    expect(out).toMatch(/td[^>]*style="width:50px/);
    expect(out).toMatch(/img[^>]*style="width:100px;height:80px/);
  });

  it("drops the ENTIRE inline style attribute for display:flex or position:absolute/relative elements", async () => {
    const env = create();
    const out = await env.process(
      '<html><body>' +
        '<div style="display:flex;background:#f1f5f9;padding:10px;">flex</div>' +
        '<div style="position:relative;width:200px;background:#f1f5f9;">' +
        '<div style="position:absolute;top:10px;left:30px;background:#2563eb;">abs</div>' +
        "</div>" +
        "</body></html>",
      conditions,
    );
    expect(out).not.toContain("background:#f1f5f9");
    expect(out).not.toContain("background:#2563eb");
    expect(out).not.toContain('style=""');
  });

  it("only applies <style> rules whose selector is a single simple type/class/ID selector", async () => {
    const env = create();
    const out = await env.process(
      "<html><head><style>" +
        "h1{color:red;}" +
        ".foo{color:blue;}" +
        "#bar{color:green;}" +
        "h1+p{color:purple;}" +
        ".a.b{color:orange;}" +
        "p:first-child{color:brown;}" +
        "[data-x]{color:pink;}" +
        "*{border:1px solid black;}" +
        "</style></head><body></body></html>",
      conditions,
    );
    expect(out).toContain("h1{color:red;}");
    expect(out).toContain(".foo{color:blue;}");
    expect(out).toContain("#bar{color:green;}");
    expect(out).not.toContain("purple");
    expect(out).not.toContain("orange");
    expect(out).not.toContain("brown");
    expect(out).not.toContain("pink");
    expect(out).not.toContain("border:1px solid black");
  });

  it("strips native CSS nesting blocks, keeping the parent's own flat declarations", async () => {
    const env = create();
    const out = await env.process(
      "<html><head><style>.parent{background:#f1f5f9;padding:10px;&.child{background:#e11d48;}}" +
        "</style></head><body></body></html>",
      conditions,
    );
    expect(out).toContain("background:#f1f5f9");
    expect(out).not.toContain("#e11d48");
  });

  it("forces HTML5 semantic sectioning elements to display:inline", async () => {
    const env = create();
    const out = await env.process(
      "<html><body><header>Header</header><article>Article</article></body></html>",
      conditions,
    );
    expect(out).toMatch(/<header[^>]*style="[^"]*display:inline/);
    expect(out).toMatch(/<article[^>]*style="[^"]*display:inline/);
  });

  it("does not override display on a semantic element that already sets one", async () => {
    const env = create();
    const out = await env.process(
      '<html><body><section style="display:block">Section</section></body></html>',
      conditions,
    );
    expect(out).toMatch(/display:block/);
    expect(out).not.toMatch(/display:block[^"]*display:inline/);
  });

  it("strips the hidden attribute so content renders normally", async () => {
    const env = create();
    const out = await env.process(
      "<html><body><div hidden>Secret</div></body></html>",
      conditions,
    );
    expect(out).not.toContain("hidden");
    expect(out).toContain("Secret");
  });

  it("simulates form controls the way real Outlook renders them", async () => {
    const env = create();
    const out = await env.process(
      "<html><body>" +
        '<button style="background:blue;">Click me</button>' +
        '<input type="submit" value="Send"/>' +
        '<input type="reset"/>' +
        '<input type="checkbox" checked/>' +
        '<input type="checkbox"/>' +
        '<input type="radio" checked/>' +
        '<input type="text" value="Sample" style="border:1px solid #000;"/>' +
        '<textarea>Some content</textarea>' +
        "<select><option>A</option><option selected>B</option></select>" +
        "</body></html>",
      conditions,
    );
    expect(out).toContain("Click me");
    expect(out).not.toContain("<button");
    expect(out).toContain("[Send]");
    expect(out).toContain("[Reset]");
    expect(out).toContain("[X]");
    expect(out).toContain("[ ]");
    expect(out).toContain("(X)");
    expect(out).toContain("Sample");
    expect(out).not.toContain("<input");
    expect(out).not.toContain("<textarea");
    expect(out).not.toContain("Some content");
    expect(out).toContain("[B \u2228]");
    expect(out).not.toContain("<select");
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
      "<html><body><!--[if mso]>" +
        '<v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" href="https://example.com" ' +
        'style="height:40px;width:200px;" arcsize="10%" fillcolor="#2575fc" strokecolor="#2575fc">' +
        "<w:anchorlock/><center>Shop now</center></v:roundrect><![endif]-->" +
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
      "<html><body><!--[if mso]>" +
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
      "<html><body><!--[if mso]><v:shape><v:textbox><p>fallback text</p></v:textbox></v:shape><![endif]--></body></html>",
      conditions,
    );
    expect(out).toContain("fallback text");
    expect(out).not.toMatch(/<\/?v:/);
    expect(out).not.toMatch(/<\/?w:/);
  });
});
