/**
 * PNG screenshot comparison used for visual regression detection.
 */
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";

export interface DiffResult {
  match: boolean;
  diffPixelCount: number;
  totalPixels: number;
  diffRatio: number;
  diffPng: Buffer | null;
  /** True when dimensions differ, in which case pixel diffing was skipped. */
  dimensionMismatch: boolean;
}

export function compareScreenshots(
  expected: Buffer,
  actual: Buffer,
  threshold: number
): DiffResult {
  const expectedPng = PNG.sync.read(expected);
  const actualPng = PNG.sync.read(actual);

  if (expectedPng.width !== actualPng.width || expectedPng.height !== actualPng.height) {
    return {
      match: false,
      diffPixelCount: -1,
      totalPixels: -1,
      diffRatio: 1,
      diffPng: null,
      dimensionMismatch: true,
    };
  }

  const { width, height } = expectedPng;
  const diffPng = new PNG({ width, height });
  const diffPixelCount = pixelmatch(
    expectedPng.data,
    actualPng.data,
    diffPng.data,
    width,
    height,
    { threshold: 0.1 }
  );
  const totalPixels = width * height;
  const diffRatio = diffPixelCount / totalPixels;

  return {
    match: diffRatio <= threshold,
    diffPixelCount,
    totalPixels,
    diffRatio,
    diffPng: PNG.sync.write(diffPng),
    dimensionMismatch: false,
  };
}
