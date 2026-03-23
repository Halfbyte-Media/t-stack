# T-Stack

A multi-agent development team framework for VS Code Copilot. Drop it into any project and get a coordinated team of AI agents that plan, build, test, review, and document your code.

## What It Does

T-Stack gives you a team of 8 specialized agents that communicate through a shared blackboard and work in parallel using git worktrees. You talk to one agent — the Orchestrator — and it handles the rest.

```
You → Orchestrator → Architect → Developer + Tester → Security Auditor → Scribe
                   ↘ Scout (research)         ↗ DevOps (CI/CD)
```

## Quick Start

### 1. Install

Copy the two directories into your project root:

```
your-project/
├── .github/
│   └── agents/          ← agent definitions
│       ├── orchestrator.agent.md
│       ├── scout.agent.md
│       ├── architect.agent.md
│       ├── developer.agent.md
│       ├── tester.agent.md
│       ├── security-auditor.agent.md
│       ├── devops.agent.md
│       └── scribe.agent.md
├── .tstack/             ← shared blackboard (state files)
│   ├── project.md
│   ├── team.md
│   ├── decisions.md
│   ├── routing.md
│   └── sprints/
└── .gitignore           ← add: .tstack/worktrees/
```

### 2. Initialize

Open VS Code Copilot Chat and invoke the Scout:

```
@scout Scan this project and build the profile.
```

The Scout reads your codebase — languages, frameworks, conventions, build tools — and writes everything to `.tstack/project.md`. Every other agent reads this file before doing anything.

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

## The Team

| Agent | Role | Invocable | Writes Code |
|:---|:---|:---|:---|
| **Orchestrator** | Coordinates the team, manages workflow phases | ✅ Direct | No |
| **Scout** | Scans projects, gathers research | ✅ Direct | No |
| **Architect** | Designs systems, writes specs and task plans | Sub-agent | No |
| **Developer** | Implements code per the Architect's plan | Sub-agent | ✅ Yes |
| **Tester** | Writes and runs tests, reports failures | Sub-agent | ✅ Tests |
| **Security Auditor** | Reviews code for OWASP Top 10 vulnerabilities | Sub-agent | No |
| **DevOps** | CI/CD pipelines, Docker, deployment configs | Sub-agent | ✅ Infra |
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
6. **Complete** — Scribe logs decisions, worktrees merged, cleanup

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
| `sprints/` | Per-sprint plans, progress, reviews | Ephemeral — archive after completion |

When a new session starts, agents read the blackboard to rehydrate context. No history is lost between sessions.

## Customization

### Adjusting the team
Edit agents in `.github/agents/` to change behavior, tools, or constraints.

### Changing routing
Edit `.tstack/team.md` to adjust which agents auto-engage for which task types.

### Project-specific conventions
Run the Scout after changing your project setup — it refreshes the profile that all other agents follow.

## Requirements

- VS Code with GitHub Copilot (v1.109+)
- Git (for worktree support)

## License

MIT
