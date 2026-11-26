
// ---------- timing ----------
const E = { back: AT(0, 'dinosaurs'), street: AT(0, 'one'), c1: CL[1].start, day1: AT(1, 'day'), fog: AT(1, 'a'), c2: CL[2].start, advert: AT(2, 'people'), c3: CL[3].start, ptero: AT(3, 'pterosaurs'), flight: AT(3, 'every'),
  c4: CL[4].start, raptors: AT(4, 'raptors'), hunt: AT(4, 'they'), c5: CL[5].start, shake: AT(5, 'ground'), c6: CL[6].start, huge: AT(6, 'huge'), c7: CL[7].start, comment: AT(7, 'comment') };
E.loop = TM.total - 0.4;
const SB = [600, 0, 0];
// ---------- dinosaurs ----------
function dinoTex(base, stripe, seed) { return PT(16, 16, (c) => { noisy(c, 16, 16, base, 28, seed); const r = rng(seed + 9); c.fillStyle = stripe; for (let i = 0; i < 10; i++) c.fillRect((r() * 16) | 0, (r() * 16) | 0, 1 + (r() * 3 | 0), 1); for (let y = 2; y < 16; y += 5) { c.fillStyle = 'rgba(0,0,0,0.18)'; c.fillRect(0, y, 16, 1); } }); }
function chain(parent, n, len0, w0, h0, taper, mat, dir, bend) { const segs = []; let p = parent; for (let i = 0; i < n; i++) { const k = 1 - taper * i / n; const g = new T3.Group(); g.position.set(0, 0, i === 0 ? 0 : dir * len0 * (1 - taper * (i - 1) / n)); p.add(g); boxM(g, w0 * k, h0 * k, len0 * k, mat, 0, 0, dir * len0 * k / 2); g.rotation.x = bend; segs.push(g); p = g; } return segs; }
function brachio() { const g = new T3.Group(); const sk = LM({ map: dinoTex('#6a7258', '#4a523e', 41) }), belly = LM({ map: dinoTex('#8a8a6a', '#6a6a52', 42) });
  boxM(g, 6, 5.5, 12, [sk, sk, sk, belly, sk, sk], 0, 10.5, 0); const legs = []; for (const [x, z] of [[-2.2, 4], [2.2, 4], [-2.2, -4], [2.2, -4]]) { const l = new T3.Group(); l.position.set(x, 9, z); g.add(l); boxM(l, 1.9, 9, 1.9, sk, 0, -4.5, 0); boxM(l, 2.2, 0.6, 2.4, belly, 0, -8.8, 0.2); legs.push(l); }
  const nb = new T3.Group(); nb.position.set(0, 12, 5.5); g.add(nb); const neck = []; let p = nb; for (let i = 0; i < 9; i++) { const k = 1 - i * 0.06; const s = new T3.Group(); s.position.set(0, i ? 2.0 : 0, i ? 0.25 : 0); p.add(s); boxM(s, 1.9 * k, 2.2, 1.9 * k, sk, 0, 1.1, 0); s.rotation.x = i ? 0.03 : 0.55; neck.push(s); p = s; }
  const head = new T3.Group(); head.position.set(0, 2.2, 0.4); p.add(head); boxM(head, 1.5, 1.3, 2.6, sk, 0, 0.3, 0.7); boxM(head, 1.3, 0.4, 1.6, belly, 0, -0.4, 1.2); for (const sx of [-1, 1]) boxM(head, 0.1, 0.25, 0.25, LM({ color: '#111' }), sx * 0.76, 0.5, 1.2, false);
  const tb = new T3.Group(); tb.position.set(0, 11, -6); g.add(tb); const tail = chain(tb, 9, 2.4, 3.2, 2.6, 0.85, sk, -1, 0.05); tb.rotation.x = 0.25;
  g.userData = { legs, neck, head, tail }; return g; }
