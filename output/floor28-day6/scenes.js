// 28th Floor Day 5 — the chain, the roof, the helicopter. Retro low-poly 3D apartment (bedroom/kitchen/bathroom), survival log + diagrams.
(() => {
const { T3, RW, RH, W, H, clamp, lerp, ease, prog, rng, makeTextures, TX, mat, box, cyl, sph, person, run, idle, kick, ground, crowdStand } = window.W3;
const TM = window.TIMING, CL = TM.clips;
const S = Math.sin, C = Math.cos;
function wt(ci, word, n = 0) { let k = 0; for (const w of CL[ci].words) if (w.w.toLowerCase().replace(/[^a-z0-9']/g, '') === word) { if (k === n) return w.a - CL[ci].start; k++; } return 0; }
const AT = (ci, w, n = 0) => CL[ci].start + wt(ci, w, n);

// ---------- pixel textures ----------
function ctex(w, h, draw, rep = [1, 1]) { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); draw(g, w, h); const t = new T3.CanvasTexture(c); t.magFilter = t.minFilter = T3.NearestFilter; t.generateMipmaps = false; t.wrapS = t.wrapT = T3.RepeatWrapping; t.repeat.set(rep[0], rep[1]); t.colorSpace = T3.SRGBColorSpace; t.userData = { c, g }; return t; }
function noise(g, w, h, base, v, seed) { const r = rng(seed); for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const k = (r() - 0.5) * v; g.fillStyle = `rgb(${base[0] + k},${base[1] + k},${base[2] + k})`; g.fillRect(x, y, 1, 1); } }
const TT = {};
function makeTex() {
  TT.planks = rep => ctex(32, 32, (g) => { noise(g, 32, 32, [118, 74, 44], 18, 1); g.fillStyle = '#4a2c1a'; for (let y = 0; y < 32; y += 6) { g.fillRect(0, y, 32, 1); g.fillRect((y * 7) % 32, y, 1, 6); } }, rep);
  TT.checker = rep => ctex(16, 16, (g) => { const r = rng(2); for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) { const dark = ((x >> 3) + (y >> 3)) % 2; const k = (r() - 0.5) * 12; const b = dark ? [70, 62, 58] : [196, 184, 166]; g.fillStyle = `rgb(${b[0] + k},${b[1] + k},${b[2] + k})`; g.fillRect(x, y, 1, 1); } }, rep);
  TT.plaid = rep => ctex(16, 16, (g) => { g.fillStyle = '#252a48'; g.fillRect(0, 0, 16, 16); g.fillStyle = 'rgba(120,130,190,0.35)'; g.fillRect(0, 4, 16, 3); g.fillRect(4, 0, 3, 16); g.fillStyle = 'rgba(10,10,25,0.4)'; g.fillRect(0, 11, 16, 2); g.fillRect(11, 0, 2, 16); }, rep);
  TT.plaster = rep => ctex(32, 32, (g) => noise(g, 32, 32, [214, 200, 176], 14, 3), rep);
  TT.ceil = rep => ctex(32, 32, (g) => noise(g, 32, 32, [150, 138, 124], 22, 4), rep);
  TT.tile = rep => ctex(16, 16, (g) => { noise(g, 16, 16, [170, 164, 152], 10, 5); g.fillStyle = '#8a8478'; g.fillRect(0, 0, 16, 1); g.fillRect(0, 0, 1, 16); }, rep);
  TT.rug = rep => ctex(32, 24, (g) => { noise(g, 32, 24, [62, 62, 86], 14, 6); g.strokeStyle = '#2a2a40'; g.lineWidth = 2; g.strokeRect(2, 2, 28, 20); }, rep);
  TT.books = rep => ctex(32, 16, (g) => { const r = rng(7); let x = 0; while (x < 32) { const w = 2 + (r() * 3 | 0); g.fillStyle = ['#5a3a5a', '#3a4a7a', '#7a3a3a', '#d8d0c0', '#3a5a4a', '#8a7a4a'][r() * 6 | 0]; g.fillRect(x, 2 + (r() * 3 | 0), w, 14); x += w + 1; } }, rep);
  TT.posterCity = () => ctex(16, 24, (g) => { g.fillStyle = '#1a1a1e'; g.fillRect(0, 0, 16, 24); const gr = g.createLinearGradient(0, 0, 16, 24); gr.addColorStop(0, '#d8d4cc'); gr.addColorStop(1, '#3a3a3e'); g.fillStyle = gr; g.fillRect(1, 1, 14, 22); g.fillStyle = '#121214'; g.fillRect(3, 10, 2, 12); g.fillRect(6, 6, 2, 16); g.fillRect(6, 3, 1, 3); g.fillRect(9, 13, 3, 9); g.fillRect(1, 18, 14, 5); });
  TT.posterBall = () => ctex(16, 20, (g) => { g.fillStyle = '#26262a'; g.fillRect(0, 0, 16, 20); g.fillStyle = '#e8e4dc'; g.beginPath(); g.arc(8, 10, 6, 0, 7); g.fill(); g.fillStyle = '#1a1a1a'; g.fillRect(7, 9, 3, 3); g.fillRect(4, 6, 2, 2); g.fillRect(11, 6, 2, 2); g.fillRect(4, 13, 2, 2); g.fillRect(11, 13, 2, 2); });
  TT.magnet = () => ctex(8, 8, (g) => { g.fillStyle = '#e8e4dc'; g.fillRect(0, 0, 8, 8); ['#7a7aaa', '#8aa07a', '#d8c88a'].forEach((c, i) => { g.fillStyle = c; g.fillRect(1 + i * 2, 1 + i * 2, 2, 2); }); });
  // dynamic: rain window, TV
  TT.rain = ctex(48, 64, () => {}); TT.tv = ctex(32, 24, () => {});
}
const DROPS = (() => { const r = rng(11); return Array.from({ length: 70 }, () => [r() * 48, r() * 64, 0.6 + r() * 0.8]); })();
function drawRain(t, flash, city) {
  const { g } = TT.rain.userData; const gr = g.createLinearGradient(0, 0, 0, 64); gr.addColorStop(0, flash ? '#9aa8d0' : '#141a30'); gr.addColorStop(1, flash ? '#6a78a0' : '#2a3048'); g.fillStyle = gr; g.fillRect(0, 0, 48, 64);
  // far city lights
  if (city > 0) { const r = rng(4); for (let i = 0; i < 40; i++) { const x = r() * 48 | 0, y = 26 + r() * 20 | 0; g.fillStyle = `rgba(240,190,90,${city * (0.4 + 0.6 * r())})`; g.fillRect(x, y, 1, 1); } }
  // rooftops & chimneys silhouette
  g.fillStyle = flash ? '#2a2e40' : '#0c0e18'; g.beginPath(); g.moveTo(0, 64); g.lineTo(0, 46); g.lineTo(8, 40); g.lineTo(16, 46); g.lineTo(16, 42); g.lineTo(26, 34); g.lineTo(36, 42); g.lineTo(40, 40); g.lineTo(48, 44); g.lineTo(48, 64); g.closePath(); g.fill(); g.fillRect(20, 30, 3, 6); g.fillRect(38, 34, 2, 6);
  g.fillStyle = 'rgba(190,200,230,0.5)'; for (const [x, y, sp] of DROPS) { const yy = (y + t * 60 * sp) % 64; g.fillRect(x | 0, yy | 0, 1, 3); }
  TT.rain.needsUpdate = true;
}
function drawTV(t, mode) { const { g } = TT.tv.userData; const r = rng((t * 30) | 0);
  if (mode === 'off') { g.fillStyle = '#060708'; g.fillRect(0, 0, 32, 24); }
  else if (mode === 'alert') { const on = S(t * 6) > 0; g.fillStyle = on ? '#b81818' : '#4a0808'; g.fillRect(0, 0, 32, 24); g.fillStyle = '#fff'; g.fillRect(4, 5, 24, 3); g.fillRect(6, 11, 20, 2); g.fillRect(6, 15, 16, 2); g.fillStyle = '#ffd23a'; g.beginPath(); g.moveTo(16, 18); g.lineTo(13, 23); g.lineTo(19, 23); g.fill(); for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(255,255,255,${r() * 0.3})`; g.fillRect(r() * 32 | 0, r() * 24 | 0, 1, 1); } }
  else { for (let y = 0; y < 24; y++) for (let x = 0; x < 32; x++) { const k = r() * 200 | 0; g.fillStyle = `rgb(${k},${k},${k + 20})`; g.fillRect(x, y, 1, 1); } }
  TT.tv.needsUpdate = true; }

// ---------- build helpers ----------
let renderer, camera, scene;
const ROOMS = {};
function M(c, map, opts = {}) { return new T3.MeshLambertMaterial(Object.assign({ color: c || '#ffffff', map, flatShading: true }, opts)); }
function B(w, h, d, m, x, y, z, parent) { const o = new T3.Mesh(new T3.BoxGeometry(w, h, d), typeof m === 'string' ? M(m) : m); o.position.set(x, y, z); if (parent) parent.add(o); return o; }
function plane(w, h, m, parent) { const o = new T3.Mesh(new T3.PlaneGeometry(w, h), m); if (parent) parent.add(o); return o; }
function room(x0, floorTex, wallTex) {
  const g = new T3.Group(); g.position.x = x0; scene.add(g);
  const fl = plane(6, 6, M('#ffffff', floorTex), g); fl.rotation.x = -Math.PI / 2;
  const ce = plane(6, 6, M('#ffffff', TT.ceil([3, 3])), g); ce.rotation.x = Math.PI / 2; ce.position.y = 3;
  const wm = M('#ffffff', wallTex);
  const bw = plane(6, 3, wm, g); bw.position.set(0, 1.5, -3);
  const lw = plane(6, 3, wm, g); lw.rotation.y = Math.PI / 2; lw.position.set(-3, 1.5, 0);
  const rw = plane(6, 3, wm, g); rw.rotation.y = -Math.PI / 2; rw.position.set(3, 1.5, 0);
  const trim = '#3a2416';
  for (const [w, d, x, z] of [[6, 0.12, 0, -2.94], [0.12, 6, -2.94, 0], [0.12, 6, 2.94, 0]]) { B(w, 0.14, d, trim, x, 2.92, z, g); B(w, 0.16, d, trim, x, 0.08, z, g); }
  return g;
}
function pendant(g, x, z, lit = 1) { const shade = new T3.Mesh(new T3.CylinderGeometry(0.22, 0.42, 0.34, 4, 1, true), M('#d8d0c0', null, { side: T3.DoubleSide })); shade.rotation.y = Math.PI / 4; shade.position.set(x, 2.55, z); g.add(shade); B(0.06, 0.3, 0.06, '#1a1410', x, 2.85, z, g);
  const bulb = plane(0.56, 0.56, new T3.MeshBasicMaterial({ color: '#ffe0a0' }), g); bulb.rotation.x = Math.PI / 2; bulb.rotation.z = Math.PI / 4; bulb.position.set(x, 2.385, z);
  const pl = new T3.PointLight('#ffc070', 2.2 * lit, 10, 1.2); pl.position.set(x, 2.25, z); g.add(pl); return { pl, bulb }; }
function windowAt(g, x, y, z, w, h, rotY = 0) { const wg = new T3.Group(); wg.position.set(x, y, z); wg.rotation.y = rotY; g.add(wg);
  const pane = plane(w, h, new T3.MeshBasicMaterial({ map: TT.rain }), wg); pane.position.z = 0.01;
  const fr = '#3a2416'; B(w + 0.14, 0.1, 0.08, fr, 0, h / 2, 0.03, wg); B(w + 0.14, 0.12, 0.12, fr, 0, -h / 2, 0.05, wg); B(0.08, h, 0.08, fr, -w / 2, 0, 0.03, wg); B(0.08, h, 0.08, fr, w / 2, 0, 0.03, wg); B(0.05, h, 0.05, fr, 0, 0, 0.04, wg); B(w, 0.05, 0.05, fr, 0, 0.05, 0.04, wg);
  B(w + 0.9, 0.06, 0.06, fr, 0, h / 2 + 0.18, 0.12, wg);
  for (const sx of [-1, 1]) B(0.36, h + 0.35, 0.05, M('#ffffff', TT.plaid([2, 4])), sx * (w / 2 + 0.2), -0.05, 0.1, wg);
  return wg; }

// ---------- the flat ----------
function buildFlat() {
  // BEDROOM at x=-40
  const bed = room(-40, TT.planks([3, 3]), TT.plaster([2, 1]));
  const bl = pendant(bed, 0, 0);
  windowAt(bed, -0.6, 1.75, -2.98, 1.5, 1.2);
  B(1.0, 1.4, 0.03, M('#fff', TT.posterCity()), -2.2, 1.7, -2.97, bed); const pb = B(0.03, 0.9, 0.7, M('#fff', TT.posterBall()), 2.97, 1.75, -1.6, bed);
  // bed: frame, mattress, plaid blanket, pillow
  B(1.2, 0.32, 2.4, '#5a3a22', -2.3, 0.3, 0.6, bed); B(1.1, 0.2, 2.3, M('#fff', TT.plaid([2, 4])), -2.3, 0.55, 0.65, bed); B(0.7, 0.14, 0.4, '#d0ccc4', -2.3, 0.72, -0.35, bed); B(1.2, 0.9, 0.1, '#5a3a22', -2.3, 0.6, -0.6, bed); B(1.2, 0.6, 0.1, '#5a3a22', -2.3, 0.45, 1.8, bed);
  B(1.8, 0.04, 1.3, M('#fff', TT.rug([1, 1])), -0.2, 0.02, 0.9, bed);
  // desk with CRT + lamp + chair
  B(1.3, 0.08, 0.6, '#6a4528', 1.6, 0.78, -2.55, bed); B(0.45, 0.74, 0.55, '#5a3a22', 2.05, 0.37, -2.55, bed); B(0.06, 0.74, 0.5, '#4a2c18', 1.0, 0.37, -2.55, bed);
  B(0.55, 0.45, 0.45, '#2a2a2c', 1.35, 1.05, -2.6, bed); const tvs = plane(0.42, 0.32, new T3.MeshBasicMaterial({ map: TT.tv }), bed); tvs.position.set(1.35, 1.07, -2.37);
  B(0.04, 0.3, 0.04, '#1a1a1a', 1.9, 0.97, -2.6, bed); const lampH = new T3.Mesh(new T3.ConeGeometry(0.12, 0.16, 6, 1, true), M('#2a2a2a', null, { side: T3.DoubleSide })); lampH.position.set(1.95, 1.14, -2.5); lampH.rotation.z = 0.5; bed.add(lampH);
  const deskL = new T3.PointLight('#ffb050', 1.0, 3, 1.5); deskL.position.set(1.95, 1.0, -2.45); bed.add(deskL);
  B(0.45, 0.06, 0.45, '#3a2a1e', 1.4, 0.48, -1.95, bed); B(0.45, 0.6, 0.06, '#3a2a1e', 1.4, 0.8, -1.72, bed); for (const [dx, dz] of [[-0.2, -0.2], [0.2, -0.2], [-0.2, 0.2], [0.2, 0.2]]) B(0.05, 0.48, 0.05, '#2a1a10', 1.4 + dx, 0.24, -1.95 + dz, bed);
  // bookshelf on right wall
  const shelf = new T3.Group(); shelf.position.set(2.75, 0, -0.2); bed.add(shelf); B(0.45, 2.2, 1.1, '#5a3a22', 0, 1.1, 0, shelf); for (let i = 0; i < 4; i++) { B(0.4, 0.4, 1.0, M('#fff', TT.books([1, 1])), -0.05, 0.35 + i * 0.52, 0, shelf); }
  const phone = new T3.Group(); B(0.16, 0.02, 0.3, '#111', 0, 0, 0, phone); const pscr = B(0.14, 0.01, 0.26, new T3.MeshBasicMaterial({ color: '#4ad0ff' }), 0, 0.015, 0, phone); phone.position.set(-2.2, 0.67, 1.0); bed.add(phone);
  ROOMS.bed = { g: bed, light: bl, tvs, deskL, pscr, x: -40 };
  // KITCHEN at x=0
  const kit = room(0, TT.checker([6, 6]), TT.plaster([2, 1]));
  const kl = pendant(kit, 0.3, -0.4);
  windowAt(kit, -1.6, 1.75, -2.98, 1.4, 1.2);
  // L counter back + right
  B(4.4, 0.85, 0.6, '#7a5434', -0.8, 0.43, -2.7, kit); B(4.45, 0.06, 0.65, '#3a3a40', -0.8, 0.88, -2.68, kit); for (let i = 0; i < 5; i++) B(0.03, 0.6, 0.02, '#4a3020', -2.6 + i * 0.9, 0.45, -2.39, kit);
  B(0.8, 0.04, 0.45, '#c8c8c4', -1.6, 0.9, -2.7, kit); const tap = B(0.05, 0.3, 0.05, '#8a8a8a', -1.6, 1.05, -2.9, kit); B(0.05, 0.05, 0.22, '#8a8a8a', -1.6, 1.2, -2.8, kit);
  B(0.5, 0.22, 0.25, '#8a8a90', 0.4, 1.02, -2.75, kit); B(0.18, 0.22, 0.18, '#e8e4dc', 1.0, 1.02, -2.75, kit); B(0.18, 0.22, 0.18, '#e8e4dc', 1.25, 1.02, -2.75, kit);
  // upper cabinet, plant, hood, stove, fridge
  const ucab = new T3.Group(); ucab.position.set(1.0, 2.05, -2.8); kit.add(ucab); B(1.1, 0.75, 0.38, '#6a4528', 0, 0, 0, ucab);
  const cabDoorL = new T3.Group(); cabDoorL.position.set(-0.55, 0, 0.2); ucab.add(cabDoorL); B(0.54, 0.7, 0.04, '#7a5434', 0.27, 0, 0, cabDoorL);
  const cabDoorR = new T3.Group(); cabDoorR.position.set(0.55, 0, 0.2); ucab.add(cabDoorR); B(0.54, 0.7, 0.04, '#7a5434', -0.27, 0, 0, cabDoorR);
  for (let i = 0; i < 6; i++) { const lf = B(0.18, 0.18, 0.18, '#3a5a2a', 0.7 + (i % 3) * 0.12, 2.45 - Math.floor(i / 3) * 0.22, -2.7, kit); lf.rotation.set(i, i * 2, 0); }
  B(0.9, 0.06, 0.7, '#e8e4dc', 2.2, 0.88, -2.3, kit); B(0.9, 0.85, 0.7, '#e0dcd4', 2.2, 0.43, -2.3, kit); B(0.6, 0.4, 0.02, '#1a1a1e', 2.2, 0.45, -1.94, kit); for (let i = 0; i < 4; i++) B(0.08, 0.04, 0.08, '#2a2a2a', 1.95 + (i % 2) * 0.5, 0.93, -2.45 + Math.floor(i / 2) * 0.3, kit);
  const hood = new T3.Mesh(new T3.CylinderGeometry(0.2, 0.55, 0.4, 4), M('#6a6a70')); hood.rotation.y = Math.PI / 4; hood.position.set(2.2, 2.0, -2.55); kit.add(hood); B(0.3, 0.8, 0.3, '#6a6a70', 2.2, 2.6, -2.75, kit);
  B(0.8, 2.0, 0.7, '#e8e4dc', 2.55, 1.0, -0.9, kit); B(0.02, 1.9, 0.68, '#bdbab2', 2.15, 1.0, -0.9, kit); B(0.02, 0.05, 0.68, '#bdbab2', 2.14, 1.4, -0.9, kit); const mg = B(0.01, 0.4, 0.4, M('#fff', TT.magnet()), 2.14, 1.6, -0.9, kit);
  // table with plaid cloth, chairs, mug
  B(1.4, 0.08, 1.0, M('#fff', TT.plaid([3, 2])), -1.5, 0.78, 1.2, kit); B(1.42, 0.3, 0.02, M('#fff', TT.plaid([3, 1])), -1.5, 0.62, 1.71, kit); B(0.02, 0.3, 1.0, M('#fff', TT.plaid([2, 1])), -0.79, 0.62, 1.2, kit);
  for (const [dx, dz] of [[-0.6, -0.4], [0.6, -0.4], [-0.6, 0.4], [0.6, 0.4]]) B(0.06, 0.74, 0.06, '#4a2c18', -1.5 + dx, 0.37, 1.2 + dz, kit);
  for (const [cx, cz, r] of [[-1.5, 0.4, 0], [-1.5, 2.1, Math.PI]]) { const ch = new T3.Group(); ch.position.set(cx, 0, cz); ch.rotation.y = r; kit.add(ch); B(0.45, 0.06, 0.45, '#5a3a22', 0, 0.48, 0, ch); B(0.45, 0.6, 0.06, '#5a3a22', 0, 0.8, -0.22, ch); for (const [dx, dz] of [[-0.2, -0.2], [0.2, -0.2], [-0.2, 0.2], [0.2, 0.2]]) B(0.05, 0.48, 0.05, '#3a2414', dx, 0.24, dz, ch); }
  B(0.12, 0.14, 0.12, '#d8d4cc', -1.2, 0.89, 1.0, kit);
  B(0.02, 0.16, 0.12, '#e8e4dc', 2.95, 0.35, 0.0, kit); const plug = B(0.08, 0.08, 0.06, '#e8e8e0', 2.9, 0.35, 0.0, kit); const cable = B(0.03, 0.03, 0.6, '#d8d8d0', 2.9, 0.33, -0.3, kit);
  const led = B(0.01, 0.05, 0.05, new T3.MeshBasicMaterial({ color: '#4aff7a' }), 2.14, 1.85, -0.65, kit); const fridgeGlow = new T3.PointLight('#a8d8ff', 0.6, 2.5, 1.5); fridgeGlow.position.set(1.9, 1.2, -0.9); kit.add(fridgeGlow);
  // front door on left wall + bookcase beside it
  const door = new T3.Group(); door.position.set(-2.96, 0, -0.9); kit.add(door); B(0.08, 2.1, 1.0, '#4a2c18', 0, 1.05, 0, door); const knob = B(0.08, 0.08, 0.08, '#c8b070', 0.08, 1.05, 0.38, door); const lock = B(0.05, 0.12, 0.05, '#c8b070', 0.08, 1.3, 0.38, door);
  B(0.1, 0.12, 1.15, '#2a1a10', -2.94, 2.14, -0.9, kit);
  const bcase = new T3.Group(); kit.add(bcase); B(0.45, 1.9, 0.9, '#5a3a22', 0, 0.95, 0, bcase); for (let i = 0; i < 3; i++) B(0.4, 0.4, 0.8, M('#fff', TT.books([1, 1])), 0.04, 0.4 + i * 0.55, 0, bcase);
  // food & water props
  const jugM = new T3.MeshLambertMaterial({ color: '#cfe8f4', transparent: true, opacity: 0.55 });
  const jugs = Array.from({ length: 14 }, (_, i) => { const j = new T3.Group(); j.add(new T3.Mesh(new T3.CylinderGeometry(0.09, 0.1, 0.28, 6), jugM)); const w = new T3.Mesh(new T3.CylinderGeometry(0.085, 0.095, 0.26, 6), new T3.MeshLambertMaterial({ color: '#3a8ad0', transparent: true, opacity: 0.85 })); j.add(w); B(0.06, 0.05, 0.06, '#2a5ab0', 0, 0.16, 0, j); j.userData.w = w; j.position.set(-2.0 + (i % 7) * 0.2, 0.96, 0.95 + Math.floor(i / 7) * 0.32); kit.add(j); return j; });
  const stream = B(0.03, 0.2, 0.03, new T3.MeshBasicMaterial({ color: '#8ac8f0', transparent: true, opacity: 0.8 }), -1.6, 1.0, -2.75, kit);
  const tins = Array.from({ length: 9 }, (_, i) => { const t = new T3.Mesh(new T3.CylinderGeometry(0.07, 0.07, 0.13, 7), M(['#b03a2a', '#c8a03a', '#3a6a3a'][i % 3])); t.position.set(-1.95 + (i % 5) * 0.16, 0.89 + Math.floor(i / 5) * 0.13, 1.45 - Math.floor(i / 5) * 0.03); kit.add(t); return t; });
  const pots = Array.from({ length: 4 }, (_, i) => { const p = new T3.Mesh(new T3.CylinderGeometry(0.08, 0.06, 0.12, 6), M('#f0e8d0')); p.position.set(-1.1 + (i % 2) * 0.18, 0.88, 1.35 + Math.floor(i / 2) * 0.18); kit.add(p); return p; });
  const jar = new T3.Mesh(new T3.CylinderGeometry(0.07, 0.07, 0.16, 7), M('#4a2a18')); jar.position.set(-1.25, 0.9, 0.85); kit.add(jar);
  const pad = B(0.26, 0.01, 0.34, new T3.MeshBasicMaterial({ map: TX.paper() }), -1.75, 0.83, 1.05, kit); pad.rotation.y = 0.2;
  ROOMS.kit = { plug, cable, led, fridgeGlow, g: kit, light: kl, door, lock, bcase, jugs, stream, tins, pots, jar, pad, cabL: cabDoorL, cabR: cabDoorR, x: 0 };
  // BATHROOM at x=40
  const bath = room(40, TT.checker([6, 6]), TT.plaster([2, 1]));
  const bal = pendant(bath, 0, -0.3);
  windowAt(bath, 0, 1.95, -2.98, 0.9, 1.0);
  for (let i = 0; i < 6; i++) for (let j = 0; j < 4; j++) B(0.02, 0.34, 0.34, M('#fff', TT.tile([1, 1])), -2.98, 0.85 + j * 0.36, -2.6 + i * 0.36, bath);
  const tub = new T3.Group(); tub.position.set(-2.4, 0, -1.6); bath.add(tub); B(1.1, 0.7, 2.6, '#d8d0c4', 0, 0.35, 0, tub); B(0.9, 0.05, 2.4, '#a8a49c', 0, 0.68, 0, tub);
  const tubWater = B(0.88, 0.02, 2.36, new T3.MeshLambertMaterial({ color: '#4a9ad8', transparent: true, opacity: 0.75 }), 0, 0.2, 0, tub);
  B(0.1, 0.12, 0.25, '#8a8a8a', -0.4, 1.3, -1.25, tub); B(0.06, 0.25, 0.06, '#8a8a8a', -0.48, 0.85, -1.1, tub);
  const curtain = B(0.04, 2.0, 1.6, M('#fff', TT.plaid([3, 6])), 0.6, 1.5, 0.6, tub); B(0.04, 0.04, 2.7, '#8a8a8a', 0.6, 2.5, 0, tub);
  // toilet, sink, mirror, shelf+plant, rug, towel, paper
  const toi = new T3.Group(); toi.position.set(0, 0, -2.55); bath.add(toi); B(0.5, 0.55, 0.22, '#e0dcd2', 0, 0.85, -0.2, toi); B(0.42, 0.42, 0.5, '#e0dcd2', 0, 0.21, 0.1, toi); B(0.46, 0.06, 0.55, '#e8e4dc', 0, 0.45, 0.12, toi);
  B(0.18, 0.18, 0.1, '#e8e4dc', -0.65, 0.75, -2.93, bath);
  const sink = new T3.Group(); sink.position.set(2.3, 0, -0.9); bath.add(sink); B(0.3, 0.8, 0.3, '#e0dcd2', 0, 0.4, 0, sink); B(0.7, 0.18, 0.6, '#e8e4dc', -0.05, 0.88, 0, sink); B(0.05, 0.2, 0.05, '#8a8a8a', 0.2, 1.05, 0, sink); B(0.1, 0.22, 0.1, '#7a7268', 0.25, 1.08, 0.2, sink);
  const mirror = B(0.04, 0.9, 0.7, new T3.MeshBasicMaterial({ map: TT.rain }), 2.96, 1.8, -0.9, bath); B(0.05, 1.0, 0.8, '#3a2416', 2.97, 1.8, -0.9, bath);
  B(0.3, 0.7, 0.6, '#5a3a22', 2.8, 1.9, -2.2, bath); for (let i = 0; i < 5; i++) { const lf = B(0.16, 0.16, 0.16, '#3a5a2a', 2.75, 2.35 - (i % 3) * 0.12, -2.4 + i * 0.1, bath); lf.rotation.set(i, i, 0); }
  B(0.9, 0.03, 1.6, M('#fff', TT.rug([1, 2])), -0.6, 0.02, 0.6, bath); B(0.05, 0.6, 0.35, M('#fff', TT.plaid([1, 2])), 2.95, 0.9, 0.2, bath);
  ROOMS.bath = { g: bath, light: bal, tubWater, x: 40 };
}

// ---------- characters ----------
const YOU = { shirt: '#3a5a3a', trousers: '#2a3a5a', skin: '#e8b896', hair: '#2a1c14', longSleeve: true, socks: '#d8d8d0' };
let you, shoeL, shoeR, torch;
function crouch(p, k) { const u = p.userData; u.body.position.y = -0.55 * k; u.legL.rotation.x = u.legR.rotation.x = -1.4 * k; u.armL.rotation.x = u.armR.rotation.x = -0.9 * k; }
function pose0(p) { const u = p.userData; u.body.position.y = 0; u.body.rotation.set(0, 0, 0); u.head.rotation.set(0, 0, 0); for (const k of ['armL', 'armR', 'legL', 'legR']) u[k].rotation.set(0, 0, 0); }

// ---------- lighting state ----------
let hemi;
function lights(power, flash = 0) {
  for (const r of [ROOMS.bed, ROOMS.kit, ROOMS.bath]) { r.light.pl.intensity = power ? 2.2 : 0; r.light.bulb.material.color.set(power ? '#ffe0a0' : '#2a2620'); }
  ROOMS.bed.deskL.intensity = power ? 1.0 : 0;
  hemi.intensity = (power ? 0.55 : 0.3) + flash * 1.6; hemi.color.set(flash > 0.05 ? '#c8d4ff' : (power ? '#ffe6c8' : '#6a7ab0'));
}
const R0 = rng(31); const BOLTS = Array.from({ length: 12 }, () => R0() * TM.total);
function lightning(T) { let f = 0; for (const b of BOLTS) { const d = T - b; if (d > 0 && d < 0.35) f = Math.max(f, (d < 0.08 ? 1 : 0.5) * (1 - d / 0.35)); } return f; }

// ---------- Day 2 lighting & window ----------
function drawWindow(t, dayK, flash) {
  const { g } = TT.rain.userData; const top = dayK < 0.5 ? mixc('#141a30', '#4a3a6a', dayK * 2) : mixc('#4a3a6a', '#8aa8d0', (dayK - 0.5) * 2); const bot = dayK < 0.5 ? mixc('#2a3048', '#e0885a', dayK * 2) : mixc('#e0885a', '#d8dde4', (dayK - 0.5) * 2);
  const gr = g.createLinearGradient(0, 0, 0, 64); gr.addColorStop(0, flash ? '#9aa8d0' : top); gr.addColorStop(1, flash ? '#6a78a0' : bot); g.fillStyle = gr; g.fillRect(0, 0, 48, 64);
  g.fillStyle = dayK > 0.3 ? mixc('#0c0e18', '#3a3e4a', dayK) : '#0c0e18'; g.beginPath(); g.moveTo(0, 64); g.lineTo(0, 46); g.lineTo(8, 40); g.lineTo(16, 46); g.lineTo(16, 42); g.lineTo(26, 34); g.lineTo(36, 42); g.lineTo(40, 40); g.lineTo(48, 44); g.lineTo(48, 64); g.closePath(); g.fill(); g.fillRect(20, 30, 3, 6); g.fillRect(38, 34, 2, 6);
  const rainA = 0.5 * (1 - dayK * 0.7); g.fillStyle = `rgba(190,200,230,${rainA})`; for (const [x, y, sp] of DROPS) { const yy = (y + t * 60 * sp) % 64; g.fillRect(x | 0, yy | 0, 1, 3); }
  TT.rain.needsUpdate = true;
}
function mixc(a, b, k) { const ca = new T3.Color(a), cb = new T3.Color(b); return '#' + ca.lerp(cb, clamp(k)).getHexString(); }
function setLight(dayK, flash) {
  for (const r of [ROOMS.bed, ROOMS.kit, ROOMS.bath]) { r.light.pl.intensity = 0; r.light.bulb.material.color.set('#2a2620'); } ROOMS.bed.deskL.intensity = 0;
  hemi.intensity = 0.45 + dayK * 0.5 + flash * 1.4; hemi.color.set(flash > 0.05 ? '#c8d4ff' : mixc('#6a7ab0', '#eef2f8', dayK)); hemi.groundColor.set(mixc('#1a1a28', '#5a4a3a', dayK));
}

// ---------- Day 6: the safe zone ----------
function cam(p, l) { camera.position.set(p[0], p[1], p[2]); camera.lookAt(l[0], l[1], l[2]); }
function camL(a, b, k, la, lb) { k = ease(k); cam([lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)], [lerp(la[0], lb[0], k), lerp(la[1], lb[1], k), lerp(la[2], lb[2], k)]); }
const BX = -40, KX = 0, RX = 160, STX = 400, TNX = 480, NTX = 700;
const EVT = { seat: AT(0, 'seat'), flew: AT(0, 'and'), like: AT(0, 'like'), sam1: AT(1, 'sam'), day1: AT(1, 'day'), safe1: AT(1, 'the'), stadium: AT(2, 'stadium'), fences: AT(2, 'fences'), flood: AT(2, 'floodlights'), thousands: AT(2, 'thousands'), everyone: AT(2, 'everyone'),
  finds: AT(3, 'finds'), my3: AT(3, 'my'), please: AT(3, 'please'), no3: AT(3, 'no'), her3: AT(3, 'her', 1), we3: AT(3, 'we'), rule: AT(4, 'rule'), charges: AT(4, 'charges'), one4: AT(4, 'one'), sent: AT(4, 'sent'),
  pilot: AT(6, 'pilot'), jay: AT(6, 'jay'), lost: AT(6, 'lost'), saw: AT(6, 'saw'), fly: AT(6, "i'll"), tonight: AT(6, 'tonight'), nolights: AT(6, 'no'), midnight: AT(7, 'midnight'), heli7: AT(7, 'helicopter'), below: AT(7, 'below'),
  tower: AT(8, 'tower'), roof8: AT(8, 'the'), but8: AT(8, 'but'), light8: AT(8, 'light'), on1: AT(8, 'on', 1), off: AT(8, 'off'), on2: AT(8, 'on', 2), mia8: AT(8, "it's"), optB: AT(9, 'option', 1), comment: AT(9, 'comment') };
let bag, roof, heli, rotor, trotor, sun, miaTower, stadium, flood = [], survivors = [], soldiers = [], commander, jay, tentIn, cot, phoneM, nightCity, crowdIM, crowdData = [], roofZ = [], miaWin, miaWinL, mia, ntower, moon, fires = [];
function signTex(s, bg = '#d8d4c8', fg = '#1a1a1a') { return TX.sign(s, bg, fg, 64, 48, 16); }
function buildExtra() {
  bag = new T3.Group(); B(0.36, 0.45, 0.2, '#2a4a6a', 0, 0, 0, bag); B(0.3, 0.16, 0.06, '#1e3a56', 0, -0.08, 0.12, bag); scene.add(bag);
  // ----- Sam's roof (Day 5) at RX -----
  roof = new T3.Group(); roof.position.x = RX; scene.add(roof);
  const rf = new T3.Mesh(new T3.PlaneGeometry(24, 24), new T3.MeshLambertMaterial({ map: TT.tile([8, 8]), color: '#9a968e' })); rf.rotation.x = -Math.PI / 2; rf.position.z = 6; roof.add(rf);
  for (const [w, d, x, z] of [[24, 0.3, 0, -6], [24, 0.3, 0, 18], [0.3, 24, -12, 6], [0.3, 24, 12, 6]]) B(w, 0.7, d, '#8a8478', x, 0.35, z, roof);
  B(2.4, 2.6, 2, '#a09a8e', 0, 1.3, -0.2, roof); B(2.7, 0.16, 2.3, '#6a665e', 0, 2.68, -0.2, roof); B(1.3, 2.1, 0.02, '#1a1a1a', 0, 1.05, 0.805, roof); B(1.0, 0.12, 0.1, '#d02a20', 0, 1.0, 0.9, roof);
  const hm = new T3.Mesh(new T3.PlaneGeometry(2.2, 2.2), new T3.MeshBasicMaterial({ map: TX.sign('H', '#4a4a4e', '#ffd23a', 64, 64, 40) })); hm.rotation.x = -Math.PI / 2; hm.position.set(0, 0.02, 9.5); roof.add(hm);
  const r = rng(55); const cols = ['#8a8a92', '#a8a090', '#6a7280', '#b0a898', '#7a6a62', '#9aa0a8'];
  for (let i = -7; i <= 7; i++) for (let j = -6; j <= 9; j++) { const x = i * 9, z = 6 + j * 9; if (Math.abs(x) < 15 && z > -10 && z < 22) continue; let h = 26 + r() * 36; if (x < 0 && x > -40 && z > 12) h = Math.min(h, 28); B(6.5, h, 6.5, cols[(r() * 6) | 0], x, -40 + h / 2, z, roof); }
  miaTower = new T3.Group(); miaTower.position.set(-28, 0, 64); roof.add(miaTower); B(8, 76, 8, '#c0503a', 0, -20, 0, miaTower); for (let f = 0; f < 14; f++) for (let k = 0; k < 3; k++) B(1.2, 0.8, 0.05, '#2a2a3a', -2.5 + k * 2.5, 16 - f * 2.2, -4.03, miaTower);
  for (let i = 0; i < 12; i++) B(0.3, 0.8, 0.25, '#3a3a34', -3 + (i % 6) * 1.2, 18.4, -2.5 + Math.floor(i / 6) * 2 + (i % 2) * 0.5, miaTower);
  const ms = new T3.Mesh(new T3.PlaneGeometry(5, 1.4), new T3.MeshBasicMaterial({ map: TX.sign("MIA'S TOWER", '#1a1a1a', '#ff8ad0', 128, 32, 14) })); ms.position.set(0, 20.6, -4.1); ms.rotation.y = Math.PI; miaTower.add(ms);
  // ----- helicopter (front = +z) -----
  heli = new T3.Group(); scene.add(heli);
  B(1.5, 1.3, 2.8, '#e8e4dc', 0, 0, 0, heli); B(1.52, 0.32, 2.82, '#c8302a', 0, -0.25, 0, heli); B(1.3, 0.8, 0.5, '#4a6a8a', 0, 0.15, 1.5, heli); B(0.02, 0.9, 1.0, '#1a1a1a', -0.76, 0.05, 0.2, heli);
  B(0.3, 0.3, 3.2, '#e8e4dc', 0, 0.3, -2.9, heli); B(0.08, 0.9, 0.6, '#c8302a', 0, 0.75, -4.4, heli);
  const cross = new T3.Mesh(new T3.PlaneGeometry(0.7, 0.7), new T3.MeshBasicMaterial({ map: TX.sign('+', '#ffffff', '#c8302a', 32, 32, 30) })); cross.position.set(0.77, 0.15, -0.6); cross.rotation.y = Math.PI / 2; heli.add(cross);
  for (const sx of [-1, 1]) { B(0.08, 0.08, 2.8, '#3a3a3a', sx * 0.7, -0.95, 0.1, heli); B(0.06, 0.35, 0.06, '#3a3a3a', sx * 0.6, -0.78, 0.7, heli); B(0.06, 0.35, 0.06, '#3a3a3a', sx * 0.6, -0.78, -0.5, heli); }
  rotor = new T3.Group(); rotor.position.set(0, 0.85, 0); heli.add(rotor); B(0.15, 0.25, 0.15, '#2a2a2a', 0, -0.1, 0, rotor); B(7.5, 0.04, 0.22, '#2a2a2a', 0, 0, 0, rotor); B(0.22, 0.04, 7.5, '#2a2a2a', 0, 0, 0, rotor);
  trotor = new T3.Group(); trotor.position.set(0.12, 0.75, -4.4); heli.add(trotor); B(0.03, 1.1, 0.12, '#2a2a2a', 0, 0, 0, trotor);
  sun = new T3.DirectionalLight('#fff2dc', 1.5); sun.position.set(STX + 30, 60, 40); sun.target.position.set(STX, 0, 0); scene.add(sun); scene.add(sun.target);
  moon = new T3.DirectionalLight('#9ab0ff', 0.7); moon.position.set(NTX - 60, 120, 80); moon.target.position.set(NTX, 40, -40); scene.add(moon); scene.add(moon.target);
  // ----- the stadium safe zone at STX -----
  stadium = new T3.Group(); stadium.position.x = STX; scene.add(stadium);
  const gr = ground(220, TX.grass([30, 30])); stadium.add(gr); const pt = new T3.Mesh(new T3.PlaneGeometry(40, 64), new T3.MeshLambertMaterial({ map: TX.pitch() })); pt.rotation.x = -Math.PI / 2; pt.position.y = 0.02; stadium.add(pt);
  for (const [x, z, ry, len] of [[0, -36, 0, 54], [0, 36, Math.PI, 54], [-26, 0, Math.PI / 2, 74], [26, 0, -Math.PI / 2, 74]]) { const st = crowdStand(len, 10, x, z, ry); stadium.add(st); const back = B(len, 12, 2, '#6a6e78', 0, 6, -7.5, st); B(len, 0.6, 9, '#4a4e58', 0, 12.3, -3.5, st); }
  // floodlights
  for (const [x, z] of [[-30, -40], [30, -40], [-30, 40], [30, 40]]) { stadium.add(cyl(0.5, 0.7, 34, 6, '#8a8e96', x, 17, z)); const pn = B(6, 3.5, 0.6, new T3.MeshBasicMaterial({ color: '#c8ccd4' }), x * 0.98, 35, z * 0.98, stadium); pn.lookAt(STX, 0, 0); const pl = new T3.PointLight('#fff4d8', 0, 140, 1); pl.position.set(STX + x * 0.9, 33, z * 0.9); scene.add(pl); flood.push([pn, pl]); }
  // tents on the pitch + command tent
  for (let i = 0; i < 4; i++) for (let j = 0; j < 5; j++) for (const sd of [-1, 1]) { const x = sd * (7 + i * 3.6), z = -22 + j * 11; const t = new T3.Mesh(new T3.ConeGeometry(1.7, 2.2, 4), M(i === 0 && j === 2 ? '#d8d0c0' : '#e8e4d8')); t.rotation.y = Math.PI / 4; t.position.set(x, 1.1, z); stadium.add(t); }
  { const mt = new T3.Mesh(new T3.ConeGeometry(2.4, 2.8, 4), M('#f0ece4')); mt.rotation.y = Math.PI / 4; mt.position.set(-7, 1.4, 25); stadium.add(mt); const c = new T3.Mesh(new T3.PlaneGeometry(1.2, 1.2), new T3.MeshBasicMaterial({ map: TX.sign('+', '#ffffff', '#c8302a', 32, 32, 30) })); c.position.set(-7, 1.2, 26.4); stadium.add(c); }
  B(7, 3.2, 5, '#5a6a44', 10, 1.6, -28, stadium); const cs = new T3.Mesh(new T3.PlaneGeometry(4, 0.9), new T3.MeshBasicMaterial({ map: TX.sign('COMMAND', '#2a3a22', '#e8e0b0', 96, 24, 12) })); cs.position.set(10, 2.6, -25.45); stadium.add(cs);
  const hp = new T3.Mesh(new T3.PlaneGeometry(6, 6), new T3.MeshBasicMaterial({ map: TX.sign('H', '#3a3a3e', '#ffd23a', 64, 64, 40) })); hp.rotation.x = -Math.PI / 2; hp.position.set(0, 0.04, 0); stadium.add(hp);
  // the fence + gate outside (z = 50)
  const fm = new T3.MeshBasicMaterial({ map: (() => { const t = TX.sign('', 'rgba(0,0,0,0)', '#000', 16, 16, 1); return t; })(), transparent: true, color: '#8a8e96', wireframe: true });
  for (let x = -60; x <= 60; x += 3) { if (Math.abs(x) < 3) continue; B(0.15, 3.4, 0.15, '#7a7e86', x, 1.7, 50, stadium); const n = new T3.Mesh(new T3.PlaneGeometry(3, 3, 6, 6), fm); n.position.set(x + 1.5, 1.6, 50); if (Math.abs(x + 1.5) > 2.5) stadium.add(n); }
  B(120, 0.1, 0.1, '#5a5e66', 0, 3.4, 50, stadium); for (let x = -60; x <= 60; x += 0.8) { const w = B(0.5, 0.08, 0.08, '#4a4e56', x, 3.6 + (x * 7 % 2) * 0.1, 50, stadium); w.rotation.z = 0.6; }
  B(2.2, 3.6, 0.3, '#8a7a3a', -3.6, 1.8, 50, stadium); const gs = new T3.Mesh(new T3.PlaneGeometry(4, 1), new T3.MeshBasicMaterial({ map: TX.sign('SAFE ZONE', '#c8a83a', '#1a1a1a', 96, 24, 12) })); gs.position.set(0, 4.4, 50.1); stadium.add(gs);
  // survivors + soldiers
  const SC = ['#7a5a4a', '#4a6a8a', '#8a7a5a', '#6a4a6a', '#3a5a4a', '#9a6a4a', '#5a5a7a', '#7a7a6a'];
  for (let i = 0; i < 30; i++) { const p = person({ shirt: SC[i % 8], trousers: ['#2a2a3a', '#3a3a2a', '#4a4a5a'][i % 3], skin: ['#e8b896', '#c8946a', '#8a5a3a', '#f0c8a0'][i % 4], hair: ['#2a1c14', '#5a3a1a', '#1a1a1a', '#c8a050'][i % 4] }); scene.add(p); survivors.push(p); p.userData.home = i < 14 ? [STX - 4 + (i % 7) * 1.4 - 2, 55 + Math.floor(i / 7) * 2.2 + (i % 2) * 0.5] : [STX + (r() - 0.5) * 30, (r() - 0.5) * 50]; p.userData.o = r(); }
  for (let i = 0; i < 6; i++) { const p = person({ shirt: '#4a5a3a', trousers: '#3a4a2a', skin: ['#c8946a', '#e8b896', '#8a5a3a'][i % 3], hat: 'helmet', hatCol: '#3a4a2a' }); scene.add(p); soldiers.push(p); }
  commander = person({ shirt: '#4a5a3a', trousers: '#3a4a2a', skin: '#c8946a', hair: '#2a2a2a', hat: 'cap', hatCol: '#2a3a22', beard: '#3a3a3a' }); scene.add(commander);
  jay = person({ shirt: '#6a7a5a', trousers: '#6a7a5a', skin: '#e8b896', hair: '#5a3a1a', hat: 'cap', hatCol: '#1a1a1a', longSleeve: true }); scene.add(jay);
  // ----- inside the command tent at TNX -----
  tentIn = new T3.Group(); tentIn.position.x = TNX; scene.add(tentIn);
  const canv = M('#b8a878'); B(12, 0.1, 10, '#6a5a3a', 0, -0.05, 0, tentIn); for (const [w, h, d, x, z] of [[12, 3.4, 0.1, 0, -5], [0.1, 3.4, 10, -6, 0], [0.1, 3.4, 10, 6, 0]]) B(w, h, d, canv, x, 1.7, z, tentIn);
  const rfc = new T3.Mesh(new T3.ConeGeometry(8.6, 3, 4, 1, true), new T3.MeshLambertMaterial({ color: '#a89868', side: T3.DoubleSide, flatShading: true })); rfc.rotation.y = Math.PI / 4; rfc.position.y = 4.9; tentIn.add(rfc);
  B(3.6, 0.12, 2, '#7a5a3a', -1.5, 0.9, -2.4, tentIn); for (const [a, b] of [[-3.1, -3.2], [0.1, -3.2], [-3.1, -1.6], [0.1, -1.6]]) B(0.1, 0.9, 0.1, '#5a3a2a', a, 0.45, b, tentIn);
  const mapT = TX.sign('', '#d8d0b0', '#000', 64, 40, 1); { const g = mapT.image.getContext('2d'); g.strokeStyle = '#8a8a7a'; for (let i = 0; i < 64; i += 8) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i + 6, 40); g.stroke(); } for (let i = 0; i < 40; i += 7) { g.beginPath(); g.moveTo(0, i); g.lineTo(64, i + 3); g.stroke(); } g.strokeStyle = '#c8302a'; g.lineWidth = 2; g.beginPath(); g.arc(46, 12, 5, 0, 7); g.stroke(); g.fillStyle = '#2a6a3a'; g.fillRect(14, 26, 8, 6); mapT.needsUpdate = true; }
  const mp = new T3.Mesh(new T3.PlaneGeometry(3.2, 1.8), new T3.MeshBasicMaterial({ map: mapT })); mp.rotation.x = -Math.PI / 2; mp.position.set(-1.5, 0.97, -2.4); tentIn.add(mp);
  const lan = new T3.PointLight('#ffd890', 2.4, 14, 1); lan.position.set(TNX - 1.5, 2.6, -1); scene.add(lan); B(0.2, 0.3, 0.2, new T3.MeshBasicMaterial({ color: '#ffd890' }), -1.5, 2.6, -1, tentIn);
  cot = new T3.Group(); cot.position.set(3, 0, 1.5); tentIn.add(cot); B(2.2, 0.08, 0.9, '#4a5a3a', 0, 0.5, 0, cot); for (const [a, b] of [[-1, -0.4], [1, -0.4], [-1, 0.4], [1, 0.4]]) B(0.06, 0.5, 0.06, '#2a2a2a', a, 0.25, b, cot);
  B(0.8, 0.6, 0.6, '#c8a030', 4.6, 0.3, -1.5, tentIn); phoneM = B(0.1, 0.02, 0.18, new T3.MeshBasicMaterial({ color: '#141820' }), 3.4, 0.56, 1.5, tentIn); const cbl = B(1.6, 0.03, 0.03, '#1a1a1a', 4.1, 0.4, 0.2, tentIn); cbl.rotation.y = 1.0;
  // ----- the night city + Mia's tower at NTX -----
  nightCity = new T3.Group(); nightCity.position.x = NTX; scene.add(nightCity); const nr = rng(77);
  B(400, 0.2, 400, '#2c3040', 0, -0.1, -40, nightCity);
  for (let i = -9; i <= 9; i++) for (let j = -10; j <= 6; j++) { const x = i * 14, z = -40 + j * 14; if (Math.abs(x) < 8 && Math.abs(z + 40) < 8) continue; const h = 18 + nr() * 55; B(9, h, 9, ['#3e4458', '#363c52', '#444658', '#3a4050'][(nr() * 4) | 0], x, h / 2, z, nightCity);
    for (let k = 0; k < 4; k++) if (nr() < 0.35) B(1.2, 0.9, 0.05, new T3.MeshBasicMaterial({ color: nr() < 0.5 ? '#f2b25c' : '#8ab0d0' }), x - 3 + nr() * 6, 4 + nr() * (h - 6), z + 4.53, nightCity); }
  ntower = new T3.Group(); ntower.position.set(0, 0, -40); nightCity.add(ntower); B(10, 90, 10, '#5a2a24', 0, 45, 0, ntower); B(10.6, 0.8, 10.6, '#3a1a18', 0, 90.4, 0, ntower);
  for (let f = 0; f < 34; f++) for (let k = 0; k < 3; k++) B(1.6, 1.2, 0.06, new T3.MeshBasicMaterial({ color: '#141418' }), -3 + k * 3, 1.8 + f * 2.6, 5.03, ntower);
  miaWin = B(1.6, 1.2, 0.08, new T3.MeshBasicMaterial({ color: '#141418' }), -3, 1.8 + 30 * 2.6, 5.05, ntower); miaWinL = new T3.PointLight('#fffbe0', 0, 30, 1.2); miaWinL.position.set(NTX - 3, 1.8 + 30 * 2.6, -40 + 6.5); scene.add(miaWinL);
  const ns = new T3.Mesh(new T3.PlaneGeometry(6, 1.6), new T3.MeshBasicMaterial({ map: TX.sign("MIA'S TOWER", '#1a1a1a', '#ff8ad0', 128, 32, 14) })); ns.position.set(0, 87, 5.06); ntower.add(ns);
  mia = person({ shirt: '#e85a8a', trousers: '#3a3a5a', skin: '#e8b896', hair: '#c8902a' }); mia.scale.setScalar(0.75); scene.add(mia);
  for (let i = 0; i < 18; i++) { const z = person({ shirt: ['#6a6e68', '#7a5a4a', '#4a5a6a', '#8a8a7a', '#5a3a3a', '#6a7a5a'][i % 6], trousers: '#2a2a2a', skin: '#9aaa88', hair: '#2a2a24' }); scene.add(z); z.userData.p = [NTX + (nr() - 0.5) * 8.5, 90.8, -40 + (nr() - 0.5) * 8.5, nr()]; roofZ.push(z); }
  for (let i = 0; i < 7; i++) { const x = [7, -21, 35, -7, 21, 49, -35][i], z = -40 + [-17, 11, 25, 39, -31, -3, 53][i]; const f = new T3.Mesh(new T3.ConeGeometry(3, 9, 5), new T3.MeshBasicMaterial({ color: '#ff8a2a' })); f.position.set(x, 4.5, z); nightCity.add(f); const pl = new T3.PointLight('#ff7a2a', 5, 90, 1); pl.position.set(NTX + x, 8, z); scene.add(pl); fires.push([f, pl]); }
  crowdIM = new T3.InstancedMesh(new T3.BoxGeometry(1.1, 2.6, 1.1), new T3.MeshLambertMaterial({ color: '#a8b898', emissive: '#3a4a30' }), 600); nightCity.add(crowdIM);
  for (let i = 0; i < 600; i++) { const lane = (nr() * 8 | 0) - 4; const vert = nr() < 0.5; crowdData.push({ vert, lane: lane * 14 + 7 + (nr() - 0.5) * 3, o: nr() * 250, sp: 2 + nr() * 2 }); }
}
const M4 = new T3.Matrix4();
function updCrowd(T) { crowdData.forEach((c, i) => { const s_ = ((c.o + T * c.sp) % 250) - 125; const x = c.vert ? c.lane : s_, z = c.vert ? -40 + s_ : -40 + c.lane; M4.makeTranslation(x, 1.3 + Math.abs(S(T * 6 + i)) * 0.1, z); crowdIM.setMatrixAt(i, M4); }); crowdIM.instanceMatrix.needsUpdate = true; }
function env(kind) { const day = kind === 'day', night = kind === 'night', tent = kind === 'tent'; scene.background.set(day ? '#9ab8d4' : night ? '#0b0f22' : '#000000'); scene.fog = day ? FOG : night ? NFOG : null; sun.visible = day; moon.visible = night;
  hemi.intensity = day ? 0.95 : night ? 0.85 : 0.5; hemi.color.set(day ? '#eef2f8' : night ? '#5a6a9a' : '#ffe0b0'); hemi.groundColor.set(day ? '#5a4a3a' : '#0a0a10'); }
function heliAt(x, y, z, ry, tilt, T) { heli.visible = true; heli.position.set(x, y + S(T * 2) * 0.12, z); heli.rotation.set(tilt, ry, 0); rotor.rotation.y = T * 31; trotor.rotation.x = T * 40; }
function crouchRun(p, T) { run(p, T * 9, 0.7); p.userData.body.position.y = -0.3; p.userData.body.rotation.x = 0.35; }
const DIR = [
  // 0 hook: the helicopter lifts off the roof and flies away from Mia's tower
  (lt, T, D) => { env('day'); you.visible = false; const k = prog(T, 0.3, EVT.flew + 0.5), k2 = prog(T, EVT.flew - 0.3, D);
    if (T < EVT.flew - 0.3) { heliAt(RX, lerp(0.98, 9, ease(k)), 9.5, Math.PI * 0.75, 0, T); camL([RX - 4, 1.2, 4], [RX - 5, 2.2, 3], k, [RX, 2, 9.5], [RX, 7, 9.5]); }
    else { heliAt(RX + lerp(4, 40, k2), lerp(12, 22, k2), lerp(5, -30, k2), Math.PI * 0.8, 0.15, T); cam([RX - 50, 30, 95], [RX + lerp(-10, 20, k2), 10, lerp(40, 10, k2)]); } },
  // 1 Day 6 title over the stadium from the air
  (lt, T, D) => { env('day'); you.visible = false; const k = prog(lt, 0, D); heliAt(STX + lerp(-40, -10, k), lerp(40, 28, k), lerp(90, 50, k), Math.PI, 0.12, T); camL([STX + 60, 70, 110], [STX + 40, 55, 85], k, [STX, 0, 0], [STX, 0, 0]); },
  // 2 the safe zone: landing, fences, floodlights, survivors, bite check
  (lt, T, D) => { env('day'); const k = prog(lt, 0, D);
    if (T < EVT.fences - 0.2) { you.visible = false; heliAt(STX, lerp(14, 1.0, ease(prog(T, CL[2].start, EVT.fences))), 0, Math.PI, 0, T); camL([STX + 30, 28, 40], [STX + 24, 20, 30], prog(T, CL[2].start, EVT.fences), [STX, 2, 0], [STX, 1, 0]); }
    else if (T < EVT.flood - 0.2) { you.visible = false; heliAt(STX, 0.98, 0, Math.PI, 0, T); camL([STX + 14, 2.5, 62], [STX + 6, 2.8, 60], prog(T, EVT.fences, EVT.flood), [STX, 3, 50], [STX - 6, 3, 50]); }
    else if (T < EVT.thousands - 0.2) { you.visible = false; heliAt(STX, 0.98, 0, Math.PI, 0, T); camL([STX + 20, 4, 20], [STX + 22, 6, 18], prog(T, EVT.flood, EVT.thousands), [STX + 30, 34, -40], [STX + 30, 36, -40]); }
    else if (T < EVT.everyone - 0.2) { you.visible = false; heliAt(STX, 0.98, 0, Math.PI, 0, T); camL([STX, 30, 46], [STX + 5, 26, 40], prog(T, EVT.thousands, EVT.everyone), [STX, 0, -5], [STX, 0, -8]); }
    else { you.position.set(STX, 0, 51.6); you.rotation.y = Math.PI; idle(you, T); you.userData.armL.rotation.z = -2.6; you.userData.armR.rotation.z = 2.6; const sd = soldiers[0]; sd.visible = true; sd.position.set(STX - 0.9, 0, 49.6); sd.rotation.y = 0.3; idle(sd, T); sd.userData.armR.rotation.x = -1.4 + S(T * 3) * 0.3;
      camL([STX + 2.6, 1.8, 47.6], [STX + 2.2, 1.7, 48.2], prog(T, EVT.everyone, CL[3].start), [STX, 1.4, 51.2], [STX, 1.5, 51.4]); } },
  // 3 the commander says no
  (lt, T, D) => { env('tent'); you.position.set(TNX - 1.5, 0, -0.6); you.rotation.y = Math.PI; idle(you, T); if (T > EVT.my3 && T < EVT.no3) { you.userData.armR.rotation.x = -1.2; you.userData.armL.rotation.x = -1.0; }
    commander.visible = true; commander.position.set(TNX - 1.5, 0, -4.2); commander.rotation.y = 0; idle(commander, T); if (T > EVT.no3 - 0.2) commander.userData.head.rotation.y = S(T * 5) * 0.35 * (T < EVT.no3 + 1.2 ? 1 : 0);
    if (T < EVT.my3 - 0.2) camL([TNX + 3, 2.6, 3], [TNX + 2.4, 2.4, 2.2], prog(T, CL[3].start, EVT.my3), [TNX - 1.5, 1, -2.4], [TNX - 1.5, 1, -2.4]);
    else if (T < EVT.no3 - 0.3) camL([TNX - 2.4, 1.7, -3.2], [TNX - 2.2, 1.7, -3.0], prog(T, EVT.my3, EVT.no3), [TNX - 1.5, 1.6, -0.6], [TNX - 1.5, 1.65, -0.6]);
    else camL([TNX - 0.8, 1.8, -1.0], [TNX - 1.0, 1.75, -1.3], prog(T, EVT.no3, CL[4].start), [TNX - 1.5, 1.7, -4.2], [TNX - 1.5, 1.7, -4.2]); },
  // 4 rule 7: charge the phone
  (lt, T, D) => { env('tent'); you.position.set(TNX + 2.6, 0.05, 1.5); you.rotation.y = Math.PI / 2; crouch(you, 0.55); you.userData.armR.rotation.x = -1.1; phoneM.material.color.set(T > EVT.charges + 1 ? '#7dffb0' : '#141820');
    camL([TNX + 5, 1.5, 3.6], [TNX + 4.6, 1.4, 3.0], prog(lt, 0, D), [TNX + 3.2, 0.7, 1.5], [TNX + 3.3, 0.65, 1.5]); },
  // 5 Mia's message (phone card over the cot)
  (lt, T, D) => { env('tent'); you.position.set(TNX + 2.6, 0.05, 1.5); you.rotation.y = Math.PI / 2; crouch(you, 0.55); you.userData.armR.rotation.x = -1.2; you.userData.head.rotation.x = 0.35; phoneM.material.color.set('#bfe8ff'); cam([TNX + 4.2, 1.8, 2.6], [TNX + 2.9, 1.3, 1.5]); },
  // 6 Jay sits down
  (lt, T, D) => { env('tent'); you.position.set(TNX + 2.6, 0.05, 1.5); you.rotation.y = Math.PI / 2; crouch(you, 0.55); jay.visible = true; const k = prog(T, EVT.pilot - 0.3, EVT.pilot + 1.0);
    if (k < 1) { jay.position.set(TNX + lerp(-1, 3.3, k), 0, lerp(-2, 1.5, k)); jay.rotation.y = 0.8; run(jay, T * 6, 0.5); } else { jay.position.set(TNX + 3.4, 0.05, 1.5); jay.rotation.y = Math.PI / 2; crouch(jay, 0.55); }
    if (T > EVT.fly - 0.2) { jay.rotation.y = -Math.PI / 2 + 0.2; you.rotation.y = Math.PI / 2 - 0.2; }
    if (T < EVT.saw) camL([TNX + 3, 1.7, 5.5], [TNX + 3, 1.6, 4.8], prog(T, CL[6].start, EVT.saw), [TNX + 3, 1.0, 1.5], [TNX + 3, 1.0, 1.5]); else camL([TNX + 3.0, 1.5, 3.4], [TNX + 3.0, 1.45, 3.0], prog(T, EVT.saw, CL[7].start), [TNX + 3.0, 1.2, 1.5], [TNX + 3.0, 1.25, 1.5]); },
  // 7 midnight: sneak to the helicopter, fly over the moving city
  (lt, T, D) => { if (T < EVT.below - 0.3) { env('night'); flood.forEach(([pn, pl]) => { pl.intensity = 2.5; pn.material.color.set('#fff4d8'); }); heliAt(STX, 0.98, 0, Math.PI, 0, T); rotor.rotation.y = T * (T > EVT.heli7 + 1.2 ? 31 : 2);
      const k = prog(T, EVT.midnight, EVT.heli7 + 1.0); you.position.set(STX + lerp(18, 2.2, k), 0, lerp(16, 1.5, k)); you.rotation.y = -2.2; jay.visible = true; jay.position.set(STX + lerp(16, 1.2, k), 0, lerp(13, 0.2, k)); jay.rotation.y = -2.2; if (k < 1) { crouchRun(you, T); crouchRun(jay, T + 0.3); } else { idle(you, T); idle(jay, T); }
      if (T > EVT.heli7 + 1.2) { you.visible = jay.visible = false; heliAt(STX, lerp(0.98, 10, ease(prog(T, EVT.heli7 + 1.2, EVT.below))), 0, Math.PI, 0, T); } camL([STX + 26, 6, 26], [STX + 20, 5, 20], prog(T, CL[7].start, EVT.below), [STX + 6, 1.5, 6], [STX, 2, 0]); }
    else { env('night'); you.visible = false; const k = prog(T, EVT.below - 0.3, CL[8].start); heliAt(NTX + lerp(14, 4, k), 62, lerp(-2, -26, k), Math.PI, 0.15, T); camL([NTX + 9, 100, 2], [NTX + 8, 92, -8], k, [NTX + 7, 0, -26], [NTX + 7, 0, -33]); } },
  // 8 Mia's tower: overrun roof, flashing torch on the 31st floor
  (lt, T, D) => { env('night'); you.visible = false; const wy = 1.8 + 30 * 2.6;
    if (T < EVT.but8 - 0.2) { heliAt(NTX + 14, 100, -12, -Math.PI * 0.6, 0.1, T); heli.visible = false; camL([NTX + 20, 102, -4], [NTX + 18, 101, -8], prog(T, CL[8].start, EVT.but8), [NTX, 91, -40], [NTX - 1, 91, -40]); }
    else { heliAt(NTX + 12, wy + 4, -24, -Math.PI * 0.55, 0.05, T); camL([NTX + 6, wy + 2, -14], [NTX + 3, wy + 1, -18], prog(T, EVT.but8, CL[9].start), [NTX - 3, wy, -34.5], [NTX - 3, wy, -34.5]); } },
  // 9 the choice
  (lt, T, D) => { env('night'); you.visible = false; const wy = 1.8 + 30 * 2.6;
    if (T < EVT.optB - 0.2) { heliAt(NTX, 97, -40, T * 0.2, 0, T); cam([NTX + 22, 108, -10], [NTX, 92, -40]); }
    else { heliAt(NTX - 3, wy + 1.5, -31, Math.PI, 0, T); camL([NTX + 12, wy + 3, -18], [NTX + 10, wy + 2, -20], prog(T, EVT.optB, TM.total), [NTX - 3, wy, -33], [NTX - 3, wy, -33]); } },
];

// ---------- HUD ----------
function bigText(ctx, txt, y, size, col = '#ffd23a', a = 1, font = 'Russo') { if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.font = `${size}px ${font}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round'; ctx.lineWidth = size * 0.22; ctx.strokeStyle = '#05081a'; ctx.strokeText(txt, 360, y); ctx.fillStyle = col; ctx.fillText(txt, 360, y); ctx.restore(); }
function card(ctx, title, x, y, w, h, a) { ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = 'rgba(6,14,40,0.92)'; ctx.fillRect(x, y, w, h); ctx.strokeStyle = '#7ad0ff'; ctx.lineWidth = 4; ctx.strokeRect(x, y, w, h); ctx.fillStyle = '#ffd23a'; ctx.fillRect(x, y, w, 34); ctx.font = '16px PressStart'; ctx.fillStyle = '#06102a'; ctx.textBaseline = 'middle'; ctx.fillText(title, x + 14, y + 18); ctx.restore(); }
function dot(ctx, x, y, r, c) { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); }
function txt(ctx, s, x, y, size, c, align = 'left', font = 'Russo') { ctx.font = `${size}px ${font}`; ctx.fillStyle = c; ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.fillText(s, x, y); ctx.textAlign = 'left'; }
function clockStr(T) { if (T < CL[3].start) return '12.' + String(10 + Math.floor(T * 1.2)).padStart(2, '0') + ' PM'; if (T < CL[4].start) return '1.15 PM'; if (T < CL[6].start) return '2.40 PM'; if (T < CL[7].start) return '3.05 PM'; return '12.' + String(Math.floor((T - CL[7].start) * 1.1)).padStart(2, '0') + ' AM'; }
function phonePct(T) { return T < EVT.charges + 1 ? 'DEAD' : '4%'; }
function tracker(ctx, T) { if (T < CL[1].start) return; const a = prog(T, CL[1].start, CL[1].start + 0.4);
  const loc = T < CL[2].start ? 'HELICOPTER' : T < CL[3].start ? 'SAFE ZONE' : T < CL[7].start ? 'COMMAND TENT' : T < CL[8].start ? 'IN THE AIR' : "MIA'S TOWER";
  const help = T < EVT.no3 ? '?' : T < EVT.fly ? 'REFUSED' : 'JAY . PILOT';
  const rows = [['DAY', '6', '#fff', []], ['TIME', clockStr(T), '#ffd23a', [CL[7].start]], ['LOCATION', loc, '#7dffb0', [CL[2].start, CL[3].start, CL[7].start, CL[8].start]], ['BITES', T > EVT.everyone + 1.5 ? 'NONE' : '?', '#7dffb0', [EVT.everyone + 1.5]],
    ['HELP', help, T < EVT.fly ? '#ff5a3a' : '#7dffb0', [EVT.no3, EVT.fly]], ['PHONE', phonePct(T), '#ff5a3a', [EVT.charges + 1]], ['MIA', T < EVT.one4 ? 'NO SIGNAL' : '31ST FLOOR', '#ff8ad0', [EVT.one4]], ['MIA WATER', T < CL[5].start + 3 ? '?' : 'GONE', '#ff5a3a', [CL[5].start + 3]]];
  ctx.save(); ctx.globalAlpha = a; ctx.translate(14, 60); ctx.scale(1.2, 1.2); const hh = 30 + rows.length * 34; ctx.fillStyle = 'rgba(6,14,40,0.82)'; ctx.fillRect(0, 0, 250, hh); ctx.strokeStyle = '#7ad0ff'; ctx.lineWidth = 3; ctx.strokeRect(0, 0, 250, hh);
  ctx.fillStyle = '#ffd23a'; ctx.fillRect(0, 0, 250, 26); ctx.font = '14px PressStart'; ctx.fillStyle = '#06102a'; ctx.textBaseline = 'middle'; ctx.fillText("SAM'S LOG", 12, 14);
  rows.forEach(([k, v, col, ts], i) => { const y = 45 + i * 34; let fl = 0; for (const t0 of ts) if (T > t0 && T < t0 + 0.6) fl = 1 - (T - t0) / 0.6; if (fl) { ctx.fillStyle = `rgba(255,255,255,${0.35 * fl})`; ctx.fillRect(4, y - 15, 242, 30); }
    ctx.font = '11px PressStart'; ctx.fillStyle = '#9ab0d0'; ctx.textAlign = 'left'; ctx.fillText(k, 10, y); ctx.font = '18px Russo'; ctx.fillStyle = col; ctx.textAlign = 'right'; ctx.fillText(v, 240, y + 1); ctx.textAlign = 'left'; }); ctx.restore(); }
function likePill(ctx, T) { const l0 = EVT.like, l1 = CL[1].start; if (T < l0 - 0.15 || T > l1 + 0.3) return; const k = ease(prog(T, l0 - 0.15, l0 + 0.15)) * (1 - ease(prog(T, l1, l1 + 0.3))); ctx.save(); ctx.globalAlpha = k; ctx.translate(0, (1 - k) * 30);
  ctx.fillStyle = 'rgba(6,14,40,0.88)'; ctx.beginPath(); ctx.roundRect(170, 920, 380, 70, 35); ctx.fill(); ctx.strokeStyle = '#7ad0ff'; ctx.lineWidth = 3; ctx.stroke();
  const hb = 1 + 0.25 * Math.max(0, S((T - l0) * 9)) * (T < l0 + 0.7 ? 1 : 0); ctx.save(); ctx.translate(216, 955); ctx.scale(hb, hb); ctx.fillStyle = '#ff5a6a'; ctx.beginPath(); ctx.moveTo(0, 12); ctx.bezierCurveTo(-26, -6, -12, -26, 0, -12); ctx.bezierCurveTo(12, -26, 26, -6, 0, 12); ctx.fill(); ctx.restore();
  txt(ctx, 'LIKE', 250, 956, 24, '#fff'); const fo = T > AT(0, 'follow'); ctx.fillStyle = fo ? '#7dffb0' : '#ffd23a'; ctx.beginPath(); ctx.roundRect(340, 933, 190, 44, 22); ctx.fill(); txt(ctx, fo && T > AT(0, 'follow') + 0.3 ? 'FOLLOWING' : '+ FOLLOW', 435, 956, 20, '#06102a', 'center'); ctx.restore(); }
function banner(ctx, label, k, out) { const x = lerp(760, 330, ease(k)) + ease(out) * 500; ctx.save(); ctx.translate(x, 60); ctx.beginPath(); ctx.moveTo(30, 0); ctx.lineTo(390, 0); ctx.lineTo(390, 92); ctx.lineTo(0, 92); ctx.closePath(); ctx.fillStyle = 'rgba(150,20,20,0.95)'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = '#ffb0a0'; ctx.stroke(); ctx.font = '16px PressStart'; ctx.fillStyle = '#ffe24a'; ctx.textBaseline = 'middle'; ctx.fillText(label[0], 36, 26); ctx.font = '26px Russo'; ctx.fillStyle = '#fff'; ctx.fillText(label[1], 36, 64); ctx.restore(); }
function phoneCard(ctx, T, a, lines, sub, pct, dead = 0) { if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; const x = 150, y = 400, w = 420, h = 560; ctx.fillStyle = '#0a0c12'; ctx.beginPath(); ctx.roundRect(x, y, w, h, 40); ctx.fill(); ctx.strokeStyle = '#3a3e48'; ctx.lineWidth = 8; ctx.stroke();
  ctx.fillStyle = '#121a2c'; ctx.beginPath(); ctx.roundRect(x + 18, y + 18, w - 36, h - 36, 26); ctx.fill();
  ctx.strokeStyle = '#ff4a3a'; ctx.lineWidth = 3; ctx.strokeRect(x + w - 110, y + 36, 56, 26); ctx.fillStyle = '#ff4a3a'; ctx.fillRect(x + w - 106, y + 40, 48 * pct / 100 + 2, 18); txt(ctx, `${pct}%`, x + w - 120, y + 49, 22, '#ff4a3a', 'right');
  dot(ctx, x + 70, y + 110, 34, '#e85a8a'); txt(ctx, 'MIA', x + 70, y + 112, 22, '#fff', 'center'); txt(ctx, 'MIA', x + 120, y + 98, 34, '#fff'); txt(ctx, 'LITTLE SISTER', x + 120, y + 130, 13, '#ff8ad0', 'left', 'PressStart');
  lines.forEach((l, i) => { const by = y + 190 + i * 96; ctx.fillStyle = '#2a2e3e'; ctx.beginPath(); ctx.roundRect(x + 40, by, w - 80, 78, 18); ctx.fill(); txt(ctx, l, x + 60, by + 39, 26, '#fff'); });
  if (sub) txt(ctx, sub, x + w / 2, y + h - 50, 15, '#9ab0d0', 'center', 'PressStart');
  if (dead > 0) { ctx.globalAlpha = a * dead; ctx.fillStyle = '#000'; ctx.beginPath(); ctx.roundRect(x + 18, y + 18, w - 36, h - 36, 26); ctx.fill(); ctx.strokeStyle = '#ff4a3a'; ctx.lineWidth = 6; ctx.strokeRect(x + 150, y + 250, 110, 56); ctx.fillStyle = '#ff4a3a'; ctx.fillRect(x + 260, y + 266, 10, 24); ctx.fillRect(x + 156, y + 256, 10, 44); txt(ctx, 'PHONE DEAD', x + w / 2, y + 360, 34, '#ff4a3a', 'center'); }
  ctx.restore(); }
const DIAG = [
  // safe zone stats
  { a: () => EVT.fences - 0.1, b: () => EVT.everyone - 0.2, draw: (ctx, T, a) => { const x = 350, y = 430, w = 340, h = 280; card(ctx, 'SAFE ZONE', x, y, w, h, a); ctx.save(); ctx.globalAlpha = a;
      [['FENCES', EVT.fences, 'DOUBLE'], ['FLOODLIGHTS', EVT.flood, '4'], ['SURVIVORS', EVT.thousands, String(Math.round(lerp(0, 3200, prog(T, EVT.thousands, EVT.thousands + 1.2))))]].forEach(([k, t0, v], i) => { const yy = y + 80 + i * 62; const on = T > t0 - 0.1; txt(ctx, k, x + 20, yy, 22, on ? '#fff' : '#5a6a8a'); txt(ctx, on ? v : '...', x + w - 20, yy, 26, '#7dffb0', 'right'); }); ctx.restore(); } },
  // bite check
  { a: () => EVT.everyone + 0.2, b: () => CL[3].start, draw: (ctx, T, a) => { const x = 380, y = 440, w = 310, h = 200; card(ctx, 'BITE CHECK', x, y, w, h, a); ctx.save(); ctx.globalAlpha = a; const k = prog(T, EVT.everyone + 0.4, EVT.everyone + 1.5);
      ctx.fillStyle = '#1a2440'; ctx.fillRect(x + 20, y + 70, w - 40, 22); ctx.fillStyle = '#7dffb0'; ctx.fillRect(x + 20, y + 70, (w - 40) * k, 22); txt(ctx, k < 1 ? 'SCANNING...' : 'CLEAR', x + w / 2, y + 140, 30, k < 1 ? '#ffd23a' : '#7dffb0', 'center'); ctx.restore(); } },
];
// captions
function merged(ws, ci) { const o = []; for (let i = 0; i < ws.length; i++) { const w = ws[i], n = ws[i + 1], p = ws[i - 1]; if (/^thirty$/i.test(w.w) && n && /^first$/i.test(n.w)) { o.push({ w: '31st', a: w.a, b: n.b }); i++; } else if (p && /^day$/i.test(p.w) && /^(six|seven)$/i.test(w.w)) o.push({ w: /six/i.test(w.w) ? '6.' : '7', a: w.a, b: w.b }); else if (p && /^rule$/i.test(p.w) && /^seven/i.test(w.w)) o.push({ w: '7.', a: w.a, b: w.b }); else o.push(w); } return o; }
const CAPS = [];
CL.forEach((c0, ci) => { const ws = merged(c0.words, ci); let cur = []; const flush = () => { if (cur.length) CAPS.push({ a: cur[0].a, b: cur[cur.length - 1].b, txt: cur.map(w => w.w).join(' ') }); cur = []; };
  ws.forEach(w => { if (cur.length && (cur.length >= 4 || w.a - cur[cur.length - 1].b > 0.2 || /^(Sam|And|Like|This|Day|You|The|Fences|Everyone|My|Please|Her|We|Rule|If|One|Sent|I'm|They're|Then|Jay|He|I'll|Tonight|No|At|Below|Mia's|But|On|Off|It's|With|Option|Land|Hover|Comment)$/.test(w.w) && cur.length > 1)) flush(); cur.push(w); }); flush(); });
CAPS.forEach((c, i) => { const nx = CAPS[i + 1]; c.b = nx ? Math.min(nx.a, c.b + 0.35) : c.b + 0.8; c.txt = c.txt.replace(/[:\-"]/g, ''); });
function captionBox(ctx, t) { ctx.save(); ctx.font = '50px Russo'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; const words = t.split(' '); const lines = []; let cur = ''; for (const w of words) { const x = cur ? cur + ' ' + w : w; if (ctx.measureText(x).width > 600 && cur) { lines.push(cur); cur = w; } else cur = x; } lines.push(cur);
  const y0 = 1080 - (lines.length - 1) * 31; lines.forEach((l, i) => { ctx.lineJoin = 'round'; ctx.lineWidth = 11; ctx.strokeStyle = '#05081a'; ctx.strokeText(l, 360, y0 + i * 62); ctx.fillStyle = '#fff'; ctx.fillText(l, 360, y0 + i * 62); }); ctx.restore(); }

let glc, out, octx, low, lctx, FOG, FILL, NFOG;
const V3 = new T3.Vector3();
window.initFootball = async function () {
  await Promise.all(['30px Russo', '20px PressStart'].map(f => document.fonts.load(f)));
  makeTextures(); makeTex();
  glc = document.createElement('canvas'); glc.width = RW; glc.height = RH;
  renderer = new T3.WebGLRenderer({ canvas: glc, antialias: false, preserveDrawingBuffer: true }); renderer.setPixelRatio(1); renderer.setSize(RW, RH, false); renderer.outputColorSpace = T3.SRGBColorSpace;
  camera = new T3.PerspectiveCamera(62, RW / RH, 0.05, 600); scene = new T3.Scene(); scene.background = new T3.Color('#000');
  hemi = new T3.HemisphereLight('#ffe6c8', '#3a2a20', 0.55); scene.add(hemi); buildFlat(); buildExtra();
  FOG = new T3.Fog('#9ab8d4', 60, 260); NFOG = new T3.Fog('#0b0f22', 40, 240); you = person(YOU); scene.add(you); FILL = new T3.PointLight('#ffeedd', 1.4, 7); scene.add(FILL); shoeL = B(0.18, 0.1, 0.32, '#1a1410', 0, 0, 0); shoeR = B(0.18, 0.1, 0.32, '#1a1410', 0, 0, 0); scene.add(shoeL, shoeR);
  torch = new T3.SpotLight('#fffbe0', 4, 8, 0.35, 0.5, 1); scene.add(torch); scene.add(torch.target); torch.visible = false;
  const moon = new T3.PointLight('#c8d4ff', 1.6, 9, 1.2); moon.position.set(-40.6, 2.0, -1.8); scene.add(moon);
  out = document.getElementById('c'); octx = out.getContext('2d'); low = document.createElement('canvas'); lctx = low.getContext('2d');
};
window.DURATION = TM.total;
window.renderFrame = function (T) {
  let ci = CL.findIndex(c => T >= c.start && T < c.start + c.dur); if (ci < 0) ci = CL.length - 1;
  const lt = T - CL[ci].start, D = CL[ci].dur;
  drawWindow(T, 0.9, false); drawTV(T, 'off'); for (const r of [ROOMS.bed, ROOMS.kit, ROOMS.bath]) { r.light.pl.intensity = 0; } ROOMS.bed.deskL.intensity = 0;
  you.visible = true; pose0(you); you.userData.body.scale.setScalar(1); torch.visible = false; heli.visible = false; commander.visible = false; jay.visible = false; pose0(jay); pose0(commander);
  flood.forEach(([pn, pl]) => { pl.intensity = 0; pn.material.color.set('#c8ccd4'); });
  soldiers.forEach((s_, i) => { s_.visible = true; pose0(s_); const p = [[STX - 4, 48.5], [STX + 4, 48.5], [STX - 12, 46], [STX + 12, 46], [STX + 8, -24], [STX - 9, 20]][i]; s_.position.set(p[0], 0, p[1]); s_.rotation.y = i < 4 ? Math.PI : 0.6; idle(s_, T + i); });
  survivors.forEach((p, i) => { pose0(p); const [hx, hz] = p.userData.home; p.visible = true; if (i < 14) { p.position.set(hx, 0, hz); p.rotation.y = Math.PI; idle(p, T + i); } else { const a = T * 0.15 + p.userData.o * 20; p.position.set(hx + S(a) * 3, 0, hz + C(a * 0.7) * 3); p.rotation.y = a; run(p, T * 4 + i, 0.3); } });
  { const wy = 1.8 + 30 * 2.6; const on = T > EVT.light8 - 0.1 && !(T > EVT.off - 0.05 && T < EVT.on2 - 0.05) && (T < EVT.on1 - 0.05 || T > EVT.on1 + 0.0 || true); const flash = T > EVT.light8 - 0.1 ? (T > EVT.off - 0.05 && T < EVT.on2 - 0.05 ? 0 : (S(T * 3) > -0.6 ? 1 : 0)) : 0;
    miaWin.material.color.set(flash ? '#fff8d0' : '#141418'); miaWinL.intensity = flash ? 4 : 0; mia.visible = T > CL[8].start; mia.position.set(NTX - 3, wy - 1.6, -40 + 4.2); mia.rotation.y = 0; pose0(mia); idle(mia, T); mia.userData.armR.rotation.x = -1.4; }
  roofZ.forEach((z, i) => { const [x, y, zz, o] = z.userData.p; z.visible = T > CL[7].start; pose0(z); z.position.set(x + S(T * 0.7 + o * 9) * 0.6, y, zz + C(T * 0.6 + o * 7) * 0.6); z.rotation.y = Math.atan2(heli.position.x - z.position.x, heli.position.z - z.position.z); run(z, T * 3 + i, 0.3); z.userData.armL.rotation.x = z.userData.armR.rotation.x = -2.4 + S(T * 4 + i) * 0.3; });
  if (ci >= 7) updCrowd(T); fires.forEach(([f, pl], i) => { f.scale.y = 1 + 0.25 * S(T * 9 + i); pl.intensity = 2.5 + S(T * 13 + i * 3) * 0.8; });
  DIR[ci](lt, T, D);
  you.updateMatrixWorld(true); bag.visible = you.visible; if (bag.visible) { you.userData.body.localToWorld(V3.set(0, 1.3, -0.26)); bag.position.copy(V3); bag.rotation.y = you.rotation.y; }
  FILL.position.copy(camera.position); FILL.visible = ci >= 3 && ci <= 6;
  renderer.render(scene, camera);
  const mz = clamp(1 - lt / 0.25); const f = mz > 0 && ci > 0 ? Math.max(1, Math.round(mz * 12)) : 1; octx.imageSmoothingEnabled = false;
  if (f > 1) { low.width = Math.ceil(RW / f); low.height = Math.ceil(RH / f); lctx.imageSmoothingEnabled = false; lctx.drawImage(glc, 0, 0, low.width, low.height); octx.drawImage(low, 0, 0, W, H); } else octx.drawImage(glc, 0, 0, W, H);
  octx.fillStyle = 'rgba(0,0,0,0.10)'; for (let y = 0; y < H; y += 5) octx.fillRect(0, y, W, 2);
  const vg = octx.createRadialGradient(360, 640, 420, 360, 640, 900); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.45)'); octx.fillStyle = vg; octx.fillRect(0, 0, W, H);
  if (ci === 0) { bigText(octx, 'THE LAST SEAT', 470, 80, '#ffd23a', prog(T, EVT.seat - 0.2, EVT.seat + 0.1)); if (T > EVT.flew - 0.1) bigText(octx, 'AWAY FROM HIS SISTER', 570, 46, '#ff8ad0', prog(T, EVT.flew + 0.3, EVT.flew + 0.6)); }
  likePill(octx, T);
  if (ci === 1) { const a = prog(lt, 0.0, 0.3); bigText(octx, 'THIS IS SAM', 470, 76, '#7dffb0', a); bigText(octx, 'DAY 6 . YOU VOTED B', 570, 44, '#ffd23a', prog(T, EVT.day1 - 0.1, EVT.day1 + 0.2)); bigText(octx, 'SAFE ZONE FIRST', 640, 60, '#fff', prog(T, EVT.safe1 - 0.1, EVT.safe1 + 0.2)); }
  tracker(octx, T);
  if (ci === 3) { if (T > EVT.no3 - 0.1 && T < EVT.we3 + 0.3) bigText(octx, 'THE ANSWER IS NO.', 560, 66, '#ff5a3a', prog(T, EVT.no3 - 0.1, EVT.no3 + 0.2)); if (T > EVT.we3) bigText(octx, 'NOT FOR ONE GIRL', 560, 56, '#fff', prog(T, EVT.we3, EVT.we3 + 0.3)); }
  { const t0 = EVT.rule - 0.15, t1 = t0 + 3.4; if (T >= t0 && T < t1) banner(octx, ['RULE 7.', 'FIND ANOTHER WAY'], prog(T, t0, t0 + 0.3), prog(T, t1 - 0.25, t1)); }
  if (ci === 4 && T > EVT.one4 - 0.2) phoneCard(octx, T, prog(T, EVT.one4 - 0.2, EVT.one4 + 0.1), ['1 NEW MESSAGE'], 'SENT 2 HOURS AGO', 4);
  if (ci === 5) phoneCard(octx, T, 1, ["I'M ON THE 31ST FLOOR.", ...(T > AT(5, "they're") - 0.1 ? ["THEY'RE ON THE STAIRS."] : []), ...(T > AT(5, 'my') - 0.1 ? ["MY WATER'S GONE."] : [])], 'SENT 2 HOURS AGO', 4);
  if (ci === 6) { if (T > EVT.jay - 0.1 && T < EVT.fly - 0.3) bigText(octx, 'JAY . PILOT', 560, 64, '#7dffb0', prog(T, EVT.jay - 0.1, EVT.jay + 0.2)); if (T > EVT.lost && T < EVT.saw - 0.2) bigText(octx, 'LOST HIS BROTHER', 640, 40, '#fff', prog(T, EVT.lost, EVT.lost + 0.3));
    if (T > EVT.fly - 0.1) { bigText(octx, "I'LL FLY YOU.", 540, 70, '#ffd23a', prog(T, EVT.fly - 0.1, EVT.fly + 0.2)); bigText(octx, 'TONIGHT. NO LIGHTS.', 620, 46, '#fff', prog(T, EVT.tonight - 0.1, EVT.tonight + 0.2)); } }
  if (ci === 7) { if (T < EVT.below - 0.3) bigText(octx, '12.00 AM', 520, 80, '#7ad0ff', prog(T, EVT.midnight - 0.1, EVT.midnight + 0.2)); else bigText(octx, 'THE WHOLE CITY IS MOVING', 560, 42, '#ff5a3a', prog(T, EVT.below, EVT.below + 0.3)); }
  if (ci === 8) { if (T < EVT.but8 - 0.2) bigText(octx, 'ROOF . OVERRUN', 560, 64, '#ff5a3a', prog(T, EVT.roof8 - 0.1, EVT.roof8 + 0.2)); else { bigText(octx, '31ST FLOOR', 450, 50, '#ffd23a', prog(T, EVT.but8, EVT.but8 + 0.3)); if (T > EVT.mia8 - 0.1) bigText(octx, "IT'S MIA", 560, 84, '#ff8ad0', prog(T, EVT.mia8 - 0.1, EVT.mia8 + 0.2)); } }
  if (ci === 9) { const optB = EVT.optB, comment = EVT.comment;
    if (T < comment - 0.1) { const A = T < optB - 0.2; bigText(octx, A ? 'A. LAND ON THE ROOF' : 'B. HOVER BY THE WINDOW', 520, A ? 58 : 52, A ? '#ffd23a' : '#7ad0ff', 1); bigText(octx, A ? 'FIGHT YOUR WAY DOWN' : 'PULL MIA OUT THROUGH THE GLASS', 600, A ? 40 : 34, '#fff', 1); }
    else { bigText(octx, 'COMMENT A OR B', 520, 70, '#ffd23a', prog(T, comment - 0.1, comment + 0.2)); bigText(octx, 'DAY 7 DECIDES...', 610, 40, '#fff', prog(T, comment + 0.8, comment + 1.1)); } }
  for (const d of DIAG) { const a0 = d.a(), b0 = d.b(); if (T >= a0 && T < b0) d.draw(octx, T, Math.min(prog(T, a0, a0 + 0.3), 1 - prog(T, b0 - 0.25, b0))); }
  const cap = CAPS.find(c => T >= c.a && T < c.b); if (cap) captionBox(octx, cap.txt);
  if (T < 0.2) { octx.fillStyle = `rgba(0,0,0,${1 - T / 0.2})`; octx.fillRect(0, 0, W, H); }
  if (T > TM.total - 0.8) { octx.fillStyle = `rgba(0,0,0,${prog(T, TM.total - 0.8, TM.total)})`; octx.fillRect(0, 0, W, H); }
};
})();
