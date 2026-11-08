# xp-swarm

XP workflows from [frankherchet/skills](https://github.com/frankherchet/skills) as [Conductor](https://github.com/microsoft/conductor) graphs: deterministic checks and gates as scripts, judgment as parallel agents, human decisions as human gates.

Plan and acceptance criteria: [frankherchet/skills#16](https://github.com/frankherchet/skills/issues/16).

## xp-ship

```
check ─► [scope | impact | simplicity] ─► gate ─► human approval ─► PR
```

Expects `frankherchet/skills` checked out next to this repo (the xp plugin is loaded from `../skills/plugins/xp`).

```sh
conductor validate xp-ship.yaml
conductor run xp-ship.yaml --web --input repo=$HOME/git/<repo> --input issue=<n>
```
