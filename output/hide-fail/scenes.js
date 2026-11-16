// How NOT to hide a body. Bright blocky 3D dark comedy: every attempt fails.
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
const E = { hide: AT(0, "here's"), a1: CL[1].start, bury: AT(1, 'bury'), dog: AT(1, 'next'), a2: CL[2].start, lakeW: AT(2, 'the'), fisher: AT(2, 'a'),
  a3: CL[3].start, frz: AT(3, 'the'), power: AT(3, 'then'), smell: AT(3, 'and'), like: CL[4].start, comment: AT(4, 'comment'), dumb: AT(4, 'which'),
  a4: CL[5].start, drive: AT(5, 'a'), posts: AT(5, 'your'), hand: AT(5, "there's"), rage: CL[6].start, still: AT(6, 'but'), fk: AT(6, 'fucking'),
  caught: CL[7].start, again: AT(7, 'again'), only: AT(7, 'the'), dont: AT(7, "don't") };
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
const YD = [0, 0, 0], LK = [50, 0, 0], GR = [100, 0, 0], DW = [150, 0, 0];
const R = {}; const WINM = []; const SIRENS = [];
function grp(at) { const g = new T3.Group(); g.position.set(at[0], at[1], at[2]); scene.add(g); return g; }
function place(p, g, x, z, ry = 0) { p.position.set(x, 0, z); p.rotation.y = ry; g.add(p); return p; }
function tree(g, x, z, s = 1) { const t = new T3.Group(); t.position.set(x, 0, z); t.scale.setScalar(s); g.add(t); add(t, Bx(0.5, 2, 0.5), SM('#7a5230'), 0, 1, 0); add(t, Bx(2.4, 1.6, 2.4), SM('#3fa34d'), 0, 2.6, 0); add(t, Bx(1.6, 1.0, 1.6), SM('#4cbf5a'), 0, 3.8, 0); return t; }
function house(g, x, z, ry, wall, roof) { const h = new T3.Group(); h.position.set(x, 0, z); h.rotation.y = ry; g.add(h);
  add(h, Bx(6, 4.4, 6), SM(wall), 0, 2.2, 0); const rf = add(h, new T3.ConeGeometry(4.6, 2.6, 4), SM(roof), 0, 5.7, 0); rf.rotation.y = PI / 4; add(h, Bx(1.2, 2.2, 0.12), SM('#7a4a2a'), 0, 1.1, 3.02);
  for (const wx of [-1.9, 1.9]) { const wm = SM('#9fd3ff', { emissive: '#ffcf6a', emissiveIntensity: 0 }); WINM.push(wm); add(h, Bx(1.1, 1.1, 0.1), wm, wx, 2.6, 3.02); } return h; }
function fence(g, x0, x1, z) { const fm = SM('#c49a6c'); for (let x = x0; x <= x1; x += 0.5) add(g, Bx(0.12, 1.3, 0.08), fm, x, 0.65, z); add(g, Bx(x1 - x0, 0.1, 0.06), fm, (x0 + x1) / 2, 1.0, z + 0.06); add(g, Bx(x1 - x0, 0.1, 0.06), fm, (x0 + x1) / 2, 0.4, z + 0.06); }
// the body: a rolled-up rug with two shoes poking out (cartoon, nothing graphic)
function rug(g, x, y, z, ry = 0) { const r = new T3.Group(); r.position.set(x, y, z); r.rotation.y = ry; g.add(r); const c = add(r, Cy(0.32, 0.32, 1.8, 14), SM('#b23a48', { map: ctex(64, 64, q => { q.fillStyle = '#b23a48'; q.fillRect(0, 0, 64, 64); q.fillStyle = '#e8c07a'; for (let i = 0; i < 64; i += 16) q.fillRect(0, i, 64, 4); }) }), 0, 0.32, 0); c.rotation.z = PI / 2;
  for (const z_ of [-0.12, 0.12]) add(r, Bx(0.18, 0.22, 0.14), SM('#2a2220'), 1.0, 0.3, z_); return r; }
function hand(g, x, y, z) { const h = new T3.Group(); h.position.set(x, y, z); g.add(h); const sk = SM('#e0a878'); add(h, Bx(0.22, 0.4, 0.14), sk, 0, 0.2, 0); for (let i = 0; i < 4; i++) add(h, Bx(0.045, 0.16, 0.06), sk, -0.075 + i * 0.05, 0.47, 0); add(h, Bx(0.05, 0.12, 0.06), sk, 0.13, 0.32, 0).rotation.z = -0.6; return h; }
function policeCar(g, x, z, ry) { const c = new T3.Group(); c.position.set(x, 0, z); c.rotation.y = ry; g.add(c); add(c, Bx(2.0, 0.8, 4.2), SM('#f4f4f4'), 0, 0.7, 0); add(c, Bx(1.8, 0.7, 2.2), SM('#f4f4f4'), 0, 1.45, -0.2); add(c, Bx(2.02, 0.25, 4.22), SM('#1d3f8a'), 0, 0.8, 0); add(c, Bx(1.7, 0.55, 2.0), SM('#1b2430', { roughness: 0.2 }), 0, 1.45, -0.2);
  for (const [wx, wz] of [[-0.95, 1.3], [0.95, 1.3], [-0.95, -1.3], [0.95, -1.3]]) add(c, Cy(0.38, 0.38, 0.3, 12), SM('#151515'), wx, 0.38, wz).rotation.z = PI / 2;
  const red = add(c, Bx(0.6, 0.18, 0.35), SM('#550000', { emissive: '#ff2030', emissiveIntensity: 0 }), -0.35, 1.9, -0.2), blue = add(c, Bx(0.6, 0.18, 0.35), SM('#000055', { emissive: '#2050ff', emissiveIntensity: 0 }), 0.35, 1.9, -0.2);
  const lr = new T3.PointLight('#ff2030', 0, 14, 1.5), lb = new T3.PointLight('#2050ff', 0, 14, 1.5); lr.position.set(-0.6, 2.4, -0.2); lb.position.set(0.6, 2.4, -0.2); c.add(lr); c.add(lb); SIRENS.push({ c, red, blue, lr, lb }); return c; }
