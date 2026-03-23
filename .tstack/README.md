# T-Stack Blackboard

This directory is the shared memory substrate for the T-Stack agent team. Agents read from and write to these files to maintain context across sessions, tasks, and sprints.

## Structure

| File / Directory | Purpose | Written By |
|:---|:---|:---|
| `project.md` | Project profile — language, frameworks, structure, conventions | Scout |
| `team.md` | Team configuration — active roles and routing preferences | Orchestrator |
| `decisions.md` | Architectural decision log — append-only record of key choices | Scribe |
| `routing.md` | Current task state — active assignments and status | Orchestrator |
| `sprints/` | Per-task/sprint working directories for isolated context | All agents |

## Rules

1. **Append-only for decisions** — never edit or delete entries in `decisions.md`.
2. **Scribe owns documentation** — other agents propose; the Scribe commits to the log.
3. **Sprint directories are ephemeral** — archive or delete after task completion.
4. **Project profile is refreshed** — Scout re-scans when the Orchestrator detects drift.
