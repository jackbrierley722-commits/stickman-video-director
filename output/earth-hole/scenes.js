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
const E = { here: AT(0, "here's"), c1: CL[1].start, c2: CL[2].start, centre: AT(2, 'centre'), c3: CL[3].start, sun: AT(3, 'sun'), pressure: AT(3, 'pressure'), c4: CL[4].start, c5: CL[5].start, pop: AT(5, 'pop'),
  c6: CL[6].start, forever: AT(6, 'forever'), every: AT(6, 'every'), sheep: AT(6, 'sheep'), c7: CL[7].start };
E.loop = TM.total - 0.4;
const EG = [500, 0, 0], TG = [1000, 0, 0], NG = [1500, 0, 0];
// fall progress along the tunnel (0 = UK, 0.5 = centre, 1 = New Zealand)
function fallP(T) { if (T < E.c1) return 0; if (T < E.c2) return 0.01 * prog(T, E.c1, E.c2); if (T < E.c3) return lerp(0.01, 0.44, prog(T, E.c2, E.c3) ** 1.6); if (T < E.c4) return lerp(0.44, 0.49, prog(T, E.c3, E.c4)); if (T < E.c5) return 0.5; if (T < E.pop) return lerp(0.5, 1, prog(T, E.c5, E.pop)); return 1; }
const speedAt = p => Math.round(28000 * S(PI * clamp(p)));
function tempAt(p) { const d = 1 - Math.abs(1 - 2 * p); return Math.round(d < 0.03 ? lerp(15, 900, d / 0.03) : d < 0.45 ? lerp(900, 3700, (d - 0.03) / 0.42) : d < 0.81 ? lerp(4000, 5000, (d - 0.45) / 0.36) : lerp(5000, 5200, (d - 0.81) / 0.19)); }
function earthTex() { return ctex(1024, 512, (c, w, h) => { c.fillStyle = '#2f7ad8'; c.fillRect(0, 0, w, h); const r = rng(4); for (const [cx, cy, s] of [[180, 160, 70], [250, 330, 55], [520, 150, 60], [540, 300, 60], [720, 170, 110], [830, 360, 45], [430, 80, 40]]) { c.fillStyle = '#4fae4a'; for (let i = 0; i < 26; i++) { c.beginPath(); c.arc(cx + (r() - 0.5) * s * 2, cy + (r() - 0.5) * s, s * (0.25 + r() * 0.35), 0, 7); c.fill(); } } c.fillStyle = '#f4f8ff'; c.fillRect(0, 0, w, 24); c.fillRect(0, h - 26, w, 26); }); }
function labelTex(t, bg, fg = '#fff', w = 256, h = 72, sz = 40) { return ctex(w, h, (c) => { c.fillStyle = bg; c.beginPath(); c.roundRect(4, 4, w - 8, h - 8, 16); c.fill(); c.strokeStyle = '#111'; c.lineWidth = 5; c.stroke(); c.fillStyle = fg; c.font = `${sz}px Russo`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(t, w / 2, h / 2 + 2); }); }
function sheep() { const g = new T3.Group(); const wool = SM('#f4f2ec'), dark = SM('#2a2624'); for (let i = 0; i < 7; i++) add(g, Sp(0.28, 12, 10), wool, S(i * 1.9) * 0.22, 0.75 + C(i * 2.3) * 0.08, -0.25 + i * 0.09); const head = new T3.Group(); head.position.set(0, 0.85, 0.45); g.add(head); add(head, Bx(0.22, 0.26, 0.32), dark, 0, 0, 0.08); for (const sx of [-1, 1]) { add(head, Bx(0.14, 0.05, 0.08), dark, sx * 0.16, 0.06, 0.0); add(head, Sp(0.035, 8, 6), SM('#ffffff'), sx * 0.08, 0.06, 0.24, false); add(head, Sp(0.018, 6, 4), new T3.MeshBasicMaterial({ color: '#111' }), sx * 0.08, 0.06, 0.27, false); }
  for (const [x, z] of [[-0.15, 0.25], [0.15, 0.25], [-0.15, -0.25], [0.15, -0.25]]) add(g, Bx(0.08, 0.5, 0.08), dark, x, 0.25, z); g.userData = { head }; return g; }
