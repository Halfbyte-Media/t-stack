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

Two files track the framework version — they **must always be in sync**:

- `.tstack/.version` — the dogfood/active copy
- `src/.tstack/.version` — the distributable copy

Both contain a single line: the version string (e.g., `0.3.0`).

### When to Bump

Bump the version as the **last step** of a sprint that introduces user-facing changes. If a sprint only modifies dogfood-specific files (like this `AGENTS.md`, `.tstack/routing.md`, or sprint plans), no version bump is needed.

### Agent Frontmatter Ordering

The `version` property must always be the **first** property in an agent's YAML frontmatter, above `name`. This ensures version is immediately visible when scanning agent files.

```yaml
---
version: "0.3.0"
name: "Agent Name"
description: "..."
...
---
```

## Migration System

### How It Works

The `migrations/` directory (also at `src/migrations/`) contains one subdirectory per version:

```
migrations/
├── 0.2.0/
│   └── migration.md    ← baseline (no-op)
└── 0.3.0/
    └── migration.md    ← changes from 0.2.0 → 0.3.0
```

Each `migration.md` is an **agent-readable** document describing:
1. What changed in that version
2. Step-by-step instructions the agent should execute
3. A validation checklist to verify success
4. Whether a Scout re-scan is recommended

### When to Create a Migration

Create a new `migrations/<version>/migration.md` whenever a version bump introduces:
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

### Sanity Check Convention

The Orchestrator performs a pre-flight check before starting work (sub-agents inherit this check via delegation):

1. Read `.tstack/.version` and `.tstack/.migrated`
2. `.migrated` missing → tell user to run `/setup`
3. `.migrated` < `.version` → tell user to run `/update`
4. Agent frontmatter `version:` ≠ `.tstack/.version` → warn about stale files

## File Classification

| Category | Files | Synced? | Safe to Overwrite? |
|:---|:---|:---|:---|
| **Framework** | Agent `.agent.md` files, `.tstack/.version`, `.tstack/README.md`, `.tstack/team.md`, `migrations/`, skills | Yes | Yes — updated each release |
| **State** | `.tstack/project.md`, `decisions.md`, `routing.md`, `sprint-index.md`, `.migrated`, `sprints/` | No | Never — agent/user data |
| **User override** | `.tstack/team.local.md` | No | Never — user customization |
| **Dogfood only** | `AGENTS.md`, `scripts/`, `.tstack/sprints/` (active work) | No | N/A — not distributed |

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
