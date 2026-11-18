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
const E = { c1: CL[1].start, square: AT(1, "it's"), c2: CL[2].start, swells: AT(2, 'so'), shrinks: AT(2, 'then'), c3: CL[3].start, cracks: AT(3, 'tiny'), flight: AT(3, 'flight'),
  c4: CL[4].start, two: AT(4, 'two'), broke: AT(4, 'broke'), c5: CL[5].start, nocorner: AT(5, 'no'), flows: AT(5, 'the'), much: AT(5, 'much'), c6: CL[6].start, bro: AT(6, 'until') };
E.loop = TM.total - 0.4;
// window texture: radius 0 = square, 1 = fully round; stress shows as red glow + cracks at the corners, or calm blue flow around a round window
function winTex() { const t = ctex(256, 320, () => {}); t.userData.key = ''; return t; }
function drawWin(t, round, stress, crack, flow, T, outside) { const key = [round.toFixed(2), stress.toFixed(2), crack.toFixed(2), flow ? Math.floor(T * 12) : 0, outside].join(); if (t.userData.key === key) return; t.userData.key = key; const c = t.userData.g;
  c.clearRect(0, 0, 256, 320); c.fillStyle = outside ? '#e8eaee' : '#d8d6d0'; c.fillRect(0, 0, 256, 320);
  if (outside) { c.strokeStyle = 'rgba(0,0,0,0.12)'; c.lineWidth = 2; for (let y = 20; y < 320; y += 60) { c.beginPath(); c.moveTo(0, y); c.lineTo(256, y); c.stroke(); } for (let x = 10; x < 256; x += 24) for (let y = 30; y < 320; y += 60) { c.fillStyle = 'rgba(0,0,0,0.18)'; c.beginPath(); c.arc(x, y, 2, 0, 7); c.fill(); } }
  const w = 140, h = 190, x0 = 128 - w / 2, y0 = 160 - h / 2, r = round * 70;
  c.fillStyle = outside ? '#c8ccd2' : '#f2f0ea'; c.beginPath(); c.roundRect(x0 - 14, y0 - 14, w + 28, h + 28, r + 12 * round); c.fill();
  const sky = c.createLinearGradient(0, y0, 0, y0 + h); sky.addColorStop(0, '#5a9ad8'); sky.addColorStop(1, '#cfe6f6'); c.fillStyle = sky; c.beginPath(); c.roundRect(x0, y0, w, h, r); c.fill();
  c.fillStyle = 'rgba(255,255,255,0.85)'; for (let i = 0; i < 4; i++) { c.beginPath(); c.ellipse(x0 + 20 + i * 36 + (T * 20) % 40, y0 + h * 0.7, 24, 9, 0, 0, 7); c.fill(); }
  if (stress > 0) { const corners = [[x0, y0], [x0 + w, y0], [x0, y0 + h], [x0 + w, y0 + h]]; corners.forEach(([cx, cy]) => { const g = c.createRadialGradient(cx, cy, 0, cx, cy, 46); g.addColorStop(0, `rgba(255,40,20,${0.85 * stress})`); g.addColorStop(1, 'rgba(255,40,20,0)'); c.fillStyle = g; c.fillRect(cx - 46, cy - 46, 92, 92); });
    if (crack > 0) { c.strokeStyle = '#1a1a1a'; c.lineWidth = 2.2; corners.forEach(([cx, cy], k) => { const dx = k % 2 ? 1 : -1, dy = k < 2 ? -1 : 1; let px = cx, py = cy; c.beginPath(); c.moveTo(px, py); const n = Math.floor(crack * 7); for (let i = 0; i < n; i++) { px += dx * (6 + ((i * 37) % 9)); py += dy * (5 + ((i * 53) % 7)) * (i % 2 ? 1 : 0.4); c.lineTo(px, py); } c.stroke(); }); } }
  if (flow) { c.strokeStyle = 'rgba(80,200,255,0.9)'; c.lineWidth = 3; for (let k = 0; k < 3; k++) { const rr = 1 + k * 0.18; c.beginPath(); c.ellipse(128, 160, (w / 2 + 18) * rr, (h / 2 + 18) * rr, 0, 0, 7); c.setLineDash([16, 14]); c.lineDashOffset = -T * 60 * (k % 2 ? 1 : -1); c.stroke(); } c.setLineDash([]); }
  t.needsUpdate = true; }
