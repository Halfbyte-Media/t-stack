---
name: pre-flight
description: "Version sanity check — compares .tstack/.version, .tstack/.migrated, and the invoking agent's frontmatter version. Returns structured PASS/FAIL/WARN result. Used by the Orchestrator before every task."
user-invocable: false
---

# Pre-flight Version Check

Perform the version sanity check and return a structured result.

## Input

The invoking agent will provide its frontmatter `version:` value as `agent-version`.

## Procedure

### Step 1: Read Version Files

Read `.tstack/.version` and `.tstack/.migrated`.

### Step 2: Check Initialization

If `.tstack/.migrated` does not exist:

1. Check if `.tstack/.version` exists.
   - **If `.version` also does not exist:** → Return **FAIL**: "T-Stack has not been initialized. Run `/setup` before proceeding."
2. If `.version` exists, check whether `agent-version` matches `.tstack/.version`.
   - **If they match:** This is likely a new developer joining an already-initialized project (`.migrated` is gitignored). Create `.tstack/.migrated` with the contents of `.tstack/.version` and continue to Step 3.
   - **If they don't match:** → Return **FAIL**: "T-Stack has not been initialized. Run `/setup` before proceeding."

### Step 3: Check Migration Currency

Parse both version strings as semver. If `.migrated` < `.version`:
→ Return **FAIL**: "T-Stack files have been updated but migrations haven't run. Run `/update` before proceeding."

### Step 4: Check Agent Staleness

If `agent-version` ≠ `.tstack/.version`:
→ Return **WARN**: "Agent file may be stale or from a different T-Stack version (agent: {agent-version}, framework: {.version value}). Proceed with caution."

### Step 5: All Clear

→ Return **PASS**: "Version check passed."

## Return Format

Respond with ONLY this structured block — no other text, explanation, or thinking:

```
PRE-FLIGHT RESULT
Status: PASS | FAIL | WARN
Message: <human-readable message>
Proceed: true | false
```

- **PASS** → Proceed: true
- **FAIL** → Proceed: false
- **WARN** → Proceed: true
