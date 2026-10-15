import { describe, expect, it } from "vitest";
import { sanitizeInlineStyle, sanitizeStylesheet, type CssPolicy } from "../src/emailCss.js";

const policy: CssPolicy = {
  dropDeclaration: (prop) => prop === "position" || prop === "--x",
  dropSelector: (sel) => sel.includes(":first-child"),
  dropAtRule: (name) => name === "keyframes" || name === "import",
  dropNesting: true,
};

describe("sanitizeInlineStyle", () => {
  it("matches whole property names only", () => {
    expect(
      sanitizeInlineStyle("background-position: top; position: fixed; color: red", policy),
    ).toBe("background-position: top; color: red");
  });

  it("does not split on semicolons inside url() or strings", () => {
    const style = "background: url(data:image/png;base64,AAA); content: 'a;b'; position: x";
    expect(sanitizeInlineStyle(style, policy)).toBe(
      "background: url(data:image/png;base64,AAA); content: 'a;b'",
    );
  });
});

describe("sanitizeStylesheet", () => {
  it("drops whole rules when any selector in the list is dropped", () => {
    const out = sanitizeStylesheet(".a, li:first-child { color: red } .b { color: blue }", policy);
    expect(out).not.toContain(".a");
    expect(out).toContain(".b");
  });

  it("drops at-rules and recurses into @media", () => {
    const out = sanitizeStylesheet(
      '@import url("x.css"); @keyframes k { from { top: 0 } } @media (max-width: 1px) { .a { position: absolute; color: red } }',
      policy,
    );
    expect(out).not.toContain("@import");
    expect(out).not.toContain("@keyframes");
    expect(out).toContain("@media (max-width: 1px)");
    expect(out).toContain("color: red");
    expect(out).not.toContain("position");
  });

  it("removes nested rules but keeps the parent's declarations", () => {
    const out = sanitizeStylesheet(".p { color: red; & .c { color: blue } }", policy);
    expect(out).toContain("color: red");
    expect(out).not.toContain(".c");
  });

  it("ignores comments", () => {
    expect(sanitizeStylesheet("/* a { b } */ .x { color: red }", policy)).toContain(".x");
  });
});
