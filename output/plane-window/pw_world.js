
// ---------- timing ----------
const E = { c1: CL[1].start, square: AT(1, "it's"), c2: CL[2].start, swells: AT(2, 'so'), shrinks: AT(2, 'then'), c3: CL[3].start, cracks: AT(3, 'tiny'), flight: AT(3, 'flight'),
  c4: CL[4].start, two: AT(4, 'two'), broke: AT(4, 'broke'), c5: CL[5].start, nocorner: AT(5, 'no'), flows: AT(5, 'the'), much: AT(5, 'much'), c6: CL[6].start, bro: AT(6, 'until') };
E.loop = TM.total - 0.4;
// window texture: radius 0 = square, 1 = fully round; stress shows as red glow + cracks at the corners, or calm blue flow around a round window
function winTex() { const t = ctex(256, 320, () => {}); t.userData.key = ''; return t; }
function drawWin(t, round, stress, crack, flow, T, outside) { const key = [round.toFixed(2), stress.toFixed(2), crack.toFixed(2), flow ? Math.floor(T * 12) : 0, outside].join(); if (t.userData.key === key) return; t.userData.key = key; const c = t.userData.g;
  c.clearRect(0, 0, 256, 320); c.fillStyle = outside ? '#e8eaee' : '#d8d6d0'; c.fillRect(0, 0, 256, 320);
  if (outside) { c.strokeStyle = 'rgba(0,0,0,0.12)'; c.lineWidth = 2; for (let y = 20; y < 320; y += 60) { c.beginPath(); c.moveTo(0, y); c.lineTo(256, y); c.stroke(); } for (let x = 10; x < 256; x += 24) for (let y = 30; y < 320; y += 60) { c.fillStyle = 'rgba(0,0,0,0.18)'; c.beginPath(); c.arc(x, y, 2, 0, 7); c.fill(); } }
  const w = 140, h = 190, x0 = 128 - w / 2, y0 = 160 - h / 2, r = round * 70;
  c.fillStyle = outside ? '#c8ccd2' : '#f2f0ea'; c.beginPath(); c.roundRect(x0 - 14, y0 - 14, w + 28, h + 28, r + 12 * round); c.fill();
  const sky = c.createLinearGradient(0, y0, 0, y0 + h); sky.addColorStop(0, '#5a9ad8'); sky.addColorStop(1, '#cfe6f6'); c.fillStyle = sky; c.beginPath(); c.roundRect(x0, y0, w, h, r); c.fill();
  c.fillStyle = 'rgba(255,255,255,0.85)'; for (let i = 0; i < 4; i++) { c.beginPath(); c.ellipse(x0 + 20 + i * 36 + (T * 20) % 40, y0 + h * 0.7, 24, 9, 0, 0, 7); c.fill(); }
  if (stress > 0) { const corners = [[x0, y0], [x0 + w, y0], [x0, y0 + h], [x0 + w, y0 + h]]; corners.forEach(([cx, cy]) => { const g = c.createRadialGradient(cx, cy, 0, cx, cy, 46); g.addColorStop(0, `rgba(255,40,20,${0.85 * stress})`); g.addColorStop(1, 'rgba(255,40,20,0)'); c.fillStyle = g; c.fillRect(cx - 46, cy - 46, 92, 92); });
    if (crack > 0) { c.strokeStyle = '#1a1a1a'; c.lineWidth = 2.2; corners.forEach(([cx, cy], k) => { const dx = k % 2 ? 1 : -1, dy = k < 2 ? -1 : 1; let px = cx, py = cy; c.beginPath(); c.moveTo(px, py); const n = Math.floor(crack * 7); for (let i = 0; i < n; i++) { px += dx * (6 + ((i * 37) % 9)); py += dy * (5 + ((i * 53) % 7)) * (i % 2 ? 1 : 0.4); c.lineTo(px, py); } c.stroke(); }); } }
  if (flow) { c.strokeStyle = 'rgba(80,200,255,0.9)'; c.lineWidth = 3; for (let k = 0; k < 3; k++) { const rr = 1 + k * 0.18; c.beginPath(); c.ellipse(128, 160, (w / 2 + 18) * rr, (h / 2 + 18) * rr, 0, 0, 7); c.setLineDash([16, 14]); c.lineDashOffset = -T * 60 * (k % 2 ? 1 : -1); c.stroke(); } c.setLineDash([]); }
  t.needsUpdate = true; }
