// The History of Football — 11 low-poly scenes + retro game HUD, timed to narration.
(() => {
const { T3, RW, RH, W, H, clamp, lerp, ease, prog, rng, makeTextures, TX, mat, box, cyl, sph, ground, person, run, idle, kick, cheer, ball, goal, tree, house, crowdStand, trophy, signBoard } = window.W3;
const TM = window.TIMING, CL = TM.clips;
const S = Math.sin, C = Math.cos;
function wt(ci, word, n = 0) { let k = 0; for (const w of CL[ci].words) if (w.w.toLowerCase().replace(/[^a-z0-9']/g, '') === word) { if (k === n) return w.a - CL[ci].start; k++; } return 0; }

let renderer, camera;
const SCENES = [];
let lastScene = null;
function mkScene(sky, fog, light = {}) {
  const s = new T3.Scene(); lastScene = s;
  const geo = new T3.SphereGeometry(400, 12, 8); const cols = []; const pos = geo.attributes.position;
  const top = new T3.Color(sky[0]), bot = new T3.Color(sky[1]);
  for (let i = 0; i < pos.count; i++) { const y = clamp(pos.getY(i) / 400 * 1.6 + 0.2); const c = bot.clone().lerp(top, y); cols.push(c.r, c.g, c.b); }
  geo.setAttribute('color', new T3.Float32BufferAttribute(cols, 3));
  s.add(new T3.Mesh(geo, new T3.MeshBasicMaterial({ vertexColors: true, side: T3.BackSide, fog: false })));
  s.fog = new T3.Fog(fog[0], fog[1], fog[2]);
  s.add(new T3.HemisphereLight(light.sky || '#ffffff', light.ground || '#556644', light.hemi ?? 0.9));
  const d = new T3.DirectionalLight(light.sun || '#fff4dd', light.dir ?? 1.1); d.position.set(5, 10, 6); s.add(d);
  return s;
}
function cam(p, l) { camera.position.set(p[0], p[1], p[2]); camera.lookAt(l[0], l[1], l[2]); }
function camL(a, b, k, la, lb) { k = ease(k); cam([lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)], [lerp(la[0], lb[0], k), lerp(la[1], lb[1], k), lerp(la[2], lb[2], k)]); }
function add(s, o, x = 0, y = 0, z = 0) { o.position.set(x, y, z); s.add(o); return o; }
function people(s, n, f, seed = 1) { const r = rng(seed); return Array.from({ length: n }, (_, i) => { const p = person(f(i, r)); s.add(p); p.userData.r = r(); return p; }); }
function floodlights(s, pos) { for (const [x, z] of pos) { s.add(box(0.3, 14, 0.3, '#888', x, 7, z)); const l = box(2.4, 1.2, 0.3, '#fff7d0', x, 14.5, z); l.material = new T3.MeshBasicMaterial({ color: '#fffbe0' }); l.lookAt(0, 0, 0); s.add(l); } }

// ---------- scene builders: return update(lt, T, D) ----------
const BUILD = [
  // 0 Intro — night stadium
  () => {
    const s = mkScene(['#05070f', '#1a2238'], ['#0a1020', 30, 90], { hemi: 0.8, dir: 0.9, sun: '#dfe8ff' });
    const p = ground(1, TX.pitch()); p.scale.set(20, 34, 1); s.add(p);
    { const _o = ground(160, TX.grass([40, 40]), '#557755'); s.add(_o); _o.position.y = -0.02; };
    for (const [x, z, r, l] of [[0, -19, 0, 26], [0, 19, Math.PI, 26], [-12, 0, Math.PI / 2, 38], [12, 0, -Math.PI / 2, 38]]) s.add(crowdStand(l, 8, x, z, r));
    floodlights(s, [[-14, -21], [14, -21], [-14, 21], [14, 21]]);
    { const _o = goal(); s.add(_o); _o.position.set(0, 0, -16.6); }; const g2 = goal(); g2.rotation.y = Math.PI; g2.position.set(0, 0, 16.6); s.add(g2);
    const b = add(s, ball(), 0, 0.2, 0);
    return (lt, T, D) => { b.position.y = 0.2 + Math.abs(S(lt * 3.2)) * 1.2; b.rotation.x = lt * 4; b.rotation.y = lt * 2.5;
      const a = lt * 0.35; cam([C(a) * 9, lerp(2.5, 5, prog(lt, 0, D)), S(a) * 9 + 2], [0, 1, 0]); };
  },
  // 1 Ancient China — cuju
  () => {
    const s = mkScene(['#7ab0d8', '#f0dcb0'], ['#e8d8b0', 25, 80], { sun: '#ffe8c0' });
    s.add(ground(80, TX.stone([20, 20])));
    const hall = new T3.Group(); hall.add(box(14, 4, 4, '#a8322a', 0, 2, 0)); for (let i = -3; i <= 3; i++) hall.add(cyl(0.22, 0.22, 4, 6, '#7a1a14', i * 2.1, 2, 2.2));
    const roof = new T3.Mesh(new T3.CylinderGeometry(4.5, 9.5, 2.4, 4, 1), new T3.MeshLambertMaterial({ map: TX.roofTile(), flatShading: true })); roof.rotation.y = Math.PI / 4; roof.scale.set(1.15, 1, 0.5); roof.position.y = 5.2; hall.add(roof);
    hall.position.set(0, 0, -12); s.add(hall);
    for (const x of [-9, 9]) { s.add(tree(x, -8, 1.3, '#4a7a3a')); }
    // net with hole between two poles
    const poles = new T3.Group(); poles.add(cyl(0.12, 0.12, 6, 6, '#8a2a20', -2.4, 3, 0)); poles.add(cyl(0.12, 0.12, 6, 6, '#8a2a20', 2.4, 3, 0));
    const netTex = (() => { const c = document.createElement('canvas'); c.width = 64; c.height = 48; const g = c.getContext('2d'); g.strokeStyle = '#f0e8d0'; for (let i = 0; i <= 64; i += 4) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 48); g.stroke(); } for (let j = 0; j <= 48; j += 4) { g.beginPath(); g.moveTo(0, j); g.lineTo(64, j); g.stroke(); } g.globalCompositeOperation = 'destination-out'; g.beginPath(); g.arc(32, 18, 8, 0, 7); g.fill(); g.globalCompositeOperation = 'source-over'; g.strokeStyle = '#c0302a'; g.lineWidth = 2; g.beginPath(); g.arc(32, 18, 8, 0, 7); g.stroke(); const t = new T3.CanvasTexture(c); t.magFilter = T3.NearestFilter; t.minFilter = T3.NearestFilter; return t; })();
    const net = new T3.Mesh(new T3.PlaneGeometry(4.8, 3.6), new T3.MeshBasicMaterial({ map: netTex, transparent: true, side: T3.DoubleSide })); net.position.set(0, 4, 0); poles.add(net); s.add(poles);
    for (const [x, z] of [[-6, -9.8], [6, -9.8], [-3, -9.8], [3, -9.8]]) { const l = sph(0.35, new T3.MeshBasicMaterial({ color: '#e04030' }), x, 3.4, z, 6, 4); s.add(l); }
    const team = people(s, 6, (i) => ({ shirt: i < 3 ? '#b8302a' : '#2a4a9a', robe: i < 3 ? '#8a201a' : '#1a3070', hat: 'helmet', hatCol: '#7a6a3a', trousers: '#2a2a2a', skin: '#e8c09a', hair: '#151515' }), 3);
    const spots = [[-2.5, 3.5], [0, 5.5], [2.5, 3.5], [-2, -3.5], [0.5, -4.5], [2.8, -3]];
    team.forEach((p, i) => { p.position.set(spots[i][0], 0, spots[i][1]); p.rotation.y = i < 3 ? Math.PI : 0; });
    const b = add(s, ball('#8a5a30', 0.17), 0, 1, 3);
    return (lt, T, D) => {
      const k = (lt * 0.55) % 1; const kicker = team[Math.floor(lt * 0.55) % 3];
      // ball arcs from kicker up through the hole to the far side
      const sx = kicker.position.x, sz = kicker.position.z; b.position.set(lerp(sx, 0, k), 0.4 + S(k * Math.PI) * 4.4, lerp(sz, -3.6, k)); b.rotation.x = lt * 6;
      team.forEach((p, i) => { if (p === kicker) kick(p, prog(k, 0, 0.15) * (1 - prog(k, 0.25, 0.5))); else { idle(p, T + i, 1); p.userData.armL.rotation.z = -0.5; p.userData.armR.rotation.z = 0.5; p.userData.legL.rotation.x = S(T * 4 + i) * 0.25; } p.lookAt(b.position.x, 0, b.position.z); });
      camL([9, 4, 13], [3.5, 3.4, 8.5], prog(lt, 0, D), [0, 2.5, 0], [0, 3.6, 0]);
    };
  },
  // 2 Medieval England — mob football, then the king bans it
  () => {
    const s = mkScene(['#7f8a96', '#c8c4b4'], ['#a8a89c', 18, 70], { sun: '#f0ead8', dir: 0.8 });
    s.add(ground(90, TX.mud([20, 20])));
    for (const [x, z, r] of [[-10, -12, 0.3], [-4, -15, 0], [3, -14, -0.2], [10, -11, -0.4], [-13, -4, 1.2], [13, -3, -1.3]]) s.add(house(x, z, r));
    const ch = new T3.Group(); ch.add(box(3, 8, 3, new T3.MeshLambertMaterial({ map: TX.stone([2, 4]) }), 0, 4, 0)); const sp = new T3.Mesh(new T3.ConeGeometry(2.2, 4, 4), mat('#5a5a62')); sp.position.y = 10; sp.rotation.y = Math.PI / 4; ch.add(sp); ch.position.set(1, 0, -24); s.add(ch);
    const mob = people(s, 22, (i, r) => ({ shirt: ['#6a5034', '#5a6a3a', '#8a6a4a', '#4a4a5a', '#7a3a2a'][i % 5], trousers: ['#4a3a2a', '#3a3a30', '#5a4a3a'][i % 3], skin: '#e0b090', hair: ['#3a2a1a', '#8a5a2a', '#1a1a1a', '#b08a4a'][i % 4], hat: i % 4 === 0 ? 'hood' : 'none', hatCol: '#5a4030', beard: i % 3 === 0 ? '#4a3020' : null }), 7);
    const b = add(s, ball('#7a5030', 0.2), 0, 0.2, 0);
    // king on a platform
    const stage = new T3.Group(); stage.add(box(4, 1.2, 3, new T3.MeshLambertMaterial({ map: TX.wood([2, 1]) }), 0, 0.6, 0));
    const king = person({ shirt: '#a01a2a', robe: '#8a1020', hat: 'crown', skin: '#e8b896', hair: '#8a6a3a', beard: '#8a6a3a', trousers: '#3a1a1a' }); king.position.y = 1.2; stage.add(king);
    const scroll = new T3.Mesh(new T3.PlaneGeometry(0.7, 0.9), new T3.MeshLambertMaterial({ map: TX.paper(), side: T3.DoubleSide })); scroll.position.set(0.55, 2.0, 0.45); stage.add(scroll);
    stage.position.set(0, 0, -6); s.add(stage);
    const kingAt = wt(2, 'kings');
    return (lt, T, D) => {
      const bx = S(lt * 0.7) * 6, bz = S(lt * 1.1 + 1) * 3 + 2; b.position.set(bx, 0.2 + Math.abs(S(lt * 5)) * 0.6, bz); b.rotation.x = lt * 8;
      mob.forEach((p, i) => { const r = p.userData.r; const a = i / 22 * Math.PI * 2 + lt * 0.4; const rad = 1.2 + r * 3.2; const tx = bx + C(a) * rad - S(lt * 0.7 + 0.5) * 1.5, tz = bz + S(a) * rad * 0.7;
        p.position.set(tx, 0, tz); p.lookAt(bx, 0, bz); run(p, T * 11 + i, 1);
        if (i === 3 && lt > wt(2, 'broken') - 0.2) { p.userData.body.rotation.x = -1.4; p.userData.body.position.y = 0.3; } });
      if (lt < kingAt - 0.3) { camL([0, 7, 14], [-3, 3.5, 9], prog(lt, 0, kingAt), [bx * 0.5, 0.5, bz], [bx, 0.8, bz]); stage.visible = false; }
      else { stage.visible = true; idle(king, T); king.userData.armR.rotation.x = -1.3; king.userData.armL.rotation.z = -1.2 - S(T * 5) * 0.2; camL([3, 3.2, 1.5], [1.6, 2.8, -1.8], prog(lt, kingAt, D), [0, 2.6, -6], [0, 2.8, -6]); }
    };
  },
  // 3 Early 1800s schools
  () => {
    const s = mkScene(['#8ab4d8', '#e4ecf0'], ['#cfdce4', 25, 80]);
    s.add(ground(90, TX.grass([24, 24])));
    const sc = new T3.Group(); sc.add(box(16, 6, 4, new T3.MeshLambertMaterial({ map: TX.brick([6, 3]) }), 0, 3, 0)); sc.add(box(3, 10, 3, new T3.MeshLambertMaterial({ map: TX.brick([1, 4]) }), 0, 5, 0.6));
    const clock = new T3.Mesh(new T3.CircleGeometry(0.8, 10), mat('#f0ead8')); clock.position.set(0, 8.4, 2.12); sc.add(clock);
    for (let i = -3; i <= 3; i++) if (i) sc.add(box(1, 1.8, 0.1, '#2a3040', i * 2, 3.4, 2.02));
    const roof = new T3.Mesh(new T3.ConeGeometry(2.4, 2.4, 4), mat('#3a3a44')); roof.rotation.y = Math.PI / 4; roof.position.set(0, 11.2, 0.6); sc.add(roof);
    sc.position.set(0, 0, -18); s.add(sc);
    for (const x of [-12, -8, 9, 13]) s.add(tree(x, -12, 1.4));
    const boys = people(s, 6, (i) => ({ shirt: '#f2f0e8', trousers: i < 3 ? '#2a2a3a' : '#4a3a2a', hat: 'cap', hatCol: i < 3 ? '#2a3a7a' : '#7a1a2a', skin: '#ecc4a0', hair: '#5a3a1a', longSleeve: true }), 5);
    const pos = [[-3, 2], [-1, 4], [-4, 5], [3, 0], [5, 3], [2, 5]]; boys.forEach((p, i) => p.position.set(pos[i][0], 0, pos[i][1]));
    const b = add(s, ball('#7a5030', 0.18), 0, 0.2, 2);
    const carry = wt(3, 'carried'), nob = wt(3, 'nobody');
    return (lt, T, D) => {
      const kicker = boys[0], carrier = boys[3];
      boys.forEach((p, i) => { idle(p, T + i); p.lookAt(b.position.x, 0, b.position.z); });
      if (lt < carry - 0.4) { const k = prog(lt, 0.4, carry - 0.4); kick(kicker, prog(k, 0, 0.12)); b.position.set(lerp(-2.6, 2.6, k), 0.2 + S(k * Math.PI) * 2, lerp(2.3, 0.6, k)); }
      else if (lt < nob - 0.2) { const k = prog(lt, carry - 0.4, nob - 0.2); carrier.position.set(lerp(3, 7, k), 0, lerp(0, 4, k)); carrier.rotation.y = 0.8; run(carrier, T * 10, 1); carrier.userData.armR.rotation.x = -1.1; b.position.set(carrier.position.x + 0.35, 1.2 + carrier.userData.body.position.y, carrier.position.z + 0.3); boys[1].lookAt(carrier.position.x, 0, carrier.position.z); cheer(boys[1], T); }
      else { boys[0].position.set(-0.8, 0, 2); boys[3].position.set(0.8, 0, 2); boys[0].lookAt(0.8, 0, 2); boys[3].lookAt(-0.8, 0, 2); for (const [p, ph] of [[boys[0], 0], [boys[3], 1.5]]) { p.userData.armR.rotation.x = -1.2 + S(T * 9 + ph) * 0.5; p.userData.armL.rotation.x = -0.8 - S(T * 9 + ph) * 0.4; } b.position.set(0, 0.18, 3.2); }
      if (lt < nob - 0.2) camL([0, 4, 12], [2, 3, 10], prog(lt, 0, nob), [1, 1, 2], [3, 1, 2]); else cam([0, 2.3, 5.4], [0, 1.7, 2]);
    };
  },
  // 4 Cambridge 1848 — the rulebook
  () => {
    const s = mkScene(['#9ab8d4', '#e8e4d8'], ['#d8d8d0', 25, 80]);
    s.add(ground(90, TX.grass([24, 24])));
    const col = new T3.Group(); col.add(box(20, 7, 4, new T3.MeshLambertMaterial({ map: TX.stone([6, 2]) }), 0, 3.5, 0));
    for (let i = -4; i <= 4; i++) { col.add(box(1, 2.4, 0.1, '#28303a', i * 2, 3.5, 2.02)); const a = new T3.Mesh(new T3.CircleGeometry(0.5, 6, 0, Math.PI), mat('#28303a')); a.position.set(i * 2, 4.7, 2.03); col.add(a); }
    for (const x of [-10, -3.5, 3.5, 10]) { const pn = new T3.Mesh(new T3.ConeGeometry(0.5, 2, 4), mat('#8a8478')); pn.position.set(x, 8, 1.6); col.add(pn); }
    col.position.set(0, 0, -16); s.add(col);
    const board = new T3.Group(); board.add(box(0.12, 2.4, 0.12, '#4a3020', -0.9, 1.2, 0)); board.add(box(0.12, 2.4, 0.12, '#4a3020', 0.9, 1.2, 0));
    const page = new T3.Mesh(new T3.PlaneGeometry(1.7, 2.1), new T3.MeshBasicMaterial({ map: TX.paper() })); page.position.set(0, 2.1, 0.07); board.add(page); board.add(box(2, 2.4, 0.1, '#5a3a22', 0, 2.1, 0)); board.position.set(0, 0, -2); s.add(board);
    const studs = people(s, 5, (i) => ({ shirt: '#f0eee6', robe: '#16161c', jacket: '#1a1a22', trousers: '#1a1a22', hat: 'cap', hatCol: '#111', skin: '#ecc4a0', hair: ['#3a2a1a', '#8a6a3a', '#1a1a1a'][i % 3] }), 9);
    studs.forEach((p, i) => { p.position.set(-2.4 + i * 1.2, 0, 0.6 + Math.abs(i - 2) * 0.4); p.lookAt(0, 0, -2); });
    const teams = people(s, 6, (i) => ({ shirt: i < 3 ? '#c8402a' : '#2a5ab0', shorts: '#f0f0f0', trousers: '#ecece4', skin: '#ecc4a0', hair: '#4a2a1a', longSleeve: true }), 13);
    const b = add(s, ball('#7a5030', 0.18), 0, 0.18, 8);
    const teamsAt = wt(4, 'teams');
    return (lt, T, D) => {
      studs.forEach((p, i) => { idle(p, T + i); if (i === 2) { p.userData.armR.rotation.x = -1.4 + S(T * 6) * 0.15; } });
      teams.forEach((p, i) => { const side = i < 3 ? -1 : 1; if (lt < teamsAt + 1.5) { p.position.set(side * (1.0 + (i % 3) * 1.4), 0, 8 + (i % 3) * 0.5); p.lookAt(0, 0, 8); idle(p, T + i); if (i % 3 === 0) { p.userData.armR.rotation.x = -1.2; } } else { const k = lt - teamsAt - 1.5; const a = i * 1.1 + k * 0.8; p.position.set(S(a) * 4 + side, 0, 8 + C(a * 1.3) * 2.5); p.lookAt(b.position.x, 0, b.position.z); run(p, T * 10 + i, 1); } });
      b.position.set(S(lt * 1.2) * 2.5, 0.18 + Math.abs(S(lt * 4)) * 0.4, 8 + C(lt) * 1.2);
      if (lt < teamsAt) camL([0, 3, 6], [0, 2.4, 2.2], prog(lt, 0, teamsAt), [0, 1.8, -2], [0, 2.1, -2]); else camL([7, 4, 15], [4, 3, 13], prog(lt, teamsAt, D), [0, 0.8, 8], [0, 0.8, 8]);
    };
  },
  // 5 Sheffield 1857
  () => {
    const s = mkScene(['#8a96a4', '#d8cfc0'], ['#b8b4ac', 22, 70], { sun: '#f4e6d0', dir: 0.9 });
    s.add(ground(90, TX.grass([24, 24]), '#9aaa88'));
    for (let i = -5; i <= 5; i++) s.add(box(3, 3 + (i % 3), 3, new T3.MeshLambertMaterial({ map: TX.brick([1, 1]) }), i * 3.2, 1.5 + (i % 3) / 2, -20));
    const chim = [[-9, -23], [-2, -24], [6, -23]].map(([x, z]) => { s.add(cyl(0.6, 0.8, 12, 6, '#6a3a2a', x, 6, z)); return [x, z]; });
    const puffs = []; for (let i = 0; i < 18; i++) { const p = sph(1, new T3.MeshLambertMaterial({ color: '#7a7a80', transparent: true, opacity: 0.6 }), 0, 0, 0, 6, 4); s.add(p); puffs.push(p); }
    const fence = new T3.Group(); for (let i = -12; i <= 12; i++) fence.add(box(0.12, 1, 0.12, '#5a3a22', i, 0.5, -10)); fence.add(box(25, 0.1, 0.08, '#5a3a22', 0, 0.8, -10)); s.add(fence);
    const banner = signBoard('SHEFFIELD F.C.\nEST. 1857', 4.4, 1.6, { bg: '#1a1a24', fg: '#f0d070', pw: 160, ph: 58, size: 10 }); banner.position.set(0, 3.2, -9.9); s.add(banner);
    s.add(box(0.15, 3.2, 0.15, '#5a3a22', -2.2, 1.6, -9.95)); s.add(box(0.15, 3.2, 0.15, '#5a3a22', 2.2, 1.6, -9.95));
    const pl = people(s, 8, (i) => ({ shirt: i < 4 ? '#c03a2a' : '#f0eee6', trousers: '#ecece4', socks: '#222', hat: 'cap', hatCol: i < 4 ? '#c03a2a' : '#222', skin: '#ecc4a0', hair: '#4a2a1a', longSleeve: true, moustache: i % 3 === 0 ? '#3a2a1a' : null }), 17);
    const b = add(s, ball('#7a5030', 0.18), 0, 0.18, 0);
    const oldest = wt(5, 'oldest');
    return (lt, T, D) => {
      puffs.forEach((p, i) => { const c = chim[i % 3]; const k = ((T * 0.15 + i / 18) % 1); p.position.set(c[0] + k * 6, 12 + k * 9, c[1]); p.scale.setScalar(0.6 + k * 2.2); p.material.opacity = 0.65 * (1 - k); });
      const bx = S(lt * 0.9) * 5, bz = C(lt * 0.6) * 3; b.position.set(bx, 0.18 + Math.abs(S(lt * 5)) * 0.3, bz); b.rotation.x = lt * 6;
      pl.forEach((p, i) => { const a = i * 0.8 + lt * 0.7; p.position.set(bx + S(a) * (1.5 + i * 0.4), 0, bz + C(a) * (1 + i * 0.3)); p.lookAt(bx, 0, bz); run(p, T * 10 + i, 1); });
      if (lt < oldest - 0.3) camL([0, 3, 13], [0, 4, 9], prog(lt, 0, oldest), [0, 1, 0], [0, 2.4, -9]); else cam([0, 3.4, -4], [0, 3.1, -10]);
    };
  },
  // 6 1863 — the FA in a London pub, then football and rugby split
  () => {
    const s = mkScene(['#20160e', '#3a2616'], ['#2a1a10', 14, 40], { sky: '#ffcc88', ground: '#3a2010', hemi: 0.9, sun: '#ffb860', dir: 0.7 }); const tav = s;
    const fl = ground(30, TX.wood([10, 10])); s.add(fl);
    for (const [x, z, r] of [[0, -6, 0], [-7, 0, Math.PI / 2], [7, 0, -Math.PI / 2]]) { const w = new T3.Mesh(new T3.PlaneGeometry(16, 6), new T3.MeshLambertMaterial({ map: TX.panel([6, 2]) })); w.position.set(x, 3, z); w.rotation.y = r; s.add(w); }
    s.add(box(6, 0.15, 1.8, new T3.MeshLambertMaterial({ map: TX.wood([3, 1]) }), 0, 1.2, -1)); for (const x of [-2.8, 2.8]) for (const z of [-1.7, -0.3]) s.add(box(0.12, 1.2, 0.12, '#3a2414', x, 0.6, z));
    const candles = []; for (const x of [-2, 0, 2]) { s.add(cyl(0.05, 0.05, 0.3, 5, '#f0e8d0', x, 1.42, -1.3)); const f = sph(0.06, new T3.MeshBasicMaterial({ color: '#ffd060' }), x, 1.63, -1.3, 5, 4); s.add(f); candles.push(f); const pl = new T3.PointLight('#ffb050', 1.5, 6); pl.position.set(x, 1.8, -1.3); s.add(pl); }
    const book = new T3.Group(); book.add(box(1.0, 0.06, 0.7, '#7a1a1a', 0, 0, 0)); const pg = new T3.Mesh(new T3.PlaneGeometry(0.9, 0.62), new T3.MeshBasicMaterial({ map: TX.paper() })); pg.rotation.x = -Math.PI / 2; pg.position.y = 0.035; book.add(pg); book.position.set(0, 1.31, -0.8); s.add(book);
    const men = people(s, 6, (i) => ({ shirt: '#f0ece0', jacket: ['#1a1a22', '#2a2018', '#1a2420'][i % 3], trousers: '#1a1a1e', hat: 'top', skin: '#ecc4a0', hair: '#3a2a1a', moustache: i % 2 ? '#3a2a1a' : null, beard: i === 4 ? '#5a4030' : null, collar: '#f8f8f0' }), 21);
    const seat = [[-2.4, -2.6], [0, -2.7], [2.4, -2.6], [-3.6, -1.0], [3.6, -1.0], [-1.2, -2.7]]; men.forEach((p, i) => { p.position.set(seat[i][0], 0, seat[i][1]); p.lookAt(0, 0, -1); });
    const glowT = new T3.Mesh(new T3.PlaneGeometry(2.6, 0.9), new T3.MeshBasicMaterial({ map: TX.sign('LAWS OF\nTHE GAME', '#5a1010', '#ffe0a0', 128, 48, 10), transparent: true })); glowT.position.set(0, 2.6, -1); s.add(glowT);
    // the split, outdoors
    const out = new T3.Group(); s.add(out); out.position.set(200, 0, 0);
    out.add(ground(80, TX.grass([20, 20])));
    const skyb = sph(60, new T3.MeshBasicMaterial({ color: '#9ec0e0', side: T3.BackSide, fog: false }), 0, 0, 0, 8, 6); out.add(skyb);
    out.add(box(0.2, 3.4, 0.2, '#5a3a22', 0, 1.7, -2)); const sgL = signBoard('< FOOTBALL', 2.2, 0.6, { pw: 128, ph: 36, size: 9 }); sgL.position.set(-1.1, 3, -1.88); out.add(sgL); const sgR = signBoard('RUGBY >', 2.0, 0.6, { pw: 128, ph: 36, size: 9 }); sgR.position.set(1.0, 2.3, -1.88); out.add(sgR);
    const fb = person({ shirt: '#f0f0f0', trousers: '#1a1a2a', hat: 'cap', hatCol: '#1a2a6a', longSleeve: true, hair: '#4a2a1a' }); out.add(fb); const fbBall = ball('#7a5030', 0.18); out.add(fbBall);
    const rb = person({ shirt: '#2a6a3a', stripes: '#f0f0f0', trousers: '#ecece4', hat: 'cap', hatCol: '#2a6a3a', longSleeve: true, hair: '#8a5a2a' }); out.add(rb); const oval = sph(0.2, '#7a5030', 0, 0, 0, 7, 5); oval.scale.set(1, 0.7, 1.5); out.add(oval);
    const lawsAt = wt(6, 'laws'), carryAt = wt(6, 'carrying');
    return (lt, T, D) => {
      candles.forEach((f, i) => f.scale.setScalar(0.85 + 0.25 * S(T * 15 + i * 3)));
      men.forEach((p, i) => { idle(p, T + i); if (i === 1) p.userData.armR.rotation.x = -0.9 - S(T * 5) * 0.25; });
      glowT.visible = lt > lawsAt - 0.2 && lt < carryAt; glowT.material.opacity = prog(lt, lawsAt - 0.2, lawsAt + 0.4); glowT.position.y = 2.5 + S(T * 2) * 0.05;
      const outdoor = lt >= carryAt - 0.2; tav.fog.color.set(outdoor ? '#cfdce8' : '#2a1a10'); tav.fog.far = outdoor ? 200 : 40;
      if (!outdoor) camL([0, 2.6, 4.5], [0, 2.2, 1.4], prog(lt, 0, carryAt), [0, 1.6, -1], [0, 1.5, -0.8]);
      else { const k = prog(lt, carryAt - 0.2, D);
        fb.position.set(-0.8 - k * 2.2, 0, 1 - k * 1.5); fb.rotation.y = -Math.PI / 2 - 0.3; run(fb, T * 9, 0.8); fbBall.position.set(fb.position.x - 0.6, 0.18, fb.position.z - 0.1); fbBall.rotation.z = T * 6;
        rb.position.set(0.8 + k * 2.2, 0, 1 - k * 1.5); rb.rotation.y = Math.PI / 2 + 0.3; run(rb, T * 9 + 1, 0.8); rb.userData.armR.rotation.x = -1.2; oval.position.set(rb.position.x + 0.2, 1.25 + rb.userData.body.position.y, rb.position.z + 0.3);
        cam([200, 2.6, 7.5], [200, 1.8, -1]); }
    };
  },
  // 7 1872 — first international, then the FA Cup
  () => {
    const s = mkScene(['#9ab4cc', '#e0e4dc'], ['#c8d0c8', 26, 80], { dir: 0.9 });
    s.add(ground(120, TX.grass([30, 30]), '#88aa77'));
    const p = ground(1, TX.pitch()); p.scale.set(20, 34, 1); p.position.y = 0.01; s.add(p);
    for (const [x, z, r, l] of [[0, -20, 0, 26], [-13, 0, Math.PI / 2, 38], [13, 0, -Math.PI / 2, 38]]) s.add(crowdStand(l, 3, x, z, r));
    { const _o = goal(3.6, 1.3, 1, false); s.add(_o); _o.position.set(0, 0, -16.6); };
    const pl = people(s, 12, (i) => ({ shirt: i < 6 ? '#1a2a5a' : '#f4f4f0', shorts: i < 6 ? '#f0f0f0' : '#f0f0f0', trousers: i < 6 ? '#f0f0f0' : '#202030', socks: i < 6 ? '#c03030' : '#202030', hat: 'cap', hatCol: i < 6 ? '#c03030' : '#1a2a5a', longSleeve: true, skin: '#ecc4a0', hair: ['#3a2a1a', '#8a5a2a', '#c09050'][i % 3], moustache: i % 4 === 0 ? '#3a2a1a' : null }), 25);
    const b = add(s, ball('#7a5030', 0.18), 0, 0.18, 0);
    const cupG = new T3.Group(); const plinth = box(1.2, 1, 1.2, '#2a2a36', 0, 0.5, 0); cupG.add(plinth); const cup = trophy('#d8dce4'); cup.scale.setScalar(2.2); cup.position.y = 1; cupG.add(cup); cupG.position.set(40, 0, 0); s.add(cupG);
    const spot = new T3.PointLight('#ffffff', 3, 10); spot.position.set(40, 4, 2); s.add(spot);
    const cupAt = wt(7, 'that') - 0.2;
    return (lt, T, D) => {
      const bx = S(lt * 0.8) * 5, bz = S(lt * 0.5) * 8; b.position.set(bx, 0.18 + Math.abs(S(lt * 5)) * 0.3, bz); b.rotation.x = lt * 6;
      pl.forEach((p, i) => { const r = p.userData.r; const a = i * 0.9 + lt * (0.5 + r * 0.4); p.position.set(bx + S(a) * (2 + r * 4), 0, bz + C(a) * (2 + r * 5)); p.lookAt(bx, 0, bz); run(p, T * 10 + i, 1); });
      if (lt < cupAt) camL([10, 6, 14], [6, 4, 12], prog(lt, 0, cupAt), [bx, 0.5, bz], [bx, 0.5, bz]);
      else { cup.rotation.y = T * 0.8; cam([40 + S(lt * 0.4) * 1, 2.4, 4.2], [40, 2.1, 0]); }
    };
  },
  // 8 1888 — the league, then nets and penalties
  () => {
    const s = mkScene(['#90aac4', '#e0e4dc'], ['#c8d0c8', 26, 80], { dir: 0.95 });
    s.add(ground(120, TX.grass([30, 30]), '#88aa77'));
    const p = ground(1, TX.pitch()); p.scale.set(20, 34, 1); p.position.y = 0.01; s.add(p);
    s.add(crowdStand(26, 4, 0, -19.5, 0));
    const tableBoard = signBoard('FOOTBALL LEAGUE\n1. ......\n2. ......\n3. ......\n4. ......', 4.2, 3.2, { bg: '#14202a', fg: '#e8e0b0', pw: 128, ph: 96, size: 8 }); tableBoard.position.set(-6, 3.4, -10); s.add(tableBoard);
    s.add(box(0.15, 5, 0.15, '#444', -7.9, 2.5, -10.05)); s.add(box(0.15, 5, 0.15, '#444', -4.1, 2.5, -10.05));
    const gl = goal(3.6, 1.3, 1.1, true); gl.position.set(0, 0, -16.6); s.add(gl);
    const keeper = person({ shirt: '#3a7a3a', trousers: '#1a1a1a', hat: 'cap', hatCol: '#3a7a3a', longSleeve: true }); keeper.position.set(0, 0, -16.2); s.add(keeper);
    const taker = person({ shirt: '#c03a2a', shorts: '#f0f0f0', socks: '#c03a2a', hair: '#3a2a1a', longSleeve: true }); s.add(taker);
    const spotM = new T3.Mesh(new T3.CircleGeometry(0.12, 8), new T3.MeshBasicMaterial({ color: '#ffffff' })); spotM.rotation.x = -Math.PI / 2; spotM.position.set(0, 0.03, -10.6); s.add(spotM);
    const b = add(s, ball('#7a5030', 0.18), 0, 0.18, -10.6);
    const netsAt = wt(8, 'goal'), kickAt = wt(8, 'penalty') + 0.4;
    return (lt, T, D) => {
      if (lt < netsAt - 0.3) { camL([-3, 3.8, -3], [-4.5, 3.6, -6], prog(lt, 0, netsAt), [-6, 3.2, -10], [-6, 3.3, -10]); taker.visible = false; keeper.visible = false; }
      else { taker.visible = keeper.visible = true;
        const k = prog(lt, kickAt - 0.9, kickAt); taker.position.set(0.6 - k * 0.5, 0, lerp(-7.5, -10.1, k)); taker.rotation.y = Math.PI; if (lt < kickAt) run(taker, T * 10, 0.7); else kick(taker, 1);
        const f = prog(lt, kickAt, kickAt + 0.45); b.position.set(lerp(0, 1.1, f), 0.18 + S(f * Math.PI) * 0.5 + f * 0.4, lerp(-10.6, -17.3, f));
        keeper.position.x = lerp(0, -1.2, prog(lt, kickAt + 0.05, kickAt + 0.4)); idle(keeper, T); keeper.userData.armL.rotation.z = -1.2; keeper.userData.armR.rotation.z = 1.2; keeper.rotation.z = lerp(0, 0.7, prog(lt, kickAt + 0.05, kickAt + 0.4));
        gl.userData.back.position.z = -1.1 - (f >= 1 ? Math.max(0, 0.45 - (lt - kickAt - 0.45) * 0.8) : 0);
        if (lt > kickAt + 0.6) cheer(taker, T);
        camL([4, 2.2, -5.5], [2.5, 1.8, -8.5], prog(lt, netsAt, D), [0, 0.8, -15], [0.5, 0.8, -16]); }
    };
  },
  // 9 1904 Paris, then 1930 Uruguay
  () => {
    const s = mkScene(['#8ab4dc', '#f0e4cc'], ['#d8d4c8', 30, 110], { dir: 1.0 });
    // Paris part (x around -80)
    const P = new T3.Group(); P.position.set(-80, 0, 0); s.add(P);
    P.add(ground(80, TX.grass([20, 20]), '#a8b898'));
    const tw = new T3.Group(); const tm = '#6a5a4a';
    for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { const l = box(0.7, 6, 0.7, tm, sx * 2.6, 3, sz * 2.6); l.rotation.z = -sx * 0.32; l.rotation.x = sz * 0.32; tw.add(l); }
    tw.add(box(5, 0.5, 5, tm, 0, 5.6, 0)); { const _o = new T3.Mesh(new T3.CylinderGeometry(0.6, 1.8, 8, 4), mat(tm)); tw.add(_o); _o.position.set(0, 9.8, 0); }; tw.add(box(2.2, 0.4, 2.2, tm, 0, 9.6, 0)); { const _o = new T3.Mesh(new T3.CylinderGeometry(0.1, 0.6, 5, 4), mat(tm)); tw.add(_o); _o.position.set(0, 16.2, 0); };
    tw.children.forEach(c => c.rotation.y += Math.PI / 4); tw.position.set(0, 0, -14); P.add(tw);
    for (const x of [-12, -7, 7, 12]) P.add(tree(x, -8, 1.2, '#5a8a4a'));
    const globe = new T3.Mesh(new T3.IcosahedronGeometry(1.6, 1), mat('#3a6ab0')); globe.position.set(0, 3.2, -2); P.add(globe);
    for (let i = 0; i < 9; i++) { const pch = new T3.Mesh(new T3.IcosahedronGeometry(0.5, 0), mat('#4a9a4a')); const a = i * 1.7, e = S(i * 2.3) * 0.9; pch.position.set(C(a) * 1.45 * C(e), S(e) * 1.45, S(a) * 1.45 * C(e)); globe.add(pch); }
    const pins = []; for (let i = 0; i < 7; i++) { const pn = sph(0.12, new T3.MeshBasicMaterial({ color: '#ff3a2a' }), 0, 0, 0, 5, 4); const a = 0.2 + i * 0.25, e = 0.5 + S(i) * 0.2; pn.position.set(C(a) * 1.65 * C(e), S(e) * 1.65, S(a) * 1.65 * C(e)); globe.add(pn); pins.push(pn); }
    // 1930 stadium
    const U = new T3.Group(); s.add(U);
    U.add(ground(140, TX.grass([30, 30]), '#88aa77')); const pt = ground(1, TX.pitch()); pt.scale.set(20, 34, 1); pt.position.y = 0.01; U.add(pt);
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; const st = crowdStand(12, 9, S(a) * 20, C(a) * 24, a + Math.PI); U.add(st); }
    const pl = people(U, 12, (i) => i < 6 ? ({ shirt: '#7ab8e8', shorts: '#1a1a1a', socks: '#1a1a1a', skin: '#d8a880', hair: '#1a1a1a', longSleeve: true }) : ({ shirt: '#f4f4f4', stripes: '#7ab8e8', shorts: '#1a1a1a', socks: '#1a1a1a', skin: '#e0b088', hair: '#2a1a10', longSleeve: true }), 29);
    const b = add(U, ball('#7a5030', 0.18), 0, 0.18, 0);
    const cup = trophy('#e8c040'); cup.scale.setScalar(1.3); U.add(cup);
    const conf = []; const cm = ['#7ab8e8', '#f4f4f4', '#e8c040']; for (let i = 0; i < 60; i++) { const c = box(0.12, 0.02, 0.08, cm[i % 3]); U.add(c); conf.push(c); }
    const tenAt = wt(9, 'step', 1), winsAt = wt(9, 'wins');
    return (lt, T, D) => {
      globe.rotation.y = T * 0.6; pins.forEach((p, i) => p.visible = lt > 1.2 + i * 0.25);
      if (lt < tenAt - 0.2) { camL([-80, 6, 12], [-80, 4.5, 6.5], prog(lt, 0, tenAt), [-80, 6, -10], [-80, 3.4, -2]); return; }
      const won = lt > winsAt;
      const bx = S(lt * 0.8) * 5, bz = S(lt * 0.5) * 8; b.position.set(bx, 0.18 + Math.abs(S(lt * 5)) * 0.3, bz); b.visible = !won;
      pl.forEach((p, i) => { if (!won) { const r = p.userData.r; const a = i * 0.9 + lt * (0.5 + r * 0.4); p.position.set(bx + S(a) * (2 + r * 4), 0, bz + C(a) * (2 + r * 5)); p.lookAt(bx, 0, bz); run(p, T * 10 + i, 1); }
        else if (i < 6) { p.position.set((i - 2.5) * 0.9, 0, 0); p.lookAt(0, 0, 8); cheer(p, T + i); } else { p.position.set((i - 8.5) * 1.1, 0, -4); p.lookAt(0, 0, -10); idle(p, T); } });
      cup.visible = won; cup.position.set(0.0, 3.0 + Math.abs(S(T * 6)) * 0.15, 0.2);
      conf.forEach((c, i) => { c.visible = won; const k = ((lt - winsAt) * 0.25 + i / 60) % 1; c.position.set(S(i * 7.3) * 5, 8 - k * 8, C(i * 3.1) * 3 + 1); c.rotation.set(T * 3 + i, T * 2, 0); });
      if (!won) camL([12, 8, 16], [8, 5, 14], prog(lt, tenAt, winsAt), [bx, 0.5, bz], [bx, 0.5, bz]); else camL([0, 2.6, 7], [0, 3.2, 5.6], prog(lt, winsAt, D), [0, 2.2, 0], [0, 2.6, 0]);
    };
  },
  // 10 Today — modern stadium, fireworks
  () => {
    const s = mkScene(['#03050c', '#121a30'], ['#0a1020', 40, 120], { hemi: 0.9, dir: 1.0, sun: '#e8f0ff' });
    const p = ground(1, TX.pitch()); p.scale.set(20, 34, 1); s.add(p); { const _o = ground(160, TX.grass([40, 40]), '#557755'); s.add(_o); _o.position.y = -0.02; };
    for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2; s.add(crowdStand(12, 14, S(a) * 21, C(a) * 26, a + Math.PI)); }
    floodlights(s, [[-16, -24], [16, -24], [-16, 24], [16, 24]]);
    const pl = people(s, 14, (i) => i < 7 ? ({ shirt: '#e8e8f0', shorts: '#1a1a3a', socks: '#e8e8f0', hair: ['#1a1a1a', '#8a5a2a', '#c09050'][i % 3], skin: ['#e8b896', '#a8704a', '#6a4028'][i % 3] }) : ({ shirt: '#c82a2a', shorts: '#f0f0f0', socks: '#c82a2a', hair: ['#1a1a1a', '#3a2a1a'][i % 2], skin: ['#e8b896', '#8a5a3a', '#5a3420'][i % 3] }), 33);
    const b = add(s, ball(), 0, 0.15, 0);
    const fw = []; for (let i = 0; i < 6; i++) { const g = new T3.Group(); for (let j = 0; j < 24; j++) { const sp = box(0.25, 0.25, 0.25, new T3.MeshBasicMaterial({ color: ['#ffd04a', '#ff4a6a', '#4ad0ff', '#ffffff'][i % 4] })); g.add(sp); } s.add(g); fw.push(g); }
    return (lt, T, D) => {
      const bx = S(lt * 0.9) * 6, bz = S(lt * 0.6) * 10; b.position.set(bx, 0.15 + Math.abs(S(lt * 5)) * 0.25, bz); b.rotation.x = lt * 8;
      pl.forEach((p, i) => { const r = p.userData.r; const a = i * 0.9 + lt * (0.5 + r * 0.5); p.position.set(bx + S(a) * (2 + r * 5), 0, bz + C(a) * (2 + r * 6)); p.lookAt(bx, 0, bz); run(p, T * 11 + i, 1); });
      fw.forEach((g, i) => { const k = ((lt * 0.45 + i / 6) % 1); const cx = S(i * 2.1) * 18, cz = C(i * 1.3) * 20 - 6; g.children.forEach((c, j) => { const a = j / 24 * Math.PI * 2, e = S(j * 1.7) * 1.2; const r = ease(k) * 4; c.position.set(cx + C(a) * C(e) * r, 22 + S(e) * r - k * k * 3, cz + S(a) * C(e) * r); c.visible = k > 0.05 && k < 0.85; }); });
      const k = prog(lt, 0, D); cam([S(k * 1.2) * 14, lerp(3, 16, ease(k)), lerp(18, 26, k)], [0, lerp(1, 4, k), 0]);
    };
  },
];

// ---------- HUD ----------
const YEARS = ['', '~200 BC', '1300s', 'EARLY 1800s', '1848', '1857', '1863', '1872', '1888', '1904', ''];
const STEP = ['', 'STEP 1', 'STEP 2', 'STEP 3', 'STEP 4', 'STEP 5', 'STEP 6', 'STEP 7', 'STEP 8', 'STEP 9', ''];
const PLACE = ['', 'ANCIENT CHINA', 'MEDIEVAL ENGLAND', 'ENGLISH SCHOOLS', 'CAMBRIDGE', 'SHEFFIELD', 'LONDON', 'GLASGOW', 'ENGLAND', 'PARIS', ''];
function plate(ctx, step, year, place, a, slide) {
  ctx.save(); ctx.globalAlpha = a; ctx.translate(-260 * (1 - slide), 0);
  ctx.beginPath(); ctx.moveTo(0, 70); ctx.lineTo(430, 70); ctx.lineTo(390, 178); ctx.lineTo(0, 178); ctx.closePath();
  const g = ctx.createLinearGradient(0, 70, 0, 178); g.addColorStop(0, 'rgba(18,40,110,0.92)'); g.addColorStop(1, 'rgba(6,16,50,0.92)'); ctx.fillStyle = g; ctx.fill();
  ctx.strokeStyle = '#7ad0ff'; ctx.lineWidth = 4; ctx.stroke();
  ctx.fillStyle = '#ffd23a'; ctx.fillRect(0, 70, 14, 108);
  ctx.font = '30px Russo'; ctx.fillStyle = '#7ad0ff'; ctx.textBaseline = 'alphabetic'; ctx.fillText(step, 32, 110);
  ctx.font = '34px PressStart'; ctx.fillStyle = '#ffffff'; ctx.fillText(year, 32, 160);
  ctx.restore();
  if (place) { ctx.save(); ctx.globalAlpha = a * slide; ctx.font = '20px PressStart'; ctx.fillStyle = '#ffd23a'; ctx.strokeStyle = '#000'; ctx.lineWidth = 6; ctx.strokeText(place, 30, 214); ctx.fillText(place, 30, 214); ctx.restore(); }
}
function scoreBug(ctx, a, b, sa, sb, clock) {
  ctx.save(); ctx.translate(360, 260); ctx.font = '26px Russo'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgba(8,14,40,0.9)'; ctx.fillRect(-200, -26, 400, 52); ctx.strokeStyle = '#7ad0ff'; ctx.lineWidth = 3; ctx.strokeRect(-200, -26, 400, 52);
  ctx.fillStyle = '#ffffff'; ctx.fillText(a, -130, 2); ctx.fillText(b, 130, 2); ctx.fillStyle = '#ffd23a'; ctx.font = '28px PressStart'; ctx.fillText(`${sa}-${sb}`, 0, 4);
  if (clock) { ctx.font = '16px PressStart'; ctx.fillStyle = '#7ad0ff'; ctx.fillText(clock, 0, 44); }
  ctx.restore();
}
function bigText(ctx, txt, y, size, col = '#ffd23a', a = 1, font = 'Russo') { ctx.save(); ctx.globalAlpha = a; ctx.font = `${size}px ${font}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round'; ctx.lineWidth = size * 0.22; ctx.strokeStyle = '#05081a'; ctx.strokeText(txt, 360, y); ctx.fillStyle = col; ctx.fillText(txt, 360, y); ctx.restore(); }
function captionBox(ctx, txt) {
  if (!txt) return; ctx.save(); ctx.font = '46px Russo'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const words = txt.split(' '); const lines = []; let cur = ''; for (const w of words) { const t = cur ? cur + ' ' + w : w; if (ctx.measureText(t).width > 600 && cur) { lines.push(cur); cur = w; } else cur = t; } lines.push(cur);
  const y0 = 1060 - (lines.length - 1) * 29; lines.forEach((l, i) => { ctx.lineJoin = 'round'; ctx.lineWidth = 10; ctx.strokeStyle = '#05081a'; ctx.strokeText(l, 360, y0 + i * 58); ctx.fillStyle = '#ffffff'; ctx.fillText(l, 360, y0 + i * 58); });
  ctx.restore();
}
// captions from narrator words, with spoken forms mapped back to display text
const MAP = [[['step', 'one'], 'Step 1:'], [['step', 'two'], 'Step 2:'], [['step', 'three'], 'Step 3:'], [['step', 'four'], 'Step 4:'], [['step', 'five'], 'Step 5:'], [['step', 'six'], 'Step 6:'], [['step', 'seven'], 'Step 7:'], [['step', 'eight'], 'Step 8:'], [['step', 'nine'], 'Step 9:'], [['step', 'ten'], 'Step 10:'],
  [['chew', 'joo'], 'cuju'], [['eighteen', 'hundreds'], '1800s'], [['eighteen', 'forty', 'eight'], '1848'], [['eighteen', 'fifty', 'seven'], '1857'], [['eighteen', 'sixty', 'three'], '1863'], [['eighteen', 'seventy', 'two'], '1872'], [['eighteen', 'eighty', 'eight'], '1888'],
  [['nineteen', 'oh', 'four'], '1904'], [['nineteen', 'thirty'], '1930'], [['f', 'c'], 'FC'], [['f', 'a'], 'FA'], [['four', 'two'], '4-2'], [['nil', 'nil'], '0-0']];
const CAPS = [];
for (const c of CL) {
  const ws = []; const raw = c.words;
  for (let i = 0; i < raw.length;) { let hit = null; for (const [seq, rep] of MAP) { if (seq.every((s, k) => raw[i + k] && raw[i + k].w.toLowerCase().replace(/[^a-z0-9]/g, '') === s)) { hit = [seq.length, rep]; break; } } if (hit) { ws.push({ w: hit[1], a: raw[i].a, b: raw[i + hit[0] - 1].b }); i += hit[0]; } else { ws.push(raw[i]); i++; } }
  let cur = []; const flush = () => { if (cur.length) CAPS.push({ a: cur[0].a, b: cur[cur.length - 1].b, txt: cur.map(w => w.w).join(' ') }); cur = []; };
  ws.forEach(w => { if (cur.length && (cur.length >= 4 || w.a - cur[cur.length - 1].b > 0.28 || /:$/.test(cur[cur.length - 1].w))) flush(); cur.push(w); }); flush();
}
CAPS.forEach((c, i) => { const nx = CAPS[i + 1]; c.b = nx ? Math.min(nx.a, c.b + 0.5) : c.b + 0.6; });

// ---------- frame ----------
let glc, out, octx, low, lctx;
window.initFootball = async function () {
  await Promise.all(['30px Russo', '20px PressStart'].map(f => document.fonts.load(f)));
  makeTextures();
  glc = document.createElement('canvas'); glc.width = RW; glc.height = RH;
  renderer = new T3.WebGLRenderer({ canvas: glc, antialias: false, preserveDrawingBuffer: true }); renderer.setPixelRatio(1); renderer.setSize(RW, RH, false);
  renderer.outputColorSpace = T3.SRGBColorSpace;
  camera = new T3.PerspectiveCamera(58, RW / RH, 0.1, 500); window.__cam = camera; window.__r = renderer;
  BUILD.forEach(b => { const upd = b(); SCENES.push({ scene: lastScene, update: upd }); });
  out = document.getElementById('c'); octx = out.getContext('2d');
  low = document.createElement('canvas'); lctx = low.getContext('2d');
};
window.DURATION = TM.total;
window.renderFrame = function (T) {
  let ci = CL.findIndex(c => T >= c.start && T < c.start + c.dur); if (ci < 0) ci = CL.length - 1;
  const lt = T - CL[ci].start, D = CL[ci].dur;
  SCENES[ci].update(lt, T, D);
  renderer.render(SCENES[ci].scene, camera);
  // mosaic-in on each new clip
  const mz = clamp(1 - lt / 0.35); const f = mz > 0 ? Math.max(1, Math.round(mz * 14)) : 1;
  octx.imageSmoothingEnabled = false;
  if (f > 1) { low.width = Math.ceil(RW / f); low.height = Math.ceil(RH / f); lctx.imageSmoothingEnabled = false; lctx.drawImage(glc, 0, 0, low.width, low.height); octx.drawImage(low, 0, 0, W, H); }
  else octx.drawImage(glc, 0, 0, W, H);
  // scanlines + vignette
  octx.fillStyle = 'rgba(0,0,0,0.10)'; for (let y = 0; y < H; y += 5) octx.fillRect(0, y, W, 2);
  const vg = octx.createRadialGradient(360, 640, 420, 360, 640, 900); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.4)'); octx.fillStyle = vg; octx.fillRect(0, 0, W, H);
  // HUD
  if (STEP[ci]) { const a = prog(lt, 0.15, 0.5); plate(octx, STEP[ci], YEARS[ci], PLACE[ci], 1, ease(a)); }
  if (ci === 0) {
    const back = wt(0, 'back'); const ta = prog(lt, 0.2, 0.8) * (1 - prog(lt, back - 0.4, back));
    bigText(octx, 'THE HISTORY', 300, 82, '#ffffff', ta); bigText(octx, 'OF FOOTBALL', 395, 82, '#ffd23a', ta);
    if (lt < back - 0.4 && (lt * 2) % 2 > 0.7) bigText(octx, 'PRESS START', 560, 26, '#7ad0ff', ta, 'PressStart');
    if (lt > back - 0.3) { const k = prog(lt, back - 0.3, D - 0.2); const yr = Math.round(lerp(2026, -200, ease(k))); octx.fillStyle = `rgba(255,255,255,${0.08 + 0.08 * Math.sin(lt * 40)})`; for (let i = 0; i < 6; i++) octx.fillRect(0, (lt * 900 + i * 230) % H, W, 14);
      bigText(octx, '<< REWIND', 330, 50, '#ffffff', 1, 'PressStart'); bigText(octx, yr < 0 ? `${-yr} BC` : `${yr}`, 450, 64, '#ffd23a', 1, 'PressStart'); }
  }
  if (ci === 2) { const at = wt(2, 'ban'); if (lt > at - 0.1) { const k = ease(prog(lt, at - 0.1, at + 0.2)); octx.save(); octx.translate(360, 380); octx.rotate(-0.18); octx.scale(2 - k, 2 - k); octx.globalAlpha = k; octx.strokeStyle = '#d02a2a'; octx.lineWidth = 10; octx.strokeRect(-200, -60, 400, 120); octx.font = '76px Russo'; octx.textAlign = 'center'; octx.textBaseline = 'middle'; octx.fillStyle = '#d02a2a'; octx.fillText('BANNED!', 0, 4); octx.restore(); } }
  if (ci === 3) { const at = wt(3, 'nobody'); if (lt > at) bigText(octx, 'RULES: ???', 360, 64, '#ff5a3a', prog(lt, at, at + 0.3)); }
  if (ci === 5) { const at = wt(5, 'oldest'); if (lt > at - 0.2) bigText(octx, 'OLDEST CLUB IN THE WORLD', 380, 40, '#ffd23a', prog(lt, at - 0.2, at + 0.2)); }
  if (ci === 7) { const cupAt = wt(7, 'that') - 0.2; if (lt < cupAt) { const nil = wt(7, 'nil'); scoreBug(octx, 'SCO', 'ENG', 0, 0, lt > nil ? 'FULL TIME' : `${String(Math.floor(lt * 9)).padStart(2, '0')}:00`); } else bigText(octx, 'FIRST FA CUP FINAL', 380, 46, '#ffd23a', prog(lt, cupAt, cupAt + 0.3)); }
  if (ci === 8) { const kk = wt(8, 'penalty') + 0.4; if (lt > kk + 0.5) bigText(octx, 'GOAL!', 400, 110, '#ffd23a', prog(lt, kk + 0.5, kk + 0.7)); }
  if (ci === 9) { const ten = wt(9, 'step', 1); if (lt > ten - 0.2) { plate(octx, 'STEP 10', '1930', 'URUGUAY', 1, ease(prog(lt, ten - 0.2, ten + 0.2))); const won = wt(9, 'wins'); scoreBug(octx, 'URU', 'ARG', lt > wt(9, 'final') ? 4 : (lt > won ? 4 : 2), 2, lt > won ? 'FULL TIME' : '88:00'); }
    else bigText(octx, 'FIFA FOUNDED', 380, 50, '#ffd23a', prog(lt, 1.0, 1.4)); }
  if (ci === 10) { const at = wt(10, 'which'); if (lt > at - 0.2) { const a = prog(lt, at - 0.2, at + 0.2); bigText(octx, 'WHICH STEP', 320, 60, '#ffffff', a); bigText(octx, 'SURPRISED YOU?', 400, 60, '#ffd23a', a); if ((lt * 2) % 2 > 0.6) bigText(octx, 'COMMENT BELOW', 500, 26, '#7ad0ff', a, 'PressStart'); } else bigText(octx, 'TODAY', 300, 90, '#ffd23a', prog(lt, 0.3, 0.6)); }
  const cap = CAPS.find(c => T >= c.a && T < c.b); if (cap) captionBox(octx, cap.txt);
  if (T < 0.3) { octx.fillStyle = `rgba(0,0,0,${1 - T / 0.3})`; octx.fillRect(0, 0, W, H); }
  if (T > TM.total - 0.8) { octx.fillStyle = `rgba(0,0,0,${prog(T, TM.total - 0.8, TM.total)})`; octx.fillRect(0, 0, W, H); }
};
})();
