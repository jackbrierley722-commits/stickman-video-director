
// ===================== HOW A RECORD PLAYER WORKS: smooth 3D explainer =====================
const E = { diamond: AT(0, 'diamond'), c1: CL[1].start, hair: AT(1, 'thinner'), c2: CL[2].start, wiggle: AT(2, 'they'), shape: AT(2, 'shape'), c3: CL[3].start, c4: CL[4].start, coils: AT(4, 'coils'), which: AT(4, 'which'),
  c5: CL[5].start, speaker: AT(5, 'the', 1), c6: CL[6].start, left: AT(6, 'left'), right: AT(6, 'right'), stereo: AT(6, 'stereo'), c7: CL[7].start };
E.loop = TM.total - 0.4;
const MG = [500, 0, 0], CG = [800, 0, 0], SG = [1100, 0, 0], RC = [-0.4, 0.63, 0];
// groove wall modulation (left / right wall), same functions drive the needle, magnet and speaker
const mL = (x, g = 0) => 0.30 * S(1.25 * x + g) + 0.12 * S(3.3 * x + 2 * g + 1), mR = (x, g = 0) => 0.26 * S(1.05 * x + 0.6 + g) + 0.10 * S(3.9 * x + 2 + g);
const sAt = T => T * 1.6, sig = T => { const s = sAt(T); return (mL(s) + mR(s)) / 2; };
function rodTo(m, a, b) { const A = new T3.Vector3(...a), B = new T3.Vector3(...b); m.position.copy(A).lerp(B, 0.5); m.scale.set(1, A.distanceTo(B), 1); m.quaternion.setFromUnitVectors(new T3.Vector3(0, 1, 0), B.clone().sub(A).normalize()); }
function strip(p, fa, fb, n, x0, x1, mat) { const pos = new Float32Array(n * 2 * 3), idx = []; for (let i = 0; i < n; i++) { const x = lerp(x0, x1, i / (n - 1)); const a = fa(x), b = fb(x); pos.set([x, a[0], a[1]], i * 6); pos.set([x, b[0], b[1]], i * 6 + 3); if (i) { const k = i * 2; idx.push(k - 2, k - 1, k, k - 1, k + 1, k); } }
  const g = new T3.BufferGeometry(); g.setAttribute('position', new T3.BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals(); const m = new T3.Mesh(g, mat); m.receiveShadow = true; p.add(m); return m; }
function recordTex() { return ctex(2048, 2048, (c, w, h) => { c.fillStyle = '#0c0c0e'; c.fillRect(0, 0, w, h); const cx = w / 2, r0 = w / 2; const r = rng(12);
  for (let rr = r0 * 0.99; rr > r0 * 0.36; rr -= 1.6) { const gap = [0.82, 0.66, 0.52].some(f => Math.abs(rr / r0 - f) < 0.006); c.strokeStyle = gap ? 'rgba(60,60,66,0.9)' : `rgba(${28 + r() * 22},${28 + r() * 22},${32 + r() * 22},0.85)`; c.lineWidth = gap ? 3 : 1; c.beginPath(); c.arc(cx, cx, rr, 0, PI * 2); c.stroke(); }
  c.fillStyle = '#c8322a'; c.beginPath(); c.arc(cx, cx, r0 * 0.34, 0, PI * 2); c.fill(); c.fillStyle = '#f4e8d0'; c.font = '600 64px CapFont'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('SIDE A', cx, cx - 150); c.font = '600 44px CapFont'; c.fillText('33 RPM', cx, cx + 150);
  c.strokeStyle = 'rgba(244,232,208,0.5)'; c.lineWidth = 3; c.beginPath(); c.arc(cx, cx, r0 * 0.3, 0, PI * 2); c.stroke(); }); }
function brushedTex(col) { return ctex(256, 256, (c, w, h) => { c.fillStyle = col; c.fillRect(0, 0, w, h); const r = rng(5); for (let i = 0; i < 900; i++) { c.fillStyle = `rgba(255,255,255,${r() * 0.06})`; c.fillRect(0, r() * h, w, 1); c.fillStyle = `rgba(0,0,0,${r() * 0.05})`; c.fillRect(0, r() * h, w, 1); } }); }
function woodTex() { return ctex(512, 256, (c, w, h) => { c.fillStyle = '#5a3420'; c.fillRect(0, 0, w, h); const r = rng(8); for (let i = 0; i < 160; i++) { const y = r() * h; c.strokeStyle = `rgba(${r() < 0.5 ? '30,15,8' : '120,70,40'},${0.15 + r() * 0.2})`; c.lineWidth = 1 + r() * 2; c.beginPath(); c.moveTo(0, y); for (let x = 0; x <= w; x += 32) c.lineTo(x, y + S(x * 0.02 + i) * 4); c.stroke(); } }); }
// arm angle so the stylus sits at radius rp from the record centre
const PIV = [1.55, 0.82, -1.25], ARM = 2.15;
function armAngle(rp) { let lo = 0, hi = PI; const f = th => Math.hypot(PIV[0] - S(th) * ARM - RC[0], PIV[2] + C(th) * ARM - RC[2]) - rp; for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2; if (f(lo) * f(m) <= 0) hi = m; else lo = m; } return (lo + hi) / 2; }
function build() {
  // lights: warm key with soft shadows, cool rim, low fill
  R.key = new T3.DirectionalLight('#ffe6c8', 3.2); R.key.position.set(3, 7, 5); R.key.castShadow = true; R.key.shadow.mapSize.set(2048, 2048); const sc = R.key.shadow.camera; sc.left = sc.bottom = -4; sc.right = sc.top = 4; sc.near = 1; sc.far = 30; R.key.shadow.bias = -0.0004; scene.add(R.key); scene.add(R.key.target);
  R.rim = new T3.DirectionalLight('#9ac0ff', 2.0); R.rim.position.set(-5, 3, -5); scene.add(R.rim); R.hemi = new T3.HemisphereLight('#c8d0e0', '#2a2620', 0.45); scene.add(R.hemi);
  // ---- turntable ----
  const G = R.G = new T3.Group(); scene.add(G);
  add(G, Bx(30, 0.1, 30), SM('#1c1a18', { roughness: 0.9 }), 0, -0.05, 0);
  const wood = SM('#ffffff', { map: woodTex(), roughness: 0.45 }); add(G, RB(4.6, 0.5, 3.8, 0.08), wood, 0, 0.25, 0); add(G, Bx(4.5, 0.02, 3.7), SM('#141416', { roughness: 0.35 }), 0, 0.505, 0);
  for (const [x, z] of [[-2, -1.6], [2, -1.6], [-2, 1.6], [2, 1.6]]) add(G, Cy(0.18, 0.2, 0.12, 20), SM('#202022', { metalness: 0.6, roughness: 0.4 }), x, -0.02, z);
  R.platter = new T3.Group(); R.platter.position.set(RC[0], 0.5, RC[2]); G.add(R.platter); add(R.platter, Cy(1.56, 1.56, 0.1, 96), SM('#c8ccd2', { metalness: 0.9, roughness: 0.25, map: brushedTex('#c8ccd2') }), 0, 0.06, 0);
  for (let i = 0; i < 48; i++) { const a = i / 48 * PI * 2; add(R.platter, Bx(0.04, 0.02, 0.02), SM('#f0f0f0', { metalness: 0.9, roughness: 0.2 }), C(a) * 1.565, 0.08, S(a) * 1.565).rotation.y = -a; }
  const vin = SM('#101012', { roughness: 0.32, metalness: 0.1 }); R.recM = SM('#ffffff', { map: recordTex(), roughness: 0.3, metalness: 0.15 }); const rec = new T3.Mesh(Cy(1.5, 1.5, 0.02, 128), [vin, R.recM, vin]); rec.position.y = 0.12; rec.castShadow = rec.receiveShadow = true; R.platter.add(rec);
  add(R.platter, Cy(0.03, 0.03, 0.2, 16), SM('#e0e0e0', { metalness: 1, roughness: 0.2 }), 0, 0.2, 0);
  // the spiral, traced in light
  { const pts = []; const turns = 26; for (let i = 0; i <= 3000; i++) { const k = i / 3000; const a = -k * turns * PI * 2, r = lerp(1.47, 0.56, k); pts.push(new T3.Vector3(C(a) * r, 0.135, S(a) * r)); } const geo = new T3.TubeGeometry(new T3.CatmullRomCurve3(pts), 6000, 0.0075, 5, false); R.spiral = new T3.Mesh(geo, BM('#ffd84a')); R.spiral.geometry.setDrawRange(0, 0); R.platter.add(R.spiral); R.spiralN = geo.index.count; }
  // tonearm
  add(G, Cy(0.26, 0.3, 0.12, 32), SM('#2a2a2e', { metalness: 0.7, roughness: 0.35 }), PIV[0], 0.56, PIV[2]); add(G, Cy(0.09, 0.11, 0.28, 20), SM('#c8ccd2', { metalness: 0.9, roughness: 0.25 }), PIV[0], 0.7, PIV[2]);
  R.arm = new T3.Group(); R.arm.position.set(...PIV); G.add(R.arm); const chrome = SM('#dfe2e6', { metalness: 1, roughness: 0.18 });
  add(R.arm, Sp(0.1, 20, 14), chrome, 0, 0, 0); const tube = add(R.arm, Cy(0.03, 0.03, ARM - 0.25, 16), chrome, 0, 0, (ARM - 0.25) / 2 - 0.0); tube.rotation.x = PI / 2; tube.position.z = (ARM - 0.25) / 2;
  const cw = add(R.arm, Cy(0.16, 0.16, 0.34, 32), SM('#2a2a2e', { metalness: 0.8, roughness: 0.3 }), 0, 0, -0.42); cw.rotation.x = PI / 2; add(R.arm, Cy(0.03, 0.03, 0.3, 12), chrome, 0, 0, -0.2).rotation.x = PI / 2;
  const hs = new T3.Group(); hs.position.set(0, -0.05, ARM - 0.12); R.arm.add(hs); add(hs, RB(0.24, 0.04, 0.34, 0.015), SM('#1a1a1c', { metalness: 0.5, roughness: 0.3 }), 0, 0.02, 0.05); add(hs, Bx(0.04, 0.02, 0.18), SM('#1a1a1c'), 0.13, 0.03, 0.12);
  add(hs, RB(0.15, 0.1, 0.2, 0.015), SM('#d8452a', { roughness: 0.35 }), 0, -0.05, 0.08); add(hs, Bx(0.02, 0.03, 0.05), SM('#e8e8e8', { metalness: 0.8 }), 0, -0.1, 0.17); R.styl = add(hs, new T3.ConeGeometry(0.008, 0.035, 8), SM('#e8f4ff', { metalness: 0.2, roughness: 0.05 }), 0, -0.12, 0.18); R.styl.rotation.x = PI;
  add(R.arm, Cy(0.012, 0.012, 0.12, 8), chrome, 0.12, -0.02, ARM - 0.05).rotation.z = 0.8;
  // dust cover hinges and a knob for the deck
  add(G, Cy(0.18, 0.18, 0.08, 24), SM('#c8ccd2', { metalness: 0.9, roughness: 0.25 }), -1.95, 0.55, 1.55); add(G, Cy(0.05, 0.05, 0.02, 12), BM('#ff5a3a'), -1.55, 0.515, 1.65);
  // ---- macro groove ----
  const M = R.M = new T3.Group(); M.position.set(...MG); scene.add(M); const GR = R.GR = new T3.Group(); M.add(GR);
  const vm = SM('#111214', { roughness: 0.26, metalness: 0.05, envMapIntensity: 1.6, side: T3.DoubleSide }); R.wl = vm.clone(); R.wr = vm.clone(); const W_ = 1, D_ = 1.0, P_ = 3.2, gs = [-2, -1, 0, 1, 2], N_ = 1600, X0 = -24, X1 = 90;
  gs.forEach((g, gi) => { const z = g * P_; const L = x => [0, z - W_ + mL(x, g)], B = x => [-D_, z + (mL(x, g) + mR(x, g)) / 2], Rr = x => [0, z + W_ + mR(x, g)];
    strip(GR, L, B, N_, X0, X1, g === 0 ? R.wl : vm); strip(GR, B, Rr, N_, X0, X1, g === 0 ? R.wr : vm);
    const nz = gi < gs.length - 1 ? (x => [0, (g + 1) * P_ - W_ + mL(x, g + 1)]) : (x => [0, 14]); strip(GR, Rr, nz, 300, X0, X1, vm); if (gi === 0) strip(GR, x => [0, -14], L, 300, X0, X1, vm); });
  { const pts = []; for (let i = 0; i <= 900; i++) { const x = lerp(-10, 80, i / 900); pts.push(new T3.Vector3(x, 0.03, -W_ + mL(x))); } R.wave = new T3.Mesh(new T3.TubeGeometry(new T3.CatmullRomCurve3(pts), 1800, 0.06, 6, false), BM('#ffd84a', { transparent: true, opacity: 0 })); GR.add(R.wave); }
  R.hair = new T3.Group(); GR.add(R.hair); const hm = SM('#ffffff', { map: ctex(256, 64, (c, w, h) => { c.fillStyle = '#6a4428'; c.fillRect(0, 0, w, h); for (let x = 0; x < w; x += 9) { c.strokeStyle = 'rgba(30,15,5,0.35)'; c.lineWidth = 2; c.beginPath(); c.moveTo(x, 0); c.quadraticCurveTo(x + 6, h / 2, x, h); c.stroke(); } }), roughness: 0.45 });
  const hc = add(R.hair, Cy(1.3, 1.3, 34, 32), hm, 0, 1.3, 0); hc.rotation.x = PI / 2; hc.rotation.z = 0.0; R.hair.rotation.y = 0.35;
  // the diamond stylus riding the groove
  R.ne = new T3.Group(); M.add(R.ne); const dia = new T3.MeshPhysicalMaterial({ color: '#eaf6ff', metalness: 0, roughness: 0.03, clearcoat: 1, envMapIntensity: 2.4, emissive: '#1a2a3a', emissiveIntensity: 0.4 });
  add(R.ne, Sp(0.22, 24, 18), dia, 0, -0.69, 0); add(R.ne, new T3.ConeGeometry(0.62, 1.7, 6), dia, 0, 0.16, 0).rotation.x = PI; add(R.ne, Bx(0.62, 0.42, 0.62), SM('#3a3c40', { metalness: 0.8, roughness: 0.3 }), 0, 1.2, 0);
  const cant = add(R.ne, Cy(0.17, 0.17, 1, 16), SM('#c8ccd2', { metalness: 1, roughness: 0.2 }), 0, 0, 0); rodTo(cant, [0, 1.3, 0], [9, 3.6, 0]);
  R.mLight = new T3.PointLight('#ffffff', 25, 18, 1.6); R.mLight.position.set(-3, 5, 4); M.add(R.mLight); R.mRim = new T3.PointLight('#8ab8ff', 30, 20, 1.6); R.mRim.position.set(6, 3, -6); M.add(R.mRim);
  // ---- cartridge cutaway ----
  const CC = R.CC = new T3.Group(); CC.position.set(...CG); scene.add(CC);
  const shell = add(CC, Bx(2.4, 1.6, 3.2), new T3.MeshStandardMaterial({ color: '#ff8a6a', transparent: true, opacity: 0.12, roughness: 0.1, depthWrite: false }), 0, -0.2, 0, false); shell.castShadow = false;
  CC.add(new T3.LineSegments(new T3.EdgesGeometry(Bx(2.4, 1.6, 3.2)), new T3.LineBasicMaterial({ color: '#ffb8a0', transparent: true, opacity: 0.6 }))).position.y = -0.2;
  add(CC, Bx(2.7, 0.14, 3.5), SM('#2a2a2e', { metalness: 0.6, roughness: 0.35 }), 0, 0.68, 0);
  R.cTip = add(CC, new T3.ConeGeometry(0.1, 0.3, 6), dia, 0, -1.35, 1.9); R.cTip.rotation.x = PI; R.cCant = add(CC, Cy(0.05, 0.05, 1, 12), SM('#c8ccd2', { metalness: 1, roughness: 0.2 }), 0, 0, 0);
  R.mag = new T3.Group(); CC.add(R.mag); add(R.mag, Cy(0.15, 0.15, 0.24, 24), SM('#d83a2a', { roughness: 0.35 }), 0, 0, 0.12).rotation.x = PI / 2; add(R.mag, Cy(0.15, 0.15, 0.24, 24), SM('#2a5ad8', { roughness: 0.35 }), 0, 0, -0.12).rotation.x = PI / 2;
  const copper = SM('#c87533', { metalness: 0.9, roughness: 0.3 }); R.coilM = []; for (const sx of [-1, 1]) { const cm = SM('#c87533', { metalness: 0.85, roughness: 0.3, emissive: '#ff7a20', emissiveIntensity: 0 }); R.coilM.push(cm); for (let i = 0; i < 9; i++) { const t = add(CC, new T3.TorusGeometry(0.2, 0.035, 8, 24), cm, sx * (0.42 + i * 0.045), -0.4, 0.4); t.rotation.y = PI / 2; } add(CC, Cy(0.08, 0.08, 0.7, 12), SM('#8a8e94', { metalness: 0.9, roughness: 0.3 }), sx * 0.62, -0.4, 0.4).rotation.z = PI / 2; }
  R.wires = []; for (const sx of [-1, 1]) { const pts = [[sx * 0.8, -0.4, 0.4], [sx * 0.85, 0.1, 0.0], [sx * 0.4, 0.2, -1.2], [sx * 0.3, 0.2, -1.7], [sx * 0.3, 0.3, -3.4]].map(p => new T3.Vector3(...p)); const cv = new T3.CatmullRomCurve3(pts); add(CC, new T3.TubeGeometry(cv, 80, 0.035, 8, false), sx < 0 ? SM('#d8302a') : SM('#3a6ad8'), 0, 0, 0); R.wires.push({ cv, sp: [0, 1, 2, 3, 4, 5].map(() => spr(CC, GLOW, '#ffe28a', 0.4, 0, 0, 0, 0)) }); }
  for (const sx of [-1, 1]) add(CC, Cy(0.07, 0.07, 0.3, 12), SM('#d8b84a', { metalness: 1, roughness: 0.25 }), sx * 0.3, 0.2, -1.65).rotation.x = PI / 2;
  R.cL = new T3.PointLight('#ffffff', 18, 10, 1.5); R.cL.position.set(3, 3, 4); CC.add(R.cL); const cR = new T3.PointLight('#8ab8ff', 14, 10, 1.5); cR.position.set(-3, 1, -3); CC.add(cR);
  // ---- amp and speaker ----
  const SP = R.SP = new T3.Group(); SP.position.set(...SG); scene.add(SP); add(SP, Bx(16, 0.1, 16), SM('#1c1a18', { roughness: 0.9 }), 0, -0.05, 0); add(SP, Bx(16, 8, 0.1), SM('#24222a', { roughness: 0.95 }), 0, 4, -2.5);
  add(SP, RB(2.2, 3.2, 1.6, 0.06), SM('#ffffff', { map: woodTex(), roughness: 0.5 }), 0, 1.6, 0); add(SP, Bx(2.0, 3.0, 0.04), SM('#141416', { roughness: 0.8 }), 0, 1.6, 0.81);
  R.cone = new T3.Group(); R.cone.position.set(0, 1.1, 0.82); SP.add(R.cone); const prof = []; for (let i = 0; i <= 12; i++) { const k = i / 12; prof.push(new T3.Vector2(lerp(0.16, 0.74, k), -0.28 * (1 - k) ** 1.4)); } const cn = add(R.cone, new T3.LatheGeometry(prof, 48), SM('#2a2a2e', { roughness: 0.7, side: T3.DoubleSide }), 0, 0, 0); cn.rotation.x = PI / 2;
  add(R.cone, new T3.SphereGeometry(0.17, 24, 12, 0, PI * 2, 0, PI / 2), SM('#3a3a40', { roughness: 0.5 }), 0, 0, -0.1).rotation.x = PI / 2;
  add(SP, new T3.TorusGeometry(0.79, 0.06, 12, 48), SM('#1a1a1c', { roughness: 0.6 }), 0, 1.1, 0.83); add(SP, new T3.TorusGeometry(0.9, 0.045, 10, 48), SM('#b8bcc2', { metalness: 0.9, roughness: 0.3 }), 0, 1.1, 0.84);
  add(SP, new T3.SphereGeometry(0.16, 20, 10, 0, PI * 2, 0, PI / 2), SM('#c8ccd2', { metalness: 0.9, roughness: 0.25 }), 0, 2.4, 0.83).rotation.x = PI / 2; add(SP, new T3.TorusGeometry(0.24, 0.035, 10, 32), SM('#b8bcc2', { metalness: 0.9, roughness: 0.3 }), 0, 2.4, 0.84);
  R.rings = []; for (let i = 0; i < 5; i++) { const m = add(SP, new T3.TorusGeometry(1, 0.014, 6, 64), BM('#bfe0ff', { transparent: true, opacity: 0, depthWrite: false }), 0, 1.1, 1); R.rings.push(m); }
  const amp = new T3.Group(); amp.position.set(-2.3, 0, 1.4); SP.add(amp); add(amp, RB(2.0, 0.62, 1.3, 0.04), SM('#d0d4da', { metalness: 0.9, roughness: 0.3, map: brushedTex('#d0d4da') }), 0, 0.31, 0);
  R.vuT = ctex(256, 128, () => {}); R.vu = add(amp, new T3.PlaneGeometry(0.62, 0.31), BM('#ffffff', { map: R.vuT }), -0.35, 0.33, 0.66, false); for (const x of [0.35, 0.72]) add(amp, Cy(0.11, 0.11, 0.08, 24), SM('#2a2a2e', { metalness: 0.7, roughness: 0.3 }), x, 0.31, 0.68).rotation.x = PI / 2;
  add(amp, Sp(0.025), BM('#ff4a2a'), 0.85, 0.15, 0.66); const sL = new T3.PointLight('#ffffff', 16, 10, 1.5); sL.position.set(2, 3.5, 4); SP.add(sL); const sR = new T3.PointLight('#8ab8ff', 12, 10, 1.5); sR.position.set(-3, 2.5, -1); SP.add(sR);
}
function drawVU(level) { const c = R.vuT.userData.g, w = 256, h = 128; const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#ffcf6a'); g.addColorStop(1, '#e89a2a'); c.fillStyle = g; c.fillRect(0, 0, w, h);
  c.strokeStyle = '#3a2008'; c.lineWidth = 3; c.beginPath(); c.arc(128, 150, 110, PI * 1.2, PI * 1.8); c.stroke(); c.strokeStyle = '#c81e1e'; c.beginPath(); c.arc(128, 150, 110, PI * 1.65, PI * 1.8); c.stroke(); for (let i = 0; i <= 8; i++) { const a = PI * 1.2 + i / 8 * PI * 0.6; c.strokeStyle = i > 6 ? '#c81e1e' : '#3a2008'; c.beginPath(); c.moveTo(128 + C(a) * 100, 150 + S(a) * 100); c.lineTo(128 + C(a) * 118, 150 + S(a) * 118); c.stroke(); }
  c.fillStyle = '#3a2008'; c.font = '600 22px CapFont'; c.textAlign = 'center'; c.fillText('VU', 128, 110); const a = PI * 1.22 + clamp(level) * PI * 0.56; c.strokeStyle = '#111'; c.lineWidth = 3; c.beginPath(); c.moveTo(128, 150); c.lineTo(128 + C(a) * 125, 150 + S(a) * 125); c.stroke(); R.vuT.needsUpdate = true; }