function tape(g, pts) { const tm = SM('#ffd400', { map: ctex(256, 32, q => { q.fillStyle = '#ffd400'; q.fillRect(0, 0, 256, 32); q.fillStyle = '#111'; q.font = '20px Russo'; q.fillText('POLICE LINE . DO NOT CROSS', 8, 23); }) });
  for (let i = 0; i < pts.length - 1; i++) { const [a, b] = [pts[i], pts[i + 1]]; const L = Math.hypot(b[0] - a[0], b[1] - a[1]); const m = add(g, Bx(L, 0.18, 0.02), tm, (a[0] + b[0]) / 2, 1.0, (a[1] + b[1]) / 2, false); m.rotation.y = -Math.atan2(b[1] - a[1], b[0] - a[0]); }
  for (const p of pts) add(g, Cy(0.05, 0.05, 1.1, 6), SM('#ff7a00'), p[0], 0.55, p[1]); }
function dogMesh(g) { const d = new T3.Group(); g.add(d); const fur = SM('#a0652e'); add(d, Bx(0.45, 0.4, 0.9), fur, 0, 0.55, 0); const hd = add(d, Bx(0.4, 0.38, 0.4), fur, 0, 0.85, 0.5); add(d, Bx(0.22, 0.16, 0.2), SM('#7a4a20'), 0, 0.78, 0.76); add(d, Bx(0.08, 0.08, 0.04), BM('#111'), 0, 0.84, 0.86);
  for (const x of [-0.12, 0.12]) { add(d, Bx(0.07, 0.07, 0.02), BM('#111'), x, 0.92, 0.705); add(d, Bx(0.1, 0.22, 0.06), SM('#5a3510'), x * 1.5, 1.05, 0.45); }
  d.userData.legs = [[-0.15, 0.3], [0.15, 0.3], [-0.15, -0.3], [0.15, -0.3]].map(([x, z]) => { const l = new T3.Group(); l.position.set(x, 0.4, z); d.add(l); add(l, Bx(0.12, 0.4, 0.12), fur, 0, -0.2, 0); return l; });
  const tl = add(d, Bx(0.08, 0.08, 0.4), fur, 0, 0.75, -0.6); tl.rotation.x = -0.6; d.userData.tail = tl; return d; }

