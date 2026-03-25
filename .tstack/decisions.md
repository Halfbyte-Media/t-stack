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