function trex() { const g = new T3.Group(); const sk = LM({ map: dinoTex('#5a4a34', '#3a2e20', 51) }), belly = LM({ map: dinoTex('#8a7a5a', '#6a5a40', 52) }), teeth = PM('#e8e0c8', 10, 8, 53), mouth = PM('#5a1a1a', 14, 8, 54);
  const body = new T3.Group(); body.position.y = 6.2; g.add(body); boxM(body, 3.4, 3.6, 6.2, [sk, sk, sk, belly, sk, sk], 0, 0, 0);
  const neck = new T3.Group(); neck.position.set(0, 1.2, 3.0); body.add(neck); boxM(neck, 2.2, 2.4, 2.4, sk, 0, 0.4, 0.8); neck.rotation.x = -0.25;
  const head = new T3.Group(); head.position.set(0, 1.0, 2.0); neck.add(head); boxM(head, 2.2, 1.6, 3.8, sk, 0, 0.3, 1.5); boxM(head, 2.0, 0.2, 3.2, teeth, 0, -0.55, 1.7); for (const sx of [-1, 1]) { boxM(head, 0.12, 0.3, 0.4, LM({ color: '#e8b020', emissive: '#6a4a00', emissiveIntensity: 0.6 }), sx * 1.11, 0.7, 1.0, false); boxM(head, 0.3, 0.3, 0.6, sk, sx * 0.85, 1.15, 0.9); }
  const jaw = new T3.Group(); jaw.position.set(0, -0.5, 0.2); head.add(jaw); boxM(jaw, 1.9, 0.7, 3.4, [sk, sk, mouth, belly, sk, sk], 0, -0.3, 1.5); boxM(jaw, 1.8, 0.18, 3.0, teeth, 0, 0.1, 1.6);
  for (const sx of [-1, 1]) { const a = new T3.Group(); a.position.set(sx * 1.5, -0.6, 2.4); body.add(a); boxM(a, 0.3, 1.1, 0.35, sk, 0, -0.5, 0.2).rotation.x = -0.6; }
  const legs = []; for (const sx of [-1, 1]) { const hip = new T3.Group(); hip.position.set(sx * 1.6, -0.6, -0.4); body.add(hip); boxM(hip, 1.4, 3.4, 2.0, sk, 0, -1.5, 0.2); const kn = new T3.Group(); kn.position.set(0, -3.0, 0.5); hip.add(kn); boxM(kn, 0.9, 2.8, 1.0, sk, 0, -1.3, -0.4).rotation.x = 0.3; boxM(kn, 1.2, 0.5, 1.8, belly, 0, -2.7, 0.0); hip.userData.k = kn; legs.push(hip); }
  const tb = new T3.Group(); tb.position.set(0, 0.6, -3.0); body.add(tb); const tail = chain(tb, 7, 1.9, 2.6, 2.4, 0.85, sk, -1, 0.04); tb.rotation.x = -0.1;
  g.userData = { body, neck, head, jaw, legs, tail }; return g; }
function raptor(seed) { const g = new T3.Group(); const sk = LM({ map: dinoTex(['#7a6a48', '#6a5a3a', '#5a6a48'][seed % 3], '#3a2e1e', 60 + seed) }), mouth = PM('#5a1a1a', 14, 8, 64);
  const body = new T3.Group(); body.position.y = 1.35; g.add(body); boxM(body, 0.7, 0.8, 1.6, sk, 0, 0, 0); const neck = new T3.Group(); neck.position.set(0, 0.35, 0.75); body.add(neck); boxM(neck, 0.4, 0.8, 0.4, sk, 0, 0.35, 0.1).rotation.x = 0.4;
  const head = new T3.Group(); head.position.set(0, 0.8, 0.35); neck.add(head); boxM(head, 0.45, 0.4, 0.9, sk, 0, 0, 0.3); const jaw = new T3.Group(); jaw.position.set(0, -0.15, 0); head.add(jaw); boxM(jaw, 0.4, 0.15, 0.8, [sk, sk, mouth, sk, sk, sk], 0, -0.08, 0.3); for (const sx of [-1, 1]) boxM(head, 0.05, 0.08, 0.08, LM({ color: '#e8c020', emissive: '#e8a000', emissiveIntensity: 1 }), sx * 0.23, 0.08, 0.35, false);
  const legs = []; for (const sx of [-1, 1]) { const hip = new T3.Group(); hip.position.set(sx * 0.3, -0.2, 0); body.add(hip); boxM(hip, 0.3, 0.7, 0.45, sk, 0, -0.3, 0.1); const kn = new T3.Group(); kn.position.set(0, -0.6, 0.1); hip.add(kn); boxM(kn, 0.2, 0.6, 0.22, sk, 0, -0.3, -0.15).rotation.x = 0.4; boxM(kn, 0.3, 0.12, 0.45, sk, 0, -0.58, 0.05); hip.userData.k = kn; legs.push(hip); }
  const tb = new T3.Group(); tb.position.set(0, 0.1, -0.8); body.add(tb); const tail = chain(tb, 6, 0.42, 0.45, 0.4, 0.8, sk, -1, 0.02); g.userData = { body, head, jaw, legs, tail }; return g; }
