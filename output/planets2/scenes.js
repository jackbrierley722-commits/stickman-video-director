// Pick a planet — four low-poly worlds, multiple cuts each, higher-res render (540x960, antialiased, smooth upscale).
(() => {
const { T3, W, H, clamp, lerp, ease, prog, rng, makeTextures, TX, person, run, idle, cheer } = window.W3;
const RW = 540, RH = 960;
const TM = window.TIMING, CL = TM.clips;
const S = Math.sin, C = Math.cos, PI = Math.PI;
function wt(ci, word, n = 0) { let k = 0; for (const w of CL[ci].words) if (w.w.toLowerCase().replace(/[^a-z0-9']/g, '') === word) { if (k === n) return w.a - CL[ci].start; k++; } return 0; }
const AT = (ci, w, n = 0) => CL[ci].start + wt(ci, w, n);
let renderer, camera, scene, glc, out, octx, small, sctx;

// ---------- helpers ----------
const L = (c, o = {}) => new T3.MeshLambertMaterial(Object.assign({ color: c, flatShading: true }, o));
const Ph = (c, o = {}) => new T3.MeshPhongMaterial(Object.assign({ color: c, flatShading: true, shininess: 90, specular: '#ffffff' }, o));
const Bm = (c, o = {}) => new T3.MeshBasicMaterial(Object.assign({ color: c }, o));
function add(parent, geo, mat, x = 0, y = 0, z = 0) { const m = new T3.Mesh(geo, mat); m.position.set(x, y, z); parent.add(m); return m; }
const Bx = (w, h, d) => new T3.BoxGeometry(w, h, d);
function ctex(w, h, draw, nearest = false) { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); draw(g, w, h); const t = new T3.CanvasTexture(c); if (nearest) { t.magFilter = t.minFilter = T3.NearestFilter; t.generateMipmaps = false; } t.colorSpace = T3.SRGBColorSpace; t.wrapS = t.wrapT = T3.RepeatWrapping; t.userData = { c, g }; return t; }
let GLOW;
function glow(parent, color, size, x, y, z, op = 0.8) { const s = new T3.Sprite(new T3.SpriteMaterial({ map: GLOW, color, transparent: true, opacity: op, blending: T3.AdditiveBlending, depthWrite: false, fog: false })); s.scale.set(size, size, 1); s.position.set(x, y, z); parent.add(s); return s; }
function sky(parent, stops, r = 600) { const g = new T3.SphereGeometry(r, 32, 20); const col = []; const p = g.attributes.position; const c = new T3.Color();
  for (let i = 0; i < p.count; i++) { const v = p.getY(i) / r; let a = stops[0], b = stops[stops.length - 1], k = 0; for (let j = 0; j < stops.length - 1; j++) if (v >= stops[j][0] && v <= stops[j + 1][0]) { a = stops[j]; b = stops[j + 1]; k = (v - a[0]) / (b[0] - a[0]); } c.set(a[1]).lerp(new T3.Color(b[1]), k); col.push(c.r, c.g, c.b); }
  g.setAttribute('color', new T3.Float32BufferAttribute(col, 3)); const m = new T3.Mesh(g, new T3.MeshBasicMaterial({ vertexColors: true, side: T3.BackSide, fog: false, depthWrite: false })); m.renderOrder = -1; parent.add(m); return m; }
function terrain(parent, size, seg, hfn, colfn, mat) { const g = new T3.PlaneGeometry(size, size, seg, seg); g.rotateX(-PI / 2); const p = g.attributes.position; const col = []; const c = new T3.Color();
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i); const y = hfn(x, z); p.setY(i, y); c.set(colfn(x, y, z)); col.push(c.r, c.g, c.b); }
  g.setAttribute('color', new T3.Float32BufferAttribute(col, 3)); g.computeVertexNormals(); mat.vertexColors = true; const m = new T3.Mesh(g, mat); parent.add(m); return m; }
function points(parent, n, fn, color, size, add_ = true) { const pos = []; const r = rng(n * 7 + 3); for (let i = 0; i < n; i++) pos.push(...fn(r, i)); const g = new T3.BufferGeometry(); g.setAttribute('position', new T3.Float32BufferAttribute(pos, 3));
  const m = new T3.Points(g, new T3.PointsMaterial({ color, size, map: GLOW, transparent: true, depthWrite: false, blending: add_ ? T3.AdditiveBlending : T3.NormalBlending, sizeAttenuation: true })); parent.add(m); return m; }
function cam(p, l) { camera.position.set(p[0], p[1], p[2]); camera.lookAt(l[0], l[1], l[2]); }
function camL(a, b, k, la, lb) { k = ease(k); cam([lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)], [lerp(la[0], lb[0], k), lerp(la[1], lb[1], k), lerp(la[2], lb[2], k)]); }
function camLin(a, b, k, la, lb) { cam([lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)], [lerp(la[0], lb[0], k), lerp(la[1], lb[1], k), lerp(la[2], lb[2], k)]); }
function shades(p) { const h = p.userData.head; add(h, Bx(0.42, 0.1, 0.04), Bm('#0a0a0a'), 0, 0.06, 0.25); add(h, Bx(0.15, 0.12, 0.03), Bm('#2a2a3a'), -0.1, 0.04, 0.27); add(h, Bx(0.15, 0.12, 0.03), Bm('#2a2a3a'), 0.1, 0.04, 0.27); }
const G = {}, PTEX = {}, ETEX = {};
// ---------- procedural globe textures ----------
function globeTex(k) { return ctex(512, 256, (c, w, h) => { const r = rng(k.charCodeAt(0) * 13);
  if (k === 'A') { c.fillStyle = '#4a9a44'; c.fillRect(0, 0, w, h); for (let i = 0; i < 40; i++) { c.fillStyle = ['#3a8a3a', '#6ab04a', '#2a7a5a'][i % 3]; c.beginPath(); c.ellipse(r() * w, r() * h, 20 + r() * 40, 10 + r() * 20, r() * 3, 0, 7); c.fill(); }
    for (let i = 0; i < 12; i++) { c.fillStyle = '#3a8ac8'; c.beginPath(); c.ellipse(r() * w, 40 + r() * (h - 80), 18 + r() * 20, 8 + r() * 10, 0, 0, 7); c.fill(); }
    for (let i = 0; i < 90; i++) { const x = r() * w, y = 20 + r() * (h - 40); c.fillStyle = ['#e84a3a', '#f2d04a', '#e88ad8', '#ffffff'][i % 4]; c.beginPath(); c.arc(x, y, 2 + r() * 4, 0, 7); c.fill(); }
    c.fillStyle = 'rgba(255,255,255,0.7)'; c.fillRect(0, 0, w, 10); c.fillRect(0, h - 10, w, 10); }
  if (k === 'B') { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#2a6ab8'); g.addColorStop(0.5, '#1a5aa8'); g.addColorStop(1, '#2a6ab8'); c.fillStyle = g; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 300; i++) { c.fillStyle = 'rgba(120,190,240,0.35)'; c.fillRect(r() * w, r() * h, 6 + r() * 14, 1.5); }
    for (let i = 0; i < 18; i++) { const x = r() * w, y = 50 + r() * (h - 100); c.fillStyle = '#5a7a3a'; c.beginPath(); c.ellipse(x, y, 7, 5, 0, 0, 7); c.fill(); c.fillStyle = '#f2d8a0'; c.fillRect(x - 2, y - 2, 2, 2); c.fillRect(x + 1, y, 2, 2); }
    for (let i = 0; i < 26; i++) { c.fillStyle = 'rgba(255,255,255,0.75)'; c.beginPath(); c.ellipse(r() * w, r() * h, 20 + r() * 30, 4 + r() * 6, (r() - 0.5) * 0.4, 0, 7); c.fill(); } }
  if (k === 'C') { c.fillStyle = '#1a1414'; c.fillRect(0, 0, w, h); for (let i = 0; i < 60; i++) { c.fillStyle = `rgba(${40 + r() * 30},${20 + r() * 10},${20},1)`; c.beginPath(); c.ellipse(r() * w, r() * h, 10 + r() * 30, 6 + r() * 14, r() * 3, 0, 7); c.fill(); }
    c.lineCap = 'round'; for (let i = 0; i < 26; i++) { let x = r() * w, y = r() * h; c.beginPath(); c.moveTo(x, y); for (let s_ = 0; s_ < 12; s_++) { x += (r() - 0.5) * 40; y += (r() - 0.5) * 24; c.lineTo(x, y); } c.strokeStyle = '#ff6a1a'; c.lineWidth = 4 + r() * 3; c.stroke(); c.strokeStyle = '#ffd25a'; c.lineWidth = 1.5; c.stroke(); } }
  if (k === 'D') { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#dfeaf2'); g.addColorStop(0.5, '#a8bccc'); g.addColorStop(1, '#dfeaf2'); c.fillStyle = g; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 30; i++) { c.strokeStyle = 'rgba(255,255,255,0.8)'; c.lineWidth = 3 + r() * 4; c.beginPath(); const x = r() * w, y = r() * h, R_ = 10 + r() * 25; c.arc(x, y, R_, r() * 3, r() * 3 + 4); c.stroke(); }
    for (let i = 0; i < 20; i++) { c.fillStyle = '#7a90a8'; c.beginPath(); c.ellipse(r() * w, 40 + r() * (h - 80), 12 + r() * 20, 6 + r() * 10, 0, 0, 7); c.fill(); } }
}); }

// ---------- SPACE (overview grid) ----------
function buildSpace() { const g = G.S = new T3.Group(); scene.add(g);
  points(g, 1500, (r) => { const a = r() * PI * 2, b = Math.acos(r() * 2 - 1), d = 200 + r() * 100; return [d * S(b) * C(a), d * S(b) * S(a), d * C(b)]; }, '#ffffff', 2.2);
  points(g, 200, (r) => { const a = r() * PI * 2, b = Math.acos(r() * 2 - 1), d = 150; return [d * S(b) * C(a), d * S(b) * S(a), d * C(b)]; }, '#a0c8ff', 6);
  const sunL = new T3.DirectionalLight('#ffffff', 2.0); sunL.position.set(-6, 4, 8); g.add(sunL); g.add(new T3.AmbientLight('#404060', 0.7));
  glow(g, '#2a8a6a', 120, -30, 20, -120, 0.3); glow(g, '#aa4a2a', 100, 40, -30, -120, 0.3);
  const pl = []; const P0 = [[-1.75, 1.75], [1.75, 1.75], [-1.75, -2.75], [1.75, -2.75]];
  const HALO = { A: ['#9affb0', 0.3], B: ['#7ac8ff', 0.4], C: ['#ff7a2a', 0.55], D: ['#e0f4ff', 0.4] };
  for (const k of 'ABCD') { const P = new T3.Group(); g.add(P); const t = ETEX[k];
    const sp = add(P, new T3.SphereGeometry(1.25, 48, 32), new T3.MeshLambertMaterial({ map: t, emissive: '#ffffff', emissiveMap: t, emissiveIntensity: k === 'C' ? 0.75 : 0.35 })); P.userData.sph = sp;
    glow(P, HALO[k][0], 4.6, 0, 0, -0.9, HALO[k][1]);
    if (k === 'A') { const m = add(P, new T3.SphereGeometry(0.22, 12, 8), L('#c8c8c0')); m.position.set(1.6, 0.9, 0.2); P.userData.moon = m; }
    if (k === 'B') { const ring = add(P, new T3.TorusGeometry(1.75, 0.03, 6, 48), Bm('#bfe6ff', { transparent: true, opacity: 0.5 })); ring.rotation.x = 1.3; }
    if (k === 'D') { const rr_ = rng(8); for (let i = 0; i < 70; i++) { const a = rr_() * PI * 2, d = 1.45 + rr_() * 0.6, yy = (rr_() - 0.5) * 2.6; add(P, Bx(0.025, 0.12, 0.025), Bm('#e8f6ff', { transparent: true, opacity: 0.85 }), C(a) * d, yy, S(a) * d * 0.6 + 0.3); } }
    pl.push(P); }
  pl.forEach((m, i) => { m.position.set(P0[i][0], P0[i][1], 0); m.userData.home = P0[i]; });
  g.userData.pl = pl; }

// ---------- A: everything is giant ----------
function hfA(x, z) { return 1.5 * S(x * 0.03) * C(z * 0.025) + 0.8 * S((x + z) * 0.07); }
function buildA() { const g = G.A = new T3.Group(); scene.add(g); const r = rng(101);
  sky(g, [[-1, '#cfe6c8'], [0, '#f6ecc8'], [0.2, '#a8d4f0'], [1, '#5a9ae0']]);
  g.add(new T3.HemisphereLight('#fff6e0', '#4a7a3a', 1.0)); const sun = new T3.DirectionalLight('#fff4d8', 1.6); sun.position.set(80, 120, 60); g.add(sun); glow(g, '#fff8d8', 120, 160, 220, -400, 0.8);
  terrain(g, 900, 120, hfA, (x, y, z) => (((x * 3 + z * 5) | 0) % 4 === 0 ? '#5aa04a' : '#4a9040'), L('#ffffff'));
  // giant grass blades
  for (let i = 0; i < 260; i++) { const x = -160 + r() * 320, z = -200 + r() * 260; if (Math.abs(x) < 10 && z > -20) continue; const h = 10 + r() * 22; const b = add(g, new T3.ConeGeometry(1.2 + r() * 0.8, h, 3), L(['#4a8a3a', '#5aa04a', '#3a7a34'][i % 3]), x, hfA(x, z) + h / 2, z); b.scale.z = 0.25; b.rotation.set((r() - 0.5) * 0.3, r() * 3, (r() - 0.5) * 0.35); }
  // mushroom forest
  G.Amush = []; const capC = ['#d84a3a', '#c86a3a', '#d84a3a', '#3aa8a0', '#e8a83a'];
  for (let i = 0; i < 14; i++) { const x = -120 + r() * 240, z = -320 + r() * 180; const h = 50 + r() * 80, R_ = 18 + r() * 22; const m = new T3.Group(); m.position.set(x, hfA(x, z), z); g.add(m);
    add(m, new T3.CylinderGeometry(R_ * 0.18, R_ * 0.26, h, 10), L('#f0e6d4'), 0, h / 2, 0); const cap = add(m, new T3.SphereGeometry(R_, 20, 10, 0, PI * 2, 0, PI / 2), L(capC[i % 5], { flatShading: false }), 0, h - 1, 0); cap.scale.y = 0.6;
    add(m, new T3.CircleGeometry(R_, 20), L('#c8b8a0', { side: T3.DoubleSide }), 0, h - 1, 0).rotation.x = PI / 2;
    if (i % 5 !== 3) for (let s_ = 0; s_ < 10; s_++) { const a = r() * PI * 2, b = r() * 1.1; const sp = add(m, new T3.SphereGeometry(R_ * (0.07 + r() * 0.06), 8, 6), L('#fff8f0'), S(b) * C(a) * R_ * 0.98, h - 1 + C(b) * R_ * 0.6, S(b) * S(a) * R_ * 0.98); sp.scale.y = 0.5; }
    G.Amush.push(m); }
  // giant flowers near the front
  G.Aflowers = []; const pc = ['#f28ad0', '#f2d04a', '#b88af2', '#ff8a6a'];
  for (let i = 0; i < 9; i++) { const x = -60 + i * 15 + (r() - 0.5) * 6, z = -40 - r() * 60; const h = 14 + r() * 16; const f = new T3.Group(); f.position.set(x, hfA(x, z), z); g.add(f);
    add(f, new T3.CylinderGeometry(0.6, 0.8, h, 6), L('#3a8a3a'), 0, h / 2, 0); const head = new T3.Group(); head.position.set(0, h, 0); head.rotation.x = -0.3; f.add(head); const col = pc[i % 4];
    for (let p = 0; p < 7; p++) { const a = p / 7 * PI * 2; const pt = add(head, new T3.SphereGeometry(4, 10, 6), L(col), C(a) * 4.5, 1.2, S(a) * 4.5); pt.scale.set(1, 0.35, 0.55); pt.rotation.y = -a; pt.rotation.z = 0.5; }
    add(head, new T3.SphereGeometry(2.4, 12, 8), L('#f2b83a'), 0, 0.8, 0).scale.y = 0.5; const lf = add(f, new T3.SphereGeometry(5, 8, 6), L('#4a9a3a'), 3, h * 0.4, 0); lf.scale.set(1, 0.15, 0.45); lf.rotation.z = 0.4; G.Aflowers.push(f); }
  // dew drops
  G.Adew = []; for (const [x, z, R_] of [[20, 10, 7], [34, -6, 5], [8, -14, 4], [44, 14, 3]]) G.Adew.push(add(g, new T3.SphereGeometry(R_, 32, 20), Ph('#dff4ff', { transparent: true, opacity: 0.45, shininess: 300, flatShading: false, specular: '#ffffff' }), x, hfA(x, z) + R_ * 0.8, z));
  // ladybugs
  G.Alady = []; for (let i = 0; i < 2; i++) { const b = new T3.Group(); g.add(b); const sh = add(b, new T3.SphereGeometry(5, 20, 12, 0, PI * 2, 0, PI / 2), Ph('#d82a2a', { shininess: 120, flatShading: false }), 0, 2.2, 0); sh.scale.z = 1.25;
    add(b, Bx(0.3, 3.2, 12.4), Bm('#1a1a1a'), 0, 4.4, 0).scale.y = 0.6; for (const [x_, z_] of [[2, 2], [-2, 2], [2.6, -2], [-2.6, -2], [0, -4.4], [1.6, 4.6], [-1.6, 4.6]]) add(b, new T3.SphereGeometry(0.9, 10, 6), Bm('#141414'), x_ * 0.95, 2.2 + Math.sqrt(Math.max(0, 25 - x_ * x_ - (z_ / 1.25) ** 2)) * 0.98, z_);
    const hd = new T3.Group(); hd.position.set(0, 2.4, 6.2); b.add(hd); add(hd, new T3.SphereGeometry(2.4, 14, 10), L('#1a1a1a'), 0, 0, 0); for (const sx of [-1, 1]) { add(hd, new T3.SphereGeometry(0.6, 8, 6), Bm('#ffffff'), sx * 1.0, 0.6, 1.9); add(hd, new T3.SphereGeometry(0.3, 6, 4), Bm('#101010'), sx * 1.0, 0.65, 2.4); }
    b.userData.legs = []; for (let l = 0; l < 6; l++) { const lg = add(b, Bx(0.35, 0.35, 4), L('#1a1a1a'), (l % 2 ? 1 : -1) * 4.4, 1.0, -3 + Math.floor(l / 2) * 3); lg.rotation.y = (l % 2 ? 1 : -1) * 1.2; b.userData.legs.push(lg); }
    b.userData.hd = hd; G.Alady.push(b); }
  G.Aguy = person({ shirt: '#ff7a3a', trousers: '#3a4a6a', skin: '#e8b896', hair: '#3a2414' }); g.add(G.Aguy);
  G.Apollen = points(g, 400, (r) => [-120 + r() * 240, 2 + r() * 60, -200 + r() * 240], '#fff6c8', 1.2);
}
function updA(T) { G.Alady.forEach((b, i) => b.userData.legs.forEach((l, j) => l.rotation.x = S(T * 8 + j) * 0.3)); G.Apollen.position.y = S(T * 0.5) * 2; G.Aflowers.forEach((f, i) => f.rotation.z = S(T * 0.7 + i) * 0.03); }

// ---------- B: turtle towns on an endless ocean ----------
let seaG;
function buildB() { const g = G.B = new T3.Group(); scene.add(g); const r = rng(202);
  sky(g, [[-1, '#a8d4f0'], [0, '#e8f4fa'], [0.15, '#9ad0f2'], [1, '#3a88d8']]);
  g.add(new T3.HemisphereLight('#f0f8ff', '#2a5a8a', 1.0)); const sun = new T3.DirectionalLight('#fff4e0', 1.6); sun.position.set(-80, 100, 60); g.add(sun); G.Bsun = glow(g, '#fff4d0', 140, -200, 160, -420, 0.8);
  seaG = new T3.PlaneGeometry(900, 900, 90, 90); seaG.rotateX(-PI / 2); add(g, seaG, Ph('#2a7ab8', { shininess: 120, specular: '#ffffff', emissive: '#0a2a4a' }));
  for (let i = 0; i < 24; i++) { const c = add(g, new T3.SphereGeometry(20 + r() * 20, 10, 6), L('#ffffff', { emissive: '#a0b0c0', flatShading: false }), -400 + r() * 800, 120 + r() * 60, -500 + r() * 300); c.scale.y = 0.35; }
  G.Bturtles = []; const roofs = ['#d84a3a', '#3a7ad8', '#f2b83a', '#4aa86a', '#e87a3a'];
  for (let t = 0; t < 3; t++) { const T_ = new T3.Group(); g.add(T_); const s = t === 0 ? 1 : 0.8;
    const sh = add(T_, new T3.SphereGeometry(40 * s, 28, 14, 0, PI * 2, 0, PI / 2), L('#5a7a3a', { flatShading: true }), 0, -2, 0); sh.scale.set(1, 0.42, 1.25);
    for (let p = 0; p < 12; p++) { const a = p / 12 * PI * 2; const pt = add(T_, new T3.CylinderGeometry(7 * s, 8 * s, 1, 6), L('#4a6a2e'), C(a) * 24 * s, 9 * s, S(a) * 30 * s); pt.rotation.set(S(a) * 0.35, 0, -C(a) * 0.35); }
    const hd = add(T_, new T3.SphereGeometry(10 * s, 14, 10), L('#7a9a5a'), 0, 3, 54 * s); hd.scale.set(1, 0.8, 1.2); for (const sx of [-1, 1]) add(T_, new T3.SphereGeometry(1.6 * s, 8, 6), Bm('#141414'), sx * 6 * s, 6, 63 * s);
    T_.userData.fl = []; for (const [x_, z_] of [[-38, 28], [38, 28], [-34, -30], [34, -30]]) { const f = add(T_, Bx(26 * s, 2, 10 * s), L('#6a8a4a'), x_ * s, 0, z_ * s); T_.userData.fl.push(f); }
    // town on the shell
    for (let h_ = 0; h_ < (t === 0 ? 16 : 9); h_++) { const a = r() * PI * 2, d = r() * 26 * s; const x = C(a) * d, z = S(a) * d * 1.2; const y = 15 * s * Math.sqrt(Math.max(0, 1 - (d / (40 * s)) ** 2)) + 2; const hw = 4 + r() * 3;
      add(T_, Bx(hw, 4, hw), L(['#f2ead8', '#e8d8c0', '#f8f0e8'][h_ % 3]), x, y + 2, z); const rf = add(T_, new T3.ConeGeometry(hw * 0.8, 3, 4), L(roofs[h_ % 5]), x, y + 5.5, z); rf.rotation.y = PI / 4; }
    // lighthouse
    const lh = new T3.Group(); lh.position.set(-14 * s, 14 * s, -20 * s); T_.add(lh); for (let k = 0; k < 5; k++) add(lh, new T3.CylinderGeometry(2.4 - k * 0.3, 2.6 - k * 0.3, 4, 10), L(k % 2 ? '#d82a2a' : '#f8f4ec'), 0, 2 + k * 4, 0); add(lh, new T3.CylinderGeometry(1.6, 1.6, 2.4, 8), Bm('#fff4c8'), 0, 21, 0); add(lh, new T3.ConeGeometry(2.2, 2.4, 8), L('#2a2a2a'), 0, 23.4, 0);
    const beam = add(lh, new T3.ConeGeometry(6, 60, 12, 1, true), new T3.MeshBasicMaterial({ color: '#fff6c8', transparent: true, opacity: 0.18, depthWrite: false, side: T3.DoubleSide })); beam.position.y = 21; beam.rotation.z = PI / 2; beam.geometry.translate(0, -30, 0); T_.userData.beam = beam; glow(lh, '#fff4c8', 18, 0, 21, 0, 0.8);
    T_.userData.home = [[0, 0, 0], [130, 0, -60], [-140, 0, -90]][t]; T_.userData.s = s; G.Bturtles.push(T_); }
  // rope bridge between turtle 0 and 1
  G.Bbridge = new T3.Group(); g.add(G.Bbridge); for (let i = 0; i < 40; i++) { const k = i / 39; add(G.Bbridge, Bx(2.4, 0.3, 4), L('#8a6a3a'), lerp(30, 104, k), 16 - S(k * PI) * 6 + lerp(0, -2, k), lerp(4, -48, k)).rotation.y = -0.6; }
  G.Bguy = person({ shirt: '#f2b83a', trousers: '#2a4a6a', skin: '#e8b896', hair: '#2a1a14' }); g.add(G.Bguy);
  G.Bgulls = []; for (let i = 0; i < 8; i++) { const gl = new T3.Group(); g.add(gl); for (const sx of [-1, 1]) { const w_ = add(gl, Bx(3, 0.2, 1), Bm('#ffffff'), sx * 1.5, 0, 0); w_.rotation.z = sx * 0.3; } gl.userData.o = r(); G.Bgulls.push(gl); }
}
function updB(T, timelapse = 0) { const p = seaG.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i); p.setY(i, 1.2 * S(x * 0.04 + T * 1.2) + 0.8 * C(z * 0.05 + T * 0.9)); } p.needsUpdate = true; seaG.computeVertexNormals();
  G.Bturtles.forEach((t_, i) => { const [hx, hy, hz] = t_.userData.home; const drift = timelapse * 60; t_.position.set(hx + (i === 0 ? drift : 0), -1 + S(T * 0.6 + i) * 0.8, hz - (i === 0 ? drift * 0.4 : 0)); t_.rotation.y = 0.4 + i * 0.6 + S(T * 0.2 + i) * 0.03; t_.rotation.z = S(T * 0.7 + i) * 0.015;
    t_.userData.fl.forEach((f, j) => f.rotation.y = S(T * 1.5 + j) * 0.4); t_.userData.beam.rotation.y = T * 1.5; });
  G.Bgulls.forEach((gl, i) => { const a = T * 0.3 + gl.userData.o * 10; gl.position.set(C(a) * 60, 60 + S(a * 2) * 6, -40 + S(a) * 50); gl.rotation.y = -a; gl.children.forEach((w_, j) => w_.rotation.z = (j ? 1 : -1) * (0.3 + S(T * 6 + i) * 0.4)); }); }

