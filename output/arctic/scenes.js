// The Arctic Monkeys story — low-poly retro console style, step plates, name tags, diagrams.
(() => {
const { T3, RW, RH, W, H, clamp, lerp, ease, prog, rng, makeTextures, TX, mat, box, cyl, sph, ground, person, run, idle, cheer, trophy, signBoard, crowdStand } = window.W3;
const TM = window.TIMING, CL = TM.clips;
const S = Math.sin, C = Math.cos;
function wt(ci, word, n = 0) { let k = 0; for (const w of CL[ci].words) if (w.w.toLowerCase().replace(/[^a-z0-9']/g, '') === word) { if (k === n) return w.a - CL[ci].start; k++; } return 0; }
const AT = (ci, w, n = 0) => CL[ci].start + wt(ci, w, n);

let renderer, camera, lastScene = null; const SCENES = []; const TAGS = [];
function mkScene(sky, fog, light = {}) {
  const s = new T3.Scene(); lastScene = s;
  const geo = new T3.SphereGeometry(400, 12, 8); const cols = []; const pos = geo.attributes.position; const top = new T3.Color(sky[0]), bot = new T3.Color(sky[1]);
  for (let i = 0; i < pos.count; i++) { const y = clamp(pos.getY(i) / 400 * 1.6 + 0.2); const c = bot.clone().lerp(top, y); cols.push(c.r, c.g, c.b); }
  geo.setAttribute('color', new T3.Float32BufferAttribute(cols, 3)); s.add(new T3.Mesh(geo, new T3.MeshBasicMaterial({ vertexColors: true, side: T3.BackSide, fog: false })));
  s.fog = new T3.Fog(fog[0], fog[1], fog[2]);
  s.add(new T3.HemisphereLight(light.sky || '#ffffff', light.ground || '#556644', light.hemi ?? 0.9));
  const d = new T3.DirectionalLight(light.sun || '#fff4dd', light.dir ?? 1.0); d.position.set(5, 10, 6); s.add(d); return s;
}
function cam(p, l) { camera.position.set(p[0], p[1], p[2]); camera.lookAt(l[0], l[1], l[2]); }
function camL(a, b, k, la, lb) { k = ease(k); cam([lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)], [lerp(la[0], lb[0], k), lerp(la[1], lb[1], k), lerp(la[2], lb[2], k)]); }
function put(s, o, x = 0, y = 0, z = 0) { o.position.set(x, y, z); s.add(o); return o; }
function M(c, map) { return new T3.MeshLambertMaterial({ color: c, map, flatShading: true }); }
function pt(w, h, draw, rep = [1, 1]) { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); draw(g, w, h); const t = new T3.CanvasTexture(c); t.magFilter = t.minFilter = T3.NearestFilter; t.wrapS = t.wrapT = T3.RepeatWrapping; t.repeat.set(rep[0], rep[1]); t.colorSpace = T3.SRGBColorSpace; return t; }
function noise(g, w, h, b, v, seed) { const r = rng(seed); for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const k = (r() - 0.5) * v; g.fillStyle = `rgb(${b[0] + k},${b[1] + k},${b[2] + k})`; g.fillRect(x, y, 1, 1); } }

// ---------- the band (stylised, not likenesses) ----------
const LOOK = {
  alex: { shirt: '#232328', trousers: '#2a3450', hair: '#16100c', skin: '#ecc4a0', longSleeve: false },
  jamie: { shirt: '#5a6a4a', trousers: '#3a3a40', hair: '#5a3a22', skin: '#e8b896', longSleeve: true },
  matt: { shirt: '#d8d8d4', trousers: '#2a2a30', hair: '#1a1a1a', skin: '#e8b896' },
  andy: { shirt: '#2a3a6a', trousers: '#4a4a52', hair: '#9a7a4a', skin: '#ecc4a0', longSleeve: true },
  nick: { shirt: '#6a2a2a', trousers: '#2a2a34', hair: '#4a3020', skin: '#e8b896', longSleeve: true },
};
const NAMES = { alex: 'ALEX TURNER', jamie: 'JAMIE COOK', matt: 'MATT HELDERS', andy: 'ANDY NICHOLSON', nick: "NICK O'MALLEY" };
const ROLE = { alex: 'VOCALS + GUITAR', jamie: 'GUITAR', matt: 'DRUMS', andy: 'BASS', nick: 'BASS' };
function guitar(col, bass) { const g = new T3.Group(); g.add(box(0.34, 0.42, 0.08, col, 0, 0, 0)); g.add(box(0.26, 0.2, 0.081, '#e8e0d0', 0, 0.06, 0)); g.add(box(0.06, bass ? 0.8 : 0.62, 0.04, '#3a2414', 0, bass ? 0.6 : 0.5, 0)); g.add(box(0.1, 0.14, 0.04, '#1a1a1a', 0, bass ? 1.05 : 0.86, 0)); g.rotation.z = 1.05; return g; }
function holdGuitar(p, g, t, strum = 1) { p.userData.body.add(g); g.position.set(0.02, 1.18, 0.22); const u = p.userData; u.armR.rotation.x = -0.6 + S(t * 14) * 0.25 * strum; u.armR.rotation.z = 0.5; u.armL.rotation.x = -0.9; u.armL.rotation.z = -0.9; }
function drumKit() { const g = new T3.Group(); const kick = cyl(0.36, 0.36, 0.38, 10, '#c8302a', 0, 0.38, 0); kick.rotation.x = Math.PI / 2; g.add(kick); { const _o = cyl(0.3, 0.3, 0.02, 10, '#e8e8e8', 0, 0.38, 0.2); g.add(_o); _o.rotation.x = Math.PI / 2; };
  const snare = cyl(0.2, 0.2, 0.14, 10, '#e8e8e8', -0.45, 0.72, 0.15); g.add(snare); const tom = cyl(0.17, 0.17, 0.18, 10, '#c8302a', 0.1, 0.85, 0.05); g.add(tom); const ft = cyl(0.22, 0.22, 0.3, 10, '#c8302a', 0.55, 0.55, 0.15); g.add(ft);
  for (const [x, y, z] of [[-0.6, 1.15, -0.1], [0.65, 1.2, -0.15]]) { const c = cyl(0.26, 0.26, 0.015, 10, '#d8b040', x, y, z); g.add(c); g.add(cyl(0.015, 0.015, y, 4, '#888', x, y / 2, z)); }
  g.add(cyl(0.18, 0.18, 0.5, 8, '#1a1a1a', 0, 0.25, -0.55)); g.userData = { snare, tom }; return g; }
function amp(w = 0.6, h = 0.7) { const g = new T3.Group(); g.add(box(w, h, 0.35, '#1a1a1c', 0, h / 2, 0)); g.add(box(w - 0.08, h - 0.2, 0.01, '#3a3a3e', 0, h / 2 - 0.05, 0.18)); g.add(box(w - 0.1, 0.06, 0.02, '#d8c8a0', 0, h - 0.06, 0.18)); return g; }
function micStand(x, z) { const g = new T3.Group(); g.add(cyl(0.015, 0.015, 1.6, 4, '#888', 0, 0.8, 0)); g.add(sph(0.05, '#222', 0, 1.62, 0.04)); g.add(cyl(0.18, 0.18, 0.02, 8, '#333', 0, 0.01, 0)); g.position.set(x, 0, z); return g; }
function drumPose(p, t, hard = 1) { const u = p.userData; u.body.position.y = -0.45; u.legL.rotation.x = u.legR.rotation.x = -1.5; u.armL.rotation.x = -1.0 + Math.abs(S(t * 9)) * 0.5 * hard; u.armR.rotation.x = -1.0 + Math.abs(S(t * 9 + 1.6)) * 0.5 * hard; u.armL.rotation.z = -0.3; u.armR.rotation.z = 0.3; }
function band(s, who, pos, t0 = 0) { const out = {}; for (const k of who) { const p = person(LOOK[k]); s.add(p); p.position.set(pos[k][0], 0, pos[k][1]); p.rotation.y = pos[k][2] || 0; out[k] = p; if (k !== 'matt') { const g = guitar(k === 'alex' ? '#1a1a1a' : k === 'jamie' ? '#c8a03a' : '#8a1a1a', k === 'andy' || k === 'nick'); p.userData.gtr = g; } } if (out.matt) { const kit = drumKit(); kit.position.set(pos.matt[0], 0, pos.matt[1] + 0.55); kit.rotation.y = Math.PI; s.add(kit); out.matt.userData.kit = kit; } return out; }
function playBand(b, t) { for (const [k, p] of Object.entries(b)) { if (!p.visible) continue; idle(p, t); if (k === 'matt') drumPose(p, t); else { holdGuitar(p, p.userData.gtr, t + (k === 'jamie' ? 0.3 : k === 'andy' ? 0.6 : 0.9)); p.userData.head.rotation.x = S(t * 5 + p.position.x) * 0.08; } } }
function tag(p, key, a0, a1 = 1e9, sub) { TAGS.push({ p, key, a0, a1, sub }); }
function crowd(s, n, cx, cz, w, d, seed, face = 0) { const r = rng(seed); return Array.from({ length: n }, (_, i) => { const p = person({ shirt: ['#3a3a44', '#6a2a2a', '#2a4a6a', '#d8d4cc', '#4a5a3a', '#1a1a1e'][i % 6], trousers: ['#2a3450', '#1a1a1e', '#4a4a52'][i % 3], hair: ['#1a1a1a', '#5a3a22', '#9a7a4a', '#2a1c14'][i % 4], skin: ['#ecc4a0', '#d8a880', '#a8704a'][i % 3] }); p.position.set(cx + (r() - 0.5) * w, 0, cz + (r() - 0.5) * d); p.rotation.y = face; p.userData.r = r(); s.add(p); return p; }); }
function jump(p, t, k = 1) { const u = p.userData; u.body.position.y = Math.abs(S(t * 6 + p.userData.r * 9)) * 0.18 * k; u.armL.rotation.z = -2.4 - S(t * 6 + p.userData.r * 7) * 0.3; u.armR.rotation.z = 2.4 + S(t * 6) * 0.3; }

// ---------- textures ----------
let TT = {};
function tex() {
  TT.brick = r => pt(32, 32, g => { noise(g, 32, 32, [122, 64, 48], 22, 5); g.fillStyle = '#7a6a5a'; for (let y = 0; y < 32; y += 6) { g.fillRect(0, y, 32, 1); for (let x = (y / 6) % 2 * 6; x < 32; x += 12) g.fillRect(x, y, 1, 6); } }, r);
  TT.concrete = r => pt(32, 32, g => noise(g, 32, 32, [120, 118, 112], 18, 6), r);
  TT.carpet = r => pt(16, 16, g => { noise(g, 16, 16, [110, 30, 34], 20, 7); g.fillStyle = 'rgba(220,180,80,0.35)'; g.fillRect(3, 3, 2, 2); g.fillRect(11, 11, 2, 2); }, r);
  TT.wood = r => pt(32, 32, g => { noise(g, 32, 32, [96, 60, 36], 16, 8); g.fillStyle = '#3a2214'; for (let y = 0; y < 32; y += 8) g.fillRect(0, y, 32, 1); }, r);
  TT.panel = r => pt(32, 32, g => { noise(g, 32, 32, [84, 52, 32], 12, 9); g.fillStyle = '#4a2c18'; g.fillRect(2, 2, 12, 28); g.fillRect(18, 2, 12, 28); }, r);
  TT.road = r => pt(32, 32, g => noise(g, 32, 32, [52, 52, 58], 14, 10), r);
  TT.sleeves = r => pt(32, 16, g => { const rr = rng(3); for (let x = 0; x < 32; x += 2) { g.fillStyle = ['#1a1a1e', '#d8d4cc', '#c8302a', '#2a4a8a', '#e8c040', '#3a5a3a'][rr() * 6 | 0]; g.fillRect(x, 0, 2, 16); g.fillStyle = 'rgba(0,0,0,0.3)'; g.fillRect(x + 1, 0, 1, 16); } }, r);
  TT.album = () => pt(16, 16, g => { g.fillStyle = '#121214'; g.fillRect(0, 0, 16, 16); g.fillStyle = '#e8e4dc'; g.fillRect(2, 11, 12, 1); g.fillRect(2, 13, 8, 1); g.fillStyle = '#3a3a40'; g.fillRect(4, 2, 8, 7); });
  TT.screen = r => pt(32, 18, g => { g.fillStyle = '#0a0a14'; g.fillRect(0, 0, 32, 18); g.fillStyle = '#e8e8f0'; g.fillRect(6, 4, 2, 10); g.fillRect(12, 4, 2, 10); g.fillRect(18, 4, 2, 10); g.fillRect(24, 4, 2, 10); }, r);
}

// ---------- scenes ----------
const BUILD = [
  // 0 Sheffield at night
  () => { const s = mkScene(['#0a0e1e', '#3a3058'], ['#2a2440', 20, 90], { hemi: 0.6, dir: 0.4, sun: '#a8b8ff' });
    put(s, ground(200, TT.road([40, 40])), 0, 0, 0);
    for (let side of [-1, 1]) for (let i = 0; i < 9; i++) { const g = new T3.Group(); g.add(box(4, 5, 4, M('#ffffff', TT.brick([2, 2])), 0, 2.5, 0)); const roof = new T3.Mesh(new T3.CylinderGeometry(0.01, 3.2, 1.8, 4), mat('#2a2a30')); roof.rotation.y = Math.PI / 4; roof.scale.set(1, 1, 0.7); roof.position.y = 5.9; g.add(roof); g.add(box(0.5, 1, 0.5, '#5a3a2a', 1.2, 6.3, 0));
      for (const [wx, wy] of [[-0.9, 1.4], [0.9, 1.4], [-0.9, 3.6], [0.9, 3.6]]) { const w = box(0.7, 0.8, 0.05, new T3.MeshBasicMaterial({ color: rng(i * 7 + wx * 3 + side)() > 0.5 ? '#f0c060' : '#1a1a24' }), wx, wy, 2.02); g.add(w); }
      g.position.set(side * 7, 0, -i * 4.4); g.rotation.y = side < 0 ? Math.PI / 2 : -Math.PI / 2; s.add(g); }
    for (let i = 0; i < 6; i++) for (const side of [-1, 1]) { s.add(cyl(0.06, 0.06, 4, 5, '#2a2a2a', side * 4.6, 2, -i * 7)); s.add(sph(0.22, new T3.MeshBasicMaterial({ color: '#ffb84a' }), side * 4.3, 4, -i * 7)); const l = new T3.PointLight('#ffb050', 1.4, 8); l.position.set(side * 4.3, 3.8, -i * 7); s.add(l); }
    for (let i = 0; i < 8; i++) { const hill = new T3.Mesh(new T3.ConeGeometry(18, 8, 6), mat('#14182a')); hill.position.set(-50 + i * 15, 0, -70); s.add(hill); }
    return (lt, T, D) => camL([0, 1.6, 8], [0, 2.4, -6], prog(lt, 0, D), [0, 2.2, -20], [0, 3, -30]); },
  // 1 The garage, 2002
  () => { const s = mkScene(['#d0c8b8', '#d0c8b8'], ['#d0c8b8', 30, 80], { hemi: 0.9, dir: 0.6 });
    const fl = ground(10, TT.concrete([4, 4])); s.add(fl); const wm = M('#ffffff', TT.brick([3, 1.5]));
    const back = new T3.Mesh(new T3.PlaneGeometry(10, 3.2), wm); back.position.set(0, 1.6, -3); s.add(back); for (const sx of [-1, 1]) { const w = new T3.Mesh(new T3.PlaneGeometry(8, 3.2), wm); w.rotation.y = -sx * Math.PI / 2; w.position.set(sx * 4, 1.6, 0); s.add(w); }
    s.add(box(1.4, 0.8, 0.5, '#5a3a22', -3.2, 0.4, -2.6)); s.add(box(0.5, 0.5, 0.5, '#8a6a3a', -3.0, 1.05, -2.6)); s.add(box(1.0, 0.04, 0.5, '#6a4a2a', 3.0, 1.6, -2.75)); for (let i = 0; i < 4; i++) s.add(box(0.15, 0.25, 0.15, ['#c8302a', '#2a5ab0', '#e8c040', '#3a3a3a'][i], 2.65 + i * 0.22, 1.75, -2.75));
    const pin = new T3.Mesh(new T3.PlaneGeometry(0.8, 1.1), new T3.MeshBasicMaterial({ map: TX.sign('PRACTICE\nTONIGHT', '#e8e0c8', '#2a2a2a', 64, 88, 8) })); pin.position.set(-1.6, 1.8, -2.98); s.add(pin);
    { const _o = amp(); s.add(_o); _o.position.set(-1.7, 0, -2.3); }; { const _o = amp(0.5, 0.55); s.add(_o); _o.position.set(1.8, 0, -2.4); }; s.add(micStand(-0.8, 0.4));
    const lamp = new T3.PointLight('#fff0d0', 1.2, 10); lamp.position.set(0, 3, 0); s.add(lamp); s.add(box(1.2, 0.06, 0.3, new T3.MeshBasicMaterial({ color: '#fffbe8' }), 0, 3.1, 0));
    const b = band(s, ['alex', 'jamie', 'matt', 'andy'], { alex: [-0.8, 0.0, 0], jamie: [0.6, 0.2, -0.2], matt: [0.0, -1.7, 0], andy: [1.8, -0.4, -0.4] }, 0);
    const pick = wt(1, 'pick'), school = wt(1, 'school'), mattT = wt(1, 'matt'), andyT = wt(1, 'andy');
    tag(b.alex, 'alex', AT(1, 'alex')); tag(b.jamie, 'jamie', AT(1, 'jamie')); tag(b.matt, 'matt', AT(1, 'matt')); tag(b.andy, 'andy', AT(1, 'andy'));
    return (lt, T, D) => { b.matt.visible = b.matt.userData.kit.visible = lt > school - 0.2; b.andy.visible = lt > school - 0.2; playBand(b, T);
      if (lt < pick - 0.3) camL([3.5, 2.6, 5], [2.0, 2.0, 3.6], prog(lt, 0, pick), [0, 1.0, -1], [-0.1, 1.3, 0]);
      else if (lt < school - 0.2) camL([-0.2, 1.8, 3.6], [0.0, 1.7, 3.2], prog(lt, pick, school), [-0.1, 1.3, 0], [-0.1, 1.3, 0]);
      else if (lt < andyT - 0.2) camL([-2.0, 2.2, 0.6], [-1.6, 2.0, 0.2], prog(lt, school, andyT), [0.0, 1.0, -1.7], [0.0, 1.0, -1.6]);
      else camL([3.0, 1.8, 2.6], [2.8, 1.8, 2.0], prog(lt, andyT, D), [1.8, 1.3, -0.4], [1.0, 1.3, -0.6]); } },
  // 2 The Grapes, first gig, June 2003
  () => { const s = mkScene(['#2a1a10', '#2a1a10'], ['#2a1a10', 14, 40], { sky: '#ffcc88', ground: '#3a2010', hemi: 0.8, sun: '#ffb860', dir: 0.5 });
    s.add(ground(14, TT.carpet([8, 8]))); const wm = M('#ffffff', TT.panel([5, 1.5]));
    const back = new T3.Mesh(new T3.PlaneGeometry(14, 3.4), wm); back.position.set(0, 1.7, -4); s.add(back); for (const sx of [-1, 1]) { const w = new T3.Mesh(new T3.PlaneGeometry(14, 3.4), wm); w.rotation.y = -sx * Math.PI / 2; w.position.set(sx * 5, 1.7, 0); s.add(w); }
    const sign = signBoard('THE GRAPES', 2.4, 0.6, { bg: '#1a3a1a', fg: '#f0d070', pw: 128, ph: 32, size: 10 }); sign.position.set(0, 2.9, -3.98); s.add(sign);
    s.add(box(3.0, 1.0, 0.7, '#5a3420', 3.2, 0.5, 2.5)); for (let i = 0; i < 5; i++) s.add(cyl(0.05, 0.05, 0.15, 6, '#e8c050', 2.2 + i * 0.4, 1.08, 2.4));
    s.add(box(5, 0.25, 2.2, M('#ffffff', TT.wood([3, 1])), 0, 0.12, -2.9));
    for (const x of [-1.6, 1.6]) { const sp = new T3.SpotLight('#ffd8a0', 3, 9, 0.6, 0.6, 1); sp.position.set(x, 3.2, 0); sp.target.position.set(x * 0.4, 0, -2.8); s.add(sp, sp.target); }
    { const _o = amp(); s.add(_o); _o.position.set(-2.0, 0.25, -3.5); }; { const _o = amp(); s.add(_o); _o.position.set(2.0, 0.25, -3.5); }; { const _o = micStand(-1.0, -2.2); s.add(_o); _o.position.y = 0.25; };
    const b = band(s, ['alex', 'jamie', 'matt', 'andy'], { alex: [-1.0, -2.4, 0], jamie: [0.4, -2.3, 0], matt: [-0.2, -3.4, 0], andy: [1.6, -2.6, 0] });
    Object.values(b).forEach(p => p.position.y = 0.25); b.matt.userData.kit.position.y = 0.25;
    const fans = crowd(s, 12, 0, 0.8, 6, 2.2, 13, Math.PI);
    return (lt, T, D) => { playBand(b, T); fans.forEach((p, i) => { idle(p, T + i); p.userData.body.position.y = Math.abs(S(T * 4 + i)) * 0.05; if (i % 3 === 0) p.userData.armR.rotation.x = -0.8; });
      if (lt < wt(2, 'gig') - 0.3) camL([0, 2.6, 5], [0, 2.2, 3.4], prog(lt, 0, wt(2, 'gig')), [0, 1.2, -2], [0, 1.3, -2.5]); else camL([-3.4, 2.3, -0.8], [-3.0, 2.1, -1.2], prog(lt, wt(2, 'gig'), D), [0, 1.3, -2.6], [0, 1.35, -2.6]); } },
  // 3 Demo CDs → fans online → crowds sing
  () => { const s = mkScene(['#20202a', '#20202a'], ['#20202a', 14, 50], { hemi: 0.9, dir: 0.6 });
    s.add(ground(20, TT.carpet([8, 8]), '#5a5a6a')); const table = box(2.2, 0.08, 1.0, '#6a4a2a', 0, 0.8, 0); s.add(table); for (const [x, z] of [[-1, -0.4], [1, -0.4], [-1, 0.4], [1, 0.4]]) s.add(box(0.06, 0.8, 0.06, '#3a2414', x, 0.4, z));
    const pc = box(0.3, 0.55, 0.55, '#d8d4cc', -0.7, 1.12, -0.1); s.add(pc); const tray = box(0.24, 0.02, 0.26, '#b8b4ac', -0.7, 1.24, 0.25); s.add(tray);
    const cdm = new T3.MeshLambertMaterial({ color: '#e0e4f0', flatShading: true });
    const cds = Array.from({ length: 30 }, (_, i) => { const c = new T3.Mesh(new T3.CylinderGeometry(0.12, 0.12, 0.012, 14), cdm); c.position.set(0.2 + (i % 3) * 0.3, 0.85 + Math.floor(i / 3) * 0.014, -0.1 + (i % 2) * 0.2); s.add(c); return c; });
    const spin = new T3.Mesh(new T3.CylinderGeometry(0.12, 0.12, 0.012, 14), new T3.MeshLambertMaterial({ color: '#c8d8ff' })); spin.position.set(-0.7, 1.26, 0.3); s.add(spin);
    // gig part (crowd singing) at x=60
    const G = new T3.Group(); G.position.x = 60; s.add(G); G.add(box(6, 0.4, 2.4, '#2a2a2e', 0, 0.2, -3)); const bb = band(G, ['alex', 'jamie', 'matt', 'andy'], { alex: [-1.2, -2.6, 0], jamie: [0.2, -2.6, 0], matt: [-0.4, -3.6, 0], andy: [1.6, -2.7, 0] }); Object.values(bb).forEach(p => p.position.y = 0.4); bb.matt.userData.kit.position.y = 0.4;
    const fans = crowd(G, 34, 0, 1.6, 8, 4, 21, Math.PI); for (const x of [-2, 2]) { const sp = new T3.SpotLight(x < 0 ? '#ff6a8a' : '#6ab0ff', 4, 12, 0.6, 0.5, 1); sp.position.set(60 + x, 4, 1); sp.target.position.set(60, 0, -2.6); s.add(sp, sp.target); }
    const hand = person(LOOK.alex); s.add(hand); hand.position.set(0.6, 0, 1.0); hand.rotation.y = Math.PI;
    const fanCD = new T3.Mesh(new T3.CylinderGeometry(0.12, 0.12, 0.012, 14), cdm); s.add(fanCD); const fan = person({ shirt: '#c8302a', trousers: '#2a3450', hair: '#5a3a22' }); s.add(fan); fan.position.set(0.6, 0, 2.2);
    const online = wt(3, 'fans'), soon = wt(3, 'soon');
    return (lt, T, D) => { spin.rotation.y = T * 20; tray.position.z = 0.25 + Math.max(0, S(T * 1.5)) * 0.1;
      if (lt < online - 0.2) { idle(hand, T); const k = prog(lt, 1.6, 3.0); hand.userData.armR.rotation.x = -1.4 * ease(k); fanCD.position.set(lerp(0.4, 0.55, k), lerp(0.86, 1.25, k), lerp(0.1, 1.6, k)); fanCD.rotation.x = k * 1.4; idle(fan, T); fan.userData.armL.rotation.x = -1.2 * ease(prog(lt, 2.4, 3.2));
        camL([-1.6, 1.8, 1.4], [-1.2, 1.6, 1.6], prog(lt, 0, online), [-0.4, 1.0, 0], [0.4, 1.2, 0.8]); }
      else { playBand(bb, T); fans.forEach(p => { idle(p, T); if (lt > soon - 0.3) jump(p, T); }); camL([60, 2.4, 6.5], [60, 3.0, 5.2], prog(lt, online, D), [60, 1.2, -1], [60, 1.4, -2]); } }
  },
  // 4 Domino, June 2005 → number one
  () => { const s = mkScene(['#d8d4c8', '#d8d4c8'], ['#d8d4c8', 20, 60], { hemi: 0.9, dir: 0.7 });
    s.add(ground(12, TT.wood([6, 6]))); const back = new T3.Mesh(new T3.PlaneGeometry(12, 3.2), M('#e8e0d0')); back.position.set(0, 1.6, -3); s.add(back);
    for (let i = 0; i < 4; i++) s.add(box(0.9, 1.6, 0.35, M('#ffffff', TT.sleeves([2, 2])), -3.5 + i * 0.95, 0.8, -2.8));
    s.add(box(2.4, 0.08, 1.1, '#5a3a22', 0, 0.78, 0)); for (const [x, z] of [[-1.1, -0.5], [1.1, -0.5], [-1.1, 0.5], [1.1, 0.5]]) s.add(box(0.06, 0.78, 0.06, '#3a2414', x, 0.39, z));
    const paper = box(0.42, 0.01, 0.56, new T3.MeshBasicMaterial({ map: TX.sign('RECORD\nCONTRACT\n\n.......', '#f0ead8', '#2a2a2a', 64, 88, 7) }), 0, 0.83, 0.15); s.add(paper);
    const pen = box(0.02, 0.02, 0.2, '#1a1a1a', 0, 0.86, 0.1); s.add(pen);
    const exec = person({ shirt: '#e8e4dc', jacket: '#2a2a30', trousers: '#2a2a30', hair: '#3a2a1a', skin: '#ecc4a0' }); s.add(exec); exec.position.set(0, 0, -0.9);
    const b = band(s, ['alex', 'jamie', 'matt', 'andy'], { alex: [0.2, 1.0, Math.PI], jamie: [-0.9, 1.3, Math.PI], matt: [1.1, 1.3, Math.PI], andy: [-1.9, 1.4, Math.PI] }); Object.values(b).forEach(p => p.userData.gtr && (p.userData.gtr.visible = false)); b.matt.userData.kit.visible = false;
    const signT = wt(4, 'sign');
    return (lt, T, D) => { idle(exec, T); exec.userData.armR.rotation.x = -0.6; Object.values(b).forEach((p, i) => { idle(p, T + i); });
      const k = prog(lt, signT, signT + 1.6); b.alex.userData.armR.rotation.x = k > 0 && k < 1 ? -1.0 + S(T * 16) * 0.1 : 0; pen.position.set(0.05 + S(T * 16) * 0.06 * (k > 0 && k < 1), 0.86, 0.2);
      if (lt > signT + 1.7) { cheer(b.matt, T); cheer(b.jamie, T + 1); }
      camL([3.0, 2.3, 0.8], [2.2, 1.8, 0.5], prog(lt, 0, signT + 1.6), [0, 1.0, 0.3], [0, 0.9, 0.2]); } },
  // 5 January 2006 — record shop queue
  () => { const s = mkScene(['#9ab4cc', '#e0e4dc'], ['#c8d0d8', 20, 70], { hemi: 0.9, dir: 0.8 });
    s.add(ground(20, TT.wood([8, 8]))); const back = new T3.Mesh(new T3.PlaneGeometry(20, 3.4), M('#ffffff', TT.sleeves([10, 3]))); back.position.set(0, 1.7, -4); s.add(back);
    const cnt = box(3, 1.0, 0.8, '#3a3a40', 2.5, 0.5, -1.5); s.add(cnt); const till = box(0.4, 0.3, 0.3, '#1a1a1a', 2.0, 1.15, -1.5); s.add(till);
    const stacks = []; for (let i = 0; i < 6; i++) { const st = box(0.5, 0.6, 0.5, M('#ffffff', TT.album()), 0.6 + (i % 3) * 0.6, 0.3, -2.8 + Math.floor(i / 3) * 0.6); s.add(st); stacks.push(st); }
    const big = box(1.6, 1.6, 0.05, new T3.MeshBasicMaterial({ map: TT.album() }), -2.2, 2.0, -3.95); s.add(big); const nsign = signBoard('NEW RELEASE', 1.8, 0.4, { bg: '#c8302a', fg: '#fff', pw: 96, ph: 24, size: 8 }); nsign.position.set(-2.2, 3.0, -3.94); s.add(nsign);
    const queue = Array.from({ length: 14 }, (_, i) => { const p = person({ shirt: ['#3a3a44', '#6a2a2a', '#2a4a6a', '#d8d4cc', '#4a5a3a'][i % 5], trousers: ['#2a3450', '#1a1a1e'][i % 2], hair: ['#1a1a1a', '#5a3a22', '#9a7a4a'][i % 3], skin: ['#ecc4a0', '#d8a880', '#a8704a'][i % 3] }); s.add(p); return p; });
    return (lt, T, D) => { queue.forEach((p, i) => { const k = (lt * 0.35 + i * 0.12) % 1; p.position.set(lerp(-6, 1.6, i / 14) + (k > 0.9 ? 0 : 0), 0, 0.2 + S(i) * 0.3); p.rotation.y = Math.PI / 2; idle(p, T + i); if (i === 13) { p.userData.armR.rotation.x = -1.2; } }); stacks.forEach((st, i) => st.scale.y = 1 - ((lt * 0.3 + i * 0.17) % 1) * 0.6);
      camL([-4, 2.2, 4.5], [0, 2.0, 4.2], prog(lt, 0, D), [-1, 1.2, -2], [1.4, 1.1, -1.6]); } },
  // 6 Summer 2006 — Andy leaves, Nick joins → Mercury Prize
  () => { const s = mkScene(['#0a0a18', '#1a1a30'], ['#0a0a18', 16, 60], { hemi: 0.5, dir: 0.4, sun: '#b0b8ff' });
    s.add(ground(30, TT.road([10, 10]))); s.add(box(9, 0.6, 4, '#1a1a1e', 0, 0.3, -2.5)); for (let i = 0; i < 8; i++) { const sp = new T3.SpotLight(['#ff4a8a', '#4ab0ff', '#ffd04a', '#ffffff'][i % 4], 3, 14, 0.4, 0.5, 1); sp.position.set(-4 + i * 1.15, 5, 0); sp.target.position.set(-1.5 + (i % 4), 0.6, -2.5); s.add(sp, sp.target); }
    { const _o = amp(0.8, 1.0); s.add(_o); _o.position.set(-3.2, 0.6, -4); }; { const _o = amp(0.8, 1.0); s.add(_o); _o.position.set(3.2, 0.6, -4); };
    const b = band(s, ['alex', 'jamie', 'matt', 'andy', 'nick'], { alex: [-1.2, -1.6, 0], jamie: [0.4, -1.8, 0], matt: [-0.4, -3.2, 0], andy: [2.0, -1.9, 0], nick: [5.0, -1.9, 0] }); Object.values(b).forEach(p => p.position.y = 0.6); b.matt.userData.kit.position.y = 0.6;
    tag(b.andy, 'andy', AT(6, 'andy') - 0.2, AT(6, 'nick') - 0.3, 'LEAVES'); tag(b.nick, 'nick', AT(6, 'nick') - 0.2, AT(6, 'in') , 'JOINS');
    const T2 = new T3.Group(); T2.position.set(60, 0, 0); s.add(T2); const plinth = box(1.2, 1, 1.2, '#2a2a36', 0, 0.5, 0); T2.add(plinth); const prize = trophy('#c8d0e0'); prize.scale.setScalar(2.4); prize.position.y = 1; T2.add(prize); const pl = new T3.PointLight('#ffffff', 3, 8); pl.position.set(60, 4, 2); s.add(pl);
    const leave = wt(6, 'andy'), nickT = wt(6, 'nick'), sept = wt(6, 'in');
    return (lt, T, D) => { playBand(b, T); const kl = ease(prog(lt, leave, leave + 1.4)); b.andy.position.x = lerp(2.0, 6.0, kl); b.andy.rotation.y = kl > 0 ? -Math.PI / 2 : 0; if (kl > 0 && kl < 1) run(b.andy, T * 8, 0.6);
      const kn = ease(prog(lt, nickT - 0.2, nickT + 1.2)); b.nick.position.x = lerp(6.0, 2.0, kn); b.nick.rotation.y = kn < 1 ? -Math.PI / 2 + Math.PI : 0; if (kn > 0 && kn < 1) run(b.nick, T * 8, 0.6); b.nick.visible = lt > nickT - 0.3; b.andy.visible = kl < 1;
      if (lt < sept - 0.2) camL([1.6, 2.2, 3.6], [1.8, 2.0, 3.0], prog(lt, 0, sept), [1.6, 1.4, -1.9], [2.0, 1.4, -1.9]); else { prize.rotation.y = T * 0.8; cam([60 + S(lt) * 0.5, 2.4, 4.0], [60, 2.1, 0]); } } },
  // 7 2013 and beyond — festival headline
  () => { const s = mkScene(['#04060e', '#1a1838'], ['#0a0a18', 40, 160], { hemi: 0.7, dir: 0.4, sun: '#c8c8ff' });
    s.add(ground(300, TX.grass([60, 60]), '#3a4a3a')); const stage = new T3.Group(); s.add(stage); stage.position.z = -12; stage.add(box(16, 1.6, 7, '#141418', 0, 0.8, 0));
    for (const x of [-8, 8]) stage.add(box(0.5, 10, 0.5, '#4a4a52', x, 5, -3)); stage.add(box(17, 0.6, 0.6, '#4a4a52', 0, 10, -3)); stage.add(box(16, 0.5, 7.5, '#1a1a20', 0, 10.5, 0));
    for (const x of [-11, 11]) { const scr = box(4.5, 2.6, 0.1, new T3.MeshBasicMaterial({ map: TT.screen() }), x, 6, -1); stage.add(scr); }
    const beams = []; for (let i = 0; i < 10; i++) { const bm = new T3.Mesh(new T3.ConeGeometry(1.2, 18, 6, 1, true), new T3.MeshBasicMaterial({ color: ['#ff4a8a', '#4ab0ff', '#ffd04a', '#ffffff', '#8a4aff'][i % 5], transparent: true, opacity: 0.18, side: T3.DoubleSide, fog: false })); bm.position.set(-7 + i * 1.55, 1, -12); s.add(bm); beams.push(bm); }
    const b = band(stage, ['alex', 'jamie', 'matt', 'nick'], { alex: [-1.6, 1.6, 0], jamie: [0.6, 1.4, 0], matt: [-0.4, -0.8, 0], nick: [2.8, 1.2, 0] }); Object.values(b).forEach(p => p.position.y = 1.6); b.matt.userData.kit.position.y = 1.6;
    for (const x of [-3, 3]) { const sp = new T3.SpotLight('#ffffff', 5, 20, 0.5, 0.5, 1); sp.position.set(x, 9, -6); sp.target.position.set(0, 1.6, -11); s.add(sp, sp.target); }
    const fans = crowd(s, 90, 0, 6, 26, 14, 41, Math.PI); for (let i = 0; i < 6; i++) s.add(crowdStand(14, 3, -20 + i * 8, 22, Math.PI));
    return (lt, T, D) => { playBand(b, T); fans.forEach(p => jump(p, T, 0.8)); beams.forEach((bm, i) => { bm.rotation.z = Math.PI + S(T * 0.8 + i) * 0.5; bm.position.y = 10; });
      camL([0, 3, 18], [6, 9, 10], prog(lt, 0, D), [0, 2, -8], [0, 3, -12]); } },
  // 8 ending — pub vs stadium
  () => { const s = mkScene(['#04060e', '#1a1838'], ['#0a0a18', 40, 160], { hemi: 0.7, dir: 0.4 });
    s.add(ground(300, TX.grass([60, 60]), '#3a4a3a')); const stage = new T3.Group(); s.add(stage); stage.position.z = -12; stage.add(box(16, 1.6, 7, '#141418', 0, 0.8, 0)); stage.add(box(17, 0.6, 0.6, '#4a4a52', 0, 10, -3));
    const b = band(stage, ['alex', 'jamie', 'matt', 'nick'], { alex: [-1.6, 1.6, 0], jamie: [0.6, 1.4, 0], matt: [-0.4, -0.8, 0], nick: [2.8, 1.2, 0] }); Object.values(b).forEach(p => p.position.y = 1.6); b.matt.userData.kit.position.y = 1.6;
    for (const x of [-3, 3]) { const sp = new T3.SpotLight('#ffffff', 5, 20, 0.5, 0.5, 1); sp.position.set(x, 9, -6); sp.target.position.set(0, 1.6, -11); s.add(sp, sp.target); }
    const fans = crowd(s, 90, 0, 6, 26, 14, 43, Math.PI);
    const fw = []; for (let i = 0; i < 5; i++) { const g = new T3.Group(); for (let j = 0; j < 20; j++) g.add(box(0.3, 0.3, 0.3, new T3.MeshBasicMaterial({ color: ['#ffd04a', '#ff4a6a', '#4ad0ff', '#ffffff'][i % 4] }))); s.add(g); fw.push(g); }
    return (lt, T, D) => { playBand(b, T); fans.forEach(p => jump(p, T)); fw.forEach((g, i) => { const k = ((lt * 0.5 + i / 5) % 1); g.children.forEach((c, j) => { const a = j / 20 * Math.PI * 2, e = S(j * 1.7); const r = ease(k) * 4; c.position.set(-10 + i * 5 + C(a) * C(e) * r, 16 + S(e) * r - k * k * 3, -16 + S(a) * r); c.visible = k > 0.05 && k < 0.85; }); });
      camL([0, 14, 30], [0, 8, 22], prog(lt, 0, D), [0, 2, -10], [0, 2, -12]); } },
];

// ---------- HUD ----------
const STEP = ['', 'STEP 1', 'STEP 2', 'STEP 3', 'STEP 4', 'STEP 5', 'STEP 6', 'STEP 7', ''];
const DATE = ['', '2002', 'JUNE 2003', '2003 TO 2005', 'JUNE 2005', 'JANUARY 2006', 'SUMMER 2006', '2013 ONWARDS', ''];
const PLACE = ['', 'HIGH GREEN . SHEFFIELD', 'THE GRAPES . SHEFFIELD', 'THE INTERNET', 'DOMINO RECORDS', 'THE UK CHARTS', 'LINE UP CHANGE', 'WORLDWIDE', ''];
function plate(ctx, step, date, place, slide) { ctx.save(); ctx.translate(-300 * (1 - slide), 0); ctx.beginPath(); ctx.moveTo(0, 60); ctx.lineTo(450, 60); ctx.lineTo(410, 170); ctx.lineTo(0, 170); ctx.closePath(); const g = ctx.createLinearGradient(0, 60, 0, 170); g.addColorStop(0, 'rgba(18,40,110,0.92)'); g.addColorStop(1, 'rgba(6,16,50,0.92)'); ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = '#7ad0ff'; ctx.lineWidth = 4; ctx.stroke(); ctx.fillStyle = '#ffd23a'; ctx.fillRect(0, 60, 14, 110);
  ctx.font = '30px Russo'; ctx.fillStyle = '#7ad0ff'; ctx.fillText(step, 32, 100); ctx.font = '30px PressStart'; ctx.fillStyle = '#fff'; ctx.fillText(date, 32, 150); ctx.restore();
  ctx.save(); ctx.globalAlpha = slide; ctx.font = '18px PressStart'; ctx.fillStyle = '#ffd23a'; ctx.strokeStyle = '#000'; ctx.lineWidth = 6; ctx.strokeText(place, 30, 205); ctx.fillText(place, 30, 205); ctx.restore(); }
function bigText(ctx, txt, y, size, col = '#ffd23a', a = 1, font = 'Russo') { if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.font = `${size}px ${font}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round'; ctx.lineWidth = size * 0.22; ctx.strokeStyle = '#05081a'; ctx.strokeText(txt, 360, y); ctx.fillStyle = col; ctx.fillText(txt, 360, y); ctx.restore(); }
function card(ctx, title, x, y, w, h, a) { ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = 'rgba(6,14,40,0.9)'; ctx.fillRect(x, y, w, h); ctx.strokeStyle = '#7ad0ff'; ctx.lineWidth = 4; ctx.strokeRect(x, y, w, h); ctx.fillStyle = '#ffd23a'; ctx.fillRect(x, y, w, 34); ctx.font = '16px PressStart'; ctx.fillStyle = '#06102a'; ctx.textBaseline = 'middle'; ctx.fillText(title, x + 14, y + 18); ctx.restore(); }
function txt(ctx, s, x, y, size, c, align = 'left', font = 'Russo') { ctx.font = `${size}px ${font}`; ctx.fillStyle = c; ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.fillText(s, x, y); ctx.textAlign = 'left'; }
function dot(ctx, x, y, r, c) { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); }
const V = new T3.Vector3();
function nameTag(ctx, tg, T, sc) { if (T < tg.a0 || T > tg.a1 || !tg.p.visible) return; if (SCENES[sc].scene !== tg.scene) return; tg.p.updateMatrixWorld(true); tg.p.userData.head.getWorldPosition(V); V.y += 0.55; V.project(camera); if (V.z > 1) return; const x = (V.x * 0.5 + 0.5) * W, y = (-V.y * 0.5 + 0.5) * H; if (x < -100 || x > W + 100 || y < -200 || y > 1000) return;
  const a = Math.min(prog(T, tg.a0, tg.a0 + 0.3), 1 - prog(T, tg.a1 - 0.2, tg.a1)); const pop = 1 + 0.3 * (1 - ease(prog(T, tg.a0, tg.a0 + 0.25)));
  ctx.save(); ctx.globalAlpha = a; ctx.translate(clamp(x, 150, W - 150), clamp(y - 20, 300, 960)); ctx.scale(pop, pop); ctx.font = '26px Russo'; const nm = NAMES[tg.key]; const w = ctx.measureText(nm).width + 28; ctx.fillStyle = 'rgba(6,14,40,0.9)'; ctx.fillRect(-w / 2, -54, w, 62); ctx.strokeStyle = tg.sub === 'LEAVES' ? '#ff5a3a' : '#7dffb0'; ctx.lineWidth = 3; ctx.strokeRect(-w / 2, -54, w, 62);
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#fff'; ctx.fillText(nm, 0, -36); ctx.font = '12px PressStart'; ctx.fillStyle = tg.sub === 'LEAVES' ? '#ff5a3a' : '#ffd23a'; ctx.fillText(tg.sub || ROLE[tg.key], 0, -10); ctx.beginPath(); ctx.moveTo(-8, 8); ctx.lineTo(8, 8); ctx.lineTo(0, 18); ctx.fillStyle = 'rgba(6,14,40,0.9)'; ctx.fill(); ctx.restore(); }
const DIAG = [
  { a: () => AT(2, 'paid') - 0.2, b: () => CL[3].start, draw: (ctx, T, a) => { const x = 140, y = 440, w = 440, h = 300; card(ctx, 'FIRST GIG', x, y, w, h, a); ctx.save(); ctx.globalAlpha = a; txt(ctx, '13 JUNE 2003', x + w / 2, y + 80, 34, '#fff', 'center'); txt(ctx, 'AGE 16', x + w / 2, y + 130, 28, '#7ad0ff', 'center');
      const k = prog(T, AT(2, 'paid'), AT(2, 'pounds') + 0.4); txt(ctx, `PAID £${Math.round(27 * ease(k))}`, x + w / 2, y + 210, 60, '#7dffb0', 'center'); ctx.restore(); } },
  { a: () => AT(3, 'fans') - 0.2, b: () => AT(3, 'soon') - 0.2, draw: (ctx, T, a, lt) => { const x = 60, y = 400, w = 600, h = 560; card(ctx, 'SHARED ONLINE', x, y, w, h, a); ctx.save(); ctx.globalAlpha = a;
      const cx = x + w / 2, cy = y + 260; const k = prog(T, AT(3, 'fans'), AT(3, 'fan') + 0.5); const r = rng(5); const pts = Array.from({ length: 60 }, (_, i) => [cx + (r() - 0.5) * 520, cy + (r() - 0.5) * 380, r()]);
      pts.forEach(([px, py, q], i) => { if (q > k) return; ctx.strokeStyle = 'rgba(122,208,255,0.35)'; ctx.lineWidth = 2; const [qx, qy] = i ? pts[Math.floor(q * i)] : [cx, cy]; ctx.beginPath(); ctx.moveTo(qx, qy); ctx.lineTo(px, py); ctx.stroke(); dot(ctx, px, py, 6, '#7ad0ff'); });
      dot(ctx, cx, cy, 14, '#ffd23a'); txt(ctx, 'SHEFFIELD', cx, cy + 30, 18, '#ffd23a', 'center', 'PressStart');
      if (T > AT(3, 'myspace') - 0.3) { const bx = x + 70, by = y + h - 150; ctx.fillStyle = '#e8e8f0'; ctx.fillRect(bx, by, w - 140, 120); ctx.fillStyle = '#2a4a9a'; ctx.fillRect(bx, by, w - 140, 26); txt(ctx, 'FAN PAGE', bx + 12, by + 13, 14, '#fff', 'left', 'PressStart'); ctx.fillStyle = '#c8c8d0'; ctx.fillRect(bx + 14, by + 40, 66, 66); txt(ctx, 'ARCTIC MONKEYS', bx + 96, by + 56, 24, '#1a1a2a'); txt(ctx, 'MADE BY FANS', bx + 96, by + 88, 16, '#5a5a6a', 'left', 'PressStart'); }
      ctx.restore(); } },
  { a: () => AT(4, 'that') - 0.2, b: () => CL[5].start, draw: (ctx, T, a) => { const x = 60, y = 430, w = 600, h = 400; card(ctx, 'UK SINGLES CHART . OCT 2005', x, y, w, h, a); ctx.save(); ctx.globalAlpha = a;
      const k = prog(T, AT(4, 'goes') - 0.3, AT(4, 'one') + 0.2); const rows = ['I BET YOU LOOK GOOD', '........', '........', '........', '........']; rows.forEach((r, i) => { const yy = y + 80 + i * 62; const isUs = i === 0; const ty = isUs ? lerp(y + 80 + 4 * 62, yy, ease(k)) : yy + (k > 0 && i < 4 ? 0 : 0); ctx.fillStyle = isUs ? 'rgba(255,210,58,0.25)' : 'rgba(255,255,255,0.05)'; ctx.fillRect(x + 20, (isUs ? ty : yy) - 24, w - 40, 50); txt(ctx, `${i + 1}`, x + 50, isUs ? ty : yy, 30, isUs ? '#ffd23a' : '#9ab0d0', 'center'); txt(ctx, isUs ? 'I BET YOU LOOK GOOD ON THE DANCEFLOOR' : r, x + 90, isUs ? ty : yy, isUs ? 22 : 24, isUs ? '#fff' : '#5a6a8a'); });
      if (k >= 1) txt(ctx, 'STRAIGHT IN AT NUMBER 1', x + w / 2, y + h - 30, 28, '#7dffb0', 'center'); ctx.restore(); } },
  { a: () => AT(5, 'sells') - 0.3, b: () => CL[6].start, draw: (ctx, T, a) => { const x = 60, y = 430, w = 600, h = 470; card(ctx, 'FIRST WEEK SALES', x, y, w, h, a); ctx.save(); ctx.globalAlpha = a;
      const k = ease(prog(T, AT(5, 'sells'), AT(5, 'week') + 0.4)); const n = Math.round(363735 * k); txt(ctx, n.toLocaleString('en-GB'), x + w / 2, y + 100, 72, '#7dffb0', 'center'); txt(ctx, 'COPIES IN ONE WEEK', x + w / 2, y + 160, 22, '#9ab0d0', 'center', 'PressStart');
      const bx = x + 60, by = y + 380, mh = 160; const b1 = 306361 / 363735 * mh, b2 = mh * k; ctx.fillStyle = '#5a6a8a'; ctx.fillRect(bx + 60, by - b1, 120, b1); ctx.fillStyle = '#7dffb0'; ctx.fillRect(bx + 300, by - b2, 120, b2);
      txt(ctx, 'OLD RECORD', bx + 120, by + 24, 16, '#9ab0d0', 'center', 'PressStart'); txt(ctx, '306,361', bx + 120, by - b1 - 20, 22, '#fff', 'center'); txt(ctx, 'ARCTIC MONKEYS', bx + 360, by + 24, 16, '#7dffb0', 'center', 'PressStart');
      if (T > AT(5, 'fastest') - 0.2) txt(ctx, 'UK RECORD FOR A DEBUT AT THE TIME', x + w / 2, y + h - 22, 20, '#ffd23a', 'center'); ctx.restore(); } },
  { a: () => AT(6, 'win') - 0.1, b: () => CL[7].start, draw: (ctx, T, a) => { const x = 110, y = 760, w = 500, h = 150; card(ctx, 'MERCURY PRIZE 2006', x, y, w, h, a); ctx.save(); ctx.globalAlpha = a; txt(ctx, 'BEST ALBUM . WON', x + w / 2, y + 72, 30, '#7dffb0', 'center'); txt(ctx, '£20,000 GIVEN TO CHARITY', x + w / 2, y + 116, 20, '#ffd23a', 'center', 'PressStart'); ctx.restore(); } },
  { a: () => AT(7, 'seven') - 0.2, b: () => CL[8].start, draw: (ctx, T, a) => { const x = 80, y = 420, w = 560, h = 330; card(ctx, 'TROPHY CABINET', x, y, w, h, a); ctx.save(); ctx.globalAlpha = a;
      const rows = [['AM', '2013', AT(7, 'am')], ['BRIT AWARDS', '7', AT(7, 'seven')], ['GLASTONBURY HEADLINES', '3', AT(7, 'three')]]; rows.forEach(([n, v, t0], i) => { if (T < t0 - 0.1) return; const yy = y + 90 + i * 80; txt(ctx, n, x + 30, yy, 28, '#fff'); txt(ctx, v, x + w - 30, yy, 44, '#ffd23a', 'right'); }); ctx.restore(); } },
];
// captions with spoken numbers mapped back
const MAP = [[['step', 'one'], 'Step 1.'], [['step', 'two'], 'Step 2.'], [['step', 'three'], 'Step 3.'], [['step', 'four'], 'Step 4.'], [['step', 'five'], 'Step 5.'], [['step', 'six'], 'Step 6.'], [['step', 'seven'], 'Step 7.'],
  [['two', 'thousand', 'and', 'two'], '2002'], [['two', 'thousand', 'and', 'three'], '2003'], [['two', 'thousand', 'and', 'five'], '2005'], [['two', 'thousand', 'and', 'six'], '2006'], [['twenty', 'thirteen'], '2013'],
  [['twenty', 'seven', 'pounds'], '£27'], [['three', 'hundred', 'and', 'sixty', 'three', 'thousand'], '363,000'], [['sixteen'], '16']];
const CAPS = [];
for (const c of CL) { const raw = c.words, ws = []; for (let i = 0; i < raw.length;) { let hit = null; for (const [seq, rep] of MAP) if (seq.every((s, k) => raw[i + k] && raw[i + k].w.toLowerCase().replace(/[^a-z0-9]/g, '') === s)) { hit = [seq.length, rep]; break; } if (hit) { ws.push({ w: hit[1], a: raw[i].a, b: raw[i + hit[0] - 1].b }); i += hit[0]; } else { ws.push(raw[i]); i++; } }
  let cur = []; const flush = () => { if (cur.length) CAPS.push({ a: cur[0].a, b: cur[cur.length - 1].b, txt: cur.map(w => w.w).join(' ') }); cur = []; };
  ws.forEach(w => { if (cur.length && (cur.length >= 4 || w.a - cur[cur.length - 1].b > 0.2 || /\.$/.test(cur[cur.length - 1].w) || /^(High|Alex|Their|Matt|Andy|June|They're|They|Fans|A|Soon|That|January|The|Nick|In|Seven|Three|Which|Comment|From|Let's)$/.test(w.w) && cur.length > 1)) flush(); cur.push(w); }); flush(); }
CAPS.forEach((c, i) => { const nx = CAPS[i + 1]; c.b = nx ? Math.min(nx.a, c.b + 0.35) : c.b + 0.8; c.txt = c.txt.replace(/[:\-]/g, '.'); });
function captionBox(ctx, t) { ctx.save(); ctx.font = '48px Russo'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; const words = t.split(' '); const lines = []; let cur = ''; for (const w of words) { const x = cur ? cur + ' ' + w : w; if (ctx.measureText(x).width > 610 && cur) { lines.push(cur); cur = w; } else cur = x; } lines.push(cur);
  const y0 = 1090 - (lines.length - 1) * 30; lines.forEach((l, i) => { ctx.lineJoin = 'round'; ctx.lineWidth = 11; ctx.strokeStyle = '#05081a'; ctx.strokeText(l, 360, y0 + i * 60); ctx.fillStyle = '#fff'; ctx.fillText(l, 360, y0 + i * 60); }); ctx.restore(); }

let glc, out, octx, low, lctx;
window.initFootball = async function () {
  await Promise.all(['30px Russo', '20px PressStart'].map(f => document.fonts.load(f)));
  makeTextures(); tex();
  glc = document.createElement('canvas'); glc.width = RW; glc.height = RH;
  renderer = new T3.WebGLRenderer({ canvas: glc, antialias: false, preserveDrawingBuffer: true }); renderer.setPixelRatio(1); renderer.setSize(RW, RH, false); renderer.outputColorSpace = T3.SRGBColorSpace;
  camera = new T3.PerspectiveCamera(60, RW / RH, 0.05, 500);
  BUILD.forEach(b => { const n0 = TAGS.length; const upd = b(); SCENES.push({ scene: lastScene, update: upd }); for (let i = n0; i < TAGS.length; i++) TAGS[i].scene = lastScene; });
  out = document.getElementById('c'); octx = out.getContext('2d'); low = document.createElement('canvas'); lctx = low.getContext('2d');
};
window.DURATION = TM.total;
window.renderFrame = function (T) {
  let ci = CL.findIndex(c => T >= c.start && T < c.start + c.dur); if (ci < 0) ci = CL.length - 1;
  const lt = T - CL[ci].start, D = CL[ci].dur;
  SCENES[ci].update(lt, T, D); renderer.render(SCENES[ci].scene, camera);
  const mz = clamp(1 - lt / 0.3); const f = mz > 0 && ci > 0 ? Math.max(1, Math.round(mz * 12)) : 1;
  octx.imageSmoothingEnabled = false;
  if (f > 1) { low.width = Math.ceil(RW / f); low.height = Math.ceil(RH / f); lctx.imageSmoothingEnabled = false; lctx.drawImage(glc, 0, 0, low.width, low.height); octx.drawImage(low, 0, 0, W, H); } else octx.drawImage(glc, 0, 0, W, H);
  octx.fillStyle = 'rgba(0,0,0,0.10)'; for (let y = 0; y < H; y += 5) octx.fillRect(0, y, W, 2);
  const vg = octx.createRadialGradient(360, 640, 420, 360, 640, 900); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.4)'); octx.fillStyle = vg; octx.fillRect(0, 0, W, H);
  if (ci === 0) { const back = wt(0, 'back'); const ta = prog(lt, 0.2, 0.7) * (1 - prog(lt, back - 0.3, back)); bigText(octx, 'THE STORY OF', 300, 56, '#fff', ta); bigText(octx, 'ARCTIC MONKEYS', 380, 76, '#ffd23a', ta); bigText(octx, 'SHEFFIELD . ENGLAND', 450, 22, '#7ad0ff', ta, 'PressStart');
    if (lt > back - 0.3) { const k = prog(lt, back - 0.3, D - 0.2); octx.fillStyle = `rgba(255,255,255,${0.08 + 0.08 * S(lt * 40)})`; for (let i = 0; i < 6; i++) octx.fillRect(0, (lt * 900 + i * 230) % H, W, 14); bigText(octx, '<< REWIND', 330, 50, '#fff', 1, 'PressStart'); bigText(octx, String(Math.round(lerp(2026, 2002, ease(k)))), 450, 70, '#ffd23a', 1, 'PressStart'); } }
  if (STEP[ci]) plate(octx, STEP[ci], DATE[ci], PLACE[ci], ease(prog(lt, 0.15, 0.5)));
  for (const tg of TAGS) nameTag(octx, tg, T, ci);
  for (const d of DIAG) { const a0 = d.a(), b0 = d.b(); if (T >= a0 && T < b0) { const a = Math.min(prog(T, a0, a0 + 0.3), 1 - prog(T, b0 - 0.25, b0)); d.draw(octx, T, a, lt); } }
  if (ci === 4 && lt > wt(4, 'sign') && lt < wt(4, 'that') - 0.2) bigText(octx, 'SIGNED', 480, 90, '#7dffb0', prog(lt, wt(4, 'sign') + 1.4, wt(4, 'sign') + 1.7));
  if (ci === 8) { const at = wt(8, 'which'); const a1 = prog(lt, 0.2, 0.6) * (1 - prog(lt, at - 0.4, at - 0.1)); bigText(octx, '£27 PUB GIG', 360, 56, '#fff', a1); bigText(octx, 'TO', 430, 40, '#7ad0ff', a1); bigText(octx, 'THE BIGGEST STAGES', 500, 56, '#ffd23a', a1);
    if (lt > at - 0.2) { const a = prog(lt, at - 0.2, at + 0.2); bigText(octx, 'WHICH ERA IS', 380, 62, '#fff', a); bigText(octx, 'YOUR FAVOURITE?', 460, 62, '#ffd23a', a); if ((lt * 2) % 2 > 0.6) bigText(octx, 'COMMENT BELOW', 560, 26, '#7ad0ff', a, 'PressStart'); } }
  const cap = CAPS.find(c => T >= c.a && T < c.b); if (cap) captionBox(octx, cap.txt);
  if (T < 0.25) { octx.fillStyle = `rgba(0,0,0,${1 - T / 0.25})`; octx.fillRect(0, 0, W, H); }
  if (T > TM.total - 0.8) { octx.fillStyle = `rgba(0,0,0,${prog(T, TM.total - 0.8, TM.total)})`; octx.fillRect(0, 0, W, H); }
};
})();
