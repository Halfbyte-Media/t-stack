#!/usr/bin/env node

/**
 * T-Stack pre-flight check — VS Code SessionStart hook.
 * Reads version.json and .migrated, compares versions, outputs JSON for the hook system.
 * Designed to be fail-open: never blocks a session from starting.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDir, '..', '..');

function readTrim(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8').trim();
  } catch {
    return null;
  }
}

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

function semverLt(a, b) {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    if ((pa[i] || 0) < (pb[i] || 0)) return true;
    if ((pa[i] || 0) > (pb[i] || 0)) return false;
  }
  return false;
}

function output(message) {
  process.stdout.write(JSON.stringify({
    continue: true,
    systemMessage: message,
  }));
}

function main() {
  const versionJson = readJson(path.join(root, '.tstack', 'version.json'));
  const migratedRaw = readTrim(path.join(root, '.tstack', '.migrated'));
  const versionTxt = readTrim(path.join(root, '.tstack', '.version'));

  // Not a T-Stack project — silent pass
  if (!versionJson && !versionTxt) {
    output('[T-STACK] No T-Stack installation detected.');
    return;
  }

  const frameworkVersion = versionJson ? versionJson.version : versionTxt;

  if (!migratedRaw) {
    output(`[T-STACK PRE-FLIGHT WARN] T-Stack v${frameworkVersion} is installed but not set up. Run /setup to initialize.`);
    return;
  }

  if (semverLt(migratedRaw, frameworkVersion)) {
    output(`[T-STACK PRE-FLIGHT WARN] Framework is v${frameworkVersion} but migrations are at v${migratedRaw}. Run /update to apply pending migrations.`);
    return;
  }

  output(`[T-STACK PRE-FLIGHT PASS] v${frameworkVersion}`);
}

try {
  main();
} catch {
  output('[T-STACK PRE-FLIGHT WARN] Pre-flight check failed to execute. Proceeding anyway.');
}
