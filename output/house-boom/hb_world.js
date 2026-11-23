
// ---------- timing ----------
const E = { c1: CL[1].start, fed: AT(1, 'fed') + 0.25, c2: CL[2].start, stairs: AT(2, 'stairs'), roof: AT(2, 'roof'), railing: AT(2, 'railing'), wall: AT(2, 'bedroom') + 0.25, c3: CL[3].start, peach: AT(3, 'peach'), reps: AT(3, 'reps'), hid: AT(3, 'hid'),
  c4: CL[4].start, day: AT(4, 'day'), c5: CL[5].start, blew: AT(5, 'blew'), c6: CL[6].start, c7: CL[7].start };
E.fightA = E.day + 0.15; E.masked = E.fightA; E.fought = E.fightA + 0.25 + 0.55; E.every = E.fightA + 0.6 + 0.1; E.run = E.blew - 0.05 - 0.65;
E.loop = 999; E.boom = E.blew - 0.05;
const INT = [80, 0, 0];
const I3 = (x, y, z) => [INT[0] + x, INT[1] + y, INT[2] + z];
// money: repairs cost, the stash goes under the floor
const BUYS = [[0, 61850], [E.stairs, -2200], [E.roof, -9500], [E.railing, -1800], [E.wall, -3100], [E.peach, -1250], [E.hid, -25000]];
const money = T => { let m = 0; BUYS.forEach(([t, d]) => { if (T >= t) m += d; }); if (T >= E.c7) m = Math.round(lerp(m, 0, ease(prog(T, E.c7, E.c7 + 1.3)))); return T < E.c2 ? 61850 : m; };
const TASKS = [[E.stairs, 'STAIRS FIXED'], [E.roof, 'ROOF FIXED'], [E.railing, 'RAILING FIXED'], [E.wall, 'WALL PANELS IN'], [E.peach, 'PAINT: PASTEL PEACH'], [E.reps, 'WORKOUT +1'], [E.hid, 'CASH STASHED'], [E.fed, 'SNAKE FED']];
function stubbleTex() { return PT(16, 8, (c) => { const r = rng(5); for (let i = 0; i < 60; i++) { c.fillStyle = 'rgba(30,20,14,0.55)'; c.fillRect((r() * 16) | 0, (r() * 8) | 0, 1, 1); } }); }
function him() { const p = person({ top: '#4a7aa8', open: '#e8e2d6', bot: '#34343a', hair: '#24160e', skin: '#c8946a' }); const h = p.userData.head; boxM(h, 0.33, 0.14, 0.02, LM({ map: stubbleTex(), transparent: true }), 0, 0.06, 0.165, false); boxM(h, 0.34, 0.08, 0.34, PM('#24160e', 20, 8, 9), 0, 0.33, -0.01); return p; }
function her() { const sk = '#c88a62'; const p = person({ top: '#ecebe6', bot: '#3a4a6a', hair: '#140e0a', skin: sk, sleeve: sk }); const h = p.userData.head; const hair = PM('#140e0a', 20, 8, 12);
  boxM(h, 0.34, 0.1, 0.34, hair, 0, 0.33, -0.01); boxM(h, 0.12, 0.34, 0.12, hair, 0, 0.12, -0.22); for (const sx of [-1, 1]) { const ring = new T3.Mesh(new T3.TorusGeometry(0.045, 0.01, 4, 10), LM({ color: '#e8c040', emissive: '#6a5000' })); ring.position.set(sx * 0.17, 0.08, 0.02); ring.rotation.y = PI / 2; h.add(ring); } return p; }
function snakeM() { const g = new T3.Group(); const m = PM('#5a8a2a', 26, 8, 61), m2 = PM('#3a6a1a', 26, 8, 62); const segs = []; for (let i = 0; i < 9; i++) { const s = boxM(g, 0.09, 0.08, 0.12, i % 2 ? m : m2, 0, 0.05, 0, false); segs.push(s); } const head = boxM(g, 0.12, 0.09, 0.15, m, 0, 0.05, 0, false); boxM(head, 0.02, 0.02, 0.02, LM({ color: '#111' }), 0.04, 0.03, 0.05, false); boxM(head, 0.02, 0.02, 0.02, LM({ color: '#111' }), -0.04, 0.03, 0.05, false); g.userData = { segs, head }; return g; }
function tank(p, x, y, z) { const g = new T3.Group(); g.position.set(x, y, z); p.add(g); boxM(g, 0.9, 0.04, 0.5, PM('#3a2a1e', 16, 8, 63), 0, 0.02, 0); boxM(g, 0.88, 0.05, 0.48, PM('#c8a868', 30, 8, 64), 0, 0.06, 0, false);
  const glass = new T3.MeshLambertMaterial({ color: '#bfe0e8', transparent: true, opacity: 0.25, depthWrite: false }); boxM(g, 0.9, 0.45, 0.5, glass, 0, 0.27, 0, false); boxM(g, 0.92, 0.03, 0.52, PM('#2a2a2e', 10, 8, 65), 0, 0.5, 0, false); const sn = snakeM(); sn.position.set(0, 0.06, 0); g.add(sn); g.userData.snake = sn; return g; }
