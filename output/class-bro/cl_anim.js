
const SZ = 0.95; // seat z for you and bro
const SH = [
  [0, (k, T) => TR(k, [2.2, 2.3, -4.6], [1.8, 2.1, -4.0], [0, 0.9, 1.0], [0, 0.95, 1.0])],
  [E.screams - 0.05, (k, T) => TR(k, [-0.4, 1.28, -0.45], [-0.35, 1.25, -0.3], [0.4, 1.15, SZ], [0.4, 1.15, SZ])],
  [E.c2, (k, T) => TR(k, [-5.2, 2.4, -1.6], [-5.0, 2.3, -1.2], [0, 0.9, 0.6], [0, 0.9, 0.6])],
  [E.c3, (k, T) => TR(k, [0.0, 1.2, -0.75], [0.0, 1.18, -0.55], [0, 1.05, SZ], [0, 1.05, SZ])],
  [E.c4, (k, T) => TR(k, [-0.12, 2.0, SZ - 0.9], [-0.12, 1.9, SZ - 0.8], [-0.12, 0.5, SZ - 0.2], [-0.12, 0.5, SZ - 0.2])],
  [E.c6 + 0.6, (k, T) => TR(k, [-0.35, 1.2, -0.45], [-0.38, 1.18, -0.3], [-0.4, 1.05, SZ], [-0.4, 1.05, SZ])],
  [E.c7, (k, T) => TR(k, [4.4, 2.3, -1.4], [4.2, 2.2, -1.0], [0.8, 0.9, 1.4], [2.2, 0.9, 2.2])],
  [E.c8, (k, T) => TR(k, [-0.9, 1.45, -0.7], [-0.8, 1.42, -0.5], [2.4, 1.1, 2.0], [2.8, 1.1, 2.2])],
  [E.loop, (k, T) => look([2.2, 2.3, -4.6], [0, 0.9, 1.0])],
];
const shotAt = T => { let i = 0; for (let j = 0; j < SH.length; j++) if (T >= SH[j][0]) i = j; return i; };
function anim(T) { const loop = T >= E.loop, ci = loop ? 0 : CLI(T); const under = !loop && (ci === 4 || ci === 5 || (ci === 6 && T < E.c6 + 0.6)); R.myDesk.visible = !under; R.myBooks.forEach(b_ => b_.visible = !under); const you = R.you, bro = R.bro, u = you.userData, b = bro.userData;
  seatP(you, 0.48); seatP(bro, 0.48); you.position.x = ME[0]; you.position.z = SZ; bro.position.x = BRO[0]; bro.position.z = SZ; you.rotation.y = bro.rotation.y = PI; faceP(you, 'n'); faceP(bro, 'n');
  for (const p of [you, bro]) { p.userData.armL.rotation.x = -0.9; p.userData.armR.rotation.x = -0.9; }
  // the scream
  if (ci === 1 || (ci === 0 && T > E.screams - 0.05 && !loop)) { faceP(bro, 'o'); bro.rotation.y = PI + 0.7; b.up.rotation.z = -0.25; b.armL.rotation.set(-1.2, 0, 1.3); b.armR.rotation.set(-1.2, 0, -1.3); b.armL.userData.e.rotation.x = -0.6; b.armR.userData.e.rotation.x = -0.6; faceP(you, 'S'); u.head.rotation.y = -0.5; }
  // the class turns around
  R.kids.forEach((p, i) => { const tu = (ci >= 2 && ci <= 3) || ci >= 7 ? 1 : 0; const front = p.position.z < SZ - 0.1; p.userData.head.rotation.y = 0; p.rotation.y = PI; if (tu && !loop) { if (front) { p.rotation.y = PI - (p.position.x < 0 ? 1 : -1) * 1.0; p.userData.head.rotation.y = (p.position.x < 0 ? 1 : -1) * 0.9; } else p.userData.head.rotation.y = (p.position.x < 0 ? -1 : 1) * 0.6; faceP(p, i % 3 ? 'd' : 'o'); } else faceP(p, 'n'); p.userData.head.rotation.x = 0.06 * S(T * 0.7 + i); });
  if (ci >= 2 && ci <= 6 && !loop) { faceP(bro, 'a'); bro.rotation.y = PI + 0.25; b.armL.rotation.set(-0.5, 0, 0.5); }
  if (ci === 2) { faceP(you, 'd'); }
  if (ci === 3) { u.head.rotation.y = -0.6; faceP(you, 'S'); if (T > E.heLooks - 0.1) { faceP(bro, 's'); b.head.rotation.y = 0.5; b.head.rotation.x = -0.15; } }
  if (under) { for (const p of [you, bro]) { p.userData.armL.rotation.set(0.1, 0, 0); p.userData.armR.rotation.set(0.1, 0, 0); p.userData.armL.userData.e.rotation.set(0, 0, 0); p.userData.armR.userData.e.rotation.set(0, 0, 0); } u.armL.rotation.z = 0.15; b.armL.rotation.z = -0.15; }
  // under the desk: the graze, then his hand on your thigh
  const graze = ci === 4 ? Math.max(0, 1 - Math.abs(T - E.graze - 0.1) / 0.35) : 0; u.legL.rotation.z = 0.12 * graze;
  if ((ci === 5 && T > E.hand - 0.2) || ci === 6) { const k = ci === 5 ? ease(prog(T, E.hand - 0.2, E.hand + 0.3)) : 1; const circ = ci === 6 ? 1 : 0; b.armR.rotation.set(-0.85 * k, 0, 0.7 * k); b.armR.userData.e.rotation.x = -0.2 * k; b.armR.userData.e.rotation.z = -0.2 * k;
    const hnd = b.armR.userData.e; hnd.rotation.y = circ ? 0.15 * S(T * 5) : 0; hnd.rotation.x += circ ? 0.08 * C(T * 5) : 0; faceP(bro, 'a'); }
  if (ci === 6 && T > E.c6 + 0.6) { faceP(you, 'd'); u.head.rotation.y = 0; }
  // teacher: writes at the board, turns, points you out
  const t_ = R.teacher; stillP(t_); t_.position.set(-1.8, 0, -5.3); t_.rotation.y = ci >= 2 && !loop ? 0.1 : PI; faceP(t_, ci >= 2 && !loop ? 'a' : 'n'); if (ci < 2 || loop) { t_.userData.armR.rotation.set(-2.2 + 0.1 * S(T * 6), 0, 0); }
  if (ci >= 7 && !loop) { t_.rotation.y = 0.5; t_.userData.armR.rotation.set(-1.6, 0, -1.1); faceP(t_, 'a');
    const w = prog(T, E.out, E.c8 + 1.6); stillP(you); you.position.set(lerp(-0.4, 5.6, w), 0, lerp(SZ + 0.4, 3.0, w)); you.rotation.y = Math.PI / 2 + 0.25; walkP(you, T * 6, w > 0 && w < 1 ? 1 : 0); faceP(you, 'd'); u.head.rotation.y = 0.4;
    faceP(bro, 's'); b.armL.rotation.set(-2.7 + 0.25 * S(T * 9), 0, 0.2); b.armR.rotation.set(-0.9, 0, 0); bro.rotation.y = PI - 0.35; }
}
function shot(T) { const si = shotAt(T), sh = SH[si], t0 = sh[0], t1 = si + 1 < SH.length ? SH[si + 1][0] : TM.total; camera.fov = 60; camera.updateProjectionMatrix(); anim(T); sh[1](prog(T, t0, t1), T);
  const ci = T >= E.loop ? 0 : CLI(T); if (ci === 1) { const k = 1 - prog(T, E.c1, E.c2); camera.position.x += 0.03 * k * S(T * 70); camera.rotation.z += 0.02 * k * S(T * 60); } return { si, t0 }; }
