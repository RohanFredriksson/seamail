/**
 * The core test runner. It resolves environments, discovers emails, and
 * drives every environment through the same abstract sequence:
 *   resolve -> prepare -> process -> render -> capture -> compare
 * It has zero knowledge of how any individual environment is implemented.
 */
import fs from "node:fs/promises";
import path from "node:path";
import { glob } from "glob";
import type { SeamailConfig } from "./config.js";
import { parseEnvironmentSpec, loadEnvironment, type ResolvedEnvironmentRef } from "./registry.js";
import {
  readLockfile,
  writeLockfile,
  LOCKFILE_VERSION,
  type SeamailLock,
  type EnvironmentLockEntry,
} from "./lockfile.js";
import { compareScreenshots } from "./diff.js";
import { emailSlug, readIfExists, writeFile, snapshotName } from "./snapshot.js";
import { closeAllBrowsers, getEngineVersions } from "./browserManager.js";
import type { RenderConditions } from "./types.js";
import { SeamailError } from "./errors.js";

export interface TestCaseResult {
  email: string;
  environment: string; // full, e.g. gmail-desktop@v1
  variant: string;
  status: "pass" | "fail" | "new";
  diffRatio?: number;
  dimensionMismatch?: boolean;
  snapshotPath: string;
  actualPath: string;
  diffPath?: string;
}

export interface RunSummary {
  results: TestCaseResult[];
  passed: number;
  failed: number;
  created: number;
  exitCode: 0 | 1;
}

export interface RunOptions {
  update: boolean;
}

export async function runTests(
  config: SeamailConfig,
  configDir: string,
  options: RunOptions,
): Promise<RunSummary> {
  const outputDir = path.resolve(configDir, config.outputDir ?? "seamail");
  const snapshotsDir = path.join(outputDir, "snapshots");
  const resultsDir = path.join(outputDir, "results");
  const lockPath = path.join(configDir, "seamail.lock");

  const lock: SeamailLock = (await readLockfile(lockPath)) ?? {
    lockfileVersion: LOCKFILE_VERSION,
    environments: {},
  };
  const refs: ResolvedEnvironmentRef[] = config.environments.map((spec) =>
    parseEnvironmentSpec(spec, lock.environments[spec.split("@")[0]]?.version),
  );

  let lockChanged = false;
  function pinEnvironment(base: string, entry: EnvironmentLockEntry): void {
    const existing = lock.environments[base];
    if (
      !existing ||
      existing.version !== entry.version ||
      existing.engine !== entry.engine ||
      existing.engineVersion !== entry.engineVersion ||
      existing.playwrightVersion !== entry.playwrightVersion
    ) {
      lock.environments[base] = entry;
      lockChanged = true;
    }
  }

  const emailPaths = await glob(config.emails, { cwd: configDir, absolute: true });
  if (emailPaths.length === 0) {
    throw new SeamailError(`No email files matched pattern "${config.emails}" in ${configDir}`);
  }

  const results: TestCaseResult[] = [];

  try {
    for (const ref of refs) {
      const env = await loadEnvironment(ref);
      await env.prepare();

      const { engine } = env.metadata;
      const { engineVersion, playwrightVersion } =
        engine === "simulated-dom"
          ? { engineVersion: null, playwrightVersion: null }
          : await getEngineVersions(engine);
      pinEnvironment(ref.base, { version: ref.version, engine, engineVersion, playwrightVersion });

      try {
        for (const emailPath of emailPaths) {
          const html = await fs.readFile(emailPath, "utf8");
          const slug = emailSlug(emailPath);

          for (const variant of config.variants) {
            const conditions: RenderConditions = {
              colorScheme: variant,
              imagesEnabled: true,
            };

            const processed = await env.process(html, conditions);
            const { screenshot } = await env.render(processed, conditions);

            const fileName = snapshotName(slug, ref.full, variant);
            const snapshotPath = path.join(snapshotsDir, fileName);
            const actualPath = path.join(resultsDir, fileName);
            await writeFile(actualPath, screenshot);

            const existingSnapshot = await readIfExists(snapshotPath);

            if (options.update || !existingSnapshot) {
              await writeFile(snapshotPath, screenshot);
              results.push({
                email: slug,
                environment: ref.full,
                variant,
                status: "new",
                snapshotPath,
                actualPath,
              });
              continue;
            }

            const diff = compareScreenshots(
              existingSnapshot,
              screenshot,
              config.diffThreshold ?? 0.005,
            );

            let diffPath: string | undefined;
            if (!diff.match && diff.diffPng) {
              diffPath = path.join(resultsDir, fileName.replace(/\.png$/, ".diff.png"));
              await writeFile(diffPath, diff.diffPng);
            }

            results.push({
              email: slug,
              environment: ref.full,
              variant,
              status: diff.match ? "pass" : "fail",
              diffRatio: diff.diffRatio,
              dimensionMismatch: diff.dimensionMismatch,
              snapshotPath,
              actualPath,
              diffPath,
            });
          }
        }
      } finally {
        await env.dispose();
      }
    }
  } finally {
    await closeAllBrowsers();
    if (lockChanged) {
      await writeLockfile(lockPath, lock);
    }
  }

  const passed = results.filter((r) => r.status === "pass").length;
  const failed = results.filter((r) => r.status === "fail").length;
  const created = results.filter((r) => r.status === "new").length;

  return {
    results,
    passed,
    failed,
    created,
    exitCode: failed > 0 ? 1 : 0,
  };
}
