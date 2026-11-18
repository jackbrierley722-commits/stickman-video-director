// Send this to your friend who's always late. Bright blocky 3D, text vs reality.
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
const E = { late0: AT(0, 'your'), shirt: CL[1].start, traffic: CL[2].start, door: AT(2, 'they'), comment: CL[3].start, waited: AT(3, 'waited'),
  but: CL[4].start, notrude: AT(4, "it's"), psych: AT(4, 'psychologists'), brain: AT(4, 'their'), every: AT(4, 'every'),
  think: CL[5].start, two: AT(5, 'two'), follow: CL[6].start, see: AT(6, "they'll") };
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

// ---------- sets ----------
const BA = [0, 0, 0], BD = [40, 0, 0], ND = [80, 0, 0], RS = [120, 0, 0];
const R = {}; const WINM = [];
function grp(at) { const g = new T3.Group(); g.position.set(at[0], at[1], at[2]); scene.add(g); return g; }
function place(p, g, x, z, ry = 0) { p.position.set(x, 0, z); p.rotation.y = ry; g.add(p); return p; }
function tree(g, x, z, s = 1) { const t = new T3.Group(); t.position.set(x, 0, z); t.scale.setScalar(s); g.add(t); add(t, Bx(0.5, 2, 0.5), SM('#7a5230'), 0, 1, 0); add(t, Bx(2.4, 1.6, 2.4), SM('#3fa34d'), 0, 2.6, 0); add(t, Bx(1.6, 1.0, 1.6), SM('#4cbf5a'), 0, 3.8, 0); return t; }
function house(g, x, z, ry, wall, roof, door = '#7a4a2a') { const h = new T3.Group(); h.position.set(x, 0, z); h.rotation.y = ry; g.add(h);
  add(h, Bx(6, 4.4, 6), SM(wall), 0, 2.2, 0); const rf = add(h, new T3.ConeGeometry(4.6, 2.6, 4), SM(roof), 0, 5.7, 0); rf.rotation.y = PI / 4;
  add(h, Bx(1.2, 2.2, 0.12), SM(door), 0, 1.1, 3.02); add(h, Bx(0.14, 0.14, 0.1), SM('#d4af37'), 0.42, 1.1, 3.1);
  for (const wx of [-1.9, 1.9]) { const wm = SM('#9fd3ff', { emissive: '#ffcf6a', emissiveIntensity: 0 }); WINM.push(wm); add(h, Bx(1.1, 1.1, 0.1), wm, wx, 2.6, 3.02); add(h, Bx(1.3, 0.12, 0.16), SM('#ffffff'), wx, 2.0, 3.04); }
  return h; }
function wallSet(g, w, h, d, col, floorCol, opts = {}) { add(g, Bx(w, 0.1, d), SM(floorCol, opts.floorMap ? { map: opts.floorMap } : {}), 0, 0.05, 0); add(g, Bx(w, h, 0.2), SM(col, opts.wallMap ? { map: opts.wallMap } : {}), 0, h / 2, -d / 2); add(g, Bx(0.2, h, d), SM(col, opts.wallMap ? { map: opts.wallMap } : {}), -w / 2, h / 2, 0); add(g, Bx(0.2, h, d), SM(col, opts.wallMap ? { map: opts.wallMap } : {}), w / 2, h / 2, 0); }
function texRep(w, h, f, rep) { const t = ctex(w, h, f); t.wrapS = t.wrapT = T3.RepeatWrapping; t.repeat.set(rep[0], rep[1]); return t; }
function phoneIn(p, side = 'R') { const ar = p.userData[side === 'R' ? 'armR' : 'armL']; const ph = new T3.Group(); ph.position.set(0, -0.82, 0.22); ar.add(ph); add(ph, Bx(0.3, 0.5, 0.05), SM('#111'), 0, 0, 0); const sc = add(ph, new T3.PlaneGeometry(0.26, 0.44), BM('#7fd0ff'), 0, 0, 0.03, false); ph.userData.sc = sc; return ph; }

