// "What if the power went out for 24 hours" — miniature / tilt-shift 3D.
(() => {
const T3 = THREE; const W = 720, H = 1280, RW = 720, RH = 1280;
const TM = window.TIMING, CL = TM.clips; const S = Math.sin, C = Math.cos, PI = Math.PI;
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), lerp = (a, b, t) => a + (b - a) * t, ease = t => { t = clamp(t); return t * t * (3 - 2 * t); }, prog = (t, a, b) => clamp((t - a) / (b - a));
function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
function wt(ci, word, n = 0) { let k = 0; for (const w of CL[ci].words) if (w.w.toLowerCase().replace(/[^a-z0-9']/g, '') === word) { if (k === n) return w.a; k++; } return CL[ci].start; }
const AT = wt;
let renderer, scene, camera, out, octx, small, sctx, glc;
const SM = (c, o = {}) => new T3.MeshStandardMaterial(Object.assign({ color: c, roughness: 0.55, metalness: 0 }, o));
const Bm = (c, o = {}) => new T3.MeshBasicMaterial(Object.assign({ color: c }, o));
function add(p, geo, mat, x = 0, y = 0, z = 0, sh = true) { const m = new T3.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = sh; m.receiveShadow = true; p.add(m); return m; }
const Bx = (w, h, d) => new T3.BoxGeometry(w, h, d);
function RB(w, h, d, r = 0.05) { const s = new T3.Shape(); const x = -w / 2, y = -h / 2; s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r); s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h); s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r); s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
  const g = new T3.ExtrudeGeometry(s, { depth: d, bevelEnabled: true, bevelThickness: r * 0.6, bevelSize: r * 0.6, bevelSegments: 3, curveSegments: 6 }); g.translate(0, 0, -d / 2); return g; }
function ctex(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); draw(g, w, h); const t = new T3.CanvasTexture(c); t.colorSpace = T3.SRGBColorSpace; t.anisotropy = 4; t.userData = { c, g }; return t; }
let GLOW; function glow(p, col, size, x, y, z, op) { const s = new T3.Sprite(new T3.SpriteMaterial({ map: GLOW, color: col, transparent: true, opacity: op, blending: T3.AdditiveBlending, depthWrite: false })); s.scale.set(size, size, 1); s.position.set(x, y, z); p.add(s); return s; }
function cam(p, l) { camera.position.set(p[0], p[1], p[2]); camera.lookAt(l[0], l[1], l[2]); }
function camL(a, b, k, la, lb) { k = ease(k); cam([lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)], [lerp(la[0], lb[0], k), lerp(la[1], lb[1], k), lerp(la[2], lb[2], k)]); }
function sun(g, x, y, z, tx, ty, tz, col = '#fff2dc', I = 3, size = 12) { const d = new T3.DirectionalLight(col, I); d.position.set(x, y, z); d.target.position.set(tx, ty, tz); d.castShadow = true; d.shadow.mapSize.set(1024, 1024); const c = d.shadow.camera; c.left = c.bottom = -size; c.right = c.top = size; c.near = 0.5; c.far = 200; d.shadow.bias = -0.0004; d.shadow.radius = 3; g.add(d); g.add(d.target); return d; }
// smooth people (PS4-ish proportions)
function human(o = {}) { const g = new T3.Group(); const skin = SM(o.skin || '#d8a888', { roughness: 0.6 }), top = SM(o.top || '#3a6aa8', { roughness: 0.8 }), bot = SM(o.bot || '#2a2e3a', { roughness: 0.8 });
  const body = new T3.Group(); g.add(body); add(body, new T3.CapsuleGeometry(0.19, 0.42, 6, 14), top, 0, 1.18, 0).scale.z = 0.75; add(body, new T3.SphereGeometry(0.13, 20, 16), skin, 0, 1.68, 0); add(body, new T3.SphereGeometry(0.135, 20, 12, 0, PI * 2, 0, PI * 0.55), SM(o.hair || '#2a1c14', { roughness: 0.9 }), 0, 1.7, -0.01);
  const limb = (x, y, r, l, m) => { const p = new T3.Group(); p.position.set(x, y, 0); body.add(p); add(p, new T3.CapsuleGeometry(r, l, 4, 10), m, 0, -l / 2 - r, 0); return p; };
  const armL = limb(-0.25, 1.48, 0.06, 0.48, top), armR = limb(0.25, 1.48, 0.06, 0.48, top), legL = limb(-0.1, 0.9, 0.08, 0.66, bot), legR = limb(0.1, 0.9, 0.08, 0.66, bot);
  g.userData = { body, armL, armR, legL, legR }; return g; }
function walkP(p, ph, a = 1) { const u = p.userData, s = S(ph); u.legL.rotation.x = s * 0.6 * a; u.legR.rotation.x = -s * 0.6 * a; u.armL.rotation.x = -s * 0.5 * a; u.armR.rotation.x = s * 0.5 * a; u.body.position.y = Math.abs(C(ph)) * 0.03 * a; }
function rest(p) { const u = p.userData; for (const k of ['armL', 'armR', 'legL', 'legR']) u[k].rotation.set(0, 0, 0); u.body.position.y = 0; u.body.rotation.set(0, 0, 0); }

