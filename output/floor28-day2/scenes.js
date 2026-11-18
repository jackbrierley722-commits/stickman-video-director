// 28th Floor — stay in your flat. Retro low-poly 3D apartment (bedroom/kitchen/bathroom), survival log + diagrams.
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

// ---------- per-clip direction ----------
function cam(p, l) { camera.position.set(p[0], p[1], p[2]); camera.lookAt(l[0], l[1], l[2]); }
function camL(a, b, k, la, lb) { k = ease(k); cam([lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)], [lerp(la[0], lb[0], k), lerp(la[1], lb[1], k), lerp(la[2], lb[2], k)]); }
const BX = -40, KX = 0, AX = 40;
let glass, glassW;
function shakeDoor(T, amt) { const k = ROOMS.kit; const sh = (S(T * 3) > -0.2 ? 1 : 0) * S(T * 45) * 0.014 * amt; k.door.position.z = -0.9 + sh; k.bcase.position.z = -0.9 + sh * 0.8; k.bcase.rotation.z = sh * 2; }
const DIR = [
  // 0: Day 2 — the door still scratching, you hide silent
  (lt, T, D) => { const sil = wt(0, 'silent'); shakeDoor(T, 1);
    if (lt < sil - 0.2) camL([KX + 0.6, 1.5, 1.6], [KX - 0.2, 1.3, 0.9], prog(lt, 0, sil), [KX - 2.95, 1.1, -0.9], [KX - 2.95, 1.1, -0.9]);
    else { you.position.set(BX - 0.4, 0, 2.0); you.rotation.y = 0.25; crouch(you, 1); you.userData.armR.rotation.x = -2.5; you.userData.armR.rotation.z = 0.3; camL([BX + 1.3, 1.5, 4.3], [BX + 1.0, 1.4, 4.0], prog(lt, sil, D), [BX - 0.4, 0.9, 2.0], [BX - 0.4, 0.95, 2.0]); } },
  // 1: hours pass — bookcase shakes — you don't move
  (lt, T, D) => { const bc = wt(1, 'every'), dm = wt(1, "don't"); shakeDoor(T, lt > bc && lt < dm ? 2.2 : 1);
    you.position.set(BX - 0.4, 0, 2.0); you.rotation.y = 0.25; crouch(you, 1); you.userData.body.scale.setScalar(1 + S(T * 2.2) * 0.012);
    if (lt < bc - 0.2) camL([BX + 1.8, 2.4, 2.9], [BX + 1.6, 2.3, 2.7], prog(lt, 0, bc), [BX - 0.4, 0.6, 1.8], [BX - 0.4, 0.6, 1.8]);
    else if (lt < dm - 0.2) cam([KX - 1.0, 1.4, 0.8], [KX - 2.8, 1.0, -0.9]);
    else camL([BX + 0.4, 1.3, 3.9], [BX + 0.2, 1.25, 3.6], prog(lt, dm, D), [BX - 0.4, 0.95, 2.0], [BX - 0.4, 1.0, 2.0]); },
  // 2: before sunrise it stops — silence, dawn in the window
  (lt, T, D) => { you.position.set(BX - 0.4, 0, 2.0); you.rotation.y = Math.PI * 0.9; crouch(you, 1); you.userData.head.rotation.x = -0.15;
    camL([BX + 2.0, 1.6, 2.6], [BX + 1.6, 1.7, 2.2], prog(lt, 0, D), [BX - 0.6, 1.6, -3], [BX - 0.6, 1.7, -3]); },
  // 3: ration — pour 2L, take one tin and one noodle pot
  (lt, T, D) => { const k = ROOMS.kit; const lit = wt(3, 'litres'), meals = wt(3, 'meals'), left = wt(3, 'twelve');
    you.position.set(KX - 1.5, 0, 0.3); you.rotation.y = 0; idle(you, T);
    const pour = prog(lt, lit - 0.2, lit + 1.2); const j = k.jugs[13]; j.position.set(lerp(-0.8, -1.3, ease(prog(pour, 0, 0.2))), 0.96 + S(Math.min(1, pour * 3) * Math.PI / 2) * 0.25, 0.95); j.rotation.z = pour > 0.15 && pour < 0.9 ? 1.6 : 0; you.userData.armR.rotation.x = pour > 0 && pour < 1 ? -1.3 : 0;
    glassW.scale.y = Math.max(0.02, ease(prog(pour, 0.2, 0.9))); glassW.position.y = 0.88 + 0.07 * glassW.scale.y - 0.07;
    k.jugs[12].visible = lt < lit + 1.6; k.tins[8].visible = lt < meals + 0.3; k.pots[3].visible = lt < meals + 0.5;
    if (lt < lit - 0.3) camL([KX + 0.3, 1.9, 2.6], [KX - 0.1, 1.7, 2.3], prog(lt, 0, lit), [KX - 1.5, 1.0, 1.0], [KX - 1.5, 1.0, 1.1]);
    else camL([KX - 0.5, 1.4, 2.0], [KX - 0.8, 1.3, 1.8], prog(lt, lit, D), [KX - 1.4, 0.95, 1.0], [KX - 1.45, 0.95, 1.05]); },
  // 4: the window — street below
  (lt, T, D) => { you.position.set(BX - 0.6, 0, -2.2); you.rotation.y = Math.PI; idle(you, T); you.userData.armR.rotation.x = -1.6; you.userData.armR.rotation.z = -0.3;
    camL([BX + 0.6, 1.9, 0.2], [BX + 0.2, 1.85, -0.6], prog(lt, 0, D), [BX - 0.6, 1.8, -3], [BX - 0.7, 1.7, -3]); },
  // 5: the phone lights up
  (lt, T, D) => { const k = ROOMS.bed; const up = wt(5, 'lights'), how = wt(5, 'how');
    const on = lt > up - 0.1; k.pscr.material.color.set(on ? (S(T * 10) > 0 ? '#bfe8ff' : '#7ad0ff') : '#141820'); k.pscr.position.x = on ? S(T * 60) * 0.004 : 0;
    you.position.set(BX - 1.1, 0, 2.2); you.rotation.y = lt > how ? Math.PI * 1.5 + 0.4 : -Math.PI / 2 - 0.4; idle(you, T);
    if (lt < how - 0.2) camL([BX - 1.6, 1.4, 1.8], [BX - 1.9, 1.05, 1.4], prog(lt, 0, how), [BX - 2.2, 0.68, 1.0], [BX - 2.2, 0.67, 1.0]);
    else camL([BX - 0.4, 1.8, 2.9], [BX - 0.2, 1.8, 2.6], prog(lt, how, D), [BX - 1.1, 1.8, 2.2], [BX - 1.1, 1.85, 2.2]); },
  // 6: decision
  (lt, T, D) => { const k = ROOMS.bed; const optB = wt(6, 'option', 1), comment = wt(6, 'comment'); k.pscr.material.color.set(S(T * 10) > 0 ? '#bfe8ff' : '#7ad0ff');
    if (lt < optB - 0.2) { you.position.set(BX - 1.6, 0, 0.0); you.rotation.y = Math.PI * 0.25; crouch(you, 0.6); camL([BX + 0.2, 1.6, 2.4], [BX - 0.1, 1.5, 2.1], prog(lt, 0, optB), [BX - 1.8, 0.8, 0.6], [BX - 1.8, 0.8, 0.6]); }
    else if (lt < comment - 0.1) { const j = ROOMS.kit.jugs[11]; you.position.set(KX - 2.2, 0, -0.1); you.rotation.y = -Math.PI / 2 - 0.4; idle(you, T); you.userData.armR.rotation.x = -0.6; j.position.set(KX - 2.0, 0.95, 0.25); cam([KX - 0.4, 1.7, 1.6], [KX - 2.6, 1.1, -0.7]); }
    else { you.visible = false; camL([BX - 1.5, 1.2, 1.9], [BX - 1.9, 0.95, 1.4], prog(lt, comment, D), [BX - 2.2, 0.68, 1.0], [BX - 2.2, 0.67, 1.0]); } },
];

