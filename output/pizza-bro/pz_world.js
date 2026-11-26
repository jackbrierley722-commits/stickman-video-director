
// ---------- timing ----------
const E = { bro0: AT(0, 'but'), c1: CL[1].start, blink: AT(1, 'bro'), c2: CL[2].start, clever: AT(2, 'clever'), c3: CL[3].start, c4: CL[4].start, much4: AT(4, 'much'), c5: CL[5].start, drill: AT(5, 'drill'),
  c6: CL[6].start, much6: AT(6, 'much'), c7: CL[7].start, broThere: AT(7, 'bro'), fork: AT(7, 'with'), c8: CL[8].start };
E.loop = TM.total - 0.4;
const MO = [400, 0, 0], YD = [200, 0, 0];
function sliceG(card) { const g = new T3.Group(); const sh = new T3.Shape(); sh.moveTo(0, 0); sh.lineTo(-0.22, 0.5); sh.quadraticCurveTo(0, 0.56, 0.22, 0.5); sh.lineTo(0, 0);
  const m = add(g, new T3.ExtrudeGeometry(sh, { depth: 0.035, bevelEnabled: false }), SM(card ? '#b88a5a' : '#f2c04a'), 0, 0, 0); m.rotation.x = -PI / 2;
  const crust = add(g, Bx(0.46, 0.07, 0.09), SM(card ? '#8a6040' : '#c8823a'), 0, 0.03, -0.51); crust.scale.x = 1;
  if (!card) for (const [x, z] of [[0, -0.15], [-0.08, -0.33], [0.09, -0.36], [0, -0.42]]) add(g, Cy(0.045, 0.045, 0.012, 14), SM('#c83a2a'), x, 0.04, z);
  else for (const [x, z] of [[-0.06, -0.3], [0.07, -0.25]]) add(g, Cy(0.04, 0.04, 0.012, 10), SM('#6a4a30'), x, 0.04, z); return g; }