function build() {
  hemi = new T3.HemisphereLight('#cfe9ff', '#7a9a5a', 1.2); scene.add(hemi); amb = new T3.AmbientLight('#ffffff', 0.25); scene.add(amb);
  sun = new T3.DirectionalLight('#fff4e0', 2.6); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); const sc = sun.shadow.camera; sc.left = -18; sc.right = 18; sc.top = 18; sc.bottom = -18; sc.near = 1; sc.far = 100; sun.shadow.bias = -0.0005; sun.shadow.normalBias = 0.03; scene.add(sun); scene.add(sun.target);
  add(scene, Bx(1200, 0.2, 1200), SM('#6cbf4a'), 0, -0.1, 0, false);
  const friend = (extra = {}) => person(Object.assign({ skin: '#e0a878', top: '#ff8c1a', bot: '#2e3d66', hair: '#3a2410', style: 'spiky', face: 'grin' }, extra));

  // ===== BATHROOM =====
  const BAG = grp(BA); const tile = texRep(64, 64, g => { g.fillStyle = '#bfe8f2'; g.fillRect(0, 0, 64, 64); g.strokeStyle = '#ffffff'; g.lineWidth = 3; g.strokeRect(0, 0, 32, 32); g.strokeRect(32, 0, 32, 32); g.strokeRect(0, 32, 32, 32); g.strokeRect(32, 32, 32, 32); }, [6, 3]);
  wallSet(BAG, 7, 4.2, 6, '#ffffff', '#e8eef2', { wallMap: tile });
  add(BAG, Bx(2.6, 0.2, 2.4), SM('#ffffff'), -1.6, 0.1, -1.6); // shower tray
  const glass = SM('#cfefff', { transparent: true, opacity: 0.18, roughness: 0.05 }); add(BAG, Bx(0.06, 3.0, 2.4), glass, -0.3, 1.6, -1.6, false); add(BAG, Bx(1.3, 3.0, 0.06), glass, -2.25, 1.6, -0.42, false);
  add(BAG, Cy(0.05, 0.05, 0.6, 8), SM('#c0c6cc', { metalness: 0.7, roughness: 0.3 }), -1.6, 3.4, -2.7).rotation.x = PI / 2; add(BAG, Cy(0.25, 0.2, 0.1, 16), SM('#c0c6cc', { metalness: 0.7, roughness: 0.3 }), -1.6, 3.3, -2.4);
  R.drops = []; const dm = BM('#9fd8ff', { transparent: true, opacity: 0.7 }); for (let i = 0; i < 40; i++) { const d = add(BAG, Bx(0.025, 0.25, 0.025), dm, 0, 0, 0, false); d.userData.r = [Math.random(), Math.random(), Math.random()]; R.drops.push(d); }
  R.steam = []; for (let i = 0; i < 10; i++) R.steam.push(glow(BAG, '#ffffff', 2.4, -1.6, 2.5, -1.6, 0));
  add(BAG, Bx(1.4, 0.9, 0.7), SM('#ffffff'), 2.0, 0.45, -2.6); add(BAG, Bx(1.2, 1.0, 0.06), SM('#dff4ff', { metalness: 0.6, roughness: 0.05 }), 2.0, 2.1, -2.95);
  R.clock = new T3.Group(); R.clock.position.set(1.0, 3.2, -2.88); BAG.add(R.clock); add(R.clock, Cy(0.45, 0.45, 0.08, 24), SM('#ffffff'), 0, 0, 0).rotation.x = PI / 2; add(R.clock, new T3.TorusGeometry(0.45, 0.05, 6, 24), SM('#e74c3c'), 0, 0, 0.02);
  R.cH = new T3.Group(); R.cH.position.z = 0.06; R.clock.add(R.cH); add(R.cH, Bx(0.06, 0.25, 0.02), BM('#111'), 0, 0.11, 0, false); R.cM = new T3.Group(); R.cM.position.z = 0.08; R.clock.add(R.cM); add(R.cM, Bx(0.04, 0.38, 0.02), BM('#111'), 0, 0.17, 0, false);
  R.fShower = friend({ top: '#e0a878', bot: '#ffffff', extras: [] }); place(R.fShower, BAG, -1.6, -1.6, 0.25); add(R.fShower.userData.head, Sp(0.38, 12, 8, 0, 2 * PI, 0, 1.6), SM('#ff7eb6'), 0, 0.2, -0.04).scale.set(1, 0.75, 1); 
  R.phS = phoneIn(R.fShower);

  // ===== BEDROOM (shirts) =====
  const BDG = grp(BD); wallSet(BDG, 8, 4, 6, '#ffe0b3', '#c99a6a');
  add(BDG, Bx(2.4, 3.4, 1.0), SM('#8a5a32'), -2.6, 1.7, -2.4); add(BDG, Bx(2.2, 3.1, 0.05), SM('#5a3a20'), -2.6, 1.75, -1.88);
  add(BDG, Bx(2.6, 0.6, 2.0), SM('#ffffff'), 2.2, 0.3, -1.8); add(BDG, Bx(2.6, 0.2, 2.0), SM('#74b9ff'), 2.2, 0.7, -1.8);
  const sr = rng(4); for (let i = 0; i < 14; i++) { const m = add(BDG, Bx(0.8, 0.06, 0.6), SM(['#e74c3c', '#2ecc71', '#f1c40f', '#9b59b6', '#ecf0f1', '#34495e'][i % 6]), 2.2 + (sr() - 0.5) * 1.8, 0.82 + i * 0.03, -1.8 + (sr() - 0.5) * 1.2); m.rotation.y = sr() * 3; }
  R.fShirt = friend({ top: '#e0a878', bot: '#ffffff', face: 'neutral' }); place(R.fShirt, BDG, 0, -0.6, 0); 
  R.shL = add(R.fShirt.userData.armL, Bx(0.8, 0.9, 0.06), SM('#e74c3c'), 0, -0.95, 0.3); R.shR = add(R.fShirt.userData.armR, Bx(0.8, 0.9, 0.06), SM('#2ecc71'), 0, -0.95, 0.3);
  R.flyShirts = []; for (let i = 0; i < 5; i++) R.flyShirts.push(add(BDG, Bx(0.8, 0.06, 0.6), SM(['#f1c40f', '#9b59b6', '#3498db', '#e67e22', '#1abc9c'][i]), 0, -5, 0));

  // ===== NEXT DOOR =====
  const NDG = grp(ND); house(NDG, -2.5, -4, 0, '#a0c4ff', '#c0392b').scale.setScalar(0.72); house(NDG, 2.5, -4, 0, '#ffd6a5', '#2c3e50').scale.setScalar(0.72); add(NDG, Bx(30, 0.06, 2.4), SM('#d9d2c3'), 0, 0.03, 0.4); add(NDG, Bx(1.0, 0.06, 2), SM('#d9d2c3'), -2.5, 0.03, -0.9); add(NDG, Bx(1.0, 0.06, 2), SM('#d9d2c3'), 2.5, 0.03, -0.9);
  add(NDG, Bx(0.15, 0.7, 3), SM('#ffffff'), 0, 0.35, -3.2); tree(NDG, -7, -4); tree(NDG, 7, -4); tree(NDG, 0, -9, 1.2);
  R.you = person({ skin: '#c68a5a', top: '#2a6fdb', bot: '#2d3436', hair: '#1a1a1a', style: 'short', face: 'angry' }); place(R.you, NDG, -2.5, -0.5, 0.25); tag(R.you, 'YOU', '#9ad0ff');
  R.fWalk = friend({ face: 'grin' }); place(R.fWalk, NDG, 2.5, -0.5, -PI / 2); tag(R.fWalk, 'LATE FRIEND', '#ffb26b');

  // ===== RESTAURANT (evening) =====
  const RSG = grp(RS); add(RSG, Bx(14, 5, 0.4), SM('#7a2e2e'), 0, 2.5, -3); add(RSG, Bx(14, 0.6, 1.4), SM('#2c3e50'), 0, 4.4, -2.3);
  add(RSG, Bx(5, 1.0, 0.1), BM('#ffffff', { map: ctex(512, 100, g => { g.fillStyle = '#2c3e50'; g.fillRect(0, 0, 512, 100); g.fillStyle = '#ffd34a'; g.font = '64px Russo'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('PIZZA', 256, 54); }) }), 0, 4.4, -1.55, false);
  for (const x of [-4.2, 4.2]) { const wm = SM('#ffe2a8', { emissive: '#ffcf6a', emissiveIntensity: 1.2 }); add(RSG, Bx(3, 2, 0.1), wm, x, 1.8, -2.75); }
  add(RSG, Bx(1.6, 2.6, 0.1), SM('#3a2010'), 0, 1.3, -2.75); add(RSG, Bx(14, 0.06, 4), SM('#9a9a9a'), 0, 0.03, -0.6);
  R.lampL = new T3.PointLight('#ffcf80', 18, 10, 1.6); R.lampL.position.set(0, 3.5, 0); RSG.add(R.lampL);
  R.you2 = person({ skin: '#c68a5a', top: '#2a6fdb', bot: '#2d3436', hair: '#1a1a1a', style: 'short', face: 'tired' }); place(R.you2, RSG, -1.6, -0.4, 0.2); 
  // clock face texture for the bathroom clock
}

