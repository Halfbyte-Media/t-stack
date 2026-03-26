# Architectural Decisions Log

> Append-only. Each entry records a key decision made during development.  
> Format: `### [ID] Title` followed by context, decision, and rationale.

---

### [ADR-001] Version tracking via two-file system
**Date:** 2026-03-24
**Status:** Accepted
**Context:** T-Stack needs a way to detect when framework files have been updated but the workspace hasn't been migrated.
**Decision:** Use two files: `.tstack/.version` (framework, shipped in distro) tracks what's installed; `.tstack/.migrated` (state, not shipped) tracks what version migrations have been applied through.
**Rationale:** A two-file system makes it impossible to accidentally skip migration by copying all files. The version mismatch is always detectable.
**Alternatives Considered:**
- Single file + agent frontmatter comparison — rejected because user accidentally copying `.tstack/.version` silently bypasses migration detection.

---

### [ADR-002] Setup and Update as Skills, not Agents
**Date:** 2026-03-24
**Status:** Accepted
**Context:** First-time initialization and post-update migration need dedicated workflows.
**Decision:** Implement `/setup` and `/update` as VS Code Copilot Skills (SKILL.md files in `.github/skills/`) rather than custom agents.
**Rationale:** These are procedural, on-demand workflows — exactly what skills are designed for. They don't need persistent persona, tool restrictions, or subagent capabilities that agents provide.
**Alternatives Considered:**
- Custom agents — rejected because setup/update are single-purpose procedures, not ongoing roles.

---

### [ADR-003] Agent frontmatter version field for sanity checking
**Date:** 2026-03-24
**Status:** Accepted
**Context:** Need to detect partial copies where some agent files are updated and others aren't.
**Decision:** Add `version: "X.Y.Z"` to every agent's YAML frontmatter. Used for validation during `/setup` and `/update`.
**Rationale:** Gives a per-file integrity check. Combined with `.tstack/.version`, detects partial or stale installs.

---

### [ADR-004] Sequential migration directory structure
**Date:** 2026-03-24
**Status:** Accepted
**Context:** Consumers need a structured way to upgrade between T-Stack versions.
**Decision:** `migrations/<version>/migration.md` directories with agent-readable instructions. Migrations run sequentially from `.migrated` to `.version`.
**Rationale:** Agent-readable markdown allows the `/update` skill to execute migrations autonomously. Sequential execution ensures no steps are skipped.

---

### [ADR-005] `.migrated` added to `.gitignore`
**Date:** 2026-03-24
**Status:** Accepted
**Context:** `.tstack/.migrated` is local state tracking which version a workspace has been migrated to.
**Decision:** Add `.tstack/.migrated` to `.gitignore` so it's not committed to version control.
**Rationale:** Each developer's workspace has its own migration state. Committing it could cause false "already initialized" for teammates.

---

### [ADR-006] Pre-flight version sanity check in all agents
**Date:** 2026-03-24
**Status:** Superseded by ADR-008
**Context:** Every agent needs to verify T-Stack is properly set up before doing work.
**Decision:** Add a standardized "Pre-flight Check" section to every agent's markdown body that compares `.version`, `.migrated`, and frontmatter `version:`.
**Rationale:** Catches misconfiguration early with actionable messages pointing users to `/setup` or `/update`.

---

### [ADR-007] Version bump 0.2.0 → 0.3.0
**Date:** 2026-03-24
**Status:** Accepted
**Context:** SPRINT-003 introduces new skills, new directories, new frontmatter fields, and a new workflow.
**Decision:** Minor version bump to 0.3.0 per semver policy (new capabilities, no breaking changes).
**Rationale:** This sprint adds setup/update skills, migrations directory, pre-flight checks, and version tracking — all new functionality.

---

### [ADR-008] Pre-flight check Orchestrator-only
**Date:** 2026-03-24  
**Status:** Accepted (supersedes ADR-006)  
**Context:** The pre-flight version check was initially added to all 10 agents. This creates significant context overhead since every sub-agent invocation includes the full pre-flight instructions, even though the Orchestrator already runs the check before delegating.  
**Decision:** Keep the pre-flight check ONLY in the Orchestrator. Sub-agents inherit the guarantee via delegation — the Orchestrator won't delegate if the check fails.  
**Rationale:** Reduces token overhead on every sub-agent call. The Orchestrator is the single entry point for users, so the check at entry is sufficient.

---

