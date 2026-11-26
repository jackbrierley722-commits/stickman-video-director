// What it feels like to be hit by a car — low-poly, non-graphic road safety explainer.
(() => {
const { T3, RW, RH, W, H, clamp, lerp, ease, prog, rng, makeTextures, TX, mat, box, cyl, sph, person, run, idle } = window.W3;
const TM = window.TIMING, CL = TM.clips;
const S = Math.sin, C = Math.cos;
const AT = (ci, w, n = 0) => { let k = 0; for (const x of CL[ci].words) if (x.w.toLowerCase().replace(/[^a-z0-9']/g, '') === w) { if (k === n) return x.a; k++; } return CL[ci].start; };
let renderer, camera, scene, ped, car, phone, crack, brake = [];
function M(c) { return new T3.MeshLambertMaterial({ color: c, flatShading: true }); }
function B(w, h, d, c, x, y, z, p) { const o = new T3.Mesh(new T3.BoxGeometry(w, h, d), typeof c === 'string' ? M(c) : c); o.position.set(x, y, z); (p || scene).add(o); return o; }
function build() {
  scene.add(new T3.Mesh(new T3.SphereGeometry(200, 12, 8), new T3.MeshBasicMaterial({ color: '#a8c8e8', side: T3.BackSide, fog: false })));
  const road = new T3.Mesh(new T3.PlaneGeometry(120, 4.4), M('#3a3c42')); road.rotation.x = -Math.PI / 2; scene.add(road);
  for (let i = -30; i < 30; i++) B(1.4, 0.01, 0.12, '#f0f0e8', i * 2.4, 0.005, 0);
  B(120, 0.15, 3, '#b8b4ac', 0, 0.075, 3.7); B(120, 0.15, 3, '#b8b4ac', 0, 0.075, -3.7); B(120, 0.16, 0.15, '#d8d4cc', 0, 0.08, 2.2); B(120, 0.16, 0.15, '#d8d4cc', 0, 0.08, -2.2);
  for (const sz of [1, -1]) for (let i = -8; i < 8; i++) { const h = 3 + ((i * 7 + 13) % 4); const b = B(3.6, h, 3, ['#c88a6a', '#d8c8a8', '#9aa8b8', '#b87a5a'][(i + 8) % 4], i * 4, h / 2, sz * 7); for (let f = 0; f < Math.floor(h); f++) for (let k = 0; k < 3; k++) B(0.6, 0.5, 0.05, '#2a3a5a', i * 4 - 1.1 + k * 1.1, 0.8 + f, sz * 7 - sz * 1.53); }
  for (let i = -6; i < 6; i++) { B(0.08, 3, 0.08, '#5a5a62', i * 7, 1.5, 2.6); B(0.6, 0.1, 0.2, '#5a5a62', i * 7 - 0.25, 3, 2.5); }
  for (let i = -5; i < 5; i++) { const t = new T3.Group(); t.position.set(i * 7 + 3.5, 0.15, 3.0); scene.add(t); t.add(cyl(0.08, 0.1, 1.2, 5, '#5a3a22', 0, 0.6, 0)); const c = new T3.Mesh(new T3.IcosahedronGeometry(0.6, 0), M('#4a9a3a')); c.position.y = 1.5; t.add(c); }
  // the car (front faces +x)
  car = new T3.Group(); scene.add(car); const body = '#2a6ab8';
  B(4.0, 0.55, 1.8, body, 0, 0.5, 0, car); B(1.0, 0.25, 1.75, body, 1.45, 0.88, 0, car); B(2.0, 0.6, 1.6, body, -0.4, 1.08, 0, car);
  const ws = new T3.Mesh(new T3.PlaneGeometry(0.8, 1.55), new T3.MeshLambertMaterial({ color: '#8ab0d0', side: T3.DoubleSide })); ws.rotation.set(0, Math.PI / 2, 0); ws.rotation.z = 0; ws.position.set(0.72, 1.05, 0); ws.rotation.order = 'YXZ'; ws.rotation.x = -0.75; car.add(ws);
  crack = new T3.Mesh(new T3.PlaneGeometry(0.75, 1.4), new T3.MeshBasicMaterial({ map: (() => { const c = document.createElement('canvas'); c.width = 64; c.height = 64; const g = c.getContext('2d'); g.strokeStyle = '#ffffff'; g.lineWidth = 1.5; for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2; g.beginPath(); g.moveTo(30, 34); let x = 30, y = 34; for (let k = 0; k < 4; k++) { x += C(a + (k % 2 ? 0.3 : -0.3)) * 8; y += S(a) * 8; g.lineTo(x, y); } g.stroke(); } for (const r of [6, 12]) { g.beginPath(); g.arc(30, 34, r, 0, 7); g.stroke(); } const t = new T3.CanvasTexture(c); t.magFilter = t.minFilter = T3.NearestFilter; return t; })(), transparent: true, side: T3.DoubleSide })); crack.rotation.order = 'YXZ'; crack.rotation.set(-0.75, Math.PI / 2, 0); crack.position.set(0.74, 1.06, 0.2); car.add(crack);
  B(0.06, 0.12, 0.3, '#fff8d0', 2.02, 0.6, 0.6, car); B(0.06, 0.12, 0.3, '#fff8d0', 2.02, 0.6, -0.6, car); B(0.08, 0.14, 1.8, '#1a1a1e', 2.02, 0.32, 0, car);
  for (const [x, z] of [[1.3, 0.9], [1.3, -0.9], [-1.3, 0.9], [-1.3, -0.9]]) { const w = cyl(0.34, 0.34, 0.24, 10, '#1a1a1e', x, 0.34, z); w.rotation.x = Math.PI / 2; car.add(w); }
  for (let i = 0; i < 2; i++) { const s = B(0.3, 0.012, 0.22, '#1a1a1a', 0, 0.01, (i ? 0.9 : -0.9)); brake.push(s); }
  ped = person({ shirt: '#e8a030', trousers: '#2a3a5a', skin: '#e8b896', hair: '#3a2416', longSleeve: true }); scene.add(ped);
  phone = B(0.06, 0.12, 0.02, '#111', 0, 0, 0); const glow = B(0.05, 0.1, 0.005, new T3.MeshBasicMaterial({ color: '#7ad0ff' }), 0, 0, 0.012, phone);
  scene.add(new T3.HemisphereLight('#ffffff', '#6a6a70', 1.0)); const sun = new T3.DirectionalLight('#fff4dd', 0.9); sun.position.set(5, 10, 6); scene.add(sun);
}
// ---------- timeline ----------
const EV = { step: AT(1, 'step'), phone: AT(1, 'phone'), dont: AT(1, "don't"), brain: CL[2].start, spots: AT(2, 'spots'), adren: AT(2, 'adrenaline'), slow: AT(2, 'slow'), impact: AT(3, 'impact'), bumper: AT(3, 'bumper'), knee: AT(3, 'knee'),
  swept: AT(4, 'swept'), bonnet: AT(4, 'bonnet'), head: AT(4, 'head'), wind: AT(4, 'windscreen'), thrown: AT(5, 'thrown'), road: AT(5, 'road'), strange: CL[6].start, hurt: AT(6, 'hurt'), shock: AT(6, 'shock'), pain: AT(6, 'pain'),
  speed: CL[7].start, double: AT(7, 'double'), four: AT(7, 'four'), safe: CL[8].start, look: AT(8, 'look'), send: AT(8, 'send') };
const REW = [EV.safe, EV.safe + 1.0]; // rewind window
function sceneTime(T) { if (T < REW[0]) return T; if (T < REW[1]) return lerp(REW[0], 0.5, ease(prog(T, REW[0], REW[1]))); return -1; }
function carFront(t) { if (t < EV.brain) return lerp(-34, -7, prog(t, 0, EV.brain)); if (t < EV.impact) return lerp(-7, -0.35, prog(t, EV.brain, EV.impact)); if (t < EV.thrown) return lerp(-0.35, 1.4, prog(t, EV.impact, EV.thrown)); return lerp(1.4, 3.4, ease(prog(t, EV.thrown, EV.thrown + 1.8))); }
function pose(t, T) { pedReset(); const u = ped.userData; let x = 0, y = 0, z = 2.9, ry = Math.PI, rz = 0;
  if (t < EV.step) { z = 2.9; idle(ped, T); u.head.rotation.x = 0.5; u.armR.rotation.x = -1.4; u.armL.rotation.x = -1.2; }
  else if (t < EV.impact) { const k = prog(t, EV.step, EV.dont + 0.6); z = lerp(2.9, 0.55, k); y = z > 2.2 ? 0.15 : 0; if (k < 1) run(ped, T * 4, 0.35); else idle(ped, T); u.head.rotation.x = 0.5; u.armR.rotation.x = -1.4; u.armL.rotation.x = -1.2; if (t > EV.spots) { u.head.rotation.x = 0; u.head.rotation.y = lerp(0, 1.3, prog(t, EV.spots, EV.spots + 0.8)); u.armL.rotation.x = -2.2; u.armR.rotation.x = -0.4; } }
  else if (t < EV.thrown) { z = 0.55; const sw = ease(prog(t, EV.impact + 0.2, EV.swept + 0.4)), fold = ease(prog(t, EV.swept, EV.head)); const cf = carFront(t);
    x = Math.max(0, cf + 0.1); rz = lerp(0, 1.2, fold); y = lerp(0, 0.75, fold); u.legL.rotation.x = u.legR.rotation.x = 0; u.legL.rotation.z = u.legR.rotation.z = -0.7 * sw; ped.position.x = x; u.armL.rotation.z = -1.8; u.armR.rotation.z = 1.8; u.head.rotation.y = 1.0; }
  else { const k = prog(t, EV.thrown, EV.thrown + 1.4); const k2 = ease(k); x = lerp(carFront(EV.thrown) + 0.1, 5.2, k2); y = lerp(0.75, 0.18, k2) + S(k * Math.PI) * 1.1; rz = lerp(1.2, Math.PI / 2 + Math.PI * 2, k2); z = 0.55; u.armL.rotation.z = -1.2; u.armR.rotation.z = 1.2; if (k >= 1) { rz = Math.PI / 2; y = 0.2; u.body.scale.y = 1 + S(T * 2.4) * 0.01; } }
  ped.position.set(x, y, z); ped.rotation.set(0, ry, 0); ped.rotation.z = rz; ped.rotation.order = 'ZYX'; }
function pedReset() { const u = ped.userData; u.body.position.y = 0; u.body.rotation.set(0, 0, 0); u.body.scale.set(1, 1, 1); u.head.rotation.set(0, 0, 0); for (const k of ['armL', 'armR', 'legL', 'legR']) u[k].rotation.set(0, 0, 0); }
function cam(p, l) { camera.position.set(p[0], p[1], p[2]); camera.lookAt(l[0], l[1], l[2]); }
function camL(a, b, k, la, lb) { k = ease(k); cam([lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)], [lerp(la[0], lb[0], k), lerp(la[1], lb[1], k), lerp(la[2], lb[2], k)]); }

// ---------- HUD ----------
function bigText(ctx, txt, y, size, col = '#ffd23a', a = 1, font = 'Russo', x = 360) { if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.font = `${size}px ${font}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round'; ctx.lineWidth = size * 0.22; ctx.strokeStyle = '#05081a'; ctx.strokeText(txt, x, y); ctx.fillStyle = col; ctx.fillText(txt, x, y); ctx.restore(); }
function card(ctx, title, x, y, w, h, a) { ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = 'rgba(6,14,40,0.92)'; ctx.fillRect(x, y, w, h); ctx.strokeStyle = '#7ad0ff'; ctx.lineWidth = 4; ctx.strokeRect(x, y, w, h); ctx.fillStyle = '#ffd23a'; ctx.fillRect(x, y, w, 34); ctx.font = '16px PressStart'; ctx.fillStyle = '#06102a'; ctx.textBaseline = 'middle'; ctx.fillText(title, x + 14, y + 18); ctx.restore(); }
function txt(ctx, s, x, y, size, c, align = 'left', font = 'Russo') { ctx.font = `${size}px ${font}`; ctx.fillStyle = c; ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.fillText(s, x, y); ctx.textAlign = 'left'; }
const V = new T3.Vector3(); function proj(x, y, z) { V.set(x, y, z).project(camera); return [(V.x * 0.5 + 0.5) * W, (-V.y * 0.5 + 0.5) * H, V.z]; }
function marker(ctx, n, s, x3, y3, z3, lx, ly, a) { if (a <= 0) return; const [px, py, pz] = proj(x3, y3, z3); if (pz > 1) return; ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = '#ffd23a'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(lx, ly); ctx.stroke(); ctx.fillStyle = '#ffd23a'; ctx.beginPath(); ctx.arc(px, py, 10, 0, 7); ctx.fill();
  ctx.fillStyle = 'rgba(6,14,40,0.92)'; ctx.font = '26px Russo'; const w = ctx.measureText(s).width + 70; ctx.fillRect(lx - 4, ly - 28, w, 56); ctx.strokeStyle = '#ffd23a'; ctx.strokeRect(lx - 4, ly - 28, w, 56); ctx.fillStyle = '#ffd23a'; ctx.beginPath(); ctx.arc(lx + 24, ly, 18, 0, 7); ctx.fill(); txt(ctx, String(n), lx + 24, ly + 2, 24, '#06102a', 'center'); txt(ctx, s, lx + 52, ly + 2, 26, '#ffffff'); ctx.restore(); }
function brainCard(ctx, T, a) { const x = 110, y = 760, w = 500, h = 250; card(ctx, 'YOUR BRAIN', x, y, w, h, a); ctx.save(); ctx.globalAlpha = a;
  ctx.fillStyle = '#ff9ac0'; ctx.beginPath(); ctx.ellipse(x + 110, y + 140, 70, 54, 0, 0, 7); ctx.fill(); ctx.strokeStyle = '#c86a90'; ctx.lineWidth = 4; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(x + 80 + i * 20, y + 130 + (i % 2) * 14, 16, 0.3, 2.6); ctx.stroke(); }
  const k = prog(T, EV.adren - 0.2, EV.adren + 0.8); txt(ctx, 'ADRENALINE', x + 220, y + 90, 26, '#ffd23a'); ctx.fillStyle = '#1a2440'; ctx.fillRect(x + 220, y + 110, 240, 30); ctx.fillStyle = '#ff5a3a'; ctx.fillRect(x + 220, y + 110, 240 * k, 30);
  txt(ctx, 'HEART RATE UP', x + 220, y + 170, 20, '#ff8a8a', 'left', 'PressStart'); txt(ctx, 'TIME FEELS SLOW', x + 220, y + 210, 20, '#7ad0ff', 'left', 'PressStart'); ctx.restore(); }
function painCard(ctx, T, a) { const x = 110, y = 760, w = 500, h = 230; card(ctx, 'WHAT YOU FEEL', x, y, w, h, a); ctx.save(); ctx.globalAlpha = a; txt(ctx, 'PAIN', x + 30, y + 90, 30, '#fff'); ctx.fillStyle = '#1a2440'; ctx.fillRect(x + 140, y + 74, 320, 32); const lvl = lerp(0.9, 0.12, ease(prog(T, EV.shock - 0.3, EV.pain))); ctx.fillStyle = '#ff5a3a'; ctx.fillRect(x + 140, y + 74, 320 * lvl, 32);
  txt(ctx, 'SHOCK', x + 30, y + 150, 30, '#fff'); ctx.fillStyle = '#1a2440'; ctx.fillRect(x + 140, y + 134, 320, 32); ctx.fillStyle = '#7dffb0'; ctx.fillRect(x + 140, y + 134, 320 * ease(prog(T, EV.shock - 0.3, EV.pain)), 32); if (T > EV.pain - 0.2) txt(ctx, 'PAIN CAN COME LATER', x + w / 2, y + 205, 18, '#ffd23a', 'center', 'PressStart'); ctx.restore(); }
function energyCard(ctx, T, a) { const x = 90, y = 660, w = 540, h = 380; card(ctx, 'SPEED VS ENERGY', x, y, w, h, a); ctx.save(); ctx.globalAlpha = a; const bx = x + 120, base = y + 320, k = ease(prog(T, EV.double - 0.2, EV.four + 0.4));
  ctx.fillStyle = '#7ad0ff'; ctx.fillRect(bx, base - 55, 100, 55); txt(ctx, '20 MPH', bx + 50, base + 30, 22, '#fff', 'center'); txt(ctx, '1x', bx + 50, base - 80, 34, '#7ad0ff', 'center');
  const h2 = 220 * k; ctx.fillStyle = '#ff5a3a'; ctx.fillRect(bx + 200, base - h2, 100, h2); txt(ctx, '40 MPH', bx + 250, base + 30, 22, '#fff', 'center'); if (k > 0.95) txt(ctx, '4x', bx + 250, base - h2 - 26, 40, '#ff5a3a', 'center');
  txt(ctx, 'SPEED x2', x + w - 30, y + 110, 24, '#fff', 'right'); txt(ctx, '= ENERGY x4', x + w - 30, y + 150, 24, '#ffd23a', 'right'); ctx.restore(); }
// captions
const CAPS = []; for (const c of CL) { let cur = []; const flush = () => { if (cur.length) CAPS.push({ a: cur[0].a, b: cur[cur.length - 1].b, txt: cur.map(w => w.w).join(' ') }); cur = []; };
  c.words.forEach(w => { if (cur.length && (cur.length >= 4 || w.a - cur[cur.length - 1].b > 0.2 || /^(And|You|Your|Time|Then|The|Strangely|Shock|Speed|Double|So|Send)$/.test(w.w) && cur.length > 1)) flush(); cur.push(w); }); flush(); }
CAPS.forEach((c, i) => { const nx = CAPS[i + 1]; c.b = nx ? Math.min(nx.a, c.b + 0.35) : c.b + 0.8; c.txt = c.txt.replace(/[:\-]/g, ''); });
function captionBox(ctx, t) { ctx.save(); ctx.font = '50px Russo'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; const words = t.split(' '); const lines = []; let cur = ''; for (const w of words) { const x = cur ? cur + ' ' + w : w; if (ctx.measureText(x).width > 600 && cur) { lines.push(cur); cur = w; } else cur = x; } lines.push(cur);
  const y0 = 1120 - (lines.length - 1) * 31; lines.forEach((l, i) => { ctx.lineJoin = 'round'; ctx.lineWidth = 11; ctx.strokeStyle = '#05081a'; ctx.strokeText(l, 360, y0 + i * 62); ctx.fillStyle = '#fff'; ctx.fillText(l, 360, y0 + i * 62); }); ctx.restore(); }

let glc, out, octx, low, lctx;
window.initFootball = async function () {
  await Promise.all(['30px Russo', '20px PressStart'].map(f => document.fonts.load(f)));
  makeTextures(); glc = document.createElement('canvas'); glc.width = RW; glc.height = RH;
  renderer = new T3.WebGLRenderer({ canvas: glc, antialias: false, preserveDrawingBuffer: true }); renderer.setPixelRatio(1); renderer.setSize(RW, RH, false); renderer.outputColorSpace = T3.SRGBColorSpace;
  camera = new T3.PerspectiveCamera(55, RW / RH, 0.05, 300); scene = new T3.Scene(); scene.fog = new T3.Fog('#a8c8e8', 30, 90); build();
  out = document.getElementById('c'); octx = out.getContext('2d'); low = document.createElement('canvas'); lctx = low.getContext('2d');
};
window.DURATION = TM.total;
window.renderFrame = function (T) {
  let ci = CL.findIndex(c => T >= c.start && T < c.start + c.dur); if (ci < 0) ci = CL.length - 1;
  const st = sceneTime(T); const safe = st < 0;
  if (!safe) { pose(st, T); car.position.set(carFront(st) - 2, 0, 0.55); crack.visible = st > EV.wind - 0.05; brake.forEach(b => { b.visible = st > EV.thrown; b.scale.x = (carFront(st) - carFront(EV.thrown)) / 0.3 + 0.01; b.position.x = (carFront(EV.thrown) + carFront(st)) / 2 - 1.3; }); }
  else { // the safe replay: looks both ways, waits, car passes
    pedReset(); const u = ped.userData; ped.rotation.set(0, Math.PI, 0); ped.position.set(0, 0.15, 2.7); idle(ped, T); const lk = T - REW[1]; u.head.rotation.y = lk < 0.8 ? lerp(0, 1.2, prog(lk, 0, 0.4)) : lk < 1.8 ? lerp(1.2, -1.2, prog(lk, 0.8, 1.4)) : 0; u.armR.rotation.x = -0.2;
    car.position.set(lerp(-14, 22, prog(T, REW[1] + 0.3, TM.total - 0.3)) - 2, 0, 0.55); crack.visible = false; brake.forEach(b => b.visible = false); }
  // phone in hand (until impact) / on the road after
  { const t = st < 0 ? 0 : st; if (!safe && t < EV.impact + 0.2) { ped.updateMatrixWorld(true); ped.userData.armR.children[2].getWorldPosition(V); phone.position.copy(V); phone.position.y += 0.05; phone.visible = true; } else if (!safe && t > EV.thrown) { phone.visible = true; phone.position.set(2.2, 0.03, 1.2); phone.rotation.set(-Math.PI / 2, 0, 0.6); } else phone.visible = false; }
  // cameras
  const t = safe ? 0 : st;
  if (ci === 0) camL([3.0, 1.8, 5.0], [2.3, 1.7, 4.6], prog(T, 0, CL[1].start), [-3, 1.0, 1.5], [-2, 1.0, 1.5]);
  else if (ci === 1) camL([2.2, 1.7, -1.8], [1.6, 1.6, -1.4], prog(T, CL[1].start, CL[2].start), [0, 1.4, 1.8], [0, 1.3, 0.8]);
  else if (ci === 2) { if (T < EV.spots - 0.2) cam([1.2, 1.9, 1.6], [-6, 1.0, 0.55]); else camL([-0.6, 1.9, -0.8], [-0.7, 1.95, -0.5], prog(T, EV.spots - 0.2, CL[3].start), [0, 1.9, 0.55], [0, 1.95, 0.55]); }
  else if (ci === 3) camL([0.6, 0.7, -2.8], [0.2, 0.6, -2.2], prog(T, CL[3].start, CL[4].start), [0, 0.5, 0.55], [0.1, 0.5, 0.55]);
  else if (ci === 4) { if (T < EV.head - 0.2) camL([0.6, 1.6, -4.2], [0.9, 1.7, -3.8], prog(T, CL[4].start, EV.head), [0.3, 0.9, 0.55], [0.6, 1.0, 0.55]); else cam([1.6, 1.8, -1.6], [0.8, 1.05, 0.55]); }
  else if (ci === 5) camL([2.0, 1.8, -4.4], [3.0, 1.5, -4.0], prog(T, CL[5].start, CL[6].start), [2, 0.8, 0.55], [4.2, 0.3, 0.55]);
  else if (ci === 6) camL([7.6, 1.3, 2.4], [7.0, 1.0, 2.0], prog(T, CL[6].start, CL[7].start), [5.0, 0.3, 0.55], [5.1, 0.25, 0.55]);
  else if (ci === 7) camL([2, 4, 4.8], [2, 5, 5.2], prog(T, CL[7].start, CL[8].start), [2, 0, 0.5], [2, 0, 0.5]);
  else { if (T < REW[1]) cam([2.5, 3.2, 4.8], [0, 0.5, 0.5]); else camL([2.2, 1.6, -1.8], [1.6, 1.6, -2.4], prog(T, REW[1], TM.total), [0, 1.3, 2.6], [0, 1.2, 1.2]); }
  renderer.render(scene, camera);
  octx.imageSmoothingEnabled = false; const slow = !safe && t > EV.brain - 0.1 && t < EV.road + 0.6; octx.filter = slow ? 'saturate(0.55) contrast(1.1)' : (T >= REW[0] && T < REW[1] ? 'hue-rotate(20deg) saturate(1.4)' : 'none'); octx.drawImage(glc, 0, 0, W, H); octx.filter = 'none';
  octx.fillStyle = 'rgba(0,0,0,0.06)'; for (let y = 0; y < H; y += 5) octx.fillRect(0, y, W, 2);
  if (slow) { octx.fillStyle = '#000'; octx.fillRect(0, 0, W, 70); octx.fillRect(0, H - 70, W, 70); txt(octx, 'SLOW MOTION  0.25x', 24, 36, 18, '#ff5a3a', 'left', 'PressStart'); if ((T * 2) % 2 > 1) { octx.fillStyle = '#ff3a2a'; octx.beginPath(); octx.arc(W - 40, 36, 10, 0, 7); octx.fill(); } }
  // hook
  if (ci === 0) { bigText(octx, 'WHAT IT FEELS LIKE', 300, 58, '#ffffff', prog(T, 0.1, 0.4)); bigText(octx, 'TO BE HIT BY A CAR', 370, 58, '#ff5a3a', prog(T, 0.4, 0.7)); }
  if (ci === 1 && T > EV.dont - 0.1) bigText(octx, "YOU DON'T SEE IT", 300, 56, '#ff5a3a', prog(T, EV.dont - 0.1, EV.dont + 0.2));
  if (ci === 2 && T > EV.spots - 0.1) brainCard(octx, T, prog(T, EV.spots - 0.1, EV.spots + 0.3));
  if (ci === 3 && T > EV.bumper - 0.2) marker(octx, 1, 'BUMPER HITS LEGS', car.position.x + 2.0, 0.5, 0.55, 80, 300, prog(T, EV.bumper - 0.2, EV.bumper + 0.2));
  if (ci === 4) { if (T > EV.bonnet - 0.2 && T < EV.head - 0.2) marker(octx, 2, 'BODY ON THE BONNET', car.position.x + 1.4, 0.95, 0.55, 80, 300, prog(T, EV.bonnet - 0.2, EV.bonnet + 0.2)); if (T > EV.wind - 0.2) marker(octx, 3, 'HEAD HITS WINDSCREEN', car.position.x + 0.75, 1.1, 0.55, 60, 300, prog(T, EV.wind - 0.2, EV.wind + 0.2)); }
  if (ci === 5 && T > EV.thrown - 0.1) marker(octx, 4, 'THROWN ONTO THE ROAD', ped.position.x, 0.4, 0.55, 80, 300, prog(T, EV.thrown - 0.1, EV.thrown + 0.3));
  if (ci === 6) painCard(octx, T, prog(T, EV.strange, EV.strange + 0.3));
  if (ci === 7) energyCard(octx, T, prog(T, EV.speed, EV.speed + 0.3));
  if (ci === 8) { if (T < REW[1]) { octx.fillStyle = `rgba(255,255,255,${0.08 + 0.08 * S(T * 40)})`; for (let i = 0; i < 6; i++) octx.fillRect(0, (T * 900 + i * 230) % H, W, 14); bigText(octx, '<< REWIND', 400, 70, '#ffffff', 1, 'PressStart'); }
    else { bigText(octx, 'PHONE DOWN', 260, 60, '#7dffb0', prog(T, REW[1], REW[1] + 0.3)); bigText(octx, 'LOOK BOTH WAYS', 340, 60, '#ffd23a', prog(T, EV.look - 0.1, EV.look + 0.2)); if (T > EV.send - 0.2) { bigText(octx, 'SEND THIS TO SOMEONE', 860, 40, '#ffffff', prog(T, EV.send - 0.2, EV.send + 0.2)); bigText(octx, 'WHO WALKS HEAD DOWN', 920, 40, '#7ad0ff', prog(T, EV.send, EV.send + 0.3)); } } }
  const cap = CAPS.find(c => T >= c.a && T < c.b); if (cap) captionBox(octx, cap.txt);
  if (!safe && Math.abs(t - EV.impact) < 0.12) { octx.fillStyle = `rgba(255,255,255,${0.7 * (1 - Math.abs(t - EV.impact) / 0.12)})`; octx.fillRect(0, 0, W, H); }
  if (T < 0.2) { octx.fillStyle = `rgba(0,0,0,${1 - T / 0.2})`; octx.fillRect(0, 0, W, H); }
  if (T > TM.total - 0.6) { octx.fillStyle = `rgba(0,0,0,${prog(T, TM.total - 0.6, TM.total)})`; octx.fillRect(0, 0, W, H); }
};
})();
