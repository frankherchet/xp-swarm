// Deterministic xp-ship checks: tests and criterion traceability.
// Usage: node check.mjs <repo> <base> <issue> <test_cmd> <test_dirs>
// Prints one JSON object on stdout; logs go to stderr.
import { execFileSync, spawnSync } from "node:child_process";

const [repo, base, issue, testCmd, testDirs] = process.argv.slice(2);
const git = (...args) => execFileSync("git", ["-C", repo, ...args], { encoding: "utf8", maxBuffer: 64 << 20 });

git("fetch", "origin", base);
const sha = git("rev-parse", "HEAD").trim();
const diff = git("diff", `origin/${base}...HEAD`);

const test = spawnSync(testCmd, { cwd: repo, shell: true, encoding: "utf8", maxBuffer: 64 << 20 });
const testLog = (test.stdout + test.stderr).slice(-4000);

const body = execFileSync("gh", ["issue", "view", issue, "--json", "body", "-q", ".body"], { cwd: repo, encoding: "utf8" });
const reqLine = body.split("\n").find((l) => /^\s*\**Requirements:?\**:?/i.test(l)) ?? "";
// A bug without criteria is traced by its issue number instead.
const ids = reqLine.match(/REQ-\d+(\.\d+)?/g) ?? [`#${issue}`];
const dirs = testDirs.split(/[ ,]+/).filter(Boolean);
const missing = ids.filter((id) => spawnSync("git", ["-C", repo, "grep", "-qF", id, "--", ...dirs]).status !== 0);

console.log(JSON.stringify({
  sha,
  diff: diff.slice(0, 100_000),
  diff_truncated: diff.length > 100_000,
  tests_passed: test.status === 0,
  test_log: testLog,
  criteria: ids,
  missing_criteria: missing,
}));
