/**
 * Minimal local, static HTML report (`cmail open`). No server, no database -
 * just a generated HTML file that links to the expected/actual/diff PNGs
 * already written to disk by the runner.
 */
import fs from "node:fs/promises";
import path from "node:path";
import type { RunSummary } from "./runner.js";

export async function generateReport(outputDir: string, summary: RunSummary): Promise<string> {
  const reportPath = path.join(outputDir, "report.html");

  const rows = summary.results
    .map((r) => {
      const rel = (p: string) => path.relative(outputDir, p);
      const statusClass = r.status;
      const diffCell =
        r.status === "fail"
          ? `<img src="${rel(r.diffPath ?? r.actualPath)}" width="200">`
          : "";
      return `
        <tr class="${statusClass}">
          <td>${r.email}</td>
          <td>${r.environment}</td>
          <td>${r.variant}</td>
          <td class="status">${r.status.toUpperCase()}</td>
          <td>${r.diffRatio !== undefined ? (r.diffRatio * 100).toFixed(3) + "%" : "-"}</td>
          <td><img src="${rel(r.snapshotPath)}" width="200"></td>
          <td><img src="${rel(r.actualPath)}" width="200"></td>
          <td>${diffCell}</td>
        </tr>`;
    })
    .join("\n");

  const html = `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>Cmail Report</title>
<style>
  body { font-family: -apple-system, Segoe UI, Arial, sans-serif; margin: 24px; color: #111; }
  h1 { margin-bottom: 4px; }
  .summary { color: #555; margin-bottom: 16px; }
  table { border-collapse: collapse; width: 100%; }
  td, th { border: 1px solid #ddd; padding: 8px; text-align: left; vertical-align: top; font-size: 13px; }
  tr.fail { background: #fff5f5; }
  tr.pass { background: #f5fff7; }
  tr.new { background: #f5f8ff; }
  .status { font-weight: bold; }
  tr.fail .status { color: #c0392b; }
  tr.pass .status { color: #1e8449; }
  tr.new .status { color: #2456c9; }
</style>
</head>
<body>
  <h1>Cmail Report</h1>
  <div class="summary">
    ${summary.passed} passed, ${summary.failed} failed, ${summary.created} new snapshots
  </div>
  <table>
    <thead>
      <tr>
        <th>Email</th><th>Environment</th><th>Variant</th><th>Status</th><th>Diff</th>
        <th>Expected</th><th>Actual</th><th>Diff image</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
    </tbody>
  </table>
</body>
</html>`;

  await fs.writeFile(reportPath, html, "utf8");
  return reportPath;
}
