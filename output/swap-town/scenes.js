// In this town. Body swap Mondays. Bright blocky 3D: box people with 2D faces, sunny town, clock tower machine.
(() => {
const T3 = THREE; const W = 720, H = 1280, RW = 720, RH = 1280;
const TM = window.TIMING, CL = TM.clips; const S = Math.sin, C = Math.cos, PI = Math.PI;
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), lerp = (a, b, t) => a + (b - a) * t, ease = t => { t = clamp(t); return t * t * (3 - 2 * t); }, prog = (t, a, b) => clamp((t - a) / (b - a));
function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
function AT(ci, word, n = 0) { let k = 0; for (const w of CL[ci].words) if (w.w.toLowerCase().replace(/[^a-z0-9']/g, '') === word) { if (k === n) return w.a; k++; } console.warn('AT miss', ci, word, n); return CL[ci].start; }
let renderer, scene, camera, out, octx, glc, GLOW, SNAP, sun, hemi, amb;
const SM = (c, o = {}) => new T3.MeshStandardMaterial(Object.assign({ color: c, roughness: 0.8, metalness: 0 }, o));
const BM = (c, o = {}) => new T3.MeshBasicMaterial(Object.assign({ color: c }, o));
function add(p, geo, mat, x = 0, y = 0, z = 0, sh = true) { const m = new T3.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = sh; m.receiveShadow = true; p.add(m); return m; }
const Bx = (w, h, d) => new T3.BoxGeometry(w, h, d), Cy = (a, b, h, n = 12) => new T3.CylinderGeometry(a, b, h, n), Sp = (r, a = 14, b = 10) => new T3.SphereGeometry(r, a, b);
function ctex(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); draw(g, w, h); const t = new T3.CanvasTexture(c); t.colorSpace = T3.SRGBColorSpace; t.anisotropy = 4; return t; }
function glow(p, col, size, x, y, z, op) { const s = new T3.Sprite(new T3.SpriteMaterial({ map: GLOW, color: col, transparent: true, opacity: op, blending: T3.AdditiveBlending, depthWrite: false })); s.scale.set(size, size, 1); s.position.set(x, y, z); p.add(s); return s; }
const L3 = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
function look(p, l, T = 0, sway = 1) { const sw = S(T * 0.8) * 0.03 * sway, br = S(T * 1.3) * 0.02 * sway; camera.position.set(p[0] + sw, p[1] + br, p[2]); camera.lookAt(l[0], l[1], l[2]); }
// dolly between two camera positions/targets over the shot (k = 0..1)
const dolly = (p0, p1, l0, l1, k, T, e = true) => { const q = e ? ease(k) : k; look(L3(p0, p1, q), L3(l0, l1, q), T); };

// ---------- timing ----------
const E = { except0: AT(0, 'except'), now0: AT(0, 'and'),
  wake: CL[1].start, dadB: AT(1, 'last'), four: AT(1, 'four'), toast: AT(1, 'he', 1),
  teach: CL[2].start, hw: AT(2, 'he'), wed: CL[3].start, post: AT(3, 'because'),
  rule: CL[4].start, bed: AT(4, 'be'), who: AT(4, 'whoever'),
  hale: CL[5].start, keeper: AT(5, 'the'), every5: AT(5, 'every'), never: AT(5, 'he'),
  leo: CL[6].start, base: AT(6, 'he'), eyes: AT(6, 'eyes'),
  swap7: CL[7].start, exLeo: AT(7, 'except'), patrol: AT(7, 'by'), drag: AT(7, 'they'),
  like: CL[8].start, follow8: AT(8, 'follow'), after: AT(8, 'because'),
  mum: CL[9].start, mondays: AT(9, 'she'), mayor: AT(9, 'this'), shrug: AT(9, 'she', 1),
  climb: CL[10].start, mach: CL[11].start, wires: AT(11, 'thousands'), beds: AT(11, 'one'), chair: AT(11, 'and'), strap: AT(11, 'leo'),
  dark: CL[12].start, wall: CL[13].start, hated: AT(13, 'both'), built: AT(13, 'so'), hate: AT(13, 'you'),
  needs: CL[14].start, old: AT(14, "i'm"), newp: AT(14, 'it'),
  shake: CL[15].start, choice: AT(15, 'so'), unplug: AT(15, 'unplug'), place: AT(15, 'or'),
  dadwk: CL[16].start, tired: AT(16, 'i', 2), hug: AT(16, 'when'),
  unstrap: CL[17].start, sit: AT(17, 'and'),
  q: CL[18].start, comment: AT(18, 'comment'), follow: AT(18, 'and'), sunday: AT(18, 'because'), bed7: AT(18, 'be') };
E.loop = TM.total - 0.45;
function CLI(T) { let ci = CL.findIndex(c => T >= c.start && T < c.start + c.dur); return ci < 0 ? CL.length - 1 : ci; }
function talking(ci, T) { if (CLI(T) !== ci) return 0; for (const w of CL[ci].words) if (T >= w.a - 0.02 && T <= w.b) return 1; return 0; }

// ---------- 2D faces (drawn on a transparent plane on the front of a box head) ----------
const FACE = {};
function makeFaces() {
  const eye = (g, x, y, r = 9, h = 13) => { g.fillStyle = '#171717'; g.beginPath(); g.ellipse(x, y, r, h, 0, 0, 7); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.arc(x + r * 0.35, y - h * 0.4, r * 0.35, 0, 7); g.fill(); };
  const brow = (g, x, y, a) => { g.save(); g.translate(x, y); g.rotate(a); g.fillStyle = '#171717'; g.fillRect(-12, -3, 24, 6); g.restore(); };
  const mk = (k, f) => { FACE[k] = ctex(128, 128, (g) => { g.lineCap = 'round'; g.lineJoin = 'round'; f(g); }); };
  mk('smile', g => { eye(g, 42, 50); eye(g, 86, 50); g.strokeStyle = '#171717'; g.lineWidth = 6; g.beginPath(); g.arc(64, 74, 20, 0.35, PI - 0.35); g.stroke(); });
  mk('grin', g => { eye(g, 42, 50); eye(g, 86, 50); g.fillStyle = '#171717'; g.beginPath(); g.moveTo(38, 78); g.quadraticCurveTo(64, 116, 90, 78); g.closePath(); g.fill(); g.fillStyle = '#fff'; g.fillRect(44, 79, 40, 7); });
  mk('talk', g => { eye(g, 42, 50); eye(g, 86, 50); g.fillStyle = '#171717'; g.beginPath(); g.ellipse(64, 90, 13, 11, 0, 0, 7); g.fill(); g.fillStyle = '#c4484f'; g.beginPath(); g.ellipse(64, 95, 8, 5, 0, 0, 7); g.fill(); });
  mk('neutral', g => { eye(g, 42, 50); eye(g, 86, 50); g.strokeStyle = '#171717'; g.lineWidth = 6; g.beginPath(); g.moveTo(52, 90); g.lineTo(76, 90); g.stroke(); });
  mk('shock', g => { g.fillStyle = '#fff'; g.strokeStyle = '#171717'; g.lineWidth = 4; for (const x of [40, 88]) { g.beginPath(); g.arc(x, 48, 16, 0, 7); g.fill(); g.stroke(); g.fillStyle = '#171717'; g.beginPath(); g.arc(x, 50, 6, 0, 7); g.fill(); g.fillStyle = '#fff'; } brow(g, 40, 22, -0.2); brow(g, 88, 22, 0.2); g.fillStyle = '#171717'; g.beginPath(); g.ellipse(64, 96, 10, 14, 0, 0, 7); g.fill(); });
  mk('sad', g => { eye(g, 42, 54, 8, 11); eye(g, 86, 54, 8, 11); brow(g, 42, 34, 0.35); brow(g, 86, 34, -0.35); g.strokeStyle = '#171717'; g.lineWidth = 6; g.beginPath(); g.arc(64, 106, 16, PI + 0.5, -0.5); g.stroke(); });
  mk('angry', g => { eye(g, 42, 54, 8, 10); eye(g, 86, 54, 8, 10); brow(g, 42, 36, 0.45); brow(g, 86, 36, -0.45); g.strokeStyle = '#171717'; g.lineWidth = 6; g.beginPath(); g.moveTo(48, 94); g.lineTo(80, 90); g.stroke(); });
  mk('shout', g => { eye(g, 42, 54, 8, 10); eye(g, 86, 54, 8, 10); brow(g, 42, 36, 0.45); brow(g, 86, 36, -0.45); g.fillStyle = '#171717'; g.beginPath(); g.moveTo(44, 84); g.lineTo(84, 84); g.lineTo(76, 110); g.lineTo(52, 110); g.closePath(); g.fill(); });
  mk('sleep', g => { g.strokeStyle = '#171717'; g.lineWidth = 5; for (const x of [42, 86]) { g.beginPath(); g.arc(x, 48, 10, 0.2, PI - 0.2); g.stroke(); } g.beginPath(); g.arc(64, 92, 6, 0, 7); g.stroke(); });
  mk('tired', g => { g.fillStyle = '#171717'; for (const x of [42, 86]) { g.beginPath(); g.ellipse(x, 54, 9, 7, 0, 0, 7); g.fill(); } g.fillStyle = 'rgba(90,60,120,0.35)'; g.fillRect(30, 62, 24, 6); g.fillRect(74, 62, 24, 6); g.strokeStyle = '#171717'; g.lineWidth = 6; g.beginPath(); g.moveTo(52, 92); g.lineTo(76, 94); g.stroke(); });
  mk('wide', g => { g.fillStyle = '#fff'; g.strokeStyle = '#171717'; g.lineWidth = 4; for (const x of [40, 88]) { g.beginPath(); g.arc(x, 50, 19, 0, 7); g.fill(); g.stroke(); g.strokeStyle = '#d04040'; g.lineWidth = 1.5; for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(x - 18 + i * 3, 50 + (i - 1.5) * 6); g.lineTo(x - 8, 50); g.stroke(); } g.strokeStyle = '#171717'; g.lineWidth = 4; g.fillStyle = '#171717'; g.beginPath(); g.arc(x, 50, 4, 0, 7); g.fill(); g.fillStyle = '#fff'; } g.strokeStyle = '#171717'; g.lineWidth = 5; g.beginPath(); g.moveTo(52, 98); g.lineTo(76, 98); g.stroke(); });
  mk('baby', g => { eye(g, 40, 56, 11, 14); eye(g, 88, 56, 11, 14); g.fillStyle = '#ff9ab0'; g.globalAlpha = 0.5; g.beginPath(); g.arc(26, 80, 9, 0, 7); g.arc(102, 80, 9, 0, 7); g.fill(); g.globalAlpha = 1; g.strokeStyle = '#171717'; g.lineWidth = 5; g.beginPath(); g.arc(64, 90, 6, 0, 7); g.stroke(); });
  mk('wink', g => { eye(g, 42, 50); g.strokeStyle = '#171717'; g.lineWidth = 6; g.beginPath(); g.moveTo(76, 50); g.lineTo(96, 50); g.stroke(); g.beginPath(); g.arc(64, 74, 20, 0.35, PI - 0.35); g.stroke(); });
}

// ---------- blocky people ----------
// o: { skin, top, bot, hair, style, s (scale), kid, extras: [...], face }
const PEOPLE = [];
function person(o) {
  const s = o.s || 1; const g = new T3.Group(); const u = { o, faceK: o.face || 'smile' }; g.userData = u; g.scale.setScalar(s);
  const skin = SM(o.skin || '#f2c79b'), top = SM(o.top || '#3a7bd5'), bot = SM(o.bot || '#2e3d66'), shoe = SM('#2a2220'), hairM = SM(o.hair || '#4a2e1a');
  const legH = o.kid ? 0.7 : 0.9, torH = o.kid ? 0.72 : 0.86; u.legH = legH;
  for (const side of [-1, 1]) { const lg = new T3.Group(); lg.position.set(0.2 * side, legH, 0); g.add(lg); add(lg, Bx(0.38, legH, 0.4), o.dress ? top : bot, 0, -legH / 2, 0); add(lg, Bx(0.4, 0.14, 0.46), shoe, 0, -legH + 0.07, 0.03); u[side < 0 ? 'legL' : 'legR'] = lg; }
  const body = new T3.Group(); body.position.y = legH; g.add(body); u.body = body;
  add(body, Bx(0.82, torH, 0.44), top, 0, torH / 2, 0);
  if (o.dress) add(body, Cy(0.42, 0.62, 0.7, 12), top, 0, -0.1, 0);
  for (const side of [-1, 1]) { const ar = new T3.Group(); ar.position.set(0.6 * side, torH - 0.06, 0); body.add(ar); add(ar, Bx(0.34, torH * 0.55, 0.38), top, 0, -torH * 0.27, 0); add(ar, Bx(0.32, torH * 0.42, 0.36), o.sleeve === false ? skin : skin, 0, -torH * 0.75, 0); u[side < 0 ? 'armL' : 'armR'] = ar; }
  const head = new T3.Group(); head.position.y = torH + 0.32; body.add(head); u.head = head;
  const hs = o.big ? 1.35 : 1; head.scale.setScalar(hs);
  add(head, Bx(0.6, 0.6, 0.56), skin, 0, 0, 0);
  u.face = add(head, new T3.PlaneGeometry(0.54, 0.54), new T3.MeshBasicMaterial({ map: FACE[u.faceK], transparent: true, depthWrite: false }), 0, -0.02, 0.282, false);
  const st = o.style || 'short';
  if (st !== 'bald' && st !== 'none') { add(head, Bx(0.64, 0.14, 0.6), hairM, 0, 0.31, 0); add(head, Bx(0.64, 0.42, 0.1), hairM, 0, 0.12, -0.27); add(head, Bx(0.08, 0.3, 0.5), hairM, -0.3, 0.16, -0.02); add(head, Bx(0.08, 0.3, 0.5), hairM, 0.3, 0.16, -0.02); add(head, Bx(0.6, 0.1, 0.12), hairM, 0, 0.26, 0.24); }
  if (st === 'long') { add(head, Bx(0.68, 0.8, 0.12), hairM, 0, -0.18, -0.28); add(head, Bx(0.08, 0.6, 0.3), hairM, -0.33, -0.12, -0.12); add(head, Bx(0.08, 0.6, 0.3), hairM, 0.33, -0.12, -0.12); }
  if (st === 'spiky') for (let i = 0; i < 5; i++) { const m = add(head, Bx(0.16, 0.2, 0.16), hairM, -0.24 + i * 0.12, 0.42, -0.05 + (i % 2) * 0.1); m.rotation.z = (i - 2) * 0.25; }
  if (st === 'bun') add(head, Sp(0.16, 8, 6), hairM, 0, 0.4, -0.2);
  if (st === 'bald') { add(head, Bx(0.08, 0.22, 0.42), hairM, -0.31, 0.04, -0.04); add(head, Bx(0.08, 0.22, 0.42), hairM, 0.31, 0.04, -0.04); add(head, Bx(0.6, 0.22, 0.08), hairM, 0, 0.04, -0.28); }
  const ex = o.extras || [];
  if (ex.includes('glasses')) { const gm = BM('#151515'); for (const x of [-0.13, 0.13]) { add(head, Bx(0.2, 0.03, 0.02), gm, x, 0.1, 0.3, false); add(head, Bx(0.2, 0.03, 0.02), gm, x, -0.06, 0.3, false); add(head, Bx(0.03, 0.18, 0.02), gm, x - 0.1, 0.02, 0.3, false); add(head, Bx(0.03, 0.18, 0.02), gm, x + 0.1, 0.02, 0.3, false); } add(head, Bx(0.08, 0.03, 0.02), gm, 0, 0.06, 0.3, false); }
  if (ex.includes('tie')) add(body, Bx(0.12, torH * 0.7, 0.04), SM('#c0392b'), 0, torH * 0.6, 0.23);
  if (ex.includes('chef')) { add(head, Cy(0.3, 0.28, 0.34, 12), SM('#fafafa'), 0, 0.48, 0); add(head, Sp(0.36, 12, 8), SM('#fafafa'), 0, 0.72, 0).scale.y = 0.6; add(body, Bx(0.7, torH * 0.9, 0.04), SM('#ffffff'), 0, torH * 0.45, 0.23); }
  if (ex.includes('cap')) { const cm = SM(o.capCol || '#1d3f8a'); add(head, Cy(0.34, 0.34, 0.16, 12), cm, 0, 0.36, 0); add(head, Bx(0.5, 0.04, 0.24), SM('#111'), 0, 0.3, 0.36); }
  if (ex.includes('helmet')) { const cm = SM('#6a2ca0', { roughness: 0.3 }); add(head, new T3.SphereGeometry(0.42, 14, 8, 0, 2 * PI, 0, 1.7), cm, 0, 0.12, -0.02).scale.set(1, 0.95, 1); add(head, Bx(0.62, 0.16, 0.04), BM('#222'), 0, 0.12, 0.33, false); }
  if (ex.includes('veil')) { const vm = SM('#ffffff', { transparent: true, opacity: 0.7, side: T3.DoubleSide }); const v = add(head, new T3.PlaneGeometry(0.95, 1.3), vm, 0, -0.2, -0.33, false); v.rotation.x = 0.15; for (const sx of [-1, 1]) { const sv = add(head, new T3.PlaneGeometry(0.5, 1.1), vm, sx * 0.36, -0.15, -0.08, false); sv.rotation.y = PI / 2; } for (let i = 0; i < 7; i++) add(head, Sp(0.07, 6, 5), SM(['#ff9ff3', '#ffffff', '#feca57'][i % 3]), -0.3 + i * 0.1, 0.36, 0.2 - Math.abs(i - 3) * 0.04, false); }
  if (ex.includes('sash')) { const m = add(body, Bx(0.12, 1.0, 0.46), SM('#d4af37', { metalness: 0.4, roughness: 0.4 }), 0, torH * 0.5, 0); m.rotation.z = 0.7; }
  if (ex.includes('mustache')) add(head, Bx(0.32, 0.07, 0.04), hairM, 0, -0.1, 0.3, false);
  if (ex.includes('coat')) { add(body, Bx(0.88, torH * 1.3, 0.48), top, 0, torH * 0.38, 0); }
  if (ex.includes('bag')) { add(body, Bx(0.4, 0.4, 0.2), SM('#7a5230'), 0.45, torH * 0.25, 0.1); }
  if (ex.includes('beard')) add(head, Bx(0.6, 0.18, 0.06), hairM, 0, -0.24, 0.29, false);
  PEOPLE.push(g); return g;
}
function setFace(p, k) { const u = p.userData; if (u.curF !== k) { u.face.material.map = FACE[k]; u.curF = k; } }
function rest(p) { const u = p.userData; u.legL.rotation.set(0, 0, 0); u.legR.rotation.set(0, 0, 0); u.armL.rotation.set(0, 0, 0); u.armR.rotation.set(0, 0, 0); u.body.rotation.set(0, 0, 0); u.body.position.y = u.legH; u.head.rotation.set(0, 0, 0); setFace(p, u.faceK); }
function walk(p, ph, amp = 0.6) { const u = p.userData; u.legL.rotation.x = S(ph) * amp; u.legR.rotation.x = -S(ph) * amp; u.armL.rotation.x = -S(ph) * amp * 0.8; u.armR.rotation.x = S(ph) * amp * 0.8; u.body.position.y = u.legH + Math.abs(S(ph)) * 0.05; }
function sitP(p) { const u = p.userData; u.legL.rotation.x = -PI / 2; u.legR.rotation.x = -PI / 2; }
function mouth(p, ci, T, base) { setFace(p, talking(ci, T) && S(T * 24) > -0.3 ? 'talk' : base); }
// name tag sprite above a head
function tag(p, text, col = '#ffffff', bg = 'rgba(10,10,20,0.78)') { const t = ctex(640, 144, (g) => { g.scale(2, 2); g.font = '40px Russo'; const w = Math.min(316, g.measureText(text).width + 40); g.fillStyle = bg; g.beginPath(); g.roundRect(160 - w / 2, 8, w, 56, 28); g.fill(); g.fillStyle = col; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, 160, 38); });
  const sp = new T3.Sprite(new T3.SpriteMaterial({ map: t, transparent: true, depthTest: true, depthWrite: false })); const ps = p.scale.x; sp.scale.set(2.2 / ps, 0.495 / ps, 1); sp.position.y = (p.userData.legH + (p.userData.o.kid ? 0.72 : 0.86)) + (p.userData.o.big ? 1.25 : 1.0); sp.renderOrder = 10; p.add(sp); p.userData.tag = sp; return sp; }

// ---------- sets ----------
const BK = [60, 0, -30], BR = [100, 0, 0], KT = [100, 0, 30], CR = [130, 0, 0], BS = [130, 0, 30], WD = [60, 0, 30], MR = [0, 0, -200], ST = [40, 0, -200], FB = [0, 0, 200];
const R = {}; const WINM = []; const ORBS = [];
const COLS = ['#e74c3c', '#f39c12', '#27ae60', '#8e44ad', '#16a085', '#d35400', '#2980b9', '#c0392b', '#f1c40f', '#1abc9c', '#e84393', '#6c5ce7'];
const SKINS = ['#f2c79b', '#e0a878', '#c68a5a', '#8d5a3a', '#ffd9b8', '#a8714a'];
const HAIRS = ['#2b1a10', '#5a3a1a', '#d9b45a', '#1a1a1a', '#a0522d', '#7a7a7a'];
function grp(at) { const g = new T3.Group(); g.position.set(at[0], at[1], at[2]); scene.add(g); return g; }
function townie(i, extra = {}) { const r = rng(100 + i); return person(Object.assign({ skin: SKINS[i % SKINS.length], top: COLS[i % COLS.length], bot: ['#2e3d66', '#3b3b3b', '#5a4632', '#24324a'][i % 4], hair: HAIRS[(i * 3) % HAIRS.length], style: ['short', 'long', 'spiky', 'bun', 'short'][i % 5], face: ['smile', 'grin', 'smile', 'neutral'][i % 4] }, extra)); }
function place(p, g, x, z, ry = 0) { p.position.set(x, 0, z); p.rotation.y = ry; g.add(p); return p; }
function tree(g, x, z, s = 1) { const t = new T3.Group(); t.position.set(x, 0, z); t.scale.setScalar(s); g.add(t); add(t, Bx(0.5, 2, 0.5), SM('#7a5230'), 0, 1, 0); const lm = SM('#3fa34d'); add(t, Bx(2.4, 1.6, 2.4), lm, 0, 2.6, 0); add(t, Bx(1.6, 1.0, 1.6), SM('#4cbf5a'), 0, 3.8, 0); return t; }
function house(g, x, z, ry, wall, roof, door = '#7a4a2a') { const h = new T3.Group(); h.position.set(x, 0, z); h.rotation.y = ry; g.add(h);
  add(h, Bx(6, 4.4, 6), SM(wall), 0, 2.2, 0); const rf = add(h, new T3.ConeGeometry(4.6, 2.6, 4), SM(roof), 0, 5.7, 0); rf.rotation.y = PI / 4;
  add(h, Bx(1.2, 2.2, 0.12), SM(door), 0, 1.1, 3.02); add(h, Bx(0.6, 0.6, 1.0), SM('#9a9a9a'), 1.9, 5.4, -1).position.y = 5.6;
  for (const wx of [-1.9, 1.9]) { const wm = SM('#9fd3ff', { emissive: '#ffcf6a', emissiveIntensity: 0 }); WINM.push(wm); add(h, Bx(1.1, 1.1, 0.1), wm, wx, 2.6, 3.02); add(h, Bx(1.3, 0.12, 0.16), SM('#ffffff'), wx, 2.0, 3.04); }
  return h; }
function texCanvas(w, h, f, rep) { const t = ctex(w, h, f); if (rep) { t.wrapS = t.wrapT = T3.RepeatWrapping; t.repeat.set(rep[0], rep[1]); } return t; }
function wallSet(g, w, h, d, col, floorCol, opts = {}) { add(g, Bx(w, 0.1, d), SM(floorCol), 0, 0.05, 0); add(g, Bx(w, h, 0.2), SM(col), 0, h / 2, -d / 2); add(g, Bx(0.2, h, d), SM(col), -w / 2, h / 2, 0); add(g, Bx(0.2, h, d), SM(col), w / 2, h / 2, 0); if (opts.ceil) add(g, Bx(w, 0.1, d), SM(opts.ceil), 0, h, 0); }
function clockFace(r, mirror = false, back = false, mpos = false) { return ctex(256, 256, (g) => { g.fillStyle = back ? 'rgba(255,240,200,0.9)' : '#fbf6ea'; g.beginPath(); g.arc(128, 128, 124, 0, 7); g.fill(); g.strokeStyle = '#3a2a1a'; g.lineWidth = 8; g.stroke(); g.fillStyle = '#3a2a1a'; g.font = '30px Russo'; g.textAlign = 'center'; g.textBaseline = 'middle';
  if (mirror) { g.translate(256, 0); g.scale(-1, 1); } for (let i = 1; i <= 12; i++) { const a = i / 12 * 2 * PI; const b_ = mpos ? a - PI / 2 : a; g.fillText(['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'][i - 1], 128 + S(b_) * 96, 128 - C(b_) * 96); } }); }

function build() {
  // lights
  hemi = new T3.HemisphereLight('#cfe9ff', '#7a9a5a', 1.2); scene.add(hemi); amb = new T3.AmbientLight('#ffffff', 0.25); scene.add(amb);
  sun = new T3.DirectionalLight('#fff4e0', 2.6); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); const sc = sun.shadow.camera; sc.left = -22; sc.right = 22; sc.top = 22; sc.bottom = -22; sc.near = 1; sc.far = 120; sun.shadow.bias = -0.0005; sun.shadow.normalBias = 0.03; scene.add(sun); scene.add(sun.target);
  // ground
  add(scene, Bx(1200, 0.2, 1200), SM('#6cbf4a'), 0, -0.1, 0, false);

  // ===== TOWN =====
  const TW = grp([0, 0, 0]); R.town = TW;
  const tiles = texCanvas(128, 128, (g) => { g.fillStyle = '#e3dccd'; g.fillRect(0, 0, 128, 128); g.strokeStyle = '#c9c0ad'; g.lineWidth = 3; for (let i = 0; i <= 128; i += 32) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 128); g.stroke(); g.beginPath(); g.moveTo(0, i); g.lineTo(128, i); g.stroke(); } }, [8, 8]);
  add(TW, Cy(12, 12, 0.08, 48), SM('#ffffff', { map: tiles }), 0, 0.04, 0);
  add(TW, Bx(120, 0.06, 6), SM('#55585e'), 0, 0.03, 17); for (let x = -58; x < 60; x += 4) add(TW, Bx(1.6, 0.07, 0.2), BM('#f2f2f2'), x, 0.04, 17, false);
  add(TW, Bx(6, 0.06, 60), SM('#55585e'), 0, 0.03, 50);
  // fountain
  add(TW, Cy(2.2, 2.4, 0.7, 24), SM('#cfc6b4'), 5.5, 0.35, 5); add(TW, Cy(1.9, 1.9, 0.1, 24), SM('#5ab4e6', { roughness: 0.2 }), 5.5, 0.68, 5); add(TW, Cy(0.3, 0.4, 1.6, 10), SM('#cfc6b4'), 5.5, 1.2, 5);
  // clock tower
  const TO = new T3.Group(); TO.position.set(0, 0, -6); TW.add(TO); R.tower = TO;
  const cream = SM('#efe2c4'), trim = SM('#b8946a');
  add(TO, Bx(5, 12, 5), cream, 0, 6, 0); for (const y of [0.3, 4.5, 12]) add(TO, Bx(5.4, 0.5, 5.4), trim, 0, y, 0);
  add(TO, Bx(4.4, 3.2, 4.4), cream, 0, 13.8, 0); add(TO, Bx(4.8, 0.4, 4.8), trim, 0, 15.5, 0); const rf = add(TO, new T3.ConeGeometry(3.7, 4.4, 4), SM('#2f7f86'), 0, 17.9, 0); rf.rotation.y = PI / 4;
  add(TO, Cy(0.08, 0.08, 1.4, 6), SM('#d4af37', { metalness: 0.6, roughness: 0.3 }), 0, 20.6, 0);
  const cf = add(TO, Cy(1.8, 1.8, 0.2, 40), [SM('#3a2a1a'), new T3.MeshStandardMaterial({ map: clockFace(1.8, false, false, true), roughness: 0.6 }), SM('#3a2a1a')], 0, 9.2, 2.55); cf.rotation.x = PI / 2;
  add(TO, new T3.TorusGeometry(1.85, 0.12, 8, 40), trim, 0, 9.2, 2.6);
  R.hH = new T3.Group(); R.hH.position.set(0, 9.2, 2.7); TO.add(R.hH); add(R.hH, Bx(0.16, 0.95, 0.05), SM('#1a1a1a'), 0, 0.42, 0);
  R.hM = new T3.Group(); R.hM.position.set(0, 9.2, 2.74); TO.add(R.hM); add(R.hM, Bx(0.1, 1.45, 0.05), SM('#1a1a1a'), 0, 0.66, 0);
  R.tDoor = new T3.Group(); R.tDoor.position.set(-0.9, 0, 2.56); TO.add(R.tDoor); add(R.tDoor, Bx(1.8, 3.0, 0.15), SM('#6b3f22'), 0.9, 1.5, 0); add(R.tDoor, Bx(0.12, 0.12, 0.12), SM('#d4af37'), 1.5, 1.5, 0.12);
  add(TO, Bx(2.2, 3.4, 0.1), SM('#2a1a10'), 0, 1.6, 2.52);
  for (const x of [-1.4, 1.4]) { const wm = SM('#3a4a5a', { emissive: '#ffcf6a', emissiveIntensity: 0 }); WINM.push(wm); add(TO, Bx(0.7, 1.4, 0.1), wm, x, 6.6, 2.52); }
  R.towerGlow = glow(TO, '#7fe8ff', 6, 0, 13.8, 2.3, 0);
  // houses + trees + lamps
  const HS = [[-21, -2, PI / 2, '#ffd6a5', '#c0392b'], [21, -2, -PI / 2, '#caffbf', '#2c3e50'], [-15, -19, PI / 4, '#a0c4ff', '#8e44ad'], [15, -19, -PI / 4, '#ffadad', '#16a085'], [-26, 26, PI, '#fdffb6', '#d35400'], [-13, 26, PI, '#bdb2ff', '#c0392b'], [13, 26, PI, '#ffc6ff', '#2c3e50'], [26, 26, PI, '#9bf6ff', '#8e44ad'], [-30, 9, PI / 2, '#ffd6a5', '#16a085'], [30, 9, -PI / 2, '#a0c4ff', '#d35400'], [-28, -14, PI / 2, '#caffbf', '#c0392b'], [28, -14, -PI / 2, '#fdffb6', '#2c3e50']];
  R.houses = HS.map(h => house(TW, h[0], h[1], h[2], h[3], h[4]));
  [[-9, -12], [9, -12], [-17, 8], [17, 8], [-7, 22], [7, 22], [-34, 0], [34, 0], [-20, -28], [20, -28], [0, -26], [-38, 20], [38, 20]].forEach(([x, z], i) => tree(TW, x, z, 0.9 + (i % 3) * 0.15));
  for (let i = 0; i < 8; i++) { const a = i / 8 * 2 * PI + 0.2; const x = S(a) * 11.5, z = C(a) * 11.5; if (Math.abs(x) < 2 && z < 0) continue; add(TW, Cy(0.08, 0.1, 3, 6), SM('#2a2a2a'), x, 1.5, z); const lm = SM('#fff6d0', { emissive: '#ffd27a', emissiveIntensity: 0 }); WINM.push(lm); add(TW, Bx(0.4, 0.5, 0.4), lm, x, 3.2, z); }
  // benches
  for (const [x, z, r] of [[-7, 3, 0.5], [-4, 8, 0.2], [8, -2, -0.6]]) { const b = new T3.Group(); b.position.set(x, 0, z); b.rotation.y = r; TW.add(b); add(b, Bx(2, 0.12, 0.6), SM('#8a5a32'), 0, 0.55, 0); add(b, Bx(2, 0.5, 0.1), SM('#8a5a32'), 0, 0.85, -0.28); add(b, Bx(0.1, 0.55, 0.5), SM('#333'), -0.9, 0.27, 0); add(b, Bx(0.1, 0.55, 0.5), SM('#333'), 0.9, 0.27, 0); }
  // podium
  R.podium = new T3.Group(); R.podium.position.set(-3, 0, 6); TW.add(R.podium); add(R.podium, Bx(1.6, 1.3, 1.0), SM('#2c5aa0'), 0, 0.65, 0); add(R.podium, Bx(1.7, 0.1, 1.1), SM('#d4af37'), 0, 1.32, 0); add(R.podium, Bx(1.4, 0.5, 0.05), BM('#ffffff', { map: ctex(256, 96, g => { g.fillStyle = '#2c5aa0'; g.fillRect(0, 0, 256, 96); g.fillStyle = '#ffd34a'; g.font = '44px Russo'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('MAYOR', 128, 50); }) }), 0, 0.85, 0.52, false);
  // townsfolk
  R.folk = []; const FP = [[-5, 1], [-2.5, 3.5], [2, 2.5], [-6.5, -1.5], [6.5, 0], [-1, 7], [3, 8.5], [-8, 6], [8, 7.5], [-3.5, -2], [4, -3], [2.5, 10.5]];
  FP.forEach(([x, z], i) => { const p = townie(i); place(p, TW, x, z, Math.atan2(-x, 6 - z) + 0.4 * S(i)); R.folk.push(p); });
  const TAGS = ['DAD', 'MUM', 'BAKER', 'TEACHER', 'POSTMAN', 'GRANDMA', 'LEO', 'MAYOR', 'BABY', 'VET', 'NAN', 'BOB'];
  R.folk.forEach((p, i) => tag(p, TAGS[i], '#ffffff'));
  R.hale = person({ skin: '#e8b88f', top: '#6b4a2e', bot: '#3a2e24', hair: '#e8e8e8', style: 'bald', extras: ['mustache', 'coat'], face: 'neutral' }); place(R.hale, TW, 0, -2.4, 0); tag(R.hale, 'MR. HALE', '#ffd34a'); R.haleRing = glow(TW, '#ffd34a', 4, 0, 1.6, -2.4, 0);
  R.mayor = person({ s: 0.62, kid: true, big: true, skin: '#ffd9b8', top: '#e84393', bot: '#e84393', dress: true, hair: '#d9b45a', style: 'long', extras: ['sash'], face: 'neutral' }); place(R.mayor, TW, -3, 6.9, 0); R.mayor.position.y = 0; tag(R.mayor, 'MAYOR', '#ffd34a');
  R.patrol = [0, 1].map(i => { const p = person({ skin: SKINS[i + 2], top: '#5b2c8a', bot: '#2a1a3a', style: 'none', extras: ['helmet'], face: 'angry' }); place(p, TW, 0, 0, 0); return p; });
  R.leoT = person({ s: 0.78, kid: true, skin: '#ffd9b8', top: '#d63031', bot: '#2d3436', hair: '#e0b44a', style: 'spiky', face: 'shock' }); place(R.leoT, TW, 0, 0, 0); tag(R.leoT, 'LEO', '#ffb0a0');
  R.meT = person({ s: 0.78, kid: true, skin: '#e0a878', top: '#2a6fdb', bot: '#2d3436', hair: '#3a2410', style: 'short', face: 'neutral' }); place(R.meT, TW, 0, 0, 0); tag(R.meT, 'ME', '#9ad0ff');
  // swap orbs
  for (let i = 0; i < 12; i++) { const col = ['#19c3ff', '#ff4fd8', '#ffb300'][i % 3]; const o = glow(TW, col, 1.5, 0, -50, 0, 0); o.material.blending = T3.NormalBlending; o.userData.core = glow(TW, '#ffffff', 0.5, 0, -50, 0, 0); o.userData.trail = [0, 1, 2, 3].map(j => { const t_ = glow(TW, col, 1.1 - j * 0.2, 0, -50, 0, 0); t_.material.blending = T3.NormalBlending; return t_; }); ORBS.push(o); }
  // night wire network from the tower to every house
  R.net = new T3.Group(); TW.add(R.net); const nm = new T3.LineBasicMaterial({ color: '#7fe8ff', transparent: true, opacity: 0.9, blending: T3.AdditiveBlending });
  R.houses.forEach(h => { const a = new T3.Vector3(0, 14, -6), b = h.position.clone().setY(5.2), m = a.clone().lerp(b, 0.5).setY(16); const cv = new T3.QuadraticBezierCurve3(a, m, b); R.net.add(new T3.Line(new T3.BufferGeometry().setFromPoints(cv.getPoints(30)), nm)); });
  R.net.visible = false;

  // ===== BAKERY =====
  const BKG = grp(BK); R.bakery = BKG;
  wallSet(BKG, 9, 5, 7, '#ffd1dc', '#c99a6a');
  const shelf = SM('#a0703a'); for (const y of [1.6, 2.6, 3.6]) { add(BKG, Bx(7, 0.12, 0.6), shelf, 0, y, -3.1); for (let x = -3.2; x < 3.4; x += 0.7) add(BKG, Sp(0.28, 10, 8), SM('#d89a4a'), x, y + 0.24, -3.1).scale.set(1.2, 0.8, 0.8); }
  add(BKG, Bx(5.4, 0.9, 1.0), SM('#ffffff', { map: ctex(256, 64, g => { g.fillStyle = '#ff6f91'; g.fillRect(0, 0, 256, 64); g.fillStyle = '#fff'; g.font = '42px Russo'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('BAKERY', 128, 34); }) }), 0, 4.4, -3.25);
  add(BKG, Bx(6, 1.1, 1.2), SM('#ffffff'), 0, 0.55, 1.2); add(BKG, Bx(6.2, 0.12, 1.4), SM('#8a5a32'), 0, 1.14, 1.2);
  R.crois = new T3.Group(); R.crois.position.set(0, 1.2, 1.2); BKG.add(R.crois); const cm = SM('#e8a33a', { roughness: 0.55 }); const cg = new T3.TorusGeometry(0.17, 0.12, 7, 10, PI * 1.1); const rc = rng(5);
  for (let i = 0; i < 160; i++) { const lvl = Math.floor(Math.sqrt(i) * 0.75); const a = rc() * 2 * PI, r = (2.4 - lvl * 0.3) * Math.sqrt(rc()); const m = add(R.crois, cg, cm, C(a) * r * 1.1, lvl * 0.15 + 0.08, S(a) * r * 0.35); m.rotation.set(PI / 2 + (rc() - 0.5), rc() * 6, 0); m.userData.i = i; }
  R.bakerDad = person({ skin: '#c68a5a', top: '#ffffff', bot: '#ffffff', hair: '#2b1a10', style: 'short', extras: ['chef'], face: 'grin' }); place(R.bakerDad, BKG, 0.4, -0.2, 0); tag(R.bakerDad, 'DAD', '#ffffff');
  R.toast = new T3.Group(); R.toast.position.set(0, 1.25, 0.3); BKG.add(R.toast); add(R.toast, Bx(0.55, 0.6, 0.08), SM('#1a1410', { roughness: 1 }), 0, 0, 0); R.smoke = []; for (let i = 0; i < 8; i++) R.smoke.push(add(R.toast, Sp(0.18, 8, 6), SM('#555555', { transparent: true, opacity: 0.6 }), 0, 0.5, 0, false));
  R.toaster = add(BKG, Bx(0.9, 0.6, 0.5), SM('#c0c6cc', { metalness: 0.6, roughness: 0.3 }), -2.2, 1.5, 1.2);

  // ===== BEDROOM =====
  const BRG = grp(BR); R.bedroom = BRG; wallSet(BRG, 7, 4, 6, '#b5e3ff', '#d9b58a');
  R.bwin = add(BRG, Bx(1.8, 1.5, 0.1), SM('#bfe6ff', { emissive: '#ffffff', emissiveIntensity: 0.6 }), 1.6, 2.4, -2.9); add(BRG, Bx(2.0, 0.12, 0.2), SM('#fff'), 1.6, 1.6, -2.85);
  add(BRG, Bx(2.4, 0.5, 3.6), SM('#8a5a32'), -1.4, 0.35, -1.1); add(BRG, Bx(2.2, 0.3, 3.4), SM('#ffffff'), -1.4, 0.75, -1.1); R.blanket = add(BRG, Bx(2.3, 0.18, 2.2), SM('#ff7675'), -1.4, 0.95, -0.4); add(BRG, Bx(1.2, 0.25, 0.6), SM('#ffffff'), -1.4, 1.0, -2.5); add(BRG, Bx(2.4, 1.4, 0.2), SM('#8a5a32'), -1.4, 0.9, -2.95);
  add(BRG, Bx(0.8, 0.8, 0.7), SM('#a0703a'), 0.6, 0.4, -2.4);
  R.alarmTex = ctex(128, 64, g => { g.fillStyle = '#111'; g.fillRect(0, 0, 128, 64); g.fillStyle = '#ff3b30'; g.font = '40px Russo'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('7.00', 64, 34); });
  R.alarm = new T3.Group(); R.alarm.position.set(0.6, 1.0, -2.3); BRG.add(R.alarm); add(R.alarm, Bx(0.5, 0.3, 0.2), SM('#e74c3c'), 0, 0, 0); add(R.alarm, new T3.PlaneGeometry(0.42, 0.21), BM('#ffffff', { map: R.alarmTex }), 0, 0, 0.101, false);
  R.youGran = person({ skin: '#ffd9b8', top: '#c39bd3', bot: '#6c5ce7', hair: '#dddddd', style: 'bun', extras: ['glasses'], face: 'sleep' }); place(R.youGran, BRG, -1.4, -1.6, 0); tag(R.youGran, 'YOU', '#9ad0ff');
  R.meDad = person({ skin: '#c68a5a', top: '#27ae60', bot: '#2e3d66', hair: '#2b1a10', style: 'short', extras: ['beard'], face: 'tired' }); place(R.meDad, BRG, -1.4, -1.6, 0); tag(R.meDad, 'ME', '#9ad0ff');

  // ===== KITCHEN =====
  const KTG = grp(KT); R.kitchen = KTG; wallSet(KTG, 8, 4, 6, '#fff3b0', '#ffffff');
  const kc = SM('#5dade2'); add(KTG, Bx(5, 1.0, 0.8), kc, -1, 0.5, -2.6); add(KTG, Bx(5, 0.1, 0.9), SM('#ecf0f1'), -1, 1.05, -2.6); add(KTG, Bx(1.2, 2.6, 0.9), SM('#ecf0f1'), 3, 1.3, -2.5); add(KTG, Bx(5, 0.8, 0.5), kc, -1, 3.0, -2.75);
  add(KTG, Cy(1.0, 1.0, 0.1, 16), SM('#a0703a'), 0.5, 1.0, 0); add(KTG, Cy(0.12, 0.12, 1.0, 8), SM('#a0703a'), 0.5, 0.5, 0);
  R.mumBig = person({ s: 1.12, skin: '#e0a878', top: '#e67e22', bot: '#2e3d66', hair: '#3a2410', style: 'short', extras: ['beard'], face: 'neutral' }); place(R.mumBig, KTG, -0.6, -1.0, 0); tag(R.mumBig, 'MUM', '#ffb6e1');
  R.kDad = person({ skin: '#c68a5a', top: '#27ae60', bot: '#2e3d66', hair: '#2b1a10', style: 'short', extras: ['beard'], face: 'smile' }); place(R.kDad, KTG, -0.6, -1.0, 0.4); tag(R.kDad, 'DAD', '#ffffff');
  R.kMe = person({ s: 0.78, kid: true, skin: '#e0a878', top: '#2a6fdb', bot: '#2d3436', hair: '#3a2410', style: 'short', face: 'smile' }); place(R.kMe, KTG, 0.2, -0.4, -0.9); tag(R.kMe, 'ME', '#9ad0ff');

  // ===== CLASSROOM =====
  const CRG = grp(CR); R.class = CRG; wallSet(CRG, 10, 4.4, 8, '#d1f2eb', '#c99a6a');
  add(CRG, Bx(6, 2.2, 0.1), SM('#ffffff', { map: ctex(512, 192, g => { g.fillStyle = '#2d5a3d'; g.fillRect(0, 0, 512, 192); g.strokeStyle = '#8a5a32'; g.lineWidth = 14; g.strokeRect(0, 0, 512, 192); g.fillStyle = '#f4f4f4'; g.font = '52px Russo'; g.textAlign = 'center'; g.fillText('HOMEWORK', 256, 80); g.font = '38px Russo'; g.fillText('PAGE 40 TO 95', 256, 140); }) }), 0, 2.5, -3.85);
  add(CRG, Bx(2.6, 1.0, 1.2), SM('#a0703a'), 0, 0.5, -2.2);
  R.babyT = person({ s: 0.48, kid: true, big: true, skin: '#ffd9b8', top: '#ffffff', bot: '#ffffff', hair: '#d9b45a', style: 'none', extras: ['glasses', 'tie'], face: 'baby' }); place(R.babyT, CRG, 0, -2.2, 0); R.babyT.position.y = 1.0; tag(R.babyT, 'TEACHER', '#ffffff');
  R.kids = []; [[-3.0, 0.6], [3.0, 0.6], [-1.8, 2.8], [1.8, 2.8]].forEach(([x, z], i) => { add(CRG, Bx(1.2, 0.7, 0.8), SM('#e1b382'), x, 0.75, z - 0.6); add(CRG, Bx(1.25, 0.06, 0.85), SM('#a0703a'), x, 1.1, z - 0.6); const k = townie(20 + i, { s: 0.78, kid: true }); place(k, CRG, x, z, PI); sitP(k); k.position.y = -0.25; R.kids.push(k); });

  // ===== WEDDING =====
  const WDG = grp(WD); R.wed = WDG; add(WDG, Bx(1.6, 0.04, 14), SM('#c0392b'), 0, 0.03, 3);
  const arch = new T3.Group(); arch.position.set(0, 0, -2); WDG.add(arch); add(arch, Cy(0.12, 0.12, 3.2, 8), SM('#ffffff'), -1.8, 1.6, 0); add(arch, Cy(0.12, 0.12, 3.2, 8), SM('#ffffff'), 1.8, 1.6, 0); const at = add(arch, new T3.TorusGeometry(1.8, 0.14, 8, 24, PI), SM('#ffffff'), 0, 3.2, 0);
  const fr = rng(8); for (let i = 0; i < 26; i++) { const a = i / 25 * PI; add(arch, Sp(0.22, 8, 6), SM(['#ff9ff3', '#ffffff', '#feca57'][i % 3]), C(a) * 1.8 + (fr() - 0.5) * 0.2, 3.2 + S(a) * 1.8, (fr() - 0.5) * 0.3); }
  tree(WDG, -6, -5, 1.2); tree(WDG, 6, -6, 1.1); house(WDG, 0, -14, 0, '#ffffff', '#c0392b');
  for (let r = 0; r < 3; r++) for (const sd of [-1, 1]) for (let c = 0; c < 2; c++) { const x = sd * (1.6 + c * 1.1), z = 3 + r * 1.6; add(WDG, Bx(0.8, 0.5, 0.7), SM('#ffffff'), x, 0.5, z); if ((r + c) % 2 === 0) { const g_ = townie(40 + r * 4 + c + (sd > 0 ? 2 : 0)); place(g_, WDG, x, z - 0.1, PI); sitP(g_); g_.position.y = -0.15; } }
  R.bride = person({ skin: '#ffd9b8', top: '#ffffff', bot: '#ffffff', dress: true, hair: '#a0522d', style: 'long', extras: ['veil'], face: 'grin' }); place(R.bride, WDG, 0.7, -1.2, -0.3); tag(R.bride, 'WIFE', '#ffb6e1');
  R.groom = person({ skin: '#e0a878', top: '#222222', bot: '#222222', hair: '#2b1a10', style: 'short', extras: ['tie'], face: 'grin' }); place(R.groom, WDG, -0.7, -1.2, 0.3); tag(R.groom, 'HUSBAND', '#ffffff');
  R.postBride = person({ skin: '#a8714a', top: '#1d3f8a', bot: '#1d3f8a', hair: '#1a1a1a', style: 'short', extras: ['veil', 'bag', 'mustache'], face: 'grin' }); place(R.postBride, WDG, 0.7, -1.2, -0.3); tag(R.postBride, 'WIFE', '#ffb6e1');

  // ===== BASEMENT =====
  const BSG = grp(BS); R.base = BSG; wallSet(BSG, 7, 3.4, 6, '#6b6f75', '#4a4d52', { ceil: '#55585e' });
  for (const [x, z, s] of [[-2.4, -2, 1], [-1.6, -2.2, 0.7], [2.4, -1.8, 1.1], [2.6, -0.6, 0.6]]) add(BSG, Bx(s, s, s), SM('#9a7a4a'), x, s / 2, z);
  add(BSG, Bx(0.9, 0.7, 0.9), SM('#9a7a4a'), 0, 0.35, -0.6);
  R.bulb = add(BSG, Sp(0.12, 10, 8), BM('#fff2b0'), 0.6, 2.7, 0.2, false); add(BSG, Cy(0.01, 0.01, 0.7, 4), BM('#222'), 0.6, 3.05, 0.2, false); R.bulbL = new T3.PointLight('#ffcf80', 0, 9, 1.6); R.bulbL.position.set(0.6, 2.6, 0.2); BSG.add(R.bulbL); R.bulbG = glow(BSG, '#ffcf80', 1.6, 0.6, 2.7, 0.2, 0.5);
  R.leoB = person({ s: 0.78, kid: true, skin: '#ffd9b8', top: '#d63031', bot: '#2d3436', hair: '#e0b44a', style: 'spiky', face: 'wide' }); place(R.leoB, BSG, 0, -0.6, 0); sitP(R.leoB); R.leoB.position.y = 0.3; tag(R.leoB, 'LEO', '#ffb0a0');
  R.bOrb = glow(BSG, '#7fe8ff', 1.4, 0, -50, 0, 0);

  // ===== STAIRS =====
  const STG = grp(ST); R.stairs = STG; add(STG, Cy(3.4, 3.4, 30, 20, 1, true), SM('#8a7a66', { side: T3.BackSide }), 0, 15, 0);
  for (let i = 0; i < 70; i++) { const a = i * 0.32, y = i * 0.32; const st = add(STG, Bx(2.2, 0.16, 0.8), SM('#a08a6a'), C(a) * 2.2, y, S(a) * 2.2); st.rotation.y = -a; }
  add(STG, Cy(0.5, 0.5, 30, 10), SM('#a08a6a'), 0, 15, 0);
  for (let i = 0; i < 5; i++) { const sl = add(STG, Bx(0.3, 1.2, 0.2), BM('#9fc4ff'), C(i * 1.7) * 3.35, 3 + i * 4.5, S(i * 1.7) * 3.35, false); sl.lookAt(ST[0], 3 + i * 4.5, ST[2]); }
  R.meS = person({ s: 0.78, kid: true, skin: '#e0a878', top: '#2a6fdb', bot: '#2d3436', hair: '#3a2410', style: 'short', face: 'neutral' }); STG.add(R.meS); tag(R.meS, 'ME', '#9ad0ff');
  R.stairL = new T3.PointLight('#9fc4ff', 0, 14, 1.5); STG.add(R.stairL);

  // ===== MACHINE ROOM (inside the clock face) =====
  const MRG = grp(MR); R.mach = MRG; wallSet(MRG, 14, 9, 12, '#5a4636', '#4a3628', { ceil: '#3a2a1e' });
  R.backFace = add(MRG, Cy(3.6, 3.6, 0.1, 48), [SM('#3a2a1a'), new T3.MeshStandardMaterial({ map: clockFace(3.6, true, true), emissive: '#ffe6a8', emissiveIntensity: 0.9, emissiveMap: clockFace(3.6, true, true) }), SM('#3a2a1a')], 0, 4.6, -5.85, false); R.backFace.rotation.x = PI / 2;
  add(MRG, new T3.TorusGeometry(3.65, 0.2, 8, 48), SM('#7a5a32', { metalness: 0.5 }), 0, 4.6, -5.8);
  R.mHands = new T3.Group(); R.mHands.position.set(0, 4.6, -5.7); MRG.add(R.mHands); add(R.mHands, Bx(0.2, 2.6, 0.06), BM('#1a1208'), 0, 1.1, 0, false);
  R.faceL = new T3.PointLight('#ffe0a0', 30, 18, 1.4); R.faceL.position.set(0, 4.6, -4.5); MRG.add(R.faceL); R.fillL = new T3.PointLight('#9fd8ff', 14, 12, 1.5); R.fillL.position.set(0.5, 3.2, 3.5); MRG.add(R.fillL);
  const brass = SM('#c9a24a', { metalness: 0.7, roughness: 0.35 }), iron = SM('#3a3a40', { metalness: 0.6, roughness: 0.5 });
  R.gears = []; for (const [x, y, z, r, ry] of [[-5.2, 5.5, -5.6, 1.6, 0], [-4.2, 2.6, -5.6, 1.0, 0], [5.0, 5.8, -5.6, 1.3, 0], [5.6, 2.8, -5.6, 1.1, 0], [-6.8, 4, -1, 1.4, PI / 2], [6.8, 4, -1, 1.4, -PI / 2]]) { const gg = new T3.Group(); gg.position.set(x, y, z); gg.rotation.y = ry; MRG.add(gg); const inner = new T3.Group(); gg.add(inner); add(inner, Cy(r, r, 0.25, 24), brass, 0, 0, 0).rotation.x = PI / 2; for (let t = 0; t < 12; t++) { const a = t / 12 * 2 * PI; const tt = add(inner, Bx(0.25, 0.4, 0.25), brass, C(a) * (r + 0.15), S(a) * (r + 0.15), 0); tt.rotation.z = a + PI / 2; } add(inner, Cy(0.25, 0.25, 0.4, 10), iron, 0, 0, 0).rotation.x = PI / 2; inner.userData.r = r; R.gears.push(inner); }
  // machine body behind the chair
  add(MRG, Bx(4.4, 2.6, 1.4), iron, 0, 1.3, -3.6); for (let i = 0; i < 6; i++) { const lm = SM('#330000', { emissive: ['#ff3b30', '#2ecc71', '#f1c40f'][i % 3], emissiveIntensity: 0.4 }); add(MRG, Sp(0.12, 8, 6), lm, -1.5 + i * 0.6, 2.2, -2.88); WINM.push(lm); }
  for (let i = 0; i < 3; i++) { const d = add(MRG, Cy(0.35, 0.35, 0.08, 20), SM('#f4f0e0'), -1.2 + i * 1.2, 1.3, -2.86); d.rotation.x = PI / 2; }
  // chair
  R.chair = new T3.Group(); R.chair.position.set(0, 0, -0.6); MRG.add(R.chair); const wd = SM('#6b3f22'); add(R.chair, Bx(1.3, 0.2, 1.2), wd, 0, 0.9, 0); add(R.chair, Bx(1.3, 1.9, 0.2), wd, 0, 1.85, -0.55); for (const x of [-0.55, 0.55]) for (const z of [-0.5, 0.5]) add(R.chair, Bx(0.15, 0.9, 0.15), wd, x, 0.45, z); add(R.chair, Bx(0.18, 0.15, 1.1), wd, -0.62, 1.35, 0); add(R.chair, Bx(0.18, 0.15, 1.1), wd, 0.62, 1.35, 0);
  R.crown = new T3.Group(); R.crown.position.set(0, 3.3, -0.15); R.chair.add(R.crown); add(R.crown, new T3.TorusGeometry(0.45, 0.08, 8, 20), brass, 0, 0, 0).rotation.x = PI / 2; add(R.crown, Cy(0.08, 0.08, 0.8, 8), brass, 0, 0.4, -0.35);
  R.crownG = glow(R.crown, '#7fe8ff', 2.4, 0, 0, 0, 0);
  R.straps = [add(R.chair, Bx(0.3, 0.08, 0.3), SM('#2a1a10'), -0.62, 1.48, 0.1), add(R.chair, Bx(0.3, 0.08, 0.3), SM('#2a1a10'), 0.62, 1.48, 0.1)];
  // wires from the crown out to the walls
  R.wires = []; R.wireM = new T3.MeshStandardMaterial({ color: '#202428', emissive: '#4fd8ff', emissiveIntensity: 0.15, roughness: 0.4 }); const wr = rng(12);
  for (let i = 0; i < 26; i++) { const a = -PI * 0.95 + i / 25 * PI * 1.9; const end = new T3.Vector3(S(a) * 6.9, 2.5 + wr() * 6, C(a) * -5.9 + 2); if (Math.abs(end.x) > 6.8) end.x = Math.sign(end.x) * 6.9; const st = new T3.Vector3((wr() - 0.5) * 0.3, 3.7, -0.8), up = new T3.Vector3(st.x * 4, 8.6, -0.8 + (wr() - 0.5) * 2), m2 = new T3.Vector3(end.x * 0.8, 8.8, end.z * 0.8); const tb = add(MRG, new T3.TubeGeometry(new T3.CatmullRomCurve3([st, up, m2, end]), 40, 0.018 + wr() * 0.018, 5), R.wireM, 0, 0, 0, false); R.wires.push(tb); }
  R.hale2 = person({ skin: '#e8b88f', top: '#6b4a2e', bot: '#3a2e24', hair: '#e8e8e8', style: 'bald', extras: ['mustache', 'coat'], face: 'neutral' }); place(R.hale2, MRG, 2.6, 1.0, -0.5); tag(R.hale2, 'MR. HALE', '#ffd34a');
  R.youngHale = person({ skin: '#e8b88f', top: '#6b4a2e', bot: '#3a2e24', hair: '#4a2e1a', style: 'short', extras: ['coat'], face: 'smile' }); place(R.youngHale, MRG, 1.6, 0.6, -0.6); tag(R.youngHale, 'YOUNG HALE', '#ffd34a');
  R.leoC = person({ s: 0.78, kid: true, skin: '#ffd9b8', top: '#d63031', bot: '#2d3436', hair: '#e0b44a', style: 'spiky', face: 'wide' }); place(R.leoC, MRG, 0, -0.45, 0); sitP(R.leoC); R.leoC.position.y = 0.45; tag(R.leoC, 'LEO', '#ffb0a0');
  R.meM = person({ s: 0.78, kid: true, skin: '#e0a878', top: '#2a6fdb', bot: '#2d3436', hair: '#3a2410', style: 'short', face: 'neutral' }); place(R.meM, MRG, -1.6, 1.4, 0.5); tag(R.meM, 'ME', '#9ad0ff');
  R.plug = new T3.Group(); R.plug.position.set(-2.6, 0, -2.8); MRG.add(R.plug); add(R.plug, Bx(0.8, 1.6, 0.5), iron, 0, 0.8, 0); R.lever = new T3.Group(); R.lever.position.set(0, 1.3, 0.3); R.plug.add(R.lever); add(R.lever, Bx(0.1, 0.9, 0.1), SM('#c0392b'), 0, 0.45, 0); add(R.lever, Sp(0.12, 8, 6), SM('#111'), 0, 0.9, 0);
  R.mOrbs = []; for (let i = 0; i < 8; i++) R.mOrbs.push(glow(MRG, '#7fe8ff', 0.7, 0, -50, 0, 0));

  // ===== FLASHBACK: the wall =====
  const FBG = grp(FB); R.fb = FBG; R.fbWall = add(FBG, Bx(0.9, 4.5, 60), SM('#8a8a8a', { map: texCanvas(64, 64, g => { g.fillStyle = '#8f8f8f'; g.fillRect(0, 0, 64, 64); g.fillStyle = '#7a7a7a'; for (let y = 0; y < 64; y += 16) for (let x = (y / 16) % 2 * 16; x < 64; x += 32) g.fillRect(x + 1, y + 1, 30, 14); }, [30, 2]) }), 0, 2.25, 0);
  [[-14, -10, PI / 2, '#ffd6a5'], [-14, 4, PI / 2, '#a0c4ff'], [14, -10, -PI / 2, '#caffbf'], [14, 4, -PI / 2, '#ffadad'], [-9, -20, 0, '#fdffb6'], [9, -20, 0, '#bdb2ff']].forEach(h => house(FBG, h[0], h[1], h[2], h[3], '#7a5a4a'));
  R.angry = []; [[-2.2, 2], [-3.6, 0], [-2.8, -2.4], [2.2, 2.2], [3.4, -0.2], [2.6, -2.6]].forEach(([x, z], i) => { const p = townie(60 + i, { face: 'shout' }); place(p, FBG, x, z, x < 0 ? PI / 2 : -PI / 2); R.angry.push(p); });
  R.hugA = townie(70, { face: 'smile' }); place(R.hugA, FBG, -0.45, 6, PI / 2); R.hugB = townie(71, { face: 'smile' }); place(R.hugB, FBG, 0.45, 6, -PI / 2);
}

