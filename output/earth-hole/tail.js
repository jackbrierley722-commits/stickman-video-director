// ---------- captions ----------
const CAPS = []; CL.forEach(c0 => { let cur = []; const flush = () => { if (cur.length) CAPS.push({ a: cur[0].a, b: cur[cur.length - 1].b, t: cur.map(w => w.w).join(' ') }); cur = []; };
  c0.words.forEach(w0 => { const w = Object.assign({}, w0); const prev = cur[cur.length - 1]; if (cur.length && (cur.length >= 3 || w.a - prev.b > 0.25 || w.a - prev.a > 0.6 || /[.,!?]$/.test(prev.w))) flush(); cur.push(w); }); flush(); });
CAPS.forEach((c, i) => { const nx = CAPS[i + 1]; c.b = nx ? Math.min(nx.a, c.b + 0.3) : c.b + 0.6; c.t = c.t.replace(/twelve thousand/i, '12,000').replace(/twenty-eight thousand/i, '28,000').replace(/three million/i, '3 million').replace(/^forty/i, '40').replace(/ forty/i, ' 40').replace(/eighty/i, '80'); });
function caption(c) { octx.save(); octx.font = '600 50px CapFont'; octx.textAlign = 'center'; octx.textBaseline = 'middle'; octx.lineJoin = 'round'; octx.lineWidth = 12; octx.strokeStyle = '#111'; octx.strokeText(c.t, 360, 1060); octx.fillStyle = '#ffe04a'; octx.fillText(c.t, 360, 1060); octx.restore(); }
function txt(s_, x, y, size, col, font = 'Russo', align = 'center') { octx.font = `${size}px ${font}`; octx.fillStyle = col; octx.textAlign = align; octx.textBaseline = 'middle'; octx.fillText(s_, x, y); }
function big(s_, y, size, col, a = 1) { if (a <= 0) return; octx.save(); octx.globalAlpha = Math.min(1, a); const sc = a < 1 ? 1 + (1 - a) * 0.3 : 1; octx.translate(360, y); octx.scale(sc, sc); octx.font = `${size}px Russo`; octx.textAlign = 'center'; octx.textBaseline = 'middle'; octx.lineJoin = 'round'; octx.lineWidth = size * 0.22; octx.strokeStyle = '#111'; octx.strokeText(s_, 0, 0); octx.fillStyle = col; octx.fillText(s_, 0, 0); octx.restore(); }
function meters(T) { const p = fallP(T); const depth = Math.round(12742 * p), sp = speedAt(p), tc = tempAt(p); octx.save(); octx.fillStyle = 'rgba(10,10,16,0.82)'; octx.beginPath(); octx.roundRect(24, 40, 672, 112, 22); octx.fill();
  const cols = [['DEPTH', depth.toLocaleString('en-GB') + ' km', '#9ad0ff'], ['SPEED', sp.toLocaleString('en-GB') + ' km/h', '#ffd27a'], ['HEAT', tc.toLocaleString('en-GB') + '°C', tc > 3000 ? '#ff6a3a' : '#ffb07a']];
  cols.forEach(([l, v, c], i) => { const x = 136 + i * 224; txt(l, x, 74, 20, '#9a9aa8', 'CapFont'); txt(v, x, 114, 30, c); }); octx.restore(); }

// ---------- 2D cutaway of the fall (side view, scrolls with you) ----------
const D2A = E.c2 + 1.3, D2B = E.c4; const RPX = 1500, KM = RPX / 6371;
const BLOBS = (() => { const r = rng(91), b = []; for (let i = 0; i < 520; i++) { const a = r() * PI * 2, rr = Math.sqrt(r()) * RPX; b.push([Math.cos(a) * rr, Math.sin(a) * rr, 4 + r() * 18, r()]); } return b; })();
function guy2D(x, y, s, T) { octx.save(); octx.translate(x, y); octx.rotate(PI + 0.25 * S(T * 2)); octx.scale(s, s); octx.lineCap = 'round'; octx.lineJoin = 'round'; const fl = S(T * 16);
  octx.strokeStyle = '#111'; octx.lineWidth = 9; octx.beginPath(); octx.moveTo(-10, 18); octx.lineTo(-16 + 6 * fl, 52); octx.moveTo(10, 18); octx.lineTo(16 - 6 * fl, 52); octx.stroke(); octx.strokeStyle = '#2e3550'; octx.lineWidth = 6; octx.stroke();
  octx.strokeStyle = '#111'; octx.lineWidth = 9; octx.beginPath(); octx.moveTo(-14, -14); octx.lineTo(-34, -40 + 10 * fl); octx.moveTo(14, -14); octx.lineTo(34, -40 - 10 * fl); octx.stroke(); octx.strokeStyle = '#e8453a'; octx.lineWidth = 6; octx.stroke();
  octx.fillStyle = '#e8453a'; octx.strokeStyle = '#111'; octx.lineWidth = 4; octx.beginPath(); octx.roundRect(-16, -18, 32, 40, 8); octx.fill(); octx.stroke();
  octx.fillStyle = '#e4b08a'; octx.beginPath(); octx.arc(0, -34, 15, 0, PI * 2); octx.fill(); octx.stroke(); octx.fillStyle = '#3a2416'; octx.beginPath(); octx.arc(0, -38, 15, PI, 0); octx.fill();
  octx.fillStyle = '#111'; octx.beginPath(); octx.arc(-5, -33, 2.4, 0, 7); octx.arc(5, -33, 2.4, 0, 7); octx.fill(); octx.beginPath(); octx.ellipse(0, -25, 4, 5.5, 0, 0, 7); octx.fill(); octx.restore(); }
