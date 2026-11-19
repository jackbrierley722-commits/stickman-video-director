
// ---------- timing ----------
const E = { c1: CL[1].start, c2: CL[2].start, shut: AT(2, 'shut'), slows: AT(2, 'a'), c3: CL[3].start, knock: AT(3, 'knocking'), lift: AT(3, 'lift'), c4: CL[4].start, c5: CL[5].start, truck: AT(5, 'fire'), c6: CL[6].start, optB: AT(6, 'option', 1), comment: AT(6, 'comment') };
E.loop = TM.total - 0.4;
const EX = [300, 0, 0];
// shaking strength over time (0..1)
function quake(T) { return 0; }
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
  const ceil = add(G, Bx(8.4, 0.1, 7), SM('#e8e8e4'), 0, 2.95, 0.3); ceil.castShadow = false; for (const [x, z] of [[-2, -1.2], [2, -1.2], [-2, 1.2], [2, 1.2]]) add(G, Bx(1.2, 0.02, 0.6), BM('#5a5a52'), x, 2.89, z, false);
  add(G, Bx(0.1, 3, 7), SM('#d8d4c8'), -4.2, 1.5, 0.3); add(G, Bx(0.1, 3, 7), SM('#d8d4c8'), 4.2, 1.5, 0.3); add(G, Bx(8.4, 0.35, 0.12), SM('#c8c4b8'), 0, 0.17, -3.05); add(G, Bx(8.4, 0.25, 0.12), SM('#c8c4b8'), 0, 2.82, -3.05);
  // floor-to-ceiling windows
  R.panes = []; for (let i = 0; i < 4; i++) { const x = -3.15 + i * 2.1; add(G, Bx(0.12, 2.6, 0.14), SM('#3a3e46'), x - 1.05, 1.5, -3.05); const p = add(G, new T3.PlaneGeometry(2.0, 2.3), new T3.MeshStandardMaterial({ color: '#bfe6ff', transparent: true, opacity: 0.22, roughness: 0.05, metalness: 0.4, side: T3.DoubleSide }), x, 1.5, -3.05, false); R.panes.push(p); } add(G, Bx(0.12, 2.6, 0.14), SM('#3a3e46'), 3.15 + 1.05, 1.5, -3.05);
  // city outside
  const r = rng(9); for (let i = 0; i < 26; i++) { const w = 4 + r() * 6, h = 20 + r() * 60, x = -60 + r() * 120, z = -18 - r() * 70; const m = add(G, Bx(w, h, w), SM('#ffffff', { map: winTex(0.3 + r() * 0.3, i) }), x, h / 2 - 12, z, false); m.material.map.repeat.set(1, h / 30); m.material.map.wrapT = T3.RepeatWrapping; }
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
  R.exitDoor = new T3.Group(); R.exitDoor.position.set(-4.14, 0, 0.375); G.add(R.exitDoor); add(R.exitDoor, Bx(0.06, 2.15, 1.05), SM('#5a6a7a'), 0, 1.07, 0.525); add(G, Bx(0.04, 2.2, 1.1), BM('#0a0a0c'), -4.19, 1.08, 0.9, false); add(G, Bx(0.08, 0.06, 0.12), SM('#c8ccd2'), -4.1, 1.05, 0.5); add(G, new T3.PlaneGeometry(0.9, 0.34), BM('#ffffff', { map: signTex('EXIT  STAIRS', '#1a9a4a', '#fff', 30) }), -4.12, 2.42, 0.9, false).rotation.y = PI / 2;
  R.liftD = [0.2, 0.82].map(z => add(G, Bx(0.06, 2.15, 0.6), SM('#c8ccd2', { metalness: 0.7, roughness: 0.3 }), 4.14, 1.07, z)); add(G, Bx(0.02, 2.15, 1.2), BM('#050506'), 4.18, 1.07, 0.51, false); R.fingers = []; for (let i = 0; i < 4; i++) R.fingers.push(add(G, Bx(0.05, 0.035, 0.07), SM('#d8a888'), 4.12, 1.25 + i * 0.05, 0.51)); add(G, Bx(0.04, 2.25, 1.32), SM('#8a8e94'), 4.16, 1.1, 0.51);
  R.liftSign = add(G, new T3.PlaneGeometry(0.62, 0.24), BM('#ffffff', { map: signTex('LIFT  20', '#111', '#5aff8a', 34) }), 4.12, 2.4, 0.51, false); R.liftSign.rotation.y = -PI / 2; R.liftBtn = add(G, Sp(0.04, 10, 8), BM('#5aff8a'), 4.11, 1.1, 1.3);
  R.alarm = add(G, Bx(0.08, 0.2, 0.16), SM('#d8282a', { emissive: '#ff2020', emissiveIntensity: 0 }), -4.12, 1.8, 2.0); R.alarmL = new T3.PointLight('#ff2a2a', 0, 9, 1.4); R.alarmL.position.set(-3.6, 2.3, 1.5); G.add(R.alarmL);
  // glass shards, dust, smoke
  R.shards = []; for (let i = 0; i < 120; i++) { const s = add(G, new T3.PlaneGeometry(0.22 + r() * 0.3, 0.15 + r() * 0.25), new T3.MeshBasicMaterial({ color: '#e8faff', transparent: true, opacity: 0.95, side: T3.DoubleSide }), 0, -5, 0, false); s.userData = { x: -3.6 + r() * 7.2, y: 0.5 + r() * 2.1, vx: (r() - 0.5) * 2, vy: r() * 2, vz: 1.6 + r() * 2.6, rx: r() * 9, ry: r() * 9 }; R.shards.push(s); }
  R.smoke = []; for (let i = 0; i < 26; i++) R.smoke.push(spr(G, GLOW, '#5a5a60', 0.8, -3.9, 0.3, 0.9, 0, T3.NormalBlending));
  R.dust = []; for (let i = 0; i < 30; i++) R.dust.push(spr(G, GLOW, '#e8e0d0', 0.15, 0, -5, 0, 0, T3.NormalBlending));
  // street four floors down, and the fire truck pulling up
  add(G, Bx(160, 0.2, 80), SM('#5a5e62'), 0, -12.1, -40); add(G, Bx(160, 0.25, 3), SM('#8a8a86'), 0, -12.05, -6.5); for (let x = -60; x < 60; x += 6) add(G, Bx(2.5, 0.02, 0.2), BM('#e8e4c8'), x, -11.98, -13, false);
  R.ftruck = new T3.Group(); G.add(R.ftruck); const red = SM('#c81e1e'); add(R.ftruck, Bx(7.5, 2.4, 2.4), red, 0, 1.6, 0); add(R.ftruck, Bx(2.0, 1.4, 2.4), red, -4.6, 1.1, 0); add(R.ftruck, Bx(1.9, 0.8, 2.3), SM('#2a3040'), -4.7, 1.9, 0); add(R.ftruck, Bx(7.6, 0.25, 2.5), SM('#e8e8e8'), 0, 1.0, 0);
  for (const x of [-4.2, -1.5, 2.5]) for (const z of [-1.2, 1.2]) add(R.ftruck, Cy(0.5, 0.5, 0.4, 14), SM('#111'), x, 0.5, z).rotation.x = PI / 2;
  const lad = SM('#d8d8dc', { metalness: 0.6 }); add(R.ftruck, Bx(6.5, 0.1, 0.12), lad, 0.5, 3.0, -0.5); add(R.ftruck, Bx(6.5, 0.1, 0.12), lad, 0.5, 3.0, 0.5); for (let x = -2.5; x <= 3.5; x += 0.5) add(R.ftruck, Bx(0.06, 0.06, 1.0), lad, x, 3.0, 0);
  R.fLights = [spr(R.ftruck, GLOW, '#ff2020', 1.6, -4.6, 2.6, 0.8, 1), spr(R.ftruck, GLOW, '#3060ff', 1.6, -4.6, 2.6, -0.8, 1)]; R.ftruck.scale.setScalar(0.9);
  R.ftruck.rotation.y = 0; R.ftruck.position.set(30, -12, -10);
  R.you = human({ top: '#3a6ad8', bot: '#2a2e3a', hair: '#3a2416', skin: '#e4b08a' }); G.add(R.you); R.mask = add(R.you.userData.head, Sp(0.1, 14, 10), SM('#3a6ad8'), 0, -0.07, 0.07); R.mask.scale.set(1.25, 0.75, 0.9); R.emerg = new T3.PointLight('#fff0c8', 6, 9, 1.3); R.emerg.position.set(-3.6, 2.6, 0.9); G.add(R.emerg);
  // ---- outside: the tower ----
  const X = R.X = new T3.Group(); X.position.set(...EX); scene.add(X); add(X, Bx(300, 0.2, 300), SM('#7a8a7a'), 0, -0.1, 0);
  R.tower = new T3.Group(); X.add(R.tower); const tw = SM('#ffffff', { map: winTex(0.4, 77) }); tw.map.wrapT = T3.RepeatWrapping; tw.map.repeat.set(1, 3); add(R.tower, Bx(8, 44, 8), tw, 0, 22, 0); add(R.tower, Bx(8.4, 0.6, 8.4), SM('#3a3e46'), 0, 44.3, 0);
  R.band = add(R.tower, Bx(8.4, 1.9, 8.4), new T3.MeshBasicMaterial({ color: '#ff3a2a', transparent: true, opacity: 0.75 }), 0, 30.0, 0, false);
  for (let i = 0; i < 14; i++) { const w = 6 + r() * 8, h = 12 + r() * 30, a = r() * PI * 2, d = 18 + r() * 40; const m = add(X, Bx(w, h, w), SM('#ffffff', { map: winTex(0.3, 200 + i) }), S(a) * d, h / 2, -Math.abs(C(a) * d) - 8, false); m.material.map.wrapT = T3.RepeatWrapping; m.material.map.repeat.set(1, h / 15); }
}
// ---------- shots ----------
const SH = [
  [0, (k, T) => TR(k, [-1.6, 1.5, 2.9], [-1.8, 1.45, 2.7], [-3.8, 1.1, 0.9], [-3.8, 1.1, 0.9])],
  [E.c1, (k, T) => TR(k, [2.8, 1.8, 3.2], [2.6, 1.75, 3.0], [-1.6, 1.0, 0.3], [-1.8, 1.0, 0.5])],
  [E.c2, (k, T) => TR(k, [-1.4, 1.5, 2.8], [-1.6, 1.45, 2.6], [-4.0, 1.1, 0.8], [-4.0, 1.1, 0.8])],
  [E.c3, (k, T) => TR(k, [-0.6, 1.6, 2.9], [-0.3, 1.55, 2.7], [4.1, 1.2, 0.5], [4.1, 1.2, 0.5])],
  [E.c4, (k, T) => TR(k, [2.9, 1.45, 1.9], [3.1, 1.4, 1.7], [4.14, 1.3, 0.51], [4.14, 1.32, 0.51])],
  [E.c5, (k, T) => TR(k, [-1.4, 1.6, -0.6], [-1.0, 2.3, -2.7], [-0.4, 1.2, -3.0], [3.0, -12, -9.5])],
  [E.c6, (k, T) => TR(k, [-0.6, 1.6, 2.6], [-0.5, 1.55, 2.4], [4.1, 1.2, 0.5], [4.1, 1.2, 0.5])],
  [E.optB - 0.1, (k, T) => TR(k, [-1.0, 2.3, -2.7], [-0.9, 2.3, -2.75], [3.0, -12, -9.5], [3.0, -12, -9.5])],
  [E.comment - 0.1, (k, T) => TR(k, [0.2, 2.1, 3.4], [0.2, 2.0, 3.2], [0.8, 0.9, -0.5], [0.8, 0.9, -0.5])],
  [E.loop, (k, T) => look([-1.6, 1.5, 2.9], [-3.8, 1.1, 0.9])],
];
const shotAt = T => { let i = 0; for (let j = 0; j < SH.length; j++) if (T >= SH[j][0]) i = j; return i; };
function anim(T) { const loop = T >= E.loop, ci = loop ? 0 : CLI(T); const you = R.you, u = you.userData; rest(you); you.visible = true; face(you, 'neutral', T);
  R.shards.forEach(s => s.visible = false); R.dust.forEach(s => s.material.opacity = 0); R.panes.forEach(p => p.visible = true); R.tile.position.y = 2.87;
  // exit door: open when you come in, shut on "shut"
  const shutK = ci === 2 ? ease(prog(T, E.shut - 0.4, E.shut + 0.15)) : ci > 2 && !loop ? 1 : 0; R.exitDoor.rotation.y = -1.3 * (1 - shutK); const open = 1 - shutK;
  // smoke pouring through the open door
  R.smoke.forEach((s, i) => { const ph = (T * 0.3 + i / 26) % 1; s.position.set(-4.0 + ph * 2.0, 1.6 + ph * 1.1 + 0.2 * S(i), 0.6 + (i % 5) * 0.15 + ph * 0.6); s.scale.setScalar(0.6 + ph * 2.2); s.material.opacity = 0.75 * (1 - ph) * open; });
  // emergency strobe + alarm light
  const fl = Math.floor(T * 3) % 2 === 0; R.alarm.material.emissiveIntensity = fl ? 1.2 : 0.1; R.alarmL.intensity = fl ? 6 : 0;
  // lift: knocks shake the doors, then they part a crack with fingers in the gap
  const knock = !loop && ci >= 3 ? Math.max(0, 1 - ((T - E.knock) % 0.5) / 0.12) * (T > E.knock - 0.05 ? 1 : 0) : 0; const crack = !loop && ci >= 4 ? ease(prog(T, E.c4 + 0.3, E.c4 + 1.2)) : 0;
  R.liftD[0].position.set(4.14 - 0.012 * knock, 1.07, 0.2 - 0.07 * crack); R.liftD[1].position.set(4.14 - 0.012 * knock, 1.07, 0.82 + 0.07 * crack); R.fingers.forEach((f, i) => { f.visible = crack > 0.6; f.position.y = 1.25 + i * 0.05 + 0.01 * S(T * 6 + i); });
  R.liftSign.material.color.set('#5a5a5a'); R.liftBtn.material.color.set('#2a2a2a');
  // fire truck pulls up on the street below
  const tk = ci >= 5 && !loop ? ease(prog(T, E.c5 - 0.2, E.c6)) : 0; R.ftruck.position.set(lerp(36, 2, tk), -12, -10.5); R.fLights[0].material.opacity = fl ? 1 : 0.2; R.fLights[1].material.opacity = fl ? 0.2 : 1;
  // you
  you.position.set(-1.2, 0, 1.2); you.rotation.y = PI / 2; face(you, 'neutral', T);
  if (ci === 0 || loop) { you.position.set(lerp(-3.9, -3.3, loop ? 1 : ease(prog(T, 0, 1.4))), 0, 0.9); you.rotation.y = PI / 2; if (!loop && T < 1.4) walkPose(you, T * 9, 1); u.up.rotation.x = 0.35; u.armL.rotation.set(-1.1, 0, 0.3); u.armL.userData.e.rotation.x = -2.0; face(you, 'shock', T); }
  if (ci === 1) { const w = prog(T, E.c1, E.c2 - 0.4); you.position.set(lerp(-3.3, -2.6, w), 0, lerp(0.9, 1.2, w)); you.rotation.y = PI / 2 - 0.3; if (w < 1) walkPose(you, T * 8, 0.8); }
  if (ci === 2) { you.position.set(-3.0, 0, 1.1); you.rotation.y = -PI / 2; const push = ease(prog(T, E.shut - 0.5, E.shut)) * (1 - ease(prog(T, E.shut + 0.4, E.shut + 0.9))); u.armR.rotation.set(-1.5 * push, 0, 0); u.armL.rotation.set(-1.5 * push, 0, 0); }
  if (ci === 3) { you.position.set(-1.0, 0, 1.2); you.rotation.y = T > E.knock ? PI / 2 : -PI / 2 + 0.6; face(you, T > E.knock ? 'shock' : 'neutral', T); }
  if (ci === 4) { const w = prog(T, E.c4, E.c4 + 1.4); you.position.set(lerp(-0.6, 2.9, w), 0, lerp(1.2, 1.0, w)); you.rotation.y = PI / 2; if (w < 1) walkPose(you, T * 10, 1.1); face(you, 'shock', T); }
  if (ci === 5) { you.position.set(-0.4, 0, -2.4); you.rotation.y = PI; u.armR.rotation.set(-0.3, 0, 0.3); }
  if (ci === 6 && !loop) { you.position.set(1.2, 0, 0.4); const B = T > E.optB - 0.1 && T < E.comment - 0.1; you.rotation.y = B ? PI : PI / 2; if (T > E.comment - 0.1) { you.rotation.y = 0.2; } }
  R.mask.visible = true; u.mouth.visible = false; }
function shot(T) { const si = shotAt(T), sh = SH[si], t0 = sh[0], t1 = si + 1 < SH.length ? SH[si + 1][0] : TM.total; camera.fov = 66; camera.updateProjectionMatrix(); anim(T); sh[1](prog(T, t0, t1), T);
  R.sun.position.set(3, 9, -8); R.sun.target.position.set(0, 0, 0.5); R.sun.target.updateMatrixWorld(); return { si, t0 }; }
const FLOOR = T => 4;
