import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { Resvg } from '@resvg/resvg-js';
import gifenc from 'gifenc';
import { validateProfile, githubUsername, escapeXml as e, escapeMd } from './profile.mjs';
import { hero, section, loadout, projectTile, footer } from './art.mjs';

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const options = { font: { fontDirs: [path.join(root, 'assets/fonts')], loadSystemFonts: false, defaultFontFamily: 'Chakra Petch' } };
const render = (source) => new Resvg(source, options).render();

export async function buildProfile() {
  const p = validateProfile(JSON.parse(await fs.readFile(path.join(root, 'profile.json'), 'utf8')));
  const username = githubUsername(p);
  const version = createHash('sha256').update(JSON.stringify(p)).update(await fs.readFile(path.join(root, 'scripts/art.mjs'))).update(await fs.readFile(path.join(root, 'scripts/build.mjs'))).digest('hex').slice(0, 12);
  const assets = path.join(root, 'assets'); await fs.mkdir(assets, { recursive: true });
  const cafe = (await fs.readFile(path.join(assets, 'source/after-hours-cafe.png'))).toString('base64');
  const save = async (name, source) => { await fs.writeFile(path.join(assets, name + '.svg'), source); await fs.writeFile(path.join(assets, name + '.png'), render(source).asPng()); };
  await save('hero', hero(p));
  if (p.theme.animation) {
    const { GIFEncoder, quantize, applyPalette } = gifenc;
    const gif = GIFEncoder(); const frameCount = 40;
    // One palette keeps static text stable across frames, avoiding color shimmer.
    const first = render(hero(p, 0));
    const palette = quantize(first.pixels, 128);
    for (let i = 0; i < frameCount; i++) {
      const frame = i === 0 ? first : render(hero(p, i / frameCount));
      gif.writeFrame(applyPalette(frame.pixels, palette), frame.width, frame.height, { palette: i === 0 ? palette : undefined, delay: 125, repeat: 0 });
    }
    gif.finish(); await fs.writeFile(path.join(assets, 'hero.gif'), gif.bytes());
  }
  await save('section-loadout', section(p, '01', 'Developer loadout', 'TOOLS FOR MAKING A GOOD PLAYER EXPERIENCE'));
  await save('loadout', loadout(p));
  await save('loadout-mobile', loadout(p, true));
  await save('section-projects', section(p, '02', 'Select a project', 'DIFFERENT WORLDS. THE SAME CURIOSITY.'));
  for (let i = 0; i < p.projects.length; i++) await save(`project-${p.projects[i].id}`, projectTile(p.projects[i], p, i, cafe));
  await save('footer', footer(p));
  const image = (name) => `https://raw.githubusercontent.com/${username}/${username}/main/assets/${name}?v=${version}`;
  const heroFile = p.theme.animation ? 'hero.gif' : 'hero.png';
  const cards = p.projects.map(s => `<a href="${e(s.url)}"><img src="${image(`project-${s.id}.png`)}" width="49%" alt="${e(`${s.title}: ${s.description} ${s.tech}`)}" /></a>`).join('\n');
  const contact = [['LinkedIn', p.links.linkedin], ['Portfolio', p.links.portfolio], ['Email', p.links.email ? `mailto:${p.links.email}` : '']].filter(([, url]) => url).map(([label, url]) => `[${label}](${url})`).join(' · ');
  const plainProjects = p.projects.map(s => `- **[${escapeMd(s.title)}](${s.url})** — ${escapeMd(s.description)}${s.playUrl ? ` [Play the browser build](${s.playUrl})` : ''}`).join('\n');
  let readme = `<!-- Generated from profile.json. Edit that file or use npm run edit. -->\n\n<picture>\n  <source media="(prefers-reduced-motion: reduce)" srcset="${image('hero.png')}" />\n  <img src="${image(heroFile)}" width="100%" alt="${e(`${p.identity.name} — ${p.identity.role} ${p.identity.tagline.join(' ')} ${p.identity.location}.`)}" />\n</picture>\n\n${escapeMd(p.identity.bio)}\n\n**Current quest:** ${escapeMd(p.identity.currentFocus)}\n\n${contact}\n\n<img src="${image('section-loadout.png')}" width="100%" alt="Developer loadout" />\n<img src="${image('loadout.png')}" width="100%" alt="${e(p.loadout.map(s => `${s.label}: ${s.tools}. ${s.detail}`).join(' / '))}" />\n\n<img src="${image('section-projects.png')}" width="100%" alt="Select a project — click a tile to open its repository" />\n\n${cards}\n\n<details>\n<summary>Project notes & playable links</summary>\n\n${plainProjects}\n\n</details>\n\n<details>\n<summary>What I care about when making a game</summary>\n\n${p.principles.map(s => `- ${escapeMd(s)}`).join('\n')}\n\n</details>\n\n<img src="${image('footer.png')}" width="100%" alt="Let's build something playable. Current focus: ${e(p.identity.currentFocus)}" />\n\n${contact}\n\n<sub>Custom artwork & motion · [Static header](${image('hero.png')}) · [Profile controls](https://github.com/${username}/${username}/blob/main/EDITING.md)</sub>\n`;
  const loadoutAlt = e(p.loadout.map(s => `${s.label}: ${s.tools}. ${s.detail}`).join(' / '));
  readme = readme.replace(`<img src="${image('loadout.png')}" width="100%" alt="${loadoutAlt}" />`, `<picture><source media="(max-width: 600px)" srcset="${image('loadout-mobile.png')}" /><img src="${image('loadout.png')}" width="100%" alt="${loadoutAlt}" /></picture>`);
  const footerLink = p.projects.find(s => s.playUrl)?.playUrl || p.projects[0].url;
  readme = readme.replace(`<img src="${image('footer.png')}"`, `<a href="${e(footerLink)}"><img src="${image('footer.png')}"`).replace(`Current focus: ${e(p.identity.currentFocus)}" />`, `Current focus: ${e(p.identity.currentFocus)}" /></a>`);
  await fs.writeFile(path.join(root, 'README.md'), readme);
  // Preview stays local; no third-party image or analytics requests are required.
  const local = (name) => `assets/${name}?v=${version}`;
  const localCards = cards.replaceAll(`https://raw.githubusercontent.com/${username}/${username}/main/`, './');
  const contactHtml = [['LinkedIn', p.links.linkedin], ['Portfolio', p.links.portfolio], ['Email', p.links.email ? `mailto:${p.links.email}` : '']].filter(([, url]) => url).map(([label, url]) => `<a href="${e(url)}">${label} ↗</a>`).join(' · ');
  let previewBody = `<picture><source media="(prefers-reduced-motion: reduce)" srcset="${local('hero.png')}"><img src="${local(heroFile)}" width="100%" alt="${e(p.identity.name)} — ${e(p.identity.role)}"></picture><div class="bio"><p>${e(p.identity.bio)}</p><p><b>Current quest:</b> ${e(p.identity.currentFocus)}</p><p>${contactHtml}</p></div><img src="${local('section-loadout.png')}" width="100%" alt="Developer loadout"><img src="${local('loadout.png')}" width="100%" alt="${e(p.loadout.map(s => s.tools).join(' / '))}"><img src="${local('section-projects.png')}" width="100%" alt="Select a project"><div class="cards">${localCards}</div><details><summary>Project notes & playable links</summary>${p.projects.map(s => `<p><a href="${e(s.url)}">${e(s.title)}</a> — ${e(s.description)} ${s.playUrl ? `<a href="${e(s.playUrl)}">Play ↗</a>` : ''}</p>`).join('')}</details><details><summary>What I care about when making a game</summary><ul>${p.principles.map(s => `<li>${e(s)}</li>`).join('')}</ul></details><img src="${local('footer.png')}" width="100%" alt="Let's build something playable"><p>${contactHtml}</p>`;
  previewBody = previewBody.replace(`<img src="${local('loadout.png')}" width="100%" alt="${e(p.loadout.map(s => s.tools).join(' / '))}">`, `<picture><source media="(max-width: 600px)" srcset="${local('loadout-mobile.png')}"><img src="${local('loadout.png')}" width="100%" alt="${e(p.loadout.map(s => s.tools).join(' / '))}"></picture>`);
  previewBody = previewBody.replace(`<img src="${local('footer.png')}" width="100%" alt="Let's build something playable">`, `<a href="${e(footerLink)}"><img src="${local('footer.png')}" width="100%" alt="Let's build something playable"></a>`);
  const preview = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${e(p.identity.name)} — Game Developer</title><style>@font-face{font-family:Chakra;src:url(assets/fonts/ChakraPetch-Regular.ttf)}*{box-sizing:border-box}body{margin:0;background:${p.theme.background};color:${p.theme.text};font:16px/1.65 Chakra,system-ui}main{max-width:1010px;padding:24px;margin:auto}img{max-width:100%;vertical-align:top}a{color:${p.theme.accent}}.bio{margin:24px 0}p{margin:12px 0}details{margin:16px 0;padding:12px 0;border-top:1px solid ${p.theme.surface}}summary{cursor:pointer}picture img{display:block}.cards{display:flex;gap:12px;flex-wrap:wrap}.cards a{width:calc(50% - 6px)}.cards img{width:100%}.controls{display:flex;gap:16px;align-items:center;border:1px solid ${p.theme.surface};padding:10px 18px;margin-bottom:24px;font-size:13px}.controls span{color:${p.theme.muted};margin-left:auto}@media(max-width:600px){main{padding:12px}.cards a{width:100%}.controls span{display:none}}</style></head><body><main><div class="controls"><a href="editor/">PROFILE CONTROL ROOM</a><a href="${e(p.links.github)}">GITHUB PROFILE ↗</a><span>LOCAL PREVIEW · SINGLE CONFIG</span></div>${previewBody}</main></body></html>`;
  await fs.writeFile(path.join(root, 'preview.html'), preview);
  return { username, version, projects: p.projects.length, animation: p.theme.animation };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) console.log(JSON.stringify(await buildProfile(), null, 2));