function ptero(seed) { const g = new T3.Group(); const sk = LM({ map: dinoTex('#6a5040', '#4a3828', 70 + seed) }), mem = LM({ map: dinoTex('#8a6048', '#6a4030', 75 + seed), side: T3.DoubleSide });
  boxM(g, 0.5, 0.45, 1.6, sk, 0, 0, 0); boxM(g, 0.3, 0.3, 1.4, sk, 0, 0.15, 1.3); boxM(g, 0.12, 0.5, 0.9, sk, 0, 0.4, 0.5).rotation.x = 0.5; const wings = []; for (const sx of [-1, 1]) { const w = new T3.Group(); w.position.set(sx * 0.25, 0.1, 0.2); g.add(w); boxM(w, 2.6, 0.08, 1.1, mem, sx * 1.3, 0, 0); const w2 = new T3.Group(); w2.position.set(sx * 2.6, 0, 0); w.add(w2); boxM(w2, 2.2, 0.06, 0.8, mem, sx * 1.1, 0, -0.1); w.userData.t = w2; wings.push(w); }
  g.userData = { wings }; return g; }
function walkDino(d, ph, a, kind) { const u = d.userData; if (kind === 'b') { u.legs.forEach((l, i) => l.rotation.x = S(ph + (i === 0 || i === 3 ? 0 : PI)) * 0.22 * a); u.neck.forEach((s, i) => { if (i) s.rotation.z = 0.02 * S(ph * 0.5 + i * 0.3); }); u.tail.forEach((s, i) => s.rotation.y = 0.06 * S(ph * 0.5 - i * 0.4)); }
  else { u.legs.forEach((l, i) => { const s = S(ph + i * PI); l.rotation.x = s * 0.5 * a; l.userData.k.rotation.x = Math.max(0, -s) * 0.7 * a; }); u.body.position.y = (kind === 't' ? 6.2 : 1.35) + Math.abs(C(ph)) * (kind === 't' ? 0.25 : 0.08) * a; u.tail.forEach((s, i) => s.rotation.y = 0.08 * S(ph - i * 0.5)); } }
