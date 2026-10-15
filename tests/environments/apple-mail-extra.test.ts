import { describe, expect, it } from "vitest";
import { create } from "../../environments/apple-mail-macos/v1/index.js";

const conditions = { colorScheme: "light", imagesEnabled: true } as const;

describe("apple-mail-macos@v1 process() - Can I Email derived rules", () => {
  it("drops text-justify and hyphenate-limit-chars, nothing else", async () => {
    const out = await create().process(
      '<div style="text-justify: inter-word; color: red; position: absolute"></div>',
      conditions,
    );
    expect(out).not.toContain("text-justify");
    expect(out).toContain("color: red");
    expect(out).toContain("position: absolute");
  });
});