// ---------- mood / lighting ----------
const MOODS = {
  day: { bg: '#8fd3ff', fog: '#cfeaff', f0: 60, f1: 220, hemi: 1.25, sun: 2.7, sc: '#fff4e0', off: [14, 26, 12], win: 0, hs: '#cfe9ff' },
  eve: { bg: '#f6a86e', fog: '#f8c59a', f0: 50, f1: 200, hemi: 0.8, sun: 2.2, sc: '#ffae6a', off: [-26, 9, 10], win: 0.9, hs: '#ffc79a' },
  dawn: { bg: '#ffd7b0', fog: '#ffe6cc', f0: 50, f1: 200, hemi: 0.95, sun: 2.2, sc: '#ffd2a0', off: [26, 10, 8], win: 0.4, hs: '#ffe2c4' },
  night: { bg: '#0e1733', fog: '#0e1733', f0: 30, f1: 130, hemi: 0.32, sun: 0.7, sc: '#8fa8ff', off: [-10, 24, 14], win: 1.4, hs: '#4a5a8a' },
  inside: { bg: '#0e1733', fog: '#0e1733', f0: 40, f1: 140, hemi: 0.18, sun: 0.0, sc: '#8fa8ff', off: [-10, 24, 14], win: 1.2, hs: '#4a5a8a' },
};
let curMood = 'day';
function mood(m, at) { const M = MOODS[m]; curMood = m; scene.background.set(M.bg); scene.fog.color.set(M.fog); scene.fog.near = M.f0; scene.fog.far = M.f1; hemi.intensity = M.hemi; hemi.color.set(M.hs); sun.intensity = M.sun; sun.color.set(M.sc);
  sun.target.position.set(at[0], 0, at[2]); sun.position.set(at[0] + M.off[0], M.off[1], at[2] + M.off[2]); WINM.forEach(w => w.emissiveIntensity = M.win); amb.intensity = m === 'night' || m === 'inside' ? 0.12 : 0.25; }