// ---------- C: lava rivers + black glass mansions ----------
function buildC() { const g = G.C = new T3.Group(); scene.add(g); const r = rng(303);
  sky(g, [[-1, '#2a0a06'], [0, '#ff6a2a'], [0.1, '#c8401a'], [0.35, '#5a1a10'], [1, '#1a0806']]);
  g.add(new T3.HemisphereLight('#ffa060', '#2a0a06', 0.9)); const dl = new T3.DirectionalLight('#ff8a4a', 0.9); dl.position.set(40, 60, -80); g.add(dl);
  add(g, new T3.PlaneGeometry(900, 900), L('#221a1c'), 0, 0, 0).rotation.x = -PI / 2;
  const lt = ctex(32, 128, (c, w, h) => { for (let y = 0; y < h; y += 4) { c.fillStyle = ['#ff5a1a', '#ff8a2a', '#ffd25a', '#ff6a1a'][(y / 4) % 4]; c.fillRect(0, y, w, 4); } for (let i = 0; i < 40; i++) { c.fillStyle = 'rgba(60,10,0,0.6)'; c.fillRect((i * 13) % w, (i * 29) % h, 6, 3); } }); lt.repeat.set(1, 8); G.Clava = lt;
  for (const [x0, ph] of [[-30, 0], [40, 2], [-110, 4]]) { const pts = []; for (let i = 0; i <= 60; i++) { const z = 60 - i * 9; pts.push(new T3.Vector3(x0 + S(i * 0.25 + ph) * 18, 0.15, z)); } const curve = new T3.CatmullRomCurve3(pts); const geo = new T3.TubeGeometry(curve, 120, 4, 6, false); geo.scale(1, 0.08, 1); add(g, geo, new T3.MeshBasicMaterial({ map: lt }), 0, 0.2, 0); for (let i = 0; i < 6; i++) { const p_ = curve.getPoint(i / 6); glow(g, '#ff7a2a', 50, p_.x, 4, p_.z, 0.35); } }
  const gm = Ph('#141218', { shininess: 220, specular: '#ff9a5a' });
  for (let i = 0; i < 40; i++) { const x = -260 + r() * 520, z = -420 + r() * 220; const h = 30 + r() * 110; const k = i % 3; const m = add(g, k === 0 ? Bx(10 + r() * 8, h, 10 + r() * 8) : k === 1 ? new T3.ConeGeometry(8 + r() * 6, h, 4) : new T3.OctahedronGeometry(h * 0.35, 0), gm, x, k === 2 ? h * 0.35 : h / 2, z); if (k === 2) m.scale.y = 1.6; m.rotation.y = r() * 3;
    for (let w_ = 0; w_ < 4; w_++) add(g, Bx(k === 0 ? 10 : 4, 0.6, 0.3), Bm('#ff8a3a'), x, 10 + w_ * h / 5, z + 6); }
  // mansions with pools
  G.Cpools = []; for (let i = 0; i < 4; i++) { const x = -20 + i * 26, z = -30 - (i % 2) * 18; const m = new T3.Group(); m.position.set(x, 0, z); g.add(m);
    add(m, Bx(14, 5, 9), gm, 0, 2.5, 0); add(m, Bx(10, 4, 7), gm, 2, 7, -1); add(m, Bx(14.4, 0.4, 9.4), L('#3a2a2a'), 0, 5.2, 0); add(m, Bx(13, 3.6, 0.2), Bm('#ffb070'), 0, 2.4, 4.6); add(m, Bx(8, 3, 0.2), Bm('#ffb070'), 2, 7, 2.6);
    add(m, Bx(12, 0.4, 7), L('#3a3438'), 0, 0.2, 9); const pool = add(m, Bx(10, 0.3, 5.4), Ph('#3ac8e8', { emissive: '#0a4a5a', shininess: 200 }), 0, 0.42, 9); G.Cpools.push(pool);
    for (let p = 0; p < 2; p++) { add(m, new T3.CylinderGeometry(0.3, 0.4, 7, 5), L('#2a1a14'), -8 + p * 16, 3.5, 8); for (let l = 0; l < 5; l++) { const lf = add(m, new T3.ConeGeometry(0.6, 4, 3), L('#3a2a1a'), -8 + p * 16 + C(l) * 1.6, 7, 8 + S(l) * 1.6); lf.rotation.set(S(l) * 1.3, 0, -C(l) * 1.3); } } }
  // thermometer sign
  G.Ctherm = new T3.Group(); G.Ctherm.position.set(12, 0, -14); g.add(G.Ctherm); add(G.Ctherm, Bx(0.6, 12, 0.6), L('#3a3438'), 0, 6, 0); add(G.Ctherm, new T3.CylinderGeometry(1, 1, 9, 12), L('#f2ece4'), 0, 13, 0.6); add(G.Ctherm, new T3.SphereGeometry(1.7, 14, 10), Bm('#e82a1a'), 0, 8.4, 0.6); G.CthermFill = add(G.Ctherm, new T3.CylinderGeometry(0.6, 0.6, 1, 10), Bm('#e82a1a'), 0, 9, 1.0);
  G.Cguy = person({ shirt: '#f2f2ea', trousers: '#e8a83a', skin: '#e8a886', hair: '#3a2414' }); g.add(G.Cguy);
  G.Cice = new T3.Group(); g.add(G.Cice); add(G.Cice, new T3.ConeGeometry(0.16, 0.5, 8), L('#d8a058'), 0, -0.25, 0).rotation.x = PI; G.Cscoop = add(G.Cice, new T3.SphereGeometry(0.2, 12, 8), L('#f8c8d8', { flatShading: false }), 0, 0.05, 0);
  G.Csteam = []; for (let i = 0; i < 30; i++) { const s_ = add(g, new T3.SphereGeometry(0.6, 8, 6), new T3.MeshLambertMaterial({ color: '#ffffff', transparent: true, opacity: 0.4, depthWrite: false })); s_.userData.o = r(); G.Csteam.push(s_); }
  G.Cembers = points(g, 500, (r) => [-150 + r() * 300, r() * 60, -200 + r() * 240], '#ffb060', 0.8);
}
function updC(T) { G.Clava.offset.y = -T * 0.3; G.Cembers.position.y = (T * 3) % 20; G.Cpools.forEach((p, i) => p.position.y = 0.42 + S(T * 9 + i) * 0.04);
  const pc = G.Cpools[1].getWorldPosition(new T3.Vector3()); G.Csteam.forEach((s_, i) => { const a = (T * 0.5 + s_.userData.o) % 1; s_.position.set(pc.x + S(i * 2.1) * 4, pc.y + a * 8, pc.z + C(i * 1.7) * 2); s_.scale.setScalar(0.6 + a * 2); s_.material.opacity = 0.45 * (1 - a); }); }