function plane(col = '#f4f4f6', vintage = false) { const p = new T3.Group(); const skin = SM(col, { metalness: vintage ? 0.7 : 0.25, roughness: vintage ? 0.3 : 0.35 });
  const body = add(p, Cy(1.9, 1.9, 34, 32), skin, 0, 0, 0); body.rotation.z = PI / 2; p.userData.body = body;
  const nose = add(p, Sp(1.9, 32, 16, 0, PI * 2, 0, PI / 2), skin, 17, 0, 0); nose.rotation.z = -PI / 2; nose.scale.set(1, 1.6, 1); add(p, new T3.ConeGeometry(1.9, 6, 32), skin, -20, 0.4, 0).rotation.z = PI / 2;
  const wing = new T3.Shape(); wing.moveTo(0, 0); wing.lineTo(-6, 15); wing.lineTo(-9, 15); wing.lineTo(-7, 0); wing.closePath(); for (const s of [-1, 1]) { const wg = new T3.ExtrudeGeometry(wing, { depth: 0.4, bevelEnabled: false }); const m = add(p, wg, skin, 3, -0.8, 0); m.rotation.x = s > 0 ? -PI / 2 : PI / 2; if (!vintage) add(p, Cy(0.9, 0.9, 3.4, 20), SM('#b8bcc4', { metalness: 0.6 }), 0, -1.7, s * 6).rotation.z = PI / 2; }
  const fin = new T3.Shape(); fin.moveTo(0, 0); fin.lineTo(-4, 7); fin.lineTo(-6.5, 7); fin.lineTo(-5, 0); fin.closePath(); add(p, new T3.ExtrudeGeometry(fin, { depth: 0.3, bevelEnabled: false }), skin, -15, 1.4, -0.15);
  if (!vintage) add(p, Bx(30, 0.5, 3.86), SM('#1d4f9a'), -1, -0.4, 0); // stripe
  const winM = SM('#1a2430', { roughness: 0.1, metalness: 0.4 }); for (let i = 0; i < 24; i++) for (const s of [-1, 1]) { const wn = add(p, vintage ? Bx(0.42, 0.46, 0.06) : RB(0.34, 0.48, 0.06, 0.14), winM, 13 - i * 1.15, 0.55, s * 1.88, false); }
  return p; }