const P = (set, x, y, z) => [set[0] + x, set[1] + y, set[2] + z];
function clockT(hh, mm) { R.hM.rotation.z = -mm / 60 * 2 * PI; R.hH.rotation.z = -((hh % 12) + mm / 60) / 12 * 2 * PI; R.mHands.rotation.z = ((hh % 12) + mm / 60) / 12 * 2 * PI; }

// ---------- shots: [start, mood, focus point, camera fn] ----------
const O = [0, 0, 0];
const SH = [
  [0, 'day', O, (k, T) => dolly([9, 5.2, 16], [7.4, 4.8, 13.2], [0, 3.4, -0.5], [0, 3.6, -1], k, T)],
  [E.except0 - 0.1, 'day', O, (k, T) => dolly([0.7, 2.1, 1.8], [0.5, 2.2, 0.9], [0, 2.4, -2.4], [0, 2.4, -2.4], k, T)],
  [E.now0 - 0.1, 'inside', MR, (k, T) => dolly(P(MR, 0, 2.6, 5.4), P(MR, 0, 2.4, 4.0), P(MR, 0, 2.3, -0.6), P(MR, 0, 2.3, -0.6), k, T)],
  [E.wake, 'day', BR, (k, T) => dolly(P(BR, 2.0, 2.3, 3.4), P(BR, 1.6, 2.1, 2.6), P(BR, -1.2, 1.3, -1.5), P(BR, -1.3, 1.5, -1.5), k, T)],
  [E.dadB - 0.1, 'day', BK, (k, T) => dolly(P(BK, 0, 2.5, 6.2), P(BK, 0, 2.4, 4.8), P(BK, 0, 1.9, -0.2), P(BK, 0, 2.0, -0.2), k, T)],
  [E.four - 0.1, 'day', BK, (k, T) => dolly(P(BK, 2.8, 2.3, 4.6), P(BK, 2.2, 2.6, 4.2), P(BK, 0, 1.4, 1.1), P(BK, 0, 1.7, 1.0), k, T)],
  [E.toast - 0.1, 'day', BK, (k, T) => dolly(P(BK, 1.2, 2.4, 2.9), P(BK, 1.0, 2.4, 2.4), P(BK, 0.5, 2.1, 0), P(BK, 0.5, 2.1, 0), k, T)],
  [E.teach, 'day', CR, (k, T) => dolly(P(CR, 0, 2.3, 5.6), P(CR, 0, 2.0, 3.6), P(CR, 0, 1.6, -2.2), P(CR, 0, 1.6, -2.2), k, T)],
  [E.hw - 0.1, 'day', CR, (k, T) => dolly(P(CR, 2.0, 2.2, 1.6), P(CR, 1.6, 2.3, 1.2), P(CR, -0.4, 2.0, -3.4), P(CR, -0.4, 2.1, -3.4), k, T)],
  [E.wed, 'day', WD, (k, T) => dolly(P(WD, 0, 2.4, 7.4), P(WD, 0, 2.2, 5.0), P(WD, 0, 2.0, -1.4), P(WD, 0, 2.0, -1.4), k, T)],
  [E.post - 0.1, 'day', WD, (k, T) => dolly(P(WD, 0.7, 2.6, 2.0), P(WD, 0.6, 2.5, 1.4), P(WD, 0.4, 2.3, -1.2), P(WD, 0.4, 2.4, -1.2), k, T)],
  [E.rule, 'eve', O, (k, T) => dolly([0, 9, 23], [0, 7.5, 19], [0, 2.5, 0], [0, 3, 0], k, T)],
  [E.bed - 0.1, 'eve', O, (k, T) => dolly([0, 9.2, 9], [0, 9.2, 6.5], [0, 9.2, -6], [0, 9.2, -6], k, T)],
  [E.who - 0.1, 'day', O, (k, T) => dolly([-5, 4.5, 14], [-4, 4, 12], [-1, 1.6, 2], [-1, 1.6, 2], k, T)],
  [E.hale, 'day', O, (k, T) => dolly([0.4, 2.2, 5.6], [0.2, 2.3, 3.4], [0, 2.4, -2.4], [0, 2.4, -2.4], k, T)],
  [E.every5 - 0.1, 'day', O, (k, T) => dolly([0, 13, 14], [0, 15, 11], [0, 1, 1], [0, 1, 0.5], k, T)],
  [E.never - 0.1, 'day', O, (k, T) => dolly([2.4, 1.3, 2.4], [2.0, 1.2, 1.8], [-0.3, 4.6, -3.5], [-0.3, 5.4, -3.5], k, T)],
  [E.leo, 'inside', BS, (k, T) => dolly(P(BS, 0, 1.7, 4.0), P(BS, 0, 1.6, 2.8), P(BS, 0, 1.3, -0.6), P(BS, 0, 1.4, -0.6), k, T)],
  [E.base - 0.1, 'inside', BS, (k, T) => dolly(P(BS, 2.6, 2.6, 2.8), P(BS, 2.2, 2.4, 2.4), P(BS, 0, 1.0, -0.6), P(BS, 0, 1.1, -0.6), k, T)],
  [E.eyes - 0.1, 'inside', BS, (k, T) => dolly(P(BS, 0, 1.62, 1.3), P(BS, 0, 1.62, 0.75), P(BS, 0, 1.6, -0.6), P(BS, 0, 1.6, -0.6), k, T)],
  [E.swap7, 'dawn', O, (k, T) => dolly([-9, 5, 15], [-7, 4.6, 12.5], [0, 3.2, 0], [0, 3.2, 0], k, T)],
  [E.exLeo - 0.1, 'inside', BS, (k, T) => dolly(P(BS, 1.4, 1.8, 2.6), P(BS, 1.1, 1.7, 2.1), P(BS, 0, 1.4, -0.6), P(BS, 0, 1.4, -0.6), k, T)],
  [E.patrol - 0.1, 'day', O, (k, T) => dolly([6, 2.4, 12], [5, 2.4, 10.5], [1.5, 1.8, 6], [1, 1.8, 4], k, T)],
  [E.drag - 0.1, 'day', O, (k, T) => dolly([3.5, 2.6, 9], [2.0, 2.6, 6.2], [0, 2.2, -2], [0, 2.2, -3], k, T)],
  [E.like, 'night', O, (k, T) => dolly([2.5, 1.0, 10.5], [2.2, 1.0, 9.8], [0, 8, -6], [0, 8.5, -6], k, T)],
  [E.after - 0.1, 'night', O, (k, T) => dolly([0.7, 1.5, 3.6], [0.5, 1.45, 4.2], [0, 1.3, 7], [0, 1.3, 7], k, T)],
  [E.mum, 'day', KT, (k, T) => dolly(P(KT, 0.4, 2.3, 4.6), P(KT, 0.3, 2.2, 3.6), P(KT, -0.5, 1.9, -1), P(KT, -0.5, 1.9, -1), k, T)],
  [E.mondays - 0.1, 'day', KT, (k, T) => dolly(P(KT, 0.2, 2.3, 2.2), P(KT, 0.1, 2.3, 1.8), P(KT, -0.6, 2.3, -1), P(KT, -0.6, 2.3, -1), k, T)],
  [E.mayor - 0.1, 'day', O, (k, T) => dolly([-2.6, 1.7, 11], [-2.8, 1.6, 9.6], [-3, 1.4, 6.6], [-3, 1.4, 6.6], k, T)],
  [E.shrug - 0.1, 'day', O, (k, T) => dolly([-2.7, 1.5, 8.9], [-2.8, 1.5, 8.5], [-3, 1.4, 6.9], [-3, 1.4, 6.9], k, T)],
  [E.climb, 'inside', ST, (k, T) => { const a = (10 + k * 22) * 0.32, y = (10 + k * 22) * 0.32; look(P(ST, C(a - 1.5) * 2.4, y + 2.8, S(a - 1.5) * 2.4), P(ST, C(a) * 2.2, y + 0.9, S(a) * 2.2), T); }],
  [E.mach, 'inside', MR, (k, T) => dolly(P(MR, 0, 3.4, 7.6), P(MR, 0, 3.0, 5.4), P(MR, 0, 3.6, -3), P(MR, 0, 3.4, -3), k, T)],
  [E.wires - 0.1, 'inside', MR, (k, T) => dolly(P(MR, -3.6, 4.8, 3.6), P(MR, -3.0, 5.2, 3.0), P(MR, 2, 5, -2), P(MR, 2, 5.5, -2), k, T)],
  [E.beds - 0.1, 'night', O, (k, T) => dolly([0, 42, 44], [0, 36, 36], [0, 0, -2], [0, 0, -2], k, T)],
  [E.chair - 0.1, 'inside', MR, (k, T) => dolly(P(MR, 0, 2.3, 4.4), P(MR, 0, 2.1, 3.2), P(MR, 0, 2.0, -0.6), P(MR, 0, 2.0, -0.6), k, T)],
  [E.strap - 0.1, 'inside', MR, (k, T) => dolly(P(MR, 0.7, 1.7, 1.5), P(MR, 0.5, 1.7, 1.2), P(MR, 0, 1.55, -0.5), P(MR, 0, 1.55, -0.5), k, T)],
  [E.dark, 'inside', MR, (k, T) => dolly(P(MR, -0.6, 2.0, 4.6), P(MR, -0.4, 2.0, 4.0), P(MR, 2.4, 2.1, 0.2), P(MR, 2.4, 2.1, 0.4), k, T)],
  [E.wall, 'day', FB, (k, T) => dolly(P(FB, 0, 7, 14), P(FB, 0, 5.5, 10.5), P(FB, 0, 1.2, -1), P(FB, 0, 1.4, -1), k, T)],
  [E.hated - 0.1, 'day', FB, (k, T) => dolly(P(FB, -0.9, 2.6, 7.0), P(FB, -1.1, 2.4, 6.0), P(FB, -2.6, 1.7, 0), P(FB, -2.6, 1.7, 0), k, T)],
  [E.built - 0.1, 'inside', MR, (k, T) => dolly(P(MR, 3.8, 2.4, 3.6), P(MR, 3.4, 2.3, 3.0), P(MR, 0.8, 2.0, -0.8), P(MR, 0.8, 2.0, -0.8), k, T)],
  [E.hate - 0.1, 'day', FB, (k, T) => dolly(P(FB, 0, 3.0, 14), P(FB, 0, 2.6, 11.5), P(FB, 0, 1.5, 5), P(FB, 0, 1.6, 5), k, T)],
  [E.needs, 'inside', MR, (k, T) => dolly(P(MR, 0.4, 2.4, 3.6), P(MR, 0.8, 2.3, 3.0), P(MR, 2.6, 2.2, 1.0), P(MR, 2.6, 2.2, 1.0), k, T)],
  [E.old - 0.1, 'inside', MR, (k, T) => dolly(P(MR, 1.2, 2.1, 2.7), P(MR, 1.4, 2.1, 2.4), P(MR, 2.6, 2.0, 1.0), P(MR, 2.6, 2.0, 1.0), k, T)],
  [E.newp - 0.1, 'inside', MR, (k, T) => dolly(P(MR, 3.6, 2.5, 2.0), P(MR, 3.4, 2.4, 1.8), P(MR, -1.6, 1.4, 1.4), P(MR, -1.6, 1.4, 1.4), k, T)],
  [E.shake, 'inside', MR, (k, T) => dolly(P(MR, 0.5, 1.7, 1.5), P(MR, 0.4, 1.7, 1.2), P(MR, 0, 1.55, -0.5), P(MR, 0, 1.55, -0.5), k, T)],
  [E.choice - 0.1, 'inside', MR, (k, T) => dolly(P(MR, -0.6, 2.8, 6.2), P(MR, -0.6, 2.6, 5.2), P(MR, -1, 1.8, -1.4), P(MR, -1, 1.8, -1.4), k, T)],
  [E.unplug - 0.1, 'inside', MR, (k, T) => dolly(P(MR, 0.4, 2.1, 0.8), P(MR, 0.0, 2.0, 0.4), P(MR, -2.3, 1.4, -2.2), P(MR, -2.3, 1.4, -2.2), k, T)],
  [E.place - 0.1, 'inside', MR, (k, T) => dolly(P(MR, 0, 2.3, 3.6), P(MR, 0, 2.1, 2.8), P(MR, 0, 1.9, -0.6), P(MR, 0, 1.9, -0.6), k, T)],
  [E.dadwk, 'day', BR, (k, T) => dolly(P(BR, 1.8, 2.3, 3.2), P(BR, 1.5, 2.2, 2.6), P(BR, -1.3, 1.5, -1.5), P(BR, -1.3, 1.6, -1.5), k, T)],
  [E.tired - 0.1, 'day', BR, (k, T) => dolly(P(BR, -0.3, 2.3, 0.9), P(BR, -0.5, 2.3, 0.6), P(BR, -1.4, 2.2, -1.6), P(BR, -1.4, 2.2, -1.6), k, T)],
  [E.hug - 0.1, 'day', KT, (k, T) => dolly(P(KT, 2.0, 1.9, 3.6), P(KT, 1.6, 1.9, 3.0), P(KT, -0.2, 1.5, -0.7), P(KT, -0.2, 1.5, -0.7), k, T)],
  [E.unstrap, 'inside', MR, (k, T) => dolly(P(MR, 1.0, 2.3, 3.8), P(MR, 0.8, 2.2, 3.2), P(MR, 0, 1.6, -0.5), P(MR, 0, 1.6, -0.5), k, T)],
  [E.sit - 0.1, 'inside', MR, (k, T) => dolly(P(MR, 0, 2.0, 2.6), P(MR, 0, 2.4, 4.4), P(MR, 0, 2.0, -0.6), P(MR, 0, 2.4, -0.6), k, T)],
  [E.q, 'inside', MR, (k, T) => dolly(P(MR, 0.3, 1.9, 2.0), P(MR, 0.2, 1.9, 1.6), P(MR, 0, 1.8, -0.6), P(MR, 0, 1.8, -0.6), k, T)],
  [E.sunday - 0.1, 'night', O, (k, T) => dolly([7, 4, 17], [6, 4.4, 15], [0, 6, -5], [0, 7, -5], k, T)],
  [E.loop, 'day', O, (k, T) => dolly([9, 5.2, 16], [9, 5.2, 16], [0, 3.4, -0.5], [0, 3.4, -0.5], 0, 0)],
];
const shotAt = T => { let i = 0; for (let j = 0; j < SH.length; j++) if (T >= SH[j][0]) i = j; return i; };