function build() {
  hemi = new T3.HemisphereLight('#cfe9ff', '#7a9a5a', 1.2); scene.add(hemi); amb = new T3.AmbientLight('#ffffff', 0.25); scene.add(amb);
  sun = new T3.DirectionalLight('#fff4e0', 2.6); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); const sc = sun.shadow.camera; sc.left = -18; sc.right = 18; sc.top = 18; sc.bottom = -18; sc.near = 1; sc.far = 100; sun.shadow.bias = -0.0005; sun.shadow.normalBias = 0.03; scene.add(sun); scene.add(sun.target);
  add(scene, Bx(1200, 0.2, 1200), SM('#6cbf4a'), 0, -0.1, 0, false);
  const you = (extra = {}) => person(Object.assign({ skin: '#e0a878', top: '#3b3b3b', bot: '#2d3436', hair: '#2b1a10', style: 'short', face: 'shock' }, extra));
  const cop = (i) => { const p = person({ skin: ['#c68a5a', '#ffd9b8', '#8d5a3a'][i % 3], top: '#1d2f5a', bot: '#1d2f5a', hair: '#1a1a1a', style: 'short', extras: ['cap'], capCol: '#1d2f5a', face: 'angry' }); return p; };

  // ===== BACKYARD =====
  const YG = grp(YD); house(YG, 0, -9, 0, '#ffd6a5', '#c0392b'); house(YG, 9, -9, 0, '#a0c4ff', '#2c3e50'); fence(YG, -6, 12, -4.5); tree(YG, -5, -2); tree(YG, 8, 1, 0.9);
  R.mound = add(YG, Sp(0.9, 10, 6, 0, 2 * PI, 0, PI / 2), SM('#6b4a2e'), -0.6, 0, 0.2); R.hole = add(YG, Cy(0.9, 0.9, 0.04, 16), BM('#2a1a10'), 0.9, 0.02, 0.4, false);
  R.shovel = new T3.Group(); YG.add(R.shovel); add(R.shovel, Cy(0.04, 0.04, 1.4, 6), SM('#8a5a32'), 0, 0.7, 0); add(R.shovel, Bx(0.3, 0.35, 0.04), SM('#8a8a8a', { metalness: 0.6 }), 0, 0.02, 0);
  R.rugY = rug(YG, 0.9, -0.1, 0.4, 0.3); R.youY = you({ face: 'shock' }); place(R.youY, YG, 2.2, 0.6, -1.0); tag(R.youY, 'YOU', '#ff9a9a');
  R.dog = dogMesh(YG); R.rugDog = rug(YG, 0, 0, 0, 0); R.copsY = [cop(0), cop(1)]; R.copsY.forEach((p, i) => { place(p, YG, 4 + i * 1.2, 3.5, PI + 0.4); tag(p, 'POLICE', '#9ad0ff'); }); R.carY = policeCar(YG, 6.5, 6, -0.6);
  tape(YG, [[2, 1.5], [6, 1.5], [6, 5], [2, 5]]); R.tapeY = YG.children.slice(-8);

  // ===== LAKE =====
  const LG = grp(LK); add(LG, Bx(60, 0.05, 40), SM('#2f8fd4', { roughness: 0.15, metalness: 0.1 }), 0, 0.05, -18); add(LG, Bx(60, 0.3, 4), SM('#d9c08a'), 0, 0.05, 3);
  add(LG, Bx(1.6, 0.2, 7), SM('#8a5a32'), -3, 0.5, -1.5); for (const z of [-4.5, -1.5, 1.5]) for (const x of [-3.6, -2.4]) add(LG, Cy(0.1, 0.1, 1.2, 6), SM('#6b4423'), x, 0.1, z);
  tree(LG, 8, 4); tree(LG, -10, 5, 1.2); tree(LG, 14, 6);
  R.boat = new T3.Group(); R.boat.position.set(3, 0.1, -7); LG.add(R.boat); add(R.boat, Bx(1.6, 0.5, 3.4), SM('#c0392b'), 0, 0.2, 0); add(R.boat, Bx(1.3, 0.1, 3.0), SM('#8a5a32'), 0, 0.42, 0);
  R.fisher = person({ skin: '#ffd9b8', top: '#f1c40f', bot: '#2e3d66', hair: '#7a7a7a', style: 'short', extras: ['beard'], face: 'grin' }); place(R.fisher, R.boat, 0, -0.6, PI / 2 + 0.3); R.fisher.position.y = 0.35; tag(R.fisher, 'FISHERMAN', '#ffe27a');
  R.rod = new T3.Group(); R.fisher.userData.armR.add(R.rod); R.rod.position.set(0, -0.8, 0.1); add(R.rod, Cy(0.025, 0.035, 2.6, 6), SM('#222'), 0, 1.1, 0.6).rotation.x = 0.5;
  R.rugL = rug(LG, 5.2, 0, -7, 0.4); R.line = add(LG, Cy(0.008, 0.008, 1, 4), BM('#ffffff'), 0, 0, 0, false);
  R.youL = you({ face: 'shock' }); place(R.youL, LG, -3, -3.6, 0); R.youL.position.y = 0.6; tag(R.youL, 'YOU', '#ff9a9a'); R.rugL0 = rug(LG, -3, 0.6, -4.6, PI / 2);
  R.splash = []; for (let i = 0; i < 10; i++) R.splash.push(add(LG, Sp(0.1, 6, 5), BM('#d8f0ff'), 0, -5, 0, false));
  R.copBoatCar = policeCar(LG, -9, 3.5, 0.4);

  // ===== GARAGE =====
  const GG = grp(GR); add(GG, Bx(9, 0.1, 7), SM('#8a8a8a'), 0, 0.05, 0); add(GG, Bx(9, 4, 0.2), SM('#b8b0a0'), 0, 2, -3.5); add(GG, Bx(0.2, 4, 7), SM('#b8b0a0'), -4.5, 2, 0); add(GG, Bx(0.2, 4, 7), SM('#b8b0a0'), 4.5, 2, 0);
  for (const y of [1.2, 2.2, 3.2]) add(GG, Bx(3, 0.08, 0.6), SM('#8a5a32'), 2.6, y, -3.1); for (let i = 0; i < 6; i++) add(GG, Bx(0.4, 0.4, 0.4), SM(['#e67e22', '#3498db', '#95a5a6'][i % 3]), 1.6 + (i % 3) * 0.8, 1.45 + Math.floor(i / 3), -3.1);
  R.freezer = new T3.Group(); R.freezer.position.set(-1.2, 0, -2.2); GG.add(R.freezer); add(R.freezer, Bx(2.4, 1.1, 1.1), SM('#f4f6f8'), 0, 0.55, 0); R.lid = new T3.Group(); R.lid.position.set(0, 1.12, -0.55); R.freezer.add(R.lid); add(R.lid, Bx(2.4, 0.1, 1.1), SM('#e8ecef'), 0, 0, 0.55);
  R.fzLight = add(R.freezer, Bx(0.12, 0.08, 0.02), SM('#002200', { emissive: '#30ff60', emissiveIntensity: 2 }), 0.9, 0.9, 0.56); R.rugF = rug(R.freezer, -0.9, 0.5, 0, 0);
  R.bulbG = new T3.PointLight('#fff2cc', 20, 14, 1.5); R.bulbG.position.set(0, 3.6, 0); GG.add(R.bulbG); R.bulbM = add(GG, Sp(0.15, 8, 6), SM('#fff', { emissive: '#fff2cc', emissiveIntensity: 2 }), 0, 3.7, 0, false);
  R.stink = []; for (let i = 0; i < 6; i++) R.stink.push(add(GG, new T3.TorusGeometry(0.25, 0.04, 6, 14, PI * 1.4), BM('#7dff5a', { transparent: true, opacity: 0 }), 0, 0, 0, false));
  R.youG = you({ face: 'shock' }); place(R.youG, GG, 0.6, -0.8, -0.9); tag(R.youG, 'YOU', '#ff9a9a');
  R.landlord = person({ skin: '#ffd9b8', top: '#8e7cc3', bot: '#4a4a4a', hair: '#dddddd', style: 'bald', extras: ['glasses', 'mustache'], face: 'angry' }); place(R.landlord, GG, 2.6, 2.6, -2.6); tag(R.landlord, 'LANDLORD', '#d7c4ff');
  R.copsG = [cop(1)]; place(R.copsG[0], GG, 3.6, 3.4, -2.6); tag(R.copsG[0], 'POLICE', '#9ad0ff');

  // ===== DRIVEWAY =====
  const DG = grp(DW); house(DG, 0, -7, 0, '#fdffb6', '#16a085'); tree(DG, -6, -3); tree(DG, 6, -4); add(DG, Bx(30, 0.06, 4), SM('#55585e'), 0, 0.03, 6);
  R.conc = add(DG, Bx(3.6, 0.12, 6), SM('#b8b8b8', { roughness: 0.9 }), 0, 0.06, 0.2); R.hand = hand(DG, 0.6, 0.06, 0.8);
  R.builder = person({ skin: '#c68a5a', top: '#ff7a00', bot: '#2e3d66', hair: '#1a1a1a', style: 'short', extras: ['cap'], capCol: '#f1c40f', face: 'grin' }); place(R.builder, DG, -2.6, 1.4, 0.6); tag(R.builder, 'BUILDER', '#ffbf7a');
  R.phB = new T3.Group(); R.builder.userData.armR.add(R.phB); R.phB.position.set(0, -0.82, 0.22); add(R.phB, Bx(0.3, 0.5, 0.05), SM('#111'), 0, 0, 0);
  R.trowel = add(R.builder.userData.armL, Bx(0.3, 0.04, 0.5), SM('#999', { metalness: 0.6 }), 0, -0.85, 0.2);
  R.carD = policeCar(DG, 4.5, 6, -1.2); R.copsD = [cop(0), cop(2)]; R.copsD.forEach((p, i) => { place(p, DG, 1.6 + i * 1.3, 3.8, PI + 0.3); tag(p, 'POLICE', '#9ad0ff'); });
  R.youD = you({ face: 'shout' }); place(R.youD, DG, 3.0, 3.0, 0.3); tag(R.youD, 'YOU', '#ff9a9a');
  R.det = person({ skin: '#8d5a3a', top: '#6b4a2e', bot: '#3a2e24', hair: '#1a1a1a', style: 'short', extras: ['coat', 'mustache'], face: 'neutral' }); place(R.det, DG, -0.4, 4.4, 0.2); tag(R.det, 'DETECTIVE', '#ffd34a'); R.detL = new T3.PointLight('#ffe8c0', 0, 8, 1.5); R.detL.position.set(-0.2, 2.6, 6.4); DG.add(R.detL);
}

