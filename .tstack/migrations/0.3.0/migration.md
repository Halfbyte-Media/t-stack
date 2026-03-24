# Migration: 0.3.0

## Version
0.3.0

## What Changed
- Added `version: "0.3.0"` field to all 10 agent file frontmatter headers
- Added `argument-hint:` to user-invocable agents (orchestrator, scout)
- Added pre-flight version sanity check section to all 10 agent instruction bodies
- Created `/setup` skill at `.github/skills/setup/SKILL.md`
- Created `/update` skill at `.github/skills/update/SKILL.md`
- Created `.tstack/migrations/` directory with `0.2.0` baseline and `0.3.0` entries
- Introduced `.tstack/.migrated` state file (created by `/setup`, bumped by `/update`)
- Updated `.tstack/README.md` with `.migrated` documentation
- Trimmed initialization responsibilities from Scout — Scout now only scans and builds project profile
- Added `.tstack/.migrated` to `.gitignore`
- Pre-flight version check is now Orchestrator-only (removed from all other agents to reduce context overhead)
- Scout agent is no longer user-invocable (users interact via Orchestrator or /setup skill)

## Steps

1. **Verify agent frontmatter:** Read all 10 files in `.github/agents/`. Confirm each has `version: "0.3.0"` in its YAML frontmatter. List any that are missing or mismatched.

2. **Verify skills exist:**
   - Confirm `.github/skills/setup/SKILL.md` exists and has `name: setup` in frontmatter.
   - Confirm `.github/skills/update/SKILL.md` exists and has `name: update` in frontmatter.

3. **Verify migrations exist:**
   - Confirm `.tstack/migrations/0.2.0/migration.md` exists.
   - Confirm `.tstack/migrations/0.3.0/migration.md` exists (this file).

4. **Verify `.tstack/README.md`:** Confirm it documents the `.migrated` state file in the ownership table.

5. **Create or update `.tstack/.migrated`:**
   - If `.tstack/.migrated` does not exist, create it with content `0.3.0`.
   - If `.tstack/.migrated` exists and its value is less than `0.3.0`, overwrite with `0.3.0`.

6. **Remove pre-flight checks from non-Orchestrator agents:** Remove the "## Pre-flight Check" section from all agent `.agent.md` files EXCEPT `orchestrator.agent.md`.

7. **Update Scout frontmatter:** In `scout.agent.md` frontmatter, set `user-invocable: false` and remove `argument-hint:`.

## Validation
- [ ] `.tstack/.version` reads `0.3.0`
- [ ] `.tstack/.migrated` reads `0.3.0`
- [ ] All 10 agent files have `version: "0.3.0"` in frontmatter
- [ ] `.github/skills/setup/SKILL.md` exists
- [ ] `.github/skills/update/SKILL.md` exists
- [ ] `.tstack/migrations/0.2.0/migration.md` exists
- [ ] `.tstack/migrations/0.3.0/migration.md` exists
- [ ] Only `orchestrator.agent.md` contains a Pre-flight Check section
- [ ] Scout agent frontmatter has `user-invocable: false` and no `argument-hint`

## Scout Re-scan
Recommended — project structure has changed with new directories and skill files.