// ---------- D: time is frozen ----------
let rainIM;
function buildD() { const g = G.D = new T3.Group(); scene.add(g); const r = rng(404);
  sky(g, [[-1, '#8a98a8'], [0, '#c8d4de'], [0.2, '#9aa8ba'], [1, '#4a5868']]);
  g.add(new T3.HemisphereLight('#e0ecf8', '#5a6a5a', 1.0)); const dl = new T3.DirectionalLight('#dfe8f2', 0.7); dl.position.set(-40, 80, 60); g.add(dl);
  terrain(g, 900, 100, (x, z) => (z > 40 ? -4 : 0) + 0.8 * S(x * 0.05) * C(z * 0.04), (x, y, z) => y < -2 ? '#c8bc98' : '#6a8a5a', L('#ffffff'));
  add(g, new T3.PlaneGeometry(900, 500), Ph('#4a7a9a', { shininess: 160 }), 0, -1.5, 300).rotation.x = -PI / 2;
  for (let i = 0; i < 30; i++) { const c = add(g, new T3.SphereGeometry(30 + r() * 30, 10, 6), L('#7a8698', { flatShading: false }), -400 + r() * 800, 140 + r() * 40, -400 + r() * 500); c.scale.y = 0.3; }
  // frozen lightning bolt
  { const pts = [[0, 140], [-8, 110], [6, 95], [-6, 70], [8, 50], [0, 20]]; for (let i = 0; i < pts.length - 1; i++) { const [x1, y1] = pts[i], [x2, y2] = pts[i + 1]; const len = Math.hypot(x2 - x1, y2 - y1); const seg = add(g, Bx(1.2, len, 1.2), Bm('#ffffff'), 60 + (x1 + x2) / 2, (y1 + y2) / 2, -160); seg.rotation.z = Math.atan2(x2 - x1, y2 - y1) * -1; } glow(g, '#e8f4ff', 120, 60, 80, -158, 0.5); }
  // frozen rain
  rainIM = new T3.InstancedMesh(Bx(0.06, 0.9, 0.06), new T3.MeshBasicMaterial({ color: '#e8f4ff', transparent: true, opacity: 0.75 }), 5000); g.add(rainIM); const M_ = new T3.Matrix4();
  for (let i = 0; i < 5000; i++) { const x = -60 + r() * 120, y = 0.5 + r() * 40, z = -60 + r() * 100; M_.makeTranslation(x, y, z); rainIM.setMatrixAt(i, M_); }
  // stepping-stone drops (bigger, for walking on the rain)
  G.Dsteps = []; for (let i = 0; i < 14; i++) G.Dsteps.push(add(g, new T3.SphereGeometry(0.45, 16, 10), Ph('#dff2ff', { transparent: true, opacity: 0.7, shininess: 300, flatShading: false }), -6 + i * 0.9, 0.4 + i * 0.6, 8 - i * 0.4));
  // frozen birds
  for (let i = 0; i < 12; i++) { const b = new T3.Group(); b.position.set(-30 + (i % 4) * 7 + r() * 3, 26 + Math.floor(i / 4) * 4 + r() * 2, -20 - r() * 10); g.add(b); for (const sx of [-1, 1]) { const w_ = add(b, Bx(2.4, 0.15, 0.8), L('#2a2a30'), sx * 1.2, 0.3, 0); w_.rotation.z = sx * (0.5 + r() * 0.3); } add(b, Bx(0.5, 0.4, 1.2), L('#2a2a30')); }
  // frozen wave
  { const wv = new T3.Group(); wv.position.set(-20, 0, 70); g.add(wv); const w1 = add(wv, new T3.TorusGeometry(10, 4, 10, 24, PI * 1.25), Ph('#3a8ab0', { transparent: true, opacity: 0.85, shininess: 200, flatShading: false }), 0, 4, 0); w1.scale.set(4, 1, 1); w1.rotation.set(0, PI / 2, 0.2);
    for (let i = 0; i < 40; i++) { const a = r() * PI * 1.2; add(wv, new T3.SphereGeometry(0.8 + r() * 1.4, 8, 6), L('#f4faff'), (r() - 0.5) * 70, 4 + S(a) * 13 + r() * 2, C(a) * 13); }
    for (let i = 0; i < 80; i++) add(wv, new T3.SphereGeometry(0.2 + r() * 0.3, 6, 4), L('#e8f6ff'), (r() - 0.5) * 70, 12 + r() * 14, -6 + r() * 10); G.Dwave = wv; }
  // frozen people
  G.Dfrozen = []; const fz = [[{ shirt: '#8a8e96', trousers: '#5a5e66' }, [-4, 0, -2], 0.3, 'jump'], [{ shirt: '#9a9a9e', trousers: '#6a6a70' }, [5, 0, -5], -0.6, 'walk'], [{ shirt: '#8a9096', trousers: '#4a5058' }, [-9, 0, -9], 0.9, 'umbrella']];
  fz.forEach(([o, p, ry, kind]) => { const q = person({ ...o, skin: '#b8bcc4', hair: '#6a6e76' }); q.position.set(p[0], kind === 'jump' ? 0.9 : 0, p[2]); q.rotation.y = ry; g.add(q); const u = q.userData;
    if (kind === 'jump') { u.armL.rotation.z = -2.6; u.armR.rotation.z = 2.6; u.legL.rotation.x = -0.6; u.legR.rotation.x = 0.4; }
    if (kind === 'walk') { u.legL.rotation.x = 0.5; u.legR.rotation.x = -0.5; u.armL.rotation.x = -0.4; u.armR.rotation.x = 0.4; }
    if (kind === 'umbrella') { u.armR.rotation.x = -1.6; const um = add(q, new T3.ConeGeometry(1.2, 0.5, 8), L('#6a6e7a'), 0.35, 2.6, 0.5); add(q, Bx(0.05, 1.2, 0.05), L('#3a3a3a'), 0.35, 2.0, 0.5); }
    G.Dfrozen.push(q); });
  G.Dguy = person({ shirt: '#e84a6a', trousers: '#2a3a5a', skin: '#e8b896', hair: '#2a1a14' }); g.add(G.Dguy);
}

