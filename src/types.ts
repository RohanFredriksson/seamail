/**
 * Core abstractions for Cmail environments.
 *
 * A "Cmail environment" is a versioned, reproducible representation of a
 * real-world email rendering environment (client + platform + version).
 * The test runner talks to every environment through this interface only -
 * it never knows whether an environment uses Chromium, WebKit, or a
 * behavioural simulation underneath.
 */

/** How faithfully an environment represents the real-world client it models. */
export type FidelityLevel = "exact" | "high" | "simulated" | "analytical";

export interface EnvironmentMetadata {
  /** Conceptual client family, e.g. "gmail", "apple-mail", "outlook". */
  client: string;
  /** Platform the client runs on, e.g. "desktop", "macos", "ios". */
  platform: string;
  /** Immutable version of this Cmail representation, e.g. "v1". */
  version: string;
  /** Full resolved identifier, e.g. "gmail-desktop@v1". */
  name: string;
  /** Honest statement of how accurately this models the real client. */
  fidelity: FidelityLevel;
  /** Short human-readable description of what this environment models. */
  description: string;
  /** Underlying rendering engine used, for transparency. */
  engine: "chromium" | "webkit" | "simulated-dom";
}

export interface DeviceConfig {
  viewport: { width: number; height: number };
  deviceScaleFactor?: number;
}

/** A condition layered on top of an environment (not a separate environment). */
export interface RenderConditions {
  colorScheme: "light" | "dark";
  imagesEnabled: boolean;
}

export const DEFAULT_CONDITIONS: RenderConditions = {
  colorScheme: "light",
  imagesEnabled: true,
};

export type CapabilityStatus = "supported" | "unsupported" | "partial";

export interface CapabilityMap {
  [feature: string]: CapabilityStatus;
}

export interface RenderResult {
  /** PNG bytes of the captured screenshot. */
  screenshot: Buffer;
  /** Final HTML that was actually rendered, after environment processing. */
  processedHtml: string;
}

/**
 * The common abstraction every environment implementation must satisfy.
 * Chromium-backed, WebKit-backed, and pure-simulation environments all
 * implement this same interface.
 */
export interface CmailEnvironment {
  readonly metadata: EnvironmentMetadata;
  readonly device: DeviceConfig;
  readonly capabilities: CapabilityMap;

  /** Acquire any resources needed (browser context, etc). Idempotent. */
  prepare(): Promise<void>;

  /** Client-specific processing pipeline: sanitisation, quirks, CSS rewriting. */
  process(html: string, conditions: RenderConditions): Promise<string>;

  /** Render already-processed HTML and capture a screenshot. */
  render(processedHtml: string, conditions: RenderConditions): Promise<RenderResult>;

  /** Release resources. */
  dispose(): Promise<void>;
}

/** A factory that builds one environment instance for a given version. */
export type EnvironmentFactory = () => CmailEnvironment;
