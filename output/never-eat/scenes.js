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

// ---------- What if you never had to eat again ----------
function cam(p, l) { camera.position.set(p[0], p[1], p[2]); camera.lookAt(l[0], l[1], l[2]); }
function camL(a, b, k, la, lb) { k = ease(k); cam([lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)], [lerp(la[0], lb[0], k), lerp(la[1], lb[1], k), lerp(la[2], lb[2], k)]); }
const BX = -40, KX = 0;
const EV = { hunger: AT(0, 'hunger'), cooking: AT(0, 'cooking'), food: AT(0, 'food'), ever: AT(0, 'ever'), hour: AT(1, 'hour'), years: AT(1, 'years'), body: AT(2, 'body'), jaw: AT(3, 'jaw'), shrink: AT(3, 'shrink'), gut: AT(4, 'gut'), starve: AT(4, 'starve'), intest: AT(5, 'intestines'), thinner: AT(5, 'thinner'),
  cake: AT(6, 'birthday'), family: AT(6, 'family'), pizza: AT(6, 'pizza'), gone: AT(6, 'gone'), yes: AT(7, 'yes') };
let hero, fam = [], foods = [], cake, flames = [], pizza2, poofs = [];
function cylM(r1, r2, h, c, x, y, z, p, seg = 10) { const m = new T3.Mesh(new T3.CylinderGeometry(r1, r2, h, seg), typeof c === 'string' ? M(c) : c); m.position.set(x, y, z); (p || scene).add(m); return m; }
function plate(g) { cylM(0.17, 0.15, 0.015, '#f4f4f0', 0, 0.008, 0, g, 12); }
function makePizza() { const g = new T3.Group(); plate(g); cylM(0.15, 0.15, 0.025, '#e8a848', 0, 0.025, 0, g); cylM(0.13, 0.13, 0.027, '#c8402a', 0, 0.027, 0, g); for (let i = 0; i < 6; i++) { const a = i * 1.05; cylM(0.025, 0.025, 0.03, '#8a1a1a', C(a) * 0.08, 0.03, S(a) * 0.08, g, 6); } return g; }
function makeBurger() { const g = new T3.Group(); plate(g); cylM(0.08, 0.09, 0.04, '#d8a050', 0, 0.035, 0, g); cylM(0.095, 0.095, 0.015, '#5aa83a', 0, 0.06, 0, g); cylM(0.088, 0.088, 0.03, '#5a3220', 0, 0.08, 0, g); cylM(0.09, 0.09, 0.012, '#f0c030', 0, 0.1, 0, g); const top = new T3.Mesh(new T3.SphereGeometry(0.09, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), M('#d8a050')); top.position.y = 0.105; g.add(top); return g; }
function makeBowl() { const g = new T3.Group(); cylM(0.11, 0.07, 0.08, '#e8e8f0', 0, 0.04, 0, g); cylM(0.1, 0.1, 0.01, '#e8c060', 0, 0.075, 0, g); return g; }
function makeCake() { const g = new T3.Group(); plate(g); cylM(0.14, 0.14, 0.12, '#f0a0b8', 0, 0.07, 0, g, 14); cylM(0.145, 0.145, 0.02, '#fff4f0', 0, 0.135, 0, g, 14); for (let i = 0; i < 5; i++) { const a = i * 1.26; cylM(0.006, 0.006, 0.06, i % 2 ? '#4ab0ff' : '#ffd23a', C(a) * 0.08, 0.175, S(a) * 0.08, g, 4); const f = new T3.Mesh(new T3.SphereGeometry(0.012, 4, 3), new T3.MeshBasicMaterial({ color: '#ffb030' })); f.position.set(C(a) * 0.08, 0.215, S(a) * 0.08); g.add(f); flames.push(f); } return g; }
function buildExtra() {
  const tx = KX - 1.5, ty = 0.83, tz = 1.2;
  const items = [[makePizza(), -0.35, -0.2], [makeBurger(), 0.3, -0.25], [makeBowl(), -0.3, 0.25], [makeBowl(), 0.35, 0.2], [makeBurger(), 0.0, 0.05]];
  items.forEach(([g, dx, dz]) => { g.position.set(tx + dx, ty, tz + dz); scene.add(g); foods.push(g); });
  cake = makeCake(); cake.position.set(tx, ty, tz); scene.add(cake);
  pizza2 = makePizza(); pizza2.scale.setScalar(1.6); pizza2.position.set(tx + 0.1, ty, tz); scene.add(pizza2);
  for (let i = 0; i < 40; i++) { const p = new T3.Mesh(new T3.SphereGeometry(0.03, 4, 3), new T3.MeshBasicMaterial({ color: '#f0f0f0', transparent: true })); scene.add(p); poofs.push(p); }
  hero = person({ shirt: '#c8302a', trousers: '#2a3450', hair: '#3a2416', skin: '#e8b896', longSleeve: true }); scene.add(hero);
  fam = [person({ shirt: '#e8c040', trousers: '#3a3a40', hair: '#8a5a2a', skin: '#d8a880' }), person({ shirt: '#3a7ac0', trousers: '#2a2a30', hair: '#1a1a1a', skin: '#a8704a', longSleeve: true }), person({ shirt: '#5a9a4a', trousers: '#4a4a52', hair: '#c09050', skin: '#ecc4a0' })];
  fam.forEach(p => scene.add(p));
}
function sit(p, k = 1) { const u = p.userData; u.body.position.y = -0.38 * k; u.legL.rotation.x = u.legR.rotation.x = -1.5 * k; }
const DIR = [
  // 0 hook: the table empties
  (lt, T, D) => { hero.position.set(KX - 1.5, 0, 0.35); hero.rotation.y = 0; idle(hero, T); hero.userData.armR.rotation.x = -0.6;
    camL([KX - 0.4, 1.6, 2.4], [KX - 0.8, 1.4, 2.0], prog(lt, 0, D), [KX - 1.5, 0.9, 1.1], [KX - 1.5, 0.9, 1.15]); },
  // 1 free time — relaxing in the bedroom
  (lt, T, D) => { hero.position.set(BX - 1.6, 0.42, 0.8); hero.rotation.y = Math.PI / 2; sit(hero, 1); idle(hero, T); hero.userData.armR.rotation.x = -1.3 + S(T * 3) * 0.1; hero.userData.armL.rotation.x = -1.3;
    camL([BX + 0.6, 1.6, 2.4], [BX + 0.2, 1.5, 2.0], prog(lt, 0, D), [BX - 1.5, 1.1, 0.8], [BX - 1.6, 1.1, 0.8]); },
  // 2 body built to eat
  (lt, T, D) => { hero.position.set(KX - 0.6, 0, 0.6); hero.rotation.y = 0.3; idle(hero, T); camL([KX + 0.6, 1.5, 2.6], [KX + 0.4, 1.5, 2.3], prog(lt, 0, D), [KX - 0.6, 1.3, 0.6], [KX - 0.6, 1.3, 0.6]); },
  // 3 jaw
  (lt, T, D) => { hero.position.set(KX - 0.6, 0, 0.6); hero.rotation.y = 0.3; idle(hero, T); hero.userData.armR.rotation.x = -2.3; hero.userData.armR.rotation.z = 0.5; camL([KX + 0.7, 1.9, 2.9], [KX + 0.5, 1.9, 2.6], prog(lt, 0, D), [KX - 0.6, 1.6, 0.6], [KX - 0.6, 1.7, 0.6]); },
  // 4 gut
  (lt, T, D) => { hero.position.set(KX - 0.6, 0, 0.6); hero.rotation.y = 0.3; idle(hero, T); hero.userData.armR.rotation.x = -0.8; hero.userData.armL.rotation.x = -0.8; camL([KX + 0.9, 1.5, 2.9], [KX + 0.7, 1.4, 2.6], prog(lt, 0, D), [KX - 0.6, 1.2, 0.6], [KX - 0.6, 1.2, 0.6]); },
  // 5 intestines
  (lt, T, D) => { hero.position.set(KX - 0.6, 0, 0.6); hero.rotation.y = 0.3; idle(hero, T); hero.userData.armL.rotation.x = -0.8; hero.userData.head.rotation.x = 0.3; camL([KX + 0.6, 1.4, 2.9], [KX + 0.4, 1.35, 2.6], prog(lt, 0, D), [KX - 0.6, 1.1, 0.6], [KX - 0.6, 1.1, 0.6]); },
  // 6 memories: cake, family dinner, pizza with friends → gone
  (lt, T, D) => { const seats = [[KX - 1.5, 0.35, 0], [KX - 1.5, 2.05, Math.PI], [KX - 2.3, 1.2, Math.PI / 2], [KX - 0.7, 1.2, -Math.PI / 2]];
    [hero, ...fam].forEach((p, i) => { p.visible = T < EV.gone + 0.2; const s = seats[i]; p.position.set(s[0], 0.1, s[1]); p.rotation.y = s[2]; sit(p, 0.8); idle(p, T + i); if (T > EV.cake && T < EV.family) { p.userData.armL.rotation.z = -2.4 + S(T * 6 + i) * 0.2; p.userData.armR.rotation.z = 2.4 - S(T * 6) * 0.2; } if (T > EV.pizza) p.userData.armR.rotation.x = -1.0 - S(T * 4 + i) * 0.2; });
    camL([KX + 0.4, 2.0, 2.8], [KX + 0.1, 1.8, 2.4], prog(lt, 0, D), [KX - 1.5, 0.9, 1.2], [KX - 1.5, 0.9, 1.2]); },
  // 7 CTA: empty table
  (lt, T, D) => { hero.position.set(KX - 1.5, 0.1, 0.35); hero.rotation.y = 0; sit(hero, 0.8); idle(hero, T); hero.userData.head.rotation.x = 0.35; camL([KX + 0.4, 2.0, 2.8], [KX + 0.8, 2.3, 3.4], prog(lt, 0, D), [KX - 1.5, 0.9, 1.0], [KX - 1.5, 1.0, 1.0]); },
];