function fall2D(T) { const p = fallP(T), d = p * 2 * RPX, gy = 640, cy = gy + RPX - d, cx = 360; octx.save();
  const sky = octx.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, '#0a1030'); sky.addColorStop(1, '#141a3a'); octx.fillStyle = sky; octx.fillRect(0, 0, W, H);
  const layers = [[RPX, '#7a5a3a'], [RPX - 35 * KM, '#c8502a'], [3480 * KM, '#f08a2a'], [1220 * KM, '#ffd84a']]; layers.forEach(([r, c]) => { octx.fillStyle = c; octx.beginPath(); octx.arc(cx, cy, r, 0, PI * 2); octx.fill(); });
  const mg = octx.createRadialGradient(cx, cy, 3480 * KM, cx, cy, RPX - 35 * KM); mg.addColorStop(0, 'rgba(255,170,60,0.55)'); mg.addColorStop(1, 'rgba(120,30,10,0.35)'); octx.fillStyle = mg; octx.beginPath(); octx.arc(cx, cy, RPX - 35 * KM, 0, PI * 2); octx.arc(cx, cy, 3480 * KM, 0, PI * 2, true); octx.fill('evenodd');
  const cg = octx.createRadialGradient(cx, cy, 0, cx, cy, 1220 * KM); cg.addColorStop(0, '#fffbe0'); cg.addColorStop(1, 'rgba(255,216,74,0)'); octx.fillStyle = cg; octx.beginPath(); octx.arc(cx, cy, 1220 * KM, 0, PI * 2); octx.fill();
  BLOBS.forEach(([bx, by, s, v]) => { const y = cy + by, x = cx + bx; if (y < -30 || y > H + 30) return; const rr = Math.hypot(bx, by); octx.fillStyle = rr > RPX - 35 * KM ? 'rgba(40,25,15,0.35)' : rr > 3480 * KM ? `rgba(90,20,10,${0.18 + v * 0.15})` : `rgba(255,240,180,${0.15 + v * 0.2})`; octx.beginPath(); octx.arc(x, y, s, 0, 7); octx.fill(); });
  octx.fillStyle = '#5ab84a'; octx.fillRect(0, cy - RPX - 18, W, 18); // grass at the surface
  octx.fillStyle = '#0a0806'; octx.fillRect(cx - 22, cy - RPX - 20, 44, 2 * RPX + 40); octx.strokeStyle = 'rgba(0,0,0,0.5)'; octx.lineWidth = 3; octx.strokeRect(cx - 22, cy - RPX - 20, 44, 2 * RPX + 40);
  for (let km = 1000; km < 12742; km += 1000) { const y = cy - RPX + km * KM; if (y < 0 || y > H) continue; octx.fillStyle = 'rgba(255,255,255,0.8)'; octx.fillRect(cx + 26, y - 1, 18, 3); octx.font = '600 20px CapFont'; octx.textAlign = 'left'; octx.textBaseline = 'middle'; octx.fillText(km.toLocaleString('en-GB') + ' km', cx + 50, y); }
  for (const [km, l, c] of [[0, 'CRUST', '#e8d0b0'], [35, 'MANTLE', '#ffb08a'], [2900, 'OUTER CORE', '#ffd08a'], [5150, 'INNER CORE', '#fff4b0']]) { const y = cy - RPX + km * KM; if (y < 120 || y > H - 160) continue; octx.save(); octx.font = '34px Russo'; octx.textAlign = 'right'; octx.textBaseline = 'middle'; octx.lineJoin = 'round'; octx.lineWidth = 8; octx.strokeStyle = '#111'; octx.strokeText(l, cx - 40, y + 30); octx.fillStyle = c; octx.fillText(l, cx - 40, y + 30); octx.restore(); }
  const sp = speedAt(p) / 28000; for (let i = 0; i < 8; i++) { const ph = (T * (2 + sp * 6) + i / 8) % 1; octx.strokeStyle = `rgba(255,255,255,${0.5 * (1 - ph)})`; octx.lineWidth = 3; const x = cx - 16 + (i * 37) % 32; octx.beginPath(); octx.moveTo(x, gy - 110 - ph * 160); octx.lineTo(x, gy - 110 - ph * 160 - 50 - sp * 80); octx.stroke(); }
  guy2D(cx, gy, 1.8, T); const heat = clamp((p - 0.15) * 2.4); if (heat > 0) { octx.fillStyle = `rgba(255,90,20,${0.18 * heat})`; octx.fillRect(0, 0, W, H); } octx.restore(); }