// ---------- SHOTS ----------
const S0 = CL[6].start, S1 = CL[7].start, S2 = CL[8].start, S3 = CL[9].start, END = CL[10].start;
function spaceShot(lt, T, mode, focus = -1, k = 0) { const pl = G.S.userData.pl;
  pl.forEach((m, i) => { m.visible = focus < 0 || focus === i; m.position.set(m.userData.home[0] + 0.05 * C(T * 0.55 + i * 1.3), m.userData.home[1] + 0.07 * S(T * 0.8 + i * 1.7), 0); m.scale.setScalar(1);
    m.userData.sph.rotation.set(0.22 + 0.03 * S(T * 0.4 + i), T * (i === 3 ? 0.08 : 0.35) + i * 1.7, 0.06 * S(T * 0.3 + i)); if (m.userData.moon) m.userData.moon.position.set(C(T * 0.6) * 1.7, 0.5 + S(T * 0.6) * 0.3, S(T * 0.6) * 1.7); });
  if (mode === 'hook') { pl.forEach((m, i) => m.scale.setScalar(Math.max(0.001, ease(prog(T, 0.8 + i * 0.25, 1.2 + i * 0.25))))); camL([0, -0.5, 13.5], [0, -0.5, 11.5], prog(T, 0, CL[1].start), [0, -0.5, 0], [0, -0.5, 0]); }
  else if (mode === 'count') { cam([S(T * 0.6) * 0.6, -0.5 + C(T * 0.5) * 0.3, 11.5 - (T - CL[1].start) * 0.2], [0, -0.5, 0]); }
  else if (mode === 'approach') { const m = pl[focus]; m.position.set(0, 0.05 * S(T * 0.8), 0); m.userData.sph.rotation.y = T * 0.5; cam([0.3 * (1 - k), 0, lerp(8.0, 4.1, ease(k) * 0.6 + k * 0.4)], [0, 0, 0]); }
  else { camL([0, -0.5, 13.5], [0, -0.5, 11.5], prog(lt, 0, 2), [0, -0.5, 0], [0, -0.5, 0]); } }
