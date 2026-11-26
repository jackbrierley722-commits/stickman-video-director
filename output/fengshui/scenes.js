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
const E = { here: AT(0, "here's"), c1: CL[1].start, coffin: AT(1, 'coffin'), carried: AT(1, 'because'), c2: CL[2].start, fix: AT(2, 'fix'), command: AT(2, 'command'), diag: AT(2, 'bed'), see: AT(2, 'see'), without: AT(2, 'without'),
  c3: CL[3].start, mirror: AT(3, 'mirror'), bounces: AT(3, 'bounces'), c4: CL[4].start, junk: AT(4, 'junk'), plant: AT(4, 'plant'), c5: CL[5].start, moved: AT(5, 'moved'), perfect: AT(5, 'perfect'),
  c6: CL[6].start, cat: AT(6, 'cat'), feet: AT(6, 'feet'), c7: CL[7].start };
E.loop = TM.total - 0.4;
const DOOR = [3.45, 1.8];                       // door in the right wall (x, z)
const COFFIN = { x: -1.95, z: 1.8, ry: PI / 2 }, CMD = { x: -1.55, z: -2.15, ry: 0 };
function build() {
  R.hemi = new T3.HemisphereLight('#fff4e4', '#8a7a6a', 1.3); scene.add(R.hemi); R.sun = new T3.DirectionalLight('#fff0dc', 1.9); R.sun.position.set(4, 10, 7); R.sun.castShadow = true; R.sun.shadow.mapSize.set(2048, 2048); const sc = R.sun.shadow.camera; sc.left = sc.bottom = -7; sc.right = sc.top = 7; scene.add(R.sun); scene.add(R.sun.target);
  scene.background = new T3.Color('#e8dccc');
  const G = R.G = new T3.Group(); scene.add(G); const floor = SM('#c89a6a'), wall = SM('#e8ddc8'), wall2 = SM('#ddd0b8'), trim = SM('#f4f0e8');
  add(G, Bx(7, 0.2, 7), floor, 0, -0.1, 0); for (let i = 0; i < 9; i++) add(G, Bx(7, 0.005, 0.03), SM('#a87a4a'), 0, 0.002, -3.3 + i * 0.8, false);
  add(G, Bx(7, 3.2, 0.15), wall, 0, 1.6, -3.5); add(G, Bx(0.15, 3.2, 7), wall2, -3.5, 1.6, 0); add(G, Bx(0.15, 3.2, 3.9), wall2, 3.5, 1.6, -1.55); add(G, Bx(0.15, 3.2, 1.6), wall2, 3.5, 1.6, 2.7); add(G, Bx(0.15, 1.0, 1.5), wall2, 3.5, 2.7, DOOR[1]);
  add(G, Bx(1.6, 1.2, 0.06), SM('#bfe0f4'), -0.6, 1.9, -3.42); add(G, Bx(1.7, 0.08, 0.1), trim, -0.6, 1.28, -3.4);  // window
  R.door = new T3.Group(); R.door.position.set(3.45, 0, DOOR[1] - 0.7); G.add(R.door); add(R.door, Bx(0.06, 2.15, 1.4), SM('#8a5a32'), 0, 1.07, 0.7); add(R.door, Sp(0.05, 10, 8), SM('#d8b84a'), -0.06, 1.0, 1.25);
  add(G, Bx(2.4, 0.03, 1.8), SM('#7a9ac8'), 0.6, 0.015, 0.4);  // rug
  // the bed (head at local -z)
  const B = R.bed = new T3.Group(); G.add(B); add(B, Bx(1.6, 0.35, 2.2), SM('#6a4a32'), 0, 0.2, 0); add(B, Bx(1.5, 0.22, 2.1), SM('#f4f0ea'), 0, 0.48, 0); add(B, Bx(1.6, 0.9, 0.12), SM('#6a4a32'), 0, 0.55, -1.08); add(B, Bx(0.9, 0.12, 0.4), SM('#ffffff'), 0, 0.64, -0.8); R.duvet = add(B, Bx(1.52, 0.1, 1.3), SM('#e88a6a'), 0, 0.62, 0.35);
  R.junk = []; [['#b88a5a', -0.4], ['#5a8ac8', 0.15], ['#c84a4a', 0.55]].forEach(([c, z], i) => { const j = add(B, Bx(0.5, 0.28, 0.45), SM(c), (i - 1) * 0.5, 0.14, z + 0.2); j.userData.p = j.position.clone(); R.junk.push(j); });
  // free-standing mirror
  const M = R.mirror = new T3.Group(); G.add(M); add(M, Bx(0.85, 1.75, 0.08), SM('#c8a060'), 0, 1.05, 0); add(M, Bx(0.72, 1.6, 0.03), SM('#cfe8f8', { roughness: 0.05, metalness: 0.6 }), 0, 1.05, 0.05); for (const sx of [-1, 1]) add(M, Bx(0.08, 0.5, 0.5), SM('#c8a060'), sx * 0.35, 0.18, 0);
  // plant
  const P = R.plant = new T3.Group(); G.add(P); add(P, Cy(0.28, 0.22, 0.5, 14), SM('#e8e4dc'), 0, 0.25, 0); for (let k = 0; k < 9; k++) { const l = add(P, Sp(0.2, 10, 8), SM(k % 2 ? '#3a8a3a' : '#4aa04a'), S(k * 2.3) * 0.18, 0.7 + (k % 4) * 0.16, C(k * 2.3) * 0.18); l.scale.set(0.6, 1.5, 0.5); }
  add(G, Bx(0.9, 0.7, 0.6), SM('#8a6a4a'), 2.5, 0.35, -3.05);  // dresser
  // you
  R.you = human({ top: '#3a8a6a', bot: '#2a2e3a', hair: '#3a2416', skin: '#e4b08a' }); G.add(R.you);
  // the cat (original): ginger, white socks
  const cat = R.cat = new T3.Group(); G.add(cat); const fur = SM('#e8963a'), wh = SM('#fff4e8'); const body = add(cat, Sp(0.26, 14, 10), fur, 0, 0.2, 0); body.scale.set(1, 0.7, 1.7);
  const hd = R.catHead = new T3.Group(); hd.position.set(0, 0.32, -0.45); cat.add(hd); add(hd, Sp(0.17, 14, 10), fur, 0, 0, 0); for (const sx of [-1, 1]) { const e = add(hd, new T3.ConeGeometry(0.07, 0.14, 4), fur, sx * 0.1, 0.15, 0); e.rotation.z = -sx * 0.25; add(hd, Sp(0.025, 8, 6), SM('#2a2420'), sx * 0.06, 0.03, -0.15, false); }
  R.catLegs = []; for (const [x, z] of [[-0.12, -0.3], [0.12, -0.3], [-0.12, 0.3], [0.12, 0.3]]) { const l = new T3.Group(); l.position.set(x, 0.12, z); cat.add(l); add(l, Cap(0.045, 0.16, 8), fur, 0, -0.08, 0); add(l, Sp(0.05, 8, 6), wh, 0, -0.16, 0); R.catLegs.push(l); }
  const tail = R.catTail = new T3.Group(); tail.position.set(0, 0.25, 0.42); cat.add(tail); add(tail, Cap(0.04, 0.45, 8), fur, 0, 0.18, 0.1).rotation.x = 0.6;
  // chi sparkles
  R.chi = []; for (let i = 0; i < 40; i++) R.chi.push(spr(G, GLOW, i % 2 ? '#ffe08a' : '#9af0c8', 0.22, 0, -5, 0, 0));
}
// ---------- shots ----------
const OV = [[4.6, 7.2, 8.6], [0.2, 0.3, 0.2]];
const SH = [
  [0, (k, T) => TR(k, [-0.4, 2.4, 3.6], [1.2, 4.2, 6.0], [-1.6, 0.6, 1.8], [-0.8, 0.5, 1.4])],
  [E.c1, (k, T) => TR(k, OV[0], [4.4, 7.0, 8.3], OV[1], OV[1])],
  [E.c2, (k, T) => TR(k, [4.2, 7.4, 7.8], [3.8, 7.8, 7.2], [-0.2, 0.2, 0], [-0.4, 0.2, -0.4])],
  [E.c3, (k, T) => TR(k, [2.4, 3.4, 4.6], [2.0, 3.2, 4.2], [-1.4, 0.8, -0.8], [-1.4, 0.8, -1.0])],
  [E.c4, (k, T) => TR(k, [0.6, 0.6, 1.6], [0.4, 0.7, 1.3], [-1.55, 0.3, -2.0], [-1.55, 0.3, -2.0])],
  [E.plant - 0.15, (k, T) => TR(k, [1.0, 2.0, 0.8], [1.2, 2.0, 0.6], [2.8, 0.7, -2.6], [2.8, 0.7, -2.6])],
  [E.c5, (k, T) => TR(k, [4.0, 6.0, 7.6], [4.6, 7.0, 8.6], OV[1], OV[1])],
  [E.c6, (k, T) => TR(k, [0.6, 1.8, 4.2], [0.9, 1.4, 3.6], [2.4, 0.3, 1.8], [2.4, 0.25, 1.8])],
  [E.feet - 0.1, (k, T) => TR(k, [4.0, 6.0, 7.0], [4.4, 6.6, 7.8], [1.6, 0.2, 1.4], [1.0, 0.2, 1.0])],
  [E.c7, (k, T) => TR(k, [4.4, 6.6, 7.8], [4.8, 7.6, 9.0], OV[1], OV[1])],
  [E.loop, (k, T) => look([-0.4, 2.4, 3.6], [-1.6, 0.6, 1.8])],
];
const shotAt = T => { let i = 0; for (let j = 0; j < SH.length; j++) if (T >= SH[j][0]) i = j; return i; };
function bedPose(T) { const loop = T >= E.loop, ci = loop ? 0 : CLI(T); if (ci < 2 || loop) return COFFIN; if (ci > 2) return CMD; const k = ease(prog(T, E.fix - 0.1, E.command + 0.6)); return { x: lerp(COFFIN.x, CMD.x, k), z: lerp(COFFIN.z, CMD.z, k), ry: lerp(COFFIN.ry, CMD.ry, k) }; }
function anim(T) { const loop = T >= E.loop, ci = loop ? 0 : CLI(T); const you = R.you, u = you.userData; rest(you); face(you, 'neutral', T);
  const bp = bedPose(T); R.bed.position.set(bp.x, 0, bp.z); R.bed.rotation.y = bp.ry;
  // asleep in the coffin position for the hook
  R.duvet.visible = true;
  if (ci <= 1 || loop) { const m = new T3.Matrix4().makeBasis(new T3.Vector3(0, 0, -1), new T3.Vector3(-1, 0, 0), new T3.Vector3(0, 1, 0)); you.quaternion.setFromRotationMatrix(m); you.position.set(bp.x + 0.95, 0.6, bp.z); u.armL.rotation.set(0, 0, -0.15); u.armR.rotation.set(0, 0, 0.15); face(you, 'neutral', T); R.duvet.visible = false; }
  else if (ci === 5) { you.position.set(0.6, 0, 0.6); you.rotation.set(0, 0.3, 0); u.armL.rotation.set(0, 0, -0.5); u.armR.rotation.set(0, 0, 0.5); u.armL.userData.e.rotation.x = -1.4; u.armR.userData.e.rotation.x = -1.4; face(you, 'smug', T); }
  else if (ci >= 6) { you.position.set(-0.3, 0, -0.2); you.rotation.set(0, 0.8, 0); face(you, T > E.feet ? 'shock' : 'neutral', T); }
  else { you.position.set(0.9, 0, -0.4); you.rotation.set(0, -0.7, 0); }
  // mirror: facing the bed, then turned away against the wall
  const mt = ci > 3 && !loop ? 1 : ci === 3 ? ease(prog(T, E.bounces + 0.9, E.c4 - 0.1)) : 0; R.mirror.position.set(lerp(-1.55, 1.6, mt), 0, lerp(0.15, -3.15, mt)); R.mirror.rotation.y = lerp(PI, 0, mt);
  R.mirror.visible = ci >= 3 && !loop || ci === 2 && T > E.without;
  // junk under the bed pops out, plant grows in
  R.junk.forEach((j, i) => { const k = ci === 4 ? ease(prog(T, E.junk + i * 0.12, E.junk + 0.35 + i * 0.12)) : ci > 4 && !loop ? 1 : 0; j.position.set(j.userData.p.x + 3 * k, j.userData.p.y + 1.5 * S(PI * k), j.userData.p.z); j.visible = k < 0.95; });
  const pk = ci === 4 ? ease(prog(T, E.plant - 0.1, E.plant + 0.4)) : ci > 4 && !loop ? 1 : 0; R.plant.position.set(2.8, 0, -2.6); R.plant.scale.setScalar(Math.max(0.001, pk)); R.plant.visible = pk > 0.01;
  // the cat: wanders in, flops down with its feet to the door
  const cat = R.cat; cat.visible = ci >= 6 && !loop; R.catLegs.forEach((l, i) => l.rotation.x = 0); R.catTail.rotation.z = 0.3 * S(T * 3);
  if (cat.visible) { const w = prog(T, E.c6, E.cat + 0.5); if (T < E.cat + 0.5) { cat.position.set(lerp(-1.2, 1.6, w), 0, lerp(0.4, 1.8, w)); cat.rotation.set(0, -PI / 2 - 0.4 * (1 - w), 0); R.catLegs.forEach((l, i) => l.rotation.x = 0.6 * S(T * 12 + i * PI)); }
    else { const lie = ease(prog(T, E.cat + 0.5, E.feet)); cat.position.set(1.6, 0.0, 1.8); cat.rotation.set(0, -PI / 2, -1.45 * lie); cat.position.y = 0.12 * lie; R.catLegs.forEach((l, i) => l.rotation.x = (i < 2 ? -1 : 1) * 0.9 * lie); } }
  // chi sparkles drift in from the door when the room is balanced
  const on = ci === 5 && !loop; R.chi.forEach((s, i) => { const ph = (T * 0.25 + i / 40) % 1; const a = ph * PI * 3 + i; const r = 2.6 * (1 - ph * 0.5); s.position.set(lerp(DOOR[0], 0, ph) + Math.cos(a) * r * ph, 0.4 + ph * 1.6 + 0.3 * S(i), lerp(DOOR[1], 0, ph) + Math.sin(a) * r * ph); s.material.opacity = on ? 0.9 * S(PI * ph) : 0; });
  R.door.rotation.y = ci >= 6 && !loop ? -0.5 : 0;
}
function shot(T) { const si = shotAt(T), sh = SH[si], t0 = sh[0], t1 = si + 1 < SH.length ? SH[si + 1][0] : TM.total; camera.fov = 58; camera.updateProjectionMatrix(); anim(T); sh[1](prog(T, t0, t1), T); return { si, t0 }; }
// diagram helpers (2D overlay)
function scr(x, y, z) { const v = new T3.Vector3(x, y, z).project(camera); return [(v.x + 1) / 2 * W, (1 - v.y) / 2 * H, v.z]; }
function bedPoint(local) { const b = R.bed; b.updateMatrixWorld(true); const v = b.localToWorld(new T3.Vector3(...local)); return [v.x, v.y, v.z]; }

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
const NUMW = {};
const CAPS = []; CL.forEach(c0 => { let cur = []; const flush = () => { if (cur.length) CAPS.push({ a: cur[0].a, b: cur[cur.length - 1].b, t: cur.map(w => w.w).join(' ') }); cur = []; };
  c0.words.forEach(w0 => { const w = Object.assign({}, w0, { w: NUMW[w0.w.toLowerCase()] || w0.w }); const prev = cur[cur.length - 1]; if (cur.length && (/^option$/i.test(w.w) || cur.length >= 3 || w.a - prev.b > 0.25 || w.a - prev.a > 0.6 || /[.,!?]$/.test(prev.w))) flush(); cur.push(w); }); flush(); });