// ---------- mood ----------
const MOODS = { day: { bg: '#8fd3ff', fog: '#cfeaff', hemi: 1.25, sun: 2.7, sc: '#fff4e0', off: [10, 22, 12], hs: '#cfe9ff', win: 0 }, night: { bg: '#0e1733', fog: '#0e1733', hemi: 0.35, sun: 0.7, sc: '#8fa8ff', off: [-10, 22, 12], hs: '#4a5a8a', win: 1.3 }, dark: { bg: '#05060a', fog: '#05060a', hemi: 0.12, sun: 0.0, sc: '#8fa8ff', off: [-10, 22, 12], hs: '#3a4a6a', win: 0.4 } };
let curMood = 'day';
function mood(m, at) { const M = MOODS[m]; curMood = m; scene.background.set(M.bg); scene.fog.color.set(M.fog); scene.fog.near = 40; scene.fog.far = 160; hemi.intensity = M.hemi; hemi.color.set(M.hs); sun.intensity = M.sun; sun.color.set(M.sc); sun.target.position.set(at[0], 0, at[2]); sun.position.set(at[0] + M.off[0], M.off[1], at[2] + M.off[2]); WINM.forEach(w => w.emissiveIntensity = M.win); }
const P = (set, x, y, z) => [set[0] + x, set[1] + y, set[2] + z];

// ---------- shots ----------
const SH = [
  [0, 'day', YD, (k, T) => dolly(P(YD, -1.5, 3.4, 9.5), P(YD, -1.2, 3.2, 8.4), P(YD, 2.5, 1.0, 2.5), P(YD, 2.6, 1.1, 2.4), k, T)],
  [E.hide - 0.1, 'night', YD, (k, T) => dolly(P(YD, 3.6, 2.2, 4.6), P(YD, 3.2, 2.1, 3.8), P(YD, 1.2, 1.0, 0.4), P(YD, 1.2, 1.1, 0.4), k, T)],
  [E.bury - 0.1, 'night', YD, (k, T) => dolly(P(YD, -2.6, 2.8, 4.4), P(YD, -2.2, 2.6, 3.6), P(YD, 1.2, 0.8, 0.4), P(YD, 1.2, 0.8, 0.4), k, T)],
  [E.dog - 0.1, 'day', YD, (k, T) => dolly(P(YD, -1.5, 2.6, 8.5), P(YD, -1.2, 2.8, 7.5), P(YD, 2.5, 0.8, 2.6), P(YD, 2.5, 0.9, 2.6), k, T)],
  [E.a2, 'night', LK, (k, T) => dolly(P(LK, 0.5, 2.4, 1.6), P(LK, 0.2, 2.3, 0.8), P(LK, -3, 1.2, -4.2), P(LK, -3, 1.0, -4.8), k, T)],
  [E.fisher - 0.1, 'day', LK, (k, T) => dolly(P(LK, 9, 2.6, -1.5), P(LK, 8, 2.8, -2.5), P(LK, 4, 1.6, -7), P(LK, 4.4, 2.2, -7), k, T)],
  [E.a3, 'day', GR, (k, T) => dolly(P(GR, 2.4, 2.6, 3.2), P(GR, 2.0, 2.5, 2.4), P(GR, -1.0, 1.0, -2.2), P(GR, -1.0, 1.0, -2.2), k, T)],
  [E.power - 0.1, 'dark', GR, (k, T) => dolly(P(GR, 1.8, 2.0, 2.4), P(GR, 1.4, 2.0, 1.8), P(GR, -1.2, 1.0, -2.2), P(GR, -1.2, 1.1, -2.2), k, T)],
  [E.smell - 0.1, 'day', GR, (k, T) => dolly(P(GR, -2.4, 2.4, 1.8), P(GR, -2.0, 2.3, 1.4), P(GR, 2.6, 1.9, 2.6), P(GR, 2.6, 1.9, 2.6), k, T)],
  [E.like, 'day', GR, (k, T) => dolly(P(GR, 0.4, 2.2, 2.6), P(GR, 0.5, 2.1, 1.8), P(GR, 0.6, 1.9, -0.8), P(GR, 0.6, 1.9, -0.8), k, T)],
  [E.a4, 'day', DW, (k, T) => dolly(P(DW, 4.5, 3.2, 8), P(DW, 3.6, 3.0, 6.8), P(DW, -0.6, 0.8, 0.6), P(DW, -0.6, 0.8, 0.6), k, T)],
  [E.posts - 0.1, 'day', DW, (k, T) => dolly(P(DW, -1.0, 2.2, 3.6), P(DW, -1.2, 2.2, 3.0), P(DW, -2.6, 1.9, 1.4), P(DW, -2.6, 1.9, 1.4), k, T)],
  [E.hand - 0.1, 'day', DW, (k, T) => dolly(P(DW, 1.4, 1.0, 2.4), P(DW, 1.0, 0.7, 1.8), P(DW, 0.6, 0.3, 0.8), P(DW, 0.6, 0.35, 0.8), k, T)],
  [E.rage, 'night', DW, (k, T) => dolly(P(DW, 3.2, 2.0, 7.0), P(DW, 3.1, 1.9, 6.0), P(DW, 3.0, 1.7, 3.0), P(DW, 3.0, 1.8, 3.0), k, T)],
  [E.still - 0.1, 'night', DW, (k, T) => dolly(P(DW, 3.2, 2.2, 5.0), P(DW, 3.1, 2.25, 4.6), P(DW, 3.0, 2.15, 3.0), P(DW, 3.0, 2.2, 3.0), k, T)],
  [E.caught, 'night', DW, (k, T) => dolly(P(DW, 0.6, 3.0, 10), P(DW, 1.0, 2.8, 8.8), P(DW, 3.0, 1.5, 3.0), P(DW, 3.0, 1.5, 3.0), k, T)],
  [E.only - 0.1, 'night', DW, (k, T) => dolly(P(DW, -0.2, 2.1, 6.8), P(DW, -0.3, 2.1, 6.0), P(DW, -0.4, 2.0, 4.4), P(DW, -0.4, 2.05, 4.4), k, T)],
  [E.loop, 'day', YD, (k, T) => dolly(P(YD, -1.5, 3.4, 9.5), P(YD, -1.5, 3.4, 9.5), P(YD, 2.5, 1.0, 2.5), P(YD, 2.5, 1.0, 2.5), 0, 0)],
];
const shotAt = T => { let i = 0; for (let j = 0; j < SH.length; j++) if (T >= SH[j][0]) i = j; return i; };

