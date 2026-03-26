---
name: update
description: "Run T-Stack migrations after updating framework files to a new version. Applies sequential migrations, validates agent integrity, and bumps the migrated version tracker. Use when: after updating T-Stack, after copying new agent files, version mismatch detected."
argument-hint: "Run this after updating T-Stack agent files to a new version."
user-invocable: true
---

# T-Stack Update

Runs migrations after T-Stack framework files have been updated to a new version.

## Procedure

### Step 1: Pre-flight Check

Read both version files:
- `.tstack/.migrated` — the version migrations have been applied through
- `.tstack/.version` — the version of the installed framework files

**If `.tstack/.migrated` does not exist:**
- Report: "No `.tstack/.migrated` found — T-Stack hasn't been initialized yet. Run `/setup` first."
- **Stop here.**

**If `.tstack/.version` does not exist:**
- Report: "No `.tstack/.version` found — T-Stack installation appears broken. Ensure framework files were copied correctly."
- **Stop here.**

Record both values. Continue to Step 2.

### Step 2: Compare Versions

Parse both version strings as semver (`Major.Minor.Patch`).

- **If `.migrated` >= `.version`:** Already up to date.
  - Report: "T-Stack is already up to date at version `<version>`. No migrations needed."
  - **Stop here.**
- **If `.migrated` < `.version`:** Migrations needed.
  - Report: "Migrating from `<migrated>` to `<version>`."
  - Continue to Step 3.

### Step 3: Validate Version Manifest

Read `.tstack/version.json`. Verify it contains valid JSON with `version`, `framework`, and `initOnly` keys.

- **If `version.json` is missing or malformed:** Warn: "`.tstack/version.json` is missing or invalid. Framework files may not have been updated correctly. Consider re-running the update."
- **If `version.json` `version` does not match `.tstack/.version`:** Warn: "Version mismatch — `version.json` says `<json_version>` but `.version` says `<file_version>`. Re-copy framework files."

Continue to Step 4 regardless of warnings (validation is informational).

### Step 4: Determine Migration Path

List all subdirectories in `.tstack/migrations/`. Each subdirectory name is a version number.

1. Filter to versions that are **greater than** `.tstack/.migrated` AND **less than or equal to** `.tstack/.version`.
2. Sort by semver ascending.

Example: `.migrated` = `0.2.0`, `.version` = `0.4.0`
→ Run: `.tstack/migrations/0.3.0/migration.md`, then `.tstack/migrations/0.4.0/migration.md`

**If no migration directories match:** Warn: "No migration files found for the version range `<migrated>` → `<version>`. The version bump may not require migration steps. Updating `.migrated` to match."

### Step 5: Execute Migrations

For each migration version (in ascending order):

1. Read `.tstack/migrations/<version>/migration.md`.
2. Report: "Applying migration `<version>`..."
3. Follow the **Steps** section — execute each numbered step.
4. After completing steps, run through the **Validation** checklist. Report any failures.
5. Check the **Scout Re-scan** field — note if a re-scan is recommended.

If any migration step fails or validation check fails, report the failure and **stop**. Do not continue to the next migration. The user must resolve the issue before retrying.

### Hybrid File Handling

Some files (like `.github/copilot-instructions.md`) are classified as **hybrid** — they contain both framework-owned regions and state/user-owned regions. These files are NOT bulk-copied during updates. Instead, migrations handle them with region-aware updates:

1. Read the existing file.
2. Extract and preserve state regions (between `<!-- #region ... -->` and `<!-- #endregion ... -->` markers for state-owned sections).
3. Write the updated framework content.
4. Re-insert the preserved state regions.

Migration files specify which regions to preserve. If a hybrid file doesn't exist, create it fresh from the template.

### Step 6: Update `.tstack/.migrated`

Write the `.tstack/.version` value to `.tstack/.migrated`, replacing its current content.

### Step 7: Optional Scout Re-scan

If any migration in the chain recommended a Scout re-scan, invoke the **Scout** agent to refresh `.tstack/project.md`.

If the Scout agent is not available as a subagent, instruct the user: "A Scout re-scan is recommended. Run `@scout Scan this project and build the profile.`"

### Step 8: Report

Report to the user:
- Migrations applied (list of versions)
- Any warnings or validation notes
- Whether Scout re-scan was triggered
- Current version status: "T-Stack is now at version `<version>`."
