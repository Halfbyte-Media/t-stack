#!/usr/bin/env node

import { createRequire } from 'node:module';
import { init } from '../lib/init.mjs';
import { update } from '../lib/update.mjs';

const HELP = `Usage: tstack <command> [options]

Commands:
  init      Install T-Stack into the current directory
  update    Update T-Stack framework files (preserves your data)
  version   Show the CLI version

Options:
  --help    Show this help message
  --version Show the CLI version

Init options:
  --force   Overwrite existing installation

Update options:
  --dry-run Show what would change without writing files
`;

function getVersion() {
  const require = createRequire(import.meta.url);
  const pkg = require('../package.json');
  return pkg.version;
}

try {
  const args = process.argv.slice(2);
  const flags = args.filter((a) => a.startsWith('--'));
  const commands = args.filter((a) => !a.startsWith('--'));
  const command = commands[0];

  if (flags.includes('--version')) {
    console.log(`tstack-agents v${getVersion()}`);
    process.exit(0);
  }

  if (flags.includes('--help') || !command) {
    console.log(HELP);
    process.exit(0);
  }

  let exitCode;

  switch (command) {
    case 'version':
      console.log(`tstack-agents v${getVersion()}`);
      process.exit(0);
    case 'init':
      exitCode = await init(process.cwd(), { force: flags.includes('--force') });
      break;
    case 'update':
      exitCode = await update(process.cwd(), { dryRun: flags.includes('--dry-run') });
      break;
    default:
      console.error(`Unknown command: ${command}\n`);
      console.log(HELP);
      exitCode = 1;
      break;
  }

  process.exit(exitCode);
} catch (err) {
  console.error(err.message);
  process.exit(1);
}
