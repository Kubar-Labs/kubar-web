// Reads Lighthouse's reports and holds each route's median to the budget.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const dir = process.argv[2];
const BUDGET = { lcp: 2000, cls: 0.05 };
const byRoute = new Map();
for (const file of readdirSync(dir).filter((f) => f.endsWith(".json")).sort()) {
  const report = JSON.parse(readFileSync(join(dir, file), "utf8"));
  const name = file.split(".")[0];
  const runs = byRoute.get(name) ?? [];
  if (report.runtimeError) runs.push({ error: report.runtimeError.code });
  else
    runs.push({
      score: Math.round(report.categories.performance.score * 100),
      lcp: report.audits["largest-contentful-paint"].numericValue,
      cls: report.audits["cumulative-layout-shift"].numericValue,
      tbt: report.audits["total-blocking-time"].numericValue,
      // Lighthouse's measure of the machine's CPU speed at the time of the run. Blocking time
      // scales with it: a laptop on battery runs at about half the speed and doubles it.
      bench: report.environment?.benchmarkIndex ?? 0,
    });
  byRoute.set(name, runs);
}
if (byRoute.size === 0) {
  console.error("No Lighthouse reports found.");
  process.exit(1);
}
const median = (values) => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)];
let failed = false;
console.log("route                      runs  score  LCP      CLS    TBT     machine");
let slow = false;
for (const [name, runs] of byRoute) {
  const good = runs.filter((r) => !r.error);
  const errors = runs.filter((r) => r.error).map((r) => r.error);
  if (good.length === 0) {
    console.log(`${name.padEnd(26)} ${String(runs.length).padEnd(5)} failed: ${errors.join(", ")}`);
    failed = true;
    continue;
  }
  const lcp = median(good.map((r) => r.lcp));
  const cls = median(good.map((r) => r.cls));
  const over = lcp > BUDGET.lcp || cls > BUDGET.cls || errors.length > 0;
  failed ||= over;
  const bench = Math.round(median(good.map((r) => r.bench)));
  slow ||= bench < 1500;
  console.log(
    `${name.padEnd(26)} ${String(good.length).padEnd(5)} ${String(median(good.map((r) => r.score))).padEnd(6)} ${(lcp / 1000).toFixed(2)} s   ${cls.toFixed(3)}  ${`${Math.round(median(good.map((r) => r.tbt)))} ms`.padEnd(7)} ${bench}${over ? "   OVER BUDGET" : ""}${errors.length ? `   errors: ${errors.join(", ")}` : ""}`,
  );
}
if (slow) console.log("NOTE: the machine ran slow (a benchmark index under 1500, as on battery); blocking time and scores are not comparable with a fast run.");
console.log(failed ? "FAILED: budget is LCP 2.0 s, CLS 0.05 (median of the runs)." : "WITHIN BUDGET (LCP 2.0 s, CLS 0.05; median of the runs).");
process.exit(failed ? 1 : 0);
