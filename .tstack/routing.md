# Task Routing & Status

> Tracks the current state of ALL **active** work across sessions. Updated by the Orchestrator.
> **IMPORTANT:** Read this file fresh before every write — multiple sessions may update concurrently.
> Completed work is archived to `.tstack/archive.md` by the GitOps agent. This file should only contain in-progress items.

## Active Sprints

| Sprint ID | Goal | Status | Worktree | Session |
|:---|:---|:---|:---|:---|
| | | | | |

> **Status values:** `intake` → `planning` → `approved` → `in-progress` → `in-review` → `complete`
> Once a sprint reaches `complete`, the GitOps agent archives it and removes it from this file.

## Active Worktrees

| Worktree Path | Branch | Sprint/Story | Assigned Agents | Status |
|:---|:---|:---|:---|:---|
| | | | | |

## Task Queue

| ID | Task | Sprint | Assigned To | Status | Worktree |
|:---|:---|:---|:---|:---|:---|
| | | | | | |
