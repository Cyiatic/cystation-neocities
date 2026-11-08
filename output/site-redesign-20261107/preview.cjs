// Loopback-only preview for the CyStation redesign. Mirrors Neocities routing:
// extensionless paths resolve to .html, folders to index.html. Development use only;
// this file lives in output/ and is not part of the published site.
// Safety bound: exits on its own after six hours.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
const port = Number(process.env.PORT) || 8766;
const types = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json', '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8',
  '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.gif': 'image/gif', '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon', '.cur': 'image/x-icon', '.wav': 'audio/wav', '.ogg': 'audio/ogg', '.mp3': 'audio/mpeg',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.xdelta': 'application/octet-stream'
};

const server = http.createServer((req, res) => {
  if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405).end(); return; }
  let url;
  try { url = decodeURIComponent(new URL(req.url, 'http://127.0.0.1').pathname); } catch { res.writeHead(400).end(); return; }
  let target = path.resolve(root, '.' + url);
  const relative = path.relative(root, target);
  if (relative.startsWith('..') || path.isAbsolute(relative) || relative.split(path.sep).some((p) => p.startsWith('.'))) {
    res.writeHead(404).end(); return;
  }
  if (fs.existsSync(target) && fs.statSync(target).isDirectory()) {
    if (!url.endsWith('/')) { res.writeHead(302, { Location: url + '/' }).end(); return; }
    target = path.join(target, 'index.html');
  } else if (!path.extname(target)) {
    target += '.html';
  }
  const type = types[path.extname(target).toLowerCase()];
  if (!type) { res.writeHead(404).end(); return; }
  fs.stat(target, (err, stat) => {
    if (err || !stat.isFile()) {
      // Neocities serves the site's not_found.html with a 404 status for any missing path.
      const notFound = path.join(root, 'not_found.html');
      if (fs.existsSync(notFound)) {
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
        if (req.method === 'HEAD') res.end(); else fs.createReadStream(notFound).pipe(res);
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Not found: ' + url);
      }
      return;
    }
    res.writeHead(200, { 'Content-Type': type, 'Content-Length': stat.size, 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
    if (req.method === 'HEAD') res.end(); else fs.createReadStream(target).pipe(res);
  });
});

server.listen(port, '127.0.0.1', () => {
  console.log(`CyStation preview at http://127.0.0.1:${port}/ (root ${root}); stops by ${new Date(Date.now() + 6 * 3600e3).toISOString()}`);
});
setTimeout(() => { server.close(); setTimeout(() => process.exit(0), 2000).unref(); }, 6 * 3600e3).unref();
