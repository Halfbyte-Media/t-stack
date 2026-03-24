# SPRINT-003: Versioning, Setup & Update Skills

## Goal

Introduce a versioning and migration system for T-Stack. Create `/setup` and `/update` skills for first-time initialization and post-update migrations. Add version tracking to agent frontmatter, a pre-flight sanity check to every agent, a `migrations/` directory for structured upgrade paths, and an `AGENTS.md` dogfood governance doc. Bump framework version from `0.2.0` → `0.3.0`.

## Status: in-review

---

## Task List

### Task 1 — Create `AGENTS.md` (dogfood governance doc) [S]

**File:** `AGENTS.md` (project root only — NOT in `src/`)

**Description:** Define dogfood conventions, versioning policy, sync script usage, and file classification.

**Contents:**
- What "dogfood" means (t-stack developing itself)
- Semver policy: patch = fixes/wording, minor = new agents/files/workflow changes, major = breaking changes
- Both `.tstack/.version` and `src/.tstack/.version` must stay in sync
- `migrations/` directory: when to create a new entry, structure of `migration.md`
- `.migrated` file: state file (not framework), created by `/setup`, bumped by `/update`
- Version sanity check convention: agent frontmatter `version:` vs `.tstack/.version` vs `.tstack/.migrated`
- Framework-managed files vs state files (reference `.tstack/README.md` ownership table)
- Sync scripts are dogfood-only tooling (`scripts/sync-to-root.ps1`, `scripts/sync-to-src.ps1`)

**Dependencies:** None
**Parallelizable:** Yes

---

### Task 2 — Create Setup Skill [M]

**Files:**
- `.github/skills/setup/SKILL.md`
- `src/.github/skills/setup/SKILL.md` (identical copy for distribution)

**Description:** User-invocable `/setup` skill for first-time T-Stack initialization.

**YAML Frontmatter:**
```yaml
---
name: "setup"
description: "First-time T-Stack initialization. Validates install, creates .migrated tracking file, and invokes Scout to build project profile."
argument-hint: "Run this after copying T-Stack files into your project for the first time."
user-invocable: true
---
```

**Skill Logic (in markdown body):**

1. **Check `.tstack/.migrated` existence:**
   - If EXISTS → warn: "This project has already been initialized (`.tstack/.migrated` = X). If you want to re-initialize, delete `.tstack/.migrated` first and re-run `/setup`. If you just updated files, run `/update` instead."
   - If NOT exists → continue.

2. **Check `.tstack/.version` existence:**
   - If EXISTS → fresh install confirmed. Continue.
   - If NOT exists → broken install. Error: "`.tstack/.version` not found. Installation appears incomplete."

3. **Read `.tstack/.version`** (e.g., `0.3.0`).

4. **Validate agent frontmatter:**
   - Read all `.github/agents/*.agent.md` files.
   - Check each has `version:` in frontmatter matching `.tstack/.version`.
   - If mismatch → warn about partial copy.

5. **Create `.tstack/.migrated`** with content equal to `.tstack/.version`.

6. **Invoke Scout** to scan workspace and build `.tstack/project.md`.

7. **Report success.**

**Dependencies:** None
**Parallelizable:** Yes

---

### Task 3 — Create Update Skill [M]

**Files:**
- `.github/skills/update/SKILL.md`
- `src/.github/skills/update/SKILL.md` (identical copy for distribution)

**Description:** User-invocable `/update` skill for running migrations after updating T-Stack files.

**YAML Frontmatter:**
```yaml
---
name: "update"
description: "Run T-Stack migrations after updating framework files. Applies sequential migrations from current version to target version."
argument-hint: "Run this after updating T-Stack agent files to a new version."
user-invocable: true
---
```

**Skill Logic (in markdown body):**

1. **Pre-flight:** Read `.tstack/.migrated` and `.tstack/.version`.
   - `.migrated` missing → "Run `/setup` first."
   - `.version` missing → "Installation appears broken."

2. **Compare:** `.migrated` >= `.version` → "Already up to date." `.migrated` < `.version` → proceed.

3. **Validate agent frontmatter** — all must match `.tstack/.version`.

4. **Determine migration path** — list `migrations/` dirs, filter to versions > `.migrated` and <= `.version`, sort ascending.

5. **Execute sequentially** — read and follow each `migration.md`.

6. **Bump `.tstack/.migrated`** to `.tstack/.version`.

7. **Optional Scout re-scan** if migration recommends it.

8. **Report.**

**Dependencies:** None
**Parallelizable:** Yes

---

### Task 4 — Create Migrations Directory & Baseline [S]

**Files:**
- `src/migrations/0.2.0/migration.md` — baseline
- `src/migrations/0.3.0/migration.md` — this sprint's migration
- `migrations/0.2.0/migration.md` — dogfood copy
- `migrations/0.3.0/migration.md` — dogfood copy

**0.2.0 migration:** Baseline, no-op. Documents initial state and serves as template.

**0.3.0 migration:** Documents all changes from this sprint:
- Added `version:` to all agent frontmatter
- Added `argument-hint:` to user-invocable agents
- Added pre-flight version sanity check to all agents
- Created `/setup` and `/update` skills
- Created `migrations/` directory
- Added `.tstack/.migrated` state file
- Updated `.tstack/README.md`
- Trimmed Scout init responsibilities

Steps: validate agent files, verify skills exist, verify migrations exist, create/update `.migrated`.

