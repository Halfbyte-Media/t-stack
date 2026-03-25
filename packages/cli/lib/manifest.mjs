/**
 * T-Stack file manifest — classifies payload files for init vs update behavior.
 *
 * framework: Overwritten on both `init` and `update`
 * initOnly:  Created on `init`, skipped on `update`
 */

export const framework = [
  '.github/agents/architect.agent.md',
  '.github/agents/code-health.agent.md',
  '.github/agents/developer.agent.md',
  '.github/agents/devops.agent.md',
  '.github/agents/gitops.agent.md',
  '.github/agents/orchestrator.agent.md',
  '.github/agents/scout.agent.md',
  '.github/agents/scribe.agent.md',
  '.github/agents/security-auditor.agent.md',
  '.github/agents/senior-engineer.agent.md',
  '.github/agents/tester.agent.md',
  '.github/skills/blackboard-init/SKILL.md',
  '.github/skills/pre-flight/SKILL.md',
  '.github/skills/setup/SKILL.md',
  '.github/skills/sprint-lifecycle/SKILL.md',
  '.github/skills/update/SKILL.md',
  '.github/skills/worktree-management/SKILL.md',
  '.tstack/.version',
  '.tstack/README.md',
  '.tstack/team.md',
  '.tstack/migrations/0.2.0/migration.md',
  '.tstack/migrations/0.3.0/migration.md',
  '.tstack/migrations/0.4.0/migration.md',
  '.tstack/migrations/0.5.0/migration.md',
  '.tstack/migrations/0.6.0/migration.md',
];

export const initOnly = [
  '.tstack/sprints/README.md',
];
