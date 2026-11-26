
// ---------- timing ----------
const E = { lost: AT(0, 'lost'), bro0: AT(0, 'bro'), c1: CL[1].start, c2: CL[2].start, day: AT(2, 'day'), broIn: AT(2, 'then'),
  c3: CL[3].start, lost3: AT(3, 'lost'), rename: AT(3, 'rename'), notnow: AT(3, 'not'), clever: AT(3, 'clever'),
  c4: CL[4].start, lost4: AT(4, 'lost'), fly: AT(4, 'fly'), seat: AT(4, 'bro'), c5: CL[5].start, tell: AT(5, 'tell'), strong: AT(5, 'strong'),
  c6: CL[6].start, same: AT(6, 'same'), except: AT(6, 'except'), dave2: AT(6, 'bro', 1), c7: CL[7].start };
E.loop = TM.total - 0.4;
E.replies = [0, 1, 2, 3].map(i => E.c6 + 0.15 + i * 0.22);
const GL = [0, 0, 400]; // the globe scene sits far from the bedroom
// ---------- canvas textures that change over time ----------
function stampDraw(c, x, y, k, s = 1) { if (k <= 0) return; const sc = lerp(2.4, 1, ease(k)); c.save(); c.translate(x, y); c.rotate(-0.22); c.scale(sc * s, sc * s); c.globalAlpha = Math.min(1, k * 2) * 0.92;
  c.strokeStyle = '#d61c1c'; c.lineWidth = 7; c.beginPath(); c.roundRect(-64, -27, 128, 54, 8); c.stroke(); c.fillStyle = '#d61c1c'; c.font = '46px Russo'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('LOST', 0, 3); c.restore(); }
const STAMP = (T, t0) => T < t0 - 0.12 ? 0 : prog(T, t0 - 0.12, t0);
function drawCal(c, st) { const w = 512, h = 640; c.fillStyle = '#fbf8f0'; c.fillRect(0, 0, w, h); c.fillStyle = '#d63a2a'; c.fillRect(0, 0, w, 118);
  c.fillStyle = '#fff'; c.font = '66px Russo'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('NOVEMBER', w / 2, 62);
  c.fillStyle = '#555'; c.font = '600 22px CapFont'; 'SMTWTFS'.split('').forEach((d, i) => c.fillText(d, 36.5 + i * 73, 146));
  c.strokeStyle = '#cfc8b8'; c.lineWidth = 2; for (let r = 0; r <= 5; r++) { c.beginPath(); c.moveTo(0, 166 + r * 92); c.lineTo(w, 166 + r * 92); c.stroke(); } for (let i = 1; i < 7; i++) { c.beginPath(); c.moveTo(i * 73, 166); c.lineTo(i * 73, 626); c.stroke(); }
  for (let d = 1; d <= 30; d++) { const col = (d - 1) % 7, row = Math.floor((d - 1) / 7), x = col * 73, y = 166 + row * 92; c.fillStyle = '#333'; c.font = '600 24px CapFont'; c.textAlign = 'left'; c.fillText(String(d), x + 7, y + 20);
    if (d <= 2) { c.strokeStyle = '#2aa84a'; c.lineWidth = 7; c.lineCap = 'round'; c.beginPath(); c.moveTo(x + 22, y + 56); c.lineTo(x + 34, y + 70); c.lineTo(x + 56, y + 40); c.stroke(); } }
  for (let d = 1; d <= 30; d++) { const k = st[d] || 0; if (k > 0) { const col = (d - 1) % 7, row = Math.floor((d - 1) / 7); stampDraw(c, col * 73 + 36, 166 + row * 92 + 52, k, d === 3 && st.big ? 0.75 : 0.5); } } }