function build() {
  R.sun = new T3.DirectionalLight('#fff0dc', 2.4); R.sun.position.set(4, 9, 7); R.sun.castShadow = true; R.sun.shadow.mapSize.set(2048, 2048); const sc = R.sun.shadow.camera; sc.left = sc.bottom = -8; sc.right = sc.top = 8; sc.near = 1; sc.far = 40; scene.add(R.sun); scene.add(R.sun.target);
  R.hemi = new T3.HemisphereLight('#ffe8d0', '#7a6a5a', 1.2); scene.add(R.hemi);
  const sky = ctex(16, 512, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#6ab0f0'); g.addColorStop(0.5, '#cfe8fa'); g.addColorStop(1, '#e8f0e0'); c.fillStyle = g; c.fillRect(0, 0, w, h); }); R.sky = add(scene, Sp(2600, 32, 16), new T3.MeshBasicMaterial({ map: sky, side: T3.BackSide, toneMapped: false }), 0, 0, 0, false); R.sky.castShadow = false;
  // ---- field with the hole (UK) ----
  const F = R.F = new T3.Group(); scene.add(F); add(F, Cy(30, 30, 0.2, 48), SM('#7ac85a'), 0, -0.1, 0, false); add(F, Cy(1.45, 1.6, 0.25, 32), SM('#8a6040'), 0, 0.02, 0); add(F, Cy(1.2, 1.2, 0.3, 32), new T3.MeshBasicMaterial({ color: '#0a0806' }), 0, 0.06, 0, false);
  const sgn = new T3.Group(); sgn.position.set(-1.9, 0, 0.6); F.add(sgn); add(sgn, Bx(0.08, 1.3, 0.08), SM('#7a4a2a'), 0, 0.65, 0); add(sgn, new T3.PlaneGeometry(1.0, 0.36), BM('#ffffff', { map: labelTex('DO NOT JUMP', '#ffd23a', '#111', 256, 92, 34) }), 0, 1.25, 0.05, false).rotation.y = 0.3;
  for (let i = 0; i < 10; i++) { const a = i * 0.7, d = 6 + (i % 4) * 3; add(F, Sp(0.8 + (i % 3) * 0.3, 10, 8), SM('#4a9a3a'), S(a) * d, 0.5, -Math.abs(C(a)) * d - 4); }
  R.you = human({ top: '#e8453a', bot: '#2e3550', hair: '#3a2416', skin: '#e4b08a' }); scene.add(R.you);
  // ---- tunnel interior ----
  const TT = R.TT = new T3.Group(); TT.position.set(...TG); scene.add(TT); R.rockT = ctex(256, 256, (c, w, h) => { c.fillStyle = '#7a6a5a'; c.fillRect(0, 0, w, h); const r = rng(8); for (let i = 0; i < 260; i++) { c.fillStyle = `rgba(${r() < 0.5 ? '40,30,20' : '160,140,120'},${0.15 + r() * 0.3})`; c.beginPath(); c.arc(r() * w, r() * h, 3 + r() * 14, 0, 7); c.fill(); } }); R.rockT.wrapS = R.rockT.wrapT = T3.RepeatWrapping; R.rockT.repeat.set(3, 10);
  R.tunM = new T3.MeshStandardMaterial({ map: R.rockT, side: T3.BackSide, roughness: 0.9, emissive: '#ff4a10', emissiveIntensity: 0 }); add(TT, new T3.CylinderGeometry(2.2, 2.2, 80, 24, 1, true), R.tunM, 0, 0, 0, false);
  R.tunL = new T3.PointLight('#ffffff', 25, 20, 1.2); R.tunL.position.set(0, 3, 0); TT.add(R.tunL); R.coreGlow = spr(TT, GLOW, '#ffe080', 9, 0, 0, 0, 0); R.streaks = []; for (let i = 0; i < 26; i++) R.streaks.push(add(TT, Bx(0.04, 1.4, 0.04), new T3.MeshBasicMaterial({ color: '#fff4d8', transparent: true, opacity: 0.6 }), 0, 0, 0, false));
  // ---- New Zealand island ----
  const N_ = R.N = new T3.Group(); N_.position.set(...NG); scene.add(N_); R.sea = add(N_, Cy(120, 120, 0.2, 64), SM('#2a7ac8', { roughness: 0.3, metalness: 0.2 }), 0, -1.2, 0, false); add(N_, Cy(5.5, 7, 2.4, 20), SM('#8a7a62'), 0, -0.2, 0); add(N_, Cy(5.6, 5.6, 0.3, 24), SM('#6ac85a'), 0, 1.05, 0);
  add(N_, Cy(1.45, 1.6, 0.25, 32), SM('#8a6040'), 0, 1.2, 0); add(N_, Cy(1.2, 1.2, 0.3, 32), new T3.MeshBasicMaterial({ color: '#0a0806' }), 0, 1.25, 0, false);
  R.sheep = []; for (let i = 0; i < 8; i++) { const s = sheep(); s.position.set(1.9 + (i % 4) * 0.9 - (i > 3 ? 0.4 : 0), 1.2, 1.2 + Math.floor(i / 4) * 1.0 - i * 0.05); s.rotation.y = -2.2 + i * 0.12; N_.add(s); R.sheep.push(s); }
  R.hat = add(R.sheep[0].userData.head, new T3.ConeGeometry(0.12, 0.3, 12), SM('#e83a8a'), 0, 0.28, 0.05); for (let i = 0; i < 3; i++) add(N_, Cy(0.35, 0.35, 0.05, 12), SM('#ffffff'), -3 + i * 1.5, -1.05, 7 + i);
  R.nzSign = add(N_, new T3.PlaneGeometry(1.6, 0.45), BM('#ffffff', { map: labelTex('NEW ZEALAND', '#2a8a4a', '#fff', 320, 90, 36) }), -2.6, 2.4, 1.2, false); add(N_, Bx(0.08, 1.4, 0.08), SM('#7a4a2a'), -2.6, 1.7, 1.15);
}
// Earth cutaway is built after toonify so its clipping survives
function buildEarth() { const G = R.EG = new T3.Group(); G.position.set(...EG); scene.add(G); const clip = [new T3.Plane(new T3.Vector3(0, 0, -1), EG[2])];
  R.earth = add(G, Sp(10, 64, 40), new T3.MeshStandardMaterial({ map: earthTex(), roughness: 0.8, clippingPlanes: clip, side: T3.DoubleSide }), 0, 0, 0, false);
  for (const [r, col, em] of [[10, '#7a5a3a', 0], [9.75, '#c8502a', 0.15], [5.46, '#f08a2a', 0.35], [1.91, '#ffe060', 0.7]]) add(G, new T3.CircleGeometry(r, 64), new T3.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: em, roughness: 0.9 }), 0, 0, 0.01 + (10 - r) * 0.002, false);
  add(G, Bx(0.32, 20.2, 0.05), new T3.MeshBasicMaterial({ color: '#0a0806' }), 0, 0, 0.04, false);
  R.dot = spr(G, GLOW, '#ff3a3a', 1.8, 0, 10, 0.3, 1); R.dot2 = add(G, Sp(0.28, 12, 10), new T3.MeshBasicMaterial({ color: '#ff3a3a' }), 0, 10, 0.3, false);
  for (const [t, y, bg] of [['UK', 11.5, '#c8282a'], ['NEW ZEALAND', -11.6, '#2a8a4a']]) add(G, new T3.PlaneGeometry(t === 'UK' ? 2.4 : 6.0, 1.6), BM('#ffffff', { map: labelTex(t, bg, '#fff', t === 'UK' ? 160 : 400, 100, 52) }), 0, y, 0.2, false);
  const eL = new T3.PointLight('#ffffff', 300, 60, 1.2); eL.position.set(5, 8, 25); G.add(eL); }

