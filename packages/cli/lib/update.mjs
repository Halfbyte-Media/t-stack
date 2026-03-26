import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { framework } from './manifest.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const filesDir = path.join(__dirname, '..', 'files');

export async function update(cwd, options) {
  try {
    const versionFile = path.join(cwd, '.tstack', '.version');

    if (!fs.existsSync(versionFile)) {
      console.error(
        'T-Stack is not installed in this directory.\n' +
        'Run `npx @tstack/cli init` first.'
      );
      return 1;
    }

    const fromVersion = fs.readFileSync(versionFile, 'utf8').trim();

    if (options.dryRun) {
      console.log('Dry run — no files will be written.\n');
      for (const relPath of framework) {
        console.log(`  Would write: ${relPath}`);
      }
      console.log(`\n${framework.length} files would be updated.`);
      return 0;
    }

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
          'This may indicate a corrupted package. Try: npx @tstack/cli@latest init'
        );
        return 1;
      }

      fs.mkdirSync(path.dirname(dest), { recursive: true });

      try {
        if (fs.lstatSync(dest).isSymbolicLink()) {
          fs.unlinkSync(dest);
        }
      } catch {
        // dest doesn't exist yet — that's fine
      }

      fs.copyFileSync(src, dest);
    }

    const toVersion = fs.readFileSync(versionFile, 'utf8').trim();

    if (fromVersion !== toVersion) {
      console.log(
        `T-Stack updated: v${fromVersion} → v${toVersion}\n\n` +
        'Next step: Run /update in VS Code Copilot Chat to apply migrations.'
      );
    } else {
      console.log(
        `T-Stack v${toVersion} is already up to date. Files have been refreshed.`
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
