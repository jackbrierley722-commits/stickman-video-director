// How Football Was Made — 1-minute problem→fix chain, low-poly retro console style.
(() => {
const { T3, RW, RH, W, H, clamp, lerp, ease, prog, rng, makeTextures, TX, mat, box, cyl, sph, ground, person, run, idle, kick, cheer, ball, goal, tree, house, crowdStand, trophy, signBoard } = window.W3;
const TM = window.TIMING, CL = TM.clips;
const S = Math.sin, C = Math.cos;
function wt(ci, word, n = 0) { let k = 0; for (const w of CL[ci].words) if (w.w.toLowerCase().replace(/[^a-z0-9']/g, '') === word) { if (k === n) return w.a - CL[ci].start; k++; } return 0; }

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
  s.add(new T3.HemisphereLight(light.sky || '#ffffff', light.ground || '#556644', light.hemi ?? 0.9));
  const d = new T3.DirectionalLight(light.sun || '#fff4dd', light.dir ?? 1.1); d.position.set(5, 10, 6); s.add(d);
  return s;
}
function cam(p, l) { camera.position.set(p[0], p[1], p[2]); camera.lookAt(l[0], l[1], l[2]); }
function camL(a, b, k, la, lb) { k = ease(k); cam([lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)], [lerp(la[0], lb[0], k), lerp(la[1], lb[1], k), lerp(la[2], lb[2], k)]); }
function put(s, o, x = 0, y = 0, z = 0) { o.position.set(x, y, z); s.add(o); return o; }
function people(s, n, f, seed = 1) { const r = rng(seed); return Array.from({ length: n }, (_, i) => { const p = person(f(i, r)); s.add(p); p.userData.r = r(); return p; }); }
const RED = i => ({ shirt: '#c8302a', shorts: '#f0f0f0', socks: '#c8302a', skin: ['#ecc4a0', '#c08a60', '#8a5a3a'][i % 3], hair: ['#3a2a1a', '#1a1a1a', '#a0703a'][i % 3] });
const BLUE = i => ({ shirt: '#2a5ab8', shorts: '#f0f0f0', socks: '#2a5ab8', skin: ['#e8b896', '#a8704a', '#6a4028'][i % 3], hair: ['#1a1a1a', '#5a3a1a', '#c09050'][i % 3] });
function field(s, lines = false) { put(s, ground(160, TX.grass([40, 40]), '#7a9a66'), 0, -0.02, 0); if (lines) { const p = ground(1, TX.pitch()); p.scale.set(20, 34, 1); s.add(p); } for (const [x, z] of [[-14, -22], [-8, -26], [9, -24], [15, -20], [-16, 6], [16, 4]]) s.add(tree(x, z, 1.4, '#3f6a34')); }
function posts(withBar, withNet) { const g = new T3.Group(); const pm = '#f4f4f4';
  const pl = box(0.14, 2.4, 0.14, pm, -1.8, 1.2, 0), pr = box(0.14, 2.4, 0.14, pm, 1.8, 1.2, 0); g.add(pl, pr);
  const bar = box(3.74, 0.14, 0.14, pm, 0, 2.3, 0); g.add(bar); bar.visible = withBar;
  const nm = new T3.MeshBasicMaterial({ color: '#e8e8e8', wireframe: true, transparent: true, opacity: 0.75 });
  const net = new T3.Group(); const back = new T3.Mesh(new T3.PlaneGeometry(3.6, 2.3, 12, 7), nm); back.position.set(0, 1.15, -1.2); net.add(back);
  const top = new T3.Mesh(new T3.PlaneGeometry(3.6, 1.2, 12, 4), nm); top.rotation.x = Math.PI / 2; top.position.set(0, 2.3, -0.6); net.add(top);
  for (const sd of [-1, 1]) { const m = new T3.Mesh(new T3.PlaneGeometry(1.2, 2.3, 4, 7), nm); m.rotation.y = Math.PI / 2; m.position.set(sd * 1.8, 1.15, -0.6); net.add(m); }
  g.add(net); net.visible = withNet; g.userData = { pl, pr, bar, net, back }; return g; }

// ---------- scenes ----------
const BUILD = [
  // 0 Village to village — then a riot
  () => {
    const s = mkScene(['#7f8a96', '#d0c8b4'], ['#b0aca0', 22, 90], { sun: '#f0ead8', dir: 0.85 });
    s.add(ground(160, TX.mud([30, 30])));
    for (const [x, z, r] of [[-16, -3, 0.5], [-19, 2, 1.2], [-15, 6, 2], [16, -3, -0.5], [19, 2, -1.2], [15, 6, -2]]) s.add(house(x, z, r));
    const ch = new T3.Group(); ch.add(box(2.4, 6, 2.4, new T3.MeshLambertMaterial({ map: TX.stone([2, 3]) }), 0, 3, 0)); const sp = new T3.Mesh(new T3.ConeGeometry(1.8, 3, 4), mat('#5a5a62')); sp.position.y = 7.5; sp.rotation.y = Math.PI / 4; ch.add(sp); ch.position.set(-20, 0, -4); s.add(ch);
    const mob = people(s, 26, (i) => ({ shirt: ['#6a5034', '#5a6a3a', '#8a6a4a', '#4a4a5a', '#7a3a2a'][i % 5], trousers: ['#4a3a2a', '#3a3a30', '#5a4a3a'][i % 3], skin: '#e0b090', hair: ['#3a2a1a', '#8a5a2a', '#1a1a1a', '#b08a4a'][i % 4], hat: i % 4 === 0 ? 'hood' : 'none', hatCol: '#5a4030', beard: i % 3 === 0 ? '#4a3020' : null }), 7);
    const b = put(s, ball('#7a5030', 0.22), 0, 0.2, 0);
    const riot = wt(0, 'hundreds');
    return (lt, T, D) => {
      const bx = lerp(-12, 10, prog(lt, 0, D)) + S(lt * 1.3) * 2, bz = S(lt * 0.9) * 2.5; b.position.set(bx, 0.22 + Math.abs(S(lt * 5)) * 0.8, bz); b.rotation.x = lt * 8;
      const crowd = lt < riot ? 6 : 26;
      mob.forEach((p, i) => { p.visible = i < crowd || lt > riot + (i - 6) * 0.04; const r = p.userData.r; const a = i / 26 * Math.PI * 2 + lt * 0.5; const rad = 1 + r * (lt > riot ? 4.2 : 2.2);
        p.position.set(bx + C(a) * rad - 1.2, 0, bz + S(a) * rad * 0.8); p.lookAt(bx, 0, bz); run(p, T * 12 + i, 1);
        if (lt > riot + 1.4 && i % 5 === 2) { p.userData.body.rotation.x = -1.4; p.userData.body.position.y = 0.3; }
        if (lt > riot + 1.0 && i % 4 === 1) { p.userData.armR.rotation.x = -2.4 + S(T * 14 + i) * 0.5; } });
      const shake = lt > riot + 0.8 ? 0.12 : 0;
      camL([bx - 3, 6, 11], [bx * 0.4 - 2, 5, bz + 9], prog(lt, 0, riot), [bx, 0.6, bz], [bx, 0.6, bz]); camera.position.x += S(T * 50) * shake; camera.position.y += S(T * 43) * shake;
    };
  },
  // 1 A field, two teams — then someone picks it up
  () => {
    const s = mkScene(['#8ab4d8', '#e4ecf0'], ['#cfdce4', 28, 90]); field(s);
    const red = people(s, 5, RED, 3), blue = people(s, 5, BLUE, 5); const all = [...red, ...blue];
    const b = put(s, ball('#7a5030', 0.18), 0, 0.18, 0);
    const teams = wt(1, 'teams'), pick = wt(1, 'pick');
    return (lt, T, D) => {
      if (lt < pick - 0.2) {
        const k = ease(prog(lt, 0.3, teams + 0.3));
        red.forEach((p, i) => { p.position.set(lerp(-6 - i, -2.2, k), 0, (i - 2) * 1.4); p.lookAt(5, 0, (i - 2) * 1.4); if (k < 1) run(p, T * 10 + i, 1); else idle(p, T + i); });
        blue.forEach((p, i) => { p.position.set(lerp(6 + i, 2.2, k), 0, (i - 2) * 1.4); p.lookAt(-5, 0, (i - 2) * 1.4); if (k < 1) run(p, T * 10 + i, 1); else idle(p, T + i); });
        b.position.set(0, 0.18, 0);
        camL([0, 6, 12], [0, 4, 9], prog(lt, 0, pick), [0, 0.8, 0], [0, 0.8, 0]);
      } else {
        const k = prog(lt, pick - 0.2, D); const c = red[2];
        c.position.set(lerp(-1, 4, k), 0, lerp(0, 4, k)); c.rotation.y = 0.9; run(c, T * 11, 1); c.userData.armR.rotation.x = -1.2; c.userData.armL.rotation.x = -1.0;
        b.position.set(c.position.x + 0.3, 1.25 + c.userData.body.position.y, c.position.z + 0.35);
        all.forEach((p, i) => { if (p === c) return; p.lookAt(c.position.x, 0, c.position.z); idle(p, T + i); if (i % 3 === 0) { p.userData.armR.rotation.x = -1.6; } if (i % 3 === 1) { p.userData.armL.rotation.z = -2.2; p.userData.armR.rotation.z = 2.2; } });
        camL([5, 3.4, 9], [6, 3, 10], k, [1, 1.2, 1.5], [3, 1.2, 3]);
      }
    };
  },
  // 2 Write the rules down (pub) — then rugby leaves
  () => {
    const s = mkScene(['#20160e', '#3a2616'], ['#2a1a10', 14, 40], { sky: '#ffcc88', ground: '#3a2010', hemi: 0.9, sun: '#ffb860', dir: 0.7 });
    s.add(ground(30, TX.wood([10, 10])));
    for (const [x, z, r] of [[0, -6, 0], [-7, 0, Math.PI / 2], [7, 0, -Math.PI / 2]]) { const w = new T3.Mesh(new T3.PlaneGeometry(16, 6), new T3.MeshLambertMaterial({ map: TX.panel([6, 2]) })); w.position.set(x, 3, z); w.rotation.y = r; s.add(w); }
    s.add(box(6, 0.15, 1.8, new T3.MeshLambertMaterial({ map: TX.wood([3, 1]) }), 0, 1.2, -1)); for (const x of [-2.8, 2.8]) for (const z of [-1.7, -0.3]) s.add(box(0.12, 1.2, 0.12, '#3a2414', x, 0.6, z));
    const candles = []; for (const x of [-2, 2]) { s.add(cyl(0.05, 0.05, 0.3, 5, '#f0e8d0', x, 1.42, -1.3)); const f = sph(0.06, new T3.MeshBasicMaterial({ color: '#ffd060' }), x, 1.63, -1.3, 5, 4); s.add(f); candles.push(f); const pl = new T3.PointLight('#ffb050', 1.5, 6); pl.position.set(x, 1.8, -1.3); s.add(pl); }
    const book = new T3.Group(); book.add(box(1.0, 0.06, 0.7, '#7a1a1a', 0, 0, 0)); const pg = new T3.Mesh(new T3.PlaneGeometry(0.9, 0.62), new T3.MeshBasicMaterial({ map: TX.paper() })); pg.rotation.x = -Math.PI / 2; pg.position.y = 0.035; book.add(pg); book.position.set(0, 1.31, -0.8); s.add(book);
    const quill = box(0.03, 0.03, 0.5, '#f0f0f0'); s.add(quill);
    const men = people(s, 5, (i) => ({ shirt: '#f0ece0', jacket: ['#1a1a22', '#2a2018', '#1a2420'][i % 3], trousers: '#1a1a1e', hat: 'top', skin: '#ecc4a0', hair: '#3a2a1a', moustache: i % 2 ? '#3a2a1a' : null, collar: '#f8f8f0' }), 21);
    const seat = [[-2.4, -2.6], [0, -2.7], [2.4, -2.6], [-3.6, -1.0], [3.6, -1.0]]; men.forEach((p, i) => { p.position.set(seat[i][0], 0, seat[i][1]); p.lookAt(0, 0, -1); });
    const out = new T3.Group(); s.add(out); out.position.set(200, 0, 0);
    out.add(ground(80, TX.grass([20, 20]))); out.add(sph(60, new T3.MeshBasicMaterial({ color: '#9ec0e0', side: T3.BackSide, fog: false }), 0, 0, 0, 8, 6));
    out.add(box(0.2, 3.4, 0.2, '#5a3a22', 0, 1.7, -2)); const sgL = signBoard('< FOOTBALL', 2.2, 0.6, { pw: 128, ph: 36, size: 9 }); sgL.position.set(-1.1, 3, -1.88); out.add(sgL); const sgR = signBoard('RUGBY >', 2.0, 0.6, { pw: 128, ph: 36, size: 9 }); sgR.position.set(1.0, 2.3, -1.88); out.add(sgR);
    const fb = person(RED(0)); out.add(fb); const fbBall = ball('#7a5030', 0.18); out.add(fbBall);
    const rb = person({ shirt: '#2a6a3a', stripes: '#f0f0f0', trousers: '#ecece4', hat: 'cap', hatCol: '#2a6a3a', longSleeve: true, hair: '#8a5a2a' }); out.add(rb); const oval = sph(0.2, '#7a5030', 0, 0, 0, 7, 5); oval.scale.set(1, 0.7, 1.5); out.add(oval);
    const those = wt(2, 'those');
    return (lt, T, D) => {
      candles.forEach((f, i) => f.scale.setScalar(0.85 + 0.25 * S(T * 15 + i * 3)));
      men.forEach((p, i) => { idle(p, T + i); if (i === 1) { p.userData.armR.rotation.x = -0.9 - S(T * 7) * 0.2; } });
      quill.position.set(0.15 + S(T * 7) * 0.12, 1.42, -0.85); quill.rotation.y = 0.6;
      const outdoor = lt >= those - 0.2; s.fog.color.set(outdoor ? '#cfdce8' : '#2a1a10'); s.fog.far = outdoor ? 200 : 40;
      if (!outdoor) camL([0, 3, 4.2], [0, 2.3, 0.8], prog(lt, 0, those), [0, 1.4, -1], [0, 1.35, -0.8]);
      else { const k = prog(lt, those - 0.2, D);
        fb.position.set(-0.8 - k * 2.2, 0, 1 - k * 1.5); fb.rotation.y = -Math.PI / 2 - 0.3; run(fb, T * 9, 0.8); fbBall.position.set(fb.position.x - 0.6, 0.18, fb.position.z - 0.1);
        rb.position.set(0.8 + k * 2.2, 0, 1 - k * 1.5); rb.rotation.y = Math.PI / 2 + 0.3; run(rb, T * 9 + 1, 0.8); rb.userData.armR.rotation.x = -1.2; oval.position.set(rb.position.x + 0.2, 1.25 + rb.userData.body.position.y, rb.position.z + 0.3);
        cam([200, 2.6, 7.5], [200, 1.8, -1]); }
    };
  },
  // 3 Where do you score? Two posts — the goal
  () => {
    const s = mkScene(['#8ab4d8', '#e4ecf0'], ['#cfdce4', 28, 90]); field(s);
    const gA = posts(false, false); gA.position.set(0, 0, -12); s.add(gA); const gB = posts(false, false); gB.position.set(0, 0, 12); gB.rotation.y = Math.PI; s.add(gB);
    const shooter = person(BLUE(0)); s.add(shooter); const scratch = people(s, 3, i => RED(i), 9);
    const b = put(s, ball('#7a5030', 0.18), 0, 0.18, 0);
    const postsAt = wt(3, 'posts'), goalAt = wt(3, 'goal');
    return (lt, T, D) => {
      const up = ease(prog(lt, postsAt - 0.3, postsAt + 0.5)); for (const g of [gA, gB]) { g.userData.pl.scale.y = g.userData.pr.scale.y = Math.max(0.01, up); g.userData.pl.position.y = g.userData.pr.position.y = 1.2 * up; }
      scratch.forEach((p, i) => { p.position.set(-3 + i * 3, 0, -2 - i); p.lookAt(b.position.x, 0, b.position.z); idle(p, T + i); if (lt < postsAt) { p.userData.armL.rotation.z = -0.6; p.userData.armR.rotation.z = 0.6; p.rotation.y += S(T * 2 + i) * 0.6; } });
      if (lt < goalAt - 1.0) { shooter.position.set(0.5, 0, 0.5); shooter.lookAt(0, 0, -12); idle(shooter, T); b.position.set(0.5, 0.18, -0.2); if (lt < postsAt) shooter.userData.armR.rotation.z = 2.2 + S(T * 3) * 0.2; }
      else { const k = prog(lt, goalAt - 1.0, goalAt - 0.4); shooter.position.set(0.5, 0, lerp(0.5, -4, k)); shooter.rotation.y = Math.PI; if (k < 1) run(shooter, T * 10, 1); else kick(shooter, 1);
        const f = prog(lt, goalAt - 0.4, goalAt + 0.3); b.position.set(lerp(0.5, 0.2, f), 0.18 + S(f * Math.PI) * 0.8, lerp(-4.6, -13.5, f)); b.rotation.x = lt * 9; if (lt > goalAt + 0.5) cheer(shooter, T); }
      if (lt < postsAt - 0.3) camL([0, 9, 16], [0, 7, 14], prog(lt, 0, postsAt), [0, 0, -2], [0, 0, -4]); else camL([3, 4, 3], [2.4, 3, -1], prog(lt, postsAt - 0.3, D), [0, 1, -12], [0, 1, -12]);
    };
  },
  // 4 In or out? Crossbar, then a net
  () => {
    const s = mkScene(['#8ab4d8', '#e4ecf0'], ['#cfdce4', 28, 90]); field(s);
    const g = posts(true, true); g.position.set(0, 0, -12); s.add(g);
    const keeper = person({ shirt: '#3a8a3a', shorts: '#1a1a1a', socks: '#3a8a3a', hair: '#3a2a1a' }); keeper.position.set(0, 0, -11.4); s.add(keeper);
    const arguers = people(s, 2, i => (i ? RED(1) : BLUE(1)), 13);
    const b = put(s, ball('#7a5030', 0.18), 0, 0.18, 0);
    const bar = wt(4, 'crossbar'), net = wt(4, 'net');
    return (lt, T, D) => {
      const bk = ease(prog(lt, bar - 0.2, bar + 0.4)); g.userData.bar.visible = lt > bar - 0.2; g.userData.bar.position.y = lerp(6, 2.3, bk);
      g.userData.net.visible = lt > net - 0.15; g.userData.net.scale.setScalar(ease(prog(lt, net - 0.15, net + 0.2)) || 0.001);
      idle(keeper, T); keeper.lookAt(b.position.x, 0, b.position.z);
      if (lt < bar - 0.3) { // high shot — over or in? nobody knows
        const f = prog(lt, 0.0, 1.4); b.position.set(lerp(0.4, 0.2, f), 0.18 + S(f * Math.PI * 0.6) * 3.6, lerp(-4, -15, f));
        arguers.forEach((p, i) => { p.position.set(i ? 1.2 : -0.2, 0, -8.6); p.lookAt(i ? -0.2 : 1.2, 0, -8.6); idle(p, T); if (lt > 1.4) { p.userData.armR.rotation.x = -1.4 + S(T * 9 + i * 2) * 0.5; p.userData.armL.rotation.z = -1.0 - S(T * 7 + i) * 0.4; } });
        camL([4, 2.6, -4], [3.5, 2.8, -5], prog(lt, 0, bar), [0, 2, -12], [0, 2.2, -12]);
      } else {
        arguers.forEach(p => p.visible = false);
        const f = prog(lt, net + 0.1, net + 0.55); b.position.set(lerp(0.3, 0.9, f), 0.18 + S(f * Math.PI) * 0.7 + f * 0.6, lerp(-5, -13.0, f));
        g.userData.back.position.z = -1.2 - (f >= 1 ? Math.max(0, 0.4 - (lt - net - 0.55) * 0.8) : 0);
        camL([3.5, 2.8, -5], [2.6, 2.0, -6.5], prog(lt, bar - 0.3, D), [0, 1.8, -12], [0, 1.3, -12.4]);
      }
    };
  },
  // 5 Fouls near goal — the penalty
  () => {
    const s = mkScene(['#8ab4d8', '#e4ecf0'], ['#cfdce4', 28, 90]); field(s, true);
    const g = goal(3.6, 1.3, 1.1, true); g.position.set(0, 0, -16.6); s.add(g);
    const keeper = person({ shirt: '#3a8a3a', shorts: '#1a1a1a', socks: '#3a8a3a', hair: '#3a2a1a' }); keeper.position.set(0, 0, -16.2); s.add(keeper);
    const att = person(BLUE(0)), def = person(RED(2)); s.add(att, def);
    const spotM = new T3.Mesh(new T3.CircleGeometry(0.14, 8), new T3.MeshBasicMaterial({ color: '#ffffff' })); spotM.rotation.x = -Math.PI / 2; spotM.position.set(0, 0.03, -10.6); s.add(spotM);
    const b = put(s, ball('#7a5030', 0.18), 0, 0.18, 0);
    const foul = wt(5, 'fouling'), kickAt = wt(5, 'penalty') + 0.2;
    return (lt, T, D) => {
      idle(keeper, T); keeper.userData.armL.rotation.z = -0.6; keeper.userData.armR.rotation.z = 0.6;
      if (lt < foul + 1.2) {
        const k = prog(lt, 0, foul + 0.3); att.position.set(lerp(-3, -1.2, k), 0, lerp(-5, -12.5, k)); att.rotation.y = Math.PI + 0.3; def.position.set(lerp(2, -0.6, k), 0, lerp(-13, -12.8, k)); def.lookAt(att.position.x, 0, att.position.z);
        b.position.set(att.position.x + 0.2, 0.18, att.position.z - 0.6);
        if (lt < foul + 0.3) { run(att, T * 11, 1); run(def, T * 11 + 1, 1); } else { const f = prog(lt, foul + 0.3, foul + 0.7); att.userData.body.rotation.x = -1.4 * f; att.userData.body.position.y = 0.3 * f; def.userData.legR.rotation.x = -1.3; def.userData.body.rotation.x = 0.4; }
        camL([-5, 3, -6], [-4.5, 2.6, -7.5], prog(lt, 0, foul + 1.2), [-1, 0.6, -12.5], [-1, 0.6, -12.5]);
      } else {
        def.visible = false; spotM.scale.setScalar(1 + S(T * 8) * 0.3 * (lt < kickAt ? 1 : 0));
        const k = prog(lt, kickAt - 0.9, kickAt); att.userData.body.rotation.x = 0; att.position.set(0.6 - k * 0.5, 0, lerp(-7.6, -10.1, k)); att.rotation.y = Math.PI; if (lt < kickAt) run(att, T * 10, 0.7 * (k > 0 ? 1 : 0)); else kick(att, 1);
        const f = prog(lt, kickAt, kickAt + 0.45); b.position.set(lerp(0, -1.1, f), 0.18 + S(f * Math.PI) * 0.5 + f * 0.4, lerp(-10.6, -17.3, f));
        keeper.position.x = lerp(0, 1.2, prog(lt, kickAt + 0.05, kickAt + 0.4)); keeper.rotation.z = lerp(0, -0.7, prog(lt, kickAt + 0.05, kickAt + 0.4));
        g.userData.back.position.z = -1.1 - (f >= 1 ? Math.max(0, 0.45 - (lt - kickAt - 0.45) * 0.8) : 0);
        if (lt > kickAt + 0.6) cheer(att, T);
        cam([2.5, 2.0, -6.5], [0, 0.8, -15.5]);
      }
    };
  },
  // 6 Arguments — the referee
  () => {
    const s = mkScene(['#8ab4d8', '#e4ecf0'], ['#cfdce4', 28, 90]); field(s, true);
    const a = person(RED(0)), bb = person(BLUE(2)); s.add(a, bb); a.position.set(-0.7, 0, 0); bb.position.set(0.7, 0, 0); a.lookAt(0.7, 0, 0); bb.lookAt(-0.7, 0, 0);
    const extras = people(s, 4, i => (i % 2 ? RED(i + 1) : BLUE(i)), 31); extras.forEach((p, i) => p.position.set(-3 + i * 2, 0, -2.5 - (i % 2)));
    const ref = person({ shirt: '#151515', shorts: '#151515', socks: '#151515', hair: '#3a2a1a', collar: '#ffffff' }); s.add(ref);
    const refAt = wt(6, 'referee'), wh = wt(6, 'whistle');
    return (lt, T, D) => {
      const calm = lt > wh;
      for (const [p, ph] of [[a, 0], [bb, 1.4]]) { idle(p, T); if (!calm) { p.userData.armR.rotation.x = -1.3 + S(T * 9 + ph) * 0.6; p.userData.armL.rotation.z = -0.9 - S(T * 7 + ph) * 0.5; p.position.x += 0; } }
      extras.forEach((p, i) => { p.lookAt(0, 0, 0); idle(p, T + i); if (!calm && i % 2) { p.userData.armL.rotation.z = -2.3; p.userData.armR.rotation.z = 2.3; } });
      const k = prog(lt, refAt - 0.6, wh); ref.position.set(lerp(6, 0, ease(k)), 0, lerp(3, 1.6, ease(k))); ref.lookAt(0, 0, 0); if (k < 1) run(ref, T * 11, 1); else { idle(ref, T); ref.userData.armR.rotation.x = -2.9; ref.userData.armL.rotation.x = -1.2; }
      if (calm) { a.lookAt(ref.position.x, 0, ref.position.z); bb.lookAt(ref.position.x, 0, ref.position.z); }
      camL([0, 2.4, 5.5], [1.6, 2.2, 5.2], prog(lt, 0, D), [0, 1.6, 0], [0.6, 1.6, 0.6]);
    };
  },
  // 7 Every country — the World Cup
  () => {
    const s = mkScene(['#03050c', '#121a30'], ['#0a1020', 40, 120], { hemi: 0.9, dir: 1.0, sun: '#e8f0ff' });
    field(s, true);
    for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2; s.add(crowdStand(12, 14, S(a) * 21, C(a) * 26, a + Math.PI)); }
    for (const [x, z] of [[-16, -24], [16, -24], [-16, 24], [16, 24]]) { s.add(box(0.3, 14, 0.3, '#888', x, 7, z)); const l = box(2.4, 1.2, 0.3, '#fff', x, 14.5, z); l.material = new T3.MeshBasicMaterial({ color: '#fffbe0' }); l.lookAt(0, 0, 0); s.add(l); }
    const kits = [['#f4f4f4', '#1a1a3a'], ['#f0d020', '#2a5ab8'], ['#7ab8e8', '#f4f4f4'], ['#c8302a', '#f4f4f4'], ['#1a3a8a', '#f4f4f4'], ['#f08a20', '#f4f4f4'], ['#2a8a3a', '#f4f4f4'], ['#1a1a1a', '#f4f4f4']];
    const pl = people(s, 8, i => ({ shirt: kits[i][0], shorts: kits[i][1], socks: kits[i][0], skin: ['#e8b896', '#a8704a', '#6a4028', '#d8a880'][i % 4], hair: ['#1a1a1a', '#5a3a1a', '#c09050'][i % 3] }), 41);
    const cup = trophy('#e8c040'); cup.scale.setScalar(2.2); s.add(cup); s.add(box(1.2, 1.0, 1.2, '#2a2a36', 0, 0.5, 0)); cup.position.set(0, 1, 0);
    const fw = []; for (let i = 0; i < 6; i++) { const g = new T3.Group(); for (let j = 0; j < 24; j++) g.add(box(0.25, 0.25, 0.25, new T3.MeshBasicMaterial({ color: ['#ffd04a', '#ff4a6a', '#4ad0ff', '#ffffff'][i % 4] }))); s.add(g); fw.push(g); }
    return (lt, T, D) => {
      cup.rotation.y = T * 0.8;
      pl.forEach((p, i) => { const a = i / 8 * Math.PI * 2 + 0.2; const k = ease(prog(lt, 0.2 + i * 0.12, 1.4 + i * 0.12)); p.position.set(C(a) * lerp(14, 3.2, k), 0, S(a) * lerp(14, 3.2, k)); p.lookAt(0, 0, 0); if (k < 1) run(p, T * 11 + i, 1); else cheer(p, T + i); });
      fw.forEach((g, i) => { const k = ((lt * 0.5 + i / 6) % 1); const cx = S(i * 2.1) * 18, cz = C(i * 1.3) * 20 - 6; g.children.forEach((c, j) => { const a = j / 24 * Math.PI * 2, e = S(j * 1.7) * 1.2; const r = ease(k) * 4; c.position.set(cx + C(a) * C(e) * r, 22 + S(e) * r - k * k * 3, cz + S(a) * C(e) * r); c.visible = k > 0.05 && k < 0.85; }); });
      const k = prog(lt, 0, D); cam([S(k * 1.4 + 0.3) * lerp(7, 16, k), lerp(2.5, 12, ease(k)), C(k * 1.4 + 0.3) * lerp(7, 16, k)], [0, lerp(2, 3, k), 0]);
    };
  },
];

// ---------- HUD ----------
function bigText(ctx, txt, y, size, col = '#ffd23a', a = 1, font = 'Russo') { ctx.save(); ctx.globalAlpha = a; ctx.font = `${size}px ${font}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round'; ctx.lineWidth = size * 0.22; ctx.strokeStyle = '#05081a'; ctx.strokeText(txt, 360, y); ctx.fillStyle = col; ctx.fillText(txt, 360, y); ctx.restore(); }
function banner(ctx, kind, item, k, out) {
  // kind: 'unlock' | 'problem'; k: 0..1 slide-in; out: 0..1 slide-out
  const good = kind === 'unlock'; const x = lerp(-640, 40, ease(k)) - ease(out) * 700; const y = 92;
  ctx.save(); ctx.translate(x, y);
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(640, 0); ctx.lineTo(610, 128); ctx.lineTo(0, 128); ctx.closePath();
  const g = ctx.createLinearGradient(0, 0, 0, 128); if (good) { g.addColorStop(0, 'rgba(20,110,60,0.95)'); g.addColorStop(1, 'rgba(6,50,26,0.95)'); } else { g.addColorStop(0, 'rgba(170,30,30,0.95)'); g.addColorStop(1, 'rgba(80,8,8,0.95)'); }
  ctx.fillStyle = g; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = good ? '#7dffb0' : '#ffb0a0'; ctx.stroke();
  ctx.fillStyle = good ? '#7dffb0' : '#ffe24a'; ctx.beginPath(); ctx.arc(64, 64, 38, 0, 7); ctx.fill();
  ctx.fillStyle = good ? '#06321a' : '#5a0808'; ctx.font = '50px Russo'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(good ? '✓' : '!', 64, 68);
  ctx.textAlign = 'left'; ctx.font = '22px PressStart'; ctx.fillStyle = good ? '#7dffb0' : '#ffe24a'; ctx.fillText(good ? 'UNLOCKED' : 'PROBLEM', 124, 40);
  ctx.font = (item.length > 16 ? 34 : 44) + 'px Russo'; ctx.fillStyle = '#ffffff'; ctx.fillText(item, 124, 90);
  ctx.restore();
}
// events: [clip, word, n, kind, label]
const EV = [
  [0, 'football', 0, 'unlock', 'FOOTBALL'], [0, 'hundreds', 0, 'problem', 'IT BECOMES A RIOT'],
  [1, 'teams', 0, 'unlock', 'A FIELD + 2 TEAMS'], [1, 'pick', 0, 'problem', 'PLAYERS USE HANDS'],
  [2, 'laws', 0, 'unlock', 'LAWS OF THE GAME'], [2, 'rugby', 0, 'unlock', 'RUGBY (SPIN-OFF)'],
  [3, 'where', 0, 'problem', 'WHERE DO YOU SCORE?'], [3, 'goal', 0, 'unlock', 'GOAL POSTS'],
  [4, 'nobody', 0, 'problem', 'WAS IT IN OR OUT?'], [4, 'crossbar', 0, 'unlock', 'CROSSBAR'], [4, 'net', 0, 'unlock', 'GOAL NET'],
  [5, 'fouling', 0, 'problem', 'FOULS NEAR GOAL'], [5, 'penalty', 0, 'unlock', 'PENALTY KICK'],
  [6, 'argue', 0, 'problem', 'ENDLESS ARGUMENTS'], [6, 'referee', 0, 'unlock', 'REFEREE + WHISTLE'],
  [7, 'every', 0, 'problem', 'EVERYONE WANTS IN'], [7, 'world', 0, 'unlock', 'THE WORLD CUP'],
].map(([ci, w, n, kind, label]) => ({ t: CL[ci].start + wt(ci, w, n) - 0.15, kind, label }));
EV.forEach((e, i) => { const nx = EV[i + 1]; e.end = nx ? nx.t : TM.total; });

// captions
const CAPS = [];
for (const c of CL) { let cur = []; const flush = () => { if (cur.length) CAPS.push({ a: cur[0].a, b: cur[cur.length - 1].b, txt: cur.map(w => w.w).join(' ') }); cur = []; };
  c.words.forEach(w => { if (cur.length && (cur.length >= 4 || w.a - cur[cur.length - 1].b > 0.28 || /^(So|But|This|Those|Now|And|What|No)$/.test(w.w))) flush(); cur.push(w); }); flush(); }
CAPS.forEach((c, i) => { const nx = CAPS[i + 1]; c.b = nx ? Math.min(nx.a, c.b + 0.5) : c.b + 0.8; });
function captionBox(ctx, txt) { ctx.save(); ctx.font = '50px Russo'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const words = txt.split(' '); const lines = []; let cur = ''; for (const w of words) { const t = cur ? cur + ' ' + w : w; if (ctx.measureText(t).width > 600 && cur) { lines.push(cur); cur = w; } else cur = t; } lines.push(cur);
  const y0 = 1050 - (lines.length - 1) * 31; lines.forEach((l, i) => { ctx.lineJoin = 'round'; ctx.lineWidth = 11; ctx.strokeStyle = '#05081a'; ctx.strokeText(l, 360, y0 + i * 62); ctx.fillStyle = '#ffffff'; ctx.fillText(l, 360, y0 + i * 62); }); ctx.restore(); }

let glc, out, octx, low, lctx;
window.initFootball = async function () {
  await Promise.all(['30px Russo', '20px PressStart'].map(f => document.fonts.load(f)));
  makeTextures();
  glc = document.createElement('canvas'); glc.width = RW; glc.height = RH;
  renderer = new T3.WebGLRenderer({ canvas: glc, antialias: false, preserveDrawingBuffer: true }); renderer.setPixelRatio(1); renderer.setSize(RW, RH, false); renderer.outputColorSpace = T3.SRGBColorSpace;
  camera = new T3.PerspectiveCamera(58, RW / RH, 0.1, 500);
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
  const vg = octx.createRadialGradient(360, 640, 420, 360, 640, 900); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.4)'); octx.fillStyle = vg; octx.fillRect(0, 0, W, H);
  // first second: title
  if (T < 2.2) { const a = 1 - prog(T, 1.7, 2.2); bigText(octx, 'HOW FOOTBALL', 330, 78, '#ffffff', a); bigText(octx, 'WAS MADE', 420, 78, '#ffd23a', a); }
  const e = EV.filter(e => T >= e.t).pop(); if (e && T > 2.0) banner(octx, e.kind, e.label, prog(T, e.t, e.t + 0.3), prog(T, e.end - 0.25, e.end));
  if (ci === 7) { const at = wt(7, 'what'); if (lt > at - 0.2) { const a = prog(lt, at - 0.2, at + 0.2); bigText(octx, 'WHAT RULE', 420, 66, '#ffffff', a); bigText(octx, 'WOULD YOU ADD?', 505, 66, '#ffd23a', a); if ((lt * 2) % 2 > 0.6) bigText(octx, 'COMMENT BELOW', 600, 26, '#7ad0ff', a, 'PressStart'); } }
  const cap = CAPS.find(c => T >= c.a && T < c.b); if (cap) captionBox(octx, cap.txt);
  if (T < 0.25) { octx.fillStyle = `rgba(0,0,0,${1 - T / 0.25})`; octx.fillRect(0, 0, W, H); }
  if (T > TM.total - 0.7) { octx.fillStyle = `rgba(0,0,0,${prog(T, TM.total - 0.7, TM.total)})`; octx.fillRect(0, 0, W, H); }
};
})();