// ---------- shots ----------
function stylusWorld() { R.G.updateMatrixWorld(true); const v = new T3.Vector3(); R.styl.getWorldPosition(v); return [v.x, v.y, v.z]; }
const M3 = (x, y, z) => [MG[0] + x, MG[1] + y, MG[2] + z], C3 = (x, y, z) => [CG[0] + x, CG[1] + y, CG[2] + z], S3 = (x, y, z) => [SG[0] + x, SG[1] + y, SG[2] + z];
const SH = [
  [0, (k, T) => TR(k, [-0.4, 7.4, 3.0], [-0.4, 6.4, 2.4], [-0.4, 0.5, 0.05], [-0.4, 0.5, 0.05])],
  [E.diamond - 0.12, (k, T) => { const p = stylusWorld(); TR(k, [p[0] + 0.55, p[1] + 0.22, p[2] + 0.55], [p[0] + 0.26, p[1] + 0.09, p[2] + 0.3], p, p); }],
  [E.c1, (k, T) => TR(k, M3(-6, 10, 11), M3(-4, 7, 8.5), M3(2, -0.5, 0), M3(2, -0.5, 0))],
  [E.c2, (k, T) => TR(k, M3(-3.6, 2.8, 4.6), M3(-2.6, 1.8, 3.8), M3(-2.5, -0.6, 0), M3(-2, -0.6, 0))],
  [E.c3, (k, T) => TR(k, M3(-5.5, 0.7, 0.4), M3(-4.2, 0.5, 0.2), M3(0, -0.2, 0), M3(0, -0.3, 0))],
  [E.c4, (k, T) => TR(k, C3(3.6, 0.9, 4.2), C3(2.9, 0.6, 3.4), C3(0, -0.4, 0.3), C3(0, -0.4, 0.3))],
  [E.c5, (k, T) => TR(k, S3(-1.6, 0.9, 3.0), S3(-1.4, 0.95, 2.6), S3(-2.6, 0.35, 1.6), S3(-2.5, 0.4, 1.6))],
  [E.speaker - 0.1, (k, T) => TR(k, S3(1.6, 2.0, 5.6), S3(1.3, 1.8, 5.0), S3(0, 1.3, 0.8), S3(0, 1.25, 0.8))],
  [E.c6, (k, T) => TR(k, M3(12, 0.9, 0), M3(8.5, 0.75, 0), M3(-12, -0.6, 0), M3(-12, -0.6, 0))],
  [E.c7, (k, T) => { const a = lerp(-0.5, -0.15, ease(k)); look([0.3 + S(a) * 6.2, 3.6, C(a) * 6.2], [0.4, 0.5, -0.3]); }],
  [E.loop, (k, T) => look([-0.4, 7.4, 3.0], [-0.4, 0.5, 0.05])],
];
const shotAt = T => { let i = 0; for (let j = 0; j < SH.length; j++) if (T >= SH[j][0]) i = j; return i; };
let VUL = -1;
function anim(T) { const loop = T >= E.loop, ci = loop ? 0 : CLI(T);
  R.platter.rotation.y = -T * 3.49; const rp = lerp(1.38, 1.32, T / TM.total); R.arm.rotation.y = armAngle(rp); R.arm.rotation.x = 0.02;
  const sp = loop ? 0 : ci === 0 ? ease(prog(T, 0.2, E.diamond - 0.3)) : ci >= 1 ? 1 : 0; R.spiral.geometry.setDrawRange(0, Math.floor(R.spiralN * sp / 3) * 3); R.spiral.visible = ci === 0 && !loop;
  // macro groove scrolls under the stylus
  const s = sAt(T); R.GR.position.x = -s; const sg = (mL(s) + mR(s)) / 2; R.ne.position.z = sg; R.ne.rotation.x = 0.06 * (mL(s + 0.05) + mR(s + 0.05) - mL(s) - mR(s)) * 20;
  R.hair.visible = ci === 1; R.hair.position.x = sAt(E.c1) + 5.5;
  R.wave.material.opacity = ci === 2 ? 0.9 * ease(prog(T, E.shape - 0.2, E.shape + 0.3)) : 0;
  const tl = ci === 6 ? ease(prog(T, E.left - 0.1, E.left + 0.2)) : 0, tr = ci === 6 ? ease(prog(T, E.right - 0.1, E.right + 0.2)) : 0; R.wr.emissive.set('#2a6aff'); R.wr.emissiveIntensity = tl * 0.9; R.wl.emissive.set('#ff7a2a'); R.wl.emissiveIntensity = tr * 0.9;
  // cartridge: tip moves most, the magnet near the pivot moves less, coils glow with the signal
  const tipX = sg * 0.35, magX = sg * 0.14; R.cTip.position.set(tipX, -1.35, 1.9); rodTo(R.cCant, [tipX, -1.22, 1.82], [magX, -0.4, 0.62]); R.mag.position.set(magX, -0.4, 0.4); R.mag.rotation.y = sg * 0.25;
  const e = Math.abs(sg) * (ci === 4 ? ease(prog(T, E.coils - 0.2, E.coils + 0.4)) : 0); R.coilM.forEach(m => m.emissiveIntensity = 0.2 + e * 2.2);
  const pulse = ci === 4 ? ease(prog(T, E.which - 0.3, E.which + 0.3)) : 0; R.wires.forEach((w, wi) => w.sp.forEach((s_, i) => { const ph = (T * 0.9 + i / 6 + wi * 0.08) % 1; s_.position.copy(w.cv.getPoint(ph)); s_.material.opacity = pulse * 0.9 * S(ph * PI); s_.scale.setScalar(0.25 + 0.2 * Math.abs(sg)); }));
  // speaker pumps with the same wiggle, rings of air move outward
  R.cone.position.z = 0.82 + sg * 0.09; R.rings.forEach((m, i) => { const ph = (T * 1.1 + i / 5) % 1; m.scale.setScalar(0.85 + ph * 2.6); m.position.z = 0.95 + ph * 3.2; m.material.opacity = (ci === 5 && T > E.speaker) ? 0.45 * (1 - ph) : 0; });
  const lv = Math.round((0.45 + sg * 0.9 + 0.05 * S(T * 23)) * 40) / 40; if (lv !== VUL) { drawVU(lv); VUL = lv; } }
