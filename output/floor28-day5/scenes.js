// 28th Floor Day 5 — the chain, the roof, the helicopter. Retro low-poly 3D apartment (bedroom/kitchen/bathroom), survival log + diagrams.
(() => {
const { T3, RW, RH, W, H, clamp, lerp, ease, prog, rng, makeTextures, TX, mat, box, cyl, sph, person, run, idle, kick } = window.W3;
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

// ---------- Day 5: the chain, the roof, the helicopter ----------
function cam(p, l) { camera.position.set(p[0], p[1], p[2]); camera.lookAt(l[0], l[1], l[2]); }
function camL(a, b, k, la, lb) { k = ease(k); cam([lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)], [lerp(la[0], lb[0], k), lerp(la[1], lb[1], k), lerp(la[2], lb[2], k)]); }
const BX = -40, KX = 0, CX = 80, SX = 120, RX = 160;
const EVT = { swing: AT(0, 'swing'), sam: AT(1, 'sam'), grabs: AT(2, 'grabs'), phone: AT(2, 'phone'), heli: AT(2, 'helicopter'), one: AT(2, 'one'), two: AT(2, 'two'), three: AT(2, 'three'), clang: AT(3, 'clang'), holds: AT(3, 'holds'), echoes: AT(3, 'echoes'),
  rule: AT(4, 'rule'), swings: AT(4, 'swings'), snaps: AT(4, 'snaps'), below: AT(5, 'below'), running: AT(5, 'running'), dozens: AT(5, 'dozens'), bursts: AT(6, 'bursts'), away: AT(6, 'turning'), flare: AT(6, 'flare'), radio: AT(6, 'radio'),
  pin: AT(7, 'pin'), sprays: AT(7, 'sprays'), cloud: AT(7, 'cloud'), sees: AT(7, 'sees'), jams: AT(8, 'jams'), fists: AT(8, 'fists'), lands: AT(9, 'lands'), seat: AT(9, 'seat'), shows: AT(9, 'shows'), dies: AT(9, 'dies'), optB: AT(10, 'option', 1), comment: AT(10, 'comment') };
const HIT1 = EVT.clang, HIT2 = EVT.snaps - 0.25;
let bag, stair, zombs = [], roofDoor, chainG, ext, landWin, leak, leakL, roof, dL, dR, heli, rotor, trotor, puffs = [], sun, miaTower;
function signTex(s, bg = '#d8d4c8', fg = '#1a1a1a') { return TX.sign(s, bg, fg, 64, 48, 16); }
function buildExtra() {
  bag = new T3.Group(); B(0.36, 0.45, 0.2, '#2a4a6a', 0, 0, 0, bag); B(0.3, 0.16, 0.06, '#1e3a56', 0, -0.08, 0.12, bag); scene.add(bag);
  // stairwell at x=SX (same as Day 4)
  stair = new T3.Group(); stair.position.x = SX; scene.add(stair);
  const conc = new T3.MeshLambertMaterial({ map: TT.tile([2, 2]), color: '#b8b4ac' });
  B(4, 0.2, 3, conc, 0, -0.1, 1.5, stair);
  for (let i = 0; i < 12; i++) B(1.4, 0.25, 0.42, conc, -0.8, 0.125 + i * 0.25, -0.2 - i * 0.42, stair);
  B(4, 0.2, 2, conc, 0, 2.9, -6.2, stair);
  for (let i = 0; i < 12; i++) B(1.4, 0.25, 0.42, conc, 0.8, 3.125 + i * 0.25, -5.0 + i * 0.42, stair);
  B(4, 0.2, 3, conc, 0, 5.9, 1.3, stair);
  for (let i = 0; i < 10; i++) B(1.4, 0.25, 0.42, conc, 0.8, -0.125 - i * 0.25, 0.4 - i * 0.42, stair);
  const wallM = new T3.MeshLambertMaterial({ color: '#8a8676' }); for (const sx of [-1, 1]) { const w = new T3.Mesh(new T3.PlaneGeometry(14, 14), wallM); w.rotation.y = -sx * Math.PI / 2; w.position.set(sx * 2, 3, -2); stair.add(w); }
  const bw = new T3.Mesh(new T3.PlaneGeometry(4, 14), wallM); bw.position.set(0, 3, -7.2); stair.add(bw); const fw = new T3.Mesh(new T3.PlaneGeometry(4, 14), wallM); fw.position.set(0, 3, 2.8); fw.rotation.y = Math.PI; stair.add(fw);
  B(0.06, 9, 0.06, '#c8302a', 0, 3, -2.5, stair); for (let k = 0; k < 2; k++) { const r = B(0.05, 0.05, 5.3, '#c8302a', 0, 1.0 + k * 3, -2.6, stair); r.rotation.x = k ? -0.53 : 0.53; }
  for (const [n, y, z] of [['28', 1.6, 2.75], ['29', 4.6, -7.15], ['ROOF', 7.6, 2.75]]) { const s = new T3.Mesh(new T3.PlaneGeometry(0.7, 0.5), new T3.MeshBasicMaterial({ map: signTex(n) })); s.position.set(-1.2, y, z); if (z < 0) s.position.z = z + 0.02; else { s.rotation.y = Math.PI; s.position.z = z - 0.02; } stair.add(s); }
  roofDoor = B(1.1, 2.1, 0.1, '#5a6068', 0.6, 7.05, 2.72, stair); B(0.08, 0.3, 0.06, '#2a2a2a', 0.15, 7.0, 2.65, stair);
  chainG = new T3.Group(); scene.add(chainG); for (let i = 0; i < 9; i++) { const l = new T3.Mesh(new T3.TorusGeometry(0.05, 0.015, 4, 8), M('#8a8a90')); l.position.set(-0.25 + i * 0.06, Math.sin(i * 0.8) * 0.06, 0); l.rotation.y = i % 2 ? Math.PI / 2 : 0; chainG.add(l); } B(0.1, 0.12, 0.05, '#c8a040', 0.05, -0.14, 0, chainG);
  leak = B(1.1, 0.03, 0.02, new T3.MeshBasicMaterial({ color: '#ffffff' }), 0.6, 6.0, 2.66, stair); leakL = new T3.PointLight('#fff8e0', 2.2, 5); leakL.position.set(SX + 0.6, 6.4, 2.2); scene.add(leakL);
  ext = new T3.Group(); scene.add(ext); { const c = new T3.Mesh(new T3.CylinderGeometry(0.09, 0.09, 0.5, 8), M('#d02a20')); c.position.y = -0.1; ext.add(c); B(0.06, 0.08, 0.06, '#1a1a1a', 0, 0.19, 0, ext); B(0.03, 0.03, 0.16, '#1a1a1a', 0, 0.22, 0.08, ext); B(0.1, 0.12, 0.012, '#f0f0e8', 0, -0.1, 0.09, ext); }
  landWin = new T3.Group(); landWin.position.set(SX + 1.98, 4.3, -6.2); landWin.rotation.y = -Math.PI / 2; scene.add(landWin); { const p = new T3.Mesh(new T3.PlaneGeometry(1.0, 1.2), new T3.MeshBasicMaterial({ map: TT.rain })); landWin.add(p); }
  const fluo = new T3.PointLight('#d8e4d0', 1.0, 9); fluo.position.set(SX, 4.5, -2); scene.add(fluo);
  const ZC = [['#6a6e68', '#3a3a30'], ['#7a5a4a', '#2a2a3a'], ['#4a5a6a', '#3a3028'], ['#8a8a7a', '#2a2a2a'], ['#5a3a3a', '#3a3a4a'], ['#6a7a5a', '#2a2a30'], ['#3a3a4a', '#4a3a2a'], ['#9a8a6a', '#2a3a2a']];
  for (const [sh, tr] of ZC) { const z = person({ shirt: sh, trousers: tr, skin: '#9aaa88', hair: '#2a2a24' }); scene.add(z); zombs.push(z); }
  // ----- the roof at x=RX -----
  roof = new T3.Group(); roof.position.x = RX; scene.add(roof);
  const rf = new T3.Mesh(new T3.PlaneGeometry(24, 24), new T3.MeshLambertMaterial({ map: TT.tile([8, 8]), color: '#9a968e' })); rf.rotation.x = -Math.PI / 2; rf.position.z = 6; roof.add(rf);
  for (const [w, d, x, z] of [[24, 0.3, 0, -6], [24, 0.3, 0, 18], [0.3, 24, -12, 6], [0.3, 24, 12, 6]]) B(w, 0.7, d, '#8a8478', x, 0.35, z, roof);
  B(2.4, 2.6, 2, '#a09a8e', 0, 1.3, -0.2, roof); B(2.7, 0.16, 2.3, '#6a665e', 0, 2.68, -0.2, roof); B(1.3, 2.1, 0.02, '#1a1a1a', 0, 1.05, 0.805, roof);
  const rs = new T3.Mesh(new T3.PlaneGeometry(0.7, 0.3), new T3.MeshBasicMaterial({ map: signTex('ROOF', '#c8302a', '#fff') })); rs.position.set(0, 2.35, 0.82); roof.add(rs);
  const leaf = (side) => { const g = new T3.Group(); g.position.set(side * 0.62, 0, 0.84); roof.add(g); B(0.6, 2.05, 0.06, '#5a6068', -side * 0.3, 1.03, 0, g); B(0.05, 0.22, 0.06, '#d8d8d0', -side * 0.53, 1.05, 0.06, g); return g; };
  dL = leaf(-1); dR = leaf(1);
  B(1.4, 1.0, 1.1, '#b8bcc0', -6, 0.5, 3, roof); B(1.0, 0.1, 1.0, '#5a5e62', -6, 1.02, 3, roof); B(1.4, 1.0, 1.1, '#b8bcc0', 6, 0.5, 13, roof); B(1.0, 0.1, 1.0, '#5a5e62', 6, 1.02, 13, roof);
  roof.add(cyl(1.0, 1.0, 2.2, 8, '#7a6a5a', 8, 1.6, -3)); for (const [a, b] of [[-0.6, -0.6], [0.6, -0.6], [-0.6, 0.6], [0.6, 0.6]]) B(0.1, 0.6, 0.1, '#3a3a3a', 8 + a, 0.3, -3 + b, roof);
  const hp = new T3.Mesh(new T3.CircleGeometry(2.6, 16), new T3.MeshLambertMaterial({ color: '#4a4a4e' })); hp.rotation.x = -Math.PI / 2; hp.position.set(0, 0.012, 9.5); roof.add(hp);
  const hm = new T3.Mesh(new T3.PlaneGeometry(2.2, 2.2), new T3.MeshBasicMaterial({ map: TX.sign('H', '#4a4a4e', '#ffd23a', 64, 64, 40), transparent: false })); hm.rotation.x = -Math.PI / 2; hm.position.set(0, 0.02, 9.5); roof.add(hm);
  // city below
  const r = rng(55); const cols = ['#8a8a92', '#a8a090', '#6a7280', '#b0a898', '#7a6a62', '#9aa0a8'];
  for (let i = -6; i <= 6; i++) for (let j = -5; j <= 8; j++) { const x = i * 9, z = 6 + j * 9; if (Math.abs(x) < 15 && z > -10 && z < 22) continue; let h = 26 + r() * 36; if (x < 0 && x > -40 && z > 12) h = Math.min(h, 28); const b = B(6.5, h, 6.5, cols[(r() * 6) | 0], x, -40 + h / 2, z, roof); }
  miaTower = new T3.Group(); miaTower.position.set(-28, 0, 64); roof.add(miaTower); B(8, 76, 8, '#c0503a', 0, -20, 0, miaTower); for (let f = 0; f < 14; f++) for (let k = 0; k < 3; k++) B(1.2, 0.8, 0.05, '#2a2a3a', -2.5 + k * 2.5, 16 - f * 2.2, -4.03, miaTower);
  for (let i = 0; i < 9; i++) B(0.3, 0.8, 0.25, '#3a3a34', -3 + (i % 5) * 1.5 + (i > 4 ? 0.7 : 0), 18.4, -2 + (i > 4 ? 2 : 0) + (i % 2) * 0.6, miaTower);
  const ms = new T3.Mesh(new T3.PlaneGeometry(5, 1.4), new T3.MeshBasicMaterial({ map: TX.sign("MIA'S TOWER", '#1a1a1a', '#ff8ad0', 128, 32, 14) })); ms.position.set(0, 20.6, -4.1); ms.rotation.y = Math.PI; miaTower.add(ms);
  // helicopter (front = +z)
  heli = new T3.Group(); scene.add(heli);
  B(1.5, 1.3, 2.8, '#e8e4dc', 0, 0, 0, heli); B(1.52, 0.32, 2.82, '#c8302a', 0, -0.25, 0, heli); B(1.3, 0.8, 0.5, '#4a6a8a', 0, 0.15, 1.5, heli); B(0.02, 0.9, 1.0, '#1a1a1a', -0.76, 0.05, 0.2, heli);
  B(0.3, 0.3, 3.2, '#e8e4dc', 0, 0.3, -2.9, heli); B(0.08, 0.9, 0.6, '#c8302a', 0, 0.75, -4.4, heli); B(0.9, 0.5, 0.06, '#ffffff', 0.77, 0.1, 0, heli).rotation.y = Math.PI / 2;
  const cross = new T3.Mesh(new T3.PlaneGeometry(0.7, 0.7), new T3.MeshBasicMaterial({ map: TX.sign('+', '#ffffff', '#c8302a', 32, 32, 30) })); cross.position.set(0.77, 0.15, -0.6); cross.rotation.y = Math.PI / 2; heli.add(cross);
  for (const sx of [-1, 1]) { B(0.08, 0.08, 2.8, '#3a3a3a', sx * 0.7, -0.95, 0.1, heli); B(0.06, 0.35, 0.06, '#3a3a3a', sx * 0.6, -0.78, 0.7, heli); B(0.06, 0.35, 0.06, '#3a3a3a', sx * 0.6, -0.78, -0.5, heli); }
  rotor = new T3.Group(); rotor.position.set(0, 0.85, 0); heli.add(rotor); B(0.15, 0.25, 0.15, '#2a2a2a', 0, -0.1, 0, rotor); B(7.5, 0.04, 0.22, '#2a2a2a', 0, 0, 0, rotor); B(0.22, 0.04, 7.5, '#2a2a2a', 0, 0, 0, rotor);
  trotor = new T3.Group(); trotor.position.set(0.12, 0.75, -4.4); heli.add(trotor); B(0.03, 1.1, 0.12, '#2a2a2a', 0, 0, 0, trotor);
  const pil = person({ shirt: '#4a5a3a', trousers: '#4a5a3a', skin: '#c89a76', hair: '#1a1a1a' }); pil.scale.setScalar(0.7); pil.position.set(0.3, -0.75, 1.0); heli.add(pil); heli.userData.pil = pil;
  // extinguisher cloud
  const pm = new T3.MeshLambertMaterial({ color: '#ffffff', transparent: true, opacity: 0.85, emissive: '#8a8a8a' });
  for (let i = 0; i < 70; i++) { const p = new T3.Mesh(new T3.IcosahedronGeometry(0.25, 0), pm.clone()); scene.add(p); puffs.push(p); }
  sun = new T3.DirectionalLight('#fff2dc', 1.5); sun.position.set(RX + 12, 25, 18); sun.target.position.set(RX, 0, 4); scene.add(sun); scene.add(sun.target);
}
// ---------- motion helpers ----------
function armSwing(T) { let a = -1.0; for (const h of [HIT1, HIT2]) { if (T > h - 1.0 && T < h - 0.2) a = lerp(-1.0, -2.9, ease(prog(T, h - 1.0, h - 0.4))); else if (T >= h - 0.2 && T < h) a = lerp(-2.9, -0.6, prog(T, h - 0.2, h)); else if (T >= h && T < h + 0.5) a = lerp(-0.6, -1.0, prog(T, h, h + 0.5)); } return a; }
function stairPath(u) { u = clamp(u, 0, 2.05); if (u < 1) return [SX - 0.8, 3 * u, lerp(-0.2, -4.8, u), Math.PI]; if (u < 1.15) { const q = (u - 1) / 0.15; return [SX + lerp(-0.8, 0.8, q), 3, -5.6, Math.PI / 2 * 0 + lerp(Math.PI, 0, q)]; } const q = u - 1.15; return [SX + 0.8, 3 + 3 * q, lerp(-5, 0, q), 0]; }
function heliState(T) { const H0 = [RX + 1, 8, 11], H1 = [RX + 16, 11, 44], H2 = [RX + 22, 12, 58], HL = [RX, 0.98, 9.5];
  if (T < EVT.away - 0.3) return [...H0, 0, 0];
  if (T < EVT.sees) { const k = prog(T, EVT.away - 0.3, EVT.away + 4); const k2 = prog(T, EVT.away + 4, EVT.sees); const p = k < 1 ? H0.map((v, i) => lerp(v, H1[i], ease(k))) : H1.map((v, i) => lerp(v, H2[i], k2)); return [...p, lerp(0, 0.35, k), 0.15]; }
  const kt = prog(T, EVT.sees, EVT.sees + 1.8); const ka = ease(prog(T, EVT.sees + 0.8, EVT.lands + 0.1)); const p = H2.map((v, i) => lerp(v, HL[i], ka)); if (ka > 0.75) p[1] = lerp(lerp(H2[1], HL[1], 0.75) + 1.5, HL[1], ease((ka - 0.75) / 0.25)); return [...p, lerp(0.35, Math.PI + 0.25, ease(kt)), ka < 1 ? 0.12 : 0]; }
const NOZ = [RX + 0.3, 2.3, 3.7];
function updPuffs(T) { puffs.forEach((p, i) => { const te = EVT.sprays + i * 0.06; const age = T - te; if (age < 0 || T < EVT.sprays) { p.visible = false; return; } p.visible = true;
  const up = 2.4 * Math.pow(age, 0.65), sp = 0.35 * age; p.position.set(NOZ[0] + S(i * 2.3) * sp + 0.25 * age, NOZ[1] + up, NOZ[2] + C(i * 1.7) * sp + 0.15 * age); p.scale.setScalar(Math.min(4.5, 0.5 + age * 1.1)); p.material.opacity = 0.9 * clamp(1 - age / 22); p.rotation.set(i, i * 2, T * 0.2); }); }
function holdExt(T) { const u = you.userData; you.updateMatrixWorld(true); u.armR.localToWorld(V3.set(0, -0.7, 0.05)); ext.position.copy(V3); u.armR.getWorldQuaternion(ext.quaternion); ext.rotateX(Math.PI); }
const DIR = [
  // 0 hook: Sam with extinguisher raised at the chained door
  (lt, T, D) => { you.position.set(SX + 0.6, 5.9, 1.7); you.rotation.y = 0; idle(you, T); const a = lerp(-1.0, -2.6, ease(prog(T, 0.3, 2.0))); you.userData.armR.rotation.x = you.userData.armL.rotation.x = a; you.userData.armL.rotation.z = 0.3; ext.userData.hold = 1;
    if (T < EVT.swing + 0.8) camL([SX - 0.2, 7.1, 1.9], [SX - 0.1, 7.05, 2.0], prog(T, 0, EVT.swing + 0.8), [SX + 0.15, 7.0, 2.62], [SX + 0.15, 7.0, 2.62]); else camL([SX - 1.3, 7.0, 0.9], [SX - 1.4, 7.1, 0.7], prog(T, EVT.swing + 0.8, D), [SX + 0.4, 7.0, 2.2], [SX + 0.4, 7.1, 2.2]); },
  // 1 this is Sam
  (lt, T, D) => { you.position.set(SX + 0.6, 5.9, 1.7); you.rotation.y = Math.PI * 0.85; idle(you, T); camL([SX + 0.0, 7.4, -0.4], [SX + 0.2, 7.5, 0.0], prog(lt, 0, D), [SX + 0.6, 7.3, 1.7], [SX + 0.6, 7.45, 1.7]); },
  // 2 grabs extinguisher, phone, helicopter above, count
  (lt, T, D) => { you.position.set(SX + 0.4, 5.9, 1.6); if (T < EVT.grabs + 0.8) { you.rotation.y = -Math.PI / 2; idle(you, T); you.userData.armR.rotation.x = -1.4 * ease(prog(T, EVT.grabs - 0.2, EVT.grabs + 0.4)); ext.userData.hold = T > EVT.grabs + 0.4 ? 1 : 0; cam([SX + 1.2, 7.0, 0.4], [SX - 1.6, 6.7, 1.6]); }
    else if (T < EVT.one - 0.2) { you.rotation.y = 0; idle(you, T); ext.userData.hold = 1; you.userData.head.rotation.x = T > EVT.heli ? -0.5 : 0; if (T > EVT.heli) { leakL.intensity = 2.2 + 1.3 * (S(T * 30) > 0 ? 1 : 0); } camL([SX - 1.4, 7.0, 2.4], [SX - 1.3, 7.1, 2.3], prog(T, EVT.grabs + 0.8, EVT.one), [SX + 0.4, 7.3, 1.6], [SX + 0.4, 7.5, 1.7]); }
    else { you.rotation.y = 0; idle(you, T); ext.userData.hold = 1; const a = -1.0 - 0.6 * ease(prog(T, EVT.one - 0.2, EVT.three + 0.3)); you.userData.armR.rotation.x = you.userData.armL.rotation.x = a; cam([SX - 1.3, 7.0, 0.9], [SX + 0.4, 7.0, 2.2]); } },
  // 3 CLANG — chain holds — echo down the shaft
  (lt, T, D) => { you.position.set(SX + 0.4, 5.9, 1.7); you.rotation.y = 0; idle(you, T); ext.userData.hold = 1; you.userData.armR.rotation.x = you.userData.armL.rotation.x = armSwing(T);
    if (T < EVT.echoes - 0.2) cam([SX - 1.3, 7.0, 0.9], [SX + 0.4, 7.0, 2.2]); else camL([SX + 0.6, 8.6, 0.6], [SX + 0.6, 8.2, 0.5], prog(T, EVT.echoes - 0.2, CL[4].start), [SX + 0.6, -4, -3.0], [SX + 0.6, -6, -3.0]); },
  // 4 rule 6 — second swing — lock snaps
  (lt, T, D) => { you.position.set(SX + 0.4, 5.9, 1.7); you.rotation.y = 0; idle(you, T); ext.userData.hold = 1; you.userData.armR.rotation.x = you.userData.armL.rotation.x = armSwing(T);
    if (T < EVT.swings - 0.3) camL([SX - 1.4, 7.2, 2.4], [SX - 1.3, 7.3, 2.3], prog(T, CL[4].start, EVT.swings), [SX + 0.4, 7.2, 1.7], [SX + 0.4, 7.3, 1.7]); else if (T < EVT.snaps + 0.2) cam([SX - 1.3, 7.0, 0.9], [SX + 0.4, 7.0, 2.2]); else camL([SX + 0.3, 6.6, 2.0], [SX + 0.3, 6.4, 2.0], prog(T, EVT.snaps + 0.2, CL[5].start), [SX + 0.15, 6.2, 2.6], [SX + 0.15, 6.0, 2.6]); },
  // 5 the infected run up the stairs
  (lt, T, D) => { you.position.set(SX - 0.9, 5.9, 2.0); you.rotation.y = Math.PI * 0.8; idle(you, T); ext.userData.hold = 1; const k = T - CL[5].start;
    zombs.forEach((z, i) => { z.visible = true; const u = Math.min(1.9 - i * 0.04, 1.45 - i * 0.14 + k * 0.05 + Math.max(0, T - EVT.running) * 0.16); const [x, y, zz, ry] = stairPath(u); z.position.set(x + (i % 2 ? 0.25 : -0.25), y, zz); z.rotation.y = ry; run(z, T * (T > EVT.running ? 7 : 3) + i, T > EVT.running ? 0.8 : 0.4); z.userData.armL.rotation.x = z.userData.armR.rotation.x = -1.5 + S(T * 9 + i) * 0.2; });
    camL([SX - 0.2, 8.0, 1.6], [SX + 0.0, 7.6, 1.2], prog(T, CL[5].start, CL[6].start), [SX + 0.7, 3.4, -4.0], [SX + 0.7, 3.8, -3.2]); },
  // 6 bursts onto the roof — helicopter turning away
  (lt, T, D) => { const ok = ease(prog(T, EVT.bursts - 0.1, EVT.bursts + 0.25)); dL.rotation.y = ok * 1.9; dR.rotation.y = -ok * 1.9; ext.userData.hold = 1; const p = prog(T, EVT.bursts, EVT.bursts + 1.2);
    you.position.set(RX + 0.3 * p, 0, lerp(0.4, 3.7, ease(p))); you.rotation.y = p < 1 ? 0 : 0.2; if (p > 0 && p < 1) run(you, T * 7, 0.7); else idle(you, T); you.userData.head.rotation.x = p >= 1 ? -0.35 : 0;
    if (T < EVT.away - 0.3) camL([RX + 2.8, 1.4, 6.2], [RX + 2.4, 1.5, 5.6], prog(T, CL[6].start, EVT.away), [RX, 1.2, 1.5], [RX + 0.2, 1.4, 2.5]); else { const h = heliState(T); cam([RX - 1.8, 1.2, 2.6], [h[0], h[1], h[2]]); } },
  // 7 pulls the pin — white cloud — pilot sees it
  (lt, T, D) => { you.position.set(RX + 0.3, 0, 3.7); you.rotation.y = 0.2; idle(you, T); ext.userData.hold = 1; const up = ease(prog(T, EVT.pin, EVT.sprays)); you.userData.armR.rotation.x = lerp(-1.0, -2.9, up); you.userData.armL.rotation.x = lerp(0, -2.6, up); you.userData.head.rotation.x = -0.4 * up;
    if (T < EVT.sprays - 0.2) camL([RX + 1.2, 1.5, 5.2], [RX + 1.0, 1.6, 4.9], prog(T, CL[7].start, EVT.sprays), [RX + 0.3, 1.3, 3.7], [RX + 0.3, 1.6, 3.7]); else if (T < EVT.sees - 0.2) camL([RX + 4.5, 0.9, 7.5], [RX + 5.0, 1.0, 8.5], prog(T, EVT.sprays - 0.2, EVT.sees), [RX + 0.6, 3.5, 3.9], [RX + 1.0, 6.0, 4.4]); else { const h = heliState(T); cam([RX - 1.8, 1.2, 2.2], [h[0], h[1], h[2]]); } },
  // 8 jams extinguisher through the door handles
  (lt, T, D) => { ext.userData.hold = T < EVT.jams + 0.6 ? 1 : 2; const wk = prog(T, CL[8].start, EVT.jams); you.position.set(RX + lerp(0.3, 0.05, wk), 0, lerp(3.7, 1.4, ease(wk))); you.rotation.y = Math.PI; if (wk > 0 && wk < 1) run(you, T * 6, 0.5); else idle(you, T); you.userData.armR.rotation.x = you.userData.armL.rotation.x = T > EVT.jams - 0.3 && T < EVT.jams + 0.8 ? -1.5 : -0.6;
    if (T > EVT.fists - 0.1) { const b = Math.max(0, S(T * 22)) * 0.12 * (1 + S(T * 3)); dL.rotation.y = b; dR.rotation.y = -b * 0.8; you.position.z = 1.4 + 0.6 * ease(prog(T, EVT.fists, EVT.fists + 0.6)); }
    if (T < EVT.fists - 0.2) camL([RX + 1.6, 1.6, 3.4], [RX + 1.3, 1.4, 2.8], prog(T, CL[8].start, EVT.fists), [RX, 1.2, 1.0], [RX, 1.1, 0.9]); else cam([RX - 1.2, 1.3, 2.4], [RX + 0.1, 1.1, 0.85]); },
  // 9 helicopter lands — one seat — phone dies
  (lt, T, D) => { ext.userData.hold = 2; const wk = prog(T, EVT.lands + 0.3, EVT.shows); you.position.set(RX + lerp(0.05, -1.2, wk), 0, lerp(2.0, 7.6, ease(wk))); you.rotation.y = 0; if (wk > 0 && wk < 1) run(you, T * 6, 0.5); else idle(you, T); if (T > EVT.shows) you.userData.armR.rotation.x = -1.4;
    { const b = Math.max(0, S(T * 22)) * 0.1; dL.rotation.y = b; dR.rotation.y = -b * 0.8; }
    if (T < EVT.seat - 0.2) camL([RX + 5.5, 2.4, 2.5], [RX + 5.0, 2.0, 3.0], prog(T, CL[9].start, EVT.seat), [RX + 1, 1.8, 11], [RX, 1.0, 9.6]); else camL([RX - 2.6, 1.7, 6.2], [RX - 2.4, 1.7, 6.6], prog(T, EVT.seat - 0.2, CL[10].start), [RX - 0.4, 1.3, 8.6], [RX - 0.6, 1.3, 8.4]); },
  // 10 decision
  (lt, T, D) => { ext.userData.hold = 2; you.position.set(RX - 1.2, 0, 7.6); you.rotation.y = 0.4; idle(you, T); const b = Math.max(0, S(T * 22)) * 0.14 * (1 + 0.5 * S(T * 2)); dL.rotation.y = b; dR.rotation.y = -b * 0.8;
    if (T < EVT.optB - 0.2) camL([RX - 1.8, 2.4, 3.2], [RX - 2.2, 2.8, 2.6], prog(T, CL[10].start, EVT.optB), [RX - 26, 21, 64], [RX - 28, 23, 64]); else if (T < EVT.comment - 0.1) camL([RX + 3.5, 1.8, 11], [RX + 3.0, 1.7, 11.5], prog(T, EVT.optB, EVT.comment), [RX - 0.6, 1.2, 8], [RX - 0.8, 1.3, 8]); else cam([RX - 0.8, 1.2, 3.0], [RX, 1.2, 0.8]); },
];

// ---------- HUD ----------
function bigText(ctx, txt, y, size, col = '#ffd23a', a = 1, font = 'Russo') { if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.font = `${size}px ${font}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round'; ctx.lineWidth = size * 0.22; ctx.strokeStyle = '#05081a'; ctx.strokeText(txt, 360, y); ctx.fillStyle = col; ctx.fillText(txt, 360, y); ctx.restore(); }
function card(ctx, title, x, y, w, h, a) { ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = 'rgba(6,14,40,0.92)'; ctx.fillRect(x, y, w, h); ctx.strokeStyle = '#7ad0ff'; ctx.lineWidth = 4; ctx.strokeRect(x, y, w, h); ctx.fillStyle = '#ffd23a'; ctx.fillRect(x, y, w, 34); ctx.font = '16px PressStart'; ctx.fillStyle = '#06102a'; ctx.textBaseline = 'middle'; ctx.fillText(title, x + 14, y + 18); ctx.restore(); }
function dot(ctx, x, y, r, c) { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); }
function txt(ctx, s, x, y, size, c, align = 'left', font = 'Russo') { ctx.font = `${size}px ${font}`; ctx.fillStyle = c; ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.fillText(s, x, y); ctx.textAlign = 'left'; }
function clockStr(T) { return `12.0${Math.min(9, Math.floor(T / 8))} PM`; }
function phonePct(T) { return T < EVT.clang ? '7%' : T < EVT.bursts ? '5%' : T < EVT.lands ? '3%' : T < EVT.dies ? '1%' : 'DEAD'; }
function tracker(ctx, T) { if (T < CL[1].start) return; const a = prog(T, CL[1].start, CL[1].start + 0.4);
  const heliS = T < EVT.away ? 'OVERHEAD' : T < EVT.sees ? 'LEAVING' : T < EVT.lands ? 'COMING BACK' : 'LANDED';
  const rows = [['DAY', '5', '#fff', []], ['TIME', clockStr(T), '#ffd23a', []], ['HELICOPTER', heliS, T > EVT.away && T < EVT.sees ? '#ff5a3a' : '#7dffb0', [EVT.away, EVT.sees, EVT.lands]], ['PHONE', phonePct(T), '#ff5a3a', [EVT.clang, EVT.bursts, EVT.lands, EVT.dies]],
    ['NOISE', T < EVT.clang ? 'SILENT' : 'LOUD!', T < EVT.clang ? '#7dffb0' : '#ff5a3a', [EVT.clang]], ['INFECTED', T < EVT.below ? '?' : T < EVT.fists ? 'CLIMBING' : 'AT THE DOOR', '#ff5a3a', [EVT.below, EVT.fists]],
    ['EXTINGUISHER', T < EVT.grabs + 0.4 ? 'ON WALL' : T < EVT.sprays + 1 ? 'FULL' : T < EVT.jams ? 'EMPTY' : 'DOOR JAM', '#ffd23a', [EVT.grabs + 0.4, EVT.sprays + 1, EVT.jams]], ['MIA', 'HIDING', '#ff8ad0', []], ['LOCATION', T > EVT.bursts ? 'ROOF' : 'STAIRWELL', T > EVT.bursts ? '#7dffb0' : '#ff8a5a', [EVT.bursts]]];
  ctx.save(); ctx.globalAlpha = a; ctx.translate(14, 60); ctx.scale(1.2, 1.2); const hh = 30 + rows.length * 34; ctx.fillStyle = 'rgba(6,14,40,0.82)'; ctx.fillRect(0, 0, 250, hh); ctx.strokeStyle = '#7ad0ff'; ctx.lineWidth = 3; ctx.strokeRect(0, 0, 250, hh);
  ctx.fillStyle = '#ffd23a'; ctx.fillRect(0, 0, 250, 26); ctx.font = '14px PressStart'; ctx.fillStyle = '#06102a'; ctx.textBaseline = 'middle'; ctx.fillText("SAM'S LOG", 12, 14);
  rows.forEach(([k, v, col, ts], i) => { const y = 45 + i * 34; let fl = 0; for (const t0 of ts) if (T > t0 && T < t0 + 0.6) fl = 1 - (T - t0) / 0.6; if (fl) { ctx.fillStyle = `rgba(255,255,255,${0.35 * fl})`; ctx.fillRect(4, y - 15, 242, 30); }
    ctx.font = '11px PressStart'; ctx.fillStyle = '#9ab0d0'; ctx.textAlign = 'left'; ctx.fillText(k, 10, y); ctx.font = '19px Russo'; ctx.fillStyle = col; ctx.textAlign = 'right'; ctx.fillText(v, 240, y + 1); ctx.textAlign = 'left'; }); ctx.restore(); }
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
  // noise travels down the building
  { a: () => EVT.echoes - 0.1, b: () => CL[4].start, draw: (ctx, T, a) => { const x = 400, y = 380, w = 290, h = 560; card(ctx, 'NOISE', x, y, w, h, a); ctx.save(); ctx.globalAlpha = a; const k = prog(T, EVT.echoes, CL[4].start - 0.3);
      for (let i = 0; i < 14; i++) { const fy = y + 60 + i * 32; const lit = k * 14 > i; ctx.fillStyle = lit ? `rgba(255,${90 - i * 4},60,${0.9 - i * 0.03})` : '#1a2440'; ctx.fillRect(x + 90, fy, 170, 26); txt(ctx, String(28 - i * 2), x + 75, fy + 14, 18, lit ? '#fff' : '#5a6a8a', 'right'); }
      for (let r = 0; r < 3; r++) { const rr = ((T * 90 + r * 40) % 120); ctx.strokeStyle = `rgba(255,210,58,${1 - rr / 120})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x + 175, y + 70, rr, 0.2, Math.PI - 0.2); ctx.stroke(); }
      txt(ctx, '28 FLOORS', x + w / 2, y + h - 30, 26, '#ff5a3a', 'center'); ctx.restore(); } },
  // signal options checklist
  { a: () => EVT.flare - 0.2, b: () => EVT.cloud, draw: (ctx, T, a) => { const x = 330, y = 430, w = 370, h = 340; card(ctx, 'HOW TO GET SEEN', x, y, w, h, a); ctx.save(); ctx.globalAlpha = a;
      [['FLARE', EVT.flare, 0], ['RADIO', EVT.radio, 0], ['PHONE 3%', EVT.radio + 0.4, 0], ['EXTINGUISHER', EVT.pin, 1]].forEach(([s, t0, ok], i) => { const yy = y + 80 + i * 62; const on = T > t0; ctx.strokeStyle = '#7ad0ff'; ctx.lineWidth = 3; ctx.strokeRect(x + 20, yy - 18, 36, 36); if (on) txt(ctx, ok ? '✓' : '✗', x + 38, yy + 2, 32, ok ? '#7dffb0' : '#ff5a3a', 'center'); txt(ctx, s, x + 76, yy, 26, on ? (ok ? '#7dffb0' : '#ff8a7a') : '#5a6a8a'); });
      if (T > EVT.sprays) txt(ctx, 'WHITE CLOUD = SEEN', x + w / 2, y + h - 30, 15, '#7dffb0', 'center', 'PressStart'); ctx.restore(); } },
];
// captions
function merged(ws, ci) { const o = []; for (let i = 0; i < ws.length; i++) { const w = ws[i], n = ws[i + 1], p = ws[i - 1]; if (/^twenty$/i.test(w.w) && n && /^eighth?$/i.test(n.w)) { o.push({ w: '28', a: w.a, b: n.b }); i++; } else if (/^seven$/i.test(w.w) && n && /^percent$/i.test(n.w)) { o.push({ w: '7%', a: w.a, b: n.b }); i++; } else if (p && /^day$/i.test(p.w) && /^(five|6)$/i.test(w.w.replace(/[^a-z0-9]/gi, ''))) o.push({ w: /five/i.test(w.w) ? '5.' : w.w, a: w.a, b: w.b }); else if (p && /^rule$/i.test(p.w) && /^six/i.test(w.w)) o.push({ w: '6.', a: w.a, b: w.b }); else o.push(w); } return o; }
const CAPS = [];
CL.forEach((c0, ci) => { const ws = merged(c0.words, ci); let cur = []; const flush = () => { if (cur.length) CAPS.push({ a: cur[0].a, b: cur[cur.length - 1].b, txt: cur.map(w => w.w).join(' ') }); cur = []; };
  ws.forEach(w => { if (cur.length && (cur.length >= 4 || w.a - cur[cur.length - 1].b > 0.2 || /^(One|That's|Because|This|Day|You|Smash|He|Phone|The|Clang|And|Rule|If|Below|Dozens|But|No|So|A|Then|Just|Sam|Option|Fly|Go|Comment)$/.test(w.w) && cur.length > 1)) flush(); cur.push(w); }); flush(); });
CAPS.forEach((c, i) => { const nx = CAPS[i + 1]; c.b = nx ? Math.min(nx.a, c.b + 0.35) : c.b + 0.8; c.txt = c.txt.replace(/[:\-"]/g, ''); });
function captionBox(ctx, t) { ctx.save(); ctx.font = '50px Russo'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; const words = t.split(' '); const lines = []; let cur = ''; for (const w of words) { const x = cur ? cur + ' ' + w : w; if (ctx.measureText(x).width > 600 && cur) { lines.push(cur); cur = w; } else cur = x; } lines.push(cur);
  const y0 = 1080 - (lines.length - 1) * 31; lines.forEach((l, i) => { ctx.lineJoin = 'round'; ctx.lineWidth = 11; ctx.strokeStyle = '#05081a'; ctx.strokeText(l, 360, y0 + i * 62); ctx.fillStyle = '#fff'; ctx.fillText(l, 360, y0 + i * 62); }); ctx.restore(); }

let glc, out, octx, low, lctx, FOG, FILL;
const V3 = new T3.Vector3();
window.initFootball = async function () {
  await Promise.all(['30px Russo', '20px PressStart'].map(f => document.fonts.load(f)));
  makeTextures(); makeTex();
  glc = document.createElement('canvas'); glc.width = RW; glc.height = RH;
  renderer = new T3.WebGLRenderer({ canvas: glc, antialias: false, preserveDrawingBuffer: true }); renderer.setPixelRatio(1); renderer.setSize(RW, RH, false); renderer.outputColorSpace = T3.SRGBColorSpace;
  camera = new T3.PerspectiveCamera(62, RW / RH, 0.05, 200); scene = new T3.Scene(); scene.background = new T3.Color('#000');
  hemi = new T3.HemisphereLight('#ffe6c8', '#3a2a20', 0.55); scene.add(hemi); buildFlat(); buildExtra();
  FOG = new T3.Fog('#9ab8d4', 40, 150); you = person(YOU); scene.add(you); FILL = new T3.PointLight('#ffeedd', 1.4, 7); scene.add(FILL); shoeL = B(0.18, 0.1, 0.32, '#1a1410', 0, 0, 0); shoeR = B(0.18, 0.1, 0.32, '#1a1410', 0, 0, 0); scene.add(shoeL, shoeR);
  torch = new T3.SpotLight('#fffbe0', 4, 8, 0.35, 0.5, 1); scene.add(torch); scene.add(torch.target); torch.visible = false;
  const moon = new T3.PointLight('#c8d4ff', 1.6, 9, 1.2); moon.position.set(-40.6, 2.0, -1.8); scene.add(moon);
  out = document.getElementById('c'); octx = out.getContext('2d'); low = document.createElement('canvas'); lctx = low.getContext('2d');
};
window.DURATION = TM.total;
window.renderFrame = function (T) {
  let ci = CL.findIndex(c => T >= c.start && T < c.start + c.dur); if (ci < 0) ci = CL.length - 1;
  const lt = T - CL[ci].start, D = CL[ci].dur;
  const onRoof = ci >= 6; scene.background.set(onRoof ? '#9ab8d4' : '#000000'); scene.fog = onRoof ? FOG : null; sun.visible = onRoof;
  drawWindow(T, 0.9, false); setLight(onRoof ? 0.75 : 0.85, 0); drawTV(T, 'off');
  you.visible = true; pose0(you); you.userData.body.scale.setScalar(1); torch.visible = false; zombs.forEach(z => z.visible = false); leakL.intensity = 2.2; ext.userData.hold = 0; dL.rotation.y = dR.rotation.y = T > EVT.bursts ? 1.9 : 0;
  // chain: hangs until it snaps, then drops
  { const k = prog(T, EVT.snaps - 0.05, EVT.snaps + 0.5); chainG.position.set(SX + 0.15, lerp(7.0, 6.03, k * k), lerp(2.62, 2.3, k)); chainG.rotation.set(k * 1.5, 0, k * 0.6); const j = T > HIT1 && T < HIT1 + 0.4 ? S(T * 80) * 0.03 : 0; chainG.position.x += j; }
  DIR[ci](lt, T, D);
  // extinguisher: on wall / in hands / jammed
  if (ext.userData.hold === 1) holdExt(T); else if (ext.userData.hold === 2) { ext.position.set(RX, 1.05, 0.93); ext.rotation.set(0, 0, Math.PI / 2); } else { ext.position.set(SX - 1.9, 6.7, 1.6); ext.rotation.set(0, 0, 0); }
  { const h = heliState(T); heli.position.set(h[0], h[1] + (h[4] ? S(T * 2) * 0.15 : 0), h[2]); heli.rotation.set(h[4], h[3], 0); rotor.rotation.y = T * 31; trotor.rotation.x = T * 40; heli.visible = onRoof; }
  updPuffs(T); puffs.forEach(p => p.visible = p.visible && onRoof);
  you.updateMatrixWorld(true); bag.visible = true; you.userData.body.localToWorld(V3.set(0, 1.3, -0.26)); bag.position.copy(V3); bag.rotation.y = you.rotation.y;
  FILL.position.copy(camera.position); FILL.visible = !onRoof;
  renderer.render(scene, camera);
  let shake = 0; for (const [h, s] of [[HIT1, 18], [HIT2, 24], [EVT.fists, 8]]) if (T > h && T < h + 0.45) shake = Math.max(shake, s * (1 - (T - h) / 0.45));
  const sx = (Math.random() - 0.5) * shake, sy = (Math.random() - 0.5) * shake;
  const mz = clamp(1 - lt / 0.25); const f = mz > 0 && ci > 0 ? Math.max(1, Math.round(mz * 12)) : 1; octx.imageSmoothingEnabled = false; octx.fillStyle = '#000'; octx.fillRect(0, 0, W, H);
  if (f > 1) { low.width = Math.ceil(RW / f); low.height = Math.ceil(RH / f); lctx.imageSmoothingEnabled = false; lctx.drawImage(glc, 0, 0, low.width, low.height); octx.drawImage(low, sx, sy, W, H); } else octx.drawImage(glc, sx - shake, sy - shake, W + shake * 2, H + shake * 2);
  for (const h of [HIT1, HIT2]) if (T > h && T < h + 0.18) { octx.fillStyle = `rgba(255,255,255,${0.7 * (1 - (T - h) / 0.18)})`; octx.fillRect(0, 0, W, H); }
  octx.fillStyle = 'rgba(0,0,0,0.10)'; for (let y = 0; y < H; y += 5) octx.fillRect(0, y, W, 2);
  const vg = octx.createRadialGradient(360, 640, 420, 360, 640, 900); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.45)'); octx.fillStyle = vg; octx.fillRect(0, 0, W, H);
  if (ci === 0) { bigText(octx, 'ONE SWING', 500, 96, '#ffd23a', prog(T, EVT.swing - 0.2, EVT.swing + 0.1)); bigText(octx, 'EVERYTHING WILL HEAR IT', 600, 42, '#ff5a3a', prog(T, AT(0, 'everything') - 0.1, AT(0, 'everything') + 0.2)); }
  if (ci === 1) { const a = prog(lt, 0.0, 0.3); bigText(octx, 'THIS IS SAM', 740, 76, '#7dffb0', a); bigText(octx, 'DAY 5 . YOU VOTED A', 830, 44, '#ffd23a', prog(lt, wt(1, 'day') - 0.1, wt(1, 'day') + 0.2)); bigText(octx, 'SMASH THE CHAIN', 910, 60, '#fff', prog(lt, wt(1, 'smash') - 0.1, wt(1, 'smash') + 0.2)); }
  tracker(octx, T);
  if (ci === 2) { if (T > EVT.heli && T < EVT.one - 0.2) bigText(octx, 'HELICOPTER ABOVE', 560, 54, '#7dffb0', prog(T, EVT.heli, EVT.heli + 0.3)); for (const [n, t0] of [['1', EVT.one], ['2', EVT.two], ['3', EVT.three]]) if (T > t0 - 0.05 && T < t0 + 0.55) bigText(octx, n, 600, 260 - 80 * prog(T, t0, t0 + 0.55), '#ffd23a', 1 - prog(T, t0 + 0.3, t0 + 0.55)); }
  if (ci === 3) { if (T > HIT1 && T < HIT1 + 1.2) { octx.save(); octx.translate(360, 560); octx.rotate(-0.12); octx.scale(1 + 0.3 * (1 - prog(T, HIT1, HIT1 + 0.2)), 1 + 0.3 * (1 - prog(T, HIT1, HIT1 + 0.2))); octx.translate(-360, -560); bigText(octx, 'CLANG!', 560, 150, '#ffd23a', 1 - prog(T, HIT1 + 0.9, HIT1 + 1.2), 'Bangers'); octx.restore(); }
    if (T > EVT.holds - 0.1 && T < EVT.echoes - 0.2) bigText(octx, 'THE CHAIN HOLDS', 560, 66, '#ff5a3a', prog(T, EVT.holds - 0.1, EVT.holds + 0.2)); }
  { const t0 = EVT.rule - 0.15, t1 = t0 + 3.4; if (T >= t0 && T < t1) banner(octx, ['RULE 6.', 'MAKE NOISE COUNT'], prog(T, t0, t0 + 0.3), prog(T, t1 - 0.25, t1)); }
  if (ci === 4 && T > HIT2 && T < CL[5].start) { octx.save(); octx.translate(360, 560); octx.rotate(0.1); octx.translate(-360, -560); bigText(octx, 'SNAP!', 560, 150, '#7dffb0', 1, 'Bangers'); octx.restore(); }
  if (ci === 5 && T > EVT.dozens - 0.1) bigText(octx, 'DOZENS', 560, 110, '#ff5a3a', prog(T, EVT.dozens - 0.1, EVT.dozens + 0.2));
  if (ci === 6 && T > EVT.away && T < EVT.flare - 0.2) bigText(octx, 'TURNING AWAY', 560, 76, '#ff5a3a', prog(T, EVT.away, EVT.away + 0.3));
  if (ci === 7 && T > EVT.sees - 0.1) bigText(octx, 'THE PILOT SEES IT', 560, 62, '#7dffb0', prog(T, EVT.sees - 0.1, EVT.sees + 0.2));
  if (ci === 8) { if (T > EVT.jams + 0.4 && T < EVT.fists - 0.1) bigText(octx, 'DOOR JAMMED', 560, 76, '#ffd23a', prog(T, EVT.jams + 0.4, EVT.jams + 0.7)); if (T > EVT.fists - 0.1) bigText(octx, 'BANG BANG BANG', 560, 70, '#ff5a3a', prog(T, EVT.fists - 0.1, EVT.fists + 0.2), 'Bangers'); }
  if (ci === 9) { if (T > EVT.seat - 0.1 && T < EVT.shows - 0.2) bigText(octx, 'ONE SEAT LEFT', 560, 76, '#7dffb0', prog(T, EVT.seat - 0.1, EVT.seat + 0.2)); if (T > EVT.shows - 0.2) phoneCard(octx, T, prog(T, EVT.shows - 0.2, EVT.shows + 0.1), ["THEY'RE IN MY BUILDING.", "I'M HIDING.", 'PLEASE COME GET ME.'], "MIA'S TOWER . 4 MILES", 1, prog(T, EVT.dies + 0.15, EVT.dies + 0.35)); }
  for (const d of DIAG) { const a0 = d.a(), b0 = d.b(); if (T >= a0 && T < b0) d.draw(octx, T, Math.min(prog(T, a0, a0 + 0.3), 1 - prog(T, b0 - 0.25, b0))); }
  if (ci === 10) { const optB = EVT.optB, comment = EVT.comment;
    if (T < comment - 0.1) { const A = T < optB - 0.2; bigText(octx, A ? "A. FLY TO MIA NOW" : 'B. SAFE ZONE FIRST', 520, 58, A ? '#ffd23a' : '#7ad0ff', 1); bigText(octx, A ? 'HER ROOF IS OVERRUN' : 'GET HELP . LOSE HOURS', 600, 40, '#fff', 1); }
    else { bigText(octx, 'COMMENT A OR B', 520, 70, '#ffd23a', prog(T, comment - 0.1, comment + 0.2)); bigText(octx, 'DAY 6 DECIDES...', 610, 40, '#fff', prog(T, comment + 0.8, comment + 1.1)); } }
  const cap = CAPS.find(c => T >= c.a && T < c.b); if (cap) captionBox(octx, cap.txt);
  if (T < 0.2) { octx.fillStyle = `rgba(0,0,0,${1 - T / 0.2})`; octx.fillRect(0, 0, W, H); }
  if (T > TM.total - 0.8) { octx.fillStyle = `rgba(0,0,0,${prog(T, TM.total - 0.8, TM.total)})`; octx.fillRect(0, 0, W, H); }
};
})();
