import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { readLockfile, writeLockfile, LOCKFILE_VERSION, type SeamailLock } from "../src/lockfile.js";

describe("lockfile", () => {
  let tmpDir: string | undefined;

  afterEach(async () => {
    if (tmpDir) await fs.rm(tmpDir, { recursive: true, force: true });
    tmpDir = undefined;
  });

  it("returns null when the lockfile does not exist", async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "seamail-lock-"));
    const result = await readLockfile(path.join(tmpDir, "seamail.lock"));
    expect(result).toBeNull();
  });

  it("round-trips a written lockfile", async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "seamail-lock-"));
    const lockPath = path.join(tmpDir, "nested", "seamail.lock");
    const lock: SeamailLock = {
      lockfileVersion: LOCKFILE_VERSION,
      environments: {
        "gmail-desktop": {
          version: "v1",
          engine: "chromium",
          engineVersion: "131.0.6778.33",
          playwrightVersion: "1.47.0",
        },
      },
    };

    await writeLockfile(lockPath, lock);
    const result = await readLockfile(lockPath);

    expect(result).toEqual(lock);
  });

  it("rethrows non-ENOENT errors", async () => {
    // A path whose parent doesn't exist and isn't creatable as a file read target.
    await expect(readLockfile("/nonexistent-dir-xyz/seamail.lock")).resolves.toBeNull();
  });
});