const E3 = (x, y, z) => [EG[0] + x, EG[1] + y, EG[2] + z], T3_ = (x, y, z) => [TG[0] + x, TG[1] + y, TG[2] + z], N3 = (x, y, z) => [NG[0] + x, NG[1] + y, NG[2] + z];
// pop-ups in New Zealand: first at "pop", then every 80 minutes (sped up)
const POPS = [E.pop, E.every + 0.5, E.sheep - 0.25, E.c7 + 0.2]; const HELLO = [1, 2, 47, 1000];
const popIdx = T => { let k = -1; POPS.forEach((p, i) => { if (T >= p - 0.05) k = i; }); return k; };
const SH = [
  [0, (k, T) => TR(k, [-0.4, 2.6, 4.2], [-0.2, 2.3, 3.2], [0, 0.4, 0], [0, 0.0, 0])],
  [E.c1, (k, T) => TR(k, E3(0, 0, 52), E3(0, 0, 48), E3(0, 0, 0), E3(0, 0, 0))],
  [E.c2, (k, T) => { camera.up.set(0, 0, -1); look(T3_(0, -1.2, 0.01), T3_(0, -12, 0)); }],
  [E.c4, (k, T) => { camera.up.set(0, 1, 0); TR(k, T3_(3.4, 1.0, 4.6), T3_(3.0, 0.9, 4.0), T3_(0, 0.5, 0), T3_(0, 0.5, 0)); }],
  [E.c5, (k, T) => { camera.up.set(0, 1, 0); TR(k, E3(0, -2, 48), E3(0, -3, 45), E3(0, -1, 0), E3(0, -2, 0)); }],
  [E.pop - 0.15, (k, T) => TR(k, N3(1.2, 3.0, 8.5), N3(1.0, 2.8, 7.6), N3(0.3, 2.2, 0), N3(0.4, 2.2, 0))],
  [E.forever - 0.1, (k, T) => TR(k, E3(0, 0, 50), E3(0, 0, 48), E3(0, 0, 0), E3(0, 0, 0))],
  [E.every + 0.3, (k, T) => TR(k, N3(1.2, 3.0, 8.5), N3(1.4, 3.0, 8.0), N3(0.4, 2.2, 0), N3(0.5, 2.2, 0))],
  [E.loop, (k, T) => look([-0.4, 2.6, 4.2], [0, 0.4, 0])],
];
const shotAt = T => { let i = 0; for (let j = 0; j < SH.length; j++) if (T >= SH[j][0]) i = j; return i; };
function anim(T) { const loop = T >= E.loop, ci = loop ? 0 : CLI(T); const you = R.you, u = you.userData; rest(you); you.visible = true; you.rotation.set(0, 0, 0); you.scale.setScalar(1); camera.up.set(0, 1, 0);
  // field: stand at the edge, jump in at "here's"
  if (ci === 0 || loop) { const j = loop ? 0 : prog(T, E.here, E.here + 0.9); you.position.set(0, j < 0.35 ? 0.9 * S(PI * j / 0.7) : lerp(0.65, -3, (j - 0.35) / 0.65), lerp(0.9, 0, ease(prog(j, 0, 0.35)))); you.rotation.y = PI; u.armL.rotation.set(-2.8 * Math.min(1, j * 3), 0, 0.3); u.armR.rotation.set(-2.8 * Math.min(1, j * 3), 0, -0.3); face(you, j > 0 ? 'grin' : 'neutral', T); if (j <= 0) you.position.set(0, 0, 1.35); you.rotation.y = j <= 0 ? PI + 0.2 : PI; }
  // falling (tunnel)
  const p = fallP(T); const inTunnel = ci >= 2 && ci <= 4 && !loop; R.tunM.emissiveIntensity = inTunnel ? clamp((p - 0.1) * 2.2) * 0.9 : 0; R.tunM.color.set(p > 0.3 ? '#a85a3a' : '#7a6a5a'); R.coreGlow.material.opacity = ci === 4 ? 0.7 : ci === 3 ? 0.35 : 0; R.tunL.color.set(p > 0.3 ? '#ffb070' : '#ffffff');
  const sp = speedAt(p) / 28000; R.rockT.offset.y = -(T * (ci === 4 ? 0 : 0.4 + sp * 6)) % 1; R.streaks.forEach((s, i) => { s.visible = inTunnel && ci !== 4; const ph = (T * (1 + sp * 5) + i / 26) % 1; s.position.set(S(i * 2.4) * 1.9, 30 - ph * 60, C(i * 2.4) * 1.9); s.scale.y = 0.5 + sp * 2.5; });
  if (inTunnel) { you.position.set(...T3_(0, ci === 4 ? 0.2 * S(T * 1.4) : -4, 0)); if (ci === 4) { you.rotation.set(T * 0.9, T * 0.6, 0.3); const off = new T3.Vector3(0, 0.9, 0).applyEuler(you.rotation); you.position.set(TG[0] - off.x, TG[1] + 0.5 - off.y + 0.15 * S(T * 1.4), TG[2] - off.z); u.armL.rotation.set(-1.2, 0, 1.2); u.armR.rotation.set(-1.2, 0, -1.2); u.legL.rotation.z = -0.4; u.legR.rotation.z = 0.4; face(you, 'grin', T); }
    else { you.rotation.set(PI, T * 0.3, 0); const fl = S(T * 14); u.armL.rotation.set(-2.6 + 0.3 * fl, 0, 0.6); u.armR.rotation.set(-2.6 - 0.3 * fl, 0, -0.6); u.legL.rotation.x = 0.3 * fl; u.legR.rotation.x = -0.3 * fl; face(you, ci === 3 ? 'yell' : 'shock', T); } }
  // Earth cutaway marker
  if (R.dot) { let y = 10 * C(PI * p); if (ci === 6 && T >= E.forever - 0.1 && T < E.every + 0.3) y = 10 * C(PI * (1 + (T - E.forever) * 2.2)); R.dot.position.y = y; R.dot2.position.y = y; R.EG.rotation.y = 0.15 * S(T * 0.3); }
  // New Zealand: pop out, wave, fall back; sheep pile up
  const k = popIdx(T); const nz = !loop && ci >= 5 && (ci > 5 || T > E.pop - 0.15) && !(ci === 6 && T >= E.forever - 0.1 && T < E.every + 0.3);
  if (nz) { const t0 = POPS[Math.max(0, k)]; const d = T - t0; const h = d < 0 ? -2 : d < 0.35 ? lerp(-1, 2.3, ease(d / 0.35)) : d < 1.1 ? 2.3 + 0.1 * S(d * 6) : lerp(2.3, -2, ease((d - 1.1) / 0.4)); you.position.set(...N3(0, h, 0)); you.rotation.y = 0.3; u.armR.rotation.set(-2.7, 0, -0.3 + 0.35 * S(T * 12)); face(you, 'grin', T); if (k === 3) you.position.set(...N3(0, 2.4 + 0.1 * S(T * 5), 0)); }
  else if (!inTunnel && !(ci === 0 || loop)) you.visible = false;
  const nS = k < 0 ? 1 : [1, 1, 4, 8][k]; R.sheep.forEach((s, i) => { s.visible = i < nS; s.userData.head.rotation.x = nz ? -0.3 + 0.1 * S(T * 3 + i) : 0; s.rotation.y = -2.2 + i * 0.12 + (nz ? 0.1 * S(T + i) : 0); }); R.hat.visible = k === 3;
  R.sky.visible = !(ci === 1 || ci === 5 && T < E.pop - 0.15 || ci === 6 && T >= E.forever - 0.1 && T < E.every + 0.3) || loop; }
