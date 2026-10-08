import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { buildProfile, root } from './build.mjs';
import { publishProfile } from './publish.mjs';
import { validateProfile } from './profile.mjs';

const port = Number(process.env.PROFILE_EDITOR_PORT || 4318);
const origin = `http://127.0.0.1:${port}`;
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.gif': 'image/gif', '.ttf': 'font/ttf' };
let busy = false;
const json = (res, status, data) => { res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }); res.end(JSON.stringify(data)); };

const server = http.createServer(async (req, res) => {
  try {
    if (req.headers.host !== `127.0.0.1:${port}`) return json(res, 403, { error: 'Use the printed local address.' });
    const route = new URL(req.url, origin).pathname;
    if (req.method === 'GET' && route === '/api/profile') return json(res, 200, JSON.parse(await fs.readFile(path.join(root, 'profile.json'), 'utf8')));
    if (req.method === 'POST' && ['/api/save', '/api/publish'].includes(route)) {
      if (req.headers.origin !== origin || !req.headers['content-type']?.startsWith('application/json')) return json(res, 403, { error: 'Only the local editor can save or publish.' });
      if (busy) return json(res, 409, { error: 'A build or publish is in progress. Try again when it finishes.' });
      let raw = ''; for await (const chunk of req) { raw += chunk; if (Buffer.byteLength(raw) > 65536) return json(res, 413, { error: 'Profile is too large.' }); }
      const profile = validateProfile(JSON.parse(raw));
      busy = true;
      try {
        await fs.writeFile(path.join(root, 'profile.json'), JSON.stringify(profile, null, 2) + '\n');
        const result = route === '/api/publish' ? await publishProfile() : await buildProfile();
        return json(res, 200, { ok: true, ...result });
      } finally { busy = false; }
    }
    if (req.method !== 'GET' && req.method !== 'HEAD') return json(res, 405, { error: 'Method not allowed.' });
    const relative = route === '/favicon.ico' ? 'assets/icon.svg' : route === '/' ? 'editor/index.html' : route === '/editor/' ? 'editor/index.html' : decodeURIComponent(route).replace(/^\//, '');
    if (!['preview.html'].includes(relative) && !relative.startsWith('assets/') && !relative.startsWith('editor/')) return json(res, 404, { error: 'Not found.' });
    const filename = path.resolve(root, relative);
    if (!filename.startsWith(root + path.sep)) return json(res, 403, { error: 'Invalid path.' });
    const data = await fs.readFile(filename);
    res.writeHead(200, { 'Content-Type': mime[path.extname(filename)] || 'application/octet-stream', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
    res.end(req.method === 'HEAD' ? undefined : data);
  } catch (error) {
    json(res, error.code === 'ENOENT' ? 404 : 400, { error: error.message });
  }
});
server.listen(port, '127.0.0.1', () => console.log(`Profile Control Room: ${origin}\nPreview: ${origin}/preview.html\nCtrl+C to stop. Your profile stays in profile.json.`));
