
function attach(obj, parent, x, y, z) { if (obj.parent !== parent) parent.add(obj); obj.position.set(x, y, z); obj.rotation.set(0, 0, 0); }
const YOU0 = [0, 0, 0.2], BRO0 = [3.4, 0, 0.3];
function around(cx, cz, T, k = 1) { R.girls.forEach((g, i) => { if (g.userData.busy) return; const a = PI * 0.95 + i * PI * 0.275; g.position.set(cx + Math.cos(a) * 0.8 * k, 0, cz + Math.sin(a) * 0.55 * k); g.rotation.y = Math.atan2(cx - g.position.x, cz - g.position.z); faceP(g, 'h'); g.userData.armL.rotation.x = -0.4 + 0.15 * S(T * 4 + i); g.userData.up.rotation.z = 0.06 * S(T * 3 + i); }); }
function camAt(T) { const ci = CLI(T), k = prog(T, CL[ci].start, CL[ci].start + CL[ci].dur); const y = R.you.position, b = R.bro.position;
  if (ci === 0) return [L3([1.6, 2.0, 9.4], [1.6, 1.9, 8.6], ease(k)), [1.6, 1.15, 0]];
  if (ci === 1) return [[1.7, 1.55, 4.0], [1.9, 1.15, 0.2]];
  if (ci === 2) return [[1.6, 1.8, 6.0], [1.7, 1.0, 0]];
  if (ci === 3) return [[y.x + 0.6, 1.55, 4.2], [y.x + 0.3, 1.05, 0.2]];
  if (ci === 4) return [[3.0, 1.35, 3.8], [4.0, 0.6, 0.3]];
  if (ci === 5) return [[b.x - 0.4, 1.9, 5.6], [b.x - 0.7, 1.35, 0.3]];
  if (ci === 6) return [L3([4.0, 1.8, 5.4], [1.5, 1.8, 5.8], ease(k)), [L3([4.2, 1.0, 0.3], [0.8, 1.0, 0.2], ease(k))[0], 1.0, 0.25]];
  if (ci === 7) { const g = R.girls[4].position; return T < E.she - 0.1 ? [[g.x + 0.2, 1.6, 4.6], [g.x + 0.6, 1.05, 0.3]] : [[b.x - 0.7, 1.45, 3.0], [b.x - 0.35, 1.2, 0.3]]; }
  return [L3([2.4, 2.1, 7.6], [2.4, 2.3, 8.2], ease(k)), [2.6, 1.0, 0]]; }
