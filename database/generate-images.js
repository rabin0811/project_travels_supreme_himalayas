import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { uploadsDir } from '../config/db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, '..', '..', 'uploads', 'media');

/* warm-scenic palettes: skyTop, skyLow, sun, far, mid, front */
const palettes = {
  snowsummit: ['#cfe2ea', '#f2eadb', '#fff7ea', '#8faeb8', '#7b9aa4', '#4a6d6f'],
  alpine:     ['#dcedef', '#f6efe0', '#fdf3d9', '#a9c7bd', '#7fa49c', '#3f6361'],
  forest:     ['#dbe8e0', '#edf0dd', '#f2eed1', '#a8c3ab', '#7ea287', '#3c5f4d'],
  golden:     ['#e8d9b4', '#f4e9c8', '#f7d98a', '#c8a25a', '#a07f3e', '#4a4030'],
  dusk:       ['#24354e', '#5a4a5c', '#f3cd8f', '#7d6d86', '#54475f', '#26273a'],
  sunrise:    ['#f6d8c0', '#f2b28c', '#f0886a', '#c98f7e', '#a36a5f', '#5a3f3a'],
  glacier:    ['#eef4f6', '#d9e7ea', '#ffffff', '#aecfda', '#8ab2c3', '#47707f'],
};

function rng(seed) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

/* one mountain ridge: joined triangle peaks + optional snow caps */
function ridge(r, count, baseY, maxH, step, startX, color, op, capColor, capOp, capMinH) {
  const pts = [];
  const xs = [];
  const hs = [];
  for (let i = 0; i < count; i++) {
    const x = startX + i * step;
    let h = (0.35 + r() * 0.65) * maxH;
    if (i % 3 === 0) h *= 1.28;
    xs.push(x);
    hs.push(h);
    pts.push(`${x},${baseY}`);
    pts.push(`${x + step / 2},${baseY - h}`);
  }
  pts.push(`${startX + count * step},${baseY}`);
  pts.push(`${startX + count * step},900`);
  pts.push(`${startX},900`);
  let out = `<polygon points="${pts.join(' ')}" fill="${color}" fill-opacity="${op}"/>`;
  if (capColor) {
    for (let i = 0; i < count; i++) {
      const h = hs[i];
      if (h < capMinH) continue;
      const topX = xs[i] + step / 2;
      const w = step * 0.32;
      out += `<path d="M ${topX - w / 2} ${baseY - h * 0.5} L ${topX} ${baseY - h} L ${topX + w / 2} ${baseY - h * 0.5} Z" fill="${capColor}" fill-opacity="${capOp}"/>`;
    }
  }
  return out;
}

function birds(r, n, minX, maxX, minY, maxY) {
  let out = '';
  for (let i = 0; i < n; i++) {
    const x = minX + r() * (maxX - minX);
    const y = minY + r() * (maxY - minY);
    const s = 6 + r() * 8;
    out += `<path d="M ${x} ${y} Q ${x + s / 2} ${y - 4} ${x + s} ${y} Q ${x + s * 1.5} ${y - 6} ${x + s * 2} ${y}" fill="none" stroke="#ffffff" stroke-opacity="0.5" stroke-width="2.4" stroke-linecap="round"/>`;
  }
  return out;
}

function svg(name, paletteKey, seed) {
  const p = palettes[paletteKey] || palettes.alpine;
  const r = rng(seed || 7);
  const hasFlags = name.startsWith('hero');

  const far = 500 + r() * 60;
  const mid = 615 + r() * 70;
  const front = 740 + r() * 55;
  const sunX = 300 + r() * 700;
  const sunY = 165 + r() * 90;

  const flags = hasFlags
    ? ['#D96A4A', '#E3B85C', '#5E8F8C', '#F7F3EA']
        .map((c, i) => `<rect x="${1382 + i * 13}" y="${38 + i * 24}" width="8" height="30" fill="${c}" transform="rotate(${7 + i * 2} ${1382 + i * 13} ${38 + i * 24})"/>`)
        .join('\n')
    : '';

  let g = '';
  g += ridge(r, 9, far, 210, 160, 0, p[3], 0.5, '#ffffff', 0.6, 55);
  g += `<rect x="0" y="${far - 10}" width="1600" height="150" fill="url(#mist)"/>`;
  g += ridge(r, 8, mid, 175, 200, 0, p[4], 0.85, '#fffdf6', 0.5, 95);
  g += ridge(r, 6, front, 300, 266, 0, p[5], 0.97, '#ffffff', 0.3, 175);
  g += `<rect x="0" y="${front + 46}" width="1600" height="900" fill="${p[5]}"/>`;
  g += `<path d="M 0 ${front - 6} Q 420 ${front - 16} 860 ${front - 5} T 1600 ${front}" fill="none" stroke="#ffffff" stroke-opacity="0.16" stroke-width="3"/>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${p[0]}"/>
      <stop offset="62%" stop-color="${p[1]}"/>
      <stop offset="100%" stop-color="${p[2]}"/>
    </linearGradient>
    <radialGradient id="halo" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.85"/>
      <stop offset="50%" stop-color="${p[2]}" stop-opacity="0.45"/>
      <stop offset="100%" stop-color="${p[2]}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="mist" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${p[1]}" stop-opacity="0"/>
      <stop offset="55%" stop-color="${p[1]}" stop-opacity="0.5"/>
      <stop offset="100%" stop-color="${p[1]}" stop-opacity="0.92"/>
    </linearGradient>
  </defs>
  <rect width="1600" height="900" fill="url(#sky)"/>
  <circle cx="${sunX}" cy="${sunY}" r="215" fill="url(#halo)"/>
  <circle cx="${sunX}" cy="${sunY}" r="${60 + r() * 26}" fill="${p[2]}" opacity="0.97"/>
  ${birds(r, 3, 150, 1250, 120, 330)}
  ${g}
  ${flags}
</svg>
`;
}

const defs = [
  ['hero-everest', 'snowsummit', 7],
  ['hero-annapurna', 'alpine', 13],
  ['hero-langtang', 'forest', 21],
  ['everest-base-camp', 'glacier', 3],
  ['annapurna-base-camp', 'alpine', 19],
  ['langtang-valley', 'forest', 5],
  ['manaslu-circuit', 'alpine', 11],
  ['everest-panorama', 'sunrise', 17],
  ['kathmandu-valley', 'golden', 23],
  ['bhutan-paro', 'glacier', 29],
  ['lhasa-tibet', 'golden', 31],
  ['ladakh-india', 'golden', 37],
  ['island-peak', 'snowsummit', 41],
  ['annapurna-sunrise', 'sunrise', 43],
  ['kathmandu-durbar', 'golden', 47],
  ['chola-pass', 'snowsummit', 53],
  ['blog-1', 'alpine', 59],
  ['blog-2', 'glacier', 61],
  ['blog-3', 'sunrise', 67],
];

fs.mkdirSync(outDir, { recursive: true });
for (const [name, palette, seed] of defs) {
  fs.writeFileSync(path.join(outDir, `${name}.svg`), svg(name, palette, seed));
}
console.log(`Generated ${defs.length} placeholder images in ${outDir}`);