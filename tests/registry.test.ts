import { describe, expect, it } from "vitest";
import { defaultVersionFor, listKnownEnvironments, parseEnvironmentSpec } from "../src/registry.js";

describe("parseEnvironmentSpec", () => {
  it("resolves a bare name to its default version", () => {
    const ref = parseEnvironmentSpec("gmail-desktop");
    expect(ref).toEqual({ base: "gmail-desktop", version: "v1", full: "gmail-desktop@v1" });
  });

  it("resolves an explicit version", () => {
    const ref = parseEnvironmentSpec("gmail-desktop@v1");
    expect(ref.version).toBe("v1");
  });

  it("prefers a locked version over the registry default when no explicit version is given", () => {
    const ref = parseEnvironmentSpec("gmail-desktop", "v1");
    expect(ref.version).toBe("v1");
  });

  it("throws for an unknown environment", () => {
    expect(() => parseEnvironmentSpec("does-not-exist")).toThrow(/Unknown environment/);
  });

  it("throws for an unknown version of a known environment", () => {
    expect(() => parseEnvironmentSpec("gmail-desktop@v99")).toThrow(/Unknown version/);
  });
});

describe("defaultVersionFor", () => {
  it("returns the registry default", () => {
    expect(defaultVersionFor("outlook-classic")).toBe("v1");
  });

  it("throws for an unknown environment", () => {
    expect(() => defaultVersionFor("does-not-exist")).toThrow(/Unknown environment/);
  });
});

describe("listKnownEnvironments", () => {
  it("lists all registered environment names", () => {
    expect(listKnownEnvironments()).toEqual(
      expect.arrayContaining(["gmail-desktop", "apple-mail-macos", "outlook-classic"]),
    );
  });
});
