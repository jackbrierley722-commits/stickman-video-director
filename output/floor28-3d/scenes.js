// 28th Floor — stay in the room. Low-poly retro console style with a survival tracker HUD.
(() => {
const { T3, RW, RH, W, H, clamp, lerp, ease, prog, rng, makeTextures, TX, mat, box, cyl, sph, ground, person, run, idle, kick, cheer, trophy, signBoard } = window.W3;
const TM = window.TIMING, CL = TM.clips;
const S = Math.sin, C = Math.cos;
function wt(ci, word, n = 0) { let k = 0; for (const w of CL[ci].words) if (w.w.toLowerCase().replace(/[^a-z0-9']/g, '') === word) { if (k === n) return w.a - CL[ci].start; k++; } return 0; }
const AT = (ci, w, n = 0) => CL[ci].start + wt(ci, w, n);

let renderer, camera, lastScene = null;
const SCENES = [];
function mkScene(sky, fog, light = {}) {
  const s = new T3.Scene(); lastScene = s;
  const geo = new T3.SphereGeometry(400, 12, 8); const cols = []; const pos = geo.attributes.position;
  const top = new T3.Color(sky[0]), bot = new T3.Color(sky[1]);
  for (let i = 0; i < pos.count; i++) { const y = clamp(pos.getY(i) / 400 * 1.6 + 0.2); const c = bot.clone().lerp(top, y); cols.push(c.r, c.g, c.b); }
  geo.setAttribute('color', new T3.Float32BufferAttribute(cols, 3));
  s.add(new T3.Mesh(geo, new T3.MeshBasicMaterial({ vertexColors: true, side: T3.BackSide, fog: false })));
  s.fog = new T3.Fog(fog[0], fog[1], fog[2]);
  const hemi = new T3.HemisphereLight(light.sky || '#ffffff', light.ground || '#556644', light.hemi ?? 0.9); s.add(hemi);
  const d = new T3.DirectionalLight(light.sun || '#fff4dd', light.dir ?? 1.1); d.position.set(5, 10, 6); s.add(d);
  s.userData = { hemi, dir: d }; return s;
}
function cam(p, l) { camera.position.set(p[0], p[1], p[2]); camera.lookAt(l[0], l[1], l[2]); }
function camL(a, b, k, la, lb) { k = ease(k); cam([lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)], [lerp(la[0], lb[0], k), lerp(la[1], lb[1], k), lerp(la[2], lb[2], k)]); }
function put(s, o, x = 0, y = 0, z = 0) { o.position.set(x, y, z); s.add(o); return o; }
const YOU = { shirt: '#f0f0ec', trousers: '#3a3e48', tie: '#2a4a9a', skin: '#e8b896', hair: '#2a1c14', longSleeve: true };
const ZOMB = i => ({ shirt: ['#7a7e78', '#5a6070', '#8a7a6a', '#6a5a5a'][i % 4], trousers: ['#3a3a3a', '#4a4030', '#2a2a40'][i % 3], skin: ['#9aaa88', '#8a9c7c', '#a0aa90'][i % 3], hair: ['#2a2a24', '#4a3a2a', '#1a1a1a'][i % 3] });
const WORKER = i => ({ shirt: ['#d8e0ec', '#f0e8d8', '#c8d8c8', '#e8c8c8', '#2a3a5a'][i % 5], trousers: ['#2a2e38', '#4a4a50', '#1a1a1e'][i % 3], skin: ['#ecc4a0', '#a8704a', '#6a4028', '#d8a880'][i % 4], hair: ['#1a1a1a', '#5a3a1a', '#c09050', '#8a5a2a'][i % 4], longSleeve: true, tie: i % 3 === 0 ? '#7a1a2a' : null });
function shamble(p, t, i = 0) { const u = p.userData; u.armL.rotation.x = u.armR.rotation.x = -1.45 + S(t * 2 + i) * 0.1; u.armL.rotation.z = -0.1; u.armR.rotation.z = 0.1; u.legL.rotation.x = S(t * 3 + i) * 0.35; u.legR.rotation.x = -S(t * 3 + i) * 0.35; u.body.rotation.z = S(t * 1.5 + i) * 0.12; u.head.rotation.z = 0.3; }

// city skyline texture for windows
function skylineTex(night) { const c = document.createElement('canvas'); c.width = 128; c.height = 64; const g = c.getContext('2d'); const gr = g.createLinearGradient(0, 0, 0, 64); gr.addColorStop(0, night ? '#05070f' : '#3a2a40'); gr.addColorStop(1, night ? '#0a0e18' : '#e07040'); g.fillStyle = gr; g.fillRect(0, 0, 128, 64); const r = rng(night ? 3 : 2);
  for (let i = 0; i < 18; i++) { const x = i * 7 + (r() * 3 | 0), h = 14 + r() * 34 | 0, w = 6; g.fillStyle = night ? '#07090e' : '#2a2632'; g.fillRect(x, 64 - h, w, h); for (let y = 64 - h + 2; y < 62; y += 3) for (let xx = x + 1; xx < x + w - 1; xx += 2) if (r() > (night ? 0.97 : 0.6)) { g.fillStyle = '#f0c060'; g.fillRect(xx, y, 1, 1); } }
  if (!night) for (let i = 0; i < 4; i++) { g.fillStyle = 'rgba(40,34,40,0.6)'; g.beginPath(); g.arc(20 + i * 30, 36 - i * 3, 6 + i, 0, 7); g.fill(); g.fillStyle = 'rgba(255,120,40,0.7)'; g.fillRect(18 + i * 30, 58, 4, 4); }
  const t = new T3.CanvasTexture(c); t.magFilter = T3.NearestFilter; t.minFilter = T3.NearestFilter; t.colorSpace = T3.SRGBColorSpace; return t; }
function carpetTex() { const c = document.createElement('canvas'); c.width = 32; c.height = 32; const g = c.getContext('2d'); const r = rng(77); for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) { const k = (r() - 0.5) * 18 + ((x + y) % 8 < 1 ? -10 : 0); g.fillStyle = `rgb(${84 + k},${92 + k},${110 + k})`; g.fillRect(x, y, 1, 1); } const t = new T3.CanvasTexture(c); t.magFilter = t.minFilter = T3.NearestFilter; t.wrapS = t.wrapT = T3.RepeatWrapping; t.repeat.set(10, 9); t.colorSpace = T3.SRGBColorSpace; return t; }
function carpet(rep) { return TX.mud ? new T3.MeshLambertMaterial({ map: (() => { const t = TX.stone(rep); return t; })(), color: '#7a8496' }) : mat('#7a8496'); }

// ---------- the office room (shared by several clips) ----------
function officeRoom(s, opts = {}) {
  const fl = new T3.Mesh(new T3.PlaneGeometry(14, 12), new T3.MeshLambertMaterial({ map: carpetTex() })); fl.rotation.x = -Math.PI / 2; s.add(fl);
  const wallM = new T3.MeshLambertMaterial({ color: '#cfd2cc' });
  const back = new T3.Mesh(new T3.PlaneGeometry(14, 4), wallM); back.position.set(0, 2, -6); s.add(back);
  const left = new T3.Mesh(new T3.PlaneGeometry(12, 4), wallM); left.rotation.y = Math.PI / 2; left.position.set(-7, 2, 0); s.add(left);
  const ceil = new T3.Mesh(new T3.PlaneGeometry(14, 12), new T3.MeshLambertMaterial({ color: '#e0e0da', side: T3.DoubleSide })); ceil.rotation.x = Math.PI / 2; ceil.position.y = 4; s.add(ceil);
  // window wall on right with skyline
  const win = new T3.Mesh(new T3.PlaneGeometry(12, 3.2), new T3.MeshBasicMaterial({ map: skylineTex(false) })); win.rotation.y = -Math.PI / 2; win.position.set(7, 2.1, 0); s.add(win);
  const winN = new T3.Mesh(new T3.PlaneGeometry(12, 3.2), new T3.MeshBasicMaterial({ map: skylineTex(true) })); winN.rotation.y = -Math.PI / 2; winN.position.set(6.99, 2.1, 0); winN.visible = false; s.add(winN);
  for (let z = -6; z <= 6; z += 2) s.add(box(0.12, 4, 0.12, '#4a4e56', 6.95, 2, z)); s.add(box(0.12, 0.3, 12, '#4a4e56', 6.95, 0.35, 0)); s.add(box(0.12, 0.3, 12, '#4a4e56', 6.95, 3.75, 0));
  // ceiling lights
  const lights = []; for (const [x, z] of [[-3, -2], [2, -2], [-3, 2.5], [2, 2.5]]) { const l = box(1.6, 0.06, 0.5, new T3.MeshBasicMaterial({ color: '#fbfbf0' }), x, 3.96, z); s.add(l); lights.push(l); }
  // door on back wall
  const door = new T3.Group(); door.add(box(1.2, 2.3, 0.1, '#6a4a32', 0, 1.15, 0)); door.add(box(0.12, 0.06, 0.12, '#c8c8c8', 0.45, 1.1, 0.08)); const lock = box(0.08, 0.14, 0.06, '#d8c070', 0.45, 1.3, 0.08); door.add(lock); door.position.set(-3.5, 0, -5.94); s.add(door);
  s.add(box(1.4, 0.1, 0.12, '#3a2a1a', -3.5, 2.35, -5.92));
  // desks with monitors
  const desks = []; const deskAt = (x, z, r = 0) => { const g = new T3.Group(); g.add(box(1.8, 0.08, 0.9, '#e8e0d0', 0, 0.75, 0)); for (const [dx, dz] of [[-0.8, -0.38], [0.8, -0.38], [-0.8, 0.38], [0.8, 0.38]]) g.add(box(0.06, 0.75, 0.06, '#5a5e66', dx, 0.375, dz)); g.add(box(0.6, 0.4, 0.05, '#1a1c22', 0, 1.05, -0.25)); const scr = box(0.54, 0.34, 0.01, new T3.MeshBasicMaterial({ color: '#5a8ac0' }), 0, 1.05, -0.22); g.add(scr); g.add(box(0.1, 0.12, 0.08, '#1a1c22', 0, 0.85, -0.25)); g.position.set(x, 0, z); g.rotation.y = r; s.add(g); g.userData.scr = scr; desks.push(g); return g; };
  deskAt(1.5, -3.5); deskAt(1.5, 0.5); deskAt(-2, 1.5); const blockDesk = deskAt(-1.3, -4.2);
  // kitchen counter on left wall
  const counter = new T3.Group(); counter.add(box(0.8, 0.9, 3, '#8a8a90', 0, 0.45, 0)); counter.add(box(0.85, 0.06, 3.05, '#d8d4c8', 0, 0.92, 0)); counter.add(box(0.5, 0.05, 0.6, '#9aa0a8', 0, 0.96, -0.6)); counter.add(cyl(0.03, 0.03, 0.4, 6, '#c8c8c8', -0.25, 1.15, -0.6)); counter.add(box(0.25, 0.03, 0.03, '#c8c8c8', -0.12, 1.33, -0.6)); counter.position.set(-6.5, 0, 1); s.add(counter);
  return { lights, door, lock, desks, blockDesk, win, winN, counter };
}

// ---------- scenes ----------
const BUILD = [
  // 0 Tower → hallway stampede → zombies at the stairwell
  () => {
    const s = mkScene(['#2a2440', '#d0703a'], ['#a85a40', 60, 260], { sun: '#ffcc99', dir: 1.0 });
    // tower exterior part
    const twr = new T3.Group(); twr.position.set(0, 0, -80); s.add(twr);
    const tw = box(14, 120, 14, new T3.MeshLambertMaterial({ map: (() => { const c = document.createElement('canvas'); c.width = 16; c.height = 128; const g = c.getContext('2d'); g.fillStyle = '#2a3240'; g.fillRect(0, 0, 16, 128); for (let y = 0; y < 128; y += 2) for (let x = 0; x < 16; x += 2) { const f = 63 - y / 2; g.fillStyle = f === 27 ? '#ffd27a' : (Math.sin(x * 7 + y * 13) > 0.6 ? '#c8a860' : '#141a26'); g.fillRect(x, y, 1, 1); } const t = new T3.CanvasTexture(c); t.magFilter = t.minFilter = T3.NearestFilter; t.colorSpace = T3.SRGBColorSpace; return t; })() }), 0, 60, 0); twr.add(tw);
    const r = rng(9); for (let i = 0; i < 30; i++) { const h = 20 + r() * 50; const b = box(8 + r() * 6, h, 8 + r() * 6, new T3.MeshLambertMaterial({ color: '#2a2a36' }), (r() - 0.5) * 160, h / 2, -40 - r() * 120); if (Math.abs(b.position.x) < 12 && b.position.z > -100) b.position.x += 30; twr.add(b); }
    const smoke = []; for (let i = 0; i < 24; i++) { const p = sph(4, new T3.MeshLambertMaterial({ color: '#3a3438', transparent: true, opacity: 0.6 }), 0, 0, 0, 6, 4); twr.add(p); smoke.push(p); }
    const fl = new T3.Mesh(new T3.PlaneGeometry(600, 600), mat('#2a2830')); fl.rotation.x = -Math.PI / 2; twr.add(fl);
    // hallway part (far away at x=300)
    const hall = new T3.Group(); hall.position.set(300, 0, 0); s.add(hall);
    const hm = new T3.MeshLambertMaterial({ color: '#cfd2cc' });
    const hf = new T3.Mesh(new T3.PlaneGeometry(6, 40), mat('#7a8496')); hf.rotation.x = -Math.PI / 2; hall.add(hf);
    for (const sx of [-3, 3]) { const w = new T3.Mesh(new T3.PlaneGeometry(40, 4), hm); w.rotation.y = sx < 0 ? Math.PI / 2 : -Math.PI / 2; w.position.set(sx, 2, 0); hall.add(w); }
    const hc = new T3.Mesh(new T3.PlaneGeometry(6, 40), mat('#e0e0da')); hc.rotation.x = Math.PI / 2; hc.position.y = 4; hall.add(hc);
    for (let z = -18; z < 18; z += 4) hall.add(box(1.2, 0.05, 0.4, new T3.MeshBasicMaterial({ color: '#fbfbf0' }), 0, 3.97, z));
    const end = new T3.Mesh(new T3.PlaneGeometry(6, 4), hm); end.position.set(0, 2, -20); hall.add(end);
    const sdoor = box(1.4, 2.4, 0.1, '#7a3a2a', 0, 1.2, -19.9); hall.add(sdoor); const ex = signBoard('EXIT', 1.1, 0.4, { bg: '#1a7a3a', fg: '#d8ffe0', pw: 64, ph: 24, size: 10 }); ex.position.set(0, 2.8, -19.88); hall.add(ex);
    for (const z of [-8, 2]) { hall.add(box(0.1, 2.4, 1.6, '#b8bcc4', 2.95, 1.2, z)); }
    const workers = Array.from({ length: 10 }, (_, i) => { const p = person(WORKER(i)); hall.add(p); return p; });
    const zs = Array.from({ length: 6 }, (_, i) => { const p = person(ZOMB(i)); hall.add(p); return p; });
    const run1 = wt(0, 'everyone'), where = wt(0, "that's");
    return (lt, T, D) => {
      smoke.forEach((p, i) => { const k = ((T * 0.05 + i / 24) % 1); p.position.set((i % 6 - 2.5) * 22 + k * 10, 4 + k * 60, -60 - (i % 4) * 20); p.scale.setScalar(0.8 + k * 3); p.material.opacity = 0.6 * (1 - k); });
      if (lt < run1 - 0.2) { const k = prog(lt, 0, run1 - 0.2); camL([0, 6, 40], [0, 54, 14], k, [0, 20, -80], [0, 52, -80]); return; }
      workers.forEach((p, i) => { const r0 = (i * 0.37) % 1; p.position.set(-1.6 + (i % 4) * 1.05, 0, lerp(8 + r0 * 6, -16, prog(lt, run1 - 0.2 + i * 0.05, where + 0.5))); p.rotation.y = Math.PI; run(p, T * 12 + i, 1); });
      zs.forEach((p, i) => { p.visible = lt > where - 0.2; p.position.set(-1.5 + (i % 3) * 1.4, 0, -18.6 + Math.floor(i / 3) * 1.0 + prog(lt, where, D) * 2); p.rotation.y = 0; shamble(p, T, i); });
      if (lt < where - 0.2) cam([300, 2.2, 12], [300, 1.6, -6]); else camL([300, 2.4, -8], [300, 2.0, -11], prog(lt, where - 0.2, D), [300, 1.4, -18], [300, 1.5, -18]);
    };
  },
  // 1 Rule 1: lock the door, push the desk
  () => {
    const s = mkScene(['#cfd2cc', '#cfd2cc'], ['#cfd2cc', 30, 80], { hemi: 1.0, dir: 0.6 });
    const R = officeRoom(s); const you = person(YOU); s.add(you);
    const lockT = wt(1, 'lock'), pushT = wt(1, 'push');
    return (lt, T, D) => {
      if (lt < pushT - 0.2) { you.position.set(-3.1, 0, -5.2); you.rotation.y = Math.PI; idle(you, T); you.userData.armR.rotation.x = -1.3; R.lock.rotation.z = lerp(0, Math.PI / 2, prog(lt, lockT, lockT + 0.4)); camL([-1.0, 1.8, -3.4], [-1.6, 1.6, -4.3], prog(lt, 0, pushT), [-3.4, 1.25, -5.8], [-3.4, 1.3, -5.9]); }
      else { const k = ease(prog(lt, pushT, D - 0.3)); R.blockDesk.position.set(lerp(-1.3, -3.5, k), 0, lerp(-4.2, -5.4, k)); you.position.set(R.blockDesk.position.x + 1.4, 0, R.blockDesk.position.z + 0.2); you.rotation.y = -Math.PI / 2; run(you, T * 6, 0.5); you.userData.armL.rotation.x = you.userData.armR.rotation.x = -1.4; you.userData.body.rotation.x = 0.35; cam([0.5, 2.8, -1], [-2.5, 0.9, -5]); }
    };
  },
  // 2 Rule 2: silence — phone, shoes, finger to lips
  () => {
    const s = mkScene(['#cfd2cc', '#cfd2cc'], ['#cfd2cc', 30, 80], { hemi: 1.0, dir: 0.6 });
    const R = officeRoom(s); R.blockDesk.position.set(-3.5, 0, -5.4);
    const you = person(YOU); s.add(you); you.position.set(1.5, 0, 1.4);
    const phone = new T3.Group(); phone.add(box(0.2, 0.02, 0.38, '#111', 0, 0, 0)); const scr = box(0.17, 0.01, 0.33, new T3.MeshBasicMaterial({ color: '#4ad0ff' }), 0, 0.015, 0); phone.add(scr); phone.position.set(1.5, 0.8, 0.5); s.add(phone);
    const shoes = [0, 1].map(i => { const sh = box(0.2, 0.12, 0.34, '#1a1410'); s.add(sh); return sh; });
    const shoesT = wt(2, 'shoes'), wordT = wt(2, 'single');
    return (lt, T, D) => {
      scr.material.color.set(lt > 1.2 ? '#202830' : '#4ad0ff'); idle(you, T); you.rotation.y = Math.PI;
      if (lt < shoesT - 0.3) { you.userData.armR.rotation.x = -1.0; camL([2.2, 1.4, 1.6], [1.8, 1.25, 1.2], prog(lt, 0, shoesT), [1.5, 0.8, 0.5], [1.5, 0.8, 0.5]); }
      else if (lt < wordT - 0.4) { const k = prog(lt, shoesT - 0.3, wordT - 0.4); shoes.forEach((sh, i) => { sh.position.set(1.4 + i * 0.3 + k * (i ? 0.8 : -0.6), 0.06 + S(Math.min(1, k * 2) * Math.PI) * 0.25, 1.6 + k * 0.5); sh.rotation.y = k * (i ? 2 : -2); }); camL([1.5, 1.0, 3.6], [1.5, 0.8, 3.2], k, [1.5, 0.3, 1.4], [1.5, 0.2, 1.6]); }
      else { you.rotation.y = 0; you.userData.armR.rotation.x = -2.6; you.userData.armR.rotation.z = 0.25; camL([1.5, 1.9, 3.4], [1.5, 1.95, 3.0], prog(lt, wordT - 0.4, D), [1.5, 1.85, 1.4], [1.5, 1.9, 1.4]); }
      shoes.forEach(sh => sh.visible = lt > shoesT - 0.3);
    };
  },
  // 3 Water: fill every jug
  () => {
    const s = mkScene(['#cfd2cc', '#cfd2cc'], ['#cfd2cc', 30, 80], { hemi: 1.0, dir: 0.6 });
    const R = officeRoom(s); const you = person(Object.assign({}, YOU)); s.add(you); you.position.set(-5.6, 0, 0.4); you.rotation.y = -Math.PI / 2;
    const jugM = new T3.MeshLambertMaterial({ color: '#cfe8f4', transparent: true, opacity: 0.55 });
    const jugs = Array.from({ length: 14 }, (_, i) => { const g = new T3.Group(); g.add(new T3.Mesh(new T3.CylinderGeometry(0.11, 0.12, 0.32, 6), jugM)); const wtr = new T3.Mesh(new T3.CylinderGeometry(0.1, 0.11, 0.3, 6), new T3.MeshLambertMaterial({ color: '#3a8ad0', transparent: true, opacity: 0.8 })); g.add(wtr); g.add(cyl(0.04, 0.04, 0.06, 6, '#2a5ab0', 0, 0.19, 0)); g.userData.wtr = wtr; s.add(g); return g; });
    const taps = wt(3, 'taps'), fill = wt(3, 'fill'), four = wt(3, 'fourteen');
    return (lt, T, D) => {
      idle(you, T);
      const n = Math.floor(clamp((lt - fill) / (four - fill + 0.3)) * 14);
      jugs.forEach((j, i) => { j.visible = lt > fill - 0.3; const row = i % 2, col = Math.floor(i / 2); j.position.set(-6.3 + row * 0.3, 0.97 + 0.16, 2.3 - col * 0.32); const lv = i < n ? 1 : (i === n ? ((lt * 2) % 1) : 0.02); j.userData.wtr.scale.y = Math.max(0.02, lv); j.userData.wtr.position.y = -0.15 + 0.15 * lv; });
      if (lt < taps - 0.2) camL([-3, 2.4, 3.5], [-4, 2.2, 2.6], prog(lt, 0, taps), [-6.5, 1.2, 0.5], [-6.5, 1.2, 0.5]);
      else if (lt < fill - 0.3) { you.userData.armR.rotation.x = -1.2; cam([-5.2, 1.5, -0.2], [-6.5, 1.15, -0.6]); }
      else { you.userData.armR.rotation.x = -1.0 + S(T * 3) * 0.1; camL([-4.6, 1.8, 3.2], [-5.0, 1.6, 2.6], prog(lt, fill, D), [-6.3, 1.1, 1.3], [-6.3, 1.1, 1.3]); }
    };
  },
  // 4 Food: raid desk drawers, write it down
  () => {
    const s = mkScene(['#cfd2cc', '#cfd2cc'], ['#cfd2cc', 30, 80], { hemi: 1.0, dir: 0.6 });
    const R = officeRoom(s); const you = person(YOU); s.add(you); you.position.set(1.5, 0, 1.4); you.rotation.y = Math.PI;
    const bars = Array.from({ length: 9 }, () => { const b = box(0.22, 0.04, 0.08, '#d8402a'); s.add(b); return b; });
    const pots = Array.from({ length: 4 }, () => { const p = cyl(0.08, 0.06, 0.12, 6, '#f0e8d0'); s.add(p); return p; });
    const jar = cyl(0.08, 0.08, 0.16, 6, '#5a3a22'); s.add(jar);
    const pad = box(0.3, 0.01, 0.4, new T3.MeshBasicMaterial({ map: TX.paper() })); pad.position.set(1.9, 0.8, 0.6); s.add(pad);
    const drawer = box(0.5, 0.18, 0.5, '#c8c0b0'); s.add(drawer);
    const nine = wt(4, 'nine'), four = wt(4, 'four'), jarT = wt(4, 'jar'), write = wt(4, 'write');
    return (lt, T, D) => {
      idle(you, T); drawer.position.set(1.1, 0.55, lerp(0.5, 0.95, ease(prog(lt, 0.6, 1.4))));
      bars.forEach((b, i) => { b.visible = lt > nine + i * 0.08; b.position.set(0.9 + (i % 3) * 0.25, 0.81 + Math.floor(i / 3) * 0.045, 0.3); });
      pots.forEach((p, i) => { p.visible = lt > four + i * 0.12; p.position.set(1.0 + i * 0.2, 0.85, 0.65); });
      jar.visible = lt > jarT; jar.position.set(1.85, 0.87, 0.25);
      if (lt > write - 0.2) { you.userData.armR.rotation.x = -1.0 + S(T * 14) * 0.08; }
      camL([3.0, 1.9, 2.0], [2.4, 1.6, 1.6], prog(lt, 0, D), [1.3, 0.8, 0.4], [1.4, 0.8, 0.45]);
    };
  },
  // 5 Night: power out, city dark, scratching
  () => {
    const s = mkScene(['#0a0c14', '#0a0c14'], ['#0a0c14', 20, 60], { hemi: 1.0, dir: 0.6 });
    const R = officeRoom(s); R.blockDesk.position.set(-3.5, 0, -5.4);
    const you = person(YOU); s.add(you); you.position.set(2.2, 0, 2.6); you.rotation.y = -2.3;
    const jugM = new T3.MeshLambertMaterial({ color: '#3a8ad0' }); for (let i = 0; i < 14; i++) s.add(cyl(0.11, 0.12, 0.32, 6, jugM, -6.3 + (i % 2) * 0.3, 1.13, 2.3 - Math.floor(i / 2) * 0.32));
    const outT = wt(5, 'out'), dark = wt(5, 'dark'), scr = wt(5, 'scratching');
    return (lt, T, D) => {
      const on = lt < outT; const flick = lt > outT - 0.3 && lt < outT + 0.2 && S(lt * 70) > 0;
      R.lights.forEach(l => l.material.color.set(on || flick ? '#fbfbf0' : '#202228')); R.desks.forEach(d => d.userData.scr.material.color.set(on ? '#5a8ac0' : '#0a0c10'));
      s.userData.hemi.intensity = on ? 1.0 : 0.22; s.userData.dir.intensity = on ? 0.6 : 0.05; s.userData.hemi.color.set(on ? '#ffffff' : '#7a90c0');
      R.win.visible = lt < dark; R.winN.visible = lt >= dark; s.fog.color.set(on ? '#cfd2cc' : '#05060a');
      idle(you, T);
      if (lt < scr - 0.3) camL([5.8, 2.0, 3.8], [5.0, 2.2, 3.0], prog(lt, 0, scr), [6.9, 2.0, 0], [6.9, 2.0, -1]);
      else { const sh = S(T * 40) * 0.015 * (S(T * 3) > 0 ? 1 : 0); R.door.position.x = -3.5 + sh; you.userData.head.rotation.y = 0.5; camL([-1.2, 1.6, -2.4], [-2.2, 1.5, -3.4], prog(lt, scr - 0.3, D), [-3.5, 1.2, -5.9], [-3.5, 1.2, -5.9]); }
    };
  },
  // 6 Decision: A silent in the dark / B at the door
  () => {
    const s = mkScene(['#0a0c14', '#0a0c14'], ['#05060a', 20, 60], { hemi: 0.22, dir: 0.05, sky: '#7a90c0' });
    const R = officeRoom(s); R.blockDesk.position.set(-3.5, 0, -5.4); R.lights.forEach(l => l.material.color.set('#202228')); R.desks.forEach(d => d.userData.scr.material.color.set('#0a0c10')); R.win.visible = false; R.winN.visible = true;
    const you = person(YOU); s.add(you);
    const optB = wt(6, 'option', 1), comment = wt(6, 'comment');
    return (lt, T, D) => {
      if (lt < optB - 0.2) { you.position.set(5.4, 0, 4.6); you.rotation.y = -2.4; idle(you, T); you.userData.body.position.y = -0.55; you.userData.legL.rotation.x = -1.4; you.userData.legR.rotation.x = -1.4; you.userData.armL.rotation.x = you.userData.armR.rotation.x = -0.9; camL([3.6, 1.2, 2.8], [3.9, 1.0, 3.1], prog(lt, 0, optB), [5.4, 0.9, 4.6], [5.4, 0.9, 4.6]); }
      else if (lt < comment - 0.1) { const k = prog(lt, optB - 0.2, comment); you.userData.body.position.y = 0; you.userData.legL.rotation.x = you.userData.legR.rotation.x = 0; you.position.set(lerp(-2.0, -3.1, ease(k)), 0, lerp(-3.4, -4.5, ease(k))); you.rotation.y = Math.PI - 0.4; idle(you, T); you.userData.armR.rotation.x = lerp(0, -1.3, ease(k)); R.door.position.x = -3.5 + S(T * 40) * 0.012; cam([-1.2, 1.7, -2.2], [-3.4, 1.3, -5.6]); }
      else { R.door.position.x = -3.5 + S(T * 40) * 0.02; cam([-3.5, 1.4, lerp(-2.6, -4.0, ease(prog(lt, comment, D)))], [-3.5, 1.3, -5.9]); you.visible = false; }
    };
  },
];

// ---------- HUD ----------
function bigText(ctx, txt, y, size, col = '#ffd23a', a = 1, font = 'Russo') { ctx.save(); ctx.globalAlpha = a; ctx.font = `${size}px ${font}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round'; ctx.lineWidth = size * 0.22; ctx.strokeStyle = '#05081a'; ctx.strokeText(txt, 360, y); ctx.fillStyle = col; ctx.fillText(txt, 360, y); ctx.restore(); }
// tracker state over time
const EVT = {
  locked: AT(1, 'lock') + 0.3, blocked: AT(1, 'push') + 1.0, silent: AT(2, 'silent'), shoes: AT(2, 'shoes'), waterStart: AT(3, 'fill'), waterEnd: AT(3, 'fourteen') + 0.3,
  bars: AT(4, 'nine'), pots: AT(4, 'four'), jar: AT(4, 'jar'), power: AT(5, 'out'), scratch: AT(5, 'scratching')
};
function tracker(ctx, T) {
  if (T < CL[1].start + 0.2) return;
  const a = prog(T, CL[1].start + 0.2, CL[1].start + 0.6);
  const water = Math.round(clamp((T - EVT.waterStart) / (EVT.waterEnd - EVT.waterStart)) * 14);
  const food = (T > EVT.bars ? 9 : 0) + (T > EVT.pots ? 4 : 0) + (T > EVT.jar ? 1 : 0);
  const rows = [
    ['DAY', '1', '#ffffff', 0], ['FLOOR', '28', '#ffffff', 0],
    ['DOOR', T > EVT.scratch ? '!!' : T > EVT.blocked ? 'BLOCKED' : T > EVT.locked ? 'LOCKED' : 'OPEN', T > EVT.scratch ? '#ff5a3a' : T > EVT.locked ? '#7dffb0' : '#ffd23a', [EVT.locked, EVT.blocked, EVT.scratch]],
    ['NOISE', T > EVT.silent ? 'SILENT' : 'LOUD', T > EVT.silent ? '#7dffb0' : '#ff5a3a', [EVT.silent]],
    ['WATER', `${water}L`, water >= 14 ? '#7dffb0' : '#7ad0ff', [EVT.waterEnd]],
    ['FOOD', `${food}`, food ? '#7dffb0' : '#ff8a6a', [EVT.bars, EVT.pots, EVT.jar]],
    ['POWER', T > EVT.power ? 'OFF' : 'ON', T > EVT.power ? '#ff5a3a' : '#7dffb0', [EVT.power]],
  ];
  ctx.save(); ctx.globalAlpha = a; ctx.translate(14, 64); ctx.scale(1.25, 1.25);
  ctx.fillStyle = 'rgba(6,14,40,0.82)'; ctx.fillRect(0, 0, 250, 30 + rows.length * 36); ctx.strokeStyle = '#7ad0ff'; ctx.lineWidth = 3; ctx.strokeRect(0, 0, 250, 30 + rows.length * 36);
  ctx.fillStyle = '#ffd23a'; ctx.fillRect(0, 0, 250, 26); ctx.font = '14px PressStart'; ctx.fillStyle = '#06102a'; ctx.textBaseline = 'middle'; ctx.fillText('SURVIVAL LOG', 12, 14);
  rows.forEach(([k, v, col, ts], i) => { const y = 46 + i * 36; let flash = 0; if (ts) for (const t0 of ts) if (T > t0 && T < t0 + 0.6) flash = 1 - (T - t0) / 0.6;
    if (flash) { ctx.fillStyle = `rgba(255,255,255,${0.35 * flash})`; ctx.fillRect(4, y - 16, 242, 32); }
    ctx.font = '13px PressStart'; ctx.fillStyle = '#9ab0d0'; ctx.textAlign = 'left'; ctx.fillText(k, 12, y); ctx.font = '22px Russo'; ctx.fillStyle = col; ctx.textAlign = 'right'; ctx.fillText(v, 238, y + 1); ctx.textAlign = 'left'; });
  ctx.restore();
}
function banner(ctx, kind, item, k, out) {
  const good = kind === 'rule'; const x = lerp(760, 330, ease(k)) + ease(out) * 500; const y = 64;
  ctx.save(); ctx.translate(x, y); ctx.beginPath(); ctx.moveTo(30, 0); ctx.lineTo(390, 0); ctx.lineTo(390, 96); ctx.lineTo(0, 96); ctx.closePath();
  ctx.fillStyle = good ? 'rgba(150,20,20,0.95)' : 'rgba(20,90,50,0.95)'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = good ? '#ffb0a0' : '#7dffb0'; ctx.stroke();
  ctx.font = '16px PressStart'; ctx.fillStyle = good ? '#ffe24a' : '#7dffb0'; ctx.textBaseline = 'middle'; ctx.fillText(good ? 'RULE' : 'LOGGED', 36, 26);
  ctx.font = (item.length > 14 ? 26 : 32) + 'px Russo'; ctx.fillStyle = '#fff'; ctx.fillText(item, 36, 66); ctx.restore();
}
const BAN = [[1, 'stay', 'rule', '1: STAY IN THE ROOM'], [2, 'make', 'rule', '2: MAKE NO SOUND'], [3, 'fourteen', 'log', '14L WATER = 7 DAYS'], [4, 'write', 'log', 'EVERYTHING TRACKED']].map(([ci, w, k, l]) => ({ t: AT(ci, w) - 0.15, kind: k, label: l, end: AT(ci, w) + 3.2 }));
// captions
const CAPS = [];
function merged(ws) { const o = []; for (let i = 0; i < ws.length; i++) { const w = ws[i], n = ws[i + 1]; if (/^twenty$/i.test(w.w) && n && /^eighth$/i.test(n.w)) { o.push({ w: '28th', a: w.a, b: n.b }); i++; } else if (/^fourteen$/i.test(w.w)) o.push({ w: '14', a: w.a, b: w.b }); else if (/^nine$/i.test(w.w)) o.push({ w: '9', a: w.a, b: w.b }); else if (/^four$/i.test(w.w)) o.push({ w: '4', a: w.a, b: w.b }); else if (/^(one|two)$/i.test(w.w) && ws[i - 1] && /^rule$/i.test(ws[i - 1].w)) o.push({ w: (w.w.toLowerCase() === 'one' ? '1:' : '2:'), a: w.a, b: w.b }); else o.push(w); } return o; }
for (const c0 of CL) { const ws = merged(c0.words); let cur = []; const flush = () => { if (cur.length) CAPS.push({ a: cur[0].a, b: cur[cur.length - 1].b, txt: cur.map(w => w.w).join(' ') }); cur = []; };
  ws.forEach(w => { if (cur.length && (cur.length >= 4 || w.a - cur[cur.length - 1].b > 0.28 || /^(So|But|Everyone|That's|Lock|Phone|Next|On|Then|Search|Write|Everything|And|Option|Comment|The)$/.test(w.w) && cur.length > 1)) flush(); cur.push(w); }); flush(); }
CAPS.forEach((c, i) => { const nx = CAPS[i + 1]; c.b = nx ? Math.min(nx.a, c.b + 0.5) : c.b + 0.8; });
function captionBox(ctx, txt) { ctx.save(); ctx.font = '50px Russo'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const words = txt.split(' '); const lines = []; let cur = ''; for (const w of words) { const t = cur ? cur + ' ' + w : w; if (ctx.measureText(t).width > 600 && cur) { lines.push(cur); cur = w; } else cur = t; } lines.push(cur);
  const y0 = 1060 - (lines.length - 1) * 31; lines.forEach((l, i) => { ctx.lineJoin = 'round'; ctx.lineWidth = 11; ctx.strokeStyle = '#05081a'; ctx.strokeText(l, 360, y0 + i * 62); ctx.fillStyle = '#ffffff'; ctx.fillText(l, 360, y0 + i * 62); }); ctx.restore(); }

let glc, out, octx, low, lctx;
window.initFootball = async function () {
  await Promise.all(['30px Russo', '20px PressStart'].map(f => document.fonts.load(f)));
  makeTextures();
  glc = document.createElement('canvas'); glc.width = RW; glc.height = RH;
  renderer = new T3.WebGLRenderer({ canvas: glc, antialias: false, preserveDrawingBuffer: true }); renderer.setPixelRatio(1); renderer.setSize(RW, RH, false); renderer.outputColorSpace = T3.SRGBColorSpace;
  camera = new T3.PerspectiveCamera(60, RW / RH, 0.05, 600);
  BUILD.forEach(b => { const upd = b(); SCENES.push({ scene: lastScene, update: upd }); });
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
  const vg = octx.createRadialGradient(360, 640, 420, 360, 640, 900); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.45)'); octx.fillStyle = vg; octx.fillRect(0, 0, W, H);
  if (T < AT(0, 'everyone') - 0.2) { const a = prog(T, 0.3, 0.8); bigText(octx, '28TH FLOOR', 300, 92, '#ffd23a', a); bigText(octx, "DON'T RUN.", 400, 70, '#ffffff', prog(T, AT(0, 'run') - 0.2, AT(0, 'run') + 0.1)); }
  if (ci === 0 && lt > wt(0, "that's") - 0.1) bigText(octx, 'THEY GO WHERE', 300, 62, '#ffffff', prog(lt, wt(0, "that's") - 0.1, wt(0, "that's") + 0.2)), bigText(octx, 'THE CROWD GOES', 380, 62, '#ff5a3a', prog(lt, wt(0, "that's"), wt(0, "that's") + 0.3));
  tracker(octx, T);
  const b = BAN.find(e => T >= e.t && T < e.end); if (b) banner(octx, b.kind, b.label, prog(T, b.t, b.t + 0.3), prog(T, b.end - 0.25, b.end));
  if (ci === 5 && lt > wt(5, 'scratching')) { bigText(octx, 'scritch... scritch...', 560, 44, '#ff8a6a', 0.6 + 0.4 * S(T * 12), 'Russo'); }
  if (ci === 6) { const optB = wt(6, 'option', 1), comment = wt(6, 'comment');
    if (lt < comment - 0.1) { bigText(octx, lt < optB - 0.2 ? 'A: STAY SILENT & WAIT' : 'B: CHECK WHO IT IS', 600, 52, lt < optB - 0.2 ? '#7dffb0' : '#ffd23a', 1); }
    else { bigText(octx, 'COMMENT A OR B', 520, 70, '#ffd23a', prog(lt, comment - 0.1, comment + 0.2)); bigText(octx, 'DAY 2 DECIDES...', 610, 40, '#ffffff', prog(lt, comment + 0.6, comment + 0.9)); } }
  const cap = CAPS.find(c => T >= c.a && T < c.b); if (cap) captionBox(octx, cap.txt);
  if (T < 0.25) { octx.fillStyle = `rgba(0,0,0,${1 - T / 0.25})`; octx.fillRect(0, 0, W, H); }
  if (T > TM.total - 0.8) { octx.fillStyle = `rgba(0,0,0,${prog(T, TM.total - 0.8, TM.total)})`; octx.fillRect(0, 0, W, H); }
};
})();
