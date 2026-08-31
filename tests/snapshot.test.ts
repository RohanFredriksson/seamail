import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { emailSlug, ensureDir, readIfExists, snapshotName, writeFile } from "../src/snapshot.js";

describe("snapshotName", () => {
  it("joins email slug, environment, and variant deterministically", () => {
    expect(snapshotName("basic", "gmail-desktop@v1", "light")).toBe(
      "basic__gmail-desktop@v1__light.png",
    );
  });
});

describe("emailSlug", () => {
  it("strips the extension", () => {
    expect(emailSlug("/a/b/basic.html")).toBe("basic");
  });

  it("replaces unsafe characters", () => {
    expect(emailSlug("weird name!@#.html")).toBe("weird-name---");
  });
});

describe("snapshot filesystem helpers", () => {
  let tmpDir: string | undefined;

  afterEach(async () => {
    if (tmpDir) await fs.rm(tmpDir, { recursive: true, force: true });
    tmpDir = undefined;
  });

  it("readIfExists returns null for a missing file", async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "cmail-snap-"));
    const result = await readIfExists(path.join(tmpDir, "missing.png"));
    expect(result).toBeNull();
  });

  it("writeFile creates parent directories and readIfExists reads them back", async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "cmail-snap-"));
    const filePath = path.join(tmpDir, "nested", "dir", "out.png");
    const data = Buffer.from([1, 2, 3]);

    await writeFile(filePath, data);
    const result = await readIfExists(filePath);

    expect(result).toEqual(data);
  });

  it("ensureDir creates a directory that does not yet exist", async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "cmail-snap-"));
    const dir = path.join(tmpDir, "a", "b", "c");

    await ensureDir(dir);
    const stat = await fs.stat(dir);

    expect(stat.isDirectory()).toBe(true);
  });
});
