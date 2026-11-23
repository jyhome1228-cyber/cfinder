import { readdir, readFile, access } from 'node:fs/promises';
import { dirname, resolve, extname, relative } from 'node:path';
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

const allFiles = await filesIn(root);
const files = allFiles.filter(path => ['.js', '.mjs'].includes(extname(path)));
for (const path of files) {
  const check = spawnSync(process.execPath, ['--check', path], { encoding: 'utf8' });
  if (check.status !== 0) throw new Error(check.stderr || `Syntax check failed: ${path}`);
  const content = await readFile(path, 'utf8');
  for (const match of content.matchAll(/\bfrom\s+['"](\.\.?\/[^'"]+)['"]/g)) {
    await access(resolve(dirname(path), match[1]));
  }
}
const htmlFiles = allFiles.filter(path => extname(path).toLowerCase() === '.html');
for (const path of htmlFiles) {
  const html = await readFile(path, 'utf8');
  for (const match of html.matchAll(/(?:^|\s)(?:src|href)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/gi)) {
    const reference = (match[1] ?? match[2] ?? match[3]).trim();
    if (!reference || /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(reference)) continue;
    const pathname = reference.split(/[?#]/, 1)[0];
    if (!pathname) continue;
    const decoded = decodeURIComponent(pathname);
    const target = decoded.startsWith('/') ? resolve(root, `.${decoded}`) : resolve(dirname(path), decoded);
    try {
      await access(target);
    } catch {
      throw new Error(`Missing local HTML target in ${relative(root, path)}: ${reference}`);
    }
  }
}
console.log(`Checked ${files.length} JavaScript files, relative imports, and local assets in ${htmlFiles.length} HTML files.`);
