/**
 * Cmail lockfile: pins each environment name to an exact immutable version
 * plus the renderer identity/version it ran with last time, so that a
 * project tested today doesn't unexpectedly render differently next month
 * because the registry default or an installed renderer changed underneath
 * it. The lockfile is only ever read/written by Cmail itself (via the test
 * runner) - it is not meant to be hand-edited.
 */
import fs from "node:fs/promises";
import path from "node:path";

export const LOCKFILE_VERSION = 1;

export interface EnvironmentLockEntry {
  /** Immutable Cmail environment version, e.g. "v1". */
  version: string;
  /** Underlying rendering engine, for reproducibility auditing. */
  engine: "chromium" | "webkit" | "simulated-dom";
  /** Actual browser engine version last observed, e.g. "131.0.6778.33". Null for simulated engines. */
  engineVersion: string | null;
  /** Installed Playwright package version last observed. Null for simulated engines. */
  playwrightVersion: string | null;
}

export interface CmailLock {
  lockfileVersion: number;
  environments: Record<string, EnvironmentLockEntry>;
}

export async function readLockfile(lockPath: string): Promise<CmailLock | null> {
  try {
    const raw = await fs.readFile(lockPath, "utf8");
    return JSON.parse(raw) as CmailLock;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw err;
  }
}

export async function writeLockfile(lockPath: string, lock: CmailLock): Promise<void> {
  await fs.mkdir(path.dirname(lockPath), { recursive: true });
  const withVersion: CmailLock = { ...lock, lockfileVersion: LOCKFILE_VERSION };
  await fs.writeFile(lockPath, JSON.stringify(withVersion, null, 2) + "\n", "utf8");
}
