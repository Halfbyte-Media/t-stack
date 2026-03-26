/**
 * T-Stack file manifest — reads from version.json payload.
 *
 * framework:       Files overwritten on both `init` and `update`
 * initOnly:        Files created on `init`, skipped on `update`
 * frameworkHashes: Map of framework file paths → SHA-256 hex hashes
 * version:         Framework version string
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const versionJsonPath = path.join(__dirname, '..', 'files', '.tstack', 'version.json');

let manifest;
try {
  manifest = JSON.parse(fs.readFileSync(versionJsonPath, 'utf8'));
} catch {
  console.error(
    'Missing or corrupt version.json in CLI payload.\n' +
    'This may indicate a corrupted package. Try: npx @tstack/cli@latest init'
  );
  process.exit(1);
}

export const framework = Object.keys(manifest.framework).sort();
export const initOnly = Object.keys(manifest.initOnly || {}).sort();
export const frameworkHashes = manifest.framework;
export const version = manifest.version;
