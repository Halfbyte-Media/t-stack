# Project Profile

> **Status:** Initialized — scanned by Scout on 2026-03-23.

## Overview

- **Name:** T-Stack
- **Description:** A multi-agent development team framework for VS Code Copilot. Provides 10 specialized AI agents that coordinate through a shared blackboard architecture and git worktrees to plan, build, test, review, and document code.
- **Primary Language(s):** Markdown, YAML (frontmatter in `.agent.md` files)
- **Frameworks:** VS Code Copilot Agent Framework (`.agent.md` declarative agents, `#runSubagent` API)
- **Package Manager:** N/A — no runtime dependencies; distributed by copying files into a target project
- **Build System:** N/A — no build step; pure configuration/documentation project
- **Test Framework:** N/A — no automated tests (agent behavior is validated manually via VS Code Copilot chat)
- **Linter / Formatter:** N/A — no linter or formatter configured; Markdown follows consistent manual conventions

## Structure

```
t-stack/
├── .github/
│   └── agents/                  # ACTIVE agent definitions (dogfood — used to develop T-Stack itself)
│       ├── orchestrator.agent.md
│       ├── scout.agent.md
│       ├── architect.agent.md
│       ├── developer.agent.md
│       ├── tester.agent.md
│       ├── security-auditor.agent.md
│       ├── code-health.agent.md
│       ├── devops.agent.md
│       ├── gitops.agent.md
│       └── scribe.agent.md
├── .tstack/                     # ACTIVE blackboard (dogfood — live state for this project)
│   ├── project.md               # This file — project profile
│   ├── team.md                  # Team config and routing preferences
│   ├── decisions.md             # Architectural decision log (append-only)
│   ├── routing.md               # Active task/sprint tracking
│   ├── sprint-index.md           # Lightweight index of completed sprints
│   ├── README.md                # Blackboard structure docs
│   └── sprints/                 # Per-sprint working directories (permanent)
│       └── README.md
├── src/                         # DISTRIBUTABLE template — what users copy into their projects
│   ├── .github/
│   │   └── agents/              # Identical copies of agent definitions
│   └── .tstack/                 # Blank blackboard templates (uninitialized)
│       └── sprints/
├── building-a-dev-team.md       # Research paper on multi-agent architecture (reference doc)
├── README.md                    # User-facing documentation and quick start guide
└── .gitignore                   # Ignores .tstack/worktrees/
```

## Key Files

| File | Purpose |
|:---|:---|
| `README.md` | Primary documentation — installation, usage, agent roles, workflow phases |
| `building-a-dev-team.md` | Deep research paper on VS Code multi-agent orchestration patterns |
| `.github/agents/orchestrator.agent.md` | Main user-facing agent — routes tasks to all other agents |
| `.github/agents/scout.agent.md` | User-facing agent — project scanning and research |
| `.tstack/project.md` | Blackboard — project profile (this file) |
| `.tstack/team.md` | Blackboard — team configuration, routing preferences, worktree policy |
| `.tstack/decisions.md` | Blackboard — append-only architectural decision log |
| `.tstack/routing.md` | Blackboard — active sprint/task tracking |
| `.tstack/sprint-index.md` | Blackboard — lightweight index of completed sprints |
| `src/` | Distributable payload — users copy `src/.github/` and `src/.tstack/` into their projects |

## Conventions

- **Naming:** kebab-case for all file names (e.g., `security-auditor.agent.md`, `code-health.agent.md`)
- **Branching:** `main` (default), `dogfood` (self-development), `feature/<name>` for feature branches, `tstack/SPRINT-XXX-name` for sprint worktree branches
- **Commit Style:** Conventional-ish — `feat:`, `Add`, descriptive subjects (e.g., `feat: Introduce T-Stack agent framework...`)
- **Agent file format:** YAML frontmatter (`name`, `description`, `tools`, `agents`, `user-invocable`, `disable-model-invocation`) + Markdown body with role definition, responsibilities, and rules
- **Blackboard convention:** Files in `.tstack/` are the shared memory substrate; `decisions.md` is append-only; `routing.md` is active-only; `sprint-index.md` is read-rarely; sprint directories are permanent (completed sprints contain `DONE.md`)

## Dependencies

None. T-Stack is a zero-dependency framework. It consists entirely of:
- `.agent.md` files (VS Code Copilot agent definitions)
- `.tstack/` Markdown files (shared blackboard state)

The only runtime requirement is **VS Code** with **GitHub Copilot** (agent mode support, v1.109+).

## Architecture

### Agent Hierarchy

- **User-invocable:** Orchestrator (primary), Scout (direct research)
- **Sub-agents only:** Architect, Developer, Tester, Security Auditor, Code Health, DevOps, GitOps, Scribe
- **Can invoke sub-agents:** Orchestrator (all 9 agents), Architect (Scout only)

### Communication Pattern

Blackboard architecture — agents read from and write to `.tstack/` files rather than passing messages directly. This provides:
- Session persistence (context survives across conversations)
- Decoupled coordination (agents don't need to be online simultaneously)
- Auditability (all decisions and state changes are in version-controlled Markdown)

### Workflow

Six-phase lifecycle: `INTAKE` → `PLANNING` → `REFINEMENT` → `IMPLEMENTATION` → `REVIEW` → `COMPLETE`

### Dogfooding Context

This project uses T-Stack to develop T-Stack itself. The root `.github/agents/` and `.tstack/` are the live, active copies. The `src/` directory contains the identical distributable template. Changes should be made to the root copies and synced to `src/` before release.

## Notes

- The `dogfood` branch is the active development branch for self-hosted T-Stack work.
- `feature/multi-vendor` branch exists — likely related to multi-vendor/multi-model LLM support.
- The project is early-stage: 4 commits, no CI/CD pipeline, no automated tests, no release process yet.
- `building-a-dev-team.md` is a comprehensive research document (~5000 words) covering sub-agent mechanics, A2A protocol, blackboard architecture, telemetry, and team composition — serves as the theoretical foundation for T-Stack's design.
- Root and `src/` agent files are currently **identical** — no drift detected.
- **Confidence: High** — clear project structure, well-documented agents, consistent conventions.
