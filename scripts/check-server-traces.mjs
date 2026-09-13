import { readdir, readFile } from 'node:fs/promises';
import { resolve, relative, dirname } from 'node:path';

const root = process.cwd();
async function manifests(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) => {
      const file = resolve(dir, entry.name);
      if (entry.isDirectory()) return manifests(file);
      return entry.name.endsWith('.nft.json') ? [file] : [];
    }),
  );
  return nested.flat();
}

const traces = await manifests(resolve(root, '.next'));
if (!traces.length) throw new Error('No server traces found after the build.');
const violations = [];
for (const trace of traces) {
  const { files } = JSON.parse(await readFile(trace, 'utf8'));
  for (const file of files) {
    const local = relative(root, resolve(dirname(trace), file));
    if (
      /^(?:\.data(?:-[^/]+)?(?:\/|$)|\.env[^/]*(?:\/|$)|test-results\/|playwright-report\/)/.test(
        local,
      ) ||
      local === 'docs/myevents/Archive.zip'
    ) {
      violations.push(`${relative(root, trace)}: ${local}`);
    }
  }
}
if (violations.length) {
  console.error(
    'Build refused: local data or credentials are included in server traces.',
  );
  console.error(violations.join('\n'));
  process.exitCode = 1;
} else {
  console.log(
    `Server traces checked: ${traces.length}; no local data or credentials included.`,
  );
}
