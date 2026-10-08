export function validateProfile(p) {
  const fail = (m) => { throw new Error(m); };
  const text = (v, name, max, allowEmpty = false) => {
    if (typeof v !== 'string' || (!allowEmpty && !v.trim()) || v.length > max || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(v)) fail(`${name}: use ${allowEmpty ? '0' : '1'}–${max} characters.`);
  };
  const color = (v, name) => { if (!/^#[0-9a-f]{6}$/i.test(v)) fail(`${name}: use a six-digit hex color.`); };
  const url = (v, name, optional = false) => {
    text(v, name, 500, optional); if (optional && !v) return;
    let u; try { u = new URL(v); } catch { fail(`${name}: enter a full https URL.`); }
    if (u.protocol !== 'https:' || u.username || u.password) fail(`${name}: enter an https URL without credentials.`);
  };
  if (!p || typeof p !== 'object' || !p.identity || !p.theme || !p.links) fail('Profile requires identity, theme, and links.');
  for (const [key, max] of Object.entries({ name: 48, callsign: 20, role: 52, location: 42, bio: 700, status: 80, currentFocus: 52 })) text(p.identity[key], `identity.${key}`, max);
  if (!Array.isArray(p.identity.tagline) || p.identity.tagline.length !== 2) fail('Use exactly two tagline lines.');
  p.identity.tagline.forEach((s, i) => text(s, `tagline line ${i + 1}`, 24));
  for (const key of ['background', 'surface', 'accent', 'secondary', 'text', 'muted']) color(p.theme[key], `theme.${key}`);
  if (typeof p.theme.animation !== 'boolean') fail('theme.animation must be true or false.');
  for (const key of ['github', 'linkedin', 'portfolio']) url(p.links[key], `links.${key}`, key !== 'github');
  text(p.links.email, 'links.email', 100, true); if (p.links.email && !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(p.links.email)) fail('Enter a valid email address, or leave it empty.');
  const github = new URL(p.links.github); if (github.hostname !== 'github.com' || !/^\/[A-Za-z0-9-]+\/?$/.test(github.pathname)) fail('links.github must link to your GitHub user profile.');
  if (!Array.isArray(p.loadout) || p.loadout.length !== 4) fail('Use four loadout entries.');
  p.loadout.forEach((s, i) => { text(s.label, `loadout ${i + 1} label`, 24); text(s.tools, `loadout ${i + 1} tools`, 30); text(s.detail, `loadout ${i + 1} detail`, 48); });
  if (!Array.isArray(p.principles) || p.principles.length !== 3) fail('Use three design principles.');
  p.principles.forEach((s, i) => text(s, `principle ${i + 1}`, 100));
  if (!Array.isArray(p.projects) || !p.projects.length || p.projects.length > 6) fail('Choose 1–6 featured projects.');
  const ids = new Set();
  p.projects.forEach((s, i) => {
    if (!/^[a-z0-9-]{1,40}$/.test(s.id) || ids.has(s.id)) fail(`Project ${i + 1}: use a unique lowercase id.`); ids.add(s.id);
    text(s.title, `project ${i + 1} title`, 34); text(s.genre, `project ${i + 1} genre`, 30); text(s.description, `project ${i + 1} description`, 130); text(s.tech, `project ${i + 1} tech`, 48);
    url(s.url, `project ${i + 1} repository`); url(s.playUrl, `project ${i + 1} play URL`, true); color(s.accent, `project ${i + 1} accent`);
    if (!['cafe', 'platformer', 'runner', 'jam'].includes(s.art)) fail(`Project ${i + 1}: choose cafe, platformer, runner, or jam art.`);
  });
  return p;
}

export function githubUsername(p) { return new URL(p.links.github).pathname.split('/').filter(Boolean)[0]; }

export function escapeXml(v) { return String(v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[c])); }

export function escapeMd(v) { return String(v).replace(/[\\`*_{}\[\]<>#|]/g, '\\$&').replace(/\r?\n/g, ' '); }

export function wrapText(s, max = 43) {
  const lines = []; let line = '';
  for (const word of s.split(/\s+/)) { if (line && (line + ' ' + word).length > max) { lines.push(line); line = word; } else line = line ? line + ' ' + word : word; }
  if (line) lines.push(line); return lines;
}
