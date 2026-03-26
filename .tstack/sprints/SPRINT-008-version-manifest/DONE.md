# SPRINT-008: Version Manifest & Smart Update — DONE

**Completed:** 2026-03-26
**Outcome:** Success

## Summary
Replaced hand-maintained file manifest with auto-generated version.json using SHA-256 content hashes. Added SessionStart hook for deterministic pre-flight checks. Converted pre-commit hook from shell to Node.js for cross-platform reliability. Refactored CLI update command with hash-based smart comparison. Removed agent frontmatter `version:` fields. Deleted AI-invoked pre-flight skill.

## Key Deliverables
- `scripts/generate-version.mjs` — convention-based file discovery + SHA-256 hashing → version.json
- `scripts/hooks/pre-commit` — Node.js pre-commit hook (replaces shell script)
- `scripts/pre-flight.mjs` — deterministic SessionStart hook (replaces AI skill)
- `.github/hooks/pre-flight.json` — VS Code SessionStart hook config
- `packages/cli/lib/manifest.mjs` — thin version.json reader (replaces hand-maintained list)
- `packages/cli/lib/update.mjs` — hash-based smart update with dry-run
- Agent frontmatter `version:` removed from all 11 agents (×2 locations)
- `.github/skills/pre-flight/` deleted (both root and src/)

## Phase 5 Findings Fixed
- M-01 (Security): Pre-commit hook silent failure — converted to Node.js with explicit error handling (ADR-026)
- F-01 (Docs): Stale AGENTS.md "Sanity Check" section — replaced with "Pre-flight Check" reflecting SessionStart hook

## Decision References
- ADR-021 through ADR-026