// ---------- mood ----------
const MOODS = { day: { bg: '#8fd3ff', fog: '#cfeaff', hemi: 1.25, sun: 2.7, sc: '#fff4e0', off: [10, 22, 12], hs: '#cfe9ff' }, inside: { bg: '#8fd3ff', fog: '#cfeaff', hemi: 1.1, sun: 2.0, sc: '#fff4e0', off: [6, 20, 14], hs: '#ffffff' }, eve: { bg: '#2a2a5a', fog: '#2a2a5a', hemi: 0.45, sun: 0.6, sc: '#ffb07a', off: [-14, 10, 12], hs: '#6a5a9a' } };
let curMood = 'day';
function mood(m, at) { const M = MOODS[m]; curMood = m; scene.background.set(M.bg); scene.fog.color.set(M.fog); scene.fog.near = 40; scene.fog.far = 160; hemi.intensity = M.hemi; hemi.color.set(M.hs); sun.intensity = M.sun; sun.color.set(M.sc); sun.target.position.set(at[0], 0, at[2]); sun.position.set(at[0] + M.off[0], M.off[1], at[2] + M.off[2]); }
const P = (set, x, y, z) => [set[0] + x, set[1] + y, set[2] + z];

// ---------- shots ----------
const SH = [
  [0, 'inside', BA, (k, T) => dolly(P(BA, 0.6, 2.4, 3.0), P(BA, 0.3, 2.3, 2.3), P(BA, -1.6, 2.1, -1.6), P(BA, -1.6, 2.2, -1.6), k, T)],
  [E.late0 - 0.1, 'inside', BA, (k, T) => dolly(P(BA, -0.5, 2.3, 0.9), P(BA, -0.7, 2.3, 0.5), P(BA, -1.6, 2.2, -1.6), P(BA, -1.6, 2.3, -1.6), k, T)],
  [E.shirt, 'inside', BD, (k, T) => dolly(P(BD, 0.4, 2.2, 4.4), P(BD, 0.2, 2.1, 3.4), P(BD, 0, 1.7, -0.6), P(BD, 0, 1.8, -0.6), k, T)],
  [E.traffic, 'day', ND, (k, T) => dolly(P(ND, 0, 2.6, 12.5), P(ND, 0, 2.5, 11), P(ND, 0, 1.9, -1.5), P(ND, 0, 1.9, -1.5), k, T)],
  [E.door - 0.1, 'day', ND, (k, T) => dolly(P(ND, 0, 6.5, 8.5), P(ND, 0, 7, 7.5), P(ND, 0, 0.5, -1), P(ND, 0, 0.5, -1), k, T)],
  [E.comment, 'eve', RS, (k, T) => dolly(P(RS, 0.6, 2.0, 4.6), P(RS, 0.2, 2.0, 3.6), P(RS, -1.4, 1.8, -0.6), P(RS, -1.4, 1.9, -0.6), k, T)],
  [E.but, 'inside', BD, (k, T) => dolly(P(BD, 0, 2.2, 4.0), P(BD, 0, 2.2, 3.0), P(BD, 0, 2.2, -0.6), P(BD, 0, 2.3, -0.6), k, T)],
  [E.brain - 0.1, 'inside', BD, (k, T) => dolly(P(BD, 0.4, 2.4, 2.6), P(BD, 0.2, 2.4, 2.1), P(BD, 0, 2.4, -0.6), P(BD, 0, 2.4, -0.6), k, T)],
  [E.think, 'inside', BA, (k, T) => dolly(P(BA, 1.4, 2.6, 1.6), P(BA, 1.0, 2.8, 1.0), P(BA, 0.4, 2.8, -2.6), P(BA, 0.6, 3.0, -2.8), k, T)],
  [E.follow, 'inside', BA, (k, T) => dolly(P(BA, 0.0, 2.3, 1.6), P(BA, 0.2, 2.35, 2.6), P(BA, -1.6, 2.2, -1.6), P(BA, -1.6, 2.15, -1.6), k, T)],
  [E.loop, 'inside', BA, (k, T) => dolly(P(BA, 0.6, 2.4, 3.0), P(BA, 0.6, 2.4, 3.0), P(BA, -1.6, 2.1, -1.6), P(BA, -1.6, 2.1, -1.6), 0, 0)],
];
const shotAt = T => { let i = 0; for (let j = 0; j < SH.length; j++) if (T >= SH[j][0]) i = j; return i; };

