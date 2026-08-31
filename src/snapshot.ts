/**
 * Deterministic naming and storage for snapshots and per-run results.
 * Naming key: email name + environment (with version) + variant.
 */
import fs from "node:fs/promises";
import path from "node:path";

export function snapshotName(emailSlug: string, environmentFull: string, variant: string): string {
  return `${emailSlug}__${environmentFull}__${variant}.png`;
}

export async function ensureDir(dir: string): Promise<void> {
  await fs.mkdir(dir, { recursive: true });
}

export async function readIfExists(filePath: string): Promise<Buffer | null> {
  try {
    return await fs.readFile(filePath);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw err;
  }
}

export async function writeFile(filePath: string, data: Buffer): Promise<void> {
  await ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, data);
}

export function emailSlug(emailPath: string): string {
  return path.basename(emailPath, path.extname(emailPath)).replace(/[^a-zA-Z0-9_-]/g, "-");
}
