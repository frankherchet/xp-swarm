#!/bin/sh
# Push the branch and open its PR, or update the one that already exists.
# Usage: open-pr.sh <worktree> <base> <issue>
set -e
cd "$1"
git push -u origin HEAD >&2
url=$(gh pr view --json url -q .url 2>/dev/null || true)
if [ -z "$url" ]; then
  url=$(gh pr create --base "$2" --title "$(git log -1 --format=%s)" \
    --body "Closes #$3

Built and checked unattended by the xp-deliver graph: tests, traceability, scope, impact and simplicity reviews all passed. Ready for a human merge.")
fi
gh issue edit "$3" --remove-label status:in-progress --add-label status:review >&2
printf '{"url": "%s"}\n' "$url"
