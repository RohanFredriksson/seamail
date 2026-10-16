/**
 * Typed access to the cached Can I Email dataset (src/data/caniemail-support.json,
 * refreshed with `npm run conformance:fetch`).
 */
import { readFileSync } from "node:fs";
import type { CapabilityMap, CapabilityStatus } from "./types.js";

export interface SupportEntry {
  code: "y" | "n" | "a" | "u" | string;
  /** Code including note reference, e.g. "n #3". */
  raw: string;
  /** Dataset version/date the code was measured on. */
  version: string;
}

export interface SupportFeature {
  slug: string;
  title: string;
  category: string;
  url: string;
  support: Record<string, SupportEntry>;
  notesByNum: Record<string, string> | null;
}

let cache: SupportFeature[] | null = null;

export function loadSupport(): SupportFeature[] {
  if (!cache) {
    const file = new URL("./data/caniemail-support.json", import.meta.url);
    cache = (JSON.parse(readFileSync(file, "utf-8")) as { features: SupportFeature[] }).features;
  }
  return cache;
}

/** Slugs the dataset marks unsupported ("n") for an environment key such as "gmail-desktop". */
export function unsupportedFeatures(envKey: string): string[] {
  return loadSupport()
    .filter((f) => f.support[envKey]?.code === "n")
    .map((f) => f.slug);
}

function status(envKey: string, slugs: string[]): CapabilityStatus {
  const codes = slugs.map((s) => loadSupport().find((f) => f.slug === s)?.support[envKey]?.code);
  if (codes.every((c) => c === "y")) return "supported";
  if (codes.every((c) => c === "n")) return "unsupported";
  return "partial";
}

/** Derives the coarse capability map shown by `seamail inspect` from the dataset. */
export function deriveCapabilities(envKey: string): CapabilityMap {
  return {
    flexbox: status(envKey, [
      "css-display-flex",
      "css-flex-direction",
      "css-flex-wrap",
      "css-justify-content",
      "css-align-items",
    ]),
    grid: status(envKey, ["css-display-grid", "css-grid-template"]),
    borderRadius: status(envKey, ["css-border-radius"]),
    backgroundImage: status(envKey, ["css-background-image"]),
    mediaQuery: status(envKey, ["css-at-media", "css-at-media-hover"]),
    webFonts: status(envKey, ["css-at-font-face"]),
    svg: status(envKey, ["html-svg"]),
    darkMode: status(envKey, ["css-at-media-prefers-color-scheme", "css-color-scheme"]),
  };
}
