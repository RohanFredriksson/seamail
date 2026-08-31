/**
 * Minimal lockfile: pins each environment name to an exact immutable
 * version so that repeated runs stay reproducible even if the registry's
 * "default" version for an environment changes in a future Cmail release.
 */
import fs from "node:fs/promises";
import path from "node:path";

export interface CmailLock {
  environments: Record<string, string>; // base name -> version, e.g. "gmail-desktop": "v1"
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
  await fs.writeFile(lockPath, JSON.stringify(lock, null, 2) + "\n", "utf8");
}
