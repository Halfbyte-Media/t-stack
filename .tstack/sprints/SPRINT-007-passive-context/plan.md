# SPRINT-007: Passive Context & Deep Scan

## Goal
Introduce `copilot-instructions.md` as a passive context anchor for all agents, create a `/deep-scan` skill for comprehensive project analysis, add engineering principle lines to 6 agents, and bump 0.6.0 → 0.7.0.

## Status
Approved — moving to implementation.

## Deliverables
1. `.github/copilot-instructions.md` — process anchor + engineering principles + project index placeholder
2. `.github/skills/deep-scan/SKILL.md` — comprehensive project analysis skill
3. Tier 2 agent modifications — engineering principles added to 6 agents
4. Framework housekeeping — version bump, migration, sync

## Execution Strategy
Sequential on main. No worktrees needed.

## Decisions
- D1: copilot-instructions.md uses region markers (framework vs state sections)
- D2: Deep-scan outputs full docs to .tstack/docs/ AND compressed index to copilot-instructions.md
- D3: .tstack/docs/ classified as state, not framework
- D4: Deep-scan skill NOT user-invocable
- D5: Agent modifications are inline additions, not restructured sections
- D6: No worktrees for this sprint
- D7: Version bump 0.6.0 → 0.7.0 (minor)
- D8: copilot-instructions.md added to sync scripts as explicit file entry
- D9: Pipe-delimited format for compressed index
- D10: Scan metadata uses simple key-value format