function shot(T) { const si = shotAt(T), sh = SH[si], t0 = sh[0], t1 = si + 1 < SH.length ? SH[si + 1][0] : TM.total; camera.fov = 58; camera.updateProjectionMatrix(); anim(T); sh[1](prog(T, t0, t1), T);
  const ci = T >= E.loop ? 0 : CLI(T); if ((ci === 2 || ci === 3) && T < E.loop) { const sp = speedAt(fallP(T)) / 28000; camera.position.x += 0.03 * sp * S(T * 60); camera.rotation.z += 0.01 * sp * S(T * 47); }
  const c = camera.position; R.sun.target.position.set(c.x, 0, c.z - 3); R.sun.position.set(c.x + 4, 9, c.z + 4); R.sun.target.updateMatrixWorld(); return { si, t0 }; }

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
const CAPS = []; CL.forEach(c0 => { let cur = []; const flush = () => { if (cur.length) CAPS.push({ a: cur[0].a, b: cur[cur.length - 1].b, t: cur.map(w => w.w).join(' ') }); cur = []; };
  c0.words.forEach(w0 => { const w = Object.assign({}, w0); const prev = cur[cur.length - 1]; if (cur.length && (cur.length >= 3 || w.a - prev.b > 0.25 || w.a - prev.a > 0.6 || /[.,!?]$/.test(prev.w))) flush(); cur.push(w); }); flush(); });
