// Low-poly "early-2000s console" 3D toolkit: pixel textures, blocky people, props.
(() => {
const T3 = THREE;
const RW = 288, RH = 512; // internal render resolution (upscaled with nearest-neighbour)
const W = 720, H = 1280;
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const ease = t => { t = clamp(t); return t * t * (3 - 2 * t); };
const prog = (t, a, b) => clamp((t - a) / (b - a));
function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }

// ---------- pixel textures ----------
function tex(w, h, draw, repeat = [1, 1]) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); draw(g, w, h);
  const t = new T3.CanvasTexture(c); t.magFilter = T3.NearestFilter; t.minFilter = T3.NearestFilter; t.generateMipmaps = false;
  t.wrapS = t.wrapT = T3.RepeatWrapping; t.repeat.set(repeat[0], repeat[1]); t.colorSpace = T3.SRGBColorSpace; return t;
}
function noiseFill(g, w, h, base, vary, seed) { const r = rng(seed); for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const k = (r() - 0.5) * vary; g.fillStyle = `rgb(${base[0] + k},${base[1] + k},${base[2] + k})`; g.fillRect(x, y, 1, 1); } }
const TX = {};
function makeTextures() {
  TX.grass = (rep = [8, 8]) => tex(32, 32, (g, w, h) => { noiseFill(g, w, h, [70, 128, 52], 22, 1); g.fillStyle = 'rgba(255,255,255,0.06)'; g.fillRect(0, 0, 16, 32); }, rep);
  TX.pitch = (rep = [1, 1]) => tex(128, 256, (g, w, h) => {
    for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? '#3f8a3a' : '#4a9a42'; g.fillRect(0, i * 32, w, 32); }
    const r = rng(4); for (let i = 0; i < 1500; i++) { g.fillStyle = `rgba(0,0,0,${r() * 0.08})`; g.fillRect(r() * w | 0, r() * h | 0, 1, 1); }
    g.strokeStyle = '#e8eee0'; g.lineWidth = 2; g.strokeRect(6, 6, w - 12, h - 12); g.beginPath(); g.moveTo(6, h / 2); g.lineTo(w - 6, h / 2); g.stroke();
    g.beginPath(); g.arc(w / 2, h / 2, 18, 0, 7); g.stroke(); g.strokeRect(w / 2 - 34, 6, 68, 34); g.strokeRect(w / 2 - 34, h - 40, 68, 34);
  }, rep);
  TX.mud = (rep = [6, 6]) => tex(32, 32, (g, w, h) => { noiseFill(g, w, h, [96, 72, 48], 30, 2); }, rep);
  TX.stone = (rep = [6, 6]) => tex(32, 32, (g, w, h) => { noiseFill(g, w, h, [150, 146, 136], 20, 3); g.strokeStyle = '#6e6a62'; for (let y = 0; y < 32; y += 8) { g.beginPath(); g.moveTo(0, y + 0.5); g.lineTo(32, y + 0.5); g.stroke(); for (let x = (y / 8) % 2 * 8; x < 32; x += 16) { g.beginPath(); g.moveTo(x + 0.5, y); g.lineTo(x + 0.5, y + 8); g.stroke(); } } }, rep);
  TX.brick = (rep = [4, 4]) => tex(32, 32, (g, w, h) => { noiseFill(g, w, h, [150, 62, 44], 26, 5); g.fillStyle = '#c9b9a0'; for (let y = 0; y < 32; y += 6) { g.fillRect(0, y, 32, 1); for (let x = (y / 6) % 2 * 6; x < 32; x += 12) g.fillRect(x, y, 1, 6); } }, rep);
  TX.wood = (rep = [2, 2]) => tex(32, 32, (g, w, h) => { noiseFill(g, w, h, [110, 74, 44], 18, 6); g.fillStyle = '#4a3020'; for (let y = 0; y < 32; y += 8) g.fillRect(0, y, 32, 1); }, rep);
  TX.plaster = (rep = [2, 2]) => tex(32, 32, (g, w, h) => { noiseFill(g, w, h, [226, 214, 190], 12, 7); g.fillStyle = '#4a3020'; g.fillRect(0, 0, 32, 3); g.fillRect(0, 29, 32, 3); g.fillRect(0, 0, 3, 32); g.fillRect(29, 0, 3, 32); g.save(); g.translate(0, 0); g.beginPath(); g.moveTo(3, 3); g.lineTo(29, 29); g.lineWidth = 3; g.strokeStyle = '#4a3020'; g.stroke(); g.restore(); }, rep);
  TX.roofTile = (rep = [4, 4]) => tex(16, 16, (g, w, h) => { noiseFill(g, w, h, [52, 82, 70], 14, 8); g.fillStyle = '#26402f'; for (let y = 0; y < 16; y += 4) g.fillRect(0, y, 16, 1); }, rep);
  TX.thatch = (rep = [3, 3]) => tex(16, 16, (g, w, h) => { noiseFill(g, w, h, [168, 136, 74], 30, 9); }, rep);
  TX.crowd = (rep = [12, 3]) => tex(32, 16, (g, w, h) => { const r = rng(10); g.fillStyle = '#2a2a34'; g.fillRect(0, 0, w, h); const cols = ['#e8e0d0', '#d04a3a', '#3a5ad0', '#e8c03a', '#f0f0f0', '#5a8a3a', '#202020']; for (let y = 0; y < h; y += 4) for (let x = 0; x < w; x += 3) { g.fillStyle = cols[r() * cols.length | 0]; g.fillRect(x + (y / 4 % 2), y, 2, 2); g.fillStyle = '#e9c9a0'; g.fillRect(x + (y / 4 % 2), y + 2, 2, 1); } }, rep);
  TX.panel = (rep = [2, 2]) => tex(32, 32, (g, w, h) => { noiseFill(g, w, h, [92, 58, 34], 14, 11); g.fillStyle = '#5c3a22'; g.fillRect(2, 2, 12, 28); g.fillRect(18, 2, 12, 28); }, rep);
  TX.face = (opts = {}) => tex(16, 16, (g) => { g.clearRect(0, 0, 16, 16); g.fillStyle = '#111'; g.fillRect(4, 6, 2, 3); g.fillRect(10, 6, 2, 3); if (opts.beard) { g.fillStyle = opts.beard; g.fillRect(3, 11, 10, 5); } g.fillStyle = '#5a2a20'; g.fillRect(6, 12, 4, 1); if (opts.moustache) { g.fillStyle = opts.moustache; g.fillRect(4, 10, 8, 2); } });
  TX.sign = (txt, bg = '#3a2616', fg = '#f4e2b0', w = 128, h = 48, size = 12) => tex(w, h, (g) => { g.fillStyle = bg; g.fillRect(0, 0, w, h); g.strokeStyle = fg; g.lineWidth = 2; g.strokeRect(3, 3, w - 6, h - 6); g.fillStyle = fg; g.font = `${size}px PressStart`; g.textAlign = 'center'; g.textBaseline = 'middle'; const ls = txt.split('\n'); ls.forEach((l, i) => g.fillText(l, w / 2, h / 2 + (i - (ls.length - 1) / 2) * (size + 4))); });
  TX.paper = () => tex(64, 80, (g, w, h) => { noiseFill(g, w, h, [232, 220, 186], 14, 12); g.fillStyle = '#3a2a1a'; g.font = '6px PressStart'; g.fillText('RULES', 14, 12); for (let y = 20; y < 76; y += 6) g.fillRect(6, y, 30 + ((y * 7) % 22), 2); });
}