function anim(T, si) { const ci = CLI(T), loop = T >= E.loop, Tt = loop ? 0 : T, cl = loop ? 0 : ci;
  PEOPLE.forEach(rest);
  // sirens flash whenever police are on screen
  SIRENS.forEach(s_ => { const ph = Math.floor(Tt * 6) % 2; s_.red.material.emissiveIntensity = ph ? 3 : 0.2; s_.blue.material.emissiveIntensity = ph ? 0.2 : 3; s_.lr.intensity = ph ? 10 : 0; s_.lb.intensity = ph ? 0 : 10; });
  // ----- backyard -----
  const dig = (cl === 0 && T > E.hide - 0.1) || (cl === 1 && T < E.dog - 0.1); const fail1 = loop || (cl === 0 && T < E.hide - 0.1) || (cl === 1 && T > E.dog - 0.1);
  R.youY.visible = dig; R.shovel.visible = R.youY.visible; R.rugY.visible = !fail1; R.hole.visible = !fail1;
  if (R.youY.visible) { const u = R.youY.userData; const s_ = S(T * 7); u.armL.rotation.x = -1.2 + 0.5 * s_; u.armR.rotation.x = -1.2 + 0.5 * s_; u.body.rotation.x = 0.25 + 0.15 * s_; R.shovel.position.set(1.8, 0.2 + 0.25 * s_, 0.4); R.shovel.rotation.z = 0.5 + 0.2 * s_; setFace(R.youY, cl === 1 && T > E.bury ? 'tired' : 'shock'); if (cl === 0) { u.armL.rotation.x = u.armR.rotation.x = -0.4; u.body.rotation.x = 0; } }
  R.rugY.position.y = cl === 1 ? -0.35 * prog(T, E.bury, E.dog - 0.3) : 0; R.mound.scale.set(1, dig ? 0.3 + 0.7 * prog(T, E.bury, E.dog - 0.3) : 0.6, 1);
  R.dog.visible = R.rugDog.visible = fail1; const dk = cl === 0 ? 0.6 + 0.4 * prog(Tt, 0, 3) : prog(T, E.dog - 0.1, E.a2); R.dog.position.set(lerp(-1, 3, dk), 0, lerp(0.6, 2.6, dk)); R.dog.rotation.y = 1.05; R.dog.userData.legs.forEach((l, i) => l.rotation.x = S(Tt * 14 + i * PI) * 0.6); R.dog.userData.tail.rotation.y = S(Tt * 18) * 0.6;
  R.rugDog.position.set(R.dog.position.x - 1.3, 0, R.dog.position.z - 0.6); R.rugDog.rotation.y = 0.45;
  const copsOnY = fail1; R.copsY.forEach((p, i) => { p.visible = copsOnY; setFace(p, i ? 'shock' : 'angry'); p.userData.armR.rotation.x = i ? -2.4 : -0.3; }); R.carY.visible = copsOnY; R.tapeY.forEach(m => m.visible = copsOnY);
  // ----- lake -----
  const throwK = cl === 2 && T < E.fisher - 0.1 ? prog(T, E.a2 + 0.4, E.fisher - 0.3) : 1; R.rugL0.visible = cl === 2 && T < E.fisher - 0.1 && throwK < 0.98; R.rugL0.position.set(-3 + 0, lerp(0.6, -0.4, throwK), lerp(-4.6, -6.6, throwK)); R.rugL0.rotation.x = throwK * 2;
  R.youL.visible = cl === 2 && T < E.fisher - 0.1; R.youL.userData.armL.rotation.x = R.youL.userData.armR.rotation.x = -1.4 + throwK; setFace(R.youL, 'shock');
  R.splash.forEach((m, i) => { const ph = prog(T, E.fisher - 0.6, E.fisher - 0.1); if (cl !== 2 || ph <= 0 || ph >= 1) { m.position.y = -5; return; } const a = i / 10 * 2 * PI; m.position.set(-3 + C(a) * ph * 1.2, 0.2 + S(ph * PI) * 1.4, -6.6 + S(a) * ph * 1.2); });
  const reel = cl === 2 ? prog(T, E.fisher, E.fisher + 1.8) : 0; R.rugL.visible = cl === 2 && T > E.fisher - 0.1; R.rugL.position.set(5.6, lerp(-0.4, 2.2, ease(reel)), -6.6); R.rugL.rotation.z = 0.25 * S(T * 4);
  R.line.visible = R.rugL.visible; R.line.position.set(5.4, 3.0 + R.rugL.position.y * 0.5, -6.7); R.line.scale.y = Math.max(0.2, 4.6 - R.rugL.position.y); R.line.position.y = (R.rugL.position.y + 0.6 + 4.2) / 2 + 0.5;
  R.fisher.userData.armR.rotation.x = -1.2 - 0.3 * reel; R.fisher.userData.armL.rotation.x = -1.0; R.fisher.userData.body.rotation.x = -0.2 * reel; setFace(R.fisher, reel > 0.5 ? 'shock' : 'grin'); R.boat.rotation.z = S(T * 1.5) * 0.04;
  // ----- garage -----
  const lidOpen = cl === 3 && T < E.power - 0.3 ? 1 - prog(T, E.frz, E.power - 0.3) : 0; R.lid.rotation.x = -1.4 * lidOpen; R.rugF.visible = lidOpen > 0.05;
  const dark = cl === 3 && T > E.power - 0.1 && T < E.smell - 0.1; R.bulbG.intensity = dark ? 0 : 20; R.bulbM.material.emissiveIntensity = dark ? 0 : 2; R.fzLight.material.emissiveIntensity = cl === 3 && T > E.power ? 0 : 2;
  const stinkOn = (cl === 3 && T > E.power) || cl === 4; R.stink.forEach((m, i) => { const ph = (Tt * 0.5 + i / 6) % 1; m.position.set(-1.6 + i * 0.4, 1.3 + ph * 2.2, -2.2 + S(i) * 0.3); m.rotation.set(0, 0.4, ph * 4); m.material.opacity = stinkOn ? 0.9 * S(ph * PI) : 0; });
  R.youG.visible = cl === 3 || cl === 4; setFace(R.youG, cl === 4 ? (T > CL[4].start + 1.2 ? 'grin' : 'tired') : (T > E.smell ? 'shock' : 'neutral')); R.youG.userData.armR.rotation.x = cl === 3 && T < E.power ? -1.3 : (cl === 4 ? (T > CL[4].start + 1.2 ? -2.9 : -2.6) : 0);
  if (cl === 4) R.youG.userData.head.rotation.z = 0.1 * S(T * 3);
  R.landlord.visible = R.copsG[0].visible = (cl === 3 && T > E.smell - 0.1) || cl === 4; R.landlord.userData.armR.rotation.set(-2.5, 0, -0.4); R.landlord.userData.head.rotation.x = 0.1; setFace(R.landlord, 'angry');
  // ----- driveway -----
  const bk = cl === 5 && T < E.posts - 0.1; R.trowel.visible = bk; R.builder.userData.armL.rotation.x = bk ? -0.8 - 0.3 * S(T * 6) : 0; R.builder.userData.body.rotation.x = bk ? 0.4 : 0;
  R.phB.visible = cl === 5 && T > E.posts - 0.1; if (R.phB.visible) { R.builder.userData.armR.rotation.x = -2.6; R.builder.userData.armR.rotation.z = -0.3; setFace(R.builder, 'grin'); }
  R.builder.visible = cl === 5; R.hand.visible = true; R.hand.rotation.z = cl === 5 && T > E.hand ? 0.15 * S(T * 2) : 0;
  const end = cl >= 6; R.carD.visible = end || (cl === 5 && T > E.hand + 0.6); R.copsD.forEach((p, i) => { p.visible = end; p.position.set(3.0 + (i ? 0.95 : -0.95), 0, 3.0); p.rotation.y = 0.3; p.userData[i ? 'armL' : 'armR'].rotation.set(-0.9, 0, i ? 0.6 : -0.6); setFace(p, 'angry'); });
  R.youD.visible = end; if (end) { const u = R.youD.userData; u.armL.rotation.set(0.5, 0, 0.35); u.armR.rotation.set(0.5, 0, -0.35); // cuffed behind
    const stomp = Math.abs(S(T * (cl === 6 ? 10 : 5))); u.legL.rotation.x = cl === 6 ? -0.5 * stomp : 0; u.body.position.y = u.legH + (cl === 6 ? 0.08 * stomp : 0); u.head.rotation.z = cl === 6 ? 0.12 * S(T * 12) : 0; u.body.rotation.x = cl === 6 ? -0.15 : 0.1;
    setFace(R.youD, cl === 6 ? (talking(6, T) && S(T * 26) > -0.2 ? 'shout' : 'angry') : 'angry'); }
  R.det.visible = cl === 7 && T > E.only - 0.2; R.detL.intensity = R.det.visible ? 16 : 0; R.det.userData.armR.rotation.x = -1.5; mouth(R.det, 7, T, 'neutral');
}
function shot(T) { const si = shotAt(T), sh = SH[si], t0 = sh[0], t1 = si + 1 < SH.length ? SH[si + 1][0] : TM.total; camera.fov = 50; camera.updateProjectionMatrix(); mood(sh[1], sh[2]); anim(T, si); sh[3](prog(T, t0, t1), T);
  const cp = camera.position, v = new T3.Vector3(); PEOPLE.forEach(p => { const t_ = p.userData.tag; if (!t_) return; t_.getWorldPosition(v); const d = v.distanceTo(cp); t_.visible = d > 3.4 && d < 30; });
  return { si, t0 }; }

