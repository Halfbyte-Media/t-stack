import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { framework, frameworkHashes, version } from './manifest.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const filesDir = path.join(__dirname, '..', 'files');

function hashFile(filePath) {
  try {
    const content = fs.readFileSync(filePath);
    return createHash('sha256').update(content).digest('hex');
  } catch {
    return null;
  }
}

export async function update(cwd, options) {
  try {
    const versionJsonDest = path.join(cwd, '.tstack', 'version.json');

    // Check if T-Stack is installed (version.json or legacy .version)
    const hasVersionJson = fs.existsSync(versionJsonDest);
    const hasLegacyVersion = fs.existsSync(path.join(cwd, '.tstack', '.version'));

    if (!hasVersionJson && !hasLegacyVersion) {
      console.error(
        'T-Stack is not installed in this directory.\n' +
        'Run `npx @tstack/cli init` first.'
      );
      return 1;
    }

    // Read current version for comparison
    let fromVersion = version; // default to incoming if can't read
    if (hasVersionJson) {
      try {
        const current = JSON.parse(fs.readFileSync(versionJsonDest, 'utf8'));
        fromVersion = current.version;
      } catch {
        // corrupt version.json — treat as upgrade
        fromVersion = 'unknown';
      }
    } else if (hasLegacyVersion) {
      fromVersion = fs.readFileSync(path.join(cwd, '.tstack', '.version'), 'utf8').trim();
    }

    const stats = { unchanged: 0, updated: 0, created: 0 };
    const details = [];

    for (const relPath of framework) {
      const src = path.join(filesDir, relPath);
      const dest = path.join(cwd, relPath);

      const resolved = path.resolve(dest);
      if (!resolved.startsWith(path.resolve(cwd) + path.sep) && resolved !== path.resolve(cwd)) {
        console.error(`Path traversal blocked: ${relPath}`);
        return 1;
      }

      if (!fs.existsSync(src)) {
        console.error(
          `Missing payload file: ${relPath}\n` +
          'This may indicate a corrupted package. Try: npx @tstack/cli@latest update'
        );
        return 1;
      }

      // Determine action: create, update, or skip
      const destExists = fs.existsSync(dest);
      let action;

      if (!destExists) {
        action = 'create';
      } else if (relPath === '.tstack/version.json') {
        // Always copy version.json — it's the manifest itself
        action = 'update';
      } else {
        const destHash = hashFile(dest);
        const incomingHash = frameworkHashes[relPath];
        action = (destHash === incomingHash) ? 'skip' : 'update';
      }

      if (action === 'skip') {
        stats.unchanged++;
        details.push({ relPath, action: 'skip (unchanged)' });
        continue;
      }

      if (options.dryRun) {
        const label = action === 'create' ? 'create (new)' : 'update (changed)';
        stats[action === 'create' ? 'created' : 'updated']++;
        details.push({ relPath, action: label });
        continue;
      }

      // Write the file
      fs.mkdirSync(path.dirname(dest), { recursive: true });

      try {
        if (fs.lstatSync(dest).isSymbolicLink()) {
          fs.unlinkSync(dest);
        }
      } catch {
        // dest doesn't exist yet — that's fine
      }

      fs.copyFileSync(src, dest);
      stats[action === 'create' ? 'created' : 'updated']++;
      details.push({ relPath, action: action === 'create' ? 'create (new)' : 'update (changed)' });
    }

    // Output
    const total = stats.unchanged + stats.updated + stats.created;

    if (options.dryRun) {
      console.log('Dry run — showing what would change:\n');
      for (const { relPath, action } of details) {
        console.log(`  ${action.padEnd(20)} ${relPath}`);
      }
      console.log(`\nSummary: ${stats.unchanged} unchanged, ${stats.updated} updated, ${stats.created} new (of ${total} framework files)`);
      return 0;
    }

    if (fromVersion !== version) {
      console.log(
        `T-Stack updated: v${fromVersion} → v${version}\n` +
        `  ${stats.unchanged} unchanged, ${stats.updated} updated, ${stats.created} new\n\n` +
        'Next step: Run /update in VS Code Copilot Chat to apply migrations.'
      );
    } else {
      console.log(
        `T-Stack v${version} is already up to date.\n` +
        `  ${stats.unchanged} unchanged, ${stats.updated} updated, ${stats.created} new`
      );
    }

    return 0;
  } catch (err) {
    if (err.code === 'EACCES') {
      console.error(`Permission denied: ${err.path}`);
      return 1;
    }
    throw err;
  }
}