// ---------- animation ----------
function orbsTown(T, on, pairs, phase0 = 0) { ORBS.forEach((o, i) => { const pr = pairs[i % pairs.length]; if (!on || !pr) { o.material.opacity = 0; o.userData.core.material.opacity = 0; o.position.y = -50; o.userData.core.position.y = -50; o.userData.trail.forEach(t_ => t_.position.y = -50); return; }
  const ph = ((T * 0.55 + i / ORBS.length + phase0) % 1); const a = pr[0].position, b = pr[1].position; const ha = 2.6 * pr[0].scale.x, hb = 2.6 * pr[1].scale.x;
  const pos = q => [lerp(a.x, b.x, q), lerp(ha, hb, q) + S(q * PI) * 3.2, lerp(a.z, b.z, q)]; const [x, y, z] = pos(ph); o.position.set(x, y, z); o.userData.core.position.set(x, y, z); const op = S(ph * PI) ** 0.4; o.material.opacity = 0.95 * op; o.userData.core.material.opacity = op; o.userData.trail.forEach((t_, j) => { const q = Math.max(0, ph - (j + 1) * 0.035); t_.position.set(...pos(q)); t_.material.opacity = 0.6 * op * (1 - j * 0.22); }); }); }
function anim(T, si) {
  const ci = CLI(T), loop = T >= E.loop, Tt = loop ? 0 : T, cl = loop ? 0 : ci;
  PEOPLE.forEach(rest);
  // town
  const night = SH[si][1] === 'night';
  R.folk.forEach((p, i) => { const b = p.userData.base || (p.userData.base = [p.position.x, p.position.z, p.rotation.y]); p.visible = !night && !(cl === 7 && T > E.patrol - 0.1); p.position.set(b[0], 0, b[1]); p.rotation.y = b[2];
    p.userData.u = 0; if (cl === 0 || cl === 5 && T > E.every5 || cl === 7 && T < E.patrol) { setFace(p, i % 3 === 0 ? 'shock' : i % 3 === 1 ? 'grin' : 'smile'); p.userData.armL.rotation.x = -0.4 - 0.3 * S(Tt * 3 + i); p.userData.armR.rotation.x = -0.4 - 0.3 * S(Tt * 3 + i + 1); }
    else if (cl === 4 && T < E.who - 0.1) { const dir = Math.atan2(b[0], b[1]); const d = prog(T, E.rule, E.who) * 4; p.position.set(b[0] + S(dir) * d, 0, b[1] + C(dir) * d); p.rotation.y = dir; walk(p, T * 9 + i, 0.7); }
    else { p.userData.armL.rotation.z = -0.05; p.userData.head.rotation.y = 0.2 * S(T * 0.7 + i); } });
  R.hale.visible = !(cl === 7 && T > E.patrol) && cl !== 8 && !night; R.hale.position.set(0, 0, -2.4); R.hale.rotation.y = 0; R.hale.userData.body.rotation.x = 0.12;
  if (cl === 5 && T > E.never - 0.1) R.hale.userData.head.rotation.x = -0.45;
  R.haleRing && (R.haleRing.material.opacity = (cl === 5 && T > E.every5 - 0.1) || cl === 0 && T > E.except0 - 0.1 ? 0.55 + 0.15 * S(T * 4) : 0);
  const swapOn = (cl === 0 && !loop) || loop || (cl === 5 && T > E.every5 - 0.1) || (cl === 7 && T < E.patrol);
  const F = R.folk; orbsTown(Tt, swapOn, [[F[0], F[4]], [F[4], F[1]], [F[1], F[7]], [F[2], F[9]], [F[9], F[5]], [F[3], F[8]], [F[8], F[11]], [F[6], F[10]], [F[10], F[2]], [F[11], F[3]], [F[5], F[0]], [F[7], F[6]]]);
  // clock
  if (cl === 4) clockT(6, 55 + 4 * prog(T, E.rule, E.who)); else if (night || cl >= 10) clockT(11, 59); else if (cl === 7 && T > E.patrol) clockT(8, 0); else clockT(7, 0);
  R.tDoor.rotation.y = cl === 7 && T > E.drag ? -1.4 * (1 - prog(T, E.like - 0.6, E.like - 0.3)) : 0;
  // patrol drag
  const pOn = cl === 7 && T > E.patrol - 0.1; R.patrol.forEach(p => p.visible = pOn); R.leoT.visible = pOn;
  if (pOn) { const k = prog(T, E.patrol, E.like - 0.4); const x = lerp(2.2, 0, k), z = lerp(7.5, -2.0, k), ry = Math.atan2(0 - 2.2, -2.0 - 7.5) * 0 + PI;
    R.leoT.position.set(x, 0, z); R.leoT.rotation.y = ry + PI; R.leoT.userData.armL.rotation.x = -1.2; R.leoT.userData.armR.rotation.x = -1.2; walk(R.leoT, T * 12, 0.3); R.leoT.userData.armL.rotation.x = -1.4; R.leoT.userData.armR.rotation.x = -1.4; setFace(R.leoT, S(T * 20) > 0 ? 'shout' : 'shock');
    R.patrol.forEach((p, j) => { p.position.set(x + (j ? 0.85 : -0.85), 0, z - 0.3); p.rotation.y = ry; walk(p, T * 9 + j, 0.5); (j ? p.userData.armL : p.userData.armR).rotation.x = -1.3; }); }
  R.meT.visible = cl === 8; R.meT.position.set(0, 0, 7); R.meT.rotation.y = PI; setFace(R.meT, T > E.after ? 'angry' : 'neutral'); R.meT.userData.head.rotation.x = T < E.after - 0.1 ? -0.5 : 0;
  R.mayor.visible = cl === 9; R.mayor.userData.armL.rotation.z = cl === 9 && T > E.shrug ? -1.1 : 0; R.mayor.userData.armR.rotation.z = cl === 9 && T > E.shrug ? 1.1 : 0; if (cl === 9 && T > E.shrug) setFace(R.mayor, 'neutral');
  R.net.visible = night && (cl === 11 || cl === 18); R.net.children.forEach((l, i) => l.material.opacity = 0.5 + 0.4 * S(T * 6 + i));
  R.towerGlow.material.opacity = night ? 0.5 + 0.2 * S(T * 3) : 0;
  // bakery
  const nC = cl === 1 ? Math.floor(160 * ease(prog(T, E.four - 0.05, E.four + 1.0))) : 160; R.crois.children.forEach(m => m.visible = m.userData.i < nC && (cl === 1 && T > E.four - 0.1 && T < E.toast - 0.1));
  setFace(R.bakerDad, cl === 1 && T > E.toast - 0.1 ? 'sad' : 'grin'); R.toast.visible = cl === 1 && T > E.toast - 0.1; R.bakerDad.userData.armR.rotation.x = R.toast.visible ? -1.5 : -0.3 * Math.abs(S(T * 5));
  if (R.toast.visible) { R.toast.position.set(-0.05, 2.15, 0.6); R.smoke.forEach((m, i) => { const ph = (T * 0.7 + i / 8) % 1; m.position.set(S(i * 2 + T) * 0.15, 0.35 + ph * 1.4, 0); m.scale.setScalar(0.6 + ph * 1.6); m.material.opacity = 0.55 * (1 - ph); }); }
  // bedroom
  R.youGran.visible = cl === 1 && T < E.dadB - 0.1; R.meDad.visible = cl === 16;
  for (const p of [R.youGran, R.meDad]) { if (!p.visible) continue; p.position.set(-1.4, 0.55, -1.9); p.rotation.y = 0; sitP(p); const up = p === R.youGran ? prog(T, E.wake + 0.9, E.wake + 1.3) : 1; p.userData.body.rotation.x = -1.4 * (1 - up); }
  if (R.youGran.visible) { const awake = T > E.wake + 0.7; setFace(R.youGran, !awake ? 'sleep' : T > E.wake + 1.4 ? 'shock' : 'neutral'); if (T > E.wake + 1.4) { R.youGran.userData.armL.rotation.x = -1.6; R.youGran.userData.armR.rotation.x = -1.6; R.youGran.userData.head.rotation.x = 0.4; } }
  if (R.meDad.visible) { setFace(R.meDad, T > E.tired - 0.1 ? (S(T * 3) > 0.3 ? 'talk' : 'tired') : 'tired'); R.meDad.userData.armR.rotation.x = T > E.tired ? -2.6 : 0; }
  R.alarm.rotation.z = cl === 1 && T < E.wake + 1.2 ? S(T * 60) * 0.12 : 0;
  R.bOrb.position.y = -50;
  // kitchen
  R.mumBig.visible = cl === 9; if (cl === 9) { mouth(R.mumBig, -1, T, 'neutral'); if (T > E.mondays - 0.1 && T < E.mayor) { R.mumBig.userData.armL.rotation.z = -1.0; R.mumBig.userData.armR.rotation.z = 1.0; setFace(R.mumBig, S(T * 18) > 0 ? 'talk' : 'smile'); } }
  R.kDad.visible = R.kMe.visible = cl === 16 && T > E.hug - 0.2; if (R.kMe.visible) { R.kMe.position.set(-0.2, 0, -0.5); R.kMe.rotation.y = -2.2; R.kDad.position.set(-0.75, 0, -0.95); R.kDad.rotation.y = 0.9; for (const p of [R.kMe, R.kDad]) { p.userData.armL.rotation.set(-1.4, 0, 0.5); p.userData.armR.rotation.set(-1.4, 0, -0.5); } setFace(R.kMe, 'smile'); setFace(R.kDad, 'grin'); }
  // classroom
  setFace(R.babyT, cl === 2 && T > E.hw ? 'angry' : 'baby'); R.babyT.userData.armR.rotation.x = cl === 2 && T > E.hw ? -2.2 - 0.3 * S(T * 8) : 0; R.babyT.position.y = 1.0; R.kids.forEach((k, i) => { sitP(k); setFace(k, cl === 2 && T > E.hw + 0.3 ? 'sad' : 'shock'); });
  // wedding
  R.bride.visible = !(cl === 3 && T > E.post - 0.1); R.postBride.visible = !R.bride.visible; [R.bride, R.postBride, R.groom].forEach(p => { p.userData.armL.rotation.x = -0.3; });
  if (R.postBride.visible) setFace(R.groom, 'shock');
  // basement
  R.leoB.position.y = 0.3; sitP(R.leoB); R.bulb.position.x = 0.6 + S(T * 1.6) * 0.15; R.bulbL.position.x = R.bulb.position.x; R.bulbG.position.x = R.bulb.position.x; R.bulbL.intensity = SH[si][3] && SH[si][2] === BS ? 6 : 0;
  R.leoB.userData.body.position.x = (cl === 6 && T > E.eyes) || cl === 7 ? S(T * 40) * 0.01 : 0; setFace(R.leoB, cl === 7 && T > E.exLeo + 0.6 ? 'shock' : 'wide');
  if (cl === 7 && T > E.exLeo - 0.3 && T < E.patrol) { const k = prog(T, E.exLeo - 0.3, E.exLeo + 0.6); const bx = k < 0.6 ? lerp(-3, 0, k / 0.6) : lerp(0, 2.6, (k - 0.6) / 0.4); const by = k < 0.6 ? lerp(2.8, 1.7, k / 0.6) : lerp(1.7, 3.2, (k - 0.6) / 0.4); R.bOrb.position.set(bx, by, -0.4); R.bOrb.material.opacity = 0.9; }
  // stairs
  if (SH[si][2] === ST) { const kk = prog(T, E.climb, E.mach); const a = (10 + kk * 22) * 0.32, y = (10 + kk * 22) * 0.32; R.meS.position.set(C(a) * 2.2, y + 0.08, S(a) * 2.2); R.meS.rotation.y = -a + PI; walk(R.meS, T * 10, 0.6); R.stairL.intensity = 8; R.stairL.position.set(C(a) * 1, y + 3, S(a) * 1); } else R.stairL.intensity = 0;
  // machine room
  const meChair = (cl === 0 && T > E.now0 - 0.1) || (cl >= 17 && T > E.sit) || cl === 18;
  R.leoC.visible = cl !== 13 && cl !== 0; R.leoC.position.set(0, 0.45, -0.45); sitP(R.leoC); R.leoC.rotation.y = 0;
  if (cl >= 11 && cl <= 16) R.leoC.userData.body.position.x = S(T * 40) * 0.012;
  if (cl === 18 || (cl === 17 && T > E.unstrap + 0.5)) { const k = cl === 18 ? 1 : prog(T, E.unstrap + 0.5, E.unstrap + 1.2); R.leoC.rotation.y = -0.5 * k; R.leoC.userData.legL.rotation.x = R.leoC.userData.legR.rotation.x = -PI / 2 * (1 - k); R.leoC.position.set(lerp(0, 0.95, k), lerp(0.45, 0, k), lerp(-0.45, 0.2, k)); setFace(R.leoC, T > E.sit ? 'sad' : 'shock'); }
  R.straps.forEach(s_ => s_.visible = !(cl === 17 && T > E.unstrap + 0.3) || meChair);
  R.meM.visible = cl !== 13 && (cl >= 11 || (cl === 0 && T > E.now0 - 0.1)); R.meM.rotation.y = 0.5; R.meM.position.set(-1.6, 0, 1.4);
  if (cl === 17 && T < E.sit) { const k = prog(T, E.unstrap, E.unstrap + 0.5); R.meM.position.set(lerp(-1.6, -0.9, k), 0, lerp(1.4, 0.3, k)); R.meM.rotation.y = 0.9; R.meM.userData.armR.rotation.x = -1.2; }
  if (meChair) { R.meM.position.set(0, 0.45, -0.45); R.meM.rotation.y = 0; sitP(R.meM); setFace(R.meM, cl === 18 && T > E.sunday ? 'wink' : 'neutral'); R.meM.userData.armL.rotation.x = R.meM.userData.armR.rotation.x = -PI / 2 * 0.6; }
  if (cl === 15 && T > E.unplug - 0.1 && T < E.place - 0.1) { R.meM.position.set(-2.0, 0, -1.6); R.meM.rotation.y = -2.55; R.meM.userData.armR.rotation.x = -1.7 - 0.2 * prog(T, E.unplug, E.place); }
  R.lever.rotation.x = 0;
  const glowK = meChair ? (cl === 0 ? 1 : 0.4 + 0.6 * prog(T, E.sit, E.sit + 1.2)) : (cl === 11 && T > E.wires - 0.1 ? 0.6 + 0.3 * S(T * 5) : 0.35);
  R.wireM.emissiveIntensity = cl === 13 ? 0.05 : glowK * (0.8 + 0.2 * S(T * 9)); R.crownG.material.opacity = cl === 13 ? 0 : glowK * 0.9; R.crown.position.y = 3.3 - (meChair ? 0.6 : 0.25);
  R.gears.forEach((g, i) => g.rotation.z = T * (i % 2 ? 0.5 : -0.5) / g.userData.r);
  R.mOrbs.forEach((o, i) => { if (!meChair && !(cl === 11)) { o.position.y = -50; return; } const ph = (T * 0.8 + i / 8) % 1; const a = i / 8 * 2 * PI; o.position.set(MR[0] + C(a) * 6 * (1 - ph), 3.0 + 3 * (1 - ph) + 0.6 * ph, MR[2] - 0.75 + S(a) * 4 * (1 - ph)); o.position.sub(R.mach.position); o.material.opacity = 0.8 * S(ph * PI); });
  R.hale2.visible = cl >= 12 && cl !== 13; R.youngHale.visible = cl === 13; R.youngHale.userData.armR.rotation.x = -1.2 - 0.4 * Math.abs(S(T * 6)); R.youngHale.rotation.y = -0.6; R.youngHale.position.set(1.4, 0, 0.2);
  if (R.hale2.visible) { R.hale2.position.set(2.6, 0, 1.0); R.hale2.rotation.y = -0.9; R.hale2.userData.body.rotation.x = 0.15;
    if (cl === 12) { const k = prog(T, E.dark, E.dark + 1.6); R.hale2.position.set(lerp(5.4, 2.6, k), 0, lerp(-3.0, 1.0, k)); R.hale2.rotation.y = -0.6 - 0.3 * k; walk(R.hale2, T * 7, 0.4 * (1 - k)); }
    mouth(R.hale2, 14, T, cl === 14 && T > E.old - 0.1 && T < E.newp ? 'tired' : 'neutral'); if (cl === 14 && T > E.old - 0.1 && T < E.newp) R.hale2.userData.body.rotation.x = 0.35 + 0.08 * S(T * 9);
    if (cl === 14 && T > E.newp - 0.1) R.hale2.rotation.y = -1.4; if (cl >= 17) R.hale2.rotation.y = -1.1; }
  R.faceL.intensity = 30; R.backFace.material[1].emissiveIntensity = 0.9;
  // flashback wall
  const peace = cl === 13 && T > E.hate - 0.1; R.fbWall.visible = !peace; R.angry.forEach((p, i) => { if (peace) { setFace(p, i % 2 ? 'grin' : 'smile'); p.userData.armR.rotation.x = -0.6 - 0.4 * Math.abs(S(T * 4 + i)); return; } p.userData.armR.rotation.x = -2.6 - 0.3 * Math.abs(S(T * 7 + i)); p.userData.armL.rotation.x = -0.3; setFace(p, S(T * 9 + i) > 0 ? 'shout' : 'angry'); });
  R.hugA.visible = R.hugB.visible = cl === 13 && T > E.hate - 0.1; for (const p of [R.hugA, R.hugB]) { p.userData.armL.rotation.set(-1.4, 0, 0.5); p.userData.armR.rotation.set(-1.4, 0, -0.5); }
  R.hugA.position.x = FB[0] - 0.42 - R.fb.position.x; R.hugB.position.x = 0.42;
}
function shot(T) { const si = shotAt(T), sh = SH[si], t0 = sh[0], t1 = si + 1 < SH.length ? SH[si + 1][0] : TM.total; camera.fov = 50; camera.updateProjectionMatrix(); mood(sh[1], sh[2]); anim(T, si); sh[3](prog(T, t0, t1), T);
  if (sh[2] === O) { sun.target.position.set(camera.position.x * 0.5, 0, camera.position.z * 0.5 - 2); sun.position.copy(sun.target.position).add(new T3.Vector3(...MOODS[sh[1]].off)); }
  const cp = camera.position, v = new T3.Vector3(); PEOPLE.forEach(p => { const t_ = p.userData.tag; if (!t_) return; t_.getWorldPosition(v); const d = v.distanceTo(cp); t_.visible = d > 4.0 && d < 32; });
  return { si, t0 }; }

