// Beat your brother to school: the bike, invented by spite. Deadpan How It's Made humour, blocky 3D.
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
const Bx = (w, h, d) => new T3.BoxGeometry(w, h, d), Cy = (a, b, h, n = 12) => new T3.CylinderGeometry(a, b, h, n), Sp = (r, a = 14, b = 10, ...x) => new T3.SphereGeometry(r, a, b, ...x);
function ctex(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); draw(g, w, h); const t = new T3.CanvasTexture(c); t.colorSpace = T3.SRGBColorSpace; t.anisotropy = 4; return t; }
function glow(p, col, size, x, y, z, op) { const s = new T3.Sprite(new T3.SpriteMaterial({ map: GLOW, color: col, transparent: true, opacity: op, blending: T3.AdditiveBlending, depthWrite: false })); s.scale.set(size, size, 1); s.position.set(x, y, z); p.add(s); return s; }
const L3 = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
function look(p, l, T = 0, sway = 1) { const sw = S(T * 0.8) * 0.03 * sway, br = S(T * 1.3) * 0.02 * sway; camera.position.set(p[0] + sw, p[1] + br, p[2]); camera.lookAt(l[0], l[1], l[2]); }
// dolly between two camera positions/targets over the shot (k = 0..1)
const dolly = (p0, p1, l0, l1, k, T, e = true) => { const q = e ? ease(k) : k; look(L3(p0, p1, q), L3(l0, l1, q), T); };

// ---------- timing ----------
const E = { invent: AT(0, 'you'), c1: CL[1].start, nopedal: AT(1, 'no'), running: AT(1, "you're"), walks: AT(1, 'your'), shit: AT(1, 'shit'),
  c2: CL[2].start, wheels: AT(2, 'but'), bump: AT(2, 'and'), bone: AT(2, 'they'),
  c3: CL[3].start, turn: AT(3, 'one'), genius: AT(3, 'genius'), pebble: AT(3, 'until'), over: AT(3, 'sends'),
  c4: CL[4].start, chain: AT(4, 'a'), same: AT(4, 'same'), safety: AT(4, 'the'),
  c5: CL[5].start, air: AT(5, 'so'), c6: CL[6].start, bus: AT(6, 'he') };
E.loop = TM.total - 0.4;
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

// ---------- one long street; the rider moves along +x ----------
const R = {}; const WINM = [];
function grp(at) { const g = new T3.Group(); g.position.set(at[0], at[1], at[2]); scene.add(g); return g; }
function tree(g, x, z, s = 1) { const t = new T3.Group(); t.position.set(x, 0, z); t.scale.setScalar(s); g.add(t); add(t, Bx(0.5, 2, 0.5), SM('#7a5230'), 0, 1, 0); add(t, Bx(2.4, 1.6, 2.4), SM('#3fa34d'), 0, 2.6, 0); add(t, Bx(1.6, 1.0, 1.6), SM('#4cbf5a'), 0, 3.8, 0); return t; }
function house(g, x, z, wall, roof) { const h = new T3.Group(); h.position.set(x, 0, z); g.add(h); add(h, Bx(6, 4.4, 6), SM(wall), 0, 2.2, 0); const rf = add(h, new T3.ConeGeometry(4.6, 2.6, 4), SM(roof), 0, 5.7, 0); rf.rotation.y = PI / 4; add(h, Bx(1.2, 2.2, 0.12), SM('#7a4a2a'), 0, 1.1, 3.02); for (const wx of [-1.9, 1.9]) add(h, Bx(1.1, 1.1, 0.1), SM('#9fd3ff'), wx, 2.6, 3.02); return h; }
// wheel in the XY plane (spins about Z); tyre thickness can grow (air tyres)
function wheel(r, mat, tube = 0.045) { const w = new T3.Group(); const ty = add(w, new T3.TorusGeometry(r, tube, 8, 28), mat, 0, 0, 0); w.userData.tyre = ty; for (let i = 0; i < 8; i++) { const s_ = add(w, Bx(0.025, r * 2 - 0.05, 0.025), SM('#bbbbbb', { metalness: 0.5 }), 0, 0, 0); s_.rotation.z = i / 8 * PI; } add(w, Cy(0.06, 0.06, 0.14, 10), SM('#555'), 0, 0, 0).rotation.x = PI / 2; return w; }
function crank(g, x, y) { const c = new T3.Group(); c.position.set(x, y, 0); g.add(c); for (const s of [-1, 1]) { const arm = new T3.Group(); arm.rotation.z = s > 0 ? 0 : PI; c.add(arm); add(arm, Bx(0.05, 0.3, 0.04), SM('#333'), 0, -0.15, 0.13 * s); add(arm, Bx(0.18, 0.05, 0.12), SM('#222'), 0, -0.3, 0.2 * s); } return c; }
function bikeDraisine() { const b = new T3.Group(); const wd = SM('#9a6a3a'); const iron = SM('#3a3a3a'); b.userData.wheels = [wheel(0.38, wd, 0.06), wheel(0.38, wd, 0.06)]; b.userData.wheels[0].position.set(0.6, 0.38, 0); b.userData.wheels[1].position.set(-0.6, 0.38, 0); b.userData.wheels.forEach(w => b.add(w));
  add(b, Bx(1.4, 0.12, 0.1), wd, 0, 0.78, 0); add(b, Bx(0.06, 0.42, 0.06), wd, 0.6, 0.58, 0); add(b, Bx(0.06, 0.42, 0.06), wd, -0.6, 0.58, 0); add(b, Bx(0.4, 0.06, 0.24), SM('#5a3a20'), -0.1, 0.86, 0); add(b, Bx(0.05, 0.4, 0.05), iron, 0.62, 1.0, 0); add(b, Bx(0.05, 0.05, 0.6), iron, 0.62, 1.2, 0); b.userData.seatY = 0.9; b.userData.seatX = -0.1; return b; }