function anim(T, si) { const ci = CLI(T), loop = T >= E.loop, Tt = loop ? 0 : T, cl = loop ? 0 : ci;
  PEOPLE.forEach(rest);
  // shower: water, steam, phone
  R.drops.forEach((d, i) => { const r = d.userData.r; const ph = (Tt * 2.2 + r[0]) % 1; d.position.set(-1.6 + (r[1] - 0.5) * 0.9, 3.2 - ph * 3.1, -1.6 + (r[2] - 0.5) * 0.9); });
  R.steam.forEach((s_, i) => { const ph = (Tt * 0.15 + i / 10) % 1; s_.position.set(-1.6 + S(i * 2.1) * 1.2, 1.8 + ph * 2.4, -1.6 + C(i * 1.7) * 0.8); s_.material.opacity = 0.22 * S(ph * PI); });
  const f = R.fShower; f.userData.armR.rotation.x = -1.35; f.userData.armR.rotation.z = 0.25; f.userData.head.rotation.x = 0.25; f.userData.armL.rotation.x = -0.2 - 0.25 * Math.abs(S(Tt * 3));
  setFace(f, cl === 6 && T > E.see - 0.1 ? 'shock' : (cl === 5 ? 'grin' : (talking(0, T) ? 'grin' : 'grin')));
  R.phS.userData.sc.material.color.set(cl === 6 && T > E.see - 0.2 ? '#ffffff' : '#7fd0ff');
  // bathroom clock: they think 2 minutes, reality spins
  const mins = cl === 5 ? 2 + 40 * prog(T, E.two - 0.2, E.follow) : 7; R.cM.rotation.z = -mins / 60 * 2 * PI; R.cH.rotation.z = -(7 + mins / 60) / 12 * 2 * PI;
  // shirts
  const fs = R.fShirt; const sw = Math.floor(T * 2.2) % 2; fs.userData.armL.rotation.x = -1.3 - (sw ? 0.3 : 0); fs.userData.armR.rotation.x = -1.3 - (sw ? 0 : 0.3); setFace(fs, cl === 1 ? (sw ? 'neutral' : 'tired') : cl === 4 ? (T > E.brain - 0.1 ? 'grin' : 'smile') : 'neutral');
  R.shL.material.color.set(['#e74c3c', '#9b59b6', '#f1c40f'][Math.floor(T * 1.5) % 3]); R.shR.material.color.set(['#2ecc71', '#3498db', '#ecf0f1'][Math.floor(T * 1.7) % 3]);
  R.shL.visible = R.shR.visible = cl === 1; if (cl === 4) { fs.userData.armL.rotation.x = 0; fs.userData.armR.rotation.x = 0; if (T > E.brain - 0.1) { fs.userData.armR.rotation.set(-2.4, 0, 0); } }
  R.flyShirts.forEach((m, i) => { const ph = (T * 1.3 + i / 5) % 1; if (cl !== 1) { m.position.y = -5; return; } m.position.set(-2.4 + ph * (4.2 + i * 0.2), 2.6 + S(ph * PI) * 1.2, -2.0); m.rotation.set(ph * 6, ph * 4, 0); });
  // next door: friend strolls 12 steps
  const kk = prog(T, E.door - 0.2, E.comment - 0.2); R.fWalk.position.set(lerp(2.5, -1.5, kk), 0, -0.3); R.fWalk.rotation.y = -PI / 2; if (kk > 0 && kk < 1) walk(R.fWalk, T * 7, 0.45); setFace(R.fWalk, 'grin');
  R.you.userData.legR.rotation.x = -0.25 * Math.max(0, S(T * 9)); R.you.userData.armL.rotation.set(-0.3, 0, 0.6); R.you.userData.armR.rotation.set(-0.3, 0, -0.6); setFace(R.you, kk > 0.9 ? 'shock' : 'angry');
  // restaurant: checking watch
  R.you2.userData.armL.rotation.x = -1.5; R.you2.userData.head.rotation.x = 0.3 * (S(T * 1.5) > 0 ? 1 : 0); setFace(R.you2, S(T * 1.5) > 0 ? 'tired' : 'sad'); R.you2.userData.legR.rotation.x = -0.2 * Math.max(0, S(T * 8));
}
function shot(T) { const si = shotAt(T), sh = SH[si], t0 = sh[0], t1 = si + 1 < SH.length ? SH[si + 1][0] : TM.total; camera.fov = 50; camera.updateProjectionMatrix(); mood(sh[1], sh[2]); anim(T, si); sh[3](prog(T, t0, t1), T);
  const cp = camera.position, v = new T3.Vector3(); PEOPLE.forEach(p => { const t_ = p.userData.tag; if (!t_) return; t_.getWorldPosition(v); const d = v.distanceTo(cp); t_.visible = d > 3.2 && d < 30; });
  return { si, t0 }; }