CAPS.forEach((c, i) => { const nx = CAPS[i + 1]; c.b = nx ? Math.min(nx.a, c.b + 0.3) : c.b + 0.6; c.t = c.t.replace(/twelve thousand/i, '12,000').replace(/twenty-eight thousand/i, '28,000').replace(/three million/i, '3 million').replace(/^forty/i, '40').replace(/ forty/i, ' 40').replace(/eighty/i, '80'); });
function caption(c) { octx.save(); octx.font = '600 50px CapFont'; octx.textAlign = 'center'; octx.textBaseline = 'middle'; octx.lineJoin = 'round'; octx.lineWidth = 12; octx.strokeStyle = '#111'; octx.strokeText(c.t, 360, 1060); octx.fillStyle = '#ffe04a'; octx.fillText(c.t, 360, 1060); octx.restore(); }
function txt(s_, x, y, size, col, font = 'Russo', align = 'center') { octx.font = `${size}px ${font}`; octx.fillStyle = col; octx.textAlign = align; octx.textBaseline = 'middle'; octx.fillText(s_, x, y); }
function big(s_, y, size, col, a = 1) { if (a <= 0) return; octx.save(); octx.globalAlpha = Math.min(1, a); const sc = a < 1 ? 1 + (1 - a) * 0.3 : 1; octx.translate(360, y); octx.scale(sc, sc); octx.font = `${size}px Russo`; octx.textAlign = 'center'; octx.textBaseline = 'middle'; octx.lineJoin = 'round'; octx.lineWidth = size * 0.22; octx.strokeStyle = '#111'; octx.strokeText(s_, 0, 0); octx.fillStyle = col; octx.fillText(s_, 0, 0); octx.restore(); }
function meters(T) { const p = fallP(T); const depth = Math.round(12742 * p), sp = speedAt(p), tc = tempAt(p); octx.save(); octx.fillStyle = 'rgba(10,10,16,0.82)'; octx.beginPath(); octx.roundRect(24, 40, 672, 112, 22); octx.fill();
  const cols = [['DEPTH', depth.toLocaleString('en-GB') + ' km', '#9ad0ff'], ['SPEED', sp.toLocaleString('en-GB') + ' km/h', '#ffd27a'], ['HEAT', tc.toLocaleString('en-GB') + '°C', tc > 3000 ? '#ff6a3a' : '#ffb07a']];
  cols.forEach(([l, v, c], i) => { const x = 136 + i * 224; txt(l, x, 74, 20, '#9a9aa8', 'CapFont'); txt(v, x, 114, 30, c); }); octx.restore(); }