function plane(col = '#f4f4f6', vintage = false) { const p = new T3.Group(); const skin = SM(col, { metalness: vintage ? 0.7 : 0.25, roughness: vintage ? 0.3 : 0.35 });
  const body = add(p, Cy(1.9, 1.9, 34, 32), skin, 0, 0, 0); body.rotation.z = PI / 2; p.userData.body = body;
  const nose = add(p, Sp(1.9, 32, 16, 0, PI * 2, 0, PI / 2), skin, 17, 0, 0); nose.rotation.z = -PI / 2; nose.scale.set(1, 1.6, 1); add(p, new T3.ConeGeometry(1.9, 6, 32), skin, -20, 0.4, 0).rotation.z = PI / 2;
  const wing = new T3.Shape(); wing.moveTo(0, 0); wing.lineTo(-6, 15); wing.lineTo(-9, 15); wing.lineTo(-7, 0); wing.closePath(); for (const s of [-1, 1]) { const wg = new T3.ExtrudeGeometry(wing, { depth: 0.4, bevelEnabled: false }); const m = add(p, wg, skin, 3, -0.8, 0); m.rotation.x = s > 0 ? -PI / 2 : PI / 2; if (!vintage) add(p, Cy(0.9, 0.9, 3.4, 20), SM('#b8bcc4', { metalness: 0.6 }), 0, -1.7, s * 6).rotation.z = PI / 2; }
  const fin = new T3.Shape(); fin.moveTo(0, 0); fin.lineTo(-4, 7); fin.lineTo(-6.5, 7); fin.lineTo(-5, 0); fin.closePath(); add(p, new T3.ExtrudeGeometry(fin, { depth: 0.3, bevelEnabled: false }), skin, -15, 1.4, -0.15);
  if (!vintage) add(p, Bx(30, 0.5, 3.86), SM('#1d4f9a'), -1, -0.4, 0); // stripe
  const winM = SM('#1a2430', { roughness: 0.1, metalness: 0.4 }); for (let i = 0; i < 24; i++) for (const s of [-1, 1]) { const wn = add(p, vintage ? Bx(0.42, 0.46, 0.06) : RB(0.34, 0.48, 0.06, 0.14), winM, 13 - i * 1.15, 0.55, s * 1.88, false); }
  return p; }