### [ADR-009] Scout not user-invocable
**Date:** 2026-03-24  
**Status:** Accepted  
**Context:** Scout was originally user-invocable so users could run `@scout Scan this project`. With the `/setup` skill now handling initialization (which invokes Scout internally), direct user access to Scout is redundant.  
**Decision:** Set Scout to `user-invocable: false`. Users interact through the Orchestrator or `/setup` skill only.  
**Rationale:** Single entry point design. Reduces user confusion about which agent to invoke. Scout remains available as a sub-agent for Orchestrator delegation.

---

### [ADR-010] Skill extraction for Orchestrator context reduction
**Date:** 2026-03-24
**Status:** Accepted
**Context:** The Orchestrator's ~330-line definition inflates base context on every interaction. Most procedural sections (pre-flight, sprint phases 2-6, worktree management, blackboard init) are only needed situationally.
**Decision:** Extract 4 sections into non-user-invocable skills loaded on demand. Pre-flight uses subagent execution (structured PASS/FAIL/WARN return). Sprint-lifecycle, worktree-management, and blackboard-init use on-demand readFile.
**Rationale:** Reduces Orchestrator base context by ~40% (~130 lines). Skills are loaded only when needed. The subagent pattern for pre-flight keeps procedural token cost out of the Orchestrator's context entirely.
**Alternatives Considered:**
- Extract into separate agents — rejected; these are procedures, not roles.
- Keep inline with comments — rejected; doesn't reduce context size.
- Extract all 4 as subagent-executed — rejected; reference skills don't produce a return value, they provide instructions the Orchestrator itself follows.

---

### [ADR-011] Senior Engineer agent for engineering quality review
**Date:** 2026-03-24
**Status:** Accepted
**Context:** The Developer agent had no engineering quality feedback loop before formal review (Security Auditor + Tester). Code style, naming, patterns, and maintainability issues were only caught late or not at all.
**Decision:** Add a Senior Engineer agent operating in Phase 4.5 (between Implementation and Formal Review). Constructive mentor tone, structured review format (APPROVE/REQUEST_CHANGES/COMMENT with MUST-FIX/SHOULD-FIX/CONSIDER severities), max 1 dispute round. Triggered for Medium+ complexity only. Also supports Developer-initiated consultation during Phase 4.
**Rationale:** Multi-agent debate research (ChatDev, MetaGPT, CrewAI patterns) shows that a constructive review pass improves final code quality while keeping the adversarial formal review (Phase 5) focused on security and correctness. Separate agent avoids scope creep in Developer or Security Auditor roles. Context isolation via subagent execution keeps review reasoning out of other agents' context windows.
**Alternatives Considered:**
- Expand Developer with self-review — rejected; same agent can't objectively review its own work.
- Add review to Security Auditor — rejected; conflates security review with engineering quality, bloats one agent.
- External library/framework — rejected; no libraries needed for Markdown-based agent coordination.

---

### [ADR-012] .gitignore generation at setup time instead of distribution
**Date:** 2026-03-24
**Status:** Accepted
**Context:** T-Stack distributed a `src/.gitignore` that was synced bidirectionally. This file contained a dogfood-only rule (`**/*.md`) that could leak to consumer projects. Maintaining a separate "clean" version for distribution added complexity.
**Decision:** Remove `src/.gitignore` from the distribution. The `/setup` skill now generates `.gitignore` entries at initialization time — creating the file if missing, appending T-Stack entries (`.tstack/worktrees/`, `.tstack/.migrated`) under a `# T-Stack` header with dedup. Setup also offers project-specific entries based on the Scout profile. Sync scripts no longer sync `.gitignore`.
**Rationale:** Prevents dogfood-only rules from leaking to consumers. Allows personalization per project. Makes `.gitignore` user-owned after setup (no overwrites on update). Simpler than maintaining two versions of the file.
**Alternatives Considered:**
- Maintain a separate clean `src/.gitignore` without the `**/*.md` rule — rejected; adds maintenance burden and still overwrites user customizations on update.
- Do nothing — rejected; the `**/*.md` rule would eventually cause problems for users who don't notice it ignoring their markdown files.

---

