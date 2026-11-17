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

// ---------- helpers ----------
function rod(p, a, b, r, mat, sh = true) { const A = new T3.Vector3(...a), B = new T3.Vector3(...b); const L = A.distanceTo(B); const m = add(p, Cy(r, r, L, 12), mat, 0, 0, 0, sh); m.position.copy(A).lerp(B, 0.5); m.quaternion.setFromUnitVectors(new T3.Vector3(0, 1, 0), B.clone().sub(A).normalize()); return m; }
function wheelR(r, o = {}) { const w = new T3.Group(); const rub = SM(o.tyreCol || '#1c1c1e', { roughness: 0.85 }); const rimM = o.rimM || SM('#c8ccd2', { metalness: 0.9, roughness: 0.25 });
  w.userData.tyre = add(w, new T3.TorusGeometry(r, o.tyre || 0.028, 14, 48), rub, 0, 0, 0); add(w, new T3.TorusGeometry(r - (o.tyre || 0.028) - 0.008, o.rim || 0.012, 8, 48), rimM, 0, 0, 0);
  const n = o.spokes || 24, sm = o.spokeM || SM('#d8dce0', { metalness: 0.9, roughness: 0.3 }); for (let i = 0; i < n; i++) { const a = i / n * 2 * PI; rod(w, [0, 0, (i % 2 ? 0.02 : -0.02)], [C(a) * (r - 0.04), S(a) * (r - 0.04), 0], o.spokeR || 0.0035, sm, false); }
  add(w, Cy(0.03, 0.03, 0.09, 14), SM('#9aa0a6', { metalness: 0.8, roughness: 0.3 }), 0, 0, 0).rotation.x = PI / 2; return w; }
function crankR(p, x, y, len = 0.16) { const c = new T3.Group(); c.position.set(x, y, 0); p.add(c); const m = SM('#7a7e84', { metalness: 0.8, roughness: 0.35 }); for (const s of [-1, 1]) { const arm = new T3.Group(); arm.rotation.z = s > 0 ? 0 : PI; c.add(arm); rod(arm, [0, 0, 0.07 * s], [0, -len, 0.07 * s], 0.012, m); add(arm, RB(0.09, 0.025, 0.07, 0.008), SM('#2a2a2a', { roughness: 0.7 }), 0, -len, 0.11 * s); } return c; }
const WOOD = () => SM('#8a5a32', { roughness: 0.7, map: noiseTex(64, 256, '#8a5a32', [['rgba(60,30,10,0.25)', 300, 2], ['rgba(255,220,180,0.06)', 200, 2]], 5, [1, 1]) });
const IRON = () => SM('#2c2c2e', { metalness: 0.7, roughness: 0.45 });
const LEATHER = () => SM('#5a3420', { roughness: 0.55 });
// ---------- street ----------
function houseR(p, x, z, brick, door, seed) { const g = new T3.Group(); g.position.set(x, 0, z); p.add(g); const bt = brickTex(brick, seed); bt.repeat.set(3, 2);
  add(g, Bx(7.6, 6.2, 7), SM('#ffffff', { map: bt, roughness: 0.9 }), 0, 3.1, 0); const roof = add(g, new T3.CylinderGeometry(0.01, 5.4, 2.6, 4, 1), SM('#4a4e56', { roughness: 0.75 }), 0, 7.5, 0); roof.rotation.y = PI / 4; roof.scale.z = 0.95;
  const glass = SM('#9ab4c8', { metalness: 0.3, roughness: 0.05, envMapIntensity: 1.4 }); const frm = SM('#f2f0ea', { roughness: 0.5 });
  for (const [wx, wy] of [[-2.2, 1.7], [2.2, 1.7], [-2.2, 4.5], [0, 4.5], [2.2, 4.5]]) { add(g, RB(1.3, 1.5, 0.12, 0.03), frm, wx, wy, 3.52); add(g, Bx(1.1, 1.3, 0.05), glass, wx, wy, 3.6); add(g, Bx(1.1, 0.04, 0.06), frm, wx, wy, 3.63); }
  add(g, RB(1.2, 2.3, 0.12, 0.03), SM(door, { roughness: 0.4 }), 0, 1.15, 3.54); add(g, Sp(0.05), SM('#c8a040', { metalness: 1, roughness: 0.3 }), 0.4, 1.1, 3.62);
  add(g, Bx(7.8, 0.25, 0.3), SM('#e8e4dc'), 0, 6.2, 3.55); return g; }
