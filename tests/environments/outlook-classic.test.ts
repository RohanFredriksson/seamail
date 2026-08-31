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
});
