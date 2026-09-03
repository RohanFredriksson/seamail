import { defineConfig } from "../../src/config.js";

// Renders every gimmick fixture through outlook-classic@v1 so its simulated
// output can be compared against the real-Outlook screenshots in captures/
// (see capture.ps1 / README.md). Not part of the main project's demo config
// (seamail.config.ts at the repo root) - this is scoped to this tool only.
export default defineConfig({
  emails: "fixtures/*.html",
  environments: ["outlook-classic"],
  variants: ["light"],
  outputDir: "renders",
});
