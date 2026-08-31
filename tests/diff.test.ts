import { describe, expect, it } from "vitest";
import { PNG } from "pngjs";
import { compareScreenshots } from "../src/diff.js";

function solidPng(
  width: number,
  height: number,
  [r, g, b, a]: [number, number, number, number],
): Buffer {
  const png = new PNG({ width, height });
  for (let i = 0; i < width * height; i++) {
    png.data[i * 4] = r;
    png.data[i * 4 + 1] = g;
    png.data[i * 4 + 2] = b;
    png.data[i * 4 + 3] = a;
  }
  return PNG.sync.write(png);
}

describe("compareScreenshots", () => {
  it("matches identical images", () => {
    const png = solidPng(4, 4, [255, 0, 0, 255]);
    const result = compareScreenshots(png, png, 0.001);
    expect(result.match).toBe(true);
    expect(result.diffRatio).toBe(0);
    expect(result.dimensionMismatch).toBe(false);
  });

  it("flags a dimension mismatch without pixel diffing", () => {
    const expected = solidPng(4, 4, [255, 0, 0, 255]);
    const actual = solidPng(8, 8, [255, 0, 0, 255]);
    const result = compareScreenshots(expected, actual, 0.001);
    expect(result.dimensionMismatch).toBe(true);
    expect(result.match).toBe(false);
    expect(result.diffPng).toBeNull();
  });

  it("fails when the diff ratio exceeds the threshold", () => {
    const expected = solidPng(4, 4, [255, 0, 0, 255]);
    const actual = solidPng(4, 4, [0, 255, 0, 255]);
    const result = compareScreenshots(expected, actual, 0.001);
    expect(result.match).toBe(false);
    expect(result.diffRatio).toBeGreaterThan(0);
  });

  it("passes when the diff ratio is within the threshold", () => {
    const png = solidPng(10, 10, [255, 0, 0, 255]);
    // Change a single pixel out of 100 (1% diff ratio).
    const changed = PNG.sync.write(PNG.sync.read(png));
    const parsed = PNG.sync.read(changed);
    parsed.data[0] = 0;
    parsed.data[1] = 255;
    const actual = PNG.sync.write(parsed);
    const result = compareScreenshots(png, actual, 0.5);
    expect(result.match).toBe(true);
  });
});
