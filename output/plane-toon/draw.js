// Why plane windows are round: 2D illustrated, dark cosy warm-lit chibi style (matches the user's reference art)
(() => {
const W = 720, H = 1280; const TM = window.TIMING, CL = TM.clips; const S = Math.sin, C = Math.cos, PI = Math.PI;
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), lerp = (a, b, t) => a + (b - a) * t, ease = t => { t = clamp(t); return t * t * (3 - 2 * t); }, prog = (t, a, b) => clamp((t - a) / (b - a));
function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
function AT(ci, word, n = 0) { let k = 0; for (const w of CL[ci].words) if (w.w.toLowerCase().replace(/[^a-z0-9']/g, '') === word) { if (k === n) return w.a; k++; } return CL[ci].start; }
function CLI(T) { let ci = CL.findIndex(c => T >= c.start && T < c.start + c.dur); return ci < 0 ? CL.length - 1 : ci; }
const E = { boom: AT(0, 'fucking'), c1: CL[1].start, piles: AT(1, 'and'), crack: AT(1, 'crack'), c2: CL[2].start, nocorner: AT(2, 'no'), flows: AT(2, 'the'), clever: AT(2, 'clever'),
  c3: CL[3].start, minus: AT(3, "it's"), frozen: AT(3, 'your'), c4: CL[4].start, air: AT(4, 'with'), cold: AT(4, 'so', 1), much: AT(4, 'much'), c5: CL[5].start, hole: AT(5, 'tiny'), fog: AT(5, 'so'), c6: CL[6].start, bro: AT(6, 'until') };
E.loop = TM.total - 0.4;
const INK = '#0e0a08', SKIN = '#e8dfd6', HOOD = '#2e2119', HOOD2 = '#3a2a20', WALL = '#4a3a30', WALL2 = '#3a2c24', GLOW = '#f0a050';
let cv, g, IMG = {}, GRAIN;
// ---------- drawing helpers ----------
function line(w = 6) { g.lineWidth = w; g.strokeStyle = INK; g.lineJoin = 'round'; g.lineCap = 'round'; }
function fluffyHair(cx, cy, r, col, seed, cover = 0.45) { const rr = rng(seed); g.save(); g.fillStyle = col; line(6); g.beginPath(); const n = 22; for (let i = 0; i <= n; i++) { const a = PI + i / n * PI * 1.0 - 0.15 + (i / n) * 0.3; const spike = r * (1.0 + (i % 2 ? 0.22 + rr() * 0.18 : 0)); const x = cx + C(a) * spike, y = cy + S(a) * spike * 0.95; i ? g.lineTo(x, y) : g.moveTo(x, y); }
  // fringe hanging over the eyes
  for (let i = 0; i <= 7; i++) { const x = cx + r * 0.95 - i * r * 0.27; const y = cy + r * cover + (i % 2 ? r * 0.22 : 0); g.lineTo(x, y); } g.closePath(); g.fill(); g.stroke(); g.restore(); }
function face(cx, cy, r, kind, T, hair, seed) { g.save(); line(6); g.fillStyle = SKIN; g.beginPath(); g.ellipse(cx, cy, r * 0.82, r * 0.78, 0, 0, 7); g.fill(); g.stroke();
  g.strokeStyle = INK; g.lineWidth = 4; const ey = cy + r * 0.05;
  if (kind === 'sleep') { for (const sx of [-1, 1]) { g.beginPath(); g.arc(cx + sx * r * 0.3, ey, r * 0.12, 0.2, PI - 0.2); g.stroke(); } }
  else if (kind === 'shock') { for (const sx of [-1, 1]) { g.beginPath(); g.moveTo(cx + sx * r * 0.3, ey - r * 0.15); g.lineTo(cx + sx * r * 0.3, ey + r * 0.12); g.stroke(); } g.fillStyle = '#6a1e1e'; g.beginPath(); g.ellipse(cx, cy + r * 0.45, r * 0.13, r * 0.11, 0, 0, 7); g.fill(); g.stroke(); }
  else if (kind === 'annoyed') { for (const sx of [-1, 1]) { g.beginPath(); g.moveTo(cx + sx * r * 0.42, ey - 2); g.lineTo(cx + sx * r * 0.16, ey + 2); g.stroke(); } g.beginPath(); g.moveTo(cx - r * 0.12, cy + r * 0.45); g.lineTo(cx + r * 0.12, cy + r * 0.42); g.stroke(); }
  else if (kind === 'frozen') { for (const sx of [-1, 1]) { g.beginPath(); g.moveTo(cx + sx * r * 0.3, ey - r * 0.12); g.lineTo(cx + sx * r * 0.3, ey + r * 0.1); g.stroke(); } g.beginPath(); for (let i = 0; i < 6; i++) g.lineTo(cx - r * 0.2 + i * r * 0.08, cy + r * 0.42 + (i % 2 ? 4 : -4)); g.stroke(); }
  else { for (const sx of [-1, 1]) { g.beginPath(); g.moveTo(cx + sx * r * 0.3, ey - r * 0.1); g.lineTo(cx + sx * r * 0.3, ey + r * 0.1); g.stroke(); } g.beginPath(); g.arc(cx, cy + r * 0.38, r * 0.1, 0.3, PI - 0.3); g.stroke(); }
  g.restore(); fluffyHair(cx, cy - r * 0.15, r * 1.05, hair, seed, kind === 'frozen' ? 0.2 : 0.35); }
function hoodie(cx, cy, w, h) { g.save(); line(6); g.fillStyle = HOOD; g.beginPath(); g.moveTo(cx - w * 0.5, cy + h); g.quadraticCurveTo(cx - w * 0.55, cy + h * 0.1, cx - w * 0.2, cy); g.lineTo(cx + w * 0.2, cy); g.quadraticCurveTo(cx + w * 0.55, cy + h * 0.1, cx + w * 0.5, cy + h); g.closePath(); g.fill(); g.stroke();
  g.lineWidth = 3; g.beginPath(); g.moveTo(cx - 14, cy + 10); g.lineTo(cx - 16, cy + 60); g.moveTo(cx + 14, cy + 10); g.lineTo(cx + 16, cy + 60); g.stroke(); g.restore(); }
function grain(a = 0.07) { g.save(); g.globalAlpha = a; g.globalCompositeOperation = 'overlay'; g.drawImage(GRAIN, -Math.floor(Math.random() * 200), -Math.floor(Math.random() * 200), W + 200, H + 200); g.restore(); }
function vignette(a = 0.6, col = '0,0,0') { const v = g.createRadialGradient(360, 640, 320, 360, 640, 900); v.addColorStop(0, `rgba(${col},0)`); v.addColorStop(1, `rgba(${col},${a})`); g.fillStyle = v; g.fillRect(0, 0, W, H); }
function cover(img, zoom = 1, fx = 0.5, fy = 0.5, dx = 0, dy = 0) { const s = Math.max(W / img.width, H / img.height) * zoom; const w = img.width * s, h = img.height * s; g.drawImage(img, (W - w) * fx + dx, (H - h) * fy + dy, w, h); }
// cabin wall panel with a window (shape morphs square -> round); used for all window close-ups
function cabinWall(T, warm = 1) { const bg = g.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#3a2a22'); bg.addColorStop(1, '#22180f'); g.fillStyle = bg; g.fillRect(0, 0, W, H);
  g.save(); line(5); g.strokeStyle = 'rgba(14,10,8,0.8)'; for (const y of [150, 1130]) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y + 20); g.stroke(); } g.restore();
  const lg = g.createRadialGradient(560, 300, 20, 560, 300, 700); lg.addColorStop(0, `rgba(240,160,80,${0.25 * warm})`); lg.addColorStop(1, 'rgba(240,160,80,0)'); g.fillStyle = lg; g.fillRect(0, 0, W, H); }
function windowShape(cx, cy, w, h, round, keep) { const r = lerp(14, Math.min(w, h) / 2, round); if (!keep) g.beginPath(); g.roundRect(cx - w / 2, cy - h / 2, w, h, r); }
function skyView(cx, cy, w, h, round, T, kind = 'sunset') { g.save(); windowShape(cx, cy, w, h, round); g.clip(); const sk = g.createLinearGradient(0, cy - h / 2, 0, cy + h / 2); if (kind === 'night') { sk.addColorStop(0, '#1a2440'); sk.addColorStop(1, '#4a3a5a'); } else { sk.addColorStop(0, '#f4c890'); sk.addColorStop(0.55, '#e89a5a'); sk.addColorStop(1, '#8a7a9a'); } g.fillStyle = sk; g.fillRect(cx - w, cy - h, w * 2, h * 2);
  const r = rng(4); for (let i = 0; i < 9; i++) { const x = cx - w / 2 + ((r() * w + T * 30) % (w + 120)) - 60, y = cy + h * (0.1 + r() * 0.4); g.fillStyle = `rgba(${200 + r() * 40},${170 + r() * 30},${190},0.85)`; for (let k = 0; k < 4; k++) { g.beginPath(); g.ellipse(x + k * 22, y - (k % 2) * 8, 34, 16, 0, 0, 7); g.fill(); } } g.restore(); }
function windowFrame(cx, cy, w, h, round) { g.save(); g.fillStyle = '#6a584c'; line(7); g.beginPath(); const p = 34; g.roundRect(cx - w / 2 - p, cy - h / 2 - p, w + p * 2, h + p * 2, lerp(30, Math.min(w, h) / 2 + p, round)); windowShape(cx, cy, w, h, round, true); g.fill('evenodd'); g.stroke(); windowShape(cx, cy, w, h, round); g.stroke();
  g.strokeStyle = 'rgba(255,220,180,0.25)'; g.lineWidth = 3; g.beginPath(); g.roundRect(cx - w / 2 - p + 10, cy - h / 2 - p + 10, w + p * 2 - 20, h + p * 2 - 20, lerp(24, Math.min(w, h) / 2 + p - 10, round)); g.stroke(); g.restore(); }
function cornerStress(cx, cy, w, h, k, T) { if (k <= 0) return; const cs = [[-1, -1], [1, -1], [-1, 1], [1, 1]]; cs.forEach(([sx, sy]) => { const x = cx + sx * w / 2, y = cy + sy * h / 2; const rg = g.createRadialGradient(x, y, 0, x, y, 110); rg.addColorStop(0, `rgba(255,60,30,${0.9 * k * (0.8 + 0.2 * S(T * 9))})`); rg.addColorStop(1, 'rgba(255,60,30,0)'); g.fillStyle = rg; g.fillRect(x - 110, y - 110, 220, 220); });
  // pressure arrows pushing outward from the cabin
  g.save(); g.strokeStyle = `rgba(255,220,180,${0.6 * k})`; g.lineWidth = 5; for (let i = 0; i < 8; i++) { const a = i / 8 * 2 * PI + T; const r1 = Math.max(w, h) * 0.75, r2 = r1 + 40 + 10 * S(T * 6 + i); g.beginPath(); g.moveTo(cx + C(a) * r1, cy + S(a) * r1); g.lineTo(cx + C(a) * r2, cy + S(a) * r2); g.stroke(); } g.restore(); }
function cracks(cx, cy, w, h, k) { if (k <= 0) return; g.save(); g.strokeStyle = INK; g.lineWidth = 4; [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sy], j) => { let x = cx + sx * w / 2, y = cy + sy * h / 2; const r = rng(10 + j); g.beginPath(); g.moveTo(x, y); const n = Math.floor(k * 9); for (let i = 0; i < n; i++) { x += sx * (10 + r() * 14); y += sy * (6 + r() * 12) * (i % 2 ? 1 : 0.3); g.lineTo(x, y); } g.stroke(); }); g.restore(); }
function flowLines(cx, cy, w, h, T, k) { if (k <= 0) return; g.save(); g.globalAlpha = k; g.strokeStyle = '#8ad8ff'; g.lineWidth = 5; g.setLineDash([22, 18]); for (let i = 0; i < 3; i++) { g.lineDashOffset = -T * 80 * (i % 2 ? 1 : -1); g.beginPath(); g.ellipse(cx, cy, w / 2 + 60 + i * 30, h / 2 + 60 + i * 30, 0, 0, 7); g.stroke(); } g.restore(); }
function frost(cx, cy, w, h, k, round) { if (k <= 0) return; g.save(); windowShape(cx, cy, w, h, round); g.clip(); g.fillStyle = `rgba(220,235,255,${0.55 * k})`; g.fillRect(cx - w, cy - h, w * 2, h * 2); const r = rng(7); g.strokeStyle = `rgba(255,255,255,${0.8 * k})`; g.lineWidth = 2; for (let i = 0; i < 40 * k; i++) { const x = cx - w / 2 + r() * w, y = cy - h / 2 + r() * h; for (let a = 0; a < 6; a++) { g.beginPath(); g.moveTo(x, y); g.lineTo(x + C(a) * 12, y + S(a) * 12); g.stroke(); } } g.restore(); }
function cap(text) { g.save(); g.font = '600 48px CapFont'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round'; g.lineWidth = 12; g.strokeStyle = INK; g.strokeText(text, 360, 1040); g.fillStyle = '#ffffff'; g.fillText(text, 360, 1040); g.restore(); }

// cut a character out of the user's art with soft (feathered) edges
const CROP = { dark: [20, 600, 430, 900], ginger: [462, 585, 340, 880] };
function cutout(name, dx, dy, dh, flip = false, tint = null) { const [sx, sy, sw, sh] = CROP[name]; const dw = dh * sw / sh; const oc = document.createElement('canvas'); oc.width = Math.ceil(dw); oc.height = Math.ceil(dh); const o = oc.getContext('2d');
  if (flip) { o.translate(dw, 0); o.scale(-1, 1); } o.drawImage(IMG.calm, sx, sy, sw, sh, 0, 0, dw, dh); o.setTransform(1, 0, 0, 1, 0, 0);
  if (tint) { o.globalCompositeOperation = 'source-atop'; o.fillStyle = tint; o.fillRect(0, 0, dw, dh); }
  o.globalCompositeOperation = 'destination-in'; const lx = o.createLinearGradient(0, 0, dw, 0); lx.addColorStop(0, 'rgba(0,0,0,0)'); lx.addColorStop(0.22, 'rgba(0,0,0,1)'); lx.addColorStop(0.78, 'rgba(0,0,0,1)'); lx.addColorStop(1, 'rgba(0,0,0,0)'); o.fillStyle = lx; o.fillRect(0, 0, dw, dh); const ly = o.createLinearGradient(0, 0, 0, dh); ly.addColorStop(0, 'rgba(0,0,0,0)'); ly.addColorStop(0.12, 'rgba(0,0,0,1)'); ly.addColorStop(0.82, 'rgba(0,0,0,1)'); ly.addColorStop(1, 'rgba(0,0,0,0)'); o.fillStyle = ly; o.fillRect(0, 0, dw, dh);
  g.drawImage(oc, dx, dy); }
// ---------- scenes ----------
function sceneBoom(T, k) { const sh = 14 * (1 - k * 0.6); g.save(); g.translate((Math.random() - 0.5) * sh, (Math.random() - 0.5) * sh); cover(IMG.boom, 1.06 + 0.04 * k, 0.5, 0.5); g.restore();
  const r = rng(Math.floor(T * 24)); g.save(); g.globalCompositeOperation = 'lighter'; for (let i = 0; i < 40; i++) { const x = r() * W, y = ((r() * H + T * 300 * (0.5 + r())) % H); g.fillStyle = `rgba(255,${150 + r() * 80},60,${0.6 * r()})`; g.fillRect(x, H - y, 3, 3 + r() * 6); } g.restore();
  for (let i = 0; i < 6; i++) { const a = T * 2 + i; g.save(); g.translate(560 + C(a) * 160 + i * 20, 640 + S(a * 1.3) * 300); g.rotate(a); g.fillStyle = 'rgba(220,235,255,0.7)'; line(2); g.beginPath(); g.moveTo(0, -10); g.lineTo(8, 4); g.lineTo(-6, 8); g.closePath(); g.fill(); g.stroke(); g.restore(); }
  const fl = Math.max(0, 1 - (T - 0) * 3); if (fl > 0) { g.fillStyle = `rgba(255,220,160,${fl * 0.5})`; g.fillRect(0, 0, W, H); } g.fillStyle = `rgba(255,120,40,${0.08 + 0.06 * S(T * 20)})`; g.fillRect(0, 0, W, H); }
function sceneWindow(T, o) { cabinWall(T); const cx = 360, cy = 560, w = lerp(300, 300, o.round), h = lerp(420, 420, o.round); skyView(cx, cy, w, h, o.round, T); frost(cx, cy, w, h, o.frost || 0, o.round); windowFrame(cx, cy, w, h, o.round); cornerStress(cx, cy, w, h, o.stress || 0, T); cracks(cx, cy, w, h, o.crack || 0); flowLines(cx, cy, w, h, T, o.flow || 0); }
function sceneFrozen(T) { cabinWall(T, 0.6); const cx = 470, cy = 520, w = 300, h = 420; skyView(cx, cy, w, h, 1, T); frost(cx, cy, w, h, 0.9, 1); windowFrame(cx, cy, w, h, 1);
  const sx = S(T * 40) * 4; cutout('ginger', -60 + sx, 330, 960, true, 'rgba(140,190,255,0.22)');
  g.save(); g.strokeStyle = 'rgba(210,235,255,0.95)'; g.lineWidth = 5; for (let i = 0; i < 6; i++) { g.beginPath(); g.moveTo(205 + i * 20 + sx, 640); g.lineTo(208 + i * 20 + sx, 664 + (i % 2) * 12); g.stroke(); } g.restore();
  g.save(); g.fillStyle = 'rgba(14,10,8,0.85)'; g.beginPath(); g.roundRect(480, 200, 180, 90, 20); g.fill(); g.fillStyle = '#8ad8ff'; g.font = '600 52px CapFont'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('-50°C', 570, 247); g.restore(); }
function sceneLayers(T) { cabinWall(T, 0.8); const k = ease(prog(T, E.c4, E.air)), air = ease(prog(T, E.air - 0.1, E.cold)); const cx = 360, cy = 560;
  // exploded side view of the window: outer pane, middle pane, inner pane with an air gap
  const panes = [[-140, '#b8d8f0', 'outer'], [0, '#c8e0f4', 'middle'], [140, '#d8e8f8', 'inner']]; panes.forEach(([dx, col], i) => { const show = i === 0 ? 1 : i === 1 ? k : ease(prog(T, E.air, E.air + 0.6)); if (show <= 0) return; g.save(); g.globalAlpha = show; g.translate(cx + dx * (0.4 + 0.6 * show), cy); g.transform(1, 0.25, 0, 1, 0, 0); g.fillStyle = col; line(6); g.beginPath(); g.roundRect(-40, -230, 80, 460, 40); g.fill(); g.stroke(); g.restore(); });
  if (air > 0) { g.save(); g.globalAlpha = air; for (let i = 0; i < 18; i++) { const x = cx - 70 + (i % 3) * 70 + S(T * 2 + i) * 10, y = cy - 180 + ((i * 47 + T * 40) % 360); g.fillStyle = 'rgba(255,255,255,0.5)'; g.beginPath(); g.arc(x, y, 6, 0, 7); g.fill(); } g.restore(); }
  const cold = ease(prog(T, E.cold, E.much)); g.save(); g.globalAlpha = 1 - cold * 0.7; g.fillStyle = '#8ad8ff'; g.font = '600 44px CapFont'; g.textAlign = 'center'; g.fillText('-50°C', 130, 300); g.restore(); g.save(); g.globalAlpha = 0.4 + cold * 0.6; g.fillStyle = '#ffb070'; g.font = '600 44px CapFont'; g.textAlign = 'center'; g.fillText('+22°C', 600, 300); g.restore();
  for (let i = 0; i < 5; i++) { const y = 350 + i * 80; const x = 130 + ((T * 120 + i * 40) % 160); if (cold > 0.5 && x > 210) continue; g.save(); g.strokeStyle = '#8ad8ff'; g.lineWidth = 5; g.beginPath(); g.moveTo(x - 40, y); g.lineTo(x, y); g.lineTo(x - 12, y - 10); g.moveTo(x, y); g.lineTo(x - 12, y + 10); g.stroke(); g.restore(); } }
function sceneHole(T) { const z = 1 + ease(prog(T, E.c5, E.hole + 0.6)) * 1.8; g.save(); g.translate(360, 560); g.scale(z, z); g.translate(-360, -560); sceneWindow(T, { round: 1, frost: Math.max(0, 0.5 - prog(T, E.fog, E.fog + 1.2) * 0.5) }); g.restore();
  const hk = prog(T, E.hole - 0.1, E.hole + 0.3); if (hk > 0) { g.save(); g.globalAlpha = hk; g.fillStyle = INK; g.beginPath(); g.arc(360, 760, 10, 0, 7); g.fill(); g.strokeStyle = '#ffd34a'; g.lineWidth = 6; g.beginPath(); g.arc(360, 760, 44 + 6 * S(T * 8), 0, 7); g.stroke(); g.restore(); } }
function sceneSeat(T) { cover(IMG.calm, 1.04 + 0.03 * prog(T, E.c6, E.bro), 0.5, 0.5); vignette(0.35); }
function sceneBro(T) { cover(IMG.calm, 1.04, 0.5, 0.5); g.fillStyle = 'rgba(20,14,10,0.55)'; g.fillRect(0, 0, W, H);
  // swapped: your bro (dark hair, phone) now in the window seat, you (ginger) shoved into the aisle seat
  cutout('ginger', -10, 430, 760, false); cutout('dark', 300, 420, 780, false);
  g.save(); g.fillStyle = '#fff'; g.font = '600 46px CapFont'; g.fillText('?!', 150, 470 + 6 * S(T * 9)); g.restore(); }
// ---------- frame ----------
window.DURATION = TM.total;
const CAPS = []; CL.forEach(c0 => { let cur = []; const flush = () => { if (cur.length) CAPS.push({ a: cur[0].a, b: cur[cur.length - 1].b, t: cur.map(w => w.w).join(' ') }); cur = []; }; c0.words.forEach(w0 => { const w = Object.assign({}, w0, { w: w0.w.toLowerCase() === 'fucking' ? 'f***ing' : w0.w.toLowerCase() === 'fifty' ? '50' : w0.w }); const prev = cur[cur.length - 1]; if (cur.length && (cur.length >= 3 || w.a - prev.b > 0.25 || /[.,!?]$/.test(prev.w))) flush(); cur.push(w); }); flush(); });
CAPS.forEach((c, i) => { const nx = CAPS[i + 1]; c.b = nx ? Math.min(nx.a, c.b + 0.3) : c.b + 0.6; });
window.renderFrame = function (T) { const loop = T >= E.loop; const ci = loop ? 0 : CLI(T); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, W, H);
  if (ci === 0) sceneBoom(loop ? 0.3 : T, prog(T, 0, E.c1));
  else if (ci === 1) { if (T < E.piles - 0.1) { cover(IMG.calm, 1.0 + 0.9 * ease(prog(T, E.c1, E.piles)), 0.82, 0.55); vignette(0.3); } else sceneWindow(T, { round: 0, stress: ease(prog(T, E.piles, E.crack)), crack: prog(T, E.crack - 0.05, E.crack + 0.4) }); }
  else if (ci === 2) sceneWindow(T, { round: ease(prog(T, E.c2 + 0.2, E.nocorner + 0.3)), stress: 1 - ease(prog(T, E.c2, E.nocorner)), flow: ease(prog(T, E.flows - 0.2, E.flows + 0.3)) });
  else if (ci === 3) { if (T < E.frozen - 0.1) sceneWindow(T, { round: 1, frost: ease(prog(T, E.c3, E.frozen)) }); else sceneFrozen(T); }
  else if (ci === 4) sceneLayers(T);
  else if (ci === 5) sceneHole(T);
  else { if (T < E.bro - 0.2) sceneSeat(T); else sceneBro(T); }
  // cut punch-in + grain + warm grade
  grain(0.06); vignette(0.45);
  const cap_ = CAPS.find(c => T >= c.a && T < c.b); if (cap_ && !loop) cap(cap_.t); };
window.frame = (t, q) => { window.renderFrame(t); return cv.toDataURL('image/jpeg', q || 0.92); };
const load = (src) => new Promise(r => { const im = new Image(); im.onload = () => r(im); im.src = src; });
window.ready = (async () => { cv = document.getElementById('c'); g = cv.getContext('2d'); IMG.calm = await load(window.IMGDATA.calm); IMG.boom = await load(window.IMGDATA.boom); await document.fonts.load('600 48px CapFont');
  GRAIN = document.createElement('canvas'); GRAIN.width = 256; GRAIN.height = 256; const gc = GRAIN.getContext('2d'); const id = gc.createImageData(256, 256); const r = rng(3); for (let i = 0; i < id.data.length; i += 4) { const v = 90 + r() * 80; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; } gc.putImageData(id, 0, 0); })();
})();