function treeR(p, x, z, s, seed) { const r = rng(seed); add(p, Cy(0.1 * s, 0.16 * s, 2.6 * s, 10), SM('#5a4030', { roughness: 1 }), x, 1.3 * s, z); const col = ['#3a6a2a', '#4a7a32', '#2e5a26', '#5a8a3a'][Math.floor(r() * 4)]; for (let k = 0; k < 6; k++) add(p, Sp((0.9 + r() * 0.6) * s, 16, 12), SM(col, { roughness: 0.95 }), x + (r() - 0.5) * 1.4 * s, (2.8 + r() * 1.4) * s, z + (r() - 0.5) * 1.4 * s); }
function hedge(p, x, z, w) { for (let i = 0; i < w / 0.7; i++) add(p, Sp(0.45, 12, 8), SM(i % 2 ? '#3a5a2a' : '#456a30', { roughness: 1 }), x - w / 2 + i * 0.7, 0.4, z).scale.set(1, 0.9, 0.8); }
function lamp(p, x, z) { const m = SM('#2a2c30', { metalness: 0.7, roughness: 0.4 }); add(p, Cy(0.05, 0.08, 4.5, 10), m, x, 2.25, z); rod(p, [x, 4.4, z], [x, 4.6, z + 0.8], 0.04, m); add(p, RB(0.35, 0.12, 0.5, 0.04), SM('#e8e8e0', { emissive: '#fff4d0', emissiveIntensity: 0.2 }), x, 4.55, z + 0.95); }
const CARCOL = ['#c83a2a', '#e8e8ec', '#2a2a30', '#3a5a8a', '#8a8a90', '#d8c8a0'];
function carR(p, x, z, seed) { const r = rng(seed); const g = new T3.Group(); g.position.set(x, 0, z); g.rotation.y = PI / 2; p.add(g); const paint = SM(CARCOL[Math.floor(r() * 6)], { metalness: 0.6, roughness: 0.28 }); add(g, RB(1.8, 0.7, 4.3, 0.15), paint, 0, 0.6, 0); add(g, RB(1.6, 0.6, 2.3, 0.2), paint, 0, 1.15, -0.2); add(g, RB(1.62, 0.45, 2.1, 0.15), SM('#1a2430', { metalness: 0.4, roughness: 0.08 }), 0, 1.18, -0.2); for (const [wx, wz] of [[-0.85, 1.4], [0.85, 1.4], [-0.85, -1.4], [0.85, -1.4]]) add(g, Cy(0.33, 0.33, 0.22, 18), SM('#151515', { roughness: 0.7 }), wx, 0.33, wz).rotation.z = PI / 2; return g; }

function face(p, kind, T) { const u = p.userData; u.mouth.scale.set(1, 1, 1); u.brows.forEach(b => { b.rotation.z = PI / 2 + b.userData.sx * 0.12; b.position.y = 0.04; });
  if (kind === 'angry') u.brows.forEach(b => { b.rotation.z = PI / 2 - b.userData.sx * 0.45; b.position.y = 0.034; });
  if (kind === 'shock') { u.mouth.scale.set(0.8, 3.2, 1); u.brows.forEach(b => b.position.y = 0.05); }
  if (kind === 'grin') u.mouth.scale.set(1.5, 1.4, 1);
  if (kind === 'smug') { u.mouth.scale.set(1.3, 1, 1); u.brows.forEach(b => { b.rotation.z = PI / 2 + b.userData.sx * 0.12 + (b.userData.sx > 0 ? 0.3 : 0); b.position.y = b.userData.sx > 0 ? 0.048 : 0.038; }); }
  if (kind === 'yell') { u.mouth.scale.set(1.2, 2.6 + Math.abs(S(T * 18)), 1); u.brows.forEach(b => { b.rotation.z = PI / 2 - b.userData.sx * 0.4; }); } }

// ---------- timing ----------
const E = { million0: AT(0, 'million'), c1: CL[1].start, bro1: AT(1, 'bro'), c2: CL[2].start, p1: AT(2, 'press') + 0.15, bro2: AT(2, 'bro'), c3: CL[3].start, p2: AT(3, 'again'), house: AT(3, 'he'),
  c4: CL[4].start, p3: AT(4, 'again'), renames: AT(4, 'he'), broSt: AT(4, 'bro'), c5: CL[5].start, billion: AT(5, 'bro'), c6: CL[6].start, c7: CL[7].start, c8: CL[8].start, comment: AT(8, 'comment') };
