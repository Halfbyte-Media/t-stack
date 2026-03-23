# T-Stack Blackboard

This directory is the shared memory substrate for the T-Stack agent team. Agents read from and write to these files to maintain context across sessions, tasks, and sprints.

## Structure

| File / Directory | Purpose | Written By |
|:---|:---|:---|
| `project.md` | Project profile — language, frameworks, structure, conventions | Scout |
| `team.md` | Team configuration — active roles and routing preferences | Orchestrator |
| `decisions.md` | Architectural decision log — append-only record of key choices | Scribe |
| `routing.md` | **Active** task state — only in-progress assignments and sprints | Orchestrator |
| `archive.md` | Completed sprint summaries — append-only historical reference | GitOps |
| `sprints/` | Per-task/sprint working directories for isolated context | All agents |

## Rules

1. **Append-only for decisions** — never edit or delete entries in `decisions.md`.
2. **Scribe owns documentation** — other agents propose; the Scribe commits to the log.
3. **Sprint directories are ephemeral** — GitOps archives and deletes them after completion.
4. **Project profile is refreshed** — Scout re-scans when the Orchestrator detects drift.
5. **routing.md is active-only** — completed work is moved to `archive.md` by GitOps. Do NOT let routing.md accumulate history.
6. **archive.md is read-rarely** — agents should NOT read the archive unless specifically asked to look up historical context. It is not part of the standard blackboard read on session start.