const G = {}; const R = {}; const E = {};
// ---------- miniature city ----------
const ROADS = [-20, 0, 20], LIM = 42;
function winTex(cols, rows, base) { return ctex(64, 128, (c, w, h) => { c.fillStyle = base; c.fillRect(0, 0, w, h); const cw = w / cols, rh = h / rows; for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) { c.fillStyle = '#ffffff'; c.fillRect(x * cw + cw * 0.22, y * rh + rh * 0.25, cw * 0.56, rh * 0.5); } }); }
function winEm(cols, rows, seed) { const r = rng(seed); return ctex(64, 128, (c, w, h) => { c.fillStyle = '#000'; c.fillRect(0, 0, w, h); const cw = w / cols, rh = h / rows; for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) { if (r() < 0.7) { c.fillStyle = r() < 0.2 ? '#bcd8ff' : '#ffd890'; c.fillRect(x * cw + cw * 0.22, y * rh + rh * 0.25, cw * 0.56, rh * 0.5); } } }); }
function buildCity() { const g = G.city = new T3.Group(); scene.add(g); const r = rng(11);
  add(g, Bx(160, 0.4, 160), SM('#7aa86a', { roughness: 0.9 }), 0, -0.2, 0);
  for (const p of ROADS) { add(g, Bx(4.4, 0.06, 2 * LIM), SM('#3a3e46', { roughness: 0.7 }), p, 0.03, 0); add(g, Bx(2 * LIM, 0.06, 4.4), SM('#3a3e46', { roughness: 0.7 }), 0, 0.032, p); for (let k = -LIM; k < LIM; k += 3) { add(g, Bx(0.15, 0.07, 1.4), Bm('#f4f0d8'), p, 0.04, k, false); add(g, Bx(1.4, 0.07, 0.15), Bm('#f4f0d8'), k, 0.042, p, false); } }
  R.bmats = []; const pal = ['#f2a07a', '#7ac0e8', '#f2d07a', '#a8d88a', '#e88aa8', '#b8a8e8', '#f4f0e8', '#8ad8c8'];
  const blocks = [-31, -10, 10, 31]; let bi = 0;
  for (const bx of blocks) for (const bz of blocks) { add(g, Bx(15.4, 0.25, 15.4), SM('#c8c4bc', { roughness: 0.8 }), bx, 0.12, bz);
    if (bx === -31 && bz === 10) continue; if (bx === 31 && bz === -31) continue;
    for (const [ox, oz] of [[-3.8, -3.8], [3.8, -3.8], [-3.8, 3.8], [3.8, 3.8]]) { if (r() < 0.15) { for (let t_ = 0; t_ < 3; t_++) { add(g, new T3.CylinderGeometry(0.15, 0.2, 1.4, 8), SM('#6a4a2a'), bx + ox + (r() - 0.5) * 3, 0.95, bz + oz + (r() - 0.5) * 3); add(g, new T3.SphereGeometry(1.1, 16, 12), SM('#4a9a4a', { roughness: 0.8 }), bx + ox + (r() - 0.5) * 3, 2.2, bz + oz + (r() - 0.5) * 3); } continue; }
      const h = 4 + r() * (Math.abs(bx) < 20 && Math.abs(bz) < 20 ? 22 : 10); const col = pal[(bi++) % pal.length]; const rows = Math.max(2, Math.round(h / 2.2));
      const m = SM('#ffffff', { map: winTex(3, rows, col), emissiveMap: winEm(3, rows, bi), emissive: '#ffd890', emissiveIntensity: 0, roughness: 0.55 }); R.bmats.push(m);
      add(g, RB(6.6, h, 6.6, 0.25), m, bx + ox, 0.25 + h / 2, bz + oz).rotation.x = 0; add(g, Bx(6.8, 0.4, 6.8), SM(col, { roughness: 0.6 }), bx + ox, 0.25 + h + 0.2, bz + oz);
      if (r() < 0.5) add(g, Bx(1.6, 1.0, 1.6), SM('#9aa0a8', { metalness: 0.4 }), bx + ox + 1.5, 0.25 + h + 0.9, bz + oz - 1.2); } }
  // billboards (screens)
  R.boards = []; const adC = [['#ff4a6a', '#ffd25a', 'SALE'], ['#3ab8ff', '#ffffff', 'PIZZA'], ['#8a5aff', '#5affd8', 'NEW!']];
  [[0, 12, -14.9, 0], [-14.9, 10, 6, PI / 2], [14.9, 14, -6, -PI / 2]].forEach(([x, y, z, ry], i) => { const [a, b, s_] = adC[i]; const t = ctex(256, 128, (c) => { const gr = c.createLinearGradient(0, 0, 256, 128); gr.addColorStop(0, a); gr.addColorStop(1, b); c.fillStyle = gr; c.fillRect(0, 0, 256, 128); c.fillStyle = '#fff'; c.font = '64px Russo'; c.textAlign = 'center'; c.fillText(s_, 128, 86); });
    const bd = add(g, new T3.PlaneGeometry(7, 3.5), new T3.MeshBasicMaterial({ map: t, toneMapped: false }), x, y, z, false); bd.rotation.y = ry; add(g, Bx(7.4, 3.9, 0.3), SM('#1a1a1e'), x - Math.sin(ry) * 0.2, y, z - Math.cos(ry) * 0.2); R.boards.push(bd); });
  // traffic lights at intersections
  R.tls = []; for (const x of ROADS) for (const z of ROADS) { const tl = new T3.Group(); tl.position.set(x + 2.8, 0, z + 2.8); g.add(tl); add(tl, new T3.CylinderGeometry(0.08, 0.1, 3.4, 8), SM('#2a2a30', { metalness: 0.5 }), 0, 1.7, 0); add(tl, RB(0.5, 1.3, 0.4, 0.08), SM('#1a1a1e'), 0, 3.6, 0);
    tl.userData.ls = ['#ff3a2a', '#ffb02a', '#3aff6a'].map((c, k) => add(tl, new T3.SphereGeometry(0.14, 16, 12), Bm(c, { toneMapped: false }), 0, 4.0 - k * 0.38, 0.22, false)); tl.userData.o = r(); R.tls.push(tl); }
  // cars
  R.cars = []; const cc = ['#e83a3a', '#3a7ae8', '#f2c83a', '#f4f4f4', '#2a2a2e', '#3ac87a', '#ff8a3a', '#8a5ae8'];
  for (let i = 0; i < 48; i++) { const c_ = new T3.Group(); g.add(c_); const col = cc[i % 8]; add(c_, RB(1.7, 0.7, 3.6, 0.2), SM(col, { roughness: 0.25, metalness: 0.3 }), 0, 0.65, 0); add(c_, RB(1.5, 0.55, 1.9, 0.2), SM(col, { roughness: 0.25, metalness: 0.3 }), 0, 1.15, -0.2);
    add(c_, Bx(1.42, 0.42, 1.7), SM('#1a2a3a', { roughness: 0.05, metalness: 0.6 }), 0, 1.16, -0.2); for (const [x_, z_] of [[-0.8, 1.1], [0.8, 1.1], [-0.8, -1.1], [0.8, -1.1]]) add(c_, new T3.CylinderGeometry(0.33, 0.33, 0.25, 16), SM('#141414'), x_, 0.35, z_).rotation.z = PI / 2;
    const ax = i % 2; const lane = ROADS[(i >> 1) % 3]; const dir = (i >> 2) % 2 ? 1 : -1; c_.userData = { ax, lane: lane + dir * 1.1, dir, s0: r() * 84 - 42, sp: 7 + r() * 4, q: (i >> 3) % 4 }; R.cars.push(c_); }
  // people on the pavements
  R.peds = []; const pc = ['#e85a5a', '#3a8ae8', '#f2b83a', '#5ac85a', '#8a5ae8', '#f4f4f4'];
  for (let i = 0; i < 40; i++) { const p = human({ top: pc[i % 6], bot: ['#2a2e3a', '#3a4a6a'][i % 2], skin: ['#e8b896', '#c8946a', '#8a5a3a', '#f0c8a0'][i % 4] }); g.add(p); p.userData.w = { ax: i % 2, lane: ROADS[i % 3] + (i % 4 < 2 ? 3.1 : -3.1), dir: (i >> 1) % 2 ? 1 : -1, s0: r() * 84 - 42, sp: 1.2 + r() * 0.6 }; R.peds.push(p); }
  // phone tower
  R.tower = new T3.Group(); R.tower.position.set(31, 0.25, -31); g.add(R.tower); for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { const l = add(R.tower, new T3.CylinderGeometry(0.12, 0.2, 28, 6), SM('#c8ccd4', { metalness: 0.6, roughness: 0.3 }), a * 1.2, 14, b * 1.2); l.rotation.set(b * 0.04, 0, -a * 0.04); }
  for (let y = 2; y < 27; y += 3) { const ring = add(R.tower, Bx(2.6 - y * 0.04, 0.12, 2.6 - y * 0.04), SM('#d83a3a', { metalness: 0.4 }), 0, y, 0); } for (let k = 0; k < 3; k++) { const pn = add(R.tower, Bx(0.6, 2.2, 0.25), SM('#f4f4f4'), C(k * 2.1) * 1.1, 26, S(k * 2.1) * 1.1); pn.rotation.y = -k * 2.1; }
  R.beacon = add(R.tower, new T3.SphereGeometry(0.3, 12, 10), Bm('#ff3a2a', { toneMapped: false }), 0, 28.3, 0, false); add(R.tower, Bx(2.4, 1.6, 1.6), SM('#9aa0a8', { metalness: 0.5 }), 3, 0.8, 0); R.batt = add(R.tower, Bx(0.8, 0.5, 0.05), Bm('#3aff6a', { toneMapped: false }), 3, 1.0, 0.83, false);
  // hospital + generator
  R.hosp = new T3.Group(); R.hosp.position.set(-31, 0.25, 10); g.add(R.hosp); const hm = SM('#ffffff', { map: winTex(6, 5, '#f4f4f0'), emissiveMap: winEm(6, 5, 99), emissive: '#e8f4ff', emissiveIntensity: 0, roughness: 0.4 }); R.hospMat = hm;
  add(R.hosp, RB(13, 10, 9, 0.3), hm, 0, 5, -1.5); const cr = ctex(64, 64, (c) => { c.fillStyle = '#ffffff'; c.fillRect(0, 0, 64, 64); c.fillStyle = '#e82a2a'; c.fillRect(24, 8, 16, 48); c.fillRect(8, 24, 48, 16); }); add(R.hosp, new T3.PlaneGeometry(2.6, 2.6), new T3.MeshBasicMaterial({ map: cr, toneMapped: false }), 0, 11.6, 3.1, false); add(R.hosp, Bx(3, 1.4, 0.2), SM('#ffffff'), 0, 11.6, 3.0);
  R.gen = add(R.hosp, RB(3.2, 1.8, 2, 0.15), SM('#f2c83a', { roughness: 0.4 }), 5, 0.9, 5.5); add(R.hosp, new T3.CylinderGeometry(0.15, 0.15, 1.5, 10), SM('#4a4a4e', { metalness: 0.6 }), 6, 2.4, 5.5); R.puffs = []; for (let i = 0; i < 12; i++) { const p = glow(R.hosp, '#9a9aa0', 1.2, 6, 3, 5.5, 0); p.material.blending = T3.NormalBlending; p.userData.o = i / 12; R.puffs.push(p); }
  // rooftop watchers (night)
  R.roof = []; for (let i = 0; i < 4; i++) { const p = human({ top: pc[i], bot: '#2a2e3a', skin: '#e8b896' }); g.add(p); R.roof.push(p); }
  // streetlights
  R.street = []; for (const p of ROADS) for (let k = -36; k <= 36; k += 12) { add(g, new T3.CylinderGeometry(0.07, 0.09, 4.5, 8), SM('#3a3a40', { metalness: 0.5 }), p - 2.6, 2.25, k); R.street.push(add(g, new T3.SphereGeometry(0.25, 10, 8), Bm('#ffd890', { toneMapped: false }), p - 2.3, 4.5, k, false)); }
  R.sun = sun(g, -40, 70, 40, 0, 0, 0, '#fff4e0', 3.2, 60); R.hemi = new T3.HemisphereLight('#dceaff', '#6a7a5a', 0.9); g.add(R.hemi);
  // sky dome + stars
  R.skyMat = new T3.MeshBasicMaterial({ color: '#8ac4f0', side: T3.BackSide, fog: false }); add(g, new T3.SphereGeometry(400, 32, 16), R.skyMat, 0, 0, 0, false);
  const sp = []; const rr = rng(5); for (let i = 0; i < 3000; i++) { const a = rr() * PI * 2, b = rr() * 1.3, d = 380; sp.push(d * S(b) * C(a), d * C(b), d * S(b) * S(a)); } const sg = new T3.BufferGeometry(); sg.setAttribute('position', new T3.Float32BufferAttribute(sp, 3)); R.stars = new T3.Points(sg, new T3.PointsMaterial({ color: '#ffffff', size: 3.0, sizeAttenuation: false, transparent: true, opacity: 0, fog: false })); g.add(R.stars);
  R.milky = glow(g, '#b8c8ff', 500, 80, 250, -200, 0); R.moonL = new T3.DirectionalLight('#8aa8ff', 0); R.moonL.position.set(40, 60, -30); g.add(R.moonL); }
