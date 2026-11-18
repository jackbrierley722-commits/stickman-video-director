
const SZ = 0.95; // seat z for you and bro
const head = p => { const v = new T3.Vector3(); p.userData.head.getWorldPosition(v); return [v.x, v.y + 0.12, v.z]; };
// camera plan per clip (fixed framings, gentle push-ins)
function camAt(T) { const ci = CLI(T), k = prog(T, CL[ci].start, CL[ci].start + CL[ci].dur);
  if (ci === 0) return T < E.screams - 0.05 ? [L3([2.2, 2.3, -4.6], [1.8, 2.1, -4.0], ease(k)), [0, 0.9, 1.0]] : [[-0.4, 1.28, -0.45], [0.4, 1.15, SZ]];
  if (ci === 1) return [[-0.35, 1.25, -0.3], [0.4, 1.15, SZ]];
  if (ci === 2) return [L3([-5.2, 2.4, -1.6], [-5.0, 2.3, -1.2], ease(k)), [0, 0.9, 0.6]];
  if (ci === 3 || ci === 7) { const h = head(R.you); return [[h[0] + 0.45, h[1] + 0.02, h[2] - 1.35 + 0.08 * k], [h[0], h[1] - 0.08, h[2]]]; }
  if (ci === 4 || ci === 8) { const h = head(R.bro); return [[h[0] - 0.45, h[1] + 0.02, h[2] - 1.35 + 0.08 * k], [h[0], h[1] - 0.08, h[2]]]; }
  if (ci === 5) return [[0.0, 1.2, -0.75 + 0.15 * k], [0, 1.05, SZ]];
  if (ci === 6 || ci === 9) return [[-0.12, 2.0 - 0.1 * k, SZ - 0.9], [-0.12, 0.5, SZ - 0.2]];
  if (ci === 10) { const h = head(R.teacher); return [[h[0] + 0.45, h[1] - 0.05, h[2] + 1.1 - 0.1 * k], h]; }
  if (ci === 11) return T < E.waves - 0.1 ? [L3([4.4, 2.3, -1.4], [4.2, 2.2, -1.0], ease(k)), [2.2, 0.9, 2.2]] : [[-0.9, 1.45, -0.6], [0.6, 1.2, SZ]];
  if (ci >= 13) return [[9.3, 1.3, 1.33], [6.75, 0.95, 1.33]];
  return [[9.3, 1.3, 1.33], [6.75, 0.95, 1.33]]; }
