
// ---------- timing ----------
const E = { c1: CL[1].start, ladder: AT(1, 'so'), short: AT(1, "it's"), c2: CL[2].start, ten: AT(2, 'ten'), sneeze: AT(2, 'then'), c3: CL[3].start, bottle: AT(3, 'he'), head: AT(3, 'headshot'),
  c4: CL[4].start, light: AT(4, 'and'), c5: CL[5].start, km: AT(5, 'by'), orbit: AT(5, "you're"), c6: CL[6].start, see: AT(6, 'you'), clothes: AT(6, "he's"), c7: CL[7].start };
E.loop = TM.total - 0.4;
const WIN = [2.2, 4.5, -2.4]; // bathroom window (world)
const SPACE = [3000, 0, 0], BATH = [5000, 0, 0];

function build() {
  buildSky(); R.sun.intensity = 2.8; R.hemi.intensity = 1.0;
  const G = R.G = new T3.Group(); scene.add(G);
  add(G, Bx(200, 0.1, 200), SM('#ffffff', { map: noiseTex(256, 256, '#5e8a3a', [['rgba(0,0,0,0.08)', 3000, 2], ['rgba(255,255,200,0.05)', 2000, 2]], 2, [40, 40]), roughness: 1 }), 0, -0.06, 0, false);
  houseR(G, 0, -6, '#a8584a', '#1f3a5a', 4); houseR(G, -8, -6, '#b87a5a', '#7a1f2a', 5); houseR(G, 8, -6, '#9a4a3a', '#2a5a3a', 6);
  // frosted bathroom glass glows a little
  R.bathGlass = add(G, Bx(1.1, 1.3, 0.06), SM('#dfe8ee', { roughness: 0.3, emissive: '#cfe0ea', emissiveIntensity: 0.25 }), WIN[0], WIN[1], -2.38);
  const fm = SM('#c49a6c', { roughness: 0.9 }); for (let x = -12; x <= 12; x += 0.35) add(G, Bx(0.12, 1.6, 0.05), fm, x, 0.8, 9); add(G, Bx(24, 0.1, 0.06), fm, 0, 1.3, 9.06);
  treeR(G, -6, 4, 1.1, 3); treeR(G, 7, 5, 0.9, 8); hedge(G, -3, 8.4, 8); add(G, Bx(2.4, 2.2, 2), SM('#6a8a5a', { roughness: 0.8 }), -8, 1.1, 5); add(G, new T3.ConeGeometry(1.9, 0.8, 4), SM('#4a4e56'), -8, 2.6, 5).rotation.y = PI / 4;
  // ladder (too short)
  const lad = R.ladder = new T3.Group(); G.add(lad); const al = SM('#c8ccd2', { metalness: 0.8, roughness: 0.3 }); for (const sx of [-0.25, 0.25]) rod(lad, [sx, 0, 1.0], [sx, 2.7, -2.2], 0.025, al); for (let i = 1; i < 10; i++) { const k = i / 10; rod(lad, [-0.25, 2.7 * k, 1.0 - 3.2 * k], [0.25, 2.7 * k, 1.0 - 3.2 * k], 0.015, al); }
  lad.position.set(WIN[0], 0, 0);
  // stilts
  R.stilts = new T3.Group(); G.add(R.stilts); for (const sx of [-0.12, 0.12]) rod(R.stilts, [sx, 0, 0], [sx, 3.6, 0], 0.035, WOOD());
  // drone
  const dr = R.drone = new T3.Group(); G.add(dr); add(dr, RB(0.3, 0.1, 0.3, 0.03), SM('#e8e8ec', { roughness: 0.4 }), 0, 0, 0); R.rotors = [];
  for (const [x, z] of [[-0.25, -0.25], [0.25, -0.25], [-0.25, 0.25], [0.25, 0.25]]) { rod(dr, [0, 0, 0], [x, 0.02, z], 0.012, SM('#333')); const r_ = add(dr, Cy(0.13, 0.13, 0.005, 20), SM('#222', { transparent: true, opacity: 0.45 }), x, 0.06, z, false); R.rotors.push(r_); }
  add(dr, Sp(0.03), SM('#111', { roughness: 0.1 }), 0, -0.04, 0.16); R.droneLed = add(dr, Sp(0.015), BM('#ff3030'), 0.12, 0.03, 0.15);
  R.bottle = new T3.Group(); G.add(R.bottle); add(R.bottle, Cy(0.05, 0.05, 0.22, 14), SM('#3aa0e8', { roughness: 0.3 }), 0, 0, 0); add(R.bottle, Cy(0.025, 0.03, 0.05, 10), SM('#fff'), 0, 0.13, 0);
  // garden chair + 40 fireworks
  const ch = R.chair = new T3.Group(); G.add(ch); const wc = SM('#e8e4dc', { roughness: 0.5 }); add(ch, RB(0.55, 0.05, 0.5, 0.02), wc, 0, 0.45, 0); add(ch, RB(0.55, 0.6, 0.05, 0.02), wc, 0, 0.78, -0.25); for (const [x, z] of [[-0.25, -0.22], [0.25, -0.22], [-0.25, 0.22], [0.25, 0.22]]) rod(ch, [x, 0, z], [x, 0.45, z], 0.02, wc);
  const fwr = rng(4); R.rockets = []; for (let i = 0; i < 40; i++) { const x = -0.3 + (i % 8) * 0.085, y = 0.2 + Math.floor(i / 8) * 0.17; const rk = new T3.Group(); rk.position.set(x, y, -0.36 - fwr() * 0.05); ch.add(rk); add(rk, Cy(0.03, 0.03, 0.26, 10), SM(['#c0392b', '#f1c40f', '#2a6fdb', '#27ae60'][i % 4], { roughness: 0.5 }), 0, 0, 0); add(rk, new T3.ConeGeometry(0.032, 0.07, 10), SM('#eee'), 0, 0.16, 0); R.rockets.push(rk); }
  R.fire = []; R.smoke = []; for (let i = 0; i < 26; i++) R.fire.push(spr(G, GLOW, ['#ffb030', '#ff6a10', '#fff0a0'][i % 3], 0.6, 0, -50, 0, 0)); for (let i = 0; i < 26; i++) R.smoke.push(spr(G, GLOW, '#b8b8b8', 1.2, 0, -50, 0, 0, T3.NormalBlending));
  R.spark = spr(G, GLOW, '#fff0a0', 0.25, 0, -50, 0, 0);
  // characters
  R.you = human({ skin: '#d8a078', top: '#3a3a42', bot: '#2a2e3a', hair: '#2a1a10', eye: '#4a3020', shoe: '#e8e8e8' }); G.add(R.you);
  R.mum = human({ fem: true, skin: '#e8c0a0', top: '#8a4a6a', bot: '#3a3a42', hair: '#5a3a1a' }); G.add(R.mum);
  // ===== SPACE =====
  const SPg = R.space = new T3.Group(); SPg.position.set(...SPACE); scene.add(SPg);
  const et = ctex(1024, 512, (c, w, h) => { c.fillStyle = '#1a4a8a'; c.fillRect(0, 0, w, h); const r = rng(9); c.fillStyle = '#3a7a3a'; for (let i = 0; i < 26; i++) { c.beginPath(); c.ellipse(r() * w, 80 + r() * (h - 160), 30 + r() * 90, 20 + r() * 60, r() * 3, 0, 7); c.fill(); } c.fillStyle = 'rgba(255,255,255,0.75)'; for (let i = 0; i < 120; i++) { c.beginPath(); c.ellipse(r() * w, r() * h, 10 + r() * 50, 4 + r() * 12, r(), 0, 7); c.fill(); } });
  R.earth = add(SPg, Sp(80, 64, 48), SM('#ffffff', { map: et, roughness: 0.7 }), 0, -86, -30, false); add(SPg, Sp(81.5, 64, 48), new T3.MeshBasicMaterial({ color: '#6ab4ff', transparent: true, opacity: 0.18, side: T3.BackSide, toneMapped: false }), 0, -86, -30, false);
  const sg = new T3.BufferGeometry(); const sp_ = []; const sr = rng(3); for (let i = 0; i < 1500; i++) { const a = sr() * 2 * PI, b = sr() * PI, R_ = 400; sp_.push(C(a) * S(b) * R_, C(b) * R_, S(a) * S(b) * R_); } sg.setAttribute('position', new T3.Float32BufferAttribute(sp_, 3)); R.stars = new T3.Points(sg, new T3.PointsMaterial({ color: '#ffffff', size: 1.2, sizeAttenuation: false, fog: false })); SPg.add(R.stars);
  R.chairS = R.chair.clone(); SPg.add(R.chairS); R.youS = human({ skin: '#d8a078', top: '#3a3a42', bot: '#2a2e3a', hair: '#2a1a10', eye: '#4a3020', shoe: '#e8e8e8' }); SPg.add(R.youS);
  R.scope = new T3.Group(); R.youS.userData.armR.userData.h.add(R.scope); add(R.scope, Cy(0.06, 0.08, 0.55, 16), SM('#d8d8de', { metalness: 0.7, roughness: 0.3 }), 0, -0.05, 0.2).rotation.x = PI / 2; add(R.scope, Cy(0.085, 0.085, 0.04, 16), BM('#4a8aff'), 0, -0.05, 0.48).rotation.x = PI / 2;
  // ===== BATHROOM (seen through the telescope) =====
  const BA = R.bath = new T3.Group(); BA.position.set(...BATH); scene.add(BA); const tile = noiseTex(128, 128, '#dfe8ee', [['rgba(0,0,0,0.05)', 400, 2]], 5, [6, 3]); add(BA, Bx(6, 3, 0.1), SM('#ffffff', { map: ctex(128, 128, (c, w, h) => { c.fillStyle = '#dfeaf0'; c.fillRect(0, 0, w, h); c.strokeStyle = '#b8c8d0'; c.lineWidth = 2; for (let i = 0; i <= w; i += 32) { c.beginPath(); c.moveTo(i, 0); c.lineTo(i, h); c.stroke(); c.beginPath(); c.moveTo(0, i); c.lineTo(w, i); c.stroke(); } }), roughness: 0.3 }), 0, 1.5, -1.2);
  add(BA, Bx(6, 0.1, 4), SM('#c8d0d4'), 0, 0, 0); add(BA, Bx(0.04, 2.2, 2), SM('#dff4ff', { transparent: true, opacity: 0.2, roughness: 0.05 }), 0.9, 1.1, -0.2, false); rod(BA, [0, 2.4, -1.15], [0, 2.4, -0.8], 0.02, SM('#c8ccd2', { metalness: 0.9 })); add(BA, Cy(0.12, 0.08, 0.05, 20), SM('#c8ccd2', { metalness: 0.9 }), 0, 2.36, -0.75);
  R.drops = []; for (let i = 0; i < 40; i++) R.drops.push(add(BA, Bx(0.008, 0.12, 0.008), SM('#bfe6ff', { transparent: true, opacity: 0.7 }), 0, -5, 0, false));
  R.broB = human({ skin: '#d8a078', top: '#d06a2a', bot: '#2a3a5a', hair: '#3a2410', eye: '#4a3020', shoe: '#1a1a1e' }); R.broB.position.set(0, 0, -0.6); BA.add(R.broB); add(R.broB.userData.up, Sp(0.14, 16, 10), SM('#d06a2a'), 0, 0.82, -0.06).scale.set(1, 0.8, 1); // hoodie hood
  R.light = new T3.PointLight('#fff4e0', 18, 10, 1.5); R.light.position.set(0, 2.6, 1); BA.add(R.light);
}
const P3 = (o, x, y, z) => [o[0] + x, o[1] + y, o[2] + z];
function chairLift(T) { if (CLI(T) !== 4 && CLI(T) !== 0) return 0; const t0 = (CLI(T) === 0 || T >= E.loop) ? -1.0 : E.light + 0.15; if (T >= E.loop) T = 0; return Math.max(0, T - t0) ** 2 * 3.2; }
const SH = [
  [0, (k, T) => { const y = chairLift(T); look([5.2, 1.6 + y * 0.75, 8.5], [1.4, 1.0 + y * 0.95, 0]); }],
  [E.c1, (k, T) => TR(k, [6.5, 2.2, 7], [5.5, 2.6, 5.6], [WIN[0], 2.6, -2], [WIN[0], 3.2, -2])],
  [E.short - 0.1, (k, T) => look([3.2, 3.6, 2.2], [WIN[0], 3.6, -2.4])],
  [E.c2, (k, T) => TR(k, [6.5, 2.4, 8], [5.8, 3.6, 7], [WIN[0], 3.2, -1], [WIN[0], 4.2, -1])],
  [E.sneeze - 0.1, (k, T) => look([6.5, 3.4, 8.5], [2.6, 2.4, -0.4])],
  [E.c3, (k, T) => TR(k, [4.4, 4.0, 3.6], [3.8, 4.4, 2.8], [WIN[0], 4.4, -1.4], [WIN[0], 4.5, -1.4])],
  [E.head - 0.1, (k, T) => look([4.6, 3.0, 4.6], [WIN[0] + 0.4, 2.6, -0.8])],
  [E.c4, (k, T) => TR(k, [3.4, 1.4, 4.6], [3.0, 1.3, 3.8], [1.2, 0.8, 1.2], [1.2, 0.8, 1.2])],
  [E.light - 0.1, (k, T) => { const y = chairLift(T); look([5.5, 1.6 + y * 0.55, 8], [1.2, 1.0 + y * 0.9, 1.2]); }],
  [E.c5, (k, T) => TR(k, P3(SPACE, 0, 2.2, 6), P3(SPACE, 0, 4, 12), P3(SPACE, 0, 0.6, 0), P3(SPACE, 0, -6, -10))],
  [E.orbit - 0.1, (k, T) => TR(k, P3(SPACE, 2.6, 1.4, 3.0), P3(SPACE, 2.2, 1.3, 2.6), P3(SPACE, 0, 0.8, 0), P3(SPACE, 0, 0.8, 0))],
  [E.c6, (k, T) => TR(k, P3(SPACE, -1.6, 1.4, 2.4), P3(SPACE, -1.3, 1.3, 2.0), P3(SPACE, 0, 1.0, 0), P3(SPACE, 0, 1.0, 0))],
  [E.see - 0.1, (k, T) => TR(k, P3(BATH, 0, 1.5, 4.6), P3(BATH, 0, 1.45, 3.4), P3(BATH, 0, 1.3, -0.6), P3(BATH, 0, 1.35, -0.6))],
  [E.c7, (k, T) => TR(k, P3(SPACE, 0.6, 1.2, 2.2), P3(SPACE, 0.5, 1.2, 1.9), P3(SPACE, 0, 1.2, 0), P3(SPACE, 0, 1.2, 0))],
  [E.loop, (k, T) => { const y = chairLift(0); look([5.2, 1.6 + y * 0.75, 8.5], [1.4, 1.0 + y * 0.95, 0]); }],
];
const shotAt = T => { let i = 0; for (let j = 0; j < SH.length; j++) if (T >= SH[j][0]) i = j; return i; };
function sitOn(p, seatY) { rest(p); const u = p.userData; for (const l of [u.legL, u.legR]) { l.rotation.x = -PI / 2 + 0.1; l.userData.k.rotation.x = PI / 2 - 0.1; } p.position.y = seatY + 0.04 - 0.92; }
function anim(T) { const ci = CLI(T), loop = T >= E.loop, Tt = loop ? 0 : T, cl = loop ? 0 : ci;
  const space = cl === 5 || cl === 7 || (cl === 6 && T < E.see - 0.1); R.space.visible = space; R.G.visible = !space && !(cl === 6 && T >= E.see - 0.1); R.bath.visible = cl === 6 && T >= E.see - 0.1; R.sky.visible = R.G.visible;
  scene.background = R.G.visible ? null : new T3.Color(space ? '#02030a' : '#1a1a1a'); scene.fog.far = space ? 5000 : 500; R.sun.intensity = space ? 3.2 : 2.8;
  R.ladder.visible = cl === 1; R.stilts.visible = cl === 2; R.drone.visible = cl === 3; R.bottle.visible = false; R.chair.visible = cl === 4 || cl === 0; R.mum.visible = false;
  R.fire.forEach(f => f.material.opacity = 0); R.smoke.forEach(f => f.material.opacity = 0); R.spark.material.opacity = 0;
  const u = R.you.userData; rest(R.you); R.you.visible = true; R.you.rotation.set(0, 0, 0);
  if (cl === 1) { const k = prog(T, E.ladder, E.short - 0.2); const y = lerp(0, 1.75, k); R.you.position.set(WIN[0], y, lerp(1.1, -1.2, k)); R.you.rotation.y = PI; const ph = T * 6 * (k < 1 ? 1 : 0); u.legL.rotation.x = -0.6 + 0.4 * S(ph); u.legR.rotation.x = -0.6 - 0.4 * S(ph); u.legL.userData.k.rotation.x = 0.8; u.legR.userData.k.rotation.x = 0.8; u.armL.rotation.x = u.armR.rotation.x = -2.6; if (k >= 1) { u.head.rotation.x = -0.6; u.armR.rotation.x = -3.0; } }
  if (cl === 2) { const fall = prog(T, E.sneeze + 0.4, E.c3 - 0.2); R.stilts.position.set(WIN[0] + 0.3, 0, 0.2); R.stilts.rotation.set(0, 0, 0); R.stilts.rotateX(-fall * 1.5); R.stilts.rotation.z = 0.04 * S(T * 3);
    R.you.position.set(0, 3.6, 0); R.stilts.add(R.you); R.you.rotation.set(0, PI, 0); u.armL.rotation.set(-0.3, 0, 0.6 + 0.3 * S(T * 5)); u.armR.rotation.set(-0.3, 0, -0.6 - 0.3 * S(T * 5)); if (T > E.sneeze && T < E.sneeze + 0.5) { u.up.rotation.x = 0.5 * S(prog(T, E.sneeze, E.sneeze + 0.5) * PI); u.head.rotation.x = 0.4; } face(R.you, fall > 0 ? 'shock' : 'neutral', T); }
  else if (R.you.parent !== R.G) { R.G.add(R.you); }
  if (cl === 3) { R.you.position.set(4.2, 0, 3.5); R.you.rotation.y = -2.6; u.armL.rotation.x = u.armR.rotation.x = -1.2; u.armL.userData.e.rotation.x = u.armR.userData.e.rotation.x = -0.8;
    const hit = prog(T, E.head - 0.05, E.head + 1.0); R.drone.position.set(WIN[0] + 0.1 + S(T * 2) * 0.05 + hit * 0.8, lerp(4.4, 0.15, hit * hit) + S(T * 3) * 0.03, -1.4 + hit * 1.2); R.drone.rotation.set(hit * 4, hit * 9, hit * 3); R.rotors.forEach((r_, i) => r_.rotation.y = T * 40 + i);
    if (T > E.bottle + 0.6 && T < E.head + 0.05) { R.bottle.visible = true; const k = prog(T, E.bottle + 0.6, E.head); R.bottle.position.set(lerp(WIN[0], R.drone.position.x, k), lerp(WIN[1], R.drone.position.y, k) + S(k * PI) * 0.4, lerp(-2.3, -1.4, k)); R.bottle.rotation.z = k * 12; }
    face(R.you, T > E.head ? 'shock' : 'grin', T); }
  if (cl === 4 || cl === 0) { const lift = chairLift(Tt); R.chair.position.set(1.2, lift, 1.2); R.chair.rotation.set(0, 0, lift > 0 ? 0.08 * S(Tt * 20) : 0); R.you.position.set(1.2, 0, 1.25); sitOn(R.you, 0.48 + lift); R.you.rotation.z = R.chair.rotation.z; u.armL.rotation.x = -0.4; u.armR.rotation.x = -0.4;
    face(R.you, lift > 0.2 ? 'shock' : (cl === 4 && T < E.light ? 'grin' : 'shock'), Tt); if (lift > 0.2) { u.armL.rotation.set(-2.9, 0, 0.3); u.armR.rotation.set(-2.9, 0, -0.3); }
    if (cl === 4 && T > E.light - 0.3 && lift === 0) { R.spark.position.set(1.2, 0.3, 0.8); R.spark.material.opacity = Math.abs(S(T * 40)); R.spark.scale.setScalar(0.2 + 0.15 * Math.abs(S(T * 33))); }
    if (lift > 0 || (cl === 0)) R.fire.forEach((f, i) => { const ph = (Tt * 3 + i / 26) % 1; f.position.set(1.2 - 0.3 + (i % 8) * 0.085, lift + 0.1 - ph * 1.6, 0.85 + (i % 3) * 0.02); f.scale.setScalar(0.5 + ph * 0.8); f.material.opacity = 0.9 * (1 - ph); });
    if (lift > 0 || cl === 0) R.smoke.forEach((f, i) => { const ph = (Tt * 0.8 + i / 26) % 1; f.position.set(1.2 + S(i * 1.3) * ph * 2.5, Math.max(0.2, lift * (1 - ph) - ph), 0.9 + C(i * 1.7) * ph * 2); f.scale.setScalar(1 + ph * 3); f.material.opacity = 0.5 * (1 - ph); }); }
  if (cl === 1 || cl === 3) { R.mum.visible = false; }
  // space
  if (R.space.visible) { R.chairS.position.set(0, 0, 0); R.chairS.rotation.set(0.2 * S(T * 0.7), T * 0.15, 0.15 * S(T * 0.5)); R.youS.position.set(0, 0.04 - 0.92 + 0.48, 0.05); sitOn(R.youS, 0.48); R.youS.position.applyEuler(R.chairS.rotation); R.youS.rotation.copy(R.chairS.rotation);
    const us = R.youS.userData; us.armL.rotation.set(-1.2, 0, 0.3); us.armR.rotation.set(-1.3, 0, -0.2); R.scope.visible = cl >= 6; face(R.youS, cl === 7 ? 'neutral' : (cl === 5 ? 'shock' : 'grin'), T); if (cl === 6) { us.armR.rotation.set(-1.6, 0, 0); us.head.rotation.x = -0.1; } R.earth.rotation.y = T * 0.02; }
  if (R.bath.visible) { const b = R.broB; rest(b); b.rotation.y = 0.3; b.userData.armL.rotation.set(-2.6, 0, 0.2); b.userData.armR.rotation.set(-2.6 + 0.3 * S(T * 6), 0, -0.2); b.userData.armL.userData.e.rotation.x = -1.6; b.userData.armR.userData.e.rotation.x = -1.6; face(b, T > E.clothes ? 'grin' : 'neutral', T);
    R.drops.forEach((d, i) => { const ph = (T * 2 + i / 40) % 1; d.position.set(S(i * 2.3) * 0.25, 2.3 - ph * 2.2, -0.75 + C(i * 1.7) * 0.25); }); }
}
function shot(T) { const si = shotAt(T), sh = SH[si], t0 = sh[0], t1 = si + 1 < SH.length ? SH[si + 1][0] : TM.total; camera.fov = 52; camera.updateProjectionMatrix(); anim(T); sh[1](prog(T, t0, t1), T); sunAt(camera.position.x, 0, camera.position.z - 4); return { si, t0 }; }
