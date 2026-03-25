---
name: blackboard-init
description: "Template and procedure for initializing .tstack/routing.md when it does not exist. Contains the full routing.md scaffold with Active Sprints, Active Worktrees, and Task Queue tables."
user-invocable: false
---

# Blackboard Initialization — routing.md

Reference instructions for the Orchestrator. Load this skill when `.tstack/routing.md` does not exist and needs to be created.

## When to Use

If `.tstack/routing.md` does not exist during the Blackboard Protocol check, use this template to create it.

## Template

Create `.tstack/routing.md` with the following content:

```markdown
# Task Routing & Status

> Tracks the current state of ALL **active** work across sessions. Updated by the Orchestrator.
> **IMPORTANT:** Read this file fresh before every write — multiple sessions may update concurrently.
> Completed sprints are marked with `DONE.md` and indexed in `.tstack/sprint-index.md`. This file should only contain in-progress items.

## Active Sprints

| Sprint ID | Goal | Status | Worktree | Session |
|:---|:---|:---|:---|:---|
| | | | | |

> **Status values:** `intake` → `planning` → `approved` → `in-progress` → `in-review` → `complete`
> Once a sprint reaches `complete`, the GitOps agent creates a `DONE.md` marker, updates `sprint-index.md`, and removes it from this file.

## Active Worktrees

| Worktree Path | Branch | Sprint/Story | Assigned Agents | Status |
|:---|:---|:---|:---|:---|
| | | | | |

## Task Queue

| ID | Task | Sprint | Assigned To | Status | Worktree |
|:---|:---|:---|:---|:---|:---|
| | | | | | |
```
