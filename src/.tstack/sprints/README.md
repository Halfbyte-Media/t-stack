# Sprints Directory

Each sub-directory represents an isolated task or sprint context.

Structure per sprint:
```
sprints/
  SPRINT-001-feature-name/
    plan.md          # Task breakdown from Architect
    progress.md      # Running log from assigned agents
    review.md        # Review notes from Security/QA
```

## Git Worktree Integration

When a sprint uses parallel worktrees, the mapping is:

| Sprint Dir | Worktree Path | Branch |
|:---|:---|:---|
| `sprints/SPRINT-001-auth/` | `.tstack/worktrees/SPRINT-001-auth/` | `tstack/SPRINT-001-auth` |
| `sprints/SPRINT-002-api/` | `.tstack/worktrees/SPRINT-002-api/` | `tstack/SPRINT-002-api` |

- Sprint planning/docs stay in `sprints/` (shared across the team via the main branch).
- Actual code changes happen in the worktree's isolated directory and branch.
- The `.tstack/worktrees/` directory should be in `.gitignore` — worktrees are local, not committed.

## Sprint Lifecycle

1. **Active:** Sprint directory contains `plan.md`, `progress.md`, `review.md`. Listed in `routing.md`.
2. **Completed:** GitOps creates `DONE.md` in the sprint directory, appends a row to `sprint-index.md`, and removes the sprint from `routing.md`.
3. **History lookup:** Read `sprint-index.md` to find a sprint, then read that sprint's files for details.

### DONE.md Format

Created by GitOps on sprint completion:

```
# Completed: YYYY-MM-DD
**Outcome:** Success | Partial | Reverted
**Goal:** One-line summary of what this sprint accomplished.
```

### Rules
- Completed sprint directories (those containing `DONE.md`) are **ignored** by agents during normal operations.
- Only read a completed sprint when explicitly asked for historical context.
- Sprint directories are **never deleted** — they are the permanent archive.
