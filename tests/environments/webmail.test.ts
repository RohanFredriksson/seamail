/**
 * Level 2 tests for the dataset-derived webmail environments (Gmail, Yahoo,
 * Outlook.com, Proton, Fastmail). The strict per-feature scoring lives in
 * tools/client-conformance; these tests keep the catalog and the dataset in sync.
 */
import { describe, expect, it } from "vitest";
import { create as gmail } from "../../environments/gmail-desktop/v1/index.js";
import { create as yahoo } from "../../environments/yahoo-desktop/v1/index.js";
import { create as outlookCom } from "../../environments/outlook-com/v1/index.js";
import { create as proton } from "../../environments/protonmail-desktop/v1/index.js";
import { create as fastmail } from "../../environments/fastmail-desktop/v1/index.js";
import { loadSupport, unsupportedFeatures } from "../../src/clientSupport.js";
import { unmodelledFeatures } from "../../src/webmailEnvironment.js";

const conditions = { colorScheme: "light", imagesEnabled: true } as const;
const KEYS = [
  "gmail-desktop",
  "yahoo-desktop",
  "outlook-com",
  "protonmail-desktop",
  "fastmail-desktop",
];

describe.each(KEYS)("%s catalog coverage", (key) => {
  it("has a stripping rule for every feature the dataset marks unsupported", () => {
    expect(unmodelledFeatures(key)).toEqual([]);
  });

  it("has dataset rows", () => {
    expect(unsupportedFeatures(key).length).toBeGreaterThan(0);
  });
});

describe("dataset", () => {
  it("covers every webmail environment key", () => {
    const f = loadSupport()[0];
    for (const key of KEYS) expect(Object.keys(f.support)).toContain(key);
  });
});

describe("webmail environments process()", () => {
  const html =
    '<html><body><script>1</script><div style="box-shadow:0 0 1px red;color:red">x</div></body></html>';

  it("every client removes <script>", async () => {
    for (const make of [gmail, yahoo, outlookCom, proton, fastmail]) {
      expect(await make().process(html, conditions)).not.toContain("<script");
    }
  });

  it("clients differ where the dataset differs (box-shadow: n for Gmail, y for Fastmail)", async () => {
    expect(await gmail().process(html, conditions)).not.toContain("box-shadow");
    expect(await fastmail().process(html, conditions)).toContain("box-shadow");
  });

  it("derives capabilities from the dataset", () => {
    expect(gmail().capabilities.svg).toBe("unsupported");
    expect(fastmail().capabilities.svg).toBe("unsupported");
    expect(gmail().capabilities.borderRadius).toBe("supported");
  });
});

describe("image format handling", () => {
  const html =
    '<img src="https://x.test/a.apng"><img src="https://x.test/a.png">' +
    '<img src="data:image/png;base64,AAAA">';

  it("Gmail drops apng and base64 images but keeps png", async () => {
    const out = await gmail().process(html, conditions);
    expect(out).not.toContain("a.apng");
    expect(out).not.toContain("data:image");
    expect(out).toContain("a.png");
  });

  it("Fastmail keeps apng and base64 images", async () => {
    const out = await fastmail().process(html, conditions);
    expect(out).toContain("a.apng");
    expect(out).toContain("data:image/png");
  });
});