function pose0(p) { const u = p.userData; u.body.position.y = 0; u.body.rotation.set(0, 0, 0); u.head.rotation.set(0, 0, 0); for (const k of ['armL', 'armR', 'legL', 'legR']) u[k].rotation.set(0, 0, 0); }
const SH = [
  [0, 'S', '', (k, lt, T) => spaceShot(lt, T, 'hook')],
  [CL[1].start, 'S', '', (k, lt, T) => spaceShot(lt, T, 'count')],
  // ---- A giant
  [S0, 'SA', '', (k, lt, T) => spaceShot(lt, T, 'approach', 0, k)],
  [AT(6, 'everything'), 'A', 'YOU ARE HERE', (k, lt, T) => { const u = G.Aguy; u.position.set(0, hfA(0, 20), 20); u.rotation.y = PI; idle(u, T); camL([2.5, 1.3, 25], [3, 2.5, 30], k, [0, 1.4, 20], [0, 9, 0]); }],
  [AT(6, 'mushrooms'), 'A', 'MUSHROOM FOREST', (k, lt, T) => { const u = G.Aguy; u.position.set(0, hfA(0, -160), -160); u.rotation.y = PI; run(u, T * 6, 0.4); camL([6, 2, -140], [4, 2.5, -150], k, [0, 30, -260], [0, 70, -260]); }],
  [AT(6, 'flowers'), 'A', 'FLOWER BED', (k, lt, T) => { const f = G.Aflowers[4]; const hp = f.children[1].getWorldPosition(new T3.Vector3()); const u = G.Aguy; u.position.set(hp.x + 0.9, hp.y + 2.6, hp.z); u.rotation.set(0, 0, PI / 2); u.userData.legL.rotation.x = 0; u.userData.armL.rotation.z = -2.6; u.userData.armR.rotation.z = 2.6; camL([hp.x + 10, hp.y + 13, hp.z + 12], [hp.x + 7, hp.y + 10, hp.z + 9], k, [hp.x, hp.y + 2, hp.z], [hp.x, hp.y + 2.4, hp.z]); }],
  [AT(6, 'dew'), 'A', 'DEW DROP POOL', (k, lt, T) => { const u = G.Aguy; const d = G.Adew[0].position; u.position.set(d.x - 2, hfA(d.x - 2, d.z + 8.5), d.z + 8.5); u.rotation.y = PI; idle(u, T); u.userData.armR.rotation.z = 2.4 + S(T * 6) * 0.3; camL([d.x + 6, 3, d.z + 20], [d.x + 3, 3.5, d.z + 16], k, [d.x, 5, d.z], [d.x, 6, d.z]); }],
  [AT(6, 'and'), 'A', 'LOCAL WILDLIFE', (k, lt, T) => { const b = G.Alady[0]; b.position.set(lerp(-30, -6, k), hfA(-10, 10), lerp(-14, 6, k)); b.rotation.y = 1.2; const u = G.Aguy; u.position.set(4, hfA(4, 14), 14); u.rotation.y = -1.2; idle(u, T); camL([18, 4, 32], [14, 5, 28], k, [-8, 4, 2], [-2, 4, 6]); }],
  [AT(6, "they're"), 'A', 'LOCAL WILDLIFE', (k, lt, T) => { const b = G.Alady[0]; b.position.set(-6, hfA(-6, 6), 6); b.rotation.y = 1.2; b.userData.hd.rotation.y = T > AT(6, 'probably') ? -0.5 + S(T * 20) * 0.1 : S(T * 2) * 0.2; const u = G.Aguy; u.position.set(4, hfA(4, 14), 14); u.rotation.y = -1.2; idle(u, T); if (T < AT(6, 'probably')) u.userData.armR.rotation.x = -1.6;
    camL([8, 3, 22], [6, 3.2, 19], k, [-1, 3, 9], [-2, 3.5, 8]); }],
  // ---- B turtles
  [S1, 'SB', '', (k, lt, T) => spaceShot(lt, T, 'approach', 1, k)],
  [AT(7, "there's"), 'B', 'NO LAND . ANYWHERE', (k, lt, T) => { G.Bturtles.forEach(t_ => t_.visible = false); camL([0, 8, 300], [0, 10, 260], k, [0, 6, 0], [0, 8, 0]); }],
  [AT(7, 'so'), 'B', 'TURTLE TOWN', (k, lt, T) => { G.Bturtles.forEach((t_, i) => { t_.visible = i === 0; t_.position.y = lerp(-30, -1, ease(prog(T, AT(7, 'so'), AT(7, 'turtles') + 0.5))); }); camL([0, 12, 140], [20, 16, 110], k, [0, 8, 0], [0, 12, 0]); }],
  [AT(7, 'whole'), 'B', 'TURTLE TOWN', (k, lt, T) => camL([-40, 60, 60], [20, 50, 40], k, [0, 12, 0], [0, 14, 0])],
  [AT(7, 'lighthouses'), 'B', 'THE LIGHTHOUSE', (k, lt, T) => { const lh = G.Bturtles[0]; camL([0, 30, -10], [-6, 34, -6], k, [-14, 36, -20], [-14, 40, -20]); }],
  [AT(7, 'bridges'), 'B', 'SHELL BRIDGE', (k, lt, T) => { const u = G.Bguy; const kk = prog(T, AT(7, 'bridges'), AT(7, 'every')); u.position.set(lerp(36, 90, kk), 16 - S(lerp(0.08, 0.8, kk) * PI) * 6 + 0.4, lerp(0, -38, kk)); u.rotation.y = 2.2; run(u, T * 6, 0.5); camL([70, 30, 30], [80, 32, 20], k, [u.position.x, 14, u.position.z], [u.position.x, 14, u.position.z]); }],
  [AT(7, 'every'), 'B', 'SWIMMING SOMEWHERE NEW', (k, lt, T) => { cam([-120, 40, 160], [0, 6, -20]); }],
  [AT(7, 'hope'), 'B', 'SEASICK . 100%', (k, lt, T) => { const u = G.Bguy; u.position.set(26, 12.5, 20); u.rotation.y = 0.6; idle(u, T); u.userData.body.rotation.x = 0.5; u.userData.head.children[1].material.color.set('#8ac87a'); cam([38 + S(T * 1.6) * 1.2, 15 + S(T * 1.1) * 0.8, 34], [26, 13, 20]); }],
  // ---- C lava
  [S2, 'SC', '', (k, lt, T) => spaceShot(lt, T, 'approach', 2, k)],
  [AT(8, 'rivers'), 'C', 'LAVA RIVERS', (k, lt, T) => camLin([-30 + S(0) * 18, 8, 60], [-30 + S(3) * 18, 8, -40], k, [-30 + S(1) * 18, 0, 0], [-30 + S(5) * 18, 0, -120])],
  [AT(8, 'cities'), 'C', 'BLACK GLASS CITY', (k, lt, T) => camL([0, 20, -120], [30, 30, -150], k, [0, 50, -300], [10, 60, -320])],
  [AT(8, 'every'), 'C', 'YOUR FREE MANSION', (k, lt, T) => camL([46, 10, 10], [40, 8, 4], k, [32, 4, -24], [32, 3, -22])],
  [AT(8, 'the'), 'C', 'THE CATCH', (k, lt, T) => { const f = ease(prog(T, AT(8, "it's") - 0.2, AT(8, 'degrees') + 0.3)); G.CthermFill.scale.y = lerp(1, 8, f); G.CthermFill.position.y = 9 + (lerp(1, 8, f) - 1) / 2; camL([26, 9, 8], [23, 10, 4], k, [12, 12, -14], [12, 12.5, -14]); }],
  [AT(8, 'your'), 'C', 'ICE CREAM', (k, lt, T) => { const u = G.Cguy; u.position.set(0, 0, 0); u.rotation.y = 0; idle(u, T); u.userData.armR.rotation.x = -0.9; u.updateMatrixWorld(true); const hp = u.userData.armR.localToWorld(new T3.Vector3(0, -0.7, 0.1)); G.Cice.visible = true; G.Cice.position.copy(hp).add(new T3.Vector3(0, 0.3, 0.05));
    const m_ = prog(T, AT(8, 'melts'), AT(8, 'seconds') + 0.4); G.Cscoop.scale.set(1 + m_ * 0.6, Math.max(0.05, 1 - m_), 1 + m_ * 0.6); G.Cscoop.position.y = 0.05 - m_ * 0.12; camL([1.6, 1.7, 3.8], [1.2, 1.65, 3.2], k, [0.3, 1.3, 0], [0.3, 1.3, 0]); }],
  [AT(8, 'and'), 'C', 'THE HOT TUB', (k, lt, T) => { const p_ = G.Cpools[1].getWorldPosition(new T3.Vector3()); const u = G.Cguy; u.position.set(p_.x, p_.y - 1.0, p_.z); u.rotation.y = 0.4; pose0(u); u.userData.armL.rotation.z = -1.4; u.userData.armR.rotation.z = 1.4; u.userData.head.children[1].material.color.set('#f08a6a');
    camL([p_.x + 6, p_.y + 3, p_.z + 7], [p_.x + 4, p_.y + 2.5, p_.z + 5], k, [p_.x, p_.y + 0.8, p_.z], [p_.x, p_.y + 0.9, p_.z]); }],
  // ---- D frozen
  [S3, 'SD', '', (k, lt, T) => spaceShot(lt, T, 'approach', 3, k)],
  [AT(9, 'time'), 'D', 'FROZEN STORM', (k, lt, T) => camL([0, 6, 60], [0, 8, 50], k, [40, 50, -150], [40, 60, -150])],
  [AT(9, 'raindrops'), 'D', 'HANGING RAIN', (k, lt, T) => camLin([-10, 3, 30], [6, 4, 14], k, [0, 3, 0], [10, 4, -10])],
  [AT(9, 'birds'), 'D', 'STUCK MID FLIGHT', (k, lt, T) => camL([-10, 22, 2], [-6, 26, -2], k, [-18, 30, -22], [-14, 31, -24])],
  [AT(9, 'a'), 'D', 'FROZEN WAVE', (k, lt, T) => camL([30, 6, 40], [20, 8, 44], k, [-20, 12, 70], [-24, 14, 72])],
  [AT(9, "you're"), 'D', 'ONLY YOU MOVE', (k, lt, T) => { const u = G.Dguy; u.position.set(lerp(-2, 4, k), 0, lerp(8, 0, k)); u.rotation.y = 2.6; run(u, T * 6, 0.5); camL([8, 3, 12], [9, 3.2, 8], k, [0, 1.2, 0], [2, 1.2, -2]); }],
  [AT(9, 'no'), 'D', 'NO REPLY', (k, lt, T) => { const u = G.Dguy; u.position.set(3, 0, -3.4); u.rotation.y = -2.3; idle(u, T); u.userData.armR.rotation.z = 2.5 + S(T * 8) * 0.3; camL([7, 2, 0], [6.5, 1.9, -0.6], k, [4.2, 1.5, -4.4], [4.4, 1.5, -4.4]); }],
  [AT(9, 'but'), 'D', 'WALK ON THE RAIN', (k, lt, T) => { const u = G.Dguy; const st = Math.min(13, Math.floor(prog(T, AT(9, 'but'), END) * 14)); const s0 = G.Dsteps[st].position; u.position.set(s0.x, s0.y + 0.4, s0.z); u.rotation.y = 1.9; run(u, T * 5, 0.5); camL([s0.x + 5, s0.y + 1, s0.z + 6], [s0.x + 4, s0.y + 2, s0.z + 5], k, [s0.x, s0.y + 1, s0.z], [s0.x, s0.y + 1.5, s0.z]); }],
  [END, 'S', '', (k, lt, T) => spaceShot(lt, T, 'end')],
];
function shotAt(T) { let i = 0; for (let k = 0; k < SH.length; k++) if (T >= SH[k][0]) i = k; return i; }

