---
name: worktree-management
description: "Procedural instructions for creating, managing, and cleaning up git worktrees for parallel execution. Covers when to use worktrees, the full lifecycle, naming conventions, and isolation rules."
user-invocable: false
---

# Parallel Execution with Git Worktrees

Reference instructions for the Orchestrator. Load this skill when the sprint plan identifies parallelizable work.

## When to Use Worktrees

- **Multiple stories/features** assigned in a single sprint — each story gets its own worktree.
- **Large refactors** where independent modules can be changed in parallel.
- **Concurrent dev + test** — Developer implements in one worktree while Tester writes tests against main.
- **NOT for** small single-file changes, bug fixes, or sequential work.

## Worktree Lifecycle

1. **Create the branch and worktree:**
   ```bash
   git branch tstack/SPRINT-XXX-story-name
   git worktree add .tstack/worktrees/SPRINT-XXX-story-name tstack/SPRINT-XXX-story-name
   ```
2. **Register it** in `.tstack/routing.md` under the Active Worktrees table.
3. **Delegate** to sub-agents with the worktree path in the prompt:
   - Tell the Developer/Tester: "Your working directory is `.tstack/worktrees/SPRINT-XXX-story-name/`"
   - The sub-agent must operate ONLY within that directory.
4. **Monitor** — check worktree status as agents report back.
5. **Merge** when the workstream is complete, reviewed, and tests pass:
   ```bash
   git checkout main
   git merge tstack/SPRINT-XXX-story-name
   ```
6. **Cleanup** after successful merge:
   ```bash
   git worktree remove .tstack/worktrees/SPRINT-XXX-story-name
   git branch -d tstack/SPRINT-XXX-story-name
   ```
7. **Update** `.tstack/routing.md` — remove the worktree entry, mark the task complete.

## Worktree Rules

- All worktree directories live under `.tstack/worktrees/` — never pollute the project root.
- Branch naming convention: `tstack/SPRINT-XXX-short-name`.
- Each sub-agent must be told its worktree path explicitly. Agents must not cross worktree boundaries.
- If two worktrees touch the same file, flag a **merge conflict risk** to the human before proceeding.
- Always merge back to the base branch (usually `main`) — never merge between worktrees directly.
- On merge conflicts: stop, report the conflict to the human, and wait for guidance. Do NOT auto-resolve.
