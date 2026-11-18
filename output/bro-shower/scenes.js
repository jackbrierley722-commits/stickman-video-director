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
const E = { c1: CL[1].start, ladder: AT(1, 'so'), short: AT(1, "it's"), c2: CL[2].start, ten: AT(2, 'ten'), sneeze: AT(2, 'then'), c3: CL[3].start, bottle: AT(3, 'he'), head: AT(3, 'headshot'),
  c4: CL[4].start, light: AT(4, 'and'), c5: CL[5].start, km: AT(5, 'by'), orbit: AT(5, "you're"), c6: CL[6].start, see: AT(6, 'you'), clothes: AT(6, "he's"), c7: CL[7].start };
E.loop = TM.total - 0.4;
const WIN = [2.2, 4.5, -2.4]; // bathroom window (world)
const SPACE = [3000, 0, 0], BATH = [5000, 0, 0];

function build() {
  buildSky(); R.sun.intensity = 2.8; R.hemi.intensity = 1.0;
  const G = R.G = new T3.Group(); scene.add(G);
  add(G, Bx(200, 0.1, 200), SM('#ffffff', { map: noiseTex(256, 256, '#5e8a3a', [['rgba(0,0,0,0.08)', 3000, 2], ['rgba(255,255,200,0.05)', 2000, 2]], 2, [40, 40]), roughness: 1 }), 0, -0.06, 0, false);
  houseR(G, 0, -6, '#a8584a', '#1f3a5a', 4); houseR(G, -8, -6, '#b87a5a', '#7a1f2a', 5); houseR(G, 8, -6, '#9a4a3a', '#2a5a3a', 6);
  // frosted bathroom glass glows a little
  R.bathGlass = add(G, Bx(1.1, 1.3, 0.06), SM('#dfe8ee', { roughness: 0.3, emissive: '#cfe0ea', emissiveIntensity: 0.25 }), WIN[0], WIN[1], -2.38);
  const fm = SM('#c49a6c', { roughness: 0.9 }); for (let x = -12; x <= 12; x += 0.35) add(G, Bx(0.12, 1.6, 0.05), fm, x, 0.8, 9); add(G, Bx(24, 0.1, 0.06), fm, 0, 1.3, 9.06);
  treeR(G, -6, 4, 1.1, 3); treeR(G, 7, 5, 0.9, 8); hedge(G, -3, 8.4, 8); add(G, Bx(2.4, 2.2, 2), SM('#6a8a5a', { roughness: 0.8 }), -8, 1.1, 5); add(G, new T3.ConeGeometry(1.9, 0.8, 4), SM('#4a4e56'), -8, 2.6, 5).rotation.y = PI / 4;
  // ladder (too short)
  const lad = R.ladder = new T3.Group(); G.add(lad); const al = SM('#c8ccd2', { metalness: 0.8, roughness: 0.3 }); for (const sx of [-0.25, 0.25]) rod(lad, [sx, 0, 1.0], [sx, 2.7, -2.2], 0.025, al); for (let i = 1; i < 10; i++) { const k = i / 10; rod(lad, [-0.25, 2.7 * k, 1.0 - 3.2 * k], [0.25, 2.7 * k, 1.0 - 3.2 * k], 0.015, al); }
  lad.position.set(WIN[0], 0, 0);
  // stilts
  R.stilts = new T3.Group(); G.add(R.stilts); for (const sx of [-0.12, 0.12]) rod(R.stilts, [sx, 0, 0], [sx, 3.6, 0], 0.035, WOOD());
  // drone
  const dr = R.drone = new T3.Group(); G.add(dr); add(dr, RB(0.3, 0.1, 0.3, 0.03), SM('#e8e8ec', { roughness: 0.4 }), 0, 0, 0); R.rotors = [];
  for (const [x, z] of [[-0.25, -0.25], [0.25, -0.25], [-0.25, 0.25], [0.25, 0.25]]) { rod(dr, [0, 0, 0], [x, 0.02, z], 0.012, SM('#333')); const r_ = add(dr, Cy(0.13, 0.13, 0.005, 20), SM('#222', { transparent: true, opacity: 0.45 }), x, 0.06, z, false); R.rotors.push(r_); }
  add(dr, Sp(0.03), SM('#111', { roughness: 0.1 }), 0, -0.04, 0.16); R.droneLed = add(dr, Sp(0.015), BM('#ff3030'), 0.12, 0.03, 0.15);
  R.bottle = new T3.Group(); G.add(R.bottle); add(R.bottle, Cy(0.05, 0.05, 0.22, 14), SM('#3aa0e8', { roughness: 0.3 }), 0, 0, 0); add(R.bottle, Cy(0.025, 0.03, 0.05, 10), SM('#fff'), 0, 0.13, 0);
  // garden chair + 40 fireworks
  const ch = R.chair = new T3.Group(); G.add(ch); const wc = SM('#e8e4dc', { roughness: 0.5 }); add(ch, RB(0.55, 0.05, 0.5, 0.02), wc, 0, 0.45, 0); add(ch, RB(0.55, 0.6, 0.05, 0.02), wc, 0, 0.78, -0.25); for (const [x, z] of [[-0.25, -0.22], [0.25, -0.22], [-0.25, 0.22], [0.25, 0.22]]) rod(ch, [x, 0, z], [x, 0.45, z], 0.02, wc);
  const fwr = rng(4); R.rockets = []; for (let i = 0; i < 40; i++) { const x = -0.3 + (i % 8) * 0.085, y = 0.2 + Math.floor(i / 8) * 0.17; const rk = new T3.Group(); rk.position.set(x, y, -0.36 - fwr() * 0.05); ch.add(rk); add(rk, Cy(0.03, 0.03, 0.26, 10), SM(['#c0392b', '#f1c40f', '#2a6fdb', '#27ae60'][i % 4], { roughness: 0.5 }), 0, 0, 0); add(rk, new T3.ConeGeometry(0.032, 0.07, 10), SM('#eee'), 0, 0.16, 0); R.rockets.push(rk); }
  R.fire = []; R.smoke = []; for (let i = 0; i < 26; i++) R.fire.push(spr(G, GLOW, ['#ffb030', '#ff6a10', '#fff0a0'][i % 3], 0.6, 0, -50, 0, 0)); for (let i = 0; i < 26; i++) R.smoke.push(spr(G, GLOW, '#b8b8b8', 1.2, 0, -50, 0, 0, T3.NormalBlending));
  R.spark = spr(G, GLOW, '#fff0a0', 0.25, 0, -50, 0, 0);
  // characters
  R.you = human({ skin: '#d8a078', top: '#3a3a42', bot: '#2a2e3a', hair: '#2a1a10', eye: '#4a3020', shoe: '#e8e8e8' }); G.add(R.you);
  R.mum = human({ fem: true, skin: '#e8c0a0', top: '#8a4a6a', bot: '#3a3a42', hair: '#5a3a1a' }); G.add(R.mum);
  // ===== SPACE =====
  const SPg = R.space = new T3.Group(); SPg.position.set(...SPACE); scene.add(SPg);
  const et = ctex(1024, 512, (c, w, h) => { c.fillStyle = '#1a4a8a'; c.fillRect(0, 0, w, h); const r = rng(9); c.fillStyle = '#3a7a3a'; for (let i = 0; i < 26; i++) { c.beginPath(); c.ellipse(r() * w, 80 + r() * (h - 160), 30 + r() * 90, 20 + r() * 60, r() * 3, 0, 7); c.fill(); } c.fillStyle = 'rgba(255,255,255,0.75)'; for (let i = 0; i < 120; i++) { c.beginPath(); c.ellipse(r() * w, r() * h, 10 + r() * 50, 4 + r() * 12, r(), 0, 7); c.fill(); } });
  R.earth = add(SPg, Sp(80, 64, 48), SM('#ffffff', { map: et, roughness: 0.7 }), 0, -86, -30, false); add(SPg, Sp(81.5, 64, 48), new T3.MeshBasicMaterial({ color: '#6ab4ff', transparent: true, opacity: 0.18, side: T3.BackSide, toneMapped: false }), 0, -86, -30, false);
  const sg = new T3.BufferGeometry(); const sp_ = []; const sr = rng(3); for (let i = 0; i < 1500; i++) { const a = sr() * 2 * PI, b = sr() * PI, R_ = 400; sp_.push(C(a) * S(b) * R_, C(b) * R_, S(a) * S(b) * R_); } sg.setAttribute('position', new T3.Float32BufferAttribute(sp_, 3)); R.stars = new T3.Points(sg, new T3.PointsMaterial({ color: '#ffffff', size: 1.2, sizeAttenuation: false, fog: false })); SPg.add(R.stars);
  R.chairS = R.chair.clone(); SPg.add(R.chairS); R.youS = human({ skin: '#d8a078', top: '#3a3a42', bot: '#2a2e3a', hair: '#2a1a10', eye: '#4a3020', shoe: '#e8e8e8' }); SPg.add(R.youS);
  R.scope = new T3.Group(); R.youS.userData.armR.userData.h.add(R.scope); add(R.scope, Cy(0.06, 0.08, 0.55, 16), SM('#d8d8de', { metalness: 0.7, roughness: 0.3 }), 0, -0.05, 0.2).rotation.x = PI / 2; add(R.scope, Cy(0.085, 0.085, 0.04, 16), BM('#4a8aff'), 0, -0.05, 0.48).rotation.x = PI / 2;
  // ===== BATHROOM (seen through the telescope) =====
  const BA = R.bath = new T3.Group(); BA.position.set(...BATH); scene.add(BA); const tile = noiseTex(128, 128, '#dfe8ee', [['rgba(0,0,0,0.05)', 400, 2]], 5, [6, 3]); add(BA, Bx(6, 3, 0.1), SM('#ffffff', { map: ctex(128, 128, (c, w, h) => { c.fillStyle = '#dfeaf0'; c.fillRect(0, 0, w, h); c.strokeStyle = '#b8c8d0'; c.lineWidth = 2; for (let i = 0; i <= w; i += 32) { c.beginPath(); c.moveTo(i, 0); c.lineTo(i, h); c.stroke(); c.beginPath(); c.moveTo(0, i); c.lineTo(w, i); c.stroke(); } }), roughness: 0.3 }), 0, 1.5, -1.2);
  add(BA, Bx(6, 0.1, 4), SM('#c8d0d4'), 0, 0, 0); add(BA, Bx(0.04, 2.2, 2), SM('#dff4ff', { transparent: true, opacity: 0.2, roughness: 0.05 }), 0.9, 1.1, -0.2, false); rod(BA, [0, 2.4, -1.15], [0, 2.4, -0.8], 0.02, SM('#c8ccd2', { metalness: 0.9 })); add(BA, Cy(0.12, 0.08, 0.05, 20), SM('#c8ccd2', { metalness: 0.9 }), 0, 2.36, -0.75);
  R.drops = []; for (let i = 0; i < 40; i++) R.drops.push(add(BA, Bx(0.008, 0.12, 0.008), SM('#bfe6ff', { transparent: true, opacity: 0.7 }), 0, -5, 0, false));
  R.broB = human({ skin: '#d8a078', top: '#d06a2a', bot: '#2a3a5a', hair: '#3a2410', eye: '#4a3020', shoe: '#1a1a1e' }); R.broB.position.set(0, 0, -0.6); BA.add(R.broB); add(R.broB.userData.up, Sp(0.14, 16, 10), SM('#d06a2a'), 0, 0.82, -0.06).scale.set(1, 0.8, 1); // hoodie hood
  R.light = new T3.PointLight('#fff4e0', 18, 10, 1.5); R.light.position.set(0, 2.6, 1); BA.add(R.light);
}
const P3 = (o, x, y, z) => [o[0] + x, o[1] + y, o[2] + z];
function chairLift(T) { if (CLI(T) !== 4 && CLI(T) !== 0) return 0; const t0 = (CLI(T) === 0 || T >= E.loop) ? -1.0 : E.light + 0.15; if (T >= E.loop) T = 0; return Math.max(0, T - t0) ** 2 * 3.2; }
const SH = [
  [0, (k, T) => { const y = chairLift(T); look([5.2, 1.6 + y * 0.75, 8.5], [1.4, 1.0 + y * 0.95, 0]); }],
  [E.c1, (k, T) => TR(k, [6.5, 2.2, 7], [5.5, 2.6, 5.6], [WIN[0], 2.6, -2], [WIN[0], 3.2, -2])],
  [E.short - 0.1, (k, T) => look([3.2, 3.6, 2.2], [WIN[0], 3.6, -2.4])],
  [E.c2, (k, T) => TR(k, [6.5, 2.4, 8], [5.8, 3.6, 7], [WIN[0], 3.2, -1], [WIN[0], 4.2, -1])],
  [E.sneeze - 0.1, (k, T) => look([6.5, 3.4, 8.5], [2.6, 2.4, -0.4])],
  [E.c3, (k, T) => TR(k, [4.4, 4.0, 3.6], [3.8, 4.4, 2.8], [WIN[0], 4.4, -1.4], [WIN[0], 4.5, -1.4])],
  [E.head - 0.1, (k, T) => look([4.6, 3.0, 4.6], [WIN[0] + 0.4, 2.6, -0.8])],
  [E.c4, (k, T) => TR(k, [3.4, 1.4, 4.6], [3.0, 1.3, 3.8], [1.2, 0.8, 1.2], [1.2, 0.8, 1.2])],
  [E.light - 0.1, (k, T) => { const y = chairLift(T); look([5.5, 1.6 + y * 0.55, 8], [1.2, 1.0 + y * 0.9, 1.2]); }],
  [E.c5, (k, T) => TR(k, P3(SPACE, 0, 2.2, 6), P3(SPACE, 0, 4, 12), P3(SPACE, 0, 0.6, 0), P3(SPACE, 0, -6, -10))],
  [E.orbit - 0.1, (k, T) => TR(k, P3(SPACE, 2.6, 1.4, 3.0), P3(SPACE, 2.2, 1.3, 2.6), P3(SPACE, 0, 0.8, 0), P3(SPACE, 0, 0.8, 0))],
  [E.c6, (k, T) => TR(k, P3(SPACE, -1.6, 1.4, 2.4), P3(SPACE, -1.3, 1.3, 2.0), P3(SPACE, 0, 1.0, 0), P3(SPACE, 0, 1.0, 0))],
  [E.see - 0.1, (k, T) => TR(k, P3(BATH, 0, 1.5, 4.6), P3(BATH, 0, 1.45, 3.4), P3(BATH, 0, 1.3, -0.6), P3(BATH, 0, 1.35, -0.6))],
  [E.c7, (k, T) => TR(k, P3(SPACE, 0.6, 1.2, 2.2), P3(SPACE, 0.5, 1.2, 1.9), P3(SPACE, 0, 1.2, 0), P3(SPACE, 0, 1.2, 0))],
  [E.loop, (k, T) => { const y = chairLift(0); look([5.2, 1.6 + y * 0.75, 8.5], [1.4, 1.0 + y * 0.95, 0]); }],
];
const shotAt = T => { let i = 0; for (let j = 0; j < SH.length; j++) if (T >= SH[j][0]) i = j; return i; };
function sitOn(p, seatY) { rest(p); const u = p.userData; for (const l of [u.legL, u.legR]) { l.rotation.x = -PI / 2 + 0.1; l.userData.k.rotation.x = PI / 2 - 0.1; } p.position.y = seatY + 0.04 - 0.92; }
function anim(T) { const ci = CLI(T), loop = T >= E.loop, Tt = loop ? 0 : T, cl = loop ? 0 : ci;
  const space = cl === 5 || cl === 7 || (cl === 6 && T < E.see - 0.1); R.space.visible = space; R.G.visible = !space && !(cl === 6 && T >= E.see - 0.1); R.bath.visible = cl === 6 && T >= E.see - 0.1; R.sky.visible = R.G.visible;
  scene.background = R.G.visible ? null : new T3.Color(space ? '#02030a' : '#1a1a1a'); scene.fog.far = space ? 5000 : 500; R.sun.intensity = space ? 3.2 : 2.8;
  R.ladder.visible = cl === 1; R.stilts.visible = cl === 2; R.drone.visible = cl === 3; R.bottle.visible = false; R.chair.visible = cl === 4 || cl === 0; R.mum.visible = false;
  R.fire.forEach(f => f.material.opacity = 0); R.smoke.forEach(f => f.material.opacity = 0); R.spark.material.opacity = 0;
  const u = R.you.userData; rest(R.you); R.you.visible = true; R.you.rotation.set(0, 0, 0);
  if (cl === 1) { const k = prog(T, E.ladder, E.short - 0.2); const y = lerp(0, 1.75, k); R.you.position.set(WIN[0], y, lerp(1.1, -1.2, k)); R.you.rotation.y = PI; const ph = T * 6 * (k < 1 ? 1 : 0); u.legL.rotation.x = -0.6 + 0.4 * S(ph); u.legR.rotation.x = -0.6 - 0.4 * S(ph); u.legL.userData.k.rotation.x = 0.8; u.legR.userData.k.rotation.x = 0.8; u.armL.rotation.x = u.armR.rotation.x = -2.6; if (k >= 1) { u.head.rotation.x = -0.6; u.armR.rotation.x = -3.0; } }
  if (cl === 2) { const fall = prog(T, E.sneeze + 0.4, E.c3 - 0.2); R.stilts.position.set(WIN[0] + 0.3, 0, 0.2); R.stilts.rotation.set(0, 0, 0); R.stilts.rotateX(-fall * 1.5); R.stilts.rotation.z = 0.04 * S(T * 3);
    R.you.position.set(0, 3.6, 0); R.stilts.add(R.you); R.you.rotation.set(0, PI, 0); u.armL.rotation.set(-0.3, 0, 0.6 + 0.3 * S(T * 5)); u.armR.rotation.set(-0.3, 0, -0.6 - 0.3 * S(T * 5)); if (T > E.sneeze && T < E.sneeze + 0.5) { u.up.rotation.x = 0.5 * S(prog(T, E.sneeze, E.sneeze + 0.5) * PI); u.head.rotation.x = 0.4; } face(R.you, fall > 0 ? 'shock' : 'neutral', T); }
  else if (R.you.parent !== R.G) { R.G.add(R.you); }
  if (cl === 3) { R.you.position.set(4.2, 0, 3.5); R.you.rotation.y = -2.6; u.armL.rotation.x = u.armR.rotation.x = -1.2; u.armL.userData.e.rotation.x = u.armR.userData.e.rotation.x = -0.8;
    const hit = prog(T, E.head - 0.05, E.head + 1.0); R.drone.position.set(WIN[0] + 0.1 + S(T * 2) * 0.05 + hit * 0.8, lerp(4.4, 0.15, hit * hit) + S(T * 3) * 0.03, -1.4 + hit * 1.2); R.drone.rotation.set(hit * 4, hit * 9, hit * 3); R.rotors.forEach((r_, i) => r_.rotation.y = T * 40 + i);
    if (T > E.bottle + 0.6 && T < E.head + 0.05) { R.bottle.visible = true; const k = prog(T, E.bottle + 0.6, E.head); R.bottle.position.set(lerp(WIN[0], R.drone.position.x, k), lerp(WIN[1], R.drone.position.y, k) + S(k * PI) * 0.4, lerp(-2.3, -1.4, k)); R.bottle.rotation.z = k * 12; }
    face(R.you, T > E.head ? 'shock' : 'grin', T); }
  if (cl === 4 || cl === 0) { const lift = chairLift(Tt); R.chair.position.set(1.2, lift, 1.2); R.chair.rotation.set(0, 0, lift > 0 ? 0.08 * S(Tt * 20) : 0); R.you.position.set(1.2, 0, 1.25); sitOn(R.you, 0.48 + lift); R.you.rotation.z = R.chair.rotation.z; u.armL.rotation.x = -0.4; u.armR.rotation.x = -0.4;
    face(R.you, lift > 0.2 ? 'shock' : (cl === 4 && T < E.light ? 'grin' : 'shock'), Tt); if (lift > 0.2) { u.armL.rotation.set(-2.9, 0, 0.3); u.armR.rotation.set(-2.9, 0, -0.3); }
    if (cl === 4 && T > E.light - 0.3 && lift === 0) { R.spark.position.set(1.2, 0.3, 0.8); R.spark.material.opacity = Math.abs(S(T * 40)); R.spark.scale.setScalar(0.2 + 0.15 * Math.abs(S(T * 33))); }
    if (lift > 0 || (cl === 0)) R.fire.forEach((f, i) => { const ph = (Tt * 3 + i / 26) % 1; f.position.set(1.2 - 0.3 + (i % 8) * 0.085, lift + 0.1 - ph * 1.6, 0.85 + (i % 3) * 0.02); f.scale.setScalar(0.5 + ph * 0.8); f.material.opacity = 0.9 * (1 - ph); });
    if (lift > 0 || cl === 0) R.smoke.forEach((f, i) => { const ph = (Tt * 0.8 + i / 26) % 1; f.position.set(1.2 + S(i * 1.3) * ph * 2.5, Math.max(0.2, lift * (1 - ph) - ph), 0.9 + C(i * 1.7) * ph * 2); f.scale.setScalar(1 + ph * 3); f.material.opacity = 0.5 * (1 - ph); }); }
  if (cl === 1 || cl === 3) { R.mum.visible = false; }
  // space
  if (R.space.visible) { R.chairS.position.set(0, 0, 0); R.chairS.rotation.set(0.2 * S(T * 0.7), T * 0.15, 0.15 * S(T * 0.5)); R.youS.position.set(0, 0.04 - 0.92 + 0.48, 0.05); sitOn(R.youS, 0.48); R.youS.position.applyEuler(R.chairS.rotation); R.youS.rotation.copy(R.chairS.rotation);
    const us = R.youS.userData; us.armL.rotation.set(-1.2, 0, 0.3); us.armR.rotation.set(-1.3, 0, -0.2); R.scope.visible = cl >= 6; face(R.youS, cl === 7 ? 'neutral' : (cl === 5 ? 'shock' : 'grin'), T); if (cl === 6) { us.armR.rotation.set(-1.6, 0, 0); us.head.rotation.x = -0.1; } R.earth.rotation.y = T * 0.02; }
  if (R.bath.visible) { const b = R.broB; rest(b); b.rotation.y = 0.3; b.userData.armL.rotation.set(-2.6, 0, 0.2); b.userData.armR.rotation.set(-2.6 + 0.3 * S(T * 6), 0, -0.2); b.userData.armL.userData.e.rotation.x = -1.6; b.userData.armR.userData.e.rotation.x = -1.6; face(b, T > E.clothes ? 'grin' : 'neutral', T);
    R.drops.forEach((d, i) => { const ph = (T * 2 + i / 40) % 1; d.position.set(S(i * 2.3) * 0.25, 2.3 - ph * 2.2, -0.75 + C(i * 1.7) * 0.25); }); }
}
function shot(T) { const si = shotAt(T), sh = SH[si], t0 = sh[0], t1 = si + 1 < SH.length ? SH[si + 1][0] : TM.total; camera.fov = 52; camera.updateProjectionMatrix(); anim(T); sh[1](prog(T, t0, t1), T); sunAt(camera.position.x, 0, camera.position.z - 4); return { si, t0 }; }
// ---------- overlay helpers ----------
function txt(s_, x, y, size, col, align = 'center') { octx.font = `${size}px Russo`; octx.fillStyle = col; octx.textAlign = align; octx.textBaseline = 'middle'; octx.fillText(s_, x, y); }
function big(s_, y, size, col, a = 1, x = 360) { if (a <= 0) return; y -= 90; octx.save(); octx.globalAlpha = Math.min(1, a); octx.font = `${size}px Russo`; octx.textAlign = 'center'; octx.textBaseline = 'middle'; octx.lineJoin = 'round'; octx.lineWidth = size * 0.2; octx.strokeStyle = 'rgba(4,4,8,0.92)'; const sc = a < 1 ? 1 + (1 - a) * 0.35 : 1; octx.translate(x, y); octx.scale(sc, sc); octx.strokeText(s_, 0, 0); octx.fillStyle = col; octx.fillText(s_, 0, 0); octx.restore(); }
function pill(x, y, w, h, bg, stroke) { octx.save(); octx.fillStyle = bg; octx.beginPath(); octx.roundRect(x, y, w, h, h / 2); octx.fill(); if (stroke) { octx.strokeStyle = stroke; octx.lineWidth = 3; octx.stroke(); } octx.restore(); }
// captions: 3-4 words, emphasised words pop bigger and yellow, the shout is red and shakes
const CAPS = []; CL.forEach(c0 => { let cur = []; const flush = () => { if (cur.length) CAPS.push({ a: cur[0].a, b: cur[cur.length - 1].b, ws: cur }); cur = []; };
  c0.words.forEach(w => { const prev = cur[cur.length - 1]; if (cur.length && (cur.length >= 4 || w.a - prev.b > 0.22 || (w.emph && !prev.emph && cur.length >= 2))) flush(); cur.push(w); }); flush(); });
