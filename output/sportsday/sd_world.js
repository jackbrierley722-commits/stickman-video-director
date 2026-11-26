
// ---------- timing ----------
const E = { already: AT(0, 'already'), c1: CL[1].start, thirty: AT(1, 'thirty'), shade: AT(1, 'shade'), c2: CL[2].start, fall: AT(2, 'fall'), whistle: AT(2, 'whistle'), c3: CL[3].start, kid: AT(3, "kid's"), glued: AT(3, 'glued'),
  c4: CL[4].start, ends: AT(4, 'ends'), c5: CL[5].start, says: AT(5, 'says'), c6: CL[6].start, c7: CL[7].start, spikes: AT(7, 'spikes'), wearing: AT(7, "he's"), c8: CL[8].start, ham: AT(8, 'hamstring'), wins: AT(8, 'wins'), c9: CL[9].start };
E.loop = TM.total - 0.4;
const STARTX = -12, FINX = 12;
function quake() { return 0; }
function kid(top) { const k = human({ top, bot: '#1c1c24', hair: ['#3a2416', '#c89a5a', '#141010', '#8a4a1a'][Math.floor(Math.random() * 4)], skin: ['#f0c8a0', '#c8946a', '#8a5a3a', '#e8b890'][Math.floor(Math.random() * 4)], short: true }); k.scale.setScalar(0.62); R.G.add(k); return k; }
function build() {
  R.hemi = new T3.HemisphereLight('#f4f8ff', '#8aa86a', 1.4); scene.add(R.hemi); R.sun = new T3.DirectionalLight('#fff2d8', 2.4); R.sun.position.set(-8, 18, 10); R.sun.castShadow = true; R.sun.shadow.mapSize.set(2048, 2048); const sc = R.sun.shadow.camera; sc.left = sc.bottom = -26; sc.right = sc.top = 26; sc.far = 80; R.sun.shadow.radius = 4; scene.add(R.sun); scene.add(R.sun.target);
  scene.background = new T3.Color('#9fd0f4'); scene.fog = new T3.Fog('#cfe6f6', 40, 140);
  const G = R.G = new T3.Group(); scene.add(G); const grass = SM('#6ab04a', { roughness: 0.95 }), grass2 = SM('#62a644', { roughness: 0.95 }), white = SM('#f8f8f4');
  add(G, Bx(160, 0.2, 160), grass, 0, -0.1, 0); for (let i = 0; i < 16; i++) add(G, Bx(160, 0.01, 5), i % 2 ? grass : grass2, 0, 0.002, -40 + i * 5, false);
  for (let l = 0; l <= 6; l++) add(G, Bx(30, 0.02, 0.07), white, 0, 0.01, -1 + l * 1.0, false); add(G, Bx(0.12, 0.02, 6), white, STARTX, 0.012, 2, false); add(G, Bx(0.12, 0.02, 6), white, FINX, 0.012, 2, false);
  for (const z of [-1.2, 5.2]) add(G, Cy(0.05, 0.05, 1.2, 8), SM('#e8e8e8'), FINX, 0.6, z); R.tape = add(G, Bx(0.04, 0.05, 6.4), SM('#e83a2a'), FINX, 1.05, 2, false);
  // school + gazebo + bunting
  add(G, Bx(40, 9, 8), SM('#b86a4a', { roughness: 0.9 }), 0, 4.5, -30); for (let i = 0; i < 12; i++) for (let j = 0; j < 2; j++) add(G, Bx(2, 1.6, 0.1), SM('#bfe0f4'), -16 + i * 3, 3 + j * 3.5, -25.95, false);
  const gz = new T3.Group(); gz.position.set(-6, 0, -6); G.add(gz); add(gz, Cy(2.6, 2.6, 0.2, 4), SM('#f4f4f0'), 0, 2.6, 0).rotation.y = PI / 4; add(gz, new T3.ConeGeometry(2.7, 0.9, 4), SM('#e84a4a'), 0, 3.1, 0).rotation.y = PI / 4; for (const [x, z] of [[-1.8, -1.8], [1.8, -1.8], [-1.8, 1.8], [1.8, 1.8]]) add(gz, Cy(0.05, 0.05, 2.6, 6), SM('#888'), x, 1.3, z); add(gz, Bx(2.4, 0.8, 0.8), SM('#e8e0d0'), 0, 0.4, 0.6);
  const flagC = ['#e84a4a', '#3a7ae8', '#f4c830', '#3ab85a']; for (let i = 0; i < 26; i++) { const f = add(G, new T3.ConeGeometry(0.18, 0.4, 3), SM(flagC[i % 4]), -13 + i * 1.04, 3.4 - 0.4 * S(PI * (i % 13) / 12), -2.2, false); f.rotation.x = PI; }
  add(G, Cy(0.06, 0.06, 4, 6), SM('#888'), -13.3, 2, -2.2); add(G, Cy(0.06, 0.06, 4, 6), SM('#888'), 13.6, 2, -2.2);
  // people
  const houses = ['#e84a4a', '#3a7ae8', '#f4c830', '#3ab85a'];
  R.you = kid('#e84a4a'); R.friend = kid('#3a7ae8'); R.kids = []; for (let i = 0; i < 10; i++) R.kids.push(kid(houses[i % 4]));
  R.sacks = []; for (let i = 0; i < 4; i++) { const s = add(G, Cy(0.34, 0.3, 0.75, 12), SM('#c8a86a', { roughness: 1 }), 0, -5, 0); R.sacks.push(s); }
  R.spoons = []; for (let i = 0; i < 4; i++) { const g = new T3.Group(); add(g, Bx(0.04, 0.02, 0.4), SM('#c8c8cc', { metalness: 0.6, roughness: 0.3 }), 0, 0, 0.2); const egg = add(g, Sp(0.08, 12, 10), SM('#f8f4ea'), 0, 0.07, 0.38); egg.scale.set(0.8, 1, 0.8); g.userData.egg = egg; G.add(g); R.spoons.push(g); }
  R.band = add(G, Cy(0.1, 0.1, 0.12, 10), SM('#f4f4f4'), 0, -5, 0);
  R.teacher = human({ top: '#2a3a6a', bot: '#2a3a6a', hair: '#5a3a1a', skin: '#e8b890', shoe: '#f4f4f4' }); G.add(R.teacher); const th = R.teacher.userData.head; add(th, Cy(0.2, 0.2, 0.02, 16), SM('#e8d8a0'), 0, 0.12, 0); add(th, Cy(0.12, 0.14, 0.12, 16), SM('#e8d8a0'), 0, 0.18, 0);
  R.clip = add(G, Bx(0.32, 0.42, 0.03), SM('#8a5a32'), 0, -5, 0); R.mega = new T3.Group(); G.add(R.mega); add(R.mega, new T3.ConeGeometry(0.16, 0.4, 14, 1, true), SM('#e8e8e8', { side: T3.DoubleSide }), 0, 0, 0).rotation.x = -PI / 2;
  R.dad = human({ top: '#f4f4f0', bot: '#1c1c24', hair: '#3a2416', skin: '#e8b890', shoe: '#7aff3a', short: true }); G.add(R.dad); const dh = R.dad.userData.head; add(dh, new T3.TorusGeometry(0.152, 0.025, 8, 20), SM('#e83a2a'), 0, 0.06, 0).rotation.x = PI / 2;
  R.dad2 = human({ top: '#5a7a5a', bot: '#5a5a6a', hair: '#8a7a6a', skin: '#c8946a' }); G.add(R.dad2); R.dad3 = human({ top: '#8a3a5a', bot: '#3a3a4a', hair: '#141010', skin: '#8a5a3a' }); G.add(R.dad3);
  R.cup = add(G, Cy(0.05, 0.04, 0.12, 10), SM('#f4f0e8'), 0, -5, 0);
  R.parents = []; for (let i = 0; i < 9; i++) { const p = human({ top: ['#c86a4a', '#4a8aa8', '#8a8a5a', '#a84a8a', '#4a6a4a'][i % 5], bot: '#3a3a44', hair: ['#3a2416', '#c89a5a', '#141010'][i % 3], skin: ['#f0c8a0', '#c8946a', '#8a5a3a'][i % 3] }); p.position.set(-9 + i * 2.1, 0, -4.5 - (i % 2) * 0.7); p.rotation.y = 0.1 * (i % 3 - 1); G.add(p); R.parents.push(p); }
  R.sticker = add(G, Cy(0.09, 0.09, 0.01, 20), new T3.MeshStandardMaterial({ map: ctex(128, 128, c => { c.fillStyle = '#ffd23a'; c.beginPath(); c.arc(64, 64, 62, 0, 7); c.fill(); c.save(); c.translate(64, 64); c.rotate(-PI / 2); c.fillStyle = '#c83a2a'; c.font = 'bold 24px Russo'; c.textAlign = 'center'; c.fillText('TAKING', 0, -6); c.fillText('PART', 0, 22); c.restore(); }) }), 0, -5, 0);
  R.medal = add(G, Cy(0.09, 0.09, 0.02, 16), SM('#f4c830', { metalness: 0.7, roughness: 0.3 }), 0, -5, 0); R.podium = add(G, Bx(1.2, 0.6, 1.0), SM('#f4f4f0'), FINX + 3, 0.3, 2.5); R.podium.visible = false;
}
// ---------- helpers ----------
const lane = i => -0.5 + i * 1.0;
function placeKids(fn) { R.kids.forEach((k, i) => { rest(k); k.visible = true; fn(k, i); }); }
function sitCrowd(T) { placeKids((k, i) => { k.position.set(-8 + i * 1.7, 0, 7 + (i % 2) * 0.8); k.rotation.y = PI; const u = k.userData; u.legL.rotation.x = -PI / 2; u.legR.rotation.x = -PI / 2; u.legL.userData.k.rotation.x = PI / 2.2; u.legR.userData.k.rotation.x = PI / 2.2; k.position.y = -0.28; if (i % 3 === 0) u.armR.rotation.set(-2.6 + 0.3 * S(T * 6 + i), 0, 0); }); }
function runPose(p, ph, a = 1) { walkPose(p, ph, a); }
// ---------- shots ----------
const SH = [
  [0, (k, T) => { const kk = ease(prog(T, 0, 1.8)); look(L3([STARTX + 0.5, 42, 2.2], [STARTX + 3.2, 1.5, 4.8], kk), L3([STARTX + 0.5, 0, 2.0], [STARTX, 1.0, 1.0], kk)); }],
  [E.c1, (k, T) => TR(k, [0, 6, 18], [2, 5, 16], [0, 1.5, -2], [0, 1.5, -2])],
  [E.shade - 0.15, (k, T) => TR(k, [-2.2, 1.6, 2.6], [-2.0, 1.55, 2.3], [-3.0, 1.75, 0], [-3.0, 1.8, 0])],
  [E.c2, (k, T) => TR(k, [STARTX + 3.5, 1.6, 7.5], [STARTX + 4, 1.4, 6.5], [STARTX + 1, 0.6, 1.2], [STARTX + 2, 0.5, 1.2])],
  [E.c3, (k, T) => { const x = lerp(-8, 4, prog(T, E.c3, E.c4)); TR(k, [x + 1, 1.4, 6.5], [x + 2, 1.3, 6.0], [x, 0.7, 1.2], [x + 1, 0.7, 1.2]); }],
  [E.glued - 0.15, (k, T) => { const x = R.kids[2].position.x; TR(k, [x + 1.0, 0.95, 2.6], [x + 0.8, 0.9, 2.3], [x, 0.75, 1.0], [x, 0.75, 1.0]); }],
  [E.c4, (k, T) => TR(k, [-1, 1.3, 6.2], [0, 1.2, 5.6], [-1.5, 0.5, 1.2], [-1, 0.4, 1.2])],
  [E.c5, (k, T) => TR(k, [0.2, 1.0, 1.6], [0.12, 0.95, 1.1], [0, 0.85, 0], [0, 0.82, 0])],
  [E.c6, (k, T) => TR(k, [STARTX + 6, 2.2, 8], [STARTX + 5, 2.0, 7], [STARTX + 1, 1.3, 1.5], [STARTX + 1, 1.3, 1.5])],
  [E.c7, (k, T) => TR(k, [STARTX + 2.6, 1.6, 5.0], [STARTX + 2.0, 1.4, 4.2], [STARTX, 0.9, 1.0], [STARTX, 0.9, 1.0])],
  [E.spikes - 0.15, (k, T) => TR(k, [STARTX + 0.9, 0.35, 2.0], [STARTX + 0.8, 0.3, 1.8], [STARTX, 0.08, 1.0], [STARTX, 0.08, 1.0])],
  [E.c8, (k, T) => { const x = R.dad.position.x; look([x + 3.5, 2.2, 7.5], [x + 1.5, 1.0, 1.5]); }],
  [E.c9, (k, T) => TR(k, [FINX + 5.5, 2.2, 7.5], [FINX + 5, 2.0, 6.5], [FINX + 3, 1.3, 2.5], [FINX + 3, 1.4, 2.5])],
  [E.loop, (k, T) => look([STARTX + 0.5, 42, 2.2], [STARTX + 0.5, 0, 2.0])],
];
const shotAt = T => { let i = 0; for (let j = 0; j < SH.length; j++) if (T >= SH[j][0]) i = j; return i; };
function anim(T) { const loop = T >= E.loop, ci = loop ? 0 : CLI(T); const you = R.you, fr = R.friend, u = you.userData, fu = fr.userData, te = R.teacher, tu = te.userData, d = R.dad, du = d.userData;
  [you, fr, te, d, R.dad2, R.dad3].forEach(p => { rest(p); p.visible = true; p.rotation.set(0, 0, 0); p.position.y = 0; });
  R.sacks.forEach(s => s.visible = false); R.spoons.forEach(s => s.visible = false); R.band.visible = false; R.clip.visible = false; R.mega.visible = false; R.cup.visible = false; R.sticker.visible = false; R.medal.visible = false; R.podium.visible = false; R.tape.visible = true; R.tape.scale.set(1, 1, 1);
  sitCrowd(T); you.position.set(-4, 0, 6); you.rotation.y = PI; fr.position.set(-3, 0, 6); fr.rotation.y = PI; te.position.set(-3, 0, 0.2); te.rotation.y = 0.3; d.position.set(STARTX - 1, 0, 1.0); d.rotation.y = PI / 2; R.dad2.position.set(-20, 0, -8); R.dad3.position.set(-20, 0, -9);
  // dad stretching (hook + clip 7)
  const stretch = (p, T) => { const pu = p.userData, s = S(T * 2.2); pu.legL.rotation.x = -0.9; pu.legL.userData.k.rotation.x = 0.9; pu.legR.rotation.x = 0.5; p.position.y = -0.18; pu.armL.rotation.set(-2.9 + 0.3 * s, 0, 0); pu.armR.rotation.set(-2.9 - 0.3 * s, 0, 0); pu.up.rotation.x = 0.2; face(p, 'angry', T); };
  if (ci === 0 || loop) stretch(d, T);
  if (ci === 1) { te.position.set(-3, 0, 0); te.rotation.y = 0.5; tu.armR.rotation.set(-2.7, 0, 0.3); tu.armR.userData.e.rotation.x = -0.6; R.clip.visible = true; te.updateMatrixWorld(true); const h = tu.armR.userData.h.getWorldPosition(new T3.Vector3()); R.clip.position.set(h.x - 0.05, h.y + 0.02, h.z + 0.1); R.clip.rotation.set(-1.2, 0.3, 0); face(te, 'neutral', T); }
  // sack race: you topple before the whistle
  if (ci === 2) { const go = T > E.whistle; [you, R.kids[0], R.kids[1], R.kids[2]].forEach((p, i) => { const s = R.sacks[i]; s.visible = true; const hop = go ? Math.abs(S(T * 7 + i)) * 0.25 : 0; p.position.set(STARTX + 0.6 + (go ? (T - E.whistle) * 1.2 : 0), hop, lane(i)); p.rotation.y = PI / 2; p.userData.armL.rotation.set(-0.8, 0, -0.2); p.userData.armR.rotation.set(-0.8, 0, 0.2);
      if (i === 0) { const f = ease(prog(T, E.fall - 0.05, E.fall + 0.35)); p.position.set(STARTX + 0.6 + 0.4 * f, 0.05, lane(0)); p.rotation.set(0, PI / 2, -1.45 * f); face(p, f > 0.5 ? 'shock' : 'neutral', T); }
      p.updateMatrixWorld(true); const hip = p.localToWorld(new T3.Vector3(0, 0.35, 0)); s.position.copy(hip); s.rotation.copy(p.rotation); s.scale.setScalar(0.62 * 1.1); });
    te.position.set(STARTX - 0.5, 0, -1.6); te.rotation.y = 0.8; tu.armR.rotation.set(-2.0, 0, 0); }
  // egg and spoon: everyone wobbles, one egg never moves
  if (ci === 3) { [R.kids[0], R.kids[1], R.kids[2], R.kids[3]].forEach((p, i) => { const sp = R.spoons[i]; sp.visible = true; const x = lerp(-8, 4, prog(T, E.c3, E.c4)) + (i === 2 ? 1.2 + (T - E.c3) * 0.6 : 0) - i * 0.3; p.position.set(x, 0, lane(i)); p.rotation.y = PI / 2; walkPose(p, T * (i === 2 ? 14 : 8) + i, i === 2 ? 1.4 : 0.6); p.userData.armR.rotation.set(-1.4, 0, 0);
      p.updateMatrixWorld(true); const hp = p.userData.armR.userData.h.getWorldPosition(new T3.Vector3()); sp.position.copy(hp); sp.rotation.set(0, PI / 2, i === 2 ? 0.9 : 0.15 * S(T * 5 + i)); const fell = i === 1 && T > E.kid; sp.userData.egg.position.set(0, fell ? -0.9 : 0.07, 0.38); face(p, i === 2 ? 'smug' : 'neutral', T); }); you.visible = false; fr.visible = false; }
  // three-legged: down you go, then the glare
  if (ci === 4) { const f = ease(prog(T, E.c4 + 0.4, E.ends - 0.1)); [you, fr].forEach((p, i) => { p.position.set(-1.5 + f * 0.8, 0.05 * f, 1.0 + i * 0.32); p.rotation.set(0, PI / 2, (i ? 1 : -1) * 0.3 * f); p.rotation.x = f * 0.9; walkPose(p, T * 10 + i, 0.6 * (1 - f)); });
    if (T > E.ends - 0.1) { you.rotation.set(0, 0.2, 0); fr.rotation.set(0, -0.2 + PI, 0); you.position.set(-1.2, 0, 1.0); fr.position.set(-0.7, 0, 1.0); you.rotation.y = PI / 2; fr.rotation.y = -PI / 2; face(you, 'angry', T); face(fr, 'angry', T); }
    R.band.visible = true; you.updateMatrixWorld(true); const kp = you.userData.legL.userData.k.getWorldPosition(new T3.Vector3()); R.band.position.set(kp.x, kp.y - 0.05, kp.z + 0.16); }
  // sticker close-up
  if (ci === 5) { you.position.set(0, 0, 0); you.rotation.y = 0; face(you, T > E.says ? 'neutral' : 'smug', T); you.updateMatrixWorld(true); const c = you.localToWorld(new T3.Vector3(0.09, 1.28, 0.16)); R.sticker.visible = true; R.sticker.position.copy(c); R.sticker.rotation.set(PI / 2, 0, 0); placeKids(k => k.visible = false); }
  // parents' race announced: megaphone, dads line up
  if (ci >= 6 || loop) { te.position.set(STARTX - 1.0, 0, -1.4); te.rotation.y = 0.6; if (ci === 6) { tu.armR.rotation.set(-1.6, 0.3, 0); R.mega.visible = true; te.updateMatrixWorld(true); const h = tu.armR.userData.h.getWorldPosition(new T3.Vector3()); R.mega.position.copy(h); R.mega.rotation.set(0, 0.6, 0); face(te, 'yell', T); }
    if (!loop) { d.position.set(STARTX - 0.4, 0, lane(1)); d.rotation.y = PI / 2; R.dad2.position.set(STARTX - 0.4, 0, lane(2)); R.dad2.rotation.y = PI / 2; R.dad3.position.set(STARTX - 0.4, 0, lane(3)); R.dad3.rotation.y = PI / 2 - 0.4; R.cup.visible = ci < 8; R.dad3.updateMatrixWorld(true); const h = R.dad3.userData.armR.userData.h.getWorldPosition(new T3.Vector3()); R.dad3.userData.armR.rotation.set(-1.2, 0, 0); R.cup.position.set(h.x, h.y + 0.05, h.z); } }
  if (ci === 7) stretch(d, T);
  // the race: hamstring at halfway, still wins
  if (ci === 8) { const k = prog(T, E.c8, E.wins + 0.1); const ham = T > E.ham; const dx = lerp(STARTX, FINX + 0.6, k); d.position.set(dx, 0, lane(1)); d.rotation.y = PI / 2; if (!ham) { walkPose(d, T * 16, 1.6); face(d, 'angry', T); } else { du.legR.rotation.x = -1.2; du.legR.userData.k.rotation.x = 1.4; du.legL.rotation.x = 0.3 * S(T * 16); d.position.y = 0.15 * Math.abs(S(T * 9)); du.armR.rotation.set(0.6, 0, 0.3); du.armL.rotation.set(-2.6, 0, 0); face(d, 'yell', T); d.rotation.z = 0.12 * S(T * 9); }
    [R.dad2, R.dad3].forEach((p, i) => { p.position.set(lerp(STARTX, FINX - 2.5 - i, k), 0, lane(2 + i)); p.rotation.y = PI / 2; walkPose(p, T * 9 + i, 0.8); face(p, 'neutral', T); }); R.cup.visible = false;
    if (T > E.wins) { R.tape.scale.set(1, 1, 0.3); } }
  // winner on the podium, medal held high, still limping; you facepalm
  if (ci === 9) { R.podium.visible = true; d.position.set(FINX + 3, 0.6, 2.5); d.rotation.y = PI / 2 + 0.6; du.armL.rotation.set(-2.9, 0, 0); du.legR.rotation.x = -0.8; du.legR.userData.k.rotation.x = 1.2; face(d, 'grin', T); R.medal.visible = true; d.updateMatrixWorld(true); const h = du.armL.userData.h.getWorldPosition(new T3.Vector3()); R.medal.position.set(h.x, h.y + 0.1, h.z); R.medal.rotation.set(PI / 2, 0, T * 3); R.tape.visible = false;
    you.position.set(FINX + 1.6, 0, 3.6); you.rotation.y = 0.9; u.armR.rotation.set(-2.4, 0, 0.6); u.armR.userData.e.rotation.x = -1.6; face(you, 'neutral', T); [R.dad2, R.dad3].forEach((p, i) => { p.position.set(FINX + 4.4 + i, 0, 1.6 + i); p.rotation.y = -0.6; }); }
}
function shot(T) { const si = shotAt(T), sh = SH[si], t0 = sh[0], t1 = si + 1 < SH.length ? SH[si + 1][0] : TM.total; camera.fov = 58; camera.updateProjectionMatrix(); anim(T); sh[1](prog(T, t0, t1), T);
  const c = camera.position; R.sun.position.set(c.x - 8, 18, c.z + 10); R.sun.target.position.set(c.x, 0, c.z - 6); R.sun.target.updateMatrixWorld(); return { si, t0 }; }