### [ADR-013] Pre-flight auto-creates .migrated for new developers
**Date:** 2026-03-24
**Status:** Accepted
**Context:** `.tstack/.migrated` is gitignored (ADR-005), so new developers cloning an already-initialized project won't have it. The pre-flight check used to FAIL in this case, telling them to run `/setup` — but `/setup` would re-scan and re-initialize unnecessarily since the project is already set up.
**Decision:** When `.migrated` is missing during pre-flight, check if `.tstack/.version` exists and `agent-version` matches. If everything is consistent, silently create `.migrated` with the current version and continue. Only FAIL if `.version` is also missing or versions don't match.
**Rationale:** New devs get a seamless onboarding experience — no manual `/setup` needed for an already-initialized project. The version consistency check prevents false positives (e.g., a genuinely uninitialized project won't have matching agent versions).
**Alternatives Considered:**
- Keep the FAIL and require `/setup` — rejected; unnecessary friction for new team members on established projects.
- Commit `.migrated` to the repo — rejected; conflicts with ADR-005 rationale (each developer's migration state is local).

---

### [ADR-014] npx CLI as primary distribution mechanism
**Date:** 2026-03-25
**Status:** Accepted
**Context:** T-Stack was previously distributed by manually copying files from `src/` into target projects. As the framework grows and more users adopt it, this manual process is tedious and error-prone. Multiple distribution options were evaluated: npx CLI, GitHub CLI extension, degit, bootstrap scripts, GitHub template repo, and VS Code extension. See also ADR-001 (version tracking) and ADR-002 (setup/update as skills).
**Decision:** Build `tstack-agents` — an npx-installable CLI package with `init` and `update` commands. Zero runtime dependencies. Published to npm via GitHub Actions on release tags. A VS Code extension is planned as a future premium experience (post-1.0).
**Rationale:**
- npx is cross-platform and near-universal among VS Code users (Node.js prerequisite)
- Single memorable command (`npx tstack-agents init`)
- Full control over framework vs. state file distinction via a file manifest
- npm handles distribution, versioning, and CDN
- `npx tstack@latest` ensures users always get the latest version
- Zero deps constraint: nothing left behind in target projects
**Alternatives Considered:**
- GitHub CLI extension — viable but requires `gh` CLI, narrower audience.
- degit — no state-file protection on update, not viable.
- Bootstrap scripts (curl|sh) — two scripts to maintain, security controversy.
- GitHub template repo — only works for new projects, no update story.
- VS Code extension — best UX ceiling but highest implementation cost, deferred to post-1.0.

---

### [ADR-015] Passive context via copilot-instructions.md
**Date:** 2026-03-26
**Status:** Accepted
**Context:** Vercel research showed skills had 53% pass rate (agents failed to invoke 56% of the time) while AGENTS.md passive context achieved 100%. T-Stack agents similarly suffer from context drift in long conversations — forgetting workflow phases, debate limits, and human gates.
**Decision:** Create `.github/copilot-instructions.md` with three sections: (1) compressed T-Stack process anchor (~1.4KB pipe-delimited), (2) universal engineering principles (8 bullets), (3) Scout-generated project index placeholder. Process anchor and principles are framework-shipped; project index is state.
**Rationale:** `copilot-instructions.md` is VS Code Copilot's native passive injection mechanism — loaded into every interaction automatically. This eliminates the "decision to look" failure mode. Region markers enable framework updates without overwriting Scout-generated content.

---

### [ADR-016] Two-tier engineering principles distribution
**Date:** 2026-03-26
**Status:** Accepted
**Context:** A "god prompt" of engineering principles (simplicity, SRP, DRY, TDD, least privilege, etc.) was available but would bloat context if applied monolithically.
**Decision:** Tier 1 — universal principles in copilot-instructions.md (all agents, passive). Tier 2 — role-specific additions inline in 6 agent definitions (Developer, Senior Engineer, Code Health, Tester, Security Auditor, Architect). No duplication between tiers.
**Rationale:** Universal principles (YAGNI, boring code) benefit all agents passively. Role-specific principles (AAA test pattern, least privilege scanning) belong where they're actionable. Inline additions in agent files are themselves passive context for that agent.

---

### [ADR-017] Deep-scan skill for comprehensive project analysis
**Date:** 2026-03-26
**Status:** Accepted
**Context:** The existing Scout surface scan produces a project profile (~150 lines) answering "what is this project?" but lacks the depth agents need for implementation decisions — module graphs, API surfaces, security boundaries, test coverage maps.
**Decision:** Create `/deep-scan` skill that generates (1) full topic-based docs in `.tstack/docs/` (7 files), (2) compressed pipe-delimited index (~8KB) written into copilot-instructions.md Project Index section, (3) scan metadata for staleness detection.
**Rationale:** The deep-scan output format follows Vercel's two-tier approach: compressed index for passive context (always loaded), full docs for on-demand retrieval. Pipe-delimited format maximizes information density for agent consumption. Skill is invoked by Scout, not directly by users.

---

### [ADR-018] "Additive Debt" as first-class code smell category
**Date:** 2026-03-26
**Status:** Accepted
**Context:** AI-assisted codebases exhibit a specific technical debt pattern: functions that grow by accretion (new logic appended at the bottom instead of integrated into the structure), single-site wrappers that add indirection without abstraction.
**Decision:** Add "Additive Debt" as a new analysis category in the Code Health agent, alongside existing categories (God Objects, Cyclomatic Complexity, etc.).
**Rationale:** This pattern is the #1 technical debt signature in AI-generated code and previously had no vocabulary in the Code Health agent's smell catalog. Naming it makes it detectable and actionable.

---

### [ADR-019] Version bump 0.6.0 → 0.7.0
**Date:** 2026-03-26
**Status:** Accepted
**Context:** SPRINT-007 introduces new file (copilot-instructions.md), new skill (deep-scan), new directory (.tstack/docs/), and enhances 6 agent definitions.
**Decision:** Minor version bump per semver policy — new capabilities, no breaking changes.
**Rationale:** Aligns with AGENTS.md versioning policy: new agents, skills, blackboard files, or workflow changes = minor bump.

---

### [ADR-020] copilot-instructions.md is a hybrid file
**Date:** 2026-03-26
**Status:** Accepted
**Context:** SPRINT-007 originally classified `copilot-instructions.md` as a framework file, included in sync scripts for bulk-copy distribution. Post-implementation review revealed this would destroy the Scout-generated Project Index (state data) on every framework update, since bulk-copy happens before migration scripts run.
**Decision:** Reclassify `copilot-instructions.md` as "hybrid" — a file containing both framework regions (process anchor, engineering principles) and state regions (Project Index). It is NOT included in sync scripts or bulk-copy. `/setup` creates it from a template. `/update` migrations surgically update framework regions using HTML comment region markers while preserving state regions.
**Rationale:** The file must be always-available (passive context), but its Project Index section is generated by Scout deep-scan and is unique to each project. Region markers (`<!-- #region ... -->` / `<!-- #endregion ... -->`) enable surgical updates without a custom diffing system. This prevents the "overwrite-then-migrate" failure mode where state data is lost before the migration script can preserve it.
**Alternatives Considered:**
- Keep as framework file with post-copy restore — rejected; bulk-copy destroys state before migration can preserve it.
- Split into two files (framework + state) — rejected; VS Code only supports one `copilot-instructions.md` for passive injection.

---

### [ADR-021] Auto-generated version.json manifest replaces hand-maintained file list
**Date:** 2026-03-26
**Status:** Accepted (supersedes ADR-003 partial — agent frontmatter version field removed)
**Context:** The manual file list in `manifest.mjs` required hand-updating whenever agents, skills, or framework files were added/renamed. Version bumps touched 15+ files (every agent frontmatter `version:` field), creating noisy git diffs.
**Decision:** Replace the hand-maintained manifest array with an auto-generated `version.json` containing SHA-256 content hashes for every framework file. The generator (`scripts/generate-version.mjs`) discovers files by convention (extensions, directory patterns) instead of maintaining a file list. Agent frontmatter `version:` fields are removed entirely — hashes provide stronger integrity guarantees. `package.json` is the single version source of truth.
**Rationale:** Convention-based discovery means adding a new agent or skill requires zero manifest maintenance. Content hashes detect any file modification, not just version mismatches. Version bumps now touch only `package.json` — the pre-commit hook regenerates everything else.
**Alternatives Considered:**
- Keep agent frontmatter versions for human readability — rejected; hashes are superior for integrity and the version string in version.json serves the human-readable need.

---

### [ADR-022] SessionStart hook replaces AI-invoked pre-flight skill
**Date:** 2026-03-26
**Status:** Accepted (supersedes ADR-006, ADR-008, ADR-013)
**Context:** The pre-flight check was an AI skill invoked by the Orchestrator as a subagent. This was non-deterministic — the LLM could forget, misparse results, or skip the check entirely in long conversations. It also consumed tokens on every conversation start.
**Decision:** Replace the AI-invoked pre-flight skill with a deterministic VS Code `SessionStart` hook (`scripts/pre-flight.mjs`). The hook runs automatically before any agent is invoked, reads `version.json` and `.migrated`, compares versions, and outputs structured JSON. Fail-open design (`continueOnFail: true`) ensures agent access is never blocked by hook failures.
**Rationale:** Deterministic execution eliminates the "decision to invoke" failure mode. Zero token cost (runs as a Node script, not an LLM call). Structured JSON output is unambiguous. Fail-open prevents user lockout from hook bugs.
**Alternatives Considered:**
- Keep as AI skill with stronger prompting — rejected; no prompting can guarantee 100% invocation.
- Fail-closed design — rejected; would block users if the hook script has a bug.

---

### [ADR-023] core.hooksPath for zero-dependency git hooks
**Date:** 2026-03-26
**Status:** Accepted
**Context:** The pre-commit hook that runs `generate-version.mjs` needs a reliable, zero-dependency mechanism.
**Decision:** Use `git config core.hooksPath scripts/hooks` to point git at committed hook scripts. One-time setup per clone, documented in AGENTS.md.
**Rationale:** Zero external dependencies — works with any git installation. Hook scripts are committed to the repo and versioned. No npm package or binary to install.
**Alternatives Considered:**
- lefthook — rejected; adds a binary dependency.
- husky — rejected; adds npm devDependency.

---

### [ADR-024] Hash-based smart update in CLI
**Date:** 2026-03-26
**Status:** Accepted
**Context:** The CLI `update` command previously copied all framework files unconditionally.
**Decision:** Hash on-disk files and compare to incoming version.json hashes. Skip files with matching hashes. Categorized dry-run output (skip/update/create with counts).
**Rationale:** Users see exactly what will change before applying. Unchanged files aren't touched, reducing noise.

---

### [ADR-025] Version bump 0.7.0 → 0.8.0
**Date:** 2026-03-26
**Status:** Accepted
**Context:** SPRINT-008 introduces structural changes (version.json manifest, SessionStart hook, pre-commit hook), removes agent frontmatter `version:` fields, deletes the pre-flight skill, and refactors CLI commands.
**Decision:** Minor version bump per semver policy — new capabilities and behavioral changes, no breaking directory structure changes.

---

### [ADR-026] Node.js pre-commit hook replacing shell script
**Date:** 2026-03-26
**Status:** Accepted
**Context:** The original pre-commit hook was a `#!/bin/sh` shell script without `set -e`. If `generate-version.mjs` failed, stale hashes would be committed (supply-chain risk). The team primarily uses PowerShell on Windows.
**Decision:** Replace the shell script with a Node.js script using `#!/usr/bin/env node` shebang. Uses `child_process.execSync` for git operations. Aborts commit on generation failure via `process.exit(1)`.
**Rationale:** Node.js ≥18 is already a hard prerequisite. The shebang works cross-platform (Git's bundled MSYS on Windows, native on Mac/Linux). Explicit try/catch error handling. Matches project conventions (ESM, node: builtins only). Shell syntax not needed.
**Alternatives Considered:**
- Add `set -e` to shell script — rejected; works but keeps team in a non-primary language.
- PowerShell hook — rejected; git invokes hooks via its bundled sh, not the user's shell.

---

### [ADR-027] Remove execute tool from Security Auditor
**Date:** 2026-03-26
**Status:** Accepted
**Context:** SPRINT-007 Phase 5 review found the Security Auditor had the `execute` tool in its YAML frontmatter despite being explicitly read-only ("You do NOT write implementation code — you analyze and report"). This violated least-privilege.
**Decision:** Remove `execute` from the Security Auditor's tools list. Tools: vscode, read, search, web.
**Rationale:** Aligns tool permissions with the agent's stated read-only charter. Eliminates prompt injection risk where a crafted file could trick the auditor into running commands.

---

### [ADR-028] Deep-scan sanitization constraint
**Date:** 2026-03-26
**Status:** Accepted
**Context:** The deep-scan skill reads source files and writes compressed summaries into `copilot-instructions.md` (passive context). Without sanitization, raw source content could be injected into every agent's context.
**Decision:** Add explicit constraint: "Never copy raw string content from source files into index entries. All index values must be agent-synthesized summaries. Validate pipe-delimited format before writing."
**Rationale:** The PROJECT-INDEX is injected into every Copilot interaction. Agent-synthesized summaries prevent prompt injection from source files.

---

### [ADR-029] Standardize region marker naming
**Date:** 2026-03-26
**Status:** Accepted
**Context:** copilot-instructions.md used `T-STACK:PROCESS-ANCHOR` for one region but just `PROJECT-INDEX` for the other. Inconsistent naming creates fragile regex matching for migration scripts.
**Decision:** Rename to `T-STACK:PROJECT-INDEX` for consistency. All region markers now use the `T-STACK:` prefix.
**Rationale:** Consistent naming convention makes region-matching reliable across migrations and skills.
