
const GH = () => { const v = new T3.Vector3(); R.gf.userData.head.getWorldPosition(v); return [v.x, v.y, v.z]; }, YH = () => { const v = new T3.Vector3(); R.you.userData.head.getWorldPosition(v); return [v.x, v.y, v.z]; };
function tempAt(T) { if (T < E.turnDown) return 46; if (T < E.turnBack) return lerp(46, 38, prog(T, E.turnDown, E.turnDown + 0.5)); if (T < E.stepIn - 0.6) return lerp(38, 46, prog(T, E.turnBack, E.turnBack + 0.4)); return lerp(46, 37, prog(T, E.stepIn - 0.6, E.stepIn)); }
const CAMS = {
  wide: [[-0.9, 1.8, 2.8], [1.0, 1.45, -0.5]], you: () => { const h = YH(); const r = R.you.rotation.y; return [[h[0] + S(r) * 1.25 - C(r) * 0.45, h[1] + 0.05, h[2] + C(r) * 1.25 + S(r) * 0.45], h]; }, gf: () => { const h = GH(); if (h[0] < 0) return [[h[0] + 1.6, h[1] + 0.05, h[2] + 0.3], h]; return [[h[0] - 0.45, h[1] + 0.07, h[2] + 1.55], h]; },
  dial: [[1.7, 1.78, 0.6], [1.85, 1.65, -1.48]], hand: [[-0.3, 1.6, 1.7], [0.9, 1.35, -0.3]], inside: [[1.6, 1.95, 1.9], [1.15, 1.5, -0.9]], door: () => { const h = GH(); return [[0.2, 1.75, 0.7], h]; } };