function build() {
  buildSky(); R.sun.intensity = 2.6; R.hemi.intensity = 1.0;
  // ===== SKY / PLANE =====
  const SKY = R.skyG = new T3.Group(); scene.add(SKY);
  R.clouds = []; const cr = rng(5); for (let i = 0; i < 60; i++) { const c = spr(SKY, GLOW, '#ffffff', 14 + cr() * 18, (cr() - 0.5) * 300, -20 + cr() * 30, -40 - cr() * 120, 0.85, T3.NormalBlending); c.userData.x0 = c.position.x; R.clouds.push(c); }
  R.plane = plane(); SKY.add(R.plane);
  R.halfA = new T3.Group(); R.halfB = new T3.Group(); SKY.add(R.halfA); SKY.add(R.halfB);
  R.fire = []; R.smoke = []; R.debris = []; for (let i = 0; i < 40; i++) R.fire.push(spr(SKY, GLOW, ['#ffb030', '#ff5010', '#fff0a0'][i % 3], 3, 0, -500, 0, 0)); for (let i = 0; i < 30; i++) R.smoke.push(spr(SKY, GLOW, '#3a3a3a', 6, 0, -500, 0, 0, T3.NormalBlending));
  for (let i = 0; i < 26; i++) { const d = add(SKY, Bx(0.4 + cr() * 1.2, 0.08, 0.3 + cr() * 0.8), SM(cr() < 0.5 ? '#e8e8ec' : '#9aa0a8', { metalness: 0.5 }), 0, -500, 0, false); d.userData.v = [(cr() - 0.5) * 14, (cr() - 0.3) * 10, (cr() - 0.5) * 14]; R.debris.push(d); }
  // ===== CABIN =====
  const CB = R.cabin = new T3.Group(); CB.position.set(400, 0, 0); scene.add(CB);
  add(CB, Bx(3.6, 0.1, 14), SM('#3a4a6a', { roughness: 0.9 }), 0, 0, 0); add(CB, Bx(0.8, 0.12, 14), SM('#8a8a8a', { roughness: 0.9 }), 0, 0.01, 0);
  const wallM = SM('#e8e6e0', { roughness: 0.5 }); add(CB, Bx(0.1, 2.3, 14), wallM, -1.85, 1.15, 0); add(CB, Bx(0.1, 2.3, 14), wallM, 1.85, 1.15, 0); const ceil = add(CB, Cy(1.9, 1.9, 14, 24, 1, true, PI * 1.5, PI), SM('#f4f2ee', { side: T3.BackSide }), 0, 2.0, 0); ceil.rotation.x = PI / 2;
  for (let z = -6; z <= 6; z += 1.4) { add(CB, Bx(3.5, 0.2, 0.6), SM('#e8e4dc'), 0, 2.15, z, false); }
  R.winTex = winTex(); R.cabWin = add(CB, new T3.PlaneGeometry(0.5, 0.62), new T3.MeshBasicMaterial({ map: R.winTex, toneMapped: false }), -1.79, 1.35, 0.2, false); R.cabWin.rotation.y = PI / 2;
  for (const z of [-2.6, -1.2, 1.6, 3.0]) add(CB, new T3.PlaneGeometry(0.42, 0.52), new T3.MeshBasicMaterial({ map: ctex(32, 40, c => { c.fillStyle = '#d8d6d0'; c.fillRect(0, 0, 32, 40); c.fillStyle = '#7ab0e0'; c.beginPath(); c.roundRect(6, 6, 20, 28, 10); c.fill(); }), toneMapped: false }), -1.79, 1.35, z, false).rotation.y = PI / 2;
  const seatM = SM('#2a4a8a', { roughness: 0.8 }); R.seats = []; for (let z = -5; z <= 5; z += 1.4) for (const x of [-1.35, -0.85, 0.85, 1.35]) { const g = new T3.Group(); g.position.set(x, 0, z); CB.add(g); add(g, RB(0.46, 0.12, 0.48, 0.04), seatM, 0, 0.45, 0); add(g, RB(0.46, 0.75, 0.1, 0.04), seatM, 0, 0.85, -0.24).rotation.x = -0.12; add(g, RB(0.3, 0.12, 0.08, 0.03), SM('#e8e8ec'), 0, 1.25, -0.27); }
  R.cabL = new T3.PointLight('#fff4e0', 6, 9, 1.5); R.cabL.position.set(0, 2.0, 0); CB.add(R.cabL);
  R.pax = []; const pr = rng(9); for (let z = -3.6; z <= 5; z += 1.4) for (const x of [0.85, 1.35]) { if (pr() < 0.3) continue; const p = human({ skin: ['#d8a078', '#e8c0a0', '#8a5a3a'][Math.floor(pr() * 3)], top: ['#5a6a8a', '#8a4a4a', '#4a6a4a', '#d8c8a0'][Math.floor(pr() * 4)], hair: ['#2a1a10', '#d8b45a', '#1a1a1a'][Math.floor(pr() * 3)] }); p.position.set(x, 0, z + 0.1); p.rotation.y = PI; CB.add(p); seatPose(p, 0.5); p.position.x = x; p.position.z = z + 0.1; R.pax.push(p); }
  R.you = human({ skin: '#d8a078', top: '#3a3a42', bot: '#2a2e3a', hair: '#2a1a10', eye: '#4a3020', shoe: '#e8e8e8' }); CB.add(R.you);
  R.bro = human({ skin: '#c8906a', top: '#b8303a', bot: '#3a3a42', hair: '#1a1a1a', eye: '#3a2a1a', shoe: '#1a1a1e' }); CB.add(R.bro);
  // ===== WINDOW CLOSE-UP (outside skin) =====
  const WN = R.winSet = new T3.Group(); WN.position.set(800, 0, 0); scene.add(WN); R.winTex2 = winTex(); R.winPanel = add(WN, new T3.PlaneGeometry(2.4, 3.0), new T3.MeshBasicMaterial({ map: R.winTex2, toneMapped: false }), 0, 0, 0, false);
  // ===== 1954 =====
  const V = R.vint = new T3.Group(); V.position.set(1200, 0, 0); scene.add(V); R.vPlane = plane('#c8ccd2', true); V.add(R.vPlane); R.vCl = []; for (let i = 0; i < 30; i++) R.vCl.push(spr(V, GLOW, '#ffffff', 16 + cr() * 14, (cr() - 0.5) * 200, -20 + cr() * 25, -40 - cr() * 80, 0.7, T3.NormalBlending));
}
// plane explosion state at frame 1 (also re-used for the loop)
function boom(k, origin) { R.plane.visible = k <= 0; R.halfA.visible = R.halfB.visible = false;
  R.fire.forEach((f, i) => { if (k <= 0) { f.position.y = -500; return; } const a = i / 40 * 2 * PI, sp = 2 + (i % 5); f.position.set(origin[0] + C(a) * sp * k * 3, origin[1] + S(a * 1.3) * sp * k * 2, origin[2] + S(a) * sp * k * 2); f.scale.setScalar(3 + k * 6); f.material.opacity = Math.max(0, 1 - k * 0.6); });
  R.smoke.forEach((f, i) => { if (k <= 0) { f.position.y = -500; return; } const a = i / 30 * 2 * PI; f.position.set(origin[0] + C(a) * 6 * k, origin[1] + 2 + k * 4 + S(a) * 2, origin[2] + S(a) * 6 * k - 2); f.scale.setScalar(6 + k * 12); f.material.opacity = 0.55 * Math.min(1, k * 2); });
  R.debris.forEach(d => { if (k <= 0) { d.position.y = -500; return; } const v = d.userData.v; d.position.set(origin[0] + v[0] * k * 2, origin[1] + v[1] * k * 2 - 6 * k * k, origin[2] + v[2] * k * 2); d.rotation.set(k * 8, k * 5, k * 3); }); }
