
// ---------- sets ----------
const BA = [0, 0, 0], BD = [40, 0, 0], ND = [80, 0, 0], RS = [120, 0, 0];
const R = {}; const WINM = [];
function grp(at) { const g = new T3.Group(); g.position.set(at[0], at[1], at[2]); scene.add(g); return g; }
function place(p, g, x, z, ry = 0) { p.position.set(x, 0, z); p.rotation.y = ry; g.add(p); return p; }
function tree(g, x, z, s = 1) { const t = new T3.Group(); t.position.set(x, 0, z); t.scale.setScalar(s); g.add(t); add(t, Bx(0.5, 2, 0.5), SM('#7a5230'), 0, 1, 0); add(t, Bx(2.4, 1.6, 2.4), SM('#3fa34d'), 0, 2.6, 0); add(t, Bx(1.6, 1.0, 1.6), SM('#4cbf5a'), 0, 3.8, 0); return t; }
function house(g, x, z, ry, wall, roof, door = '#7a4a2a') { const h = new T3.Group(); h.position.set(x, 0, z); h.rotation.y = ry; g.add(h);
  add(h, Bx(6, 4.4, 6), SM(wall), 0, 2.2, 0); const rf = add(h, new T3.ConeGeometry(4.6, 2.6, 4), SM(roof), 0, 5.7, 0); rf.rotation.y = PI / 4;
  add(h, Bx(1.2, 2.2, 0.12), SM(door), 0, 1.1, 3.02); add(h, Bx(0.14, 0.14, 0.1), SM('#d4af37'), 0.42, 1.1, 3.1);
  for (const wx of [-1.9, 1.9]) { const wm = SM('#9fd3ff', { emissive: '#ffcf6a', emissiveIntensity: 0 }); WINM.push(wm); add(h, Bx(1.1, 1.1, 0.1), wm, wx, 2.6, 3.02); add(h, Bx(1.3, 0.12, 0.16), SM('#ffffff'), wx, 2.0, 3.04); }
  return h; }
function wallSet(g, w, h, d, col, floorCol, opts = {}) { add(g, Bx(w, 0.1, d), SM(floorCol, opts.floorMap ? { map: opts.floorMap } : {}), 0, 0.05, 0); add(g, Bx(w, h, 0.2), SM(col, opts.wallMap ? { map: opts.wallMap } : {}), 0, h / 2, -d / 2); add(g, Bx(0.2, h, d), SM(col, opts.wallMap ? { map: opts.wallMap } : {}), -w / 2, h / 2, 0); add(g, Bx(0.2, h, d), SM(col, opts.wallMap ? { map: opts.wallMap } : {}), w / 2, h / 2, 0); }
function texRep(w, h, f, rep) { const t = ctex(w, h, f); t.wrapS = t.wrapT = T3.RepeatWrapping; t.repeat.set(rep[0], rep[1]); return t; }
function phoneIn(p, side = 'R') { const ar = p.userData[side === 'R' ? 'armR' : 'armL']; const ph = new T3.Group(); ph.position.set(0, -0.82, 0.22); ar.add(ph); add(ph, Bx(0.3, 0.5, 0.05), SM('#111'), 0, 0, 0); const sc = add(ph, new T3.PlaneGeometry(0.26, 0.44), BM('#7fd0ff'), 0, 0, 0.03, false); ph.userData.sc = sc; return ph; }

