import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { extname, resolve, sep } from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml' };
const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    const pathname = decodeURIComponent(url.pathname === '/' ? '/examples/index.html' : url.pathname);
    // Serve only public example assets and library files, never repository internals.
    if (!/^\/(examples|src|dist)\//.test(pathname)) throw new Error('Not found');
    const file = resolve(root, `.${pathname}`);
    if (!['examples', 'src', 'dist'].some((folder) => file.startsWith(resolve(root, folder) + sep))) {
      throw new Error('Not found');
    }
    const body = await readFile(file);
    res.writeHead(200, { 'Content-Type': types[extname(file)] || 'text/plain', 'Cache-Control': 'no-store' });
    res.end(body);
  } catch {
    res.writeHead(404);
    res.end('Not found');
  }
});
server.listen(Number(process.env.PORT || 5173), '127.0.0.1', () => {
  console.log(`tinyChart.js examples: http://127.0.0.1:${server.address().port}`);
});
