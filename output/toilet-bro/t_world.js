
// ---------- timing ----------
const E = { c1: CL[1].start, knock: AT(1, 'knock'), says1: AT(1, 'he'), c2: CL[2].start, two: AT(2, 'two'), c3: CL[3].start, back: AT(3, 'he'), busy: AT(3, 'it'),
  c4: CL[4].start, water: AT(4, 'and'), more: AT(4, 'now'), c5: CL[5].start, opens: AT(5, 'the'), much: AT(5, 'much'), c6: CL[6].start, c7: CL[7].start };
E.loop = TM.total - 0.4;
const DZ = -2; // the bathroom door sits in the wall at z = -2
function paperTex(text, col) { return ctex(256, 180, (c) => { c.fillStyle = '#f6f2e8'; c.fillRect(0, 0, 256, 180); c.strokeStyle = '#c8d8e8'; c.lineWidth = 2; for (let y = 30; y < 180; y += 26) { c.beginPath(); c.moveTo(0, y); c.lineTo(256, y); c.stroke(); } c.fillStyle = col; c.font = '64px Russo'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.save(); c.translate(128, 96); c.rotate(-0.06); c.fillText(text, 0, 0); c.restore(); }); }
function screenTex(kind) { return ctex(320, 200, (c) => { if (kind === 'game') { const g = c.createLinearGradient(0, 0, 0, 200); g.addColorStop(0, '#1a3a7a'); g.addColorStop(1, '#3a1a5a'); c.fillStyle = g; c.fillRect(0, 0, 320, 200); c.fillStyle = '#2a8a3a'; c.fillRect(0, 140, 320, 60); c.fillStyle = '#ffd34a'; c.fillRect(150, 100, 20, 40); c.fillStyle = '#fff'; c.font = '16px Russo'; c.fillText('KILLS 27', 10, 20); }
  else if (kind === 'live') { c.fillStyle = '#121218'; c.fillRect(0, 0, 320, 200); c.fillStyle = '#e8263a'; c.fillRect(10, 10, 70, 26); c.fillStyle = '#fff'; c.font = '18px Russo'; c.fillText('LIVE', 22, 30); c.fillText('41.2K watching', 96, 30); const r = rng(3); for (let i = 0; i < 6; i++) { c.fillStyle = ['#9ad0ff', '#ffd34a', '#ff9ab0', '#8ff0a4'][i % 4]; c.font = '14px Arial'; c.fillText(['W stream', 'is he in the toilet??', 'LMAO', 'bro 45 mins', 'hydrate king', 'knock knock'][i], 12, 64 + i * 22); } }
  else { c.fillStyle = '#0a0a10'; c.fillRect(0, 0, 320, 200); c.fillStyle = '#e8263a'; c.font = '30px Russo'; c.textAlign = 'center'; c.fillText('NO INTERNET', 160, 110); } }); }
