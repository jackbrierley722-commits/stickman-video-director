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
const PM = (col, amt = 26, size = 16, seed = 1) => LM({ map: nT(col, amt, size, seed) });
function boxM(p, w, h, d, mats, x, y, z, sh = true) { const m = new T3.Mesh(Bx(w, h, d), mats); m.position.set(x, y, z); m.castShadow = sh; m.receiveShadow = true; p.add(m); return m; }
// ---------- blocky people ----------
const OUTFITS = [
  { top: '#3a2c24', open: '#e8e2d6', bot: '#5a6a8a', hair: '#3a2416', skin: '#d8a07c' }, { top: '#2a2a2e', open: '#d8d4cc', bot: '#4a5a72', hair: '#141010', skin: '#6a4430', cap: '#1e2436' },
  { top: '#8a2a24', bot: '#4a5a72', hair: '#3a2416', skin: '#e0ac88', sleeve: '#d8d4cc' }, { top: '#b89a6a', open: '#2a2a2e', bot: '#7a6248', hair: '#4a3020', skin: '#d8a07c', cap: '#b8a070' },
  { top: '#1c1c20', open: '#e8e8e8', bot: '#1c1c20', hair: '#2a1a10', skin: '#e0ac88', tie: '#1c1c20' }, { top: '#e86a1e', bot: '#8a8a82', hair: '#3a2416', skin: '#d8a07c', cap: '#e8c020', vest: 1 },
  { top: '#1e2640', bot: '#1e2640', hair: '#2a1a10', skin: '#e0ac88', cap: '#1a1e30', cop: 1 }, { top: '#9a948c', bot: '#3a3a3e', hair: '#8a847c', skin: '#7a5038', hood: 1 }];
function faceTex(o) { return PT(16, 16, (c) => { noisy(c, 16, 16, o.skin, 18, 3); noisy(c, 16, 5, o.cap || o.hair, 20, 4); if (!o.cap) noisy(c, 2, 9, o.hair, 20, 5); if (o.hood) { noisy(c, 2, 16, o.top, 20, 6); noisy(c, 2, 16, o.top, 20, 6, 14); }
  c.fillStyle = '#f0ece4'; c.fillRect(4, 8, 3, 1); c.fillRect(9, 8, 3, 1); c.fillStyle = '#4a5a7a'; c.fillRect(5, 8, 1, 1); c.fillRect(10, 8, 1, 1); c.fillStyle = 'rgba(40,20,10,0.6)'; c.fillRect(4, 7, 3, 1); c.fillRect(9, 7, 3, 1); c.fillStyle = 'rgba(80,40,30,0.5)'; c.fillRect(6, 12, 4, 1); c.fillStyle = 'rgba(0,0,0,0.15)'; c.fillRect(7, 9, 2, 2); }); }
function torsoTex(o) { return PT(16, 16, (c) => { noisy(c, 16, 16, o.top, 24, 7); if (o.open) { noisy(c, 6, 16, o.open, 14, 8, 5); } if (o.tie) noisy(c, 2, 13, o.tie, 10, 9, 7); if (o.vest) { c.fillStyle = '#d8d8c8'; c.fillRect(0, 9, 16, 2); c.fillRect(4, 0, 2, 16); c.fillRect(10, 0, 2, 16); } if (o.cop) { c.fillStyle = '#c8a040'; c.fillRect(3, 4, 2, 2); c.fillStyle = '#111'; c.fillRect(0, 14, 16, 2); } if (o.hood) { c.fillStyle = 'rgba(0,0,0,0.2)'; c.fillRect(4, 9, 8, 4); } }); }
function person(o) { const g = new T3.Group(); const skin = PM(o.skin, 16, 8, 2), top = PM(o.top, 24, 8, 3), bot = PM(o.bot, 26, 8, 4), hair = PM(o.cap || o.hair, 20, 8, 5), shoe = PM('#2a2420', 16, 8, 6), sleeve = PM(o.sleeve || o.top, 22, 8, 7);
  const up = new T3.Group(); up.position.y = 0.95; g.add(up); boxM(up, 0.5, 0.62, 0.28, [top, top, top, top, LM({ map: torsoTex(o) }), top], 0, 0.31, 0);
  const head = new T3.Group(); head.position.y = 0.66; up.add(head); boxM(head, 0.32, 0.34, 0.32, [skin, skin, hair, skin, LM({ map: faceTex(o) }), hair], 0, 0.17, 0); if (o.cap) boxM(head, 0.34, 0.08, 0.36, hair, 0, 0.32, 0.03);
  const arm = (sx) => { const s = new T3.Group(); s.position.set(sx * 0.33, 0.58, 0); up.add(s); boxM(s, 0.16, 0.34, 0.18, sleeve, 0, -0.17, 0); const e = new T3.Group(); e.position.y = -0.34; s.add(e); boxM(e, 0.15, 0.3, 0.17, o.sleeve ? sleeve : top, 0, -0.13, 0); boxM(e, 0.14, 0.1, 0.15, skin, 0, -0.32, 0); s.userData.e = e; return s; };
  const leg = (sx) => { const h = new T3.Group(); h.position.set(sx * 0.13, 0.95, 0); g.add(h); boxM(h, 0.22, 0.46, 0.24, bot, 0, -0.23, 0); const k = new T3.Group(); k.position.y = -0.46; h.add(k); boxM(k, 0.21, 0.42, 0.23, bot, 0, -0.21, 0); boxM(k, 0.22, 0.08, 0.32, shoe, 0, -0.45, 0.04); h.userData.k = k; return h; };
  g.userData = { up, head, armL: arm(-1), armR: arm(1), legL: leg(-1), legR: leg(1) }; return g; }
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

// ---------- timing ----------
const E = { back: AT(0, 'dinosaurs'), street: AT(0, 'one'), c1: CL[1].start, day1: AT(1, 'day'), fog: AT(1, 'a'), c2: CL[2].start, advert: AT(2, 'people'), c3: CL[3].start, ptero: AT(3, 'pterosaurs'), flight: AT(3, 'every'),
  c4: CL[4].start, raptors: AT(4, 'raptors'), hunt: AT(4, 'they'), c5: CL[5].start, shake: AT(5, 'ground'), c6: CL[6].start, huge: AT(6, 'huge'), c7: CL[7].start, comment: AT(7, 'comment') };