CAPS.forEach((c, i) => { const nx = CAPS[i + 1]; c.b = nx ? Math.min(nx.a, c.b + 0.3) : c.b + 0.6; });
function caption(c) { octx.save(); octx.font = '600 50px CapFont'; octx.textAlign = 'center'; octx.textBaseline = 'middle'; octx.lineJoin = 'round'; octx.lineWidth = 12; octx.strokeStyle = '#111'; octx.strokeText(c.t, 360, 1050); octx.fillStyle = '#ffe04a'; octx.fillText(c.t, 360, 1050); octx.restore(); }
function txt(s_, x, y, size, col, font = 'Russo', align = 'center') { octx.font = `${size}px ${font}`; octx.fillStyle = col; octx.textAlign = align; octx.textBaseline = 'middle'; octx.fillText(s_, x, y); }
function big(s_, y, size, col, a = 1) { if (a <= 0) return; octx.save(); octx.globalAlpha = Math.min(1, a); const sc = a < 1 ? 1 + (1 - a) * 0.35 : 1; octx.translate(360, y); octx.scale(sc, sc); octx.font = `${size}px Russo`; octx.textAlign = 'center'; octx.textBaseline = 'middle'; octx.lineJoin = 'round'; octx.lineWidth = size * 0.22; octx.strokeStyle = '#111'; octx.strokeText(s_, 0, 0); octx.fillStyle = col; octx.fillText(s_, 0, 0); octx.restore(); }
function dline(p, q, col, a, dash = [18, 12], w = 8) { const A = scr(...p), B_ = scr(...q); if (A[2] > 1 || B_[2] > 1) return; octx.save(); octx.globalAlpha = a; octx.strokeStyle = col; octx.lineWidth = w; octx.lineCap = 'round'; octx.setLineDash(dash); octx.lineDashOffset = -performance.now() / 40;
  octx.beginPath(); octx.moveTo(A[0], A[1]); octx.lineTo(B_[0], B_[1]); octx.stroke(); octx.setLineDash([]); octx.fillStyle = col; const ang = Math.atan2(B_[1] - A[1], B_[0] - A[0]); octx.translate(B_[0], B_[1]); octx.rotate(ang); octx.beginPath(); octx.moveTo(6, 0); octx.lineTo(-18, -13); octx.lineTo(-18, 13); octx.fill(); octx.restore(); }
