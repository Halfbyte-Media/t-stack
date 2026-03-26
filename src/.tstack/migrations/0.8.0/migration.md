# Migration: 0.8.0

## Version
0.8.0

## What Changed
- New: `.tstack/version.json` — auto-generated manifest with file hashes. Single source of truth for framework file inventory and version.
- New: `.github/hooks/pre-flight.json` — VS Code SessionStart hook config. Replaces the AI-invoked pre-flight skill with a deterministic check.
- New: `.tstack/scripts/pre-flight.mjs` — deterministic pre-flight check script, runs automatically on session start.
- Changed: CLI `update` command now skips unchanged files (hash comparison). Supports `--dry-run` with categorized output (skip/update/create).
- Changed: Agent frontmatter no longer contains `version:` property. `version.json` is the version authority.
- Changed: Orchestrator no longer has a manual pre-flight invocation section.
- Removed: `.github/skills/pre-flight/SKILL.md` — replaced by SessionStart hook.
- Changed: `copilot-instructions.md` process anchor no longer contains a version string.

## Steps

### Step 1: Verify new files exist
Confirm these files were copied by the update:
- `.tstack/version.json`
- `.github/hooks/pre-flight.json`
- `.tstack/scripts/pre-flight.mjs`

If any are missing, re-run `npx tstack-agents@latest update`.

### Step 2: Remove stale pre-flight skill
If `.github/skills/pre-flight/` directory still exists, delete it and its contents.

### Step 3: Handle copilot-instructions.md
If `.github/copilot-instructions.md` exists, update the process anchor region:
1. Find `<!-- T-STACK:PROCESS-ANCHOR v0.7.0` (or any version string after PROCESS-ANCHOR) and change to `<!-- T-STACK:PROCESS-ANCHOR`
2. Preserve the Project Index region (everything between `<!-- #region PROJECT-INDEX` and `<!-- #endregion PROJECT-INDEX -->`).

If the file doesn't exist, the update copied a fresh version with the correct content.

### Step 4: Verify agent frontmatter
All agent files in `.github/agents/` should no longer have a `version:` property in their YAML frontmatter. The update command overwrites agent files, so this should be automatic. If any still have `version:`, remove the line.

## Validation
- [ ] `.tstack/version.json` exists and contains valid JSON with `version`, `framework`, and `initOnly` keys
- [ ] `.github/hooks/pre-flight.json` exists
- [ ] `.tstack/scripts/pre-flight.mjs` exists
- [ ] `.github/skills/pre-flight/` directory no longer exists
- [ ] No agent file in `.github/agents/` contains `version:` in frontmatter
- [ ] `.tstack/.migrated` reads `0.8.0`

## Scout Re-scan
Recommended — the framework structure has changed significantly.
