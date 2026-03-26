# AGENTS.md — T-Stack Dogfood Conventions

> **Dogfood:** This is the T-Stack instance that develops T-Stack itself. The agents in `.github/agents/` and the blackboard in `.tstack/` are the live, working copies used for self-development. The distributable template lives in `src/`.

## Versioning Policy

T-Stack follows [Semantic Versioning](https://semver.org/):

| Bump | When | Examples |
|:---|:---|:---|
| **Patch** (`0.2.0` → `0.2.1`) | Bug fixes, wording changes, typo corrections in agent definitions or docs | Fix a broken pre-flight check, clarify an agent instruction |
| **Minor** (`0.2.0` → `0.3.0`) | New agents, new skills, new blackboard files, workflow changes, new migration entries | Add `/setup` skill, add `version:` frontmatter to agents |
| **Major** (`0.x` → `1.0.0`) | Breaking changes that require consumers to restructure their projects | Rename `.tstack/` directory, remove an agent role, change blackboard file format |

### Version Files

Three files track the framework version:

- `packages/cli/package.json` `"version"` field — the **single source of truth**
- `.tstack/version.json` — auto-generated manifest with version + file hashes (derived from package.json by pre-commit hook)
- `.tstack/.version` — plaintext convenience copy (also derived)

The pre-commit hook (`scripts/generate-version.mjs`) regenerates `version.json` and `.version` from `package.json` on every commit. Manual edits to `.version` or `version.json` will be overwritten.

### When to Bump

Bump the version as the **last step** of a sprint that introduces user-facing changes. If a sprint only modifies dogfood-specific files (like this `AGENTS.md`, `.tstack/routing.md`, or sprint plans), no version bump is needed.

### Pre-commit Hook

A pre-commit hook auto-generates `version.json` and `.version` from `package.json` on every commit. Setup (one-time per clone):

```bash
git config core.hooksPath scripts/hooks
```

The hook script is at `scripts/generate-version.mjs`. It scans `src/` for framework files by convention, computes SHA-256 content hashes, and writes `src/.tstack/version.json`. No manual file list maintenance is needed — add a new agent or skill to `src/` and it's picked up automatically.

## Migration System

### How It Works

The `.tstack/migrations/` directory (also at `src/.tstack/migrations/`) contains one subdirectory per version:

```
.tstack/migrations/
├── 0.2.0/
│   └── migration.md    ← baseline (no-op)
├── 0.3.0/
│   └── migration.md    ← changes from 0.2.0 → 0.3.0
└── 0.4.0/
    └── migration.md    ← changes from 0.3.0 → 0.4.0
```

Each `migration.md` is an **agent-readable** document describing:
1. What changed in that version
2. Step-by-step instructions the agent should execute
3. A validation checklist to verify success
4. Whether a Scout re-scan is recommended

### When to Create a Migration

Create a new `.tstack/migrations/<version>/migration.md` whenever a version bump introduces:
- New files or directories consumers need
- Renamed or moved files
- Changed file formats or structures
- New required configuration

If a version bump is purely content changes within existing files (e.g., improved agent instructions), a migration entry is still created but its steps section can be minimal (just validation).

> **Trust model:** Migration files are agent-executable instructions. Review them with the same rigor as agent definitions — they can direct agents to create, modify, or delete project files.

### Migration File Template

```markdown
# Migration: X.Y.Z

## Version
X.Y.Z

## What Changed
- [List of structural/behavioral changes]

## Steps
1. [Agent-executable step]
2. [Agent-executable step]

## Validation
- [ ] [Check that should pass after migration]

## Scout Re-scan
Required / Not required / Recommended
```

## Version Tracking Files

| File | Type | In `src/`? | Purpose |
|:---|:---|:---|:---|
| `.tstack/.version` | Framework | Yes | "What version is installed" — overwritten on update |
| `.tstack/.migrated` | State | No | "What version has been set up/migrated to" — created by `/setup`, bumped by `/update` |

### Pre-flight Check

A deterministic pre-flight check runs automatically via VS Code's `SessionStart` hook (`.tstack/scripts/pre-flight.mjs`) before any agent is invoked:

1. Read `.tstack/version.json` and `.tstack/.migrated`
2. `.migrated` missing → warn: run `/setup`
3. `.migrated` < `.version` → warn: run `/update`
4. Output: structured JSON with `continue: true` (fail-open) and advisory `systemMessage`

The Orchestrator reads the hook output and acts on any warnings. Sub-agents inherit this guarantee via delegation — they are never invoked if the check fails.

## File Classification

| Category | Files | Synced? | Safe to Overwrite? |
|:---|:---|:---|:---|
| **Framework** | Agent `.agent.md` files, `.tstack/version.json`, `.tstack/.version`, `.tstack/README.md`, `.tstack/team.md`, `.tstack/migrations/`, skills, `.github/hooks/`, `.tstack/scripts/pre-flight.mjs` | Yes | Yes — updated each release |
| **State** | `.tstack/project.md`, `decisions.md`, `routing.md`, `sprint-index.md`, `.migrated`, `sprints/`, `docs/` | No | Never — agent/user data |
| **Hybrid** | `copilot-instructions.md` — process anchor + principles (framework) and Project Index (state) | Template in `src/` | Created by `/setup`. Framework regions updated by `/update` migrations. Project Index preserved across updates. |
| **User override** | `.tstack/team.local.md` | No | Never — user customization |
| **Dogfood only** | `AGENTS.md`, `scripts/generate-version.mjs`, `scripts/hooks/`, `.tstack/sprints/` (active work) | No | N/A — not distributed |

See `.tstack/README.md` for the full ownership table.

## Sync Scripts (Dogfood Only)

These scripts synchronize framework files between the dogfood root and `src/`:

- `scripts/sync-to-root.ps1` — copies `src/` → root (apply distributable changes to dogfood)
- `scripts/sync-to-src.ps1` — copies root → `src/` (push dogfood changes to distributable)

State files are **never** synced. See each script for the explicit file lists.

### When to Sync

- **After editing agent files in root:** Run `sync-to-src.ps1` to update `src/`
- **After editing files in `src/`:** Run `sync-to-root.ps1` to update dogfood
- **Before committing:** Ensure root and `src/` are consistent