// ---------- overlay ----------
function txt(s_, x, y, size, col, align = 'center', font = 'Russo') { octx.font = `${size}px ${font}`; octx.fillStyle = col; octx.textAlign = align; octx.textBaseline = 'middle'; octx.fillText(s_, x, y); }
function big(s_, y, size, col, a = 1, x = 360) { if (a <= 0) return; y -= 90; octx.save(); octx.globalAlpha = Math.min(1, a); octx.font = `${size}px Russo`; octx.textAlign = 'center'; octx.textBaseline = 'middle'; octx.lineJoin = 'round'; octx.lineWidth = size * 0.2; octx.strokeStyle = 'rgba(4,4,8,0.92)'; const sc = a < 1 ? 1 + (1 - a) * 0.35 : 1; octx.translate(x, y); octx.scale(sc, sc); octx.strokeText(s_, 0, 0); octx.fillStyle = col; octx.fillText(s_, 0, 0); octx.restore(); }
function nameTag(name, role, col, a, y = 860) { if (a <= 0) return; octx.save(); octx.globalAlpha = Math.min(1, a); octx.font = '40px Russo'; const w = Math.max(octx.measureText(name).width, 200) + 70; const x = 360 - w / 2; octx.fillStyle = 'rgba(6,6,10,0.86)'; octx.beginPath(); octx.roundRect(x, y - 46, w, 98, 16); octx.fill(); octx.fillStyle = col; octx.fillRect(x, y - 46, 8, 98); txt(name, 364, y - 10, 40, col); txt(role, 364, y + 30, 22, '#c8c8d2'); octx.restore(); }
function likePill(T, l0, l1, fT) { if (T < l0 - 0.15 || T > l1 + 0.2) return; const k = ease(prog(T, l0 - 0.15, l0 + 0.15)) * (1 - ease(prog(T, l1 - 0.1, l1 + 0.2))); octx.save(); octx.globalAlpha = k; octx.fillStyle = 'rgba(8,8,12,0.88)'; octx.beginPath(); octx.roundRect(170, 920, 380, 70, 35); octx.fill(); octx.strokeStyle = '#ffd34a'; octx.lineWidth = 3; octx.stroke();
  octx.fillStyle = '#ff5a6a'; octx.save(); octx.translate(216, 955); octx.beginPath(); octx.moveTo(0, 12); octx.bezierCurveTo(-26, -6, -12, -26, 0, -12); octx.bezierCurveTo(12, -26, 26, -6, 0, 12); octx.fill(); octx.restore(); txt('LIKE', 270, 956, 24, '#fff'); const fo = T > fT; octx.fillStyle = fo ? '#5ad88a' : '#ff9a5a'; octx.beginPath(); octx.roundRect(340, 933, 190, 44, 22); octx.fill(); txt(fo && T > fT + 0.3 ? 'FOLLOWING' : '+ FOLLOW', 435, 956, 20, '#0a0a10'); octx.restore(); }
