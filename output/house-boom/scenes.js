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
const E = { yspent: AT(0, 'you'), c1: CL[1].start, roof: AT(1, 'roof'), painted: AT(1, 'painted'), fancy: AT(1, 'fancy'), c2: CL[2].start, snake: AT(2, 'snake'), c3: CL[3].start, washed: AT(3, 'washed'), watered: AT(3, 'watered'), paid: AT(3, 'paid'),
  c4: CL[4].start, perfect: AT(4, 'perfect'), dont: AT(4, "don't"), c5: CL[5].start, lit: AT(5, 'lit'), indoors: AT(5, 'indoors'), c6: CL[6].start, blew: AT(6, 'blew'), c7: CL[7].start };
E.loop = 999; E.boom = E.blew - 0.05;
const INT = [80, 0, 0];
const I3 = (x, y, z) => [INT[0] + x, INT[1] + y, INT[2] + z];
// money: every purchase knocks it down
const BUYS = [[0, 252467], [E.roof, -18000], [E.painted, -2400], [E.fancy, -6500], [E.snake, -12], [E.washed, -40], [E.watered, -15], [E.paid, -222467]];
const money = T => { if (T < E.c1) return 3033; let m = 0; BUYS.forEach(([t, d]) => { if (T >= t) m += d; }); return m; };
const TASKS = [[E.roof, 'ROOF FIXED'], [E.painted, 'WALLS PAINTED'], [E.fancy, 'FANCY COUCH'], [E.snake, 'SNAKE FED'], [E.washed, 'CAR WASHED'], [E.watered, 'PLANTS WATERED'], [E.paid, 'MORTGAGE PAID']];
function stubbleTex() { return PT(16, 8, (c) => { const r = rng(5); for (let i = 0; i < 60; i++) { c.fillStyle = 'rgba(30,20,14,0.55)'; c.fillRect((r() * 16) | 0, (r() * 8) | 0, 1, 1); } }); }
function him() { const p = person({ top: '#4a7aa8', open: '#e8e2d6', bot: '#34343a', hair: '#24160e', skin: '#c8946a' }); const h = p.userData.head; boxM(h, 0.33, 0.14, 0.02, LM({ map: stubbleTex(), transparent: true }), 0, 0.06, 0.165, false); boxM(h, 0.34, 0.08, 0.34, PM('#24160e', 20, 8, 9), 0, 0.33, -0.01); return p; }
function her() { const sk = '#c88a62'; const p = person({ top: '#ecebe6', bot: '#3a4a6a', hair: '#140e0a', skin: sk, sleeve: sk }); const h = p.userData.head; const hair = PM('#140e0a', 20, 8, 12);
  boxM(h, 0.34, 0.1, 0.34, hair, 0, 0.33, -0.01); boxM(h, 0.12, 0.34, 0.12, hair, 0, 0.12, -0.22); for (const sx of [-1, 1]) { const ring = new T3.Mesh(new T3.TorusGeometry(0.045, 0.01, 4, 10), LM({ color: '#e8c040', emissive: '#6a5000' })); ring.position.set(sx * 0.17, 0.08, 0.02); ring.rotation.y = PI / 2; h.add(ring); } return p; }
function snakeM() { const g = new T3.Group(); const m = PM('#5a8a2a', 26, 8, 61), m2 = PM('#3a6a1a', 26, 8, 62); const segs = []; for (let i = 0; i < 9; i++) { const s = boxM(g, 0.09, 0.08, 0.12, i % 2 ? m : m2, 0, 0.05, 0, false); segs.push(s); } const head = boxM(g, 0.12, 0.09, 0.15, m, 0, 0.05, 0, false); boxM(head, 0.02, 0.02, 0.02, LM({ color: '#111' }), 0.04, 0.03, 0.05, false); boxM(head, 0.02, 0.02, 0.02, LM({ color: '#111' }), -0.04, 0.03, 0.05, false); g.userData = { segs, head }; return g; }
function tank(p, x, y, z) { const g = new T3.Group(); g.position.set(x, y, z); p.add(g); boxM(g, 0.9, 0.04, 0.5, PM('#3a2a1e', 16, 8, 63), 0, 0.02, 0); boxM(g, 0.88, 0.05, 0.48, PM('#c8a868', 30, 8, 64), 0, 0.06, 0, false);
  const glass = new T3.MeshLambertMaterial({ color: '#bfe0e8', transparent: true, opacity: 0.25, depthWrite: false }); boxM(g, 0.9, 0.45, 0.5, glass, 0, 0.27, 0, false); boxM(g, 0.92, 0.03, 0.52, PM('#2a2a2e', 10, 8, 65), 0, 0.5, 0, false); const sn = snakeM(); sn.position.set(0, 0.06, 0); g.add(sn); g.userData.snake = sn; return g; }
function animSnake(sn, T, rise = 0) { const u = sn.userData; u.segs.forEach((s, i) => { const a = i * 0.7 + T * 1.2; s.position.set(Math.cos(a) * 0.16 * (1 - i * 0.04), 0.05, Math.sin(a) * 0.12); });
  const a = -0.7 + T * 1.2; u.head.position.set(Math.cos(a) * 0.17, 0.05 + rise * 0.22, Math.sin(a) * 0.13 + rise * 0.05); u.head.rotation.set(-rise * 0.8, -a, 0); }