CAPS.forEach((c, i) => { const nx = CAPS[i + 1]; c.b = nx ? Math.min(nx.a, c.b + 0.35) : c.b + 0.8; });
function caption(c, T) { octx.save(); octx.textAlign = 'left'; octx.textBaseline = 'middle'; const items = c.ws.map(w => { const word = w.emph === 2 ? w.w.toUpperCase().replace(/[^A-Z!]/g, '') + '!' : w.w; const size = w.emph === 2 ? 74 : w.emph ? 62 : 50; octx.font = `${size}px Russo`; return { w, word, size, wd: octx.measureText(word).width }; });
  const sp = 16; const total = items.reduce((s, it) => s + it.wd, 0) + sp * (items.length - 1); let x = 360 - total / 2; const y = 1090;
  items.forEach(it => { const on = T >= it.w.a - 0.03; const pop = it.w.emph && on ? 1 + 0.25 * (1 - prog(T, it.w.a, it.w.a + 0.18)) : 1; const shake = it.w.emph === 2 ? 6 * S(T * 70) : 0;
    octx.save(); octx.translate(x + it.wd / 2 + shake, y); octx.scale(pop, pop); octx.font = `${it.size}px Russo`; octx.lineJoin = 'round'; octx.lineWidth = it.size * 0.26; octx.strokeStyle = 'rgba(4,4,8,0.95)'; octx.strokeText(it.word, -it.wd / 2, 0); octx.fillStyle = it.w.emph === 2 ? '#ff4a4a' : it.w.emph ? '#ffd34a' : (on ? '#ffffff' : 'rgba(255,255,255,0.75)'); octx.fillText(it.word, -it.wd / 2, 0); octx.restore(); x += it.wd + sp; }); octx.restore(); }
