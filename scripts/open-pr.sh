#!/bin/sh
# Open the PR for the current branch, or reuse the one that already exists.
# Usage: open-pr.sh <repo> <base> <issue>
set -e
cd "$1"
url=$(gh pr view --json url -q .url 2>/dev/null || true)
if [ -z "$url" ]; then
  git push -u origin HEAD >&2
  url=$(gh pr create --base "$2" --title "$(git log -1 --format=%s)" \
    --body "Closes #$3

Checked by the xp-ship graph (tests, traceability, scope, impact, simplicity) and approved at the human gate.")
fi
printf '{"url": "%s"}\n' "$url"