function build() {
  R.sun = new T3.DirectionalLight('#ffd0a8', 2.0); R.sun.castShadow = true; R.sun.shadow.mapSize.set(2048, 2048); const sc = R.sun.shadow.camera; sc.left = sc.bottom = -30; sc.right = sc.top = 30; sc.near = 1; sc.far = 200; R.sun.shadow.bias = -0.0008; scene.add(R.sun); scene.add(R.sun.target);
  R.hemi = new T3.HemisphereLight('#f0b8c8', '#6a5048', 1.2); scene.add(R.hemi);
  R.skyM = new T3.MeshBasicMaterial({ side: T3.BackSide, fog: false, toneMapped: false }); R.skyM.map = PT(8, 64, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#3a4a9a'); g.addColorStop(0.32, '#c86aa8'); g.addColorStop(0.46, '#ff9a7a'); g.addColorStop(0.52, '#ffc890'); g.addColorStop(1, '#5a4a5a'); c.fillStyle = g; c.fillRect(0, 0, w, h); }); add(scene, Sp(1500, 24, 12), R.skyM, 0, 0, 0, false).castShadow = false;
  R.sunGlow = spr(scene, GLOW, '#ffb080', 200, 300, 30, -900, 0.9); R.sunDisc = spr(scene, GLOW, '#fff0d0', 50, 300, 30, -898, 1);
  // ---- the street, the lot and the beach house ----
  const G = R.G = new T3.Group(); scene.add(G); const grass = PM('#5a8a3a', 26, 16, 70), asph = PM('#4a4846', 18, 16, 71), walk = PM('#c8c0b0', 14, 16, 72), white = LM({ color: '#e8e4d8' });
  boxM(G, 400, 0.1, 400, grass, 0, -0.06, -100, false); boxM(G, 300, 0.1, 9, asph, 0, -0.01, 8, false); boxM(G, 300, 0.12, 2.6, walk, 0, 0.0, 2.6, false); for (let x = -140; x < 140; x += 6) boxM(G, 2.6, 0.02, 0.18, white, x, 0.05, 8, false);
  boxM(G, 3.2, 0.12, 6, walk, 4.5, 0.0, -0.8, false);
  const r = rng(9); for (let i = 0; i < 26; i++) { const x = -90 + i * 7 + r() * 3; if (Math.abs(x) < 8) continue; palm(G, x, 4.4 + (i % 2) * 0.6, 6 + r() * 4, 100 + i); }
  for (let i = 0; i < 6; i++) palm(G, -7 + i * 2.8 + (i > 2 ? 4 : 0), -13 - r() * 3, 7 + r() * 3, 200 + i);
  for (let i = 0; i < 18; i++) tower(G, -150 + i * 18 + r() * 8, -150 - r() * 60, 10 + r() * 8, 30 + r() * 70, 10 + r() * 8, ['#c8b8a8', '#a8b8c8', '#d8c8b8', '#b8a8c8'][i % 4], 0.3, 300 + i);
  for (let i = 0; i < 8; i++) { const sx = i < 4 ? -1 : 1, x = sx * (16 + (i % 4) * 11); const hc = ['#f0d8c8', '#c8e0e8', '#f0e0b0', '#e8c8d8'][i % 4]; boxM(G, 8, 3.2, 7, PM(hc, 14, 16, 400 + i), x, 1.6, -6, false); boxM(G, 8.4, 0.25, 7.4, PM('#f4f4f0', 10, 8, 410 + i), x, 3.3, -6, false); }
  // the house: parts that get fixed, then blown apart
  const Hs = R.house = new T3.Group(); Hs.position.set(0, 0, -6); G.add(Hs); R.parts = [];
  const wallM = R.extWall = LM({ color: '#9a948a' }), trim = PM('#f4f4f0', 10, 8, 81), glassM = LM({ color: '#4a7a9a', emissive: '#1a2a3a' }), roofM = PM('#d8d4cc', 12, 16, 82);
  const part = (w, h, d, m, x, y, z) => { const b = boxM(Hs, w, h, d, m, x, y, z); b.userData.p0 = b.position.clone(); b.userData.r0 = b.rotation.clone(); R.parts.push(b); return b; };
  part(9, 3.2, 7, wallM, 0, 1.6, 0); part(9.4, 0.3, 7.4, trim, 0, 3.35, 0); part(6.5, 2.8, 5.5, wallM, -1, 4.9, -0.5); R.roofTop = part(6.9, 0.3, 5.9, roofM, -1, 6.45, -0.5);
  R.roofHole = boxM(Hs, 2.4, 0.34, 2.0, PM('#2a2420', 10, 8, 83), -2.2, 6.47, 0.4, false);
  for (const x of [-3, 2.6]) part(2.2, 1.8, 0.1, glassM, x, 1.6, 3.52); part(3.6, 1.6, 0.1, glassM, -1, 4.9, 2.27); part(1.1, 2.2, 0.1, PM('#e86a4a', 14, 8, 84), -0.4, 1.1, 3.52);
  R.boards = []; for (const x of [-3, 2.6]) for (let k = 0; k < 3; k++) { const b = boxM(Hs, 2.4, 0.2, 0.06, PM('#8a6a42', 26, 8, 85 + k), x, 1.0 + k * 0.6, 3.6, false); b.rotation.z = (k - 1) * 0.15; R.boards.push(b); }
  R.weeds = []; for (let i = 0; i < 14; i++) { const w = boxM(G, 0.3, 0.6, 0.3, PM('#6a7a2a', 30, 8, 90 + i), -4 + i * 0.6, 0.3, -1.6 + (i % 3) * 0.3, false); R.weeds.push(w); }
  R.plants = []; for (const x of [-2.6, -1.6, 0.9]) { const pg = new T3.Group(); pg.position.set(x, 0, -1.9); G.add(pg); boxM(pg, 0.5, 0.5, 0.5, PM('#c8684a', 20, 8, 95), 0, 0.25, 0); const lf = boxM(pg, 0.6, 0.6, 0.6, PM('#4a8a3a', 30, 8, 96), 0, 0.8, 0); pg.userData.lf = lf; R.plants.push(pg); R.parts.push(pg); pg.userData.p0 = pg.position.clone(); pg.userData.r0 = pg.rotation.clone(); }
  R.sign = boxM(G, 1.6, 1.0, 0.08, LM({ map: PT(64, 40, (c) => { c.fillStyle = '#f4f0e0'; c.fillRect(0, 0, 64, 40); c.fillStyle = '#2a8a3a'; c.font = 'bold 12px Russo'; c.textAlign = 'center'; c.fillText('PAID', 32, 17); c.fillText('IN FULL', 32, 32); }) }), 2.2, 1.3, 1.9, false); boxM(G, 0.08, 0.9, 0.08, trim, 2.2, 0.45, 1.92, false);
  R.car = car(4); R.car.position.set(4.5, 0, -0.5); G.add(R.car); R.carDirt = boxM(R.car, 1.95, 0.66, 4.36, LM({ color: '#6a5a3a', transparent: true, opacity: 0.55 }), 0, 0.62, 0, false); R.parts.push(R.car); R.car.userData.p0 = R.car.position.clone(); R.car.userData.r0 = R.car.rotation.clone();
  R.bubbles = []; for (let i = 0; i < 16; i++) R.bubbles.push(spr(G, GLOW, '#ffffff', 0.35, 0, 0, 0, 0, T3.NormalBlending));
  R.water = []; for (let i = 0; i < 10; i++) R.water.push(spr(G, GLOW, '#7ac8ff', 0.15, 0, 0, 0, 0));
  R.extTank = tank(G, 0, 0.25, -5.4); boxM(G, 1.2, 0.25, 0.8, PM('#5a5450', 18, 8, 640), 0, 0.12, -5.4, false); R.extTank.visible = false;
  // explosion bits
  R.fire = []; for (let i = 0; i < 26; i++) R.fire.push(spr(G, GLOW, ['#ff4a00', '#ff8a10', '#c81800'][i % 3], 1, 0, 0, 0, 0, i % 2 ? T3.NormalBlending : T3.AdditiveBlending)); R.smoke = []; for (let i = 0; i < 26; i++) R.smoke.push(spr(G, GLOW, '#3a3434', 1, 0, 0, 0, 0, T3.NormalBlending));
  R.debris = []; for (let i = 0; i < 30; i++) { const b = boxM(G, 0.3 + r() * 0.6, 0.15 + r() * 0.3, 0.3 + r() * 0.6, PM(['#e8e4d8', '#9a948a', '#d8d4cc', '#5a4a3a'][i % 4], 18, 8, 500 + i), 0, -5, -6, false); b.userData.v = [(r() - 0.5) * 16, 6 + r() * 12, (r() - 0.5) * 12]; b.userData.s = [r() * 8, r() * 8]; R.debris.push(b); }
  R.crater = boxM(G, 9, 0.06, 7, PM('#2a2420', 20, 16, 99), 0, 0.02, -6, false); R.crater.visible = false; R.rubble = []; for (let i = 0; i < 20; i++) { let x = -4 + r() * 8, z = -9 + r() * 6; if (Math.abs(x) < 1.6 && z > -6.4) x += x < 0 ? -1.8 : 1.8; const b = boxM(G, 0.6 + r(), 0.3 + r() * 0.5, 0.6 + r(), PM(['#5a5450', '#3a3430', '#7a7068'][i % 3], 18, 8, 600 + i), x, 0.2, z, false); b.rotation.y = r() * 3; R.rubble.push(b); }
  R.burnL = new T3.PointLight('#ff8a30', 0, 30, 1.2); R.burnL.position.set(0, 3, -4); G.add(R.burnL);
  // ---- interior (living room) ----
  const I = R.I = new T3.Group(); I.position.set(...INT); scene.add(I);
  boxM(I, 8, 0.1, 6, PM('#c8a878', 22, 16, 700), 0, -0.05, 0); const iw = LM({ color: '#8a8680' }); R.intWalls = [boxM(I, 8, 3, 0.15, iw, 0, 1.5, -3), boxM(I, 0.15, 3, 6, iw, -4, 1.5, 0), boxM(I, 0.15, 3, 6, iw, 4, 1.5, 0)];
  R.intWalls.forEach(w => w.userData.col = w.material.color.clone()); boxM(I, 2.4, 1.4, 0.05, LM({ color: '#ffb890', emissive: '#a86a50' }), -1.5, 1.8, -2.9, false); boxM(I, 8, 0.1, 6, PM('#f0ece4', 10, 16, 704), 0, 3.0, 0);
  R.couch = new T3.Group(); R.couch.position.set(-0.6, 0, -1.8); I.add(R.couch); const cm = PM('#e86a8a', 20, 8, 705); boxM(R.couch, 2.6, 0.45, 0.9, cm, 0, 0.3, 0); boxM(R.couch, 2.6, 0.6, 0.25, cm, 0, 0.75, -0.35); for (const sx of [-1, 1]) boxM(R.couch, 0.25, 0.5, 0.9, cm, sx * 1.3, 0.55, 0);
  boxM(I, 1.2, 0.4, 0.7, PM('#3a2a1e', 16, 8, 706), -0.6, 0.2, -0.3); boxM(I, 0.9, 0.8, 0.5, PM('#3a2a1e', 16, 8, 707), 2.8, 0.4, -2.4); R.intTank = tank(I, 2.8, 0.8, -2.4);
  R.mouse = boxM(I, 0.08, 0.05, 0.12, PM('#b8b0a8', 20, 8, 708), 2.8, 1.5, -2.4, false); R.mouse.visible = false;
  R.lightI = new T3.PointLight('#ffd8b0', 6, 12, 1.2); R.lightI.position.set(0, 2.6, 0); I.add(R.lightI);
  R.firework = new T3.Group(); I.add(R.firework); boxM(R.firework, 0.08, 0.3, 0.08, PM('#e82a2a', 16, 8, 709), 0, 0.15, 0, false); boxM(R.firework, 0.1, 0.1, 0.1, PM('#e8c020', 10, 8, 710), 0, 0.34, 0, false); R.spark = spr(R.firework, GLOW, '#ffe080', 0.35, 0, 0.42, 0, 0);
  // the two of them
  R.him = him(); scene.add(R.him); R.her = her(); scene.add(R.her);
  R.soot = [R.him, R.her].map(p => { const b = boxM(p.userData.head, 0.33, 0.3, 0.02, LM({ color: '#1a1614', transparent: true, opacity: 0.75 }), 0, 0.15, 0.17, false); b.visible = false; return b; });
}
// ---------- shots ----------
const SH = [
  [0, (k, T) => TR(k, I3(2.4, 1.7, 2.8), I3(2.0, 1.6, 2.3), I3(0.4, 1.2, -0.4), I3(0.5, 1.3, -0.4))],
  [E.yspent - 0.1, (k, T) => TR(k, [14, 6, 16], [11, 5, 13], [0, 3, -6], [0, 3, -6])],
  [E.c1, (k, T) => TR(k, [5, 9, 6], [4, 8.5, 5], [-2, 6, -5.6], [-2, 6, -5.6])],
  [E.painted - 0.1, (k, T) => TR(k, I3(0, 1.7, 3.6), I3(0, 1.6, 3.2), I3(0, 1.3, -2.5), I3(-0.4, 1.0, -2))],
  [E.c2, (k, T) => TR(k, I3(1.9, 1.5, -1.0), I3(2.1, 1.4, -1.3), I3(2.8, 1.0, -2.4), I3(2.8, 1.0, -2.4))],
  [E.c3, (k, T) => TR(k, [8.5, 2.2, 3.5], [7.8, 2.0, 3.2], [4.5, 0.8, -0.5], [4.5, 0.8, -0.5])],
  [E.watered - 0.1, (k, T) => TR(k, [-1.0, 1.6, 1.6], [-1.3, 1.5, 1.3], [-1.8, 0.6, -1.9], [-1.8, 0.6, -1.9])],
  [E.paid - 0.1, (k, T) => TR(k, [6, 3, 12], [5, 3.5, 13], [0, 2.4, -4], [0, 2.4, -4])],
  [E.c4, (k, T) => TR(k, I3(-0.4, 1.6, 1.8), I3(-0.3, 1.6, 1.5), I3(-1.2, 1.5, -0.4), I3(-1.2, 1.5, -0.4))],
  [E.c5, (k, T) => TR(k, I3(1.6, 1.4, 1.2), I3(1.3, 1.35, 0.9), I3(0.6, 1.1, -0.2), I3(0.6, 1.0, -0.2))],
  [E.indoors - 0.1, (k, T) => TR(k, I3(0, 2.2, 3.8), I3(0, 2.0, 2.6), I3(0.4, 0.3, -0.2), I3(0.4, 0.2, -0.2))],
  [E.c6, (k, T) => TR(k, [16, 6, 18], [18, 7, 20], [0, 3, -6], [0, 4, -6])],
  [E.c7, (k, T) => TR(k, [0.2, 2.3, 6.5], [0.1, 1.2, -2.6], [0, 0.8, -4], [0, 0.5, -5.4])],
];
const shotAt = T => { let i = 0; for (let j = 0; j < SH.length; j++) if (T >= SH[j][0]) i = j; return i; };
const inside = T => { const ci = CLI(T); return ci === 0 && T < E.yspent - 0.1 || (ci === 1 && T > E.painted - 0.1) || ci === 2 || ci === 4 || ci === 5; };
function anim(T) { const ci = CLI(T), ins = inside(T); const fixedRoof = T > E.roof || ci === 0, painted = T > E.painted || ci === 0, couch = T > E.fancy || ci === 0, washed = T > E.washed + 0.4 || ci === 0, watered = T > E.watered + 0.3 || ci === 0, paid = T > E.paid || ci === 0;
  R.I.visible = ins; R.G.visible = !ins; R.sun.intensity = ins ? 0.4 : 2.0; R.hemi.intensity = ins ? 0.9 : 1.2;
  // fixing the house
  R.roofHole.visible = !fixedRoof; R.boards.forEach(b => b.visible = !fixedRoof); R.weeds.forEach(w => w.visible = !fixedRoof); R.extWall.color.set(painted ? '#f8f0e4' : '#7a6a5a');
  R.intWalls[0].material.color.set(painted ? '#6ac8c0' : '#7a7670'); R.couch.visible = couch; R.couch.scale.setScalar(ci === 1 ? ease(prog(T, E.fancy - 0.1, E.fancy + 0.3)) || 0.001 : 1);
  R.carDirt.visible = !washed; R.sign.visible = paid && ci < 6; R.plants.forEach((p, i) => p.userData.lf.scale.setScalar(watered ? 1.3 + 0.05 * S(T * 3 + i) : 0.6));
  R.bubbles.forEach((b, i) => { const on = ci === 3 && T > E.washed - 0.1 && T < E.watered; const ph = (T * 0.8 + i / 16) % 1; b.position.set(4.5 + S(i * 2.1) * 1.0, 0.6 + ph * 1.4, -0.5 + C(i * 1.7) * 2); b.material.opacity = on ? 0.8 * (1 - ph) : 0; });
  R.water.forEach((w, i) => { const on = ci === 3 && T > E.watered - 0.1 && T < E.paid; const ph = (T * 2 + i / 10) % 1; w.position.set(-1.6 + ph * 0.4, 1.4 - ph * 0.9, -1.9); w.material.opacity = on ? 0.9 : 0; });
  // snake
  animSnake(R.intTank.userData.snake, T, ci === 2 ? ease(prog(T, E.snake - 0.2, E.snake + 0.3)) : 0); R.mouse.visible = ci === 2 && T < E.snake + 0.25; R.mouse.position.y = lerp(1.6, 0.9, prog(T, E.c2, E.snake));
  // the two of them
  const hm = R.him, hr = R.her, hu = hm.userData, ru = hr.userData; stillP(hm); stillP(hr); hm.visible = hr.visible = true; R.soot.forEach(s => s.visible = false); hm.rotation.set(0, 0, 0); hr.rotation.set(0, 0, 0);
  if (ins) { hm.position.set(...I3(0.6, 0, -0.2)); hm.rotation.y = 0.5; hr.position.set(...I3(-1.4, 0, -0.6)); hr.rotation.y = 0.5;
    if (ci === 4) { hr.position.set(...I3(-1.2, 0, -0.4)); hr.rotation.y = 0.2; ru.armL.rotation.set(-0.2, 0, -0.6); ru.armR.rotation.set(-0.2, 0, 0.6); ru.armL.userData.e.rotation.set(0, 0, 1.2); ru.armR.userData.e.rotation.set(0, 0, -1.2); if (T > E.dont - 0.1) { ru.armR.rotation.set(-1.6, 0, 0); ru.armR.userData.e.rotation.set(0, 0, 0); } hm.position.set(...I3(0.6, 0, 0.2)); hm.rotation.y = -0.6; }
    if (ci === 2) { hm.position.set(...I3(3.7, 0, -1.7)); hm.rotation.y = -2.4; hu.armR.rotation.set(-1.6, 0, 0); hr.visible = false; }
    if (ci === 1) { hm.position.set(...I3(-2.6, 0, 0.6)); hm.rotation.y = -0.6; hu.armR.rotation.set(-2.2 + 0.4 * S(T * 8), 0, 0); }
    if (ci === 0 || ci === 5) { hm.position.set(...I3(0.6, 0, -0.2)); hm.rotation.y = 0.35; hu.armR.rotation.set(-1.4, 0, 0.2); hu.armR.userData.e.rotation.x = -0.6; hu.head.rotation.x = 0.35; hr.visible = ci === 5 && T < E.indoors - 0.1 ? false : ci === 0; if (ci === 5 && T > E.indoors - 0.1) { hr.visible = true; hr.position.set(...I3(-1.6, 0, -0.5)); ru.armL.rotation.set(-2.8, 0, 0); ru.armR.rotation.set(-2.8, 0, 0); } } }
  else { hm.position.set(2.6, 0, 2.4); hm.rotation.y = 0.3; hr.position.set(1.4, 0, 2.2); hr.rotation.y = 0.1; if (ci === 3 && T < E.watered - 0.1) { hm.position.set(6.2, 0, 0.6); hm.rotation.y = -PI / 2; hu.armR.rotation.set(-1.4 + 0.5 * S(T * 9), 0, 0); }
    if (ci === 3 && T > E.watered - 0.1 && T < E.paid - 0.1) { hr.position.set(-1.0, 0, -1.6); hr.rotation.y = -PI / 2; ru.armR.rotation.set(-1.3, 0, 0); }
    if (ci === 6) { hm.position.set(4, 0, 5); hm.rotation.y = 0.4; hr.position.set(2.8, 0, 5.2); hr.rotation.y = 0.2; const blast = prog(T, E.boom, E.boom + 0.3); hm.rotation.x = -0.5 * blast * (1 - prog(T, E.boom + 0.5, E.c7)); hr.rotation.x = -0.5 * blast * (1 - prog(T, E.boom + 0.5, E.c7)); }
    if (ci === 7) { hm.position.set(1.4, 0, 1.6); hm.rotation.y = -0.3; hr.position.set(-1.3, 0, 1.6); hr.rotation.y = 0.3; R.soot.forEach(s => s.visible = true); hu.head.scale.y = ru.head.scale.y = 1; } }
  // the firework: in his hand, then on the floor, fizzing
  const fw = R.firework; fw.visible = ins && (ci === 0 || ci === 5); if (fw.visible) { const onFloor = ci === 5 && T > E.indoors - 0.1; if (onFloor) { fw.position.set(0.4, 0, -0.2); fw.rotation.set(0, 0, 0); } else { hm.updateMatrixWorld(true); const v = hu.armR.userData.e.getWorldPosition(new T3.Vector3()); fw.position.set(v.x - INT[0] + 0.05, v.y - 0.45, v.z + 0.12); } }
  R.spark.material.opacity = (ci === 0 || (ci === 5 && T > E.lit)) ? 0.6 + 0.4 * S(T * 40) : 0; R.spark.scale.setScalar(0.3 + 0.12 * S(T * 33));
  // the blast
  const bt = T - E.boom, boom = ci >= 6 && bt > 0; R.house.visible = true; R.extTank.visible = ci === 7; animSnake(R.extTank.userData.snake, T, ci === 7 ? 0.6 : 0);
  R.parts.forEach((p, i) => { const u = p.userData; p.position.copy(u.p0); p.rotation.copy(u.r0); if (boom) { const d = Math.min(bt, 1.6); const dir = new T3.Vector3(u.p0.x - 0, 0, u.p0.z + (p.parent === R.house ? 0 : 6)).normalize(); p.position.set(u.p0.x + dir.x * 9 * d + S(i) * 2 * d, u.p0.y + 12 * d - 9 * d * d, u.p0.z + dir.z * 9 * d + C(i) * 2 * d); p.rotation.set(u.r0.x + d * (i % 3 + 1), u.r0.y + d * 2, u.r0.z + d * (i % 2 + 1)); p.visible = d < 1.5; } else p.visible = true; });
  R.debris.forEach((b, i) => { const u = b.userData; if (!boom) { b.position.set(0, -5, -6); return; } const d = Math.min(bt, 2.2); b.position.set(u.v[0] * d, Math.max(0.1, 2 + u.v[1] * d - 9.8 * d * d), -6 + u.v[2] * d); b.rotation.set(u.s[0] * d, u.s[1] * d, 0); });
  R.fire.forEach((f, i) => { if (!boom) { f.material.opacity = 0; return; } const k = clamp(bt / 1.4), a = i * 2.4; f.position.set(Math.cos(a) * 5 * k * (0.4 + (i % 3) * 0.3), 3 + 9 * k * (0.3 + (i % 4) * 0.2), -1.5 + Math.sin(a) * 2 * k); f.scale.setScalar(3 + 9 * k); f.material.opacity = 1 - k * 0.6; if (ci === 7) { f.position.set(-3.5 + (i % 9) * 0.9, 0.5 + 0.3 * Math.abs(S(T * 6 + i)), -8 + (i % 5) * 1.2); f.scale.setScalar(0.8 + 0.4 * Math.abs(S(T * 5 + i))); f.material.opacity = 0.9; } });
  R.smoke.forEach((s, i) => { if (!boom) { s.material.opacity = 0; return; } const k = clamp(bt / 3), a = i * 1.9; s.position.set(Math.cos(a) * 5 * k, 4 + 10 * k + (i % 5), -6 + Math.sin(a) * 3 * k); s.scale.setScalar(4 + 10 * k); s.material.opacity = 0.75 * (1 - 0.3 * k); });
  R.crater.visible = ci === 7; R.rubble.forEach(b => b.visible = ci === 7); R.burnL.intensity = boom ? (ci === 7 ? 6 + 2 * S(T * 9) : 40 * (1 - clamp(bt / 1.2)) + 8) : 0;
  if (ci === 7) R.parts.forEach(p => p.visible = false); }
function shot(T) { const si = shotAt(T), sh = SH[si], t0 = sh[0], t1 = si + 1 < SH.length ? SH[si + 1][0] : TM.total; camera.fov = 60; camera.updateProjectionMatrix(); anim(T); sh[1](prog(T, t0, t1), T);
  const bt = T - E.boom; if (bt > 0 && bt < 1.2) { const a = 0.35 * (1 - bt / 1.2); camera.position.x += a * S(T * 70); camera.position.y += a * S(T * 53 + 1); }
  const c = camera.position; R.sun.position.set(c.x + 40, 50, c.z + 30); R.sun.target.position.set(c.x, 0, c.z - 6); R.sun.target.updateMatrixWorld(); return { si, t0 }; }
// ---------- captions (game-style subtitles) ----------
const NUMW = { one: '1', two: '2', three: '3' };
const CAPS = []; CL.forEach(c0 => { let cur = []; const flush = () => { if (cur.length) CAPS.push({ a: cur[0].a, b: cur[cur.length - 1].b, t: cur.map(w => w.w).join(' ') }); cur = []; };
  c0.words.forEach((w0, j) => { const w = Object.assign({}, w0, { w: /^fucking$/i.test(w0.w) ? 'f***ing' : /^forty$/i.test(w0.w) ? '40' : w0.w }); const prev = cur[cur.length - 1]; if (cur.length && (/^day$/i.test(w.w) || cur.length >= 3 || w.a - prev.b > 0.25 || w.a - prev.a > 0.6 || /[.,!?]$/.test(prev.w))) flush(); cur.push(w); }); flush(); });
CL.forEach((c0, ci) => CAPS.forEach(c => { if (ci === 4 && c.a >= AT(4, "it's") - 0.05 && c.a < c0.start + c0.dur) c.who = 'HER'; }));
CAPS.forEach((c, i) => { const nx = CAPS[i + 1]; c.b = nx ? Math.min(nx.a, c.b + 0.3) : c.b + 0.6; });
function caption(c) { octx.save(); octx.font = '600 46px CapFont'; octx.textAlign = 'center'; octx.textBaseline = 'middle'; octx.lineJoin = 'round'; octx.lineWidth = 10; octx.strokeStyle = 'rgba(0,0,0,0.9)'; octx.strokeText(c.t, 360, 1010); octx.fillStyle = c.who ? '#ff9ac8' : '#ffffff'; octx.fillText(c.t, 360, 1010); if (c.who) { octx.font = '600 30px CapFont'; octx.lineWidth = 8; octx.strokeText(c.who, 360, 958); octx.fillStyle = '#ff9ac8'; octx.fillText(c.who, 360, 958); } octx.restore(); }
function txt(s_, x, y, size, col, font = 'Russo', align = 'center') { octx.font = `${size}px ${font}`; octx.fillStyle = col; octx.textAlign = align; octx.textBaseline = 'middle'; octx.fillText(s_, x, y); }
function big(s_, y, size, col, a = 1) { if (a <= 0) return; octx.save(); octx.globalAlpha = Math.min(1, a); octx.font = `${size}px Russo`; octx.textAlign = 'center'; octx.textBaseline = 'middle'; octx.lineJoin = 'round'; octx.lineWidth = size * 0.2; octx.strokeStyle = 'rgba(0,0,0,0.9)'; octx.strokeText(s_, 360, y); octx.fillStyle = col; octx.fillText(s_, 360, y); octx.restore(); }
// ---------- game HUD ----------
function hud(T) { const ci = CLI(T); const m = money(T); const neg = ci >= 6;
  octx.save(); octx.font = '44px Russo'; octx.textAlign = 'right'; octx.textBaseline = 'middle'; octx.lineJoin = 'round'; octx.lineWidth = 9; octx.strokeStyle = 'rgba(0,0,0,0.9)'; const ms = '$' + m.toLocaleString('en-US'); octx.strokeText(ms, 690, 70); octx.fillStyle = neg && Math.floor(T * 4) % 2 ? '#ff4a3a' : '#7ae07a'; octx.fillText(ms, 690, 70);
  const lastBuy = BUYS.filter(([t]) => t > 0.5 && T >= t && T < t + 0.9).pop(); if (lastBuy) { octx.font = '30px Russo'; octx.globalAlpha = 1 - prog(T, lastBuy[0] + 0.5, lastBuy[0] + 0.9); const d = '-$' + Math.abs(lastBuy[1]).toLocaleString('en-US'); octx.strokeText(d, 690, 115); octx.fillStyle = '#ff6a5a'; octx.fillText(d, 690, 115); } octx.restore();
  // minimap
  octx.save(); octx.beginPath(); octx.arc(120, 1140, 95, 0, 7); octx.fillStyle = 'rgba(30,40,50,0.85)'; octx.fill(); octx.clip(); octx.fillStyle = '#5a7a4a'; octx.fillRect(20, 1040, 200, 200); octx.fillStyle = '#d8d0c0'; octx.fillRect(20, 1162, 200, 18); octx.fillRect(150, 1040, 14, 200); octx.fillStyle = '#4a8ac8'; octx.fillRect(20, 1040, 60, 200);
    octx.fillStyle = neg ? '#ff3a2a' : '#f0e8d8'; octx.fillRect(100, 1110, 34, 26); octx.restore(); octx.save(); octx.strokeStyle = '#111'; octx.lineWidth = 5; octx.beginPath(); octx.arc(120, 1140, 95, 0, 7); octx.stroke(); octx.translate(120, 1150); octx.fillStyle = '#fff'; octx.beginPath(); octx.moveTo(0, -12); octx.lineTo(9, 9); octx.lineTo(-9, 9); octx.fill(); octx.restore();
  // task complete pop-ups
  const tk = TASKS.filter(([t]) => T >= t - 0.05 && T < t + 1.1).pop(); if (tk && ci >= 1 && ci <= 3) { const a = Math.min(1, prog(T, tk[0] - 0.05, tk[0] + 0.1)) * (1 - prog(T, tk[0] + 0.8, tk[0] + 1.1)); octx.save(); octx.globalAlpha = a; octx.fillStyle = 'rgba(0,0,0,0.7)'; octx.fillRect(0, 300, W, 120); txt('TASK COMPLETE', 360, 335, 44, '#ffd23a'); txt(tk[1], 360, 388, 30, '#fff'); octx.restore(); } }
window.initFootball = async function () {
  await Promise.all(['600 44px CapFont', '44px Russo'].map(f => document.fonts.load(f)));
  GLOW = ctex(64, 64, (c, w, h) => { const gr = c.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.3, 'rgba(255,255,255,0.5)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = gr; c.fillRect(0, 0, w, h); });
  glc = document.createElement('canvas'); glc.width = 360; glc.height = 640;
  renderer = new T3.WebGLRenderer({ canvas: glc, antialias: false, preserveDrawingBuffer: true }); renderer.setPixelRatio(1); renderer.setSize(360, 640, false); renderer.outputColorSpace = T3.SRGBColorSpace; renderer.toneMapping = T3.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.25; renderer.shadowMap.enabled = true; renderer.shadowMap.type = T3.PCFShadowMap;
  scene = new T3.Scene(); scene.fog = new T3.Fog('#8a86a0', 30, 320); camera = new T3.PerspectiveCamera(60, 360 / 640, 0.1, 3000); scene.add(camera);
  build(); R.sunGlow.material.fog = false; scene.fog.color.set('#c89aa8'); scene.fog.near = 60; scene.fog.far = 420; R.sunDisc.material.fog = false; out = document.getElementById('c'); octx = out.getContext('2d');
};
window.DURATION = TM.total;
window.renderFrame = function (T) { const loop = T >= E.loop; const ci = loop ? 0 : CLI(T); shot(T); renderer.render(scene, camera);
  octx.imageSmoothingEnabled = false; octx.globalCompositeOperation = 'source-over'; octx.globalAlpha = 1; octx.filter = 'contrast(1.06) saturate(0.88)'; octx.drawImage(glc, 0, 0, W, H); octx.filter = 'none'; octx.imageSmoothingEnabled = true;
  const vg = octx.createRadialGradient(360, 640, 420, 360, 640, 900); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.35)'); octx.fillStyle = vg; octx.fillRect(0, 0, W, H);
  const bt = T - E.boom;
  if (bt > 0 && bt < 0.5) { octx.fillStyle = `rgba(255,245,220,${1 - bt / 0.5})`; octx.fillRect(0, 0, W, H); }
  hud(T);
  if (ci === 0) { big("DON'T LIGHT IT", 470, 62, '#ff4a3a', prog(T, 0, 0.15)); if (T > E.yspent - 0.1) big('40 HOURS OF WORK', 550, 44, '#fff', prog(T, E.yspent - 0.1, E.yspent + 0.1)); }
  if (ci === 4 && T > E.dont - 0.1) big("DON'T TOUCH ANYTHING", 500, 44, '#ff9ac8', prog(T, E.dont - 0.1, E.dont + 0.1));
  if (ci === 5 && T > E.indoors - 0.1) big('INDOORS', 480, 76, '#ffd23a', prog(T, E.indoors - 0.1, E.indoors + 0.1));
  if (bt > 0.15 && ci === 6) { const a = prog(T, E.boom + 0.15, E.boom + 0.4); octx.save(); octx.globalAlpha = a; octx.fillStyle = 'rgba(0,0,0,0.65)'; octx.fillRect(0, 420, W, 150); octx.restore(); big('HOUSE DESTROYED', 495, 64, '#ff3a2a', a); }
  if (ci === 7 && T > AT(7, 'survived') - 0.1) big('SNAKE: FINE', 470, 56, '#7ae07a', prog(T, AT(7, 'survived') - 0.1, AT(7, 'survived') + 0.1));
  const cap = CAPS.find(c => T >= c.a && T < c.b); if (cap && !loop) caption(cap); };
})();
