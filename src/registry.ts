/**
 * The environment registry: the only place that knows the on-disk layout of
 * `environments/<client-platform>/<version>/index.ts`. Everything else in
 * Cmail resolves environments by name through this module.
 */
import type { CmailEnvironment } from "./types.js";
import { CmailError } from "./errors.js";

export interface EnvironmentModule {
  create(): CmailEnvironment;
}

// Statically known environments for the PoC. A future version could scan
// the environments/ directory instead of hard-coding this table.
const REGISTRY: Record<string, { versions: string[]; default: string }> = {
  "gmail-desktop": { versions: ["v1"], default: "v1" },
  "apple-mail-macos": { versions: ["v1"], default: "v1" },
  "outlook-classic": { versions: ["v1"], default: "v1" },
};

export interface ResolvedEnvironmentRef {
  /** e.g. "gmail-desktop" */
  base: string;
  /** e.g. "v1" */
  version: string;
  /** e.g. "gmail-desktop@v1" */
  full: string;
}

/** Parses "gmail-desktop" or "gmail-desktop@v1" without loading any module. */
export function parseEnvironmentSpec(spec: string, lockedVersion?: string): ResolvedEnvironmentRef {
  const [base, explicitVersion] = spec.split("@");
  const entry = REGISTRY[base];
  if (!entry) {
    throw new CmailError(
      `Unknown environment "${base}". Known environments: ${Object.keys(REGISTRY).join(", ")}. Run "cmail list" to see details.`,
    );
  }
  const version = explicitVersion ?? lockedVersion ?? entry.default;
  if (!entry.versions.includes(version)) {
    throw new CmailError(
      `Unknown version "${version}" for environment "${base}". Available: ${entry.versions.join(", ")}`,
    );
  }
  return { base, version, full: `${base}@${version}` };
}

export function defaultVersionFor(base: string): string {
  const entry = REGISTRY[base];
  if (!entry) throw new Error(`Unknown environment "${base}"`);
  return entry.default;
}

export function listKnownEnvironments(): string[] {
  return Object.keys(REGISTRY);
}

/** All known environment@version refs, e.g. ["gmail-desktop@v1", ...]. */
export function listAllEnvironmentRefs(): ResolvedEnvironmentRef[] {
  return Object.entries(REGISTRY).flatMap(([base, entry]) =>
    entry.versions.map((version) => ({ base, version, full: `${base}@${version}` })),
  );
}

/** Dynamically imports and instantiates the concrete environment implementation. */
export async function loadEnvironment(ref: ResolvedEnvironmentRef): Promise<CmailEnvironment> {
  const modulePath = new URL(`../environments/${ref.base}/${ref.version}/index.ts`, import.meta.url)
    .href;
  const mod = (await import(modulePath)) as EnvironmentModule;
  return mod.create();
}