**Dependencies:** None
**Parallelizable:** Yes

---

### Task 5 — Add `version:` and `argument-hint:` to Agent Frontmatter [M]

**Files:** All 20 agent files (10 root + 10 src)

**Changes:**
- Add `version: "0.3.0"` to every agent's YAML frontmatter
- Add `argument-hint:` to user-invocable agents only:
  - orchestrator: `"Describe the feature, bug, or task you want the team to work on."`
  - scout: `"Describe what to scan or research."`

**Dependencies:** None
**Parallelizable:** Yes — but combine with Tasks 6+7 in single pass per file

---

### Task 6 — Add Pre-flight Version Sanity Check to All Agents [M]

**Files:** Same 20 agent files as Task 5

**Changes:** Insert standardized section after H1 title, before first H2:

```markdown
## Pre-flight Check

Before executing any task, perform this version sanity check:

1. Read `.tstack/.version` and `.tstack/.migrated`.
2. **If `.migrated` does not exist** → respond: "T-Stack has not been initialized. Run `/setup` before proceeding." Do not continue.
3. **If `.migrated` < `.version`** → respond: "T-Stack files have been updated but migrations haven't run. Run `/update` before proceeding." Do not continue.
4. **If this agent's frontmatter `version:` does not match `.tstack/.version`** → warn: "This agent file may be stale or from a different T-Stack version." Proceed with caution.
5. If all checks pass, proceed normally.
```

**Dependencies:** Combine with Task 5 in single pass
**Parallelizable:** Yes (combined with 5+7)

---

### Task 7 — Trim Scout Initialization Responsibilities [S]

**Files:** `scout.agent.md` (root + src)

**Changes:** Reword "State file initialization" note to remove setup implications. Scout just scans and writes `project.md`.

**Dependencies:** Combine with Tasks 5+6 for scout file
**Parallelizable:** Yes (combined)

---

### Task 8 — Update Sync Scripts [S]

**Files:** `scripts/sync-to-root.ps1`, `scripts/sync-to-src.ps1`

**Changes:**
- Add `.github/skills` and `migrations` to framework files lists
- Add `src/.tstack/.migrated` to state files exclusion in sync-to-src

**Dependencies:** None
**Parallelizable:** Yes

---

### Task 9 — Update `.tstack/README.md` [S]

**Files:** `.tstack/README.md`, `src/.tstack/README.md`

**Changes:**
- Add `.migrated` row to ownership table
- Add rule: "`.migrated` is a state file — never manually edit, never sync to `src/`"

**Dependencies:** None
**Parallelizable:** Yes

---

### Task 10 — Version Bump to 0.3.0 [S]

**Files:** `.tstack/.version`, `src/.tstack/.version`

**Changes:** `0.2.0` → `0.3.0`

**Dependencies:** After Task 5 (frontmatter must reference 0.3.0 consistently)
**Parallelizable:** Late-stage task

---

## Dependency Graph

```
Phase A (parallel): Tasks 1, 2, 3, 4, 8, 9 — independent, no shared files
Phase B (combined):  Tasks 5 + 6 + 7 — single editing pass per agent file
Phase C (final):     Task 10 — bump .version files
Phase D (verify):    Sync check — run sync-to-src.ps1 -DryRun
```

## Risks & Open Questions

| # | Risk / Question | Mitigation |
|:--|:--|:--|
| R1 | `version:` is custom frontmatter — may not be parsed by VS Code | Acceptable — read by agent instructions, not YAML parser |
| R2 | Semver comparison requires agent to parse version strings | Keep strict `Major.Minor.Patch` format |
| R3 | Partial agent copy → pre-flight warns but doesn't block | By design — warn, not block |
| R4 | 20 agent files modified — large diff | All changes mechanical, verify post-edit |
| R5 | `.migrated` could be accidentally committed | Add to `src/.gitignore` |
| R6 | `.gitignore` for `.migrated` | **Decision needed:** Add `.tstack/.migrated` to `src/.gitignore`. Recommended YES. |

## Decisions

- **D-003-1:** Version field in YAML frontmatter as `version: "X.Y.Z"` (string-quoted)
- **D-003-2:** `argument-hint:` only on user-invocable agents (orchestrator, scout)
- **D-003-3:** Pre-flight check is markdown body section, not frontmatter directive
- **D-003-4:** Migrations are agent-readable markdown, not executable scripts
- **D-003-5:** `.migrated` is state file, never synced to `src/`, recommended for `.gitignore`
- **D-003-6:** Tasks 5+6+7 combined into single editing pass per agent file
- **D-003-7:** Version bump to `0.3.0` (minor — new files, skills, workflow capabilities)

## Complexity Summary

| Task | Description | Size | Files |
|:-----|:-----------|:-----|:------|
| 1 | AGENTS.md | S | 1 new |
| 2 | Setup Skill | M | 2 new |
| 3 | Update Skill | M | 2 new |
| 4 | Migrations Dir | S | 4 new |
| 5 | Agent Frontmatter | M | 20 modified |
| 6 | Pre-flight Check | M | 20 modified (same) |
| 7 | Scout Trim | S | 2 modified (subset) |
| 8 | Sync Scripts | S | 2 modified |
| 9 | README Update | S | 2 modified |
| 10 | Version Bump | S | 2 modified |
| **Total** | | | **9 new, ~24 modified** |
