<!-- .github/copilot-instructions.md -->
<!-- Auto-maintained. Process anchor is framework-shipped. Project index is Scout-generated. -->

<!-- #region T-STACK:PROCESS-ANCHOR — framework-shipped, updated by /update -->
<!-- T-STACK:PROCESS-ANCHOR — passive context for all agents -->
<!-- MANDATORY: follow phase sequence. NEVER skip phases unless human explicitly says so. -->

WORKFLOW: P1:INTAKE → P2:PLANNING → P3:REFINEMENT → P4:IMPL → P4.5:ENG-REVIEW → P5:REVIEW → P6:COMPLETE

P1:INTAKE|Read .tstack/{project,decisions,routing}.md FIRST|Classify: Trivial/Small/Medium/Large/Ambiguous|DEFAULT=ASK before acting|Restate understanding→wait for confirm
P2:PLANNING|Architect→plan.md in .tstack/sprints/SPRINT-XXX/|Register routing.md status=planning
P3:REFINEMENT|Summarize plan to human (NOT raw file)|Loop approve/adjust/reject|Status→approved|⚠️GATE:human must approve before P4
P4:IMPL|Worktrees if parallel work|Developer+Tester|Arch↔Dev debate MAX 2 ROUNDS then human decides|Status→in-progress|Dev may consult SeniorEng (optional)
P4.5:ENG-REVIEW|SKIP for Trivial/Small|SeniorEng reviews|Dispute rounds: MUST-FIX=2,SHOULD-FIX=1,CONSIDER=0(advisory)
P5:REVIEW|SecAudit+Tester IN PARALLEL (adversarial)|Findings: CRIT/HIGH→must-fix→Dev, MED→human decides, LOW→note only|Dev↔Reviewer MAX 1 ROUND then human|⚠️GATE:human approves final
P6:COMPLETE|GitOps: merge+clean worktrees+DONE.md+sprint-index|Scribe: log decisions+update docs|Verify routing.md=active-only|⚠️GATE:human approves merge

BLACKBOARD|Read: project.md→decisions.md→routing.md (this order, before ANY work)|routing.md: read-fresh-before-write (concurrency)|routing.md=active work ONLY, no history|Each session owns its sprint entry only
DELEGATION|Prefix: "Run the agent as a subagent to complete this task:"|Include: task desc+relevant context+expected output+file scope|NO vague prompts, NO full blackboard dumps
WORKTREES|.tstack/worktrees/|Branch: tstack/SPRINT-XXX-name|Merge conflict→STOP→escalate to human
AGENTS|setup→Scout|plan→Architect→Scribe|impl→Architect→Developer→SeniorEng→Tester|bug→Developer→Tester|review→SeniorEng+SecAudit+Tester(∥)|refactor→CodeHealth→Architect→CodeHealth→Tester|cicd→DevOps|git→GitOps|docs→Scribe
<!-- #endregion T-STACK:PROCESS-ANCHOR -->

# Engineering Principles

- Simplicity over cleverness. Boring, readable code wins.
- YAGNI — don't build what isn't needed yet.
- Refactor, don't layer. When adding to existing code, reshape it — don't just append.
- Functions do one thing, under 40 lines. Max 3 nesting levels. Guard clauses and early returns.
- DRY — single source of truth. Extract duplication, don't copy-paste.
- Names describe intent: verbs for functions, nouns for data. No abbreviations requiring context.
- Never hardcode secrets. Least privilege by default.
- Comments explain "why", never "what". No commented-out code.

<!-- #region T-STACK:PROJECT-INDEX — Scout-generated, do not hand-edit -->
## Project Index

<!-- Populated by deep-scan skill. Run the Orchestrator to scan and build the index. -->
<!-- #endregion T-STACK:PROJECT-INDEX -->
