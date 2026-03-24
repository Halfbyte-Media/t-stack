---
name: setup
description: "First-time T-Stack initialization. Validates install integrity, creates .migrated tracking file, and invokes Scout to build the project profile. Use when: setting up T-Stack for the first time, initializing a new project, first run after installing T-Stack."
argument-hint: "Run this after copying T-Stack files into your project for the first time."
user-invocable: true
---

# T-Stack Setup

First-time initialization for T-Stack. Run this once after copying T-Stack files into your project.

## Procedure

### Step 1: Check for Existing Initialization

Read `.tstack/.migrated`.

- **If the file exists:** This project has already been initialized.
  - Report: "This project is already initialized at version `<value>`. If you need to re-initialize, delete `.tstack/.migrated` and re-run `/setup`. If you just updated T-Stack files, run `/update` instead."
  - **Stop here.**
- **If the file does not exist:** Continue to Step 2.

### Step 2: Validate Installation

Read `.tstack/.version`.

- **If the file does not exist:** The installation is incomplete.
  - Report: "`.tstack/.version` not found. T-Stack does not appear to be installed correctly. Ensure you copied both `.github/agents/` and `.tstack/` from the T-Stack distribution."
  - **Stop here.**
- **If the file exists:** Record the version value (e.g., `0.3.0`). Continue to Step 3.

### Step 3: Validate Agent Files

For each `.github/agents/*.agent.md` file, read **line 2** (the `version:` property is always the first frontmatter field):

1. Verify line 2 contains a `version:` field.
2. Compare the `version:` value against `.tstack/.version`.

**If any agent file is missing `version:`:** Warn: "Agent `<name>` does not have a `version:` field in its frontmatter. This may indicate an older or incomplete T-Stack distribution."

**If any agent's `version:` does not match `.tstack/.version`:** Warn: "Agent `<name>` has version `<agent_version>` but `.tstack/.version` is `<framework_version>`. This suggests a partial copy — ensure all agent files are from the same T-Stack release."

**If all match:** Report: "All agent files validated — versions consistent at `<version>`."

Continue to Step 4 regardless of warnings (these are non-blocking).

### Step 4: Create `.tstack/.migrated`

Create the file `.tstack/.migrated` with the same content as `.tstack/.version` (just the version string, e.g., `0.3.0`).

### Step 5: Build Project Profile

Invoke the **Scout** agent to scan the workspace and populate `.tstack/project.md`.

If the Scout agent is not available as a subagent, instruct the user: "Run `@scout Scan this project and build the profile.` to complete setup."

### Step 6: Configure .gitignore

Ensure the project's `.gitignore` includes T-Stack entries.

#### 6a: Read or Create .gitignore

Check if `.gitignore` exists in the project root.

- **If it does not exist:** Create it as an empty file.
- **If it exists:** Read its contents.

#### 6b: Add T-Stack Entries

The required T-Stack entries are:

```
# T-Stack (managed by /setup — do not remove this block)
.tstack/worktrees/
.tstack/.migrated
```

For each entry (`.tstack/worktrees/` and `.tstack/.migrated`):
1. Check if the entry already exists anywhere in the file (exact line match, ignoring leading/trailing whitespace).
2. **If already present:** Skip it.
3. **If not present:** Mark it for addition.

If any entries need to be added:
- If the file already contains a `# T-Stack` comment header, append the missing entries immediately after that header block.
- If no `# T-Stack` header exists, append a blank line followed by the full block (header + all missing entries) to the end of the file.

If all entries already exist, report: "`.gitignore` already contains T-Stack entries — no changes needed."

#### 6c: Offer Project-Specific Entries

Read `.tstack/project.md` (built by Scout in Step 5). Based on the detected languages and frameworks, ask the user:

> "Would you like me to add common gitignore entries for your project based on the detected stack ([list detected languages/frameworks])?"

- **If the user declines (or no project profile available):** Skip — continue to Step 7.
- **If the user accepts:** Use the Scout's project profile to determine appropriate entries (e.g., `node_modules/` for Node.js, `__pycache__/` for Python, `dist/` / `build/` for common build outputs). Apply the same dedup logic from 6b — skip any entries already present. Append new entries under an appropriate comment header for the framework.

### Step 7: Report

Report to the user:
- T-Stack version initialized
- Any warnings from validation
- Whether the project profile was built
- Whether `.gitignore` was configured (and what was added, if anything)
- "You're ready to go — invoke the Orchestrator with your first task, or use `@scout` to scan the project."