// ---------- 2D cutaway of the fall (side view, scrolls with you) ----------
const D2A = E.c2 + 1.3, D2B = E.c4; const RPX = 1500, KM = RPX / 6371;
const BLOBS = (() => { const r = rng(91), b = []; for (let i = 0; i < 520; i++) { const a = r() * PI * 2, rr = Math.sqrt(r()) * RPX; b.push([Math.cos(a) * rr, Math.sin(a) * rr, 4 + r() * 18, r()]); } return b; })();
function guy2D(x, y, s, T) { octx.save(); octx.translate(x, y); octx.rotate(PI + 0.25 * S(T * 2)); octx.scale(s, s); octx.lineCap = 'round'; octx.lineJoin = 'round'; const fl = S(T * 16);
  octx.strokeStyle = '#111'; octx.lineWidth = 9; octx.beginPath(); octx.moveTo(-10, 18); octx.lineTo(-16 + 6 * fl, 52); octx.moveTo(10, 18); octx.lineTo(16 - 6 * fl, 52); octx.stroke(); octx.strokeStyle = '#2e3550'; octx.lineWidth = 6; octx.stroke();
  octx.strokeStyle = '#111'; octx.lineWidth = 9; octx.beginPath(); octx.moveTo(-14, -14); octx.lineTo(-34, -40 + 10 * fl); octx.moveTo(14, -14); octx.lineTo(34, -40 - 10 * fl); octx.stroke(); octx.strokeStyle = '#e8453a'; octx.lineWidth = 6; octx.stroke();
  octx.fillStyle = '#e8453a'; octx.strokeStyle = '#111'; octx.lineWidth = 4; octx.beginPath(); octx.roundRect(-16, -18, 32, 40, 8); octx.fill(); octx.stroke();
  octx.fillStyle = '#e4b08a'; octx.beginPath(); octx.arc(0, -34, 15, 0, PI * 2); octx.fill(); octx.stroke(); octx.fillStyle = '#3a2416'; octx.beginPath(); octx.arc(0, -38, 15, PI, 0); octx.fill();
  octx.fillStyle = '#111'; octx.beginPath(); octx.arc(-5, -33, 2.4, 0, 7); octx.arc(5, -33, 2.4, 0, 7); octx.fill(); octx.beginPath(); octx.ellipse(0, -25, 4, 5.5, 0, 0, 7); octx.fill(); octx.restore(); }
