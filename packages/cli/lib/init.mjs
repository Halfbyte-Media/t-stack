import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { framework, initOnly, version } from './manifest.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const filesDir = path.join(__dirname, '..', 'files');

const GITIGNORE_ENTRIES = ['.tstack/worktrees/', '.tstack/.migrated'];

export async function init(cwd, options) {
  try {
    const tstackDir = path.join(cwd, '.tstack');
    const agentsDir = path.join(cwd, '.github', 'agents');

    if (!options.force && (fs.existsSync(tstackDir) || fs.existsSync(agentsDir))) {
      console.error(
        'T-Stack is already installed in this directory.\n' +
        'Use `update` to refresh framework files, or `init --force` to overwrite.'
      );
      return 1;
    }

    const allFiles = [...framework, ...initOnly];

    for (const relPath of allFiles) {
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
          'This may indicate a corrupted package. Try: npx tstack-agents@latest init'
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

    // Handle .gitignore
    const gitignorePath = path.join(cwd, '.gitignore');

    if (!fs.existsSync(gitignorePath)) {
      const content = '# T-Stack\n' + GITIGNORE_ENTRIES.join('\n') + '\n';
      fs.writeFileSync(gitignorePath, content);
    } else {
      const existing = fs.readFileSync(gitignorePath, 'utf8');
      const missing = GITIGNORE_ENTRIES.filter((entry) => !existing.includes(entry));

      if (missing.length > 0) {
        const suffix =
          (existing.endsWith('\n') ? '' : '\n') +
          '\n# T-Stack\n' +
          missing.join('\n') +
          '\n';
        fs.appendFileSync(gitignorePath, suffix);
      }
    }

    console.log(
      `T-Stack v${version} installed successfully!\n\n` +
      'Next step: Open VS Code and run /setup in Copilot Chat.'
    );
    return 0;
  } catch (err) {
    if (err.code === 'EACCES') {
      console.error(`Permission denied: ${err.path}`);
      return 1;
    }
    throw err;
  }
}