// ---------- dollhouse tower (cut-away) ----------
function buildDoll() { const g = G.doll = new T3.Group(); g.position.x = 300; scene.add(g); const r = rng(21); const FH = 3.2;
  add(g, Bx(30, 0.4, 20), SM('#7aa86a'), 0, -0.2, 0); add(g, Bx(14, 0.3, 8), SM('#8a8e96'), 0, -0.15, 0);
  R.taps = []; const wallC = ['#f2d8b8', '#c8e0f0', '#f0c8c8', '#d8f0c8', '#e8d8f4', '#f4ecc8'];
  for (let f = -1; f < 6; f++) { const y = f * FH; add(g, Bx(12.4, 0.3, 7), SM('#e8e0d4'), 0, y, 0); add(g, Bx(12.4, FH, 0.25), SM(f < 0 ? '#8a8e96' : wallC[f], { roughness: 0.8 }), 0, y + FH / 2, -3.4); for (const sx of [-1, 1]) add(g, Bx(0.3, FH, 7), SM('#d8d0c4'), sx * 6.05, y + FH / 2, 0);
    if (f >= 0) { add(g, Bx(0.2, FH, 4), SM('#d8d0c4'), 1.5, y + FH / 2, -1.2); add(g, RB(2.6, 0.6, 1.0, 0.15), SM(['#3a6ab8', '#c84a4a', '#4aa86a', '#e8a83a', '#8a5ae8', '#3ab8b8'][f], { roughness: 0.9 }), -3.5, y + 0.6, -2.4);
      add(g, Bx(1.6, 0.9, 0.7), SM('#f4f4f4'), 3.5, y + 0.6, -2.8); const tap = add(g, new T3.CylinderGeometry(0.06, 0.06, 0.4, 8), SM('#c8ccd4', { metalness: 0.9, roughness: 0.2 }), 3.5, y + 1.25, -2.9); const drop = add(g, new T3.SphereGeometry(0.07, 8, 6), SM('#5ab8ff', { roughness: 0.05, emissive: '#2a6aaa', emissiveIntensity: 0.4 }), 3.5, y + 1.1, -2.75, false); R.taps.push({ drop, y, f });
      const p = human({ top: ['#e85a5a', '#3a8ae8', '#f2b83a', '#5ac85a', '#8a5ae8', '#ff8a3a'][f], bot: '#2a2e3a', skin: ['#e8b896', '#c8946a', '#8a5a3a', '#f0c8a0'][f % 4] }); p.position.set(f % 2 ? -1 : 3.0, y + 0.15, -1.6); p.scale.setScalar(0.9); g.add(p); R['dp' + f] = p;
      if (f === 2) { R.fridge = new T3.Group(); R.fridge.position.set(5, y + 0.15, -2.6); g.add(R.fridge); add(R.fridge, RB(1.0, 2.0, 0.8, 0.08), SM('#e8ecf0', { roughness: 0.2, metalness: 0.3 }), 0, 1.0, 0); R.fdoor = new T3.Group(); R.fdoor.position.set(0.5, 0, 0.42); R.fridge.add(R.fdoor); add(R.fdoor, RB(1.0, 2.0, 0.08, 0.04), SM('#dfe4ea', { roughness: 0.2, metalness: 0.3 }), -0.5, 1.0, 0); add(R.fdoor, Bx(0.05, 0.6, 0.06), SM('#8a8e96', { metalness: 0.8 }), -0.9, 1.3, 0.06);
        R.fLight = new T3.PointLight('#e8f4ff', 0, 3, 2); R.fLight.position.set(0, 1.2, 0.5); R.fridge.add(R.fLight); for (const [x_, y_, c_] of [[-0.25, 1.4, '#e83a3a'], [0.2, 1.4, '#f2d03a'], [0, 0.9, '#5ac85a'], [-0.2, 0.5, '#f4f4f4']]) add(R.fridge, new T3.SphereGeometry(0.12, 12, 8), SM(c_), x_, y_, 0.15); } } }
  // pump + pipe
  R.pump = new T3.Group(); R.pump.position.set(-3, -FH + 0.2, -1.5); g.add(R.pump); add(R.pump, new T3.CylinderGeometry(0.7, 0.7, 1.4, 20), SM('#3a7ae8', { metalness: 0.5, roughness: 0.3 }), 0, 0.7, 0); R.fan = add(R.pump, Bx(1.6, 0.1, 0.25), SM('#c8ccd4', { metalness: 0.8 }), 0, 1.5, 0); R.pumpLed = add(R.pump, new T3.SphereGeometry(0.12, 10, 8), Bm('#3aff6a', { toneMapped: false }), 0.75, 1.0, 0, false);
  add(g, new T3.CylinderGeometry(0.15, 0.15, 6 * FH + FH, 12), SM('#c8ccd4', { metalness: 0.7, roughness: 0.3 }), -5.6, (5 * FH) / 2, -3.0);
  R.water = []; for (let i = 0; i < 40; i++) R.water.push(add(g, new T3.SphereGeometry(0.11, 8, 6), SM('#5ab8ff', { emissive: '#2a8aff', emissiveIntensity: 0.6 }), -5.6, 0, -2.75, false));
  for (let f = 0; f < 6; f++) { const t = ctex(64, 32, (c) => { c.fillStyle = '#1a1a1e'; c.fillRect(0, 0, 64, 32); c.fillStyle = '#fff'; c.font = '20px Russo'; c.textAlign = 'center'; c.fillText(`F${f * 5 + 1}`, 32, 23); }); add(g, new T3.PlaneGeometry(0.9, 0.45), new T3.MeshBasicMaterial({ map: t }), 6.4, f * FH + 2.4, 3.4, false).rotation.y = -0.3; }
  g.add(new T3.HemisphereLight('#f0f4ff', '#8a7a6a', 0.9)); sun(g, -8, 20, 16, 0, 8, 0, '#fff4e0', 2.6, 16); const il = new T3.PointLight('#ffe8c8', 2, 40, 1.5); il.position.set(0, 9, 6); g.add(il); }
