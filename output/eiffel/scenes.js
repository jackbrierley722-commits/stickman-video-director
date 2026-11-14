// Why the Eiffel Tower grows. Paper-collage style: torn cut-outs, tape, kraft paper, stop-motion jitter.
(() => {
const W = 720, H = 1280; const TM = window.TIMING, CL = TM.clips; const S = Math.sin, C = Math.cos, PI = Math.PI;
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), lerp = (a, b, t) => a + (b - a) * t, ease = t => { t = clamp(t); return t * t * (3 - 2 * t); }, prog = (t, a, b) => clamp((t - a) / (b - a));
const back = t => { t = clamp(t); const s = 1.7; return 1 + (s + 1) * (t - 1) ** 3 + s * (t - 1) ** 2; };
function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
function AT(ci, word, n = 0) { let k = 0; for (const w of CL[ci].words) if (w.w.toLowerCase().replace(/[^a-z0-9']/g, '') === word) { if (k === n) return w.a; k++; } return CL[ci].start; }
function CLI(T) { let ci = CL.findIndex(c => T >= c.start && T < c.start + c.dur); return ci < 0 ? CL.length - 1 : ci; }
let cv, x; const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d')]; };
let TQ = 0, BOIL = 0; // stop-motion clock (12 fps) and boil frame (8 fps)
const bj = (id, a = 1.2) => { const r = rng(id * 7919 + BOIL * 104729); return [(r() - 0.5) * 2 * a, (r() - 0.5) * 2 * a, (r() - 0.5) * 0.012 * a]; };

// ---------- paper making ----------
let GRAIN, KRAFT, HALF;
function grainTex() { const [c, g] = mk(256, 256); const id = g.createImageData(256, 256); const r = rng(5); for (let i = 0; i < id.data.length; i += 4) { const v = 128 + (r() - 0.5) * 70; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; } g.putImageData(id, 0, 0); g.strokeStyle = 'rgba(90,70,40,0.18)'; for (let i = 0; i < 160; i++) { g.lineWidth = 0.6 + r(); g.beginPath(); const x0 = r() * 256, y0 = r() * 256; g.moveTo(x0, y0); g.quadraticCurveTo(x0 + (r() - 0.5) * 30, y0 + (r() - 0.5) * 30, x0 + (r() - 0.5) * 40, y0 + (r() - 0.5) * 40); g.stroke(); } return c; }
function tornPath(g, pts, seed, amp = 3, step = 7) { const r = rng(seed); g.beginPath(); pts.forEach((p, i) => { const q = pts[(i + 1) % pts.length]; const L = Math.hypot(q[0] - p[0], q[1] - p[1]); const n = Math.max(1, Math.floor(L / step)); const nx = -(q[1] - p[1]) / (L || 1), ny = (q[0] - p[0]) / (L || 1); for (let k = 0; k < n; k++) { const t = k / n, j = (r() - 0.5) * amp * 2; const X = lerp(p[0], q[0], t) + nx * j, Y = lerp(p[1], q[1], t) + ny * j; if (i === 0 && k === 0) g.moveTo(X, Y); else g.lineTo(X, Y); } }); g.closePath(); }
function circPts(cx, cy, r, n = 40) { const o = []; for (let i = 0; i < n; i++) o.push([cx + C(i / n * PI * 2) * r, cy + S(i / n * PI * 2) * r]); return o; }
// a cut-out: white paper border (torn), coloured paper inside, grain on top
function cut(w, h, shapeFn, fill, seed, opt = {}) { const pad = 14; const [c, g] = mk(w + pad * 2, h + pad * 2); g.translate(pad, pad);
  if (opt.border !== false) { g.save(); g.fillStyle = '#fbf8f0'; shapeFn(g, opt.borderW || 6, seed + 1); g.fill(opt.evenodd ? 'evenodd' : 'nonzero'); g.restore(); }
  g.save(); shapeFn(g, 0, seed); g.clip(opt.evenodd ? 'evenodd' : 'nonzero'); g.fillStyle = fill; g.fillRect(-pad, -pad, w + pad * 2, h + pad * 2); if (opt.inner) opt.inner(g, w, h); g.globalCompositeOperation = 'multiply'; g.globalAlpha = 0.35; g.drawImage(GRAIN, -pad, -pad, w + pad * 2, h + pad * 2); g.restore();
  return { c, w: w + pad * 2, h: h + pad * 2 }; }
const rectShape = (w, h, a = 3) => (g, grow, seed) => tornPath(g, [[-grow, -grow], [w + grow, -grow], [w + grow, h + grow], [-grow, h + grow]], seed, a);
const circShape = (cx, cy, r, a = 2.5) => (g, grow, seed) => tornPath(g, circPts(cx, cy, r + grow, 48), seed, a, 6);
// place a cut-out with a drop shadow, boiling slightly
function put(o, cx, cy, rot = 0, sc = 1, id = 1, alpha = 1, sx = 1, sy = 1, skew = 0) { if (alpha <= 0 || sc <= 0) return; const [jx, jy, jr] = bj(id); x.save(); x.globalAlpha = alpha; x.translate(cx + jx, cy + jy); x.rotate(rot + jr); x.scale(sc * sx, sc * sy); if (skew) x.transform(1, 0, skew, 1, 0, 0);
  x.shadowColor = 'rgba(40,25,10,0.38)'; x.shadowBlur = 12; x.shadowOffsetX = 5; x.shadowOffsetY = 8; x.drawImage(o.c, -o.w / 2, -o.h / 2); x.restore(); }
function tape(cx, cy, rot, w = 90, id = 3) { const [jx, jy] = bj(id, 0.8); x.save(); x.translate(cx + jx, cy + jy); x.rotate(rot); x.fillStyle = 'rgba(245,235,190,0.62)'; tornPath(x, [[-w / 2, -14], [w / 2, -14], [w / 2, 14], [-w / 2, 14]], id, 2.5, 5); x.fill(); x.globalAlpha = 0.25; x.globalCompositeOperation = 'multiply'; x.drawImage(GRAIN, -w / 2, -14, w, 28); x.restore(); }

// ---------- assets ----------
const A = {};
// real proportions in a 420 x 900 box (900 px = 330 m): floors at 57 m, 116 m, 276 m; base 125 m wide
const TW = { cx: 210, y1: 745, y2: 584, y3: 147 };
function bez(p0, p1, p2, n = 14) { const o = []; for (let i = 0; i <= n; i++) { const t = i / n; o.push([(1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * p1[0] + t * t * p2[0], (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * p1[1] + t * t * p2[1]]); } return o; }
function towerRight(grow) { // outer right edge, top to bottom (offsets from centre)
  const g = grow; let p = [[2 + g, 0], [2 + g, 60], [6 + g, 100], [14 + g, 122], [14 + g, 136], [22 + g, 136], [22 + g, 150], [16 + g, 152]];
  p = p.concat(bez([16 + g, 152], [28 + g, 430], [54 + g, 574]).slice(1)); p.push([70 + g, 576], [70 + g, 594], [58 + g, 596]);
  p = p.concat(bez([58 + g, 596], [70 + g, 680], [98 + g, 733]).slice(1)); p.push([122 + g, 735], [122 + g, 762], [104 + g, 764]);
  p = p.concat(bez([104 + g, 764], [128 + g, 850], [178 + g, 900 + g]).slice(1)); return p; }
function towerArch(grow) { // inner leg + big decorative arch, from right foot to centre
  const g = grow; return [[118 - g, 900 + g]].concat(bez([118 - g, 900 + g], [96 - g, 830], [78 - g, 800]).slice(1)).concat(bez([78 - g, 800], [40, 776 - g], [0, 772 - g]).slice(1)); }
function towerShape(g, grow, seed) { const cx = TW.cx; const R = towerRight(grow), A_ = towerArch(grow);
  const pts = R.map(([a, b]) => [cx + a, b]).concat(A_.map(([a, b]) => [cx + a, b])).concat(A_.slice(0, -1).reverse().map(([a, b]) => [cx - a, b])).concat(R.slice().reverse().map(([a, b]) => [cx - a, b]));
  tornPath(g, pts, seed, 1.6, 6);
  // open gap between the legs from the 1st floor up to just under the 2nd
  const gp = [[0, 606 + grow], [14 - grow, 650], [30 - grow, 726 - grow], [-30 + grow, 726 - grow], [-14 + grow, 650]].map(([a, b]) => [cx + a, b]); { const r = rng(seed + 5); g.moveTo(gp[0][0], gp[0][1]); gp.slice(1).forEach(q => g.lineTo(q[0] + (r() - 0.5) * 2, q[1])); g.closePath(); } }
function latticeInner(g, w, h) { const cx = TW.cx; g.fillStyle = '#7a4a30'; g.fillRect(0, 0, w, h);
  // X-bracing: finer up the spire, bigger down the legs
  g.strokeStyle = 'rgba(36,18,8,0.6)'; for (const [y0, y1, sp, lw] of [[150, 576, 12, 1.3], [596, 735, 16, 1.8], [764, 900, 22, 2.2]]) { g.save(); g.beginPath(); g.rect(0, y0, w, y1 - y0); g.clip(); g.lineWidth = lw; for (let k = -h; k < w + h; k += sp) { g.beginPath(); g.moveTo(k, y0); g.lineTo(k + (y1 - y0) * 0.6, y1); g.stroke(); g.beginPath(); g.moveTo(k, y0); g.lineTo(k - (y1 - y0) * 0.6, y1); g.stroke(); } g.restore(); }
  // leg rails following the silhouette
  const R = towerRight(0); g.strokeStyle = 'rgba(30,14,6,0.75)'; g.lineWidth = 4; for (const sx of [1, -1]) { g.beginPath(); R.slice(7).forEach(([a, b], i) => { const X = cx + sx * (a - 6); i ? g.lineTo(X, b) : g.moveTo(X, b); }); g.stroke(); }
  // decorative arch band
  g.lineWidth = 7; g.strokeStyle = 'rgba(30,14,6,0.8)'; g.beginPath(); towerArch(0).forEach(([a, b], i) => i ? g.lineTo(cx + a, b - 8) : g.moveTo(cx + a, b - 8)); g.stroke(); g.beginPath(); towerArch(0).forEach(([a, b], i) => i ? g.lineTo(cx - a, b - 8) : g.moveTo(cx - a, b - 8)); g.stroke();
  // platforms (girders + railing)
  g.fillStyle = '#4a2a18'; for (const [y, hw, hh] of [[735, 122, 27], [576, 70, 18], [136, 22, 14]]) { g.fillRect(cx - hw, y, hw * 2, hh); g.fillStyle = 'rgba(230,190,140,0.35)'; for (let X = cx - hw + 4; X < cx + hw - 4; X += 7) g.fillRect(X, y + 3, 2, hh * 0.45); g.fillStyle = '#4a2a18'; }
  g.fillStyle = 'rgba(255,215,170,0.16)'; for (let yy = 0; yy < h; yy += 7) for (let xx = (yy / 7) % 2 * 3.5; xx < w; xx += 7) { g.beginPath(); g.arc(xx, yy, 1.3, 0, 7); g.fill(); } }
function buildAssets() {
  A.tower = cut(420, 900, towerShape, '#7a4a30', 11, { inner: latticeInner, evenodd: true, borderW: 5 });
  A.sun = cut(240, 240, (g, gr, sd) => { const r = rng(sd); g.beginPath(); for (let i = 0; i < 24; i++) { const a = i / 24 * PI * 2, R = (i % 2 ? 84 : 118) + gr + (r() - 0.5) * 6; i ? g.lineTo(120 + C(a) * R, 120 + S(a) * R) : g.moveTo(120 + C(a) * R, 120 + S(a) * R); } g.closePath(); }, '#f6b72a', 21, { inner: (g) => { g.fillStyle = '#f9d24a'; g.beginPath(); g.arc(120, 120, 70, 0, 7); g.fill(); g.fillStyle = '#5a3a14'; for (const sx of [-1, 1]) { g.beginPath(); g.arc(120 + sx * 24, 108, 7, 0, 7); g.fill(); } g.lineWidth = 6; g.strokeStyle = '#5a3a14'; g.beginPath(); g.arc(120, 124, 26, 0.3, PI - 0.3); g.stroke(); } });
  A.snow = cut(150, 150, (g, gr, sd) => { g.beginPath(); for (let i = 0; i < 12; i++) { const a = i / 12 * PI * 2, R = (i % 2 ? 26 : 70) + gr; i ? g.lineTo(75 + C(a) * R, 75 + S(a) * R) : g.moveTo(75 + C(a) * R, 75 + S(a) * R); } g.closePath(); }, '#e8f4ff', 31);
  A.ruler = cut(70, 760, rectShape(70, 760, 2), '#f2d44a', 41, { inner: (g, w, h) => { g.fillStyle = '#2a2014'; g.font = '20px Russo'; for (let y = 0; y < h; y += 19) { g.fillRect(0, y, y % 95 === 0 ? 34 : 18, 3); if (y % 95 === 0) g.fillText(String(Math.round((h - y) / 19)), 38, y + 8); } } });
  A.paper = (w, h, col, sd) => cut(w, h, rectShape(w, h, 3), col, sd);
  A.atomC = ['#e8553a', '#3a7ad8', '#f6b72a', '#5ab070'].map((col, i) => cut(56, 56, circShape(28, 28, 27), col, 50 + i));
  A.thermo = cut(90, 380, (g, gr, sd) => { tornPath(g, [[30 - gr, 0 - gr], [60 + gr, 0 - gr], [60 + gr, 290], [86 + gr, 330], [45, 380 + gr], [4 - gr, 330], [30 - gr, 290]], sd, 2); }, '#f4f0e8', 61, { inner: (g) => { g.fillStyle = '#c83a2a'; g.beginPath(); g.arc(45, 335, 32, 0, 7); g.fill(); g.fillRect(38, 40, 14, 300); g.fillStyle = '#2a2014'; for (let y = 40; y < 290; y += 25) g.fillRect(56, y, 12, 3); } });
  A.mstick = cut(620, 70, rectShape(620, 70, 2), '#d8a868', 71, { inner: (g, w, h) => { g.fillStyle = '#2a2014'; g.font = '18px Russo'; for (let k = 0; k <= 100; k++) { const X = 10 + k * 6; g.fillRect(X, 0, 2, k % 10 ? 14 : 28); if (k % 10 === 0 && k < 100) g.fillText(String(k), X + 4, 46); } g.fillText('1 METRE', 520, 60); } });
  A.lens = cut(260, 260, circShape(130, 130, 125), '#f8f4ea', 81, { inner: (g) => { g.strokeStyle = '#2a2014'; g.lineWidth = 8; g.beginPath(); g.arc(130, 130, 116, 0, 7); g.stroke(); } });
  A.flower = cut(200, 420, (g, gr, sd) => { g.beginPath(); g.rect(92 - gr, 160, 16 + gr * 2, 260 + gr); for (let i = 0; i < 14; i++) { const a = i / 14 * PI * 2; g.moveTo(100 + C(a) * 30, 90 + S(a) * 30); g.ellipse(100 + C(a) * 62, 90 + S(a) * 62, 36 + gr, 16 + gr, a, 0, 7); } g.moveTo(160, 90); g.arc(100, 90, 50 + gr, 0, 7); g.moveTo(108, 300); g.ellipse(140, 290, 40 + gr, 16 + gr, -0.5, 0, 7); }, '#f6c22a', 91, { inner: (g) => { g.fillStyle = '#3a8a3a'; g.fillRect(92, 140, 16, 300); g.beginPath(); g.ellipse(140, 290, 40, 16, -0.5, 0, 7); g.fill(); g.fillStyle = '#6a3a14'; g.beginPath(); g.arc(100, 90, 44, 0, 7); g.fill(); g.fillStyle = 'rgba(30,15,5,0.5)'; for (let i = 0; i < 40; i++) { const a = i * 2.4, rr = Math.sqrt(i) * 6; g.beginPath(); g.arc(100 + C(a) * rr, 90 + S(a) * rr, 2.5, 0, 7); g.fill(); } } });
  A.sky = cut(760, 1080, rectShape(760, 1080, 4), '#8cc4e8', 301, { border: false, inner: (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#5aa4dc'); gr.addColorStop(1, '#bfe2f4'); g.fillStyle = gr; g.fillRect(0, 0, w, h); } });
  A.cloud = [0, 1, 2].map(i => cut(240, 110, (g, gr, sd) => { g.beginPath(); for (const [cx, cy, rr] of [[60, 70, 40], [110, 50, 50], [165, 62, 42], [200, 80, 28], [35, 85, 25]]) { g.moveTo(cx + rr + gr, cy); g.arc(cx, cy, rr + gr, 0, 7); } g.rect(30 - gr, 70, 175 + gr * 2, 38 + gr); }, '#fbfbf6', 310 + i));
  A.city = cut(760, 230, (g, gr, sd) => { const r = rng(sd + 9); const pts = [[-gr, 230 + gr]]; let X = -gr; while (X < 760 + gr) { const w = 50 + r() * 70, h = 80 + r() * 110; pts.push([X, 230 - h], [X + w * 0.15, 230 - h - 22 - r() * 12], [X + w * 0.85, 230 - h - 22 - r() * 12], [X + w, 230 - h]); X += w + 4; } pts.push([760 + gr, 230 + gr]); tornPath(g, pts, sd, 1.6, 5); }, '#d8d0c0', 320, { inner: (g, w, h) => { const r = rng(4); g.fillStyle = '#5a6a7a'; for (let y = 0; y < 60; y++) g.fillRect(0, y * 1, w, 1); g.fillStyle = '#e8e2d4'; g.fillRect(0, 50, w, h); g.fillStyle = 'rgba(60,70,90,0.55)'; for (let yy = 80; yy < h; yy += 30) for (let xx = 10; xx < w; xx += 22) if (r() > 0.25) g.fillRect(xx, yy, 9, 16); } });
  A.tree = [0, 1].map(i => cut(170, 260, (g, gr, sd) => { g.beginPath(); g.rect(76 - gr, 150, 18 + gr * 2, 110 + gr); for (const [cx, cy, rr] of [[85, 90, 70], [45, 120, 45], [125, 120, 45]]) { g.moveTo(cx + rr + gr, cy); g.arc(cx, cy, rr + gr, 0, 7); } }, '#4a9a42', 330 + i, { inner: (g) => { g.fillStyle = '#6a4a2a'; g.fillRect(76, 150, 18, 120); g.fillStyle = '#3e8a38'; for (const [cx, cy, rr] of [[85, 90, 70], [45, 120, 45], [125, 120, 45]]) { g.beginPath(); g.arc(cx, cy, rr, 0, 7); g.fill(); } g.fillStyle = 'rgba(160,220,120,0.35)'; g.beginPath(); g.arc(70, 70, 30, 0, 7); g.fill(); } }));
  A.grass = cut(780, 360, (g, gr, sd) => { const r = rng(sd); const pts = [[-gr, 360 + gr], [-gr, 40]]; for (let X = 0; X <= 780; X += 12) pts.push([X, 30 - gr - r() * 14]); pts.push([780 + gr, 40], [780 + gr, 360 + gr]); tornPath(g, pts, sd, 1.5, 6); }, '#6abc4a', 340, { inner: (g, w, h) => { for (let k = 0; k < 7; k++) { g.fillStyle = k % 2 ? '#5aac3e' : '#78c854'; g.beginPath(); g.moveTo(390 + (k - 3.5) * 40, 30); g.lineTo(390 + (k - 2.5) * 40, 30); g.lineTo(390 + (k - 2.5) * 260, h); g.lineTo(390 + (k - 3.5) * 260, h); g.closePath(); g.fill(); } g.fillStyle = '#e8d8b0'; g.beginPath(); g.moveTo(360, 30); g.lineTo(420, 30); g.lineTo(560, h); g.lineTo(220, h); g.closePath(); g.fill(); } });
  A.news = [0, 1, 2].map(i => cut(260, 340, rectShape(260, 340, 4), '#ece6d6', 100 + i, { inner: (g, w, h) => { const r = rng(200 + i); g.fillStyle = '#3a3428'; g.font = '30px P8'; g.fillText(['LE MATIN', 'PARIS', '1889'][i], 14, 40); g.fillRect(14, 50, w - 28, 3); g.fillStyle = 'rgba(40,36,28,0.55)'; for (let y = 70; y < h - 10; y += 12) { let X = 14; while (X < w - 20) { const l = 10 + r() * 40; g.fillRect(X, y, Math.min(l, w - 14 - X), 5); X += l + 6; } } } }));
}
// text on a torn paper strip (consistent fonts: Russo for labels)
const STRIP = {}; function strip(txt_, size, bg, fg, font = 'Russo') { const k = txt_ + size + bg + fg + font; if (STRIP[k]) return STRIP[k]; const [m, mg] = mk(10, 10); mg.font = `${size}px ${font}`; const tw = mg.measureText(txt_).width; const w = Math.ceil(tw + size * 0.9), h = Math.ceil(size * 1.45);
  const o = cut(w, h, rectShape(w, h, 2.5), bg, (txt_.length * 31 + size) | 0, { inner: (g) => { g.fillStyle = fg; g.font = `${size}px ${font}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt_, w / 2, h / 2 + size * 0.06); } }); STRIP[k] = o; return o; }
function label(txt_, cx, cy, size, t0, T, o = {}) { if (T < t0) return; const k = Math.floor((T - t0) * 12); const sc = k === 0 ? 1.35 : k === 1 ? 1.1 : 1; const st = strip(txt_, size, o.bg || '#fbf8f0', o.fg || '#1e1a14', o.font); const rot = o.rot != null ? o.rot : ((txt_.length % 5) - 2) * 0.012; put(st, cx, cy, rot, sc, txt_.length + size, 1); if (o.tape) tape(cx - st.w / 2 + 10, cy - st.h / 2 + 4, -0.6, 70, txt_.length); }

// ---------- timing ----------
const E = { grows: AT(0, 'grows'), up: AT(0, 'up'), nobody: AT(0, 'and'), iron: CL[1].start, over: AT(1, 'over'), heat: CL[2].start, shake: AT(2, 'shake'), push: AT(2, 'and'), metre: CL[3].start, about3: AT(3, 'about'), deg: AT(3, 'degree'),
  tiny: CL[4].start, but: AT(4, 'but'), from: AT(4, 'from'), adds: AT(4, 'that'), fifteen: AT(4, 'fifteen'), like: CL[5].start, follow5: AT(5, 'follow'), sunny: CL[6].start, side: AT(6, 'that'), leans: AT(6, 'so'), flower: AT(6, 'like'), cmt: CL[7].start, because: AT(7, 'because') };
E.loop = TM.total - 0.35;

// ---------- scenes ----------
function bg() { x.drawImage(KRAFT, 0, 0); }
function towerAt(cx, baseY, sc, grow = 0, skew = 0, id = 7) { const o = A.tower; const sy = 1 + grow; put(o, cx, baseY - (o.h / 2) * sc * sy, 0, sc, id, 1, 1, sy, skew); }
function rulerAt(cx, baseY, sc, mark, T) { put(A.ruler, cx, baseY - A.ruler.h / 2 * sc, 0.02, sc, 13); tape(cx, baseY - A.ruler.h * sc + 18, 0.1, 80, 14); if (mark != null) { const ln = (m_, col) => { const y = baseY - A.ruler.h * sc * m_; x.save(); x.strokeStyle = col; x.lineWidth = 6; x.setLineDash([14, 10]); x.beginPath(); x.moveTo(cx - 260, y); x.lineTo(cx + 30, y); x.stroke(); x.restore(); }; ln(0.95, 'rgba(30,26,20,0.7)'); if (mark > 0.955) ln(mark, '#c8281e'); } }
function landscape(T) { put(A.sky, 360, 536, 0, 1.02, 50); [[140, 330, 0], [470, 230, 1], [640, 420, 2]].forEach(([cx, cy, i], k) => put(A.cloud[i], (cx + TQ * (6 + k * 3)) % 860 - 50, cy, 0, 0.9 - k * 0.1, 51 + k));
  put(A.city, 360, 945, 0, 1, 54); put(A.tree[0], 70, 990, -0.03, 0.9, 55); put(A.tree[1], 660, 1010, 0.03, 0.75, 56); put(A.grass, 360, 1150, 0, 1, 57); }
function hookScene(T, loop) { const g = loop ? 0 : ease(prog(TQ, E.up - 0.2, E.up + 0.8)) * (1 - ease(prog(TQ, E.nobody + 0.3, E.nobody + 1.0)) * 0.0); const grow = g * 0.07;
  landscape(T);
  towerAt(330, 1180, 0.8, grow); rulerAt(600, 1180, 0.9, 0.95 + grow * 0.9, T);
  if (g > 0.05) { put(A.sun, 590, 250, S(TQ * 3) * 0.08, 0.75 * ease(prog(TQ, E.up - 0.2, E.up + 0.1)), 15); label('+15 CM', 560, 560, 46, E.up, T, { bg: '#c8281e', fg: '#fff', tape: true }); }
  label('NOBODY TELLS YOU', 340, 165, 50, -1, T, { bg: '#1e1a14', fg: '#fbf8f0' }); label('THE EIFFEL TOWER GROWS', 340, 255, 48, -1, T, { tape: true });
  if (!loop && T > E.nobody) label('AND NOBODY TOUCHES IT', 340, 345, 40, E.nobody, T, { bg: '#f2d44a' });
  x.save(); x.font = '30px Caveat'; x.fillStyle = 'rgba(30,26,20,0.75)'; x.fillText('(not to scale)', 70, 1235); x.restore(); }
function ironScene(T) { put(A.news[2], 590, 300, 0.08, 1, 43); const z = 1.6 + ease(prog(TQ, E.iron, E.over + 1)) * 0.3; towerAt(360, 1300 + 820 * (z - 1.6), z, 0, 0, 7);
  label('IRON', 250, 230, 96, E.iron + 0.25, T, { bg: '#1e1a14', fg: '#f2d44a', tape: true }); label('7,300 TONNES', 330, 360, 52, E.over, T, { bg: '#c8281e', fg: '#fff' }); }
function atomsScene(T) { const hot = ease(prog(TQ, E.heat + 0.4, E.push + 0.3)); const sp = 92 + hot * 46, amp = 3 + hot * 16; const cx = 360, cy = 680;
  put(A.thermo, 92, 640, 0.04, 1, 16);
  for (let i = -2; i <= 2; i++) for (let j = -2; j <= 2; j++) { const id = (i + 3) * 10 + j; const r = rng(id); const ph = TQ * (6 + hot * 10) + r() * 7; put(A.atomC[(i + j + 4) % 4], cx + 40 + i * sp + S(ph) * amp, cy + j * sp + C(ph * 1.3) * amp, 0, 0.9, 200 + id); }
  if (hot > 0.05) put(A.sun, 610, 300, S(TQ * 3) * 0.08, 0.6 * ease(prog(TQ, E.heat + 0.3, E.heat + 0.6)), 17);
  label('HEAT', 360, 200, 72, E.heat + 0.3, T, { bg: '#c8281e', fg: '#fff', tape: true }); if (T > E.shake) label('ATOMS SHAKE', 360, 1000, 44, E.shake, T); if (T > E.push) label('AND PUSH APART', 360, 1070, 44, E.push, T, { bg: '#f2d44a' }); }
function metreScene(T) { put(A.mstick, 360, 640, -0.02, 1, 18); const zk = ease(prog(TQ, E.about3 - 0.2, E.about3 + 0.4)); if (zk > 0) { put(A.lens, 600, 470, 0, zk, 19); x.save(); x.translate(600, 470); x.rotate(-0.02); x.fillStyle = '#2a2014'; x.font = '26px Russo'; x.textAlign = 'center'; x.globalAlpha = zk; x.fillText('+0.012 MM', 0, -10); x.fillRect(-90, 20, 150, 10); x.fillStyle = '#c8281e'; x.fillRect(60, 20, 26, 10); x.restore(); }
  label('EVERY METRE', 320, 300, 58, E.metre + 0.1, T, { tape: true }); label('GROWS A TINY BIT', 330, 400, 44, AT(3, 'grows'), T, { bg: '#f2d44a' }); if (T > E.deg) label('PER DEGREE', 360, 860, 52, E.deg, T, { bg: '#c8281e', fg: '#fff' }); }
function mathScene(T) { const cards = [['300 M', E.but + 0.5, '#fbf8f0'], ['× 40°C', E.from + 0.2, '#e8f4ff'], ['× 0.012 MM', E.from + 1.1, '#f2d44a']];
  label('TINY.', 360, 200, 90, E.tiny, T, { bg: '#1e1a14', fg: '#fbf8f0' }); if (T > E.but) { const sc = 0.55; towerAt(150, 1120, sc, 0, 0, 7); }
  cards.forEach(([s_, t_, col], i) => { if (T > t_) label(s_, 470, 430 + i * 120, 60, t_, T, { bg: col, rot: (i - 1) * 0.03 }); });
  if (T > E.adds) { x.save(); x.fillStyle = '#1e1a14'; x.fillRect(260, 780, 420, 8); x.restore(); label('= 14.4 CM', 470, 860, 64, E.adds + 0.2, T, { bg: '#fbf8f0' }); }
  if (T > E.fifteen) label('≈ 15 CM', 470, 990, 92, E.fifteen, T, { bg: '#c8281e', fg: '#fff', tape: true }); }
function likeScene(T) { hookScene(T, true); const k = prog(TQ, E.like, E.like + 0.2); x.save(); x.fillStyle = `rgba(30,22,12,${0.35 * k})`; x.fillRect(0, 0, W, H); x.restore();
  label('♥ LIKE', 250, 640, 64, E.like, T, { bg: '#c8281e', fg: '#fff', tape: true }); label(T > E.follow5 + 0.2 ? 'FOLLOWING ✓' : '+ FOLLOW', 470, 760, 56, E.follow5 - 0.2, T, { bg: T > E.follow5 + 0.2 ? '#5ab070' : '#f2d44a' }); label('IT GETS WEIRDER', 360, 420, 46, AT(5, 'it'), T, { bg: '#1e1a14', fg: '#fbf8f0' }); }
function leanScene(T) { const one = ease(prog(TQ, E.side - 0.1, E.side + 0.6)), lean = ease(prog(TQ, E.leans, E.leans + 0.8)); put(A.sun, 110, 360, S(TQ * 3) * 0.08, 0.9, 20);
  x.save(); x.globalAlpha = 0.28 * one; x.fillStyle = '#f9d24a'; x.beginPath(); x.moveTo(110, 360); x.lineTo(320, 380); x.lineTo(320, 1180); x.closePath(); x.fill(); x.restore();
  towerAt(390, 1180, 0.95, 0, lean * 0.2, 7); if (lean > 0.1) { x.save(); x.font = '30px Caveat'; x.fillStyle = 'rgba(30,26,20,0.75)'; x.fillText('(very not to scale)', 60, 1235); x.restore(); }
  if (T > E.flower - 0.1) { const fk = prog(TQ, E.flower - 0.1, E.flower + 0.2); put(A.flower, 630, 1010, -0.35 * ease(prog(TQ, E.flower + 0.2, E.flower + 0.8)), 0.62 * fk, 22); }
  label('ONE SIDE HEATS UP', 380, 200, 44, E.sunny + 0.3, T, { tape: true }); if (T > E.leans) label('LEANS AWAY FROM THE SUN', 380, 290, 38, E.leans + 0.2, T, { bg: '#c8281e', fg: '#fff' }); if (T > E.flower) label('SUNFLOWER . IN REVERSE', 380, 380, 34, E.flower + 0.1, T, { bg: '#f2d44a' }); }
function commentScene(T) { const shrink = ease(prog(TQ, E.because + 0.3, E.because + 1.2)); landscape(T); towerAt(330, 1180, 0.8, 0.07 * (1 - shrink)); rulerAt(600, 1180, 0.9, 0.95 + 0.063 * (1 - shrink), T);
  if (T > E.because) for (let i = 0; i < 5; i++) put(A.snow, 90 + i * 140, 140 + ((TQ * 120 + i * 230) % 900), TQ * (i % 2 ? 1 : -1), 0.4, 30 + i);
  label('COMMENT', 330, 180, 56, E.cmt, T, { bg: '#1e1a14', fg: '#fbf8f0' }); label('SUMMER', 330, 280, 88, AT(7, 'summer'), T, { bg: '#f2d44a', tape: true }); if (T > E.because) label('EVERY WINTER IT SHRINKS', 330, 400, 36, E.because + 0.3, T, { bg: '#e8f4ff' }); }

// ---------- captions (word-synced, on black paper) ----------
const CAPS = []; CL.forEach(c0 => { let cur = []; const flush = () => { if (cur.length) CAPS.push({ a: cur[0].a, b: cur[cur.length - 1].b, txt: cur.map(w => w.w).join(' ') }); cur = []; }; c0.words.forEach(w => { if (cur.length && (cur.length >= 4 || w.a - cur[cur.length - 1].b > 0.2 || (/^[A-Z]/.test(w.w) && !/^(I|Eiffel|Tower|SUMMER)$/.test(w.w)))) flush(); cur.push(w); }); flush(); });
const NUM = { fifteen: '15', seven: '7', thousand: '000', hundred: '00', three: '3', hundredth: '1/100th' };
CAPS.forEach((c, i) => { const nx = CAPS[i + 1]; c.b = nx ? Math.min(nx.a, c.b + 0.3) : c.b + 0.6; c.txt = c.txt.replace(/three hundred/gi, '300').replace(/fifteen/gi, '15').replace(/seven thousand/gi, '7,000').replace(/a hundredth/gi, '1/100th').replace(/[:\-"]/g, '.'); });
function caption(T) { const c = CAPS.find(c => T >= c.a && T < c.b); if (!c || T >= E.loop) return; const st = strip(c.txt, 44, '#1e1a14', '#fbf8f0'); put(st, 360, 1170, 0, Math.min(1, 640 / st.w), 900 + c.txt.length); }

// ---------- frame ----------
window.init = async function () { await Promise.all(['40px Russo', '30px Caveat', '30px P8'].map(f => document.fonts.load(f))); cv = document.getElementById('c'); x = cv.getContext('2d');
  GRAIN = grainTex(); const [k, kg] = mk(W, H); kg.fillStyle = '#d6bf94'; kg.fillRect(0, 0, W, H); kg.globalCompositeOperation = 'multiply'; kg.globalAlpha = 0.5; for (let yy = 0; yy < H; yy += 256) for (let xx = 0; xx < W; xx += 256) kg.drawImage(GRAIN, xx, yy); kg.globalCompositeOperation = 'source-over'; kg.globalAlpha = 1; const vg = kg.createRadialGradient(360, 640, 300, 360, 640, 900); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(60,35,10,0.35)'); kg.fillStyle = vg; kg.fillRect(0, 0, W, H); KRAFT = k;
  buildAssets(); };
window.DURATION = TM.total;
window.renderFrame = function (T) { TQ = Math.floor(T * 12) / 12; BOIL = Math.floor(T * 8); const ci = CLI(T); const loop = T >= E.loop; x.setTransform(1, 0, 0, 1, 0, 0); x.globalAlpha = 1; bg();
  if (loop || ci === 0) hookScene(T, loop); else if (ci === 1) ironScene(T); else if (ci === 2) atomsScene(T); else if (ci === 3) metreScene(T); else if (ci === 4) mathScene(T); else if (ci === 5) likeScene(T); else if (ci === 6) leanScene(T); else commentScene(T);
  // quick paper-slide transition on scene change (2 frames)
  const st = CL[ci].start; if (ci > 0 && !loop && T - st < 2 / 12) { x.save(); x.globalAlpha = 0.5; x.fillStyle = '#d6bf94'; x.fillRect(0, 0, W * (1 - (T - st) * 6), H); x.restore(); }
  caption(T); };
})();
