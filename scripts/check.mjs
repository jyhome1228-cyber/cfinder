import { readdir, readFile, access } from 'node:fs/promises';
import { dirname, resolve, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
async function filesIn(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.filter(e => !e.name.startsWith('.') && e.name !== 'node_modules').map(e => {
    const path = resolve(directory, e.name);
    return e.isDirectory() ? filesIn(path) : [path];
  }));
  return nested.flat();
}

const files = (await filesIn(root)).filter(path => ['.js', '.mjs'].includes(extname(path)));
for (const path of files) {
  const check = spawnSync(process.execPath, ['--check', path], { encoding: 'utf8' });
  if (check.status !== 0) throw new Error(check.stderr || `Syntax check failed: ${path}`);
  const content = await readFile(path, 'utf8');
  for (const match of content.matchAll(/\bfrom\s+['"](\.\.?\/[^'"]+)['"]/g)) {
    await access(resolve(dirname(path), match[1]));
  }
}
const html = await readFile(resolve(root, 'index.html'), 'utf8');
for (const match of html.matchAll(/(?:src|href)="(\.\/[^"#]+)"/g)) await access(resolve(root, match[1]));
console.log(`Checked ${files.length} JavaScript files, relative imports, and HTML entry assets.`);
