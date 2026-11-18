
// ===================== ROUND-HEAD LOW-POLY CHARACTERS (flat-shaded, dot eyes, bar brows) =====================
const FS = (c) => new T3.MeshStandardMaterial({ color: c, roughness: 0.82, flatShading: true });
const INKM = new T3.MeshBasicMaterial({ color: '#141414' });
function onHead(head, R0, x, y, mesh) { const z = Math.sqrt(Math.max(0, R0 * R0 - x * x - y * y)) + 0.004; mesh.position.set(x, y, z); mesh.lookAt(x * 3, y * 3, z * 3 + 0.0001); head.add(mesh); return mesh; }
function person(o) { const g = new T3.Group(); const skin = FS('#ffffff'), top = FS(o.top), bot = FS(o.bot), shoe = FS('#2a2622'), hairM = FS(o.cap || o.hair);
  const up = new T3.Group(); up.position.y = 0.92; g.add(up); const tor = boxM(up, 0.44, 0.52, 0.26, top, 0, 0.27, 0); boxM(up, 0.4, 0.06, 0.24, top, 0, 0.53, 0);
  if (o.open) boxM(up, 0.12, 0.44, 0.01, FS(o.open), 0, 0.3, 0.131, false); if (o.tie) boxM(up, 0.05, 0.36, 0.012, FS(o.tie), 0, 0.3, 0.138, false);
  add(up, Cy(0.06, 0.07, 0.12, 8), skin, 0, 0.6, 0);
  const R0 = 0.27, head = new T3.Group(); head.position.set(0, 0.86, 0); up.add(head); add(head, new T3.SphereGeometry(R0, 12, 9), skin, 0, 0, 0);
  // hair styles
  if (o.cap) { add(head, new T3.SphereGeometry(R0 + 0.012, 12, 6, 0, PI * 2, 0, PI * 0.42), hairM, 0, 0, 0); const br = add(head, Bx(0.28, 0.025, 0.2), hairM, 0, 0.12, o.capBack ? -0.3 : 0.3); }
  else if (o.beanie) { add(head, new T3.SphereGeometry(R0 + 0.015, 12, 6, 0, PI * 2, 0, PI * 0.45), FS(o.beanie), 0, 0, 0); }
  else if (o.hair) { // messy hair: a clump of jagged low-poly tufts over the crown
    const r = rng((o.hair.charCodeAt(1) * 31 + o.top.charCodeAt(2) * 7) | 0); for (let i = 0; i < 22; i++) { const a = r() * PI * 2, el = 0.6 + r() * 0.9; const n = new T3.Vector3(Math.cos(a) * Math.cos(el), Math.sin(el), Math.sin(a) * Math.cos(el) - 0.25).normalize(); if (n.z > 0.55 && n.y < 0.75) continue;
      const tuft = add(head, new T3.ConeGeometry(0.07 + r() * 0.03, 0.09 + r() * 0.06, 4), hairM, n.x * (R0 - 0.01), n.y * (R0 - 0.01), n.z * (R0 - 0.01)); tuft.quaternion.setFromUnitVectors(new T3.Vector3(0, 1, 0), n); tuft.rotateX((r() - 0.5) * 0.7); tuft.rotateZ((r() - 0.5) * 0.7); }
    add(head, new T3.SphereGeometry(R0 + 0.012, 12, 6, 0, PI * 2, 0, PI * 0.4), hairM, 0, 0, -0.01).rotation.x = -0.35; }
  if (o.phones) { const hp = FS(o.phones); add(head, new T3.TorusGeometry(R0 + 0.03, 0.018, 6, 16, PI), hp, 0, 0.0, 0).rotation.z = 0; for (const sx of [-1, 1]) add(head, Cy(0.07, 0.07, 0.05, 10), hp, sx * (R0 + 0.02), 0, 0).rotation.z = PI / 2; }
  if (o.chain) add(up, new T3.TorusGeometry(0.11, 0.015, 6, 16), FS('#e8c040'), 0, 0.5, 0.06).rotation.x = 1.3;
  // face: dot eyes, bar brows, line mouth (+ open mouth for shouting)
  const F = { eyes: [], pup: [], brows: [], mouth: null, open: null }; for (const sx of [-1, 1]) { const e = onHead(head, R0, sx * 0.085, 0.02, new T3.Mesh(new T3.CircleGeometry(0.03, 14), INKM)); e.scale.y = 1.25; F.eyes.push(e); const b = onHead(head, R0, sx * 0.09, 0.12, new T3.Mesh(Bx(0.1, 0.018, 0.01), INKM)); b.userData.sx = sx; F.brows.push(b); }
  F.mouth = onHead(head, R0, 0.0, -0.1, new T3.Mesh(Bx(0.1, 0.016, 0.01), INKM)); F.open = onHead(head, R0, 0.0, -0.11, new T3.Mesh(new T3.CircleGeometry(0.05, 14), new T3.MeshBasicMaterial({ color: '#3a1010' }))); F.open.scale.set(1.1, 0.8, 1); F.open.visible = false;
  if (o.glasses) { for (const sx of [-1, 1]) onHead(head, R0, sx * 0.085, 0.02, new T3.Mesh(new T3.TorusGeometry(0.055, 0.008, 6, 18), INKM)); onHead(head, R0, 0, 0.03, new T3.Mesh(Bx(0.06, 0.01, 0.01), INKM)); }
  if (o.build) up.scale.set(o.build, 1, o.build);
  const arm = (sx) => { const s = new T3.Group(); s.position.set(sx * 0.26, 0.48, 0); up.add(s); boxM(s, 0.15, 0.2, 0.17, top, 0, -0.07, 0); boxM(s, 0.1, 0.22, 0.11, skin, 0, -0.26, 0); const e = new T3.Group(); e.position.y = -0.36; s.add(e); boxM(e, 0.095, 0.26, 0.1, skin, 0, -0.12, 0); boxM(e, 0.1, 0.09, 0.1, skin, 0, -0.29, 0); s.userData.e = e; return s; };
  const leg = (sx) => { const h = new T3.Group(); h.position.set(sx * 0.11, 0.92, 0); g.add(h); boxM(h, 0.17, 0.46, 0.2, bot, 0, -0.23, 0); const k = new T3.Group(); k.position.y = -0.46; h.add(k); boxM(k, 0.16, 0.4, 0.19, bot, 0, -0.2, 0); boxM(k, 0.17, 0.08, 0.27, shoe, 0, -0.42, 0.04); h.userData.k = k; return h; };
  g.userData = { up, head, armL: arm(-1), armR: arm(1), legL: leg(-1), legR: leg(1), F }; return g; }
function faceP(p, ex) { const F = p.userData.F; const br = F.brows; F.open.visible = ex === 'o'; F.mouth.visible = ex !== 'o'; F.mouth.scale.set(1, 1, 1); F.eyes.forEach(e => { e.scale.set(1, ex === 'd' ? 0.7 : 1.25, 1); });
  br.forEach(b => { b.rotation.z = 0; b.position.y = b.userData.y0 === undefined ? (b.userData.y0 = b.position.y) : b.userData.y0; });
  if (ex === 'a' || ex === 'o') br.forEach(b => b.rotation.z = b.userData.sx * 0.35);
  if (ex === 's' || ex === 'S') { br.forEach(b => { if (b.userData.sx === (ex === 's' ? 1 : -1)) b.position.y = b.userData.y0 + 0.03; }); F.mouth.scale.set(0.7, 1, 1); }
  if (ex === 'd') br.forEach(b => b.position.y = b.userData.y0 - 0.015); }
function seatP(p, y) { stillP(p); const u = p.userData; u.legL.rotation.x = u.legR.rotation.x = -PI / 2; u.legL.userData.k.rotation.x = u.legR.userData.k.rotation.x = PI / 2; p.position.y = y - 0.92 + 0.06; }
