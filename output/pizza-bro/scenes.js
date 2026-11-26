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
const E = { bro0: AT(0, 'but'), c1: CL[1].start, blink: AT(1, 'bro'), c2: CL[2].start, clever: AT(2, 'clever'), c3: CL[3].start, c4: CL[4].start, much4: AT(4, 'much'), c5: CL[5].start, drill: AT(5, 'drill'),
  c6: CL[6].start, much6: AT(6, 'much'), c7: CL[7].start, broThere: AT(7, 'bro'), fork: AT(7, 'with'), c8: CL[8].start };
E.loop = TM.total - 0.4;
const MO = [400, 0, 0], YD = [200, 0, 0];
function sliceG(card) { const g = new T3.Group(); const sh = new T3.Shape(); sh.moveTo(0, 0); sh.lineTo(-0.22, 0.5); sh.quadraticCurveTo(0, 0.56, 0.22, 0.5); sh.lineTo(0, 0);
  const m = add(g, new T3.ExtrudeGeometry(sh, { depth: 0.035, bevelEnabled: false }), SM(card ? '#b88a5a' : '#f2c04a'), 0, 0, 0); m.rotation.x = -PI / 2;
  const crust = add(g, Bx(0.46, 0.07, 0.09), SM(card ? '#8a6040' : '#c8823a'), 0, 0.03, -0.51); crust.scale.x = 1;
  if (!card) for (const [x, z] of [[0, -0.15], [-0.08, -0.33], [0.09, -0.36], [0, -0.42]]) add(g, Cy(0.045, 0.045, 0.012, 14), SM('#c83a2a'), x, 0.04, z);
  else for (const [x, z] of [[-0.06, -0.3], [0.07, -0.25]]) add(g, Cy(0.04, 0.04, 0.012, 10), SM('#6a4a30'), x, 0.04, z); return g; }
