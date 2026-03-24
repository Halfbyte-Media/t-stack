# Migration: 0.4.0

## Version
0.4.0

## What Changed
- Moved `migrations/` directory from project root into `.tstack/migrations/` (consolidates all T-Stack files under `.tstack/`)
- `version:` property is now the first field in all agent YAML frontmatter (line 2 of each file)
- Setup and update skills optimized to read only line 2 for agent version checks
- Scout agent is now user-invocable (`user-invocable: true`)
- Agent frontmatter ordering convention documented in AGENTS.md

## Steps

1. **Delete old migrations directory:** If a `migrations/` directory exists at the project root, delete it. All migration files now live in `.tstack/migrations/`.

2. **Verify new migrations directory:** Confirm `.tstack/migrations/` exists and contains subdirectories for `0.2.0`, `0.3.0`, and `0.4.0`, each with a `migration.md` file.

3. **Verify agent frontmatter ordering:** For each `.github/agents/*.agent.md` file, read line 2 and confirm it contains `version: "0.4.0"`.

4. **Verify Scout is user-invocable:** Read `.github/agents/scout.agent.md` frontmatter and confirm `user-invocable: true`.

## Validation
- [ ] `.tstack/.version` reads `0.4.0`
- [ ] `.tstack/.migrated` reads `0.4.0`
- [ ] No `migrations/` directory exists at project root
- [ ] `.tstack/migrations/0.2.0/migration.md` exists
- [ ] `.tstack/migrations/0.3.0/migration.md` exists
- [ ] `.tstack/migrations/0.4.0/migration.md` exists
- [ ] All 10 agent files have `version: "0.4.0"` on line 2
- [ ] Scout agent has `user-invocable: true`

## Scout Re-scan
Recommended — directory structure changed.