function shot(T) { const si = shotAt(T), sh = SH[si], t0 = sh[0], t1 = si + 1 < SH.length ? SH[si + 1][0] : TM.total; camera.fov = 50; camera.updateProjectionMatrix(); anim(T); sh[1](prog(T, t0, t1), T);
  const c = camera.position; R.key.target.position.set(c.x > 300 ? c.x : RC[0], 0, c.x > 300 ? c.z - 2 : 0); R.key.position.copy(R.key.target.position).add(new T3.Vector3(3, 7, 5)); R.key.target.updateMatrixWorld(); return { si, t0 }; }
// ---------- captions: small white, 2-3 words, mid-frame ----------
const CAPS = []; CL.forEach(c0 => { let cur = []; const flush = () => { if (cur.length) CAPS.push({ a: cur[0].a, b: cur[cur.length - 1].b, t: cur.map(w => w.w).join(' ') }); cur = []; };
  c0.words.forEach((w0, j) => { const w = Object.assign({}, w0); if (/^five$/i.test(w0.w) && c0.words[j + 1] && /^hundred$/i.test(c0.words[j + 1].w)) w.w = '500'; if (/^hundred$/i.test(w0.w) && j && /^five$/i.test(c0.words[j - 1].w)) return; const prev = cur[cur.length - 1]; if (cur.length && (cur.length >= 3 || w.a - prev.b > 0.25 || w.a - prev.a > 0.6 || /[.,!?]$/.test(prev.w))) flush(); cur.push(w); }); flush(); });
