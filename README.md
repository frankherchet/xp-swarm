# xp-swarm

XP workflows from [frankherchet/skills](https://github.com/frankherchet/skills) as [Conductor](https://github.com/microsoft/conductor) graphs: deterministic checks and gates as scripts, judgment as agents, GitHub labels as the hand-off to humans.

Plan and acceptance criteria: [frankherchet/skills#16](https://github.com/frankherchet/skills/issues/16).

## xp-deliver

Takes a `status:ready` issue and runs unattended until its PR is ready to merge. Humans decide only at refinement (setting `status:ready`) and at the merge.

```
start ─► implement ─► commit ─► check ─► [scope | impact | simplicity] ─► gate ─► open_pr
             │                    └─red─► repair (max 3) ─► commit ─► check ...
             └─unclear criterion─► comment + status:refining
```

- Works in a sibling worktree (`<repo>-xp-<issue>`, branch `xp/<issue>`), never in your checkout. A rerun resumes it.
- Agents only change files; scripts commit, push, open the PR and move labels.
- Expects the xp labels from `xp-setup` and `frankherchet/skills` checked out next to this repo.

```sh
conductor validate xp-deliver.yaml
conductor run xp-deliver.yaml --web --input repo=$HOME/git/<repo> --input issue=<n>
```