function bikeBoneshaker() { const b = new T3.Group(); const wd = SM('#8a5a32'); const iron = SM('#2a2a2a', { metalness: 0.5 }); b.userData.wheels = [wheel(0.5, iron, 0.04), wheel(0.4, iron, 0.04)]; b.userData.wheels[0].position.set(0.65, 0.5, 0); b.userData.wheels[1].position.set(-0.65, 0.4, 0); b.userData.wheels.forEach(w => b.add(w));
  const fr = add(b, Bx(1.35, 0.08, 0.08), iron, 0, 0.95, 0); fr.rotation.z = 0.06; add(b, Bx(0.06, 0.5, 0.06), iron, 0.65, 0.75, 0); add(b, Bx(0.06, 0.55, 0.06), iron, -0.65, 0.68, 0); add(b, Bx(0.42, 0.06, 0.22), SM('#5a3a20'), -0.05, 1.02, 0); add(b, Bx(0.05, 0.4, 0.05), iron, 0.68, 1.2, 0); add(b, Bx(0.05, 0.05, 0.6), iron, 0.68, 1.4, 0);
  b.userData.crank = crank(b, 0.65, 0.5); b.userData.seatY = 1.06; b.userData.seatX = -0.05; b.userData.pedX = 0.65; return b; }
function bikePenny() { const b = new T3.Group(); const iron = SM('#1f1f1f', { metalness: 0.5 }); b.userData.wheels = [wheel(1.0, iron, 0.05), wheel(0.25, iron, 0.04)]; b.userData.wheels[0].position.set(0.35, 1.0, 0); b.userData.wheels[1].position.set(-1.05, 0.25, 0); b.userData.wheels.forEach(w => b.add(w));
  const cv = new T3.QuadraticBezierCurve3(new T3.Vector3(0.25, 2.05, 0), new T3.Vector3(-0.8, 2.0, 0), new T3.Vector3(-1.05, 0.3, 0)); add(b, new T3.TubeGeometry(cv, 20, 0.04, 6), iron, 0, 0, 0); add(b, Bx(0.38, 0.06, 0.22), SM('#5a3a20'), 0.05, 2.1, 0); add(b, Bx(0.05, 0.05, 0.7), iron, 0.4, 2.3, 0); add(b, Bx(0.05, 0.3, 0.05), iron, 0.38, 2.15, 0);
  b.userData.crank = crank(b, 0.35, 1.0); b.userData.seatY = 2.14; b.userData.seatX = 0.05; b.userData.pedX = 0.35; return b; }
function bikeSafety() { const b = new T3.Group(); const paint = SM('#e74c3c', { roughness: 0.35, metalness: 0.3 }); b.userData.tyreM = SM('#151515'); b.userData.wheels = [wheel(0.42, b.userData.tyreM, 0.04), wheel(0.42, b.userData.tyreM, 0.04)]; b.userData.wheels[0].position.set(0.62, 0.42, 0); b.userData.wheels[1].position.set(-0.62, 0.42, 0); b.userData.wheels.forEach(w => b.add(w));
  const tube = (a, c) => { const v = new T3.Vector3(c[0] - a[0], c[1] - a[1], 0); const L = v.length(); const m = add(b, Bx(L, 0.06, 0.06), paint, (a[0] + c[0]) / 2, (a[1] + c[1]) / 2, 0); m.rotation.z = Math.atan2(v.y, v.x); };
  tube([0, 0.42], [0.5, 0.95]); tube([0, 0.42], [-0.15, 1.0]); tube([-0.15, 1.0], [0.5, 0.95]); tube([-0.62, 0.42], [0, 0.42]); tube([-0.62, 0.42], [-0.15, 1.0]); tube([0.5, 0.95], [0.62, 0.42]);
  add(b, Bx(0.32, 0.06, 0.2), SM('#222'), -0.18, 1.08, 0); add(b, Bx(0.05, 0.3, 0.05), SM('#999'), 0.52, 1.1, 0); add(b, Bx(0.05, 0.05, 0.6), SM('#999'), 0.52, 1.25, 0);
  b.userData.chain = add(b, Bx(0.64, 0.035, 0.03), SM('#777', { metalness: 0.7 }), -0.31, 0.42, 0.09); b.userData.chain2 = add(b, Bx(0.64, 0.035, 0.03), SM('#777', { metalness: 0.7 }), -0.31, 0.5, 0.09); add(b, Cy(0.11, 0.11, 0.03, 14), SM('#888', { metalness: 0.7 }), 0, 0.46, 0.09).rotation.x = PI / 2;
  b.userData.crank = crank(b, 0, 0.44); b.userData.seatY = 1.12; b.userData.seatX = -0.18; b.userData.pedX = 0; return b; }

