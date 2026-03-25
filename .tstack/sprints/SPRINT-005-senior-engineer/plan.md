# SPRINT-005: Senior Engineer Agent

## Goal
Add a new "Senior Engineer" agent to T-Stack — a constructive engineering quality reviewer that operates in Phase 4.5 between Implementation and Formal Review.

## Design Summary
- New agent: `senior-engineer.agent.md` (read-only, constructive tone, not adversarial)
- Phase 4.5: Engineering Review (Medium+ complexity only)
- Verdicts: APPROVE / REQUEST_CHANGES / COMMENT
- Severities: MUST-FIX / SHOULD-FIX / CONSIDER
- Two-way communication: Developer disputes (max 1 round) + mid-implementation consultation
- No external libraries needed

## Tasks
- [x] Create `senior-engineer.agent.md`
- [x] Update `sprint-lifecycle/SKILL.md` with Phase 4.5
- [x] Update `orchestrator.agent.md` (agents list, selection guide, phase summary)
- [x] Update `team.md` with Senior Engineer role
- [x] Resolve version decision (fold into 0.5.0 or bump to 0.6.0)
- [x] Create/update migration entry
- [x] Sync to src/
- [x] Log ADR-011
- [x] Close sprint