// ---------- overlay ----------
function txt(s_, x, y, size, col, align = 'center', font = 'Russo') { octx.font = `${size}px ${font}`; octx.fillStyle = col; octx.textAlign = align; octx.textBaseline = 'middle'; octx.fillText(s_, x, y); }
function big(s_, y, size, col, a = 1, x = 360) { if (a <= 0) return; y -= 90; octx.save(); octx.globalAlpha = Math.min(1, a); octx.font = `${size}px Russo`; octx.textAlign = 'center'; octx.textBaseline = 'middle'; octx.lineJoin = 'round'; octx.lineWidth = size * 0.2; octx.strokeStyle = 'rgba(4,4,8,0.92)'; const sc = a < 1 ? 1 + (1 - a) * 0.35 : 1; octx.translate(x, y); octx.scale(sc, sc); octx.strokeText(s_, 0, 0); octx.fillStyle = col; octx.fillText(s_, 0, 0); octx.restore(); }
function nameTag(name, role, col, a, y = 860) { if (a <= 0) return; octx.save(); octx.globalAlpha = Math.min(1, a); octx.font = '40px Russo'; const w = Math.max(octx.measureText(name).width, 200) + 70; const x = 360 - w / 2; octx.fillStyle = 'rgba(6,6,10,0.86)'; octx.beginPath(); octx.roundRect(x, y - 46, w, 98, 16); octx.fill(); octx.fillStyle = col; octx.fillRect(x, y - 46, 8, 98); txt(name, 364, y - 10, 40, col); txt(role, 364, y + 30, 22, '#c8c8d2'); octx.restore(); }
function likePill(T, l0, l1, fT) { if (T < l0 - 0.15 || T > l1 + 0.2) return; const k = ease(prog(T, l0 - 0.15, l0 + 0.15)) * (1 - ease(prog(T, l1 - 0.1, l1 + 0.2))); octx.save(); octx.globalAlpha = k; octx.fillStyle = 'rgba(8,8,12,0.88)'; octx.beginPath(); octx.roundRect(170, 920, 380, 70, 35); octx.fill(); octx.strokeStyle = '#ffd34a'; octx.lineWidth = 3; octx.stroke();
  octx.fillStyle = '#ff5a6a'; octx.save(); octx.translate(216, 955); octx.beginPath(); octx.moveTo(0, 12); octx.bezierCurveTo(-26, -6, -12, -26, 0, -12); octx.bezierCurveTo(12, -26, 26, -6, 0, 12); octx.fill(); octx.restore(); txt('LIKE', 270, 956, 24, '#fff'); const fo = T > fT; octx.fillStyle = fo ? '#5ad88a' : '#ff9a5a'; octx.beginPath(); octx.roundRect(340, 933, 190, 44, 22); octx.fill(); txt(fo && T > fT + 0.3 ? 'FOLLOWING' : '+ FOLLOW', 435, 956, 20, '#0a0a10'); octx.restore(); }