// ---------- HUD ----------
function bigText(ctx, s, y, size, col = '#ffd23a', a = 1, font = 'Russo', x = 360) { if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.font = `${size}px ${font}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round'; ctx.lineWidth = size * 0.2; ctx.strokeStyle = '#05081a'; ctx.strokeText(s, x, y); ctx.fillStyle = col; ctx.fillText(s, x, y); ctx.restore(); }
const PL = { A: { n: 'PLANET A', c: '#9affb0', s: 'YOUR SIZE . ANT' }, B: { n: 'PLANET B', c: '#7ac8ff', s: 'LAND . 0%' }, C: { n: 'PLANET C', c: '#ff9a4a', s: 'TEMP 60°C . EVERY DAY' }, D: { n: 'PLANET D', c: '#dff2ff', s: 'TIME . STOPPED' } };
function header(ctx, p, T, t0) { const P = PL[p]; const k = ease(prog(T, t0, t0 + 0.35)); ctx.save(); ctx.translate(lerp(-680, 0, k), 0);
  ctx.fillStyle = 'rgba(6,8,20,0.72)'; ctx.beginPath(); ctx.roundRect(24, 50, 560, 120, 22); ctx.fill(); ctx.strokeStyle = P.c; ctx.lineWidth = 4; ctx.stroke();
  ctx.fillStyle = P.c; ctx.beginPath(); ctx.arc(94, 110, 44, 0, 7); ctx.fill(); ctx.font = '58px Russo'; ctx.fillStyle = '#05081a'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(p, 94, 113);
  ctx.textAlign = 'left'; ctx.font = '46px Russo'; ctx.fillStyle = '#fff'; ctx.fillText(P.n, 156, 96); ctx.font = '16px PressStart'; ctx.fillStyle = P.c; ctx.fillText(P.s, 158, 142);
  const n = 'ABCD'.indexOf(p) + 1; ctx.fillStyle = 'rgba(6,8,20,0.72)'; ctx.beginPath(); ctx.roundRect(600, 50, 96, 120, 22); ctx.fill(); ctx.strokeStyle = P.c; ctx.stroke(); ctx.textAlign = 'center'; ctx.font = '40px Russo'; ctx.fillStyle = '#fff'; ctx.fillText(`${n}/4`, 648, 104); ctx.font = '12px PressStart'; ctx.fillStyle = P.c; ctx.fillText('PLANET', 648, 146);
  ctx.restore(); }
function locLabel(ctx, s, T, t0, col) { if (!s) return; const k = ease(prog(T, t0 + 0.05, t0 + 0.35)); ctx.save(); ctx.globalAlpha = k; ctx.font = '30px Russo'; const w = ctx.measureText(s).width + 70; const x = 30, y = 930;
  ctx.fillStyle = 'rgba(6,8,20,0.75)'; ctx.beginPath(); ctx.roundRect(x, y, w, 56, 28); ctx.fill(); ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x + 30, y + 22, 11, PI, 0); ctx.lineTo(x + 30, y + 42); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#05081a'; ctx.beginPath(); ctx.arc(x + 30, y + 22, 4.5, 0, 7); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.textBaseline = 'middle'; ctx.fillText(s, x + 52, y + 29); ctx.restore(); }
function pill(ctx, s, y, col, a, tc = '#05081a') { if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.font = '30px Russo'; const w = ctx.measureText(s).width + 60; ctx.fillStyle = col; ctx.beginPath(); ctx.roundRect(360 - w / 2, y - 32, w, 64, 32); ctx.fill(); ctx.fillStyle = tc; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(s, 360, y + 1); ctx.restore(); }
function likePill(ctx, T) { const l0 = AT(0, 'like'), l1 = CL[1].start; if (T < l0 - 0.15 || T > l1 + 0.2) return; const k = ease(prog(T, l0 - 0.15, l0 + 0.15)) * (1 - ease(prog(T, l1 - 0.1, l1 + 0.2))); ctx.save(); ctx.globalAlpha = k; ctx.translate(0, (1 - k) * 30);
  ctx.fillStyle = 'rgba(6,8,20,0.88)'; ctx.beginPath(); ctx.roundRect(170, 960, 380, 70, 35); ctx.fill(); ctx.strokeStyle = '#ffd23a'; ctx.lineWidth = 3; ctx.stroke();
  const hb = 1 + 0.25 * Math.max(0, S((T - l0) * 9)) * (T < l0 + 0.7 ? 1 : 0); ctx.save(); ctx.translate(216, 995); ctx.scale(hb, hb); ctx.fillStyle = '#ff5a6a'; ctx.beginPath(); ctx.moveTo(0, 12); ctx.bezierCurveTo(-26, -6, -12, -26, 0, -12); ctx.bezierCurveTo(12, -26, 26, -6, 0, 12); ctx.fill(); ctx.restore();
  ctx.font = '24px Russo'; ctx.fillStyle = '#fff'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText('LIKE', 244, 996); const fo = T > AT(0, 'follow'); ctx.fillStyle = fo ? '#7dffb0' : '#ffd23a'; ctx.beginPath(); ctx.roundRect(340, 973, 190, 44, 22); ctx.fill(); ctx.fillStyle = '#06102a'; ctx.textAlign = 'center'; ctx.font = '20px Russo'; ctx.fillText(fo && T > AT(0, 'follow') + 0.3 ? 'FOLLOWING' : '+ FOLLOW', 435, 996); ctx.restore(); }
const REHOOK = [[AT(6, 'but'), S1, 'NEXT . PLANET B', '#7ac8ff'], [AT(7, 'planet', 1), S2, 'NEXT . PLANET C', '#ff9a4a'], [AT(8, 'planet', 1), S3, 'NEXT . PLANET D', '#dff2ff']];
const CAPS = [];
CL.forEach((c0, ci) => { if (ci >= 1 && ci <= 5) return; let cur = []; const flush = () => { if (cur.length) CAPS.push({ a: cur[0].a, b: cur[cur.length - 1].b, txt: cur.map(w => w.w).join(' ') }); cur = []; };
  c0.words.forEach(w => { if (cur.length && (cur.length >= 4 || w.a - cur[cur.length - 1].b > 0.2 || (/^(Planet|And|Like|Pick|You|No|Everything|Mushrooms|Flowers|Dew|They're|Probably|But|There's|Just|So|Whole|Lighthouses|Bridges|Every|Hope|Until|Rivers|Cities|The|It's|Your|Forever|Time|Raindrops|Birds|A|You're|Comment)$/.test(w.w) && cur.length > 1))) flush(); cur.push(w); }); flush(); });
CAPS.forEach((c, i) => { const nx = CAPS[i + 1]; c.b = nx ? Math.min(nx.a, c.b + 0.35) : c.b + 0.8; c.txt = c.txt.replace(/[:\-"]/g, '').replace(/sixty degrees/i, '60 degrees'); });
function captionBox(ctx, t) { ctx.save(); ctx.font = '52px Russo'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; const words = t.split(' '); const lines = []; let cur = ''; for (const w of words) { const x = cur ? cur + ' ' + w : w; if (ctx.measureText(x).width > 620 && cur) { lines.push(cur); cur = w; } else cur = x; } lines.push(cur);
  const y0 = 1090 - (lines.length - 1) * 32; lines.forEach((l, i) => { ctx.lineJoin = 'round'; ctx.lineWidth = 12; ctx.strokeStyle = '#05081a'; ctx.strokeText(l, 360, y0 + i * 64); ctx.fillStyle = '#fff'; ctx.fillText(l, 360, y0 + i * 64); }); ctx.restore(); }
const V = new T3.Vector3(); function proj(o) { o.getWorldPosition(V); V.project(camera); return [(V.x * 0.5 + 0.5) * W, (-V.y * 0.5 + 0.5) * H]; }

window.initFootball = async function () {
  await Promise.all(['30px Russo', '20px PressStart', '30px Bangers'].map(f => document.fonts.load(f)));
  makeTextures();
  GLOW = ctex(64, 64, (c, w, h) => { const gr = c.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.25, 'rgba(255,255,255,0.6)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = gr; c.fillRect(0, 0, w, h); });
  for (const k of 'ABCD') ETEX[k] = globeTex(k);
  glc = document.createElement('canvas'); glc.width = RW; glc.height = RH;
  renderer = new T3.WebGLRenderer({ canvas: glc, antialias: true, preserveDrawingBuffer: true }); renderer.setPixelRatio(1); renderer.setSize(RW, RH, false); renderer.outputColorSpace = T3.SRGBColorSpace;
  camera = new T3.PerspectiveCamera(60, RW / RH, 0.1, 2000); scene = new T3.Scene();
  buildSpace(); buildA(); buildB(); buildC(); buildD();
  out = document.getElementById('c'); octx = out.getContext('2d'); small = document.createElement('canvas'); small.width = 90; small.height = 160; sctx = small.getContext('2d');
};
window.DURATION = TM.total;
const FOGS = { S: null, A: ['#d8e8d0', 150, 700], B: ['#cfe6f4', 160, 800], C: ['#3a120a', 80, 520], D: ['#a8b4c4', 60, 420] };
window.renderFrame = function (T) {
  let ci = CL.findIndex(c => T >= c.start && T < c.start + c.dur); if (ci < 0) ci = CL.length - 1;
  const si = shotAt(T), sh = SH[si], t0 = sh[0], t1 = si + 1 < SH.length ? SH[si + 1][0] : TM.total, p = sh[1]; const k = prog(T, t0, t1), lt = T - t0;
  const grp = p[0] === 'S' ? 'S' : p, PL_ = p.length === 2 ? p[1] : p;
  for (const key of ['S', 'A', 'B', 'C', 'D']) G[key].visible = key === grp;
  scene.background = new T3.Color(grp === 'S' ? '#02020a' : '#000'); const f = FOGS[grp]; scene.fog = f ? new T3.Fog(f[0], f[1], f[2]) : null;
  for (const gy of [G.Aguy, G.Bguy, G.Cguy, G.Dguy]) { gy.visible = false; pose0(gy); gy.rotation.set(0, 0, 0); }
  G.Bguy.userData.head.children[1].material.color.set('#e8b896'); G.Cguy.userData.head.children[1].material.color.set('#e8a886'); G.Cice.visible = false;
  if (p === 'A') { updA(T); G.Aguy.visible = true; G.Alady[1].position.set(-40, hfA(-40, -30), -30); G.Alady[1].rotation.y = T * 0.2; if (!/WILDLIFE/.test(sh[2])) { G.Alady[0].position.set(-60, hfA(-60, 20), 20); G.Alady[0].rotation.y = 0.5; } G.Alady[0].userData.hd.rotation.y = 0; }
  if (p === 'B') { G.Bturtles.forEach(t_ => t_.visible = true); updB(T, sh[2] === 'SWIMMING SOMEWHERE NEW' ? k : 0); G.Bguy.visible = /BRIDGE|SEASICK/.test(sh[2]); G.Bsun.position.set(-200, sh[2] === 'SWIMMING SOMEWHERE NEW' ? lerp(20, 160, k) : 160, -420); }
  if (p === 'C') { updC(T); G.Cguy.visible = /ICE|HOT TUB/.test(sh[2]); if (sh[2] !== 'THE CATCH') { G.CthermFill.scale.y = sh[2] === 'ICE CREAM' || sh[2] === 'THE HOT TUB' ? 8 : 1; G.CthermFill.position.y = 9 + (G.CthermFill.scale.y - 1) / 2; } }
  if (p === 'D') { G.Dguy.visible = /ONLY|REPLY|WALK/.test(sh[2]); }
  sh[3](k, lt, T);
  renderer.render(scene, camera);
  octx.imageSmoothingEnabled = true; octx.imageSmoothingQuality = 'high'; octx.globalCompositeOperation = 'source-over'; octx.drawImage(glc, 0, 0, W, H);
  const bloom = { S: 0.25, A: 0.18, B: 0.15, C: 0.4, D: 0.2 }[grp]; if (bloom) { sctx.drawImage(glc, 0, 0, 90, 160); octx.globalCompositeOperation = 'screen'; octx.globalAlpha = bloom; octx.drawImage(small, 0, 0, W, H); octx.globalAlpha = 1; octx.globalCompositeOperation = 'source-over'; }
  if (p === 'C') { octx.fillStyle = `rgba(255,90,20,${0.06 + 0.03 * S(T * 4)})`; octx.fillRect(0, 0, W, H); }
  if (p === 'D') { octx.fillStyle = 'rgba(210,225,240,0.08)'; octx.fillRect(0, 0, W, H); }
  octx.fillStyle = 'rgba(0,0,0,0.04)'; for (let y = 0; y < H; y += 4) octx.fillRect(0, y, W, 1);
  const vg = octx.createRadialGradient(360, 640, 450, 360, 640, 950); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.4)'); octx.fillStyle = vg; octx.fillRect(0, 0, W, H);
  if (p === 'S') { const pl = G.S.userData.pl; const cols = ['#9affb0', '#7ac8ff', '#ff9a4a', '#dff2ff'];
    pl.forEach((m, i) => { const [x, y] = proj(m); const a = ci === 0 ? prog(T, 1.0 + i * 0.25, 1.3 + i * 0.25) : 1; bigText(octx, 'ABCD'[i], y - 150, 66, cols[i], a, 'Russo', x); });
    if (ci === 0) { bigText(octx, 'PICK A PLANET', 110, 80, '#ffd23a', prog(T, 0.1, 0.4)); bigText(octx, 'LIVE THERE FOR 1 YEAR', 180, 40, '#fff', prog(T, AT(0, 'you') - 0.1, AT(0, 'you') + 0.2));
      const sd = AT(0, 'stay'); if (T > sd - 0.1) { const [x, y] = proj(pl[3]); octx.save(); octx.globalAlpha = prog(T, sd - 0.1, sd + 0.2); octx.strokeStyle = '#ff5a6a'; octx.lineWidth = 8; octx.beginPath(); octx.arc(x, y, 135 + 8 * S(T * 8), 0, 7); octx.stroke(); octx.restore(); bigText(octx, 'STAY TILL D', y + 175, 40, '#ff5a6a', prog(T, sd, sd + 0.2), 'Russo', x); } }
    if (ci >= 1 && ci <= 5) { const n = 6 - ci, lt2 = T - CL[ci].start, tot = prog(T, CL[1].start, S0); const col = n <= 2 ? '#ff5a3a' : '#ffd23a'; const cx = 360, cy = 660, R = 210;
      octx.save(); octx.fillStyle = 'rgba(2,2,12,0.45)'; octx.fillRect(0, 0, W, H); octx.fillStyle = 'rgba(6,8,22,0.85)'; octx.beginPath(); octx.arc(cx, cy, R - 20, 0, 7); octx.fill();
      octx.lineWidth = 30; octx.strokeStyle = 'rgba(255,255,255,0.14)'; octx.beginPath(); octx.arc(cx, cy, R, 0, 7); octx.stroke();
      octx.strokeStyle = col; octx.lineCap = 'round'; octx.shadowColor = col; octx.shadowBlur = 24; octx.beginPath(); octx.arc(cx, cy, R, -PI / 2, -PI / 2 + PI * 2 * Math.max(0.001, 1 - tot)); octx.stroke(); octx.shadowBlur = 0;
      for (let q = 0; q < 5; q++) { const a = -PI / 2 + q / 5 * PI * 2; octx.fillStyle = '#05081a'; octx.beginPath(); octx.arc(cx + C(a) * R, cy + S(a) * R, 7, 0, 7); octx.fill(); }
      const ea = -PI / 2 + PI * 2 * (1 - tot); octx.fillStyle = '#fff'; octx.beginPath(); octx.arc(cx + C(ea) * R, cy + S(ea) * R, 12, 0, 7); octx.fill();
      const sc = 1 + 0.35 * (1 - ease(prog(lt2, 0, 0.2))); octx.translate(cx, cy); octx.scale(sc, sc); bigText(octx, String(n), 8, 230, col, 1, 'Russo', 0); octx.restore(); }
    if (ci === 10) { bigText(octx, 'WHICH ONE?', 110, 84, '#ffd23a', prog(T, END, END + 0.3)); bigText(octx, 'COMMENT A B C OR D', 180, 44, '#fff', prog(T, AT(10, 'comment') - 0.1, AT(10, 'comment') + 0.2)); } }
  else { const pStart = SH.find(s => s[1] === PL_ || s[1] === 'S' + PL_)[0]; header(octx, PL_, T, pStart); locLabel(octx, sh[2], T, t0, PL[PL_].c);
    if (p === 'A' && T > AT(6, 'probably') - 0.1 && T < AT(6, 'but')) bigText(octx, 'PROBABLY...', 300, 72, '#ff5a3a', prog(T, AT(6, 'probably') - 0.1, AT(6, 'probably') + 0.2));
    if (p === 'A' && sh[2] === 'YOU ARE HERE') { const [x, y] = proj(G.Aguy.userData.head); bigText(octx, 'YOU', y - 70, 40, '#ffd23a', prog(T, t0 + 0.3, t0 + 0.6), 'Russo', x); }
    if (p === 'B' && /SOMEWHERE/.test(sh[2])) { bigText(octx, k < 0.5 ? '6.00 AM' : '6.00 AM . NEW VIEW', 300, 56, '#fff', 1); }
    if (p === 'C' && T > AT(8, 'degrees') - 0.2 && T < AT(8, 'your')) bigText(octx, '60°C', 300, 120, '#ff5a3a', prog(T, AT(8, 'sixty') - 0.1, AT(8, 'sixty') + 0.2));
    if (p === 'C' && sh[2] === 'ICE CREAM') { const left = Math.max(0, 2 - Math.max(0, T - AT(8, 'melts')) * 2 / (AT(8, 'seconds') + 0.4 - AT(8, 'melts'))); bigText(octx, left.toFixed(1) + 's', 300, 90, left > 0.5 ? '#ffd23a' : '#ff5a3a', 1); }
    if (p === 'C' && sh[2] === 'THE HOT TUB' && T > AT(8, 'forever') - 0.1 && T < AT(8, 'planet', 1)) bigText(octx, 'FOREVER.', 300, 80, '#ff9a4a', 1);
    if (p === 'D') bigText(octx, '00 . 00 . 00', 260, 46, '#dff2ff', 0.85);
    if (p === 'D' && /WALK/.test(sh[2])) bigText(octx, 'WALK ON THE RAIN', 340, 54, '#ffffff', prog(T, t0 + 0.4, t0 + 0.7)); }
  for (const [a, b, s, col] of REHOOK) if (T > a - 0.1 && T < b) pill(octx, s, 860, col, prog(T, a - 0.1, a + 0.2));
  likePill(octx, T);
  const cap = CAPS.find(c => T >= c.a && T < c.b); if (cap) captionBox(octx, cap.txt);
  for (const ts of [S0, S1, S2, S3, END]) if (T >= ts && T < ts + 0.2) { octx.fillStyle = `rgba(255,255,255,${0.8 * (1 - (T - ts) / 0.2)})`; octx.fillRect(0, 0, W, H); }
  if (T < 0.25) { octx.fillStyle = `rgba(0,0,0,${1 - T / 0.25})`; octx.fillRect(0, 0, W, H); }
  if (T > TM.total - 0.6) { octx.fillStyle = `rgba(0,0,0,${prog(T, TM.total - 0.6, TM.total)})`; octx.fillRect(0, 0, W, H); }
};
})();