const SH = [
  [0, (k, T) => look([30, 8, 46], [0, 1, 0])],
  [E.c1, (k, T) => TR(k, [400 + 0.2, 1.45, 1.0], [400 + 0.0, 1.42, 0.85], [400 - 1.79, 1.35, 0.2], [400 - 1.79, 1.35, 0.2])],
  [E.c2, (k, T) => TR(k, [8, 3, 34], [6, 2.5, 30], [0, 0, 0], [0, 0, 0])],
  [E.c3, (k, T) => TR(k, [800, 0, 3.6], [800, 0, 2.6], [800, 0, 0], [800, 0, 0])],
  [E.c4, (k, T) => TR(k, [1200 + 26, 6, 40], [1200 + 20, 5, 34], [1200, 0, 0], [1200, 0, 0])],
  [E.c5, (k, T) => TR(k, [800, 0, 2.8], [800, 0, 3.4], [800, 0, 0], [800, 0, 0])],
  [E.c6, (k, T) => TR(k, [400 + 0.9, 1.6, 1.9], [400 + 0.8, 1.55, 1.6], [400 - 1.4, 1.2, 0.1], [400 - 1.4, 1.2, 0.1])],
  [E.loop, (k, T) => look([30, 8, 46], [0, 1, 0])],
];
const shotAt = T => { let i = 0; for (let j = 0; j < SH.length; j++) if (T >= SH[j][0]) i = j; return i; };
function anim(T) { const ci = CLI(T), loop = T >= E.loop, cl = loop ? 0 : ci;
  R.clouds.forEach((c, i) => { c.position.x = ((c.userData.x0 + T * 25 + 150) % 300) - 150; });
  // frame 1: the plane is already blowing apart
  const k0 = cl === 0 ? 0.25 + prog(T, 0, E.c1) * 0.9 : 0; boom(k0, [1, 0.5, 0]); R.plane.visible = !(cl === 0) || false; if (cl === 0) { R.halfA.visible = R.halfB.visible = true; if (!R.halfA.children.length) { const a = plane(); const b = plane(); R.halfA.add(a); R.halfB.add(b); a.position.x = 0; b.position.x = 0; a.userData.body.scale.y = 0.5; a.userData.body.position.x = 8.5; b.userData.body.scale.y = 0.5; b.userData.body.position.x = -8.5; a.children.forEach(m => { if (m.position.x < 1 && m !== a.userData.body) m.visible = false; }); b.children.forEach(m => { if (m.position.x > 1 && m !== b.userData.body) m.visible = false; }); }
    R.halfA.position.set(k0 * 4, -k0 * 2, 0); R.halfA.rotation.z = -k0 * 0.5; R.halfB.position.set(-k0 * 3, -k0 * 3, 0); R.halfB.rotation.z = k0 * 0.6; }
  // the balloon: fuselage swells (cruise), shrinks (landing)
  const sw = cl === 2 ? (T < E.shrinks ? ease(prog(T, E.swells - 0.2, E.swells + 0.8)) : 1 - ease(prog(T, E.shrinks, E.shrinks + 0.8))) * (0.85 + 0.15 * S(T * 6)) : 0; R.plane.userData.body.scale.set(1 + 0.28 * sw, 1, 1 + 0.28 * sw); R.plane.position.set(0, cl === 2 && T > E.shrinks ? -3 * prog(T, E.shrinks, E.c3) : 0, 0); R.plane.rotation.z = cl === 2 && T > E.shrinks ? -0.06 : 0.02 * S(T);
  // window texture states
  const round = cl === 5 ? ease(prog(T, E.c5 + 0.2, E.nocorner)) : cl === 6 ? 1 : 0; const stress = cl === 3 ? 0.4 + 0.6 * prog(T, E.c3, E.cracks) + 0.15 * Math.abs(S(T * 5)) : cl === 1 ? 0.35 : 0; const crack = cl === 3 ? prog(T, E.cracks - 0.1, E.c4 - 0.3) : 0;
  drawWin(R.winTex, cl === 6 ? 1 : 0, cl === 1 ? stress : 0, 0, false, T, false); drawWin(R.winTex2, round, stress, crack, cl === 5 && T > E.flows - 0.2, T, true);
  // 1954: an early jet airliner breaks apart in a black-and-white sky
  R.vPlane.rotation.z = 0.05 * S(T); const vb = cl === 4 && T > E.broke ? prog(T, E.broke, E.c5) : 0; R.vPlane.position.set(-T * 0.4 % 6, -vb * 10, 0); R.vPlane.rotation.x = vb * 0.6; R.vPlane.rotation.z = -vb * 0.9;
  // cabin: you at the window, bro steals your seat
  const you = R.you, bro = R.bro; you.visible = cl === 1 || cl === 6; bro.visible = cl === 6 && T > E.bro - 0.3;
  if (you.visible) { seatPose(you, 0.5); you.position.set(400 - 1.35 - 400, you.position.y, 0.1); you.position.x = -1.35; you.rotation.y = PI * 0.5 + 0.4; you.userData.head.rotation.y = 0.3; face(you, cl === 1 ? (T > E.square ? 'shock' : 'neutral') : 'grin', T);
    if (cl === 6 && T > E.bro) { const k = ease(prog(T, E.bro, E.bro + 0.8)); you.position.x = lerp(-1.35, -0.85, k); you.rotation.y = PI; face(you, 'angry', T); } }
  if (bro.visible) { const k = ease(prog(T, E.bro - 0.3, E.bro + 0.6)); rest(bro); if (k < 0.99) { bro.position.set(lerp(0, -1.35, k), 0, lerp(1.2, 0.1, k)); walkPose(bro, T * 9, 0.5); bro.rotation.y = -PI / 2; } else { seatPose(bro, 0.5); bro.position.x = -1.35; bro.position.z = 0.1; bro.rotation.y = PI * 0.5 + 0.5; } face(bro, 'grin', T); }
  R.skyG.visible = cl === 0 || cl === 2; R.cabin.visible = cl === 1 || cl === 6; R.winSet.visible = cl === 3 || cl === 5; R.vint.visible = cl === 4; R.sky.visible = cl !== 3 && cl !== 5;
  scene.background = (cl === 3 || cl === 5) ? new T3.Color('#0a0e14') : null; }