E.loop = TM.total - 0.4;
const SB = [600, 0, 0];
// ---------- dinosaurs ----------
function dinoTex(base, stripe, seed) { return PT(16, 16, (c) => { noisy(c, 16, 16, base, 28, seed); const r = rng(seed + 9); c.fillStyle = stripe; for (let i = 0; i < 10; i++) c.fillRect((r() * 16) | 0, (r() * 16) | 0, 1 + (r() * 3 | 0), 1); for (let y = 2; y < 16; y += 5) { c.fillStyle = 'rgba(0,0,0,0.18)'; c.fillRect(0, y, 16, 1); } }); }
function chain(parent, n, len0, w0, h0, taper, mat, dir, bend) { const segs = []; let p = parent; for (let i = 0; i < n; i++) { const k = 1 - taper * i / n; const g = new T3.Group(); g.position.set(0, 0, i === 0 ? 0 : dir * len0 * (1 - taper * (i - 1) / n)); p.add(g); boxM(g, w0 * k, h0 * k, len0 * k, mat, 0, 0, dir * len0 * k / 2); g.rotation.x = bend; segs.push(g); p = g; } return segs; }
function brachio() { const g = new T3.Group(); const sk = LM({ map: dinoTex('#6a7258', '#4a523e', 41) }), belly = LM({ map: dinoTex('#8a8a6a', '#6a6a52', 42) });
  boxM(g, 6, 5.5, 12, [sk, sk, sk, belly, sk, sk], 0, 10.5, 0); const legs = []; for (const [x, z] of [[-2.2, 4], [2.2, 4], [-2.2, -4], [2.2, -4]]) { const l = new T3.Group(); l.position.set(x, 9, z); g.add(l); boxM(l, 1.9, 9, 1.9, sk, 0, -4.5, 0); boxM(l, 2.2, 0.6, 2.4, belly, 0, -8.8, 0.2); legs.push(l); }
  const nb = new T3.Group(); nb.position.set(0, 12, 5.5); g.add(nb); const neck = []; let p = nb; for (let i = 0; i < 9; i++) { const k = 1 - i * 0.06; const s = new T3.Group(); s.position.set(0, i ? 2.0 : 0, i ? 0.25 : 0); p.add(s); boxM(s, 1.9 * k, 2.2, 1.9 * k, sk, 0, 1.1, 0); s.rotation.x = i ? 0.03 : 0.55; neck.push(s); p = s; }
  const head = new T3.Group(); head.position.set(0, 2.2, 0.4); p.add(head); boxM(head, 1.5, 1.3, 2.6, sk, 0, 0.3, 0.7); boxM(head, 1.3, 0.4, 1.6, belly, 0, -0.4, 1.2); for (const sx of [-1, 1]) boxM(head, 0.1, 0.25, 0.25, LM({ color: '#111' }), sx * 0.76, 0.5, 1.2, false);
  const tb = new T3.Group(); tb.position.set(0, 11, -6); g.add(tb); const tail = chain(tb, 9, 2.4, 3.2, 2.6, 0.85, sk, -1, 0.05); tb.rotation.x = 0.25;
  g.userData = { legs, neck, head, tail }; return g; }
function trex() { const g = new T3.Group(); const sk = LM({ map: dinoTex('#5a4a34', '#3a2e20', 51) }), belly = LM({ map: dinoTex('#8a7a5a', '#6a5a40', 52) }), teeth = PM('#e8e0c8', 10, 8, 53), mouth = PM('#5a1a1a', 14, 8, 54);
  const body = new T3.Group(); body.position.y = 6.2; g.add(body); boxM(body, 3.4, 3.6, 6.2, [sk, sk, sk, belly, sk, sk], 0, 0, 0);
  const neck = new T3.Group(); neck.position.set(0, 1.2, 3.0); body.add(neck); boxM(neck, 2.2, 2.4, 2.4, sk, 0, 0.4, 0.8); neck.rotation.x = -0.25;
  const head = new T3.Group(); head.position.set(0, 1.0, 2.0); neck.add(head); boxM(head, 2.2, 1.6, 3.8, sk, 0, 0.3, 1.5); boxM(head, 2.0, 0.2, 3.2, teeth, 0, -0.55, 1.7); for (const sx of [-1, 1]) { boxM(head, 0.12, 0.3, 0.4, LM({ color: '#e8b020', emissive: '#6a4a00', emissiveIntensity: 0.6 }), sx * 1.11, 0.7, 1.0, false); boxM(head, 0.3, 0.3, 0.6, sk, sx * 0.85, 1.15, 0.9); }
  const jaw = new T3.Group(); jaw.position.set(0, -0.5, 0.2); head.add(jaw); boxM(jaw, 1.9, 0.7, 3.4, [sk, sk, mouth, belly, sk, sk], 0, -0.3, 1.5); boxM(jaw, 1.8, 0.18, 3.0, teeth, 0, 0.1, 1.6);
  for (const sx of [-1, 1]) { const a = new T3.Group(); a.position.set(sx * 1.5, -0.6, 2.4); body.add(a); boxM(a, 0.3, 1.1, 0.35, sk, 0, -0.5, 0.2).rotation.x = -0.6; }
  const legs = []; for (const sx of [-1, 1]) { const hip = new T3.Group(); hip.position.set(sx * 1.6, -0.6, -0.4); body.add(hip); boxM(hip, 1.4, 3.4, 2.0, sk, 0, -1.5, 0.2); const kn = new T3.Group(); kn.position.set(0, -3.0, 0.5); hip.add(kn); boxM(kn, 0.9, 2.8, 1.0, sk, 0, -1.3, -0.4).rotation.x = 0.3; boxM(kn, 1.2, 0.5, 1.8, belly, 0, -2.7, 0.0); hip.userData.k = kn; legs.push(hip); }
  const tb = new T3.Group(); tb.position.set(0, 0.6, -3.0); body.add(tb); const tail = chain(tb, 7, 1.9, 2.6, 2.4, 0.85, sk, -1, 0.04); tb.rotation.x = -0.1;
  g.userData = { body, neck, head, jaw, legs, tail }; return g; }