// ---------- materials / meshes ----------
const MC = {};
function mat(color, opts = {}) { const k = color + JSON.stringify(Object.keys(opts)); if (!opts.map && MC[k]) return MC[k]; const m = new T3.MeshLambertMaterial(Object.assign({ color, flatShading: true }, opts)); if (!opts.map) MC[k] = m; return m; }
function box(w, h, d, m, x = 0, y = 0, z = 0) { const o = new T3.Mesh(new T3.BoxGeometry(w, h, d), typeof m === 'string' || typeof m === 'number' ? mat(m) : m); o.position.set(x, y, z); return o; }
function cyl(rt, rb, h, seg, m, x = 0, y = 0, z = 0) { const o = new T3.Mesh(new T3.CylinderGeometry(rt, rb, h, seg), typeof m === 'string' || typeof m === 'number' ? mat(m) : m); o.position.set(x, y, z); return o; }
function sph(r, m, x = 0, y = 0, z = 0, ws = 7, hs = 5) { const o = new T3.Mesh(new T3.SphereGeometry(r, ws, hs), typeof m === 'string' || typeof m === 'number' ? mat(m) : m); o.position.set(x, y, z); return o; }
function ground(size, map, color = 0xffffff) { const g = new T3.Mesh(new T3.PlaneGeometry(size, size), new T3.MeshLambertMaterial({ map, color })); g.rotation.x = -Math.PI / 2; return g; }

