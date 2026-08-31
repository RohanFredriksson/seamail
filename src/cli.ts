#!/usr/bin/env node
/**
 * Cmail CLI: `cmail test`, `cmail open`, `cmail inspect`.
 */
import path from "node:path";
import { Command } from "commander";
import pc from "picocolors";
import { loadConfig } from "./config.js";
import { runTests, type RunSummary } from "./runner.js";
import { generateReport } from "./report.js";
import { parseEnvironmentSpec, loadEnvironment } from "./registry.js";
import { readLockfile } from "./lockfile.js";
import { closeAllBrowsers } from "./browserManager.js";
import fs from "node:fs/promises";

const program = new Command();
program.name("cmail").description("Local-first HTML email rendering & visual regression testing");

function printSummary(summary: RunSummary): void {
  const byEnv = new Map<string, { pass: number; fail: number; nw: number }>();
  for (const r of summary.results) {
    const key = r.environment;
    const entry = byEnv.get(key) ?? { pass: 0, fail: 0, nw: 0 };
    if (r.status === "pass") entry.pass++;
    else if (r.status === "fail") entry.fail++;
    else entry.nw++;
    byEnv.set(key, entry);
  }

  console.log("");
  console.log(pc.bold("Cmail"));
  console.log("");
  for (const [env, counts] of byEnv) {
    if (counts.fail > 0) {
      console.log(`  ${pc.red("FAIL")} ${env} ${pc.dim(`(${counts.fail} regression(s))`)}`);
    } else if (counts.nw > 0) {
      console.log(`  ${pc.blue("NEW")}  ${env} ${pc.dim(`(${counts.nw} snapshot(s) created)`)}`);
    } else {
      console.log(`  ${pc.green("PASS")} ${env}`);
    }
  }
  console.log("");

  const totalEnvs = byEnv.size;
  const failingEnvs = [...byEnv.values()].filter((c) => c.fail > 0).length;
  console.log(`  ${totalEnvs - failingEnvs}/${totalEnvs} environments passed`);

  if (summary.failed > 0) {
    console.log(pc.red(`  ${summary.failed} visual regression(s) detected`));
    console.log("");
    for (const r of summary.results.filter((x) => x.status === "fail")) {
      const pct = r.dimensionMismatch
        ? "dimension mismatch"
        : `${(r.diffRatio! * 100).toFixed(2)}% pixels differ`;
      console.log(`  ${pc.red("✗")} ${r.email} / ${r.environment} / ${r.variant} - ${pct}`);
      console.log(`      expected: ${path.relative(process.cwd(), r.snapshotPath)}`);
      console.log(`      actual:   ${path.relative(process.cwd(), r.actualPath)}`);
      if (r.diffPath) console.log(`      diff:     ${path.relative(process.cwd(), r.diffPath)}`);
    }
  }
  if (summary.created > 0) {
    console.log(pc.blue(`  ${summary.created} snapshot(s) created (baseline)`));
  }
  console.log("");
}

program
  .command("test")
  .description("Render configured emails against configured environments and check for regressions")
  .option("-c, --config <path>", "path to cmail.config.ts", "cmail.config.ts")
  .option("-u, --update", "write new baseline snapshots instead of comparing", false)
  .action(async (opts: { config: string; update: boolean }) => {
    const { config, configDir } = await loadConfig(opts.config);
    const summary = await runTests(config, configDir, { update: opts.update });
    printSummary(summary);

    const outputDir = path.resolve(configDir, config.outputDir ?? "cmail");
    const reportPath = await generateReport(outputDir, summary);
    console.log(pc.dim(`  Report: ${path.relative(process.cwd(), reportPath)}`));
    console.log("");

    process.exitCode = summary.exitCode;
  });

program
  .command("open")
  .description("Open the last generated local HTML report")
  .option("-c, --config <path>", "path to cmail.config.ts", "cmail.config.ts")
  .action(async (opts: { config: string }) => {
    const { config, configDir } = await loadConfig(opts.config);
    const outputDir = path.resolve(configDir, config.outputDir ?? "cmail");
    const reportPath = path.join(outputDir, "report.html");
    try {
      await fs.access(reportPath);
    } catch {
      console.log(pc.red(`No report found at ${reportPath}. Run "cmail test" first.`));
      process.exitCode = 1;
      return;
    }
    console.log(`Report available at: ${reportPath}`);
    const open = await import("node:child_process");
    const cmd =
      process.platform === "darwin" ? "open" : process.platform === "win32" ? "start" : "xdg-open";
    open.spawn(cmd, [reportPath], { stdio: "ignore", detached: true }).unref();
  });

program
  .command("inspect")
  .description("Show known CSS/HTML capability support for each configured environment")
  .option("-c, --config <path>", "path to cmail.config.ts", "cmail.config.ts")
  .action(async (opts: { config: string }) => {
    const { config, configDir } = await loadConfig(opts.config);
    const lock = (await readLockfile(path.join(configDir, "cmail.lock"))) ?? { environments: {} };

    console.log("");
    console.log(pc.bold("Cmail capability inspection"));
    console.log("");

    const features = new Set<string>();
    const perEnv: Array<{ name: string; fidelity: string; caps: Record<string, string> }> = [];

    for (const spec of config.environments) {
      const ref = parseEnvironmentSpec(spec, lock.environments[spec.split("@")[0]]);
      const env = await loadEnvironment(ref);
      Object.keys(env.capabilities).forEach((f) => features.add(f));
      perEnv.push({ name: ref.full, fidelity: env.metadata.fidelity, caps: env.capabilities });
    }

    const featureList = [...features].sort();
    const nameColWidth = Math.max(...featureList.map((f) => f.length), 10);

    console.log(
      "  " + "Feature".padEnd(nameColWidth) + "  " + perEnv.map((e) => e.name).join("  |  "),
    );
    for (const feature of featureList) {
      const cells = perEnv.map((e) => (e.caps[feature] ?? "unknown").padEnd(11));
      console.log("  " + feature.padEnd(nameColWidth) + "  " + cells.join(" | "));
    }
    console.log("");
    for (const e of perEnv) {
      console.log(`  ${e.name}: fidelity=${e.fidelity}`);
    }
    console.log("");
    await closeAllBrowsers();
  });

program.parseAsync(process.argv).catch((err) => {
  console.error(pc.red(err instanceof Error ? (err.stack ?? err.message) : String(err)));
  process.exitCode = 1;
});