function shot(T) { const si = shotAt(T), sh = SH[si], t0 = sh[0], t1 = si + 1 < SH.length ? SH[si + 1][0] : TM.total; camera.fov = 52; camera.updateProjectionMatrix(); anim(T); sh[1](prog(T, t0, t1), T); sunAt(camera.position.x, 0, camera.position.z); return { si, t0 }; }
// ---------- captions only: small bold white with a soft shadow, 2-3 words, mid-frame ----------
const CAPS = []; CL.forEach(c0 => { let cur = []; const flush = () => { if (cur.length) CAPS.push({ a: cur[0].a, b: cur[cur.length - 1].b, t: cur.map(w => w.w).join(' ') }); cur = []; };
  c0.words.forEach(w0 => { const w = Object.assign({}, w0, { w: ({ fucking: 'f***ing' })[w0.w.toLowerCase()] || w0.w }); const prev = cur[cur.length - 1]; if (cur.length && (cur.length >= 3 || w.a - prev.b > 0.25 || /[.,!?]$/.test(prev.w))) flush(); cur.push(w); }); flush(); });
CAPS.forEach((c, i) => { const nx = CAPS[i + 1]; c.b = nx ? Math.min(nx.a, c.b + 0.3) : c.b + 0.6; });
function caption(c) { octx.save(); octx.font = '600 46px CapFont'; octx.textAlign = 'center'; octx.textBaseline = 'middle'; octx.shadowColor = 'rgba(0,0,0,0.85)'; octx.shadowBlur = 10; octx.shadowOffsetY = 3; octx.lineJoin = 'round'; octx.lineWidth = 5; octx.strokeStyle = 'rgba(0,0,0,0.55)'; octx.strokeText(c.t, 360, 640); octx.shadowBlur = 0; octx.fillStyle = '#ffffff'; octx.fillText(c.t, 360, 640); octx.restore(); }
window.initFootball = async function () {
  await Promise.all(['600 44px CapFont'].map(f => document.fonts.load(f)));
  GLOW = ctex(64, 64, (c, w, h) => { const gr = c.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.3, 'rgba(255,255,255,0.5)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = gr; c.fillRect(0, 0, w, h); });
  glc = document.createElement('canvas'); glc.width = RW; glc.height = RH;
  renderer = new T3.WebGLRenderer({ canvas: glc, antialias: true, preserveDrawingBuffer: true }); renderer.setPixelRatio(1); renderer.setSize(RW, RH, false); renderer.outputColorSpace = T3.SRGBColorSpace; renderer.toneMapping = T3.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0; renderer.shadowMap.enabled = true; renderer.shadowMap.type = T3.PCFSoftShadowMap;
  scene = new T3.Scene(); scene.fog = new T3.Fog('#c8d4dc', 60, 500); camera = new T3.PerspectiveCamera(52, RW / RH, 0.03, 6000); scene.add(camera);
  { const pm = new T3.PMREMGenerator(renderer); const es = new T3.Scene(); const et = ctex(256, 128, (c, w, h) => { const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#3a3e48'); gr.addColorStop(0.5, '#6a6862'); gr.addColorStop(1, '#3a3630'); c.fillStyle = gr; c.fillRect(0, 0, w, h); }); es.add(new T3.Mesh(new T3.SphereGeometry(10, 32, 16), new T3.MeshBasicMaterial({ map: et, side: T3.BackSide }))); scene.environment = pm.fromScene(es, 0.04).texture; }
  build(); out = document.getElementById('c'); octx = out.getContext('2d'); SNAP = document.createElement('canvas'); SNAP.width = W; SNAP.height = H;
};

function label(T, t0, top, sub, col = '#ffd34a', y = 180) { const k = ease(prog(T, t0 - 0.1, t0 + 0.2)); if (k <= 0) return; octx.save(); octx.globalAlpha = k; octx.font = '30px Russo'; const w = Math.max(octx.measureText(top).width, 160) + 60; pill(360 - w / 2, y, w, 60, col); txt(top, 360, y + 32, 30, '#111'); if (sub) txt(sub, 360, y + 88, 26, '#fff'); octx.restore(); }
function callout(T, t0, s_, x, y, col = '#ffd34a') { const k = ease(prog(T, t0 - 0.05, t0 + 0.2)); if (k <= 0) return; octx.save(); octx.globalAlpha = k; octx.font = '28px Russo'; const w = octx.measureText(s_).width + 36; pill(x - w / 2, y - 26, w, 52, 'rgba(10,12,28,0.88)', col); txt(s_, x, y + 1, 28, col); octx.restore(); }

window.DURATION = TM.total;
window.renderFrame = function (T) { const loop = T >= E.loop; const { si, t0 } = shot(T); renderer.render(scene, camera);
  octx.globalCompositeOperation = 'source-over'; octx.globalAlpha = 1; octx.filter = CLI(T) === 4 && T < E.loop ? 'sepia(0.85) contrast(1.15) brightness(0.95)' : 'contrast(1.05) saturate(1.06)'; octx.drawImage(glc, 0, 0, W, H); octx.filter = 'none';
  const vg = octx.createRadialGradient(360, 640, 460, 360, 640, 900); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.28)'); octx.fillStyle = vg; octx.fillRect(0, 0, W, H);
  const cap = CAPS.find(c => T >= c.a && T < c.b); if (cap && !loop) caption(cap); };
})();