function drawBoard(c, st) { const w = 512, h = 320; c.fillStyle = '#fdfdfb'; c.fillRect(0, 0, w, h); c.fillStyle = '#2a5ac8'; c.font = '34px Bangers'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('THE COUNTER', w / 2, 30);
  const r = rng(7); for (let i = 0; i < 10; i++) { const x = 60 + (i % 5) * 98, y = 82 + Math.floor(i / 5) * 62, a = (r() - 0.5) * 0.2; c.save(); c.translate(x, y); c.rotate(a); c.fillStyle = '#222'; c.font = '38px Bangers'; c.fillText('DAY 1', 0, 0); c.strokeStyle = '#d61c1c'; c.lineWidth = 5; c.beginPath(); c.moveTo(-44, 6); c.lineTo(44, -6); c.stroke(); c.restore(); }
  if (st.w > 0) { c.save(); c.beginPath(); c.rect(0, 190, 120 + 300 * st.w, 130); c.clip(); c.fillStyle = '#111'; c.font = '96px Bangers'; c.fillText('DAY 1', w / 2, 248); c.restore(); }
  if (st.ag > 0) { c.save(); c.globalAlpha = st.ag; c.fillStyle = '#2a5ac8'; c.font = '34px Bangers'; c.fillText('(again)', 410, 290); c.restore(); }
  stampDraw(c, w / 2, 250, st.s, 1.5); }
function drawBanner(c, st) { const w = 1024, h = 300; c.fillStyle = '#fff3c8'; c.fillRect(0, 0, w, h); c.fillStyle = '#d63a2a'; for (let i = 0; i < 16; i++) { c.beginPath(); c.moveTo(i * 64, 0); c.lineTo(i * 64 + 64, 0); c.lineTo(i * 64 + 32, 34); c.fill(); c.fillStyle = c.fillStyle === '#d63a2a' ? '#2a5ac8' : '#d63a2a'; }
  c.font = '128px Bangers'; c.textAlign = 'left'; c.textBaseline = 'middle'; const full = 'NO NUT NOVEMBER', a = c.measureText('NO NUT ').width, tw = c.measureText(full).width, x0 = (w - tw) / 2; c.fillStyle = '#1a1a1a'; c.fillText(full, x0, 205);
  if (st.k > 0) { c.strokeStyle = '#d61c1c'; c.lineWidth = 16; c.lineCap = 'round'; c.beginPath(); c.moveTo(x0 - 6, 212); c.lineTo(x0 - 6 + (a - 10) * st.k, 196); c.stroke(); }
  if (st.n > 0) { c.save(); c.beginPath(); c.rect(0, 0, x0 + (a + 40) * st.n, 140); c.clip(); c.translate(x0 + a / 2 - 10, 92); c.rotate(-0.06); c.fillStyle = '#d61c1c'; c.font = '92px Bangers'; c.textAlign = 'center'; c.fillText('NOT NOW', 0, 0); c.restore(); }
  stampDraw(c, w * 0.62, 170, st.s, 2.1); }
function dynTex(w, h, fn) { const t = ctex(w, h, () => {}); t.userData.fn = fn; t.userData.key = ''; return t; }
function updTex(t, st) { const key = JSON.stringify(st); if (key === t.userData.key) return; t.userData.key = key; const c = t.userData.g; c.clearRect(0, 0, t.userData.c.width, t.userData.c.height); t.userData.fn(c, st); t.needsUpdate = true; }
function texPlane(p, tex, w, h, x, y, z, ry = 0) { const m = add(p, new T3.PlaneGeometry(w, h), BM('#ffffff', { map: tex }), x, y, z, false); m.rotation.y = ry; m.receiveShadow = false; return m; }
function globeTex() { return ctex(1024, 512, (c, w, h) => { c.fillStyle = '#2f86d8'; c.fillRect(0, 0, w, h); const r = rng(21); const blob = (cx, cy, n, s, col) => { c.fillStyle = col; for (let i = 0; i < n; i++) { c.beginPath(); c.arc(cx + (r() - 0.5) * s * 2, cy + (r() - 0.5) * s, s * (0.25 + r() * 0.35), 0, 7); c.fill(); } };
  for (const [cx, cy, s] of [[180, 160, 70], [250, 330, 55], [520, 150, 60], [540, 300, 60], [720, 170, 110], [830, 360, 45], [430, 80, 40]]) blob(cx, cy, 26, s, '#4fae4a'); for (const [cx, cy, s] of [[730, 150, 70], [200, 140, 40]]) blob(cx, cy, 10, s, '#8ac25a');
  c.fillStyle = '#f4f8ff'; c.fillRect(0, 0, w, 26); c.fillRect(0, h - 30, w, 30); }); }