// ---------- timeline ----------
function CLI(T) { let ci = CL.findIndex(c => T >= c.start && T < c.start + c.dur); return ci < 0 ? CL.length - 1 : ci; }
Object.assign(E, { tw: AT(0, 'twenty'), by: AT(0, 'by'), and0: AT(0, 'and'), like: AT(0, 'like'), twelve: AT(1, 'twelve'), every1: AT(1, 'every'), traffic: AT(1, 'traffic'), within: AT(2, 'within'), crossing: AT(2, 'every'),
  hour2: AT(3, 'hour'), towers: AT(3, 'phone', 1), but3: AT(3, 'but'), tall: AT(4, 'tall'), so4: AT(4, 'so'), taps4: AT(4, 'taps'), big: AT(5, 'big'), your5: AT(5, 'your'), food: AT(5, 'food'), night: AT(6, 'night'), no6: AT(6, 'no'), and6: AT(6, 'and'), stars: AT(6, 'stars'),
  power7: AT(7, 'power'), every7: AT(7, 'everything'), and7: AT(7, 'and'), beeps: AT(7, 'beeps'), could: AT(7, 'could'), comment: AT(7, 'comment'), follow: AT(7, 'follow') });
const CUT = () => E.every1 - 0.1, BACK = () => E.power7 + 0.5;
function wrap(s) { return ((s + LIM) % (2 * LIM) + 2 * LIM) % (2 * LIM) - LIM; }
function carS(c_, T) { const u = c_.userData; const tl = E.within + 0.2; const sAt = t => wrap(u.s0 + u.dir * u.sp * t);
  if (T < tl) return sAt(T); const sl = sAt(tl); let ahead = null; for (const p of ROADS) { const d = (p - sl) * u.dir; if (d > 3 && (ahead === null || d < (ahead - sl) * u.dir)) ahead = p; } const sq = ahead === null ? sl : ahead - u.dir * (3.2 + u.q * 4.4);
  if (T < BACK()) return lerp(sl, sq, ease(prog(T, tl, tl + 2.2))); return wrap(sq + u.dir * u.sp * (T - BACK())); }