function build() {
  hemi = new T3.HemisphereLight('#cfe9ff', '#7a9a5a', 1.25); scene.add(hemi); amb = new T3.AmbientLight('#ffffff', 0.25); scene.add(amb);
  sun = new T3.DirectionalLight('#fff4e0', 2.7); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); const sc = sun.shadow.camera; sc.left = -16; sc.right = 16; sc.top = 16; sc.bottom = -16; sc.near = 1; sc.far = 100; sun.shadow.bias = -0.0005; sun.shadow.normalBias = 0.03; scene.add(sun); scene.add(sun.target);
  add(scene, Bx(1200, 0.2, 1200), SM('#6cbf4a'), 0, -0.1, 0, false);
  const G = grp([0, 0, 0]); R.G = G;
  add(G, Bx(400, 0.06, 5), SM('#55585e'), 150, 0.03, 0); for (let x = -40; x < 340; x += 4) add(G, Bx(1.6, 0.07, 0.15), BM('#f2f2f2'), x, 0.04, 1.6, false);
  add(G, Bx(400, 0.12, 2), SM('#d9d2c3'), 150, 0.06, -3.5); // pavement
  // cobbles for the boneshaker stretch
  const cb = rng(3); for (let i = 0; i < 260; i++) { const m = add(G, Bx(0.4, 0.08, 0.4), SM(['#8a8a8a', '#9c9c9c', '#7a7a7a'][i % 3]), 60 + cb() * 40, 0.07, (cb() - 0.5) * 4.4, false); m.rotation.y = cb(); }
  const cols = [['#ffd6a5', '#c0392b'], ['#a0c4ff', '#2c3e50'], ['#caffbf', '#8e44ad'], ['#ffadad', '#16a085'], ['#fdffb6', '#d35400'], ['#bdb2ff', '#c0392b']];
  for (let i = 0; i < 40; i++) { const x = -30 + i * 9; house(G, x, -9, cols[i % 6][0], cols[i % 6][1]); if (i % 2) tree(G, x + 4.5, -5.5, 0.9); }
  // school at the finish
  R.school = new T3.Group(); R.school.position.set(300, 0, -10); G.add(R.school); add(R.school, Bx(16, 7, 6), SM('#e8a87c'), 0, 3.5, 0); add(R.school, Bx(16.4, 0.5, 6.4), SM('#8a4a2a'), 0, 7.2, 0);
  add(R.school, Bx(5, 1.0, 0.1), BM('#fff', { map: ctex(512, 100, q => { q.fillStyle = '#1d3f8a'; q.fillRect(0, 0, 512, 100); q.fillStyle = '#fff'; q.font = '60px Russo'; q.textAlign = 'center'; q.textBaseline = 'middle'; q.fillText('SCHOOL', 256, 54); }) }), 0, 5.8, 3.06, false);
  for (const x of [-5, -2, 2, 5]) add(R.school, Bx(1.6, 1.6, 0.1), SM('#9fd3ff'), x, 3.2, 3.05); add(R.school, Bx(2, 3, 0.1), SM('#5a3a20'), 0, 1.5, 3.05);
  // the pebble
  R.pebble = add(G, Sp(0.12, 8, 6), SM('#777'), 0, 0.1, 0.3);
  // bikes
  R.bikes = [bikeDraisine(), bikeBoneshaker(), bikePenny(), bikeSafety()]; R.bikes.forEach(b => G.add(b));
  R.you = person({ s: 0.78, kid: true, skin: '#e0a878', top: '#2a6fdb', bot: '#2d3436', hair: '#3a2410', style: 'short', face: 'neutral' }); G.add(R.you); tag(R.you, 'YOU', '#9ad0ff');
  R.bro = person({ s: 0.8, kid: true, skin: '#e0a878', top: '#2ecc71', bot: '#2d3436', hair: '#3a2410', style: 'spiky', face: 'grin', extras: ['bag'] }); G.add(R.bro); tag(R.bro, 'BROTHER', '#8ff0a4');
  // bus
  R.bus = new T3.Group(); G.add(R.bus); add(R.bus, Bx(8, 2.8, 2.6), SM('#f1c40f'), 0, 1.8, 0); add(R.bus, Bx(8.02, 0.3, 2.62), SM('#222'), 0, 1.1, 0); for (let i = 0; i < 5; i++) add(R.bus, Bx(1.1, 0.9, 0.05), SM('#bfe6ff', { roughness: 0.1, transparent: true, opacity: 0.35 }), -3 + i * 1.5, 2.4, 1.31, false);
  for (const x of [-2.6, 2.6]) for (const z of [-1.2, 1.2]) add(R.bus, Cy(0.5, 0.5, 0.3, 12), SM('#151515'), x, 0.5, z).rotation.x = PI / 2;
  R.broBus = person({ s: 0.8, kid: true, skin: '#e0a878', top: '#2ecc71', bot: '#2d3436', hair: '#3a2410', style: 'spiky', face: 'sad' }); R.broBus.position.set(-1.5, 1.35, 0.95); R.bus.add(R.broBus); tag(R.broBus, 'BROTHER', '#8ff0a4');
  // tyre pump
  R.pump = new T3.Group(); G.add(R.pump); add(R.pump, Cy(0.06, 0.06, 0.7, 8), SM('#c0392b'), 0, 0.35, 0); add(R.pump, Bx(0.3, 0.05, 0.05), SM('#222'), 0, 0.75, 0); R.pumpH = R.pump.children[1];
  R.dust = []; for (let i = 0; i < 10; i++) R.dust.push(add(G, Sp(0.15, 6, 5), SM('#d9c9a8', { transparent: true, opacity: 0.6 }), 0, -5, 0, false));
}
const MOODS = { day: { bg: '#8fd3ff', fog: '#cfeaff', hemi: 1.25, sun: 2.7, sc: '#fff4e0', off: [8, 22, 14], hs: '#cfe9ff' } };
let curMood = 'day';
function mood(m, at) { const M = MOODS[m]; curMood = m; scene.background.set(M.bg); scene.fog.color.set(M.fog); scene.fog.near = 50; scene.fog.far = 180; hemi.intensity = M.hemi; hemi.color.set(M.hs); sun.intensity = M.sun; sun.color.set(M.sc); sun.target.position.set(at[0], 0, at[2]); sun.position.set(at[0] + M.off[0], M.off[1], at[2] + M.off[2]); }