function mark(x, y, z, good, a) { const [sx, sy, sz] = scr(x, y, z); if (sz > 1) return; octx.save(); octx.globalAlpha = a; octx.fillStyle = good ? '#2ab85a' : '#e8302a'; octx.beginPath(); octx.arc(sx, sy, 40, 0, 7); octx.fill(); octx.strokeStyle = '#fff'; octx.lineWidth = 9; octx.lineCap = 'round'; octx.beginPath();
  if (good) { octx.moveTo(sx - 16, sy); octx.lineTo(sx - 4, sy + 13); octx.lineTo(sx + 18, sy - 13); } else { octx.moveTo(sx - 14, sy - 14); octx.lineTo(sx + 14, sy + 14); octx.moveTo(sx + 14, sy - 14); octx.lineTo(sx - 14, sy + 14); } octx.stroke(); octx.restore(); }
window.initFootball = async function () {
  await Promise.all(['600 44px CapFont', '44px Russo'].map(f => document.fonts.load(f)));
  GLOW = ctex(64, 64, (c, w, h) => { const gr = c.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.3, 'rgba(255,255,255,0.5)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = gr; c.fillRect(0, 0, w, h); });
  glc = document.createElement('canvas'); glc.width = RW; glc.height = RH;
  renderer = new T3.WebGLRenderer({ canvas: glc, antialias: true, preserveDrawingBuffer: true }); renderer.setPixelRatio(1); renderer.setSize(RW, RH, false); renderer.outputColorSpace = T3.SRGBColorSpace; renderer.toneMapping = T3.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0; renderer.shadowMap.enabled = true; renderer.shadowMap.type = T3.PCFSoftShadowMap;
  scene = new T3.Scene(); camera = new T3.PerspectiveCamera(62, RW / RH, 0.03, 2000); scene.add(camera);
  build(); toonify(scene); out = document.getElementById('c'); octx = out.getContext('2d');
};
window.DURATION = TM.total;
window.renderFrame = function (T) { const loop = T >= E.loop; const ci = loop ? 0 : CLI(T); shot(T); renderer.render(scene, camera);
  octx.globalCompositeOperation = 'source-over'; octx.globalAlpha = 1; octx.filter = 'contrast(1.05) saturate(1.12)'; octx.drawImage(glc, 0, 0, W, H); octx.filter = 'none';
  const vg = octx.createRadialGradient(360, 640, 440, 360, 640, 900); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.3)'); octx.fillStyle = vg; octx.fillRect(0, 0, W, H);
  const DR = [DOOR[0], 0.9, DOOR[1]];
  if ((ci <= 1 || loop) && T > 1.0) { dline(bedPoint([0, 0.7, 1.2]), DR, '#e8302a', prog(T, 1.0, 1.4)); if (ci === 1 && T > E.coffin - 0.1) mark(...bedPoint([0, 0.9, 0]), false, prog(T, E.coffin - 0.1, E.coffin + 0.1)); }
  if (ci === 2 && T > E.diag - 0.1) { dline(bedPoint([0, 1.0, -0.9]), DR, '#2ab85a', prog(T, E.diag - 0.1, E.diag + 0.2)); if (T > E.see - 0.1) mark(...bedPoint([0, 1.1, 0]), true, prog(T, E.see - 0.1, E.see + 0.1)); }
  if (ci === 3 && T < E.bounces + 0.9) { const m = [-1.55, 1.1, 0.15]; const b1 = bedPoint([0, 0.9, 0.6]); const a = prog(T, E.bounces - 0.2, E.bounces + 0.1); dline(m, b1, '#e8a02a', a, [10, 10], 6); dline(b1, [m[0] - 0.4, 1.4, m[2]], '#e8a02a', a, [10, 10], 6); dline([m[0] - 0.4, 1.4, m[2]], bedPoint([0.3, 1.0, -0.4]), '#e8a02a', a, [10, 10], 6); if (T > E.mirror - 0.1) mark(m[0], 2.2, m[2], false, prog(T, E.mirror - 0.1, E.mirror + 0.1)); }
  if (ci === 6 && T > E.feet - 0.1) { dline([1.6, 0.2, 1.8], DR, '#e8302a', prog(T, E.feet - 0.1, E.feet + 0.2)); mark(1.6, 0.9, 1.8, false, prog(T, E.feet + 0.1, E.feet + 0.3)); }
  if (ci === 0 || loop) { big('NEVER', 400, 84, '#e8302a', loop ? 1 : prog(T, 0, 0.15)); big('FEET FACING THE DOOR', 480, 40, '#fff', loop ? 1 : prog(T, 0.9, 1.1)); }
  if (ci === 1 && T > E.coffin - 0.1) big('THE COFFIN POSITION', 400, 50, '#e8302a', prog(T, E.coffin - 0.1, E.coffin + 0.1));
  if (ci === 2 && T > E.command - 0.1) big('COMMAND POSITION', 400, 54, '#2ab85a', prog(T, E.command - 0.1, E.command + 0.1));
  if (ci === 3 && T > E.mirror - 0.1) big('NO MIRROR FACING THE BED', 400, 38, '#e8a02a', prog(T, E.mirror - 0.1, E.mirror + 0.1));
  if (ci === 4) { if (T > E.junk - 0.1) big('CLEAR UNDER THE BED', 400, 42, '#fff', prog(T, E.junk - 0.1, E.junk + 0.1)); if (T > E.plant - 0.1) big('+ A PLANT', 470, 50, '#2ab85a', prog(T, E.plant - 0.1, E.plant + 0.1)); }
  if (ci === 5 && T > E.perfect - 0.1) big('PERFECT BALANCE', 400, 56, '#2ab85a', prog(T, E.perfect - 0.1, E.perfect + 0.1));
  if (ci === 6 && T > E.feet - 0.1) big('COFFIN POSITION', 400, 56, '#e8302a', prog(T, E.feet - 0.1, E.feet + 0.1));
  if (ci === 7 && !loop) big('SEND THIS', 400, 64, '#ffd23a', prog(T, E.c7, E.c7 + 0.15));
  const cap = CAPS.find(c => T >= c.a && T < c.b); if (cap && !loop) caption(cap); };
})();