function starTex() { return ctex(1024, 512, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#0e1638'); g.addColorStop(1, '#24346a'); c.fillStyle = g; c.fillRect(0, 0, w, h); const r = rng(9); for (let i = 0; i < 500; i++) { c.fillStyle = `rgba(255,255,255,${0.3 + r() * 0.7})`; const s = r() < 0.1 ? 2.4 : 1.2; c.fillRect(r() * w, r() * h, s, s); } }); }
function build() {
  buildSky(); R.sun.intensity = 2.4; R.hemi.intensity = 1.2;
  const G = R.G = new T3.Group(); scene.add(G);
  // bedroom: floor, three walls, rug, window, bed, plant, desk
  const wood = SM('#ffffff', { map: noiseTex(256, 256, '#c08a58', [['rgba(90,50,20,0.18)', 600, 3], ['rgba(255,230,190,0.1)', 300, 2]], 4, [3, 3]) });
  add(G, Bx(7, 0.1, 6.5), wood, 0, -0.05, 0.6);
  for (let i = 0; i < 10; i++) add(G, Bx(0.012, 0.004, 6.5), SM('#8a5a32'), -3.15 + i * 0.7, 0.001, 0.6, false);
  const wallM = SM('#86aecb'), wallM2 = SM('#98bcd4');
  add(G, Bx(7, 2.9, 0.1), wallM, 0, 1.45, -2.55); add(G, Bx(0.1, 2.9, 6.5), wallM2, -3.05, 1.45, 0.6); add(G, Bx(0.1, 2.9, 6.5), wallM2, 3.05, 1.45, 0.6);
  add(G, Bx(7, 0.12, 0.04), SM('#f2efe8'), 0, 0.06, -2.49); add(G, Bx(0.04, 0.12, 6.5), SM('#f2efe8'), -2.99, 0.06, 0.6); add(G, Bx(0.04, 0.12, 6.5), SM('#f2efe8'), 2.99, 0.06, 0.6);
  const rug = add(G, Cy(1.25, 1.25, 0.02, 40), SM('#c85a4a'), 0, 0.012, -0.3, false); rug.scale.z = 0.8; const rug2 = add(G, Cy(0.95, 0.95, 0.022, 40), SM('#e8b450'), 0, 0.013, -0.3, false); rug2.scale.z = 0.8;
  // window on the left wall with a sky view
  const skyT = ctex(64, 128, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#5a9ae0'); g.addColorStop(1, '#bfe0f4'); c.fillStyle = g; c.fillRect(0, 0, w, h); });
  texPlane(G, skyT, 1.1, 1.0, -2.99, 1.65, -0.6, PI / 2); const fr = SM('#f4f2ec'); for (const [y, z, a, b] of [[2.17, -0.6, 0.08, 1.24], [1.13, -0.6, 0.08, 1.24], [1.65, -0.6, 1.0, 0.06]]) add(G, Bx(0.08, a, b), fr, -2.97, y, z); for (const z of [-1.2, 0.0]) add(G, Bx(0.08, 1.12, 0.08), fr, -2.97, 1.65, z);
  add(G, Bx(0.08, 1.12, 0.05), fr, -2.97, 1.65, -0.6);
  // calendar, whiteboard, banner on the back wall
  R.calT = dynTex(512, 640, drawCal); add(G, Bx(0.86, 1.06, 0.02), SM('#e8e2d4'), -1.6, 1.55, -2.495); R.cal = texPlane(G, R.calT, 0.8, 1.0, -1.6, 1.55, -2.48); add(G, Sp(0.02), SM('#888'), -1.6, 2.1, -2.48);
  R.boardT = dynTex(512, 320, drawBoard); add(G, Bx(1.52, 0.97, 0.04), SM('#b8bcc2'), 0.6, 1.42, -2.49); texPlane(G, R.boardT, 1.42, 0.888, 0.6, 1.42, -2.465); add(G, Bx(1.3, 0.04, 0.08), SM('#b8bcc2'), 0.6, 0.92, -2.45);
  add(G, Cy(0.012, 0.012, 0.12, 8), SM('#d61c1c'), 0.3, 0.955, -2.44).rotation.z = PI / 2;
  R.banT = dynTex(1024, 300, drawBanner); texPlane(G, R.banT, 1.7, 0.5, 0.6, 2.3, -2.48);
  // bed
  add(G, Bx(1.22, 0.32, 2.05), WOOD(), 2.2, 0.16, -1.44); add(G, Bx(1.12, 0.22, 1.98), SM('#f4f2ee'), 2.2, 0.43, -1.44); add(G, Bx(1.22, 0.95, 0.08), WOOD(), 2.2, 0.62, -2.46);
  add(G, RB(1.16, 0.2, 1.3, 0.06), SM('#4a74c8'), 2.2, 0.62, -0.95); add(G, RB(0.78, 0.16, 0.36, 0.06), SM('#ffffff'), 2.2, 0.62, -2.2);
  // plant and bedside table
  add(G, Cy(0.18, 0.14, 0.34, 16), SM('#c86a3a'), -2.55, 0.17, -2.1); for (let k = 0; k < 7; k++) { const l = add(G, Sp(0.16, 10, 8), SM(k % 2 ? '#3a8a3a' : '#4aa04a'), -2.55 + S(k * 2.2) * 0.12, 0.5 + k * 0.06, -2.1 + C(k * 2.2) * 0.1); l.scale.set(0.7, 1.4, 0.5); l.rotation.z = S(k * 2.2) * 0.6; }
  add(G, Bx(0.5, 0.5, 0.45), WOOD(), 1.25, 0.25, -2.2); add(G, Cy(0.08, 0.12, 0.05, 14), SM('#e8e0d0'), 1.25, 0.53, -2.2); add(G, Cy(0.015, 0.015, 0.3, 8), SM('#e8e0d0'), 1.25, 0.7, -2.2); add(G, Cy(0.09, 0.16, 0.18, 16), SM('#ffe0a0', { emissive: '#ffcc70', emissiveIntensity: 0.3 }), 1.25, 0.88, -2.2);
  // the bro
  const you = R.you = human({ top: '#e8453a', bot: '#2e3550', hair: '#3a2416', skin: '#e4b08a' }); scene.add(you);
  R.bro = human({ top: '#2aa84a', bot: '#3a3a44', hair: '#1a1210', skin: '#c88a60' }); scene.add(R.bro);
  R.broT = human({ top: '#c88a60', bot: '#ffffff', hair: '#1a1210', skin: '#c88a60', short: true }); scene.add(R.broT);
  R.spark = []; for (let i = 0; i < 6; i++) R.spark.push(spr(scene, GLOW, '#fff6c0', 0.12, 0, 0, 0, 0));
  R.marker = add(you.userData.armR.userData.h, Cy(0.018, 0.018, 0.16, 8), SM('#222222'), 0, -0.07, 0.03); R.marker.rotation.x = PI / 2;
  const ph = R.phone = new T3.Group(); you.userData.armR.userData.h.add(ph); ph.position.set(-0.02, -0.06, 0.05); add(ph, RB(0.09, 0.17, 0.014, 0.012), SM('#1a1a1e'), 0, 0, 0); const scr = add(ph, new T3.PlaneGeometry(0.078, 0.155), BM('#bfe0ff'), 0, 0, -0.008, false); scr.rotation.y = PI;
  // globe scene
  const GG = R.GG = new T3.Group(); GG.position.set(...GL); scene.add(GG);
  add(GG, Sp(45, 32, 16), new T3.MeshBasicMaterial({ map: starTex(), side: T3.BackSide, fog: false, toneMapped: false }), 0, 0, 0, false).castShadow = false;
  R.globe = add(GG, Sp(6, 64, 40), SM('#ffffff', { map: globeTex() }), 0, 0, 0, false);
  const pl = R.plane = new T3.Group(); GG.add(pl); pl.position.set(0, 7.0, 1.2); const white = SM('#f6f6f8'), blue = SM('#2a5ac8');
  const fus = add(pl, Cap(0.36, 2.6, 16), white, 0, 0, 0); fus.rotation.z = PI / 2; const nose = add(pl, Sp(0.2, 12, 10), SM('#222a3a'), -1.5, 0.12, 0.2); nose.scale.set(0.6, 0.5, 0.9);
  add(pl, Bx(0.8, 0.06, 3.4), white, 0.1, -0.12, 0); add(pl, Bx(0.84, 0.065, 0.1), blue, 0.1, -0.12, 1.7); add(pl, Bx(0.84, 0.065, 0.1), blue, 0.1, -0.12, -1.7);
  const fin = add(pl, Bx(0.6, 0.75, 0.06), blue, 1.45, 0.5, 0); fin.rotation.z = -0.35; add(pl, Bx(0.45, 0.05, 1.3), white, 1.5, 0.08, 0);
  for (const z of [-0.95, 0.95]) { const en = add(pl, Cy(0.14, 0.14, 0.55, 14), SM('#c8ccd4'), -0.05, -0.32, z); en.rotation.z = PI / 2; }
  add(pl, Bx(2.5, 0.06, 0.02), blue, -0.1, -0.08, 0.36, false);
  for (let i = 0; i < 9; i++) add(pl, new T3.CircleGeometry(0.055, 14), BM('#2a3446'), -1.1 + i * 0.26, 0.09, 0.358, false);
  R.trail = []; for (let i = 0; i < 14; i++) R.trail.push(spr(GG, GLOW, '#ffffff', 0.6, 0, 0, 0, 0, T3.NormalBlending));
}
// ---------- shots ----------
const CALV = [[-1.6, 1.55, -1.25], [-1.6, 1.55, -2.5]], CAL2 = [[-1.6, 1.55, -1.12], [-1.6, 1.55, -2.5]];
const SH = [
  [0, (k, T) => TR(k, CALV[0], CAL2[0], CALV[1], CAL2[1])],
  [E.bro0 - 0.05, (k, T) => TR(k, [-0.6, 1.55, 1.25], [-0.65, 1.52, 1.05], [-0.85, 1.25, -2.2], [-0.85, 1.25, -2.2])],
  [E.c1, (k, T) => TR(k, [0.0, 2.35, -0.24], [0.0, 2.1, -0.25], [0, 0, -0.3], [0, 0, -0.3])],
  [E.c2, (k, T) => TR(k, [1.15, 1.5, 0.45], [1.0, 1.48, 0.15], [0.45, 1.36, -2.5], [0.5, 1.36, -2.5])],
  [E.broIn - 0.1, (k, T) => TR(k, [-0.9, 1.5, 1.8], [-0.75, 1.48, 1.6], [1.15, 1.1, -0.9], [1.2, 1.15, -0.9])],
  [E.c3, (k, T) => TR(k, [0.65, 1.42, -0.85], [0.62, 1.42, -0.95], [0.6, 1.42, -2.5], [0.6, 1.42, -2.5])],
  [E.rename - 0.1, (k, T) => TR(k, [0.75, 1.75, 0.95], [0.7, 1.8, 0.7], [0.55, 1.75, -2.5], [0.58, 1.85, -2.5])],
  [E.clever - 0.1, (k, T) => TR(k, [0.45, 1.68, 0.35], [0.4, 1.68, 0.2], [0.12, 1.55, -1.4], [0.12, 1.58, -1.4])],
  [E.c4, (k, T) => TR(k, [0.6, 2.28, -1.15], [0.6, 2.28, -1.3], [0.6, 2.3, -2.5], [0.6, 2.3, -2.5])],
  [E.fly - 0.05, (k, T) => TR(k, [GL[0] - 1.5, GL[1] + 7.4, GL[2] + 7.5], [GL[0] + 0.5, GL[1] + 6.8, GL[2] + 13.5], [GL[0] - 0.4, GL[1] + 7.0, GL[2] + 1.2], [GL[0], GL[1] + 4.2, GL[2]])],
  [E.seat - 0.1, (k, T) => TR(k, [GL[0] - 2.6, GL[1] + 7.9, GL[2] + 3.6], [GL[0] - 2.7, GL[1] + 7.9, GL[2] + 3.4], [GL[0] - 0.3, GL[1] + 7.6, GL[2] + 1.2], [GL[0] - 0.3, GL[1] + 7.6, GL[2] + 1.2])],
  [E.c5, (k, T) => TR(k, [1.1, 1.35, 0.45], [1.15, 1.32, 0.25], [2.2, 0.95, -1.9], [2.2, 0.95, -1.9])],
  [E.c7, (k, T) => TR(k, CALV[0], CAL2[0], CALV[1], CAL2[1])],
  [E.loop, (k, T) => look(CALV[0], CALV[1])],
];
const shotAt = T => { let i = 0; for (let j = 0; j < SH.length; j++) if (T >= SH[j][0]) i = j; return i; };
function anim(T) { const ci = CLI(T), loop = T >= E.loop, cl = loop ? 0 : ci; const you = R.you, u = you.userData; rest(you); you.visible = true; you.scale.setScalar(1); you.rotation.set(0, 0, 0); R.marker.visible = false; R.phone.visible = false; face(you, 'neutral', T);
  const bro = R.bro, bt = R.broT; rest(bro); rest(bt); bro.visible = bt.visible = false; bro.scale.setScalar(1); bro.rotation.set(0, 0, 0); bt.rotation.set(0, 0, 0); R.spark.forEach(s_ => s_.material.opacity = 0);
  // textures
  const st = {}; if (!loop) { st[3] = cl === 0 ? STAMP(T, E.lost) : 1; st.big = cl === 0; if (cl === 7) { const order = [...Array(30).keys()].map(i => i + 1).filter(d => d !== 3); order.forEach((d, i) => { st[d] = STAMP(T, E.c7 + 0.25 + i * 0.075); }); } }
  for (const d in st) if (typeof st[d] === 'number') st[d] = Math.round(st[d] * 20) / 20; updTex(R.calT, st);
  const bw = cl === 2 ? prog(T, E.day - 0.15, E.day + 0.45) : cl === 3 ? 1 : 0; updTex(R.boardT, { w: Math.round(bw * 20) / 20, ag: cl === 2 ? Math.round(prog(T, E.day + 0.5, E.day + 0.8) * 10) / 10 : cl === 3 ? 1 : 0, s: cl === 3 ? Math.round(STAMP(T, E.lost3) * 20) / 20 : 0 });
  updTex(R.banT, { k: cl === 3 ? Math.round(prog(T, E.rename, E.rename + 0.5) * 20) / 20 : cl >= 4 ? 1 : 0, n: cl === 3 ? Math.round(prog(T, E.notnow - 0.2, E.notnow + 0.55) * 20) / 20 : cl >= 4 ? 1 : 0, s: cl === 4 ? Math.round(STAMP(T, E.lost4) * 20) / 20 : 0 });
  // the globe spins east under the plane, so the plane goes west
  R.globe.rotation.y = T * 0.9; R.plane.position.y = 7.0 + 0.08 * S(T * 3); R.plane.rotation.z = 0.04 * S(T * 2);
  R.trail.forEach((s_, i) => { s_.position.set(1.7 + i * 0.32, 7.0 + 0.08 * S((T - i * 0.05) * 3), 1.2); s_.material.opacity = 0.45 * (1 - i / 14); s_.scale.setScalar(0.25 + i * 0.03); });
  if (cl === 0) { if (T < E.bro0 - 0.05 && !loop) you.visible = false; you.position.set(-0.95, 0, -1.6); you.rotation.y = 0.3;
    u.armR.rotation.set(-2.35, 0, -0.55); u.armR.userData.e.rotation.x = -1.35; u.head.rotation.set(0.3, 0, 0); u.up.rotation.x = 0.12; face(you, 'angry', T); if (loop) you.visible = false;
    if (T > E.bro0 - 0.05 && !loop) { bro.visible = true; bro.position.set(-0.3, 0, -1.4); bro.rotation.y = -0.4; face(bro, 'grin', T); bro.userData.armL.rotation.set(-0.2, 0, -2.4 + 0.3 * S(T * 12)); bro.userData.head.rotation.z = 0.12; } }
  if (cl === 1) { you.position.set(0, 0.16, 0.6); you.rotation.set(-PI / 2, 0, 0); u.armL.rotation.z = -1.25; u.armR.rotation.z = 1.25; u.legL.rotation.z = -0.28; u.legR.rotation.z = 0.28; face(you, 'neutral', T); u.mouth.scale.set(0.5, 1, 1); }
  if (cl === 2) { you.position.set(-0.05, 0, -1.95); you.rotation.y = PI * 0.78; R.marker.visible = true; const wr = T > E.day - 0.2 && T < E.broIn - 0.1; u.armR.rotation.set(wr ? -1.9 + 0.12 * S(T * 16) : -0.5, 0, wr ? 0.1 : 0); u.armR.userData.e.rotation.x = wr ? -0.3 : -0.4;
    if (T > E.broIn - 0.1) { you.rotation.y = PI / 2 + 0.3; face(you, 'shock', T); u.head.rotation.y = 0.2;
      const k = ease(prog(T, E.broIn - 0.1, E.broIn + 0.7)); bt.visible = true; bt.position.set(lerp(2.7, 1.25, k), 0, -0.2); bt.rotation.y = k < 1 ? -PI / 2 : -PI / 2 + 0.9 * ease(prog(T, E.broIn + 0.7, E.broIn + 1.0)); if (k < 1) walkPose(bt, T * 10, 0.8); face(bt, 'smug', T); bt.userData.armR.rotation.set(-0.3, 0, 2.6); bt.userData.armR.userData.e.rotation.x = -1.6; bt.userData.head.rotation.z = -0.1;
      R.spark.forEach((s_, i) => { const ph = (T * 1.3 + i / 6) % 1; s_.position.set(bt.position.x + S(i * 2.3) * 0.35, 1.0 + i * 0.16 + ph * 0.1, bt.position.z + 0.3); s_.material.opacity = 0.9 * S(ph * PI); s_.scale.setScalar(0.1 + 0.1 * S(ph * PI)); }); } }
  if (cl === 3) { if (T < E.rename - 0.1) { you.position.set(-0.05, 0, -1.95); you.rotation.y = PI * 0.78; face(you, 'shock', T); }
    else { you.position.set(0.12, 0, -1.4); you.rotation.y = 0.15; R.marker.visible = true; const up_ = T < E.clever - 0.1; u.armR.rotation.set(up_ ? -2.7 : -0.9, 0, up_ ? 0.15 : -0.2); u.armR.userData.e.rotation.x = up_ ? -0.2 : -1.2; face(you, T > E.clever - 0.1 ? 'smug' : 'grin', T); } }
  if (cl === 4) { if (T < E.fly - 0.05) you.visible = false; else { const sc = 0.55, top = GL[1] + R.plane.position.y + 0.36; seatPose(you, 0); you.scale.setScalar(sc); you.position.set(GL[0] + 0.15, top + (0.06 - 0.92) * sc + 0.02, GL[2] + 1.2); you.rotation.y = -PI / 2;
    u.armR.rotation.set(-1.6, 0, 0); u.armR.userData.e.rotation.x = 0; u.armL.rotation.set(-2.8, 0, -0.3); u.legL.rotation.z = -0.4; u.legR.rotation.z = 0.4; face(you, T > E.seat - 0.1 ? 'shock' : 'yell', T); u.head.rotation.y = 0;
    if (T > E.seat - 0.1) { const pk = ease(prog(T, E.seat - 0.1, E.seat + 0.15)); seatPose(bro, 0); bro.visible = true; bro.scale.setScalar(sc * Math.max(0.01, pk)); bro.position.set(GL[0] - 0.55, top + (0.06 - 0.92) * sc + 0.02, GL[2] + 1.2); bro.rotation.y = -PI / 2; bro.userData.head.rotation.y = -1.2; face(bro, 'grin', T); bro.userData.armL.rotation.set(-0.3, 0, -2.5 + 0.3 * S(T * 12)); u.armR.rotation.set(-0.2, 0, 0); u.armL.rotation.set(-0.2, 0, 0); } } }
  if (cl === 5 || cl === 6) { seatPose(you, 0.55); you.position.x = 2.2; you.position.z = -1.95; you.rotation.y = 0; u.up.rotation.x = -0.15; R.phone.visible = true; u.armR.rotation.set(-1.15, 0, 0.25); u.armR.userData.e.rotation.set(-1.25, 0, 0); u.armR.userData.h.rotation.set(0.3, 0, 0);
    u.armL.rotation.set(-0.35, 0, -0.1); u.head.rotation.set(0.25, 0.05, 0); face(you, cl === 6 && T > E.dave2 - 0.1 ? 'shock' : 'smug', T); }
  if (cl === 7) you.visible = false; }
function shot(T) { const si = shotAt(T), sh = SH[si], t0 = sh[0], t1 = si + 1 < SH.length ? SH[si + 1][0] : TM.total; camera.fov = 64; camera.updateProjectionMatrix(); anim(T); sh[1](prog(T, t0, t1), T);
  const g = camera.position.z > 200; if (g) { R.sun.position.set(GL[0] + 10, GL[1] + 16, GL[2] + 14); R.sun.target.position.set(...GL); } else { R.sun.position.set(2.5, 9, 7); R.sun.target.position.set(0, 0, -1.2); } R.sun.target.updateMatrixWorld(); return { si, t0 }; }
