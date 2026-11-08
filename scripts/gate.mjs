// Ship gate: passes only if every check is green and HEAD has not moved.
// Usage: node gate.mjs <repo>  (stdin: {"check": {...}, "reviews": {name: {passed, findings}}})
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const [repo] = process.argv.slice(2);
const { check, reviews } = JSON.parse(readFileSync(0, "utf8"));
const head = execFileSync("git", ["-C", repo, "rev-parse", "HEAD"], { encoding: "utf8" }).trim();

const reasons = [];
if (!check.tests_passed) reasons.push("tests failed");
if (check.missing_criteria.length) reasons.push(`no test names: ${check.missing_criteria.join(", ")}`);
if (head !== check.sha) reasons.push(`HEAD moved from ${check.sha} to ${head}`);
for (const [name, r] of Object.entries(reviews)) {
  if (r?.passed !== true) reasons.push(`${name} review failed`);
}

console.log(JSON.stringify({ passed: reasons.length === 0, reasons }));