function mergeWords(ws) { const o = []; for (let i = 0; i < ws.length; i++) { let hit = null; for (const [seq, rep] of SEQ) if (seq.every((s_, k) => ws[i + k] && ws[i + k].w.toLowerCase().replace(/[^a-z]/g, '') === s_)) { hit = [seq.length, rep]; break; } if (hit) { const lw = ws[i + hit[0] - 1].w; o.push({ w: hit[1] + (/[.,?!]$/.test(lw) ? lw.slice(-1) : ''), a: ws[i].a, b: ws[i + hit[0] - 1].b }); i += hit[0] - 1; } else o.push(ws[i]); } return o; }
const SEQ = [[['forty', 'five'], '45'], [['forty'], '40'], [['five'], '5'], [['two'], '2']];
const VCOL = {}, VWHO = {};
const HL = /^(late|shower|shirt|next|door|late|40|45|5|2|planning|fallacy|best|case|follow|send|rude)$/i;
const CAPS = []; CL.forEach((c0) => { const ws = mergeWords(c0.words); let cur = []; const flush = () => { if (cur.length) CAPS.push({ a: cur[0].a, b: cur[cur.length - 1].b, txt: cur.map(w => w.w).join(' '), col: VCOL[c0.voice] || '#fff', who: VWHO[c0.voice] }); cur = []; }; ws.forEach(w => { const cap_ = /^[A-Z]/.test(w.w) && !/^(I|LATE|Psychologists)$/.test(w.w.replace(/[.,?!]/g, '')); if (cur.length && (cap_ || cur.length >= 4 || w.a - cur[cur.length - 1].b > 0.2 || /[.,?!]$/.test(cur[cur.length - 1].w))) flush(); cur.push(w); }); flush(); });
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