window.initFootball = async function () {
  await Promise.all(['600 44px CapFont', '44px Russo'].map(f => document.fonts.load(f)));
  GLOW = ctex(64, 64, (c, w, h) => { const gr = c.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.3, 'rgba(255,255,255,0.5)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = gr; c.fillRect(0, 0, w, h); });
  glc = document.createElement('canvas'); glc.width = RW; glc.height = RH;
  renderer = new T3.WebGLRenderer({ canvas: glc, antialias: true, preserveDrawingBuffer: true }); renderer.setPixelRatio(1); renderer.setSize(RW, RH, false); renderer.outputColorSpace = T3.SRGBColorSpace; renderer.toneMapping = T3.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0; renderer.shadowMap.enabled = true; renderer.shadowMap.type = T3.PCFSoftShadowMap; renderer.localClippingEnabled = true;
  scene = new T3.Scene(); scene.background = new T3.Color('#070a1a'); camera = new T3.PerspectiveCamera(58, RW / RH, 0.03, 6000); scene.add(camera);
  build(); toonify(scene); buildEarth(); out = document.getElementById('c'); octx = out.getContext('2d');
};
window.DURATION = TM.total;
window.renderFrame = function (T) { const loop = T >= E.loop; const ci = loop ? 0 : CLI(T); shot(T); renderer.render(scene, camera);
  octx.globalCompositeOperation = 'source-over'; octx.globalAlpha = 1; octx.filter = 'contrast(1.04) saturate(1.12)'; octx.drawImage(glc, 0, 0, W, H); octx.filter = 'none';
  const vg = octx.createRadialGradient(360, 640, 440, 360, 640, 900); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.3)'); octx.fillStyle = vg; octx.fillRect(0, 0, W, H);
  if (!loop && T >= D2A && T < D2B) fall2D(T);
  else if (ci === 3 && !loop) { octx.fillStyle = `rgba(255,80,20,${0.12 + 0.05 * S(T * 9)})`; octx.fillRect(0, 0, W, H); }
  if (ci >= 1 && ci <= 5 && !loop && !(ci === 5 && T > E.pop - 0.15)) meters(T);
  if (ci === 0 || loop) big('NEVER JUMP IN', 360, 66, '#ff4a3a', loop ? 1 : prog(T, 0, 0.15));
  if (ci === 1) big('12,742 KM', 470, 70, '#fff', prog(T, E.c1 + 0.3, E.c1 + 0.5));
  if (ci === 3 && T > E.sun - 0.1) big('AS HOT AS THE SUN', 850, 46, '#ffd23a', prog(T, E.sun - 0.1, E.sun + 0.1)); if (ci === 3 && T > E.pressure - 0.1) big('3,600,000x PRESSURE', 920, 40, '#fff', prog(T, E.pressure - 0.1, E.pressure + 0.1));
  if (ci === 4) big('WEIGHTLESS', 380, 74, '#9af0ff', prog(T, E.c4 + 0.6, E.c4 + 0.8));
  if (ci === 5 && T < E.pop - 0.15) big('~42 MINUTES', 470, 60, '#fff', prog(T, E.c5 + 0.2, E.c5 + 0.4));
  const k = popIdx(T); if (!loop && ci >= 5 && k >= 0 && !(ci === 6 && T >= E.forever - 0.1 && T < E.every + 0.3)) { const a = ease(prog(T, POPS[k] + 0.25, POPS[k] + 0.45)); octx.save(); octx.globalAlpha = a; octx.fillStyle = 'rgba(255,255,255,0.95)'; octx.beginPath(); octx.roundRect(170, 180, 380, 96, 24); octx.fill(); octx.strokeStyle = '#111'; octx.lineWidth = 6; octx.stroke(); txt('SHEEP HELLO', 360, 210, 26, '#2a8a4a'); txt('#' + HELLO[k].toLocaleString('en-GB'), 360, 248, 40, '#111'); octx.restore(); }
  if (ci === 6 && T >= E.forever - 0.1 && T < E.every + 0.3) big('FOREVER', 470, 80, '#ffd23a', prog(T, E.forever - 0.1, E.forever + 0.1));
  const cap = CAPS.find(c => T >= c.a && T < c.b); if (cap && !loop) caption(cap); };
})();