function build() {
  hemi = new T3.HemisphereLight('#cfe9ff', '#7a9a5a', 1.2); scene.add(hemi); amb = new T3.AmbientLight('#ffffff', 0.25); scene.add(amb);
  sun = new T3.DirectionalLight('#fff4e0', 2.6); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); const sc = sun.shadow.camera; sc.left = -18; sc.right = 18; sc.top = 18; sc.bottom = -18; sc.near = 1; sc.far = 100; sun.shadow.bias = -0.0005; sun.shadow.normalBias = 0.03; scene.add(sun); scene.add(sun.target);
  add(scene, Bx(1200, 0.2, 1200), SM('#6cbf4a'), 0, -0.1, 0, false);
  const friend = (extra = {}) => person(Object.assign({ skin: '#e0a878', top: '#ff8c1a', bot: '#2e3d66', hair: '#3a2410', style: 'spiky', face: 'grin' }, extra));

  // ===== BATHROOM =====
  const BAG = grp(BA); const tile = texRep(64, 64, g => { g.fillStyle = '#bfe8f2'; g.fillRect(0, 0, 64, 64); g.strokeStyle = '#ffffff'; g.lineWidth = 3; g.strokeRect(0, 0, 32, 32); g.strokeRect(32, 0, 32, 32); g.strokeRect(0, 32, 32, 32); g.strokeRect(32, 32, 32, 32); }, [6, 3]);
  wallSet(BAG, 7, 4.2, 6, '#ffffff', '#e8eef2', { wallMap: tile });
  add(BAG, Bx(2.6, 0.2, 2.4), SM('#ffffff'), -1.6, 0.1, -1.6); // shower tray
  const glass = SM('#cfefff', { transparent: true, opacity: 0.18, roughness: 0.05 }); add(BAG, Bx(0.06, 3.0, 2.4), glass, -0.3, 1.6, -1.6, false); add(BAG, Bx(1.3, 3.0, 0.06), glass, -2.25, 1.6, -0.42, false);
  add(BAG, Cy(0.05, 0.05, 0.6, 8), SM('#c0c6cc', { metalness: 0.7, roughness: 0.3 }), -1.6, 3.4, -2.7).rotation.x = PI / 2; add(BAG, Cy(0.25, 0.2, 0.1, 16), SM('#c0c6cc', { metalness: 0.7, roughness: 0.3 }), -1.6, 3.3, -2.4);
  R.drops = []; const dm = BM('#9fd8ff', { transparent: true, opacity: 0.7 }); for (let i = 0; i < 40; i++) { const d = add(BAG, Bx(0.025, 0.25, 0.025), dm, 0, 0, 0, false); d.userData.r = [Math.random(), Math.random(), Math.random()]; R.drops.push(d); }
  R.steam = []; for (let i = 0; i < 10; i++) R.steam.push(glow(BAG, '#ffffff', 2.4, -1.6, 2.5, -1.6, 0));
  add(BAG, Bx(1.4, 0.9, 0.7), SM('#ffffff'), 2.0, 0.45, -2.6); add(BAG, Bx(1.2, 1.0, 0.06), SM('#dff4ff', { metalness: 0.6, roughness: 0.05 }), 2.0, 2.1, -2.95);
  R.clock = new T3.Group(); R.clock.position.set(1.0, 3.2, -2.88); BAG.add(R.clock); add(R.clock, Cy(0.45, 0.45, 0.08, 24), SM('#ffffff'), 0, 0, 0).rotation.x = PI / 2; add(R.clock, new T3.TorusGeometry(0.45, 0.05, 6, 24), SM('#e74c3c'), 0, 0, 0.02);
  R.cH = new T3.Group(); R.cH.position.z = 0.06; R.clock.add(R.cH); add(R.cH, Bx(0.06, 0.25, 0.02), BM('#111'), 0, 0.11, 0, false); R.cM = new T3.Group(); R.cM.position.z = 0.08; R.clock.add(R.cM); add(R.cM, Bx(0.04, 0.38, 0.02), BM('#111'), 0, 0.17, 0, false);
  R.fShower = friend({ top: '#e0a878', bot: '#ffffff', extras: [] }); place(R.fShower, BAG, -1.6, -1.6, 0.25); add(R.fShower.userData.head, Sp(0.38, 12, 8, 0, 2 * PI, 0, 1.6), SM('#ff7eb6'), 0, 0.2, -0.04).scale.set(1, 0.75, 1); 
  R.phS = phoneIn(R.fShower);

  // ===== BEDROOM (shirts) =====
  const BDG = grp(BD); wallSet(BDG, 8, 4, 6, '#ffe0b3', '#c99a6a');
  add(BDG, Bx(2.4, 3.4, 1.0), SM('#8a5a32'), -2.6, 1.7, -2.4); add(BDG, Bx(2.2, 3.1, 0.05), SM('#5a3a20'), -2.6, 1.75, -1.88);
  add(BDG, Bx(2.6, 0.6, 2.0), SM('#ffffff'), 2.2, 0.3, -1.8); add(BDG, Bx(2.6, 0.2, 2.0), SM('#74b9ff'), 2.2, 0.7, -1.8);
  const sr = rng(4); for (let i = 0; i < 14; i++) { const m = add(BDG, Bx(0.8, 0.06, 0.6), SM(['#e74c3c', '#2ecc71', '#f1c40f', '#9b59b6', '#ecf0f1', '#34495e'][i % 6]), 2.2 + (sr() - 0.5) * 1.8, 0.82 + i * 0.03, -1.8 + (sr() - 0.5) * 1.2); m.rotation.y = sr() * 3; }
  R.fShirt = friend({ top: '#e0a878', bot: '#ffffff', face: 'neutral' }); place(R.fShirt, BDG, 0, -0.6, 0); 
  R.shL = add(R.fShirt.userData.armL, Bx(0.8, 0.9, 0.06), SM('#e74c3c'), 0, -0.95, 0.3); R.shR = add(R.fShirt.userData.armR, Bx(0.8, 0.9, 0.06), SM('#2ecc71'), 0, -0.95, 0.3);
  R.flyShirts = []; for (let i = 0; i < 5; i++) R.flyShirts.push(add(BDG, Bx(0.8, 0.06, 0.6), SM(['#f1c40f', '#9b59b6', '#3498db', '#e67e22', '#1abc9c'][i]), 0, -5, 0));

  // ===== NEXT DOOR =====
  const NDG = grp(ND); house(NDG, -2.5, -4, 0, '#a0c4ff', '#c0392b').scale.setScalar(0.72); house(NDG, 2.5, -4, 0, '#ffd6a5', '#2c3e50').scale.setScalar(0.72); add(NDG, Bx(30, 0.06, 2.4), SM('#d9d2c3'), 0, 0.03, 0.4); add(NDG, Bx(1.0, 0.06, 2), SM('#d9d2c3'), -2.5, 0.03, -0.9); add(NDG, Bx(1.0, 0.06, 2), SM('#d9d2c3'), 2.5, 0.03, -0.9);
  add(NDG, Bx(0.15, 0.7, 3), SM('#ffffff'), 0, 0.35, -3.2); tree(NDG, -7, -4); tree(NDG, 7, -4); tree(NDG, 0, -9, 1.2);
  R.you = person({ skin: '#c68a5a', top: '#2a6fdb', bot: '#2d3436', hair: '#1a1a1a', style: 'short', face: 'angry' }); place(R.you, NDG, -2.5, -0.5, 0.25); tag(R.you, 'YOU', '#9ad0ff');
  R.fWalk = friend({ face: 'grin' }); place(R.fWalk, NDG, 2.5, -0.5, -PI / 2); tag(R.fWalk, 'LATE FRIEND', '#ffb26b');

  // ===== RESTAURANT (evening) =====
  const RSG = grp(RS); add(RSG, Bx(14, 5, 0.4), SM('#7a2e2e'), 0, 2.5, -3); add(RSG, Bx(14, 0.6, 1.4), SM('#2c3e50'), 0, 4.4, -2.3);
  add(RSG, Bx(5, 1.0, 0.1), BM('#ffffff', { map: ctex(512, 100, g => { g.fillStyle = '#2c3e50'; g.fillRect(0, 0, 512, 100); g.fillStyle = '#ffd34a'; g.font = '64px Russo'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('PIZZA', 256, 54); }) }), 0, 4.4, -1.55, false);
  for (const x of [-4.2, 4.2]) { const wm = SM('#ffe2a8', { emissive: '#ffcf6a', emissiveIntensity: 1.2 }); add(RSG, Bx(3, 2, 0.1), wm, x, 1.8, -2.75); }
  add(RSG, Bx(1.6, 2.6, 0.1), SM('#3a2010'), 0, 1.3, -2.75); add(RSG, Bx(14, 0.06, 4), SM('#9a9a9a'), 0, 0.03, -0.6);
  R.lampL = new T3.PointLight('#ffcf80', 18, 10, 1.6); R.lampL.position.set(0, 3.5, 0); RSG.add(R.lampL);
  R.you2 = person({ skin: '#c68a5a', top: '#2a6fdb', bot: '#2d3436', hair: '#1a1a1a', style: 'short', face: 'tired' }); place(R.you2, RSG, -1.6, -0.4, 0.2); 
  // clock face texture for the bathroom clock
}

