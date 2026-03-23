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
