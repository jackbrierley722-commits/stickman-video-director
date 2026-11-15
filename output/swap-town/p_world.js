
// ---------- sets ----------
const BK = [60, 0, -30], BR = [100, 0, 0], KT = [100, 0, 30], CR = [130, 0, 0], BS = [130, 0, 30], WD = [60, 0, 30], MR = [0, 0, -200], ST = [40, 0, -200], FB = [0, 0, 200];
const R = {}; const WINM = []; const ORBS = [];
const COLS = ['#e74c3c', '#f39c12', '#27ae60', '#8e44ad', '#16a085', '#d35400', '#2980b9', '#c0392b', '#f1c40f', '#1abc9c', '#e84393', '#6c5ce7'];
const SKINS = ['#f2c79b', '#e0a878', '#c68a5a', '#8d5a3a', '#ffd9b8', '#a8714a'];
const HAIRS = ['#2b1a10', '#5a3a1a', '#d9b45a', '#1a1a1a', '#a0522d', '#7a7a7a'];
function grp(at) { const g = new T3.Group(); g.position.set(at[0], at[1], at[2]); scene.add(g); return g; }
function townie(i, extra = {}) { const r = rng(100 + i); return person(Object.assign({ skin: SKINS[i % SKINS.length], top: COLS[i % COLS.length], bot: ['#2e3d66', '#3b3b3b', '#5a4632', '#24324a'][i % 4], hair: HAIRS[(i * 3) % HAIRS.length], style: ['short', 'long', 'spiky', 'bun', 'short'][i % 5], face: ['smile', 'grin', 'smile', 'neutral'][i % 4] }, extra)); }
function place(p, g, x, z, ry = 0) { p.position.set(x, 0, z); p.rotation.y = ry; g.add(p); return p; }
function tree(g, x, z, s = 1) { const t = new T3.Group(); t.position.set(x, 0, z); t.scale.setScalar(s); g.add(t); add(t, Bx(0.5, 2, 0.5), SM('#7a5230'), 0, 1, 0); const lm = SM('#3fa34d'); add(t, Bx(2.4, 1.6, 2.4), lm, 0, 2.6, 0); add(t, Bx(1.6, 1.0, 1.6), SM('#4cbf5a'), 0, 3.8, 0); return t; }
function house(g, x, z, ry, wall, roof, door = '#7a4a2a') { const h = new T3.Group(); h.position.set(x, 0, z); h.rotation.y = ry; g.add(h);
  add(h, Bx(6, 4.4, 6), SM(wall), 0, 2.2, 0); const rf = add(h, new T3.ConeGeometry(4.6, 2.6, 4), SM(roof), 0, 5.7, 0); rf.rotation.y = PI / 4;
  add(h, Bx(1.2, 2.2, 0.12), SM(door), 0, 1.1, 3.02); add(h, Bx(0.6, 0.6, 1.0), SM('#9a9a9a'), 1.9, 5.4, -1).position.y = 5.6;
  for (const wx of [-1.9, 1.9]) { const wm = SM('#9fd3ff', { emissive: '#ffcf6a', emissiveIntensity: 0 }); WINM.push(wm); add(h, Bx(1.1, 1.1, 0.1), wm, wx, 2.6, 3.02); add(h, Bx(1.3, 0.12, 0.16), SM('#ffffff'), wx, 2.0, 3.04); }
  return h; }
function texCanvas(w, h, f, rep) { const t = ctex(w, h, f); if (rep) { t.wrapS = t.wrapT = T3.RepeatWrapping; t.repeat.set(rep[0], rep[1]); } return t; }
function wallSet(g, w, h, d, col, floorCol, opts = {}) { add(g, Bx(w, 0.1, d), SM(floorCol), 0, 0.05, 0); add(g, Bx(w, h, 0.2), SM(col), 0, h / 2, -d / 2); add(g, Bx(0.2, h, d), SM(col), -w / 2, h / 2, 0); add(g, Bx(0.2, h, d), SM(col), w / 2, h / 2, 0); if (opts.ceil) add(g, Bx(w, 0.1, d), SM(opts.ceil), 0, h, 0); }
function clockFace(r, mirror = false, back = false, mpos = false) { return ctex(256, 256, (g) => { g.fillStyle = back ? 'rgba(255,240,200,0.9)' : '#fbf6ea'; g.beginPath(); g.arc(128, 128, 124, 0, 7); g.fill(); g.strokeStyle = '#3a2a1a'; g.lineWidth = 8; g.stroke(); g.fillStyle = '#3a2a1a'; g.font = '30px Russo'; g.textAlign = 'center'; g.textBaseline = 'middle';
  if (mirror) { g.translate(256, 0); g.scale(-1, 1); } for (let i = 1; i <= 12; i++) { const a = i / 12 * 2 * PI; const b_ = mpos ? a - PI / 2 : a; g.fillText(['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'][i - 1], 128 + S(b_) * 96, 128 - C(b_) * 96); } }); }