function bubble(T, t0, msg, time, y = 250) { const k = ease(prog(T, t0 - 0.1, t0 + 0.15)); if (k <= 0) return; octx.save(); octx.globalAlpha = k; const sc = 0.8 + 0.2 * k;
  octx.translate(360, y); octx.scale(sc, sc); txt('THEIR TEXT', 0, -62, 24, '#ffd34a'); octx.font = '44px Russo'; const w = octx.measureText(msg).width + 70;
  octx.fillStyle = '#2f8cff'; octx.beginPath(); octx.roundRect(-w / 2, -36, w, 72, 34); octx.fill(); octx.beginPath(); octx.moveTo(w / 2 - 30, 30); octx.lineTo(w / 2 + 6, 46); octx.lineTo(w / 2 - 6, 20); octx.fill();
  txt(msg, 0, 2, 44, '#fff'); txt(time + ' . DELIVERED', 0, 62, 20, '#cfe3ff'); octx.restore(); }
function reality(T, t0, y = 370) { const k = prog(T, t0 - 0.05, t0 + 0.15); if (k <= 0) return; octx.save(); octx.globalAlpha = k; pill(250, y - 28, 220, 56, '#ff3b5c'); txt('REALITY', 360, y + 2, 32, '#fff'); octx.restore(); }
function planGrid(T, t0) { const k = ease(prog(T, t0 - 0.1, t0 + 0.3)); if (k <= 0) return; octx.save(); octx.globalAlpha = k; const x0 = 70, y0 = 180, w = 580, h = 300; octx.fillStyle = 'rgba(10,12,28,0.88)'; octx.beginPath(); octx.roundRect(x0, y0, w, h, 26); octx.fill();
  txt('THEIR PLAN', x0 + 150, y0 + 44, 32, '#5ad88a'); txt('REALITY', x0 + 430, y0 + 44, 32, '#ff6b81'); octx.fillStyle = 'rgba(255,255,255,0.2)'; octx.fillRect(x0 + 290, y0 + 20, 2, h - 40);
  const rows = [['SHOWER', '2 MIN', '25 MIN'], ['PICK SHIRT', '1 MIN', '15 MIN'], ['ARRIVE', '7.00', '7.45']];
  rows.forEach((r, i) => { const a = prog(T, t0 + 0.2 + i * 0.35, t0 + 0.4 + i * 0.35); if (a <= 0) return; octx.globalAlpha = k * a; const y = y0 + 110 + i * 66; txt(r[0], x0 + 150, y - 18, 20, '#9aa'); txt(r[1], x0 + 150, y + 8, 38, '#fff'); txt(r[0], x0 + 430, y - 18, 20, '#9aa'); txt(r[2], x0 + 430, y + 8, 38, '#ffd34a'); }); octx.restore(); }