// ---------- mood ----------
const MOODS = { day: { bg: '#8fd3ff', fog: '#cfeaff', hemi: 1.25, sun: 2.7, sc: '#fff4e0', off: [10, 22, 12], hs: '#cfe9ff' }, inside: { bg: '#8fd3ff', fog: '#cfeaff', hemi: 1.1, sun: 2.0, sc: '#fff4e0', off: [6, 20, 14], hs: '#ffffff' }, eve: { bg: '#2a2a5a', fog: '#2a2a5a', hemi: 0.45, sun: 0.6, sc: '#ffb07a', off: [-14, 10, 12], hs: '#6a5a9a' } };
let curMood = 'day';
function mood(m, at) { const M = MOODS[m]; curMood = m; scene.background.set(M.bg); scene.fog.color.set(M.fog); scene.fog.near = 40; scene.fog.far = 160; hemi.intensity = M.hemi; hemi.color.set(M.hs); sun.intensity = M.sun; sun.color.set(M.sc); sun.target.position.set(at[0], 0, at[2]); sun.position.set(at[0] + M.off[0], M.off[1], at[2] + M.off[2]); }
const P = (set, x, y, z) => [set[0] + x, set[1] + y, set[2] + z];

// ---------- shots ----------
const SH = [
  [0, 'inside', BA, (k, T) => dolly(P(BA, 0.6, 2.4, 3.0), P(BA, 0.3, 2.3, 2.3), P(BA, -1.6, 2.1, -1.6), P(BA, -1.6, 2.2, -1.6), k, T)],
  [E.late0 - 0.1, 'inside', BA, (k, T) => dolly(P(BA, -0.5, 2.3, 0.9), P(BA, -0.7, 2.3, 0.5), P(BA, -1.6, 2.2, -1.6), P(BA, -1.6, 2.3, -1.6), k, T)],
  [E.shirt, 'inside', BD, (k, T) => dolly(P(BD, 0.4, 2.2, 4.4), P(BD, 0.2, 2.1, 3.4), P(BD, 0, 1.7, -0.6), P(BD, 0, 1.8, -0.6), k, T)],
  [E.traffic, 'day', ND, (k, T) => dolly(P(ND, 0, 2.6, 12.5), P(ND, 0, 2.5, 11), P(ND, 0, 1.9, -1.5), P(ND, 0, 1.9, -1.5), k, T)],
  [E.door - 0.1, 'day', ND, (k, T) => dolly(P(ND, 0, 6.5, 8.5), P(ND, 0, 7, 7.5), P(ND, 0, 0.5, -1), P(ND, 0, 0.5, -1), k, T)],
  [E.comment, 'eve', RS, (k, T) => dolly(P(RS, 0.6, 2.0, 4.6), P(RS, 0.2, 2.0, 3.6), P(RS, -1.4, 1.8, -0.6), P(RS, -1.4, 1.9, -0.6), k, T)],
  [E.but, 'inside', BD, (k, T) => dolly(P(BD, 0, 2.2, 4.0), P(BD, 0, 2.2, 3.0), P(BD, 0, 2.2, -0.6), P(BD, 0, 2.3, -0.6), k, T)],
  [E.brain - 0.1, 'inside', BD, (k, T) => dolly(P(BD, 0.4, 2.4, 2.6), P(BD, 0.2, 2.4, 2.1), P(BD, 0, 2.4, -0.6), P(BD, 0, 2.4, -0.6), k, T)],
  [E.think, 'inside', BA, (k, T) => dolly(P(BA, 1.4, 2.6, 1.6), P(BA, 1.0, 2.8, 1.0), P(BA, 0.4, 2.8, -2.6), P(BA, 0.6, 3.0, -2.8), k, T)],
  [E.follow, 'inside', BA, (k, T) => dolly(P(BA, 0.0, 2.3, 1.6), P(BA, 0.2, 2.35, 2.6), P(BA, -1.6, 2.2, -1.6), P(BA, -1.6, 2.15, -1.6), k, T)],
  [E.loop, 'inside', BA, (k, T) => dolly(P(BA, 0.6, 2.4, 3.0), P(BA, 0.6, 2.4, 3.0), P(BA, -1.6, 2.1, -1.6), P(BA, -1.6, 2.1, -1.6), 0, 0)],
];
const shotAt = T => { let i = 0; for (let j = 0; j < SH.length; j++) if (T >= SH[j][0]) i = j; return i; };

