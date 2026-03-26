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
<!-- deep-scan | 2026-03-26T00:00:00Z | 00be5b4+uncommitted -->

STACK|Markdown,YAML,JavaScript(ESM)|VS Code Copilot Agent Framework|pre-commit hook|none|none
ENTRY|packages/cli/bin/cli.mjs|.github/agents/orchestrator.agent.md
BUILD|node scripts/generate-version.mjs|TEST|-|LINT|-|FMT|-

MOD|.github/agents/|agent-defs|.tstack/(blackboard)|11 agents: orchestrator,scout,architect,developer,tester,senior-eng,sec-audit,code-health,devops,gitops,scribe
MOD|.github/skills/|skill-defs|-|6 skills: setup,update,deep-scan,sprint-lifecycle,worktree-mgmt,blackboard-init
MOD|.github/hooks/|hook-cfg|-|pre-flight.json SessionStart hook
MOD|.github/workflows/|ci-cd|-|release.yml(gh-release),publish-cli.yml(npm-publish)
MOD|.tstack/|blackboard|all agents|state: project,decisions,routing,sprint-index,sprints/; fw: .version,README,team,migrations/
MOD|src/|distro-template|-|mirror of fw files for distribution; no state files
MOD|packages/cli/|npm-pkg|src/.tstack/version.json|CLI: init,update,version; zero-dep ESM Node.js>=18
MOD|packages/cli/lib/manifest.mjs|manifest-reader|files/.tstack/version.json|exports: framework[],initOnly[],frameworkHashes{},version
MOD|packages/cli/lib/init.mjs|cli-init|manifest.mjs|fn init(cwd,opts)->exitCode; copies fw+initOnly, manages .gitignore
MOD|packages/cli/lib/update.mjs|cli-update|manifest.mjs|fn update(cwd,opts)->exitCode; hash-compare, skip unchanged, dry-run
MOD|scripts/|dogfood-utils|-|generate-version.mjs,sync-to-root.ps1,sync-to-src.ps1,hooks/pre-commit

API|CLI|init|packages/cli/lib/init.mjs|none|path-traversal+payload-exists
API|CLI|update|packages/cli/lib/update.mjs|none|path-traversal+hash-compare
API|CLI|version|packages/cli/bin/cli.mjs|none|-
API|hook|SessionStart|.tstack/scripts/pre-flight.mjs|none|version-compare,fail-open
API|agent|@orchestrator|.github/agents/orchestrator.agent.md|none|blackboard-read
API|agent|@scout|.github/agents/scout.agent.md|none|-
API|skill|/setup|.github/skills/setup/SKILL.md|none|install-val+agent-val
API|skill|/update|.github/skills/update/SKILL.md|none|version-compare+migration-seq

TEST|packages/cli/bin/cli.mjs|NONE|-|-
TEST|packages/cli/lib/init.mjs|NONE|-|-
TEST|packages/cli/lib/update.mjs|NONE|-|-
TEST|packages/cli/lib/manifest.mjs|NONE|-|-
TEST|scripts/generate-version.mjs|NONE|-|-
TEST|.tstack/scripts/pre-flight.mjs|NONE|-|-

SEC|path-traversal|packages/cli/lib/init.mjs,update.mjs|path.resolve+startsWith check|every file write validated
SEC|symlink-protect|packages/cli/lib/init.mjs,update.mjs|lstatSync+unlinkSync|remove symlinks before copy
SEC|payload-integrity|packages/cli/lib/manifest.mjs|SHA-256 hashes in version.json|no external signature
SEC|ci-provenance|.github/workflows/publish-cli.yml|npm --provenance|links pkg to source repo
SEC|action-pinning|.github/workflows/*.yml|full commit SHA pins|supply chain protection
SEC|agent-permissions|.github/agents/*.agent.md|YAML tools field|least-privilege per role
SEC|fail-open|.tstack/scripts/pre-flight.mjs|always continue:true|never blocks session
SEC|secret-mgmt|.github/workflows/publish-cli.yml|NPM_TOKEN via GH secrets|no hardcoded secrets

CONF|NPM_TOKEN|gh-secrets|publish-cli.yml|-
CONF|NODE_AUTH_TOKEN|workflow-env|publish-cli.yml|from NPM_TOKEN
CONF|core.hooksPath|git-config|pre-commit|scripts/hooks
CONF|engines.node|package.json|cli runtime|>=18

DEPS|node:fs|builtin|file operations|current
DEPS|node:path|builtin|path manipulation|current
DEPS|node:crypto|builtin|SHA-256 hashing|current
DEPS|node:url|builtin|ESM __dirname|current
DEPS|node:module|builtin|createRequire|current
DEPS|actions/checkout|v4.2.2|CI checkout|current(pinned)
DEPS|actions/setup-node|v4.4.0|CI node setup|current(pinned)
DEPS|softprops/action-gh-release|v2.6.1|CI release|current(pinned)

CONV|file-naming|kebab-case|security-auditor.agent.md
CONV|agent-file|<role>.agent.md with YAML frontmatter|developer.agent.md
CONV|skill-file|<name>/SKILL.md with YAML frontmatter|setup/SKILL.md
CONV|migration-file|<version>/migration.md|0.7.0/migration.md
CONV|sprint-dir|SPRINT-XXX-short-name/|SPRINT-006-npx-cli/
CONV|blackboard-read|project->decisions->routing order|before any work
CONV|routing-concurrency|read-fresh-before-write|routing.md
CONV|decisions-log|append-only|decisions.md
CONV|delegation|"Run the agent as a subagent to complete this task:"|orchestrator pattern
CONV|error-handling|exit codes 0/1, guard clauses, fail-open|cli+pre-flight
CONV|version-tracking|two-file: .version(installed) vs .migrated(migrated-to)|version mismatch detection
CONV|file-classification|framework/state/hybrid/user-override/dogfood-only|5 categories
CONV|js-style|ESM, node: built-ins only, named exports, early returns|zero-dep philosophy
<!-- #endregion T-STACK:PROJECT-INDEX -->