function build() {
  buildSky(); R.sun.intensity = 0.0; R.hemi.intensity = 0.22; R.sky.visible = false;
  // ===== HALLWAY =====
  const H = R.hall = new T3.Group(); scene.add(H);
  add(H, Bx(8, 0.1, 6), SM('#ffffff', { map: noiseTex(128, 512, '#8a6040', [['rgba(60,30,10,0.25)', 600, 2], ['rgba(255,220,180,0.06)', 300, 2]], 4, [6, 2]), roughness: 0.55 }), 0, -0.05, 1);
  const paint = SM('#e8dcc8', { roughness: 0.85 }); add(H, Bx(3.35, 2.8, 0.15), paint, -2.17, 1.4, DZ); add(H, Bx(3.35, 2.8, 0.15), paint, 2.17, 1.4, DZ); add(H, Bx(1.0, 0.65, 0.15), paint, 0, 2.475, DZ); add(H, Bx(0.15, 2.8, 6), paint, -3.8, 1.4, 1); add(H, Bx(0.15, 2.8, 6), paint, 3.8, 1.4, 1); add(H, Bx(8, 0.1, 6), SM('#f2f0ea'), 0, 2.8, 1, false);
  add(H, Bx(8, 0.12, 0.03), SM('#f4f2ee'), 0, 0.06, DZ + 0.09); const trim = SM('#f4f2ee', { roughness: 0.4 }); add(H, Bx(1.12, 0.08, 0.06), trim, 0, 2.17, DZ + 0.09); add(H, Bx(0.06, 2.15, 0.06), trim, -0.53, 1.08, DZ + 0.09); add(H, Bx(0.06, 2.15, 0.06), trim, 0.53, 1.08, DZ + 0.09);
  R.doorPiv = new T3.Group(); R.doorPiv.position.set(-0.5, 0, DZ); H.add(R.doorPiv); R.door = add(R.doorPiv, RB(0.98, 2.1, 0.05, 0.015), SM('#f4f2ee', { roughness: 0.45 }), 0.49, 1.07, 0);
  for (const [y, h] of [[1.55, 0.7], [0.55, 0.7]]) add(R.doorPiv, RB(0.7, h, 0.01, 0.005), SM('#e8e6e0', { roughness: 0.5 }), 0.49, y, 0.03, false); add(R.doorPiv, Sp(0.035), SM('#c8a040', { metalness: 1, roughness: 0.25 }), 0.88, 1.0, 0.06);
  // the RGB glow leaking under the door (the clue)
  R.leak = add(H, new T3.PlaneGeometry(0.95, 0.5), new T3.MeshBasicMaterial({ color: '#ff3af0', transparent: true, opacity: 0.5, blending: T3.AdditiveBlending, depthWrite: false, toneMapped: false }), 0, 0.006, DZ + 0.25, false); R.leak.scale.y = 0.6; R.leakL = new T3.PointLight('#ff3af0', 2.5, 1.6, 1.5); R.leakL.position.set(0, 0.08, DZ + 0.15); H.add(R.leakL); R.leak.rotation.x = -PI / 2;
  R.hallL = new T3.PointLight('#ffe2b8', 12, 9, 1.4); R.hallL.castShadow = true; R.hallL.position.set(0, 2.5, 1.5); H.add(R.hallL); add(H, Cy(0.18, 0.18, 0.05, 20), SM('#fff', { emissive: '#fff2dc', emissiveIntensity: 2 }), 0, 2.74, 1.5, false);
  // wall clock (time skip) and the router shelf
  R.clock = new T3.Group(); R.clock.position.set(-1.6, 2.0, DZ + 0.09); H.add(R.clock); add(R.clock, Cy(0.22, 0.22, 0.04, 28), SM('#ffffff'), 0, 0, 0).rotation.x = PI / 2; add(R.clock, new T3.TorusGeometry(0.22, 0.02, 8, 28), SM('#2a2a2e'), 0, 0, 0.01);
  R.cM = new T3.Group(); R.cM.position.z = 0.03; R.clock.add(R.cM); add(R.cM, Bx(0.015, 0.17, 0.01), SM('#111'), 0, 0.08, 0, false); R.cH = new T3.Group(); R.cH.position.z = 0.035; R.clock.add(R.cH); add(R.cH, Bx(0.025, 0.11, 0.01), SM('#111'), 0, 0.05, 0, false);
  add(H, Bx(0.9, 0.04, 0.3), SM('#8a5a32'), 1.8, 1.1, DZ + 0.22); R.router = new T3.Group(); R.router.position.set(1.8, 1.14, DZ + 0.22); H.add(R.router); add(R.router, RB(0.36, 0.06, 0.2, 0.02), SM('#1a1a1e', { roughness: 0.4 }), 0, 0.03, 0); for (const sx of [-0.14, 0.14]) { const an = add(R.router, Cy(0.008, 0.008, 0.2, 6), SM('#1a1a1e'), sx, 0.15, -0.06); an.rotation.z = sx * 0.6; }
  R.leds = []; for (let i = 0; i < 4; i++) R.leds.push(add(R.router, Sp(0.008, 6, 4), new T3.MeshBasicMaterial({ color: '#30ff60', toneMapped: false }), -0.09 + i * 0.06, 0.04, 0.101, false));
  R.plug = new T3.Group(); H.add(R.plug); add(R.plug, Bx(0.05, 0.05, 0.04), SM('#f4f4f4'), 0, 0, 0); R.cable = add(H, Cy(0.006, 0.006, 0.6, 6), SM('#222'), 0, 0, 0, false);
  // the note
  R.note = add(H, new T3.PlaneGeometry(0.22, 0.155), new T3.MeshStandardMaterial({ map: paperTex('PLEASE', '#2a4a8a'), roughness: 0.9, side: T3.DoubleSide }), 0, 0.012, DZ + 0.3, false); R.note.rotation.x = -PI / 2; R.noteBusy = paperTex('BUSY', '#c81e1e'); R.notePlease = R.note.material.map;
  // characters
  R.you = human({ skin: '#d8a078', top: '#3a3a42', bot: '#2a2e3a', hair: '#2a1a10', eye: '#4a3020', shoe: '#e8e8e8' }); H.add(R.you);
  R.phone = new T3.Group(); R.you.userData.armR.userData.h.add(R.phone); add(R.phone, RB(0.075, 0.15, 0.01, 0.008), SM('#111'), 0, -0.06, 0.03); R.phoneScr = add(R.phone, new T3.PlaneGeometry(0.066, 0.135), new T3.MeshBasicMaterial({ map: ctex(64, 128, (c) => { const g = c.createLinearGradient(0, 0, 0, 128); g.addColorStop(0, '#6ac8ff'); g.addColorStop(1, '#2a6ab8'); c.fillStyle = g; c.fillRect(0, 0, 64, 128); c.strokeStyle = 'rgba(255,255,255,0.8)'; c.lineWidth = 2; for (let x = 6; x < 64; x += 8) { c.beginPath(); c.moveTo(x, 20); c.lineTo(x + 2, 128); c.stroke(); } c.fillStyle = '#3a6a3a'; c.fillRect(0, 0, 64, 20); }), toneMapped: false }), 0, -0.06, 0.036, false);
  R.bro = human({ skin: '#c8906a', top: '#b8303a', bot: '#3a3a42', hair: '#1a1a1a', eye: '#3a2a1a', shoe: '#1a1a1e' }); scene.add(R.bro); R.headset = new T3.Group(); R.bro.userData.head.add(R.headset); add(R.headset, new T3.TorusGeometry(0.115, 0.012, 6, 20, PI), SM('#1a1a1e'), 0, 0.02, 0).rotation.y = PI / 2; for (const sx of [-1, 1]) add(R.headset, Cy(0.045, 0.045, 0.03, 14), SM('#e8263a', { emissive: '#e8263a', emissiveIntensity: 0.6 }), sx * 0.11, 0.0, 0).rotation.z = PI / 2;
  // ===== BATHROOM (the secret setup) =====
  const B = R.bath = new T3.Group(); scene.add(B);
  add(B, Bx(4, 0.1, 3.2), SM('#ffffff', { map: noiseTex(64, 64, '#30343a', [['rgba(0,0,0,0.1)', 200, 2]], 6, [6, 5]), roughness: 0.3, envMapIntensity: 0.15 }), 0, -0.04, DZ - 1.6);
  const tile = SM('#2a3038', { roughness: 0.35, envMapIntensity: 0.15 }); add(B, Bx(4, 2.8, 0.1), tile, 0, 1.4, DZ - 3.2); add(B, Bx(0.1, 2.8, 3.2), tile, -2, 1.4, DZ - 1.6); add(B, Bx(0.1, 2.8, 3.2), tile, 2, 1.4, DZ - 1.6);
  const cer = SM('#f6f6f4', { roughness: 0.15 }); const tl = new T3.Group(); tl.position.set(-0.9, 0, DZ - 2.4); B.add(tl); add(tl, Cy(0.18, 0.14, 0.4, 20), cer, 0, 0.2, 0.05); add(tl, Sp(0.24, 20, 12), cer, 0, 0.42, 0.15).scale.set(0.85, 0.25, 1.15); add(tl, RB(0.42, 0.42, 0.18, 0.04), cer, 0, 0.62, -0.18);
  // desk + 3 monitors + RGB
  add(B, Bx(1.6, 0.05, 0.6), SM('#1a1a1e', { roughness: 0.4 }), 0.6, 0.78, DZ - 2.85); for (const x of [-0.15, 1.35]) add(B, Bx(0.05, 0.78, 0.5), SM('#1a1a1e'), x, 0.39, DZ - 2.85);
  R.mons = []; [[-0.05, 0.35], [0.6, 0], [1.25, -0.35]].forEach(([x, ry], i) => { const m = new T3.Group(); m.position.set(x, 1.18, DZ - 3.0); m.rotation.y = ry; m.scale.setScalar(1.25); B.add(m); add(m, RB(0.56, 0.34, 0.03, 0.01), SM('#111'), 0, 0, 0); const scr = add(m, new T3.PlaneGeometry(0.52, 0.3), new T3.MeshBasicMaterial({ map: screenTex(i === 1 ? 'live' : 'game'), toneMapped: false }), 0, 0, 0.017, false); R.mons.push(scr); });
  R.noNet = screenTex('off'); R.monTex = R.mons.map(m => m.material.map);
  R.rgb = []; for (const [x, y, z, w, h] of [[0, 2.7, DZ - 3.13, 3.9, 0.04], [-1.94, 1.4, DZ - 1.6, 0.04, 2.6], [1.94, 1.4, DZ - 1.6, 0.04, 2.6]]) R.rgb.push(add(B, Bx(w, h, 0.04), new T3.MeshBasicMaterial({ color: '#ff3af0', toneMapped: false }), x, y, z, false));
  R.rgbL = new T3.PointLight('#ff3af0', 18, 7, 1.4); R.rgbL.position.set(0.3, 2.0, DZ - 1.5); B.add(R.rgbL); R.monL = new T3.PointLight('#6a9aff', 10, 4, 1.4); R.monL.position.set(0.6, 1.2, DZ - 2.4); B.add(R.monL);
  const fr = new T3.Group(); fr.position.set(1.6, 0, DZ - 1.0); B.add(fr); add(fr, RB(0.5, 0.8, 0.5, 0.03), SM('#e8e8ec', { roughness: 0.3 }), 0, 0.4, 0); add(fr, Bx(0.4, 0.05, 0.02), new T3.MeshBasicMaterial({ color: '#7af0ff', toneMapped: false }), 0, 0.72, -0.26, false);
  add(B, new T3.TorusGeometry(0.22, 0.02, 8, 30), new T3.MeshBasicMaterial({ color: '#fff8e8', toneMapped: false }), -1.6, 1.6, DZ - 2.6, false); add(B, Cy(0.012, 0.012, 1.4, 6), SM('#222'), -1.6, 0.75, DZ - 2.6);
  R.chair = new T3.Group(); R.chair.position.set(1.3, 0, DZ - 2.1); R.chair.rotation.y = -0.8; B.add(R.chair); add(R.chair, RB(0.5, 0.1, 0.5, 0.04), SM('#e8263a', { roughness: 0.4 }), 0, 0.5, 0); add(R.chair, RB(0.5, 0.8, 0.1, 0.04), SM('#e8263a', { roughness: 0.4 }), 0, 0.95, 0.25); add(R.chair, Cy(0.03, 0.03, 0.45, 8), SM('#222'), 0, 0.25, 0);
}
const SH = [
  [0, (k, T) => TR(k, [0.9, 1.5, 2.2], [0.75, 1.45, 1.9], [-0.1, 0.9, DZ], [-0.1, 0.9, DZ])],
  [E.c1, (k, T) => TR(k, [1.0, 1.35, DZ + 1.1], [0.95, 1.35, DZ + 1.0], [0.15, 1.25, DZ + 0.2], [0.15, 1.25, DZ + 0.2])],
  [E.c2, (k, T) => TR(k, [-0.4, 1.6, 1.4], [-0.6, 1.7, 1.0], [-1.5, 1.4, DZ], [-1.6, 1.8, DZ])],
  [E.c3, (k, T) => TR(k, [0.55, 0.45, DZ + 0.75], [0.5, 0.38, DZ + 0.65], [0.05, 0.0, DZ + 0.22], [0.05, 0.0, DZ + 0.22])],
  [E.c4, (k, T) => TR(k, [1.1, 1.35, DZ + 0.8], [1.0, 1.3, DZ + 0.7], [0.2, 1.15, DZ + 0.35], [0.2, 1.15, DZ + 0.35])],
  [E.more - 0.1, (k, T) => TR(k, [0.0, 1.3, 1.8], [0.0, 1.3, 1.6], [0.0, 0.9, DZ + 0.6], [0.0, 0.9, DZ + 0.6])],
  [E.c5, (k, T) => TR(k, [1.9, 1.35, DZ + 0.8], [1.85, 1.3, DZ + 0.7], [1.8, 1.15, DZ + 0.22], [1.8, 1.15, DZ + 0.22])],
  [E.opens - 0.1, (k, T) => TR(k, [0.8, 1.6, 1.8], [0.6, 1.6, 1.4], [0, 1.3, DZ], [0, 1.3, DZ])],
  [E.c6, (k, T) => TR(k, [0.3, 1.6, DZ + 0.9], [0.5, 1.5, DZ - 0.2], [0.2, 1.15, DZ - 3], [0.2, 1.15, DZ - 2.6])],
  [E.c7, (k, T) => TR(k, [1.1, 1.6, 0.6], [1.0, 1.6, 0.3], [0.2, 1.4, DZ], [0.2, 1.4, DZ])],
  [E.loop, (k, T) => look([0.9, 1.5, 2.2], [-0.1, 0.9, DZ])],
];
const shotAt = T => { let i = 0; for (let j = 0; j < SH.length; j++) if (T >= SH[j][0]) i = j; return i; };
function needIt(p, T, amt = 1) { rest(p); const u = p.userData; u.legL.rotation.z = 0.1 * amt; u.legR.rotation.z = -0.1 * amt; u.legL.rotation.x = 0.1 * S(T * 9) * amt; u.legR.rotation.x = -0.1 * S(T * 9) * amt; u.up.rotation.x = 0.12 * amt; u.armL.rotation.set(-0.5, 0, 0.2); u.armR.rotation.set(-0.5, 0, -0.2); p.position.y = 0.02 * Math.abs(S(T * 9)) * amt; }
function anim(T) { const ci = CLI(T), loop = T >= E.loop, cl = loop ? 0 : ci; const you = R.you, bro = R.bro, u = you.userData;
  const hue = (T * 0.25) % 1; const rgbCol = new T3.Color().setHSL(hue, 0.9, 0.55); R.rgb.forEach(m => m.material.color.copy(rgbCol)); R.rgbL.color.copy(rgbCol); R.leak.material.color.copy(rgbCol);
  const doorOpen = (cl === 5 && T > E.opens + 1.0) || cl === 6; R.doorPiv.rotation.y = doorOpen ? -1.6 * ease(prog(T, cl === 6 ? 0 : E.opens + 1.0, cl === 6 ? 0.01 : E.opens + 1.5)) : 0; R.leak.material.opacity = doorOpen ? 0 : 0.55 + 0.15 * S(T * 3); R.leakL.color.copy(rgbCol); R.leakL.intensity = doorOpen ? 0 : 2.5;
  const netOff = (cl === 5 && T > E.c5 + 1.0) || cl === 6; R.leds.forEach((l, i) => l.material.color.set(netOff ? '#202020' : (Math.floor(T * 6 + i) % 3 ? '#30ff60' : '#106020'))); R.mons.forEach((m, i) => m.material.map = netOff ? R.noNet : R.monTex[i]);
  // you: desperate outside the door
  you.visible = true; you.position.set(0.15, 0, DZ + 0.8); you.rotation.set(0, PI, 0); needIt(you, T, cl === 4 && T > E.more - 0.2 ? 2.2 : 1); face(you, 'angry', T); R.phone.visible = false;
  if (cl === 1 && T < E.says1 + 0.2) { const kn = Math.max(0, S((T - E.knock) * 18)); u.armR.rotation.set(-1.6 - 0.25 * kn, 0, -0.1); u.armR.userData.e.rotation.x = -0.6; }
  if (cl === 1 && T > E.says1) face(you, 'neutral', T);
  if (cl === 2) { you.position.set(-1.0, 0, DZ + 0.45); you.rotation.y = PI * 0.95; rest(you); for (const l of [u.legL, u.legR]) { l.rotation.x = -PI / 2 + 0.2; l.userData.k.rotation.x = 0.4; } you.position.y = -0.62; u.up.rotation.x = -0.25; u.armL.rotation.x = u.armR.rotation.x = -0.7; face(you, 'neutral', T); }
  if (cl === 3) { rest(you); you.position.set(-0.45, 0, DZ + 0.55); you.rotation.y = PI + 0.5; for (const l of [u.legL, u.legR]) { l.rotation.x = -1.6; l.userData.k.rotation.x = 2.4; } you.position.y = -0.55; u.up.rotation.x = 0.6; u.armR.rotation.set(-1.3, 0, 0); face(you, 'neutral', T); }
  if (cl === 4) { R.phone.visible = T > E.water - 0.3; if (R.phone.visible) { u.armR.rotation.set(-1.5, 0.2, -0.3); u.armR.userData.e.rotation.x = -0.3; } face(you, T > E.more - 0.2 ? 'shock' : 'angry', T); }
  if (cl === 5) { if (T < E.c5 + 1.2) { you.position.set(1.65, 0, DZ + 0.75); you.rotation.y = PI; rest(you); u.armR.rotation.set(-1.2 - 0.6 * prog(T, E.c5 + 0.4, E.c5 + 1.0), 0, 0); } else { you.position.set(1.1, 0, DZ + 0.9); you.rotation.y = PI + 0.7; rest(you); face(you, T > E.much - 0.1 ? 'grin' : 'neutral', T); } }
  if (cl === 6) { you.visible = false; }
  if (cl === 7) { you.position.set(0.2, 0, DZ + 0.8); needIt(you, T, 0.4); face(you, 'grin', T); }
  // router plug pulled
  const pulled = netOff ? 1 : (cl === 5 ? prog(T, E.c5 + 0.5, E.c5 + 1.0) : 0); R.plug.position.set(2.25 + 0.1, 0.7 - pulled * 0.25, DZ + 0.09 + 0.05 + pulled * 0.2); R.cable.position.set(2.1, 0.92, DZ + 0.16); R.cable.rotation.z = 0.9; R.cable.visible = true;
  // the note: slides under, comes back BUSY
  R.note.visible = cl === 3; if (cl === 3) { const outK = prog(T, E.c3 + 0.3, E.back - 0.3), backK = prog(T, E.back, E.busy - 0.1); R.note.position.z = DZ + 0.3 - 0.6 * outK + 0.6 * backK; R.note.material.map = T > E.back ? R.noteBusy : R.notePlease; R.note.material.needsUpdate = true; }
  // clock jumps 20 minutes
  const mins = cl === 2 ? 45 + 20 * ease(prog(T, E.c2, E.two)) : cl >= 3 ? 70 : 45; R.cM.rotation.z = -mins / 60 * 2 * PI; R.cH.rotation.z = -(10 + mins / 60) / 12 * 2 * PI;
  // bro: gaming in the bathroom, then caught
  bro.visible = cl === 5 && T > E.opens + 1.0 || cl === 6; rest(bro);
  if (cl === 5) { bro.position.set(0, 0, DZ - 0.25); bro.rotation.set(0, 0, 0); face(bro, 'shock', T); bro.userData.armR.rotation.set(-1.6, 0, -0.2); }
  if (cl === 6) { bro.position.set(-0.45, 0, DZ - 1.4); bro.rotation.set(0, 0.5, 0); face(bro, 'grin', T); bro.userData.armL.rotation.set(-0.4, 0, 0.5); bro.userData.armR.rotation.set(-0.4, 0, -0.5); bro.userData.head.rotation.y = 0.2; }
  R.bath.visible = cl >= 5 && (T > E.opens + 0.8 || cl === 6); renderer.toneMappingExposure = cl === 6 ? 0.75 : 0.9; }
function shot(T) { const si = shotAt(T), sh = SH[si], t0 = sh[0], t1 = si + 1 < SH.length ? SH[si + 1][0] : TM.total; camera.fov = 52; camera.updateProjectionMatrix(); anim(T); sh[1](prog(T, t0, t1), T); sunAt(0, 0, 0); return { si, t0 }; }