function fall2D(T) { const p = fallP(T), d = p * 2 * RPX, gy = 640, cy = gy + RPX - d, cx = 360; octx.save();
  const sky = octx.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, '#0a1030'); sky.addColorStop(1, '#141a3a'); octx.fillStyle = sky; octx.fillRect(0, 0, W, H);
  const layers = [[RPX, '#7a5a3a'], [RPX - 35 * KM, '#c8502a'], [3480 * KM, '#f08a2a'], [1220 * KM, '#ffd84a']]; layers.forEach(([r, c]) => { octx.fillStyle = c; octx.beginPath(); octx.arc(cx, cy, r, 0, PI * 2); octx.fill(); });
  const mg = octx.createRadialGradient(cx, cy, 3480 * KM, cx, cy, RPX - 35 * KM); mg.addColorStop(0, 'rgba(255,170,60,0.55)'); mg.addColorStop(1, 'rgba(120,30,10,0.35)'); octx.fillStyle = mg; octx.beginPath(); octx.arc(cx, cy, RPX - 35 * KM, 0, PI * 2); octx.arc(cx, cy, 3480 * KM, 0, PI * 2, true); octx.fill('evenodd');
  const cg = octx.createRadialGradient(cx, cy, 0, cx, cy, 1220 * KM); cg.addColorStop(0, '#fffbe0'); cg.addColorStop(1, 'rgba(255,216,74,0)'); octx.fillStyle = cg; octx.beginPath(); octx.arc(cx, cy, 1220 * KM, 0, PI * 2); octx.fill();
  BLOBS.forEach(([bx, by, s, v]) => { const y = cy + by, x = cx + bx; if (y < -30 || y > H + 30) return; const rr = Math.hypot(bx, by); octx.fillStyle = rr > RPX - 35 * KM ? 'rgba(40,25,15,0.35)' : rr > 3480 * KM ? `rgba(90,20,10,${0.18 + v * 0.15})` : `rgba(255,240,180,${0.15 + v * 0.2})`; octx.beginPath(); octx.arc(x, y, s, 0, 7); octx.fill(); });
  octx.fillStyle = '#5ab84a'; octx.fillRect(0, cy - RPX - 18, W, 18); // grass at the surface
  octx.fillStyle = '#0a0806'; octx.fillRect(cx - 22, cy - RPX - 20, 44, 2 * RPX + 40); octx.strokeStyle = 'rgba(0,0,0,0.5)'; octx.lineWidth = 3; octx.strokeRect(cx - 22, cy - RPX - 20, 44, 2 * RPX + 40);
  for (let km = 1000; km < 12742; km += 1000) { const y = cy - RPX + km * KM; if (y < 0 || y > H) continue; octx.fillStyle = 'rgba(255,255,255,0.8)'; octx.fillRect(cx + 26, y - 1, 18, 3); octx.font = '600 20px CapFont'; octx.textAlign = 'left'; octx.textBaseline = 'middle'; octx.fillText(km.toLocaleString('en-GB') + ' km', cx + 50, y); }
  for (const [km, l, c] of [[0, 'CRUST', '#e8d0b0'], [35, 'MANTLE', '#ffb08a'], [2900, 'OUTER CORE', '#ffd08a'], [5150, 'INNER CORE', '#fff4b0']]) { const y = cy - RPX + km * KM; if (y < 120 || y > H - 160) continue; octx.save(); octx.font = '34px Russo'; octx.textAlign = 'right'; octx.textBaseline = 'middle'; octx.lineJoin = 'round'; octx.lineWidth = 8; octx.strokeStyle = '#111'; octx.strokeText(l, cx - 40, y + 30); octx.fillStyle = c; octx.fillText(l, cx - 40, y + 30); octx.restore(); }
  const sp = speedAt(p) / 28000; for (let i = 0; i < 8; i++) { const ph = (T * (2 + sp * 6) + i / 8) % 1; octx.strokeStyle = `rgba(255,255,255,${0.5 * (1 - ph)})`; octx.lineWidth = 3; const x = cx - 16 + (i * 37) % 32; octx.beginPath(); octx.moveTo(x, gy - 110 - ph * 160); octx.lineTo(x, gy - 110 - ph * 160 - 50 - sp * 80); octx.stroke(); }
  guy2D(cx, gy, 1.8, T); const heat = clamp((p - 0.15) * 2.4); if (heat > 0) { octx.fillStyle = `rgba(255,90,20,${0.18 * heat})`; octx.fillRect(0, 0, W, H); } octx.restore(); }