function build() {
  // lights
  hemi = new T3.HemisphereLight('#cfe9ff', '#7a9a5a', 1.2); scene.add(hemi); amb = new T3.AmbientLight('#ffffff', 0.25); scene.add(amb);
  sun = new T3.DirectionalLight('#fff4e0', 2.6); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); const sc = sun.shadow.camera; sc.left = -22; sc.right = 22; sc.top = 22; sc.bottom = -22; sc.near = 1; sc.far = 120; sun.shadow.bias = -0.0005; sun.shadow.normalBias = 0.03; scene.add(sun); scene.add(sun.target);
  // ground
  add(scene, Bx(1200, 0.2, 1200), SM('#6cbf4a'), 0, -0.1, 0, false);

  // ===== TOWN =====
  const TW = grp([0, 0, 0]); R.town = TW;
  const tiles = texCanvas(128, 128, (g) => { g.fillStyle = '#e3dccd'; g.fillRect(0, 0, 128, 128); g.strokeStyle = '#c9c0ad'; g.lineWidth = 3; for (let i = 0; i <= 128; i += 32) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 128); g.stroke(); g.beginPath(); g.moveTo(0, i); g.lineTo(128, i); g.stroke(); } }, [8, 8]);
  add(TW, Cy(12, 12, 0.08, 48), SM('#ffffff', { map: tiles }), 0, 0.04, 0);
  add(TW, Bx(120, 0.06, 6), SM('#55585e'), 0, 0.03, 17); for (let x = -58; x < 60; x += 4) add(TW, Bx(1.6, 0.07, 0.2), BM('#f2f2f2'), x, 0.04, 17, false);
  add(TW, Bx(6, 0.06, 60), SM('#55585e'), 0, 0.03, 50);
  // fountain
  add(TW, Cy(2.2, 2.4, 0.7, 24), SM('#cfc6b4'), 5.5, 0.35, 5); add(TW, Cy(1.9, 1.9, 0.1, 24), SM('#5ab4e6', { roughness: 0.2 }), 5.5, 0.68, 5); add(TW, Cy(0.3, 0.4, 1.6, 10), SM('#cfc6b4'), 5.5, 1.2, 5);
  // clock tower
  const TO = new T3.Group(); TO.position.set(0, 0, -6); TW.add(TO); R.tower = TO;
  const cream = SM('#efe2c4'), trim = SM('#b8946a');
  add(TO, Bx(5, 12, 5), cream, 0, 6, 0); for (const y of [0.3, 4.5, 12]) add(TO, Bx(5.4, 0.5, 5.4), trim, 0, y, 0);
  add(TO, Bx(4.4, 3.2, 4.4), cream, 0, 13.8, 0); add(TO, Bx(4.8, 0.4, 4.8), trim, 0, 15.5, 0); const rf = add(TO, new T3.ConeGeometry(3.7, 4.4, 4), SM('#2f7f86'), 0, 17.9, 0); rf.rotation.y = PI / 4;
  add(TO, Cy(0.08, 0.08, 1.4, 6), SM('#d4af37', { metalness: 0.6, roughness: 0.3 }), 0, 20.6, 0);
  const cf = add(TO, Cy(1.8, 1.8, 0.2, 40), [SM('#3a2a1a'), new T3.MeshStandardMaterial({ map: clockFace(1.8, false, false, true), roughness: 0.6 }), SM('#3a2a1a')], 0, 9.2, 2.55); cf.rotation.x = PI / 2;
  add(TO, new T3.TorusGeometry(1.85, 0.12, 8, 40), trim, 0, 9.2, 2.6);
  R.hH = new T3.Group(); R.hH.position.set(0, 9.2, 2.7); TO.add(R.hH); add(R.hH, Bx(0.16, 0.95, 0.05), SM('#1a1a1a'), 0, 0.42, 0);
  R.hM = new T3.Group(); R.hM.position.set(0, 9.2, 2.74); TO.add(R.hM); add(R.hM, Bx(0.1, 1.45, 0.05), SM('#1a1a1a'), 0, 0.66, 0);
  R.tDoor = new T3.Group(); R.tDoor.position.set(-0.9, 0, 2.56); TO.add(R.tDoor); add(R.tDoor, Bx(1.8, 3.0, 0.15), SM('#6b3f22'), 0.9, 1.5, 0); add(R.tDoor, Bx(0.12, 0.12, 0.12), SM('#d4af37'), 1.5, 1.5, 0.12);
  add(TO, Bx(2.2, 3.4, 0.1), SM('#2a1a10'), 0, 1.6, 2.52);
  for (const x of [-1.4, 1.4]) { const wm = SM('#3a4a5a', { emissive: '#ffcf6a', emissiveIntensity: 0 }); WINM.push(wm); add(TO, Bx(0.7, 1.4, 0.1), wm, x, 6.6, 2.52); }
  R.towerGlow = glow(TO, '#7fe8ff', 6, 0, 13.8, 2.3, 0);
  // houses + trees + lamps
  const HS = [[-21, -2, PI / 2, '#ffd6a5', '#c0392b'], [21, -2, -PI / 2, '#caffbf', '#2c3e50'], [-15, -19, PI / 4, '#a0c4ff', '#8e44ad'], [15, -19, -PI / 4, '#ffadad', '#16a085'], [-26, 26, PI, '#fdffb6', '#d35400'], [-13, 26, PI, '#bdb2ff', '#c0392b'], [13, 26, PI, '#ffc6ff', '#2c3e50'], [26, 26, PI, '#9bf6ff', '#8e44ad'], [-30, 9, PI / 2, '#ffd6a5', '#16a085'], [30, 9, -PI / 2, '#a0c4ff', '#d35400'], [-28, -14, PI / 2, '#caffbf', '#c0392b'], [28, -14, -PI / 2, '#fdffb6', '#2c3e50']];
  R.houses = HS.map(h => house(TW, h[0], h[1], h[2], h[3], h[4]));
  [[-9, -12], [9, -12], [-17, 8], [17, 8], [-7, 22], [7, 22], [-34, 0], [34, 0], [-20, -28], [20, -28], [0, -26], [-38, 20], [38, 20]].forEach(([x, z], i) => tree(TW, x, z, 0.9 + (i % 3) * 0.15));
  for (let i = 0; i < 8; i++) { const a = i / 8 * 2 * PI + 0.2; const x = S(a) * 11.5, z = C(a) * 11.5; if (Math.abs(x) < 2 && z < 0) continue; add(TW, Cy(0.08, 0.1, 3, 6), SM('#2a2a2a'), x, 1.5, z); const lm = SM('#fff6d0', { emissive: '#ffd27a', emissiveIntensity: 0 }); WINM.push(lm); add(TW, Bx(0.4, 0.5, 0.4), lm, x, 3.2, z); }
  // benches
  for (const [x, z, r] of [[-7, 3, 0.5], [-4, 8, 0.2], [8, -2, -0.6]]) { const b = new T3.Group(); b.position.set(x, 0, z); b.rotation.y = r; TW.add(b); add(b, Bx(2, 0.12, 0.6), SM('#8a5a32'), 0, 0.55, 0); add(b, Bx(2, 0.5, 0.1), SM('#8a5a32'), 0, 0.85, -0.28); add(b, Bx(0.1, 0.55, 0.5), SM('#333'), -0.9, 0.27, 0); add(b, Bx(0.1, 0.55, 0.5), SM('#333'), 0.9, 0.27, 0); }
  // podium
  R.podium = new T3.Group(); R.podium.position.set(-3, 0, 6); TW.add(R.podium); add(R.podium, Bx(1.6, 1.3, 1.0), SM('#2c5aa0'), 0, 0.65, 0); add(R.podium, Bx(1.7, 0.1, 1.1), SM('#d4af37'), 0, 1.32, 0); add(R.podium, Bx(1.4, 0.5, 0.05), BM('#ffffff', { map: ctex(256, 96, g => { g.fillStyle = '#2c5aa0'; g.fillRect(0, 0, 256, 96); g.fillStyle = '#ffd34a'; g.font = '44px Russo'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('MAYOR', 128, 50); }) }), 0, 0.85, 0.52, false);
  // townsfolk
  R.folk = []; const FP = [[-5, 1], [-2.5, 3.5], [2, 2.5], [-6.5, -1.5], [6.5, 0], [-1, 7], [3, 8.5], [-8, 6], [8, 7.5], [-3.5, -2], [4, -3], [2.5, 10.5]];
  FP.forEach(([x, z], i) => { const p = townie(i); place(p, TW, x, z, Math.atan2(-x, 6 - z) + 0.4 * S(i)); R.folk.push(p); });
  const TAGS = ['DAD', 'MUM', 'BAKER', 'TEACHER', 'POSTMAN', 'GRANDMA', 'LEO', 'MAYOR', 'BABY', 'VET', 'NAN', 'BOB'];
  R.folk.forEach((p, i) => tag(p, TAGS[i], '#ffffff'));
  R.hale = person({ skin: '#e8b88f', top: '#6b4a2e', bot: '#3a2e24', hair: '#e8e8e8', style: 'bald', extras: ['mustache', 'coat'], face: 'neutral' }); place(R.hale, TW, 0, -2.4, 0); tag(R.hale, 'MR. HALE', '#ffd34a'); R.haleRing = glow(TW, '#ffd34a', 4, 0, 1.6, -2.4, 0);
  R.mayor = person({ s: 0.62, kid: true, big: true, skin: '#ffd9b8', top: '#e84393', bot: '#e84393', dress: true, hair: '#d9b45a', style: 'long', extras: ['sash'], face: 'neutral' }); place(R.mayor, TW, -3, 6.9, 0); R.mayor.position.y = 0; tag(R.mayor, 'MAYOR', '#ffd34a');
  R.patrol = [0, 1].map(i => { const p = person({ skin: SKINS[i + 2], top: '#5b2c8a', bot: '#2a1a3a', style: 'none', extras: ['helmet'], face: 'angry' }); place(p, TW, 0, 0, 0); return p; });
  R.leoT = person({ s: 0.78, kid: true, skin: '#ffd9b8', top: '#d63031', bot: '#2d3436', hair: '#e0b44a', style: 'spiky', face: 'shock' }); place(R.leoT, TW, 0, 0, 0); tag(R.leoT, 'LEO', '#ffb0a0');
  R.meT = person({ s: 0.78, kid: true, skin: '#e0a878', top: '#2a6fdb', bot: '#2d3436', hair: '#3a2410', style: 'short', face: 'neutral' }); place(R.meT, TW, 0, 0, 0); tag(R.meT, 'ME', '#9ad0ff');
  // swap orbs
  for (let i = 0; i < 12; i++) { const col = ['#19c3ff', '#ff4fd8', '#ffb300'][i % 3]; const o = glow(TW, col, 1.5, 0, -50, 0, 0); o.material.blending = T3.NormalBlending; o.userData.core = glow(TW, '#ffffff', 0.5, 0, -50, 0, 0); o.userData.trail = [0, 1, 2, 3].map(j => { const t_ = glow(TW, col, 1.1 - j * 0.2, 0, -50, 0, 0); t_.material.blending = T3.NormalBlending; return t_; }); ORBS.push(o); }
  // night wire network from the tower to every house
  R.net = new T3.Group(); TW.add(R.net); const nm = new T3.LineBasicMaterial({ color: '#7fe8ff', transparent: true, opacity: 0.9, blending: T3.AdditiveBlending });
  R.houses.forEach(h => { const a = new T3.Vector3(0, 14, -6), b = h.position.clone().setY(5.2), m = a.clone().lerp(b, 0.5).setY(16); const cv = new T3.QuadraticBezierCurve3(a, m, b); R.net.add(new T3.Line(new T3.BufferGeometry().setFromPoints(cv.getPoints(30)), nm)); });
  R.net.visible = false;

  // ===== BAKERY =====
  const BKG = grp(BK); R.bakery = BKG;
  wallSet(BKG, 9, 5, 7, '#ffd1dc', '#c99a6a');
  const shelf = SM('#a0703a'); for (const y of [1.6, 2.6, 3.6]) { add(BKG, Bx(7, 0.12, 0.6), shelf, 0, y, -3.1); for (let x = -3.2; x < 3.4; x += 0.7) add(BKG, Sp(0.28, 10, 8), SM('#d89a4a'), x, y + 0.24, -3.1).scale.set(1.2, 0.8, 0.8); }
  add(BKG, Bx(5.4, 0.9, 1.0), SM('#ffffff', { map: ctex(256, 64, g => { g.fillStyle = '#ff6f91'; g.fillRect(0, 0, 256, 64); g.fillStyle = '#fff'; g.font = '42px Russo'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('BAKERY', 128, 34); }) }), 0, 4.4, -3.25);
  add(BKG, Bx(6, 1.1, 1.2), SM('#ffffff'), 0, 0.55, 1.2); add(BKG, Bx(6.2, 0.12, 1.4), SM('#8a5a32'), 0, 1.14, 1.2);
  R.crois = new T3.Group(); R.crois.position.set(0, 1.2, 1.2); BKG.add(R.crois); const cm = SM('#e8a33a', { roughness: 0.55 }); const cg = new T3.TorusGeometry(0.17, 0.12, 7, 10, PI * 1.1); const rc = rng(5);
  for (let i = 0; i < 160; i++) { const lvl = Math.floor(Math.sqrt(i) * 0.75); const a = rc() * 2 * PI, r = (2.4 - lvl * 0.3) * Math.sqrt(rc()); const m = add(R.crois, cg, cm, C(a) * r * 1.1, lvl * 0.15 + 0.08, S(a) * r * 0.35); m.rotation.set(PI / 2 + (rc() - 0.5), rc() * 6, 0); m.userData.i = i; }
  R.bakerDad = person({ skin: '#c68a5a', top: '#ffffff', bot: '#ffffff', hair: '#2b1a10', style: 'short', extras: ['chef'], face: 'grin' }); place(R.bakerDad, BKG, 0.4, -0.2, 0); tag(R.bakerDad, 'DAD', '#ffffff');
  R.toast = new T3.Group(); R.toast.position.set(0, 1.25, 0.3); BKG.add(R.toast); add(R.toast, Bx(0.55, 0.6, 0.08), SM('#1a1410', { roughness: 1 }), 0, 0, 0); R.smoke = []; for (let i = 0; i < 8; i++) R.smoke.push(add(R.toast, Sp(0.18, 8, 6), SM('#555555', { transparent: true, opacity: 0.6 }), 0, 0.5, 0, false));
  R.toaster = add(BKG, Bx(0.9, 0.6, 0.5), SM('#c0c6cc', { metalness: 0.6, roughness: 0.3 }), -2.2, 1.5, 1.2);

  // ===== BEDROOM =====
  const BRG = grp(BR); R.bedroom = BRG; wallSet(BRG, 7, 4, 6, '#b5e3ff', '#d9b58a');
  R.bwin = add(BRG, Bx(1.8, 1.5, 0.1), SM('#bfe6ff', { emissive: '#ffffff', emissiveIntensity: 0.6 }), 1.6, 2.4, -2.9); add(BRG, Bx(2.0, 0.12, 0.2), SM('#fff'), 1.6, 1.6, -2.85);
  add(BRG, Bx(2.4, 0.5, 3.6), SM('#8a5a32'), -1.4, 0.35, -1.1); add(BRG, Bx(2.2, 0.3, 3.4), SM('#ffffff'), -1.4, 0.75, -1.1); R.blanket = add(BRG, Bx(2.3, 0.42, 2.4), SM('#ff7675'), -1.4, 1.1, -0.45); add(BRG, Bx(1.2, 0.25, 0.6), SM('#ffffff'), -1.4, 1.0, -2.5); add(BRG, Bx(2.4, 1.4, 0.2), SM('#8a5a32'), -1.4, 0.9, -2.95);
  add(BRG, Bx(0.8, 0.8, 0.7), SM('#a0703a'), 0.6, 0.4, -2.4);
  R.alarmTex = ctex(128, 64, g => { g.fillStyle = '#111'; g.fillRect(0, 0, 128, 64); g.fillStyle = '#ff3b30'; g.font = '40px Russo'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('7.00', 64, 34); });
  R.alarm = new T3.Group(); R.alarm.position.set(0.6, 1.0, -2.3); BRG.add(R.alarm); add(R.alarm, Bx(0.5, 0.3, 0.2), SM('#e74c3c'), 0, 0, 0); add(R.alarm, new T3.PlaneGeometry(0.42, 0.21), BM('#ffffff', { map: R.alarmTex }), 0, 0, 0.101, false);
  R.youGran = person({ skin: '#ffd9b8', top: '#c39bd3', bot: '#6c5ce7', hair: '#dddddd', style: 'bun', extras: ['glasses'], face: 'sleep' }); place(R.youGran, BRG, -1.4, -1.6, 0); tag(R.youGran, 'YOU', '#9ad0ff');
  R.meDad = person({ skin: '#c68a5a', top: '#27ae60', bot: '#2e3d66', hair: '#2b1a10', style: 'short', extras: ['beard'], face: 'tired' }); place(R.meDad, BRG, -1.4, -1.6, 0); tag(R.meDad, 'ME', '#9ad0ff');

  // ===== KITCHEN =====
  const KTG = grp(KT); R.kitchen = KTG; wallSet(KTG, 8, 4, 6, '#fff3b0', '#ffffff');
  const kc = SM('#5dade2'); add(KTG, Bx(5, 1.0, 0.8), kc, -1, 0.5, -2.6); add(KTG, Bx(5, 0.1, 0.9), SM('#ecf0f1'), -1, 1.05, -2.6); add(KTG, Bx(1.2, 2.6, 0.9), SM('#ecf0f1'), 3, 1.3, -2.5); add(KTG, Bx(5, 0.8, 0.5), kc, -1, 3.0, -2.75);
  add(KTG, Cy(1.0, 1.0, 0.1, 16), SM('#a0703a'), 0.5, 1.0, 0); add(KTG, Cy(0.12, 0.12, 1.0, 8), SM('#a0703a'), 0.5, 0.5, 0);
  R.mumBig = person({ s: 1.12, skin: '#e0a878', top: '#e67e22', bot: '#2e3d66', hair: '#3a2410', style: 'short', extras: ['beard'], face: 'neutral' }); place(R.mumBig, KTG, -0.6, -1.0, 0); tag(R.mumBig, 'MUM', '#ffb6e1');
  R.kDad = person({ skin: '#c68a5a', top: '#27ae60', bot: '#2e3d66', hair: '#2b1a10', style: 'short', extras: ['beard'], face: 'smile' }); place(R.kDad, KTG, -0.6, -1.0, 0.4); tag(R.kDad, 'DAD', '#ffffff');
  R.kMe = person({ s: 0.78, kid: true, skin: '#e0a878', top: '#2a6fdb', bot: '#2d3436', hair: '#3a2410', style: 'short', face: 'smile' }); place(R.kMe, KTG, 0.2, -0.4, -0.9); tag(R.kMe, 'ME', '#9ad0ff');

  // ===== CLASSROOM =====
  const CRG = grp(CR); R.class = CRG; wallSet(CRG, 10, 4.4, 8, '#d1f2eb', '#c99a6a');
  add(CRG, Bx(6, 2.2, 0.1), SM('#ffffff', { map: ctex(512, 192, g => { g.fillStyle = '#2d5a3d'; g.fillRect(0, 0, 512, 192); g.strokeStyle = '#8a5a32'; g.lineWidth = 14; g.strokeRect(0, 0, 512, 192); g.fillStyle = '#f4f4f4'; g.font = '52px Russo'; g.textAlign = 'center'; g.fillText('HOMEWORK', 256, 80); g.font = '38px Russo'; g.fillText('PAGE 40 TO 95', 256, 140); }) }), 0, 2.5, -3.85);
  add(CRG, Bx(2.6, 1.0, 1.2), SM('#a0703a'), 0, 0.5, -2.2);
  R.babyT = person({ s: 0.48, kid: true, big: true, skin: '#ffd9b8', top: '#ffffff', bot: '#ffffff', hair: '#d9b45a', style: 'none', extras: ['glasses', 'tie'], face: 'baby' }); place(R.babyT, CRG, 0, -2.2, 0); R.babyT.position.y = 1.0; tag(R.babyT, 'TEACHER', '#ffffff');
  R.kids = []; [[-3.0, 0.6], [3.0, 0.6], [-1.8, 2.8], [1.8, 2.8]].forEach(([x, z], i) => { add(CRG, Bx(1.2, 0.7, 0.8), SM('#e1b382'), x, 0.75, z - 0.6); add(CRG, Bx(1.25, 0.06, 0.85), SM('#a0703a'), x, 1.1, z - 0.6); add(CRG, Bx(0.7, 0.42, 0.6), SM('#5a6a7a'), x, 0.21, z); const k = townie(20 + i, { s: 0.78, kid: true }); place(k, CRG, x, z, PI); sitP(k); k.position.y = 0.42 - 0.55; R.kids.push(k); });

  // ===== WEDDING =====
  const WDG = grp(WD); R.wed = WDG; add(WDG, Bx(1.6, 0.04, 14), SM('#c0392b'), 0, 0.03, 3);
  const arch = new T3.Group(); arch.position.set(0, 0, -2); WDG.add(arch); add(arch, Cy(0.12, 0.12, 3.2, 8), SM('#ffffff'), -1.8, 1.6, 0); add(arch, Cy(0.12, 0.12, 3.2, 8), SM('#ffffff'), 1.8, 1.6, 0); const at = add(arch, new T3.TorusGeometry(1.8, 0.14, 8, 24, PI), SM('#ffffff'), 0, 3.2, 0);
  const fr = rng(8); for (let i = 0; i < 26; i++) { const a = i / 25 * PI; add(arch, Sp(0.22, 8, 6), SM(['#ff9ff3', '#ffffff', '#feca57'][i % 3]), C(a) * 1.8 + (fr() - 0.5) * 0.2, 3.2 + S(a) * 1.8, (fr() - 0.5) * 0.3); }
  tree(WDG, -6, -5, 1.2); tree(WDG, 6, -6, 1.1); house(WDG, 0, -14, 0, '#ffffff', '#c0392b');
  for (let r = 0; r < 3; r++) for (const sd of [-1, 1]) for (let c = 0; c < 2; c++) { const x = sd * (1.6 + c * 1.1), z = 3 + r * 1.6; add(WDG, Bx(0.8, 0.5, 0.7), SM('#ffffff'), x, 0.5, z); if ((r + c) % 2 === 0) { const g_ = townie(40 + r * 4 + c + (sd > 0 ? 2 : 0)); place(g_, WDG, x, z - 0.1, PI); sitP(g_); g_.position.y = -0.15; } }
  R.bride = person({ skin: '#ffd9b8', top: '#ffffff', bot: '#ffffff', dress: true, hair: '#a0522d', style: 'long', extras: ['veil'], face: 'grin' }); place(R.bride, WDG, 0.7, -1.2, -0.3); tag(R.bride, 'WIFE', '#ffb6e1');
  R.groom = person({ skin: '#e0a878', top: '#222222', bot: '#222222', hair: '#2b1a10', style: 'short', extras: ['tie'], face: 'grin' }); place(R.groom, WDG, -0.7, -1.2, 0.3); tag(R.groom, 'HUSBAND', '#ffffff');
  R.postBride = person({ skin: '#a8714a', top: '#1d3f8a', bot: '#1d3f8a', hair: '#1a1a1a', style: 'short', extras: ['veil', 'bag', 'mustache'], face: 'grin' }); place(R.postBride, WDG, 0.7, -1.2, -0.3); tag(R.postBride, 'WIFE', '#ffb6e1');

  // ===== BASEMENT =====
  const BSG = grp(BS); R.base = BSG; wallSet(BSG, 7, 3.4, 6, '#6b6f75', '#4a4d52', { ceil: '#55585e' });
  for (const [x, z, s] of [[-2.4, -2, 1], [-1.6, -2.2, 0.7], [2.4, -1.8, 1.1], [2.6, -0.6, 0.6]]) add(BSG, Bx(s, s, s), SM('#9a7a4a'), x, s / 2, z);
  add(BSG, Bx(0.9, 0.7, 0.9), SM('#9a7a4a'), 0, 0.35, -0.6);
  R.bulb = add(BSG, Sp(0.12, 10, 8), BM('#fff2b0'), 0.6, 2.7, 0.2, false); add(BSG, Cy(0.01, 0.01, 0.7, 4), BM('#222'), 0.6, 3.05, 0.2, false); R.bulbL = new T3.PointLight('#ffcf80', 0, 9, 1.6); R.bulbL.position.set(0.6, 2.6, 0.2); BSG.add(R.bulbL); R.bulbG = glow(BSG, '#ffcf80', 1.6, 0.6, 2.7, 0.2, 0.5);
  R.leoB = person({ s: 0.78, kid: true, skin: '#ffd9b8', top: '#d63031', bot: '#2d3436', hair: '#e0b44a', style: 'spiky', face: 'wide' }); place(R.leoB, BSG, 0, -0.6, 0); sitP(R.leoB); R.leoB.position.y = 0.16; tag(R.leoB, 'LEO', '#ffb0a0');
  R.bOrb = glow(BSG, '#7fe8ff', 1.4, 0, -50, 0, 0);

  // ===== STAIRS =====
  const STG = grp(ST); R.stairs = STG; add(STG, Cy(3.4, 3.4, 30, 20, 1, true), SM('#8a7a66', { side: T3.BackSide }), 0, 15, 0);
  for (let i = 0; i < 70; i++) { const a = i * 0.32, y = i * 0.32; const st = add(STG, Bx(2.2, 0.16, 0.8), SM('#a08a6a'), C(a) * 2.2, y, S(a) * 2.2); st.rotation.y = -a; }
  add(STG, Cy(0.5, 0.5, 30, 10), SM('#a08a6a'), 0, 15, 0);
  for (let i = 0; i < 5; i++) { const sl = add(STG, Bx(0.3, 1.2, 0.2), BM('#9fc4ff'), C(i * 1.7) * 3.35, 3 + i * 4.5, S(i * 1.7) * 3.35, false); sl.lookAt(ST[0], 3 + i * 4.5, ST[2]); }
  R.meS = person({ s: 0.78, kid: true, skin: '#e0a878', top: '#2a6fdb', bot: '#2d3436', hair: '#3a2410', style: 'short', face: 'neutral' }); STG.add(R.meS); tag(R.meS, 'ME', '#9ad0ff');
  R.stairL = new T3.PointLight('#9fc4ff', 0, 14, 1.5); STG.add(R.stairL);

  // ===== MACHINE ROOM (inside the clock face) =====
  const MRG = grp(MR); R.mach = MRG; wallSet(MRG, 14, 9, 12, '#5a4636', '#4a3628', { ceil: '#3a2a1e' });
  R.backFace = add(MRG, Cy(3.6, 3.6, 0.1, 48), [SM('#3a2a1a'), new T3.MeshStandardMaterial({ map: clockFace(3.6, true, true), emissive: '#ffe6a8', emissiveIntensity: 0.9, emissiveMap: clockFace(3.6, true, true) }), SM('#3a2a1a')], 0, 4.6, -5.85, false); R.backFace.rotation.x = PI / 2;
  add(MRG, new T3.TorusGeometry(3.65, 0.2, 8, 48), SM('#7a5a32', { metalness: 0.5 }), 0, 4.6, -5.8);
  R.mHands = new T3.Group(); R.mHands.position.set(0, 4.6, -5.7); MRG.add(R.mHands); add(R.mHands, Bx(0.2, 2.6, 0.06), BM('#1a1208'), 0, 1.1, 0, false);
  R.faceL = new T3.PointLight('#ffe0a0', 30, 18, 1.4); R.faceL.position.set(0, 4.6, -4.5); MRG.add(R.faceL); R.fillL = new T3.PointLight('#9fd8ff', 14, 12, 1.5); R.fillL.position.set(0.5, 3.2, 3.5); MRG.add(R.fillL);
  const brass = SM('#c9a24a', { metalness: 0.7, roughness: 0.35 }), iron = SM('#3a3a40', { metalness: 0.6, roughness: 0.5 });
  R.gears = []; for (const [x, y, z, r, ry] of [[-5.2, 5.5, -5.6, 1.6, 0], [-4.2, 2.6, -5.6, 1.0, 0], [5.0, 5.8, -5.6, 1.3, 0], [5.6, 2.8, -5.6, 1.1, 0], [-6.8, 4, -1, 1.4, PI / 2], [6.8, 4, -1, 1.4, -PI / 2]]) { const gg = new T3.Group(); gg.position.set(x, y, z); gg.rotation.y = ry; MRG.add(gg); const inner = new T3.Group(); gg.add(inner); add(inner, Cy(r, r, 0.25, 24), brass, 0, 0, 0).rotation.x = PI / 2; for (let t = 0; t < 12; t++) { const a = t / 12 * 2 * PI; const tt = add(inner, Bx(0.25, 0.4, 0.25), brass, C(a) * (r + 0.15), S(a) * (r + 0.15), 0); tt.rotation.z = a + PI / 2; } add(inner, Cy(0.25, 0.25, 0.4, 10), iron, 0, 0, 0).rotation.x = PI / 2; inner.userData.r = r; R.gears.push(inner); }
  // machine body behind the chair
  add(MRG, Bx(4.4, 2.6, 1.4), iron, 0, 1.3, -3.6); for (let i = 0; i < 6; i++) { const lm = SM('#330000', { emissive: ['#ff3b30', '#2ecc71', '#f1c40f'][i % 3], emissiveIntensity: 0.4 }); add(MRG, Sp(0.12, 8, 6), lm, -1.5 + i * 0.6, 2.2, -2.88); WINM.push(lm); }
  for (let i = 0; i < 3; i++) { const d = add(MRG, Cy(0.35, 0.35, 0.08, 20), SM('#f4f0e0'), -1.2 + i * 1.2, 1.3, -2.86); d.rotation.x = PI / 2; }
  // chair
  R.chair = new T3.Group(); R.chair.position.set(0, 0, -0.6); MRG.add(R.chair); const wd = SM('#6b3f22'); add(R.chair, Bx(1.3, 0.2, 1.2), wd, 0, 0.9, 0); add(R.chair, Bx(1.3, 1.9, 0.2), wd, 0, 1.85, -0.55); for (const x of [-0.55, 0.55]) for (const z of [-0.5, 0.5]) add(R.chair, Bx(0.15, 0.9, 0.15), wd, x, 0.45, z); add(R.chair, Bx(0.18, 0.15, 1.1), wd, -0.62, 1.35, 0); add(R.chair, Bx(0.18, 0.15, 1.1), wd, 0.62, 1.35, 0);
  R.crown = new T3.Group(); R.crown.position.set(0, 3.3, -0.15); R.chair.add(R.crown); add(R.crown, new T3.TorusGeometry(0.45, 0.08, 8, 20), brass, 0, 0, 0).rotation.x = PI / 2; add(R.crown, Cy(0.08, 0.08, 0.8, 8), brass, 0, 0.4, -0.35);
  R.crownG = glow(R.crown, '#7fe8ff', 2.4, 0, 0, 0, 0);
  R.straps = [add(R.chair, Bx(0.3, 0.08, 0.3), SM('#2a1a10'), -0.62, 1.48, 0.1), add(R.chair, Bx(0.3, 0.08, 0.3), SM('#2a1a10'), 0.62, 1.48, 0.1)];
  // wires from the crown out to the walls
  R.wires = []; R.wireM = new T3.MeshStandardMaterial({ color: '#202428', emissive: '#4fd8ff', emissiveIntensity: 0.15, roughness: 0.4 }); const wr = rng(12);
  for (let i = 0; i < 26; i++) { const a = -PI * 0.95 + i / 25 * PI * 1.9; const end = new T3.Vector3(S(a) * 6.9, 2.5 + wr() * 6, C(a) * -5.9 + 2); if (Math.abs(end.x) > 6.8) end.x = Math.sign(end.x) * 6.9; const st = new T3.Vector3((wr() - 0.5) * 0.3, 3.7, -0.8), up = new T3.Vector3(st.x * 4, 8.6, -0.8 + (wr() - 0.5) * 2), m2 = new T3.Vector3(end.x * 0.8, 8.8, end.z * 0.8); const tb = add(MRG, new T3.TubeGeometry(new T3.CatmullRomCurve3([st, up, m2, end]), 40, 0.018 + wr() * 0.018, 5), R.wireM, 0, 0, 0, false); R.wires.push(tb); }
  R.hale2 = person({ skin: '#e8b88f', top: '#6b4a2e', bot: '#3a2e24', hair: '#e8e8e8', style: 'bald', extras: ['mustache', 'coat'], face: 'neutral' }); place(R.hale2, MRG, 2.6, 1.0, -0.5); tag(R.hale2, 'MR. HALE', '#ffd34a');
  R.youngHale = person({ skin: '#e8b88f', top: '#6b4a2e', bot: '#3a2e24', hair: '#4a2e1a', style: 'short', extras: ['coat'], face: 'smile' }); place(R.youngHale, MRG, 1.6, 0.6, -0.6); tag(R.youngHale, 'YOUNG HALE', '#ffd34a');
  R.leoC = person({ s: 0.78, kid: true, skin: '#ffd9b8', top: '#d63031', bot: '#2d3436', hair: '#e0b44a', style: 'spiky', face: 'wide' }); place(R.leoC, MRG, 0, -0.45, 0); sitP(R.leoC); R.leoC.position.y = 0.45; tag(R.leoC, 'LEO', '#ffb0a0');
  R.meM = person({ s: 0.78, kid: true, skin: '#e0a878', top: '#2a6fdb', bot: '#2d3436', hair: '#3a2410', style: 'short', face: 'neutral' }); place(R.meM, MRG, -1.6, 1.4, 0.5); tag(R.meM, 'ME', '#9ad0ff');
  R.plug = new T3.Group(); R.plug.position.set(-2.6, 0, -2.8); MRG.add(R.plug); add(R.plug, Bx(0.8, 1.6, 0.5), iron, 0, 0.8, 0); R.lever = new T3.Group(); R.lever.position.set(0, 1.3, 0.3); R.plug.add(R.lever); add(R.lever, Bx(0.1, 0.9, 0.1), SM('#c0392b'), 0, 0.45, 0); add(R.lever, Sp(0.12, 8, 6), SM('#111'), 0, 0.9, 0);
  R.mOrbs = []; for (let i = 0; i < 8; i++) R.mOrbs.push(glow(MRG, '#7fe8ff', 0.7, 0, -50, 0, 0));

  // ===== FLASHBACK: the wall =====
  const FBG = grp(FB); R.fb = FBG; R.fbWall = add(FBG, Bx(0.9, 4.5, 60), SM('#8a8a8a', { map: texCanvas(64, 64, g => { g.fillStyle = '#8f8f8f'; g.fillRect(0, 0, 64, 64); g.fillStyle = '#7a7a7a'; for (let y = 0; y < 64; y += 16) for (let x = (y / 16) % 2 * 16; x < 64; x += 32) g.fillRect(x + 1, y + 1, 30, 14); }, [30, 2]) }), 0, 2.25, 0);
  [[-14, -10, PI / 2, '#ffd6a5'], [-14, 4, PI / 2, '#a0c4ff'], [14, -10, -PI / 2, '#caffbf'], [14, 4, -PI / 2, '#ffadad'], [-9, -20, 0, '#fdffb6'], [9, -20, 0, '#bdb2ff']].forEach(h => house(FBG, h[0], h[1], h[2], h[3], '#7a5a4a'));
  R.angry = []; [[-2.2, 2], [-3.6, 0], [-2.8, -2.4], [2.2, 2.2], [3.4, -0.2], [2.6, -2.6]].forEach(([x, z], i) => { const p = townie(60 + i, { face: 'shout' }); place(p, FBG, x, z, x < 0 ? PI / 2 : -PI / 2); R.angry.push(p); });
  R.hugA = townie(70, { face: 'smile' }); place(R.hugA, FBG, -0.45, 6, PI / 2); R.hugB = townie(71, { face: 'smile' }); place(R.hugB, FBG, 0.45, 6, -PI / 2);
}