// ---------- build ----------
function build() {
  R.sun = new T3.DirectionalLight('#ffd8b0', 1.8); R.sun.castShadow = true; R.sun.shadow.mapSize.set(2048, 2048); const sc = R.sun.shadow.camera; sc.left = sc.bottom = -60; sc.right = sc.top = 60; sc.near = 1; sc.far = 400; R.sun.shadow.bias = -0.0008; scene.add(R.sun); scene.add(R.sun.target);
  R.hemi = new T3.HemisphereLight('#a8a0c8', '#5a5048', 1.1); scene.add(R.hemi);
  R.skyM = new T3.MeshBasicMaterial({ side: T3.BackSide, fog: false, toneMapped: false }); R.skyD = PT(8, 64, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#5a5a82'); g.addColorStop(0.4, '#8a86a8'); g.addColorStop(0.5, '#c8a898'); g.addColorStop(0.53, '#a89890'); g.addColorStop(1, '#4a4a52'); c.fillStyle = g; c.fillRect(0, 0, w, h); });
  R.skyN = PT(8, 64, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#0a0e1e'); g.addColorStop(0.48, '#1e2a48'); g.addColorStop(0.53, '#2a3048'); g.addColorStop(1, '#0a0c14'); c.fillStyle = g; c.fillRect(0, 0, w, h); }); R.skyM.map = R.skyD; add(scene, Sp(1500, 24, 12), R.skyM, 0, 0, 0, false).castShadow = false;
  R.sunGlow = spr(scene, GLOW, '#ffd8a0', 160, -180, 40, -900, 0.9); R.sunDisc = spr(scene, GLOW, '#fff4d8', 40, -180, 40, -898, 1);
  const G = R.G = new T3.Group(); scene.add(G); const asph = PM('#4a4846', 18, 16, 80), walk = PM('#9a9488', 16, 16, 81), curb = PM('#b8b2a6', 12, 8, 82), white = LM({ color: '#d8d4c8' }), yel = LM({ color: '#c8a030' });
  boxM(G, 400, 0.1, 500, PM('#5a5650', 16, 16, 79), 0, -0.06, -100, false); boxM(G, 12, 0.1, 320, asph, 0, -0.01, -100, false); boxM(G, 200, 0.1, 10, asph, 0, -0.005, -22, false);
  for (const sx of [-1, 1]) { boxM(G, 4, 0.2, 320, walk, sx * 8, 0.08, -100, false); boxM(G, 0.25, 0.22, 320, curb, sx * 6.1, 0.09, -100, false); }
  for (let z = 38; z > -210; z -= 6) { if (Math.abs(z + 22) < 6) continue; for (const x of [-3, 3]) boxM(G, 0.18, 0.02, 2.4, white, x, 0.05, z, false); boxM(G, 0.14, 0.02, 3.6, yel, -0.12, 0.05, z, false); boxM(G, 0.14, 0.02, 3.6, yel, 0.12, 0.05, z, false); }
  for (let x = -5; x <= 5; x += 1.2) { boxM(G, 0.7, 0.02, 2.6, white, x, 0.05, -15.8, false); boxM(G, 0.7, 0.02, 2.6, white, x, 0.05, -28.2, false); }
  // shops along the street
  const r = rng(3); const shopCols = ['#8a7a6a', '#9a8a72', '#6a6a72', '#a8987a', '#7a6a5a', '#8a8278'];
  for (const sx of [-1, 1]) for (let z = 30; z > -60; z -= 9) { if (Math.abs(z + 22) < 7) continue; const h = 5 + r() * 9, col = shopCols[(r() * 6) | 0]; const t = winTexP(col, 0.35, (r() * 1000) | 0, 6, 6); t.wrapS = t.wrapT = T3.RepeatWrapping; t.repeat.set(1, h / 6); const m = LM({ map: t }); boxM(G, 7, h, 8.5, [m, m, PM(col, 18, 16, 5), m, m, m], sx * 14, h / 2, z, false);
    boxM(G, 0.6, 2.6, 7.5, PM('#1e2228', 14, 8, 6), sx * 10.25, 1.3, z, false); boxM(G, 1.6, 0.18, 7.8, PM(['#8a2a24', '#2a4a7a', '#3a6a3a', '#7a5a2a'][(r() * 4) | 0], 20, 8, 7), sx * 9.8, 3.0, z, false); }
  // billboard (left foreground) and awning
  const bb = PT(32, 12, (c) => { noisy(c, 32, 12, '#c8b8a0', 20, 90); noisy(c, 32, 5, '#a83a2a', 26, 91, 0, 1); noisy(c, 32, 3, '#3a4a7a', 20, 92, 0, 8); c.fillStyle = '#f0e8d8'; c.fillRect(3, 2, 10, 2); }); boxM(G, 0.3, 4.8, 9, [LM({ map: bb }), LM({ map: bb }), PM('#3a3a3e'), PM('#3a3a3e'), PM('#3a3a3e'), PM('#3a3a3e')], -9.4, 9.6, 12, false); for (const z of [9, 15]) boxM(G, 0.3, 7.5, 0.3, PM('#3a3430', 16, 8, 93), -9.4, 3.75, z, false);
  boxM(G, 2.4, 0.3, 6, PM('#4a3a30', 18, 8, 94), -9.6, 4.6, 6, false); boxM(G, 0.5, 4.6, 0.5, PM('#3a2e26', 18, 8, 95), -8.4, 2.3, 3.4, false);
  for (let z = 30; z > -60; z -= 14) { palm(G, -8.6, z, 10 + r() * 4, 100 + z | 0); palm(G, 8.6, z - 7, 10 + r() * 4, 200 + z | 0); } for (let z = 24; z > -60; z -= 18) { lampP(G, -7.2, z, 1); lampP(G, 7.2, z - 9, -1); }
  for (const [x, z, a] of [[-6.4, -15.5, 0], [6.4, -28.5, PI]]) { const tl = new T3.Group(); tl.position.set(x, 0, z); tl.rotation.y = a; G.add(tl); boxM(tl, 0.2, 4.6, 0.2, PM('#2a2a2e'), 0, 2.3, 0, false); boxM(tl, 0.5, 1.3, 0.4, PM('#1a1a1c'), 0, 4.8, 0, false); boxM(tl, 0.26, 0.26, 0.05, LM({ color: '#30ff60', emissive: '#30ff60', emissiveIntensity: 1 }), 0, 4.4, 0.22, false); }
  // freeway overpass
  const conc = PM('#8a867e', 16, 16, 110); boxM(G, 220, 1.4, 10, conc, 0, 7.4, -62, false); for (const sx of [-1, 1]) boxM(G, 220, 0.9, 0.3, conc, 0, 8.55, -62 + sx * 4.85, false); for (const x of [-30, -12, 12, 30]) boxM(G, 1.4, 6.8, 2.4, conc, x, 3.4, -62, false); boxM(G, 220, 0.04, 0.2, white, 0, 8.12, -62, false);
  R.fwyCars = []; for (let i = 0; i < 6; i++) { const c = car(i + 2); c.scale.setScalar(0.95); c.position.set(0, 8.1, -62 + (i % 2 ? 2.2 : -2.2)); c.rotation.y = i % 2 ? PI / 2 : -PI / 2; G.add(c); R.fwyCars.push(c); }
  // skyline
  const rs = rng(17); for (let i = 0; i < 34; i++) { const x = -110 + rs() * 220, z = -110 - rs() * 180, w = 14 + rs() * 16, h = 30 + rs() * 70; if (Math.abs(x) < 10 && z > -150) continue; tower(G, x, z, w, h, w, ['#6a6a72', '#5a5e68', '#7a7470', '#4e525c'][(rs() * 4) | 0], 0.25, 300 + i); }
  { const h = tower(G, 6, -170, 22, 120, 22, '#5e626c', 0.3, 999); tower(G, 6, -170, 16, 132, 16, '#5e626c', 0.3, 998); tower(G, 6, -170, 10, 142, 10, '#5e626c', 0.3, 997); boxM(G, 12, 2, 12, PM('#4a4e58'), 6, 142, -170, false); R.towerTop = [6, 143, -170]; }
  // ---- traffic + people ----
  R.cars = []; const lanes = [[-3.6, 1, 9], [-1.4, 1, 11], [1.4, -1, 10], [3.6, -1, 8]]; for (let i = 0; i < 12; i++) { const [x, dir, sp] = lanes[i % 4]; const c = car(i); c.userData.mv = { x, dir, sp: sp * (0.85 + 0.3 * ((i * 37) % 10) / 10), z0: 30 - i * 17 }; c.rotation.y = dir > 0 ? 0 : PI; G.add(c); R.cars.push(c); }
  R.peds = []; for (let i = 0; i < 18; i++) { const p = person(OUTFITS[i % OUTFITS.length]); const side = i % 2 ? 1 : -1; p.userData.mv = { x: side * (7.0 + ((i * 13) % 5) * 0.4), dir: (i % 4 < 2 ? 1 : -1), sp: 1.2 + ((i * 7) % 5) * 0.12, z0: 28 - i * 5.5, ph: i }; G.add(p); R.peds.push(p); }
  // ---- dinosaurs downtown ----
  R.brach = brachio(); G.add(R.brach); R.trex = trex(); G.add(R.trex); R.trex.scale.setScalar(1.15);
  R.pteros = []; for (let i = 0; i < 9; i++) { const p = ptero(i); p.scale.setScalar(2.2); G.add(p); R.pteros.push(p); }
  // ---- suburbs at night ----
  const U = R.U = new T3.Group(); U.position.set(...SB); scene.add(U); boxM(U, 200, 0.1, 200, PM('#2e3a2a', 16, 16, 120), 0, -0.05, -40, false); boxM(U, 9, 0.1, 200, PM('#2e2e30', 16, 16, 121), 0, 0, -40, false);
  for (const sx of [-1, 1]) { boxM(U, 2.5, 0.16, 200, PM('#6a6862', 14, 16, 122), sx * 5.8, 0.06, -40, false); for (let z = 20; z > -90; z -= 16) { const hz = z + (sx > 0 ? 6 : 0); const hc = ['#a8987a', '#8a9aa8', '#b8a888', '#9a8a7a'][((z * sx) | 0) & 3]; const wt = PT(16, 8, (c) => { noisy(c, 16, 8, hc, 18, 130 + z); c.fillStyle = '#ffd890'; c.fillRect(2, 2, 3, 3); c.fillRect(11, 2, 3, 3); c.fillStyle = '#3a2a20'; c.fillRect(7, 3, 2, 5); });
    const wm = LM({ map: wt, emissive: '#6a4a20', emissiveIntensity: 0.35, emissiveMap: wt }); boxM(U, 9, 4.2, 8, [wm, wm, PM('#5a3a30'), PM('#5a3a30'), wm, wm], sx * 16, 2.1, hz, false); const roof = boxM(U, 10, 0.5, 9, PM('#4a3028', 20, 8, 131), sx * 16, 4.6, hz, false);
    for (let k = 0; k < 6; k++) boxM(U, 0.12, 0.9, 0.12, PM('#d8d4cc'), sx * 9.8, 0.45, hz - 4 + k * 1.6, false); boxM(U, 0.08, 0.1, 8, PM('#d8d4cc'), sx * 9.8, 0.8, hz, false);
    const pc = car((z + 40 + (sx > 0 ? 3 : 0)) & 7); pc.position.set(sx * 3.4, 0, hz + 3); pc.rotation.y = sx > 0 ? PI : 0; U.add(pc); } }
  R.subL = []; for (let z = 14; z > -80; z -= 20) for (const sx of [-1, 1]) { lampP(U, sx * 5.4, z, -sx); const l = new T3.PointLight('#ffd8a0', 30, 20, 1.4); l.position.set(SB[0] + sx * 4.2, 5.6, z); scene.add(l); R.subL.push(l); }
  R.alarmCar = car(1); R.alarmCar.position.set(-3.4, 0, -14); U.add(R.alarmCar); R.alarmL = new T3.PointLight('#ffb040', 0, 10, 1.6); R.alarmL.position.set(SB[0] - 3.4, 1.4, -11.8); scene.add(R.alarmL);
  R.raps = []; for (let i = 0; i < 5; i++) { const rp = raptor(i); U.add(rp); R.raps.push(rp); }
}
// ---------- lighting modes ----------
function lightMode(m) { if (R.mode === m) return; R.mode = m;
  if (m === 'dusk') { scene.fog.color.set('#8a86a0'); scene.fog.near = 30; scene.fog.far = 320; R.sun.color.set('#ffd0a0'); R.sun.intensity = 2.6; R.hemi.color.set('#b8b0d8'); R.hemi.groundColor.set('#7a6a5a'); R.hemi.intensity = 1.7; R.skyM.map = R.skyD; R.sunGlow.visible = R.sunDisc.visible = true; }
  if (m === 'fog') { scene.fog.color.set('#b0aeb8'); scene.fog.near = 6; scene.fog.far = 110; R.sun.color.set('#e8e0d8'); R.sun.intensity = 1.4; R.hemi.color.set('#e0dce8'); R.hemi.groundColor.set('#8a8680'); R.hemi.intensity = 1.9; R.skyM.map = R.skyD; R.sunGlow.visible = R.sunDisc.visible = false; }
  if (m === 'red') { scene.fog.color.set('#9a7a7a'); scene.fog.near = 25; scene.fog.far = 300; R.sun.color.set('#ffa070'); R.sun.intensity = 2.6; R.hemi.color.set('#d8aaa0'); R.hemi.groundColor.set('#6a5048'); R.hemi.intensity = 1.6; R.skyM.map = R.skyD; R.sunGlow.visible = R.sunDisc.visible = true; }
  if (m === 'night') { scene.fog.color.set('#141c2e'); scene.fog.near = 8; scene.fog.far = 95; R.sun.color.set('#9ab0f0'); R.sun.intensity = 1.0; R.hemi.color.set('#5a6aa8'); R.hemi.groundColor.set('#2a2e3a'); R.hemi.intensity = 1.3; R.skyM.map = R.skyN; R.sunGlow.visible = R.sunDisc.visible = false; }
  R.skyM.needsUpdate = true; }