window.initFootball = async function () {
  await Promise.all(['600 44px CapFont', '44px Russo'].map(f => document.fonts.load(f)));
  GLOW = ctex(64, 64, (c, w, h) => { const gr = c.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.3, 'rgba(255,255,255,0.5)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = gr; c.fillRect(0, 0, w, h); });
  glc = document.createElement('canvas'); glc.width = RW; glc.height = RH;
  renderer = new T3.WebGLRenderer({ canvas: glc, antialias: true, preserveDrawingBuffer: true }); renderer.setPixelRatio(1); renderer.setSize(RW, RH, false); renderer.outputColorSpace = T3.SRGBColorSpace; renderer.toneMapping = T3.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0; renderer.shadowMap.enabled = true; renderer.shadowMap.type = T3.PCFSoftShadowMap; renderer.localClippingEnabled = true;
  scene = new T3.Scene(); scene.background = new T3.Color('#070a1a'); camera = new T3.PerspectiveCamera(58, RW / RH, 0.03, 6000); scene.add(camera);
  build(); toonify(scene); buildEarth(); out = document.getElementById('c'); octx = out.getContext('2d');
};
window.DURATION = TM.total;
window.renderFrame = function (T) { const loop = T >= E.loop; const ci = loop ? 0 : CLI(T); shot(T); renderer.render(scene, camera);
  octx.globalCompositeOperation = 'source-over'; octx.globalAlpha = 1; octx.filter = 'contrast(1.04) saturate(1.12)'; octx.drawImage(glc, 0, 0, W, H); octx.filter = 'none';
  const vg = octx.createRadialGradient(360, 640, 440, 360, 640, 900); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.3)'); octx.fillStyle = vg; octx.fillRect(0, 0, W, H);
  if (!loop && T >= D2A && T < D2B) fall2D(T);
  else if (ci === 3 && !loop) { octx.fillStyle = `rgba(255,80,20,${0.12 + 0.05 * S(T * 9)})`; octx.fillRect(0, 0, W, H); }
  if (ci >= 1 && ci <= 5 && !loop && !(ci === 5 && T > E.pop - 0.15)) meters(T);
  if (ci === 0 || loop) big('NEVER JUMP IN', 360, 66, '#ff4a3a', loop ? 1 : prog(T, 0, 0.15));
  if (ci === 1) big('12,742 KM', 470, 70, '#fff', prog(T, E.c1 + 0.3, E.c1 + 0.5));
  if (ci === 3 && T > E.sun - 0.1) big('AS HOT AS THE SUN', 850, 46, '#ffd23a', prog(T, E.sun - 0.1, E.sun + 0.1)); if (ci === 3 && T > E.pressure - 0.1) big('3,600,000x PRESSURE', 920, 40, '#fff', prog(T, E.pressure - 0.1, E.pressure + 0.1));
  if (ci === 4) big('WEIGHTLESS', 380, 74, '#9af0ff', prog(T, E.c4 + 0.6, E.c4 + 0.8));
  if (ci === 5 && T < E.pop - 0.15) big('~42 MINUTES', 470, 60, '#fff', prog(T, E.c5 + 0.2, E.c5 + 0.4));
  const k = popIdx(T); if (!loop && ci >= 5 && k >= 0 && !(ci === 6 && T >= E.forever - 0.1 && T < E.every + 0.3)) { const a = ease(prog(T, POPS[k] + 0.25, POPS[k] + 0.45)); octx.save(); octx.globalAlpha = a; octx.fillStyle = 'rgba(255,255,255,0.95)'; octx.beginPath(); octx.roundRect(170, 180, 380, 96, 24); octx.fill(); octx.strokeStyle = '#111'; octx.lineWidth = 6; octx.stroke(); txt('SHEEP HELLO', 360, 210, 26, '#2a8a4a'); txt('#' + HELLO[k].toLocaleString('en-GB'), 360, 248, 40, '#111'); octx.restore(); }
  if (ci === 6 && T >= E.forever - 0.1 && T < E.every + 0.3) big('FOREVER', 470, 80, '#ffd23a', prog(T, E.forever - 0.1, E.forever + 0.1));
  const cap = CAPS.find(c => T >= c.a && T < c.b); if (cap && !loop) caption(cap); };
})();