// rider x along the street per clip
function riderX(T) { const ci = CLI(T);
  if (T >= E.loop || ci === 0) return 270 + (T >= E.loop ? 0 : T) * 6;  // finale speed (also frame 1)
  if (ci === 1) return 10 + (T - E.c1) * 1.3; if (ci === 2) return 62 + (T - E.c2) * 2.6; if (ci === 3) return 120 + Math.min(T, E.over) * 0 + (Math.min(T, E.over + 0.1) - E.c3) * 3.6; if (ci === 4) return 180 + (T - E.c4) * 0.0;
  if (ci === 5) return 200 + (T - E.c5) * 2.5; return 262 + (T - E.c6) * 6; }
function camFollow(x, k, T, dz = 6.5, dy = 1.6, lx = 0.4, ly = 1.3) { look([x + lx, dy, dz], [x + lx, ly, 0], T); }
const SH = [
  [0, 'day', (k, T) => { const x = riderX(T); look([x - 1.5, 1.6, 7.5], [x + 0.6, 1.2, 0], T); }],
  [E.c1, 'day', (k, T) => { const x = riderX(T); camFollow(x + 0.6, k, T, 5.6, 1.5, 0.3, 1.1); }],
  [E.walks - 0.1, 'day', (k, T) => { const x = riderX(T); look([x + 1.4, 1.4, 4.4], [x + 0.6, 1.2, 0], T); }],
  [E.c2, 'day', (k, T) => { const x = riderX(T); const sh = (T > E.bump - 0.1 && T < E.c3) ? 0.04 * S(T * 70) : 0; look([x + 0.2, 1.7 + sh, 5.4], [x + 0.2, 1.3 + sh, 0], T); }],
  [E.bone - 0.1, 'day', (k, T) => { const x = riderX(T); const sh = 0.05 * S(T * 70); look([x + 1.2, 1.5 + sh, 3.2], [x, 1.5 + sh, 0], T); }],
  [E.c3, 'day', (k, T) => { const x = riderX(T); look([x - 0.6, 2.2, 8.2], [x + 0.4, 1.9, 0], T); }],
  [E.pebble - 0.1, 'day', (k, T) => { const x = riderX(T); look([x + 2.4, 2.0, 8.4], [x + 2.4, 1.4, 0], T); }],
  [E.c4, 'day', (k, T) => { const x = riderX(T); dolly([x, 1.2, 4.6], [x, 1.1, 3.6], [x, 0.85, 0], [x, 0.85, 0], k, T); }],
  [E.c5, 'day', (k, T) => { const x = riderX(T); look([x + 0.4, 1.3, 4.2], [x + 0.2, 0.9, 0], T); }],
  [E.c6, 'day', (k, T) => { const x = riderX(T); look([x - 2, 2.2, 9.5], [x + 1, 1.5, -2], T); }],
  [E.bus - 0.1, 'day', (k, T) => { look([295.5, 2.4, 12.5], [295.5, 1.9, -1], T); }],
  [E.loop, 'day', (k, T) => { const x = riderX(0); look([x - 1.5, 1.6, 7.5], [x + 0.6, 1.2, 0], 0); }],
];
const shotAt = T => { let i = 0; for (let j = 0; j < SH.length; j++) if (T >= SH[j][0]) i = j; return i; };