function anim(T) { const ci = CLI(T), you = R.you, bro = R.bro, u = you.userData, b = bro.userData; stillP(you); stillP(bro); you.position.set(...YOU0); you.rotation.set(0, 0, 0); bro.position.set(...BRO0); bro.rotation.set(0, -0.2, 0); faceP(you, 'h'); faceP(bro, 'f');
  R.girls.forEach(g => { stillP(g); g.userData.busy = false; g.visible = true; }); R.fans.forEach(f => { stillP(f); f.visible = false; f.userData.sA.visible = f.userData.sB.visible = false; }); R.bin.rotation.set(0, 0, 0); R.bin.position.set(4.6, 0, 0.4); R.charger.visible = false;
  // tumbleweed rolls past lonely bro
  const tw = (ci === 0 || ci === 8); R.tumble.visible = tw; if (tw) { const k = prog(T, CL[ci].start, CL[ci].start + CL[ci].dur); R.tumble.position.set(lerp(9, 1, k), 0.35 + 0.12 * Math.abs(S(T * 7)), -0.4); R.tumble.rotation.z = T * 6; }
  // jacket: on you, handed over, then carried off by the girls
  if (ci === 0) attach(R.jacket, u.up, 0, 0, 0);
  if (ci === 1) { const w = ease(prog(T, CL[1].start, E.jacket - 0.2)); you.position.set(lerp(0, 2.6, w), 0, 0.25); you.rotation.y = w < 1 ? PI / 2 : PI / 2 - 0.3; if (w < 1) walkP(you, T * 8, 1); if (T < E.jacket) attach(R.jacket, u.armR.userData.e, 0, -0.3, 0.14); else attach(R.jacket, b.up, 0, 0, 0); u.armR.rotation.x = -1.2; bro.rotation.y = -1.2; faceP(bro, T > E.jacket ? 'h' : 'f'); if (T > E.clever - 0.15) faceP(you, 's'); }
  around(ci === 1 ? lerp(0, 1.8, prog(T, CL[1].start, E.jacket)) : 0, 0.2, T);
  if (ci === 2) { you.position.set(2.6, 0, 0.25); you.rotation.y = PI / 2 - 0.3; faceP(you, 'd'); const g = R.girls[0], k = prog(T, CL[2].start, CL[2].start + 1.0), back = prog(T, E.c2 + 1.2, E.c3); R.girls.forEach((q, i) => { q.userData.busy = true; const tx = lerp(BRO0[0] - 0.6 + i * 0.12, -0.4 + i * 0.35, ease(back)); q.position.set(lerp(q.position.x || 0, tx, ease(k)), 0, 0.6 + (i % 2) * 0.3); q.rotation.y = back > 0 ? -PI / 2 : PI / 2; if ((k > 0 && k < 1) || (back > 0 && back < 1)) walkP(q, T * 9 + i, 1); faceP(q, 'h'); });
    if (T < E.c2 + 1.1) attach(R.jacket, b.up, 0, 0, 0); else attach(R.jacket, g.userData.armR.userData.e, 0, -0.3, 0.14); g.userData.armR.rotation.x = -1.0; faceP(bro, 'f'); bro.rotation.y = -0.6; }
  if (ci >= 3) attach(R.jacket, R.girls[0].userData.armR.userData.e, 0, -0.3, 0.14);
  // the walk lesson
  if (ci === 3) { const w = prog(T, CL[3].start, CL[4].start); you.position.set(lerp(-0.6, 2.2, w), 0, 0.6); you.rotation.y = PI / 2; walkP(you, T * 6, 1.2); u.up.rotation.z = 0.15 * S(T * 6); faceP(you, T > E.much3 - 0.15 ? 's' : 'h'); bro.position.set(you.position.x - 1.1, 0, 0.6); bro.rotation.y = PI / 2; walkP(bro, T * 6, 1.2); b.up.rotation.z = 0.2 * S(T * 6 + 0.5); faceP(bro, 'h'); around(-1.6, 0.2, T); }
  if (ci === 4) { const w = prog(T, CL[4].start, E.bin - 0.05), f = ease(prog(T, E.bin - 0.05, E.bin + 0.4)); bro.position.set(lerp(2.6, 4.1, w), 0, 0.4); bro.rotation.set(0, PI / 2, 0); if (f <= 0) { walkP(bro, T * 6, 1.2); b.up.rotation.z = 0.2 * S(T * 6); faceP(bro, 's'); } else { bro.rotateX(-1.35 * f); bro.position.y = 0.1 * f; faceP(bro, 'o'); R.bin.rotation.z = -1.4 * f; R.bin.position.x = 4.6 + 0.4 * f; } you.position.set(1.4, 0, 0.6); you.rotation.y = PI / 2; faceP(you, 'd'); around(-1.2, 0.2, T); }
  // paid fans follow bro... then switch to you
  if (ci === 5 || ci === 6) { const w = ci === 5 ? prog(T, CL[5].start, CL[6].start) : 1; bro.position.set(lerp(1.5, 4.2, w), 0, 0.5); bro.rotation.y = PI / 2; if (ci === 5) walkP(bro, T * 7, 1); faceP(bro, ci === 6 && T > E.sw ? 'f' : 'h'); you.position.set(-0.6, 0, 0.2); you.rotation.y = 0.4; faceP(you, 'h'); around(-0.6, 0.2, T);
    R.fans.forEach((f, i) => { f.visible = true; const sw = ci === 6 && T > E.sw - 0.1; const k = sw ? ease(prog(T, E.sw - 0.1, E.c7)) : 0; f.position.set(lerp(bro.position.x - 0.9 - i * 0.7, 0.4 + i * 0.6, k), 0, 0.7 + (i % 2) * 0.35); f.rotation.y = sw ? -PI / 2 : PI / 2; if ((ci === 5) || (k > 0 && k < 1)) walkP(f, T * 8 + i, 1); f.userData.armR.rotation.x = -2.6 + 0.2 * S(T * 6 + i); f.userData.sA.visible = !sw; f.userData.sB.visible = sw; f.userData.sA.position.copy(f.userData.armR.getWorldPosition(new T3.Vector3())).add(new T3.Vector3(0, 0.55, 0)); f.userData.sB.position.copy(f.userData.sA.position); faceP(f, 'h'); }); }
  // one girl walks past everyone, straight to bro... for her charger
  if (ci === 7 || ci === 8) { bro.position.set(4.2, 0, 0.5); bro.rotation.y = -0.6; faceP(bro, ci === 7 && T > E.past && T < E.she ? 'h' : 'd'); you.position.set(-0.6, 0, 0.2); you.rotation.y = 0.4; around(-0.6, 0.2, T); R.fans.forEach((f, i) => { f.visible = true; f.position.set(0.4 + i * 0.6, 0, 0.7 + (i % 2) * 0.35); f.rotation.y = -PI / 2; f.userData.armR.rotation.x = -2.6; f.userData.sA.visible = false; f.userData.sB.visible = true; f.updateMatrixWorld(true); f.userData.sB.position.copy(f.userData.armR.getWorldPosition(new T3.Vector3())).add(new T3.Vector3(0, 0.55, 0)); faceP(f, 'h'); });
    const g = R.girls[4]; g.userData.busy = true; stillP(g); if (ci === 7) { const w = prog(T, E.past - 0.1, E.she - 0.2), back = prog(T, E.charger + 0.3, CL[8].start); g.position.set(back > 0 ? lerp(3.6, 6.5, back) : lerp(-0.3, 3.6, w), 0, 0.55); g.rotation.y = PI / 2; if ((w > 0 && w < 1) || back > 0) walkP(g, T * 8, 1); faceP(g, 'n');
      if (T > E.she - 0.2 && back <= 0) { g.rotation.y = PI / 2 - 0.4; g.userData.armR.rotation.x = -1.3; b.armR.rotation.x = -1.2; R.charger.visible = true; const hand = T < E.charger ? b.armR.userData.e : g.userData.armR.userData.e; attach(R.charger, hand, 0, -0.32, 0.06); } if (back > 0) { R.charger.visible = true; attach(R.charger, g.userData.armR.userData.e, 0, -0.32, 0.06); } }
    else g.position.set(9, 0, 0.5); }
  // hearts float around you
  R.hearts.forEach((h, i) => { const ph = (T * 0.5 + i / 12) % 1; const cx = you.position.x + S(i * 2.1) * 0.9; h.position.set(cx, 1.6 + ph * 1.2, you.position.z + C(i * 1.7) * 0.5); h.material.opacity = S(PI * ph); h.visible = ci !== 4; }); }
function shot(T) { camera.fov = 55; camera.updateProjectionMatrix(); anim(T); const c = camAt(T); look(c[0], c[1]); const cp = camera.position; R.sun.target.position.set(cp.x, 0, cp.z - 4); R.sun.position.set(cp.x + 6, 12, cp.z + 4); R.sun.target.updateMatrixWorld(); return { si: 0, t0: 0 }; }
