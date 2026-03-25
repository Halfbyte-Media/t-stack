x# SPRINT-004: Skill Extraction from Orchestrator

## Goal
Extract 4 procedural sections from the Orchestrator agent into standalone non-user-invocable skills to reduce base context size by ~40%.

## Skills Created
1. `pre-flight` — version sanity check (subagent execution pattern)
2. `sprint-lifecycle` — phases 2-6 instructions (on-demand read)
3. `worktree-management` — git worktree lifecycle (on-demand read)
4. `blackboard-init` — routing.md template (on-demand read)

## Tasks
- [x] Create 4 skill files
- [x] Edit Orchestrator to reference skills
- [x] Version bump 0.4.0 → 0.5.0
- [x] Migration entry
- [x] Sync to src/
- [x] Update .migrated, log ADR, close sprint
