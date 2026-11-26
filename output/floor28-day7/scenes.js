// 28th Floor Day 5 — the chain, the roof, the helicopter. Retro low-poly 3D apartment (bedroom/kitchen/bathroom), survival log + diagrams.
(() => {
const { T3, RW, RH, W, H, clamp, lerp, ease, prog, rng, makeTextures, TX, mat, box, cyl, sph, person, run, idle, kick, ground, crowdStand } = window.W3;
const TM = window.TIMING, CL = TM.clips;
const S = Math.sin, C = Math.cos, PI = Math.PI;
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
const EVT = { like: AT(0, 'like'), final: AT(0, 'final'), day1: AT(1, 'day'), win1: AT(1, 'the'), torch: AT(2, 'torch'), but2: AT(2, 'but'), sealed: AT(2, 'sealed'), rule: AT(3, 'rule'), grabs: AT(3, 'grabs'), tells: AT(3, 'he'), swing: AT(3, 'swing'), explodes: AT(3, 'explodes'),
  door: AT(4, 'bursts'), found: AT(4, 'they'), reaches: AT(5, 'reaches'), jumps: AT(5, 'jumps'), second: AT(5, 'for'), catches: AT(5, 'catches'), pulls: AT(6, 'pulls'), away: AT(6, 'away'), hands: AT(6, 'and'), shaking: AT(7, 'shaking'), gives: AT(7, 'gives'), four: AT(7, 'four'),
  sunrise: AT(8, 'sunrise'), seven: AT(8, 'seven'), twenty: AT(8, 'twenty'), one8: AT(8, 'one'), rules: AT(9, 'rules'), r1: AT(9, "don't"), r2: AT(9, 'stay'), r3: AT(9, 'know'), r4: AT(9, 'and'), thanks: AT(9, 'thanks'), comment: AT(9, 'comment') };
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
function env(kind) { if (kind === 'dawn') { scene.background.set('#f2a878'); scene.fog = NFOG2; sun.visible = false; moon.visible = false; dawnSun.intensity = 2.2; hemi.intensity = 0.9; hemi.color.set('#ffd8b8'); hemi.groundColor.set('#5a4a3a'); return; } dawnSun.intensity = 0; if (kind === 'cabin') { scene.background.set('#05060a'); scene.fog = null; sun.visible = false; moon.visible = false; hemi.intensity = 0.45; hemi.color.set('#a8b0d0'); hemi.groundColor.set('#1a1a20'); return; }
  const day = kind === 'day', night = kind === 'night', tent = kind === 'tent'; scene.background.set(day ? '#9ab8d4' : night ? '#0b0f22' : '#000000'); scene.fog = day ? FOG : night ? NFOG : null; sun.visible = day; moon.visible = night;
  hemi.intensity = day ? 0.95 : night ? 0.85 : 0.5; hemi.color.set(day ? '#eef2f8' : night ? '#5a6a9a' : '#ffe0b0'); hemi.groundColor.set(day ? '#5a4a3a' : '#0a0a10'); }
function heliAt(x, y, z, ry, tilt, T) { heli.visible = true; heli.position.set(x, y + S(T * 2) * 0.12, z); heli.rotation.set(tilt, ry, 0); rotor.rotation.y = T * 31; trotor.rotation.x = T * 40; }
function crouchRun(p, T) { run(p, T * 9, 0.7); p.userData.body.position.y = -0.3; p.userData.body.rotation.x = 0.35; }
// ---------- Day 7 builds ----------
const WY = 1.8 + 30 * 2.6, CBX = 1100; const R7 = {}; let T7, glass, shards = [], doorG, zIn = [], axe, cabin, chocBar, torchL, dawnSun, pilotSeat;
function buildDay7() { const r = rng(707);
  T7 = new T3.Group(); T7.position.set(0, 0, -40); nightCity.add(T7); const brick = M('#8a4a3a'), dark = new T3.MeshBasicMaterial({ color: '#141418' });
  B(10, WY - 1.4, 10, brick, 0, (WY - 1.4) / 2, 0, T7); const up = 90 - (WY + 1.4); B(10, up, 10, brick, 0, WY + 1.4 + up / 2, 0, T7); B(10.6, 0.8, 10.6, '#3a1a18', 0, 90.4, 0, T7);
  B(10, 2.8, 4, brick, 0, WY, -3, T7); for (const sx of [-1, 1]) B(0.4, 2.8, 6, brick, sx * 4.8, WY, 2, T7); B(0.8, 2.8, 0.4, brick, -4.6, WY, 4.8, T7); B(6.8, 2.8, 0.4, brick, 1.6, WY, 4.8, T7); B(2.4, 0.4, 0.4, brick, -3, WY + 1.2, 4.8, T7); B(2.4, 0.5, 0.4, brick, -3, WY - 1.15, 4.8, T7);
  for (let f = 0; f < 34; f++) { if (Math.abs(1.8 + f * 2.6 - WY) < 1.5) continue; for (let k = 0; k < 3; k++) B(1.6, 1.2, 0.06, dark, -3 + k * 3, 1.8 + f * 2.6, 5.03, T7); }
  const ns = new T3.Mesh(new T3.PlaneGeometry(6, 1.6), new T3.MeshBasicMaterial({ map: TX.sign("MIA'S TOWER", '#1a1a1a', '#ff8ad0', 128, 32, 14) })); ns.position.set(0, 87, 5.06); T7.add(ns);
  // Mia's bedroom
  B(9.2, 0.05, 5.6, '#8a6a5a', 0, WY - 1.37, 1.8, T7); const wp = new T3.Mesh(new T3.PlaneGeometry(9.2, 2.8), M('#c88aa8')); wp.position.set(0, WY, -0.98); T7.add(wp);
  B(2.2, 0.5, 1.3, '#e8e0f0', 3.2, WY - 1.1, 2.6, T7); B(2.2, 0.15, 1.3, '#f28ab8', 3.2, WY - 0.8, 2.6, T7); B(0.7, 0.18, 0.5, '#ffffff', 3.9, WY - 0.65, 2.6, T7);
  for (const [x, c] of [[-1.2, '#5ac8e8'], [0.2, '#f2d04a']]) { const p = new T3.Mesh(new T3.PlaneGeometry(0.7, 0.9), M(c)); p.position.set(x, WY + 0.3, -0.96); T7.add(p); }
  doorG = new T3.Group(); doorG.position.set(-3.6, WY - 1.37, -0.95); T7.add(doorG); B(1.0, 2.1, 0.08, '#7a5a4a', 0.5, 1.05, 0, doorG); B(0.08, 0.08, 0.1, '#c8a040', 0.88, 1.0, 0.06, doorG); B(1.2, 2.25, 0.05, '#2a1a14', 2.3, WY - 0.3, -0.99, T7).visible = false;
  glass = new T3.Mesh(new T3.PlaneGeometry(2.4, 2.0), new T3.MeshLambertMaterial({ color: '#a8c8e8', transparent: true, opacity: 0.35, side: T3.DoubleSide })); glass.position.set(-3, WY, 4.95); T7.add(glass);
  for (let i = 0; i < 30; i++) { const s_ = new T3.Mesh(new T3.ConeGeometry(0.12 + r() * 0.14, 0.02, 3), new T3.MeshLambertMaterial({ color: '#cfe4f8', transparent: true, opacity: 0.7 })); s_.rotation.x = PI / 2; s_.userData = { x: -3 + (r() - 0.5) * 2.2, y: WY + (r() - 0.5) * 1.8, vx: (r() - 0.5) * 3, vy: r() * 2, vz: 2 + r() * 4, spin: (r() - 0.5) * 12 }; T7.add(s_); shards.push(s_); }
  for (let i = 0; i < 4; i++) { const z = person({ shirt: ['#6a6e68', '#7a5a4a', '#4a5a6a', '#5a3a3a'][i], trousers: '#2a2a2a', skin: '#9aaa88', hair: '#2a2a24' }); scene.add(z); zIn.push(z); }
  torchL = new T3.SpotLight('#fffbe0', 0, 25, 0.5, 0.5, 1); scene.add(torchL); scene.add(torchL.target); R7.search = new T3.SpotLight('#eef4ff', 0, 60, 0.35, 0.4, 1); scene.add(R7.search); scene.add(R7.search.target); R7.fill = new T3.PointLight('#c8d4ff', 0, 30, 1.2); scene.add(R7.fill);
  axe = new T3.Group(); scene.add(axe); B(0.05, 0.9, 0.05, '#8a5a2a', 0, 0.2, 0, axe); B(0.04, 0.22, 0.3, '#c8302a', 0, 0.6, 0.1, axe); B(0.04, 0.18, 0.05, '#d8dce2', 0, 0.6, 0.27, axe);
  chocBar = new T3.Group(); scene.add(chocBar); B(0.16, 0.025, 0.07, '#5a2a14', 0, 0, 0, chocBar); B(0.1, 0.027, 0.071, '#c8302a', 0.02, 0, 0, chocBar);
  // helicopter cabin set
  cabin = new T3.Group(); cabin.position.x = CBX; scene.add(cabin); B(4, 0.1, 3, '#2a2c30', 0, 0, 0, cabin); B(4, 2.2, 0.1, '#3a3c42', 0, 1.1, -1.4, cabin); B(0.1, 2.2, 3, '#34363c', -2, 1.1, 0, cabin); B(4, 0.1, 3, '#2a2c30', 0, 2.2, 0, cabin);
  B(3, 0.45, 0.6, '#4a5a3a', 0, 0.45, -1.0, cabin); B(3, 0.6, 0.12, '#4a5a3a', 0, 0.85, -1.3, cabin);
  const sky = ctex(64, 64, (c) => { const g = c.createLinearGradient(0, 0, 0, 64); g.addColorStop(0, '#1a2a5a'); g.addColorStop(0.7, '#c86a6a'); g.addColorStop(1, '#ffb070'); c.fillStyle = g; c.fillRect(0, 0, 64, 64); for (let k = 0; k < 20; k++) { c.fillStyle = '#ffd890'; c.fillRect((k * 23) % 64, 50 + (k % 4) * 3, 1, 1); } });
  for (const x of [-0.9, 0.9]) { const w_ = new T3.Mesh(new T3.CircleGeometry(0.32, 20), new T3.MeshBasicMaterial({ map: sky })); w_.position.set(x, 1.45, -1.34); cabin.add(w_); }
  const cl = new T3.PointLight('#ffc890', 1.6, 6, 1.5); cl.position.set(0, 1.9, 0.5); cabin.add(cl); const bl = new T3.PointLight('#7a9aff', 1.2, 6, 1.5); bl.position.set(0, 1.4, -1.0); cabin.add(bl);
  dawnSun = new T3.DirectionalLight('#ffb070', 0); dawnSun.position.set(STX - 80, 25, -60); dawnSun.target.position.set(STX, 0, 0); scene.add(dawnSun); scene.add(dawnSun.target); }
function sitPose(p) { p.userData.body.position.y = -0.55; p.userData.legL.rotation.x = p.userData.legR.rotation.x = -1.5; }
function holdAxe() { const u = you.userData; you.updateMatrixWorld(true); u.armR.localToWorld(V3.set(0, -0.65, 0.05)); axe.position.copy(V3); u.armR.getWorldQuaternion(axe.quaternion); axe.rotateX(PI); }
const winW = () => [NTX - 3, WY, -35];
function heliHover(T, off = 0) { heli.scale.setScalar(2.2); heliAt(NTX - 3 + off * 0.3, WY + 0.25, -31.4 + off, -PI / 2, 0, T); }
function samDoor(T) { you.visible = true; you.position.set(NTX - 3, WY - 1.25 + S(T * 2) * 0.12, -33.4 + 0); you.rotation.y = PI; idle(you, T); }
function miaAtWindow(T, z = -35.9) { mia.visible = true; pose0(mia); mia.position.set(NTX - 3, WY - 1.37, z); mia.rotation.y = 0; idle(mia, T); }
const DIR = [
  // 0 hook: tower at night, helicopter beside the lit window
  (lt, T, D) => { env('night'); you.visible = false; heliHover(T, 6 - 6 * ease(prog(T, 0, 3))); miaAtWindow(T); mia.userData.armR.rotation.x = -1.4; if (T < EVT.final - 0.2) camL([NTX + 30, 60, 10], [NTX + 22, 70, -4], prog(T, 0, EVT.final), [NTX - 3, WY - 10, -35], [NTX - 3, WY, -35]); else camL([NTX + 12, WY + 6, -18], [NTX + 8, WY + 3, -22], prog(T, EVT.final, CL[1].start), [NTX - 3, WY, -35], [NTX - 3, WY, -35]); },
  // 1 Day 7 title — Sam in the helicopter door
  (lt, T, D) => { env('night'); heliHover(T); samDoor(T); miaAtWindow(T); camL([NTX - 0.8, WY + 0.7, -34.7], [NTX - 1.2, WY + 0.6, -34.6], prog(lt, 0, D), [NTX - 3, WY + 0.3, -33.4], [NTX - 3, WY + 0.4, -33.4]); },
  // 2 steady by the glass, torch flash, window sealed
  (lt, T, D) => { env('night'); heliHover(T); samDoor(T); miaAtWindow(T); mia.userData.armR.rotation.x = -1.6; if (T > EVT.but2) { you.userData.armR.rotation.x = -1.4; mia.userData.armL.rotation.x = -1.8 + S(T * 6) * 0.3; }
    if (T < EVT.torch - 0.2) camL([NTX + 10, WY + 3, -26], [NTX + 6, WY + 2, -28], prog(T, CL[2].start, EVT.torch), [NTX - 3, WY, -33], [NTX - 3, WY, -34]); else camL([NTX - 1.5, WY + 0.4, -33.2], [NTX - 1.8, WY + 0.4, -33.6], prog(T, EVT.torch, CL[3].start), [NTX - 3, WY + 0.2, -35.5], [NTX - 3, WY + 0.2, -35.8]); },
  // 3 rule 8: the axe, cover your face, one swing, glass explodes
  (lt, T, D) => { env('night'); heliHover(T); samDoor(T); miaAtWindow(T, -36.6); axe.visible = T > EVT.grabs + 0.3; const u = you.userData; u.armR.rotation.x = T < EVT.swing - 0.5 ? -0.9 : T < EVT.swing ? lerp(-0.9, -2.8, prog(T, EVT.swing - 0.5, EVT.swing - 0.1)) : lerp(-2.8, -0.8, prog(T, EVT.swing, EVT.swing + 0.25));
    if (T > EVT.tells) { mia.userData.armL.rotation.x = mia.userData.armR.rotation.x = -2.6; mia.userData.armL.rotation.z = 0.5; mia.userData.armR.rotation.z = -0.5; mia.rotation.y = PI * 0.9; }
    if (T < EVT.tells - 0.2) camL([NTX - 0.6, WY + 0.6, -34.6], [NTX - 0.9, WY + 0.5, -34.5], prog(T, CL[3].start, EVT.tells), [NTX - 3, WY + 0.4, -33.4], [NTX - 3, WY + 0.5, -33.4]); else camL([NTX - 2.0, WY + 1.0, -32.4], [NTX - 2.2, WY + 0.9, -32.7], prog(T, EVT.tells, CL[4].start), [NTX - 3, WY + 0.1, -35.6], [NTX - 3, WY + 0.1, -35.8]); },
  // 4 the bedroom door bursts open
  (lt, T, D) => { env('night'); heliHover(T); samDoor(T); miaAtWindow(T, -35.6); mia.rotation.y = T > EVT.door ? PI : 0; mia.userData.armR.rotation.x = -1.4;
    zIn.forEach((z, i) => { z.visible = T > EVT.door + 0.2 + i * 0.25; const k = prog(T, EVT.door + 0.2 + i * 0.25, CL[5].start + 2); z.position.set(NTX - 3.1 + (i - 1.5) * 0.55, WY - 1.37, -40 - 0.6 + lerp(0, 2.4, k)); z.rotation.y = (i - 1.5) * 0.15; run(z, T * 4 + i, 0.5); z.userData.armL.rotation.x = z.userData.armR.rotation.x = -1.5; });
    you.visible = false; camL([NTX - 3.0, WY + 0.6, -33.0], [NTX - 3.0, WY + 0.5, -33.6], prog(lt, 0, D), [NTX - 3.1, WY - 0.2, -40], [NTX - 3.1, WY - 0.2, -40]); },
  // 5 reach — jump — slow motion over the drop — catch
  (lt, T, D) => { env('night'); heliHover(T); samDoor(T); you.userData.armR.rotation.x = -1.6; you.userData.body.rotation.x = 0.25; mia.visible = true; pose0(mia);
    const jk = prog(T, EVT.jumps, EVT.catches), sm = jk < 0.15 ? jk / 0.15 * 0.4 : 0.4 + (jk - 0.15) / 0.85 * 0.6; mia.position.set(NTX - 3, WY - 1.37 + S(sm * PI) * 0.6 - sm * 0.2, lerp(-35.6, -33.9, sm)); mia.rotation.y = 0; mia.userData.armR.rotation.x = mia.userData.armL.rotation.x = -2.6; mia.userData.legL.rotation.x = 0.5; mia.userData.legR.rotation.x = -0.4; if (T < EVT.jumps) { miaAtWindow(T, -35.6); mia.userData.armR.rotation.x = -1.6; }
    zIn.forEach((z, i) => { z.visible = true; z.position.set(NTX - 3.9 + i * 0.6, WY - 1.37, -38.4 + lerp(0, 1.6, prog(T, CL[5].start, CL[6].start))); z.rotation.y = 0; run(z, T * 4 + i, 0.5); z.userData.armL.rotation.x = z.userData.armR.rotation.x = -1.5; });
    if (T < EVT.second - 0.2) camL([NTX - 2.0, WY + 1.0, -32.4], [NTX - 2.2, WY + 0.9, -32.6], prog(T, CL[5].start, EVT.second), [NTX - 3, WY - 0.2, -35.4], [NTX - 3, WY - 0.2, -35.2]); else if (T < EVT.catches - 0.2) camL([NTX + 1.5, WY - 5, -33.5], [NTX + 1.2, WY - 6.5, -33.6], prog(T, EVT.second, EVT.catches), [NTX - 3, WY - 0.3, -34.6], [NTX - 3, WY - 0.2, -34.6]); else cam([NTX - 0.6, WY + 0.3, -34.5], [NTX - 3, WY - 0.2, -33.8]); },
  // 6 pull in, fly away, hands reaching out of the window
  (lt, T, D) => { env('night'); const k = ease(prog(T, EVT.away - 0.4, CL[7].start)); heliHover(T, k * 12); heli.position.y += k * 4; you.visible = true; you.position.set(heli.position.x, heli.position.y - 1.5, heli.position.z - 2.0); you.rotation.y = PI; idle(you, T); mia.visible = true; pose0(mia); mia.position.set(heli.position.x + 0.6, heli.position.y - 1.5, heli.position.z - 1.7); mia.rotation.y = PI; idle(mia, T);
    zIn.forEach((z, i) => { z.visible = i < 3; z.position.set(NTX - 3.8 + i * 0.8, WY - 1.37, -35.6); z.rotation.y = 0; pose0(z); z.userData.body.rotation.x = 0.3; z.userData.armL.rotation.x = z.userData.armR.rotation.x = -1.6 + S(T * 7 + i) * 0.25; });
    if (T < EVT.hands - 0.2) camL([NTX + 8, WY + 2, -25], [NTX + 14, WY + 5, -18], prog(T, CL[6].start, EVT.hands), [heli.position.x, heli.position.y, heli.position.z], [heli.position.x, heli.position.y, heli.position.z]); else camL([NTX - 3, WY + 0.4, -30.5], [NTX - 3, WY + 0.6, -29.5], prog(T, EVT.hands, CL[7].start), [NTX - 3, WY, -35], [NTX - 3, WY, -35]); },
  // 7 in the cabin: the chocolate bar
  (lt, T, D) => { env('cabin'); you.visible = true; pose0(you); you.position.set(CBX - 0.4, 0.05, -0.9); you.rotation.y = 0.15; sitPose(you); mia.visible = true; pose0(mia); mia.position.set(CBX + 0.5, 0.05, -0.9); mia.rotation.y = -0.2; sitPose(mia); mia.position.x += S(T * 25) * (T < EVT.gives ? 0.01 : 0.003);
    const gk = ease(prog(T, EVT.gives, EVT.gives + 0.9)); you.userData.armR.rotation.x = -1.2 * (1 - gk * 0.3); mia.userData.armL.rotation.x = -1.0 * gk; you.updateMatrixWorld(true); chocBar.visible = true; const hp = you.userData.armR.localToWorld(new T3.Vector3(0, -0.65, 0.1)); const mp = mia.userData.armL.localToWorld(new T3.Vector3(0, -0.65, 0.1)); chocBar.position.lerpVectors(hp, mp, prog(T, EVT.gives + 0.5, EVT.gives + 1.0)); chocBar.rotation.set(0, 0.3, 0);
    if (T < EVT.gives - 0.2) camL([CBX + 0.1, 1.3, 1.9], [CBX + 0.05, 1.25, 1.6], prog(T, CL[7].start, EVT.gives), [CBX, 0.9, -0.9], [CBX, 0.9, -0.9]); else camL([CBX + 0.5, 1.15, 1.1], [CBX + 0.4, 1.1, 0.9], prog(T, EVT.gives, CL[8].start), [CBX + 0.05, 0.8, -0.8], [CBX + 0.05, 0.82, -0.8]); },
  // 8 sunrise landing at the safe zone, the hug
  (lt, T, D) => { env('dawn'); heli.scale.setScalar(1); const lk = ease(prog(T, CL[8].start, EVT.seven)); heliAt(STX, lerp(20, 0.98, lk), 0, PI, 0, T);
    if (T > EVT.seven - 0.2) { you.visible = true; pose0(you); you.position.set(STX - 0.45, 0, 3); you.rotation.y = PI / 2; you.userData.armL.rotation.x = you.userData.armR.rotation.x = -1.2; you.userData.armL.rotation.z = 0.5; you.userData.armR.rotation.z = -0.5; mia.visible = true; pose0(mia); mia.position.set(STX + 0.25, 0, 3); mia.rotation.y = -PI / 2; mia.userData.armL.rotation.x = mia.userData.armR.rotation.x = -1.5; } else you.visible = false;
    if (T < EVT.seven - 0.2) camL([STX + 30, 18, 40], [STX + 20, 10, 28], prog(T, CL[8].start, EVT.seven), [STX, 4, 0], [STX, 2, 0]); else camL([STX + 2.5, 1.7, 6.2], [STX + 1.8, 1.6, 5.4], prog(T, EVT.seven, CL[9].start), [STX - 0.1, 1.3, 3], [STX - 0.1, 1.35, 3]); },
  // 9 the rules, the end
  (lt, T, D) => { env('dawn'); heli.scale.setScalar(1); heliAt(STX, 0.98, 0, PI, 0, T); rotor.rotation.y = T * 2; you.visible = true; pose0(you); you.position.set(STX - 0.4, 0, 3); you.rotation.y = PI * 0.95; mia.visible = true; pose0(mia); mia.position.set(STX + 0.4, 0, 3); mia.rotation.y = PI * 1.05; you.userData.armR.rotation.z = -0.3; mia.userData.armL.rotation.z = 0.3;
    camL([STX + 0.2, 1.6, 7.5], [STX + 0.2, 2.4, 10], prog(lt, 0, D), [STX, 1.4, -20], [STX, 4, -40]); },
];

// ---------- HUD ----------
function bigText(ctx, txt, y, size, col = '#ffd23a', a = 1, font = 'Russo') { if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.font = `${size}px ${font}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round'; ctx.lineWidth = size * 0.22; ctx.strokeStyle = '#05081a'; ctx.strokeText(txt, 360, y); ctx.fillStyle = col; ctx.fillText(txt, 360, y); ctx.restore(); }
function card(ctx, title, x, y, w, h, a) { ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = 'rgba(6,14,40,0.92)'; ctx.fillRect(x, y, w, h); ctx.strokeStyle = '#7ad0ff'; ctx.lineWidth = 4; ctx.strokeRect(x, y, w, h); ctx.fillStyle = '#ffd23a'; ctx.fillRect(x, y, w, 34); ctx.font = '16px PressStart'; ctx.fillStyle = '#06102a'; ctx.textBaseline = 'middle'; ctx.fillText(title, x + 14, y + 18); ctx.restore(); }
function dot(ctx, x, y, r, c) { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); }
function txt(ctx, s, x, y, size, c, align = 'left', font = 'Russo') { ctx.font = `${size}px ${font}`; ctx.fillStyle = c; ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.fillText(s, x, y); ctx.textAlign = 'left'; }
function clockStr(T) { if (T < CL[7].start) return '12.' + String(20 + Math.floor(T / 4)).padStart(2, '0') + ' AM'; if (T < CL[8].start) return '1.10 AM'; return '6.0' + Math.min(9, Math.floor((T - CL[8].start) / 3)) + ' AM'; }
function tracker(ctx, T) { if (T < CL[1].start || T > CL[9].start) return; const a = prog(T, CL[1].start, CL[1].start + 0.4);
  const mia_ = T < EVT.jumps ? '31ST FLOOR' : T < EVT.catches ? 'MID AIR' : T < CL[8].start ? 'ON BOARD' : 'SAFE';
  const rows = [['DAY', '7', '#fff', []], ['TIME', clockStr(T), '#ffd23a', [CL[7].start, CL[8].start]], ['LOCATION', T < CL[7].start - 1 ? "MIA'S TOWER" : T < CL[8].start ? 'IN THE AIR' : 'SAFE ZONE', '#7dffb0', [CL[7].start, CL[8].start]],
    ['MIA', mia_, mia_ === 'MID AIR' ? '#ff5a3a' : '#ff8ad0', [EVT.jumps, EVT.catches, CL[8].start]], ['WINDOW', T < EVT.explodes ? 'SEALED' : 'SMASHED', T < EVT.explodes ? '#ff5a3a' : '#7dffb0', [EVT.explodes]],
    ['INFECTED', T < EVT.door ? 'ON THE ROOF' : T < CL[7].start ? 'IN HER ROOM' : 'LEFT BEHIND', '#ff5a3a', [EVT.door, CL[7].start]], ['FUEL', `${Math.max(9, Math.round(24 - T * 0.2))}%`, '#ffd23a', []], ['CHOCOLATE', T < EVT.gives + 0.8 ? 'SAVED' : 'GIVEN', '#ff8ad0', [EVT.gives + 0.8]]];
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
const DIAG = [];
// captions
function merged(ws, ci) { const o = []; for (let i = 0; i < ws.length; i++) { const w = ws[i], n = ws[i + 1], p = ws[i - 1]; if (/^thirty$/i.test(w.w) && n && /^one$/i.test(n.w)) { o.push({ w: '31', a: w.a, b: n.b }); i++; } else if (/^twenty$/i.test(w.w) && n && /^eight$/i.test(n.w)) { o.push({ w: '28', a: w.a, b: n.b }); i++; } else if (p && /^day$/i.test(p.w) && /^(seven|four)$/i.test(w.w)) o.push({ w: /seven/i.test(w.w) ? '7.' : '4', a: w.a, b: w.b }); else if (p && /^rule$/i.test(p.w) && /^eight/i.test(w.w)) o.push({ w: '8.', a: w.a, b: w.b }); else if (/^seven$/i.test(w.w) && n && /^days$/i.test(n.w)) o.push({ w: '7', a: w.a, b: w.b }); else o.push(w); } return o; }
const CAPS = [];
CL.forEach((c0, ci) => { const ws = merged(c0.words, ci); let cur = []; const flush = () => { if (cur.length) CAPS.push({ a: cur[0].a, b: cur[cur.length - 1].b, txt: cur.map(w => w.w).join(' ') }); cur = []; };
  ws.forEach(w => { if (cur.length && (cur.length >= 4 || w.a - cur[cur.length - 1].b > 0.2 || /^(Thirty|One|And|This|Like|Day|You|The|Jay|Mia's|But|It's|Rule|Use|Sam|He|Then|They|Mia|For|So|At|Seven|Twenty|Sam's|Don't|Stay|Know|Thanks|Comment)$/.test(w.w) && cur.length > 1)) flush(); cur.push(w); }); flush(); });
CAPS.forEach((c, i) => { const nx = CAPS[i + 1]; c.b = nx ? Math.min(nx.a, c.b + 0.35) : c.b + 0.8; c.txt = c.txt.replace(/[:\-"]/g, ''); });
function captionBox(ctx, t) { ctx.save(); ctx.font = '50px Russo'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; const words = t.split(' '); const lines = []; let cur = ''; for (const w of words) { const x = cur ? cur + ' ' + w : w; if (ctx.measureText(x).width > 600 && cur) { lines.push(cur); cur = w; } else cur = x; } lines.push(cur);
  const y0 = 1080 - (lines.length - 1) * 31; lines.forEach((l, i) => { ctx.lineJoin = 'round'; ctx.lineWidth = 11; ctx.strokeStyle = '#05081a'; ctx.strokeText(l, 360, y0 + i * 62); ctx.fillStyle = '#fff'; ctx.fillText(l, 360, y0 + i * 62); }); ctx.restore(); }

let glc, out, octx, low, lctx, FOG, FILL, NFOG, NFOG2;
const V3 = new T3.Vector3();
window.initFootball = async function () {
  await Promise.all(['30px Russo', '20px PressStart'].map(f => document.fonts.load(f)));
  makeTextures(); makeTex();
  glc = document.createElement('canvas'); glc.width = RW; glc.height = RH;
  renderer = new T3.WebGLRenderer({ canvas: glc, antialias: false, preserveDrawingBuffer: true }); renderer.setPixelRatio(1); renderer.setSize(RW, RH, false); renderer.outputColorSpace = T3.SRGBColorSpace;
  camera = new T3.PerspectiveCamera(62, RW / RH, 0.05, 600); scene = new T3.Scene(); scene.background = new T3.Color('#000');
  hemi = new T3.HemisphereLight('#ffe6c8', '#3a2a20', 0.55); scene.add(hemi); buildFlat(); buildExtra(); buildDay7();
  FOG = new T3.Fog('#9ab8d4', 60, 260); NFOG = new T3.Fog('#0b0f22', 40, 240); NFOG2 = new T3.Fog('#f2b088', 60, 260); you = person(YOU); scene.add(you); FILL = new T3.PointLight('#ffeedd', 1.4, 7); scene.add(FILL); shoeL = B(0.18, 0.1, 0.32, '#1a1410', 0, 0, 0); shoeR = B(0.18, 0.1, 0.32, '#1a1410', 0, 0, 0); scene.add(shoeL, shoeR);
  torch = new T3.SpotLight('#fffbe0', 4, 8, 0.35, 0.5, 1); scene.add(torch); scene.add(torch.target); torch.visible = false;
  const moon = new T3.PointLight('#c8d4ff', 1.6, 9, 1.2); moon.position.set(-40.6, 2.0, -1.8); scene.add(moon);
  out = document.getElementById('c'); octx = out.getContext('2d'); low = document.createElement('canvas'); lctx = low.getContext('2d');
};
window.DURATION = TM.total;
window.renderFrame = function (T) {
  let ci = CL.findIndex(c => T >= c.start && T < c.start + c.dur); if (ci < 0) ci = CL.length - 1;
  const lt = T - CL[ci].start, D = CL[ci].dur;
  drawWindow(T, 0.9, false); drawTV(T, 'off'); for (const r of [ROOMS.bed, ROOMS.kit, ROOMS.bath]) { r.light.pl.intensity = 0; } ROOMS.bed.deskL.intensity = 0;
  you.visible = false; pose0(you); you.userData.body.scale.setScalar(1); torch.visible = false; heli.visible = false; heli.scale.setScalar(1); commander.visible = false; jay.visible = false; mia.visible = false; axe.visible = false; chocBar.visible = false; zIn.forEach(z => { z.visible = false; pose0(z); }); soldiers.forEach(s_ => s_.visible = false);
  flood.forEach(([pn, pl]) => { pl.intensity = 0; }); ntower.visible = false; miaWin.visible = false; miaWinL.intensity = 0;
  survivors.forEach((p, i) => { pose0(p); p.visible = ci >= 8; const a = i / survivors.length * PI * 2; p.position.set(STX + C(a) * (9 + (i % 3) * 2), 0, 3 + S(a) * (7 + (i % 3) * 2)); p.rotation.y = Math.atan2(STX - p.position.x, 3 - p.position.z); if (ci === 8 && T > EVT.one8) { p.userData.armL.rotation.z = -2.6 + S(T * 8 + i) * 0.2; p.userData.armR.rotation.z = 2.6 - S(T * 8 + i) * 0.2; } else idle(p, T + i); });
  // glass + shards
  { const e = T - EVT.explodes; glass.visible = e < 0; shards.forEach(s_ => { const u = s_.userData; s_.visible = e > 0 && e < 3.5; if (s_.visible) { s_.position.set(u.x + u.vx * e, u.y + u.vy * e - 4.9 * e * e, 4.95 + u.vz * e); s_.rotation.set(PI / 2 + u.spin * e, u.spin * e * 0.7, 0); } }); }
  doorG.rotation.y = -1.6 * ease(prog(T, EVT.door - 0.05, EVT.door + 0.25));
  // Mia's torch
  { const on = ci <= 5 && (T < EVT.torch || ((T * 2.5) % 1 < 0.6)); torchL.intensity = on ? 6 : 0; torchL.position.set(NTX - 3.2, WY + 0.2, -35.8); torchL.target.position.set(NTX - 3, WY, -28); }
  R7.search.intensity = ci <= 6 ? 40 : 0; R7.search.position.set(NTX - 1, WY + 2.5, -30); R7.search.target.position.set(NTX - 3, WY, -36); R7.fill.intensity = ci <= 6 ? 3 : 0; R7.fill.position.set(NTX - 1.5, WY + 1.5, -33.5);
  roofZ.forEach((z, i) => { const [x, y, zz, o] = z.userData.p; z.visible = ci <= 6; pose0(z); z.position.set(x + S(T * 0.7 + o * 9) * 0.6, y, zz + C(T * 0.6 + o * 7) * 0.6); z.rotation.y = Math.atan2(heli.position.x - z.position.x, heli.position.z - z.position.z); run(z, T * 3 + i, 0.3); z.userData.armL.rotation.x = z.userData.armR.rotation.x = -2.4 + S(T * 4 + i) * 0.3; });
  if (ci <= 6) updCrowd(T); fires.forEach(([f, pl], i) => { f.scale.y = 1 + 0.25 * S(T * 9 + i); pl.intensity = 2.5 + S(T * 13 + i * 3) * 0.8; });
  DIR[ci](lt, T, D);
  if (axe.visible) holdAxe();
  you.updateMatrixWorld(true); bag.visible = you.visible && ci <= 6; if (bag.visible) { you.userData.body.localToWorld(V3.set(0, 1.3, -0.26)); bag.position.copy(V3); bag.rotation.y = you.rotation.y; }
  FILL.position.copy(camera.position); FILL.visible = ci === 7;
  renderer.render(scene, camera);
  const mz = clamp(1 - lt / 0.25); const f = mz > 0 && ci > 0 ? Math.max(1, Math.round(mz * 12)) : 1; octx.imageSmoothingEnabled = false;
  if (f > 1) { low.width = Math.ceil(RW / f); low.height = Math.ceil(RH / f); lctx.imageSmoothingEnabled = false; lctx.drawImage(glc, 0, 0, low.width, low.height); octx.drawImage(low, 0, 0, W, H); } else octx.drawImage(glc, 0, 0, W, H);
  octx.fillStyle = 'rgba(0,0,0,0.10)'; for (let y = 0; y < H; y += 5) octx.fillRect(0, y, W, 2);
  const vg = octx.createRadialGradient(360, 640, 420, 360, 640, 900); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.45)'); octx.fillStyle = vg; octx.fillRect(0, 0, W, H);
  // slow-motion letterbox for the jump
  if (T > EVT.jumps && T < EVT.catches + 0.3) { const k = Math.min(prog(T, EVT.jumps, EVT.jumps + 0.3), 1 - prog(T, EVT.catches, EVT.catches + 0.3)); octx.fillStyle = '#000'; octx.fillRect(0, 0, W, 120 * k); octx.fillRect(0, H - 120 * k, W, 120 * k); octx.font = '18px PressStart'; octx.fillStyle = `rgba(255,255,255,${k})`; octx.textAlign = 'left'; octx.fillText('SLOW MOTION', 30, H - 60 * k); }
  if (T > EVT.explodes && T < EVT.explodes + 0.15) { octx.fillStyle = `rgba(255,255,255,${0.7 * (1 - (T - EVT.explodes) / 0.15)})`; octx.fillRect(0, 0, W, H); }
  if (ci === 0) { bigText(octx, '31 FLOORS UP', 470, 80, '#ffd23a', prog(T, 0.2, 0.5)); if (T > AT(0, 'one')) bigText(octx, 'ONE WINDOW', 560, 52, '#fff', prog(T, AT(0, 'window') - 0.1, AT(0, 'window') + 0.2)); if (T > EVT.final - 0.1) bigText(octx, 'THE FINAL DAY', 650, 60, '#ff5a3a', prog(T, EVT.final - 0.1, EVT.final + 0.2)); }
  likePill(octx, T);
  if (ci === 1) { const a = prog(lt, 0.0, 0.3); bigText(octx, 'THIS IS SAM', 470, 76, '#7dffb0', a); bigText(octx, 'DAY 7 . YOU VOTED B', 570, 44, '#ffd23a', prog(T, EVT.day1 - 0.1, EVT.day1 + 0.2)); bigText(octx, 'THE WINDOW', 640, 60, '#fff', prog(T, EVT.win1 - 0.1, EVT.win1 + 0.2)); }
  tracker(octx, T);
  if (ci === 2 && T > EVT.sealed - 0.1) bigText(octx, 'SEALED SHUT', 560, 76, '#ff5a3a', prog(T, EVT.sealed - 0.1, EVT.sealed + 0.2));
  { const t0 = EVT.rule - 0.15, t1 = t0 + 3.0; if (T >= t0 && T < t1) banner(octx, ['RULE 8.', 'USE WHAT YOU HAVE'], prog(T, t0, t0 + 0.3), prog(T, t1 - 0.25, t1)); }
  if (ci === 3) { if (T > EVT.tells && T < EVT.swing - 0.2) bigText(octx, 'COVER YOUR FACE', 560, 60, '#fff', prog(T, EVT.tells, EVT.tells + 0.3)); if (T > EVT.explodes - 0.05) bigText(octx, 'SMASH!', 560, 120, '#7dffb0', 1); }
  if (ci === 4 && T > EVT.found - 0.1) bigText(octx, 'THEY FOUND HER', 560, 70, '#ff5a3a', prog(T, EVT.found - 0.1, EVT.found + 0.2));
  if (ci === 5) { if (T > EVT.second - 0.1 && T < EVT.catches - 0.2) bigText(octx, '31 FLOORS OF AIR', 470, 60, '#ffd23a', prog(T, EVT.second, EVT.second + 0.3)); if (T > EVT.catches - 0.1) bigText(octx, 'CAUGHT!', 560, 110, '#7dffb0', prog(T, EVT.catches - 0.1, EVT.catches + 0.1)); }
  if (ci === 6 && T > EVT.hands) bigText(octx, 'GRABBING AT NOTHING', 560, 52, '#ff5a3a', prog(T, EVT.hands, EVT.hands + 0.3));
  if (ci === 7 && T > EVT.four - 0.6) bigText(octx, 'SAVED SINCE DAY 4', 300, 52, '#ff8ad0', prog(T, EVT.four - 0.6, EVT.four - 0.3));
  if (ci === 8 && T > EVT.seven - 0.1) { bigText(octx, '7 DAYS', 260, 76, '#ffd23a', prog(T, EVT.seven - 0.1, EVT.seven + 0.2)); bigText(octx, '28 FLOORS', 350, 64, '#fff', prog(T, EVT.twenty - 0.1, EVT.twenty + 0.2)); bigText(octx, '1 RESCUE', 440, 76, '#7dffb0', prog(T, EVT.one8 - 0.1, EVT.one8 + 0.2)); }
  if (ci === 9) { const a = prog(T, CL[9].start, CL[9].start + 0.3); card(octx, "SAM'S RULES", 90, 160, 540, 380, a); octx.save(); octx.globalAlpha = a;
    [["DON'T TAKE THE ELEVATOR", EVT.r1], ['STAY SILENT', EVT.r2], ['KNOW YOUR WAY OUT', EVT.r3], ['NEVER LEAVE ANYONE BEHIND', EVT.r4]].forEach(([s_, t0], i) => { const on = T > t0 - 0.1; const y = 240 + i * 72; octx.strokeStyle = '#7ad0ff'; octx.lineWidth = 3; octx.strokeRect(116, y - 20, 40, 40); if (on) txt(octx, '✓', 136, y + 2, 34, '#7dffb0', 'center'); txt(octx, s_, 176, y, i === 3 ? 26 : 28, on ? '#fff' : '#5a6a8a'); }); octx.restore();
    if (T > EVT.thanks - 0.1) bigText(octx, 'THE END', 640, 110, '#ffd23a', prog(T, EVT.thanks - 0.1, EVT.thanks + 0.2)); if (T > EVT.comment - 0.1) bigText(octx, 'WHAT SHOULD WE SURVIVE NEXT?', 740, 34, '#fff', prog(T, EVT.comment - 0.1, EVT.comment + 0.2)); }
  const cap = CAPS.find(c => T >= c.a && T < c.b); if (cap) captionBox(octx, cap.txt);
  if (T < 0.2) { octx.fillStyle = `rgba(0,0,0,${1 - T / 0.2})`; octx.fillRect(0, 0, W, H); }
  if (T > TM.total - 0.8) { octx.fillStyle = `rgba(0,0,0,${prog(T, TM.total - 0.8, TM.total)})`; octx.fillRect(0, 0, W, H); }
};
})();
