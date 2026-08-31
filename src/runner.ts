/**
 * The core test runner. It resolves environments, discovers emails, and
 * drives every environment through the same abstract sequence:
 *   resolve -> prepare -> process -> render -> capture -> compare
 * It has zero knowledge of how any individual environment is implemented.
 */
import fs from "node:fs/promises";
import path from "node:path";
import { glob } from "glob";
import type { CmailConfig } from "./config.js";
import {
  parseEnvironmentSpec,
  loadEnvironment,
  defaultVersionFor,
  type ResolvedEnvironmentRef,
} from "./registry.js";
import { readLockfile, writeLockfile, type CmailLock } from "./lockfile.js";
import { compareScreenshots } from "./diff.js";
import { emailSlug, readIfExists, writeFile, snapshotName } from "./snapshot.js";
import { closeAllBrowsers } from "./browserManager.js";
import type { RenderConditions } from "./types.js";

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
  config: CmailConfig,
  configDir: string,
  options: RunOptions
): Promise<RunSummary> {
  const outputDir = path.resolve(configDir, config.outputDir ?? "cmail");
  const snapshotsDir = path.join(outputDir, "snapshots");
  const resultsDir = path.join(outputDir, "results");
  const lockPath = path.join(configDir, "cmail.lock");

  const lock = (await readLockfile(lockPath)) ?? { environments: {} };
  const refs: ResolvedEnvironmentRef[] = config.environments.map((spec) =>
    parseEnvironmentSpec(spec, lock.environments[spec.split("@")[0]])
  );

  // Pin any newly-seen environments into the lockfile (minimal lockfile behaviour).
  let lockChanged = false;
  for (const ref of refs) {
    if (!lock.environments[ref.base]) {
      lock.environments[ref.base] = ref.version;
      lockChanged = true;
    }
  }
  if (lockChanged) {
    await writeLockfile(lockPath, lock satisfies CmailLock);
  }

  const emailPaths = await glob(config.emails, { cwd: configDir, absolute: true });
  if (emailPaths.length === 0) {
    throw new Error(`No email files matched pattern "${config.emails}" in ${configDir}`);
  }

  const results: TestCaseResult[] = [];

  try {
    for (const ref of refs) {
      const env = await loadEnvironment(ref);
      await env.prepare();
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
              config.diffThreshold ?? 0.01
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
