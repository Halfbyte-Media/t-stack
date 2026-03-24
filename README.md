# T-Stack

A multi-agent development team framework for VS Code Copilot. Drop it into any project and get a coordinated team of AI agents that plan, build, test, review, and document your code.

## What It Does

T-Stack gives you a team of 10 specialized agents that communicate through a shared blackboard and work in parallel using git worktrees. You talk to one agent — the Orchestrator — and it handles the rest.

```
You → Orchestrator → Architect → Developer + Tester → Security Auditor → GitOps → Scribe
                   ↘ Scout (research)         ↗ DevOps (CI/CD)
                                              ↗ Code Health (refactoring)
```

## Quick Start

### 1. Install

Copy the two directories into your project root:

```
your-project/
├── .github/
│   ├── agents/          ← agent definitions
│   │   ├── orchestrator.agent.md
│   │   ├── scout.agent.md
│   │   ├── architect.agent.md
│   │   ├── developer.agent.md
│   │   ├── tester.agent.md
│   │   ├── security-auditor.agent.md
│   │   ├── code-health.agent.md
│   │   ├── devops.agent.md
│   │   ├── gitops.agent.md
│   │   └── scribe.agent.md
│   └── skills/          ← workflow skills
│       ├── setup/
│       │   └── SKILL.md
│       └── update/
│           └── SKILL.md
├── .tstack/             ← shared blackboard (state created by agents)
│   ├── .version
│   ├── README.md
│   ├── team.md
│   ├── migrations/
│   │   ├── 0.2.0/migration.md
│   │   ├── 0.3.0/migration.md
│   │   └── 0.4.0/migration.md
│   └── sprints/
│       └── README.md
└── .gitignore           ← add: .tstack/worktrees/ and .tstack/.migrated
```

### 2. Initialize

Open VS Code Copilot Chat and run:

```
/setup
```

The `/setup` skill validates your installation (checks all agent files are present and version-consistent), creates the `.tstack/.migrated` tracking file, and invokes the Scout to scan your codebase. The Scout writes your project profile to `.tstack/project.md`, which every other agent reads before doing anything.

### 3. Use

Talk to the Orchestrator for any feature or story:

```
@orchestrator I need to add JWT authentication with refresh tokens.
```

The Orchestrator will:
1. **Ask clarifying questions** — scope, constraints, integration points
2. **Plan** — delegates to the Architect, creates a sprint
3. **Present the plan** — summary for your approval
4. **Implement** — delegates to Developer, Tester, Security Auditor
5. **Report** — synthesizes all results for your review

### Updating

To update T-Stack to a new version:

1. Download the new release.
2. Copy the contents of `src/` into your project root, overwriting existing files.
3. Run `/update` in Copilot Chat to apply any migrations.

`/update` runs sequential migrations from your current version to the new one and bumps the `.migrated` tracker. Your state files (`project.md`, `decisions.md`, `routing.md`, `sprint-index.md`) are safe — they aren't in the distribution.

If you customized `.tstack/team.md`, move your changes to `.tstack/team.local.md` before updating — local overrides survive updates.

> **Note:** Do not use mirror/sync-delete tools (`robocopy /MIR`, `rsync --delete`) to update. Use a normal file copy.

### Version Tracking

`.tstack/.version` tracks the installed framework version. `.tstack/.migrated` tracks which version has been set up or migrated to. The Orchestrator checks both on every session start — if `.migrated` is missing it tells you to run `/setup`, and if it's behind `.version` it tells you to run `/update`.

## The Team

| Agent | Role | Invocable | Writes Code |
|:---|:---|:---|:---|
| **Orchestrator** | Coordinates the team, manages workflow phases | ✅ Direct | No |
| **Scout** | Scans projects, gathers research | ✅ Direct | No |
| **Architect** | Designs systems, writes specs and task plans | Sub-agent | No |
| **Developer** | Implements code per the Architect's plan | Sub-agent | ✅ Yes |
| **Tester** | Writes and runs tests, reports failures | Sub-agent | ✅ Tests |
| **Security Auditor** | Reviews code for OWASP Top 10 vulnerabilities | Sub-agent | No |
| **Code Health** | Analyzes technical debt, executes safe refactoring | Sub-agent | ✅ Refactoring |
| **DevOps** | CI/CD pipelines, Docker, deployment configs | Sub-agent | ✅ Infra |
| **GitOps** | Branch management, PRs, sprint archival, `gh` CLI | Sub-agent | No |
| **Scribe** | Logs decisions, updates docs, maintains blackboard | Sub-agent | No |

## Workflow

Every feature follows six phases:

```
INTAKE → PLANNING → REFINEMENT → IMPLEMENTATION → REVIEW → COMPLETE
```

1. **Intake** — Orchestrator asks 2-4 clarifying questions
2. **Planning** — Architect produces a structured plan in the sprint directory
3. **Refinement** — Plan presented to you for approval, adjustment, or rejection
4. **Implementation** — Developer + Tester work (parallel if using worktrees)
5. **Review** — Security Auditor + Tester review in parallel
6. **Complete** — GitOps merges branches and archives the sprint, Scribe logs decisions

You approve before implementation starts. You review before code merges. The agents handle everything in between.

## Parallel Work with Git Worktrees

For large features or multiple stories at once, T-Stack uses git worktrees to run work in parallel:

```bash
# The Orchestrator handles this automatically:
git branch tstack/SPRINT-001-auth
git worktree add .tstack/worktrees/SPRINT-001-auth tstack/SPRINT-001-auth
```

- Each story gets its own branch and worktree under `.tstack/worktrees/`
- Agents are scoped to their worktree — they can't touch other work
- Merge conflicts are flagged before they happen (Architect identifies shared files)
- You can start a new chat session for a different story while one is running

## Multi-Session Support

You can run multiple chat sessions simultaneously:

```
Session A: @orchestrator Implement user authentication     → SPRINT-001
Session B: @orchestrator Build the REST API for products   → SPRINT-002
```

Each session:
- Reads `routing.md` on start to see what's already in-progress
- Gets its own sprint and worktree — no collisions
- Warns you if the new story overlaps with active work

## The Blackboard

`.tstack/` is the shared memory that persists across sessions:

| File | Purpose | Rules |
|:---|:---|:---|
| `project.md` | Tech stack, conventions, structure | Written by Scout, read by everyone |
| `team.md` | Team config and routing policy | Rarely changes |
| `decisions.md` | Architectural decision log | **Append-only** — never edit/delete |
| `routing.md` | Active sprints, tasks, worktrees | Read-before-write (concurrency safe) |
| `sprint-index.md` | Lightweight index of completed sprints | Written by GitOps, read rarely |
| `.version` | Framework version tracker | Updated on install, read by Orchestrator |
| `migrations/` | Version migration instructions | Agent-executable, read by `/update` |
| `sprints/` | Per-sprint plans, progress, reviews | Permanent — completed sprints contain `DONE.md` |

When a new session starts, agents read the blackboard to rehydrate context. No history is lost between sessions.

## Customization

### Adjusting the team
Edit agents in `.github/agents/` to change behavior, tools, or constraints.

### Changing routing
Edit `.tstack/team.md` to adjust which agents auto-engage for which task types.

### Project-specific conventions
Run the Scout after changing your project setup — it refreshes the profile that all other agents follow.

### Skills
`/setup` and `/update` are skills defined in `.github/skills/`. You can customize them or add your own.

## Requirements

- VS Code with GitHub Copilot (v1.109+)
- Git (for worktree support)
- GitHub CLI (`gh`) — for PR/issue operations via the GitOps agent

## License

MIT
