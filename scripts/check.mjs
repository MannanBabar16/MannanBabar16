import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateProfile } from './profile.mjs';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const p = validateProfile(JSON.parse(await fs.readFile(path.join(root, 'profile.json'), 'utf8')));
const readme = await fs.readFile(path.join(root, 'README.md'), 'utf8');
const imagePaths = [...readme.matchAll(/https:\/\/raw\.githubusercontent\.com\/[^/]+\/[^/]+\/main\/([^?"\s)]+)/g)].map(m => m[1]);
for (const name of new Set(imagePaths)) {
  const file = path.resolve(root, name); if (!file.startsWith(root + path.sep)) throw new Error('Invalid generated asset path.');
  const data = await fs.readFile(file); if (!data.length) throw new Error(`Empty asset: ${name}`);
  if (name.endsWith('.png') && data.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a') throw new Error(`Invalid PNG: ${name}`);
}
if (p.theme.animation) {
  const gif = await fs.readFile(path.join(root, 'assets/hero.gif'));
  if (!['GIF87a', 'GIF89a'].includes(gif.subarray(0, 6).toString()) || gif.at(-1) !== 0x3b || !gif.includes(Buffer.from('NETSCAPE2.0'))) throw new Error('Animated GIF header, trailer, or loop extension is missing.');
  if (gif.length > 5 * 1024 * 1024) throw new Error('Keep the animated header below 5 MiB.');
}
if (readme.includes('<script') || readme.includes('<style')) throw new Error('GitHub profile must use supported Markdown/images, not scripts or style tags.');
if (p.projects.some(s => !readme.includes(s.url))) throw new Error('A project link is missing from the README.');
console.log(`Profile validated: ${p.projects.length} projects, ${new Set(imagePaths).size} image assets, ${p.theme.animation ? 'looping GIF' : 'static header'}, no runtime services required.`);