function notif(T, t0) { const k = ease(prog(T, t0 - 0.1, t0 + 0.25)); if (k <= 0) return; octx.save(); octx.globalAlpha = k; const y = lerp(-120, 40, k); octx.fillStyle = 'rgba(245,245,250,0.96)'; octx.beginPath(); octx.roundRect(40, y, 640, 120, 30); octx.fill();
  octx.fillStyle = '#ff3b5c'; octx.beginPath(); octx.roundRect(66, y + 26, 68, 68, 16); octx.fill(); txt('!', 100, y + 62, 44, '#fff'); txt('NEW MESSAGE . 45 MIN AGO', 160, y + 42, 22, '#666', 'left'); txt('Look what I found about you', 160, y + 80, 30, '#111', 'left'); octx.restore(); }
window.DURATION = TM.total;
window.renderFrame = function (T) { const ci = CLI(T); const loop = T >= E.loop; const { si, t0 } = shot(T); renderer.render(scene, camera);
  octx.globalCompositeOperation = 'source-over'; octx.globalAlpha = 1; octx.filter = 'saturate(1.12) contrast(1.04)'; octx.drawImage(glc, 0, 0, W, H); octx.filter = 'none';
  const tk = prog(T, t0, t0 + 0.14); if (si > 0 && tk < 1 && !loop) { SNAP.getContext('2d').drawImage(out, 0, 0); const sc = 1 + (1 - tk) * 0.05; octx.drawImage(SNAP, 360 - 360 * sc, 640 - 640 * sc, W * sc, H * sc); }
  const vg = octx.createRadialGradient(360, 640, 420, 360, 640, 900); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.3)'); octx.fillStyle = vg; octx.fillRect(0, 0, W, H);
  const fi = (a, d = 0.12) => prog(T, a - 0.1, a - 0.1 + d);
  if (ci === 0 || loop) { big('SEND THIS TO YOUR FRIEND', 170, 40, '#fff', 1); big("WHO'S ALWAYS LATE", 222, 48, '#ffd34a', 1); bubble(loop ? 1 : T, -0.3, '5 mins away', '7.00', 370); reality(loop ? 1 : T, -0.3, 480); if (T > E.late0 - 0.1 && !loop) big('STILL IN THE SHOWER', 640, 48, '#fff', fi(E.late0)); }
  else if (ci === 1) { bubble(T, E.shirt, 'leaving now', '7.20'); reality(T, E.shirt + 0.6); }
  else if (ci === 2) { bubble(T, E.traffic, 'traffic was crazy', '7.45'); reality(T, E.traffic + 0.5); if (T > E.door - 0.1) big('THEY LIVE NEXT DOOR', 560, 50, '#ffd34a', fi(E.door)); }
  else if (ci === 3) { big('COMMENT "LATE"', 330, 64, '#ffd34a', fi(E.comment)); if (T > E.waited - 0.1) { const m = Math.floor(lerp(0, 40, prog(T, E.waited, E.waited + 1.2))); big('WAITING . ' + m + ' MIN', 410, 50, '#fff', fi(E.waited)); } }
  else if (ci === 4) { if (T > E.brain - 0.1) { planGrid(T, E.brain); if (T > E.every - 0.1) big('EVERY. SINGLE. TIME.', 600, 48, '#ff6b81', fi(E.every)); } else if (T > E.psych - 0.1) { big('THE PLANNING', 330, 62, '#fff', fi(E.psych)); big('FALLACY', 410, 76, '#ffd34a', fi(E.psych + 0.4)); } else if (T > E.notrude - 0.1) big("IT'S NOT JUST RUDE", 360, 56, '#fff', fi(E.notrude)); }
  else if (ci === 5) { big('THEY THINK . 2 MIN', 330, 60, '#5ad88a', fi(E.think)); if (T > E.two + 0.3) big('ACTUALLY . ' + Math.floor(2 + 40 * prog(T, E.two, E.follow)) + ' MIN', 410, 52, '#ff6b81', 1); }
  else if (ci === 6 && !loop) { notif(T, E.see); big('SEND THIS TO THEM', 420, 60, '#ffd34a', fi(E.follow)); likePill(T, E.follow, E.loop - 0.05, E.follow + 0.3); }
  const cap = CAPS.find(c => T >= c.a && T < c.b); if (cap && !loop && ci !== 0) captionHL(cap); else if (cap && ci === 0 && !loop && T > E.late0 - 0.1) captionHL(cap); };
})();