// ---------- people ----------
// o: shirt, shorts, socks, skin, hair, hat('top','cap','helmet','crown','none'), robe, trousers, beard, stripes
function person(o = {}) {
  const g = new T3.Group();
  const skin = o.skin || '#e8b896', shirt = o.shirt || '#ffffff', lower = o.trousers || o.shorts || '#222833';
  const body = new T3.Group(); g.add(body);
  // legs
  const leg = side => {
    const p = new T3.Group(); p.position.set(side * 0.13, 0.82, 0);
    p.add(box(0.18, 0.42, 0.2, o.trousers ? lower : (o.shorts || lower), 0, -0.21, 0));
    p.add(box(0.16, 0.38, 0.18, o.trousers ? lower : (o.socks || '#f0f0f0'), 0, -0.6, 0));
    p.add(box(0.19, 0.09, 0.32, o.boots || '#1a1a1a', 0, -0.8, 0.06));
    body.add(p); return p;
  };
  const legL = leg(-1), legR = leg(1);
  // torso / robe
  if (o.robe) { body.add(cyl(0.3, 0.44, 0.95, 6, o.robe, 0, 0.98, 0)); }
  body.add(box(0.52, 0.66, 0.3, shirt, 0, 1.3, 0));
  if (o.stripes) for (let i = -2; i <= 2; i++) body.add(box(0.06, 0.66, 0.31, o.stripes, i * 0.11, 1.3, 0));
  if (!o.robe) body.add(box(0.5, 0.24, 0.3, o.trousers ? lower : (o.shorts || lower), 0, 0.9, 0));
  if (o.jacket) { body.add(box(0.54, 0.66, 0.31, o.jacket, 0, 1.3, -0.005)); body.add(box(0.14, 0.5, 0.315, shirt, 0, 1.38, 0)); }
  if (o.collar) body.add(box(0.3, 0.08, 0.32, o.collar, 0, 1.6, 0));
  if (o.tie) { body.add(box(0.09, 0.42, 0.02, o.tie, 0, 1.36, 0.16)); body.add(box(0.12, 0.08, 0.03, o.tie, 0, 1.59, 0.16)); }
  // arms
  const arm = side => {
    const p = new T3.Group(); p.position.set(side * 0.34, 1.58, 0);
    p.add(box(0.15, 0.36, 0.16, o.jacket || shirt, 0, -0.18, 0));
    p.add(box(0.13, 0.3, 0.14, o.longSleeve || o.jacket ? (o.jacket || shirt) : skin, 0, -0.5, 0));
    p.add(box(0.12, 0.12, 0.12, skin, 0, -0.7, 0));
    body.add(p); return p;
  };
  const armL = arm(-1), armR = arm(1);
  // head
  const head = new T3.Group(); head.position.set(0, 1.9, 0); body.add(head);
  head.add(box(0.12, 0.12, 0.12, skin, 0, -0.2, 0));
  head.add(sph(0.25, skin, 0, 0.02, 0, 7, 6));
  const face = new T3.Mesh(new T3.PlaneGeometry(0.34, 0.34), new T3.MeshBasicMaterial({ map: TX.face({ beard: o.beard, moustache: o.moustache }), transparent: true })); face.position.set(0, 0.02, 0.235); head.add(face);
  if (o.hair) { const h = sph(0.265, o.hair, 0, 0.07, -0.03, 7, 5); h.scale.set(1, 0.8, 1); head.add(h); }
  if (o.hat === 'top') { head.add(cyl(0.2, 0.2, 0.36, 8, o.hatCol || '#151515', 0, 0.38, 0)); head.add(cyl(0.32, 0.32, 0.04, 8, o.hatCol || '#151515', 0, 0.2, 0)); }
  if (o.hat === 'cap') { head.add(cyl(0.27, 0.27, 0.12, 8, o.hatCol || '#2a3a7a', 0, 0.2, 0)); head.add(box(0.3, 0.03, 0.18, o.hatCol || '#2a3a7a', 0, 0.16, 0.24)); }
  if (o.hat === 'helmet') { head.add(new T3.Mesh(new T3.ConeGeometry(0.29, 0.34, 6), mat(o.hatCol || '#8a7a40'))).position.set(0, 0.3, 0); }
  if (o.hat === 'crown') { const c = cyl(0.22, 0.2, 0.16, 6, '#e8c040', 0, 0.28, 0); head.add(c); for (let i = 0; i < 6; i++) { const s = new T3.Mesh(new T3.ConeGeometry(0.05, 0.12, 4), mat('#e8c040')); s.position.set(Math.cos(i) * 0.2, 0.42, Math.sin(i) * 0.2); head.add(s); } }
  if (o.hat === 'hood') { const h = sph(0.3, o.hatCol || '#6a4a2a', 0, 0.06, -0.04, 7, 5); h.scale.set(1, 1, 1.05); head.add(h); face.position.z = 0.3; }
  g.userData = { body, legL, legR, armL, armR, head };
  return g;
}
function run(p, phase, amt = 1, bob = true) {
  const u = p.userData; const s = Math.sin(phase);
  u.legL.rotation.x = s * 0.9 * amt; u.legR.rotation.x = -s * 0.9 * amt;
  u.armL.rotation.x = -s * 0.8 * amt; u.armR.rotation.x = s * 0.8 * amt;
  u.body.position.y = bob ? Math.abs(Math.cos(phase)) * 0.07 * amt : 0; u.body.rotation.x = 0.12 * amt;
}
function idle(p, t, k = 1) { const u = p.userData; u.legL.rotation.x = u.legR.rotation.x = 0; u.armL.rotation.x = Math.sin(t * 1.3) * 0.05 * k; u.armR.rotation.x = -Math.sin(t * 1.3) * 0.05 * k; u.armL.rotation.z = -0.08; u.armR.rotation.z = 0.08; u.body.position.y = Math.sin(t * 2) * 0.01; u.body.rotation.x = 0; }
function kick(p, k) { const u = p.userData; u.legR.rotation.x = lerp(0.6, -1.3, k); u.legL.rotation.x = 0.1; u.armL.rotation.z = -0.7; u.armR.rotation.x = 0.6; u.body.rotation.x = -0.1; }
function cheer(p, t) { const u = p.userData; u.armL.rotation.z = -2.6 + Math.sin(t * 8) * 0.2; u.armR.rotation.z = 2.6 - Math.sin(t * 8) * 0.2; u.armL.rotation.x = u.armR.rotation.x = 0; u.body.position.y = Math.abs(Math.sin(t * 6)) * 0.15; }

