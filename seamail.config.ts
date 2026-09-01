import { defineConfig } from "./src/config.js";

export default defineConfig({
  // The torture fixture is deliberately used as the PoC's demo "email".
  emails: "fixtures/torture/*.html",
  environments: ["gmail-desktop", "apple-mail-macos", "outlook-classic"],
  variants: ["light", "dark"],
});