function build() {
  buildSky(); R.sun.intensity = 2.6; R.hemi.intensity = 1.0;
  // ===== SKY / PLANE =====
  const SKY = R.skyG = new T3.Group(); scene.add(SKY);
  R.clouds = []; const cr = rng(5); for (let i = 0; i < 60; i++) { const c = spr(SKY, GLOW, '#ffffff', 14 + cr() * 18, (cr() - 0.5) * 300, -20 + cr() * 30, -40 - cr() * 120, 0.85, T3.NormalBlending); c.userData.x0 = c.position.x; R.clouds.push(c); }
  R.plane = plane(); SKY.add(R.plane);
  R.halfA = new T3.Group(); R.halfB = new T3.Group(); SKY.add(R.halfA); SKY.add(R.halfB);
  R.fire = []; R.smoke = []; R.debris = []; for (let i = 0; i < 40; i++) R.fire.push(spr(SKY, GLOW, ['#ffb030', '#ff5010', '#fff0a0'][i % 3], 3, 0, -500, 0, 0)); for (let i = 0; i < 30; i++) R.smoke.push(spr(SKY, GLOW, '#3a3a3a', 6, 0, -500, 0, 0, T3.NormalBlending));
  for (let i = 0; i < 26; i++) { const d = add(SKY, Bx(0.4 + cr() * 1.2, 0.08, 0.3 + cr() * 0.8), SM(cr() < 0.5 ? '#e8e8ec' : '#9aa0a8', { metalness: 0.5 }), 0, -500, 0, false); d.userData.v = [(cr() - 0.5) * 14, (cr() - 0.3) * 10, (cr() - 0.5) * 14]; R.debris.push(d); }
  // ===== CABIN =====
  const CB = R.cabin = new T3.Group(); CB.position.set(400, 0, 0); scene.add(CB);
  add(CB, Bx(3.6, 0.1, 14), SM('#3a4a6a', { roughness: 0.9 }), 0, 0, 0); add(CB, Bx(0.8, 0.12, 14), SM('#8a8a8a', { roughness: 0.9 }), 0, 0.01, 0);
  const wallM = SM('#e8e6e0', { roughness: 0.5 }); add(CB, Bx(0.1, 2.3, 14), wallM, -1.85, 1.15, 0); add(CB, Bx(0.1, 2.3, 14), wallM, 1.85, 1.15, 0); const ceil = add(CB, Cy(1.9, 1.9, 14, 24, 1, true, PI * 1.5, PI), SM('#f4f2ee', { side: T3.BackSide }), 0, 2.0, 0); ceil.rotation.x = PI / 2;
  for (let z = -6; z <= 6; z += 1.4) { add(CB, Bx(3.5, 0.2, 0.6), SM('#e8e4dc'), 0, 2.15, z, false); }
  R.winTex = winTex(); R.cabWin = add(CB, new T3.PlaneGeometry(0.5, 0.62), new T3.MeshBasicMaterial({ map: R.winTex, toneMapped: false }), -1.79, 1.35, 0.2, false); R.cabWin.rotation.y = PI / 2;
  for (const z of [-2.6, -1.2, 1.6, 3.0]) add(CB, new T3.PlaneGeometry(0.42, 0.52), new T3.MeshBasicMaterial({ map: ctex(32, 40, c => { c.fillStyle = '#d8d6d0'; c.fillRect(0, 0, 32, 40); c.fillStyle = '#7ab0e0'; c.beginPath(); c.roundRect(6, 6, 20, 28, 10); c.fill(); }), toneMapped: false }), -1.79, 1.35, z, false).rotation.y = PI / 2;
  const seatM = SM('#2a4a8a', { roughness: 0.8 }); R.seats = []; for (let z = -5; z <= 5; z += 1.4) for (const x of [-1.35, -0.85, 0.85, 1.35]) { const g = new T3.Group(); g.position.set(x, 0, z); CB.add(g); add(g, RB(0.46, 0.12, 0.48, 0.04), seatM, 0, 0.45, 0); add(g, RB(0.46, 0.75, 0.1, 0.04), seatM, 0, 0.85, -0.24).rotation.x = -0.12; add(g, RB(0.3, 0.12, 0.08, 0.03), SM('#e8e8ec'), 0, 1.25, -0.27); }
  R.cabL = new T3.PointLight('#fff4e0', 6, 9, 1.5); R.cabL.position.set(0, 2.0, 0); CB.add(R.cabL);
  R.pax = []; const pr = rng(9); for (let z = -3.6; z <= 5; z += 1.4) for (const x of [0.85, 1.35]) { if (pr() < 0.3) continue; const p = human({ skin: ['#d8a078', '#e8c0a0', '#8a5a3a'][Math.floor(pr() * 3)], top: ['#5a6a8a', '#8a4a4a', '#4a6a4a', '#d8c8a0'][Math.floor(pr() * 4)], hair: ['#2a1a10', '#d8b45a', '#1a1a1a'][Math.floor(pr() * 3)] }); p.position.set(x, 0, z + 0.1); p.rotation.y = PI; CB.add(p); seatPose(p, 0.5); p.position.x = x; p.position.z = z + 0.1; R.pax.push(p); }
  R.you = human({ skin: '#d8a078', top: '#3a3a42', bot: '#2a2e3a', hair: '#2a1a10', eye: '#4a3020', shoe: '#e8e8e8' }); CB.add(R.you);
  R.bro = human({ skin: '#c8906a', top: '#b8303a', bot: '#3a3a42', hair: '#1a1a1a', eye: '#3a2a1a', shoe: '#1a1a1e' }); CB.add(R.bro);
  // ===== WINDOW CLOSE-UP (outside skin) =====
  const WN = R.winSet = new T3.Group(); WN.position.set(800, 0, 0); scene.add(WN); R.winTex2 = winTex(); R.winPanel = add(WN, new T3.PlaneGeometry(2.4, 3.0), new T3.MeshBasicMaterial({ map: R.winTex2, toneMapped: false }), 0, 0, 0, false);
  // ===== 1954 =====
  const V = R.vint = new T3.Group(); V.position.set(1200, 0, 0); scene.add(V); R.vPlane = plane('#c8ccd2', true); V.add(R.vPlane); R.vCl = []; for (let i = 0; i < 30; i++) R.vCl.push(spr(V, GLOW, '#ffffff', 16 + cr() * 14, (cr() - 0.5) * 200, -20 + cr() * 25, -40 - cr() * 80, 0.7, T3.NormalBlending));
}
// plane explosion state at frame 1 (also re-used for the loop)
function boom(k, origin) { R.plane.visible = k <= 0; R.halfA.visible = R.halfB.visible = false;
  R.fire.forEach((f, i) => { if (k <= 0) { f.position.y = -500; return; } const a = i / 40 * 2 * PI, sp = 2 + (i % 5); f.position.set(origin[0] + C(a) * sp * k * 3, origin[1] + S(a * 1.3) * sp * k * 2, origin[2] + S(a) * sp * k * 2); f.scale.setScalar(3 + k * 6); f.material.opacity = Math.max(0, 1 - k * 0.6); });
  R.smoke.forEach((f, i) => { if (k <= 0) { f.position.y = -500; return; } const a = i / 30 * 2 * PI; f.position.set(origin[0] + C(a) * 6 * k, origin[1] + 2 + k * 4 + S(a) * 2, origin[2] + S(a) * 6 * k - 2); f.scale.setScalar(6 + k * 12); f.material.opacity = 0.55 * Math.min(1, k * 2); });
  R.debris.forEach(d => { if (k <= 0) { d.position.y = -500; return; } const v = d.userData.v; d.position.set(origin[0] + v[0] * k * 2, origin[1] + v[1] * k * 2 - 6 * k * k, origin[2] + v[2] * k * 2); d.rotation.set(k * 8, k * 5, k * 3); }); }
