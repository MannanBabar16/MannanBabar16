import { escapeXml as e, wrapText } from './profile.mjs';

const text = (x, y, size, fill, value, extra = '') => `<text x="${x}" y="${y}" fill="${fill}" font-family="Chakra Petch" font-size="${size}" ${extra}>${e(value)}</text>`;
const mono = (x, y, size, fill, value, extra = '') => `<text x="${x}" y="${y}" fill="${fill}" font-family="IBM Plex Mono" font-size="${size}" ${extra}>${e(value)}</text>`;
const rect = (x, y, w, h, fill, extra = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" ${extra}/>`;
const line = (x1, y1, x2, y2, stroke, extra = '') => `<path d="M${x1} ${y1}L${x2} ${y2}" stroke="${stroke}" fill="none" ${extra}/>`;
const poly = (points, fill, extra = '') => `<polygon points="${points}" fill="${fill}" ${extra}/>`;

export function svg(w, h, body, p) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${rect(0, 0, w, h, p.theme.background)}${body}</svg>`;
}

export function hero(p, phase = 0) {
  const t = p.theme, id = p.identity;
  const angle = phase * Math.PI * 2, bob = Math.sin(angle) * 7;
  let body = '';
  for (let x = 0; x < 1000; x += 40) body += line(x, 0, x, 430, t.muted, 'opacity=".045"');
  for (let y = 0; y < 430; y += 40) body += line(0, y, 1000, y, t.muted, 'opacity=".045"');
  body += `<path d="M0 24V0H24M976 0h24v24M0 406v24h24M976 430h24v-24" fill="none" stroke="${t.accent}" stroke-width="3"/>`;
  body += poly('40,33 50,33 50,43', t.accent) + poly('63,33 73,33 63,43', t.accent);
  body += mono(87, 42, 12, t.text, 'DEVELOPER SELECT') + mono(760, 42, 11, t.muted, '01 / PERSONAL SAVE');
  body += line(40, 61, 960, 61, t.muted, 'opacity=".22"');
  body += mono(42, 101, 12, t.accent, id.role, 'letter-spacing="1.1"');
  body += text(38, 179, 66, t.text, id.tagline[0], 'font-weight="700"');
  body += text(38, 249, 66, t.accent, id.tagline[1], 'font-weight="700"');
  body += text(42, 299, 23, t.text, id.name.toUpperCase(), 'font-weight="700"');
  body += mono(42, 326, 12, t.muted, `${id.location.toUpperCase()} / ${id.callsign}`);
  body += rect(40, 363, 542, 38, t.surface, `stroke="${t.muted}" stroke-opacity=".22"`);
  body += `<circle cx="56" cy="382" r="3" fill="${t.accent}" opacity="${.65 + .35 * Math.cos(angle)}"/>`;
  body += mono(70, 386, 12, t.text, id.status);
  // An original wireframe world: slow orbit, hovering islands, portal, and particles.
  body += `<g transform="translate(789 ${219 + bob})">`;
  for (let i = -4; i <= 4; i++) {
    body += line(-150 + i * 15, 76 + i * 8, 150 + i * 15, -44 + i * 8, t.secondary, 'opacity=".12"');
    body += line(-120 + i * 20, -54 - i * 6, 110 + i * 20, 96 - i * 6, t.secondary, 'opacity=".12"');
  }
  body += `<ellipse cx="0" cy="26" rx="156" ry="63" fill="none" stroke="${t.secondary}" opacity=".32" transform="rotate(-16)"/>`;
  body += `<ellipse cx="0" cy="26" rx="165" ry="69" fill="none" stroke="${t.accent}" opacity=".1" transform="rotate(18)"/>`;
  body += poly('-88,62 0,18 88,62 0,106', t.surface, `stroke="${t.secondary}" stroke-width="1.5"`);
  body += poly('-88,62 0,106 0,143 -88,100', '#202638', `stroke="${t.secondary}" stroke-opacity=".35"`);
  body += poly('0,106 88,62 88,100 0,143', '#141b29', `stroke="${t.secondary}" stroke-opacity=".35"`);
  for (let i = 1; i < 4; i++) body += line(-88 + i * 22, 62 + i * 11, i * 22, 18 + i * 11, t.secondary, 'opacity=".16"');
  // Door to an unbuilt world.
  body += `<path d="M-16 39v-109l54-26v109" stroke="${t.accent}" stroke-width="6" fill="none"/>`;
  body += `<path d="M-11 39v-103l43-22v108" stroke="${t.accent}" stroke-width="1" fill="none" opacity=".25"/>`;
  body += poly('-12,-64 32,-84 32,22 -12,43', t.accent, 'opacity=".035"');
  const sy = -64 + phase * 108;
  body += line(-10, sy, 31, sy - 20, t.accent, 'stroke-width="2" opacity=".6"');
  // Small player silhouette and companion block.
  body += rect(-44, 22, 10, 15, t.text) + rect(-42, 10, 7, 9, t.text) + rect(-44, 37, 3, 8, t.text) + rect(-37, 37, 3, 8, t.text);
  body += poly('-136,0 -104,-16 -72,0 -104,16', t.secondary, 'opacity=".6"');
  body += poly('-136,0 -104,16 -104,37 -136,21', t.secondary, 'opacity=".15"');
  body += poly('-104,16 -72,0 -72,21 -104,37', t.secondary, 'opacity=".3"');
  for (let i = 0; i < 12; i++) {
    const a = angle + i * Math.PI * 2 / 12;
    const x = Math.cos(a) * (121 + (i % 3) * 12), y = Math.sin(a) * 62 - 15;
    body += rect(x, y, i % 3 ? 2 : 4, i % 3 ? 2 : 4, i % 2 ? t.accent : t.secondary, `opacity="${.35 + .5 * (i % 3) / 2}"`);
  }
  const ox = Math.cos(angle) * 151, oy = Math.sin(angle) * 64 + 26;
  body += `<circle cx="${ox}" cy="${oy}" r="4" fill="${t.accent}"/>`;
  body += `</g>`;
  body += mono(649, 101, 10, t.muted, 'SCENE_001 / WORLDS IN PROGRESS');
  body += mono(671, 394, 11, t.secondary, 'CRAFT → PLAYTEST → ITERATE');
  return svg(1000, 430, body, p);
}

export function section(p, number, title, subtitle) {
  const t = p.theme;
  return svg(1000, 94, mono(0, 37, 12, t.accent, number) + text(38, 43, 30, t.text, title, 'font-weight="700"') + mono(38, 70, 11, t.muted, subtitle) + line(580, 40, 1000, 40, t.muted, 'opacity=".2"'), p);
}

export function loadout(p, mobile = false) {
  const t = p.theme; let body = '';
  p.loadout.forEach((entry, i) => {
    const x = (mobile ? i % 2 : i) * 252, y = mobile ? Math.floor(i / 2) * 176 : 0, accent = i % 2 ? t.secondary : t.accent;
    body += `<g transform="translate(0 ${y})">`;
    body += rect(x, 0, 242, 164, t.surface);
    body += line(x, 0, x + 38, 0, accent, 'stroke-width="4"');
    body += mono(x + 18, 34, 10, accent, `0${i + 1} / ${entry.label}`);
    const toolLines = wrapText(entry.tools, 21);
    toolLines.forEach((s, j) => { body += text(x + 18, 71 + j * 25, 22, t.text, s, 'font-weight="700"'); });
    wrapText(entry.detail, 27).forEach((s, j) => { body += text(x + 18, 124 + j * 18, 13, t.muted, s); });
    body += '</g>';
  });
  return svg(mobile ? 500 : 1000, mobile ? 346 : 170, body, p);
}

function tileArt(project, p, cafeImage) {
  const a = project.accent, t = p.theme; let b = '';
  if (project.art === 'cafe') {
    b += `<image href="data:image/png;base64,${cafeImage}" x="0" y="-56" width="500" height="280" preserveAspectRatio="xMidYMid slice"/>`;
    b += rect(0, 0, 500, 160, '#0d1820', 'opacity=".15"');
  } else if (project.art === 'platformer') {
    for (let i = 0; i < 25; i++) b += rect((i * 131) % 500, (i * 41) % 150, 2, 2, a, 'opacity=".3"');
    b += `<circle cx="386" cy="52" r="32" fill="${a}" opacity=".07"/>`;
    for (const [x, y, w] of [[18, 134, 100], [134, 104, 80], [236, 72, 74], [340, 40, 106]]) {
      b += rect(x, y, w, 10, a, 'opacity=".75"') + rect(x, y + 10, w, 24, a, 'opacity=".08"');
      for (let s = 0; s < w; s += 14) b += line(x + s, y + 12, x + s, y + 33, a, 'opacity=".12"');
    }
    b += rect(264, 51, 12, 18, t.text) + rect(267, 39, 9, 9, t.text);
    b += `<path d="M202 91q32-59 66-23" stroke="${a}" fill="none" stroke-dasharray="3 7" opacity=".4"/>`;
    b += poly('390,14 409,22 390,29', a) + line(389, 12, 389, 39, a);
  } else if (project.art === 'runner') {
    b += poly('220,12 280,12 470,160 30,160', '#241d25');
    for (let i = 0; i < 9; i++) {
      const y = 10 + i * i * 2.5, edge = 29 + i * i * 2.45;
      b += line(250 - edge, y, 250 + edge, y, a, 'opacity=".15"');
    }
    for (let i = 0; i < 7; i++) {
      const x = 32 + i * 65; b += line(x, 160, 250, 16, a, 'opacity=".12"');
    }
    b += `<path d="M142 148V31h214v117M182 117V51h134v66M212 82V61h75v21" fill="none" stroke="${a}" stroke-width="2" opacity=".3"/>`;
    b += rect(245, 91, 12, 20, t.text) + rect(248, 81, 8, 8, t.text);
    b += poly('260,106 270,114 267,119 253,110', t.text);
    b += rect(366, 73, 3, 3, a) + rect(398, 73, 3, 3, a);
  } else {
    b += `<ellipse cx="262" cy="87" rx="100" ry="51" stroke="${a}" fill="none" opacity=".17"/>`;
    b += `<ellipse cx="262" cy="87" rx="127" ry="68" stroke="${a}" fill="none" stroke-dasharray="3 8" opacity=".2"/>`;
    b += poly('263,20 300,67 281,78 259,61 239,80 222,68', a, 'opacity=".8"');
    b += `<path d="M254 55v69h18V55M257 118l-34 17M269 118l32 17" stroke="${a}" fill="none" stroke-width="4"/>`;
    b += `<path d="M230 52q-30-25-37-7q-3 19 35 22M286 52q36-24 38-3q-3 23-37 21" stroke="${a}" fill="none" opacity=".4"/>`;
    b += rect(66, 51, 26, 26, 'none', `stroke="${a}" stroke-opacity=".4" transform="rotate(22 79 64)"`);
    b += poly('410,115 417,98 424,115 417,132', a, 'opacity=".4"');
  }
  return b;
}

export function projectTile(project, p, index, cafeImage) {
  const t = p.theme, a = project.accent;
  let b = `<defs><clipPath id="art"><rect width="500" height="160"/></clipPath></defs>` + rect(0, 0, 500, 326, t.surface) + `<g clip-path="url(#art)">${tileArt(project, p, cafeImage)}</g>`;
  b += rect(0, 0, 500, 35, t.background, 'opacity=".88"');
  b += mono(20, 23, 11, a, `0${index + 1} / ${project.genre}`);
  b += line(0, 160, 500, 160, a, 'stroke-opacity=".35"');
  b += text(20, 200, 29, t.text, project.title, 'font-weight="700"');
  wrapText(project.description, 53).slice(0, 3).forEach((s, j) => { b += text(20, 227 + j * 21, 15, t.muted, s); });
  b += mono(20, 303, 11, a, project.tech);
  b += `<path d="M460 283h17v17M477 283l-22 22" fill="none" stroke="${a}" stroke-width="2"/>`;
  return svg(500, 326, b, p);
}

export function footer(p) {
  const t = p.theme;
  let b = rect(0, 0, 1000, 146, t.surface) + line(0, 0, 1000, 0, t.accent, 'stroke-width="2" stroke-opacity=".5"');
  b += mono(30, 32, 11, t.secondary, 'CONTINUE?') + text(30, 77, 32, t.text, "Let's build something playable.", 'font-weight="700"');
  b += mono(30, 115, 12, t.muted, p.identity.currentFocus.toUpperCase());
  b += rect(862, 43, 103, 59, 'none', `stroke="${t.accent}" stroke-opacity=".35"`);
  b += text(882, 82, 23, t.accent, '▶ PLAY', 'font-weight="700"');
  return svg(1000, 146, b, p);
}