function setCity(T, o) { const on = o.power, day = o.day; R.skyMat.color.set(new T3.Color('#0a1028').lerp(new T3.Color('#8ac4f0'), day)); R.sun.intensity = 3.2 * day; R.hemi.intensity = 0.55 + 0.35 * day; R.hemi.color.set(day > 0.5 ? '#dceaff' : '#6a7ad0'); R.moonL.intensity = 1.4 * (1 - day);
  R.stars.material.opacity = clamp(1 - day * 1.6) * (on && day < 0.5 ? 0.25 : 1); R.milky.material.opacity = 0.22 * clamp(1 - day * 1.6) * (on ? 0.2 : 1);
  R.bmats.forEach((m, i) => { const lit = on ? (o.wave != null ? (o.wave > (i * 0.618) % 1 ? 1 : 0) : 1) : 0; m.emissiveIntensity = lit * lerp(1.4, 0.2, day); });
  R.hospMat.emissiveIntensity = lerp(1.2, 0.2, day); R.boards.forEach(b => b.material.color.set(on ? '#ffffff' : '#060606')); R.street.forEach(s_ => s_.material.color.set(on && day < 0.6 ? '#ffd890' : '#2a2a2a'));
  const tlOn = o.tl; R.tls.forEach((tl, i) => { const ph = Math.floor((T * 0.5 + tl.userData.o * 3) % 3); tl.userData.ls.forEach((l, k) => l.material.color.set(tlOn && k === (2 - ph) ? ['#ff3a2a', '#ffb02a', '#3aff6a'][k] : '#18181a')); });
  R.cars.forEach((c_, i) => { const u = c_.userData; const s_ = carS(c_, T); if (u.ax) { c_.position.set(u.lane, 0.08, s_); c_.rotation.y = u.dir > 0 ? 0 : PI; } else { c_.position.set(s_, 0.08, u.lane); c_.rotation.y = u.dir > 0 ? PI / 2 : -PI / 2; } });
  R.peds.forEach((p, i) => { const w_ = p.userData.w; const s_ = wrap(w_.s0 + w_.dir * w_.sp * T); if (w_.ax) { p.position.set(w_.lane, 0.25, s_); p.rotation.y = w_.dir > 0 ? 0 : PI; } else { p.position.set(s_, 0.25, w_.lane); p.rotation.y = w_.dir > 0 ? PI / 2 : -PI / 2; } walkP(p, T * 8 + i, 1); });
  R.beacon.material.color.set(o.beacon && S(T * 6) > 0 ? '#ff3a2a' : '#2a0a0a'); R.batt.material.color.set(o.batt > 0.5 ? '#3aff6a' : o.batt > 0.2 ? '#ffb02a' : '#ff3a2a');
  R.puffs.forEach((p, i) => { const a = (T * 0.6 + p.userData.o) % 1; p.position.set(6 + a * 1.5, 3 + a * 4, 5.5); p.scale.setScalar(0.8 + a * 2); p.material.opacity = o.gen ? 0.5 * S(a * PI) : 0; });
  R.roof.forEach((p, i) => { p.visible = !!o.roof; rest(p); p.position.set(-31 - 4 + i * 2.6, 10.25 + 0.25, 10 - 1); p.rotation.y = PI + 0.3 * (i - 1.5); p.userData.body.rotation.x = -0.15; p.userData.armR.rotation.x = i === 1 ? -2.6 : 0; }); }
function setDoll(T, o) { const pumpOn = o.pump; R.fan.rotation.y = pumpOn ? T * 20 : 0; R.pumpLed.material.color.set(pumpOn ? '#3aff6a' : '#ff3a2a');
  R.water.forEach((w_, i) => { const a = ((T * 0.35 + i / 40) % 1); w_.visible = pumpOn; w_.position.y = -3 + a * 20; });
  R.taps.forEach(tp => { const flowing = pumpOn || tp.f < (o.lowOK ?? 6); tp.drop.visible = flowing; const a = (T * 2.2 + tp.f * 0.3) % 1; tp.drop.position.y = tp.y + 1.1 - a * 0.25; });
  R.fdoor.rotation.y = -(o.fridgeOpen || 0) * 1.6; R.fLight.intensity = o.fridgeOpen && pumpOn ? 2 : 0; }
function shot(T) { const ci = CLI(T); G.city.visible = G.doll.visible = false; const X = 300;
  const cityWide = (k, a0 = 0.4) => { const a = a0 + k * 0.35; cam([C(a) * 92, 88, S(a) * 92], [0, 0, 0]); };
  if (ci === 0) {
    if (T < E.by - 0.1) { G.city.visible = true; setCity(T, { power: 1, day: 1, tl: 1, beacon: 1, batt: 1 }); cityWide(prog(T, 0, E.by), 0.3); return 'city'; }
    if (T < E.and0 - 0.1) { G.doll.visible = true; setDoll(T, { pump: 0, lowOK: 2 }); camL([X + 4.6, 18.8, 3.6], [X + 4.3, 18.5, 2.4], prog(T, E.by, E.and0), [X + 3.5, 17.2, -2.9], [X + 3.5, 17.2, -2.9]); return 'doll'; }
    if (T < E.like - 0.1) { G.city.visible = true; setCity(T, { power: 0, day: 0, tl: 0, roof: 1, gen: 1 }); camL([-29, 12.5, 18], [-29, 13, 20], prog(T, E.and0, E.like), [-31, 40, -60], [-28, 60, -80]); return 'stars'; }
    G.city.visible = true; setCity(T, { power: 1, day: 1, tl: 1, beacon: 1, batt: 1 }); cityWide(prog(T, E.like, CL[1].start), 0.55); return 'city'; }
  const on = T < CUT() || T > BACK();
  if (ci === 1) { G.city.visible = true; setCity(T, { power: on, day: 1, tl: T < E.traffic + 0.3, beacon: 1, batt: 1 });
    if (T < E.every1 - 0.3) cityWide(prog(T, CL[1].start, E.every1), 0.8); else if (T < E.traffic - 0.2) camL([1, 9, 10], [0.5, 10, 6], prog(T, E.every1, E.traffic), [0, 12, -14.9], [0, 12, -14.9]); else camL([2.6, 5.5, 18], [2.6, 5, 13], prog(T, E.traffic, CL[2].start), [2.8, 3.4, 2.8], [2.8, 3.6, 2.8]); return 'city'; }
  if (ci === 2) { G.city.visible = true; setCity(T, { power: 0, day: 1, tl: 0, beacon: 1, batt: 0.9 }); camL([26, 34, 30], [18, 26, 22], prog(T, CL[2].start, CL[3].start), [0, 0, 0], [0, 0, 0]); return 'city'; }
  if (ci === 3) { G.city.visible = true; const b = 1 - prog(T, E.towers, CL[4].start) * 0.85; setCity(T, { power: 0, day: lerp(1, 0.9, prog(T, CL[3].start, CL[4].start)), tl: 0, beacon: 1, batt: b }); if (T < E.towers - 0.2) camL([20, 4, -12], [20, 5, -16], prog(T, CL[3].start, E.towers), [31, 6, -31], [31, 12, -31]); else camL([19, 8, -19], [20, 6, -20], prog(T, E.towers, CL[4].start), [31, 20, -31], [31, 26, -31]); return 'city'; }
  if (ci === 4) { G.doll.visible = true; const dry = T > E.so4 - 0.2; setDoll(T, { pump: 0, lowOK: dry ? 2 : 6 });
    if (T < E.so4 - 0.2) { if (T < E.tall + 1.2) camL([X, 9, 30], [X, 7, 24], prog(T, CL[4].start, E.tall + 1.2), [X, 7, 0], [X, 6, 0]); else camL([X - 0.2, -1.0, 5.5], [X - 0.8, -1.3, 4.2], prog(T, E.tall + 1.2, E.so4), [X - 3, -2.2, -1.5], [X - 3, -2.3, -1.5]); } else camL([X + 4.6, 18.8, 3.6], [X + 4.3, 18.5, 2.4], prog(T, E.so4, CL[5].start), [X + 3.5, 17.2, -2.9], [X + 3.5, 17.2, -2.9]); return 'doll'; }
  if (ci === 5) { if (T < E.your5 - 0.2) { G.city.visible = true; setCity(T, { power: 0, day: 0.8, tl: 0, gen: 1, batt: 0.2 }); camL([-18, 30, 42], [-19, 24, 36], prog(T, CL[5].start, E.your5), [-31, 4, 10], [-28, 2, 13]); return 'city'; }
    G.doll.visible = true; setDoll(T, { pump: 0, lowOK: 2, fridgeOpen: 0 }); camL([X + 4.4, 8.0, 2.4], [X + 4.7, 7.8, 1.2], prog(T, E.your5, CL[6].start), [X + 5, 7.5, -2.6], [X + 5, 7.5, -2.6]); return 'doll'; }
  if (ci === 6) { G.city.visible = true; const d = 1 - ease(prog(T, CL[6].start, E.no6)); setCity(T, { power: 0, day: d, tl: 0, gen: 1, roof: T > E.and6 - 0.3 });
    if (T < E.and6 - 0.3) cityWide(prog(T, CL[6].start, E.and6), 1.3); else camL([-29, 12.5, 18], [-29, 13, 20], prog(T, E.and6, CL[7].start), [-31, 40, -60], [-28, 60, -80]); return 'stars'; }
  G.city.visible = true; const w = prog(T, BACK() - 0.2, BACK() + 1.6); setCity(T, { power: T > BACK() - 0.2, day: 1, tl: T > BACK() + 0.6, beacon: 1, batt: 1, wave: w }); cityWide(prog(T, CL[7].start, TM.total), 1.8); return 'city'; }

