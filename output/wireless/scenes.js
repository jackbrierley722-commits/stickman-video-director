// How wireless charging works — build-up chain, reveal near the end. Low-poly retro console style.
(() => {
const { T3, RW, RH, W, H, clamp, lerp, ease, prog, rng, makeTextures, TX } = window.W3;
const TM = window.TIMING, CL = TM.clips;
const S = Math.sin, C = Math.cos;
function wt(ci, word, n = 0) { let k = 0; for (const w of CL[ci].words) if (w.w.toLowerCase().replace(/[^a-z0-9']/g, '') === word) { if (k === n) return w.a - CL[ci].start; k++; } return 0; }
const AT = (ci, w, n = 0) => CL[ci].start + wt(ci, w, n);

let renderer, camera, scene, hemi;
function M(c, o = {}) { return new T3.MeshLambertMaterial(Object.assign({ color: c, flatShading: true }, o)); }
function B(w, h, d, m, x, y, z, p) { const o = new T3.Mesh(new T3.BoxGeometry(w, h, d), typeof m === 'string' ? M(m) : m); o.position.set(x, y, z); (p || scene).add(o); return o; }
function pt(w, h, draw, rep = [1, 1]) { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); draw(g, w, h); const t = new T3.CanvasTexture(c); t.magFilter = t.minFilter = T3.NearestFilter; t.wrapS = t.wrapT = T3.RepeatWrapping; t.repeat.set(rep[0], rep[1]); t.colorSpace = T3.SRGBColorSpace; t.userData = { g, c }; return t; }
function noise(g, w, h, b, v, seed) { const r = rng(seed); for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const k = (r() - 0.5) * v; g.fillStyle = `rgb(${b[0] + k},${b[1] + k},${b[2] + k})`; g.fillRect(x, y, 1, 1); } }
function spiral(r0, r1, turns, y, n = 500) { const pts = []; for (let i = 0; i <= n; i++) { const u = i / n, a = u * turns * Math.PI * 2, r = lerp(r0, r1, u); pts.push(new T3.Vector3(C(a) * r, y, S(a) * r)); } return new T3.CatmullRomCurve3(pts); }

// ---------- objects ----------
let phone, pBody, pScreen, pScreenTex, xray, pCoilCurve, pDots, chip, battery, batFill, cable, tx, txCurve, txDots, fieldLines, caseMesh, caseLed, magnetsTx, magnetsPh, padCable, plug, wallSocket, sparks;
function build() {
  // studio: desk + back wall
  const desk = new T3.Mesh(new T3.PlaneGeometry(14, 10), M('#ffffff', { map: pt(32, 32, g => { noise(g, 32, 32, [168, 128, 88], 16, 1); g.fillStyle = 'rgba(80,50,30,0.35)'; for (let y = 0; y < 32; y += 8) g.fillRect(0, y, 32, 1); }, [6, 4]) })); desk.rotation.x = -Math.PI / 2; scene.add(desk);
  const wall = new T3.Mesh(new T3.PlaneGeometry(30, 12), M('#ffffff', { map: pt(32, 32, g => { const gr = g.createLinearGradient(0, 0, 0, 32); gr.addColorStop(0, '#2a3a5a'); gr.addColorStop(1, '#5a7aa0'); g.fillStyle = gr; g.fillRect(0, 0, 32, 32); }) })); wall.position.set(0, 4, -4.5); scene.add(wall);
  // phone
  phone = new T3.Group(); scene.add(phone);
  pBody = new T3.Mesh(new T3.BoxGeometry(0.78, 0.08, 1.6), new T3.MeshLambertMaterial({ color: '#1c1d22', transparent: true, opacity: 1, emissive: '#000000' })); phone.add(pBody);
  pScreenTex = pt(64, 128, () => {}); pScreen = new T3.Mesh(new T3.PlaneGeometry(0.7, 1.5), new T3.MeshBasicMaterial({ map: pScreenTex, transparent: true })); pScreen.rotation.x = -Math.PI / 2; pScreen.position.y = 0.041; phone.add(pScreen);
  B(0.2, 0.012, 0.04, '#0a0a0a', 0, 0.045, -0.72, phone);
  xray = new T3.Group(); phone.add(xray);
  battery = B(0.62, 0.03, 0.8, '#2a3a4a', 0, 0.0, 0.25, xray); batFill = B(0.58, 0.032, 0.76, new T3.MeshBasicMaterial({ color: '#3ad06a' }), 0, 0.001, 0.25, xray);
  pCoilCurve = spiral(0.06, 0.26, 7, -0.03); const pCoil = new T3.Mesh(new T3.TubeGeometry(pCoilCurve, 400, 0.008, 4), M('#d8803a')); pCoil.position.z = -0.1; xray.add(pCoil); pCoil.userData.curve = pCoilCurve;
  chip = B(0.14, 0.03, 0.14, new T3.MeshLambertMaterial({ color: '#202024', emissive: '#000000' }), 0.25, 0.0, -0.55, xray); for (let i = 0; i < 4; i++) B(0.02, 0.01, 0.03, '#e8c040', 0.19 + i * 0.04, 0.0, -0.47, xray);
  pDots = Array.from({ length: 18 }, () => { const d = new T3.Mesh(new T3.SphereGeometry(0.018, 5, 4), new T3.MeshBasicMaterial({ color: '#7ad0ff' })); d.position.z = -0.1; xray.add(d); return d; });
  // phone's own cable (start)
  const cc = new T3.CatmullRomCurve3([new T3.Vector3(0, 0, 0.8), new T3.Vector3(0, -0.01, 1.3), new T3.Vector3(0.4, -0.02, 1.9), new T3.Vector3(1.4, -0.02, 2.4), new T3.Vector3(3, -0.02, 2.8)]);
  cable = new T3.Mesh(new T3.TubeGeometry(cc, 60, 0.03, 5), M('#f0f0ec')); phone.add(cable);
  // transmitter coil on ferrite disc
  tx = new T3.Group(); scene.add(tx);
  const ferrite = new T3.Mesh(new T3.CylinderGeometry(0.55, 0.55, 0.03, 16), M('#3a3a40')); ferrite.position.y = 0.015; tx.add(ferrite);
  txCurve = spiral(0.08, 0.48, 9, 0.045); const txCoil = new T3.Mesh(new T3.TubeGeometry(txCurve, 500, 0.014, 5), M('#d8803a')); tx.add(txCoil);
  txDots = Array.from({ length: 30 }, () => { const d = new T3.Mesh(new T3.SphereGeometry(0.026, 5, 4), new T3.MeshBasicMaterial({ color: '#ffe07a' })); tx.add(d); return d; });
  // supply leads (become the pad cable at the end)
  const pc = new T3.CatmullRomCurve3([new T3.Vector3(0.5, 0.03, 0), new T3.Vector3(0.9, 0.0, -0.4), new T3.Vector3(1.6, 0.0, -1.6), new T3.Vector3(2.6, 0.0, -3.2), new T3.Vector3(3.4, 0.6, -4.4)]);
  padCable = new T3.Mesh(new T3.TubeGeometry(pc, 60, 0.028, 5), M('#f0f0ec')); tx.add(padCable);
  wallSocket = B(0.5, 0.5, 0.06, '#e8e8e4', 3.4, 0.6, -4.47); plug = B(0.22, 0.26, 0.14, '#f4f4f0', 3.4, 0.6, -4.38);
  // field lines
  fieldLines = Array.from({ length: 12 }, (_, i) => { const a = i / 12 * Math.PI * 2, R = 0.55 + (i % 3) * 0.12; const pts = []; for (let k = 0; k <= 30; k++) { const u = k / 30 * Math.PI; const r = lerp(0.05, R, (1 - C(u)) / 2); pts.push(new T3.Vector3(C(a) * r, 0.05 + S(u) * (0.6 + (i % 3) * 0.15), S(a) * r)); }
    const m = new T3.Mesh(new T3.TubeGeometry(new T3.CatmullRomCurve3(pts), 30, 0.008, 3), new T3.MeshBasicMaterial({ color: '#4ab0ff', transparent: true, opacity: 0.8 })); tx.add(m); return m; });
  // magnets (ring) on transmitter + phone
  magnetsTx = Array.from({ length: 12 }, (_, i) => { const a = i / 12 * Math.PI * 2; return B(0.06, 0.04, 0.09, i % 2 ? '#c8302a' : '#3a5ab0', C(a) * 0.6, 0.03, S(a) * 0.6, tx); });
  magnetsPh = Array.from({ length: 12 }, (_, i) => { const a = i / 12 * Math.PI * 2; const m = B(0.05, 0.02, 0.07, i % 2 ? '#3a5ab0' : '#c8302a', C(a) * 0.33, -0.035, -0.1 + S(a) * 0.33, xray); return m; });
  // the case (reveal)
  caseMesh = new T3.Mesh(new T3.CylinderGeometry(0.66, 0.7, 0.1, 24), new T3.MeshLambertMaterial({ color: '#f4f4f2', transparent: true, opacity: 1 })); caseMesh.position.y = 0.05; tx.add(caseMesh);
  caseLed = new T3.Mesh(new T3.TorusGeometry(0.69, 0.012, 4, 32), new T3.MeshBasicMaterial({ color: '#4ad0ff' })); caseLed.rotation.x = Math.PI / 2; caseLed.position.y = 0.06; tx.add(caseLed);
  sparks = Array.from({ length: 16 }, () => { const s = new T3.Mesh(new T3.SphereGeometry(0.02, 4, 3), new T3.MeshBasicMaterial({ color: '#fff7a0' })); scene.add(s); return s; });
}
function drawScreen(T, pct, charging, low, hot) { const g = pScreenTex.userData.g; g.fillStyle = '#0a0c14'; g.fillRect(0, 0, 64, 128); g.fillStyle = '#1a2440'; g.fillRect(4, 4, 56, 120);
  const col = low ? '#ff4a3a' : pct > 50 ? '#3ad06a' : '#ffd23a'; g.strokeStyle = '#e8e8f0'; g.lineWidth = 2; g.strokeRect(16, 36, 32, 56); g.fillStyle = '#e8e8f0'; g.fillRect(26, 32, 12, 4); const h = 52 * pct / 100; g.fillStyle = col; g.fillRect(18, 90 - h, 28, h);
  if (charging) { g.fillStyle = '#ffffff'; g.beginPath(); g.moveTo(34, 46); g.lineTo(24, 66); g.lineTo(32, 66); g.lineTo(28, 82); g.lineTo(40, 60); g.lineTo(32, 60); g.closePath(); g.fill(); }
  g.fillStyle = '#e8e8f0'; g.font = '12px PressStart'; g.textAlign = 'center'; g.fillText(`${Math.round(pct)}`, 32, 112); if (hot) { g.fillStyle = `rgba(255,120,40,${0.4 + 0.2 * S(T * 10)})`; g.fillRect(4, 4, 56, 120); } pScreenTex.needsUpdate = true; }

// ---------- timeline helpers ----------
function cam(p, l) { camera.position.set(p[0], p[1], p[2]); camera.lookAt(l[0], l[1], l[2]); }
function camL(a, b, k, la, lb) { k = ease(k); cam([lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)], [lerp(la[0], lb[0], k), lerp(la[1], lb[1], k), lerp(la[2], lb[2], k)]); }
const EV = {
  cableOn: AT(0, 'cable'), noCable: AT(0, "don't"), coil: AT(1, 'coil'), ac: AT(2, 'back'), field: AT(2, 'creates'), cant: AT(3, "can't"), second: AT(3, 'second'),
  close: AT(4, 'bring'), push: AT(4, 'pushes'), induct: AT(4, 'induction'), dir: AT(5, 'back'), rect: AT(5, 'rectifier'), heat: AT(6, 'heat'), mag: AT(6, 'magnets'), wrap: AT(7, 'wrap'), reveal: AT(7, 'wireless'), wire: AT(8, 'wire')
};
function acPhase(T) { return S(T * Math.PI * 2 * 1.2) >= 0 ? 1 : -1; } // slowed-down visual of the alternating current

// ---------- HUD ----------
function bigText(ctx, txt, y, size, col = '#ffd23a', a = 1, font = 'Russo') { if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.font = `${size}px ${font}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round'; ctx.lineWidth = size * 0.22; ctx.strokeStyle = '#05081a'; ctx.strokeText(txt, 360, y); ctx.fillStyle = col; ctx.fillText(txt, 360, y); ctx.restore(); }
function banner(ctx, kind, item, k, out) { const good = kind === 'unlock'; const x = lerp(-640, 40, ease(k)) - ease(out) * 700; ctx.save(); ctx.translate(x, 70); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(640, 0); ctx.lineTo(610, 120); ctx.lineTo(0, 120); ctx.closePath();
  const g = ctx.createLinearGradient(0, 0, 0, 120); if (good) { g.addColorStop(0, 'rgba(20,110,60,0.95)'); g.addColorStop(1, 'rgba(6,50,26,0.95)'); } else { g.addColorStop(0, 'rgba(170,30,30,0.95)'); g.addColorStop(1, 'rgba(80,8,8,0.95)'); } ctx.fillStyle = g; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = good ? '#7dffb0' : '#ffb0a0'; ctx.stroke();
  ctx.fillStyle = good ? '#7dffb0' : '#ffe24a'; ctx.beginPath(); ctx.arc(60, 60, 36, 0, 7); ctx.fill(); ctx.fillStyle = good ? '#06321a' : '#5a0808'; ctx.font = '46px Russo'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(good ? '✓' : '!', 60, 64);
  ctx.textAlign = 'left'; ctx.font = '20px PressStart'; ctx.fillStyle = good ? '#7dffb0' : '#ffe24a'; ctx.fillText(good ? 'UNLOCKED' : 'PROBLEM', 116, 38); ctx.font = (item.length > 16 ? 32 : 42) + 'px Russo'; ctx.fillStyle = '#fff'; ctx.fillText(item, 116, 86); ctx.restore(); }
const BAN = [['cableOn', 'unlock', 'CABLE'], ['noCable', 'problem', 'NO CABLE'], ['coil', 'unlock', 'COPPER COIL'], ['ac', 'unlock', 'BACK AND FORTH CURRENT'], ['field', 'unlock', 'MAGNETIC FIELD'], ['cant', 'problem', "FIELD CAN'T CHARGE"], ['second', 'unlock', 'SECOND COIL'], ['induct', 'unlock', 'INDUCTION'], ['dir', 'problem', 'WRONG DIRECTION'], ['rect', 'unlock', 'RECTIFIER CHIP'], ['heat', 'problem', 'WASTED HEAT'], ['mag', 'unlock', 'MAGNETS']].map(([e, k, l]) => ({ t: EV[e] - 0.15, kind: k, label: l }));
BAN.forEach((b, i) => { const nx = BAN[i + 1]; b.end = nx ? Math.min(nx.t, b.t + 4.5) : b.t + 3.5; });
function card(ctx, title, x, y, w, h, a) { ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = 'rgba(6,14,40,0.9)'; ctx.fillRect(x, y, w, h); ctx.strokeStyle = '#7ad0ff'; ctx.lineWidth = 4; ctx.strokeRect(x, y, w, h); ctx.fillStyle = '#ffd23a'; ctx.fillRect(x, y, w, 34); ctx.font = '16px PressStart'; ctx.fillStyle = '#06102a'; ctx.textBaseline = 'middle'; ctx.fillText(title, x + 14, y + 18); ctx.restore(); }
function txt(ctx, s, x, y, size, c, align = 'left', font = 'Russo') { ctx.font = `${size}px ${font}`; ctx.fillStyle = c; ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.fillText(s, x, y); ctx.textAlign = 'left'; }
function wave(ctx, x, y, w, amp, T, col, flat) { ctx.strokeStyle = col; ctx.lineWidth = 5; ctx.beginPath(); for (let i = 0; i <= w; i += 3) { const v = flat ? -amp * 0.8 : S(i / w * Math.PI * 6 - T * 8) * amp; i ? ctx.lineTo(x + i, y + v) : ctx.moveTo(x + i, y + v); } ctx.stroke(); }
const DIAG = [
  { a: () => EV.ac + 0.2, b: () => EV.field - 0.1, draw: (ctx, T, a) => { const x = 90, y = 760, w = 540, h = 200; card(ctx, 'CURRENT IN THE COIL', x, y, w, h, a); ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = 'rgba(122,208,255,0.3)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x + 20, y + 115); ctx.lineTo(x + w - 20, y + 115); ctx.stroke(); wave(ctx, x + 20, y + 115, w - 40, 50, T, '#ffd23a'); txt(ctx, '100,000+ FLIPS A SECOND', x + w / 2, y + 182, 18, '#7dffb0', 'center', 'PressStart'); ctx.restore(); } },
  { a: () => EV.rect - 0.1, b: () => CL[6].start, draw: (ctx, T, a) => { const x = 60, y = 740, w = 600, h = 230; card(ctx, 'THE RECTIFIER', x, y, w, h, a); ctx.save(); ctx.globalAlpha = a; wave(ctx, x + 20, y + 125, 180, 45, T, '#ffd23a'); ctx.fillStyle = '#202024'; ctx.fillRect(x + 240, y + 80, 120, 90); ctx.strokeStyle = '#e8c040'; ctx.lineWidth = 3; ctx.strokeRect(x + 240, y + 80, 120, 90); txt(ctx, 'CHIP', x + 300, y + 125, 24, '#fff', 'center');
      const k = prog(T, EV.rect, EV.rect + 1); ctx.save(); ctx.beginPath(); ctx.rect(x + 400, y + 40, 180 * k, 150); ctx.clip(); wave(ctx, x + 400, y + 125, 180, 45, T, '#7dffb0', true); ctx.restore(); txt(ctx, 'BACK + FORTH', x + 110, y + 200, 14, '#ffd23a', 'center', 'PressStart'); txt(ctx, 'ONE WAY', x + 490, y + 200, 14, '#7dffb0', 'center', 'PressStart'); ctx.restore(); } },
  { a: () => EV.heat - 0.2, b: () => CL[7].start, draw: (ctx, T, a) => { const x = 120, y = 740, w = 480, h = 230; card(ctx, 'TOP VIEW', x, y, w, h, a); ctx.save(); ctx.globalAlpha = a; const k = ease(prog(T, EV.mag + 0.3, EV.mag + 1.0)); const off = lerp(70, 0, k);
      ctx.strokeStyle = '#d8803a'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(x + w / 2, y + 130, 60, 0, 7); ctx.stroke(); ctx.strokeStyle = k > 0.9 ? '#7dffb0' : '#ff5a3a'; ctx.beginPath(); ctx.arc(x + w / 2 + off, y + 130, 45, 0, 7); ctx.stroke();
      txt(ctx, k > 0.9 ? 'LINED UP' : 'OFF CENTRE = HEAT', x + w / 2, y + 210, 16, k > 0.9 ? '#7dffb0' : '#ff8a5a', 'center', 'PressStart'); ctx.restore(); } },
];
// captions
const CAPS = [];
for (const c of CL) { let cur = []; const flush = () => { if (cur.length) CAPS.push({ a: cur[0].a, b: cur[cur.length - 1].b, txt: cur.map(w => w.w).join(' ') }); cur = []; };
  c.words.forEach(w => { if (cur.length && (cur.length >= 4 || w.a - cur[cur.length - 1].b > 0.2 || /^(So|But|Then|Send|That|Bring|Electricity|This|Now|Wireless|Cable|Comment)$/.test(w.w) && cur.length > 1)) flush(); cur.push(w); }); flush(); }
CAPS.forEach((c, i) => { const nx = CAPS[i + 1]; c.b = nx ? Math.min(nx.a, c.b + 0.35) : c.b + 0.8; c.txt = c.txt.replace(/[:\-]/g, '.').replace(/hundred thousand/, '100,000'); });
function captionBox(ctx, t) { ctx.save(); ctx.font = '50px Russo'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; const words = t.split(' '); const lines = []; let cur = ''; for (const w of words) { const x = cur ? cur + ' ' + w : w; if (ctx.measureText(x).width > 610 && cur) { lines.push(cur); cur = w; } else cur = x; } lines.push(cur);
  const y0 = 640 - (lines.length - 1) * 31; lines.forEach((l, i) => { ctx.lineJoin = 'round'; ctx.lineWidth = 11; ctx.strokeStyle = '#05081a'; ctx.strokeText(l, 360, y0 + i * 62); ctx.fillStyle = '#fff'; ctx.fillText(l, 360, y0 + i * 62); }); ctx.restore(); }

let glc, out, octx, low, lctx;
window.initFootball = async function () {
  await Promise.all(['30px Russo', '20px PressStart'].map(f => document.fonts.load(f)));
  makeTextures();
  glc = document.createElement('canvas'); glc.width = RW; glc.height = RH;
  renderer = new T3.WebGLRenderer({ canvas: glc, antialias: false, preserveDrawingBuffer: true }); renderer.setPixelRatio(1); renderer.setSize(RW, RH, false); renderer.outputColorSpace = T3.SRGBColorSpace;
  camera = new T3.PerspectiveCamera(50, RW / RH, 0.02, 100);
  scene = new T3.Scene(); scene.background = new T3.Color('#1a2440');
  hemi = new T3.HemisphereLight('#f4f6ff', '#5a4a3a', 0.9); scene.add(hemi); const d = new T3.DirectionalLight('#ffffff', 0.9); d.position.set(2, 5, 3); scene.add(d);
  build();
  out = document.getElementById('c'); octx = out.getContext('2d'); low = document.createElement('canvas'); lctx = low.getContext('2d');
};
window.DURATION = TM.total;
window.renderFrame = function (T) {
  let ci = CL.findIndex(c => T >= c.start && T < c.start + c.dur); if (ci < 0) ci = CL.length - 1;
  const lt = T - CL[ci].start, D = CL[ci].dur;
  // ----- world state from time -----
  const dir = acPhase(T);
  const xrayOn = T > EV.second - 0.3 && T < EV.wrap; pBody.material.opacity = xrayOn ? 0.28 : 1; pScreen.visible = !xrayOn; xray.visible = xrayOn;
  cable.visible = T < EV.noCable + 0.6; cable.scale.setScalar(T < EV.noCable ? 1 : Math.max(0.01, 1 - (T - EV.noCable) / 0.6));
  const txK = ease(prog(T, EV.coil - 0.3, EV.coil + 0.5)); tx.visible = T > EV.coil - 0.3; tx.scale.setScalar(Math.max(0.01, txK)); tx.rotation.y = T < EV.close ? T * 0.25 : 0;
  const powered = T > EV.ac - 0.2; txDots.forEach((d, i) => { d.visible = powered; const u = ((i / txDots.length) + dir * (T * 0.08) % 1 + 1) % 1; const p = txCurve.getPointAt(u); d.position.copy(p); d.material.color.set(dir > 0 ? '#ffe07a' : '#ff9a4a'); });
  const fieldOn = T > EV.field - 0.2; fieldLines.forEach((m, i) => { m.visible = fieldOn; m.material.color.set(dir > 0 ? '#4ab0ff' : '#ff4a8a'); const pul = 0.75 + 0.25 * Math.abs(S(T * Math.PI * 2 * 1.2)); m.scale.set(1, pul * (T > EV.wrap ? 0.6 : 1), 1); m.material.opacity = T > EV.wrap ? 0.25 : 0.8; });
  padCable.visible = powered; plug.visible = wallSocket.visible = true;
  const caseK = ease(prog(T, EV.wrap + 0.3, EV.reveal)); caseMesh.visible = caseK > 0; caseMesh.scale.set(1, Math.max(0.01, caseK), 1); caseMesh.material.opacity = caseK; caseLed.visible = caseK > 0.95; caseLed.material.color.set(S(T * 4) > 0 ? '#4ad0ff' : '#2a8ad0');
  const magK = prog(T, EV.mag - 0.1, EV.mag + 0.3); magnetsTx.forEach(m => { m.visible = magK > 0 && caseK < 0.9; m.scale.setScalar(Math.max(0.01, magK)); }); magnetsPh.forEach(m => m.visible = magK > 0);
  // phone pose
  let px = 0, py = 0.6, pz = 0.2, rx = 0;
  if (T < EV.coil) { px = 0; py = 0.04; pz = 0; }
  else if (T < EV.second - 0.3) { px = 1.6; py = 0.04; pz = 0.4; }
  else if (T < EV.close) { const k = ease(prog(T, EV.second - 0.3, EV.second + 0.5)); px = lerp(1.6, 0, k); py = lerp(0.04, 0.9, k); pz = lerp(0.4, 0.1, k); }
  else { const k = ease(prog(T, EV.close, EV.push)); px = 0; py = lerp(0.9, 0.12, k); pz = lerp(0.1, 0.1, k);
    if (T > EV.heat - 0.4 && T < EV.mag + 0.3) px = lerp(0, 0.42, ease(prog(T, EV.heat - 0.4, EV.heat)));
    if (T >= EV.mag + 0.3) px = lerp(0.42, 0, ease(prog(T, EV.mag + 0.3, EV.mag + 0.55)));
    if (T > EV.wrap + 0.3) py = lerp(0.12, 0.17, caseK); }
  phone.position.set(px, py, pz); phone.rotation.x = rx;
  const inducing = T > EV.push - 0.2; pDots.forEach((d, i) => { d.visible = inducing && xrayOn; const u = ((i / pDots.length) + (T > EV.rect ? 0.12 * T : dir * (T * 0.1) % 1) + 1) % 1; d.position.copy(pCoilCurve.getPointAt(u)); d.position.z -= 0.1; d.material.color.set(T > EV.rect ? '#7dffb0' : (dir > 0 ? '#7ad0ff' : '#ff8ad0')); });
  chip.material.emissive.set(T > EV.rect - 0.1 && T < EV.heat ? '#3a8a3a' : '#000000');
  const hot = T > EV.heat - 0.3 && T < EV.mag + 0.6; pBody.material.emissive.set(hot ? `rgb(${Math.round(120 + 60 * S(T * 8))},40,0)` : '#000000');
  const charging = T > EV.rect + 0.5; const pct = T < EV.noCable ? lerp(18, 22, prog(T, EV.cableOn, EV.noCable)) : charging ? lerp(9, 100, prog(T, EV.rect + 0.5, TM.total)) : lerp(22, 9, prog(T, EV.noCable, EV.rect));
  drawScreen(T, pct, (T > EV.cableOn && T < EV.noCable) || charging, pct < 15 && !charging, hot);
  batFill.scale.x = Math.max(0.02, pct / 100); batFill.position.x = -0.29 + 0.29 * batFill.scale.x;
  sparks.forEach((s, i) => { const k = ((T - EV.push) * 1.5 + i / 16) % 1; s.visible = T > EV.push && T < EV.induct + 1.5; const a = i * 2.4; s.position.set(C(a) * 0.3 * k, 0.12 + k * 0.4, 0.1 + S(a) * 0.3 * k); });
  // ----- cameras -----
  if (ci === 0) { if (T < EV.noCable - 0.2) camL([1.6, 1.4, 2.4], [0.9, 1.2, 1.7], prog(lt, 0, wt(0, "don't")), [0, 0, 0.2], [0, 0, 0.3]); else cam([0.9, 1.2, 1.7], [0, 0, 0.3]); }
  else if (ci === 1) { if (lt < wt(1, 'coil') - 0.4) camL([0.6, 1.8, 2.6], [0.3, 1.6, 2.2], prog(lt, 0, wt(1, 'coil')), [0, 0.6, -0.5], [0, 0.2, 0]); else camL([0, 1.3, 1.3], [0.4, 1.0, 1.0], prog(lt, wt(1, 'coil') - 0.4, D), [0, 0, 0], [0, 0, 0]); }
  else if (ci === 2) { if (T < EV.field - 0.2) camL([0, 0.8, 0.9], [0.3, 0.6, 0.7], prog(lt, 0, wt(2, 'creates')), [0, 0.02, 0], [0, 0.02, 0]); else camL([1.6, 0.7, 1.6], [1.8, 1.0, 1.4], prog(lt, wt(2, 'creates'), D), [0, 0.35, 0], [0, 0.4, 0]); }
  else if (ci === 3) { if (T < EV.second - 0.3) cam([2.4, 1.3, 1.9], [0.8, 0.2, 0.2]); else camL([1.2, 1.6, 1.8], [0.9, 1.6, 1.4], prog(T, EV.second - 0.3, CL[4].start), [0.4, 0.5, 0.2], [0, 0.9, 0.1]); }
  else if (ci === 4) { if (T < EV.induct - 0.3) camL([1.5, 0.8, 1.6], [1.0, 0.5, 1.2], prog(T, EV.close, EV.induct), [0, 0.4, 0.1], [0, 0.12, 0.05]); else cam([0.9, 0.9, 1.2], [0, 0.1, 0.05]); }
  else if (ci === 5) { if (T < EV.rect - 0.2) camL([0.9, 0.9, 1.2], [0.6, 0.8, 0.6], prog(lt, 0, wt(5, 'rectifier')), [0, 0.1, 0.05], [0.2, 0.12, -0.4]); else camL([0.7, 0.6, -0.1], [0.6, 0.5, -0.2], prog(T, EV.rect, CL[6].start), [0.25, 0.12, -0.45], [0.25, 0.12, -0.45]); }
  else if (ci === 6) { camL([0.4, 1.9, 1.2], [0.2, 1.7, 0.9], prog(lt, 0, D), [0.2, 0, 0.1], [0.1, 0, 0.05]); }
  else if (ci === 7) { const k = prog(T, EV.wrap, EV.reveal + 0.6); camL([1.0, 0.9, 1.4], [1.5, 1.1, 2.0], k, [0, 0.1, 0], [0, 0.1, 0]); }
  else { camL([1.5, 1.1, 2.0], [3.4, 2.4, 3.6], prog(lt, 0, D * 0.6), [0, 0.1, 0], [1.4, 0.3, -1.6]); }
  renderer.render(scene, camera);
  // ----- post + HUD -----
  const mz = clamp(1 - lt / 0.25); const f = mz > 0 && ci > 0 ? Math.max(1, Math.round(mz * 10)) : 1; octx.imageSmoothingEnabled = false;
  if (f > 1) { low.width = Math.ceil(RW / f); low.height = Math.ceil(RH / f); lctx.imageSmoothingEnabled = false; lctx.drawImage(glc, 0, 0, low.width, low.height); octx.drawImage(low, 0, 0, W, H); } else octx.drawImage(glc, 0, 0, W, H);
  octx.fillStyle = 'rgba(0,0,0,0.08)'; for (let y = 0; y < H; y += 5) octx.fillRect(0, y, W, 2);
  const vg = octx.createRadialGradient(360, 640, 420, 360, 640, 900); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.4)'); octx.fillStyle = vg; octx.fillRect(0, 0, W, H);
  const b = BAN.find(e => T >= e.t && T < e.end); if (b) banner(octx, b.kind, b.label, prog(T, b.t, b.t + 0.3), prog(T, b.end - 0.25, b.end));
  for (const d of DIAG) { const a0 = d.a(), b0 = d.b(); if (T >= a0 && T < b0) d.draw(octx, T, Math.min(prog(T, a0, a0 + 0.3), 1 - prog(T, b0 - 0.25, b0))); }
  if (ci === 4 && T > EV.induct - 0.1) bigText(octx, 'INDUCTION', 300, 96, '#7ad0ff', prog(T, EV.induct - 0.1, EV.induct + 0.2));
  if (ci === 7 && T > EV.reveal - 0.1) { const k = prog(T, EV.reveal - 0.1, EV.reveal + 0.25); octx.fillStyle = `rgba(255,255,255,${Math.max(0, 0.7 - (T - EV.reveal) * 2)})`; octx.fillRect(0, 0, W, H); bigText(octx, 'WIRELESS', 250, Math.round(92 * (1 + 0.4 * (1 - ease(k)))), '#fff', k); bigText(octx, 'CHARGER', 350, Math.round(104 * (1 + 0.4 * (1 - ease(k)))), '#ffd23a', k); }
  if (ci === 8) { if (T > EV.wire - 0.2) { bigText(octx, 'STILL A WIRE', 260, 70, '#ff5a3a', prog(T, EV.wire - 0.2, EV.wire + 0.1) * (1 - prog(lt, wt(8, 'cable') - 0.3, wt(8, 'cable'))));
      octx.save(); octx.globalAlpha = prog(T, EV.wire, EV.wire + 0.3) * (1 - prog(lt, wt(8, 'cable') - 0.3, wt(8, 'cable'))); octx.strokeStyle = '#ff5a3a'; octx.lineWidth = 8; octx.beginPath(); octx.arc(470, 520, 70 + 6 * S(T * 8), 0, 7); octx.stroke(); octx.restore(); }
    if (lt > wt(8, 'cable') - 0.2) { const a = prog(lt, wt(8, 'cable') - 0.2, wt(8, 'cable') + 0.2); bigText(octx, 'CABLE OR', 260, 70, '#fff', a); bigText(octx, 'WIRELESS?', 345, 80, '#ffd23a', a); if ((lt * 2) % 2 > 0.6) bigText(octx, 'COMMENT BELOW', 430, 26, '#7ad0ff', a, 'PressStart'); } }
  const cap = CAPS.find(c => T >= c.a && T < c.b); if (cap && !(ci === 7 && T > EV.reveal - 0.1)) captionBox(octx, cap.txt);
  if (T < 0.25) { octx.fillStyle = `rgba(0,0,0,${1 - T / 0.25})`; octx.fillRect(0, 0, W, H); }
  if (T > TM.total - 0.7) { octx.fillStyle = `rgba(0,0,0,${prog(T, TM.total - 0.7, TM.total)})`; octx.fillRect(0, 0, W, H); }
};
})();
