
// ---------- timing ----------
const E = { out: AT(0, 'the'), hours: AT(0, 'four'), c1: CL[1].start, c2: CL[2].start, pumps: AT(2, 'the'), fill: AT(2, 'fill'), c3: CL[3].start, month: AT(3, "that's"), c4: CL[4].start, keep: AT(4, 'keep'), closed: AT(4, 'closed'), freezer: AT(4, 'a', 1),
  c5: CL[5].start, tins: AT(5, 'save'), c6: CL[6].start, low: AT(6, 'low'), torch: AT(6, 'torch'), c7: CL[7].start, slam: AT(7, 'slams'), peep: AT(7, 'through'), c8: CL[8].start, optB: AT(8, 'option', 1), comment: AT(8, 'comment') };
E.loop = TM.total - 0.4;
const AY = 18; // apartment floor height above the street
// ---------- build ----------
function build() {
  R.moon = new T3.DirectionalLight('#8aa0e8', 1.6); R.moon.position.set(-20, 60, -80); scene.add(R.moon); scene.add(R.moon.target); R.moon.target.position.set(0, AY, 0);
  R.hemi = new T3.HemisphereLight('#6a7ab0', '#3a3440', 1.8); scene.add(R.hemi);
  const sky = PT(8, 64, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#0a0e1e'); g.addColorStop(0.46, '#1e2440'); g.addColorStop(0.52, '#4a2a2a'); g.addColorStop(0.56, '#2a2028'); g.addColorStop(1, '#0a0a10'); c.fillStyle = g; c.fillRect(0, 0, w, h); });
  add(scene, Sp(1500, 24, 12), new T3.MeshBasicMaterial({ map: sky, side: T3.BackSide, fog: false, toneMapped: false }), 0, 0, 0, false).castShadow = false;
  // ---- city outside (dark, a few generators, fires) ----
  const C_ = R.C = new T3.Group(); scene.add(C_); boxM(C_, 600, 0.1, 600, PM('#1a1a1e', 10, 16, 1), 0, 0, -200, false); const rs = rng(23);
  for (let i = 0; i < 46; i++) { const x = -160 + rs() * 320, z = -40 - rs() * 260, w = 12 + rs() * 16, h = 15 + rs() * 80; if (Math.abs(x) < 8 && z > -50) continue; tower(C_, x, z, w, h, w, ['#3a3a42', '#34363e', '#40403e'][(rs() * 3) | 0], 0.05, 500 + i); }
  for (let i = 0; i < 18; i++) { const x = -100 + rs() * 200, z = -50 - rs() * 200; const l = spr(C_, GLOW, '#ff7a2a', 18 + rs() * 22, x, 4, z, 0.9); l.material.fog = false; R.fires = R.fires || []; R.fires.push(l); }
  R.fireL = new T3.PointLight('#ff6a2a', 0, 200, 1); R.fireL.position.set(-30, 20, -90); scene.add(R.fireL);
  R.brach = brachio(); R.brach.position.set(-40, 0, -150); R.brach.rotation.y = PI / 2; C_.add(R.brach); R.pteros = []; for (let i = 0; i < 5; i++) { const p = ptero(i); p.scale.setScalar(2.4); C_.add(p); R.pteros.push(p); }
  // ---- apartment ----
  const A = R.A = new T3.Group(); A.position.y = AY; scene.add(A); const wall = PM('#8a8478', 14, 16, 30), wood = PM('#6a4a32', 22, 16, 31), tile = PM('#c8c8c0', 14, 16, 32), dark = PM('#2a2a2e', 12, 8, 33);
  boxM(A, 8.2, 0.12, 8.2, wood, 0, -0.06, 0); boxM(A, 8.2, 0.1, 8.2, PM('#9a948a', 12, 16, 34), 0, 2.85, 0, false);
  boxM(A, 0.12, 2.9, 8.2, wall, -4.1, 1.45, 0); boxM(A, 8.2, 2.9, 0.12, wall, 0, 1.45, 4.1);
  // back wall with a big window (z = -4.1)
  boxM(A, 1.6, 2.9, 0.12, wall, -3.3, 1.45, -4.1); boxM(A, 1.6, 2.9, 0.12, wall, 3.3, 1.45, -4.1); boxM(A, 5, 0.8, 0.12, wall, 0, 0.4, -4.1); boxM(A, 5, 0.4, 0.12, wall, 0, 2.7, -4.1);
  for (const x of [-2.5, 0, 2.5]) boxM(A, 0.12, 1.7, 0.16, dark, x, 1.65, -4.1); boxM(A, 5, 0.12, 0.16, dark, 0, 0.8, -4.1); boxM(A, 5, 0.12, 0.16, dark, 0, 2.5, -4.1);
  // fire escape outside the window
  const iron = PM('#2a2a2c', 12, 8, 35); boxM(A, 5.2, 0.08, 1.2, iron, 0, 0.0, -4.8, false); for (let i = 0; i < 9; i++) boxM(A, 0.05, 1.0, 0.05, iron, -2.5 + i * 0.62, 0.5, -5.38, false); boxM(A, 5.2, 0.06, 0.06, iron, 0, 1.0, -5.38, false); for (let k = 0; k < 8; k++) boxM(A, 0.9, 0.05, 0.05, iron, 2.2, 0.35 + k * 0.4, -5.3, false); for (const x of [1.78, 2.62]) boxM(A, 0.06, 3.4, 0.06, iron, x, 1.6, -5.3, false);
  // right wall with bathroom doorway (x = 4.1, gap z -0.6..0.6) and the front door on the near wall
  boxM(A, 0.12, 2.9, 3.4, wall, 4.1, 1.45, -2.4); boxM(A, 0.12, 2.9, 3.4, wall, 4.1, 1.45, 2.4); boxM(A, 0.12, 0.7, 1.2, wall, 4.1, 2.55, 0);
  // bathroom
  boxM(A, 3.4, 0.12, 4.2, tile, 5.8, -0.05, -0.4); boxM(A, 0.12, 2.9, 4.2, PM('#b8b8b0', 10, 16, 36), 7.5, 1.45, -0.4); boxM(A, 3.4, 2.9, 0.12, PM('#b8b8b0', 10, 16, 36), 5.8, 1.45, -2.5); boxM(A, 3.4, 2.9, 0.12, PM('#b8b8b0', 10, 16, 36), 5.8, 1.45, 1.7);
  const bathM = PM('#e8e8e0', 8, 16, 37); boxM(A, 1.9, 0.08, 0.9, bathM, 6.4, 0.04, -2.0); for (const sz of [-1, 1]) boxM(A, 1.9, 0.62, 0.1, bathM, 6.4, 0.31, -2.0 + sz * 0.4); for (const sx of [-1, 1]) boxM(A, 0.1, 0.62, 0.9, bathM, 6.4 + sx * 0.9, 0.31, -2.0); R.water = boxM(A, 1.7, 0.02, 0.7, LM({ color: '#4a7ab8', transparent: true, opacity: 0.75, emissive: '#1a2a40', emissiveIntensity: 0.4 }), 6.4, 0.1, -2.0, false);
  boxM(A, 0.12, 0.3, 0.12, PM('#c8ccd2', 8, 8, 38), 7.25, 0.85, -2.0); R.spout = boxM(A, 0.3, 0.06, 0.08, PM('#c8ccd2', 8, 8, 38), 7.1, 0.95, -2.0); R.tapH = boxM(A, 0.14, 0.05, 0.05, PM('#c83a2a', 8, 8, 39), 7.25, 1.05, -1.85);
  R.stream = boxM(A, 0.05, 1, 0.05, LM({ color: '#8ab8e8', transparent: true, opacity: 0.8, emissive: '#3a5a8a', emissiveIntensity: 0.5 }), 6.98, 0.5, -2.0, false);
  const tankT = PT(16, 32, (c) => { noisy(c, 16, 32, '#e0dcd2', 10, 40); c.fillStyle = '#c82a2a'; c.fillRect(2, 12, 12, 7); c.fillStyle = '#fff'; c.font = '6px monospace'; c.fillText('150L', 2, 18); }); const tk = new T3.Mesh(new T3.CylinderGeometry(0.4, 0.4, 1.7, 10), LM({ map: tankT })); tk.position.set(7.0, 0.85, 1.1); tk.rotation.y = -PI / 2; A.add(tk); boxM(A, 0.16, 0.08, 0.16, PM('#c8a040', 8, 8, 41), 6.6, 0.15, 1.1);
  // kitchen (left wall): counter, fridge, fresh food, tins on a shelf
  boxM(A, 0.75, 0.92, 3.2, PM('#5a4a3a', 18, 16, 42), -3.65, 0.46, 0.2); boxM(A, 0.8, 0.06, 3.3, PM('#b8b0a0', 12, 16, 43), -3.62, 0.95, 0.2);
  const frT = PT(16, 32, (c) => { noisy(c, 16, 32, '#d8d8d4', 8, 44); c.fillStyle = '#7a7a78'; c.fillRect(0, 11, 16, 1); c.fillRect(13, 3, 1, 6); c.fillRect(13, 15, 1, 12); }); const frM = LM({ map: frT }); R.fridge = boxM(A, 0.85, 2.0, 0.85, [frM, frM, frM, frM, frM, frM], -3.62, 1.0, 2.35);
  R.fresh = []; const apple = PM('#b8302a', 18, 8, 45), bread = PM('#c8904a', 18, 8, 46), milk = PM('#e8e8e4', 10, 8, 47); for (const [m, x, z, w, h, d] of [[bread, -3.6, -0.6, 0.35, 0.18, 0.5], [milk, -3.65, 0.0, 0.18, 0.4, 0.18], [apple, -3.55, 0.35, 0.12, 0.12, 0.12], [apple, -3.7, 0.5, 0.12, 0.12, 0.12], [apple, -3.5, 0.6, 0.12, 0.12, 0.12]]) R.fresh.push(boxM(A, w, h, d, m, x, 0.98 + h / 2, z));
  const shelf = PM('#6a5240', 18, 8, 48); for (const y of [1.3, 1.75]) boxM(A, 0.4, 0.05, 1.6, shelf, -3.85, y, -2.4); R.tins = []; const tinT = PT(16, 8, (c) => { noisy(c, 16, 8, '#a8a8a0', 12, 49); noisy(c, 16, 4, '#c8402a', 18, 50, 0, 2); }); for (let i = 0; i < 10; i++) { const tn = new T3.Mesh(new T3.CylinderGeometry(0.08, 0.08, 0.2, 8), LM({ map: tinT })); tn.position.set(-3.85, (i < 5 ? 1.43 : 1.88), -3.0 + (i % 5) * 0.3); A.add(tn); R.tins.push(tn); }
  // living room: sofa, table, front door
  const sofa = PM('#4a5a6a', 20, 16, 51); R.sofa = new T3.Group(); R.sofa.position.set(1.0, 0, 2.6); A.add(R.sofa); boxM(R.sofa, 2.4, 0.45, 0.9, sofa, 0, 0.32, 0); boxM(R.sofa, 2.4, 0.6, 0.25, sofa, 0, 0.75, 0.35); for (const sx of [-1, 1]) boxM(R.sofa, 0.25, 0.55, 0.9, sofa, sx * 1.2, 0.5, 0);
  R.door = new T3.Group(); R.door.position.set(3.2, 0, 4.04); A.add(R.door); boxM(R.door, 1.0, 2.1, 0.08, PM('#5a3a28', 20, 16, 52), -0.5, 1.05, 0); boxM(R.door, 0.05, 0.05, 0.1, PM('#c8a040'), -0.5, 1.6, -0.02); boxM(R.door, 0.06, 0.12, 0.1, PM('#c8a040'), -0.88, 1.0, -0.06);
  boxM(A, 1.0, 0.7, 0.6, PM('#3a2a20', 18, 8, 53), -1.0, 0.35, -1.0);
  // corridor outside the front door (seen through the peephole), red emergency light
  const H = R.H = new T3.Group(); H.position.set(2.7, AY, 4.2); scene.add(H); boxM(H, 3, 0.1, 10, PM('#4a3a34', 18, 16, 54), 0, -0.05, 5); boxM(H, 0.1, 2.9, 10, PM('#7a6a5a', 14, 16, 55), -1.5, 1.45, 5); boxM(H, 0.1, 2.9, 10, PM('#7a6a5a', 14, 16, 55), 1.5, 1.45, 5); boxM(H, 3, 0.1, 10, PM('#5a5048', 10, 16, 56), 0, 2.9, 5);
  R.emer = new T3.PointLight('#ff3a2a', 30, 12, 1.0); const hl_ = new T3.PointLight('#ffe0b0', 12, 8, 1.2); hl_.position.set(0, 2.4, 1.0); H.add(hl_); R.emer.position.set(0, 2.6, 4); H.add(R.emer); R.rap = raptor(1); R.rap.position.set(0.1, 0, 2.4); R.rap.rotation.y = PI; H.add(R.rap);
  // first-person hands (blocky, pixel hoodie sleeves) + phone with torch
  R.vm = new T3.Group(); camera.add(R.vm); const slv = PM('#4a5a4a', 22, 8, 60), skin = PM('#d8a07c', 14, 8, 61);
  const vmArm = () => { const a = new T3.Group(); R.vm.add(a); boxM(a, 0.11, 0.11, 0.42, slv, 0, 0, 0.16, false); const h = new T3.Group(); h.position.z = -0.08; a.add(h); boxM(h, 0.1, 0.05, 0.12, skin, 0, 0, -0.03, false); boxM(h, 0.1, 0.04, 0.07, skin, 0, -0.005, -0.12, false); boxM(h, 0.035, 0.035, 0.06, skin, -0.06, 0.01, -0.06, false); a.userData.h = h; return a; };
  R.hR = vmArm(); R.hL = vmArm(); R.hR.scale.setScalar(0.62); R.hL.scale.set(-0.62, 0.62, 0.62);
  R.phTex = ctex(64, 128, () => {}); R.phTex.magFilter = T3.NearestFilter; R.phone = new T3.Group(); camera.add(R.phone); R.phone.position.set(0.02, -0.075, -0.3); R.phone.rotation.x = PI / 2 - 0.25; boxM(R.phone, 0.08, 0.008, 0.15, PM('#1a1a1e'), 0, 0, 0, false); R.phScr = boxM(R.phone, 0.07, 0.002, 0.135, BM('#ffffff', { map: R.phTex }), 0, 0.005, 0, false);
  R.torch = new T3.SpotLight('#fff4e0', 0, 14, 0.5, 0.7, 1.6); R.torch.position.set(0.15, -0.15, 0); camera.add(R.torch); R.torchT = new T3.Object3D(); R.torchT.position.set(0.05, -0.2, -5); camera.add(R.torchT); R.torch.target = R.torchT;
  R.fridgeLED = boxM(A, 0.04, 0.04, 0.02, BM('#5aff8a'), -3.18, 1.85, 2.35, false);
}
function drawPhone(pct, low) { const c = R.phTex.userData.g; c.fillStyle = '#0a0a10'; c.fillRect(0, 0, 64, 128); c.fillStyle = low ? '#e8c020' : '#e83a2a'; c.fillRect(14, 30, Math.round(36 * pct / 100) + 2, 16); c.strokeStyle = '#fff'; c.lineWidth = 2; c.strokeRect(12, 28, 40, 20); c.fillStyle = '#fff'; c.font = 'bold 16px monospace'; c.textAlign = 'center'; c.fillText(pct + '%', 32, 70); c.font = '9px monospace'; c.fillText(low ? 'LOW POWER' : '', 32, 92); c.fillText(low ? 'ON' : '', 32, 104); R.phTex.needsUpdate = true; }