function anim(T) { const ci = CLI(T); const under = ci === 6 || ci === 9; R.myDesk.visible = !under; R.myBooks.forEach(b_ => b_.visible = !under); const you = R.you, bro = R.bro, u = you.userData, b = bro.userData;
  seatP(you, 0.48); seatP(bro, 0.48); you.position.x = -0.4; you.position.z = SZ; bro.position.x = 0.4; bro.position.z = SZ; you.rotation.y = bro.rotation.y = PI; faceP(you, 'n'); faceP(bro, 'n'); you.visible = bro.visible = true;
  for (const p of [you, bro]) { p.userData.armL.rotation.x = -0.9; p.userData.armR.rotation.x = -0.9; }
  // the scream
  if (ci === 1 || (ci === 0 && T > E.screams - 0.05)) { faceP(bro, 'o'); bro.rotation.y = PI + 0.7; b.up.rotation.z = -0.25; b.armL.rotation.set(-1.2, 0, 1.3); b.armR.rotation.set(-1.2, 0, -1.3); b.armL.userData.e.rotation.x = -0.6; b.armR.userData.e.rotation.x = -0.6; faceP(you, 'S'); u.head.rotation.y = -0.5; }
  // the class turns round and stays turned for the argument
  R.kids.forEach((p, i) => { const tu = ci >= 2 && ci <= 11; const front = p.position.z < SZ - 0.1; p.userData.head.rotation.y = 0; p.rotation.y = PI; if (tu) { if (front) { p.rotation.y = PI - (p.position.x < 0 ? 1 : -1) * 1.0; p.userData.head.rotation.y = (p.position.x < 0 ? 1 : -1) * 0.9; } else p.userData.head.rotation.y = (p.position.x < 0 ? -1 : 1) * 0.6; faceP(p, i % 3 ? 'd' : 'o'); } else faceP(p, 'n'); p.userData.head.rotation.x = 0.06 * S(T * 0.7 + i); });
  if (ci >= 2 && ci <= 9) { faceP(bro, 'a'); bro.rotation.y = PI + 0.35; you.rotation.y = PI - 0.35; }
  if (ci === 3) { faceP(you, 'd'); u.head.rotation.y = -0.15; u.armL.rotation.set(-1.3, 0, 0.6); u.armL.userData.e.rotation.x = -0.5; }
  if (ci === 4) { faceP(bro, 'a'); if (T > E.soul - 0.1) { b.armR.rotation.set(-1.2, 0, 0.9); b.armR.userData.e.rotation.x = -1.6; b.head.rotation.x = -0.25; faceP(bro, 'o'); } }
  if (ci === 5) { faceP(bro, 's'); b.head.rotation.y = 0.5; b.head.rotation.x = -0.15; faceP(you, 'S'); u.head.rotation.y = -0.5; }
  // his hand on your thigh (desk top hidden for the lap shots)
  if (under) { for (const p of [you, bro]) { p.userData.armL.rotation.set(0.1, 0, 0); p.userData.armR.rotation.set(0.1, 0, 0); p.userData.armL.userData.e.rotation.set(0, 0, 0); p.userData.armR.userData.e.rotation.set(0, 0, 0); } u.armL.rotation.z = 0.15; b.armL.rotation.z = -0.15; you.rotation.y = bro.rotation.y = PI; }
  const handOn = (ci === 6 && T > E.hand - 0.2) || (ci >= 7 && ci <= 9); if (handOn) { const k = ci === 6 ? ease(prog(T, E.hand - 0.2, E.hand + 0.3)) : 1; const circ = (ci === 6 && T > E.circles - 0.1) || ci >= 7; if (under) { b.armR.rotation.set(-0.85 * k, 0, 0.7 * k); b.armR.userData.e.rotation.x = -0.2 * k; b.armR.userData.e.rotation.z = -0.2 * k; const hnd = b.armR.userData.e; hnd.rotation.y = circ ? 0.15 * S(T * 5) : 0; hnd.rotation.x += circ ? 0.08 * C(T * 5) : 0; } }
  if (ci === 7) { faceP(you, 'd'); u.head.rotation.x = 0.3; u.head.rotation.y = -0.1; }
  if (ci === 8) { faceP(bro, 's'); b.head.rotation.z = 0.15; b.head.rotation.y = 0.1; }
  // teacher
  const t_ = R.teacher; stillP(t_); t_.position.set(-1.8, 0, -5.3); t_.rotation.y = ci >= 2 ? 0.1 : PI; faceP(t_, ci >= 2 ? 'a' : 'n'); if (ci < 2) t_.userData.armR.rotation.set(-2.2 + 0.1 * S(T * 6), 0, 0);
  if (ci === 10) { t_.rotation.y = 0.15; t_.userData.armR.rotation.set(-1.6, 0, 0); if (T > AT(10, 'out') - 0.1) t_.userData.armR.rotation.set(-1.6, 0, -1.2); }
  if (ci === 11) { t_.rotation.y = 0.5; t_.userData.armR.rotation.set(-1.6, 0, -1.1); const w = prog(T, E.out, E.c12); stillP(you); you.position.set(lerp(-0.4, 5.6, w), 0, lerp(SZ + 0.4, 3.0, w)); you.rotation.y = PI / 2 + 0.25; walkP(you, T * 6, w > 0 && w < 1 ? 1 : 0); faceP(you, 'd');
    faceP(bro, 's'); bro.rotation.y = PI - 0.35; if (T > E.waves - 0.1) b.armL.rotation.set(-2.7 + 0.25 * S(T * 9), 0, 0.2); }
  // the corridor: you on the bench, then he gets sent out too and sits right next to you
  if (ci >= 12) { seatP(you, 0.48); you.position.x = 6.75; you.position.z = 1.0; you.rotation.y = PI / 2; faceP(you, 'd'); u.armL.rotation.x = -0.3; u.armR.rotation.x = -0.3;
    if (ci === 13 && T < E.sits) { const w = prog(T, E.c13 + 0.2, E.sits); stillP(bro); bro.position.set(lerp(6.6, 6.75, w), 0, lerp(3.0, 1.75, w)); bro.rotation.y = PI; walkP(bro, T * 6, 1); faceP(bro, 'n'); }
    else if (ci >= 13) { seatP(bro, 0.48); bro.position.x = 6.75; bro.position.z = 1.65; bro.rotation.y = PI / 2; faceP(bro, ci === 14 ? 'o' : 's'); b.armR.rotation.set(-1.0, 0, 0.3); b.armR.userData.e.rotation.x = 0.45; b.armR.userData.e.rotation.y = 0.15 * S(T * 5); if (ci === 14) faceP(you, 'S'); }
    else bro.visible = false; }
}
function shot(T) { camera.fov = 60; camera.updateProjectionMatrix(); anim(T); const c = camAt(T); look(c[0], c[1]);
  const ci = CLI(T);  return { si: 0, t0: 0 }; }