function build() {
  R.sun = new T3.DirectionalLight('#fff0dc', 2.4); R.sun.position.set(4, 9, 7); R.sun.castShadow = true; R.sun.shadow.mapSize.set(2048, 2048); const sc = R.sun.shadow.camera; sc.left = sc.bottom = -8; sc.right = sc.top = 8; sc.near = 1; sc.far = 40; R.sun.shadow.bias = -0.0005; scene.add(R.sun); scene.add(R.sun.target);
  R.hemi = new T3.HemisphereLight('#ffe8d0', '#7a6a5a', 1.25); scene.add(R.hemi);
  const sky = ctex(16, 512, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#6ab0f0'); g.addColorStop(0.55, '#cfe8fa'); g.addColorStop(1, '#e8f0e0'); c.fillStyle = g; c.fillRect(0, 0, w, h); }); R.sky = add(scene, Sp(900, 32, 16), new T3.MeshBasicMaterial({ map: sky, side: T3.BackSide, toneMapped: false }), 0, 0, 0, false); R.sky.castShadow = false;
  // ---- living room ----
  const G = R.G = new T3.Group(); scene.add(G); add(G, Bx(9, 0.1, 8), SM('#b8865a'), 0, -0.05, 0); add(G, Bx(9, 3, 0.1), SM('#f0d8b0'), 0, 1.5, -3.2); add(G, Bx(0.1, 3, 8), SM('#e8cca0'), -4.5, 1.5, 0); add(G, Bx(0.1, 3, 8), SM('#e8cca0'), 4.5, 1.5, 0);
  const wf = SM('#ffffff'); add(G, Bx(2.4, 1.6, 0.05), new T3.MeshBasicMaterial({ color: '#9ad0f4' }), -1.6, 1.7, -3.13, false); for (const [x, y, w, h] of [[-1.6, 2.52, 2.5, 0.08], [-1.6, 0.88, 2.5, 0.08], [-2.84, 1.7, 0.08, 1.7], [-0.36, 1.7, 0.08, 1.7], [-1.6, 1.7, 0.06, 1.6]]) add(G, Bx(w, h, 0.08), wf, x, y, -3.1);
  add(G, Sp(0.5, 10, 8), SM('#5ab84a'), -2.2, 1.4, -3.4, false); add(G, Sp(0.4, 10, 8), SM('#4aa03a'), -1.1, 1.3, -3.4, false);
  add(G, Bx(2.0, 0.08, 1.1), SM('#8a5a3a'), 0, 0.78, 0); for (const [x, z] of [[-0.9, -0.45], [0.9, -0.45], [-0.9, 0.45], [0.9, 0.45]]) add(G, Bx(0.08, 0.76, 0.08), SM('#6a4228'), x, 0.38, z);
  R.box = new T3.Group(); R.box.position.set(0, 0.83, 0.05); G.add(R.box); add(R.box, Bx(0.8, 0.04, 0.8), SM('#e8dcc8'), 0, 0, 0); const lid = add(R.box, Bx(0.8, 0.8, 0.03), SM('#e8dcc8'), 0, 0.4, -0.41); add(R.box, new T3.PlaneGeometry(0.5, 0.2), BM('#ffffff', { map: ctex(128, 52, (c) => { c.fillStyle = '#c83a2a'; c.fillRect(0, 0, 128, 52); c.fillStyle = '#fff'; c.font = '26px Russo'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('PIZZA', 64, 28); }) }), 0, 0.45, -0.39, false);
  R.slice = sliceG(false); G.add(R.slice); R.card = sliceG(true); G.add(R.card);
  for (const [x, c] of [[-1.4, '#5a6aa8'], [1.4, '#5a6aa8']]) { add(G, Bx(0.5, 0.06, 0.5), SM(c), x, 0.48, 0.1); add(G, Bx(0.5, 0.6, 0.06), SM(c), x + (x < 0 ? -0.22 : 0.22), 0.8, 0.1).rotation.y = PI / 2; }
  // safe
  R.safe = new T3.Group(); R.safe.position.set(0, 0.82, 0.05); G.add(R.safe); add(R.safe, Bx(0.62, 0.55, 0.55), SM('#5a6068', { metalness: 0.5 }), 0, 0.28, 0); add(R.safe, Cy(0.09, 0.09, 0.04, 16), SM('#c8ccd2', { metalness: 0.8 }), 0.08, 0.32, 0.29).rotation.x = PI / 2; add(R.safe, Bx(0.04, 0.16, 0.04), SM('#c8ccd2'), -0.18, 0.28, 0.29);
  R.sparks = []; for (let i = 0; i < 12; i++) R.sparks.push(spr(G, GLOW, '#ffd060', 0.12, 0, 0, 0, 0));
  // people
  R.you = human({ top: '#e8453a', bot: '#2e3550', hair: '#3a2416', skin: '#e4b08a' }); scene.add(R.you); R.bro = human({ top: '#2aa84a', bot: '#3a3a44', hair: '#1a1210', skin: '#c88a60' }); scene.add(R.bro);
  R.drill = new T3.Group(); R.bro.userData.armR.userData.h.add(R.drill); R.drill.position.set(0, -0.05, 0.08); add(R.drill, Bx(0.1, 0.22, 0.1), SM('#e8b020'), 0, -0.06, 0); add(R.drill, Bx(0.1, 0.1, 0.3), SM('#e8b020'), 0, 0.05, 0.12); R.bit = add(R.drill, Cy(0.015, 0.005, 0.18, 8), SM('#c8ccd2', { metalness: 0.9 }), 0, 0.05, 0.36); R.bit.rotation.x = PI / 2;
  R.fork = new T3.Group(); R.bro.userData.armR.userData.h.add(R.fork); R.fork.position.set(0, -0.04, 0.05); add(R.fork, Bx(0.02, 0.02, 0.2), SM('#d8dce0', { metalness: 0.9 }), 0, 0, 0.1); for (const x of [-0.02, 0, 0.02]) add(R.fork, Bx(0.008, 0.008, 0.08), SM('#d8dce0', { metalness: 0.9 }), x, 0, 0.24);
  R.helmet = add(R.bro.userData.head, Sp(0.26, 24, 16), new T3.MeshStandardMaterial({ color: '#cfe8ff', transparent: true, opacity: 0.28, roughness: 0.05 }), 0, 0, 0.0, false);
  // ---- back yard launch ----
  const Y = R.Y = new T3.Group(); Y.position.set(...YD); scene.add(Y); add(Y, Cy(20, 20, 0.2, 40), SM('#7ac85a'), 0, -0.1, 0); for (let i = 0; i < 8; i++) add(Y, Bx(0.12, 1.1, 0.12), SM('#f4f0e8'), -3 + i * 0.85, 0.55, -3); add(Y, Bx(6.4, 0.1, 0.06), SM('#f4f0e8'), 0.0, 0.9, -3);
  R.rocket = new T3.Group(); Y.add(R.rocket); add(R.rocket, Cy(0.22, 0.22, 1.3, 16), SM('#f4f4f6'), 0, 0.85, 0); add(R.rocket, new T3.ConeGeometry(0.22, 0.45, 16), SM('#e8453a'), 0, 1.72, 0); for (let i = 0; i < 3; i++) { const f = add(R.rocket, Bx(0.04, 0.35, 0.3), SM('#e8453a'), S(i * 2.1) * 0.22, 0.32, C(i * 2.1) * 0.22); f.rotation.y = i * 2.1; } add(R.rocket, Cy(0.1, 0.1, 0.03, 16), SM('#4a8ad8'), 0, 1.1, 0.22).rotation.x = PI / 2;
  R.rSlice = sliceG(false); R.rSlice.scale.setScalar(0.8); R.rSlice.position.set(0, 1.3, 0.24); R.rSlice.rotation.set(PI / 2, 0, PI); R.rocket.add(R.rSlice);
  R.flame = spr(R.rocket, GLOW, '#ffa030', 1.2, 0, 0.0, 0, 0); R.smoke = []; for (let i = 0; i < 14; i++) R.smoke.push(spr(Y, GLOW, '#d8d8d8', 1, 0, 0, 0, 0, T3.NormalBlending));
  // ---- the moon ----
  const M = R.M = new T3.Group(); M.position.set(...MO); scene.add(M); const mt = ctex(256, 256, (c, w, h) => { c.fillStyle = '#b8b8b4'; c.fillRect(0, 0, w, h); const r = rng(3); for (let i = 0; i < 80; i++) { c.fillStyle = `rgba(90,90,88,${0.2 + r() * 0.3})`; c.beginPath(); c.arc(r() * w, r() * h, 3 + r() * 16, 0, 7); c.fill(); } }); mt.wrapS = mt.wrapT = T3.RepeatWrapping; mt.repeat.set(6, 6);
  add(M, Sp(60, 64, 32), SM('#ffffff', { map: mt }), 0, -60, 0).rotation.x = PI / 2; add(M, Sp(80, 24, 12), new T3.MeshBasicMaterial({ color: '#05060e', side: T3.BackSide }), 0, 0, 0, false); for (let i = 0; i < 90; i++) { const a = i * 2.39, b = (i * 0.618) % 1 * 1.4 + 0.1; spr(M, GLOW, '#ffffff', 0.5, S(a) * 70 * C(b), S(b) * 70, C(a) * 70 * C(b), 0.8); }
  R.earth = add(M, Sp(4, 32, 16), SM('#2a7ad8', { emissive: '#1a4a9a', emissiveIntensity: 0.5 }), -10, 14, -40, false); add(M, Sp(4.05, 32, 16), new T3.MeshBasicMaterial({ color: '#5ac85a', transparent: true, opacity: 0.5 }), -10.5, 14.5, -39.6, false);
  R.chair = new T3.Group(); R.chair.position.set(1.0, 0, 0.2); M.add(R.chair); add(R.chair, Bx(0.6, 0.06, 0.6), SM('#e8453a'), 0, 0.42, 0); add(R.chair, Bx(0.6, 0.6, 0.06), SM('#e8453a'), 0, 0.72, -0.3).rotation.x = -0.3; for (const [x, z] of [[-0.28, 0.25], [0.28, 0.25], [-0.28, -0.25], [0.28, -0.25]]) add(R.chair, Cy(0.02, 0.02, 0.42, 6), SM('#c8ccd2'), x, 0.21, z);
  R.flag = new T3.Group(); R.flag.position.set(2.2, 0, -1.2); M.add(R.flag); add(R.flag, Cy(0.03, 0.03, 2, 6), SM('#c8ccd2'), 0, 1, 0); add(R.flag, new T3.PlaneGeometry(0.9, 0.5), BM('#ffffff', { map: ctex(180, 100, (c) => { c.fillStyle = '#2aa84a'; c.fillRect(0, 0, 180, 100); c.fillStyle = '#fff'; c.font = '44px Russo'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('BRO', 90, 54); }), side: T3.DoubleSide }), 0.47, 1.72, 0, false);
  R.mSlice = sliceG(false); M.add(R.mSlice); R.dust = []; for (let i = 0; i < 16; i++) R.dust.push(spr(M, GLOW, '#c8c8c4', 0.4, 0, 0, 0, 0, T3.NormalBlending)); const ml = new T3.DirectionalLight('#ffffff', 2.2); ml.position.set(MO[0] + 6, 10, 8); ml.target.position.set(...MO); scene.add(ml); scene.add(ml.target);
}

const M3 = (x, y, z) => [MO[0] + x, MO[1] + y, MO[2] + z], Y3 = (x, y, z) => [YD[0] + x, YD[1] + y, YD[2] + z];
const SLICE = [0, 0.86, 0.3];
const SH = [
  [0, (k, T) => TR(k, [0.0, 1.35, 1.3], [0.0, 2.1, 5.4], [0, 0.9, 0.1], [0, 1.1, 0])],
  [E.c1, (k, T) => TR(k, [0.0, 2.0, 5.4], [-0.1, 1.95, 5.0], [-0.5, 1.3, -0.6], [-0.5, 1.3, -0.6])],
  [E.blink - 0.1, (k, T) => TR(k, [0.55, 1.75, 0.9], [0.65, 1.75, 0.75], [1.25, 1.72, 0.1], [1.25, 1.72, 0.1])],
  [E.c2, (k, T) => TR(k, [-0.4, 1.4, 1.6], [-0.3, 1.35, 1.4], [-0.4, 0.95, 0.1], [-0.3, 0.95, 0.1])],
  [E.c3, (k, T) => TR(k, [0.1, 1.75, 2.6], [0.2, 1.75, 2.3], [1.0, 1.35, 0.1], [1.1, 1.4, 0.1])],
  [E.c4, (k, T) => TR(k, [-0.2, 1.45, 1.8], [-0.1, 1.4, 1.5], [0, 1.05, 0.05], [0, 1.05, 0.05])],
  [E.c5, (k, T) => TR(k, [0.4, 1.25, 1.2], [0.3, 1.2, 1.0], [0.2, 1.1, 0.05], [0.15, 1.1, 0.05])],
  [E.c6, (k, T) => { const ry = R.rocket.position.y; look(Y3(2.6, 1.4 + Math.max(0, ry - 3) * 0.6, 5.2), Y3(0, 1.4 + Math.max(0, ry - 1), 0)); }],
  [E.c7, (k, T) => TR(k, M3(0.2, 1.5, 5.0), M3(0.3, 1.3, 4.4), M3(0.9, 0.6, 1.0), M3(0.9, 0.4, 1.0))],
  [E.broThere - 0.1, (k, T) => TR(k, M3(0.2, 1.3, 3.2), M3(0.4, 1.25, 2.7), M3(0.9, 0.9, 0.2), M3(0.9, 0.95, 0.2))],
  [E.c8, (k, T) => TR(k, M3(-1.2, 2.0, 5.5), M3(-1.0, 1.8, 5.0), M3(0.6, 0.8, -1), M3(0.6, 1.0, -1))],
  [E.loop, (k, T) => look([0.0, 1.3, 1.25], [0, 0.9, 0.05])],
];
const shotAt = T => { let i = 0; for (let j = 0; j < SH.length; j++) if (T >= SH[j][0]) i = j; return i; };
function handPos(p) { p.updateMatrixWorld(true); const v = new T3.Vector3(); p.userData.armR.userData.h.getWorldPosition(v); return v; }
function anim(T) { const loop = T >= E.loop, ci = loop ? 0 : CLI(T); const you = R.you, bro = R.bro, u = you.userData, b = bro.userData; rest(you); rest(bro); you.visible = bro.visible = true; R.drill.visible = R.fork.visible = R.helmet.visible = false;
  you.position.set(-1.25, 0, 0.15); you.rotation.y = PI / 2; bro.position.set(1.25, 0, 0.15); bro.rotation.y = -PI / 2; face(you, 'grin', T); face(bro, 'angry', T); b.head.rotation.x = 0.35;
  R.box.visible = ci <= 3 || loop; R.safe.visible = !loop && (ci === 4 || ci === 5); R.slice.visible = R.card.visible = false; R.slice.position.set(...SLICE); R.slice.rotation.set(0, 0, 0); R.card.position.set(...SLICE); R.card.rotation.set(0, 0, 0); R.card.scale.setScalar(1);
  if (ci <= 1 || loop) R.slice.visible = true;
  if (ci === 1) { u.armR.rotation.set(-1.6, 0.6, 0); u.head.rotation.y = 0.8; face(you, 'grin', T); if (T > E.blink - 0.1) face(bro, 'angry', T); }
  if (ci === 2) { const k = ease(prog(T, E.c2 + 0.3, E.c2 + 1.4)); R.card.visible = true; R.slice.visible = true; R.card.position.set(lerp(-0.9, 0, k), lerp(1.0, SLICE[1], k), lerp(0.2, SLICE[2], k)); R.slice.position.set(lerp(0, -0.9, k), lerp(SLICE[1], 1.0, k), lerp(SLICE[2], 0.25, k)); u.armR.rotation.set(-1.1, 0, 0); u.armL.rotation.set(-1.0, 0, 0); if (T > E.clever - 0.15) face(you, 'smug', T); }
  if (ci === 3) { R.card.visible = true; const g = ease(prog(T, E.c3, E.c3 + 0.5)); b.armR.rotation.set(-1.2 - 0.9 * g, 0, 0.3 * g); b.armR.userData.e.rotation.x = -1.2 * g; if (g > 0.6) { const h = handPos(bro); R.card.position.copy(h); R.card.rotation.set(-1.2, PI / 2, 0); const bite = prog(T, E.c3 + 0.6, E.c4); R.card.scale.setScalar(Math.max(0.15, 1 - bite)); b.mouth.scale.set(1.3, 1 + 2 * Math.abs(S(T * 14)), 1); } face(bro, 'grin', T); face(you, 'shock', T); }
  if (ci === 4) { face(you, T > E.much4 - 0.15 ? 'smug' : 'grin', T); u.armR.rotation.set(-1.0, 0, 0); u.armR.userData.e.rotation.x = -0.4; }
  if (ci === 5) { bro.position.set(0.75, 0, 0.55); bro.rotation.y = -PI / 2 - 0.5; R.drill.visible = true; b.armR.rotation.set(-1.45, 0, 0.1); b.armR.userData.e.rotation.x = -0.2; face(bro, 'grin', T); face(you, 'shock', T); R.bit.rotation.y = T * 60; }
  R.sparks.forEach((s, i) => { const on = ci === 5 && T > E.drill - 0.3; s.material.opacity = on ? 0.9 : 0; if (!on) return; const ph = (T * 3 + i / 12) % 1; s.position.set(0.25 + (i % 5) * 0.05 * ph, 1.12 + ph * 0.3 - ph * ph * 0.6, 0.38 + ph * 0.4 * C(i * 2)); s.scale.setScalar(0.08 + 0.06 * (1 - ph)); });
  // yard: launch
  const lt = AT(6, 'launch'); const ry = ci === 6 ? Math.max(0, (T - lt - 0.2)) ** 2 * 3.2 : ci < 6 || loop ? 0 : 60; R.rocket.position.y = ry; R.flame.material.opacity = ci === 6 && T > lt - 0.1 ? 0.9 + 0.1 * S(T * 40) : 0; R.flame.scale.setScalar(0.9 + 0.3 * S(T * 30));
  R.smoke.forEach((s, i) => { const on = ci === 6 && T > lt - 0.05; const ph = (T * 0.8 + i / 14) % 1; s.position.set(S(i * 2.3) * (0.4 + ph * 2.5), 0.3 + ph * 0.8, C(i * 2.3) * (0.4 + ph * 2.5)); s.scale.setScalar(0.6 + ph * 2.4); s.material.opacity = on ? 0.6 * (1 - ph) : 0; });
  if (ci === 6) { you.position.set(...Y3(-1.4, 0, 1.2)); you.rotation.y = 0.5; u.armR.rotation.set(-2.6, 0, -0.6); u.armR.userData.e.rotation.x = -1.6; face(you, T > E.much6 - 0.15 ? 'smug' : 'grin', T); bro.visible = false; }
  // the moon
  const mk = ci === 7 ? prog(T, E.c7, E.c7 + 0.7) : ci > 7 && !loop ? 1 : 0; R.mSlice.position.set(...M3(0.9, lerp(8, 0.02, ease(mk) ** 0.5), 1.1)); R.mSlice.rotation.set(0, 0.5, mk < 1 ? 1 - mk : 0);
  R.dust.forEach((s, i) => { const d = ci === 7 ? T - (E.c7 + 0.7) : -1; s.material.opacity = d > 0 && d < 1.4 ? 0.6 * (1 - d / 1.4) : 0; const a = i / 16 * PI * 2; s.position.set(...M3(0.9 + C(a) * (0.2 + Math.max(0, d) * 1.2), 0.15 + Math.max(0, d) * 0.4, 1.1 + S(a) * (0.2 + Math.max(0, d) * 1.2))); s.scale.setScalar(0.3 + Math.max(0, d) * 0.5); });
  if (ci >= 7 && !loop) { you.visible = false; seatPose(bro, 0.45); bro.position.x = MO[0] + 1.0; bro.position.z = MO[2] + 0.2; bro.rotation.y = -0.9; R.helmet.visible = true; face(bro, 'smug', T); b.head.rotation.x = 0.1;
    if (T > E.fork - 0.1 || ci === 8) { R.fork.visible = true; b.armR.rotation.set(-1.6 - 0.5 * Math.abs(S(T * 3)), 0, 0.2); b.armR.userData.e.rotation.x = -0.9; face(bro, 'grin', T); } }
  if (ci <= 5 || loop) { R.Y.visible = R.M.visible = false; R.G.visible = true; } else if (ci === 6) { R.Y.visible = true; R.G.visible = R.M.visible = false; } else { R.M.visible = true; R.G.visible = R.Y.visible = false; } R.sky.visible = !(ci >= 7 && !loop); }
function shot(T) { const si = shotAt(T), sh = SH[si], t0 = sh[0], t1 = si + 1 < SH.length ? SH[si + 1][0] : TM.total; camera.fov = 58; camera.updateProjectionMatrix(); anim(T); sh[1](prog(T, t0, t1), T);
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
// ---------- captions only: small white, 2-3 words, mid-frame (house style) ----------
const CAPS = []; CL.forEach(c0 => { let cur = []; const flush = () => { if (cur.length) CAPS.push({ a: cur[0].a, b: cur[cur.length - 1].b, t: cur.map(w => w.w).join(' ') }); cur = []; };
  c0.words.forEach(w0 => { const w = Object.assign({}, w0); const prev = cur[cur.length - 1]; if (cur.length && (cur.length >= 3 || w.a - prev.b > 0.25 || w.a - prev.a > 0.6 || /[.,!?]$/.test(prev.w))) flush(); cur.push(w); }); flush(); });
CAPS.forEach((c, i) => { const nx = CAPS[i + 1]; c.b = nx ? Math.min(nx.a, c.b + 0.3) : c.b + 0.6; });
function caption(c) { octx.save(); octx.font = '600 46px CapFont'; octx.textAlign = 'center'; octx.textBaseline = 'middle'; octx.lineJoin = 'round'; octx.shadowColor = 'rgba(0,0,0,0.6)'; octx.shadowBlur = 12; octx.lineWidth = 7; octx.strokeStyle = 'rgba(0,0,0,0.75)'; octx.strokeText(c.t, 360, 880); octx.shadowBlur = 0; octx.fillStyle = '#ffffff'; octx.fillText(c.t, 360, 880); octx.restore(); }
window.initFootball = async function () {
  await Promise.all(['600 44px CapFont', '44px Russo'].map(f => document.fonts.load(f)));
  GLOW = ctex(64, 64, (c, w, h) => { const gr = c.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.3, 'rgba(255,255,255,0.5)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = gr; c.fillRect(0, 0, w, h); });
  glc = document.createElement('canvas'); glc.width = RW; glc.height = RH;
  renderer = new T3.WebGLRenderer({ canvas: glc, antialias: true, preserveDrawingBuffer: true }); renderer.setPixelRatio(1); renderer.setSize(RW, RH, false); renderer.outputColorSpace = T3.SRGBColorSpace; renderer.toneMapping = T3.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0; renderer.shadowMap.enabled = true; renderer.shadowMap.type = T3.PCFSoftShadowMap;
  scene = new T3.Scene(); scene.background = new T3.Color('#05060e'); camera = new T3.PerspectiveCamera(58, RW / RH, 0.03, 3000); scene.add(camera);
  build(); toonify(scene); out = document.getElementById('c'); octx = out.getContext('2d');
};
window.DURATION = TM.total;
window.renderFrame = function (T) { const loop = T >= E.loop; shot(T); renderer.render(scene, camera);
  octx.globalCompositeOperation = 'source-over'; octx.globalAlpha = 1; octx.filter = 'contrast(1.04) saturate(1.15)'; octx.drawImage(glc, 0, 0, W, H); octx.filter = 'none';
  const vg = octx.createRadialGradient(360, 640, 460, 360, 640, 900); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.25)'); octx.fillStyle = vg; octx.fillRect(0, 0, W, H);
  const cap = CAPS.find(c => T >= c.a && T < c.b); if (cap && !loop) caption(cap); };
})();