// ---------- overlay ----------
function txt(s_, x, y, size, col, align = 'center', font = 'Russo') { octx.font = `${size}px ${font}`; octx.fillStyle = col; octx.textAlign = align; octx.textBaseline = 'middle'; octx.fillText(s_, x, y); }
function big(s_, y, size, col, a = 1, x = 360) { if (a <= 0) return; y -= 90; octx.save(); octx.globalAlpha = Math.min(1, a); octx.font = `${size}px Russo`; octx.textAlign = 'center'; octx.textBaseline = 'middle'; octx.lineJoin = 'round'; octx.lineWidth = size * 0.2; octx.strokeStyle = 'rgba(4,4,8,0.92)'; const sc = a < 1 ? 1 + (1 - a) * 0.35 : 1; octx.translate(x, y); octx.scale(sc, sc); octx.strokeText(s_, 0, 0); octx.fillStyle = col; octx.fillText(s_, 0, 0); octx.restore(); }
function nameTag(name, role, col, a, y = 860) { if (a <= 0) return; octx.save(); octx.globalAlpha = Math.min(1, a); octx.font = '40px Russo'; const w = Math.max(octx.measureText(name).width, 200) + 70; const x = 360 - w / 2; octx.fillStyle = 'rgba(6,6,10,0.86)'; octx.beginPath(); octx.roundRect(x, y - 46, w, 98, 16); octx.fill(); octx.fillStyle = col; octx.fillRect(x, y - 46, 8, 98); txt(name, 364, y - 10, 40, col); txt(role, 364, y + 30, 22, '#c8c8d2'); octx.restore(); }
function likePill(T, l0, l1, fT) { if (T < l0 - 0.15 || T > l1 + 0.2) return; const k = ease(prog(T, l0 - 0.15, l0 + 0.15)) * (1 - ease(prog(T, l1 - 0.1, l1 + 0.2))); octx.save(); octx.globalAlpha = k; octx.fillStyle = 'rgba(8,8,12,0.88)'; octx.beginPath(); octx.roundRect(170, 920, 380, 70, 35); octx.fill(); octx.strokeStyle = '#ffd34a'; octx.lineWidth = 3; octx.stroke();
  octx.fillStyle = '#ff5a6a'; octx.save(); octx.translate(216, 955); octx.beginPath(); octx.moveTo(0, 12); octx.bezierCurveTo(-26, -6, -12, -26, 0, -12); octx.bezierCurveTo(12, -26, 26, -6, 0, 12); octx.fill(); octx.restore(); txt('LIKE', 270, 956, 24, '#fff'); const fo = T > fT; octx.fillStyle = fo ? '#5ad88a' : '#ff9a5a'; octx.beginPath(); octx.roundRect(340, 933, 190, 44, 22); octx.fill(); txt(fo && T > fT + 0.3 ? 'FOLLOWING' : '+ FOLLOW', 435, 956, 20, '#0a0a10'); octx.restore(); }
