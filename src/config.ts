/**
 * Developer-facing project configuration.
 */
import path from "node:path";
import { pathToFileURL } from "node:url";
import { SeamailError } from "./errors.js";

export interface SeamailConfig {
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

export function defineConfig(config: SeamailConfig): SeamailConfig {
  return {
    ...config,
    variants: config.variants ?? ["light"],
    outputDir: config.outputDir ?? "seamail",
    diffThreshold: config.diffThreshold ?? 0.001,
  };
}

export interface LoadedConfig {
  config: SeamailConfig;
  configDir: string;
}

function validateConfig(config: SeamailConfig, configPath: string): void {
  if (typeof config.emails !== "string" || config.emails.trim() === "") {
    throw new SeamailError(
      `Invalid config at ${configPath}: "emails" must be a non-empty glob string.`,
    );
  }
  if (!Array.isArray(config.environments) || config.environments.length === 0) {
    throw new SeamailError(
      `Invalid config at ${configPath}: "environments" must be a non-empty array of environment names, e.g. ["gmail-desktop"].`,
    );
  }
  if (config.variants !== undefined) {
    const invalid = config.variants.filter((v) => v !== "light" && v !== "dark");
    if (invalid.length > 0) {
      throw new SeamailError(
        `Invalid config at ${configPath}: "variants" contains unsupported value(s) ${invalid
          .map((v) => JSON.stringify(v))
          .join(", ")}. Supported variants: "light", "dark".`,
      );
    }
  }
  if (
    config.diffThreshold !== undefined &&
    (typeof config.diffThreshold !== "number" ||
      config.diffThreshold < 0 ||
      config.diffThreshold > 1)
  ) {
    throw new SeamailError(
      `Invalid config at ${configPath}: "diffThreshold" must be a number between 0 and 1.`,
    );
  }
}

export async function loadConfig(configPath: string): Promise<LoadedConfig> {
  const absolute = path.resolve(configPath);
  let mod: { default: SeamailConfig };
  try {
    mod = (await import(pathToFileURL(absolute).href)) as { default: SeamailConfig };
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ERR_MODULE_NOT_FOUND") {
      throw new SeamailError(
        `Could not find a Seamail config at "${configPath}". Create one (see README) or pass --config <path>.`,
      );
    }
    throw new SeamailError(
      `Failed to load config at "${configPath}": ${err instanceof Error ? err.message : String(err)}`,
    );
  }
  if (!mod.default) {
    throw new SeamailError(`${configPath} must export a default config (use defineConfig()).`);
  }
  validateConfig(mod.default, configPath);
  return { config: mod.default, configDir: path.dirname(absolute) };
}

