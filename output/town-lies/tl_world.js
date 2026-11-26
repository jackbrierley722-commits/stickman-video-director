
// ---------- timing ----------
const E = { c: i => CL[i].start, vase: AT(3, 'then'), asked: AT(3, 'she'), cat: AT(3, 'i', 1), shrank: AT(4, 'i'), q1: AT(5, 'homework'), q2: AT(5, 'teeth'), q3: AT(5, 'room'), lie1: AT(8, "we're"), lie2: AT(8, "i'm"), lie3: AT(8, 'i'), proud: AT(9, 'then'), grew: AT(9, 'and') };
for (let i = 0; i < CL.length; i++) E['c' + i] = CL[i].start; E.loop = TM.total - 0.4;
const TOWN = [0, 0, 0], HOME = [80, 0, 0], FB = [160, 0, 0];
function build() {
  R.sun = new T3.DirectionalLight('#fff4e4', 2.4); R.sun.castShadow = true; R.sun.shadow.mapSize.set(2048, 2048); const sc = R.sun.shadow.camera; sc.left = sc.bottom = -14; sc.right = sc.top = 14; sc.near = 1; sc.far = 60; R.sun.shadow.bias = -0.0005; scene.add(R.sun); scene.add(R.sun.target);
  R.hemi = new T3.HemisphereLight('#d8ecff', '#7a8a5a', 1.3); scene.add(R.hemi);
  const sky = ctex(16, 512, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#5aa8f0'); g.addColorStop(0.55, '#bfe2fa'); g.addColorStop(1, '#e8f4e0'); c.fillStyle = g; c.fillRect(0, 0, w, h); }); R.sky = add(scene, Sp(900, 32, 16), new T3.MeshBasicMaterial({ map: sky, side: T3.BackSide, toneMapped: false }), 0, 0, 0, false); R.sky.castShadow = false;
  // ---- town ----
  const T = R.T = new T3.Group(); T.position.set(...TOWN); scene.add(T); const gt = studTex('#5ab84a'); gt.repeat.set(60, 60); add(T, Bx(120, 0.2, 120), PL('#ffffff').clone(), 0, -0.1, 0, false).material.map = gt;
  add(T, Bx(8, 0.22, 120), PL('#5a5a62', 0.7), 0, -0.08, 0, false); for (let z = -50; z < 50; z += 4) add(T, Bx(0.2, 0.23, 2), PL('#f0f0e8'), 0, -0.07, z, false);
  const hc = ['#e85a4a', '#4a8ad8', '#f0c040', '#9a5ad8', '#4ab88a', '#e89a4a']; for (let i = 0; i < 8; i++) { const sx = i % 2 ? 1 : -1, z = -28 + Math.floor(i / 2) * 9; const h = new T3.Group(); h.position.set(sx * 10, 0, z); T.add(h); add(h, Bx(6, 4, 6), PL('#f4ecd8'), 0, 2, 0); const rf = add(h, Cy(0.01, 5, 2.4, 4), PL(hc[i % 6]), 0, 5.2, 0); rf.rotation.y = PI / 4; add(h, Bx(1.1, 2, 0.1), PL('#7a4a2a'), 0, 1, sx < 0 ? 3.02 : -3.02).position.x = 0; add(h, Bx(1.2, 1.0, 0.1), PL('#8ac8f0', 0.1), -1.8, 2.5, sx < 0 ? 3.02 : -3.02); add(h, Bx(1.2, 1.0, 0.1), PL('#8ac8f0', 0.1), 1.8, 2.5, sx < 0 ? 3.02 : -3.02); h.rotation.y = sx < 0 ? PI / 2 : PI / 2; }
  for (let i = 0; i < 10; i++) { const x = (i % 2 ? 1 : -1) * 5.5, z = -40 + i * 8; add(T, Cy(0.2, 0.25, 1.4, 8), PL('#7a5a3a'), x, 0.7, z); add(T, Sp(1.0, 10, 8), PL('#3a9a3a'), x, 2.1, z).scale.y = 1.1; }
  // stage with a tiny mayor
  const st = new T3.Group(); st.position.set(0, 0, -14); T.add(st); add(st, Bx(4, 0.6, 2.4), PL('#c8a070'), 0, 0.3, 0); add(st, Bx(4.4, 0.8, 0.05), new T3.MeshBasicMaterial({ map: ctex(256, 48, (c) => { c.fillStyle = '#d83a3a'; c.fillRect(0, 0, 256, 48); c.fillStyle = '#fff'; c.font = '30px Russo'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('VOTE FOR ME', 128, 26); }) }), 0, 2.6, -1.1, false); for (const x of [-2, 2]) add(st, Cy(0.05, 0.05, 2.4, 8), PL('#555'), x, 1.6, -1.1);
  add(st, Bx(0.5, 0.9, 0.4), PL('#6a4a30'), 0, 1.05, 0.5); R.mayor = rbx({ shirt: '#2a2a3a', pants: '#1a1a22', hair: '#888', sleeve: true }); R.mayor.scale.setScalar(0.28); R.mayor.position.set(0, 1.5, 0.5); st.add(R.mayor);
  R.crowd = []; const cs = [['#e85a4a', '#2a3a6a', 1.0], ['#f0c040', '#3a3a3a', 0.55], ['#4ab88a', '#5a3a2a', 0.9], ['#9a5ad8', '#2a2a3a', 0.35], ['#4a8ad8', '#4a4a52', 1.05], ['#e89a4a', '#2a3a2a', 0.7], ['#d84a8a', '#3a3a5a', 0.95], ['#5ac8e8', '#2a2a2a', 0.45]];
  cs.forEach(([s_, p_, sc_], i) => { const p = rbx({ shirt: s_, pants: p_, hair: ['#3a2416', '#e8c870', '#141010', '#c84a1a'][i % 4], hairStyle: i % 3 === 0 ? 'long' : i % 3 === 1 ? 'cap' : 'short' }); p.scale.setScalar(sc_); p.userData.mv = { x: (i % 2 ? 1 : -1) * (1.4 + (i % 3) * 0.9), z0: -30 + i * 7, sp: (i % 2 ? 1 : -1) * (1.1 + (i % 4) * 0.2) }; T.add(p); R.crowd.push(p); });
  // ---- home: exterior + living/dining room ----
  const H = R.H = new T3.Group(); H.position.set(...HOME); scene.add(H); const gt2 = studTex('#5ab84a'); gt2.repeat.set(30, 30); add(H, Bx(60, 0.2, 60), PL('#ffffff'), 0, -0.1, 8, false).material.map = gt2;
  const fl = studTex('#c8965a'); fl.repeat.set(8, 6); add(H, Bx(10, 0.21, 8), PL('#ffffff'), 0, -0.095, 0, false).material.map = fl;
  add(H, Bx(10, 4, 0.2), PL('#f0e6d0'), 0, 2, -4); add(H, Bx(0.2, 4, 8), PL('#e8dcc4'), -5, 2, 0); add(H, Bx(0.2, 4, 8), PL('#e8dcc4'), 5, 2, 0);
  add(H, Bx(10, 0.6, 0.25), PL('#e85a4a'), 0, 4.3, 4.1); add(H, Bx(4.4, 4, 0.2), PL('#f4ecd8'), -2.8, 2, 4.0); add(H, Bx(4.4, 4, 0.2), PL('#f4ecd8'), 2.8, 2, 4.0); add(H, Bx(1.2, 1.9, 0.05), PL('#7a4a2a'), 0, 0.95, 4.12).visible = true;
  R.frontWall = H.children.slice(-4);
  add(H, Bx(1.6, 1.0, 0.1), PL('#8ac8f0', 0.1), -2.6, 2.4, 4.12); add(H, Bx(1.6, 1.0, 0.1), PL('#8ac8f0', 0.1), 2.6, 2.4, 4.12); add(H, Bx(0.12, 0.12, 0.08), PL('#c8a040'), 0.4, 0.95, 4.18);
  R.stool = add(H, Bx(0.5, 0.35, 0.5), PL('#a87a4a'), 0.75, 0.18, 4.7);
  // living room furniture: sofa, side table with vase, dining table, shoe rack
  add(H, Bx(2.6, 0.5, 0.9), PL('#4a6aa8'), -2.8, 0.25, -3.1); add(H, Bx(2.6, 0.8, 0.25), PL('#4a6aa8'), -2.8, 0.65, -3.5);
  add(H, Bx(0.8, 0.8, 0.8), PL('#8a5a3a'), 1.8, 0.4, -3.2); R.vase = new T3.Group(); R.vase.position.set(1.8, 0.8, -3.2); H.add(R.vase); add(R.vase, Cy(0.12, 0.18, 0.5, 12), PL('#4a8ad8', 0.2), 0, 0.25, 0); add(R.vase, Cy(0.08, 0.12, 0.12, 12), PL('#4a8ad8', 0.2), 0, 0.56, 0); add(R.vase, Sp(0.08, 8, 6), PL('#e85a8a'), 0, 0.7, 0);
  R.shards = []; for (let i = 0; i < 10; i++) { const s = add(H, Bx(0.12, 0.04, 0.1), PL('#4a8ad8', 0.2), 0, -5, 0); s.userData.a = i * 0.63; R.shards.push(s); }
  add(H, Bx(2.4, 0.1, 1.3), PL('#a8784a'), 2.5, 0.8, -0.6); for (const [x, z] of [[1.4, -1.1], [3.6, -1.1], [1.4, -0.1], [3.6, -0.1]]) add(H, Bx(0.1, 0.8, 0.1), PL('#7a5030'), x, 0.4, z);
  for (const [x, z] of [[1.6, -0.6], [2.5, -1.5], [3.4, -0.6]]) add(H, Bx(0.18, 0.04, 0.18), PL('#ffffff'), x, 0.87, z);
  R.shoe = new T3.Group(); R.shoe.position.set(0.6, 0, 0.6); H.add(R.shoe); add(R.shoe, Bx(0.32, 0.14, 0.62), PL('#e8453a'), 0, 0.07, 0); add(R.shoe, Bx(0.32, 0.22, 0.3), PL('#e8453a'), 0, 0.18, -0.16); add(R.shoe, Bx(0.33, 0.04, 0.63), PL('#f4f4f4'), 0, 0.02, 0); add(R.shoe, Bx(0.2, 0.02, 0.32), PL('#5a1a1a'), 0, 0.15, 0.08);
  // ---- family ----
  R.leo = rbx({ shirt: '#4a8ad8', pants: '#2a3a5a', hair: '#5a3a1a', logo: ctex(64, 52, (c) => { c.fillStyle = '#ffd23a'; c.font = '40px Russo'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('L', 32, 28); }) }); scene.add(R.leo);
  R.dad = rbx({ shirt: '#3a8a5a', pants: '#3a3a42', hair: '#2a1a10', sleeve: true }); scene.add(R.dad); R.mum = rbx({ shirt: '#d84a8a', pants: '#3a3a5a', hair: '#8a4a1a', hairStyle: 'long' }); scene.add(R.mum);
  R.cat = cat(); H.add(R.cat);
  R.sparks = []; for (let i = 0; i < 10; i++) R.sparks.push(spr(scene, GLOW, '#9aff8a', 0.25, 0, -9, 0, 0));
  // ---- flashback stage (sepia, plain backdrop) ----
  const F = R.F = new T3.Group(); F.position.set(...FB); scene.add(F); add(F, Bx(20, 0.2, 20), PL('#c8b08a'), 0, -0.1, 0, false); add(F, Bx(20, 10, 0.2), PL('#d8c4a0'), 0, 5, -3, false);
  add(F, Bx(1.6, 0.08, 1.0), PL('#a8784a'), 1.3, 0.8, -1.2); for (const [x, z] of [[0.6, -1.6], [2.0, -1.6], [0.6, -0.8], [2.0, -0.8]]) add(F, Bx(0.08, 0.8, 0.08), PL('#7a5030'), x, 0.4, z); for (let i = 0; i < 4; i++) add(F, Bx(0.3, 0.01, 0.22), PL('#f4f0e8'), 0.9 + i * 0.28, 0.85, -1.2).rotation.y = i * 0.3;
}