function seatRider(b, x, T, pedal, ride = true) { b.position.set(x, 0, 0); b.visible = true; const u = R.you.userData; R.you.position.set(x + b.userData.seatX, b.userData.seatY - u.legH * 0.78 + 0.02, 0); R.you.rotation.y = PI / 2;
  b.userData.wheels.forEach(w => w.rotation.z = -pedal / (w.userData.tyre.geometry.parameters.radius));
  if (b.userData.crank) { b.userData.crank.rotation.z = -pedal / 0.45; } u.armL.rotation.x = u.armR.rotation.x = -1.3; u.body.rotation.x = 0.15;
  const ph = b.userData.crank ? b.userData.crank.rotation.z : 0; u.legL.rotation.x = -1.1 + 0.45 * S(ph); u.legR.rotation.x = -1.1 - 0.45 * S(ph); }
function anim(T, si) { const ci = CLI(T), loop = T >= E.loop, Tt = loop ? 0 : T, cl = loop ? 0 : ci;
  PEOPLE.forEach(rest); R.bikes.forEach(b => b.visible = false); R.bus.visible = false; R.pump.visible = false; R.broBus.visible = false; R.dust.forEach(d => d.position.y = -5);
  const x = riderX(T); const bro = R.bro, bu = bro.userData; bro.visible = true; bro.rotation.y = PI / 2;
  if (cl === 0 || cl === 6 && T < E.bus - 0.1) { const b = R.bikes[3]; seatRider(b, x, Tt, x * 1.2); b.userData.wheels.forEach(w => w.userData.tyre.scale.set(1, 1, 2.2)); setFace(R.you, 'grin');
    bro.position.set(cl === 0 ? 271.5 : x + 6 - (Tt - (cl === 0 ? 0 : E.c6)) * 0, 0, -0.6); if (cl === 0) bro.position.x = 270 + 1.5 - Tt * 0.6; else bro.position.x = 285; setFace(bro, 'shock'); bu.armL.rotation.x = -0.4;
    R.dust.forEach((d, i) => { const ph = (Tt * 2 + i / 10) % 1; d.position.set(x - 0.8 - ph * 2.5, 0.2 + ph * 0.5, (i % 3 - 1) * 0.2); d.scale.setScalar(0.5 + ph * 1.5); d.material.opacity = 0.5 * (1 - ph); }); }
  if (cl === 1) { const b = R.bikes[0]; b.position.set(x, 0, 0); b.visible = true; b.userData.wheels.forEach(w => w.rotation.z = -(x * 1.0) / 0.38); const u = R.you.userData; R.you.position.set(x + b.userData.seatX, b.userData.seatY - 0.55 + 0.1, 0); R.you.rotation.y = PI / 2;
    walk(R.you, T * 9, 0.75); u.armL.rotation.x = u.armR.rotation.x = -1.3; u.body.position.y = u.legH; setFace(R.you, T > E.walks ? 'angry' : 'tired');
    const bx = lerp(x - 1.5, x + 3.5, prog(T, E.walks - 0.3, CL[2].start)); bro.position.set(bx, 0, -0.9); walk(bro, T * 7, 0.5); setFace(bro, T > E.shit - 0.2 ? 'wink' : 'grin'); bu.head.rotation.y = -0.6; }
  if (cl === 2) { const b = R.bikes[1]; const shake = T > E.bump - 0.1 ? 0.05 * Math.abs(S(T * 45)) : 0; seatRider(b, x, T, x * 1.3); b.position.y = shake; R.you.position.y += shake * 2.2; setFace(R.you, T > E.bump - 0.1 ? (S(T * 20) > 0 ? 'shock' : 'wide') : 'grin'); bro.visible = false; }
  if (cl === 3) { const b = R.bikes[2]; const crashK = prog(T, E.over - 0.15, E.over + 0.9); const px = 120 + (E.over + 0.1 - E.c3) * 3.6 + 1.4; R.pebble.position.set(px, 0.1, 0); R.pebble.visible = true;
    if (crashK <= 0) { seatRider(b, x, T, x * 2.0); setFace(R.you, T > E.genius - 0.1 ? 'grin' : 'smile'); }
    else { b.visible = true; b.position.set(x, 0, 0); b.rotation.z = -0.5 * Math.min(1, crashK * 2); const u = R.you.userData; const fx = x + 0.4 + crashK * 3.2, fy = 2.2 + S(crashK * PI) * 1.4 - crashK * 2.0; R.you.position.set(fx, Math.max(0, fy), 0); R.you.rotation.set(0, PI / 2, 0); R.you.rotation.x = 0; R.you.rotation.z = 0;
      R.you.rotateZ(0); R.you.userData.body.rotation.x = 0; R.you.rotation.y = PI / 2; R.you.rotateX(crashK * 3.6); u.armL.rotation.x = u.armR.rotation.x = -3.0; u.legL.rotation.x = 0.6; u.legR.rotation.x = -0.6; setFace(R.you, 'shock'); }
    bro.visible = false; } else { R.pebble.visible = false; R.bikes[2].rotation.z = 0; R.you.rotation.x = 0; }
  if (cl === 4) { const b = R.bikes[3]; seatRider(b, x, T, T * 2.2); b.userData.wheels.forEach(w => w.userData.tyre.scale.set(1, 1, 1)); R.you.visible = T < E.chain - 0.2 || T > E.safety - 0.1; setFace(R.you, 'smile'); bro.visible = false; }
  else R.you.visible = true;
  if (cl === 5) { const b = R.bikes[3]; const inflate = prog(T, E.air, E.c6 - 0.2); const shake = T < E.air ? 0.04 * Math.abs(S(T * 50)) : 0; seatRider(b, x, T, x * 1.4); b.position.y = shake; R.you.position.y += shake * 2; b.userData.wheels.forEach(w => w.userData.tyre.scale.set(1 + inflate * 0.04, 1 + inflate * 0.04, 1 + inflate * 1.2));
    setFace(R.you, T < E.air ? (S(T * 25) > 0 ? 'shock' : 'wide') : 'grin'); R.pump.visible = T > E.air - 0.1 && T < E.c6 - 0.3; R.pump.position.set(x - 0.9, 0, 0.6); R.pumpH.position.y = 0.6 + 0.15 * Math.abs(S(T * 12)); bro.visible = false; }
  if (cl === 6 && T >= E.bus - 0.1) { const b = R.bikes[3]; b.visible = true; b.position.set(294.2, 0, 0.6); b.userData.wheels.forEach(w => w.userData.tyre.scale.set(1, 1, 2.2)); R.you.visible = true; R.you.position.set(295.4, 0, 0.9); R.you.rotation.y = 0.15; setFace(R.you, 'grin'); R.you.userData.armR.rotation.x = -2.9;
    R.bus.visible = true; R.broBus.visible = true; R.bus.position.set(lerp(290, 297.5, prog(T, E.bus - 0.1, E.loop)), 0, -2.0); bro.visible = false; }
}
function shot(T) { const si = shotAt(T), sh = SH[si], t0 = sh[0], t1 = si + 1 < SH.length ? SH[si + 1][0] : TM.total; camera.fov = 50; camera.updateProjectionMatrix(); mood(sh[1], [riderX(T), 0, 0]); anim(T, si); sh[2](prog(T, t0, t1), T);
  const cp = camera.position, v = new T3.Vector3(); PEOPLE.forEach(p => { const t_ = p.userData.tag; if (!t_) return; t_.getWorldPosition(v); const d = v.distanceTo(cp); t_.visible = d > 3.0 && d < 30; });
  return { si, t0 }; }

