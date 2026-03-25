# Migration: 0.5.0

## Version
0.5.0

## What Changed
- Extracted 4 sections from the Orchestrator into standalone non-user-invocable skills:
  - `pre-flight` — version sanity check, invoked via subagent (structured PASS/FAIL/WARN return)
  - `sprint-lifecycle` — phases 2-6 procedural instructions (on-demand read)
  - `worktree-management` — git worktree lifecycle and rules (on-demand read)
  - `blackboard-init` — routing.md template and initialization (on-demand read)
- Orchestrator reduced from ~330 to ~200 lines; extracted content loaded on demand
- All 4 new skills have `user-invocable: false`

## Steps

1. **Verify new skill files exist:** Confirm these 4 files are present:
   - `.github/skills/pre-flight/SKILL.md`
   - `.github/skills/sprint-lifecycle/SKILL.md`
   - `.github/skills/worktree-management/SKILL.md`
   - `.github/skills/blackboard-init/SKILL.md`

2. **Verify Orchestrator references skills:** Read `.github/agents/orchestrator.agent.md` and confirm:
   - The "Pre-flight Check" section references the `pre-flight` skill via subagent
   - The "Workflow Phases" section references `sprint-lifecycle` for phases 2-6
   - The "Parallel Execution" section references `worktree-management`
   - The "Blackboard Protocol" section references `blackboard-init`

3. **Verify Orchestrator does NOT contain extracted content:** Confirm the Orchestrator no longer contains:
   - The inline pre-flight procedure (read .version / .migrated steps)
   - Phase 2-6 detailed instructions
   - The routing.md template block
   - The worktree lifecycle bash commands and rules

## Validation
- [ ] `.github/skills/pre-flight/SKILL.md` exists with `user-invocable: false`
- [ ] `.github/skills/sprint-lifecycle/SKILL.md` exists with `user-invocable: false`
- [ ] `.github/skills/worktree-management/SKILL.md` exists with `user-invocable: false`
- [ ] `.github/skills/blackboard-init/SKILL.md` exists with `user-invocable: false`
- [ ] Orchestrator contains skill references for all 4 extracted sections
- [ ] Orchestrator Phase 1 (Intake) is still fully inline
- [ ] All agent frontmatter shows `version: "0.5.0"`
- [ ] `.tstack/.version` reads `0.5.0`

## Scout Re-scan
Not required
