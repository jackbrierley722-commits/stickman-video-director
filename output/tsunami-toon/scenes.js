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
const E = { c1: CL[1].start, gorgeous: AT(1, 'you', 1), c2: CL[2].start, c3: CL[3].start, means: AT(3, 'that'), c4: CL[4].start, fish: AT(4, 'to'), c5: CL[5].start, nohill: AT(5, "there's"), hotel: AT(5, 'so', 1),
  c6: CL[6].start, crash: AT(6, 'the'), c7: CL[7].start, first: AT(7, 'but'), stay: AT(7, 'so'), c8: CL[8].start, views: AT(8, 'twelve'), still: AT(8, "he's") };
E.loop = TM.total - 0.4;
// world: beach along x, sea toward -z, land toward +z. Shoreline at z = 0. Hotel at x = 8, z = 26.
const HOT = [8, 0, 26], BAL = [6.25, 13.66, 21.35]; // fifth-floor balcony
function seaTex() { const t = ctex(256, 256, (c) => { const g = c.createLinearGradient(0, 0, 0, 256); g.addColorStop(0, '#1a6a9a'); g.addColorStop(1, '#2a8ab8'); c.fillStyle = g; c.fillRect(0, 0, 256, 256); const r = rng(5); c.strokeStyle = 'rgba(255,255,255,0.25)'; c.lineWidth = 2; for (let i = 0; i < 120; i++) { const x = r() * 256, y = r() * 256; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + 10, y - 3, x + 20, y); c.stroke(); } }); t.wrapS = t.wrapT = T3.RepeatWrapping; t.repeat.set(20, 20); return t; }
function build() {
  buildSky(); R.sun.intensity = 3.0; R.hemi.intensity = 1.1;
  const G = R.G = new T3.Group(); scene.add(G);
  add(G, Bx(400, 0.2, 60), SM('#ffffff', { map: noiseTex(256, 256, '#e2cfa0', [['rgba(0,0,0,0.06)', 3000, 2], ['rgba(255,255,255,0.08)', 2000, 2]], 3, [60, 10]), roughness: 1 }), 0, -0.1, 18, false);
  R.wetSand = add(G, Bx(400, 0.2, 80), SM('#ffffff', { map: noiseTex(256, 256, '#a8946a', [['rgba(0,0,0,0.1)', 3000, 2]], 4, [60, 12]), roughness: 0.4 }), 0, -0.14, -40, false);
  R.sea = add(G, Bx(400, 0.2, 300), SM('#ffffff', { map: seaTex(), roughness: 0.15, metalness: 0.2, transparent: true, opacity: 0.95 }), 0, 0.0, -150, false);
  R.foam = add(G, Bx(400, 0.06, 1.2), SM('#ffffff', { roughness: 0.6, transparent: true, opacity: 0.85 }), 0, 0.06, -0.6, false);
  add(G, Bx(400, 0.08, 6), SM('#55585e'), 0, 0.0, 34, false); // promenade road
  // the hotel: tall concrete with balconies
  const ht = R.hotel = new T3.Group(); ht.position.set(...HOT); G.add(ht); const conc = SM('#ffffff', { map: noiseTex(128, 128, '#c8c4bc', [['rgba(0,0,0,0.06)', 600, 2]], 9, [4, 8]), roughness: 0.9 }); add(ht, Bx(14, 36, 8), conc, 0, 18, 0);
  for (let f = 0; f < 11; f++) for (let x = -5.25; x <= 5.25; x += 3.5) { add(ht, Bx(2.8, 1.8, 0.1), SM('#4a6a88', { metalness: 0.3, roughness: 0.1 }), x, 1.8 + f * 3.2, -4.02); add(ht, Bx(3, 0.12, 1.2), conc, x, 0.8 + f * 3.2, -4.6); add(ht, Bx(3, 0.8, 0.06), SM('#e8e8ea', { metalness: 0.6, roughness: 0.3, transparent: true, opacity: 0.5 }), x, 1.2 + f * 3.2, -5.2); }
  add(ht, Bx(14.4, 1.2, 8.4), SM('#e8e4dc'), 0, 36.6, 0); add(ht, new T3.PlaneGeometry(9, 1.6), new T3.MeshBasicMaterial({ map: ctex(512, 92, c => { c.fillStyle = '#e8e4dc'; c.fillRect(0, 0, 512, 92); c.fillStyle = '#1d3f8a'; c.font = '56px Russo'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('HOTEL AZUL', 256, 50); }), toneMapped: false }), 0, 34.6, -4.06, false).rotation.y = PI;
  // palms, parasols, towels, siren tower
  const palm = (x, z, s) => { const p = new T3.Group(); p.position.set(x, 0, z); p.scale.setScalar(s); G.add(p); const cv = new T3.CatmullRomCurve3([new T3.Vector3(0, 0, 0), new T3.Vector3(0.4, 3, 0), new T3.Vector3(1.2, 6, 0.2)]); add(p, new T3.TubeGeometry(cv, 16, 0.18, 8), SM('#8a6a48', { roughness: 1 }), 0, 0, 0); for (let i = 0; i < 7; i++) { const a = i / 7 * 2 * PI; const lf = add(p, Bx(2.6, 0.04, 0.5), SM('#3a8a3a', { roughness: 0.9 }), 1.2 + C(a) * 1.1, 6 - 0.3, 0.2 + S(a) * 1.1); lf.rotation.set(0.3 * S(a), -a, -0.5); } return p; };
  [[-14, 10], [-4, 14], [14, 9], [22, 13], [-24, 12]].forEach(([x, z], i) => palm(x, z, 0.9 + (i % 2) * 0.2));
  const pcols = ['#e8263a', '#f1c40f', '#2a6fdb', '#27ae60', '#ff7ab0']; R.parasols = []; [[-8, 5], [-2, 6], [4, 4.5], [10, 6], [16, 5], [-14, 4.5]].forEach(([x, z], i) => { const p = new T3.Group(); p.position.set(x, 0, z); G.add(p); add(p, Cy(0.03, 0.03, 2.2, 6), SM('#eee'), 0, 1.1, 0); add(p, new T3.ConeGeometry(1.3, 0.5, 12), SM(pcols[i % 5], { roughness: 0.7 }), 0, 2.3, 0); add(p, Bx(0.8, 0.02, 1.8), SM(pcols[(i + 2) % 5]), 0.8, 0.02, 0.6); R.parasols.push(p); });
  const sp = new T3.Group(); sp.position.set(-6, 0, 16); G.add(sp); add(sp, Cy(0.15, 0.2, 8, 10), SM('#8a8e94', { metalness: 0.6 }), 0, 4, 0); for (const r of [0, 1, 2]) { const h = add(sp, new T3.ConeGeometry(0.4, 0.8, 12, 1, true), SM('#d8d8d8', { metalness: 0.5, side: T3.DoubleSide }), 0, 7.6, 0); h.rotation.set(PI / 2, r * 2.1, 0); h.position.set(S(r * 2.1) * 0.4, 7.6, C(r * 2.1) * 0.4); }
  R.sirenLight = new T3.PointLight('#ff2020', 0, 30, 1.4); R.sirenLight.position.set(-6, 8.6, 16); G.add(R.sirenLight); R.sirenM = add(sp, Sp(0.25, 12, 8), new T3.MeshBasicMaterial({ color: '#ff2020', toneMapped: false }), 0, 8.4, 0, false);

  // ===== MORE DETAIL: beachfront city, palms, bushes, lifeguard tower, beach bar, promenade =====
  const rr = rng(21); const bcols = ['#e8e0d0', '#f4ead8', '#d8c8b0', '#c8d8e0', '#f0d8c8', '#e0e8e8', '#d0c0a8'];
  const tower = (x, z, w, d, h, col) => { const b = new T3.Group(); b.position.set(x, 0, z); G.add(b); add(b, Bx(w, h, d), SM(col, { roughness: 0.85 }), 0, h / 2, 0); const wt_ = ctex(64, 128, (c) => { c.fillStyle = col; c.fillRect(0, 0, 64, 128); for (let y = 4; y < 128; y += 12) for (let xx = 4; xx < 64; xx += 12) { c.fillStyle = rr() < 0.15 ? '#f4dca0' : '#3a5a78'; c.fillRect(xx, y, 8, 8); } c.fillStyle = 'rgba(255,255,255,0.5)'; for (let y = 12; y < 128; y += 12) c.fillRect(0, y, 64, 1); }); wt_.wrapS = wt_.wrapT = T3.RepeatWrapping; wt_.repeat.set(Math.max(1, Math.round(w / 6)), Math.max(1, Math.round(h / 12)));
    add(b, new T3.PlaneGeometry(w * 0.96, h * 0.96), new T3.MeshStandardMaterial({ map: wt_, roughness: 0.4, metalness: 0.2 }), 0, h / 2, -d / 2 - 0.02, false).rotation.y = PI; add(b, Bx(w + 0.4, 0.6, d + 0.4), SM('#f4f2ee'), 0, h + 0.3, 0); return b; };
  for (let i = 0; i < 26; i++) { const x = -110 + i * 9 + rr() * 3; if (Math.abs(x - HOT[0]) < 10) continue; const h = 10 + rr() * 34, w = 7 + rr() * 4; tower(x, 34 + rr() * 10, w, 8 + rr() * 4, h, bcols[i % bcols.length]); }
  for (let i = 0; i < 18; i++) { const x = -120 + i * 14 + rr() * 6; tower(x, 70 + rr() * 30, 10 + rr() * 6, 10, 30 + rr() * 60, ['#9aa8b8', '#b8c4cc', '#8a9aa8', '#c8ccd0'][i % 4]); } // skyline behind
  add(G, Bx(400, 0.1, 5), SM('#e8dcc4', { roughness: 0.9 }), 0, 0.02, 29, false); // promenade
  for (let x = -100; x < 100; x += 8) { add(G, Cy(0.06, 0.08, 4.5, 8), SM('#2a2c30', { metalness: 0.6 }), x, 2.25, 27.5); add(G, Sp(0.18, 10, 8), SM('#fff4d8', { emissive: '#fff4d8', emissiveIntensity: 0.3 }), x, 4.6, 27.5); }
  const ccol = ['#c83a2a', '#e8e8ec', '#2a2a30', '#3a5a8a', '#f1c40f', '#8a8a90']; for (let i = 0; i < 16; i++) { const g_ = new T3.Group(); g_.position.set(-70 + i * 9 + rr() * 2, 0, 32 + (i % 2) * 3); g_.rotation.y = PI / 2 + (i % 2 ? PI : 0); G.add(g_); const pm = SM(ccol[i % 6], { metalness: 0.6, roughness: 0.3 }); add(g_, RB(1.8, 0.7, 4.3, 0.15), pm, 0, 0.6, 0); add(g_, RB(1.6, 0.55, 2.2, 0.2), pm, 0, 1.12, -0.2); add(g_, RB(1.62, 0.42, 2.0, 0.15), SM('#1a2430', { roughness: 0.08 }), 0, 1.15, -0.2); for (const [wx, wz] of [[-0.85, 1.4], [0.85, 1.4], [-0.85, -1.4], [0.85, -1.4]]) add(g_, Cy(0.33, 0.33, 0.22, 16), SM('#151515'), wx, 0.33, wz).rotation.z = PI / 2; }
  // many more palms and bushes along the beach and the promenade
  for (let i = 0; i < 34; i++) { const x = -90 + i * 5.5 + rr() * 2; const z = i % 2 ? 22 + rr() * 3 : 12 + rr() * 6; if (Math.abs(x - HOT[0]) < 8 && z > 18) continue; palm(x, z, 0.8 + rr() * 0.5); }
  for (let i = 0; i < 60; i++) { const x = -95 + rr() * 190, z = 19 + rr() * 8; if (Math.abs(x - HOT[0]) < 8) continue; for (let k = 0; k < 3; k++) add(G, Sp(0.5 + rr() * 0.5, 12, 8), SM(['#3a7a2a', '#4a8a32', '#2e6a26', '#5a9a3a'][k % 4], { roughness: 1 }), x + (rr() - 0.5) * 1.2, 0.4, z + (rr() - 0.5) * 1.0).scale.y = 0.7; }
  for (let i = 0; i < 14; i++) add(G, Sp(0.25 + rr() * 0.3, 10, 8), SM('#8a8478', { roughness: 0.9 }), -40 + rr() * 80, 0.05, -3 + rr() * 2).scale.set(1.4, 0.6, 1.1); // rocks at the waterline
  // lifeguard tower + beach bar
  const lg = new T3.Group(); lg.position.set(-11, 0, 7); G.add(lg); for (const [x, z] of [[-0.8, -0.8], [0.8, -0.8], [-0.8, 0.8], [0.8, 0.8]]) add(lg, Bx(0.15, 2.4, 0.15), SM('#f4f2ee'), x, 1.2, z); add(lg, Bx(2.2, 1.6, 2.2), SM('#e8263a', { roughness: 0.6 }), 0, 3.2, 0); add(lg, new T3.ConeGeometry(1.8, 0.8, 4), SM('#f4f2ee'), 0, 4.4, 0).rotation.y = PI / 4; add(lg, Bx(0.15, 3.4, 0.6), SM('#f4f2ee'), 0, 1.7, 1.6).rotation.x = -0.5;
  const bar = new T3.Group(); bar.position.set(18, 0, 14); G.add(bar); add(bar, Bx(5, 1.2, 1.4), SM('#8a5a32', { roughness: 0.8 }), 0, 0.6, 0); add(bar, new T3.ConeGeometry(4.2, 1.6, 4), SM('#d8b878', { roughness: 1 }), 0, 3.2, 0).rotation.y = PI / 4; for (const x of [-2.2, 2.2]) add(bar, Cy(0.08, 0.08, 2.6, 8), SM('#6a4a2a'), x, 1.3, -0.6);
  add(bar, new T3.PlaneGeometry(3, 0.5), new T3.MeshBasicMaterial({ map: ctex(256, 44, c => { c.fillStyle = '#2a6fdb'; c.fillRect(0, 0, 256, 44); c.fillStyle = '#fff'; c.font = '30px Russo'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('BEACH BAR', 128, 24); }), toneMapped: false }), 0, 1.5, -0.72, false).rotation.y = PI;
  // the tsunami wave (far out at first, then crashing in)
  const wv = R.wave = new T3.Group(); G.add(wv); const wm = SM('#2a7a9a', { roughness: 0.25, metalness: 0.1, emissive: '#0a2a3a', emissiveIntensity: 0.4 }); const shape = new T3.Shape(); shape.moveTo(0, 0); shape.lineTo(0, 8); shape.quadraticCurveTo(3, 11, 7, 9); shape.quadraticCurveTo(4, 8.5, 5, 4); shape.lineTo(9, 0); shape.closePath();
  const wg = new T3.ExtrudeGeometry(shape, { depth: 400, bevelEnabled: false, curveSegments: 12 }); wg.translate(0, 0, -200); wg.rotateY(PI / 2); add(wv, wg, wm, 0, 0, 0, false); R.waveFoam = add(wv, Bx(400, 1.4, 3.2), SM('#ffffff', { roughness: 0.7, emissive: '#ffffff', emissiveIntensity: 0.3 }), 0, 9.4, 5.0, false); for (let i = 0; i < 30; i++) spr(wv, GLOW, '#ffffff', 6, -150 + i * 10, 10.2, 5.5, 0.7, T3.NormalBlending);
  // the flood: a rising water sheet that sweeps inland around the hotel
  R.flood = add(G, Bx(400, 0.4, 70), SM('#3a6a6a', { roughness: 0.25, metalness: 0.1, transparent: true, opacity: 0.92, map: seaTex() }), 0, -1, 24, false);
  R.floodFoam = []; for (let i = 0; i < 40; i++) R.floodFoam.push(spr(G, GLOW, '#ffffff', 2.5, 0, -10, 0, 0, T3.NormalBlending));
  // crowd running away from the sea
  R.crowd = []; const cols = ['#e8263a', '#2a6fdb', '#f1c40f', '#27ae60', '#ff9a3a', '#8e44ad', '#e8e8e8', '#1abc9c']; const r = rng(4);
  for (let i = 0; i < 36; i++) { const p = human({ skin: ['#d8a078', '#e8c0a0', '#8a5a3a', '#c8906a'][i % 4], top: cols[i % 8], bot: ['#2a6fdb', '#e8c860', '#2a2e3a', '#c84a4a'][i % 4], hair: ['#2a1a10', '#d8b45a', '#1a1a1a', '#5a3a1a'][i % 4], short: true }); p.userData.base = [-34 + r() * 68, -1 + r() * 12, 2.6 + r() * 2.2, r()]; G.add(p); R.crowd.push(p); }
  // you and your bro (bro in a loud shirt)
  R.you = human({ skin: '#d8a078', top: '#3a3a42', bot: '#2a5aa8', hair: '#2a1a10', eye: '#4a3020', shoe: '#e8e8e8', short: true }); G.add(R.you);
  R.bro = human({ skin: '#c8906a', top: '#ff7ab0', bot: '#f1c40f', hair: '#1a1a1a', eye: '#3a2a1a', shoe: '#1a1a1e', short: true }); G.add(R.bro);
  R.broPhone = new T3.Group(); R.bro.userData.armR.userData.h.add(R.broPhone); add(R.broPhone, RB(0.075, 0.15, 0.01, 0.008), SM('#111'), 0, -0.06, 0.03); R.phoneScr = add(R.broPhone, new T3.PlaneGeometry(0.066, 0.135), new T3.MeshBasicMaterial({ map: ctex(64, 128, () => {}), toneMapped: false }), 0, -0.06, 0.036, false);
  R.fish = new T3.Group(); G.add(R.fish); add(R.fish, Sp(0.12, 14, 10), SM('#a8b8c8', { metalness: 0.6, roughness: 0.3 }), 0, 0, 0).scale.set(2.2, 0.9, 0.55); add(R.fish, new T3.ConeGeometry(0.1, 0.18, 4), SM('#a8b8c8', { metalness: 0.6 }), -0.32, 0, 0).rotation.z = PI / 2; add(R.fish, Sp(0.02), SM('#111'), 0.2, 0.03, 0.06);
  R.gold = spr(G, GLOW, '#fff0b0', 1.6, 0, -10, 0, 0);
}
function drawStory(views) { const c = R.phoneScr.material.map.userData.g; c.fillStyle = '#4a8ab8'; c.fillRect(0, 0, 64, 128); c.fillStyle = '#1a3a5a'; c.fillRect(0, 70, 64, 58); c.fillStyle = '#fff'; c.font = '9px Arial'; c.fillText(views >= 0 ? 'Seen by ' + views : 'REC', 6, 12); if (views < 0) { c.fillStyle = '#e8263a'; c.beginPath(); c.arc(54, 9, 4, 0, 7); c.fill(); } R.phoneScr.material.map.needsUpdate = true; }
let STORY = null;
const SH = [
  [0, (k, T) => TR(k, [2.6, 2.6, 13], [2.2, 2.7, 11.5], [0, 4, -60], [0, 4.4, -60])],
  [E.c1, (k, T) => TR(k, [1.4, 1.6, 6.4], [1.3, 1.6, 6.2], [0.6, 1.55, 4.6], [0.6, 1.55, 4.6])],
  [E.gorgeous - 0.1, (k, T) => TR(k, [0.75, 1.6, 5.9], [0.68, 1.58, 5.55], [0.6, 1.58, 4.6], [0.6, 1.58, 4.6])],
  [E.c2, (k, T) => TR(k, [1.05, 1.8, 6.3], [0.95, 1.8, 6.0], [0.45, 1.5, -6], [0.45, 1.6, -6])],
  [E.c3, (k, T) => TR(k, [0, 4.5, 12], [0, 5.5, 10], [0, 0, -25], [0, 0, -30])],
  [E.c4, (k, T) => { const x = R.bro.position; look([x.x + 2.4, 1.6, x.z + 3.4], [x.x, 0.9, x.z - 1]); }],
  [E.c5, (k, T) => { const p = R.you.position; look([p.x + 3, 2.0, p.z - 3.5], [p.x, 1.2, p.z + 2]); }],
  [E.hotel - 0.1, (k, T) => TR(k, [HOT[0] - 14, 2, HOT[2] - 34], [HOT[0] - 12, 3, HOT[2] - 32], [HOT[0], 14, HOT[2]], [HOT[0], 18, HOT[2]])],
  [E.c6, (k, T) => TR(k, [BAL[0] + 2.4, BAL[1] + 2.0, BAL[2] - 1.4], [BAL[0] + 2.6, BAL[1] + 2.2, BAL[2] - 1.8], [BAL[0] - 2, 4, BAL[2] - 30], [BAL[0] - 2, 1, BAL[2] - 18])],
  [E.c7, (k, T) => TR(k, [BAL[0] + 0.4, BAL[1] + 1.65, BAL[2] - 2.9], [BAL[0] + 0.35, BAL[1] + 1.6, BAL[2] - 2.6], [BAL[0], BAL[1] + 1.35, BAL[2]], [BAL[0], BAL[1] + 1.35, BAL[2]])],
  [E.first - 0.1, (k, T) => TR(k, [BAL[0] + 0.2, BAL[1] + 1.9, BAL[2] - 0.6], [BAL[0] + 0.2, BAL[1] + 2.0, BAL[2] - 0.7], [BAL[0], 4, BAL[2] - 100], [BAL[0], 5, BAL[2] - 100])],
  [E.c8, (k, T) => TR(k, [BAL[0] - 0.1, BAL[1] + 1.6, BAL[2] - 2.2], [BAL[0] - 0.2, BAL[1] + 1.55, BAL[2] - 1.9], [BAL[0] - 0.55, BAL[1] + 1.3, BAL[2]], [BAL[0] - 0.55, BAL[1] + 1.25, BAL[2]])],
  [E.loop, (k, T) => look([2.6, 2.6, 13], [0, 4, -60])],
];
const shotAt = T => { let i = 0; for (let j = 0; j < SH.length; j++) if (T >= SH[j][0]) i = j; return i; };
function anim(T) { const ci = CLI(T), loop = T >= E.loop, cl = loop ? 0 : ci; const Tt = loop ? 0.5 : T;
  // siren light spins, sea animates
  const flash = Math.floor(Tt * 3) % 2; R.sirenLight.intensity = flash ? 30 : 0; R.sirenM.material.color.set(flash ? '#ff3030' : '#400a0a'); R.sea.material.map.offset.set(Tt * 0.01, Tt * 0.02);
  // the sea pulls back from the beach (clip 3 onward), the wave approaches, then floods inland
  const draw = cl >= 3 ? ease(prog(T, E.c3 + 0.3, E.c4 + 0.8)) : 0; R.sea.position.z = -150 - 60 * draw; R.foam.position.z = -0.6 - 60 * draw; R.foam.visible = draw < 0.95;
  const wz = cl <= 2 ? -95 : cl <= 5 ? lerp(-90, -45, prog(T, E.c3, E.c6)) : cl === 6 ? lerp(-35, 30, ease(prog(T, E.c6, E.crash + 0.6))) : -85; R.wave.position.set(0, cl === 7 || cl === 8 ? -2 : 0, wz); R.wave.visible = wz < 40 && !(cl === 7 && T < E.first - 0.1); R.wave.scale.y = cl === 6 ? 1.6 : cl >= 7 ? 3.2 : 3.4;
  const flood = cl >= 6 ? ease(prog(T, E.crash - 0.1, E.crash + 1.2)) : 0; R.flood.position.y = -1 + 5 * flood + 0.1 * S(T * 2); R.flood.material.map.offset.set(0, -T * 0.05);
  R.floodFoam.forEach((f, i) => { const ph = (T * 0.4 + i / 40) % 1; f.position.set(-25 + (i * 7.3) % 50, R.flood.position.y + 0.25, 4 + ((i * 3.7) % 40)); f.material.opacity = flood > 0.05 ? 0.4 * (1 - Math.abs(ph - 0.5) * 2) : 0; });
  // crowd: panicking, running inland
  R.crowd.forEach((p, i) => { const b = p.userData.base; p.visible = cl <= 5; const run = cl === 0 ? Tt : T; const sp_ = b[2]; p.position.set(b[0] + S(i * 1.7) * 0.6 * run, 0, b[1] + (run * sp_ * 0.55) % 24); p.rotation.y = 0.2 * S(i * 3.1); walkPose(p, run * 12 + i, 1.25); const pose_ = i % 4; if (pose_ === 0) { p.userData.armL.rotation.x = -2.7; p.userData.armR.rotation.x = -2.6; } else if (pose_ === 1) { p.userData.head.rotation.y = 1.2 * (i % 2 ? 1 : -1); } else if (pose_ === 2) { p.userData.armR.rotation.set(-1.4, 0, -0.3); } p.userData.up.rotation.x = 0.15; face(p, i % 3 ? 'shock' : 'yell', run); });
  // you and bro on the beach
  const you = R.you, bro = R.bro; rest(you); rest(bro); you.visible = bro.visible = true; R.broPhone.visible = true; R.fish.visible = false; R.gold.material.opacity = 0;
  you.position.set(1.4, 0, 6); you.rotation.y = -2.4; bro.position.set(0.6, 0, 4.6); bro.rotation.y = PI * 0.1; face(you, 'shock', T); face(bro, 'grin', T);
  bro.userData.armR.rotation.set(-1.5, 0, -0.2); bro.userData.armR.userData.e.rotation.x = -0.4;
  if (cl === 0) { bro.rotation.y = 0.2; you.rotation.y = PI; bro.userData.armR.rotation.set(-2.5, 0, -0.3); bro.userData.armR.userData.e.rotation.x = -0.6; face(bro, 'grin', T); }
  if (cl === 1) { you.rotation.y = -2.4; face(you, T > E.gorgeous ? 'grin' : 'neutral', T); bro.rotation.y = 0.5; bro.userData.armR.rotation.set(-0.2, 0, -0.1); face(bro, 'grin', T); bro.userData.head.rotation.set(-0.15, 0.3, 0.1); if (T > E.gorgeous) { R.gold.position.set(0.62, 1.62, 4.75); R.gold.material.opacity = 0.35 + 0.15 * S(T * 4); } }
  if (cl === 2) { bro.rotation.y = PI; you.rotation.y = -2.6; you.position.set(1.9, 0, 6.2); }
  if (cl === 3) { bro.rotation.y = PI; face(you, 'shock', T); }
  if (cl === 4) { const k = ease(prog(T, E.c4 + 0.2, E.fish)); bro.position.set(0.6, 0, lerp(4.6, -8, k)); bro.rotation.y = PI; walkPose(bro, T * 11, 1.1); R.broPhone.visible = false; R.fish.visible = true; R.fish.position.set(0.9, 0.12 + 0.12 * Math.abs(S(T * 14)), -8.8); R.fish.rotation.z = 0.4 * S(T * 20);
    if (T > E.fish) { bro.position.z = -8.3; rest(bro); bro.userData.up.rotation.x = 0.8; bro.userData.armR.rotation.x = -1.2; R.fish.position.set(0.85, 0.5, -8.7); face(bro, 'grin', T); } }
  if (cl === 5) { const k = ease(prog(T, E.c5, E.hotel)); const z = lerp(-7, 22, k); you.position.set(lerp(0.8, HOT[0] - 0.5, k), 0, z); bro.position.set(you.position.x - 0.9, 0, z - 0.8); you.rotation.y = bro.rotation.y = 0.2; walkPose(you, T * 11, 1.1); walkPose(bro, T * 11 + 1, 1.0); you.userData.armL.rotation.set(-1.4, 0, -0.4); R.broPhone.visible = false; R.fish.visible = true; bro.userData.armR.rotation.x = -1.0; R.fish.position.copy(bro.position).add(new T3.Vector3(0.3, 1.0, 0.4)); face(bro, 'grin', T); face(you, 'angry', T); }
  if (cl >= 6 || (loop && false)) { you.position.set(BAL[0] + 0.55, BAL[1], BAL[2]); bro.position.set(BAL[0] - 0.55, BAL[1], BAL[2]); you.rotation.y = bro.rotation.y = PI; face(you, 'shock', T); face(bro, 'shock', T);
    if (cl === 7) { bro.rotation.y = PI - 0.5; face(bro, T < E.first ? 'grin' : 'sad', T); you.rotation.y = PI + 0.6; face(you, 'angry', T); you.userData.armR.rotation.set(-1.4, 0, -0.3); if (T > E.stay) { you.userData.armR.rotation.set(-1.2, 0, 0.6); } }
    if (cl === 8) { bro.rotation.y = PI - 0.3; you.rotation.y = PI + 0.4; face(bro, 'sad', T); face(you, 'neutral', T); R.fish.visible = true; bro.userData.armL.rotation.set(-0.6, 0, 0.2); R.fish.position.set(bro.position.x - 0.35, BAL[1] + 0.85, bro.position.z - 0.25); R.fish.rotation.set(0, 0, -1.2); }
    if (cl === 6) { R.fish.visible = true; R.fish.position.set(bro.position.x - 0.35, BAL[1] + 0.85, bro.position.z - 0.2); } }
  const views = cl === 8 && T > E.views - 0.1 ? 12 : -1; if (STORY !== views) { drawStory(views); STORY = views; }
  R.sky.visible = true; }