function raptor(seed) { const g = new T3.Group(); const sk = LM({ map: dinoTex(['#7a6a48', '#6a5a3a', '#5a6a48'][seed % 3], '#3a2e1e', 60 + seed) }), mouth = PM('#5a1a1a', 14, 8, 64);
  const body = new T3.Group(); body.position.y = 1.35; g.add(body); boxM(body, 0.7, 0.8, 1.6, sk, 0, 0, 0); const neck = new T3.Group(); neck.position.set(0, 0.35, 0.75); body.add(neck); boxM(neck, 0.4, 0.8, 0.4, sk, 0, 0.35, 0.1).rotation.x = 0.4;
  const head = new T3.Group(); head.position.set(0, 0.8, 0.35); neck.add(head); boxM(head, 0.45, 0.4, 0.9, sk, 0, 0, 0.3); const jaw = new T3.Group(); jaw.position.set(0, -0.15, 0); head.add(jaw); boxM(jaw, 0.4, 0.15, 0.8, [sk, sk, mouth, sk, sk, sk], 0, -0.08, 0.3); for (const sx of [-1, 1]) boxM(head, 0.05, 0.08, 0.08, LM({ color: '#e8c020', emissive: '#e8a000', emissiveIntensity: 1 }), sx * 0.23, 0.08, 0.35, false);
  const legs = []; for (const sx of [-1, 1]) { const hip = new T3.Group(); hip.position.set(sx * 0.3, -0.2, 0); body.add(hip); boxM(hip, 0.3, 0.7, 0.45, sk, 0, -0.3, 0.1); const kn = new T3.Group(); kn.position.set(0, -0.6, 0.1); hip.add(kn); boxM(kn, 0.2, 0.6, 0.22, sk, 0, -0.3, -0.15).rotation.x = 0.4; boxM(kn, 0.3, 0.12, 0.45, sk, 0, -0.58, 0.05); hip.userData.k = kn; legs.push(hip); }
  const tb = new T3.Group(); tb.position.set(0, 0.1, -0.8); body.add(tb); const tail = chain(tb, 6, 0.42, 0.45, 0.4, 0.8, sk, -1, 0.02); g.userData = { body, head, jaw, legs, tail }; return g; }
function ptero(seed) { const g = new T3.Group(); const sk = LM({ map: dinoTex('#6a5040', '#4a3828', 70 + seed) }), mem = LM({ map: dinoTex('#8a6048', '#6a4030', 75 + seed), side: T3.DoubleSide });
  boxM(g, 0.5, 0.45, 1.6, sk, 0, 0, 0); boxM(g, 0.3, 0.3, 1.4, sk, 0, 0.15, 1.3); boxM(g, 0.12, 0.5, 0.9, sk, 0, 0.4, 0.5).rotation.x = 0.5; const wings = []; for (const sx of [-1, 1]) { const w = new T3.Group(); w.position.set(sx * 0.25, 0.1, 0.2); g.add(w); boxM(w, 2.6, 0.08, 1.1, mem, sx * 1.3, 0, 0); const w2 = new T3.Group(); w2.position.set(sx * 2.6, 0, 0); w.add(w2); boxM(w2, 2.2, 0.06, 0.8, mem, sx * 1.1, 0, -0.1); w.userData.t = w2; wings.push(w); }
  g.userData = { wings }; return g; }
function walkDino(d, ph, a, kind) { const u = d.userData; if (kind === 'b') { u.legs.forEach((l, i) => l.rotation.x = S(ph + (i === 0 || i === 3 ? 0 : PI)) * 0.22 * a); u.neck.forEach((s, i) => { if (i) s.rotation.z = 0.02 * S(ph * 0.5 + i * 0.3); }); u.tail.forEach((s, i) => s.rotation.y = 0.06 * S(ph * 0.5 - i * 0.4)); }
  else { u.legs.forEach((l, i) => { const s = S(ph + i * PI); l.rotation.x = s * 0.5 * a; l.userData.k.rotation.x = Math.max(0, -s) * 0.7 * a; }); u.body.position.y = (kind === 't' ? 6.2 : 1.35) + Math.abs(C(ph)) * (kind === 't' ? 0.25 : 0.08) * a; u.tail.forEach((s, i) => s.rotation.y = 0.08 * S(ph - i * 0.5)); } }
