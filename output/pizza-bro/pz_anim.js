
const M3 = (x, y, z) => [MO[0] + x, MO[1] + y, MO[2] + z], Y3 = (x, y, z) => [YD[0] + x, YD[1] + y, YD[2] + z];
const SLICE = [0, 0.86, 0.3];
const SH = [
  [0, (k, T) => TR(k, [0.0, 1.35, 1.3], [0.0, 2.1, 5.4], [0, 0.9, 0.1], [0, 1.1, 0])],
  [E.c1, (k, T) => TR(k, [0.0, 2.0, 5.4], [-0.1, 1.95, 5.0], [-0.5, 1.3, -0.6], [-0.5, 1.3, -0.6])],
  [E.blink - 0.1, (k, T) => TR(k, [0.55, 1.75, 0.9], [0.65, 1.75, 0.75], [1.25, 1.72, 0.1], [1.25, 1.72, 0.1])],
  [E.c2, (k, T) => TR(k, [-0.4, 1.4, 1.6], [-0.3, 1.35, 1.4], [-0.4, 0.95, 0.1], [-0.3, 0.95, 0.1])],
  [E.c3, (k, T) => TR(k, [0.1, 1.75, 2.6], [0.2, 1.75, 2.3], [1.0, 1.35, 0.1], [1.1, 1.4, 0.1])],
  [E.c4, (k, T) => TR(k, [-0.2, 1.45, 1.8], [-0.1, 1.4, 1.5], [0, 1.05, 0.05], [0, 1.05, 0.05])],
  [E.c5, (k, T) => TR(k, [0.4, 1.25, 1.2], [0.3, 1.2, 1.0], [0.2, 1.1, 0.05], [0.15, 1.1, 0.05])],
  [E.c6, (k, T) => { const ry = R.rocket.position.y; look(Y3(2.6, 1.4 + Math.max(0, ry - 3) * 0.6, 5.2), Y3(0, 1.4 + Math.max(0, ry - 1), 0)); }],
  [E.c7, (k, T) => TR(k, M3(0.2, 1.5, 5.0), M3(0.3, 1.3, 4.4), M3(0.9, 0.6, 1.0), M3(0.9, 0.4, 1.0))],
  [E.broThere - 0.1, (k, T) => TR(k, M3(0.2, 1.3, 3.2), M3(0.4, 1.25, 2.7), M3(0.9, 0.9, 0.2), M3(0.9, 0.95, 0.2))],
  [E.c8, (k, T) => TR(k, M3(-1.2, 2.0, 5.5), M3(-1.0, 1.8, 5.0), M3(0.6, 0.8, -1), M3(0.6, 1.0, -1))],
  [E.loop, (k, T) => look([0.0, 1.3, 1.25], [0, 0.9, 0.05])],
];
const shotAt = T => { let i = 0; for (let j = 0; j < SH.length; j++) if (T >= SH[j][0]) i = j; return i; };
function handPos(p) { p.updateMatrixWorld(true); const v = new T3.Vector3(); p.userData.armR.userData.h.getWorldPosition(v); return v; }
function anim(T) { const loop = T >= E.loop, ci = loop ? 0 : CLI(T); const you = R.you, bro = R.bro, u = you.userData, b = bro.userData; rest(you); rest(bro); you.visible = bro.visible = true; R.drill.visible = R.fork.visible = R.helmet.visible = false;
  you.position.set(-1.25, 0, 0.15); you.rotation.y = PI / 2; bro.position.set(1.25, 0, 0.15); bro.rotation.y = -PI / 2; face(you, 'grin', T); face(bro, 'angry', T); b.head.rotation.x = 0.35;
  R.box.visible = ci <= 3 || loop; R.safe.visible = !loop && (ci === 4 || ci === 5); R.slice.visible = R.card.visible = false; R.slice.position.set(...SLICE); R.slice.rotation.set(0, 0, 0); R.card.position.set(...SLICE); R.card.rotation.set(0, 0, 0); R.card.scale.setScalar(1);
  if (ci <= 1 || loop) R.slice.visible = true;
  if (ci === 1) { u.armR.rotation.set(-1.6, 0.6, 0); u.head.rotation.y = 0.8; face(you, 'grin', T); if (T > E.blink - 0.1) face(bro, 'angry', T); }
  if (ci === 2) { const k = ease(prog(T, E.c2 + 0.3, E.c2 + 1.4)); R.card.visible = true; R.slice.visible = true; R.card.position.set(lerp(-0.9, 0, k), lerp(1.0, SLICE[1], k), lerp(0.2, SLICE[2], k)); R.slice.position.set(lerp(0, -0.9, k), lerp(SLICE[1], 1.0, k), lerp(SLICE[2], 0.25, k)); u.armR.rotation.set(-1.1, 0, 0); u.armL.rotation.set(-1.0, 0, 0); if (T > E.clever - 0.15) face(you, 'smug', T); }
  if (ci === 3) { R.card.visible = true; const g = ease(prog(T, E.c3, E.c3 + 0.5)); b.armR.rotation.set(-1.2 - 0.9 * g, 0, 0.3 * g); b.armR.userData.e.rotation.x = -1.2 * g; if (g > 0.6) { const h = handPos(bro); R.card.position.copy(h); R.card.rotation.set(-1.2, PI / 2, 0); const bite = prog(T, E.c3 + 0.6, E.c4); R.card.scale.setScalar(Math.max(0.15, 1 - bite)); b.mouth.scale.set(1.3, 1 + 2 * Math.abs(S(T * 14)), 1); } face(bro, 'grin', T); face(you, 'shock', T); }
  if (ci === 4) { face(you, T > E.much4 - 0.15 ? 'smug' : 'grin', T); u.armR.rotation.set(-1.0, 0, 0); u.armR.userData.e.rotation.x = -0.4; }
  if (ci === 5) { bro.position.set(0.75, 0, 0.55); bro.rotation.y = -PI / 2 - 0.5; R.drill.visible = true; b.armR.rotation.set(-1.45, 0, 0.1); b.armR.userData.e.rotation.x = -0.2; face(bro, 'grin', T); face(you, 'shock', T); R.bit.rotation.y = T * 60; }
  R.sparks.forEach((s, i) => { const on = ci === 5 && T > E.drill - 0.3; s.material.opacity = on ? 0.9 : 0; if (!on) return; const ph = (T * 3 + i / 12) % 1; s.position.set(0.25 + (i % 5) * 0.05 * ph, 1.12 + ph * 0.3 - ph * ph * 0.6, 0.38 + ph * 0.4 * C(i * 2)); s.scale.setScalar(0.08 + 0.06 * (1 - ph)); });
  // yard: launch
  const lt = AT(6, 'launch'); const ry = ci === 6 ? Math.max(0, (T - lt - 0.2)) ** 2 * 3.2 : ci < 6 || loop ? 0 : 60; R.rocket.position.y = ry; R.flame.material.opacity = ci === 6 && T > lt - 0.1 ? 0.9 + 0.1 * S(T * 40) : 0; R.flame.scale.setScalar(0.9 + 0.3 * S(T * 30));
  R.smoke.forEach((s, i) => { const on = ci === 6 && T > lt - 0.05; const ph = (T * 0.8 + i / 14) % 1; s.position.set(S(i * 2.3) * (0.4 + ph * 2.5), 0.3 + ph * 0.8, C(i * 2.3) * (0.4 + ph * 2.5)); s.scale.setScalar(0.6 + ph * 2.4); s.material.opacity = on ? 0.6 * (1 - ph) : 0; });
  if (ci === 6) { you.position.set(...Y3(-1.4, 0, 1.2)); you.rotation.y = 0.5; u.armR.rotation.set(-2.6, 0, -0.6); u.armR.userData.e.rotation.x = -1.6; face(you, T > E.much6 - 0.15 ? 'smug' : 'grin', T); bro.visible = false; }
  // the moon
  const mk = ci === 7 ? prog(T, E.c7, E.c7 + 0.7) : ci > 7 && !loop ? 1 : 0; R.mSlice.position.set(...M3(0.9, lerp(8, 0.02, ease(mk) ** 0.5), 1.1)); R.mSlice.rotation.set(0, 0.5, mk < 1 ? 1 - mk : 0);
  R.dust.forEach((s, i) => { const d = ci === 7 ? T - (E.c7 + 0.7) : -1; s.material.opacity = d > 0 && d < 1.4 ? 0.6 * (1 - d / 1.4) : 0; const a = i / 16 * PI * 2; s.position.set(...M3(0.9 + C(a) * (0.2 + Math.max(0, d) * 1.2), 0.15 + Math.max(0, d) * 0.4, 1.1 + S(a) * (0.2 + Math.max(0, d) * 1.2))); s.scale.setScalar(0.3 + Math.max(0, d) * 0.5); });
  if (ci >= 7 && !loop) { you.visible = false; seatPose(bro, 0.45); bro.position.x = MO[0] + 1.0; bro.position.z = MO[2] + 0.2; bro.rotation.y = -0.9; R.helmet.visible = true; face(bro, 'smug', T); b.head.rotation.x = 0.1;
    if (T > E.fork - 0.1 || ci === 8) { R.fork.visible = true; b.armR.rotation.set(-1.6 - 0.5 * Math.abs(S(T * 3)), 0, 0.2); b.armR.userData.e.rotation.x = -0.9; face(bro, 'grin', T); } }
  if (ci <= 5 || loop) { R.Y.visible = R.M.visible = false; R.G.visible = true; } else if (ci === 6) { R.Y.visible = true; R.G.visible = R.M.visible = false; } else { R.M.visible = true; R.G.visible = R.Y.visible = false; } R.sky.visible = !(ci >= 7 && !loop); }
function shot(T) { const si = shotAt(T), sh = SH[si], t0 = sh[0], t1 = si + 1 < SH.length ? SH[si + 1][0] : TM.total; camera.fov = 58; camera.updateProjectionMatrix(); anim(T); sh[1](prog(T, t0, t1), T);
  const c = camera.position; R.sun.target.position.set(c.x, 0, c.z - 3); R.sun.position.set(c.x + 4, 9, c.z + 4); R.sun.target.updateMatrixWorld(); return { si, t0 }; }
