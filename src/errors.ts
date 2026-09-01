/**
 * A user-facing error: message alone is safe/useful to print without a stack
 * trace (bad config, missing files, unsupported environment, etc). Anything
 * else thrown is treated as an unexpected/internal error by the CLI.
 */
export class SeamailError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "SeamailError";
  }
}