E.loop = TM.total - 0.4;
E.mont = []; for (let i = 0; i < 7; i++) E.mont.push(E.c5 + 0.35 + i * 0.36);
const PRESSES = [E.p1, E.p2, E.p3, ...E.mont];
const nPress = T => T >= E.loop ? 0 : PRESSES.filter(p => T >= p).length;
const fmt = m => m >= 1000 ? '£' + (m / 1000).toFixed(2) + 'B' : '£' + m + 'M';
function billTex() { return ctex(128, 64, (c, w, h) => { c.fillStyle = '#6ac46a'; c.fillRect(0, 0, w, h); c.strokeStyle = '#2a7a3a'; c.lineWidth = 4; c.strokeRect(5, 5, w - 10, h - 10); c.fillStyle = '#2a7a3a'; c.beginPath(); c.arc(64, 32, 16, 0, 7); c.fill(); c.fillStyle = '#d8f4c8'; c.font = '24px Russo'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('£', 64, 33); }); }
function signTex(t, bg = '#2a8a4a') { return ctex(256, 72, (c, w, h) => { c.fillStyle = bg; c.fillRect(0, 0, w, h); c.strokeStyle = '#fff'; c.lineWidth = 5; c.strokeRect(6, 6, w - 12, h - 12); c.fillStyle = '#fff'; c.font = '44px Russo'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(t, w / 2, h / 2 + 2); }); }
function build() {
  R.sun = new T3.DirectionalLight('#fff0dc', 2.6); R.sun.position.set(4, 9, 7); R.sun.castShadow = true; R.sun.shadow.mapSize.set(2048, 2048); const sc = R.sun.shadow.camera; sc.left = sc.bottom = -7; sc.right = sc.top = 7; sc.near = 1; sc.far = 40; R.sun.shadow.bias = -0.0005; scene.add(R.sun); scene.add(R.sun.target);
  R.hemi = new T3.HemisphereLight('#ffe8d0', '#8a6a5a', 1.25); scene.add(R.hemi);
  const sky = ctex(16, 512, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#7ab8f0'); g.addColorStop(0.45, '#bfe0f8'); g.addColorStop(0.55, '#ffe6c0'); g.addColorStop(1, '#f4c890'); c.fillStyle = g; c.fillRect(0, 0, w, h); });
  add(scene, Sp(80, 32, 16), new T3.MeshBasicMaterial({ map: sky, side: T3.BackSide, toneMapped: false }), 0, 0, 0, false).castShadow = false;
  const G = R.G = new T3.Group(); scene.add(G);
  add(G, Cy(9, 9, 0.2, 64), SM('#8ad06a'), 0, -0.1, -2, false); add(G, Cy(3.2, 3.2, 0.06, 64), SM('#f4e2b8'), 0, 0.03, 0.2, false); add(G, Cy(3.0, 3.0, 0.065, 64), SM('#f8ecd0'), 0, 0.035, 0.2, false);
  // the button
  add(G, Cy(0.5, 0.6, 0.1, 32), SM('#3a3e4a'), 0, 0.05, 0); add(G, Cy(0.28, 0.34, 0.95, 32), SM('#e8e8ee'), 0, 0.55, 0); add(G, Cy(0.38, 0.38, 0.12, 32), SM('#ffd23a'), 0, 1.06, 0); add(G, Cy(0.34, 0.34, 0.03, 32), SM('#222'), 0, 1.13, 0);
  R.btn = add(G, new T3.SphereGeometry(0.26, 32, 16, 0, PI * 2, 0, PI / 2), SM('#e8282a', { emissive: '#ff2a2a', emissiveIntensity: 0.15 }), 0, 1.13, 0); R.btn.scale.y = 0.7;
  R.btnGlow = spr(G, GLOW, '#ff5a3a', 1.6, 0, 1.25, 0, 0);
  // you and bro
  R.you = human({ top: '#e8453a', bot: '#2e3550', hair: '#3a2416', skin: '#e4b08a' }); G.add(R.you); R.bro = human({ top: '#2aa84a', bot: '#3a3a44', hair: '#1a1210', skin: '#c88a60' }); G.add(R.bro);
  // bro bling: gold chain + shades (shown when rich)
  const bu = R.bro.userData; R.chain = add(bu.up, new T3.TorusGeometry(0.15, 0.022, 8, 24), SM('#ffc83a', { metalness: 0.8, roughness: 0.25, emissive: '#6a4a00', emissiveIntensity: 0.3 }), 0, 0.55, 0.06); R.chain.rotation.x = 1.25; R.chain.scale.set(1, 1.2, 1);
  R.shades = new T3.Group(); bu.head.add(R.shades); for (const sx of [-1, 1]) add(R.shades, Bx(0.085, 0.05, 0.02), SM('#111'), sx * 0.052, 0.012, 0.145); add(R.shades, Bx(0.04, 0.012, 0.02), SM('#111'), 0, 0.025, 0.145);
  R.phone = new T3.Group(); R.you.userData.armR.userData.h.add(R.phone); R.phone.position.set(-0.02, -0.06, 0.05); add(R.phone, RB(0.09, 0.17, 0.014, 0.012), SM('#1a1a1e'), 0, 0, 0);
  // cash piles
  const bm = SM('#ffffff', { map: billTex() }), side = SM('#4aa04a'); R.youCash = []; R.broCash = [];
  const brick = (p, x, y, z) => { const m = new T3.Mesh(Bx(0.32, 0.08, 0.16), [side, side, bm, side, side, side]); m.position.set(x, y, z); m.castShadow = true; p.add(m); return m; };
  for (let i = 0; i < 20; i++) R.youCash.push(brick(G, -1.25 + (i % 2) * 0.34, 0.08 + Math.floor(i / 2) * 0.085, 0.75));
  for (let i = 0; i < 64; i++) { const lay = Math.floor(i / 16), k = i % 16; R.broCash.push(brick(G, 1.25 + (k % 4) * 0.34 - lay * 0.0, 0.08 + lay * 0.085, 0.35 + Math.floor(k / 4) * 0.17)); }
  R.throne = new T3.Mesh(Bx(1.4, 1.0, 1.0), [side, side, SM('#ffffff', { map: (() => { const t = billTex(); t.wrapS = t.wrapT = T3.RepeatWrapping; t.repeat.set(4, 6); return t; })() }), side, SM('#ffffff', { map: (() => { const t = billTex(); t.wrapS = t.wrapT = T3.RepeatWrapping; t.repeat.set(4, 12); return t; })() }), side]); R.throne.position.set(1.4, 0.5, 0.2); R.throne.castShadow = true; G.add(R.throne);
  // the house bro buys (your house) and the street sign
  const hs = R.house = new T3.Group(); hs.position.set(2.2, 0, -3.6); G.add(hs); add(hs, Bx(3, 2.2, 2.4), SM('#f4ecd8'), 0, 1.1, 0); const roof = add(hs, Cy(0.01, 2.4, 1.4, 4), SM('#c8463a'), 0, 2.9, 0); roof.rotation.y = PI / 4; roof.scale.set(1.3, 1, 1.05);
  add(hs, Bx(0.6, 1.1, 0.05), SM('#7a4a2a'), 0, 0.55, 1.21); for (const x of [-0.95, 0.95]) { add(hs, Bx(0.6, 0.55, 0.05), SM('#8ac8f0'), x, 1.35, 1.21); add(hs, Bx(0.7, 0.08, 0.08), SM('#ffffff'), x, 1.05, 1.24); }
  R.sold = new T3.Group(); R.sold.position.set(-1.3, 0, 1.8); hs.add(R.sold); add(R.sold, Bx(0.06, 1.1, 0.06), SM('#7a4a2a'), 0, 0.55, 0); R.soldM = add(R.sold, new T3.PlaneGeometry(0.9, 0.3), BM('#ffffff', { map: signTex("BRO'S NOW", '#d8282a') }), 0, 1.0, 0.04, false);
  R.street = new T3.Group(); R.street.position.set(-2.0, 0, -1.2); G.add(R.street); add(R.street, Cy(0.04, 0.04, 2.6, 10), SM('#8a8e94'), 0, 1.3, 0); R.stA = add(R.street, new T3.PlaneGeometry(1.2, 0.34), BM('#ffffff', { map: signTex('MAPLE ST') }), 0, 2.45, 0.05, false); R.stB = add(R.street, new T3.PlaneGeometry(1.2, 0.34), BM('#ffffff', { map: signTex('BRO ST') }), 0, 2.45, 0.05, false);
  // money rain
  R.rain = []; for (let i = 0; i < 46; i++) { const m = add(G, new T3.PlaneGeometry(0.22, 0.11), new T3.MeshBasicMaterial({ map: billTex(), side: T3.DoubleSide }), 0, -5, 0, false); m.castShadow = false; R.rain.push(m); }
}
// ---------- shots ----------
const SH = [
  [0, (k, T) => TR(k, [0.05, 1.5, 1.7], [0.04, 1.42, 1.25], [0, 1.08, 0], [0, 1.1, 0])],
  [E.c1 - 0.05, (k, T) => TR(k, [0.2, 1.65, 4.6], [0.2, 1.6, 4.2], [0.2, 0.95, 0], [0.2, 0.95, 0])],
  [E.c2, (k, T) => TR(k, [-0.25, 1.75, 1.35], [-0.2, 1.7, 1.2], [-0.1, 1.1, 0], [-0.1, 1.1, 0])],
  [E.bro2 - 0.1, (k, T) => TR(k, [1.0, 1.5, 3.0], [1.0, 1.5, 2.7], [1.2, 1.0, 0.3], [1.2, 1.0, 0.3])],
  [E.c3 - 0.05, (k, T) => TR(k, [-0.25, 1.75, 1.35], [-0.2, 1.7, 1.2], [-0.1, 1.1, 0], [-0.1, 1.1, 0])],
  [E.house - 0.6, (k, T) => TR(k, [0.4, 2.0, 6.4], [0.5, 2.2, 6.0], [1.4, 1.4, -2], [1.4, 1.6, -2])],
  [E.c4 - 0.05, (k, T) => TR(k, [-0.25, 1.75, 1.35], [-0.2, 1.7, 1.2], [-0.1, 1.1, 0], [-0.1, 1.1, 0])],
  [E.renames - 0.1, (k, T) => TR(k, [-1.4, 2.1, 1.6], [-1.5, 2.2, 1.2], [-2.0, 2.2, -1.2], [-2.0, 2.4, -1.2])],
  [E.c5, (k, T) => { const sh = 0.02 * S(T * 60); look([-0.2 + sh, 1.7, 1.25], [-0.1, 1.1, 0]); }],
  [E.billion - 0.15, (k, T) => TR(k, [0.6, 1.6, 3.6], [0.8, 1.5, 3.0], [1.4, 1.3, 0.2], [1.4, 1.4, 0.2])],
  [E.c6, (k, T) => TR(k, [-0.4, 1.6, 1.4], [-0.45, 1.58, 1.15], [-0.78, 1.5, 0.1], [-0.78, 1.5, 0.1])],
  [E.c8, (k, T) => TR(k, [0.2, 1.9, 5.2], [0.2, 1.75, 4.6], [0.2, 1.0, 0], [0.2, 1.0, 0])],
  [E.loop, (k, T) => look([0.05, 1.5, 1.7], [0, 1.08, 0])],
];
const shotAt = T => { let i = 0; for (let j = 0; j < SH.length; j++) if (T >= SH[j][0]) i = j; return i; };
function anim(T) { const loop = T >= E.loop, ci = loop ? 0 : CLI(T), n = nPress(T); const you = R.you, bro = R.bro, u = you.userData, b = bro.userData; rest(you); rest(bro);
  // button press: last press time drives the hand + button travel
  const lp = PRESSES.filter(p => T >= p - 0.15).pop(); const pk = lp !== undefined && !loop ? Math.max(0, 1 - Math.abs(T - lp) / 0.15) : 0; R.btn.position.y = 1.13 - 0.07 * pk; R.btnGlow.material.opacity = (ci === 0 || ci === 8 || loop ? 0.35 + 0.2 * S(T * 5) : 0) + pk * 0.8;
  you.position.set(-0.62, 0, 0.12); you.rotation.y = PI / 2 - 0.35; face(you, 'neutral', T);
  const reach = ci === 0 || loop ? 0.55 : (lp !== undefined && T - lp < 0.5 && T - lp > -0.2 ? 1 : 0.25); u.armR.rotation.set(-1.0 - 0.6 * reach + 0.5 * pk, 0, 0.25); u.armR.userData.e.rotation.x = -0.4 + 0.3 * pk; u.up.rotation.x = 0.08 + 0.12 * pk;
  bro.visible = !(ci === 0 || loop) && !(ci === 1 && T < E.bro1 - 0.1); const pop = ci === 1 ? ease(prog(T, E.bro1 - 0.1, E.bro1 + 0.15)) : 1; bro.scale.setScalar(Math.max(0.01, pop)); bro.position.set(0.95, 0, 0.15); bro.rotation.y = -0.55; face(bro, 'grin', T);
  const rich = n >= 4 || ci >= 5; R.chain.visible = n >= 2 && !loop; R.shades.visible = rich && !loop;
  if (lp !== undefined && T - lp > 0 && T - lp < 0.6 && !loop) { bro.position.y = 0.25 * S(PI * prog(T, lp, lp + 0.45)); b.armL.rotation.set(-2.8, 0, 0.2); b.armR.rotation.set(-2.8, 0, -0.2); }
  if (ci === 5 && T > E.billion - 0.15 || ci >= 6 && !loop) { seatPose(bro, 1.0); bro.position.x = 1.4; bro.position.z = 0.25; bro.rotation.y = -0.35; b.armL.rotation.set(-0.4, 0, -0.9); b.armR.rotation.set(-0.4, 0, 0.9); face(bro, 'smug', T); }
  if (ci === 7) { b.armR.rotation.set(-1.4, 0, 0.2); b.armR.userData.e.rotation.x = -1.3; face(bro, 'smug', T); b.mouth.scale.y = 1 + Math.abs(S(T * 16)) * 1.6; }
  if (ci >= 3 && ci <= 5) face(you, 'shock', T); if (ci === 6 || ci === 7) { R.phone.visible = true; u.armR.rotation.set(-1.15, 0, 0.25); u.armR.userData.e.rotation.set(-1.25, 0, 0); you.rotation.y = 0.3; face(you, 'shock', T); u.head.rotation.x = 0.2; } else R.phone.visible = false;
  if (ci === 8) { you.rotation.y = 0.4; face(you, 'neutral', T); u.armR.rotation.set(-0.9, 0, 0.25); }
  // cash piles: you grow by 1 per press, bro doubles
  const yN = Math.min(20, n * 2); R.youCash.forEach((m, i) => m.visible = i < yN && !loop); const bN = Math.min(64, Math.round(2 ** n)); R.broCash.forEach((m, i) => m.visible = i < bN && !loop && !(ci >= 5 && T > E.billion - 0.15));
  R.throne.visible = !loop && (ci >= 6 || (ci === 5 && T > E.billion - 0.15)); if (R.throne.visible) R.throne.scale.setScalar(ci === 5 ? 0.3 + 0.7 * ease(prog(T, E.billion - 0.15, E.billion + 0.2)) : 1);
  // house drops in, sign says it's bro's now
  const hk = ci < 3 || loop ? -1 : ci === 3 ? prog(T, E.house - 0.4, E.house + 0.1) : 1; R.house.visible = hk >= 0; R.house.position.y = hk >= 0 ? (hk < 1 ? lerp(9, 0, hk * hk) : 0.12 * Math.max(0, S((T - E.house - 0.1) * 18)) * Math.exp(-(T - E.house - 0.1) * 6)) : 0; R.sold.visible = hk >= 1 && T > E.house + 0.35 || ci > 3;
  R.street.visible = ci >= 4 && !loop; const flip = ci > 4 || (ci === 4 && T > E.broSt - 0.1); R.stA.visible = !flip; R.stB.visible = flip; R.street.rotation.y = ci === 4 ? 0.0 + (Math.abs(T - E.broSt) < 0.2 ? (0.2 - Math.abs(T - E.broSt)) * 15 : 0) : 0;
  // money rain once bro is a billionaire
  const rainOn = !loop && (ci === 5 && T > E.billion - 0.3 || ci >= 6); R.rain.forEach((m, i) => { m.visible = rainOn; if (!rainOn) return; const ph = (T * 0.35 + i * 0.137) % 1; m.position.set(1.4 + S(i * 2.3) * 2.2, 4.2 - ph * 4.4, 0.2 + C(i * 1.7) * 1.6); m.rotation.set(T * 3 + i, T * 2 + i * 0.5, S(T * 4 + i)); }); }
function shot(T) { const si = shotAt(T), sh = SH[si], t0 = sh[0], t1 = si + 1 < SH.length ? SH[si + 1][0] : TM.total; camera.fov = 58; camera.updateProjectionMatrix(); anim(T); sh[1](prog(T, t0, t1), T); return { si, t0 }; }

// ===================== CEL-SHADED TOON LOOK (ink outlines, 2-tone shading, cartoon people) =====================
// cartoon person with the same rig/API as human(): up, head, mouth, brows, armL/R (.userData.e/.h), legL/R (.userData.k)
function human(o = {}) { const g = new T3.Group(); const skin = SM(o.skin || '#e8b890'), top = SM(o.top || '#3a6ad8'), bot = SM(o.bot || '#2a2e3a'), hairM = SM(o.hair || '#4a2e1a'), shoe = SM(o.shoe || '#f4f4f4'), ink = new T3.MeshBasicMaterial({ color: '#141414' });
  const up = new T3.Group(); up.position.y = 0.95; g.add(up);
  add(up, Cap(0.17, 0.36, 14), top, 0, 0.3, 0).scale.z = 0.72; add(up, Sp(0.17, 16, 12), bot, 0, -0.02, 0).scale.set(1, 0.65, 0.75); add(up, Cy(0.05, 0.055, 0.1, 10), skin, 0, 0.62, 0);
  const head = new T3.Group(); head.position.set(0, 0.8, 0); up.add(head); const hs = add(head, Sp(0.15, 24, 18), skin, 0, 0, 0); hs.scale.set(0.92, 1.05, 0.95);
  for (const sx of [-1, 1]) add(head, Sp(0.03, 10, 8), skin, sx * 0.138, -0.005, 0).scale.set(0.5, 1, 0.8);
  const hairCap = add(head, new T3.SphereGeometry(0.158, 24, 14, 0, PI * 2, 0, PI * 0.46), hairM, 0, 0.012, -0.01); hairCap.rotation.x = -0.25; add(head, Sp(0.07, 10, 8), hairM, 0.05, 0.12, 0.06).scale.set(1.4, 0.6, 1);
  const brows = []; for (const sx of [-1, 1]) { add(head, Sp(0.019, 10, 8), ink, sx * 0.05, 0.012, 0.135, false).scale.set(1, 1.3, 0.5); const br = add(head, Bx(0.016, 0.06, 0.012), ink, sx * 0.052, 0.045, 0.134, false); br.rotation.z = PI / 2 - sx * 0.12; br.userData.sx = -sx; brows.push(br); }
  add(head, Sp(0.022, 10, 8), skin, 0, -0.018, 0.142).scale.set(0.8, 0.8, 0.9); // nose
  const mouth = new T3.Group(); mouth.position.set(0, -0.06, 0.132); head.add(mouth); add(mouth, Bx(0.05, 0.01, 0.006), ink, 0, 0, 0, false);
  const arm = (sx) => { const s_ = new T3.Group(); s_.position.set(sx * 0.2, 0.5, 0); up.add(s_); add(s_, Sp(0.06), top, 0, 0, 0); add(s_, Cap(0.05, 0.2, 10), o.short ? top : top, 0, -0.13, 0); const e = new T3.Group(); e.position.y = -0.28; s_.add(e); add(e, Cap(0.045, 0.2, 10), o.short ? skin : top, 0, -0.12, 0); const h = new T3.Group(); h.position.y = -0.27; e.add(h); add(h, Sp(0.05, 12, 10), skin, 0, -0.02, 0).scale.set(0.9, 1.1, 0.7); s_.userData.e = e; s_.userData.h = h; return s_; };
  const leg = (sx) => { const hp = new T3.Group(); hp.position.set(sx * 0.09, 0.92, 0); g.add(hp); add(hp, Cap(0.072, 0.32, 10), bot, 0, -0.22, 0); const k = new T3.Group(); k.position.y = -0.45; hp.add(k); add(k, Cap(0.058, 0.32, 10), o.short ? skin : bot, 0, -0.2, 0); const sh = add(k, Cap(0.055, 0.12, 8), shoe, 0, -0.42, 0.05); sh.rotation.x = PI / 2; sh.scale.set(1.1, 1, 0.7); hp.userData.k = k; return hp; };
  g.userData = { up, head, mouth, brows, armL: arm(-1), armR: arm(1), legL: leg(-1), legR: leg(1) }; return g; }
// golden-hour sky and a low warm sun
function goldenHour() { const st = ctex(16, 512, (c, w, h) => { const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#4a7ac8'); gr.addColorStop(0.32, '#8ab8e0'); gr.addColorStop(0.45, '#f4c8a0'); gr.addColorStop(0.5, '#ff9a6a'); gr.addColorStop(0.52, '#e8a878'); gr.addColorStop(1, '#c89a78'); c.fillStyle = gr; c.fillRect(0, 0, w, h); }); R.sky.material.map = st; R.sky.material.needsUpdate = true;
  R.sun.color.set('#ffd0a0'); R.hemi.color.set('#ffd8b8'); R.hemi.groundColor.set('#8a6a58'); }
function sunAt(x, y, z) { R.sun.target.position.set(x, y, z); R.sun.position.set(x - 50, y + 30, z - 60); }
// convert every lit material to a 2-step toon material and give solid meshes an ink outline (screen-space width)
let GRAD, INK;
function toonify(root) { GRAD = ctex(4, 1, (c) => { c.fillStyle = '#5a5a5a'; c.fillRect(0, 0, 2, 1); c.fillStyle = '#ffffff'; c.fillRect(2, 0, 2, 1); }); GRAD.minFilter = GRAD.magFilter = T3.NearestFilter; GRAD.colorSpace = T3.NoColorSpace;
  INK = new T3.ShaderMaterial({ uniforms: { uT: { value: 0.0065 } }, side: T3.BackSide, vertexShader: 'uniform float uT; void main(){ vec4 c = projectionMatrix * modelViewMatrix * vec4(position,1.0); vec3 n = normalize(normalMatrix * normal); vec2 o = normalize((projectionMatrix * vec4(n,0.0)).xy + 1e-6); c.xy += o * uT * c.w; gl_Position = c; }', fragmentShader: 'void main(){ gl_FragColor = vec4(0.07,0.06,0.08,1.0); }' });
  const cache = new Map(); const meshes = []; root.traverse(m => { if (m.isMesh && m.material && m.material.isMeshStandardMaterial) meshes.push(m); });
  meshes.forEach(m => { const sm = m.material; let tm = cache.get(sm); if (!tm) { tm = new T3.MeshToonMaterial({ color: sm.color, map: sm.map || null, gradientMap: GRAD, transparent: sm.transparent, opacity: sm.opacity, side: sm.side, emissive: sm.emissive, emissiveIntensity: sm.emissiveIntensity }); cache.set(sm, tm); } m.material = tm;
    m.geometry.computeBoundingSphere(); const r = m.geometry.boundingSphere ? m.geometry.boundingSphere.radius * Math.max(m.scale.x, m.scale.y, m.scale.z) : 0; if (r > 0 && r < 30 && !sm.transparent) { const ol = new T3.Mesh(m.geometry, INK); ol.castShadow = false; ol.receiveShadow = false; ol.renderOrder = -1; m.add(ol); } }); }
// ---------- captions ----------
const NUMW = { one: '1', two: '2', four: '4', eight: '8', ten: '10' };
const CAPS = []; CL.forEach(c0 => { let cur = []; const flush = () => { if (cur.length) CAPS.push({ a: cur[0].a, b: cur[cur.length - 1].b, t: cur.map(w => w.w).join(' ') }); cur = []; };
  c0.words.forEach(w0 => { const w = Object.assign({}, w0, { w: NUMW[w0.w.toLowerCase()] || w0.w }); const prev = cur[cur.length - 1]; if (cur.length && (cur.length >= 3 || w.a - prev.b > 0.25 || w.a - prev.a > 0.6 || /[.,!?]$/.test(prev.w))) flush(); cur.push(w); }); flush(); });
CAPS.forEach((c, i) => { const nx = CAPS[i + 1]; c.b = nx ? Math.min(nx.a, c.b + 0.3) : c.b + 0.6; });
function caption(c) { octx.save(); octx.font = '600 50px CapFont'; octx.textAlign = 'center'; octx.textBaseline = 'middle'; octx.lineJoin = 'round'; octx.lineWidth = 12; octx.strokeStyle = '#111'; octx.strokeText(c.t, 360, 1040); octx.fillStyle = '#ffe04a'; octx.fillText(c.t, 360, 1040); octx.restore(); }
function txt(s_, x, y, size, col, font = 'Russo', align = 'center') { octx.font = `${size}px ${font}`; octx.fillStyle = col; octx.textAlign = align; octx.textBaseline = 'middle'; octx.fillText(s_, x, y); }
// ---------- scoreboard: you vs bro ----------
let SHOWN = [0, 0];
function board(T) { const n = nPress(T); const tY = n, tB = n ? 2 ** n : 0; const lp = PRESSES.filter(p => T >= p).pop(); const k = lp !== undefined ? ease(prog(T, lp, lp + 0.3)) : 1; const prevN = Math.max(0, n - 1);
  const y = Math.round(lerp(prevN, tY, k)), b = Math.round(lerp(prevN ? 2 ** prevN : 0, tB, k)); const a = ease(prog(T, E.million0 - 0.4, E.million0)); if (a <= 0) return;
  octx.save(); octx.globalAlpha = a; for (const [x, lbl, v, col] of [[190, 'YOU', y, '#e8453a'], [530, 'BRO', b, '#2aa84a']]) { if (lbl === 'BRO' && T < E.bro1 - 0.1) continue; const bump = lp !== undefined && T - lp < 0.25 ? 1 + 0.12 * (1 - (T - lp) / 0.25) : 1;
    octx.save(); octx.translate(x, 150); octx.scale(bump, bump); octx.fillStyle = 'rgba(255,255,255,0.95)'; octx.beginPath(); octx.roundRect(-150, -62, 300, 124, 26); octx.fill(); octx.lineWidth = 6; octx.strokeStyle = '#111'; octx.stroke(); octx.fillStyle = col; octx.beginPath(); octx.roundRect(-150, -62, 300, 40, [26, 26, 0, 0]); octx.fill(); octx.strokeStyle = '#111'; octx.beginPath(); octx.roundRect(-150, -62, 300, 124, 26); octx.stroke();
      txt(lbl, 0, -41, 26, '#fff'); txt(v ? fmt(v) : '£0', 0, 22, 50, '#111'); octx.restore(); } octx.restore(); }
function bigCash(T) { const a = ease(prog(T, 0.05, 0.3)) * (1 - ease(prog(T, E.c1 - 0.2, E.c1 + 0.1))); if (a <= 0) return; octx.save(); octx.globalAlpha = a; octx.font = '92px Russo'; octx.textAlign = 'center'; octx.textBaseline = 'middle'; octx.lineJoin = 'round'; octx.lineWidth = 16; octx.strokeStyle = '#111'; octx.strokeText('£1,000,000', 360, 330); octx.fillStyle = '#5ad86a'; octx.fillText('£1,000,000', 360, 330); octx.restore(); }
function pressCount(T) { const n = nPress(T); if (n < 1 || CLI(T) > 5) return; octx.save(); octx.fillStyle = 'rgba(17,17,17,0.85)'; octx.beginPath(); octx.roundRect(260, 250, 200, 56, 28); octx.fill(); txt('PRESS ' + n, 360, 279, 30, '#ffd23a'); octx.restore(); }
// ---------- voice note from bro ----------
function voiceNote(T) { const k = ease(prog(T, E.c6 + 0.3, E.c6 + 0.6)); if (k <= 0) return; octx.save(); octx.globalAlpha = k; const y = 360 + (1 - k) * 60;
  octx.fillStyle = 'rgba(255,255,255,0.97)'; octx.beginPath(); octx.roundRect(90, y, 540, 150, 40); octx.fill(); octx.strokeStyle = '#111'; octx.lineWidth = 6; octx.stroke();
  octx.fillStyle = '#2aa84a'; octx.beginPath(); octx.arc(160, y + 75, 42, 0, 7); octx.fill(); txt('B', 160, y + 77, 40, '#fff'); txt('Bro', 220, y + 34, 26, '#111', 'CapFont', 'left');
  const playing = T >= E.c7 && T < E.c8; octx.fillStyle = '#2a7af0'; octx.beginPath(); if (playing) { octx.rect(222, y + 66, 9, 36); octx.rect(238, y + 66, 9, 36); } else { octx.moveTo(224, y + 64); octx.lineTo(252, y + 84); octx.lineTo(224, y + 104); } octx.fill();
  const prog_ = playing ? prog(T, E.c7, E.c8) : T >= E.c8 ? 1 : 0; for (let i = 0; i < 26; i++) { const x = 272 + i * 12, hh = 8 + 34 * Math.abs(S(i * 1.7) * C(i * 0.6)); octx.fillStyle = i / 26 < prog_ ? '#2a7af0' : '#b8c0cc'; const live = playing && Math.abs(i / 26 - prog_) < 0.08 ? 1.3 : 1; octx.fillRect(x, y + 84 - hh * live / 2, 7, hh * live); }
  txt('0:02', 590, y + 120, 20, '#8a8a96', 'CapFont'); octx.restore(); }
function question(T) { const k = ease(prog(T, E.c8, E.c8 + 0.25)); if (k <= 0) return; octx.save(); octx.globalAlpha = k; const sc = 0.8 + 0.2 * k; octx.translate(360, 300); octx.scale(sc, sc);
  octx.font = '64px Russo'; octx.textAlign = 'center'; octx.textBaseline = 'middle'; octx.lineJoin = 'round'; octx.lineWidth = 14; octx.strokeStyle = '#111'; octx.strokeText('WOULD YOU', 0, -40); octx.strokeText('PRESS IT?', 0, 40); octx.fillStyle = '#fff'; octx.fillText('WOULD YOU', 0, -40); octx.fillStyle = '#ff4a3a'; octx.fillText('PRESS IT?', 0, 40); octx.restore();
  const k2 = ease(prog(T, E.comment - 0.1, E.comment + 0.2)); if (k2 <= 0) return; octx.save(); octx.globalAlpha = k2; for (const [x, t, c] of [[250, 'YES', '#2aa84a'], [470, 'NO', '#e8453a']]) { octx.fillStyle = c; octx.beginPath(); octx.roundRect(x - 90, 420, 180, 76, 38); octx.fill(); octx.strokeStyle = '#111'; octx.lineWidth = 6; octx.stroke(); txt(t, x, 459, 38, '#fff'); } octx.restore(); }
window.initFootball = async function () {
  await Promise.all(['600 44px CapFont', '44px Russo'].map(f => document.fonts.load(f)));
  GLOW = ctex(64, 64, (c, w, h) => { const gr = c.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.3, 'rgba(255,255,255,0.5)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = gr; c.fillRect(0, 0, w, h); });
  glc = document.createElement('canvas'); glc.width = RW; glc.height = RH;
  renderer = new T3.WebGLRenderer({ canvas: glc, antialias: true, preserveDrawingBuffer: true }); renderer.setPixelRatio(1); renderer.setSize(RW, RH, false); renderer.outputColorSpace = T3.SRGBColorSpace; renderer.toneMapping = T3.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0; renderer.shadowMap.enabled = true; renderer.shadowMap.type = T3.PCFSoftShadowMap;
  scene = new T3.Scene(); camera = new T3.PerspectiveCamera(58, RW / RH, 0.03, 500); scene.add(camera);
  build(); toonify(scene); out = document.getElementById('c'); octx = out.getContext('2d');
};
window.DURATION = TM.total;
window.renderFrame = function (T) { const loop = T >= E.loop; const ci = loop ? 0 : CLI(T); shot(T); renderer.render(scene, camera);
  octx.globalCompositeOperation = 'source-over'; octx.globalAlpha = 1; octx.filter = 'contrast(1.04) saturate(1.15)'; octx.drawImage(glc, 0, 0, W, H); octx.filter = 'none';
  const vg = octx.createRadialGradient(360, 640, 460, 360, 640, 900); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.22)'); octx.fillStyle = vg; octx.fillRect(0, 0, W, H);
  const lp = PRESSES.filter(p => T >= p).pop(); if (lp !== undefined && T - lp < 0.12 && !loop) { octx.fillStyle = `rgba(255,255,255,${0.35 * (1 - (T - lp) / 0.12)})`; octx.fillRect(0, 0, W, H); }
  if (loop) { octx.save(); octx.font = '92px Russo'; octx.textAlign = 'center'; octx.textBaseline = 'middle'; octx.lineJoin = 'round'; octx.lineWidth = 16; octx.strokeStyle = '#111'; octx.strokeText('£1,000,000', 360, 330); octx.fillStyle = '#5ad86a'; octx.fillText('£1,000,000', 360, 330); octx.restore(); }
  else { if (ci === 0) bigCash(T); if (ci >= 1 && ci <= 5) { board(T); } if (ci >= 2 && ci <= 5) pressCount(T); if (ci === 6 || ci === 7) voiceNote(T); if (ci === 8) question(T); }
  const cap = CAPS.find(c => T >= c.a && T < c.b); if (cap && !loop) caption(cap); };
})();