function animSnake(sn, T, rise = 0) { const u = sn.userData; u.segs.forEach((s, i) => { const a = i * 0.7 + T * 1.2; s.position.set(Math.cos(a) * 0.16 * (1 - i * 0.04), 0.05, Math.sin(a) * 0.12); });
  const a = -0.7 + T * 1.2; u.head.position.set(Math.cos(a) * 0.17, 0.05 + rise * 0.22, Math.sin(a) * 0.13 + rise * 0.05); u.head.rotation.set(-rise * 0.8, -a, 0); }
function build() {
  R.sun = new T3.DirectionalLight('#ffd0a8', 2.0); R.sun.castShadow = true; R.sun.shadow.mapSize.set(2048, 2048); const sc = R.sun.shadow.camera; sc.left = sc.bottom = -30; sc.right = sc.top = 30; sc.near = 1; sc.far = 200; R.sun.shadow.bias = -0.0008; scene.add(R.sun); scene.add(R.sun.target);
  R.hemi = new T3.HemisphereLight('#f0b8c8', '#6a5048', 1.2); scene.add(R.hemi);
  R.skyM = new T3.MeshBasicMaterial({ side: T3.BackSide, fog: false, toneMapped: false }); R.skyM.map = PT(8, 64, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#3a4a9a'); g.addColorStop(0.32, '#c86aa8'); g.addColorStop(0.46, '#ff9a7a'); g.addColorStop(0.52, '#ffc890'); g.addColorStop(1, '#5a4a5a'); c.fillStyle = g; c.fillRect(0, 0, w, h); }); add(scene, Sp(1500, 24, 12), R.skyM, 0, 0, 0, false).castShadow = false;
  R.sunGlow = spr(scene, GLOW, '#ffb080', 200, 300, 30, -900, 0.9); R.sunDisc = spr(scene, GLOW, '#fff0d0', 50, 300, 30, -898, 1);
  // ---- the street, the lot and the beach house ----
  const G = R.G = new T3.Group(); scene.add(G); const grass = PM('#5a8a3a', 26, 16, 70), asph = PM('#4a4846', 18, 16, 71), walk = PM('#c8c0b0', 14, 16, 72), white = LM({ color: '#e8e4d8' });
  boxM(G, 400, 0.1, 400, grass, 0, -0.06, -100, false); boxM(G, 300, 0.1, 9, asph, 0, -0.01, 8, false); boxM(G, 300, 0.12, 2.6, walk, 0, 0.0, 2.6, false); for (let x = -140; x < 140; x += 6) boxM(G, 2.6, 0.02, 0.18, white, x, 0.05, 8, false);
  boxM(G, 3.2, 0.12, 6, walk, 4.5, 0.0, -0.8, false);
  const r = rng(9); for (let i = 0; i < 26; i++) { const x = -90 + i * 7 + r() * 3; if (Math.abs(x) < 8) continue; palm(G, x, 4.4 + (i % 2) * 0.6, 6 + r() * 4, 100 + i); }
  for (let i = 0; i < 6; i++) palm(G, -7 + i * 2.8 + (i > 2 ? 4 : 0), -13 - r() * 3, 7 + r() * 3, 200 + i);
  for (let i = 0; i < 18; i++) tower(G, -150 + i * 18 + r() * 8, -150 - r() * 60, 10 + r() * 8, 30 + r() * 70, 10 + r() * 8, ['#c8b8a8', '#a8b8c8', '#d8c8b8', '#b8a8c8'][i % 4], 0.3, 300 + i);
  for (let i = 0; i < 8; i++) { const sx = i < 4 ? -1 : 1, x = sx * (16 + (i % 4) * 11); const hc = ['#f0d8c8', '#c8e0e8', '#f0e0b0', '#e8c8d8'][i % 4]; boxM(G, 8, 3.2, 7, PM(hc, 14, 16, 400 + i), x, 1.6, -6, false); boxM(G, 8.4, 0.25, 7.4, PM('#f4f4f0', 10, 8, 410 + i), x, 3.3, -6, false); }
  // the house: parts that get fixed, then blown apart
  const Hs = R.house = new T3.Group(); Hs.position.set(0, 0, -6); G.add(Hs); R.parts = [];
  const wallM = R.extWall = LM({ color: '#9a948a' }), trim = PM('#f4f4f0', 10, 8, 81), glassM = LM({ color: '#4a7a9a', emissive: '#1a2a3a' }), roofM = PM('#d8d4cc', 12, 16, 82);
  const part = (w, h, d, m, x, y, z) => { const b = boxM(Hs, w, h, d, m, x, y, z); b.userData.p0 = b.position.clone(); b.userData.r0 = b.rotation.clone(); R.parts.push(b); return b; };
  part(9, 3.2, 7, wallM, 0, 1.6, 0); part(9.4, 0.3, 7.4, trim, 0, 3.35, 0); part(6.5, 2.8, 5.5, wallM, -1, 4.9, -0.5); R.roofTop = part(6.9, 0.3, 5.9, roofM, -1, 6.45, -0.5);
  R.roofHole = boxM(Hs, 2.4, 0.34, 2.0, PM('#2a2420', 10, 8, 83), -2.2, 6.47, 0.4, false);
  for (const x of [-3, 2.6]) part(2.2, 1.8, 0.1, glassM, x, 1.6, 3.52); part(3.6, 1.6, 0.1, glassM, -1, 4.9, 2.27); part(1.1, 2.2, 0.1, PM('#e86a4a', 14, 8, 84), -0.4, 1.1, 3.52);
  R.boards = []; for (const x of [-3, 2.6]) for (let k = 0; k < 3; k++) { const b = boxM(Hs, 2.4, 0.2, 0.06, PM('#8a6a42', 26, 8, 85 + k), x, 1.0 + k * 0.6, 3.6, false); b.rotation.z = (k - 1) * 0.15; R.boards.push(b); }
  R.stepsB = []; R.stepsG = []; for (let k = 0; k < 4; k++) { const y = 0.12 + k * 0.18, z = 4.6 - k * 0.3; R.stepsG.push(boxM(Hs, 1.6, 0.18, 0.32, PM('#c8a878', 16, 8, 120 + k), -0.4, y, z)); const b = boxM(Hs, 1.6, 0.18, 0.32, PM('#5a4a3a', 26, 8, 130 + k), -0.4 + (k % 2 ? 0.3 : -0.2), y - (k % 2) * 0.12, z); b.rotation.z = (k % 2 ? 0.35 : -0.25); R.stepsB.push(b); }
  R.balc = part(6.5, 0.2, 1.4, trim, -1, 3.55, 2.9); R.railG = []; R.railB = []; for (let k = 0; k < 9; k++) { const x = -4.1 + k * 0.78; R.railG.push(boxM(Hs, 0.08, 0.9, 0.08, trim, x, 4.1, 3.55)); const b = boxM(Hs, 0.08, 0.9, 0.08, PM('#6a5a4a', 20, 8, 140 + k), x, 4.0, 3.55); b.rotation.z = (k % 3 - 1) * 0.6; R.railB.push(b); } R.railTop = boxM(Hs, 6.5, 0.1, 0.12, trim, -1, 4.55, 3.55);
  R.wallHole = boxM(Hs, 0.12, 1.8, 1.8, PM('#1a1614', 10, 8, 150), 2.27, 4.8, -0.8, false); R.wallPanel = boxM(Hs, 0.12, 1.8, 1.8, R.extWall, 2.28, 4.8, -0.8, false);
  const deck = PM('#a8784a', 24, 16, 160); boxM(G, 4.5, 0.25, 5, deck, -8.5, 0.12, -5, false); R.bench = boxM(G, 0.5, 0.45, 1.6, PM('#2a2a2e', 12, 8, 161), -8.5, 0.45, -5); R.bar = new T3.Group(); G.add(R.bar); boxM(R.bar, 1.9, 0.05, 0.05, PM('#c8c8c8', 8, 8, 162), 0, 0, 0, false); for (const x of [-0.85, 0.85]) boxM(R.bar, 0.08, 0.4, 0.4, PM('#1a1a1c', 8, 8, 163), x, 0, 0, false);
  boxM(G, 0.5, 1.6, 0.5, PM('#8a2a24', 18, 8, 164), -10.3, 1.45, -3.2, false); boxM(G, 0.08, 0.6, 0.08, PM('#2a2a2e', 8, 8, 165), -10.3, 2.55, -3.2, false);
  R.deckL = new T3.PointLight('#ffe0c0', 14, 8, 1.2); R.deckL.position.set(-7, 3, -3.5); G.add(R.deckL);
  R.weeds = []; for (let i = 0; i < 14; i++) { const w = boxM(G, 0.3, 0.6, 0.3, PM('#6a7a2a', 30, 8, 90 + i), -4 + i * 0.6, 0.3, -1.6 + (i % 3) * 0.3, false); R.weeds.push(w); }
  R.plants = []; for (const x of [-2.6, -1.6, 0.9]) { const pg = new T3.Group(); pg.position.set(x, 0, -1.9); G.add(pg); boxM(pg, 0.5, 0.5, 0.5, PM('#c8684a', 20, 8, 95), 0, 0.25, 0); const lf = boxM(pg, 0.6, 0.6, 0.6, PM('#4a8a3a', 30, 8, 96), 0, 0.8, 0); pg.userData.lf = lf; R.plants.push(pg); R.parts.push(pg); pg.userData.p0 = pg.position.clone(); pg.userData.r0 = pg.rotation.clone(); }
  R.sign = boxM(G, 1.6, 1.0, 0.08, LM({ map: PT(64, 40, (c) => { c.fillStyle = '#f4f0e0'; c.fillRect(0, 0, 64, 40); c.fillStyle = '#2a8a3a'; c.font = 'bold 12px Russo'; c.textAlign = 'center'; c.fillText('PAID', 32, 17); c.fillText('IN FULL', 32, 32); }) }), 2.2, 1.3, 1.9, false); boxM(G, 0.08, 0.9, 0.08, trim, 2.2, 0.45, 1.92, false);
  R.car = car(4); R.car.position.set(4.5, 0, -0.5); G.add(R.car); R.carDirt = boxM(R.car, 1.95, 0.66, 4.36, LM({ color: '#6a5a3a', transparent: true, opacity: 0.55 }), 0, 0.62, 0, false); R.parts.push(R.car); R.car.userData.p0 = R.car.position.clone(); R.car.userData.r0 = R.car.rotation.clone();
  R.bubbles = []; for (let i = 0; i < 16; i++) R.bubbles.push(spr(G, GLOW, '#ffffff', 0.35, 0, 0, 0, 0, T3.NormalBlending));
  R.water = []; for (let i = 0; i < 10; i++) R.water.push(spr(G, GLOW, '#7ac8ff', 0.15, 0, 0, 0, 0));
  R.extTank = tank(G, 0, 0.25, -5.4); boxM(G, 1.2, 0.25, 0.8, PM('#5a5450', 18, 8, 640), 0, 0.12, -5.4, false); R.extTank.visible = false;
  // explosion bits
  R.fire = []; for (let i = 0; i < 26; i++) R.fire.push(spr(G, GLOW, ['#ff4a00', '#ff8a10', '#c81800'][i % 3], 1, 0, 0, 0, 0, i % 2 ? T3.NormalBlending : T3.AdditiveBlending)); R.smoke = []; for (let i = 0; i < 26; i++) R.smoke.push(spr(G, GLOW, '#3a3434', 1, 0, 0, 0, 0, T3.NormalBlending));
  R.debris = []; for (let i = 0; i < 30; i++) { const b = boxM(G, 0.3 + r() * 0.6, 0.15 + r() * 0.3, 0.3 + r() * 0.6, PM(['#e8e4d8', '#9a948a', '#d8d4cc', '#5a4a3a'][i % 4], 18, 8, 500 + i), 0, -5, -6, false); b.userData.v = [(r() - 0.5) * 16, 6 + r() * 12, (r() - 0.5) * 12]; b.userData.s = [r() * 8, r() * 8]; R.debris.push(b); }
  R.crater = boxM(G, 9, 0.06, 7, PM('#2a2420', 20, 16, 99), 0, 0.02, -6, false); R.crater.visible = false; R.rubble = []; for (let i = 0; i < 20; i++) { let x = -4 + r() * 8, z = -9 + r() * 6; if (Math.abs(x) < 1.6 && z > -6.4) x += x < 0 ? -1.8 : 1.8; const b = boxM(G, 0.6 + r(), 0.3 + r() * 0.5, 0.6 + r(), PM(['#5a5450', '#3a3430', '#7a7068'][i % 3], 18, 8, 600 + i), x, 0.2, z, false); b.rotation.y = r() * 3; R.rubble.push(b); }
  R.burnL = new T3.PointLight('#ff8a30', 0, 30, 1.2); R.burnL.position.set(0, 3, -4); G.add(R.burnL);
  // ---- interior (living room) ----
  const I = R.I = new T3.Group(); I.position.set(...INT); scene.add(I);
  boxM(I, 8, 0.1, 6, PM('#c8a878', 22, 16, 700), 0, -0.05, 0); const iw = LM({ color: '#8a8680' }); R.intWalls = [boxM(I, 8, 3, 0.15, iw, 0, 1.5, -3), boxM(I, 0.15, 3, 6, iw, -4, 1.5, 0), boxM(I, 0.15, 3, 6, iw, 4, 1.5, 0)];
  R.intWalls.forEach(w => w.userData.col = w.material.color.clone()); boxM(I, 2.4, 1.4, 0.05, LM({ color: '#ffb890', emissive: '#a86a50' }), -1.5, 1.8, -2.9, false); boxM(I, 8, 0.1, 6, PM('#f0ece4', 10, 16, 704), 0, 3.0, 0);
  R.couch = new T3.Group(); R.couch.position.set(-0.6, 0, -1.8); I.add(R.couch); const cm = PM('#e86a8a', 20, 8, 705); boxM(R.couch, 2.6, 0.45, 0.9, cm, 0, 0.3, 0); boxM(R.couch, 2.6, 0.6, 0.25, cm, 0, 0.75, -0.35); for (const sx of [-1, 1]) boxM(R.couch, 0.25, 0.5, 0.9, cm, sx * 1.3, 0.55, 0);
  boxM(I, 1.2, 0.4, 0.7, PM('#3a2a1e', 16, 8, 706), -0.6, 0.2, -0.3); boxM(I, 0.9, 0.8, 0.5, PM('#3a2a1e', 16, 8, 707), 2.8, 0.4, -2.4); R.intTank = tank(I, 2.8, 0.8, -2.4);
  R.board = boxM(I, 1.2, 0.05, 0.3, PM('#b8986a', 22, 8, 720), -2.4, 0.03, 1.2); R.boardHole = boxM(I, 1.2, 0.02, 0.3, LM({ color: '#120e0a' }), -2.4, 0.005, 1.2, false); R.cash = []; for (let k = 0; k < 4; k++) R.cash.push(boxM(I, 0.3, 0.08, 0.14, LM({ color: '#5aa85a' }), -2.75 + k * 0.24, 0.02, 1.2, false));
  R.mouse = boxM(I, 0.08, 0.05, 0.12, PM('#b8b0a8', 20, 8, 708), 2.8, 1.5, -2.4, false); R.mouse.visible = false;
  R.lightI = new T3.PointLight('#ffd8b0', 6, 12, 1.2); R.lightI.position.set(0, 2.6, 0); I.add(R.lightI);
  R.firework = new T3.Group(); I.add(R.firework); boxM(R.firework, 0.08, 0.3, 0.08, PM('#e82a2a', 16, 8, 709), 0, 0.15, 0, false); boxM(R.firework, 0.1, 0.1, 0.1, PM('#e8c020', 10, 8, 710), 0, 0.34, 0, false); R.spark = spr(R.firework, GLOW, '#ffe080', 0.35, 0, 0.42, 0, 0);
  // two masked burglars
  R.thugs = [0, 1].map(i => { const p = person({ top: '#1c1c20', bot: '#24242a', hair: '#0a0a0c', skin: '#b88a6a' }); const h = p.userData.head; boxM(h, 0.34, 0.36, 0.34, LM({ map: PT(16, 16, c => { c.fillStyle = '#0e0e10'; c.fillRect(0, 0, 16, 16); c.fillStyle = '#c8946a'; c.fillRect(3, 6, 10, 3); c.fillStyle = '#f0ece4'; c.fillRect(4, 7, 2, 1); c.fillRect(10, 7, 2, 1); }) }), 0, 0.17, 0.0, false); scene.add(p); return p; });
  R.ifire = []; for (let i = 0; i < 18; i++) R.ifire.push(spr(R.I, GLOW, i % 2 ? '#ff6a10' : '#ffb030', 1, 0, 0, 0, 0)); R.ifireL = new T3.PointLight('#ff7a20', 0, 10, 1.2); R.ifireL.position.set(-1, 1.5, -1.5); R.I.add(R.ifireL);
  R.notes = []; for (let i = 0; i < 24; i++) { const n = boxM(scene, 0.32, 0.01, 0.15, LM({ color: i % 4 ? '#5aa85a' : '#3a2a1a', side: T3.DoubleSide }), 0, -50, 0, false); R.notes.push(n); }
  R.brokenGlass = []; for (let i = 0; i < 8; i++) R.brokenGlass.push(boxM(scene, 0.15 + (i % 3) * 0.08, 0.01, 0.1, LM({ color: '#cfe8f0', transparent: true, opacity: 0.6 }), 0, -50, 0, false));
  // the two of them
  R.him = him(); scene.add(R.him); R.her = her(); scene.add(R.her);
  R.soot = [R.him, R.her].map(p => { const b = boxM(p.userData.head, 0.33, 0.3, 0.02, LM({ color: '#1a1614', transparent: true, opacity: 0.75 }), 0, 0.15, 0.17, false); b.visible = false; return b; });
}
// ---------- shots ----------
const SH = [
  [0, (k, T) => TR(k, [13, 4.5, 13], [9, 3.4, 9.5], [0, 2.5, -4.5], [0, 2.5, -4.5])],
  [E.c1, (k, T) => TR(k, I3(1.9, 1.5, -1.0), I3(2.1, 1.4, -1.3), I3(2.8, 1.0, -2.4), I3(2.8, 1.0, -2.4))],
  [E.c2, (k, T) => TR(k, [1.8, 1.5, 2.2], [1.5, 1.3, 1.8], [-0.4, 0.5, -1.8], [-0.4, 0.4, -1.8])],
  [E.roof - 0.2, (k, T) => TR(k, [5, 9, 4], [4, 8.6, 3.4], [-2, 6, -5.6], [-2, 6, -5.6])],
  [E.railing - 0.2, (k, T) => TR(k, [3.2, 4.8, 1.8], [2.8, 4.6, 1.4], [-1, 4.1, -2.45], [-1.2, 4.1, -2.45])],
  [E.wall - 0.25, (k, T) => TR(k, [7.5, 5.2, -4.2], [7.0, 5.0, -4.6], [2.3, 4.8, -6.8], [2.3, 4.8, -6.8])],
  [E.c3, (k, T) => TR(k, [7.5, 3.2, 8.5], [6.2, 2.9, 7.2], [0, 2.5, -5], [0, 2.5, -5])],
  [E.reps - 0.2, (k, T) => TR(k, [-5.8, 2.8, -2.6], [-6.3, 2.6, -2.9], [-8.5, 0.8, -5.2], [-8.5, 0.8, -5.2])],
  [E.hid - 0.15, (k, T) => TR(k, I3(-0.4, 1.5, 0.4), I3(-0.7, 1.3, 0.5), I3(-2.4, 0.15, 1.3), I3(-2.4, 0.15, 1.3))],
  [E.c4, (k, T) => TR(k, [11, 3.2, 11], [12, 3.5, 12], [3, 1, 0], [10, 1, 5])],
  [E.fightA, (k, T) => TR(k, I3(-0.2, 1.9, 4.6), I3(-0.3, 1.7, 3.9), I3(0.2, 1.0, -0.4), I3(0.4, 1.0, -0.4))],
  [E.run, (k, T) => TR(k, [2.6, 1.5, 7.0], [2.2, 1.6, 6.0], [-0.4, 1.2, -1.5], [-0.2, 1.3, 0.5])],
  [E.boom + 0.03, (k, T) => TR(k, [7, 2.8, 11], [9, 3.6, 13], [0, 2.2, -2], [1, 3, 0])],
  [E.c6, (k, T) => TR(k, [0.2, 2.6, 2.0], [0.1, 1.4, -2.8], [0, 0.6, -5], [0, 0.4, -5.4])],
  [E.c7, (k, T) => TR(k, [-1.5, 1.6, -1.0], [-1.6, 2.0, -0.6], [-2.4, 0.4, -4.6], [-2.4, 1.2, -4.6])],
];
const shotAt = T => { let i = 0; for (let j = 0; j < SH.length; j++) if (T >= SH[j][0]) i = j; return i; };
const inside = T => CLI(T) === 1 || (T >= E.fightA && T < E.run) || (CLI(T) === 3 && T > E.hid - 0.15);
function anim(T) { const ci = CLI(T), ins = inside(T); const done = t => ci === 0 || T > t;
  R.I.visible = ins; R.G.visible = !ins; R.sun.intensity = ins ? 0.4 : 2.0; R.hemi.intensity = ins ? 0.9 : 1.2;
  // the five repairs + the paint job
  R.stepsG.forEach(b => b.visible = done(E.stairs)); R.stepsB.forEach(b => b.visible = !done(E.stairs));
  R.roofHole.visible = !done(E.roof); R.boards.forEach(b => b.visible = !done(E.roof)); R.weeds.forEach(w => w.visible = !done(E.roof));
  R.railG.forEach(b => b.visible = done(E.railing)); R.railB.forEach(b => b.visible = !done(E.railing)); R.railTop.visible = done(E.railing);
  R.wallPanel.visible = done(E.wall); R.wallHole.visible = !done(E.wall);
  R.extWall.color.set(done(E.peach) ? '#f6c2a0' : '#8a8478'); R.intWalls[0].material.color.set('#6ac8c0'); R.couch.visible = true; R.couch.scale.setScalar(1);
  R.carDirt.visible = false; R.sign.visible = false; R.plants.forEach(p => p.userData.lf.scale.setScalar(1.3)); R.bubbles.forEach(b => b.material.opacity = 0); R.water.forEach(w => w.material.opacity = 0);
  // floorboard stash
  const lift = ci === 3 ? ease(prog(T, E.hid - 0.1, E.hid + 0.3)) : 0; if (ci === 1) R.couch.visible = true; R.board.position.set(-2.4, 0.03 + 0.25 * lift, 1.2 + 0.25 * lift); R.board.rotation.x = -1.3 * lift; R.cash.forEach((c, i) => c.visible = lift > 0.5);
  // snake
  animSnake(R.intTank.userData.snake, T, ci === 1 ? ease(prog(T, E.fed - 0.1, E.fed + 0.4)) : 0); R.mouse.visible = ci === 1 && T > E.fed - 0.5 && T < E.fed + 0.3; R.mouse.position.y = lerp(1.6, 0.9, prog(T, E.fed - 0.5, E.fed));
  // gym bar goes up and down
  const gym = ci === 3 && T > E.reps - 0.2 && T < E.hid - 0.15; const rep = gym ? Math.abs(S(T * 4)) : 0; R.bar.position.set(-8.5, 1.15 + 0.4 * rep, -5.3);
  // the two of them
  const hm = R.him, hr = R.her, hu = hm.userData, ru = hr.userData; stillP(hm); stillP(hr); hm.visible = hr.visible = true; R.soot.forEach(s => s.visible = false); hm.rotation.set(0, 0, 0); hr.rotation.set(0, 0, 0); hm.position.y = 0;
  hm.position.set(0.4, 0.95, -1.3); hm.rotation.y = 0.2; hr.position.set(-1.2, 0.95, -1.3); hr.rotation.y = 0.1;
  if (ci === 2) { hm.position.set(1.2, 0, -0.6); hm.rotation.y = -0.8; hu.armR.rotation.set(-2.2 + 0.4 * S(T * 9), 0, 0); hr.visible = false; }
  if (ci === 3 && T < E.reps - 0.2) { hm.position.set(2.6, 0, 1.6); hm.rotation.y = -0.4; hr.position.set(1.6, 0, 1.8); hr.rotation.y = -0.2; hu.armR.rotation.set(-1.5, 0, 0); hu.armR.userData.e.rotation.x = -0.3 * Math.abs(S(T * 6)); ru.armL.rotation.set(-0.3, 0, -0.5); ru.armL.userData.e.rotation.set(0, 0, 1.2); }
  if (gym) { hm.position.set(-8.5, 0.72, -4.4); hm.rotation.set(-PI / 2, 0, 0); hu.armL.rotation.set(-1.4 - 0.5 * rep, 0, 0); hu.armR.rotation.set(-1.4 - 0.5 * rep, 0, 0); hu.armL.userData.e.rotation.x = -0.9 * (1 - rep); hu.armR.userData.e.rotation.x = -0.9 * (1 - rep); hu.legL.rotation.x = -1.4; hu.legR.rotation.x = -1.4; hu.legL.userData.k.rotation.x = 1.4; hu.legR.userData.k.rotation.x = 1.4;
    hr.position.set(-10.2, 0.25, -6.6); hr.rotation.y = 0.9; ru.armL.rotation.set(-0.3, 0, -0.5); ru.armL.userData.e.rotation.set(0, 0, 1.2); ru.armR.rotation.set(-0.3, 0, 0.5); ru.armR.userData.e.rotation.set(0, 0, -1.2); }
  if (ins && ci !== 5) { hr.visible = false; if (ci === 3) { hm.position.set(...I3(-2.4, -0.35, 1.95)); hm.rotation.y = PI; hu.legL.rotation.x = -1.5; hu.legR.rotation.x = -0.2; hu.legL.userData.k.rotation.x = 1.6; hu.legR.userData.k.rotation.x = 1.9; hu.up.rotation.x = 0.4; hu.armR.rotation.set(-1.2, 0, 0); } else { hm.position.set(...I3(3.7, 0, -1.7)); hm.rotation.y = -2.4; hu.armR.rotation.set(-1.6, 0, 0); } }
  // leaving for a day: walk to the car, drive off
  const drive = ci === 4 ? ease(prog(T, E.c4 + 0.3, E.fightA)) : 0;
  if (ci === 4) { hm.visible = hr.visible = T < E.c4 + 0.5; hm.position.set(4.0, 0, 1.0); hm.rotation.y = 0.3; hr.position.set(3.2, 0, 1.2); hr.rotation.y = 0.3; walkP(hm, T * 8, 0.7); walkP(hr, T * 8 + 1, 0.7); }
  // the break-in: she takes on both of them while the place catches fire
  R.thugs.forEach(p => { stillP(p); p.visible = T >= E.fightA && T < E.run; p.rotation.set(0, 0, 0); });
  if (T >= E.fightA && T < E.run) { hm.visible = false; hr.visible = true; hr.position.set(...I3(-0.6, 0, -0.2)); hr.rotation.y = PI / 2; const [a, b] = R.thugs, au = a.userData, bu = b.userData; const enter = ease(prog(T, E.fightA - 0.2, E.fightA + 0.15));
    const p1 = E.fought - 0.55, k1 = E.every - 0.1; a.position.set(...I3(lerp(4.5, 0.4, enter), 0, -0.1)); a.rotation.y = -PI / 2; b.position.set(...I3(lerp(5.2, 1.0, enter), 0, 0.7)); b.rotation.y = -PI / 2 - 0.3; if (enter < 1) { walkP(a, T * 9, 1); walkP(b, T * 9 + 1, 1); }
    au.armR.rotation.set(-1.4, 0, 0); bu.armL.rotation.set(-1.4, 0, 0);
    if (T > p1 - 0.15 && T < p1 + 0.25) { ru.armR.rotation.set(-1.6, 0, 0); hr.rotation.y = PI / 2 - 0.2; }
    if (T > p1) { const d = Math.min(1, (T - p1) * 1.6); a.position.set(...I3(0.4 + 3.2 * d, 0.6 * S(PI * d), -0.1 - 1.4 * d)); a.rotation.set(0, -PI / 2, -1.3 * d); }
    if (T > k1 - 0.15 && T < k1 + 0.3) { ru.legR.rotation.x = -1.6; hr.rotation.y = PI / 2 + 0.3; }
    if (T > k1) { const d = Math.min(1, (T - k1) * 1.6); b.position.set(...I3(1.0 + 2.8 * d, 0.8 * S(PI * d), 0.7 + 1.6 * d)); b.rotation.set(1.2 * d, -PI / 2, 0); }
    if (T > k1 + 0.4) { ru.armL.rotation.set(-2.8, 0, 0); ru.armR.rotation.set(-2.8, 0, 0); } }
  const fireK = T >= E.fightA && T < E.run ? 0.4 + 0.6 * prog(T, E.fightA, E.run) : 0; R.ifire.forEach((f, i) => { const a = i * 1.3; f.position.set(-3.2 + (i % 6) * 1.2, 0.4 + (i % 3) * 0.5 + 0.2 * S(T * 7 + i), -2.6 + (i % 2) * 0.4); f.scale.setScalar((0.6 + 0.6 * Math.abs(S(T * 5 + i))) * (0.5 + fireK)); f.material.opacity = fireK > 0 ? 0.9 * Math.min(1, fireK * 2) : 0; }); R.ifireL.intensity = 25 * fireK;
  // the blast: she gets thrown clear, spinning off into the sky (you were away)
  const running = T >= E.run && T < E.boom;
  if (running) { hm.visible = false; hr.visible = true; const k = prog(T, E.run, E.boom); hr.position.set(lerp(-0.4, 0.8, k), 0, lerp(-2.3, 3.6, k)); hr.rotation.set(0.15, 0.1, 0); walkP(hr, T * 15, 1.5); ru.armL.rotation.x = -1.0 * S(T * 15); ru.armR.rotation.x = 1.0 * S(T * 15); }
  if (T >= E.boom) { hm.visible = false; hr.visible = ci === 5; const d = clamp((T - E.boom) / 1.3); hr.position.set(0.8 + 5 * d, 0.4 + 9 * d - 5 * d * d, 3.6 + 9 * d); hr.rotation.set(-8 * d, 1.5 * d, 6 * d); ru.armL.rotation.set(-2.8, 0, -0.7); ru.armR.rotation.set(-2.8, 0, 0.7); ru.legL.rotation.x = -0.7; ru.legR.rotation.x = 0.6; }
  R.car.userData.p0.set(ci === 4 && T < E.fightA ? lerp(4.5, 30, drive) : ci >= 4 ? 300 : 4.5, 0, ci === 4 ? lerp(-0.5, 7.5, Math.min(1, drive * 3)) : ci >= 5 ? 7.6 : -0.5); R.car.userData.r0.set(0, ci === 4 && drive > 0.05 ? PI / 2 : ci >= 5 ? PI / 2 : 0, 0);
  R.firework.visible = false; R.spark.material.opacity = 0;
  // the blast
  const bt = T - E.boom, boom = bt > 0; R.extTank.visible = ci === 6; R.extTank.userData.snake.visible = false; R.extTank.rotation.z = 0.5; R.extTank.position.y = 0.1;
  R.brokenGlass.forEach((g, i) => { g.position.set(-0.7 + (i % 4) * 0.4, 0.06, -5.0 + Math.floor(i / 4) * 0.5); g.rotation.y = i; g.visible = ci === 6; });
  R.notes.forEach((n, i) => { if (ci !== 7) { n.position.y = -50; return; } const ph = (T * 0.35 + i / 24) % 1; n.position.set(-2.4 + 1.6 * S(i * 1.7 + T), 3.2 - ph * 3.2, -4.6 + 1.2 * C(i * 2.3 + T * 0.7)); n.rotation.set(T * 3 + i, i, T * 2); n.material.color.set(ph > 0.6 ? '#2a1a10' : (i % 4 ? '#5aa85a' : '#3a2a1a')); });
  R.parts.forEach((p, i) => { const u = p.userData; p.position.copy(u.p0); p.rotation.copy(u.r0); if (boom && p !== R.car) { const d = Math.min(bt, 1.6); const dir = new T3.Vector3(u.p0.x, 0, u.p0.z + (p.parent === R.house ? 0 : 6)).normalize(); p.position.set(u.p0.x + dir.x * 9 * d + S(i) * 2 * d, u.p0.y + 12 * d - 9 * d * d, u.p0.z + dir.z * 9 * d + C(i) * 2 * d); p.rotation.set(u.r0.x + d * (i % 3 + 1), u.r0.y + d * 2, u.r0.z + d * (i % 2 + 1)); p.visible = d < 1.5; } else p.visible = true; });
  [R.stepsG, R.railG, [R.railTop, R.wallPanel]].flat().forEach(b => { if (boom) b.visible = false; });
  R.debris.forEach((b, i) => { const u = b.userData; if (!boom) { b.position.set(0, -5, -6); return; } const d = Math.min(bt, 2.2); b.position.set(u.v[0] * d, Math.max(0.1, 2 + u.v[1] * d - 9.8 * d * d), -6 + u.v[2] * d); b.rotation.set(u.s[0] * d, u.s[1] * d, 0); });
  R.fire.forEach((f, i) => { if (running) { const w = [[-3, 1.6, -2.4], [2.6, 1.6, -2.4], [-1, 4.9, -3.7], [-0.4, 1.1, -2.4]][i % 4]; f.position.set(w[0] + 0.3 * S(i * 3.1), w[1] + 0.25 * Math.abs(S(T * 7 + i)), w[2]); f.scale.setScalar(0.9 + 0.5 * Math.abs(S(T * 6 + i))); f.material.opacity = 0.85; return; } if (!boom) { f.material.opacity = 0; return; } const k = clamp(bt / 1.4), a = i * 2.4; f.position.set(Math.cos(a) * 5 * k * (0.4 + (i % 3) * 0.3), 3 + 9 * k * (0.3 + (i % 4) * 0.2), -1.5 + Math.sin(a) * 2 * k); f.scale.setScalar(3 + 9 * k); f.material.opacity = 1 - k * 0.6; if (ci >= 6) { f.position.set(-3.5 + (i % 9) * 0.9, 0.5 + 0.3 * Math.abs(S(T * 6 + i)), -8 + (i % 5) * 1.2); f.scale.setScalar(0.8 + 0.4 * Math.abs(S(T * 5 + i))); f.material.opacity = 0.9; } });
  R.smoke.forEach((s, i) => { if (!boom) { s.material.opacity = 0; return; } const k = clamp(bt / 3), a = i * 1.9; s.position.set(Math.cos(a) * 5 * k, 4 + 10 * k + (i % 5), -6 + Math.sin(a) * 3 * k); s.scale.setScalar(4 + 10 * k); s.material.opacity = 0.75 * (1 - 0.3 * k); });
  R.crater.visible = ci >= 6; R.rubble.forEach(b => b.visible = ci >= 6); R.burnL.intensity = boom ? (ci >= 6 ? 6 + 2 * S(T * 9) : 40 * (1 - clamp(bt / 1.2)) + 8) : 0;
  if (ci >= 6) R.parts.forEach(p => { if (p !== R.car) p.visible = false; }); }
function shot(T) { const si = shotAt(T), sh = SH[si], t0 = sh[0], t1 = si + 1 < SH.length ? SH[si + 1][0] : TM.total; camera.fov = 60; camera.updateProjectionMatrix(); anim(T); sh[1](prog(T, t0, t1), T);
  const bt = T - E.boom; if (bt > 0 && bt < 1.2) { const a = 0.35 * (1 - bt / 1.2); camera.position.x += a * S(T * 70); camera.position.y += a * S(T * 53 + 1); }
  const c = camera.position; R.sun.position.set(c.x + 40, 50, c.z + 30); R.sun.target.position.set(c.x, 0, c.z - 6); R.sun.target.updateMatrixWorld(); return { si, t0 }; }