// ---------- overlay ----------
function txt(s_, x, y, size, col, align = 'center', font = 'Russo') { octx.font = `${size}px ${font}`; octx.fillStyle = col; octx.textAlign = align; octx.textBaseline = 'middle'; octx.fillText(s_, x, y); }
function big(s_, y, size, col, a = 1, x = 360) { if (a <= 0) return; y -= 90; octx.save(); octx.globalAlpha = Math.min(1, a); octx.font = `${size}px Russo`; octx.textAlign = 'center'; octx.textBaseline = 'middle'; octx.lineJoin = 'round'; octx.lineWidth = size * 0.2; octx.strokeStyle = 'rgba(4,4,8,0.92)'; const sc = a < 1 ? 1 + (1 - a) * 0.35 : 1; octx.translate(x, y); octx.scale(sc, sc); octx.strokeText(s_, 0, 0); octx.fillStyle = col; octx.fillText(s_, 0, 0); octx.restore(); }
function nameTag(name, role, col, a, y = 860) { if (a <= 0) return; octx.save(); octx.globalAlpha = Math.min(1, a); octx.font = '40px Russo'; const w = Math.max(octx.measureText(name).width, 200) + 70; const x = 360 - w / 2; octx.fillStyle = 'rgba(6,6,10,0.86)'; octx.beginPath(); octx.roundRect(x, y - 46, w, 98, 16); octx.fill(); octx.fillStyle = col; octx.fillRect(x, y - 46, 8, 98); txt(name, 364, y - 10, 40, col); txt(role, 364, y + 30, 22, '#c8c8d2'); octx.restore(); }
function likePill(T, l0, l1, fT) { if (T < l0 - 0.15 || T > l1 + 0.2) return; const k = ease(prog(T, l0 - 0.15, l0 + 0.15)) * (1 - ease(prog(T, l1 - 0.1, l1 + 0.2))); octx.save(); octx.globalAlpha = k; octx.fillStyle = 'rgba(8,8,12,0.88)'; octx.beginPath(); octx.roundRect(170, 920, 380, 70, 35); octx.fill(); octx.strokeStyle = '#ffd34a'; octx.lineWidth = 3; octx.stroke();
  octx.fillStyle = '#ff5a6a'; octx.save(); octx.translate(216, 955); octx.beginPath(); octx.moveTo(0, 12); octx.bezierCurveTo(-26, -6, -12, -26, 0, -12); octx.bezierCurveTo(12, -26, 26, -6, 0, 12); octx.fill(); octx.restore(); txt('LIKE', 270, 956, 24, '#fff'); const fo = T > fT; octx.fillStyle = fo ? '#5ad88a' : '#ff9a5a'; octx.beginPath(); octx.roundRect(340, 933, 190, 44, 22); octx.fill(); txt(fo && T > fT + 0.3 ? 'FOLLOWING' : '+ FOLLOW', 435, 956, 20, '#0a0a10'); octx.restore(); }