function build() {
  R.sun = new T3.DirectionalLight('#fff0dc', 2.4); R.sun.position.set(4, 9, 7); R.sun.castShadow = true; R.sun.shadow.mapSize.set(2048, 2048); const sc = R.sun.shadow.camera; sc.left = sc.bottom = -8; sc.right = sc.top = 8; sc.near = 1; sc.far = 40; R.sun.shadow.bias = -0.0005; scene.add(R.sun); scene.add(R.sun.target);
  R.hemi = new T3.HemisphereLight('#ffe8d0', '#7a6a5a', 1.25); scene.add(R.hemi);
  const sky = ctex(16, 512, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#6ab0f0'); g.addColorStop(0.55, '#cfe8fa'); g.addColorStop(1, '#e8f0e0'); c.fillStyle = g; c.fillRect(0, 0, w, h); }); R.sky = add(scene, Sp(900, 32, 16), new T3.MeshBasicMaterial({ map: sky, side: T3.BackSide, toneMapped: false }), 0, 0, 0, false); R.sky.castShadow = false;
  // ---- living room ----
  const G = R.G = new T3.Group(); scene.add(G); add(G, Bx(9, 0.1, 8), SM('#b8865a'), 0, -0.05, 0); add(G, Bx(9, 3, 0.1), SM('#f0d8b0'), 0, 1.5, -3.2); add(G, Bx(0.1, 3, 8), SM('#e8cca0'), -4.5, 1.5, 0); add(G, Bx(0.1, 3, 8), SM('#e8cca0'), 4.5, 1.5, 0);
  const wf = SM('#ffffff'); add(G, Bx(2.4, 1.6, 0.05), new T3.MeshBasicMaterial({ color: '#9ad0f4' }), -1.6, 1.7, -3.13, false); for (const [x, y, w, h] of [[-1.6, 2.52, 2.5, 0.08], [-1.6, 0.88, 2.5, 0.08], [-2.84, 1.7, 0.08, 1.7], [-0.36, 1.7, 0.08, 1.7], [-1.6, 1.7, 0.06, 1.6]]) add(G, Bx(w, h, 0.08), wf, x, y, -3.1);
  add(G, Sp(0.5, 10, 8), SM('#5ab84a'), -2.2, 1.4, -3.4, false); add(G, Sp(0.4, 10, 8), SM('#4aa03a'), -1.1, 1.3, -3.4, false);
  add(G, Bx(2.0, 0.08, 1.1), SM('#8a5a3a'), 0, 0.78, 0); for (const [x, z] of [[-0.9, -0.45], [0.9, -0.45], [-0.9, 0.45], [0.9, 0.45]]) add(G, Bx(0.08, 0.76, 0.08), SM('#6a4228'), x, 0.38, z);
  R.box = new T3.Group(); R.box.position.set(0, 0.83, 0.05); G.add(R.box); add(R.box, Bx(0.8, 0.04, 0.8), SM('#e8dcc8'), 0, 0, 0); const lid = add(R.box, Bx(0.8, 0.8, 0.03), SM('#e8dcc8'), 0, 0.4, -0.41); add(R.box, new T3.PlaneGeometry(0.5, 0.2), BM('#ffffff', { map: ctex(128, 52, (c) => { c.fillStyle = '#c83a2a'; c.fillRect(0, 0, 128, 52); c.fillStyle = '#fff'; c.font = '26px Russo'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('PIZZA', 64, 28); }) }), 0, 0.45, -0.39, false);
  R.slice = sliceG(false); G.add(R.slice); R.card = sliceG(true); G.add(R.card);
  for (const [x, c] of [[-1.4, '#5a6aa8'], [1.4, '#5a6aa8']]) { add(G, Bx(0.5, 0.06, 0.5), SM(c), x, 0.48, 0.1); add(G, Bx(0.5, 0.6, 0.06), SM(c), x + (x < 0 ? -0.22 : 0.22), 0.8, 0.1).rotation.y = PI / 2; }
  // safe
  R.safe = new T3.Group(); R.safe.position.set(0, 0.82, 0.05); G.add(R.safe); add(R.safe, Bx(0.62, 0.55, 0.55), SM('#5a6068', { metalness: 0.5 }), 0, 0.28, 0); add(R.safe, Cy(0.09, 0.09, 0.04, 16), SM('#c8ccd2', { metalness: 0.8 }), 0.08, 0.32, 0.29).rotation.x = PI / 2; add(R.safe, Bx(0.04, 0.16, 0.04), SM('#c8ccd2'), -0.18, 0.28, 0.29);
  R.sparks = []; for (let i = 0; i < 12; i++) R.sparks.push(spr(G, GLOW, '#ffd060', 0.12, 0, 0, 0, 0));
  // people
  R.you = human({ top: '#e8453a', bot: '#2e3550', hair: '#3a2416', skin: '#e4b08a' }); scene.add(R.you); R.bro = human({ top: '#2aa84a', bot: '#3a3a44', hair: '#1a1210', skin: '#c88a60' }); scene.add(R.bro);
  R.drill = new T3.Group(); R.bro.userData.armR.userData.h.add(R.drill); R.drill.position.set(0, -0.05, 0.08); add(R.drill, Bx(0.1, 0.22, 0.1), SM('#e8b020'), 0, -0.06, 0); add(R.drill, Bx(0.1, 0.1, 0.3), SM('#e8b020'), 0, 0.05, 0.12); R.bit = add(R.drill, Cy(0.015, 0.005, 0.18, 8), SM('#c8ccd2', { metalness: 0.9 }), 0, 0.05, 0.36); R.bit.rotation.x = PI / 2;
  R.fork = new T3.Group(); R.bro.userData.armR.userData.h.add(R.fork); R.fork.position.set(0, -0.04, 0.05); add(R.fork, Bx(0.02, 0.02, 0.2), SM('#d8dce0', { metalness: 0.9 }), 0, 0, 0.1); for (const x of [-0.02, 0, 0.02]) add(R.fork, Bx(0.008, 0.008, 0.08), SM('#d8dce0', { metalness: 0.9 }), x, 0, 0.24);
  R.helmet = add(R.bro.userData.head, Sp(0.26, 24, 16), new T3.MeshStandardMaterial({ color: '#cfe8ff', transparent: true, opacity: 0.28, roughness: 0.05 }), 0, 0, 0.0, false);
  // ---- back yard launch ----
  const Y = R.Y = new T3.Group(); Y.position.set(...YD); scene.add(Y); add(Y, Cy(20, 20, 0.2, 40), SM('#7ac85a'), 0, -0.1, 0); for (let i = 0; i < 8; i++) add(Y, Bx(0.12, 1.1, 0.12), SM('#f4f0e8'), -3 + i * 0.85, 0.55, -3); add(Y, Bx(6.4, 0.1, 0.06), SM('#f4f0e8'), 0.0, 0.9, -3);
  R.rocket = new T3.Group(); Y.add(R.rocket); add(R.rocket, Cy(0.22, 0.22, 1.3, 16), SM('#f4f4f6'), 0, 0.85, 0); add(R.rocket, new T3.ConeGeometry(0.22, 0.45, 16), SM('#e8453a'), 0, 1.72, 0); for (let i = 0; i < 3; i++) { const f = add(R.rocket, Bx(0.04, 0.35, 0.3), SM('#e8453a'), S(i * 2.1) * 0.22, 0.32, C(i * 2.1) * 0.22); f.rotation.y = i * 2.1; } add(R.rocket, Cy(0.1, 0.1, 0.03, 16), SM('#4a8ad8'), 0, 1.1, 0.22).rotation.x = PI / 2;
  R.rSlice = sliceG(false); R.rSlice.scale.setScalar(0.8); R.rSlice.position.set(0, 1.3, 0.24); R.rSlice.rotation.set(PI / 2, 0, PI); R.rocket.add(R.rSlice);
  R.flame = spr(R.rocket, GLOW, '#ffa030', 1.2, 0, 0.0, 0, 0); R.smoke = []; for (let i = 0; i < 14; i++) R.smoke.push(spr(Y, GLOW, '#d8d8d8', 1, 0, 0, 0, 0, T3.NormalBlending));
  // ---- the moon ----
  const M = R.M = new T3.Group(); M.position.set(...MO); scene.add(M); const mt = ctex(256, 256, (c, w, h) => { c.fillStyle = '#b8b8b4'; c.fillRect(0, 0, w, h); const r = rng(3); for (let i = 0; i < 80; i++) { c.fillStyle = `rgba(90,90,88,${0.2 + r() * 0.3})`; c.beginPath(); c.arc(r() * w, r() * h, 3 + r() * 16, 0, 7); c.fill(); } }); mt.wrapS = mt.wrapT = T3.RepeatWrapping; mt.repeat.set(6, 6);
  add(M, Sp(60, 64, 32), SM('#ffffff', { map: mt }), 0, -60, 0).rotation.x = PI / 2; add(M, Sp(80, 24, 12), new T3.MeshBasicMaterial({ color: '#05060e', side: T3.BackSide }), 0, 0, 0, false); for (let i = 0; i < 90; i++) { const a = i * 2.39, b = (i * 0.618) % 1 * 1.4 + 0.1; spr(M, GLOW, '#ffffff', 0.5, S(a) * 70 * C(b), S(b) * 70, C(a) * 70 * C(b), 0.8); }
  R.earth = add(M, Sp(4, 32, 16), SM('#2a7ad8', { emissive: '#1a4a9a', emissiveIntensity: 0.5 }), -10, 14, -40, false); add(M, Sp(4.05, 32, 16), new T3.MeshBasicMaterial({ color: '#5ac85a', transparent: true, opacity: 0.5 }), -10.5, 14.5, -39.6, false);
  R.chair = new T3.Group(); R.chair.position.set(1.0, 0, 0.2); M.add(R.chair); add(R.chair, Bx(0.6, 0.06, 0.6), SM('#e8453a'), 0, 0.42, 0); add(R.chair, Bx(0.6, 0.6, 0.06), SM('#e8453a'), 0, 0.72, -0.3).rotation.x = -0.3; for (const [x, z] of [[-0.28, 0.25], [0.28, 0.25], [-0.28, -0.25], [0.28, -0.25]]) add(R.chair, Cy(0.02, 0.02, 0.42, 6), SM('#c8ccd2'), x, 0.21, z);
  R.flag = new T3.Group(); R.flag.position.set(2.2, 0, -1.2); M.add(R.flag); add(R.flag, Cy(0.03, 0.03, 2, 6), SM('#c8ccd2'), 0, 1, 0); add(R.flag, new T3.PlaneGeometry(0.9, 0.5), BM('#ffffff', { map: ctex(180, 100, (c) => { c.fillStyle = '#2aa84a'; c.fillRect(0, 0, 180, 100); c.fillStyle = '#fff'; c.font = '44px Russo'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('BRO', 90, 54); }), side: T3.DoubleSide }), 0.47, 1.72, 0, false);
  R.mSlice = sliceG(false); M.add(R.mSlice); R.dust = []; for (let i = 0; i < 16; i++) R.dust.push(spr(M, GLOW, '#c8c8c4', 0.4, 0, 0, 0, 0, T3.NormalBlending)); const ml = new T3.DirectionalLight('#ffffff', 2.2); ml.position.set(MO[0] + 6, 10, 8); ml.target.position.set(...MO); scene.add(ml); scene.add(ml.target);
}
