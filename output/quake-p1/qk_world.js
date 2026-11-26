
// ---------- timing ----------
const E = { twenty: AT(0, 'twenty'), c1: CL[1].start, every: AT(1, 'every'), c2: CL[2].start, hurt: AT(2, 'hurt'), c3: CL[3].start, drop: AT(3, 'drop'), get: AT(3, 'get'), hold: AT(3, 'hold'),
  c4: CL[4].start, burst: AT(4, 'burst'), glass: AT(4, 'glass'), but: AT(4, 'but'), c5: CL[5].start, stops: AT(5, 'stops'), c6: CL[6].start, smell: AT(6, 'you'), c7: CL[7].start, optB: AT(7, 'option', 1), comment: AT(7, 'comment') };
E.loop = TM.total - 0.4;
const EX = [300, 0, 0];
// shaking strength over time (0..1)
function quake(T) { if (T >= E.loop) return 0.35; if (T < E.stops) { const base = T < E.c4 ? 0.55 + 0.15 * S(T * 0.7) : 1.0; return base * (T > E.stops - 0.8 ? (E.stops - T) / 0.8 : 1); } return 0; }
const shk = (T, f, p) => S(T * f + p) * 0.6 + S(T * f * 2.3 + p * 1.7) * 0.4;
function winTex(lit = 0.45, seed = 3) { return ctex(256, 512, (c, w, h) => { c.fillStyle = '#6a8aa8'; c.fillRect(0, 0, w, h); const r = rng(seed); for (let y = 6; y < h; y += 24) for (let x = 6; x < w; x += 22) { c.fillStyle = r() < lit ? '#ffe2a0' : '#2a3a52'; c.fillRect(x, y, 15, 16); } }); }
function signTex(t, bg, fg = '#fff', sz = 40) { return ctex(256, 96, (c, w, h) => { c.fillStyle = bg; c.fillRect(0, 0, w, h); c.fillStyle = fg; c.font = `${sz}px Russo`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(t, w / 2, h / 2 + 2); }); }
function build() {
  R.sun = new T3.DirectionalLight('#fff0dc', 2.3); R.sun.position.set(3, 9, -8); R.sun.castShadow = true; R.sun.shadow.mapSize.set(2048, 2048); const sc = R.sun.shadow.camera; sc.left = sc.bottom = -8; sc.right = sc.top = 8; sc.near = 1; sc.far = 40; R.sun.shadow.bias = -0.0005; scene.add(R.sun); scene.add(R.sun.target);
  R.fill = new T3.DirectionalLight('#dce8ff', 1.0); R.fill.position.set(-2, 5, 8); scene.add(R.fill); R.hemi = new T3.HemisphereLight('#eaf0ff', '#7a6a5a', 1.1); scene.add(R.hemi);
  const sky = ctex(16, 512, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#5a9ae0'); g.addColorStop(0.5, '#bfe0f8'); g.addColorStop(1, '#e8d8c0'); c.fillStyle = g; c.fillRect(0, 0, w, h); });
  add(scene, Sp(900, 32, 16), new T3.MeshBasicMaterial({ map: sky, side: T3.BackSide, toneMapped: false, fog: false }), 0, 0, 0, false).castShadow = false;
  // ---- office (floor 20) ----
  const G = R.G = new T3.Group(); scene.add(G);
  add(G, Bx(8.4, 0.1, 7), SM('#7a8aa0'), 0, -0.05, 0.3); for (let i = 0; i < 8; i++) add(G, Bx(8.4, 0.004, 0.02), SM('#6a7a90'), 0, 0.002, -3 + i * 0.9, false);
  const ceil = add(G, Bx(8.4, 0.1, 7), SM('#e8e8e4'), 0, 2.95, 0.3); ceil.castShadow = false; for (const [x, z] of [[-2, -1.2], [2, -1.2], [-2, 1.2], [2, 1.2]]) add(G, Bx(1.2, 0.02, 0.6), BM('#fffbe8'), x, 2.89, z, false);
  add(G, Bx(0.1, 3, 7), SM('#d8d4c8'), -4.2, 1.5, 0.3); add(G, Bx(0.1, 3, 7), SM('#d8d4c8'), 4.2, 1.5, 0.3); add(G, Bx(8.4, 0.35, 0.12), SM('#c8c4b8'), 0, 0.17, -3.05); add(G, Bx(8.4, 0.25, 0.12), SM('#c8c4b8'), 0, 2.82, -3.05);
  // floor-to-ceiling windows
  R.panes = []; for (let i = 0; i < 4; i++) { const x = -3.15 + i * 2.1; add(G, Bx(0.12, 2.6, 0.14), SM('#3a3e46'), x - 1.05, 1.5, -3.05); const p = add(G, new T3.PlaneGeometry(2.0, 2.3), new T3.MeshStandardMaterial({ color: '#bfe6ff', transparent: true, opacity: 0.22, roughness: 0.05, metalness: 0.4, side: T3.DoubleSide }), x, 1.5, -3.05, false); R.panes.push(p); } add(G, Bx(0.12, 2.6, 0.14), SM('#3a3e46'), 3.15 + 1.05, 1.5, -3.05);
  // city outside
  const r = rng(9); for (let i = 0; i < 26; i++) { const w = 4 + r() * 6, h = 20 + r() * 60, x = -60 + r() * 120, z = -18 - r() * 70; const m = add(G, Bx(w, h, w), SM('#ffffff', { map: winTex(0.3 + r() * 0.3, i) }), x, h / 2 - 40, z, false); m.material.map.repeat.set(1, h / 30); m.material.map.wrapT = T3.RepeatWrapping; }
  // desk, monitor, chair, plant, shelf
  const wood = SM('#b8865a'); R.desk = new T3.Group(); R.desk.position.set(0.4, 0, -0.6); G.add(R.desk); add(R.desk, Bx(1.9, 0.07, 0.95), wood, 0, 0.88, 0); for (const [x, z] of [[-0.88, -0.4], [0.88, -0.4], [-0.88, 0.4], [0.88, 0.4]]) add(R.desk, Bx(0.07, 0.86, 0.07), SM('#3a3e46'), x, 0.43, z); 
  R.mon = new T3.Group(); R.mon.position.set(0.1, 0.92, -0.2); R.desk.add(R.mon); add(R.mon, Bx(0.75, 0.45, 0.04), SM('#1a1c20'), 0, 0.35, 0); add(R.mon, new T3.PlaneGeometry(0.7, 0.4), BM('#4a8ad8'), 0, 0.35, 0.021, false); add(R.mon, Bx(0.06, 0.15, 0.06), SM('#2a2c30'), 0, 0.07, 0); add(R.mon, Bx(0.3, 0.02, 0.2), SM('#2a2c30'), 0, 0.0, 0);
  R.mug = add(R.desk, Cy(0.05, 0.045, 0.11, 14), SM('#e8453a'), -0.55, 0.97, 0.15);
  R.chair = new T3.Group(); R.chair.position.set(0.5, 0, 0.35); G.add(R.chair); add(R.chair, Bx(0.55, 0.08, 0.5), SM('#2a2e3a'), 0, 0.5, 0); add(R.chair, Bx(0.55, 0.6, 0.08), SM('#2a2e3a'), 0, 0.85, 0.24); add(R.chair, Cy(0.03, 0.03, 0.45, 8), SM('#8a8e94'), 0, 0.25, 0); add(R.chair, Cy(0.28, 0.28, 0.04, 5), SM('#3a3e46'), 0, 0.04, 0);
  add(G, Cy(0.2, 0.16, 0.4, 16), SM('#c86a3a'), 3.4, 0.2, -2.5); for (let k = 0; k < 7; k++) { const l = add(G, Sp(0.2, 10, 8), SM(k % 2 ? '#3a8a3a' : '#4aa04a'), 3.4 + S(k * 2.2) * 0.15, 0.6 + k * 0.08, -2.5 + C(k * 2.2) * 0.12); l.scale.set(0.7, 1.4, 0.5); }
  R.shelf = new T3.Group(); R.shelf.position.set(-3.6, 0, -2.2); G.add(R.shelf); add(R.shelf, Bx(1.2, 1.9, 0.4), SM('#8a6a4a'), 0, 0.95, 0); R.books = []; for (let i = 0; i < 10; i++) { const b = add(R.shelf, Bx(0.09, 0.32, 0.26), SM(['#c83a2a', '#2a5ac8', '#e8b030', '#3a8a4a'][i % 4]), -0.48 + (i % 5) * 0.22, 0.6 + Math.floor(i / 5) * 0.62, 0.05); R.books.push({ m: b, p: b.position.clone() }); }
  // pendant lights
  R.pend = []; for (const x of [-1.6, 2.2]) { const p = new T3.Group(); p.position.set(x, 2.9, 0.6); G.add(p); add(p, Cy(0.008, 0.008, 0.9, 6), SM('#222'), 0, -0.45, 0); add(p, Cy(0.08, 0.3, 0.25, 20), SM('#f0b030'), 0, -0.95, 0); R.pend.push(p); }
  // falling ceiling panel
  R.tile = add(G, Bx(1.2, 0.06, 1.0), SM('#d8d8d0'), -1.6, 2.87, 1.4);
  // exit door (left wall) and lift (right wall)
  add(G, Bx(0.06, 2.15, 1.05), SM('#5a6a7a'), -4.14, 1.07, 0.9); add(G, Bx(0.08, 0.06, 0.12), SM('#c8ccd2'), -4.1, 1.05, 0.5); add(G, new T3.PlaneGeometry(0.9, 0.34), BM('#ffffff', { map: signTex('EXIT  STAIRS', '#1a9a4a', '#fff', 30) }), -4.12, 2.42, 0.9, false).rotation.y = PI / 2;
  for (const z of [0.2, 0.82]) add(G, Bx(0.06, 2.15, 0.6), SM('#c8ccd2', { metalness: 0.7, roughness: 0.3 }), 4.14, 1.07, z); add(G, Bx(0.04, 2.25, 1.32), SM('#8a8e94'), 4.16, 1.1, 0.51);
  R.liftSign = add(G, new T3.PlaneGeometry(0.62, 0.24), BM('#ffffff', { map: signTex('LIFT  20', '#111', '#5aff8a', 34) }), 4.12, 2.4, 0.51, false); R.liftSign.rotation.y = -PI / 2; R.liftBtn = add(G, Sp(0.04, 10, 8), BM('#5aff8a'), 4.11, 1.1, 1.3);
  R.alarm = add(G, Bx(0.08, 0.2, 0.16), SM('#d8282a', { emissive: '#ff2020', emissiveIntensity: 0 }), -4.12, 1.8, 2.0); R.alarmL = new T3.PointLight('#ff2a2a', 0, 9, 1.4); R.alarmL.position.set(-3.6, 2.3, 1.5); G.add(R.alarmL);
  // glass shards, dust, smoke
  R.shards = []; for (let i = 0; i < 120; i++) { const s = add(G, new T3.PlaneGeometry(0.22 + r() * 0.3, 0.15 + r() * 0.25), new T3.MeshBasicMaterial({ color: '#e8faff', transparent: true, opacity: 0.95, side: T3.DoubleSide }), 0, -5, 0, false); s.userData = { x: -3.6 + r() * 7.2, y: 0.5 + r() * 2.1, vx: (r() - 0.5) * 2, vy: r() * 2, vz: 1.6 + r() * 2.6, rx: r() * 9, ry: r() * 9 }; R.shards.push(s); }
  R.smoke = []; for (let i = 0; i < 26; i++) R.smoke.push(spr(G, GLOW, '#5a5a60', 0.8, -3.9, 0.3, 0.9, 0, T3.NormalBlending));
  R.dust = []; for (let i = 0; i < 30; i++) R.dust.push(spr(G, GLOW, '#e8e0d0', 0.15, 0, -5, 0, 0, T3.NormalBlending));
  R.you = human({ top: '#3a6ad8', bot: '#2a2e3a', hair: '#3a2416', skin: '#e4b08a' }); G.add(R.you);
  // ---- outside: the tower ----
  const X = R.X = new T3.Group(); X.position.set(...EX); scene.add(X); add(X, Bx(300, 0.2, 300), SM('#7a8a7a'), 0, -0.1, 0);
  R.tower = new T3.Group(); X.add(R.tower); const tw = SM('#ffffff', { map: winTex(0.4, 77) }); tw.map.wrapT = T3.RepeatWrapping; tw.map.repeat.set(1, 3); add(R.tower, Bx(8, 44, 8), tw, 0, 22, 0); add(R.tower, Bx(8.4, 0.6, 8.4), SM('#3a3e46'), 0, 44.3, 0);
  R.band = add(R.tower, Bx(8.4, 1.9, 8.4), new T3.MeshBasicMaterial({ color: '#ff3a2a', transparent: true, opacity: 0.75 }), 0, 30.0, 0, false);
  for (let i = 0; i < 14; i++) { const w = 6 + r() * 8, h = 12 + r() * 30, a = r() * PI * 2, d = 18 + r() * 40; const m = add(X, Bx(w, h, w), SM('#ffffff', { map: winTex(0.3, 200 + i) }), S(a) * d, h / 2, -Math.abs(C(a) * d) - 8, false); m.material.map.wrapT = T3.RepeatWrapping; m.material.map.repeat.set(1, h / 15); }
}
// ---------- shots ----------
const SH = [
  [0, (k, T) => TR(k, [0.6, 1.55, 3.6], [0.5, 1.5, 3.3], [-1.6, 1.2, 0.8], [-1.8, 1.2, 0.8])],
  [E.twenty - 0.1, (k, T) => TR(k, [EX[0] + 20, 10, EX[2] + 56], [EX[0] + 18, 14, EX[2] + 50], [EX[0], 30, EX[2]], [EX[0], 33, EX[2]])],
  [E.c1, (k, T) => TR(k, [0.9, 1.7, 3.4], [0.8, 1.6, 3.0], [0.2, 1.3, -1.5], [0.1, 1.35, -1.5])],
  [E.every - 0.1, (k, T) => TR(k, [1.8, 1.6, 2.6], [1.6, 1.55, 2.4], [-4, 1.4, 0.9], [-4, 1.4, 0.9])],
  [E.c2, (k, T) => TR(k, [0.4, 1.4, 3.6], [0.3, 1.3, 3.3], [-1.6, 0.9, 1.0], [-1.6, 0.9, 1.0])],
  [E.c3, (k, T) => TR(k, [1.9, 1.0, 2.2], [1.7, 0.85, 1.9], [0.2, 0.55, -0.6], [0.3, 0.5, -0.6])],
  [E.c4, (k, T) => TR(k, [2.4, 0.6, 1.2], [2.2, 0.55, 1.0], [-0.6, 1.25, -3], [-0.6, 1.1, -3])],
  [E.but - 0.1, (k, T) => TR(k, [1.6, 0.7, 1.8], [1.5, 0.65, 1.6], [0.3, 0.5, -0.6], [0.3, 0.5, -0.6])],
  [E.c5, (k, T) => TR(k, [1.4, 1.0, 2.6], [1.3, 1.0, 2.3], [0.3, 0.6, -0.6], [0.3, 0.7, -0.6])],
  [E.c6, (k, T) => TR(k, [1.0, 1.6, 3.2], [0.8, 1.6, 3.0], [-3.8, 1.2, 1.0], [-3.9, 1.0, 1.0])],
  [E.c7, (k, T) => TR(k, [-1.4, 1.6, 2.6], [-1.6, 1.6, 2.3], [-4.1, 1.2, 0.9], [-4.1, 1.2, 0.9])],
  [E.optB - 0.1, (k, T) => TR(k, [1.4, 1.6, 2.6], [1.6, 1.6, 2.3], [4.1, 1.4, 0.5], [4.1, 1.4, 0.5])],
  [E.comment - 0.1, (k, T) => TR(k, [0, 1.8, 3.6], [0, 1.75, 3.4], [0, 1.3, -1], [0, 1.3, -1])],
  [E.loop, (k, T) => look([0.6, 1.55, 3.6], [-1.6, 1.2, 0.8])],
];
const shotAt = T => { let i = 0; for (let j = 0; j < SH.length; j++) if (T >= SH[j][0]) i = j; return i; };
function anim(T) { const loop = T >= E.loop, ci = loop ? 0 : CLI(T), q = quake(T); const you = R.you, u = you.userData; rest(you); you.visible = true;
  R.tower.rotation.z = 0.012 * q * S(T * 3.2); R.tower.rotation.x = 0.008 * q * S(T * 2.7 + 1);
  R.pend.forEach((p, i) => { p.rotation.z = 0.35 * q * S(T * 3 + i); p.rotation.x = 0.25 * q * S(T * 2.4 + i * 2); });
  R.mon.rotation.z = 0.06 * q * shk(T, 9, 1); R.mug.position.x = -0.55 + 0.03 * q * shk(T, 11, 2); R.chair.position.x = (ci >= 3 && !loop ? -2.4 : 0.5) + 0.08 * q * shk(T, 3, 0.5); R.chair.position.z = ci >= 3 && !loop ? 1.0 : 0.35; R.chair.rotation.y = 0.3 * q * S(T * 1.3);
  R.books.forEach((b, i) => { const fall = ci >= 4 && !loop ? ease(prog(T, E.c4 + i * 0.12, E.c4 + 0.5 + i * 0.12)) : 0; b.m.position.set(b.p.x, lerp(b.p.y, 0.05 - R.shelf.position.y * 0, fall) - (fall ? 0 : 0), b.p.z + 0.5 * fall); b.m.rotation.set(1.4 * fall, 0, (i % 2 ? 1 : -1) * 0.3 * fall + (1 - fall) * 0.04 * q * S(T * 12 + i)); });
  if (ci >= 4 && !loop) { const mk = ease(prog(T, E.glass, E.glass + 0.4)); R.mon.rotation.x = -1.4 * mk; R.mon.position.z = -0.2 + 0.35 * mk; }
  else { R.mon.rotation.x = 0; R.mon.position.z = -0.2; }
  // ceiling tile drops where you were about to run
  const tk = ci === 2 ? prog(T, E.hurt - 0.35, E.hurt) : ci > 2 && !loop ? 1 : 0; R.tile.position.y = lerp(2.87, 0.06, tk * tk); R.tile.rotation.set(0.25 * tk, 0, -0.35 * tk);
  // windows burst
  const burst = ci >= 4 && !loop && T >= E.burst; R.panes.forEach(p => p.visible = !burst);
  R.shards.forEach(s => { const d = burst ? T - E.burst : -1; s.visible = d >= 0 && d < 2.2; if (!s.visible) return; const u_ = s.userData; s.position.set(u_.x + u_.vx * d, Math.max(0.02, u_.y + u_.vy * d - 4.9 * d * d), -3.0 + Math.min(u_.vz * d, 5.5)); s.rotation.set(u_.rx * d, u_.ry * d, 0); });
  // dust
  R.dust.forEach((s, i) => { const on = !loop && ci >= 4 && ci <= 6; s.material.opacity = on ? 0.35 : 0; const ph = (T * 0.15 + i / 30) % 1; s.position.set(-3 + (i * 0.73) % 6.5, 0.3 + ph * 2.4, -2 + (i * 1.37) % 4.5); s.scale.setScalar(0.08 + 0.12 * ((i * 7) % 3)); });
  // alarm strobe + smoke from the stairwell door
  const alarmOn = !loop && (ci === 6 && T > AT(6, 'alarm') - 0.1 || ci >= 7); const fl = alarmOn && Math.floor(T * 3) % 2 === 0; R.alarm.material.emissiveIntensity = fl ? 1.5 : 0.1; R.alarmL.intensity = fl ? 12 : 0;
  R.smoke.forEach((s, i) => { const on = !loop && (ci === 6 && T > E.smell - 0.4 || ci >= 7); const ph = (T * 0.25 + i / 26) % 1; s.position.set(-3.9 + ph * 2.2, 0.15 + ph * 2.6 + 0.2 * S(i), 0.5 + (i % 5) * 0.18 + ph * 0.8); s.scale.setScalar(0.8 + ph * 2.6); s.material.opacity = on ? 0.85 * (1 - ph) * Math.min(1, (T - (E.smell - 0.4)) * 1.5) : 0; });
  R.liftBtn.material.color.set(Math.floor(T * 2) % 2 && ci === 7 ? '#5aff8a' : '#2aa84a');
  // you
  face(you, q > 0.3 ? 'shock' : 'neutral', T); you.position.set(0.9, 0, 1.2); you.rotation.y = -0.9;
  if (ci === 0 && !loop) { you.position.set(lerp(0.2, -1.2, ease(prog(T, 0, 1.0))), 0, 1.2); you.rotation.y = -PI / 2; walkPose(you, T * 12, 1.2); u.armL.rotation.x -= 0.2; }
  if (loop) { you.position.set(0.2, 0, 1.2); you.rotation.y = -PI / 2; walkPose(you, 0.5, 1.2); }
  if (ci === 1) { you.position.set(-0.2, 0, 1.3); you.rotation.y = T > E.every - 0.1 ? -PI / 2 : 0.2; u.armL.rotation.set(-0.6, 0, -0.9); u.armR.rotation.set(-0.6, 0, 0.9); u.up.rotation.z = 0.12 * S(T * 3); if (T > E.every - 0.1) { u.up.rotation.x = 0.25; u.legL.rotation.x = 0.4; u.legR.rotation.x = -0.4; } }
  if (ci === 2) { const step = ease(prog(T, E.c2, E.hurt - 0.4)); you.position.set(lerp(-0.2, -0.6, step), 0, 1.3); you.rotation.y = -PI / 2; if (T < E.hurt - 0.4) walkPose(you, T * 10, 0.9); else { u.up.rotation.x = -0.35; u.armL.rotation.set(-2.2, 0, 0.4); u.armR.rotation.set(-2.2, 0, -0.4); face(you, 'shock', T); } }
  if (ci >= 3 && ci <= 5 || ci === 6 && T < E.c6 + 0.6) { const dk = ci === 3 ? ease(prog(T, E.drop - 0.1, E.get + 0.2)) : 1; you.position.set(lerp(0.6, 0.35, dk), lerp(0, -0.55, dk), lerp(1.0, -0.55, dk)); you.rotation.y = PI * 0.15;
    u.legL.rotation.x = -1.9 * dk; u.legR.rotation.x = -1.9 * dk; u.legL.userData.k.rotation.x = 2.3 * dk; u.legR.userData.k.rotation.x = 2.3 * dk; u.up.rotation.x = 0.95 * dk; u.head.rotation.x = -0.5 * dk;
    const hold = ci > 3 || T > E.hold - 0.15; u.armR.rotation.set(hold ? -1.9 : -0.5, 0, hold ? 0.1 : 0); u.armR.userData.e.rotation.x = hold ? -0.5 : 0; u.armL.rotation.set(-0.9, 0, -0.3); u.armL.userData.e.rotation.x = -1.6;
    if (ci >= 5) { u.head.rotation.x = -0.8; u.head.rotation.y = 0.4; face(you, 'neutral', T); } }
  if (ci === 6 && T >= E.c6 + 0.6 || ci === 7) { you.position.set(0.0, 0, 1.0); you.rotation.y = ci === 7 && T > E.optB - 0.1 && T < E.comment - 0.1 ? PI / 2 - 0.3 : -PI / 2 + 0.3; face(you, 'shock', T); if (ci === 7 && T > E.comment - 0.1) { you.rotation.y = 0; face(you, 'neutral', T); } }
}
function shot(T) { const si = shotAt(T), sh = SH[si], t0 = sh[0], t1 = si + 1 < SH.length ? SH[si + 1][0] : TM.total; camera.fov = 62; camera.updateProjectionMatrix(); anim(T); sh[1](prog(T, t0, t1), T);
  const q = quake(T), outside = camera.position.x > 200; const a = q * (outside ? 0.0 : 0.035); camera.position.x += a * shk(T, 23, 0); camera.position.y += a * shk(T, 19, 2); camera.rotation.z += q * (outside ? 0.004 : 0.012) * shk(T, 17, 4);
  if (outside) { R.sun.position.set(EX[0] + 30, 60, EX[2] + 40); R.sun.target.position.set(EX[0], 20, EX[2]); } else { R.sun.position.set(3, 9, -8); R.sun.target.position.set(0, 0, 0.5); } R.sun.target.updateMatrixWorld(); return { si, t0 }; }