// ---------- HUD ----------
function txt(s, x, y, size, col, align = 'center', font = 'Russo') { octx.font = `${size}px ${font}`; octx.fillStyle = col; octx.textAlign = align; octx.textBaseline = 'middle'; octx.fillText(s, x, y); }
function big(s, y, size, col, a = 1, x = 360) { if (a <= 0) return; octx.save(); octx.globalAlpha = a; octx.font = `${size}px Russo`; octx.textAlign = 'center'; octx.textBaseline = 'middle'; octx.lineJoin = 'round'; octx.lineWidth = size * 0.2; octx.strokeStyle = 'rgba(10,12,24,0.92)'; octx.strokeText(s, x, y); octx.fillStyle = col; octx.fillText(s, x, y); octx.restore(); }
function card(x, y, w, h, a) { octx.save(); octx.globalAlpha = a; octx.fillStyle = 'rgba(250,248,242,0.94)'; octx.beginPath(); octx.roundRect(x, y, w, h, 24); octx.fill(); octx.restore(); }
function clockStr(T, ci) { if (ci === 0) return '12.00 PM'; if (ci === 1) return '12.00 PM'; if (ci === 2) return '12.05 PM'; if (ci === 3) return '2.00 PM'; if (ci === 4) return '6.00 PM'; if (ci === 5) return '7.30 PM'; if (ci === 6) return '11.00 PM'; return '12.00 PM'; }
function hud(T, ci) { if (ci === 0) return; const on = T < CUT() || T > BACK(); const hrs = T < CUT() ? 0 : T > BACK() ? 24 : [0, 0, 0, 2, 6, 7, 11][ci] + (ci === 1 || ci === 2 ? 0 : 0);
  octx.save(); octx.fillStyle = 'rgba(10,12,24,0.78)'; octx.beginPath(); octx.roundRect(24, 40, 300, 110, 22); octx.fill(); txt(clockStr(T, ci), 174, 80, 40, '#fff'); txt(T > BACK() ? 'NEXT DAY' : 'DAY 1', 174, 124, 18, '#9ab0d0', 'center', 'PressStart');
  octx.fillStyle = on ? '#3ad88a' : '#ff4a3a'; octx.beginPath(); octx.roundRect(340, 40, 356, 110, 22); octx.fill(); txt(on ? 'POWER . ON' : 'POWER . OFF', 518, 78, 36, '#0a0c18'); txt(`${hrs} HOURS WITHOUT POWER`, 518, 122, 15, '#0a0c18', 'center', 'PressStart'); octx.restore(); }
function likePill(T) { const l0 = E.like, l1 = CL[1].start; if (T < l0 - 0.15 || T > l1 + 0.2) return; const k = ease(prog(T, l0 - 0.15, l0 + 0.15)) * (1 - ease(prog(T, l1 - 0.1, l1 + 0.2))); octx.save(); octx.globalAlpha = k; octx.translate(0, (1 - k) * 30);
  octx.fillStyle = 'rgba(10,12,24,0.85)'; octx.beginPath(); octx.roundRect(170, 960, 380, 70, 35); octx.fill(); octx.strokeStyle = '#ffd25a'; octx.lineWidth = 3; octx.stroke();
  const hb = 1 + 0.25 * Math.max(0, S((T - l0) * 9)) * (T < l0 + 0.7 ? 1 : 0); octx.save(); octx.translate(216, 995); octx.scale(hb, hb); octx.fillStyle = '#ff5a6a'; octx.beginPath(); octx.moveTo(0, 12); octx.bezierCurveTo(-26, -6, -12, -26, 0, -12); octx.bezierCurveTo(12, -26, 26, -6, 0, 12); octx.fill(); octx.restore();
  txt('LIKE', 270, 996, 24, '#fff'); const fo = T > AT(0, 'follow'); octx.fillStyle = fo ? '#3ad88a' : '#ffd25a'; octx.beginPath(); octx.roundRect(340, 973, 190, 44, 22); octx.fill(); txt(fo && T > AT(0, 'follow') + 0.3 ? 'FOLLOWING' : '+ FOLLOW', 435, 996, 20, '#0a0a10'); octx.restore(); }