// ---------- props ----------
function ball(col = '#f4f4f4', size = 0.13) { const m = new T3.Mesh(new T3.IcosahedronGeometry(size, 0), mat(col)); const g = new T3.Group(); g.add(m); if (col === '#f4f4f4') { const d = new T3.Mesh(new T3.IcosahedronGeometry(size * 1.01, 0), new T3.MeshLambertMaterial({ color: '#222', wireframe: true })); g.add(d); } return g; }
function goal(w = 3.6, h = 1.3, d = 1.0, net = true) {
  const g = new T3.Group(); const pm = '#f4f4f4';
  g.add(box(0.1, h, 0.1, pm, -w / 2, h / 2, 0)); g.add(box(0.1, h, 0.1, pm, w / 2, h / 2, 0)); g.add(box(w + 0.1, 0.1, 0.1, pm, 0, h, 0));
  if (net) { const nm = new T3.MeshBasicMaterial({ color: '#e0e0e0', wireframe: true, transparent: true, opacity: 0.7 });
    const back = new T3.Mesh(new T3.PlaneGeometry(w, h, 12, 5), nm); back.position.set(0, h / 2, -d); g.add(back);
    const top = new T3.Mesh(new T3.PlaneGeometry(w, d, 12, 4), nm); top.rotation.x = Math.PI / 2; top.position.set(0, h, -d / 2); g.add(top);
    for (const s of [-1, 1]) { const sd = new T3.Mesh(new T3.PlaneGeometry(d, h, 4, 5), nm); sd.rotation.y = Math.PI / 2; sd.position.set(s * w / 2, h / 2, -d / 2); g.add(sd); }
    g.userData.back = back; }
  return g;
}
function tree(x, z, s = 1, col = '#3a6a32') { const g = new T3.Group(); g.add(cyl(0.12 * s, 0.18 * s, 1.4 * s, 5, '#5a3a22', 0, 0.7 * s, 0)); const c = new T3.Mesh(new T3.ConeGeometry(0.9 * s, 2.2 * s, 6), mat(col)); c.position.y = 2.2 * s; g.add(c); const c2 = new T3.Mesh(new T3.ConeGeometry(0.7 * s, 1.6 * s, 6), mat(col)); c2.position.y = 3.0 * s; g.add(c2); g.position.set(x, 0, z); return g; }
function house(x, z, rot = 0, s = 1) { const g = new T3.Group(); const w = box(3 * s, 2.2 * s, 2.4 * s, new T3.MeshLambertMaterial({ map: TX.plaster([2, 1]) }), 0, 1.1 * s, 0); g.add(w);
  const roof = new T3.Mesh(new T3.CylinderGeometry(0.01, 2.0 * s, 1.6 * s, 4, 1), new T3.MeshLambertMaterial({ map: TX.thatch(), flatShading: true })); roof.rotation.y = Math.PI / 4; roof.scale.set(1.15, 1, 0.9); roof.position.y = 3.0 * s; g.add(roof);
  g.add(box(0.6 * s, 1.1 * s, 0.05, '#4a3020', 0, 0.55 * s, 1.21 * s)); g.position.set(x, 0, z); g.rotation.y = rot; return g; }
