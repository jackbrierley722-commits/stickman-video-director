// Beat your bro to school (the bike). Stylised-realistic 3D: PBR, soft shadows, env lighting, real proportions.
(() => {
const T3 = THREE; const W = 720, H = 1280, RW = 720, RH = 1280;
const TM = window.TIMING, CL = TM.clips; const S = Math.sin, C = Math.cos, PI = Math.PI;
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), lerp = (a, b, t) => a + (b - a) * t, ease = t => { t = clamp(t); return t * t * (3 - 2 * t); }, prog = (t, a, b) => clamp((t - a) / (b - a));
function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
function AT(ci, word, n = 0) { let k = 0; for (const w of CL[ci].words) if (w.w.toLowerCase().replace(/[^a-z0-9']/g, '') === word) { if (k === n) return w.a; k++; } return CL[ci].start; }
function CLI(T) { let ci = CL.findIndex(c => T >= c.start && T < c.start + c.dur); return ci < 0 ? CL.length - 1 : ci; }
let renderer, scene, camera, out, octx, small, sctx, glc, GRAIN, GLOW, FIRE, SMOKE, SNAP, cubeRT, cubeCam;
const SM = (c, o = {}) => new T3.MeshStandardMaterial(Object.assign({ color: c, roughness: 0.6, metalness: 0 }, o));
const BM = (c, o = {}) => new T3.MeshBasicMaterial(Object.assign({ color: c, toneMapped: false }, o));
function add(p, geo, mat, x = 0, y = 0, z = 0, sh = true) { const m = new T3.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = sh; m.receiveShadow = true; p.add(m); return m; }
const Bx = (w, h, d) => new T3.BoxGeometry(w, h, d), Cy = (a, b, h, n = 20) => new T3.CylinderGeometry(a, b, h, n), Sp = (r, a = 24, b = 18) => new T3.SphereGeometry(r, a, b), Cap = (r, l, s = 12) => new T3.CapsuleGeometry(r, l, 6, s);
function RB(w, h, d, r = 0.04) { const s = new T3.Shape(); const x = -w / 2, y = -h / 2; s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r); s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h); s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r); s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y); const g = new T3.ExtrudeGeometry(s, { depth: d - r * 1.2, bevelEnabled: true, bevelThickness: r * 0.6, bevelSize: r * 0.6, bevelSegments: 4, curveSegments: 6 }); g.translate(0, 0, -(d - r * 1.2) / 2); return g; }
function ctex(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); draw(g, w, h); const t = new T3.CanvasTexture(c); t.colorSpace = T3.SRGBColorSpace; t.anisotropy = 8; t.userData = { g, c }; return t; }
function spr(p, tex, col, size, x, y, z, op, blend = T3.AdditiveBlending) { const s = new T3.Sprite(new T3.SpriteMaterial({ map: tex, color: col, transparent: true, opacity: op, blending: blend, depthWrite: false })); s.scale.set(size, size, 1); s.position.set(x, y, z); p.add(s); return s; }
function look(p, l) { camera.position.set(p[0], p[1], p[2]); camera.lookAt(l[0], l[1], l[2]); }
const L3 = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
const TR = (k, a, b, la, lb) => look(L3(a, b, ease(k)), L3(la, lb, ease(k)));
function noiseTex(w, h, base, spots, seed, rep) { const t = ctex(w, h, (c) => { c.fillStyle = base; c.fillRect(0, 0, w, h); const r = rng(seed); for (const [col, n, sz] of spots) { c.fillStyle = col; for (let i = 0; i < n; i++) c.fillRect(r() * w, r() * h, sz * (0.5 + r()), sz * (0.5 + r())); } }); t.wrapS = t.wrapT = T3.RepeatWrapping; if (rep) t.repeat.set(rep[0], rep[1]); return t; }
function brickTex(col, seed) { const t = ctex(256, 256, (c, w, h) => { c.fillStyle = '#8a8070'; c.fillRect(0, 0, w, h); const r = rng(seed); for (let y = 0; y < h; y += 16) for (let x = ((y / 16) % 2) * 16 - 16; x < w; x += 32) { const v = (r() - 0.5) * 30; c.fillStyle = `rgb(${parseInt(col.slice(1, 3), 16) + v},${parseInt(col.slice(3, 5), 16) + v * 0.6},${parseInt(col.slice(5, 7), 16) + v * 0.5})`; c.fillRect(x + 1, y + 1, 30, 14); } }); t.wrapS = t.wrapT = T3.RepeatWrapping; return t; }
function buildSky() { const st = ctex(16, 512, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#3a6aa8'); g.addColorStop(0.42, '#9ac0e0'); g.addColorStop(0.5, '#dfe8ec'); g.addColorStop(0.53, '#c8c8c0'); g.addColorStop(1, '#8a8a80'); c.fillStyle = g; c.fillRect(0, 0, w, h); });
  R.sky = add(scene, Sp(2500, 32, 16), new T3.MeshBasicMaterial({ map: st, side: T3.BackSide, fog: false, toneMapped: false }), 0, 0, 0, false); R.sky.castShadow = R.sky.receiveShadow = false;
  const clouds = ctex(1024, 256, (c, w, h) => { c.clearRect(0, 0, w, h); const r = rng(40); for (let i = 0; i < 60; i++) { const x = r() * w, y = 60 + r() * 120, rr = 20 + r() * 50; const g = c.createRadialGradient(x, y, 0, x, y, rr); g.addColorStop(0, 'rgba(255,255,255,0.7)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.fillRect(x - rr, y - rr, rr * 2, rr * 2); } });
  const cl = add(scene, new T3.CylinderGeometry(2200, 2200, 900, 32, 1, true), new T3.MeshBasicMaterial({ map: clouds, transparent: true, side: T3.BackSide, fog: false, depthWrite: false, toneMapped: false }), 0, 380, 0, false); cl.castShadow = false;
  R.sun = new T3.DirectionalLight('#fff0d8', 2.6); R.sun.position.set(60, 90, 40); R.sun.castShadow = true; R.sun.shadow.mapSize.set(2048, 2048); const sc = R.sun.shadow.camera; sc.left = sc.bottom = -30; sc.right = sc.top = 30; sc.near = 1; sc.far = 300; R.sun.shadow.bias = -0.0004; scene.add(R.sun); scene.add(R.sun.target);
  R.hemi = new T3.HemisphereLight('#bcd4f0', '#5a5a50', 0.9); scene.add(R.hemi); }
function sunAt(x, y, z) { R.sun.target.position.set(x, y, z); R.sun.position.set(x + 60, y + 90, z + 40); }
const R = {};

// ---------- people (stylised realistic) ----------
function human(o = {}) { const g = new T3.Group(); const skin = SM(o.skin || '#d8a888', { roughness: 0.55 }), top = SM(o.top || '#3a4a6a', { roughness: 0.8 }), bot = SM(o.bot || '#2a2e3a', { roughness: 0.85 }), hairM = SM(o.hair || '#2a1a10', { roughness: 0.75 }), lip = SM(o.lip || '#b06a5a', { roughness: 0.5 });
  const fem = !!o.fem; const up = new T3.Group(); up.position.y = 0.95; g.add(up);
  const prof = (fem ? [[0.13, -0.08], [0.155, 0.0], [0.14, 0.14], [0.13, 0.24], [0.155, 0.36], [0.16, 0.45], [0.14, 0.53], [0.06, 0.58]] : [[0.14, -0.08], [0.16, 0.0], [0.15, 0.14], [0.16, 0.26], [0.185, 0.38], [0.195, 0.47], [0.165, 0.55], [0.06, 0.6]]).map(([r_, y]) => new T3.Vector2(r_, y));
  const torso = add(up, new T3.LatheGeometry(prof, 28), top, 0, 0, 0); torso.scale.z = 0.66; add(up, Sp(0.155), bot, 0, -0.05, 0).scale.set(1, 0.7, 0.72);
  if (o.shirt) add(up, Bx(0.07, 0.42, 0.01), SM(o.shirt), 0, 0.33, 0.118, false); if (o.collar !== false) add(up, new T3.TorusGeometry(0.065, 0.022, 8, 20), top, 0, 0.6, 0.0).rotation.x = PI / 2;
  add(up, Cy(0.048, 0.055, 0.12), skin, 0, 0.63, 0.0);
  const head = new T3.Group(); head.position.set(0, 0.76, 0.0); up.add(head); add(head, Sp(0.1, 32, 24), skin, 0, 0.02, -0.005).scale.set(0.9, 1.1, 1.0); add(head, Sp(0.083, 28, 20), skin, 0, -0.042, 0.016).scale.set(0.86, 0.82, 0.92);
  const nose = add(head, Cap(0.013, 0.028, 10), skin, 0, -0.004, 0.094); nose.rotation.x = 0.35;
  for (const sx of [-1, 1]) { add(head, Sp(0.017, 16, 12), SM('#f4f0ea', { roughness: 0.15 }), sx * 0.034, 0.017, 0.074).scale.set(1, 0.75, 0.6); add(head, new T3.CircleGeometry(0.0085, 16), SM(o.eye || '#4a3020', { roughness: 0.1 }), sx * 0.034, 0.017, 0.0848, false); add(head, new T3.CircleGeometry(0.0042, 12), SM('#0a0a0a', { roughness: 0.05 }), sx * 0.034, 0.017, 0.0852, false);
    const br = add(head, Cap(0.0045, 0.026, 6), hairM, sx * 0.035, 0.04, 0.083, false); br.rotation.z = PI / 2 + sx * 0.12; br.userData.sx = sx; (g.userData.brows = g.userData.brows || []).push(br); add(head, Sp(0.022, 12, 10), skin, sx * 0.093, 0.004, -0.004).scale.set(0.4, 1, 0.65); }
  const mouth = new T3.Group(); mouth.position.set(0, -0.046, 0.083); head.add(mouth); add(mouth, Cap(0.0062, 0.022, 8), lip, 0, 0.004, 0, false).rotation.z = PI / 2; const ll = add(mouth, Cap(0.0068, 0.018, 8), lip, 0, -0.008, -0.001, false); ll.rotation.z = PI / 2;
  if (o.beard) add(head, Sp(0.084, 24, 16, 0, PI * 2, PI * 0.45, PI * 0.55), SM(o.beard, { roughness: 1 }), 0, -0.035, 0.016).scale.set(0.9, 0.95, 0.95);
  // hair
  const hc = add(head, new T3.SphereGeometry(0.107, 32, 18, 0, PI * 2, 0, PI * (fem ? 0.6 : 0.5)), hairM, 0, 0.026, -0.012); hc.scale.set(0.95, 1.08, 1.06); hc.rotation.x = -0.18;
  if (fem) { add(head, Cap(0.095, 0.2, 16), hairM, 0, -0.1, -0.05).scale.set(1.1, 1, 0.55); for (const sx of [-1, 1]) add(head, Cap(0.03, 0.17, 10), hairM, sx * 0.088, -0.07, 0.02); }
  else { for (let k = 0; k < 7; k++) { const a = -0.9 + k * 0.3; add(head, Sp(0.032, 12, 10), hairM, Math.sin(a) * 0.085, 0.085 + Math.cos(a) * 0.01, 0.055 + Math.cos(a) * 0.01).scale.set(1, 0.7, 0.8); } for (const sx of [-1, 1]) add(head, Cap(0.014, 0.045, 6), hairM, sx * 0.093, 0.01, 0.025); }
  if (o.cap) { add(head, Sp(0.112, 24, 12, 0, PI * 2, 0, PI * 0.5), SM(o.cap), 0, 0.035, -0.006).scale.set(0.98, 0.9, 1.05); add(head, Cy(0.08, 0.09, 0.012), SM(o.cap), 0, 0.045, 0.1).scale.z = 0.7; }
  const arm = (sx) => { const s_ = new T3.Group(); s_.position.set(sx * 0.185, 0.5, 0); up.add(s_); add(s_, Sp(0.055), top, 0, 0, 0); add(s_, Cap(0.048, 0.22), top, 0, -0.14, 0); const e = new T3.Group(); e.position.y = -0.29; s_.add(e); add(e, Sp(0.043), top, 0, 0, 0); add(e, Cap(0.04, 0.2), o.short ? skin : top, 0, -0.12, 0); const hnd = new T3.Group(); hnd.position.y = -0.26; e.add(hnd); add(hnd, Cap(0.03, 0.045, 10), skin, 0, -0.03, 0).scale.set(1.15, 1, 0.55); add(hnd, Cap(0.012, 0.03, 6), skin, sx * -0.022, -0.02, 0.012).rotation.z = sx * 0.6; s_.userData.e = e; s_.userData.h = hnd; return s_; };
  const leg = (sx) => { const h = new T3.Group(); h.position.set(sx * 0.085, 0.92, 0); g.add(h); add(h, Cap(0.068, 0.34), bot, 0, -0.22, 0); const k = new T3.Group(); k.position.y = -0.45; h.add(k); add(k, Sp(0.058), bot, 0, 0, 0); add(k, Cap(0.053, 0.34), bot, 0, -0.21, 0); const sh = add(k, Cap(0.048, 0.15), SM(o.shoe || '#1a1a1e', { roughness: 0.45 }), 0, -0.43, 0.05); sh.rotation.x = PI / 2; sh.scale.set(1.05, 1, 0.65); h.userData.k = k; return h; };
  g.userData = { brows: g.userData.brows, up, head, mouth, armL: arm(-1), armR: arm(1), legL: leg(-1), legR: leg(1) }; return g; }
function rest(p) { const u = p.userData; for (const k of ['armL', 'armR', 'legL', 'legR']) { u[k].rotation.set(0, 0, 0); (u[k].userData.e || u[k].userData.k).rotation.set(0, 0, 0); } u.up.rotation.set(0, 0, 0); u.head.rotation.set(0, 0, 0); u.mouth.scale.set(1, 1, 1); u.armL.rotation.z = 0.08; u.armR.rotation.z = -0.08; }
function seatPose(p, seatTop) { rest(p); const u = p.userData; for (const l of [u.legL, u.legR]) { l.rotation.x = -PI / 2 + 0.05; l.userData.k.rotation.x = PI / 2 - 0.05; } u.up.rotation.x = -0.08; p.position.y = seatTop + 0.06 - 0.92; u.armL.rotation.x = -0.55; u.armR.rotation.x = -0.55; u.armL.userData.e.rotation.x = -0.5; u.armR.userData.e.rotation.x = -0.5; }
function walkPose(p, ph, a = 1) { rest(p); const u = p.userData, s = S(ph); u.legL.rotation.x = s * 0.5 * a; u.legR.rotation.x = -s * 0.5 * a; u.legL.userData.k.rotation.x = Math.max(0, -s) * 0.7 * a; u.legR.userData.k.rotation.x = Math.max(0, s) * 0.7 * a; u.armL.rotation.x = -s * 0.4 * a; u.armR.rotation.x = s * 0.4 * a; u.armL.userData.e.rotation.x = -0.25; u.armR.userData.e.rotation.x = -0.25; }
const talk = (p, T, on) => { p.userData.mouth.scale.y = on ? 1 + Math.abs(S(T * 14)) * 1.8 : 1; };


// ===================== PS3 STYLE TOOLKIT: chunky pixel textures, blocky people/cars/dinos, hazy dusk =====================
function PT(w, h, fn) { const t = ctex(w, h, fn); t.magFilter = T3.NearestFilter; t.minFilter = T3.NearestFilter; t.generateMipmaps = false; t.anisotropy = 1; return t; }
const hex = (c) => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
function noisy(c, w, h, col, amt, seed, x0 = 0, y0 = 0) { const r = rng(seed); const [R_, G_, B_] = hex(col); for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) { const v = (r() - 0.5) * amt; c.fillStyle = `rgb(${clamp(R_ + v, 0, 255) | 0},${clamp(G_ + v, 0, 255) | 0},${clamp(B_ + v, 0, 255) | 0})`; c.fillRect(x, y, 1, 1); } }
const LM = (o) => new T3.MeshLambertMaterial(o);
const TXC = new Map(); function nT(col, amt = 26, size = 16, seed = 1) { const k = col + amt + size + seed; if (!TXC.has(k)) TXC.set(k, PT(size, size, (c) => noisy(c, size, size, col, amt, seed))); return TXC.get(k); }
const PM = (col, amt = 26, size = 16, seed = 1) => new T3.MeshStandardMaterial({ color: col, roughness: 0.85, flatShading: true });
function boxM(p, w, h, d, mats, x, y, z, sh = true) { const m = new T3.Mesh(Bx(w, h, d), mats); m.position.set(x, y, z); m.castShadow = sh; m.receiveShadow = true; p.add(m); return m; }
// ---------- blocky people ----------
const OUTFITS = [
  { top: '#3a2c24', open: '#e8e2d6', bot: '#5a6a8a', hair: '#3a2416', skin: '#d8a07c' }, { top: '#2a2a2e', open: '#d8d4cc', bot: '#4a5a72', hair: '#141010', skin: '#6a4430', cap: '#1e2436' },
  { top: '#8a2a24', bot: '#4a5a72', hair: '#3a2416', skin: '#e0ac88', sleeve: '#d8d4cc' }, { top: '#b89a6a', open: '#2a2a2e', bot: '#7a6248', hair: '#4a3020', skin: '#d8a07c', cap: '#b8a070' },
  { top: '#1c1c20', open: '#e8e8e8', bot: '#1c1c20', hair: '#2a1a10', skin: '#e0ac88', tie: '#1c1c20' }, { top: '#e86a1e', bot: '#8a8a82', hair: '#3a2416', skin: '#d8a07c', cap: '#e8c020', vest: 1 },
  { top: '#1e2640', bot: '#1e2640', hair: '#2a1a10', skin: '#e0ac88', cap: '#1a1e30', cop: 1 }, { top: '#9a948c', bot: '#3a3a3e', hair: '#8a847c', skin: '#7a5038', hood: 1 }];
function faceTex(o, ex = 'n') { return PT(16, 16, (c) => { noisy(c, 16, 16, o.skin, 18, 3); noisy(c, 16, 5, o.cap || o.hair, 20, 4); if (!o.cap) noisy(c, 2, 9, o.hair, 20, 5); if (o.hood) { noisy(c, 2, 16, o.top, 20, 6); noisy(c, 2, 16, o.top, 20, 6, 14); }
  c.fillStyle = '#f0ece4'; c.fillRect(4, 8, 3, ex === 'o' ? 2 : 1); c.fillRect(9, 8, 3, ex === 'o' ? 2 : 1); c.fillStyle = '#4a5a7a'; const px = ex === 's' ? 1 : ex === 'S' ? -1 : 0; c.fillRect(5 + px, 8, 1, 1); c.fillRect(10 + px, 8, 1, 1);
  c.fillStyle = 'rgba(40,20,10,0.75)'; if (ex === 'a' || ex === 'o') { c.fillRect(4, 6, 1, 1); c.fillRect(5, 7, 2, 1); c.fillRect(11, 6, 1, 1); c.fillRect(9, 7, 2, 1); } else if (ex === 's' || ex === 'S') { c.fillRect(4, 6, 3, 1); c.fillRect(9, 7, 3, 1); } else { c.fillRect(4, 7, 3, 1); c.fillRect(9, 7, 3, 1); }
  if (ex === 'o') { c.fillStyle = '#3a1010'; c.fillRect(5, 11, 6, 3); c.fillStyle = '#e8e0d8'; c.fillRect(5, 11, 6, 1); } else if (ex === 's' || ex === 'S') { c.fillStyle = 'rgba(80,40,30,0.7)'; c.fillRect(6, 12, 4, 1); c.fillRect(10, 11, 1, 1); } else if (ex === 'd') { c.fillStyle = 'rgba(80,40,30,0.7)'; c.fillRect(6, 12, 5, 1); } else { c.fillStyle = 'rgba(80,40,30,0.5)'; c.fillRect(6, 12, 4, 1); } c.fillStyle = 'rgba(0,0,0,0.15)'; c.fillRect(7, 9, 2, 2); }); }
function torsoTex(o) { return PT(16, 16, (c) => { noisy(c, 16, 16, o.top, 24, 7); if (o.open) { noisy(c, 6, 16, o.open, 14, 8, 5); } if (o.tie) noisy(c, 2, 13, o.tie, 10, 9, 7); if (o.vest) { c.fillStyle = '#d8d8c8'; c.fillRect(0, 9, 16, 2); c.fillRect(4, 0, 2, 16); c.fillRect(10, 0, 2, 16); } if (o.cop) { c.fillStyle = '#c8a040'; c.fillRect(3, 4, 2, 2); c.fillStyle = '#111'; c.fillRect(0, 14, 16, 2); } if (o.hood) { c.fillStyle = 'rgba(0,0,0,0.2)'; c.fillRect(4, 9, 8, 4); } }); }
function person(o) { const g = new T3.Group(); const skin = PM(o.skin, 16, 8, 2), top = PM(o.top, 24, 8, 3), bot = PM(o.bot, 26, 8, 4), hair = PM(o.cap || o.hair, 20, 8, 5), shoe = PM('#2a2420', 16, 8, 6), sleeve = PM(o.sleeve || o.top, 22, 8, 7);
  const up = new T3.Group(); up.position.y = 0.95; g.add(up); boxM(up, 0.5, 0.62, 0.28, [top, top, top, top, LM({ map: torsoTex(o) }), top], 0, 0.31, 0);
  const head = new T3.Group(); head.position.y = 0.66; up.add(head); const FX = {}; for (const ex of ['n', 'o', 'a', 's', 'S', 'd']) FX[ex] = LM({ map: faceTex(o, ex) }); const hm = boxM(head, 0.32, 0.34, 0.32, [skin, skin, hair, skin, FX.n, hair], 0, 0.17, 0); g.userData_fx = { hm, FX }; if (o.cap) boxM(head, 0.34, 0.08, 0.36, hair, 0, 0.32, 0.03); if (o.capBack) boxM(head, 0.2, 0.04, 0.14, hair, 0, 0.31, -0.2);
  if (o.long) { const lh = PM(o.hair, 20, 8, 12); boxM(head, 0.34, 0.42, 0.1, lh, 0, 0.05, -0.15); for (const sx of [-1, 1]) boxM(head, 0.05, 0.3, 0.2, lh, sx * 0.17, 0.1, -0.06); }
  if (o.pony) boxM(head, 0.1, 0.28, 0.1, PM(o.hair, 20, 8, 13), 0, 0.12, -0.21);
  if (o.beanie) { const bn = PM(o.beanie, 22, 8, 14); boxM(head, 0.35, 0.14, 0.35, bn, 0, 0.36, 0); boxM(head, 0.36, 0.05, 0.36, PM(o.beanie, 12, 8, 15), 0, 0.29, 0); }
  if (o.glasses) { const gm = PM('#1a1a1a', 6, 8, 16); for (const sx of [-1, 1]) { const cx = sx * 0.075; boxM(head, 0.11, 0.014, 0.02, gm, cx, 0.205, 0.166, false); boxM(head, 0.11, 0.014, 0.02, gm, cx, 0.135, 0.166, false); boxM(head, 0.014, 0.07, 0.02, gm, cx - 0.048, 0.17, 0.166, false); boxM(head, 0.014, 0.07, 0.02, gm, cx + 0.048, 0.17, 0.166, false); } boxM(head, 0.05, 0.012, 0.02, gm, 0, 0.19, 0.166, false); }
  if (o.phones) { const hp = PM(o.phones, 10, 8, 17); boxM(head, 0.38, 0.04, 0.06, hp, 0, 0.36, 0); for (const sx of [-1, 1]) boxM(head, 0.06, 0.12, 0.12, hp, sx * 0.19, 0.17, 0); }
  if (o.chain) boxM(up, 0.3, 0.04, 0.02, LM({ color: '#e8c040', emissive: '#6a5000', emissiveIntensity: 0.4 }), 0, 0.5, 0.15, false);
  if (o.build) up.scale.set(o.build, 1, o.build);
  const arm = (sx) => { const s = new T3.Group(); s.position.set(sx * 0.33, 0.58, 0); up.add(s); boxM(s, 0.16, 0.34, 0.18, sleeve, 0, -0.17, 0); const e = new T3.Group(); e.position.y = -0.34; s.add(e); boxM(e, 0.15, 0.3, 0.17, o.sleeve ? sleeve : top, 0, -0.13, 0); boxM(e, 0.14, 0.1, 0.15, skin, 0, -0.32, 0); s.userData.e = e; return s; };
  const leg = (sx) => { const h = new T3.Group(); h.position.set(sx * 0.13, 0.95, 0); g.add(h); boxM(h, 0.22, 0.46, 0.24, bot, 0, -0.23, 0); const k = new T3.Group(); k.position.y = -0.46; h.add(k); boxM(k, 0.21, 0.42, 0.23, bot, 0, -0.21, 0); boxM(k, 0.22, 0.08, 0.32, shoe, 0, -0.45, 0.04); h.userData.k = k; return h; };
  g.userData = { up, head, armL: arm(-1), armR: arm(1), legL: leg(-1), legR: leg(1), hm, FX }; return g; }
function faceP(p, ex) { const u = p.userData; if (u.hm.material[4] !== u.FX[ex]) { u.hm.material[4] = u.FX[ex]; } }
function seatP(p, y) { stillP(p); const u = p.userData; u.legL.rotation.x = u.legR.rotation.x = -PI / 2; u.legL.userData.k.rotation.x = u.legR.userData.k.rotation.x = PI / 2; p.position.y = y - 0.95 + 0.06; }
function walkP(p, ph, a = 1, run = 0) { const u = p.userData, s = S(ph); u.legL.rotation.x = s * 0.55 * a; u.legR.rotation.x = -s * 0.55 * a; u.legL.userData.k.rotation.x = Math.max(0, -s) * 0.7 * a; u.legR.userData.k.rotation.x = Math.max(0, s) * 0.7 * a; u.armL.rotation.x = -s * 0.45 * a; u.armR.rotation.x = s * 0.45 * a; u.armL.userData.e.rotation.x = run ? -1.2 : -0.15; u.armR.userData.e.rotation.x = run ? -1.2 : -0.15; u.up.rotation.x = run ? 0.25 : 0; }
function stillP(p) { const u = p.userData; for (const k of ['armL', 'armR', 'legL', 'legR']) { u[k].rotation.set(0, 0, 0); (u[k].userData.e || u[k].userData.k).rotation.set(0, 0, 0); } u.up.rotation.set(0, 0, 0); u.head.rotation.set(0, 0, 0); }
// ---------- blocky cars ----------
function carTex(col, kind) { return PT(32, 16, (c) => { noisy(c, 32, 16, col, 18, 11); c.fillStyle = 'rgba(0,0,0,0.35)'; c.fillRect(13, 2, 1, 12); c.fillRect(22, 2, 1, 12); c.fillRect(0, 13, 32, 3); if (kind === 'police') { noisy(c, 32, 8, '#e8e8e8', 10, 12, 0, 3); c.fillStyle = '#111'; c.font = '7px monospace'; c.fillText('POLICE', 4, 10); } if (kind === 'taxi') { for (let x = 0; x < 32; x += 2) { c.fillStyle = (x / 2) % 2 ? '#111' : '#e8c020'; c.fillRect(x, 7, 2, 1); c.fillStyle = (x / 2) % 2 ? '#e8c020' : '#111'; c.fillRect(x, 8, 2, 1); } } }); }
function glassTex() { return PT(16, 8, (c) => { noisy(c, 16, 8, '#2a2e36', 14, 13); c.fillStyle = 'rgba(160,170,190,0.25)'; c.fillRect(2, 1, 3, 2); c.fillStyle = '#3a3e46'; c.fillRect(7, 0, 1, 8); }); }
const CARS = [['#8a8a88', ''], ['#7a2a22', ''], ['#d8b020', 'taxi'], ['#e8e8e8', 'police'], ['#3a4a8a', ''], ['#5a5a3a', ''], ['#c8c8c4', ''], ['#6a2a22', '']];
function car(ci) { const [col, kind] = CARS[ci % CARS.length]; const g = new T3.Group(); const body = PM(col, 18, 16, 20 + ci), side = LM({ map: carTex(col, kind) }), gl = LM({ map: glassTex() }), dark = PM('#1a1a1c', 10, 8, 21), lightM = LM({ color: '#fff0c8', emissive: '#ffd890', emissiveIntensity: 1.2 }), tail = LM({ color: '#a01010', emissive: '#ff3020', emissiveIntensity: 1.2 });
  boxM(g, 1.9, 0.62, 4.3, [side, side, body, dark, body, body], 0, 0.62, 0); boxM(g, 1.7, 0.6, 2.2, [gl, gl, body, dark, gl, gl], 0, 1.22, -0.2); boxM(g, 1.92, 0.2, 4.35, dark, 0, 0.36, 0);
  for (const [x, z] of [[-0.85, 1.35], [0.85, 1.35], [-0.85, -1.35], [0.85, -1.35]]) boxM(g, 0.3, 0.62, 0.62, dark, x, 0.31, z);
  for (const x of [-0.65, 0.65]) { boxM(g, 0.4, 0.16, 0.06, lightM, x, 0.74, 2.16, false); boxM(g, 0.4, 0.16, 0.06, tail, x, 0.74, -2.16, false); }
  if (kind === 'taxi') boxM(g, 0.6, 0.22, 0.3, PM('#e8c020', 10, 8, 22), 0, 1.62, -0.2); if (kind === 'police') { g.userData.lb = [boxM(g, 0.4, 0.14, 0.3, LM({ color: '#2040ff', emissive: '#2040ff', emissiveIntensity: 1 }), -0.25, 1.6, -0.2, false), boxM(g, 0.4, 0.14, 0.3, LM({ color: '#ff2020', emissive: '#ff2020', emissiveIntensity: 1 }), 0.25, 1.6, -0.2, false)]; }
  return g; }
// ---------- city pieces ----------
function winTexP(base, lit, seed, cols = 8, rows = 16) { return PT(cols * 4, rows * 4, (c, w, h) => { noisy(c, w, h, base, 22, seed); const r = rng(seed + 1); for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) { const on = r() < lit; c.fillStyle = on ? (r() < 0.5 ? '#e8c890' : '#d8b070') : (r() < 0.5 ? '#2a2e3a' : '#3a3e4a'); c.fillRect(x * 4 + 1, y * 4 + 1, 2, 2); } }); }
function tower(p, x, z, w, h, d, base, lit, seed) { const t = winTexP(base, lit, seed); t.wrapS = t.wrapT = T3.RepeatWrapping; t.repeat.set(Math.max(1, w / 8), Math.max(1, h / 16)); const m = LM({ map: t }); const top = PM(base, 20, 16, seed + 3); boxM(p, w, h, d, [m, m, top, top, m, m], x, h / 2, z, false); return h; }
function palm(p, x, z, h, seed) { const r = rng(seed); const tr = PM('#5a4432', 26, 8, seed); let y = 0; for (let i = 0; i < Math.round(h / 0.9); i++) { boxM(p, 0.36, 0.92, 0.36, tr, x + S(i * 0.4) * 0.12 * i * 0.2, y + 0.45, z, false); y += 0.9; } const lf = PM('#4a5a2a', 30, 8, seed + 1);
  for (let k = 0; k < 7; k++) { const a = k / 7 * PI * 2 + r(); const f = new T3.Group(); f.position.set(x, y, z); f.rotation.y = a; p.add(f); boxM(f, 0.5, 0.12, 2.2, lf, 0, -0.2, 1.0, false).rotation.x = 0.45; boxM(f, 0.45, 0.1, 1.2, lf, 0, -0.85, 2.3, false).rotation.x = 0.9; } }
function lampP(p, x, z, side) { const m = PM('#2a2a2e', 12, 8, 30); boxM(p, 0.18, 6, 0.18, m, x, 3, z, false); boxM(p, 1.4, 0.14, 0.18, m, x + side * 0.65, 6, z, false); boxM(p, 0.45, 0.14, 0.3, LM({ color: '#fff0c8', emissive: '#ffd890', emissiveIntensity: 0.6 }), x + side * 1.25, 5.9, z, false); }

// ===================== ROUND-HEAD LOW-POLY CHARACTERS (flat-shaded, dot eyes, bar brows) =====================
const FS = (c) => new T3.MeshStandardMaterial({ color: c, roughness: 0.82, flatShading: true });
const INKM = new T3.MeshBasicMaterial({ color: '#141414' });
function onHead(head, R0, x, y, mesh) { const z = Math.sqrt(Math.max(0, R0 * R0 - x * x - y * y)) + 0.004; mesh.position.set(x, y, z); mesh.lookAt(x * 3, y * 3, z * 3 + 0.0001); head.add(mesh); return mesh; }
function person(o) { const g = new T3.Group(); const skin = FS('#ffffff'), top = FS(o.top), bot = FS(o.bot), shoe = FS('#2a2622'), hairM = FS(o.cap || o.hair);
  const up = new T3.Group(); up.position.y = 0.92; g.add(up); const tor = boxM(up, 0.44, 0.52, 0.26, top, 0, 0.27, 0); boxM(up, 0.4, 0.06, 0.24, top, 0, 0.53, 0);
  if (o.open) boxM(up, 0.12, 0.44, 0.01, FS(o.open), 0, 0.3, 0.131, false); if (o.tie) boxM(up, 0.05, 0.36, 0.012, FS(o.tie), 0, 0.3, 0.138, false);
  add(up, Cy(0.06, 0.07, 0.12, 8), skin, 0, 0.6, 0);
  const R0 = 0.27, head = new T3.Group(); head.position.set(0, 0.86, 0); up.add(head); add(head, new T3.SphereGeometry(R0, 12, 9), skin, 0, 0, 0);
  // hair styles
  if (o.cap) { add(head, new T3.SphereGeometry(R0 + 0.012, 12, 6, 0, PI * 2, 0, PI * 0.42), hairM, 0, 0, 0); const br = add(head, Bx(0.28, 0.025, 0.2), hairM, 0, 0.12, o.capBack ? -0.3 : 0.3); }
  else if (o.beanie) { add(head, new T3.SphereGeometry(R0 + 0.015, 12, 6, 0, PI * 2, 0, PI * 0.45), FS(o.beanie), 0, 0, 0); }
  else if (o.hair) { // messy hair: a clump of jagged low-poly tufts over the crown
    const r = rng((o.hair.charCodeAt(1) * 31 + o.top.charCodeAt(2) * 7) | 0); for (let i = 0; i < 22; i++) { const a = r() * PI * 2, el = 0.6 + r() * 0.9; const n = new T3.Vector3(Math.cos(a) * Math.cos(el), Math.sin(el), Math.sin(a) * Math.cos(el) - 0.25).normalize(); if (n.z > 0.55 && n.y < 0.75) continue;
      const tuft = add(head, new T3.ConeGeometry(0.07 + r() * 0.03, 0.09 + r() * 0.06, 4), hairM, n.x * (R0 - 0.01), n.y * (R0 - 0.01), n.z * (R0 - 0.01)); tuft.quaternion.setFromUnitVectors(new T3.Vector3(0, 1, 0), n); tuft.rotateX((r() - 0.5) * 0.7); tuft.rotateZ((r() - 0.5) * 0.7); }
    add(head, new T3.SphereGeometry(R0 + 0.012, 12, 6, 0, PI * 2, 0, PI * 0.4), hairM, 0, 0, -0.01).rotation.x = -0.35; }
  if (o.phones) { const hp = FS(o.phones); add(head, new T3.TorusGeometry(R0 + 0.03, 0.018, 6, 16, PI), hp, 0, 0.0, 0).rotation.z = 0; for (const sx of [-1, 1]) add(head, Cy(0.07, 0.07, 0.05, 10), hp, sx * (R0 + 0.02), 0, 0).rotation.z = PI / 2; }
  if (o.chain) add(up, new T3.TorusGeometry(0.11, 0.015, 6, 16), FS('#e8c040'), 0, 0.5, 0.06).rotation.x = 1.3;
  // face: dot eyes, bar brows, line mouth (+ open mouth for shouting)
  const F = { eyes: [], pup: [], brows: [], mouth: null, open: null }; for (const sx of [-1, 1]) { const e = onHead(head, R0, sx * 0.085, 0.02, new T3.Mesh(new T3.CircleGeometry(0.03, 14), INKM)); e.scale.y = 1.25; F.eyes.push(e); const b = onHead(head, R0, sx * 0.09, 0.12, new T3.Mesh(Bx(0.1, 0.018, 0.01), INKM)); b.userData.sx = sx; F.brows.push(b); }
  F.mouth = onHead(head, R0, 0.0, -0.1, new T3.Mesh(Bx(0.1, 0.016, 0.01), INKM)); F.smile = onHead(head, R0, 0.0, -0.085, new T3.Mesh(new T3.TorusGeometry(0.055, 0.01, 6, 14, PI), INKM)); F.smile.rotateZ(PI); F.smile.visible = false; F.frown = onHead(head, R0, 0.0, -0.13, new T3.Mesh(new T3.TorusGeometry(0.05, 0.01, 6, 14, PI), INKM)); F.frown.visible = false; F.open = onHead(head, R0, 0.0, -0.11, new T3.Mesh(new T3.CircleGeometry(0.05, 14), new T3.MeshBasicMaterial({ color: '#3a1010' }))); F.open.scale.set(1.1, 0.8, 1); F.open.visible = false;
  if (o.glasses) { for (const sx of [-1, 1]) onHead(head, R0, sx * 0.085, 0.02, new T3.Mesh(new T3.TorusGeometry(0.055, 0.008, 6, 18), INKM)); onHead(head, R0, 0, 0.03, new T3.Mesh(Bx(0.06, 0.01, 0.01), INKM)); }
  if (o.build) up.scale.set(o.build, 1, o.build);
  const arm = (sx) => { const s = new T3.Group(); s.position.set(sx * 0.26, 0.48, 0); up.add(s); boxM(s, 0.15, 0.2, 0.17, top, 0, -0.07, 0); boxM(s, 0.1, 0.22, 0.11, skin, 0, -0.26, 0); const e = new T3.Group(); e.position.y = -0.36; s.add(e); boxM(e, 0.095, 0.26, 0.1, skin, 0, -0.12, 0); boxM(e, 0.1, 0.09, 0.1, skin, 0, -0.29, 0); s.userData.e = e; return s; };
  const leg = (sx) => { const h = new T3.Group(); h.position.set(sx * 0.11, 0.92, 0); g.add(h); boxM(h, 0.17, 0.46, 0.2, bot, 0, -0.23, 0); const k = new T3.Group(); k.position.y = -0.46; h.add(k); boxM(k, 0.16, 0.4, 0.19, bot, 0, -0.2, 0); boxM(k, 0.17, 0.08, 0.27, shoe, 0, -0.42, 0.04); h.userData.k = k; return h; };
  g.userData = { up, head, armL: arm(-1), armR: arm(1), legL: leg(-1), legR: leg(1), F }; return g; }
function faceP(p, ex) { const F = p.userData.F; const br = F.brows; F.open.visible = ex === 'o'; F.smile.visible = ex === 'h'; F.frown.visible = ex === 'f'; F.mouth.visible = !['o', 'h', 'f'].includes(ex); F.mouth.scale.set(1, 1, 1); F.eyes.forEach(e => { e.scale.set(1, ex === 'd' ? 0.7 : 1.25, 1); });
  br.forEach(b => { b.rotation.z = 0; b.position.y = b.userData.y0 === undefined ? (b.userData.y0 = b.position.y) : b.userData.y0; });
  if (ex === 'a' || ex === 'o') br.forEach(b => b.rotation.z = b.userData.sx * 0.35);
  if (ex === 's' || ex === 'S') { br.forEach(b => { if (b.userData.sx === (ex === 's' ? 1 : -1)) b.position.y = b.userData.y0 + 0.03; }); F.mouth.scale.set(0.7, 1, 1); }
  if (ex === 'd') br.forEach(b => b.position.y = b.userData.y0 - 0.015); if (ex === 'f') br.forEach(b => b.rotation.z = -b.userData.sx * 0.3); if (ex === 'h') br.forEach(b => b.position.y = b.userData.y0 + 0.015); }
function seatP(p, y) { stillP(p); const u = p.userData; u.legL.rotation.x = u.legR.rotation.x = -PI / 2; u.legL.userData.k.rotation.x = u.legR.userData.k.rotation.x = PI / 2; p.position.y = y - 0.92 + 0.06; }

// ---------- timing ----------
const E = { bro0: AT(0, 'and'), jacket: AT(1, 'jacket'), clever: AT(1, 'clever'), much3: AT(3, 'much'), bin: AT(4, 'bin'), much5: AT(5, 'much'), sw: AT(6, 'they'), past: AT(7, 'walks'), she: AT(7, 'she'), charger: AT(7, 'charger') };
for (let i = 0; i < CL.length; i++) E['c' + i] = CL[i].start; E.loop = TM.total - 0.4;
function heartTex() { return ctex(64, 64, (c) => { c.fillStyle = '#ff4a7a'; c.beginPath(); c.moveTo(32, 54); c.bezierCurveTo(4, 34, 10, 8, 32, 20); c.bezierCurveTo(54, 8, 60, 34, 32, 54); c.fill(); c.strokeStyle = '#111'; c.lineWidth = 3; c.stroke(); }); }
function signTex(t, bg) { return ctex(160, 90, (c) => { c.fillStyle = bg; c.fillRect(0, 0, 160, 90); c.strokeStyle = '#111'; c.lineWidth = 6; c.strokeRect(3, 3, 154, 84); c.fillStyle = '#111'; c.font = '46px Russo'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(t, 80, 48); }); }
function build() {
  R.sun = new T3.DirectionalLight('#fff4e4', 2.3); R.sun.position.set(6, 12, 8); R.sun.castShadow = true; R.sun.shadow.mapSize.set(2048, 2048); const sc = R.sun.shadow.camera; sc.left = sc.bottom = -14; sc.right = sc.top = 14; sc.near = 1; sc.far = 50; R.sun.shadow.bias = -0.0005; scene.add(R.sun); scene.add(R.sun.target);
  R.hemi = new T3.HemisphereLight('#dceeff', '#8a8a70', 1.4); scene.add(R.hemi);
  const sky = ctex(16, 512, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#6ab4f0'); g.addColorStop(0.6, '#cfe8fa'); g.addColorStop(1, '#eef4e8'); c.fillStyle = g; c.fillRect(0, 0, w, h); }); add(scene, Sp(600, 32, 16), new T3.MeshBasicMaterial({ map: sky, side: T3.BackSide, toneMapped: false }), 0, 0, 0, false).castShadow = false;
  const G = R.G = new T3.Group(); scene.add(G); add(G, Bx(80, 0.2, 40), FS('#9ac86a'), 10, -0.1, 0, false); add(G, Bx(80, 0.21, 4), FS('#c8c0b0'), 10, -0.095, 0.3, false); add(G, Bx(80, 0.22, 5), FS('#5a5a62'), 10, -0.09, 5.2, false); for (let x = -20; x < 40; x += 3) add(G, Bx(1.5, 0.23, 0.15), FS('#f0f0e8'), x, -0.085, 5.2, false);
  const sc_ = ['#e8a87a', '#8ac0d8', '#e8d07a', '#c89ae8', '#9ad8a8', '#f0a0a8']; for (let i = 0; i < 9; i++) { const x = -10 + i * 5.2, h = 3.5 + (i % 3) * 1.2; add(G, Bx(5, h, 3), FS(sc_[i % 6]), x, h / 2, -3.4); add(G, Bx(3.2, 1.4, 0.1), FS('#cfe8f4'), x, 1.2, -1.88); add(G, Bx(1.0, 1.8, 0.1), FS('#7a5a3a'), x + 1.9, 0.9, -1.88); add(G, Bx(5.1, 0.25, 0.8), FS(['#d83a3a', '#3a8ad8', '#3aa85a'][i % 3]), x, 2.2, -1.6); }
  for (let i = 0; i < 7; i++) { const x = -8 + i * 7; add(G, Cy(0.12, 0.15, 1.6, 6), FS('#8a6040'), x, 0.8, 1.9); add(G, new T3.IcosahedronGeometry(0.9, 0), FS('#4aa04a'), x, 2.2, 1.9); }
  R.bin = new T3.Group(); R.bin.position.set(4.6, 0, 0.4); G.add(R.bin); add(R.bin, Cy(0.28, 0.24, 0.8, 10), FS('#3a7a4a'), 0, 0.4, 0); add(R.bin, Cy(0.31, 0.31, 0.06, 10), FS('#2a5a3a'), 0, 0.82, 0);
  add(G, Bx(1.8, 0.08, 0.5), FS('#a8784a'), -2.6, 0.45, -0.8); for (const x of [-3.3, -1.9]) add(G, Bx(0.08, 0.45, 0.4), FS('#555'), x, 0.22, -0.8);
  R.tumble = add(G, new T3.IcosahedronGeometry(0.35, 1), new T3.MeshStandardMaterial({ color: '#a8885a', wireframe: true }), 0, 0.35, -0.6, false);
  // people: you, bro, five girls, three paid fans (all white, messy hair)
  R.you = person({ top: '#3a5aa8', bot: '#2a3242', hair: '#3a2416' }); G.add(R.you); R.bro = person({ top: '#3a9a4a', bot: '#3a3a40', hair: '#141010', cap: '#d83a3a', capBack: 1, build: 1.12 }); G.add(R.bro);
  R.jacket = new T3.Group(); G.add(R.jacket); add(R.jacket, Bx(0.5, 0.56, 0.3), FS('#6a4028'), 0, 0.28, 0); for (const sx of [-1, 1]) add(R.jacket, Bx(0.17, 0.24, 0.19), FS('#6a4028'), sx * 0.26, 0.4, 0);
  const gc = [['#e86aa8', '#3a3a5a', '#e8c870'], ['#c87ae8', '#2a2a3a', '#8a4a1a'], ['#f0a050', '#3a4a6a', '#141010'], ['#5ac8c8', '#4a3a5a', '#c84a1a'], ['#e8e8f0', '#d84a6a', '#5a3a1a']];
  R.girls = gc.map(([t_, b_, h_], i) => { const p = person({ top: t_, bot: b_, hair: h_ }); G.add(p); return p; });
  R.fans = []; for (let i = 0; i < 3; i++) { const p = person({ top: ['#8a8a92', '#c8a050', '#6a8ac8'][i], bot: '#3a3a40', hair: ['#3a2416', '#141010', '#8a6a3a'][i] }); G.add(p); const sg = new T3.Group(); p.userData.armR.userData.e.add(sg); sg.position.set(0, -0.32, 0.05); add(sg, Bx(0.03, 0.6, 0.03), FS('#8a6040'), 0, 0.15, 0); const mk = (t_, bg) => { const s = new T3.Sprite(new T3.SpriteMaterial({ map: signTex(t_, bg) })); s.scale.set(0.62, 0.36, 1); G.add(s); return s; }; p.userData.sA = mk('BRO!', '#ffd23a'); p.userData.sB = mk('YOU!', '#ff8ab0'); R.fans.push(p); }
  R.charger = new T3.Group(); G.add(R.charger); add(R.charger, Bx(0.1, 0.08, 0.06), FS('#f4f4f4'), 0, 0, 0); add(R.charger, Cy(0.008, 0.008, 0.4, 6), FS('#f4f4f4'), 0, -0.2, 0);
  const ht = heartTex(); R.hearts = []; for (let i = 0; i < 12; i++) { const s = new T3.Sprite(new T3.SpriteMaterial({ map: ht, transparent: true })); s.scale.setScalar(0.25); G.add(s); R.hearts.push(s); }
}

function attach(obj, parent, x, y, z) { if (obj.parent !== parent) parent.add(obj); obj.position.set(x, y, z); obj.rotation.set(0, 0, 0); }
const YOU0 = [0, 0, 0.2], BRO0 = [3.4, 0, 0.3];
function around(cx, cz, T, k = 1) { R.girls.forEach((g, i) => { if (g.userData.busy) return; const a = PI * 0.95 + i * PI * 0.275; g.position.set(cx + Math.cos(a) * 0.8 * k, 0, cz + Math.sin(a) * 0.55 * k); g.rotation.y = Math.atan2(cx - g.position.x, cz - g.position.z); faceP(g, 'h'); g.userData.armL.rotation.x = -0.4 + 0.15 * S(T * 4 + i); g.userData.up.rotation.z = 0.06 * S(T * 3 + i); }); }
function camAt(T) { const ci = CLI(T), k = prog(T, CL[ci].start, CL[ci].start + CL[ci].dur); const y = R.you.position, b = R.bro.position;
  if (ci === 0) return [L3([1.6, 2.0, 9.4], [1.6, 1.9, 8.6], ease(k)), [1.6, 1.15, 0]];
  if (ci === 1) return [[1.7, 1.55, 4.0], [1.9, 1.15, 0.2]];
  if (ci === 2) return [[1.6, 1.8, 6.0], [1.7, 1.0, 0]];
  if (ci === 3) return [[y.x + 0.6, 1.55, 4.2], [y.x + 0.3, 1.05, 0.2]];
  if (ci === 4) return [[3.0, 1.35, 3.8], [4.0, 0.6, 0.3]];
  if (ci === 5) return [[b.x - 0.4, 1.9, 5.6], [b.x - 0.7, 1.35, 0.3]];
  if (ci === 6) return [L3([4.0, 1.8, 5.4], [1.5, 1.8, 5.8], ease(k)), [L3([4.2, 1.0, 0.3], [0.8, 1.0, 0.2], ease(k))[0], 1.0, 0.25]];
  if (ci === 7) { const g = R.girls[4].position; return T < E.she - 0.1 ? [[g.x + 0.2, 1.6, 4.6], [g.x + 0.6, 1.05, 0.3]] : [[b.x - 0.7, 1.45, 3.0], [b.x - 0.35, 1.2, 0.3]]; }
  return [L3([2.4, 2.1, 7.6], [2.4, 2.3, 8.2], ease(k)), [2.6, 1.0, 0]]; }
function anim(T) { const ci = CLI(T), you = R.you, bro = R.bro, u = you.userData, b = bro.userData; stillP(you); stillP(bro); you.position.set(...YOU0); you.rotation.set(0, 0, 0); bro.position.set(...BRO0); bro.rotation.set(0, -0.2, 0); faceP(you, 'h'); faceP(bro, 'f');
  R.girls.forEach(g => { stillP(g); g.userData.busy = false; g.visible = true; }); R.fans.forEach(f => { stillP(f); f.visible = false; f.userData.sA.visible = f.userData.sB.visible = false; }); R.bin.rotation.set(0, 0, 0); R.bin.position.set(4.6, 0, 0.4); R.charger.visible = false;
  // tumbleweed rolls past lonely bro
  const tw = (ci === 0 || ci === 8); R.tumble.visible = tw; if (tw) { const k = prog(T, CL[ci].start, CL[ci].start + CL[ci].dur); R.tumble.position.set(lerp(9, 1, k), 0.35 + 0.12 * Math.abs(S(T * 7)), -0.4); R.tumble.rotation.z = T * 6; }
  // jacket: on you, handed over, then carried off by the girls
  if (ci === 0) attach(R.jacket, u.up, 0, 0, 0);
  if (ci === 1) { const w = ease(prog(T, CL[1].start, E.jacket - 0.2)); you.position.set(lerp(0, 2.6, w), 0, 0.25); you.rotation.y = w < 1 ? PI / 2 : PI / 2 - 0.3; if (w < 1) walkP(you, T * 8, 1); if (T < E.jacket) attach(R.jacket, u.armR.userData.e, 0, -0.3, 0.14); else attach(R.jacket, b.up, 0, 0, 0); u.armR.rotation.x = -1.2; bro.rotation.y = -1.2; faceP(bro, T > E.jacket ? 'h' : 'f'); if (T > E.clever - 0.15) faceP(you, 's'); }
  around(ci === 1 ? lerp(0, 1.8, prog(T, CL[1].start, E.jacket)) : 0, 0.2, T);
  if (ci === 2) { you.position.set(2.6, 0, 0.25); you.rotation.y = PI / 2 - 0.3; faceP(you, 'd'); const g = R.girls[0], k = prog(T, CL[2].start, CL[2].start + 1.0), back = prog(T, E.c2 + 1.2, E.c3); R.girls.forEach((q, i) => { q.userData.busy = true; const tx = lerp(BRO0[0] - 0.6 + i * 0.12, -0.4 + i * 0.35, ease(back)); q.position.set(lerp(q.position.x || 0, tx, ease(k)), 0, 0.6 + (i % 2) * 0.3); q.rotation.y = back > 0 ? -PI / 2 : PI / 2; if ((k > 0 && k < 1) || (back > 0 && back < 1)) walkP(q, T * 9 + i, 1); faceP(q, 'h'); });
    if (T < E.c2 + 1.1) attach(R.jacket, b.up, 0, 0, 0); else attach(R.jacket, g.userData.armR.userData.e, 0, -0.3, 0.14); g.userData.armR.rotation.x = -1.0; faceP(bro, 'f'); bro.rotation.y = -0.6; }
  if (ci >= 3) attach(R.jacket, R.girls[0].userData.armR.userData.e, 0, -0.3, 0.14);
  // the walk lesson
  if (ci === 3) { const w = prog(T, CL[3].start, CL[4].start); you.position.set(lerp(-0.6, 2.2, w), 0, 0.6); you.rotation.y = PI / 2; walkP(you, T * 6, 1.2); u.up.rotation.z = 0.15 * S(T * 6); faceP(you, T > E.much3 - 0.15 ? 's' : 'h'); bro.position.set(you.position.x - 1.1, 0, 0.6); bro.rotation.y = PI / 2; walkP(bro, T * 6, 1.2); b.up.rotation.z = 0.2 * S(T * 6 + 0.5); faceP(bro, 'h'); around(-1.6, 0.2, T); }
  if (ci === 4) { const w = prog(T, CL[4].start, E.bin - 0.05), f = ease(prog(T, E.bin - 0.05, E.bin + 0.4)); bro.position.set(lerp(2.6, 4.1, w), 0, 0.4); bro.rotation.set(0, PI / 2, 0); if (f <= 0) { walkP(bro, T * 6, 1.2); b.up.rotation.z = 0.2 * S(T * 6); faceP(bro, 's'); } else { bro.rotateX(-1.35 * f); bro.position.y = 0.1 * f; faceP(bro, 'o'); R.bin.rotation.z = -1.4 * f; R.bin.position.x = 4.6 + 0.4 * f; } you.position.set(1.4, 0, 0.6); you.rotation.y = PI / 2; faceP(you, 'd'); around(-1.2, 0.2, T); }
  // paid fans follow bro... then switch to you
  if (ci === 5 || ci === 6) { const w = ci === 5 ? prog(T, CL[5].start, CL[6].start) : 1; bro.position.set(lerp(1.5, 4.2, w), 0, 0.5); bro.rotation.y = PI / 2; if (ci === 5) walkP(bro, T * 7, 1); faceP(bro, ci === 6 && T > E.sw ? 'f' : 'h'); you.position.set(-0.6, 0, 0.2); you.rotation.y = 0.4; faceP(you, 'h'); around(-0.6, 0.2, T);
    R.fans.forEach((f, i) => { f.visible = true; const sw = ci === 6 && T > E.sw - 0.1; const k = sw ? ease(prog(T, E.sw - 0.1, E.c7)) : 0; f.position.set(lerp(bro.position.x - 0.9 - i * 0.7, 0.4 + i * 0.6, k), 0, 0.7 + (i % 2) * 0.35); f.rotation.y = sw ? -PI / 2 : PI / 2; if ((ci === 5) || (k > 0 && k < 1)) walkP(f, T * 8 + i, 1); f.userData.armR.rotation.x = -2.6 + 0.2 * S(T * 6 + i); f.userData.sA.visible = !sw; f.userData.sB.visible = sw; f.userData.sA.position.copy(f.userData.armR.getWorldPosition(new T3.Vector3())).add(new T3.Vector3(0, 0.55, 0)); f.userData.sB.position.copy(f.userData.sA.position); faceP(f, 'h'); }); }
  // one girl walks past everyone, straight to bro... for her charger
  if (ci === 7 || ci === 8) { bro.position.set(4.2, 0, 0.5); bro.rotation.y = -0.6; faceP(bro, ci === 7 && T > E.past && T < E.she ? 'h' : 'd'); you.position.set(-0.6, 0, 0.2); you.rotation.y = 0.4; around(-0.6, 0.2, T); R.fans.forEach((f, i) => { f.visible = true; f.position.set(0.4 + i * 0.6, 0, 0.7 + (i % 2) * 0.35); f.rotation.y = -PI / 2; f.userData.armR.rotation.x = -2.6; f.userData.sA.visible = false; f.userData.sB.visible = true; f.updateMatrixWorld(true); f.userData.sB.position.copy(f.userData.armR.getWorldPosition(new T3.Vector3())).add(new T3.Vector3(0, 0.55, 0)); faceP(f, 'h'); });
    const g = R.girls[4]; g.userData.busy = true; stillP(g); if (ci === 7) { const w = prog(T, E.past - 0.1, E.she - 0.2), back = prog(T, E.charger + 0.3, CL[8].start); g.position.set(back > 0 ? lerp(3.6, 6.5, back) : lerp(-0.3, 3.6, w), 0, 0.55); g.rotation.y = PI / 2; if ((w > 0 && w < 1) || back > 0) walkP(g, T * 8, 1); faceP(g, 'n');
      if (T > E.she - 0.2 && back <= 0) { g.rotation.y = PI / 2 - 0.4; g.userData.armR.rotation.x = -1.3; b.armR.rotation.x = -1.2; R.charger.visible = true; const hand = T < E.charger ? b.armR.userData.e : g.userData.armR.userData.e; attach(R.charger, hand, 0, -0.32, 0.06); } if (back > 0) { R.charger.visible = true; attach(R.charger, g.userData.armR.userData.e, 0, -0.32, 0.06); } }
    else g.position.set(9, 0, 0.5); }
  // hearts float around you
  R.hearts.forEach((h, i) => { const ph = (T * 0.5 + i / 12) % 1; const cx = you.position.x + S(i * 2.1) * 0.9; h.position.set(cx, 1.6 + ph * 1.2, you.position.z + C(i * 1.7) * 0.5); h.material.opacity = S(PI * ph); h.visible = ci !== 4; }); }
function shot(T) { camera.fov = 55; camera.updateProjectionMatrix(); anim(T); const c = camAt(T); look(c[0], c[1]); const cp = camera.position; R.sun.target.position.set(cp.x, 0, cp.z - 4); R.sun.position.set(cp.x + 6, 12, cp.z + 4); R.sun.target.updateMatrixWorld(); return { si: 0, t0: 0 }; }
const CAPS = []; CL.forEach(c0 => { let cur = []; const flush = () => { if (cur.length) CAPS.push({ a: cur[0].a, b: cur[cur.length - 1].b, t: cur.map(w => w.w).join(' ') }); cur = []; };
  c0.words.forEach(w0 => { const w = Object.assign({}, w0); const prev = cur[cur.length - 1]; if (cur.length && (cur.length >= 3 || w.a - prev.b > 0.22 || w.a - prev.a > 0.6 || /[.,!?]$/.test(prev.w))) flush(); cur.push(w); }); flush(); });
CAPS.forEach((c, i) => { const nx = CAPS[i + 1]; c.b = nx ? Math.min(nx.a, c.b + 0.28) : c.b + 0.6; });
function caption(c) { octx.save(); octx.font = '600 48px CapFont'; octx.textAlign = 'center'; octx.textBaseline = 'middle'; octx.lineJoin = 'round'; octx.lineWidth = 10; octx.strokeStyle = 'rgba(0,0,0,0.9)'; octx.strokeText(c.t, 360, 900); octx.fillStyle = '#ffffff'; octx.fillText(c.t, 360, 900); octx.restore(); }
window.initFootball = async function () {
  await Promise.all(['600 44px CapFont', '44px Russo'].map(f => document.fonts.load(f)));
  GLOW = ctex(64, 64, (c, w, h) => { const gr = c.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.3, 'rgba(255,255,255,0.5)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = gr; c.fillRect(0, 0, w, h); });
  glc = document.createElement('canvas'); glc.width = RW; glc.height = RH;
  renderer = new T3.WebGLRenderer({ canvas: glc, antialias: true, preserveDrawingBuffer: true }); renderer.setPixelRatio(1); renderer.setSize(RW, RH, false); renderer.outputColorSpace = T3.SRGBColorSpace; renderer.toneMapping = T3.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05; renderer.shadowMap.enabled = true; renderer.shadowMap.type = T3.PCFSoftShadowMap;
  scene = new T3.Scene(); scene.background = new T3.Color('#cfe8fa'); camera = new T3.PerspectiveCamera(55, RW / RH, 0.03, 1000); scene.add(camera);
  build(); out = document.getElementById('c'); octx = out.getContext('2d');
};
window.DURATION = TM.total;
window.renderFrame = function (T) { const loop = T >= E.loop; shot(T); renderer.render(scene, camera);
  octx.globalCompositeOperation = 'source-over'; octx.globalAlpha = 1; octx.filter = 'contrast(1.04) saturate(1.1)'; octx.drawImage(glc, 0, 0, W, H); octx.filter = 'none';
  const vg = octx.createRadialGradient(360, 640, 460, 360, 640, 900); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.25)'); octx.fillStyle = vg; octx.fillRect(0, 0, W, H);
  const cap = CAPS.find(c => T >= c.a && T < c.b); if (cap && !loop) caption(cap); };
})();