const V = new T3.Vector3(); function proj(x, y, z) { V.set(x, y, z).project(camera); return [(V.x * 0.5 + 0.5) * W, (-V.y * 0.5 + 0.5) * H, V.z]; }
const SEQ = [[['twenty', 'four', 'hours'], '24 hours'], [['twelve', "o'clock"], '12 o\'clock'], [['hour', 'two'], 'Hour 2.'], [['hour', 'six'], 'Hour 6.'], [['hour', 'twenty', 'four'], 'Hour 24.'], [['four', 'hours'], '4 hours']];
function mergeWords(ws) { const o = []; for (let i = 0; i < ws.length; i++) { let hit = null; for (const [seq, rep] of SEQ) if (seq.every((s_, k) => ws[i + k] && ws[i + k].w.toLowerCase().replace(/[^a-z']/g, '') === s_)) { hit = [seq.length, rep]; break; } if (hit) { o.push({ w: hit[1], a: ws[i].a, b: ws[i + hit[0] - 1].b }); i += hit[0] - 1; } else o.push(ws[i]); } return o; }
const CAPS = []; CL.forEach((c0) => { const ws = mergeWords(c0.words); let cur = []; const flush = () => { if (cur.length) CAPS.push({ a: cur[0].a, b: cur[cur.length - 1].b, txt: cur.map(w => w.w).join(' ') }); cur = []; };
  ws.forEach(w => { if (cur.length && (cur.length >= 4 || w.a - cur[cur.length - 1].b > 0.2 || (/^(What|By|And|Like|Every|Within|Your|Phone|But|Tall|So|Hospitals|Big|Food|Then|No|The|Everything|Could|Comment|Hour)/.test(w.w) && cur.length > 1))) flush(); cur.push(w); }); flush(); });
CAPS.forEach((c, i) => { const nx = CAPS[i + 1]; c.b = nx ? Math.min(nx.a, c.b + 0.35) : c.b + 0.8; c.txt = c.txt.replace(/[:\-"]/g, ''); });
function caption(s) { octx.save(); octx.font = '50px Russo'; octx.textAlign = 'center'; octx.textBaseline = 'middle'; const words = s.split(' '); const lines = []; let cur = ''; for (const w of words) { const x = cur ? cur + ' ' + w : w; if (octx.measureText(x).width > 620 && cur) { lines.push(cur); cur = w; } else cur = x; } lines.push(cur);
  const y0 = 1100 - (lines.length - 1) * 31; lines.forEach((l, i) => { octx.lineJoin = 'round'; octx.lineWidth = 12; octx.strokeStyle = 'rgba(10,12,24,0.95)'; octx.strokeText(l, 360, y0 + i * 62); octx.fillStyle = '#fff'; octx.fillText(l, 360, y0 + i * 62); }); octx.restore(); }

let bc, bctx;
window.initFootball = async function () {
  await Promise.all(['30px Russo', '20px PressStart'].map(f => document.fonts.load(f)));
  GLOW = ctex(64, 64, (c, w, h) => { const gr = c.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.3, 'rgba(255,255,255,0.5)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = gr; c.fillRect(0, 0, w, h); });
  glc = document.createElement('canvas'); glc.width = RW; glc.height = RH;
  renderer = new T3.WebGLRenderer({ canvas: glc, antialias: true, preserveDrawingBuffer: true }); renderer.setPixelRatio(1); renderer.setSize(RW, RH, false); renderer.outputColorSpace = T3.SRGBColorSpace;
  renderer.toneMapping = T3.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.15; renderer.shadowMap.enabled = true; renderer.shadowMap.type = T3.PCFSoftShadowMap;
  scene = new T3.Scene(); scene.background = new T3.Color('#000'); camera = new T3.PerspectiveCamera(48, RW / RH, 0.1, 1200);
  buildCity(); buildDoll();
  out = document.getElementById('c'); octx = out.getContext('2d'); bc = document.createElement('canvas'); bc.width = W; bc.height = H; bctx = bc.getContext('2d');
};
window.DURATION = TM.total;
window.renderFrame = function (T) { const ci = CLI(T); const kind = shot(T); renderer.render(scene, camera);
  // miniature look: punchy toy colours + tilt-shift blur bands
  octx.globalCompositeOperation = 'source-over'; octx.filter = 'saturate(1.45) contrast(1.08)'; octx.drawImage(glc, 0, 0, W, H); octx.filter = 'none';
  bctx.globalCompositeOperation = 'source-over'; bctx.filter = 'blur(9px) saturate(1.45) contrast(1.08)'; bctx.drawImage(glc, 0, 0, W, H); bctx.filter = 'none';
  if (kind === 'stars') { octx.drawImage(glc, 0, 0, W, H); } else { const mk = kind === 'doll' ? [0.2, 0.38, 0.66, 0.82] : [0.18, 0.4, 0.62, 0.86]; const gr = bctx.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(mk[0], 'rgba(0,0,0,0.9)'); gr.addColorStop(mk[1], 'rgba(0,0,0,0)'); gr.addColorStop(mk[2], 'rgba(0,0,0,0)'); gr.addColorStop(mk[3], 'rgba(0,0,0,0.9)'); gr.addColorStop(1, 'rgba(0,0,0,1)');
  bctx.globalCompositeOperation = 'destination-in'; bctx.fillStyle = gr; bctx.fillRect(0, 0, W, H); bctx.globalCompositeOperation = 'source-over'; octx.drawImage(bc, 0, 0); }
  const vg = octx.createRadialGradient(360, 640, 450, 360, 640, 950); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.3)'); octx.fillStyle = vg; octx.fillRect(0, 0, W, H);
  // overlays
  if (ci === 0) { if (T < E.by - 0.1) { big('WHAT IF THE POWER', 200, 56, '#fff', prog(T, 0.2, 0.5)); big('WENT OUT', 270, 76, '#ffd25a', prog(T, AT(0, 'went') - 0.1, AT(0, 'went') + 0.2)); big('FOR 24 HOURS', 350, 56, '#ff5a4a', prog(T, E.tw - 0.1, E.tw + 0.2)); }
    else if (T < E.and0 - 0.1) { big('HOUR 6', 230, 80, '#ff5a4a', 1); big('NO WATER', 310, 50, '#fff', prog(T, AT(0, 'dry') - 0.1, AT(0, 'dry') + 0.2)); }
    else if (T < E.like - 0.1) { big('TONIGHT', 230, 80, '#ffd25a', 1); big('SOMETHING RARE', 310, 46, '#fff', prog(T, AT(0, 'something') - 0.1, AT(0, 'something') + 0.2)); }
    else big('WATCH TILL THE END', 260, 52, '#ffd25a', prog(T, AT(0, 'stay') - 0.1, AT(0, 'stay') + 0.2)); }
  hud(T, ci); likePill(T);
  if (ci === 1) { if (T > E.every1 - 0.1 && T < E.traffic - 0.2) big('SCREENS . OFF', 320, 64, '#ff5a4a', prog(T, AT(1, 'black') - 0.2, AT(1, 'black') + 0.1)); if (T > E.traffic) big('TRAFFIC LIGHTS . OFF', 320, 52, '#ff5a4a', prog(T, AT(1, 'stops') - 0.1, AT(1, 'stops') + 0.2)); }
  if (ci === 2) { R.cars.forEach((c_, i) => { if (i % 5) return; const [x, y, z] = proj(c_.position.x, 2.5, c_.position.z); if (z < 1 && (Math.floor(T * 3 + i) % 3 === 0) && T > E.within + 1) { octx.save(); octx.fillStyle = '#ffd25a'; octx.beginPath(); octx.roundRect(x - 50, y - 24, 100, 40, 20); octx.fill(); txt('HONK', x, y - 3, 20, '#1a1008'); octx.restore(); } }); if (T > E.crossing) big('GRIDLOCK', 320, 80, '#ffd25a', prog(T, E.crossing, E.crossing + 0.3)); }
  if (ci === 3) { const b = Math.round(100 * (1 - prog(T, E.towers, CL[4].start) * 0.85)); card(150, 300, 420, 150, prog(T, E.towers - 0.2, E.towers + 0.1)); if (T > E.towers - 0.2) { txt('PHONE TOWER BATTERY', 360, 340, 26, '#1a1a24'); octx.fillStyle = '#d8d8d8'; octx.fillRect(190, 370, 300, 44); octx.fillStyle = b > 50 ? '#3ad88a' : b > 25 ? '#ffb02a' : '#ff4a3a'; octx.fillRect(190, 370, 300 * b / 100, 44); octx.fillStyle = '#d8d8d8'; octx.fillRect(492, 382, 12, 20); txt(`${b}%`, 540, 392, 28, '#1a1a24'); txt(T > E.but3 ? 'ONLY A FEW HOURS' : 'BACKUP POWER', 360, 432, 20, '#ff4a3a', 'center', 'PressStart'); } }
  if (ci === 4) { if (T < E.so4 - 0.2) { card(380, 330, 310, 230, prog(T, E.tall - 0.2, E.tall + 0.1)); if (T > E.tall - 0.2) { txt('PUMP', 535, 370, 28, '#1a1a24'); txt('OFF', 535, 410, 40, '#ff4a3a'); txt('WATER CAN\'T', 535, 470, 22, '#1a1a24'); txt('GO UP', 535, 505, 22, '#1a1a24'); } } else { big('TOP FLOORS', 320, 64, '#fff', prog(T, E.so4, E.so4 + 0.3)); big('NO WATER', 400, 84, '#ff5a4a', prog(T, AT(4, 'dry') - 0.1, AT(4, 'dry') + 0.2)); } }
  if (ci === 5) { if (T < E.your5 - 0.2) { if (T > E.big - 0.1) big('GENERATOR . ON', 320, 60, '#3ad88a', prog(T, E.big - 0.1, E.big + 0.2)); } else { card(170, 300, 380, 170, prog(T, E.food - 0.2, E.food + 0.1)); if (T > E.food - 0.2) { txt('FRIDGE FOOD', 360, 340, 28, '#1a1a24'); txt('SAFE FOR', 360, 380, 22, '#5a5a6a'); const m = Math.max(0, 240 - Math.floor(prog(T, E.food, CL[6].start) * 30)); txt(`${Math.floor(m / 60)}h ${String(m % 60).padStart(2, '0')}m`, 360, 430, 46, '#ff4a3a'); } } }
  if (ci === 6) { if (T > E.no6 - 0.1 && T < E.and6 - 0.3) big('TOTAL DARKNESS', 320, 60, '#fff', prog(T, E.no6 - 0.1, E.no6 + 0.2)); if (T > E.stars - 0.2) big('THE STARS', 320, 84, '#ffd25a', prog(T, E.stars - 0.2, E.stars + 0.1)); }
  if (ci === 7) { if (T < E.and7 - 0.1) big('POWER IS BACK', 320, 70, '#3ad88a', prog(T, E.power7, E.power7 + 0.3));
    else if (T < E.could - 0.1) { const r_ = rng(Math.floor(T * 6)); for (let i = 0; i < 7; i++) { const x = 90 + r_() * 540, y = 300 + r_() * 500; octx.save(); octx.globalAlpha = 0.9; octx.fillStyle = '#fff'; octx.beginPath(); octx.roundRect(x - 60, y - 24, 120, 48, 24); octx.fill(); txt('BEEP!', x, y, 26, '#ff4a3a'); octx.restore(); } }
    else { big('COULD YOU SURVIVE?', 260, 58, '#ffd25a', prog(T, E.could - 0.1, E.could + 0.2)); if (T > E.comment - 0.1) { octx.save(); octx.globalAlpha = prog(T, E.comment - 0.1, E.comment + 0.2); for (const [s, x, col] of [['YES', 240, '#3ad88a'], ['NO', 480, '#ff5a4a']]) { octx.fillStyle = col; octx.beginPath(); octx.roundRect(x - 100, 330, 200, 90, 45); octx.fill(); txt(s, x, 376, 44, '#0a0a10'); } octx.restore(); }
      if (T > E.follow - 0.15) { const k = ease(prog(T, E.follow - 0.15, E.follow + 0.15)); const on = T > E.follow + 0.5; octx.save(); octx.globalAlpha = k; octx.fillStyle = on ? '#3ad88a' : '#ffd25a'; octx.beginPath(); octx.roundRect(200, 470, 320, 84, 42); octx.fill(); txt(on ? 'FOLLOWING ✓' : '+ FOLLOW', 360, 513, 38, '#0a0a10'); octx.restore(); } } }
  const cap = CAPS.find(c => T >= c.a && T < c.b); if (cap) caption(cap.txt);
  if (T > CUT() && T < CUT() + 0.25) { octx.fillStyle = `rgba(0,0,0,${0.6 * (1 - (T - CUT()) / 0.25)})`; octx.fillRect(0, 0, W, H); }
  for (let i = 1; i < CL.length; i++) { const ts = CL[i].start; if (T >= ts && T < ts + 0.12) { octx.fillStyle = `rgba(255,255,255,${0.35 * (1 - (T - ts) / 0.12)})`; octx.fillRect(0, 0, W, H); } }
  if (T < 0.25) { octx.fillStyle = `rgba(0,0,0,${1 - T / 0.25})`; octx.fillRect(0, 0, W, H); }
  if (T > TM.total - 0.6) { octx.fillStyle = `rgba(0,0,0,${prog(T, TM.total - 0.6, TM.total)})`; octx.fillRect(0, 0, W, H); } };
})();
