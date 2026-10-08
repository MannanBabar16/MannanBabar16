import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs/promises';
import { buildProfile, root } from './build.mjs';
import { validateProfile, githubUsername } from './profile.mjs';

const git = (args) => {
  const r = spawnSync('git', args, { cwd: root, encoding: 'utf8', windowsHide: true, env: { ...process.env, GIT_TERMINAL_PROMPT: '0', GCM_INTERACTIVE: 'never' } });
  if (r.status !== 0) throw new Error((r.stderr || r.stdout || 'Git command failed.').replace(/https:\/\/[^\s@]+@/g, 'https://[redacted]@').trim());
  return r.stdout.trim();
};

export async function publishProfile() {
  const p = validateProfile(JSON.parse(await fs.readFile(path.join(root, 'profile.json'), 'utf8')));
  const username = githubUsername(p);
  const repository = git(['rev-parse', '--show-toplevel']);
  if (path.resolve(repository).toLowerCase() !== root.toLowerCase()) throw new Error('Open the profile repository itself before publishing.');
  if (git(['branch', '--show-current']) !== 'main') throw new Error('Publish from the main branch.');
  const remote = git(['remote', 'get-url', 'origin']);
  const accepted = [`https://github.com/${username}/${username}.git`, `https://github.com/${username}/${username}`, `git@github.com:${username}/${username}.git`];
  if (!accepted.some(url => url.toLowerCase() === remote.toLowerCase())) throw new Error('Origin must point to your personal username/username profile repository.');
  const allowed = name => ['README.md', 'profile.json', 'preview.html'].includes(name) || name.startsWith('assets/');
  const staged = git(['diff', '--cached', '--name-only']).split('\n').filter(Boolean);
  if (staged.some(name => !allowed(name))) throw new Error('Other files are already staged. Commit or unstage them before publishing the profile.');
  await buildProfile();
  git(['add', 'README.md', 'profile.json', 'preview.html', 'assets']);
  if (git(['diff', '--cached', '--name-only'])) git(['commit', '-m', 'Update game developer profile from central config']);
  git(['push', 'origin', 'main']);
  return { url: p.links.github, commit: git(['rev-parse', '--short', 'HEAD']) };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) console.log(JSON.stringify(await publishProfile(), null, 2));