function anim(T, si) { const ci = CLI(T), loop = T >= E.loop, Tt = loop ? 0 : T, cl = loop ? 0 : ci;
  PEOPLE.forEach(rest);
  // shower: water, steam, phone
  R.drops.forEach((d, i) => { const r = d.userData.r; const ph = (Tt * 2.2 + r[0]) % 1; d.position.set(-1.6 + (r[1] - 0.5) * 0.9, 3.2 - ph * 3.1, -1.6 + (r[2] - 0.5) * 0.9); });
  R.steam.forEach((s_, i) => { const ph = (Tt * 0.15 + i / 10) % 1; s_.position.set(-1.6 + S(i * 2.1) * 1.2, 1.8 + ph * 2.4, -1.6 + C(i * 1.7) * 0.8); s_.material.opacity = 0.22 * S(ph * PI); });
  const f = R.fShower; f.userData.armR.rotation.x = -1.35; f.userData.armR.rotation.z = 0.25; f.userData.head.rotation.x = 0.25; f.userData.armL.rotation.x = -0.2 - 0.25 * Math.abs(S(Tt * 3));
  setFace(f, cl === 6 && T > E.see - 0.1 ? 'shock' : (cl === 5 ? 'grin' : (talking(0, T) ? 'grin' : 'grin')));
  R.phS.userData.sc.material.color.set(cl === 6 && T > E.see - 0.2 ? '#ffffff' : '#7fd0ff');
  // bathroom clock: they think 2 minutes, reality spins
  const mins = cl === 5 ? 2 + 40 * prog(T, E.two - 0.2, E.follow) : 7; R.cM.rotation.z = -mins / 60 * 2 * PI; R.cH.rotation.z = -(7 + mins / 60) / 12 * 2 * PI;
  // shirts
  const fs = R.fShirt; const sw = Math.floor(T * 2.2) % 2; fs.userData.armL.rotation.x = -1.3 - (sw ? 0.3 : 0); fs.userData.armR.rotation.x = -1.3 - (sw ? 0 : 0.3); setFace(fs, cl === 1 ? (sw ? 'neutral' : 'tired') : cl === 4 ? (T > E.brain - 0.1 ? 'grin' : 'smile') : 'neutral');
  R.shL.material.color.set(['#e74c3c', '#9b59b6', '#f1c40f'][Math.floor(T * 1.5) % 3]); R.shR.material.color.set(['#2ecc71', '#3498db', '#ecf0f1'][Math.floor(T * 1.7) % 3]);
  R.shL.visible = R.shR.visible = cl === 1; if (cl === 4) { fs.userData.armL.rotation.x = 0; fs.userData.armR.rotation.x = 0; if (T > E.brain - 0.1) { fs.userData.armR.rotation.set(-2.4, 0, 0); } }
  R.flyShirts.forEach((m, i) => { const ph = (T * 1.3 + i / 5) % 1; if (cl !== 1) { m.position.y = -5; return; } m.position.set(-2.4 + ph * (4.2 + i * 0.2), 2.6 + S(ph * PI) * 1.2, -2.0); m.rotation.set(ph * 6, ph * 4, 0); });
  // next door: friend strolls 12 steps
  const kk = prog(T, E.door - 0.2, E.comment - 0.2); R.fWalk.position.set(lerp(2.5, -1.5, kk), 0, -0.3); R.fWalk.rotation.y = -PI / 2; if (kk > 0 && kk < 1) walk(R.fWalk, T * 7, 0.45); setFace(R.fWalk, 'grin');
  R.you.userData.legR.rotation.x = -0.25 * Math.max(0, S(T * 9)); R.you.userData.armL.rotation.set(-0.3, 0, 0.6); R.you.userData.armR.rotation.set(-0.3, 0, -0.6); setFace(R.you, kk > 0.9 ? 'shock' : 'angry');
  // restaurant: checking watch
  R.you2.userData.armL.rotation.x = -1.5; R.you2.userData.head.rotation.x = 0.3 * (S(T * 1.5) > 0 ? 1 : 0); setFace(R.you2, S(T * 1.5) > 0 ? 'tired' : 'sad'); R.you2.userData.legR.rotation.x = -0.2 * Math.max(0, S(T * 8));
}
function shot(T) { const si = shotAt(T), sh = SH[si], t0 = sh[0], t1 = si + 1 < SH.length ? SH[si + 1][0] : TM.total; camera.fov = 50; camera.updateProjectionMatrix(); mood(sh[1], sh[2]); anim(T, si); sh[3](prog(T, t0, t1), T);
  const cp = camera.position, v = new T3.Vector3(); PEOPLE.forEach(p => { const t_ = p.userData.tag; if (!t_) return; t_.getWorldPosition(v); const d = v.distanceTo(cp); t_.visible = d > 3.2 && d < 30; });
  return { si, t0 }; }