function mergeWords(ws) { const o = []; for (let i = 0; i < ws.length; i++) { let hit = null; for (const [seq, rep] of SEQ) if (seq.every((s_, k) => ws[i + k] && ws[i + k].w.toLowerCase().replace(/[^a-z]/g, '') === s_)) { hit = [seq.length, rep]; break; } if (hit) { const lw = ws[i + hit[0] - 1].w; o.push({ w: hit[1] + (/[.,?!]$/.test(lw) ? lw.slice(-1) : ''), a: ws[i].a, b: ws[i + hit[0] - 1].b }); i += hit[0] - 1; } else o.push(ws[i]); } return o; }
const SEQ = [[['fucking'], 'F***ING']];
const VCOL = { am_puck: '#ff6b6b' }, VWHO = { am_puck: 'YOU' };
const HL = /^(backyard|lake|freezer|concrete|driveway|dog|fisherman|landlord|smell|hand|police|caught|again|everything|f\*\*\*ing|a|b|c)$/i;
const CAPS = []; CL.forEach((c0) => { const ws = mergeWords(c0.words); let cur = []; const flush = () => { if (cur.length) CAPS.push({ a: cur[0].a, b: cur[cur.length - 1].b, txt: cur.map(w => w.w).join(' '), col: VCOL[c0.voice] || '#fff', who: VWHO[c0.voice] }); cur = []; }; ws.forEach(w => { const cap_ = /^[A-Z]/.test(w.w) && !/^(I|A|B|C|Attempt|Comment|Like)$/.test(w.w.replace(/[.,?!]/g, '')); if (cur.length && (cap_ || cur.length >= 4 || w.a - cur[cur.length - 1].b > 0.2 || /[.,?!]$/.test(cur[cur.length - 1].w))) flush(); cur.push(w); }); flush(); });
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


function failStamp(T, t0, n) { const k = prog(T, t0 - 0.05, t0 + 0.15); if (k <= 0) return; octx.save(); const sc = 1 + (1 - k) * 1.2; octx.globalAlpha = Math.min(1, k * 1.2); octx.translate(360, 560); octx.rotate(-0.12); octx.scale(sc, sc);
  octx.strokeStyle = '#ff2b3a'; octx.lineWidth = 10; octx.strokeRect(-210, -62, 420, 124); octx.font = '86px Russo'; octx.textAlign = 'center'; octx.textBaseline = 'middle'; octx.fillStyle = '#ff2b3a'; octx.fillText('FAILED', 0, 6); octx.restore();
  octx.save(); octx.globalAlpha = k; pill(230, 650, 260, 56, 'rgba(10,10,20,0.85)', '#ff2b3a'); txt('FAILS . ' + n + '/4', 360, 680, 30, '#ffffff'); octx.restore(); }
