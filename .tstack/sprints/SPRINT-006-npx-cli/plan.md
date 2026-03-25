# SPRINT-006: npx CLI Distribution Package

## Goal
Build an npx-installable CLI (`tstack-agents`) so users can install and update T-Stack from the command line instead of manually copying files.

## Tasks

1. Create package scaffold (`packages/cli/package.json`, `packages/cli/README.md`)
2. Implement file manifest (`packages/cli/lib/manifest.mjs`)
3. Implement `init` command (`packages/cli/lib/init.mjs`)
4. Implement `update` command (`packages/cli/lib/update.mjs`)
5. Implement CLI entry point (`packages/cli/bin/cli.mjs`)
6. Create CI publish workflow (`.github/workflows/publish-cli.yml`)
7. Update root `README.md` install instructions
8. Add `.gitignore` entries for `packages/cli/files/`
9. Update `AGENTS.md` with packages/ awareness
10. Log ADR for CLI distribution decision

## Key Design Decisions

- **26 payload files** (25 framework + 1 init-only)
- **Two-category manifest**: framework (overwrite on update) + initOnly (skip on update)
- **Zero dependencies** — Node.js built-ins only (fs, path, process)
- **ES modules** (.mjs)
- **Minimum Node 18**
- **Version bump to 0.7.0** as last step of sprint
