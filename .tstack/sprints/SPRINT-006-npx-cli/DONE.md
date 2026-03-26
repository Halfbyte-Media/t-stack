# SPRINT-006: npx CLI Distribution Package — DONE

**Completed:** 2026-03-26
**Outcome:** Success

## Summary
Built `@tstack/cli` — an npx-installable CLI package with `init` and `update` commands. Zero runtime dependencies. Published to npm via GitHub Actions on release tags.

## Key Deliverables
- `packages/cli/` — CLI package with `bin/cli.mjs`, `lib/init.mjs`, `lib/update.mjs`, `lib/manifest.mjs`
- `.github/workflows/publish-cli.yml` — CI publish workflow with npm provenance
- `.github/workflows/release.yml` — GitHub release workflow
- ADR-014: npx CLI as primary distribution mechanism

## Decision References
- ADR-014