function attempt(T, t0, n, what) { const k = ease(prog(T, t0 - 0.1, t0 + 0.2)); if (k <= 0) return; octx.save(); octx.globalAlpha = k; pill(205, 150, 310, 60, '#ffd34a'); txt('ATTEMPT ' + n, 360, 182, 34, '#111'); big(what, 330, 56, '#ffffff', k); octx.restore(); }
function postCard(T, t0) { const k = ease(prog(T, t0 - 0.1, t0 + 0.3)); if (k <= 0) return; octx.save(); octx.globalAlpha = k; const y = lerp(260, 200, k); octx.fillStyle = 'rgba(250,250,252,0.97)'; octx.beginPath(); octx.roundRect(90, y, 540, 420, 26); octx.fill();
  octx.fillStyle = '#ff7a00'; octx.beginPath(); octx.arc(140, y + 50, 26, 0, 7); octx.fill(); txt('B', 140, y + 52, 26, '#fff'); txt('builder_bob', 180, y + 40, 26, '#111', 'left'); txt('Fresh driveway. 10/10 work', 180, y + 72, 22, '#555', 'left');
  octx.fillStyle = '#b8b8b8'; octx.fillRect(110, y + 100, 500, 230); octx.fillStyle = '#9a9a9a'; for (let i = 0; i < 6; i++) octx.fillRect(110, y + 100 + i * 40, 500, 2);
  const hx = 420, hy = y + 250; octx.fillStyle = '#e0a878'; octx.fillRect(hx, hy - 50, 30, 50); for (let i = 0; i < 4; i++) octx.fillRect(hx + i * 8, hy - 72, 6, 24); octx.strokeStyle = '#ff2b3a'; octx.lineWidth = 5; octx.beginPath(); octx.arc(hx + 15, hy - 40, 52, 0, 7); octx.stroke();
  txt('POLICE: we need to talk', 110, y + 375, 24, '#1d3f8a', 'left'); octx.restore(); }
window.DURATION = TM.total;
window.renderFrame = function (T) { const ci = CLI(T); const loop = T >= E.loop; const { si, t0 } = shot(T); renderer.render(scene, camera);
  octx.globalCompositeOperation = 'source-over'; octx.globalAlpha = 1; octx.filter = 'saturate(1.12) contrast(1.04)'; octx.drawImage(glc, 0, 0, W, H); octx.filter = 'none';
  const tk = prog(T, t0, t0 + 0.14); if (si > 0 && tk < 1 && !loop) { SNAP.getContext('2d').drawImage(out, 0, 0); const sc = 1 + (1 - tk) * 0.05; octx.drawImage(SNAP, 360 - 360 * sc, 640 - 640 * sc, W * sc, H * sc); }
  if (curMood === 'night' && SIRENS.length && ci >= 6 && !loop) { const ph = Math.floor(T * 6) % 2; octx.fillStyle = ph ? 'rgba(255,30,50,0.06)' : 'rgba(40,80,255,0.06)'; octx.fillRect(0, 0, W, H); }
  const vg = octx.createRadialGradient(360, 640, 420, 360, 640, 900); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.35)'); octx.fillStyle = vg; octx.fillRect(0, 0, W, H);
  const fi = (a, d = 0.12) => prog(T, a - 0.1, a - 0.1 + d);
  if (ci === 0 || loop) { if (T < E.hide - 0.1 || loop) { big('SO YOU KILLED SOMEONE...', 200, 46, '#fff', 1); big('HOW TO HIDE THE BODY', 270, 54, '#ffd34a', 1); failStamp(loop ? 1 : T + 1, 0, 1); } else { big('HOW TO HIDE THE BODY', 270, 54, '#ffd34a', 1); txt('(A COMEDY OF FAILURES)', 360, 240, 26, '#fff'); } }
  else if (ci === 1) { if (T < E.dog - 0.1) attempt(T, E.a1, 1, 'THE BACKYARD'); else failStamp(T, E.dog + 0.3, 1); }
  else if (ci === 2) { if (T < E.fisher - 0.1) attempt(T, E.a2, 2, 'THE LAKE'); else { big('BIGGEST CATCH EVER', 300, 52, '#fff', fi(E.fisher)); failStamp(T, E.fisher + 1.6, 2); } }
  else if (ci === 3) { if (T < E.power - 0.1) attempt(T, E.a3, 3, 'THE FREEZER'); else if (T < E.smell - 0.1) big('POWER CUT', 330, 70, '#7dff5a', fi(E.power)); else failStamp(T, E.smell + 0.6, 3); }
  else if (ci === 4) { big('DEEP BREATH...', 300, 62, '#fff', fi(CL[4].start)); if (T > CL[4].start + 1.2) big('ONE LAST IDEA', 380, 58, '#ffd34a', fi(CL[4].start + 1.3)); }
  else if (ci === 5) { if (T < E.posts - 0.1) attempt(T, E.a4, 4, 'FRESH CONCRETE'); else if (T < E.hand - 0.1) postCard(T, E.posts); else { postCard(T, E.posts); failStamp(T, E.hand + 0.8, 4); } }
  else if (ci === 6) { big('I TRIED EVERYTHING!', 260, 62, '#ff4040', fi(E.rage)); if (T > E.still - 0.1) big('BUT THE POLICE STILL', 345, 46, '#fff', fi(E.still)); if (T > E.fk - 0.1) big('F***ING FIND IT!', 420, 66, '#ffd34a', fi(E.fk)); }
  else if (ci === 7 && !loop) { if (T < E.only - 0.1) { big('CAUGHT.', 280, 86, '#ff2b3a', fi(E.caught)); if (T > E.again - 0.1) big('AGAIN.', 380, 86, '#fff', fi(E.again)); } else { if (T > E.dont - 0.1) { big("DON'T DO IT.", 320, 80, '#ffd34a', fi(E.dont)); if (T > E.dont + 0.9) { octx.save(); octx.globalAlpha = prog(T, E.dont + 0.9, E.dont + 1.1); pill(150, 1000, 420, 60, 'rgba(10,10,20,0.85)', '#ffd34a'); txt('DUMBEST FAIL? COMMENT A . B . C . D', 360, 1031, 24, '#fff'); octx.restore(); } } else big('THE ONLY WAY TO NEVER GET CAUGHT?', 320, 34, '#fff', fi(E.only)); } }
  const cap = CAPS.find(c => T >= c.a && T < c.b); if (cap && !loop && !(ci === 0 && T < E.hide - 0.1)) captionHL(cap); };
})();
