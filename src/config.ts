/**
 * Developer-facing project configuration.
 */
import path from "node:path";
import { pathToFileURL } from "node:url";

export interface CmailConfig {
  /** Glob (relative to config file) matching input email HTML files. */
  emails: string;
  /** Environment names, optionally with @version, e.g. "gmail-desktop". */
  environments: string[];
  /** Conditions to test each environment under. */
  variants: Array<"light" | "dark">;
  /** Directory (relative to config file) where snapshots/results are stored. */
  outputDir?: string;
  /** Max allowed proportion of differing pixels before a test fails (0-1). */
  diffThreshold?: number;
}

export function defineConfig(config: CmailConfig): CmailConfig {
  return {
    ...config,
    variants: config.variants ?? ["light"],
    outputDir: config.outputDir ?? "cmail",
    diffThreshold: config.diffThreshold ?? 0.001,
  };
}

export interface LoadedConfig {
  config: CmailConfig;
  configDir: string;
}

export async function loadConfig(configPath: string): Promise<LoadedConfig> {
  const absolute = path.resolve(configPath);
  const mod = (await import(pathToFileURL(absolute).href)) as { default: CmailConfig };
  if (!mod.default) {
    throw new Error(`${configPath} must export a default config (use defineConfig()).`);
  }
  return { config: mod.default, configDir: path.dirname(absolute) };
}
