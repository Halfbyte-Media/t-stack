<!-- 
  Framework default — updated on T-Stack releases.
  To customize without losing changes on update, create team.local.md in this directory.
  Agents check team.local.md first, falling back to this file.
-->

# Team Configuration

## Active Roles

| Role | Agent File | Auto-Engage | Description |
|:---|:---|:---|:---|
| Orchestrator | `orchestrator.agent.md` | Always | Routes tasks, coordinates team, synthesizes results |
| Scout | `scout.agent.md` | On setup / when context stale | Scans project, builds profile, gathers research |
| Architect | `architect.agent.md` | Planning tasks | System design, specs, task decomposition |
| Developer | `developer.agent.md` | Implementation tasks | Writes and modifies code |
| Tester | `tester.agent.md` | After implementation | Writes tests, runs test suites, reports failures |
| Security Auditor | `security-auditor.agent.md` | Code review | Scans for vulnerabilities, enforces security invariants |
| Code Health | `code-health.agent.md` | Refactoring / debt cleanup | Analyzes technical debt, executes safe iterative refactoring |
| DevOps | `devops.agent.md` | CI/CD / infra tasks | Build pipelines, deployment, environment config |
| GitOps | `gitops.agent.md` | Sprint completion / git tasks | Branch management, worktree lifecycle, archival, `gh` CLI ops |
| Scribe | `scribe.agent.md` | After decisions made | Documents decisions, updates project docs, maintains blackboard |

## Routing Preferences

- The **Orchestrator** decides which agents to engage based on task type.
- Agents are invoked as **sub-agents** with isolated context by default.
- Human review is required before merging any code unless explicitly waived.
- The Orchestrator may run multiple sub-agents in **parallel** for independent concerns (e.g., security + performance review).

## Git Worktree Policy

- For **multiple stories or large parallel work**, the Orchestrator creates git worktrees under `.tstack/worktrees/`.
- Each worktree gets its own branch (`tstack/SPRINT-XXX-name`) and isolated directory.
- Sub-agents are assigned to a specific worktree and must not operate outside it.
- Worktrees are merged back to the base branch after review and test pass.
- **Merge conflict risk** is flagged by the Architect when multiple worktrees touch shared files.
- Worktrees are cleaned up after successful merge.

## Escalation Rules

1. If a sub-agent fails or is uncertain, it returns its findings and the Orchestrator re-routes or escalates to the human.
2. Destructive operations (file deletion, force push, production deployment) always require human approval.
3. Architectural disagreements between agents are resolved by the Architect, logged by the Scribe.