// ---------- HUD ----------
function bigText(ctx, txt, y, size, col = '#ffd23a', a = 1, font = 'Russo') { if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.font = `${size}px ${font}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round'; ctx.lineWidth = size * 0.22; ctx.strokeStyle = '#05081a'; ctx.strokeText(txt, 360, y); ctx.fillStyle = col; ctx.fillText(txt, 360, y); ctx.restore(); }
function banner(ctx, kind, item, k, out) { const good = kind === 'good'; const x = lerp(-640, 40, ease(k)) - ease(out) * 700; ctx.save(); ctx.translate(x, 70); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(640, 0); ctx.lineTo(610, 120); ctx.lineTo(0, 120); ctx.closePath();
  const g = ctx.createLinearGradient(0, 0, 0, 120); if (good) { g.addColorStop(0, 'rgba(20,110,60,0.95)'); g.addColorStop(1, 'rgba(6,50,26,0.95)'); } else { g.addColorStop(0, 'rgba(170,30,30,0.95)'); g.addColorStop(1, 'rgba(80,8,8,0.95)'); } ctx.fillStyle = g; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = good ? '#7dffb0' : '#ffb0a0'; ctx.stroke();
  ctx.fillStyle = good ? '#7dffb0' : '#ffe24a'; ctx.beginPath(); ctx.arc(60, 60, 36, 0, 7); ctx.fill(); ctx.fillStyle = good ? '#06321a' : '#5a0808'; ctx.font = '46px Russo'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(good ? '+' : '!', 60, 64);
  ctx.textAlign = 'left'; ctx.font = '20px PressStart'; ctx.fillStyle = good ? '#7dffb0' : '#ffe24a'; ctx.fillText(good ? 'BONUS' : 'SIDE EFFECT', 116, 38); ctx.font = (item.length > 16 ? 32 : 42) + 'px Russo'; ctx.fillStyle = '#fff'; ctx.fillText(item, 116, 86); ctx.restore(); }
const BAN = [['years', 'good', '3 YEARS FREE TIME'], ['shrink', 'bad', 'JAW MUSCLES SHRINK'], ['starve', 'bad', 'GUT BACTERIA STARVE'], ['thinner', 'bad', 'GUT LINING THINS'], ['gone', 'bad', 'NO MORE MEALS TOGETHER']].map(([e, k, l]) => ({ t: EV[e] - 0.15, kind: k, label: l }));
BAN.forEach((b, i) => { const nx = BAN[i + 1]; b.end = nx ? Math.min(nx.t, b.t + 3.5) : b.t + 3.5; });
function card(ctx, title, x, y, w, h, a) { ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = 'rgba(6,14,40,0.92)'; ctx.fillRect(x, y, w, h); ctx.strokeStyle = '#7ad0ff'; ctx.lineWidth = 4; ctx.strokeRect(x, y, w, h); ctx.fillStyle = '#ffd23a'; ctx.fillRect(x, y, w, 34); ctx.font = '16px PressStart'; ctx.fillStyle = '#06102a'; ctx.textBaseline = 'middle'; ctx.fillText(title, x + 14, y + 18); ctx.restore(); }
function dot(ctx, x, y, r, c) { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); }
function txt(ctx, s, x, y, size, c, align = 'left', font = 'Russo') { ctx.font = `${size}px ${font}`; ctx.fillStyle = c; ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.fillText(s, x, y); ctx.textAlign = 'left'; }
const BACT = (() => { const r = rng(12); return Array.from({ length: 60 }, () => [r(), r(), r()]); })();
function bodyDiagram(ctx, T, a) { const x = 180, y = 380, w = 360, h = 620; card(ctx, 'YOUR BODY', x, y, w, h, a); ctx.save(); ctx.globalAlpha = a;
  const cx = x + w / 2; ctx.fillStyle = '#d8dce8'; ctx.beginPath(); ctx.arc(cx, y + 120, 56, 0, 7); ctx.fill(); ctx.beginPath(); ctx.roundRect(cx - 80, y + 190, 160, 250, 40); ctx.fill(); ctx.fillRect(cx - 120, y + 200, 36, 200); ctx.fillRect(cx + 84, y + 200, 36, 200); ctx.fillRect(cx - 70, y + 430, 50, 150); ctx.fillRect(cx + 20, y + 430, 50, 150); ctx.fillRect(cx - 14, y + 170, 28, 30);
  const focus = T > EV.intest - 0.2 ? 'int' : T > EV.gut - 0.2 ? 'gut' : T > EV.jaw - 0.2 ? 'jaw' : '';
  // jaw muscles
  const js = 1 - 0.55 * ease(prog(T, EV.shrink - 0.6, EV.shrink + 0.6)); ctx.fillStyle = '#d8403a'; for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(cx + s * 34, y + 140, 16 * js, 22 * js, s * 0.3, 0, 7); ctx.fill(); }
  // stomach
  ctx.fillStyle = '#e88aa0'; ctx.beginPath(); ctx.ellipse(cx - 20, y + 260, 40, 26, -0.4, 0, 7); ctx.fill();
  // intestines coil (wall thickness thins)
  const wthk = lerp(16, 6, ease(prog(T, EV.thinner - 0.6, EV.thinner + 0.6))); ctx.strokeStyle = '#d8906a'; ctx.lineWidth = wthk; ctx.lineCap = 'round'; ctx.beginPath(); for (let i = 0; i <= 60; i++) { const u = i / 60, ang = u * Math.PI * 7; const px = cx + C(ang) * (50 - u * 20), py = y + 320 + u * 90 + S(ang) * 16; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); } ctx.stroke();
  // bacteria (die off)
  const alive = 1 - ease(prog(T, EV.starve - 0.8, EV.starve + 0.8)) * 0.8; BACT.forEach(([u, v, q]) => { const bx = cx - 60 + u * 120, by = y + 310 + v * 110; const ok = q < alive; dot(ctx, bx, by, 4, ok ? '#5aff7a' : 'rgba(120,120,120,0.6)'); });
  if (focus) { const fy = focus === 'jaw' ? y + 140 : focus === 'gut' ? y + 360 : y + 360; const R = focus === 'jaw' ? 75 : 95; ctx.strokeStyle = '#ffd23a'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(cx, fy, R + S(T * 6) * 5, 0, 7); ctx.stroke(); txt(ctx, focus === 'jaw' ? 'JAW' : focus === 'gut' ? 'GUT BACTERIA' : 'INTESTINES', cx, y + h - 34, 24, '#ffd23a', 'center'); }
  ctx.restore(); }
const DIAG = [
  { a: () => EV.hour - 0.2, b: () => EV.body - 0.2, draw: (ctx, T, a) => { const x = 110, y = 430, w = 500, h = 400; card(ctx, 'TIME SPENT EATING', x, y, w, h, a); ctx.save(); ctx.globalAlpha = a;
      const cx = x + 120, cy = y + 170; ctx.fillStyle = '#e8e4dc'; ctx.beginPath(); ctx.arc(cx, cy, 80, 0, 7); ctx.fill(); ctx.fillStyle = '#ffd23a'; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, 80, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 / 24 * ease(prog(T, EV.hour, EV.hour + 0.8))); ctx.fill(); ctx.strokeStyle = '#06102a'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(cx, cy, 80, 0, 7); ctx.stroke();
      txt(ctx, '1 HOUR', x + 340, y + 140, 42, '#fff', 'center'); txt(ctx, 'A DAY', x + 340, y + 190, 22, '#9ab0d0', 'center', 'PressStart');
      if (T > EV.years - 0.3) { const k = ease(prog(T, EV.years - 0.3, EV.years + 0.6)); txt(ctx, `${(3 * k).toFixed(1)} YEARS`, x + w / 2, y + 310, 60, '#7dffb0', 'center'); txt(ctx, 'OVER A LIFETIME', x + w / 2, y + 360, 18, '#9ab0d0', 'center', 'PressStart'); }
      ctx.restore(); } },
  { a: () => EV.body - 0.1, b: () => CL[6].start, draw: (ctx, T, a) => bodyDiagram(ctx, T, a) },
];
// captions
const CAPS = [];
for (const c of CL) { let cur = []; const flush = () => { if (cur.length) CAPS.push({ a: cur[0].a, b: cur[cur.length - 1].b, txt: cur.map(w => w.w).join(' ') }); cur = []; };
  c.words.forEach(w => { if (cur.length && (cur.length >= 4 || w.a - cur[cur.length - 1].b > 0.2 || /^(No|Ever|At|The|Over|All|But|So|First|Chewing|Without|Next|Trillions|With|And|Then|Birthday|Family|Late|Gone|Yes|Comment)$/.test(w.w) && cur.length > 1)) flush(); cur.push(w); }); flush(); }
CAPS.forEach((c, i) => { const nx = CAPS[i + 1]; c.b = nx ? Math.min(nx.a, c.b + 0.35) : c.b + 0.8; c.txt = c.txt.replace(/[:\-]/g, '.').replace(/\bthree years\b/, '3 years'); });
function captionBox(ctx, t) { ctx.save(); ctx.font = '50px Russo'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; const words = t.split(' '); const lines = []; let cur = ''; for (const w of words) { const x = cur ? cur + ' ' + w : w; if (ctx.measureText(x).width > 600 && cur) { lines.push(cur); cur = w; } else cur = x; } lines.push(cur);
  const y0 = 1100 - (lines.length - 1) * 31; lines.forEach((l, i) => { ctx.lineJoin = 'round'; ctx.lineWidth = 11; ctx.strokeStyle = '#05081a'; ctx.strokeText(l, 360, y0 + i * 62); ctx.fillStyle = '#fff'; ctx.fillText(l, 360, y0 + i * 62); }); ctx.restore(); }

let glc, out, octx, low, lctx;
window.initFootball = async function () {
  await Promise.all(['30px Russo', '20px PressStart'].map(f => document.fonts.load(f)));
  makeTextures(); makeTex();
  glc = document.createElement('canvas'); glc.width = RW; glc.height = RH;
  renderer = new T3.WebGLRenderer({ canvas: glc, antialias: false, preserveDrawingBuffer: true }); renderer.setPixelRatio(1); renderer.setSize(RW, RH, false); renderer.outputColorSpace = T3.SRGBColorSpace;
  camera = new T3.PerspectiveCamera(62, RW / RH, 0.05, 200); scene = new T3.Scene(); scene.background = new T3.Color('#000');
  hemi = new T3.HemisphereLight('#ffe6c8', '#3a2a20', 0.55); scene.add(hemi); buildFlat(); buildExtra();
  you = person(YOU); scene.add(you); you.visible = false; shoeL = B(0.1, 0.1, 0.1, '#000', 0, -5, 0); shoeR = B(0.1, 0.1, 0.1, '#000', 0, -5, 0); torch = new T3.SpotLight('#fff', 0, 1); scene.add(torch);
  out = document.getElementById('c'); octx = out.getContext('2d'); low = document.createElement('canvas'); lctx = low.getContext('2d');
};
window.DURATION = TM.total;
window.renderFrame = function (T) {
  let ci = CL.findIndex(c => T >= c.start && T < c.start + c.dur); if (ci < 0) ci = CL.length - 1;
  const lt = T - CL[ci].start, D = CL[ci].dur;
  drawRain(T, false, 1); lights(true, 0); hemi.intensity = 0.75; drawTV(T, 'off');
  { const k = ROOMS.kit; k.jugs.forEach(j => j.visible = false); k.tins.forEach(t => t.visible = false); k.pots.forEach(p => p.visible = false); k.jar.visible = false; k.pad.visible = false; k.stream.visible = false; k.bcase.position.set(-2.7, 0, 1.2); ROOMS.bath.tubWater.position.y = 0.2; ROOMS.bed.pscr.material.color.set('#4ad0ff'); }
  // food states
  const vanish = [EV.hunger, EV.cooking, EV.food, EV.food + 0.3, EV.ever];
  foods.forEach((f, i) => { f.visible = ci === 0 && T < vanish[i]; });
  cake.visible = ci === 6 && T > EV.cake - 0.3 && T < EV.family; flames.forEach((f, i) => f.scale.setScalar(0.8 + 0.3 * S(T * 20 + i)));
  pizza2.visible = ci === 6 && T > EV.pizza - 0.2 && T < EV.gone + 0.2;
  poofs.forEach((p, i) => { const vi = i % 5; const t0 = vanish[vi]; const k = (T - t0) / 0.6; p.visible = ci === 0 && k > 0 && k < 1; if (p.visible) { const f = foods[vi]; const a = i * 2.39; p.position.set(f.position.x + C(a) * 0.2 * k, f.position.y + 0.05 + k * 0.25, f.position.z + S(a) * 0.2 * k); p.material.opacity = 1 - k; } });
  hero.visible = true; [hero, ...fam].forEach(p => { pose0(p); p.position.y = 0; }); fam.forEach(p => p.visible = ci === 6 && T < EV.gone + 0.2);
  DIR[ci](lt, T, D);
  renderer.render(scene, camera);
  const mz = clamp(1 - lt / 0.25); const f = mz > 0 && ci > 0 ? Math.max(1, Math.round(mz * 10)) : 1; octx.imageSmoothingEnabled = false;
  const grey = T > EV.gone - 0.1 && ci >= 6 ? clamp((T - EV.gone + 0.1) / 0.4) : 0; octx.filter = grey > 0 ? `grayscale(${grey})` : 'none';
  if (f > 1) { low.width = Math.ceil(RW / f); low.height = Math.ceil(RH / f); lctx.imageSmoothingEnabled = false; lctx.drawImage(glc, 0, 0, low.width, low.height); octx.drawImage(low, 0, 0, W, H); } else octx.drawImage(glc, 0, 0, W, H);
  octx.filter = 'none';
  octx.fillStyle = 'rgba(0,0,0,0.08)'; for (let y = 0; y < H; y += 5) octx.fillRect(0, y, W, 2);
  const vg = octx.createRadialGradient(360, 640, 420, 360, 640, 900); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.4)'); octx.fillStyle = vg; octx.fillRect(0, 0, W, H);
  if (ci === 0) { const a = prog(T, 0.1, 0.4); bigText(octx, 'WHAT IF YOU', 250, 70, '#fff', a); bigText(octx, 'NEVER HAD TO', 335, 70, '#fff', a); bigText(octx, 'EAT AGAIN?', 430, 92, '#ffd23a', a);
    [['NO HUNGER', EV.hunger], ['NO COOKING', EV.cooking], ['NO FOOD', EV.food], ['EVER.', EV.ever]].forEach(([s, t0], i) => { if (T > t0 - 0.1) bigText(octx, s, 560 + i * 70, 44, i === 3 ? '#ff5a3a' : '#7ad0ff', prog(T, t0 - 0.1, t0 + 0.15)); }); }
  const b = BAN.find(e => T >= e.t && T < e.end); if (b) banner(octx, b.kind, b.label, prog(T, b.t, b.t + 0.3), prog(T, b.end - 0.25, b.end));
  for (const d of DIAG) { const a0 = d.a(), b0 = d.b(); if (T >= a0 && T < b0) d.draw(octx, T, Math.min(prog(T, a0, a0 + 0.3), 1 - prog(T, b0 - 0.25, b0))); }
  if (ci === 6) { [['BIRTHDAY CAKE', EV.cake, EV.family], ['FAMILY DINNERS', EV.family, EV.pizza], ['PIZZA WITH FRIENDS', EV.pizza, EV.gone]].forEach(([s, a0, b0]) => { if (T > a0 - 0.1 && T < b0) bigText(octx, s, 300, 60, '#ffd23a', prog(T, a0 - 0.1, a0 + 0.2)); }); if (T > EV.gone - 0.1) bigText(octx, 'GONE.', 420, 120, '#ffffff', prog(T, EV.gone - 0.1, EV.gone + 0.2)); }
  if (ci === 7) { const a = prog(lt, 0.1, 0.4); bigText(octx, 'GIVE UP FOOD', 300, 70, '#fff', a); bigText(octx, 'FOREVER?', 385, 84, '#ffd23a', a); if (T > EV.yes - 0.1) { bigText(octx, 'YES  OR  NO', 520, 72, '#7dffb0', prog(T, EV.yes - 0.1, EV.yes + 0.2)); if ((lt * 2) % 2 > 0.6) bigText(octx, 'COMMENT BELOW', 610, 26, '#7ad0ff', 1, 'PressStart'); } }
  const cap = CAPS.find(c => T >= c.a && T < c.b); if (cap) captionBox(octx, cap.txt);
  if (T < 0.2) { octx.fillStyle = `rgba(0,0,0,${1 - T / 0.2})`; octx.fillRect(0, 0, W, H); }
  if (T > TM.total - 0.7) { octx.fillStyle = `rgba(0,0,0,${prog(T, TM.total - 0.7, TM.total)})`; octx.fillRect(0, 0, W, H); }
};
})();
