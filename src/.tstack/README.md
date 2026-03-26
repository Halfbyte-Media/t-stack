# T-Stack Blackboard

This directory is the shared memory substrate for the T-Stack agent team. Agents read from and write to these files to maintain context across sessions, tasks, and sprints.

## Structure

| File / Directory | Owner | Shipped in Distro? | Purpose |
|:---|:---|:---|:---|
| `.version` | Framework | Yes | T-Stack version identifier |
| `.migrated` | Setup / Update skills | No — created by `/setup` | Migrated-to version tracker (state file for `/update` skill) |
| `README.md` | Framework | Yes | This file — blackboard structure docs |
| `team.md` | Framework | Yes | Default team config and routing preferences |
| `sprints/README.md` | Framework | Yes | Sprint directory structure docs |
| `project.md` | Scout agent | No — created on first scan | Project profile (language, frameworks, structure) |
| `decisions.md` | Scribe agent | No — created on first decision | Architectural decision log (append-only) |
| `routing.md` | Orchestrator | No — created on first sprint | Active task/sprint tracking |
| `sprint-index.md` | GitOps agent | No — created on first archival | Lightweight index of completed sprints |
| `migrations/` | Framework | Yes | Version migration scripts (one subdirectory per version) |
| `sprints/SPRINT-*` | All agents | No | Per-sprint working directories (permanent — completed sprints contain `DONE.md`) |
| `docs/` | Scout (deep-scan skill) | No | Deep analysis output — architecture, API surface, conventions, testing, security, build, dependencies |
| `team.local.md` | User | No — optional override | Custom team config that survives updates |

## Update Safety

Files marked "Shipped in Distro" are safe to overwrite when updating T-Stack. Files NOT in the distro are user/agent state — they are never overwritten because they simply aren't in the distribution package.

## Rules

1. **Append-only for decisions** — never edit or delete entries in `decisions.md`.
2. **Scribe owns documentation** — other agents propose; the Scribe commits to the log.
3. **Sprint directories are permanent** — completed sprints contain a `DONE.md` marker. Agents ignore directories with `DONE.md` during normal operations.
4. **Project profile is refreshed** — Scout re-scans when the Orchestrator detects drift.
5. **routing.md is active-only** — completed sprints are marked with `DONE.md` and indexed in `sprint-index.md`. Do NOT let routing.md accumulate history.
6. **sprint-index.md is read-rarely** — agents should NOT read the sprint index unless specifically asked to look up historical context.
7. **State files are agent-created** — if a state file is missing, that's normal for a fresh install. The owning agent creates it with proper headers when first needed.
8. **team.local.md overrides team.md** — agents read `team.local.md` first if it exists, falling back to `team.md`.
9. **`.migrated` is a state file** — created by the `/setup` skill, updated by `/update`. Never manually edit. Never sync to `src/`.
