#!/usr/bin/env node

/**
 * T-Stack manifest generator.
 * Scans src/ for framework files, computes SHA-256 hashes, writes version.json.
 * Run automatically via pre-commit hook or manually: node scripts/generate-version.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'src');
const VERSION_JSON_PATH = path.join(SRC, '.tstack', 'version.json');
const VERSION_TXT_PATH = path.join(SRC, '.tstack', '.version');
const PKG_PATH = path.join(ROOT, 'packages', 'cli', 'package.json');

// --- File discovery ---

function findByExtension(relDir, extension) {
  const abs = path.join(SRC, relDir);
  if (!fs.existsSync(abs)) return [];
  return fs.readdirSync(abs)
    .filter(f => f.endsWith(extension))
    .map(f => path.posix.join(relDir, f))
    .sort();
}

function findInSubdirs(relDir, filename) {
  const abs = path.join(SRC, relDir);
  if (!fs.existsSync(abs)) return [];
  return fs.readdirSync(abs, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => path.posix.join(relDir, d.name, filename))
    .filter(rel => fs.existsSync(path.join(SRC, rel)))
    .sort();
}

function exists(relPath) {
  return fs.existsSync(path.join(SRC, relPath)) ? [relPath] : [];
}

function discoverFramework() {
  return [
    ...findByExtension('.github/agents', '.agent.md'),
    ...findInSubdirs('.github/skills', 'SKILL.md'),
    ...findByExtension('.github/hooks', '.json'),
    ...exists('.tstack/.version'),
    ...exists('.tstack/README.md'),
    ...exists('.tstack/team.md'),
    ...findInSubdirs('.tstack/migrations', 'migration.md'),
    ...exists('.tstack/scripts/pre-flight.mjs'),
  ].sort();
}

function discoverInitOnly() {
  return [
    ...exists('.tstack/sprints/README.md'),
  ].sort();
}

// --- Hashing ---

function hashFile(relPath) {
  const content = fs.readFileSync(path.join(SRC, relPath));
  return createHash('sha256').update(content).digest('hex');
}

// --- Main ---

function main() {
  const pkg = JSON.parse(fs.readFileSync(PKG_PATH, 'utf8'));
  const version = pkg.version;

  const frameworkFiles = discoverFramework();
  const initOnlyFiles = discoverInitOnly();

  const manifest = {
    version,
    framework: {},
    initOnly: {},
  };

  for (const rel of frameworkFiles) {
    manifest.framework[rel] = hashFile(rel);
  }

  for (const rel of initOnlyFiles) {
    manifest.initOnly[rel] = hashFile(rel);
  }

  // Write version.json (sorted keys for stable diffs)
  fs.mkdirSync(path.dirname(VERSION_JSON_PATH), { recursive: true });
  fs.writeFileSync(VERSION_JSON_PATH, JSON.stringify(manifest, null, 2) + '\n');

  // Derive .version plaintext convenience file
  fs.writeFileSync(VERSION_TXT_PATH, version + '\n');

  const total = frameworkFiles.length + initOnlyFiles.length;
  console.log(`version.json generated: v${version}, ${frameworkFiles.length} framework + ${initOnlyFiles.length} initOnly = ${total} files`);
}

main();
