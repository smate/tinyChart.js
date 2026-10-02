import { readFile } from 'node:fs/promises';
import { gzipSync, brotliCompressSync } from 'node:zlib';

const code = await readFile(new URL('../dist/tinychart.js', import.meta.url));
const gzip = gzipSync(code, { level: 9 }).length;
const brotli = brotliCompressSync(code).length;
console.log(`tinyChart.js: ${code.length} B minified / ${gzip} B gzip / ${brotli} B brotli`);
if (gzip > 3000 || code.length > 6500) {
  console.error('Size budget exceeded: 3,000 B gzip / 6,500 B minified.');
  process.exitCode = 1;
}
