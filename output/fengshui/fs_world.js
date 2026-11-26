
// ---------- timing ----------
const E = { here: AT(0, "here's"), c1: CL[1].start, coffin: AT(1, 'coffin'), carried: AT(1, 'because'), c2: CL[2].start, fix: AT(2, 'fix'), command: AT(2, 'command'), diag: AT(2, 'bed'), see: AT(2, 'see'), without: AT(2, 'without'),
  c3: CL[3].start, mirror: AT(3, 'mirror'), bounces: AT(3, 'bounces'), c4: CL[4].start, junk: AT(4, 'junk'), plant: AT(4, 'plant'), c5: CL[5].start, moved: AT(5, 'moved'), perfect: AT(5, 'perfect'),
  c6: CL[6].start, cat: AT(6, 'cat'), feet: AT(6, 'feet'), c7: CL[7].start };
E.loop = TM.total - 0.4;
const DOOR = [3.45, 1.8];                       // door in the right wall (x, z)
const COFFIN = { x: -1.95, z: 1.8, ry: PI / 2 }, CMD = { x: -1.55, z: -2.15, ry: 0 };
function build() {
  R.hemi = new T3.HemisphereLight('#fff4e4', '#8a7a6a', 1.3); scene.add(R.hemi); R.sun = new T3.DirectionalLight('#fff0dc', 1.9); R.sun.position.set(4, 10, 7); R.sun.castShadow = true; R.sun.shadow.mapSize.set(2048, 2048); const sc = R.sun.shadow.camera; sc.left = sc.bottom = -7; sc.right = sc.top = 7; scene.add(R.sun); scene.add(R.sun.target);
  scene.background = new T3.Color('#e8dccc');
  const G = R.G = new T3.Group(); scene.add(G); const floor = SM('#c89a6a'), wall = SM('#e8ddc8'), wall2 = SM('#ddd0b8'), trim = SM('#f4f0e8');
  add(G, Bx(7, 0.2, 7), floor, 0, -0.1, 0); for (let i = 0; i < 9; i++) add(G, Bx(7, 0.005, 0.03), SM('#a87a4a'), 0, 0.002, -3.3 + i * 0.8, false);
  add(G, Bx(7, 3.2, 0.15), wall, 0, 1.6, -3.5); add(G, Bx(0.15, 3.2, 7), wall2, -3.5, 1.6, 0); add(G, Bx(0.15, 3.2, 3.9), wall2, 3.5, 1.6, -1.55); add(G, Bx(0.15, 3.2, 1.6), wall2, 3.5, 1.6, 2.7); add(G, Bx(0.15, 1.0, 1.5), wall2, 3.5, 2.7, DOOR[1]);
  add(G, Bx(1.6, 1.2, 0.06), SM('#bfe0f4'), -0.6, 1.9, -3.42); add(G, Bx(1.7, 0.08, 0.1), trim, -0.6, 1.28, -3.4);  // window
  R.door = new T3.Group(); R.door.position.set(3.45, 0, DOOR[1] - 0.7); G.add(R.door); add(R.door, Bx(0.06, 2.15, 1.4), SM('#8a5a32'), 0, 1.07, 0.7); add(R.door, Sp(0.05, 10, 8), SM('#d8b84a'), -0.06, 1.0, 1.25);
  add(G, Bx(2.4, 0.03, 1.8), SM('#7a9ac8'), 0.6, 0.015, 0.4);  // rug
  // the bed (head at local -z)
  const B = R.bed = new T3.Group(); G.add(B); add(B, Bx(1.6, 0.35, 2.2), SM('#6a4a32'), 0, 0.2, 0); add(B, Bx(1.5, 0.22, 2.1), SM('#f4f0ea'), 0, 0.48, 0); add(B, Bx(1.6, 0.9, 0.12), SM('#6a4a32'), 0, 0.55, -1.08); add(B, Bx(0.9, 0.12, 0.4), SM('#ffffff'), 0, 0.64, -0.8); R.duvet = add(B, Bx(1.52, 0.1, 1.3), SM('#e88a6a'), 0, 0.62, 0.35);
  R.junk = []; [['#b88a5a', -0.4], ['#5a8ac8', 0.15], ['#c84a4a', 0.55]].forEach(([c, z], i) => { const j = add(B, Bx(0.5, 0.28, 0.45), SM(c), (i - 1) * 0.5, 0.14, z + 0.2); j.userData.p = j.position.clone(); R.junk.push(j); });
  // free-standing mirror
  const M = R.mirror = new T3.Group(); G.add(M); add(M, Bx(0.85, 1.75, 0.08), SM('#c8a060'), 0, 1.05, 0); add(M, Bx(0.72, 1.6, 0.03), SM('#cfe8f8', { roughness: 0.05, metalness: 0.6 }), 0, 1.05, 0.05); for (const sx of [-1, 1]) add(M, Bx(0.08, 0.5, 0.5), SM('#c8a060'), sx * 0.35, 0.18, 0);
  // plant
  const P = R.plant = new T3.Group(); G.add(P); add(P, Cy(0.28, 0.22, 0.5, 14), SM('#e8e4dc'), 0, 0.25, 0); for (let k = 0; k < 9; k++) { const l = add(P, Sp(0.2, 10, 8), SM(k % 2 ? '#3a8a3a' : '#4aa04a'), S(k * 2.3) * 0.18, 0.7 + (k % 4) * 0.16, C(k * 2.3) * 0.18); l.scale.set(0.6, 1.5, 0.5); }
  add(G, Bx(0.9, 0.7, 0.6), SM('#8a6a4a'), 2.5, 0.35, -3.05);  // dresser
  // you
  R.you = human({ top: '#3a8a6a', bot: '#2a2e3a', hair: '#3a2416', skin: '#e4b08a' }); G.add(R.you);
  // the cat (original): ginger, white socks
  const cat = R.cat = new T3.Group(); G.add(cat); const fur = SM('#e8963a'), wh = SM('#fff4e8'); const body = add(cat, Sp(0.26, 14, 10), fur, 0, 0.2, 0); body.scale.set(1, 0.7, 1.7);
  const hd = R.catHead = new T3.Group(); hd.position.set(0, 0.32, -0.45); cat.add(hd); add(hd, Sp(0.17, 14, 10), fur, 0, 0, 0); for (const sx of [-1, 1]) { const e = add(hd, new T3.ConeGeometry(0.07, 0.14, 4), fur, sx * 0.1, 0.15, 0); e.rotation.z = -sx * 0.25; add(hd, Sp(0.025, 8, 6), SM('#2a2420'), sx * 0.06, 0.03, -0.15, false); }
  R.catLegs = []; for (const [x, z] of [[-0.12, -0.3], [0.12, -0.3], [-0.12, 0.3], [0.12, 0.3]]) { const l = new T3.Group(); l.position.set(x, 0.12, z); cat.add(l); add(l, Cap(0.045, 0.16, 8), fur, 0, -0.08, 0); add(l, Sp(0.05, 8, 6), wh, 0, -0.16, 0); R.catLegs.push(l); }
  const tail = R.catTail = new T3.Group(); tail.position.set(0, 0.25, 0.42); cat.add(tail); add(tail, Cap(0.04, 0.45, 8), fur, 0, 0.18, 0.1).rotation.x = 0.6;
  // chi sparkles
  R.chi = []; for (let i = 0; i < 40; i++) R.chi.push(spr(G, GLOW, i % 2 ? '#ffe08a' : '#9af0c8', 0.22, 0, -5, 0, 0));
}
// ---------- shots ----------
const OV = [[4.6, 7.2, 8.6], [0.2, 0.3, 0.2]];
const SH = [
  [0, (k, T) => TR(k, [-0.4, 2.4, 3.6], [1.2, 4.2, 6.0], [-1.6, 0.6, 1.8], [-0.8, 0.5, 1.4])],
  [E.c1, (k, T) => TR(k, OV[0], [4.4, 7.0, 8.3], OV[1], OV[1])],
  [E.c2, (k, T) => TR(k, [4.2, 7.4, 7.8], [3.8, 7.8, 7.2], [-0.2, 0.2, 0], [-0.4, 0.2, -0.4])],
  [E.c3, (k, T) => TR(k, [2.4, 3.4, 4.6], [2.0, 3.2, 4.2], [-1.4, 0.8, -0.8], [-1.4, 0.8, -1.0])],
  [E.c4, (k, T) => TR(k, [0.6, 0.6, 1.6], [0.4, 0.7, 1.3], [-1.55, 0.3, -2.0], [-1.55, 0.3, -2.0])],
  [E.plant - 0.15, (k, T) => TR(k, [1.0, 2.0, 0.8], [1.2, 2.0, 0.6], [2.8, 0.7, -2.6], [2.8, 0.7, -2.6])],
  [E.c5, (k, T) => TR(k, [4.0, 6.0, 7.6], [4.6, 7.0, 8.6], OV[1], OV[1])],
  [E.c6, (k, T) => TR(k, [0.6, 1.8, 4.2], [0.9, 1.4, 3.6], [2.4, 0.3, 1.8], [2.4, 0.25, 1.8])],
  [E.feet - 0.1, (k, T) => TR(k, [4.0, 6.0, 7.0], [4.4, 6.6, 7.8], [1.6, 0.2, 1.4], [1.0, 0.2, 1.0])],
  [E.c7, (k, T) => TR(k, [4.4, 6.6, 7.8], [4.8, 7.6, 9.0], OV[1], OV[1])],
  [E.loop, (k, T) => look([-0.4, 2.4, 3.6], [-1.6, 0.6, 1.8])],
];
const shotAt = T => { let i = 0; for (let j = 0; j < SH.length; j++) if (T >= SH[j][0]) i = j; return i; };
function bedPose(T) { const loop = T >= E.loop, ci = loop ? 0 : CLI(T); if (ci < 2 || loop) return COFFIN; if (ci > 2) return CMD; const k = ease(prog(T, E.fix - 0.1, E.command + 0.6)); return { x: lerp(COFFIN.x, CMD.x, k), z: lerp(COFFIN.z, CMD.z, k), ry: lerp(COFFIN.ry, CMD.ry, k) }; }
function anim(T) { const loop = T >= E.loop, ci = loop ? 0 : CLI(T); const you = R.you, u = you.userData; rest(you); face(you, 'neutral', T);
  const bp = bedPose(T); R.bed.position.set(bp.x, 0, bp.z); R.bed.rotation.y = bp.ry;
  // asleep in the coffin position for the hook
  R.duvet.visible = true;
  if (ci <= 1 || loop) { const m = new T3.Matrix4().makeBasis(new T3.Vector3(0, 0, -1), new T3.Vector3(-1, 0, 0), new T3.Vector3(0, 1, 0)); you.quaternion.setFromRotationMatrix(m); you.position.set(bp.x + 0.95, 0.6, bp.z); u.armL.rotation.set(0, 0, -0.15); u.armR.rotation.set(0, 0, 0.15); face(you, 'neutral', T); R.duvet.visible = false; }
  else if (ci === 5) { you.position.set(0.6, 0, 0.6); you.rotation.set(0, 0.3, 0); u.armL.rotation.set(0, 0, -0.5); u.armR.rotation.set(0, 0, 0.5); u.armL.userData.e.rotation.x = -1.4; u.armR.userData.e.rotation.x = -1.4; face(you, 'smug', T); }
  else if (ci >= 6) { you.position.set(-0.3, 0, -0.2); you.rotation.set(0, 0.8, 0); face(you, T > E.feet ? 'shock' : 'neutral', T); }
  else { you.position.set(0.9, 0, -0.4); you.rotation.set(0, -0.7, 0); }
  // mirror: facing the bed, then turned away against the wall
  const mt = ci > 3 && !loop ? 1 : ci === 3 ? ease(prog(T, E.bounces + 0.9, E.c4 - 0.1)) : 0; R.mirror.position.set(lerp(-1.55, 1.6, mt), 0, lerp(0.15, -3.15, mt)); R.mirror.rotation.y = lerp(PI, 0, mt);
  R.mirror.visible = ci >= 3 && !loop || ci === 2 && T > E.without;
  // junk under the bed pops out, plant grows in
  R.junk.forEach((j, i) => { const k = ci === 4 ? ease(prog(T, E.junk + i * 0.12, E.junk + 0.35 + i * 0.12)) : ci > 4 && !loop ? 1 : 0; j.position.set(j.userData.p.x + 3 * k, j.userData.p.y + 1.5 * S(PI * k), j.userData.p.z); j.visible = k < 0.95; });
  const pk = ci === 4 ? ease(prog(T, E.plant - 0.1, E.plant + 0.4)) : ci > 4 && !loop ? 1 : 0; R.plant.position.set(2.8, 0, -2.6); R.plant.scale.setScalar(Math.max(0.001, pk)); R.plant.visible = pk > 0.01;
  // the cat: wanders in, flops down with its feet to the door
  const cat = R.cat; cat.visible = ci >= 6 && !loop; R.catLegs.forEach((l, i) => l.rotation.x = 0); R.catTail.rotation.z = 0.3 * S(T * 3);
  if (cat.visible) { const w = prog(T, E.c6, E.cat + 0.5); if (T < E.cat + 0.5) { cat.position.set(lerp(-1.2, 1.6, w), 0, lerp(0.4, 1.8, w)); cat.rotation.set(0, -PI / 2 - 0.4 * (1 - w), 0); R.catLegs.forEach((l, i) => l.rotation.x = 0.6 * S(T * 12 + i * PI)); }
    else { const lie = ease(prog(T, E.cat + 0.5, E.feet)); cat.position.set(1.6, 0.0, 1.8); cat.rotation.set(0, -PI / 2, -1.45 * lie); cat.position.y = 0.12 * lie; R.catLegs.forEach((l, i) => l.rotation.x = (i < 2 ? -1 : 1) * 0.9 * lie); } }
  // chi sparkles drift in from the door when the room is balanced
  const on = ci === 5 && !loop; R.chi.forEach((s, i) => { const ph = (T * 0.25 + i / 40) % 1; const a = ph * PI * 3 + i; const r = 2.6 * (1 - ph * 0.5); s.position.set(lerp(DOOR[0], 0, ph) + Math.cos(a) * r * ph, 0.4 + ph * 1.6 + 0.3 * S(i), lerp(DOOR[1], 0, ph) + Math.sin(a) * r * ph); s.material.opacity = on ? 0.9 * S(PI * ph) : 0; });
  R.door.rotation.y = ci >= 6 && !loop ? -0.5 : 0;
}
function shot(T) { const si = shotAt(T), sh = SH[si], t0 = sh[0], t1 = si + 1 < SH.length ? SH[si + 1][0] : TM.total; camera.fov = 58; camera.updateProjectionMatrix(); anim(T); sh[1](prog(T, t0, t1), T); return { si, t0 }; }
// diagram helpers (2D overlay)
function scr(x, y, z) { const v = new T3.Vector3(x, y, z).project(camera); return [(v.x + 1) / 2 * W, (1 - v.y) / 2 * H, v.z]; }
function bedPoint(local) { const b = R.bed; b.updateMatrixWorld(true); const v = b.localToWorld(new T3.Vector3(...local)); return [v.x, v.y, v.z]; }