CAPS.forEach((c, i) => { const nx = CAPS[i + 1]; c.b = nx ? Math.min(nx.a, c.b + 0.3) : c.b + 0.6; });
function caption(c) { octx.save(); octx.font = '600 44px CapFont'; octx.textAlign = 'center'; octx.textBaseline = 'middle'; octx.lineJoin = 'round'; octx.shadowColor = 'rgba(0,0,0,0.6)'; octx.shadowBlur = 14; octx.lineWidth = 6; octx.strokeStyle = 'rgba(0,0,0,0.55)'; octx.strokeText(c.t, 360, 880); octx.shadowBlur = 0; octx.fillStyle = '#ffffff'; octx.fillText(c.t, 360, 880); octx.restore(); }
function tag(T, t0, label, x, y) { const k = ease(prog(T, t0, t0 + 0.25)); if (k <= 0) return; octx.save(); octx.globalAlpha = k; octx.font = '600 26px CapFont'; const w = octx.measureText(label).width + 36; octx.fillStyle = 'rgba(10,10,14,0.72)'; octx.beginPath(); octx.roundRect(x - w / 2, y - 24, w, 48, 24); octx.fill(); octx.strokeStyle = 'rgba(255,216,74,0.9)'; octx.lineWidth = 2; octx.stroke(); octx.fillStyle = '#ffd84a'; octx.textAlign = 'center'; octx.textBaseline = 'middle'; octx.fillText(label, x, y + 1); octx.restore(); }
window.initFootball = async function () {
  await Promise.all(['600 44px CapFont'].map(f => document.fonts.load(f)));
  GLOW = ctex(64, 64, (c, w, h) => { const gr = c.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.3, 'rgba(255,255,255,0.5)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = gr; c.fillRect(0, 0, w, h); });
  glc = document.createElement('canvas'); glc.width = RW; glc.height = RH;
  renderer = new T3.WebGLRenderer({ canvas: glc, antialias: true, preserveDrawingBuffer: true }); renderer.setPixelRatio(1); renderer.setSize(RW, RH, false); renderer.outputColorSpace = T3.SRGBColorSpace; renderer.toneMapping = T3.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05; renderer.shadowMap.enabled = true; renderer.shadowMap.type = T3.PCFSoftShadowMap;
  scene = new T3.Scene(); scene.background = ctex(16, 512, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#22242c'); g.addColorStop(1, '#0a0a0c'); c.fillStyle = g; c.fillRect(0, 0, w, h); }); camera = new T3.PerspectiveCamera(50, RW / RH, 0.005, 3000); scene.add(camera);
  { const pm = new T3.PMREMGenerator(renderer); const es = new T3.Scene(); es.add(new T3.Mesh(new T3.SphereGeometry(20, 32, 16), new T3.MeshBasicMaterial({ color: '#16181c', side: T3.BackSide }))); for (const [x, y, z, w, h, c] of [[6, 8, 6, 8, 3, '#ffffff'], [-8, 5, -4, 3, 6, '#9ac0ff'], [0, 12, 0, 10, 2, '#fff0e0']]) { const m = new T3.Mesh(new T3.PlaneGeometry(w, h), new T3.MeshBasicMaterial({ color: c, side: T3.DoubleSide })); m.position.set(x, y, z); m.lookAt(0, 0, 0); es.add(m); } scene.environment = pm.fromScene(es, 0.02).texture; }
  build(); out = document.getElementById('c'); octx = out.getContext('2d');
};
window.DURATION = TM.total;
window.renderFrame = function (T) { const loop = T >= E.loop; const ci = loop ? 0 : CLI(T); shot(T); renderer.render(scene, camera);
  octx.globalCompositeOperation = 'source-over'; octx.globalAlpha = 1; octx.filter = 'contrast(1.05) saturate(1.1)'; octx.drawImage(glc, 0, 0, W, H); octx.filter = 'none';
  const vg = octx.createRadialGradient(360, 640, 420, 360, 640, 900); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.4)'); octx.fillStyle = vg; octx.fillRect(0, 0, W, H);
  if (ci === 0 && !loop) { const m = Math.round(500 * ease(prog(T, 0.2, E.diamond - 0.3))); tag(T, 0.15, m + ' m of groove', 360, 250); }
  if (ci === 1) tag(T, E.hair - 0.1, 'human hair', 470, 330);
  if (ci === 6 && T > E.left - 0.1) { tag(T, E.left - 0.1, 'LEFT', 220, 560); } if (ci === 6 && T > E.right - 0.1) tag(T, E.right - 0.1, 'RIGHT', 500, 560);
  const cap = CAPS.find(c => T >= c.a && T < c.b); if (cap && !loop) caption(cap); };
})();