function crowdStand(len, rows, x, z, rotY, t0 = 0) {
  const g = new T3.Group(); const step = new T3.Mesh(new T3.BoxGeometry(len, rows * 0.5, rows * 0.7), new T3.MeshLambertMaterial({ color: '#555a64' })); step.position.set(0, rows * 0.25, -rows * 0.35); g.add(step);
  const facade = new T3.Mesh(new T3.PlaneGeometry(len, rows * 0.9), new T3.MeshBasicMaterial({ map: TX.crowd([len / 3, rows / 2]) })); facade.position.set(0, rows * 0.45 + 0.1, 0.02); facade.rotation.x = -0.65; g.add(facade);
  g.position.set(x, 0, z); g.rotation.y = rotY; g.userData.facade = facade; return g;
}
function trophy(col = '#e8c040') { const g = new T3.Group(); g.add(cyl(0.18, 0.24, 0.12, 8, '#3a2a1a', 0, 0.06, 0)); g.add(cyl(0.05, 0.08, 0.3, 8, col, 0, 0.27, 0)); g.add(cyl(0.22, 0.08, 0.32, 8, col, 0, 0.58, 0)); for (const s of [-1, 1]) { const h = new T3.Mesh(new T3.TorusGeometry(0.09, 0.025, 4, 8), mat(col)); h.position.set(s * 0.24, 0.6, 0); h.rotation.y = Math.PI / 2; g.add(h); } return g; }
function signBoard(txt, w = 2, h = 0.75, opts = {}) { const m = new T3.Mesh(new T3.PlaneGeometry(w, h), new T3.MeshBasicMaterial({ map: TX.sign(txt, opts.bg, opts.fg, opts.pw, opts.ph, opts.size) })); return m; }

window.W3 = { T3, RW, RH, W, H, clamp, lerp, ease, prog, rng, makeTextures, TX, mat, box, cyl, sph, ground, person, run, idle, kick, cheer, ball, goal, tree, house, crowdStand, trophy, signBoard };
})();
