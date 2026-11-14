// How AI makes images — problem/fix chain, retro low-poly room + big pixel-art screen.
(() => {
const { T3, RW, RH, W, H, clamp, lerp, ease, prog, rng, makeTextures, TX, person, idle, run } = window.W3;
const TM = window.TIMING, CL = TM.clips;
const S = Math.sin, C = Math.cos;
function wt(ci, word, n = 0) { let k = 0; for (const w of CL[ci].words) if (w.w.toLowerCase().replace(/[^a-z0-9']/g, '') === word) { if (k === n) return w.a - CL[ci].start; k++; } return 0; }
const AT = (ci, w, n = 0) => CL[ci].start + wt(ci, w, n);
let renderer, camera, scene;
function M(c, o = {}) { return new T3.MeshLambertMaterial(Object.assign({ color: c, flatShading: true }, o)); }
function B(w, h, d, m, x, y, z, p) { const o = new T3.Mesh(new T3.BoxGeometry(w, h, d), typeof m === 'string' ? M(m) : m); o.position.set(x, y, z); (p || scene).add(o); return o; }
function ctex(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); const t = new T3.CanvasTexture(c); t.magFilter = t.minFilter = T3.NearestFilter; t.colorSpace = T3.SRGBColorSpace; t.userData = { c, g }; return t; }
function noiseFill(g, w, h, b, v, seed) { const r = rng(seed); for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const k = (r() - 0.5) * v; g.fillStyle = `rgb(${b[0] + k},${b[1] + k},${b[2] + k})`; g.fillRect(x, y, 1, 1); } }

// ---------- the picture: "a cat in space" as 64x64 pixel art, built in layers ----------
const N = 64; const LAYERS = {};
function layer(draw) { const c = document.createElement('canvas'); c.width = c.height = N; const g = c.getContext('2d'); draw(g); return g.getImageData(0, 0, N, N).data; }
function makeArt() {
  LAYERS.bg = layer(g => { const gr = g.createLinearGradient(0, 0, 0, N); gr.addColorStop(0, '#0a0c2a'); gr.addColorStop(1, '#2a1a4a'); g.fillStyle = gr; g.fillRect(0, 0, N, N); });
  LAYERS.stars = layer(g => { const r = rng(9); for (let i = 0; i < 40; i++) { g.fillStyle = r() > 0.8 ? '#ffe08a' : '#ffffff'; g.fillRect(r() * N | 0, r() * N | 0, 1, 1); } g.fillStyle = '#ffffff'; for (const [x, y] of [[8, 10], [52, 8], [56, 30]]) { g.fillRect(x - 1, y, 3, 1); g.fillRect(x, y - 1, 1, 3); } });
  LAYERS.planet = layer(g => { g.fillStyle = '#e07a3a'; g.beginPath(); g.arc(12, 52, 13, 0, 7); g.fill(); g.fillStyle = '#c85a2a'; g.fillRect(4, 48, 16, 2); g.fillRect(6, 55, 14, 2); g.strokeStyle = '#f0d08a'; g.lineWidth = 2; g.beginPath(); g.ellipse(12, 52, 20, 5, -0.3, 0, 7); g.stroke(); });
  LAYERS.shape = layer(g => { g.fillStyle = '#5a6a8a'; g.beginPath(); g.arc(38, 30, 16, 0, 7); g.fill(); });
  LAYERS.cat = layer(g => { g.fillStyle = '#c8ccd8'; g.beginPath(); g.arc(38, 31, 17, 0, 7); g.fill(); g.fillStyle = 'rgba(160,210,255,0.35)'; g.beginPath(); g.arc(38, 31, 17, 0, 7); g.fill();
    g.fillStyle = '#e8902a'; g.beginPath(); g.arc(38, 34, 10, 0, 7); g.fill(); g.beginPath(); g.moveTo(29, 30); g.lineTo(31, 20); g.lineTo(35, 27); g.fill(); g.beginPath(); g.moveTo(47, 30); g.lineTo(45, 20); g.lineTo(41, 27); g.fill();
    g.fillStyle = '#ffb0b0'; g.fillRect(31, 23, 2, 3); g.fillRect(43, 23, 2, 3); g.fillStyle = '#2aff6a'; g.fillRect(34, 32, 3, 3); g.fillRect(40, 32, 3, 3); g.fillStyle = '#111'; g.fillRect(35, 32, 1, 3); g.fillRect(41, 32, 1, 3);
    g.fillStyle = '#ff7aa0'; g.fillRect(37, 36, 3, 2); g.fillStyle = '#fff'; g.fillRect(28, 37, 5, 1); g.fillRect(44, 37, 5, 1); g.fillStyle = '#ffffff'; g.fillRect(30, 18, 3, 2);
    g.fillStyle = '#8a8ea0'; g.fillRect(28, 46, 20, 6); g.fillStyle = '#c8302a'; g.fillRect(36, 47, 4, 3); });
}
const RN = (() => { const r = rng(4); return Array.from({ length: N * N * 3 }, () => r() * 255); })();
// compose layers with given opacities and noise level into an ImageData
function compose(target, ops, noise, seedShift = 0) { const g = target.userData ? target.userData.g : target; const im = g.createImageData(N, N); const d = im.data;
  for (let i = 0; i < N * N; i++) { let r = 0, gg = 0, b = 0; const o = i * 4;
    for (const [k, a] of ops) { const L = LAYERS[k]; const la = L[o + 3] / 255 * a; r = lerp(r, L[o], la); gg = lerp(gg, L[o + 1], la); b = lerp(b, L[o + 2], la); }
    const j = ((i + seedShift * 997) % (N * N)) * 3; d[o] = lerp(r, RN[j], noise); d[o + 1] = lerp(gg, RN[j + 1], noise); d[o + 2] = lerp(b, RN[j + 2], noise); d[o + 3] = 255; }
  g.putImageData(im, 0, 0); if (target.userData) target.needsUpdate = true; }
const FULL = [['bg', 1], ['stars', 1], ['planet', 1], ['cat', 1]];

// ---------- training thumbnails ----------
const THUMBS = [['CAT', '#e8902a', '#3a7a3a'], ['DOG', '#8a5a2a', '#6a9ad8'], ['TREE', '#2a8a3a', '#a8d8f0'], ['CAR', '#c8302a', '#5a5a6a'], ['HOUSE', '#d8c8a0', '#7ab0e0'], ['SUN', '#ffd23a', '#4a8ad8'], ['FISH', '#ff8a3a', '#2a5ab0'], ['MOON', '#e8e8d0', '#0a0c2a']];
function thumbTex([cap, fg, bg]) { const t = ctex(32, 40); const g = t.userData.g; g.fillStyle = '#f4f4f0'; g.fillRect(0, 0, 32, 40); g.fillStyle = bg; g.fillRect(2, 2, 28, 26); g.fillStyle = fg;
  if (cap === 'CAT') { g.beginPath(); g.arc(16, 17, 8, 0, 7); g.fill(); g.beginPath(); g.moveTo(9, 14); g.lineTo(10, 6); g.lineTo(14, 11); g.fill(); g.beginPath(); g.moveTo(23, 14); g.lineTo(22, 6); g.lineTo(18, 11); g.fill(); }
  else if (cap === 'DOG') { g.beginPath(); g.arc(16, 17, 8, 0, 7); g.fill(); g.fillRect(6, 12, 4, 10); g.fillRect(22, 12, 4, 10); }
  else if (cap === 'TREE') { g.fillStyle = '#6a4a2a'; g.fillRect(14, 20, 4, 8); g.fillStyle = fg; g.beginPath(); g.moveTo(16, 4); g.lineTo(6, 22); g.lineTo(26, 22); g.fill(); }
  else if (cap === 'CAR') { g.fillRect(5, 15, 22, 7); g.fillRect(9, 10, 13, 6); g.fillStyle = '#111'; g.fillRect(8, 21, 4, 4); g.fillRect(20, 21, 4, 4); }
  else if (cap === 'HOUSE') { g.fillRect(8, 14, 16, 12); g.fillStyle = '#a83a2a'; g.beginPath(); g.moveTo(5, 15); g.lineTo(16, 5); g.lineTo(27, 15); g.fill(); }
  else { g.beginPath(); g.arc(16, 15, 8, 0, 7); g.fill(); }
  g.fillStyle = '#1a1a2a'; g.font = '7px PressStart'; g.textAlign = 'center'; g.fillText(cap, 16, 37); t.needsUpdate = true; return t; }

// ---------- scene ----------
let you, screenTex, easelTex, flyers, frameTex, frame, scribble;
function build() {
  const fl = new T3.Mesh(new T3.PlaneGeometry(14, 10), M('#ffffff', { map: (() => { const t = ctex(32, 32); noiseFill(t.userData.g, 32, 32, [110, 80, 60], 16, 1); t.userData.g.fillStyle = '#4a2c18'; for (let y = 0; y < 32; y += 6) t.userData.g.fillRect(0, y, 32, 1); t.needsUpdate = true; t.wrapS = t.wrapT = T3.RepeatWrapping; t.repeat.set(5, 4); return t; })() })); fl.rotation.x = -Math.PI / 2; scene.add(fl);
  const wall = new T3.Mesh(new T3.PlaneGeometry(14, 5), M('#3a4a6a')); wall.position.set(0, 2.5, -2.5); scene.add(wall);
  const lw = new T3.Mesh(new T3.PlaneGeometry(10, 5), M('#34445f')); lw.rotation.y = Math.PI / 2; lw.position.set(-4, 2.5, 2); scene.add(lw);
  // desk + retro computer
  B(2.4, 0.08, 1.0, '#6a4528', 0, 0.78, -1.6); for (const [x, z] of [[-1.1, -2], [1.1, -2], [-1.1, -1.2], [1.1, -1.2]]) B(0.06, 0.78, 0.06, '#3a2414', x, 0.39, z);
  B(1.1, 0.85, 0.8, '#d8d0bc', 0, 1.25, -1.85); B(0.95, 0.72, 0.02, '#1a1a1e', 0, 1.27, -1.44); screenTex = ctex(N, N);
  const scr = new T3.Mesh(new T3.PlaneGeometry(0.86, 0.64), new T3.MeshBasicMaterial({ map: screenTex })); scr.position.set(0, 1.27, -1.428); scene.add(scr);
  B(0.3, 0.12, 0.3, '#c8c0ac', 0, 0.86, -1.8); B(0.9, 0.04, 0.3, '#d8d0bc', 0, 0.82, -1.25); for (let i = 0; i < 12; i++) B(0.05, 0.02, 0.05, '#8a8478', -0.36 + (i % 6) * 0.14, 0.85, -1.3 + Math.floor(i / 6) * 0.09);
  const glow = new T3.PointLight('#7ad0ff', 1.2, 4); glow.position.set(0, 1.3, -1.0); scene.add(glow);
  // easel with a bad drawing
  const ea = new T3.Group(); ea.position.set(-2.4, 0, 0.3); ea.rotation.y = 0.5; scene.add(ea); for (const x of [-0.4, 0.4]) { const l = B(0.05, 2.0, 0.05, '#6a4528', x, 1.0, 0, ea); l.rotation.z = x * -0.12; } B(0.05, 1.8, 0.05, '#6a4528', 0, 0.9, -0.4, ea);
  easelTex = ctex(32, 40); const eg = easelTex.userData.g; eg.fillStyle = '#f4f0e4'; eg.fillRect(0, 0, 32, 40); eg.strokeStyle = '#2a2a2a'; eg.lineWidth = 1.5; eg.beginPath(); eg.moveTo(8, 25); eg.lineTo(14, 12); eg.lineTo(18, 28); eg.lineTo(24, 10); eg.lineTo(20, 30); eg.moveTo(10, 18); eg.lineTo(26, 22); eg.stroke(); eg.beginPath(); eg.arc(16, 20, 7, 0, 5); eg.stroke(); eg.fillStyle = '#c8302a'; eg.font = '10px PressStart'; eg.fillText('?', 22, 36); easelTex.needsUpdate = true;
  const canv = new T3.Mesh(new T3.PlaneGeometry(0.8, 1.0), new T3.MeshBasicMaterial({ map: easelTex })); canv.position.set(0, 1.4, 0.04); ea.add(canv); B(0.85, 0.04, 0.1, '#6a4528', 0, 0.88, 0.05, ea);
  // person
  you = person({ shirt: '#c8a03a', trousers: '#2a3450', hair: '#3a2416', skin: '#e8b896', longSleeve: true }); scene.add(you);
  // training photos that fly into the computer
  flyers = Array.from({ length: 16 }, (_, i) => { const m = new T3.Mesh(new T3.PlaneGeometry(0.32, 0.4), new T3.MeshBasicMaterial({ map: thumbTex(THUMBS[i % THUMBS.length]), transparent: true, side: T3.DoubleSide })); scene.add(m); return m; });
  // wall frame for the finished picture
  frameTex = ctex(N, N); frame = new T3.Group(); frame.position.set(2.2, 2.3, -2.48); scene.add(frame); B(1.3, 1.3, 0.06, '#c8a03a', 0, 0, 0, frame); const fp = new T3.Mesh(new T3.PlaneGeometry(1.14, 1.14), new T3.MeshBasicMaterial({ map: frameTex })); fp.position.z = 0.035; frame.add(fp);
  scene.add(new T3.HemisphereLight('#e8eeff', '#5a4a3a', 0.85)); const d = new T3.DirectionalLight('#fff4e0', 0.7); d.position.set(2, 5, 3); scene.add(d);
}

// ---------- events ----------
const EV = { cant: AT(0, 'draw', 1), comp: AT(1, 'computer'), mil: AT(1, 'millions'), see: AT(2, "can't"), nums: AT(2, 'numbers'), pat: AT(2, 'patterns'), trick: AT(3, "here's"), adds: AT(3, 'adds'), stat: AT(3, 'static'), prac: AT(3, 'practises'),
  newp: AT(4, 'now'), rand: AT(4, 'random'), words: AT(5, 'your'), guide: AT(5, 'guide'), less: AT(5, 'little'), shape: AT(5, 'shape'), cat: AT(5, 'cat'), stars: AT(5, 'stars'), after: AT(6, 'after'), brand: AT(6, 'brand'), copy: AT(7, 'copy'), what: AT(7, 'what') };
// generation progress: noise 1 → 0 from 'guide' to 'brand'
function genState(T) { const k = prog(T, EV.guide, EV.brand); const noise = 1 - ease(k);
  const ops = [['bg', clamp((T - EV.less) / 1.0)], ['shape', clamp((T - EV.shape + 0.1) / 0.5) * (1 - clamp((T - EV.cat) / 0.6))], ['cat', clamp((T - EV.cat + 0.1) / 0.6)], ['planet', clamp((T - EV.cat) / 1.0)], ['stars', clamp((T - EV.stars + 0.1) / 0.6)]];
  const step = Math.max(1, Math.min(30, Math.round(1 + k * 29))); return { ops, noise: Math.max(noise, T < EV.less ? 1 : 0), step }; }

// ---------- HUD ----------
function bigText(ctx, txt, y, size, col = '#ffd23a', a = 1, font = 'Russo') { if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.font = `${size}px ${font}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round'; ctx.lineWidth = size * 0.22; ctx.strokeStyle = '#05081a'; ctx.strokeText(txt, 360, y); ctx.fillStyle = col; ctx.fillText(txt, 360, y); ctx.restore(); }
function banner(ctx, kind, item, k, out) { const good = kind === 'unlock'; const x = lerp(-640, 40, ease(k)) - ease(out) * 700; ctx.save(); ctx.translate(x, 70); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(640, 0); ctx.lineTo(610, 120); ctx.lineTo(0, 120); ctx.closePath();
  const g = ctx.createLinearGradient(0, 0, 0, 120); if (good) { g.addColorStop(0, 'rgba(20,110,60,0.95)'); g.addColorStop(1, 'rgba(6,50,26,0.95)'); } else { g.addColorStop(0, 'rgba(170,30,30,0.95)'); g.addColorStop(1, 'rgba(80,8,8,0.95)'); } ctx.fillStyle = g; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = good ? '#7dffb0' : '#ffb0a0'; ctx.stroke();
  ctx.fillStyle = good ? '#7dffb0' : '#ffe24a'; ctx.beginPath(); ctx.arc(60, 60, 36, 0, 7); ctx.fill(); ctx.fillStyle = good ? '#06321a' : '#5a0808'; ctx.font = '46px Russo'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(good ? '✓' : '!', 60, 64);
  ctx.textAlign = 'left'; ctx.font = '20px PressStart'; ctx.fillStyle = good ? '#7dffb0' : '#ffe24a'; ctx.fillText(good ? 'UNLOCKED' : 'PROBLEM', 116, 38); ctx.font = (item.length > 16 ? 32 : 42) + 'px Russo'; ctx.fillStyle = '#fff'; ctx.fillText(item, 116, 86); ctx.restore(); }
const BAN = [['cant', 'problem', "YOU CAN'T DRAW"], ['mil', 'unlock', 'MILLIONS OF PICTURES'], ['see', 'problem', "COMPUTERS CAN'T SEE"], ['pat', 'unlock', 'PATTERN LEARNING'], ['adds', 'unlock', 'ADD NOISE'], ['prac', 'unlock', 'REMOVE NOISE'], ['rand', 'unlock', 'RANDOM STATIC'], ['words', 'unlock', 'YOUR PROMPT'], ['brand', 'unlock', 'NEW PICTURE']].map(([e, k, l]) => ({ t: EV[e] - 0.15, kind: k, label: l }));
BAN.forEach((b, i) => { const nx = BAN[i + 1]; b.end = nx ? Math.min(nx.t, b.t + 4) : b.t + 3; });
function card(ctx, title, x, y, w, h, a) { ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = 'rgba(6,14,40,0.92)'; ctx.fillRect(x, y, w, h); ctx.strokeStyle = '#7ad0ff'; ctx.lineWidth = 4; ctx.strokeRect(x, y, w, h); ctx.fillStyle = '#ffd23a'; ctx.fillRect(x, y, w, 34); ctx.font = '16px PressStart'; ctx.fillStyle = '#06102a'; ctx.textBaseline = 'middle'; ctx.fillText(title, x + 14, y + 18); ctx.restore(); }
function txt(ctx, s, x, y, size, c, align = 'left', font = 'Russo') { ctx.font = `${size}px ${font}`; ctx.fillStyle = c; ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.fillText(s, x, y); ctx.textAlign = 'left'; }
let pix; // offscreen 64x64 canvas for HUD images
function drawPix(ctx, ops, noise, x, y, size, seed = 0) { compose(pix.getContext('2d'), ops, noise, seed); ctx.imageSmoothingEnabled = false; ctx.drawImage(pix, x, y, size, size); }
const DIAG = [
  // picture → numbers
  { a: () => EV.nums - 0.2, b: () => EV.trick - 0.1, draw: (ctx, T, a) => { const x = 60, y = 420, w = 600, h = 470; card(ctx, 'WHAT THE COMPUTER SEES', x, y, w, h, a); ctx.save(); ctx.globalAlpha = a;
      drawPix(ctx, FULL, 0, x + 30, y + 70, 220); ctx.strokeStyle = '#ffd23a'; ctx.lineWidth = 4; ctx.strokeRect(x + 30 + 120, y + 70 + 90, 40, 40); ctx.beginPath(); ctx.moveTo(x + 190, y + 160); ctx.lineTo(x + 300, y + 90); ctx.moveTo(x + 190, y + 200); ctx.lineTo(x + 300, y + 330); ctx.stroke();
      const k = prog(T, EV.nums, EV.nums + 1.0); const r = rng(3); ctx.font = '15px PressStart'; for (let j = 0; j < 6; j++) for (let i = 0; i < 4; i++) { if ((j * 4 + i) / 24 > k) continue; txt(ctx, String((r() * 255) | 0), x + 320 + i * 66, y + 100 + j * 40, 15, '#7dffb0', 'left', 'PressStart'); }
      if (T > EV.pat - 0.2) { txt(ctx, 'PATTERN', x + 160, y + 330, 20, '#ffd23a', 'center', 'PressStart'); txt(ctx, '=', x + 300, y + 330, 30, '#fff', 'center'); txt(ctx, '"CAT"', x + 440, y + 330, 34, '#7dffb0', 'center'); }
      txt(ctx, 'EVERY PIXEL IS 3 NUMBERS', x + w / 2, y + h - 40, 18, '#9ab0d0', 'center', 'PressStart'); ctx.restore(); } },
  // add noise strip, then reverse
  { a: () => EV.adds - 0.2, b: () => EV.newp - 0.1, draw: (ctx, T, a) => { const x = 30, y = 420, w = 660, h = 460; card(ctx, 'TRAINING', x, y, w, h, a); ctx.save(); ctx.globalAlpha = a;
      const lv = [0, 0.3, 0.55, 0.8, 1]; const k = prog(T, EV.adds, EV.stat + 0.3); lv.forEach((n, i) => { if (i / 5 > k) return; drawPix(ctx, FULL, n, x + 22 + i * 128, y + 90, 108, i * 7); });
      ctx.lineWidth = 6; ctx.strokeStyle = '#ff8a5a'; ctx.fillStyle = '#ff8a5a'; ctx.beginPath(); ctx.moveTo(x + 40, y + 230); ctx.lineTo(x + w - 50, y + 230); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x + w - 40, y + 230); ctx.lineTo(x + w - 60, y + 218); ctx.lineTo(x + w - 60, y + 242); ctx.fill(); txt(ctx, 'ADD NOISE', x + w / 2, y + 262, 18, '#ff8a5a', 'center', 'PressStart');
      if (T > EV.prac - 0.2) { const kk = prog(T, EV.prac - 0.2, EV.prac + 0.4); ctx.globalAlpha = a * kk; ctx.strokeStyle = '#7dffb0'; ctx.fillStyle = '#7dffb0'; ctx.beginPath(); ctx.moveTo(x + w - 40, y + 320); ctx.lineTo(x + 50, y + 320); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x + 40, y + 320); ctx.lineTo(x + 60, y + 308); ctx.lineTo(x + 60, y + 332); ctx.fill(); txt(ctx, 'PRACTISE REMOVING IT', x + w / 2, y + 352, 18, '#7dffb0', 'center', 'PressStart'); txt(ctx, 'MILLIONS OF TIMES', x + w / 2, y + 400, 26, '#fff', 'center'); }
      ctx.restore(); } },
  // generation big screen with prompt + step counter
  { a: () => EV.rand - 0.3, b: () => EV.copy - 0.2, draw: (ctx, T, a) => { const x = 80, y = 380, w = 560, h = 600; card(ctx, 'GENERATING', x, y, w, h, a); ctx.save(); ctx.globalAlpha = a;
      ctx.fillStyle = '#e8eef8'; ctx.fillRect(x + 20, y + 50, w - 40, 56); const p = 'A CAT IN SPACE'; const n = Math.floor(clamp((T - EV.words) / 1.2) * p.length); txt(ctx, p.slice(0, n) + ((T * 2) % 2 > 1 && n < p.length ? '_' : ''), x + 36, y + 79, 26, '#1a1a2a'); if (n === 0) txt(ctx, 'TYPE A PROMPT', x + 36, y + 79, 16, '#8a90a0', 'left', 'PressStart');
      const st = genState(T); drawPix(ctx, st.ops, st.noise, x + 60, y + 124, 440, Math.floor(T * 4));
      txt(ctx, T < EV.guide ? 'STEP 0 OF 30' : `STEP ${st.step} OF 30`, x + w / 2, y + h - 28, 20, '#ffd23a', 'center', 'PressStart'); ctx.restore(); } },
];
// captions
const CAPS = [];
for (const c of CL) { let cur = []; const flush = () => { if (cur.length) CAPS.push({ a: cur[0].a, b: cur[cur.length - 1].b, txt: cur.map(w => w.w).join(' ') }); cur = []; };
  c.words.forEach(w => { if (cur.length && (cur.length >= 4 || w.a - cur[cur.length - 1].b > 0.2 || /^(But|So|Then|To|Here's|In|Now|Your|A|After|It's|What|Comment|Stars)$/.test(w.w) && cur.length > 1)) flush(); cur.push(w); }); flush(); }
CAPS.forEach((c, i) => { const nx = CAPS[i + 1]; c.b = nx ? Math.min(nx.a, c.b + 0.35) : c.b + 0.8; c.txt = c.txt.replace(/[:\-]/g, '.').replace(/\bA I\b/, 'AI'); });
function captionBox(ctx, t, y = 1080) { ctx.save(); ctx.font = '50px Russo'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; const words = t.split(' '); const lines = []; let cur = ''; for (const w of words) { const x = cur ? cur + ' ' + w : w; if (ctx.measureText(x).width > 610 && cur) { lines.push(cur); cur = w; } else cur = x; } lines.push(cur);
  const y0 = y - (lines.length - 1) * 31; lines.forEach((l, i) => { ctx.lineJoin = 'round'; ctx.lineWidth = 11; ctx.strokeStyle = '#05081a'; ctx.strokeText(l, 360, y0 + i * 62); ctx.fillStyle = '#fff'; ctx.fillText(l, 360, y0 + i * 62); }); ctx.restore(); }

function cam(p, l) { camera.position.set(p[0], p[1], p[2]); camera.lookAt(l[0], l[1], l[2]); }
function camL(a, b, k, la, lb) { k = ease(k); cam([lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)], [lerp(la[0], lb[0], k), lerp(la[1], lb[1], k), lerp(la[2], lb[2], k)]); }
let glc, out, octx, low, lctx;
window.initFootball = async function () {
  await Promise.all(['30px Russo', '20px PressStart'].map(f => document.fonts.load(f)));
  makeTextures(); makeArt(); pix = document.createElement('canvas'); pix.width = pix.height = N;
  glc = document.createElement('canvas'); glc.width = RW; glc.height = RH;
  renderer = new T3.WebGLRenderer({ canvas: glc, antialias: false, preserveDrawingBuffer: true }); renderer.setPixelRatio(1); renderer.setSize(RW, RH, false); renderer.outputColorSpace = T3.SRGBColorSpace;
  camera = new T3.PerspectiveCamera(55, RW / RH, 0.05, 100); scene = new T3.Scene(); scene.background = new T3.Color('#1a2440');
  build(); compose(frameTex, FULL, 0);
  out = document.getElementById('c'); octx = out.getContext('2d'); low = document.createElement('canvas'); lctx = low.getContext('2d');
};
window.DURATION = TM.total;
window.renderFrame = function (T) {
  let ci = CL.findIndex(c => T >= c.start && T < c.start + c.dur); if (ci < 0) ci = CL.length - 1;
  const lt = T - CL[ci].start, D = CL[ci].dur;
  // monitor content
  const sg = screenTex.userData.g;
  if (T < EV.comp - 0.2) { sg.fillStyle = '#1a2a4a'; sg.fillRect(0, 0, N, N); sg.fillStyle = '#7ad0ff'; sg.fillRect(4, 4, 10, 8); sg.fillRect(4, 16, 10, 8); screenTex.needsUpdate = true; }
  else if (T < EV.nums - 0.2) { sg.fillStyle = '#0a0c20'; sg.fillRect(0, 0, N, N); sg.fillStyle = '#7dffb0'; sg.font = '8px PressStart'; sg.fillText('LEARNING', 6, 30); sg.fillRect(6, 38, Math.min(52, (T - EV.comp) * 9), 4); screenTex.needsUpdate = true; }
  else if (T < EV.rand - 0.3) { sg.fillStyle = '#0a0c20'; sg.fillRect(0, 0, N, N); const r = rng(Math.floor(T * 6)); sg.fillStyle = '#7dffb0'; sg.font = '6px monospace'; for (let j = 0; j < 8; j++) sg.fillText(Array.from({ length: 4 }, () => String((r() * 255) | 0).padStart(3, '0')).join(' '), 2, 8 + j * 7.5); screenTex.needsUpdate = true; }
  else { const st = genState(T); compose(screenTex, st.ops, st.noise, Math.floor(T * 4)); }
  // flying training pictures
  flyers.forEach((f, i) => { const t0 = EV.comp + i * 0.22; const k = prog(T, t0, t0 + 1.4); f.visible = k > 0 && k < 1; const a = i * 2.4; f.position.set(lerp(C(a) * 2.2, 0, ease(k)), lerp(1.6 + S(a) * 0.8, 1.27, ease(k)), lerp(1.2, -1.45, ease(k))); f.scale.setScalar(lerp(1, 0.2, ease(k))); f.rotation.set(0, (1 - k) * 2 * S(a), (1 - k) * C(a)); });
  // person
  idle(you, T); you.userData.armR.rotation.set(0, 0, 0);
  if (ci === 0) { you.position.set(-1.35, 0, 0.6); you.rotation.y = -2.0; you.userData.armR.rotation.x = -1.3 + S(T * 12) * 0.2; if (T > EV.cant - 0.3) { you.userData.armR.rotation.x = 0; you.userData.armL.rotation.z = -2.6; you.userData.armR.rotation.z = 2.6; you.userData.head.rotation.x = 0.3; } }
  else { you.position.set(-0.85, 0, -0.75); you.rotation.y = Math.PI + 0.55; if (T > EV.words - 0.2 && T < EV.guide + 0.5) { you.userData.armL.rotation.x = you.userData.armR.rotation.x = -1.0 + S(T * 20) * 0.1; } }
  // cameras
  if (ci === 0) camL([-1.4, 1.8, 3.0], [-1.6, 1.7, 2.6], prog(lt, 0, D), [-2.1, 1.25, 0.3], [-2.2, 1.3, 0.3]);
  else if (ci === 1) camL([1.6, 1.9, 2.4], [1.2, 1.6, 1.4], prog(lt, 0, D), [-0.2, 1.2, -1.4], [0, 1.25, -1.5]);
  else if (ci === 2) camL([0.9, 1.5, 0.3], [0.5, 1.4, -0.4], prog(lt, 0, D), [0, 1.27, -1.44], [0, 1.27, -1.44]);
  else if (ci <= 6) camL([1.3, 1.7, 1.1], [0.7, 1.5, 0.4], prog(T, CL[3].start, CL[7].start), [-0.1, 1.25, -1.44], [0, 1.27, -1.44]);
  else camL([0.4, 1.6, 1.6], [0.9, 2.0, 2.2], prog(lt, 0, D * 0.6), [0, 1.3, -1.44], [1.5, 1.9, -2.48]);
  renderer.render(scene, camera);
  const mz = clamp(1 - lt / 0.25); const f = mz > 0 && ci > 0 ? Math.max(1, Math.round(mz * 10)) : 1; octx.imageSmoothingEnabled = false;
  if (f > 1) { low.width = Math.ceil(RW / f); low.height = Math.ceil(RH / f); lctx.imageSmoothingEnabled = false; lctx.drawImage(glc, 0, 0, low.width, low.height); octx.drawImage(low, 0, 0, W, H); } else octx.drawImage(glc, 0, 0, W, H);
  octx.fillStyle = 'rgba(0,0,0,0.08)'; for (let y = 0; y < H; y += 5) octx.fillRect(0, y, W, 2);
  const vg = octx.createRadialGradient(360, 640, 420, 360, 640, 900); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.4)'); octx.fillStyle = vg; octx.fillRect(0, 0, W, H);
  const b = BAN.find(e => T >= e.t && T < e.end); if (b) banner(octx, b.kind, b.label, prog(T, b.t, b.t + 0.3), prog(T, b.end - 0.25, b.end));
  let diagOn = false; for (const d of DIAG) { const a0 = d.a(), b0 = d.b(); if (T >= a0 && T < b0) { diagOn = true; d.draw(octx, T, Math.min(prog(T, a0, a0 + 0.3), 1 - prog(T, b0 - 0.25, b0))); } }
  if (ci === 0 && T < EV.cant - 0.2) bigText(octx, 'A CAT IN SPACE?', 300, 70, '#ffd23a', prog(T, 0.4, 0.8));
  if (ci === 7) { const k = prog(T, EV.copy - 0.2, EV.copy + 0.2); const ao = 1 - prog(lt, wt(7, 'what') - 0.3, wt(7, 'what')); bigText(octx, 'NOT COPY + PASTE', 280, 60, '#ff5a3a', k * ao); bigText(octx, 'STATIC  >  PICTURE', 370, 54, '#7dffb0', prog(T, AT(7, "it's", 1) - 0.1, AT(7, "it's", 1) + 0.2) * ao);
    if (lt > wt(7, 'what') - 0.2) { const a = prog(lt, wt(7, 'what') - 0.2, wt(7, 'what') + 0.2); bigText(octx, 'WHAT SHOULD', 280, 64, '#fff', a); bigText(octx, 'AI DRAW NEXT?', 360, 68, '#ffd23a', a); if ((lt * 2) % 2 > 0.6) bigText(octx, 'COMMENT BELOW', 440, 26, '#7ad0ff', a, 'PressStart'); } }
  const cap = CAPS.find(c => T >= c.a && T < c.b); if (cap) captionBox(octx, cap.txt, diagOn ? 1130 : 1080);
  if (T < 0.25) { octx.fillStyle = `rgba(0,0,0,${1 - T / 0.25})`; octx.fillRect(0, 0, W, H); }
  if (T > TM.total - 0.7) { octx.fillStyle = `rgba(0,0,0,${prog(T, TM.total - 0.7, TM.total)})`; octx.fillRect(0, 0, W, H); }
};
})();
