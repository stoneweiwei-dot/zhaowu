/** Test-only static host: serve directory indexes without a redirect or SPA soft 404.
 * Vite preview serves its SPA fallback for extensionless routes, hiding the generated
 * directory documents. This host tests the filesystem output, not Vercel's router.
 */
import { createServer } from 'node:http';
import { readFileSync, statSync } from 'node:fs';
import { resolve, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseLanguagePath, LANGUAGE_PREFIXES } from '../src/lib/language-routing.js';
const root = resolve(fileURLToPath(new URL('../dist', import.meta.url)));
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.xml': 'application/xml', '.ics': 'text/calendar; charset=utf-8', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
createServer((request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    let path = resolve(root, '.' + pathname);
    if (!path.startsWith(root + '/') && path !== root) throw Error('outside root');
    try {
      if (statSync(path).isDirectory()) path = resolve(path, 'index.html');
      statSync(path);
    } catch (error) {
      // Optional local simulation only; live Vercel acceptance remains required.
      const { language } = parseLanguagePath(pathname);
      if (!process.argv.includes('--language-fallback') || language === 'zh-Hant') throw error;
      path = resolve(root, '.' + LANGUAGE_PREFIXES[language], 'index.html');
    }
    response.writeHead(200, { 'Content-Type': types[extname(path)] ?? 'application/octet-stream' });
    response.end(readFileSync(path));
  } catch {
    response.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    response.end(readFileSync(resolve(root, '404.html')));
  }
}).listen(Number(process.argv[2] ?? 4174), '127.0.0.1', () => console.log('Static route HTML test host ready'));