function shot(T) { const si = shotAt(T), sh = SH[si], t0 = sh[0], t1 = si + 1 < SH.length ? SH[si + 1][0] : TM.total; camera.fov = 64; camera.updateProjectionMatrix(); anim(T); sh[1](prog(T, t0, t1), T); sunAt(camera.position.x, 0, camera.position.z); return { si, t0 }; }


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
// ---------- captions only: small bold white with a soft shadow, 2-3 words, mid-frame ----------
const CAPS = []; CL.forEach(c0 => { let cur = []; const flush = () => { if (cur.length) CAPS.push({ a: cur[0].a, b: cur[cur.length - 1].b, t: cur.map(w => w.w).join(' ') }); cur = []; };
  c0.words.forEach(w0 => { const w = Object.assign({}, w0, { w: ({ ten: '10', twelve: '12' })[w0.w.toLowerCase()] || w0.w }); const prev = cur[cur.length - 1]; if (cur.length && (cur.length >= 3 || w.a - prev.b > 0.25 || /[.,!?]$/.test(prev.w))) flush(); cur.push(w); }); flush(); });
CAPS.forEach((c, i) => { const nx = CAPS[i + 1]; c.b = nx ? Math.min(nx.a, c.b + 0.3) : c.b + 0.6; });
function caption(c) { octx.save(); octx.font = '600 50px CapFont'; octx.textAlign = 'center'; octx.textBaseline = 'middle'; octx.lineJoin = 'round'; octx.lineWidth = 12; octx.strokeStyle = '#111'; octx.strokeText(c.t, 360, 1010); octx.fillStyle = '#ffe04a'; octx.fillText(c.t, 360, 1010); octx.restore(); }
function alertBox(T) { const on = Math.floor(T * 2) % 2 === 0; octx.save(); octx.fillStyle = on ? 'rgba(200,20,20,0.95)' : 'rgba(150,10,10,0.95)'; octx.beginPath(); octx.roundRect(70, 60, 580, 112, 18); octx.fill(); octx.strokeStyle = '#fff'; octx.lineWidth = 3; octx.stroke(); octx.fillStyle = '#fff'; octx.beginPath(); octx.moveTo(122, 88); octx.lineTo(146, 132); octx.lineTo(98, 132); octx.closePath(); octx.fill(); octx.fillStyle = '#c81414'; octx.font = '600 30px CapFont'; octx.textAlign = 'center'; octx.textBaseline = 'middle'; octx.fillText('!', 122, 117); octx.fillStyle = '#fff'; octx.textAlign = 'left'; octx.font = '600 30px CapFont'; octx.fillText('EMERGENCY ALERT', 170, 98); octx.font = '600 24px CapFont'; octx.fillText('Tsunami warning. Leave the beach now.', 170, 138); octx.restore(); }
function pin(T, label) { octx.save(); octx.fillStyle = 'rgba(255,255,255,0.95)'; octx.beginPath(); octx.roundRect(200, 210, 320, 64, 32); octx.fill(); octx.strokeStyle = '#111'; octx.lineWidth = 4; octx.stroke(); octx.fillStyle = '#c81414'; octx.beginPath(); octx.arc(240, 242, 14, 0, 7); octx.fill(); octx.fillStyle = '#111'; octx.font = '600 30px CapFont'; octx.textAlign = 'left'; octx.textBaseline = 'middle'; octx.fillText(label, 268, 243); octx.restore(); }
window.initFootball = async function () {
  await Promise.all(['600 44px CapFont'].map(f => document.fonts.load(f)));
  GLOW = ctex(64, 64, (c, w, h) => { const gr = c.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.3, 'rgba(255,255,255,0.5)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = gr; c.fillRect(0, 0, w, h); });
  glc = document.createElement('canvas'); glc.width = RW; glc.height = RH;
  renderer = new T3.WebGLRenderer({ canvas: glc, antialias: true, preserveDrawingBuffer: true }); renderer.setPixelRatio(1); renderer.setSize(RW, RH, false); renderer.outputColorSpace = T3.SRGBColorSpace; renderer.toneMapping = T3.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0; renderer.shadowMap.enabled = true; renderer.shadowMap.type = T3.PCFSoftShadowMap;
  scene = new T3.Scene(); scene.fog = new T3.Fog('#c8d4dc', 60, 500); camera = new T3.PerspectiveCamera(52, RW / RH, 0.03, 6000); scene.add(camera);
  { const pm = new T3.PMREMGenerator(renderer); const es = new T3.Scene(); const et = ctex(256, 128, (c, w, h) => { const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#3a3e48'); gr.addColorStop(0.5, '#6a6862'); gr.addColorStop(1, '#3a3630'); c.fillStyle = gr; c.fillRect(0, 0, w, h); }); es.add(new T3.Mesh(new T3.SphereGeometry(10, 32, 16), new T3.MeshBasicMaterial({ map: et, side: T3.BackSide }))); scene.environment = pm.fromScene(es, 0.04).texture; }
  build(); goldenHour(); toonify(scene); out = document.getElementById('c'); octx = out.getContext('2d'); SNAP = document.createElement('canvas'); SNAP.width = W; SNAP.height = H;
};

function label(T, t0, top, sub, col = '#ffd34a', y = 180) { const k = ease(prog(T, t0 - 0.1, t0 + 0.2)); if (k <= 0) return; octx.save(); octx.globalAlpha = k; octx.font = '30px Russo'; const w = Math.max(octx.measureText(top).width, 160) + 60; pill(360 - w / 2, y, w, 60, col); txt(top, 360, y + 32, 30, '#111'); if (sub) txt(sub, 360, y + 88, 26, '#fff'); octx.restore(); }
function callout(T, t0, s_, x, y, col = '#ffd34a') { const k = ease(prog(T, t0 - 0.05, t0 + 0.2)); if (k <= 0) return; octx.save(); octx.globalAlpha = k; octx.font = '28px Russo'; const w = octx.measureText(s_).width + 36; pill(x - w / 2, y - 26, w, 52, 'rgba(10,12,28,0.88)', col); txt(s_, x, y + 1, 28, col); octx.restore(); }

window.DURATION = TM.total;
window.renderFrame = function (T) { const loop = T >= E.loop; const { si, t0 } = shot(T); renderer.render(scene, camera);
  octx.globalCompositeOperation = 'source-over'; octx.globalAlpha = 1; octx.filter = 'contrast(1.04) saturate(1.18)'; octx.drawImage(glc, 0, 0, W, H); octx.filter = 'none';
  const vg = octx.createRadialGradient(360, 640, 460, 360, 640, 900); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.28)'); octx.fillStyle = vg; octx.fillRect(0, 0, W, H);
  { const ci_ = CLI(T); if (ci_ <= 5 || loop) alertBox(T); if (ci_ === 5 && T > E.nohill - 0.1 && !loop) pin(T, 'HOTEL . 400 m'); }
  const cap = CAPS.find(c => T >= c.a && T < c.b); if (cap && !loop) caption(cap); };
})();