const PLAN = [['wide'], ['you'], ['gf'], ['you', 'dial', E.ctrl], ['gf'], ['wide'], ['gf'], ['you'], ['gf'], ['inside'], ['gf'], ['inside'], ['dial'], ['inside'], ['inside'], ['inside'], ['door'], ['card'], ['door'], ['door']];
function camFor(T) { const ci = CLI(T); const p = PLAN[ci]; let key = p[0]; if (p[2] !== undefined && T > p[2] - 0.05) key = p[1]; if (ci === 15 && T > E.stepIn - 0.1) key = 'you'; if (ci === 3 && T > AT(3, 'turn') - 0.1) key = 'dial'; return key; }
function anim(T) { const ci = CLI(T), you = R.you, gf = R.gf, u = you.userData, g = gf.userData; rest(you); rest(gf); you.visible = gf.visible = true; R.robe.visible = true; R.towelH.visible = ci >= 16; R.yourTowel.visible = true;
  const temp = tempAt(T); R.knob.rotation.z = -((temp - 40) / 10) * 2.0;
  // water + steam
  R.drops.forEach(d => { const ud = d.userData; const ph = (T * 2.2 + ud.ph) % 1; d.position.set(SC[0] + C(ud.a) * ud.r * (1 + ph * 1.6), 2.35 - ph * 2.3, -1.0 + S(ud.a) * ud.r * (1 + ph * 1.6) + 0.25); });
  const hot = clamp((temp - 36) / 10); R.steam.forEach((s, i) => { const ph = (T * 0.12 + i / 26) % 1; s.position.set(SC[0] + S(i * 2.3) * 0.55, 2.0 + ph * 0.9, -1.0 + C(i * 1.7) * 0.4); s.scale.setScalar(0.6 + ph * 0.9); s.material.opacity = (0.04 + 0.2 * hot) * S(PI * ph); });
  // her: in the shower until she gets out, then at the bathroom door in a robe
  gf.position.set(SC[0], 0, SC[2]); gf.rotation.y = -0.2; face(gf, 'neutral', T);
  if ([2, 4, 6, 8, 10].includes(ci)) { gf.rotation.y = -0.35; face(gf, ci === 4 ? 'yell' : ci === 2 ? 'shock' : 'neutral', T); if (ci === 4) { g.armL.rotation.set(-1.0, 0, -0.6); g.armR.rotation.set(-1.0, 0, 0.6); } }
  if (ci === 11 && T > E.moves - 0.1) { gf.position.x = SC[0] + 0.3 * ease(prog(T, E.moves, E.moves + 0.6)); face(gf, 'smug', T); }
  if (ci === 12 || ci === 13) { gf.position.x = SC[0] + 0.3; g.head.rotation.x = -0.45; g.armL.rotation.set(-2.7, 0, 0.3); g.armR.rotation.set(-2.7, 0, -0.3); g.armL.userData.e.rotation.x = -1.4; g.armR.userData.e.rotation.x = -1.4;
    if ((ci === 12 && T > E.turnBack - 0.1) || ci === 13) { g.armR.rotation.set(-1.2, 0, -0.9); g.armR.userData.e.rotation.x = -0.2; } }
  if (ci === 14) { gf.position.x = SC[0] + 0.3; face(gf, 'smug', T); g.head.rotation.x = -0.2; }
  if (ci === 15) { const w = prog(T, E.out, E.out + 1.1); gf.position.set(lerp(SC[0] + 0.3, 0.6, prog(w, 0, 0.5)), 0, lerp(SC[2], 0.6, ease(w))); gf.rotation.y = -0.4; if (w > 0 && w < 1) walkPose(gf, T * 8, 0.8); gf.visible = T < E.stepIn - 0.2; }
  if (ci >= 16) { gf.position.set(-2.4, 0, 1.0); gf.rotation.y = PI / 2 + 0.2; face(gf, ci === 19 ? 'yell' : 'angry', T); g.armL.rotation.set(-0.6, 0, 0.9); g.armR.rotation.set(-0.6, 0, -0.9); g.armL.userData.e.rotation.x = -1.6; g.armR.userData.e.rotation.x = -1.6; if (ci === 19) { g.armR.rotation.set(-1.6, 0, -0.2); g.armR.userData.e.rotation.x = -0.3; } }
  // you
  you.position.set(0.0, 0, 0.95); you.rotation.y = 2.4; face(you, 'neutral', T);
  if (ci === 1) face(you, 'shock', T); if (ci === 3 || ci === 5) face(you, 'angry', T);
  if (ci === 7) { you.position.set(0.55, 0, 0.55); you.rotation.y = 2.3; const fl = T > E.disagree - 0.05; u.armR.rotation.set(fl ? -0.9 : -1.6, 0, fl ? 0.3 : -0.2); u.armR.userData.e.rotation.x = fl ? -1.6 : -0.1; face(you, fl ? 'yell' : 'neutral', T); }
  if (ci >= 9 && ci <= 15) { you.position.set(0.62, 0, -1.25); you.rotation.y = 1.4; face(you, 'neutral', T);
    if (ci === 11 && T > E.moves) { you.position.x = lerp(0.62, 0.85, ease(prog(T, E.moves + 0.2, E.moves + 0.8))); if (T > E.lava - 0.1) face(you, 'yell', T); }
    if (ci === 12) { you.position.set(0.85, 0, -1.25); if (T < E.turnBack) { u.armL.rotation.set(-1.5, 0, 0.0); face(you, 'smug', T); } else face(you, 'shock', T); }
    if (ci === 13) { you.position.set(0.85, 0, -1.25); face(you, 'shock', T); }
    if (ci === 14) { u.armL.rotation.set(-1.0, 0, 0.7); u.armR.rotation.set(-1.0, 0, -0.7); u.armL.userData.e.rotation.x = -1.7; u.armR.userData.e.rotation.x = -1.7; face(you, 'angry', T); }
    if (ci === 15) { if (T > E.stepIn - 0.6) { you.position.set(SC[0], 0, SC[2]); you.rotation.y = 0.7; face(you, 'grin', T); u.head.rotation.x = -0.3; u.armL.rotation.set(-0.3, 0, -0.5); u.armR.rotation.set(-0.3, 0, 0.5); } else { you.position.set(1.5, 0, -1.2); u.armL.rotation.set(-1.4, 0, 0); } } }
  if (ci >= 16) { you.position.set(SC[0], 0, SC[2]); you.rotation.y = 0.7; face(you, 'grin', T); u.head.rotation.x = -0.35; u.armL.rotation.set(-0.3, 0, -0.5); u.armR.rotation.set(-0.3, 0, 0.5); }
  if (ci <= 8) { you.position.y = 0; } }
function shot(T) { camera.fov = 52; camera.updateProjectionMatrix(); anim(T); const key = camFor(T); if (key === 'card') { look([-0.9, 1.8, 2.8], [1, 1.45, -0.5]); return { si: 0, t0: 0 }; } const c = typeof CAMS[key] === 'function' ? CAMS[key]() : CAMS[key];
  const ci = CLI(T), k = prog(T, CL[ci].start, CL[ci].start + CL[ci].dur); look(L3(c[0], [c[0][0] * 0.97 + c[1][0] * 0.03, c[0][1], c[0][2] * 0.97 + c[1][2] * 0.03], ease(k)), c[1]); return { si: 0, t0: 0 }; }
