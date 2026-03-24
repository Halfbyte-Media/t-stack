# SPRINT-002: Archive Scalability & Memory Clarification

## Goal
Replace monolith `archive.md` with in-place sprint completion markers and a lightweight index. Clarify memory vs blackboard usage in agent instructions.

## Status: in-progress

## Tasks
1. [x] Rename archive.md → sprint-index.md with new format
2. [x] Update .tstack/README.md ownership table
3. [x] Update sprints/README.md with DONE.md convention
4. [x] Rewrite GitOps archival steps
5. [x] Update Orchestrator archive references
6. [x] Update Scribe archive references  
7. [x] Update routing.md header reference
8. [x] Update project.md structure/conventions
9. [x] Add memory vs blackboard clarification to relevant agents
10. [x] Sync all changes to src/

## Decisions
- D6: Sprint directories are permanent — completed sprints stay with DONE.md marker
- D7: archive.md replaced by sprint-index.md — one-row-per-sprint table
- D8: DONE.md is the completion signal