function mergeWords(ws) { const o = []; for (let i = 0; i < ws.length; i++) { let hit = null; for (const [seq, rep] of SEQ) if (seq.every((s_, k) => ws[i + k] && ws[i + k].w.toLowerCase().replace(/[^a-z]/g, '') === s_)) { hit = [seq.length, rep]; break; } if (hit) { const lw = ws[i + hit[0] - 1].w; o.push({ w: hit[1] + (/[.,?!]$/.test(lw) ? lw.slice(-1) : ''), a: ws[i].a, b: ws[i + hit[0] - 1].b }); i += hit[0] - 1; } else o.push(ws[i]); } return o; }
const SEQ = [[['four', 'hundred'], '400'], [['seven', 'year', 'old'], '7 year old'], [['seven'], '7'], [['eight'], '8'], [['sixty'], '60']];
const VCOL = { bm_george: '#ffd34a' }, VWHO = { bm_george: 'MR. HALE' };
const HL = /^(monday|mondays|swap|swaps|swapped|leo|hale|wall|chair|machine|wires|toast|homework|postman|croissants|400|7|8|60|yes|no|sunday)$/i;
const CAPS = []; CL.forEach((c0) => { const ws = mergeWords(c0.words); let cur = []; const flush = () => { if (cur.length) CAPS.push({ a: cur[0].a, b: cur[cur.length - 1].b, txt: cur.map(w => w.w).join(' '), col: VCOL[c0.voice] || '#fff', who: VWHO[c0.voice] }); cur = []; }; ws.forEach(w => { const cap_ = /^[A-Z]/.test(w.w) && !/^(I|Leo|Mister|Hale|Swap|Patrol|Monday|Mondays|Sunday|YES|NO|I'm)$/.test(w.w.replace(/[.,?!]/g, '')); if (cur.length && (cap_ || cur.length >= 4 || w.a - cur[cur.length - 1].b > 0.2 || /[.,?!]$/.test(cur[cur.length - 1].w))) flush(); cur.push(w); }); flush(); });
CAPS.forEach((c, i) => { const nx = CAPS[i + 1]; c.b = nx ? Math.min(nx.a, c.b + 0.35) : c.b + 0.8; c.txt = c.txt.replace(/[:\-"]/g, '.'); });
function caption(c) { octx.save(); octx.font = '50px Russo'; octx.textAlign = 'center'; octx.textBaseline = 'middle'; const words = c.txt.split(' '); const lines = []; let cur = ''; for (const w of words) { const x = cur ? cur + ' ' + w : w; if (octx.measureText(x).width > 620 && cur) { lines.push(cur); cur = w; } else cur = x; } lines.push(cur); const y0 = 1100 - (lines.length - 1) * 31;
  if (c.who) { octx.font = '24px Russo'; octx.lineWidth = 8; octx.strokeStyle = 'rgba(4,4,8,0.95)'; octx.strokeText(c.who, 360, y0 - 46); octx.fillStyle = c.col; octx.fillText(c.who, 360, y0 - 46); octx.font = '50px Russo'; }
  lines.forEach((l, i) => { octx.lineJoin = 'round'; octx.lineWidth = 12; octx.strokeStyle = 'rgba(4,4,8,0.95)'; octx.strokeText(l, 360, y0 + i * 62); octx.fillStyle = c.col; octx.fillText(l, 360, y0 + i * 62); }); octx.restore(); }

function pill(x, y, w, h, bg, stroke) { octx.save(); octx.fillStyle = bg; octx.beginPath(); octx.roundRect(x, y, w, h, h / 2); octx.fill(); if (stroke) { octx.strokeStyle = stroke; octx.lineWidth = 3; octx.stroke(); } octx.restore(); }
const WHEN = ['MONDAY 7.00', 'MONDAY 7.00', 'MONDAY', 'SATURDAY', 'SUNDAY 6.55 PM', 'MONDAY 7.00', 'SUNDAY 11.58 PM', 'MONDAY 7.00', 'MONDAY NIGHT', 'TUESDAY', 'SUNDAY 11.40 PM', 'SUNDAY 11.45 PM', 'SUNDAY 11.46 PM', '60 YEARS AGO', 'SUNDAY 11.50 PM', 'SUNDAY 11.55 PM', 'LAST MONTH', 'SUNDAY 11.58 PM', 'SUNDAY 11.59 PM'];
function hud(T) { const loop = T >= E.loop; const ci = loop ? 0 : CLI(T);
  pill(24, 36, 290, 64, 'rgba(10,12,28,0.78)', '#ffd34a'); txt('IN THIS TOWN...', 169, 69, 28, '#ffd34a');
  let wh = WHEN[ci]; if (ci === 0 && T > E.now0 - 0.1 && !loop) wh = 'SUNDAY 11.59 PM'; if (ci === 7 && T > E.patrol - 0.1) wh = 'MONDAY 8.00'; if (ci === 15 && false) wh = '';
  octx.font = '28px Russo'; const w = octx.measureText(wh).width + 44; pill(696 - w, 36, w, 64, ci === 13 ? 'rgba(90,60,20,0.85)' : 'rgba(10,12,28,0.78)'); txt(wh, 696 - w / 2, 69, 28, ci === 13 ? '#ffe2a8' : '#ffffff'); }
function captionHL(c) { octx.save(); octx.font = '52px Russo'; octx.textAlign = 'left'; octx.textBaseline = 'middle'; const words = c.txt.split(' '); const lines = []; let cur = []; const wd = a => octx.measureText(a.join(' ')).width;
  for (const w of words) { if (cur.length && wd([...cur, w]) > 620) { lines.push(cur); cur = [w]; } else cur.push(w); } lines.push(cur); const y0 = 1090 - (lines.length - 1) * 33;
  if (c.who) { octx.font = '26px Russo'; octx.textAlign = 'center'; octx.lineWidth = 8; octx.strokeStyle = 'rgba(4,4,8,0.95)'; octx.strokeText(c.who, 360, y0 - 50); octx.fillStyle = c.col; octx.fillText(c.who, 360, y0 - 50); octx.font = '52px Russo'; octx.textAlign = 'left'; }
  lines.forEach((l, i) => { let x = 360 - wd(l) / 2; const y = y0 + i * 66; const sp = octx.measureText(' ').width; l.forEach(w => { const bare = w.replace(/[.,?!']/g, '').replace(/s$/, m => m); octx.lineJoin = 'round'; octx.lineWidth = 13; octx.strokeStyle = 'rgba(4,4,8,0.95)'; octx.strokeText(w, x, y); octx.fillStyle = HL.test(w.replace(/[.,?!]/g, '')) ? '#ffd34a' : c.col; octx.fillText(w, x, y); x += octx.measureText(w).width + sp; }); }); octx.restore(); }
window.initFootball = async function () {
  await Promise.all(['30px Russo', '40px Russo'].map(f => document.fonts.load(f)));
  GLOW = ctex(64, 64, (c, w, h) => { const gr = c.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.3, 'rgba(255,255,255,0.5)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = gr; c.fillRect(0, 0, w, h); });
  makeFaces();
  glc = document.createElement('canvas'); glc.width = RW; glc.height = RH;
  renderer = new T3.WebGLRenderer({ canvas: glc, antialias: true, preserveDrawingBuffer: true }); renderer.setPixelRatio(1); renderer.setSize(RW, RH, false); renderer.outputColorSpace = T3.SRGBColorSpace; renderer.toneMapping = T3.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05; renderer.shadowMap.enabled = true; renderer.shadowMap.type = T3.PCFSoftShadowMap;
  scene = new T3.Scene(); scene.background = new T3.Color('#8fd3ff'); scene.fog = new T3.Fog('#cfeaff', 60, 220); camera = new T3.PerspectiveCamera(50, RW / RH, 0.05, 400); scene.add(camera); build();
  // clouds
  const cr = rng(31); for (let i = 0; i < 14; i++) { const c = new T3.Group(); c.position.set((cr() - 0.5) * 160, 34 + cr() * 14, -40 - cr() * 80); scene.add(c); for (let j = 0; j < 4; j++) add(c, Bx(6 + cr() * 6, 2 + cr() * 2, 4 + cr() * 3), BM('#ffffff'), j * 4 - 6, cr() * 1.5, cr() * 2, false); R.clouds = (R.clouds || []).concat(c); }
  out = document.getElementById('c'); octx = out.getContext('2d'); SNAP = document.createElement('canvas'); SNAP.width = W; SNAP.height = H;
};
window.DURATION = TM.total;
window.renderFrame = function (T) { const ci = CLI(T); const loop = T >= E.loop; const { si, t0 } = shot(T); (R.clouds || []).forEach(c => c.visible = curMood === 'day' || curMood === 'dawn' || curMood === 'eve'); renderer.render(scene, camera);
  const sepia = ci === 13 && !loop; octx.globalCompositeOperation = 'source-over'; octx.globalAlpha = 1; octx.filter = sepia ? 'sepia(0.75) contrast(1.05)' : 'saturate(1.12) contrast(1.04)'; octx.drawImage(glc, 0, 0, W, H); octx.filter = 'none';
  // quick punch-in on cuts
  const tk = prog(T, t0, t0 + 0.14); if (si > 0 && tk < 1 && !loop) { SNAP.getContext('2d').drawImage(out, 0, 0); const sc = 1 + (1 - tk) * 0.05; octx.drawImage(SNAP, 360 - 360 * sc, 640 - 640 * sc, W * sc, H * sc); }
  if (sepia) { const vg = octx.createRadialGradient(360, 640, 300, 360, 640, 820); vg.addColorStop(0, 'rgba(60,40,10,0)'); vg.addColorStop(1, 'rgba(60,40,10,0.55)'); octx.fillStyle = vg; octx.fillRect(0, 0, W, H); }
  else { const vg = octx.createRadialGradient(360, 640, 420, 360, 640, 900); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.35)'); octx.fillStyle = vg; octx.fillRect(0, 0, W, H); }
  // swap flash on the big swap moments
  for (const f of [E.wake + 0.5, E.swap7 + 0.15, E.sit + 0.3]) { const d = T - f; if (d > 0 && d < 0.3) { octx.fillStyle = `rgba(160,240,255,${0.45 * (1 - d / 0.3)})`; octx.fillRect(0, 0, W, H); } }
  hud(T);
  const fi = (a, d = 0.12) => prog(T, a - 0.1, a - 0.1 + d);
  if (ci === 0 || loop) { if (T < E.except0 - 0.1 || loop) { big('EVERY MONDAY', 380, 74, '#ffd34a', 1); big('EVERYONE SWAPS BODIES', 460, 44, '#fff', 1); } else if (T < E.now0 - 0.1) big('EXCEPT HIM', 400, 80, '#ffd34a', fi(E.except0)); else big('AND NOW . ME', 400, 80, '#7fe8ff', fi(E.now0)); }
  else if (ci === 1) { if (T < E.dadB - 0.1) big('7.00 AM . SWAP', 400, 64, '#7fe8ff', fi(E.wake)); else if (T > E.toast - 0.1) big("CAN'T MAKE TOAST", 400, 62, '#fff', fi(E.toast)); else if (T > E.four - 0.1) big('400 CROISSANTS', 400, 70, '#ffd34a', fi(E.four)); }
  else if (ci === 2) { if (T > E.hw - 0.1) big('STILL GAVE HOMEWORK', 400, 54, '#fff', fi(E.hw)); else big('TEACHER . AGE 1', 400, 60, '#ffd34a', fi(E.teach)); }
  else if (ci === 3) { if (T > E.post - 0.1) big('THE WIFE . THIS WEEK', 400, 56, '#ffb6e1', fi(E.post)); else big('NAME TAGS AT WEDDINGS', 400, 52, '#fff', fi(E.wed)); }
  else if (ci === 4) { big('ONE RULE', 380, 72, '#ffd34a', fi(E.rule)); if (T > E.bed - 0.1) big('BE IN BED BY 7', 460, 58, '#fff', fi(E.bed)); }
  else if (ci === 5) { nameTag('MR. HALE', 'CLOCK TOWER KEEPER', '#ffd34a', prog(T, E.hale, E.hale + 0.2) * (1 - prog(T, E.every5 - 0.3, E.every5 - 0.1))); if (T > E.never - 0.1) big('HE NEVER SWAPS', 400, 66, '#ffd34a', fi(E.never)); }
  else if (ci === 6) { nameTag('LEO', 'MY BEST FRIEND', '#ffb0a0', prog(T, E.leo, E.leo + 0.2) * (1 - prog(T, E.eyes - 0.3, E.eyes - 0.1))); if (T > E.eyes - 0.1) big('EYES WIDE OPEN', 400, 66, '#fff', fi(E.eyes)); }
  else if (ci === 7) { if (T > E.exLeo - 0.1 && T < E.patrol - 0.1) big('EXCEPT LEO', 400, 80, '#ff6b6b', fi(E.exLeo)); else if (T > E.patrol - 0.1) big('SWAP PATROL', 400, 66, '#d7a6ff', fi(E.patrol)); else big('7.00 AM', 400, 72, '#7fe8ff', fi(E.swap7)); }
  else if (ci === 9) { if (T > E.mayor - 0.1) big(T > E.shrug - 0.1 ? '*SHRUG*' : 'THE MAYOR . AGE 7', 400, 58, '#ffd34a', fi(T > E.shrug - 0.1 ? E.shrug : E.mayor)); else if (T > E.mondays - 0.1) big('"MONDAYS ARE MONDAYS"', 400, 50, '#fff', fi(E.mondays)); }
  else if (ci === 11) { if (T > E.strap - 0.1) big('LEO', 400, 84, '#ff6b6b', fi(E.strap)); else if (T > E.beds - 0.1 && T < E.chair - 0.1) big('ONE TO EVERY BED', 400, 58, '#7fe8ff', fi(E.beds)); else if (T > E.wires - 0.1 && T < E.beds) big('THOUSANDS OF WIRES', 400, 54, '#7fe8ff', fi(E.wires)); }
  else if (ci === 13) { if (T > E.hate - 0.1) { big("YOU CAN'T HATE SOMEONE", 380, 46, '#fff', fi(E.hate)); big("ONCE YOU'VE BEEN THEM", 450, 46, '#ffd34a', fi(E.hate + 0.6)); } else if (T < E.built - 0.1) big('THE WALL', 400, 76, '#fff', fi(E.wall)); }
  else if (ci === 14) { if (T < E.old - 0.1) big('ONE PERSON WHO NEVER SWAPS', 400, 40, '#ffd34a', fi(E.needs)); else if (T > E.newp - 0.1) big('SOMEONE NEW', 400, 66, '#7fe8ff', fi(E.newp)); }
  else if (ci === 15) { if (T > E.place - 0.1) big("B. TAKE LEO'S PLACE", 400, 54, '#7fe8ff', fi(E.place)); else if (T > E.unplug - 0.1) { big('A. UNPLUG IT', 380, 62, '#ff9a5a', fi(E.unplug)); big('THE WALL GOES BACK UP', 450, 40, '#fff', fi(E.unplug + 0.6)); } }
  else if (ci === 16) { if (T < E.hug - 0.1) big('THE WEEK I WAS DAD', 400, 54, '#9ad0ff', fi(E.dadwk)); }
  else if (ci === 18 && !loop) { if (T > E.sunday - 0.1) big('BE IN BED BY 7', 400, 66, '#ffd34a', fi(E.sunday)); else if (T > E.comment - 0.1) big('COMMENT YES OR NO', 400, 60, '#ffd34a', fi(E.comment)); else big('WOULD YOU SIT DOWN?', 400, 56, '#fff', fi(E.q)); }
  likePill(T, E.like, E.mum - 0.2, E.follow8);
  const cap = CAPS.find(c => T >= c.a && T < c.b); if (cap && !loop) captionHL(cap); };
})();
