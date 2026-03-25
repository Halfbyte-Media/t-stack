# Migration: 0.6.0

## Version
0.6.0

## What Changed
- `.gitignore` is no longer distributed as a framework file
- The `/setup` skill now generates `.gitignore` entries at initialization time
- Setup step ordering changed: Scout scan runs before the new gitignore configuration step
- Sync scripts no longer sync `.gitignore` between root and `src/`
- Pre-flight check now auto-creates `.tstack/.migrated` for new developers joining an already-initialized project (instead of failing with "run /setup")

## Steps
1. No file moves or renames required — existing `.gitignore` files are unaffected.
2. If the project `.gitignore` is missing T-Stack entries (`.tstack/worktrees/` and `.tstack/.migrated`), they were likely already present from the previously distributed file. Verify they exist.
3. If entries are missing, add them manually under a `# T-Stack` header, or re-run `/setup` (delete `.tstack/.migrated` first).

## Validation
- [ ] `.gitignore` contains `.tstack/worktrees/` entry
- [ ] `.gitignore` contains `.tstack/.migrated` entry
- [ ] `src/.gitignore` does not exist in the distribution
- [ ] New developer clone (no `.migrated` file) passes pre-flight without needing `/setup`

## Scout Re-scan
Not required