window.initFootball = async function () {
  await Promise.all(['30px Russo', '50px Russo'].map(f => document.fonts.load(f)));
  GLOW = ctex(64, 64, (c, w, h) => { const gr = c.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.3, 'rgba(255,255,255,0.5)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = gr; c.fillRect(0, 0, w, h); });
  glc = document.createElement('canvas'); glc.width = RW; glc.height = RH;
  renderer = new T3.WebGLRenderer({ canvas: glc, antialias: true, preserveDrawingBuffer: true }); renderer.setPixelRatio(1); renderer.setSize(RW, RH, false); renderer.outputColorSpace = T3.SRGBColorSpace; renderer.toneMapping = T3.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0; renderer.shadowMap.enabled = true; renderer.shadowMap.type = T3.PCFSoftShadowMap;
  scene = new T3.Scene(); scene.fog = new T3.Fog('#c8d4dc', 60, 500); camera = new T3.PerspectiveCamera(52, RW / RH, 0.03, 6000); scene.add(camera);
  { const pm = new T3.PMREMGenerator(renderer); const es = new T3.Scene(); const et = ctex(256, 128, (c, w, h) => { const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#6a8ac8'); gr.addColorStop(0.5, '#e8ecf0'); gr.addColorStop(1, '#5a5a50'); c.fillStyle = gr; c.fillRect(0, 0, w, h); }); es.add(new T3.Mesh(new T3.SphereGeometry(10, 32, 16), new T3.MeshBasicMaterial({ map: et, side: T3.BackSide }))); scene.environment = pm.fromScene(es, 0.04).texture; }
  build(); out = document.getElementById('c'); octx = out.getContext('2d'); SNAP = document.createElement('canvas'); SNAP.width = W; SNAP.height = H;
};


window.DURATION = TM.total;
window.renderFrame = function (T) { const ci = CLI(T); const loop = T >= E.loop; const { si, t0 } = shot(T); renderer.render(scene, camera);
  octx.globalCompositeOperation = 'source-over'; octx.globalAlpha = 1; octx.filter = 'contrast(1.06) saturate(1.08)'; octx.drawImage(glc, 0, 0, W, H); octx.filter = 'none';
  const tk = prog(T, t0, t0 + 0.14); if (si > 0 && tk < 1 && !loop) { SNAP.getContext('2d').drawImage(out, 0, 0); const sc = 1 + (1 - tk) * 0.05; octx.drawImage(SNAP, 360 - 360 * sc, 640 - 640 * sc, W * sc, H * sc); }
  if (ci === 2 && T > E.c3 - 0.35 && T < E.c3) { const d = 16 * S(T * 80); SNAP.getContext('2d').drawImage(out, 0, 0); octx.drawImage(SNAP, d, -d, W, H); }
  if (R.bath.visible) { octx.save(); octx.fillStyle = '#000'; octx.beginPath(); octx.rect(0, 0, W, H); octx.moveTo(660, 600); octx.arc(360, 600, 300, 0, 2 * PI, true); octx.closePath(); octx.fill('evenodd'); octx.strokeStyle = 'rgba(200,220,255,0.5)'; octx.lineWidth = 3; octx.beginPath(); octx.arc(360, 600, 300, 0, 7); octx.stroke(); octx.beginPath(); octx.moveTo(360, 320); octx.lineTo(360, 360); octx.moveTo(360, 840); octx.lineTo(360, 880); octx.moveTo(80, 600); octx.lineTo(120, 600); octx.moveTo(600, 600); octx.lineTo(640, 600); octx.stroke(); octx.restore(); }
  const vg = octx.createRadialGradient(360, 640, 420, 360, 640, 900); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.3)'); octx.fillStyle = vg; octx.fillRect(0, 0, W, H);
  const fi = (a, d = 0.12) => prog(T, a - 0.1, a - 0.1 + d);
  if (ci === 0 || loop) { big('SO YOU WANT TO WATCH', 230, 46, '#fff', 1); big('YOUR BRO SHOWER', 300, 60, '#ffd34a', 1); }
  else if (ci === 1) { if (T > E.short - 0.1) big('2 METRES SHORT', 300, 62, '#ff6b6b', fi(E.short)); else if (T > E.ladder - 0.1) big('ATTEMPT 1 . LADDER', 300, 50, '#fff', fi(E.ladder)); }
  else if (ci === 2) { if (T > E.sneeze - 0.1) big('*ACHOO*', 300, 76, '#fff', fi(E.sneeze)); else if (T > E.ten - 0.1) big('10 METRE STILTS', 300, 58, '#ffd34a', fi(E.ten)); else big('ATTEMPT 2 . STILTS', 300, 50, '#fff', fi(E.c2)); }
  else if (ci === 3) { if (T > E.head - 0.1) big('HEADSHOT.', 300, 76, '#ff6b6b', fi(E.head)); else big('ATTEMPT 3 . DRONE', 300, 50, '#fff', fi(E.c3)); }
  else if (ci === 4) { big('ATTEMPT 4', 260, 50, '#fff', fi(E.c4)); big('40 FIREWORKS + A CHAIR', 330, 44, '#ffd34a', fi(E.c4 + 0.4)); }
  else if (ci === 5) { if (T > E.orbit - 0.1) big("YOU'RE IN ORBIT", 300, 62, '#7fe8ff', fi(E.orbit)); else if (T > E.km - 0.1) big('+400 KM', 300, 80, '#ffd34a', fi(E.km)); }
  else if (ci === 6) { if (T > E.clothes - 0.1) big('IN HIS CLOTHES', 200, 62, '#ffd34a', fi(E.clothes)); else if (T < E.see - 0.1) big('SPACE TELESCOPE', 300, 56, '#7fe8ff', fi(E.c6)); }
  else if (ci === 7 && !loop) { big('MUM WAS RIGHT.', 280, 66, '#fff', fi(E.c7)); }
  const cap = CAPS.find(c => T >= c.a && T < c.b); if (cap && !loop && !(ci === 0)) caption(cap, T); };
})();