const SH = [
  [0, (k, T) => look([30, 8, 46], [0, 1, 0])],
  [E.c1, (k, T) => TR(k, [400 + 0.2, 1.45, 1.0], [400 + 0.0, 1.42, 0.85], [400 - 1.79, 1.35, 0.2], [400 - 1.79, 1.35, 0.2])],
  [E.c2, (k, T) => TR(k, [8, 3, 34], [6, 2.5, 30], [0, 0, 0], [0, 0, 0])],
  [E.c3, (k, T) => TR(k, [800, 0, 3.6], [800, 0, 2.6], [800, 0, 0], [800, 0, 0])],
  [E.c4, (k, T) => TR(k, [1200 + 26, 6, 40], [1200 + 20, 5, 34], [1200, 0, 0], [1200, 0, 0])],
  [E.c5, (k, T) => TR(k, [800, 0, 2.8], [800, 0, 3.4], [800, 0, 0], [800, 0, 0])],
  [E.c6, (k, T) => TR(k, [400 + 0.9, 1.6, 1.9], [400 + 0.8, 1.55, 1.6], [400 - 1.4, 1.2, 0.1], [400 - 1.4, 1.2, 0.1])],
  [E.loop, (k, T) => look([30, 8, 46], [0, 1, 0])],
];
const shotAt = T => { let i = 0; for (let j = 0; j < SH.length; j++) if (T >= SH[j][0]) i = j; return i; };
function anim(T) { const ci = CLI(T), loop = T >= E.loop, cl = loop ? 0 : ci;
  R.clouds.forEach((c, i) => { c.position.x = ((c.userData.x0 + T * 25 + 150) % 300) - 150; });
  // frame 1: the plane is already blowing apart
  const k0 = cl === 0 ? 0.25 + prog(T, 0, E.c1) * 0.9 : 0; boom(k0, [1, 0.5, 0]); R.plane.visible = !(cl === 0) || false; if (cl === 0) { R.halfA.visible = R.halfB.visible = true; if (!R.halfA.children.length) { const a = plane(); const b = plane(); R.halfA.add(a); R.halfB.add(b); a.position.x = 0; b.position.x = 0; a.userData.body.scale.y = 0.5; a.userData.body.position.x = 8.5; b.userData.body.scale.y = 0.5; b.userData.body.position.x = -8.5; a.children.forEach(m => { if (m.position.x < 1 && m !== a.userData.body) m.visible = false; }); b.children.forEach(m => { if (m.position.x > 1 && m !== b.userData.body) m.visible = false; }); }
    R.halfA.position.set(k0 * 4, -k0 * 2, 0); R.halfA.rotation.z = -k0 * 0.5; R.halfB.position.set(-k0 * 3, -k0 * 3, 0); R.halfB.rotation.z = k0 * 0.6; }
  // the balloon: fuselage swells (cruise), shrinks (landing)
  const sw = cl === 2 ? (T < E.shrinks ? ease(prog(T, E.swells - 0.2, E.swells + 0.8)) : 1 - ease(prog(T, E.shrinks, E.shrinks + 0.8))) * (0.85 + 0.15 * S(T * 6)) : 0; R.plane.userData.body.scale.set(1 + 0.28 * sw, 1, 1 + 0.28 * sw); R.plane.position.set(0, cl === 2 && T > E.shrinks ? -3 * prog(T, E.shrinks, E.c3) : 0, 0); R.plane.rotation.z = cl === 2 && T > E.shrinks ? -0.06 : 0.02 * S(T);
  // window texture states
  const round = cl === 5 ? ease(prog(T, E.c5 + 0.2, E.nocorner)) : cl === 6 ? 1 : 0; const stress = cl === 3 ? 0.4 + 0.6 * prog(T, E.c3, E.cracks) + 0.15 * Math.abs(S(T * 5)) : cl === 1 ? 0.35 : 0; const crack = cl === 3 ? prog(T, E.cracks - 0.1, E.c4 - 0.3) : 0;
  drawWin(R.winTex, cl === 6 ? 1 : 0, cl === 1 ? stress : 0, 0, false, T, false); drawWin(R.winTex2, round, stress, crack, cl === 5 && T > E.flows - 0.2, T, true);
  // 1954: an early jet airliner breaks apart in a black-and-white sky
  R.vPlane.rotation.z = 0.05 * S(T); const vb = cl === 4 && T > E.broke ? prog(T, E.broke, E.c5) : 0; R.vPlane.position.set(-T * 0.4 % 6, -vb * 10, 0); R.vPlane.rotation.x = vb * 0.6; R.vPlane.rotation.z = -vb * 0.9;
  // cabin: you at the window, bro steals your seat
  const you = R.you, bro = R.bro; you.visible = cl === 1 || cl === 6; bro.visible = cl === 6 && T > E.bro - 0.3;
  if (you.visible) { seatPose(you, 0.5); you.position.set(400 - 1.35 - 400, you.position.y, 0.1); you.position.x = -1.35; you.rotation.y = PI * 0.5 + 0.4; you.userData.head.rotation.y = 0.3; face(you, cl === 1 ? (T > E.square ? 'shock' : 'neutral') : 'grin', T);
    if (cl === 6 && T > E.bro) { const k = ease(prog(T, E.bro, E.bro + 0.8)); you.position.x = lerp(-1.35, -0.85, k); you.rotation.y = PI; face(you, 'angry', T); } }
  if (bro.visible) { const k = ease(prog(T, E.bro - 0.3, E.bro + 0.6)); rest(bro); if (k < 0.99) { bro.position.set(lerp(0, -1.35, k), 0, lerp(1.2, 0.1, k)); walkPose(bro, T * 9, 0.5); bro.rotation.y = -PI / 2; } else { seatPose(bro, 0.5); bro.position.x = -1.35; bro.position.z = 0.1; bro.rotation.y = PI * 0.5 + 0.5; } face(bro, 'grin', T); }
  R.skyG.visible = cl === 0 || cl === 2; R.cabin.visible = cl === 1 || cl === 6; R.winSet.visible = cl === 3 || cl === 5; R.vint.visible = cl === 4; R.sky.visible = cl !== 3 && cl !== 5;
  scene.background = (cl === 3 || cl === 5) ? new T3.Color('#0a0e14') : null; }
function shot(T) { const si = shotAt(T), sh = SH[si], t0 = sh[0], t1 = si + 1 < SH.length ? SH[si + 1][0] : TM.total; camera.fov = 52; camera.updateProjectionMatrix(); anim(T); sh[1](prog(T, t0, t1), T); sunAt(camera.position.x, 0, camera.position.z); return { si, t0 }; }
