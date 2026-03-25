---
name: sprint-lifecycle
description: "Full procedural instructions for sprint phases 2-6 (Planning, Refinement, Implementation, Review, Complete). Includes Architect-Developer debate protocol and adversarial review protocol. Loaded by the Orchestrator after Intake is complete."
user-invocable: false
---

# Sprint Lifecycle — Phases 2 through 6

Reference instructions for the Orchestrator. Load this skill after Phase 1 (Intake) is complete and a sprint is being managed.

## Phase 2: PLANNING

1. Delegate to the **Architect** with the requirements and human's answers.
2. Create a sprint directory: `.tstack/sprints/SPRINT-XXX-short-name/`
3. Architect writes `plan.md` in that sprint directory.
4. Register the sprint in `.tstack/routing.md` with status `planning`.

## Phase 3: REFINEMENT

1. Present the Architect's plan to the human as a **summary** — not the raw plan file, but a clear overview:
   - What will be built
   - Key design decisions
   - Task breakdown (numbered)
   - Any risks or tradeoffs
2. Ask: "Approve, adjust, or reject?"
3. If the human requests changes, send the feedback back to the Architect for revision.
4. Loop until the human approves. Update sprint status to `approved`.

## Phase 4: IMPLEMENTATION

1. Set up worktree(s) if the plan identifies parallelizable work.
2. Delegate to **Developer** (and optionally **Tester** in parallel for TDD).
3. **If the Developer raises concerns about the plan:**
   - Review their feedback. If it's substantive (not just style preference), route it back to the **Architect** for a response.
   - The Architect must ACCEPT, REJECT, or COMPROMISE on each concern.
   - If ACCEPTED or COMPROMISED, the Architect revises the plan, and the Developer implements the updated version.
   - If REJECTED, present both positions to the human and let them decide. Do not loop more than once on the same concern.
   - **Max 2 rounds of Architect ↔ Developer debate per task.** After 2 rounds, present the disagreement to the human for final call.
4. Update sprint status to `in-progress`.
5. Monitor sub-agent progress. Relay any blockers to the human.
6. The human may start a **new session** for another story while this runs — that's expected.
7. **Developer consultation:** During implementation, the Developer may request a scoped consultation with the **Senior Engineer** on patterns, naming, or design questions. Route the question and return the brief recommendation. This is optional and Developer-initiated.

## Phase 4.5: ENGINEERING REVIEW

**Trigger:** After Phase 4 implementation is complete, for **Medium or higher complexity** tasks only. Skip for Trivial/Small tasks.

1. Delegate implemented code to the **Senior Engineer** for engineering quality review.
2. Provide the Senior Engineer with: list of modified files, the sprint plan for context, and the complexity classification.
3. Collect the review. The Senior Engineer returns a structured review with verdict (APPROVE / REQUEST_CHANGES / COMMENT) and findings with severity levels.
4. **If verdict is APPROVE or COMMENT:** Proceed to Phase 5.
5. **If verdict is REQUEST_CHANGES:**
   - Route the MUST-FIX findings back to the **Developer**.
   - The Developer responds to each finding: `FIXED`, `ACKNOWLEDGED`, or `DISPUTED`.
   - For `DISPUTED` items, route the Developer's reasoning back to the Senior Engineer.
   - The Senior Engineer responds: `ACCEPT` (withdraw) or `MAINTAIN` (uphold).
   - **Max dispute rounds scale by severity:** MUST-FIX gets 2 rounds, SHOULD-FIX gets 1, CONSIDER gets 0 (advisory only).
   - After max rounds, unresolved disputes auto-escalate to the Orchestrator — neither side wins by default.
6. After all MUST-FIX items are resolved (or escalated), proceed to Phase 5.

## Phase 5: REVIEW

1. When implementation is complete, invoke **Security Auditor** and **Tester** in parallel.
2. **Review is adversarial by design.** Reviewers should actively look for problems, not rubber-stamp.
3. Collect their reports. Categorize findings:
   - **Must-fix:** Issues the reviewer marks as CRITICAL or HIGH. Route back to Developer.
   - **Should-fix:** MEDIUM issues. Present to human — fix now or track for later?
   - **Note:** LOW issues. Include in the summary but don't block.
4. **If the Developer disagrees with a finding:**
   - The Developer explains why they believe the code is correct.
   - The reviewer (Security Auditor or Tester) responds: ACCEPT the explanation or MAINTAIN the finding.
   - If they can't agree after 1 round, present both positions to the human.
   - **Max 1 round of Developer ↔ Reviewer debate per finding.** No endless loops.
5. After all must-fix items are resolved, present the final review summary to the human.
6. Update sprint status to `in-review`.

## Phase 6: COMPLETE

1. On human approval, delegate to **GitOps** to:
   - Merge worktree branches (if used) and handle any merge conflicts.
   - Create `DONE.md` in the sprint directory and update `sprint-index.md`.
   - Clean `routing.md`.
   - Clean up worktrees and branches.
2. Have the **Scribe** log decisions and update docs.
3. Verify `routing.md` only contains active work after cleanup.

**Archive policy:** Completed sprints stay in their directories with a `DONE.md` marker and are indexed in `.tstack/sprint-index.md`. Sprint directories are never deleted. Agents do NOT read completed sprints unless specifically looking up historical context. This keeps `routing.md` and the active blackboard files lean.

4. Move tasks to the Completed table.

## Sprint Directory Management

For multi-step tasks:

1. Create a sprint directory: `.tstack/sprints/SPRINT-XXX-short-name/`
2. Have the **Architect** write `plan.md` in that directory.
3. Track progress in `progress.md` as sub-agents report back.
4. Collect reviews in `review.md` from Security Auditor and Tester.
5. Update `.tstack/routing.md` with the sprint status.
