// Ready check and isolated worktree for one issue. Fails closed.
// Usage: node start.mjs <repo> <base> <issue> <test_cmd>
// Prints one JSON object on stdout; logs go to stderr.
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { basename, dirname, join } from "node:path";

const [repo, base, issue, testCmd] = process.argv.slice(2);
const run = (cmd, args, cwd = repo) => execFileSync(cmd, args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "inherit"] });
// Conductor requires every declared output field, so always emit all of them.
const done = (out) => {
  console.log(JSON.stringify({ reason: "", worktree: "", branch: "", title: "", body: "", ...out }));
  process.exit(0);
};

const { state, title, body, labels } = JSON.parse(run("gh", ["issue", "view", issue, "--json", "state,title,body,labels"]));
const names = labels.map((l) => l.name);
// status:in-progress means an earlier run was interrupted: resume it.
if (state !== "OPEN" || !names.some((n) => n === "status:ready" || n === "status:in-progress")) {
  done({ ready: false, reason: `#${issue} is ${state.toLowerCase()} with labels [${names.join(", ")}], not status:ready` });
}

run("git", ["fetch", "origin", base]);
const worktree = join(dirname(repo), `${basename(repo)}-xp-${issue}`);
const branch = `xp/${issue}`;
if (!existsSync(worktree)) {
  const hasBranch = spawnSync("git", ["-C", repo, "rev-parse", "--verify", "-q", branch]).status === 0;
  run("git", ["worktree", "add", ...(hasBranch ? [worktree, branch] : ["-b", branch, worktree, `origin/${base}`])]);
  if (!hasBranch) {
    const test = spawnSync(testCmd, { cwd: worktree, shell: true, stdio: ["ignore", 2, 2] });
    if (test.status !== 0) done({ ready: false, reason: `${base} is red: fix the default branch first (xp-bugfix)` });
  }
}

run("gh", ["issue", "edit", issue, "--remove-label", "status:ready", "--add-label", "status:in-progress"]);
done({ ready: true, worktree, branch, title, body });