// ---------- HUD ----------
function bigText(ctx, txt, y, size, col = '#ffd23a', a = 1, font = 'Russo') { if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.font = `${size}px ${font}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round'; ctx.lineWidth = size * 0.22; ctx.strokeStyle = '#05081a'; ctx.strokeText(txt, 360, y); ctx.fillStyle = col; ctx.fillText(txt, 360, y); ctx.restore(); }
const EVT = { stop: AT(2, 'stops'), water: AT(3, 'litres') + 1.2, meals: AT(3, 'meals') + 0.5, msg: AT(5, 'lights') };
function clockStr(T) { // 1.00 AM at start → 5.50 AM at the stop → 7.30 AM later
  let mins = T < EVT.stop ? lerp(60, 350, ease(prog(T, 0, EVT.stop))) : lerp(350, 450, prog(T, EVT.stop, TM.total)); mins = Math.floor(mins); const h = Math.floor(mins / 60), m = mins % 60; return `${h}.${String(m).padStart(2, '0')} AM`; }
function tracker(ctx, T) {
  const a = prog(T, 0.2, 0.6);
  const rows = [['DAY', '2', '#fff', []], ['TIME', clockStr(T), '#ffd23a', []],
    ['DOOR', T > EVT.stop ? 'BLOCKED' : '!!', T > EVT.stop ? '#7dffb0' : '#ff5a3a', [EVT.stop]], ['NOISE', 'SILENT', '#7dffb0', []],
    ['WATER', T > EVT.water ? '12L' : '14L', '#7ad0ff', [EVT.water]], ['BATH', 'FULL', '#7dffb0', []],
    ['FOOD', T > EVT.meals ? '12' : '14', T > EVT.meals ? '#ffd23a' : '#7dffb0', [EVT.meals]], ['POWER', 'OFF', '#ff5a3a', []], ['MESSAGES', T > EVT.msg ? '1 NEW' : '0', T > EVT.msg ? '#ffd23a' : '#9ab0d0', [EVT.msg]]];
  ctx.save(); ctx.globalAlpha = a; ctx.translate(14, 60); ctx.scale(1.2, 1.2);
  const hh = 30 + rows.length * 34; ctx.fillStyle = 'rgba(6,14,40,0.82)'; ctx.fillRect(0, 0, 240, hh); ctx.strokeStyle = '#7ad0ff'; ctx.lineWidth = 3; ctx.strokeRect(0, 0, 240, hh);
  ctx.fillStyle = '#ffd23a'; ctx.fillRect(0, 0, 240, 26); ctx.font = '14px PressStart'; ctx.fillStyle = '#06102a'; ctx.textBaseline = 'middle'; ctx.fillText('SURVIVAL LOG', 12, 14);
  rows.forEach(([k, v, col, ts], i) => { const y = 45 + i * 34; let fl = 0; for (const t0 of ts) if (T > t0 && T < t0 + 0.6) fl = 1 - (T - t0) / 0.6; if (fl) { ctx.fillStyle = `rgba(255,255,255,${0.35 * fl})`; ctx.fillRect(4, y - 15, 232, 30); }
    ctx.font = '12px PressStart'; ctx.fillStyle = '#9ab0d0'; ctx.textAlign = 'left'; ctx.fillText(k, 12, y); ctx.font = '21px Russo'; ctx.fillStyle = col; ctx.textAlign = 'right'; ctx.fillText(v, 228, y + 1); ctx.textAlign = 'left'; });
  ctx.restore();
}
function banner(ctx, label, k, out) { const x = lerp(760, 330, ease(k)) + ease(out) * 500; ctx.save(); ctx.translate(x, 60); ctx.beginPath(); ctx.moveTo(30, 0); ctx.lineTo(390, 0); ctx.lineTo(390, 92); ctx.lineTo(0, 92); ctx.closePath(); ctx.fillStyle = 'rgba(150,20,20,0.95)'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = '#ffb0a0'; ctx.stroke(); ctx.font = '16px PressStart'; ctx.fillStyle = '#ffe24a'; ctx.textBaseline = 'middle'; ctx.fillText(label[0], 36, 26); ctx.font = '30px Russo'; ctx.fillStyle = '#fff'; ctx.fillText(label[1], 36, 64); ctx.restore(); }
function card(ctx, title, x, y, w, h, a) { ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = 'rgba(6,14,40,0.88)'; ctx.fillRect(x, y, w, h); ctx.strokeStyle = '#7ad0ff'; ctx.lineWidth = 4; ctx.strokeRect(x, y, w, h); ctx.fillStyle = '#ffd23a'; ctx.fillRect(x, y, w, 34); ctx.font = '16px PressStart'; ctx.fillStyle = '#06102a'; ctx.textBaseline = 'middle'; ctx.fillText(title, x + 14, y + 18); ctx.restore(); }
function dot(ctx, x, y, r, c) { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); }
function txt(ctx, s, x, y, size, c, align = 'left', font = 'Russo') { ctx.font = `${size}px ${font}`; ctx.fillStyle = c; ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.fillText(s, x, y); ctx.textAlign = 'left'; }
const DIAG = [
  // hours passing clock
  { a: () => CL[1].start, b: () => CL[2].start + 1.2, draw: (ctx, T, a) => { const x = 210, y = 440, w = 300, h = 330; card(ctx, 'HOURS PASS', x, y, w, h, a); ctx.save(); ctx.globalAlpha = a;
      const cx = x + w / 2, cy = y + 175, r = 110; ctx.fillStyle = '#e8e4dc'; ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.fill(); ctx.strokeStyle = '#06102a'; ctx.lineWidth = 6; ctx.stroke(); for (let i = 0; i < 12; i++) { const an = i / 12 * Math.PI * 2; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(cx + Math.sin(an) * (r - 8), cy - Math.cos(an) * (r - 8)); ctx.lineTo(cx + Math.sin(an) * (r - 22), cy - Math.cos(an) * (r - 22)); ctx.stroke(); }
      const mins = T < EVT.stop ? lerp(60, 350, ease(prog(T, 0, EVT.stop))) : 350; const ha = (mins / 720) * Math.PI * 2, ma = (mins / 60) * Math.PI * 2;
      ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.sin(ha) * 60, cy - Math.cos(ha) * 60); ctx.stroke(); ctx.lineWidth = 5; ctx.strokeStyle = '#c0302a'; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.sin(ma) * 92, cy - Math.cos(ma) * 92); ctx.stroke();
      ctx.restore(); } },
  // ration plan
  { a: () => AT(3, 'two') - 0.1, b: () => CL[4].start, draw: (ctx, T, a) => { const x = 380, y = 440, w = 320, h = 330; card(ctx, 'RATION PLAN', x, y, w, h, a); ctx.save(); ctx.globalAlpha = a;
      const wl = T > EVT.water ? 12 : 14; txt(ctx, 'WATER', x + 20, y + 70, 22, '#9ab0d0'); for (let i = 0; i < 14; i++) { ctx.fillStyle = i < wl ? '#3a8ad0' : '#1a2440'; ctx.fillRect(x + 20 + (i % 7) * 40, y + 92 + Math.floor(i / 7) * 44, 30, 36); }
      txt(ctx, `${wl}L LEFT`, x + w - 20, y + 70, 22, '#7ad0ff', 'right');
      const fl = T > EVT.meals ? 12 : 14; txt(ctx, 'FOOD', x + 20, y + 215, 22, '#9ab0d0'); txt(ctx, `${fl} LEFT`, x + w - 20, y + 215, 22, '#ffd23a', 'right'); for (let i = 0; i < 14; i++) { ctx.fillStyle = i < fl ? '#c8a03a' : '#1a2440'; ctx.fillRect(x + 20 + i * 20, y + 240, 14, 26); }
      txt(ctx, '2L + 2 MEALS A DAY', x + w / 2, y + 300, 22, '#7dffb0', 'center'); ctx.restore(); } },
  // street below
  { a: () => AT(4, 'down') - 0.1, b: () => CL[5].start, draw: (ctx, T, a, lt) => { const x = 70, y = 430, w = 580, h = 470; card(ctx, 'STREET BELOW', x, y, w, h, a); ctx.save(); ctx.globalAlpha = a;
      ctx.save(); ctx.beginPath(); ctx.rect(x + 4, y + 36, w - 8, h - 40); ctx.clip();
      ctx.fillStyle = '#2a2e38'; ctx.fillRect(x, y + 34, w, h); ctx.fillStyle = '#4a4e58'; ctx.fillRect(x, y + 190, w, 140); ctx.fillStyle = '#d8d0a0'; for (let i = 0; i < 9; i++) ctx.fillRect(x + 20 + i * 66, y + 256, 36, 6);
      for (const [bx, by, bw, bh] of [[20, 50, 150, 120], [200, 50, 160, 120], [390, 50, 170, 120], [20, 350, 200, 110], [260, 350, 300, 110]]) { ctx.fillStyle = '#1a2030'; ctx.fillRect(x + bx, y + by, bw, bh); }
      const carX = x + 470, carY = y + 230; ctx.fillStyle = '#c0302a'; ctx.fillRect(carX - 34, carY - 18, 68, 36); const on = S(T * 12) > 0; if (on) { ctx.strokeStyle = 'rgba(255,214,90,0.9)'; ctx.lineWidth = 4; for (let i = 1; i <= 3; i++) { ctx.beginPath(); ctx.arc(carX, carY, 26 + i * 20 + (T * 40 % 20), 0, 7); ctx.stroke(); } }
      txt(ctx, 'CAR ALARM', carX, carY - 52, 18, '#ffd23a', 'center', 'PressStart');
      const k = prog(lt, wt(4, 'down') - 0.1, wt(4, 'noise')); for (let i = 0; i < 24; i++) { const sx = x + 40 + (i * 47) % 380, sy = y + 200 + (i * 29) % 120; const px = lerp(sx, carX - 40 - (i % 5) * 14, ease(k)), py = lerp(sy, carY - 30 + (i % 6) * 12, ease(k)); dot(ctx, px, py, 8, '#ff4a3a'); }
      ctx.restore(); txt(ctx, 'ZOMBIES FOLLOW NOISE', x + w / 2, y + h - 26, 28, '#7dffb0', 'center'); ctx.restore(); } },
];
// captions
function merged(ws) { const o = []; for (let i = 0; i < ws.length; i++) { const w = ws[i], n = ws[i + 1]; if (/^twenty$/i.test(w.w) && n && /^seven$/i.test(n.w)) { o.push({ w: '27', a: w.a, b: n.b }); i++; } else if (/^twelve$/i.test(w.w)) o.push({ w: '12', a: w.a, b: w.b }); else if (/^two$/i.test(w.w) && i === 1 && /^day$/i.test(ws[0].w)) o.push({ w: '2.', a: w.a, b: w.b }); else if (/^three$/i.test(w.w) && ws[i - 1] && /^rule$/i.test(ws[i - 1].w)) o.push({ w: '3.', a: w.a, b: w.b }); else if (/^two$/i.test(w.w)) o.push({ w: '2', a: w.a, b: w.b }); else o.push(w); } return o; }
const CAPS = [];
for (const c0 of CL) { const ws = merged(c0.words); let cur = []; const flush = () => { if (cur.length) CAPS.push({ a: cur[0].a, b: cur[cur.length - 1].b, txt: cur.map(w => w.w).join(' ') }); cur = []; };
  ws.forEach(w => { if (cur.length && (cur.length >= 4 || w.a - cur[cur.length - 1].b > 0.2 || /^(So|You|Every|Then|Silence|Ration|2|Nothing|12|Down|They're|Noise|A|I'm|Please|But|Option|Comment|The|Stay|Sneak)$/.test(w.w) && cur.length > 1)) flush(); cur.push(w); }); flush(); }
CAPS.forEach((c, i) => { const nx = CAPS[i + 1]; c.b = nx ? Math.min(nx.a, c.b + 0.35) : c.b + 0.8; c.txt = c.txt.replace(/[:\-"]/g, '').replace(/\bday 2\b/i, 'Day 2').replace(/^Day 2\. ?/, 'Day 2.'); });
function captionBox(ctx, t) { ctx.save(); ctx.font = '50px Russo'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; const words = t.split(' '); const lines = []; let cur = ''; for (const w of words) { const x = cur ? cur + ' ' + w : w; if (ctx.measureText(x).width > 600 && cur) { lines.push(cur); cur = w; } else cur = x; } lines.push(cur);
  const y0 = 1080 - (lines.length - 1) * 31; lines.forEach((l, i) => { ctx.lineJoin = 'round'; ctx.lineWidth = 11; ctx.strokeStyle = '#05081a'; ctx.strokeText(l, 360, y0 + i * 62); ctx.fillStyle = '#fff'; ctx.fillText(l, 360, y0 + i * 62); }); ctx.restore(); }
function msgBubble(ctx, a, k) { if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; const x = 110, y = 420 + (1 - ease(k)) * 60, w = 500, h = 230;
  ctx.fillStyle = 'rgba(12,18,30,0.95)'; ctx.beginPath(); ctx.roundRect(x, y, w, h, 26); ctx.fill(); ctx.strokeStyle = '#4ad0ff'; ctx.lineWidth = 4; ctx.stroke();
  dot(ctx, x + 50, y + 52, 26, '#3a5a8a'); txt(ctx, 'FLOOR 27', x + 92, y + 40, 26, '#fff'); txt(ctx, 'NEIGHBOUR . NOW', x + 92, y + 70, 15, '#9ab0d0', 'left', 'PressStart');
  ctx.fillStyle = '#1e3a5a'; ctx.beginPath(); ctx.roundRect(x + 24, y + 104, w - 48, 100, 18); ctx.fill(); txt(ctx, "I'M OUT OF WATER.", x + 46, y + 136, 32, '#fff'); txt(ctx, 'PLEASE HELP.', x + 46, y + 176, 32, '#fff'); ctx.restore(); }

let glc, out, octx, low, lctx;
window.initFootball = async function () {
  await Promise.all(['30px Russo', '20px PressStart'].map(f => document.fonts.load(f)));
  makeTextures(); makeTex();
  glc = document.createElement('canvas'); glc.width = RW; glc.height = RH;
  renderer = new T3.WebGLRenderer({ canvas: glc, antialias: false, preserveDrawingBuffer: true }); renderer.setPixelRatio(1); renderer.setSize(RW, RH, false); renderer.outputColorSpace = T3.SRGBColorSpace;
  camera = new T3.PerspectiveCamera(62, RW / RH, 0.05, 200);
  scene = new T3.Scene(); scene.background = new T3.Color('#000');
  hemi = new T3.HemisphereLight('#ffe6c8', '#3a2a20', 0.55); scene.add(hemi);
  buildFlat();
  you = person(YOU); scene.add(you);
  shoeL = B(0.18, 0.1, 0.32, '#1a1410', 0, 0, 0); shoeR = B(0.18, 0.1, 0.32, '#1a1410', 0, 0, 0); scene.add(shoeL, shoeR);
  torch = new T3.SpotLight('#fffbe0', 4, 8, 0.35, 0.5, 1); scene.add(torch); scene.add(torch.target); torch.visible = false;
  const moon = new T3.PointLight('#9ab0ff', 2.2, 9, 1.2); moon.position.set(-40.6, 2.0, -1.8); scene.add(moon);
  glass = new T3.Mesh(new T3.CylinderGeometry(0.05, 0.045, 0.14, 7), new T3.MeshLambertMaterial({ color: '#d8eef8', transparent: true, opacity: 0.5 })); glass.position.set(-1.45, 0.89, 1.0); scene.add(glass);
  glassW = new T3.Mesh(new T3.CylinderGeometry(0.045, 0.04, 0.14, 7), new T3.MeshLambertMaterial({ color: '#3a8ad0' })); glassW.position.set(-1.45, 0.88, 1.0); scene.add(glassW);
  out = document.getElementById('c'); octx = out.getContext('2d'); low = document.createElement('canvas'); lctx = low.getContext('2d');
};
window.DURATION = TM.total;
window.renderFrame = function (T) {
  let ci = CL.findIndex(c => T >= c.start && T < c.start + c.dur); if (ci < 0) ci = CL.length - 1;
  const lt = T - CL[ci].start, D = CL[ci].dur;
  const dayK = clamp(prog(T, EVT.stop - 1.0, CL[3].start + 0.5)); const fl = lightning(T) * (1 - dayK);
  drawWindow(T, dayK, fl > 0.3); setLight(dayK, fl); drawTV(T, 'off');
  // persistent Day 1 state
  { const k = ROOMS.kit; k.bcase.position.set(-2.7, 0, -0.9); k.bcase.rotation.z = 0; k.lock.rotation.x = Math.PI / 2; k.door.position.z = -0.9; k.stream.visible = false;
    k.jugs.forEach((j, i) => { j.visible = true; j.rotation.z = 0; j.position.set(-2.0 + (i % 7) * 0.2, 0.96, 0.95 + Math.floor(i / 7) * 0.32); j.userData.w.scale.y = 1; j.userData.w.position.y = 0; });
    k.tins.forEach(t => t.visible = true); k.pots.forEach(p => p.visible = true); k.jar.visible = true; k.cabL.rotation.y = -1.6; k.cabR.rotation.y = 1.6;
    k.led.material.color.set('#102018'); k.fridgeGlow.intensity = 0; k.plug.position.set(2.6, 0.06, 0); k.cable.position.y = 0.04;
    ROOMS.bath.tubWater.position.y = 0.62; ROOMS.bed.pscr.material.color.set('#141820'); ROOMS.bed.pscr.position.x = 0;
    shoeL.visible = shoeR.visible = true; shoeL.position.set(BX - 2.05, 0.06, 1.65); shoeR.position.set(BX - 0.6, 0.06, 1.65);
    if (T > EVT.water) { k.jugs[13].visible = false; k.jugs[12].visible = false; } if (T > EVT.meals) { k.tins[8].visible = false; k.pots[3].visible = false; }
    glass.visible = glassW.visible = ci === 3; glassW.scale.y = T > EVT.water ? 1 : 0.02; }
  you.visible = true; pose0(you); you.userData.body.scale.setScalar(1); torch.visible = false;
  DIR[ci](lt, T, D);
  renderer.render(scene, camera);
  const mz = clamp(1 - lt / 0.3); const f = mz > 0 && ci > 0 ? Math.max(1, Math.round(mz * 12)) : 1;
  octx.imageSmoothingEnabled = false;
  if (f > 1) { low.width = Math.ceil(RW / f); low.height = Math.ceil(RH / f); lctx.imageSmoothingEnabled = false; lctx.drawImage(glc, 0, 0, low.width, low.height); octx.drawImage(low, 0, 0, W, H); } else octx.drawImage(glc, 0, 0, W, H);
  octx.fillStyle = 'rgba(0,0,0,0.10)'; for (let y = 0; y < H; y += 5) octx.fillRect(0, y, W, 2);
  const vg = octx.createRadialGradient(360, 640, 420, 360, 640, 900); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.45)'); octx.fillStyle = vg; octx.fillRect(0, 0, W, H);
  if (ci === 0) { bigText(octx, 'DAY 2', 560, 120, '#ffd23a', prog(lt, 0.1, 0.4)); bigText(octx, 'YOU VOTED A', 670, 50, '#fff', prog(lt, 0.5, 0.8)); }
  if (T < EVT.stop && ci <= 1) bigText(octx, 'scritch... scritch...', 840, 44, '#ff8a6a', 0.55 + 0.4 * S(T * 12));
  if (ci === 1 && lt > wt(1, 'every') && lt < wt(1, "don't")) bigText(octx, 'THUD!', 760, 90, '#ff5a3a', S(T * 9) > 0 ? 1 : 0.4);
  if (ci === 2 && lt > wt(2, 'stops')) bigText(octx, 'SILENCE', 620, 96, '#7dffb0', prog(lt, wt(2, 'stops'), wt(2, 'stops') + 0.3));
  tracker(octx, T);
  for (const d of DIAG) { const a0 = d.a(), b0 = d.b(); if (T >= a0 && T < b0) { const a = Math.min(prog(T, a0, a0 + 0.3), 1 - prog(T, b0 - 0.25, b0)); d.draw(octx, T, a, lt); } }
  { const t0 = AT(3, 'rule') - 0.15, t1 = t0 + 3.2; if (T >= t0 && T < t1) banner(octx, ['RULE 3.', 'RATION EVERYTHING'], prog(T, t0, t0 + 0.3), prog(T, t1 - 0.25, t1)); }
  if (ci === 5) { const up = wt(5, 'lights'), how = wt(5, 'how'); if (lt > wt(5, 'message') - 0.2 && lt < how - 0.1) msgBubble(octx, 1, prog(lt, wt(5, 'message') - 0.2, wt(5, 'message') + 0.2)); if (lt > how - 0.1) { bigText(octx, 'HOW DO THEY KNOW', 560, 58, '#ff5a3a', prog(lt, how - 0.1, how + 0.2)); bigText(octx, "YOU'RE HERE?", 640, 58, '#ff5a3a', prog(lt, how + 0.2, how + 0.5)); } }
  if (ci === 6) { const optB = wt(6, 'option', 1), comment = wt(6, 'comment');
    if (lt < comment - 0.1) bigText(octx, lt < optB - 0.2 ? 'A. STAY HIDDEN' : 'B. TAKE WATER TO FLOOR 27', 600, lt < optB - 0.2 ? 58 : 42, lt < optB - 0.2 ? '#7dffb0' : '#ffd23a', 1);
    else { bigText(octx, 'COMMENT A OR B', 520, 70, '#ffd23a', prog(lt, comment - 0.1, comment + 0.2)); bigText(octx, 'DAY 3 DECIDES...', 610, 40, '#fff', prog(lt, comment + 0.8, comment + 1.1)); } }
  const cap = CAPS.find(c => T >= c.a && T < c.b); if (cap) captionBox(octx, cap.txt);
  if (T < 0.25) { octx.fillStyle = `rgba(0,0,0,${1 - T / 0.25})`; octx.fillRect(0, 0, W, H); }
  if (T > TM.total - 0.8) { octx.fillStyle = `rgba(0,0,0,${prog(T, TM.total - 0.8, TM.total)})`; octx.fillRect(0, 0, W, H); }
};
})();