// ---------- build ----------
function build() {
  R.sun = new T3.DirectionalLight('#ffd8b0', 1.8); R.sun.castShadow = true; R.sun.shadow.mapSize.set(2048, 2048); const sc = R.sun.shadow.camera; sc.left = sc.bottom = -60; sc.right = sc.top = 60; sc.near = 1; sc.far = 400; R.sun.shadow.bias = -0.0008; scene.add(R.sun); scene.add(R.sun.target);
  R.hemi = new T3.HemisphereLight('#a8a0c8', '#5a5048', 1.1); scene.add(R.hemi);
  R.skyM = new T3.MeshBasicMaterial({ side: T3.BackSide, fog: false, toneMapped: false }); R.skyD = PT(8, 64, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#5a5a82'); g.addColorStop(0.4, '#8a86a8'); g.addColorStop(0.5, '#c8a898'); g.addColorStop(0.53, '#a89890'); g.addColorStop(1, '#4a4a52'); c.fillStyle = g; c.fillRect(0, 0, w, h); });
  R.skyN = PT(8, 64, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#0a0e1e'); g.addColorStop(0.48, '#1e2a48'); g.addColorStop(0.53, '#2a3048'); g.addColorStop(1, '#0a0c14'); c.fillStyle = g; c.fillRect(0, 0, w, h); }); R.skyM.map = R.skyD; add(scene, Sp(1500, 24, 12), R.skyM, 0, 0, 0, false).castShadow = false;
  R.sunGlow = spr(scene, GLOW, '#ffd8a0', 160, -180, 40, -900, 0.9); R.sunDisc = spr(scene, GLOW, '#fff4d8', 40, -180, 40, -898, 1);
  const G = R.G = new T3.Group(); scene.add(G); const asph = PM('#4a4846', 18, 16, 80), walk = PM('#9a9488', 16, 16, 81), curb = PM('#b8b2a6', 12, 8, 82), white = LM({ color: '#d8d4c8' }), yel = LM({ color: '#c8a030' });
  boxM(G, 400, 0.1, 500, PM('#5a5650', 16, 16, 79), 0, -0.06, -100, false); boxM(G, 12, 0.1, 320, asph, 0, -0.01, -100, false); boxM(G, 200, 0.1, 10, asph, 0, -0.005, -22, false);
  for (const sx of [-1, 1]) { boxM(G, 4, 0.2, 320, walk, sx * 8, 0.08, -100, false); boxM(G, 0.25, 0.22, 320, curb, sx * 6.1, 0.09, -100, false); }
  for (let z = 38; z > -210; z -= 6) { if (Math.abs(z + 22) < 6) continue; for (const x of [-3, 3]) boxM(G, 0.18, 0.02, 2.4, white, x, 0.05, z, false); boxM(G, 0.14, 0.02, 3.6, yel, -0.12, 0.05, z, false); boxM(G, 0.14, 0.02, 3.6, yel, 0.12, 0.05, z, false); }
  for (let x = -5; x <= 5; x += 1.2) { boxM(G, 0.7, 0.02, 2.6, white, x, 0.05, -15.8, false); boxM(G, 0.7, 0.02, 2.6, white, x, 0.05, -28.2, false); }
  // shops along the street
  const r = rng(3); const shopCols = ['#8a7a6a', '#9a8a72', '#6a6a72', '#a8987a', '#7a6a5a', '#8a8278'];
  for (const sx of [-1, 1]) for (let z = 30; z > -60; z -= 9) { if (Math.abs(z + 22) < 7) continue; const h = 5 + r() * 9, col = shopCols[(r() * 6) | 0]; const t = winTexP(col, 0.35, (r() * 1000) | 0, 6, 6); t.wrapS = t.wrapT = T3.RepeatWrapping; t.repeat.set(1, h / 6); const m = LM({ map: t }); boxM(G, 7, h, 8.5, [m, m, PM(col, 18, 16, 5), m, m, m], sx * 14, h / 2, z, false);
    boxM(G, 0.6, 2.6, 7.5, PM('#1e2228', 14, 8, 6), sx * 10.25, 1.3, z, false); boxM(G, 1.6, 0.18, 7.8, PM(['#8a2a24', '#2a4a7a', '#3a6a3a', '#7a5a2a'][(r() * 4) | 0], 20, 8, 7), sx * 9.8, 3.0, z, false); }
  // billboard (left foreground) and awning
  const bb = PT(32, 12, (c) => { noisy(c, 32, 12, '#c8b8a0', 20, 90); noisy(c, 32, 5, '#a83a2a', 26, 91, 0, 1); noisy(c, 32, 3, '#3a4a7a', 20, 92, 0, 8); c.fillStyle = '#f0e8d8'; c.fillRect(3, 2, 10, 2); }); boxM(G, 0.3, 4.8, 9, [LM({ map: bb }), LM({ map: bb }), PM('#3a3a3e'), PM('#3a3a3e'), PM('#3a3a3e'), PM('#3a3a3e')], -9.4, 9.6, 12, false); for (const z of [9, 15]) boxM(G, 0.3, 7.5, 0.3, PM('#3a3430', 16, 8, 93), -9.4, 3.75, z, false);
  boxM(G, 2.4, 0.3, 6, PM('#4a3a30', 18, 8, 94), -9.6, 4.6, 6, false); boxM(G, 0.5, 4.6, 0.5, PM('#3a2e26', 18, 8, 95), -8.4, 2.3, 3.4, false);
  for (let z = 30; z > -60; z -= 14) { palm(G, -8.6, z, 10 + r() * 4, 100 + z | 0); palm(G, 8.6, z - 7, 10 + r() * 4, 200 + z | 0); } for (let z = 24; z > -60; z -= 18) { lampP(G, -7.2, z, 1); lampP(G, 7.2, z - 9, -1); }
  for (const [x, z, a] of [[-6.4, -15.5, 0], [6.4, -28.5, PI]]) { const tl = new T3.Group(); tl.position.set(x, 0, z); tl.rotation.y = a; G.add(tl); boxM(tl, 0.2, 4.6, 0.2, PM('#2a2a2e'), 0, 2.3, 0, false); boxM(tl, 0.5, 1.3, 0.4, PM('#1a1a1c'), 0, 4.8, 0, false); boxM(tl, 0.26, 0.26, 0.05, LM({ color: '#30ff60', emissive: '#30ff60', emissiveIntensity: 1 }), 0, 4.4, 0.22, false); }
  // freeway overpass
  const conc = PM('#8a867e', 16, 16, 110); boxM(G, 220, 1.4, 10, conc, 0, 7.4, -62, false); for (const sx of [-1, 1]) boxM(G, 220, 0.9, 0.3, conc, 0, 8.55, -62 + sx * 4.85, false); for (const x of [-30, -12, 12, 30]) boxM(G, 1.4, 6.8, 2.4, conc, x, 3.4, -62, false); boxM(G, 220, 0.04, 0.2, white, 0, 8.12, -62, false);
  R.fwyCars = []; for (let i = 0; i < 6; i++) { const c = car(i + 2); c.scale.setScalar(0.95); c.position.set(0, 8.1, -62 + (i % 2 ? 2.2 : -2.2)); c.rotation.y = i % 2 ? PI / 2 : -PI / 2; G.add(c); R.fwyCars.push(c); }
  // skyline
  const rs = rng(17); for (let i = 0; i < 34; i++) { const x = -110 + rs() * 220, z = -110 - rs() * 180, w = 14 + rs() * 16, h = 30 + rs() * 70; if (Math.abs(x) < 10 && z > -150) continue; tower(G, x, z, w, h, w, ['#6a6a72', '#5a5e68', '#7a7470', '#4e525c'][(rs() * 4) | 0], 0.25, 300 + i); }
  { const h = tower(G, 6, -170, 22, 120, 22, '#5e626c', 0.3, 999); tower(G, 6, -170, 16, 132, 16, '#5e626c', 0.3, 998); tower(G, 6, -170, 10, 142, 10, '#5e626c', 0.3, 997); boxM(G, 12, 2, 12, PM('#4a4e58'), 6, 142, -170, false); R.towerTop = [6, 143, -170]; }
  // ---- traffic + people ----
  R.cars = []; const lanes = [[-3.6, 1, 9], [-1.4, 1, 11], [1.4, -1, 10], [3.6, -1, 8]]; for (let i = 0; i < 12; i++) { const [x, dir, sp] = lanes[i % 4]; const c = car(i); c.userData.mv = { x, dir, sp: sp * (0.85 + 0.3 * ((i * 37) % 10) / 10), z0: 30 - i * 17 }; c.rotation.y = dir > 0 ? 0 : PI; G.add(c); R.cars.push(c); }
  R.peds = []; for (let i = 0; i < 18; i++) { const p = person(OUTFITS[i % OUTFITS.length]); const side = i % 2 ? 1 : -1; p.userData.mv = { x: side * (7.0 + ((i * 13) % 5) * 0.4), dir: (i % 4 < 2 ? 1 : -1), sp: 1.2 + ((i * 7) % 5) * 0.12, z0: 28 - i * 5.5, ph: i }; G.add(p); R.peds.push(p); }
  // ---- dinosaurs downtown ----
  R.brach = brachio(); G.add(R.brach); R.trex = trex(); G.add(R.trex); R.trex.scale.setScalar(1.15);
  R.pteros = []; for (let i = 0; i < 9; i++) { const p = ptero(i); p.scale.setScalar(2.2); G.add(p); R.pteros.push(p); }
  // ---- suburbs at night ----
  const U = R.U = new T3.Group(); U.position.set(...SB); scene.add(U); boxM(U, 200, 0.1, 200, PM('#2e3a2a', 16, 16, 120), 0, -0.05, -40, false); boxM(U, 9, 0.1, 200, PM('#2e2e30', 16, 16, 121), 0, 0, -40, false);
  for (const sx of [-1, 1]) { boxM(U, 2.5, 0.16, 200, PM('#6a6862', 14, 16, 122), sx * 5.8, 0.06, -40, false); for (let z = 20; z > -90; z -= 16) { const hz = z + (sx > 0 ? 6 : 0); const hc = ['#a8987a', '#8a9aa8', '#b8a888', '#9a8a7a'][((z * sx) | 0) & 3]; const wt = PT(16, 8, (c) => { noisy(c, 16, 8, hc, 18, 130 + z); c.fillStyle = '#ffd890'; c.fillRect(2, 2, 3, 3); c.fillRect(11, 2, 3, 3); c.fillStyle = '#3a2a20'; c.fillRect(7, 3, 2, 5); });
    const wm = LM({ map: wt, emissive: '#6a4a20', emissiveIntensity: 0.35, emissiveMap: wt }); boxM(U, 9, 4.2, 8, [wm, wm, PM('#5a3a30'), PM('#5a3a30'), wm, wm], sx * 16, 2.1, hz, false); const roof = boxM(U, 10, 0.5, 9, PM('#4a3028', 20, 8, 131), sx * 16, 4.6, hz, false);
    for (let k = 0; k < 6; k++) boxM(U, 0.12, 0.9, 0.12, PM('#d8d4cc'), sx * 9.8, 0.45, hz - 4 + k * 1.6, false); boxM(U, 0.08, 0.1, 8, PM('#d8d4cc'), sx * 9.8, 0.8, hz, false);
    const pc = car((z + 40 + (sx > 0 ? 3 : 0)) & 7); pc.position.set(sx * 3.4, 0, hz + 3); pc.rotation.y = sx > 0 ? PI : 0; U.add(pc); } }
  R.subL = []; for (let z = 14; z > -80; z -= 20) for (const sx of [-1, 1]) { lampP(U, sx * 5.4, z, -sx); const l = new T3.PointLight('#ffd8a0', 30, 20, 1.4); l.position.set(SB[0] + sx * 4.2, 5.6, z); scene.add(l); R.subL.push(l); }
  R.alarmCar = car(1); R.alarmCar.position.set(-3.4, 0, -14); U.add(R.alarmCar); R.alarmL = new T3.PointLight('#ffb040', 0, 10, 1.6); R.alarmL.position.set(SB[0] - 3.4, 1.4, -11.8); scene.add(R.alarmL);
  R.raps = []; for (let i = 0; i < 5; i++) { const rp = raptor(i); U.add(rp); R.raps.push(rp); }
}
// ---------- lighting modes ----------
function lightMode(m) { if (R.mode === m) return; R.mode = m;
  if (m === 'dusk') { scene.fog.color.set('#8a86a0'); scene.fog.near = 30; scene.fog.far = 320; R.sun.color.set('#ffd0a0'); R.sun.intensity = 2.6; R.hemi.color.set('#b8b0d8'); R.hemi.groundColor.set('#7a6a5a'); R.hemi.intensity = 1.7; R.skyM.map = R.skyD; R.sunGlow.visible = R.sunDisc.visible = true; }
  if (m === 'fog') { scene.fog.color.set('#b0aeb8'); scene.fog.near = 6; scene.fog.far = 110; R.sun.color.set('#e8e0d8'); R.sun.intensity = 1.4; R.hemi.color.set('#e0dce8'); R.hemi.groundColor.set('#8a8680'); R.hemi.intensity = 1.9; R.skyM.map = R.skyD; R.sunGlow.visible = R.sunDisc.visible = false; }
  if (m === 'red') { scene.fog.color.set('#9a7a7a'); scene.fog.near = 25; scene.fog.far = 300; R.sun.color.set('#ffa070'); R.sun.intensity = 2.6; R.hemi.color.set('#d8aaa0'); R.hemi.groundColor.set('#6a5048'); R.hemi.intensity = 1.6; R.skyM.map = R.skyD; R.sunGlow.visible = R.sunDisc.visible = true; }
  if (m === 'night') { scene.fog.color.set('#141c2e'); scene.fog.near = 8; scene.fog.far = 95; R.sun.color.set('#9ab0f0'); R.sun.intensity = 1.0; R.hemi.color.set('#5a6aa8'); R.hemi.groundColor.set('#2a2e3a'); R.hemi.intensity = 1.3; R.skyM.map = R.skyN; R.sunGlow.visible = R.sunDisc.visible = false; }
  R.skyM.needsUpdate = true; }

// ---------- shots ----------
const U3 = (x, y, z) => [SB[0] + x, SB[1] + y, SB[2] + z];
const SH = [
  [0, (k, T) => TR(k, [-4.8, 1.6, 16], [-4.6, 1.65, 13], [-0.5, 8, -40], [0, 20, -40])],
  [E.c1, (k, T) => TR(k, [-3, 16, 34], [-3, 18, 28], [0, 30, -170], [0, 40, -170])],
  [E.day1 - 0.1, (k, T) => TR(k, [-7.2, 1.6, 6], [-7.0, 1.7, 3], [-6, 9, -22], [-1, 12, -22])],
  [E.c2, (k, T) => TR(k, [5.2, 1.6, 2.0], [5.4, 1.6, 0.5], [8, 2.2, -16], [7, 3, -18])],
  [E.c3, (k, T) => TR(k, [1, 2, -36], [1, 2.4, -40], [6, 60, -170], [6, 125, -170])],
  [E.flight - 0.1, (k, T) => TR(k, [-30, 160, -110], [-26, 158, -116], [6, 140, -170], [6, 140, -170])],
  [E.c4, (k, T) => TR(k, U3(1.2, 0.9, 14), U3(1.0, 0.8, 11), U3(-1, 1.2, -20), U3(-1, 1.0, -20))],
  [E.hunt - 0.1, (k, T) => TR(k, U3(-6, 1.4, -6), U3(-6.4, 1.3, -8), U3(-3, 0.9, -14), U3(-3, 0.9, -14))],
  [E.c5, (k, T) => TR(k, [-1.5, 1.6, 16], [-1.5, 1.6, 14], [0, 4, -40], [0, 4.5, -40])],
  [E.c6, (k, T) => TR(k, [-2, 1.4, -34], [-2.5, 1.3, -38], [12, 13, -62], [8, 15, -62])],
  [E.c7, (k, T) => TR(k, [-3, 2.2, 6], [-3, 2.6, 2], [3, 12, -62], [3, 14, -62])],
  [E.loop, (k, T) => look([-4.8, 1.6, 16], [-0.5, 8, -40])],
];
const shotAt = T => { let i = 0; for (let j = 0; j < SH.length; j++) if (T >= SH[j][0]) i = j; return i; };
const wrapZ = (z, a, b) => { const L = b - a; return a + ((((z - a) % L) + L) % L); };
const STEPS = []; for (let t = E.shake; t < TM.total; t += 0.95) STEPS.push(t);
function anim(T) { const loop = T >= E.loop, ci = loop ? 0 : CLI(T);
  lightMode(ci === 4 ? 'night' : (ci === 1 && T >= E.day1 - 0.1) || ci === 2 ? 'fog' : ci >= 5 ? 'red' : 'dusk');
  // traffic: frozen while the long neck crosses (day 1) and once the ground shakes
  const te = ci === 1 && T >= E.day1 - 0.1 || ci === 2 ? E.day1 : ci >= 5 ? E.c5 : T;
  R.cars.forEach((c, i) => { const m = c.userData.mv; const inner = Math.abs(m.x) < 2; const lx = inner ? m.x : Math.sign(m.x) * 4.2; c.visible = !(ci === 0 && inner) && ci !== 4; c.position.set(lx, 0, wrapZ(m.z0 + m.dir * m.sp * te, -150, 40)); if (c.userData.lb) { const f = Math.floor(T * 6) % 2; c.userData.lb[0].material.emissiveIntensity = f ? 2 : 0.2; c.userData.lb[1].material.emissiveIntensity = f ? 0.2 : 2; } });
  R.fwyCars.forEach((c, i) => { const dir = i % 2 ? 1 : -1; c.position.x = ci >= 6 && !loop ? (i % 2 ? -20 : 20) + i * 8 : wrapZ(-100 + i * 37 + dir * 14 * T, -110, 110); c.visible = !(ci >= 6 && !loop && Math.abs(c.position.x - R.trex.position.x) < 8); });
  // pedestrians: walk, stop and stare, then run
  R.peds.forEach((p, i) => { const m = p.userData.mv; stillP(p); p.visible = ci !== 4;
    if (ci >= 5 && !loop) { const d = T - E.c5; p.position.set(m.x * 0.9, 0, wrapZ(m.z0 - 20, -45, 10) + 5.5 * d); p.rotation.y = 0; walkP(p, T * 13 + m.ph, 1.3, 1); }
    else if (ci === 1 && T >= E.day1 - 0.1 || ci === 2) { const z = wrapZ(m.z0 + m.dir * m.sp * E.day1, -60, 30); p.position.set(m.x, 0, z); if (ci === 2 && i % 3 === 0) { p.position.z = wrapZ(m.z0 + m.dir * m.sp * T, -60, 30); p.rotation.y = m.dir > 0 ? 0 : PI; walkP(p, T * 7 + m.ph, 1); } else { p.rotation.y = Math.atan2(R.brach.position.x - m.x, R.brach.position.z - z); p.userData.head.rotation.x = -0.5; if (i % 4 === 1) { p.userData.armR.rotation.x = -1.6; p.userData.armR.userData.e.rotation.x = -0.6; } } }
    else { p.position.set(m.x, 0, wrapZ(m.z0 + m.dir * m.sp * T, -60, 30)); p.rotation.y = m.dir > 0 ? 0 : PI; walkP(p, T * 7 + m.ph, 1); } });
  // brachiosaurus
  const b = R.brach; b.visible = ci <= 2 || ci === 7 || loop; if (ci === 0 || loop) { const z = loop ? -48 : lerp(-48, -38, T / E.c1); b.position.set(0, 0, z); b.rotation.y = 0.45; walkDino(b, T * 1.6, 1, 'b'); b.userData.neck[0].rotation.x = 0.55; }
  if (ci === 1 || ci === 2) { const x = lerp(-34, 14, prog(T, E.day1 - 0.1, E.c3)); b.position.set(x, 0, -22); b.rotation.y = PI / 2; walkDino(b, T * 1.6, 1, 'b'); if (ci === 1 && T < E.day1 - 0.1) { b.position.set(-40, 0, -120); } }
  if (ci === 7) { b.position.set(-46, 0, -105); b.rotation.y = 0.6; walkDino(b, T * 1.2, 0.6, 'b'); b.userData.neck[0].rotation.x = 0.4; }
  // pterosaurs around the tallest tower
  R.pteros.forEach((p, i) => { p.visible = ci === 3 || ci >= 5 || (ci === 1 && T < E.day1); const tt = R.towerTop; const a = T * (0.28 + i * 0.02) + i * 0.7, rad = 22 + (i % 4) * 7; if (i < 2 && ci === 3) { p.position.set(tt[0] + (i ? 4 : -4), tt[1] + 1.2, tt[2] + (i ? -3 : 3)); p.rotation.set(0, i * 2, 0); p.userData.wings.forEach((w, j) => w.rotation.z = (j ? -1 : 1) * 0.9); return; }
    p.position.set(tt[0] + S(a) * rad, tt[1] - 12 + (i % 3) * 8 + 4 * S(T * 0.9 + i), tt[2] + C(a) * rad); p.rotation.set(0.1 * S(T + i), a + PI / 2, -0.35); p.userData.wings.forEach((w, j) => { const f = S(T * 4.5 + i) * 0.55; w.rotation.z = (j ? -1 : 1) * f; w.userData.t.rotation.z = (j ? -1 : 1) * f * 0.6; }); });
  // T. rex on the freeway
  const tx = R.trex; tx.visible = ci >= 6 && !loop; if (tx.visible) { const roar = ci === 7 ? ease(prog(T, E.c7 + 0.2, E.c7 + 0.7)) : prog(T, E.c6 + 1.6, E.c6 + 2.0); const walking = ci === 6 && T < E.c6 + 1.6; tx.position.set(walking ? lerp(28, 10, prog(T, E.c6, E.c6 + 1.6)) : 10, 8.1, -62); tx.rotation.y = ci === 7 ? -PI / 2 + 0.9 * ease(prog(T, E.c7, E.c7 + 0.8)) : -PI / 2;
    walkDino(tx, T * 3.3, walking ? 1 : 0, 't'); const u = tx.userData; u.jaw.rotation.x = 0.7 * roar * (0.85 + 0.15 * S(T * 30)); u.neck.rotation.x = -0.25 - 0.45 * roar; u.head.rotation.x = -0.2 * roar; }
  // suburbs: raptors weave between parked cars, car alarm flashing
  R.raps.forEach((rp, i) => { rp.visible = ci === 4; if (!rp.visible) return; const d = T - E.c4; const z = -40 + d * (6.5 + i * 0.6) - i * 4; rp.position.set(S(d * 1.8 + i) * 2.6 + (i % 2 ? 1.6 : -1.6), 0, z); rp.rotation.y = 0.5 * C(d * 1.8 + i); walkDino(rp, T * 11 + i, 1, 'r'); rp.userData.jaw.rotation.x = i === 1 && T > E.hunt ? 0.5 * Math.abs(S(T * 6)) : 0.1;
    if (i === 0 && T > E.hunt - 0.2) { const k = prog(T, E.hunt - 0.2, E.hunt + 0.4); rp.position.set(-3.4 + 0.3 * k, 1.4 * Math.min(1, k * 2), lerp(-18, -14.5, k)); rp.rotation.y = 0; } });
  const af = ci === 4 && T > E.hunt && Math.floor(T * 4) % 2; R.alarmL.intensity = af ? 18 : 0;
}
function shot(T) { const si = shotAt(T), sh = SH[si], t0 = sh[0], t1 = si + 1 < SH.length ? SH[si + 1][0] : TM.total; camera.fov = 60; camera.updateProjectionMatrix(); anim(T); sh[1](prog(T, t0, t1), T);
  const ci = T >= E.loop ? 0 : CLI(T); let sk = 0; if (ci >= 5 && T < E.loop) STEPS.forEach(s => { const d = T - s; if (d >= 0 && d < 0.4) sk = Math.max(sk, (1 - d / 0.4) * (ci === 5 ? 0.6 : 1)); });
  if (ci === 0) { const d = (T * 0.95) % 0.95; sk = Math.max(sk, d < 0.25 ? (1 - d / 0.25) * 0.25 : 0); }
  camera.position.y += sk * 0.12 * S(T * 70); camera.rotation.z += sk * 0.015 * S(T * 55);
  const c = camera.position; R.sun.target.position.set(c.x, 0, c.z - 25); R.sun.position.set(c.x - 120, 70, c.z - 260); R.sun.target.updateMatrixWorld();
  R.sunGlow.position.set(c.x - 260, 55, c.z - 900); R.sunDisc.position.copy(R.sunGlow.position); return { si, t0 }; }
// ---------- captions (game-style subtitles) ----------
const NUMW = { one: '1', two: '2', three: '3' };
const CAPS = []; CL.forEach(c0 => { let cur = []; const flush = () => { if (cur.length) CAPS.push({ a: cur[0].a, b: cur[cur.length - 1].b, t: cur.map(w => w.w).join(' ') }); cur = []; };
  c0.words.forEach((w0, j) => { const pv = c0.words[j - 1]; const w = Object.assign({}, w0, { w: pv && /^day$/i.test(pv.w) && NUMW[w0.w.toLowerCase()] ? NUMW[w0.w.toLowerCase()] : w0.w }); const prev = cur[cur.length - 1]; if (cur.length && (/^day$/i.test(w.w) || cur.length >= 3 || w.a - prev.b > 0.25 || w.a - prev.a > 0.6 || /[.,!?]$/.test(prev.w))) flush(); cur.push(w); }); flush(); });
CAPS.forEach((c, i) => { const nx = CAPS[i + 1]; c.b = nx ? Math.min(nx.a, c.b + 0.3) : c.b + 0.6; });
function caption(c) { octx.save(); octx.font = '600 46px CapFont'; octx.textAlign = 'center'; octx.textBaseline = 'middle'; octx.lineJoin = 'round'; octx.lineWidth = 10; octx.strokeStyle = 'rgba(0,0,0,0.9)'; octx.strokeText(c.t, 360, 1010); octx.fillStyle = '#ffffff'; octx.fillText(c.t, 360, 1010); octx.restore(); }
function txt(s_, x, y, size, col, font = 'Russo', align = 'center') { octx.font = `${size}px ${font}`; octx.fillStyle = col; octx.textAlign = align; octx.textBaseline = 'middle'; octx.fillText(s_, x, y); }
function big(s_, y, size, col, a = 1) { if (a <= 0) return; octx.save(); octx.globalAlpha = Math.min(1, a); octx.font = `${size}px Russo`; octx.textAlign = 'center'; octx.textBaseline = 'middle'; octx.lineJoin = 'round'; octx.lineWidth = size * 0.2; octx.strokeStyle = 'rgba(0,0,0,0.9)'; octx.strokeText(s_, 360, y); octx.fillStyle = col; octx.fillText(s_, 360, y); octx.restore(); }
// ---------- news HUD ----------
const TICK = 'DINOSAURS CONFIRMED IN 40 CITIES  ///  STAY INDOORS  ///  ALL FLIGHTS GROUNDED  ///  DO NOT APPROACH ANY ANIMAL  ///  ';
function news(T, ci) { octx.save(); octx.fillStyle = 'rgba(180,16,16,0.95)'; octx.fillRect(0, 1150, 210, 60); txt('BREAKING', 105, 1181, 30, '#fff'); octx.fillStyle = 'rgba(12,14,22,0.88)'; octx.fillRect(210, 1150, 510, 60); octx.beginPath(); octx.rect(210, 1150, 510, 60); octx.clip();
  octx.font = '600 28px CapFont'; const w = octx.measureText(TICK).width; const off = (T * 140) % w; octx.fillStyle = '#fff'; octx.textBaseline = 'middle'; octx.textAlign = 'left'; octx.fillText(TICK + TICK, 220 - off, 1181); octx.restore();
  const day = ci === 1 && T >= E.day1 - 0.1 || ci === 2 ? 'DAY 1' : ci === 3 ? 'DAY 2' : ci === 4 ? 'DAY 3' : ci >= 5 ? 'DAY 4' : null; if (day) { octx.save(); octx.fillStyle = 'rgba(12,14,22,0.85)'; octx.beginPath(); octx.roundRect(24, 40, 170, 62, 10); octx.fill(); octx.fillStyle = '#c81414'; octx.fillRect(24, 40, 10, 62); txt(day, 116, 72, 32, '#fff'); octx.restore(); }
  octx.save(); octx.fillStyle = Math.floor(T * 2) % 2 ? '#e82020' : '#901010'; octx.beginPath(); octx.arc(600, 70, 10, 0, 7); octx.fill(); txt('LIVE', 650, 71, 26, '#fff'); octx.restore(); }
window.initFootball = async function () {
  await Promise.all(['600 44px CapFont', '44px Russo'].map(f => document.fonts.load(f)));
  GLOW = ctex(64, 64, (c, w, h) => { const gr = c.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.3, 'rgba(255,255,255,0.5)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = gr; c.fillRect(0, 0, w, h); });
  glc = document.createElement('canvas'); glc.width = 360; glc.height = 640;
  renderer = new T3.WebGLRenderer({ canvas: glc, antialias: false, preserveDrawingBuffer: true }); renderer.setPixelRatio(1); renderer.setSize(360, 640, false); renderer.outputColorSpace = T3.SRGBColorSpace; renderer.toneMapping = T3.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.25; renderer.shadowMap.enabled = true; renderer.shadowMap.type = T3.PCFShadowMap;
  scene = new T3.Scene(); scene.fog = new T3.Fog('#8a86a0', 30, 320); camera = new T3.PerspectiveCamera(60, 360 / 640, 0.1, 3000); scene.add(camera);
  build(); R.sunGlow.material.fog = false; R.sunDisc.material.fog = false; out = document.getElementById('c'); octx = out.getContext('2d');
};
window.DURATION = TM.total;
window.renderFrame = function (T) { const loop = T >= E.loop; const ci = loop ? 0 : CLI(T); shot(T); renderer.render(scene, camera);
  octx.imageSmoothingEnabled = false; octx.globalCompositeOperation = 'source-over'; octx.globalAlpha = 1; octx.filter = 'contrast(1.06) saturate(0.88)'; octx.drawImage(glc, 0, 0, W, H); octx.filter = 'none'; octx.imageSmoothingEnabled = true;
  const vg = octx.createRadialGradient(360, 640, 420, 360, 640, 900); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.35)'); octx.fillStyle = vg; octx.fillRect(0, 0, W, H);
  if (ci === 4 && !loop && T > E.hunt && Math.floor(T * 4) % 2) { octx.fillStyle = 'rgba(255,160,40,0.08)'; octx.fillRect(0, 0, W, H); }
  if (ci === 0 || loop) { big("DON'T GO OUTSIDE", 330, 54, '#ff4a3a', loop ? 1 : prog(T, 0, 0.15)); }
  if (ci === 1 && T < E.day1 - 0.1) { big('66,000,000', 330, 72, '#ffd27a', prog(T, E.c1, E.c1 + 0.2)); big('YEARS LATER', 400, 44, '#fff', prog(T, E.c1 + 0.2, E.c1 + 0.4)); }
  if (ci === 3 && T > E.flight - 0.1) big('ALL FLIGHTS GROUNDED', 330, 42, '#ff4a3a', prog(T, E.flight - 0.1, E.flight + 0.1));
  if (ci === 7 && !loop) { big('WOULD YOU SURVIVE', 300, 50, '#fff', prog(T, E.c7, E.c7 + 0.2)); big('WEEK ONE?', 370, 62, '#ffd27a', prog(T, E.c7 + 0.15, E.c7 + 0.35)); if (T > E.comment - 0.1) big('COMMENT WHERE YOU\'D HIDE', 900, 34, '#fff', prog(T, E.comment - 0.1, E.comment + 0.1)); }
  if (!loop) news(T, ci);
  const cap = CAPS.find(c => T >= c.a && T < c.b); if (cap && !loop) caption(cap); };
})();
