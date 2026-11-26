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
