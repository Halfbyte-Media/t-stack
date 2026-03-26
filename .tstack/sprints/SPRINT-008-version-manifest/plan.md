# SPRINT-008: Version Manifest & Smart Update

## Overview

Replace the hand-maintained `manifest.mjs` file list with an auto-generated `version.json` manifest driven by SHA-256 content hashes. Refactor the CLI update command to skip unchanged files. Replace the AI-invoked pre-flight skill with a deterministic VS Code SessionStart hook. Remove `version:` from all agent frontmatter — `package.json` becomes the single version authority.

**Version bump:** 0.7.0 → 0.8.0 (minor — new manifest system, new hook, workflow change)

## Deliverables

| ID | Deliverable | Type |
|:---|:---|:---|
| D1 | `scripts/generate-version.mjs` — pre-commit hook script | New (dogfood-only) |
| D2 | `scripts/hooks/pre-commit` — git hook shell shim | New (dogfood-only) |
| D3 | `src/.tstack/version.json` — auto-generated framework manifest | New (framework) |
| D4 | `packages/cli/lib/manifest.mjs` — thin reader of version.json | Refactor |
| D5 | `packages/cli/lib/update.mjs` — smart hash-based update | Refactor |
| D6 | `packages/cli/lib/init.mjs` — version.json awareness | Modify |
| D7 | `src/scripts/pre-flight.mjs` — SessionStart hook Node script | New (framework) |
| D8 | `src/.github/hooks/pre-flight.json` — SessionStart hook config | New (framework) |
| D9 | Agent frontmatter cleanup — remove `version:` from 11 agents | Modify (×22) |
| D10 | Orchestrator simplification — remove Pre-flight Check section | Modify (×2) |
| D11 | Pre-flight skill deletion | Delete (×2) |
| D12 | Downstream updates (copilot-instructions.md, AGENTS.md, sync scripts) | Modify |
| D13 | `src/.tstack/migrations/0.8.0/migration.md` | New (framework) |
| D14 | Version bump — package.json 0.7.0 → 0.8.0 | Modify |

## version.json Schema

```json
{
  "version": "0.8.0",
  "framework": {
    ".github/agents/architect.agent.md": "<sha256-hex>",
    ...
  },
  "initOnly": {
    ".tstack/sprints/README.md": "<sha256-hex>"
  }
}
```

- `version` from `packages/cli/package.json` (single source of truth)
- `version.json` excluded from its own hash map (always copied)
- `copilot-instructions.md` excluded (hybrid file, handled by migrations)
- Keys sorted alphabetically for stable diffs

## File Discovery Patterns (generate-version.mjs)

| Pattern | Category |
|:---|:---|
| `src/.github/agents/*.agent.md` | framework |
| `src/.github/skills/*/SKILL.md` | framework |
| `src/.github/hooks/*.json` | framework |
| `src/.tstack/.version` | framework |
| `src/.tstack/README.md` | framework |
| `src/.tstack/team.md` | framework |
| `src/.tstack/migrations/*/migration.md` | framework |
| `src/scripts/pre-flight.mjs` | framework |
| `src/.tstack/sprints/README.md` | initOnly |

## Smart Update Flow (update.mjs)

For each framework file: if dest missing → copy (new); hash dest on disk → compare to incoming hash → if match → skip; if mismatch → copy. Always copy version.json itself.

Dry-run output: `skip (unchanged)` / `update (changed)` / `create (new)` with summary counts.

## SessionStart Hook Design

- `scripts/pre-flight.mjs` reads `.tstack/version.json` + `.tstack/.migrated`
- Workspace root: `path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')`
- Logic: missing files → WARN; migrated < version → WARN; else → PASS
- Output: `{ "continue": true, "systemMessage": "..." }` — always fail-open
- `.github/hooks/pre-flight.json` — SessionStart hook config

## Task Breakdown

### Phase 1: Core Generator (sequential, first)
- T1: Create `scripts/generate-version.mjs`
- T2: Create `scripts/hooks/pre-commit` shell shim
- T3: Configure `core.hooksPath`
- T4: Generate initial `version.json`, verify, commit

### Phase 2: CLI Refactor (parallel with 3, 4)
- T5: Refactor `manifest.mjs` → thin version.json reader
- T6: Refactor `update.mjs` → hash-based smart update
- T7: Update `init.mjs` for version.json awareness

### Phase 3: SessionStart Hook (parallel with 2, 4)
- T8: Create `src/scripts/pre-flight.mjs`
- T9: Create `src/.github/hooks/pre-flight.json`

### Phase 4: Agent & Skill Cleanup (parallel with 2, 3)
- T10: Remove `version:` from 11 agent frontmatter files
- T11: Simplify Orchestrator (remove Pre-flight Check section)
- T12: Delete pre-flight skill

### Phase 5: Downstream Updates (after 2, 3, 4)
- T13: Update copilot-instructions.md process anchor (remove version)
- T14: Update AGENTS.md conventions
- T15: Update sync scripts

### Phase 6: Version Bump & Migration (last)
- T16: Create migration 0.8.0
- T17: Bump package.json to 0.8.0
- T18: Regenerate version.json
- T19: Sync dogfood, verify

## Parallelization

Phases 2, 3, 4 can run in parallel worktrees after Phase 1. No shared files between them. Phase 5 depends on all three. Phase 6 is last.

## Key Decisions

| Decision | Rationale |
|:---|:---|
| `package.json` is version source of truth | Eliminates manual `.version` editing; pre-commit derives `.version` |
| `.migrated` stays separate | State file (gitignored) vs framework file (tracked) — different ownership |
| Discovery-based manifest | Never manually add files to a list again |
| `core.hooksPath` for git hooks | Zero-dep, committed, built into git 2.9+ |
| SessionStart replaces pre-flight skill | Deterministic > LLM-invoked for critical checks |
| Fail-open pre-flight | Advisory, not blocking — don't lock out contributors |
| No consumer git hooks | `core.hooksPath` is dogfood-only for T-Stack contributors |
| No file deletion on update | Consumers may have legitimate extra files |

## Risks

| Risk | Mitigation |
|:---|:---|
| Pre-commit doesn't fire on Windows | Document manual `node scripts/generate-version.mjs` fallback |
| SessionStart hook schema changes | Fail-open design; update config on next patch |
| Stale version.json committed | Pre-commit hook prevents; CI can validate |