function mergeWords(ws) { const o = []; for (let i = 0; i < ws.length; i++) { let hit = null; for (const [seq, rep] of SEQ) if (seq.every((s_, k) => ws[i + k] && ws[i + k].w.toLowerCase().replace(/[^a-z]/g, '') === s_)) { hit = [seq.length, rep]; break; } if (hit) { const lw = ws[i + hit[0] - 1].w; o.push({ w: hit[1] + (/[.,?!]$/.test(lw) ? lw.slice(-1) : ''), a: ws[i].a, b: ws[i + hit[0] - 1].b }); i += hit[0] - 1; } else o.push(ws[i]); } return o; }
const SEQ = [[['shit'], 'S**T']];
const VCOL = {}, VWHO = {};
const HL = /^(brother|bike|pedals|boneshaker|massive|genius|pebble|handlebars|chain|safety|bicycle|air|bus|s\*\*t)$/i;
const CAPS = []; CL.forEach((c0) => { const ws = mergeWords(c0.words); let cur = []; const flush = () => { if (cur.length) CAPS.push({ a: cur[0].a, b: cur[cur.length - 1].b, txt: cur.map(w => w.w).join(' '), col: VCOL[c0.voice] || '#fff', who: VWHO[c0.voice] }); cur = []; }; ws.forEach(w => { const cap_ = /^[A-Z]/.test(w.w) && !/^(I|Genius|They|The)$/.test(w.w.replace(/[.,?!]/g, '')); if (cur.length && (cap_ || cur.length >= 4 || w.a - cur[cur.length - 1].b > 0.2 || /[.,?!]$/.test(cur[cur.length - 1].w))) flush(); cur.push(w); }); flush(); });
CAPS.forEach((c, i) => { const nx = CAPS[i + 1]; c.b = nx ? Math.min(nx.a, c.b + 0.35) : c.b + 0.8; c.txt = c.txt.replace(/[:\-"]/g, '.'); });
function caption(c) { octx.save(); octx.font = '50px Russo'; octx.textAlign = 'center'; octx.textBaseline = 'middle'; const words = c.txt.split(' '); const lines = []; let cur = ''; for (const w of words) { const x = cur ? cur + ' ' + w : w; if (octx.measureText(x).width > 620 && cur) { lines.push(cur); cur = w; } else cur = x; } lines.push(cur); const y0 = 1100 - (lines.length - 1) * 31;
  if (c.who) { octx.font = '24px Russo'; octx.lineWidth = 8; octx.strokeStyle = 'rgba(4,4,8,0.95)'; octx.strokeText(c.who, 360, y0 - 46); octx.fillStyle = c.col; octx.fillText(c.who, 360, y0 - 46); octx.font = '50px Russo'; }
  lines.forEach((l, i) => { octx.lineJoin = 'round'; octx.lineWidth = 12; octx.strokeStyle = 'rgba(4,4,8,0.95)'; octx.strokeText(l, 360, y0 + i * 62); octx.fillStyle = c.col; octx.fillText(l, 360, y0 + i * 62); }); octx.restore(); }

function pill(x, y, w, h, bg, stroke) { octx.save(); octx.fillStyle = bg; octx.beginPath(); octx.roundRect(x, y, w, h, h / 2); octx.fill(); if (stroke) { octx.strokeStyle = stroke; octx.lineWidth = 3; octx.stroke(); } octx.restore(); }
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
  out = document.getElementById('c'); octx = out.getContext('2d'); SNAP = document.createElement('canvas'); SNAP.width = W; SNAP.height = H;
};


function label(T, t0, top, sub, col = '#ffd34a', y = 180) { const k = ease(prog(T, t0 - 0.1, t0 + 0.2)); if (k <= 0) return; octx.save(); octx.globalAlpha = k; octx.font = '30px Russo'; const w = Math.max(octx.measureText(top).width, 160) + 60; pill(360 - w / 2, y, w, 60, col); txt(top, 360, y + 32, 30, '#111'); if (sub) txt(sub, 360, y + 88, 26, '#fff'); octx.restore(); }
function callout(T, t0, s_, x, y, col = '#ffd34a') { const k = ease(prog(T, t0 - 0.05, t0 + 0.2)); if (k <= 0) return; octx.save(); octx.globalAlpha = k; octx.font = '28px Russo'; const w = octx.measureText(s_).width + 36; pill(x - w / 2, y - 26, w, 52, 'rgba(10,12,28,0.88)', col); txt(s_, x, y + 1, 28, col); octx.restore(); }
window.DURATION = TM.total;
window.renderFrame = function (T) { const ci = CLI(T); const loop = T >= E.loop; const { si, t0 } = shot(T); renderer.render(scene, camera);
  octx.globalCompositeOperation = 'source-over'; octx.globalAlpha = 1; octx.filter = 'saturate(1.12) contrast(1.04)'; octx.drawImage(glc, 0, 0, W, H); octx.filter = 'none';
  const tk = prog(T, t0, t0 + 0.14); if (si > 0 && tk < 1 && !loop) { SNAP.getContext('2d').drawImage(out, 0, 0); const sc = 1 + (1 - tk) * 0.05; octx.drawImage(SNAP, 360 - 360 * sc, 640 - 640 * sc, W * sc, H * sc); }
  const vg = octx.createRadialGradient(360, 640, 420, 360, 640, 900); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.3)'); octx.fillStyle = vg; octx.fillRect(0, 0, W, H);
  const fi = (a, d = 0.12) => prog(T, a - 0.1, a - 0.1 + d);
  if (ci === 0 || loop) { big('YOU vs YOUR BROTHER', 230, 54, '#fff', 1); big('THE RACE TO SCHOOL', 300, 44, '#ffd34a', 1); }
  else if (ci === 1) { label(T, E.c1, '1817 . THE RUNNING MACHINE', 'NO PEDALS'); if (T > E.shit - 0.1) big('THE LITTLE S**T', 400, 58, '#ff6b6b', fi(E.shit)); }
  else if (ci === 2) { label(T, E.c2, '1860s . PEDALS ON THE FRONT', ''); if (T > E.bone - 0.1) big('REAL NICKNAME . THE BONESHAKER', 330, 38, '#fff', fi(E.bone)); }
  else if (ci === 3) { label(T, E.c3, '1870s . THE PENNY FARTHING', 'BIGGER WHEEL = FURTHER PER PEDAL'); if (T > E.genius - 0.1 && T < E.pebble - 0.1) big('GENIUS.', 400, 80, '#5ad88a', fi(E.genius)); if (T > E.pebble - 0.1 && T < E.over) callout(T, E.pebble, 'ONE PEBBLE', 470, 860, '#ff6b6b'); if (T > E.over) big('HEADFIRST', 400, 80, '#ff6b6b', fi(E.over)); }
  else if (ci === 4) { label(T, E.c4, '1885 . THE SAFETY BICYCLE', '', '#5ad88a'); callout(T, E.c4 + 0.2, 'PEDALS IN THE MIDDLE', 360, 960, '#ffd34a'); callout(T, E.chain, 'CHAIN TO THE BACK WHEEL', 360, 1030, '#7fe8ff'); callout(T, E.same, 'SAME SIZE WHEELS', 360, 900, '#ffb6e1'); }
  else if (ci === 5) { if (T < E.air - 0.1) big('*RATTLE RATTLE*', 330, 58, '#fff', fi(E.c5)); else label(T, E.air, '1888 . AIR TYRES', 'SMOOTH', '#7fe8ff'); }
  else if (ci === 6 && !loop) { if (T > E.bus - 0.1) big('HE TAKES THE BUS', 300, 58, '#ffd34a', fi(E.bus)); else big('EVERY. SINGLE. DAY.', 300, 54, '#fff', fi(E.c6)); }
  const cap = CAPS.find(c => T >= c.a && T < c.b); if (cap && !loop && !(ci === 4 && T > E.c4)) captionHL(cap); };
})();
