// Glow sketch explainer renderer — "What if you never had to eat again?"
(() => {
const W = 720, H = 1280;
const TM = window.TIMING, CL = TM.clips;
const S = Math.sin, C = Math.cos;
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), lerp = (a, b, t) => a + (b - a) * t, ease = t => { t = clamp(t); return t * t * (3 - 2 * t); }, prog = (t, a, b) => clamp((t - a) / (b - a));
function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
function wt(ci, word, n = 0) { let k = 0; for (const w of CL[ci].words) if (w.w.toLowerCase().replace(/[^a-z0-9']/g, '') === word) { if (k === n) return CL[ci].start + w.a - CL[ci].start; k++; } return CL[ci].start; }
const AT = (ci, w, n = 0) => { let k = 0; for (const x of CL[ci].words) if (x.w.toLowerCase().replace(/[^a-z0-9']/g, '') === w) { if (k === n) return x.a; k++; } return CL[ci].start; };
const COL = { white: '#eef4ff', yellow: '#ffcc55', pink: '#ff9ac0', blue: '#8ad0ff', orange: '#ffaa55', green: '#9effa8', red: '#ff6a5a', grey: '#5a6070' };

// ---------- board background + grain ----------
let board, grain;
const STARS = (() => { const r = rng(7); return Array.from({ length: 160 }, () => [r() * W, r() * H, r()]); })();
function makeBoard() { board = document.createElement('canvas'); board.width = W; board.height = H; const g = board.getContext('2d'); const gr = g.createRadialGradient(360, 560, 50, 360, 640, 900); gr.addColorStop(0, '#0c0e16'); gr.addColorStop(1, '#030407'); g.fillStyle = gr; g.fillRect(0, 0, W, H); grain = null; }
function background(ctx, T) { ctx.drawImage(board, 0, 0); ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (const [x, y, q] of STARS) { ctx.fillStyle = `rgba(220,230,255,${0.15 + 0.5 * q * (0.6 + 0.4 * S(T * 2 + q * 20))})`; ctx.fillRect(x, y, 1.6, 1.6); }
  for (let r = 0; r < 3; r++) { const R = 260 + r * 70, rot = T * (0.05 + r * 0.02) * (r % 2 ? -1 : 1); for (let i = 0; i < 90; i++) { const a = rot + i / 90 * Math.PI * 2; ctx.fillStyle = 'rgba(200,210,255,0.10)'; ctx.fillRect(360 + C(a) * R, 600 + S(a) * R, 2, 2); } }
  for (let x = 0; x < W; x += 9) { const y = 1080 - 40 * S(x * 0.006 + 0.5) - 20 * S(x * 0.017); ctx.fillStyle = 'rgba(220,230,255,0.18)'; ctx.fillRect(x, y, 2, 2); }
  ctx.restore(); }
// ---------- chalk primitives (geometry → point lists, revealed progressively) ----------
function seg(a, b, n = 30) { return Array.from({ length: n + 1 }, (_, i) => [lerp(a[0], b[0], i / n), lerp(a[1], b[1], i / n)]); }
function poly(pts, n = 12) { let out = []; for (let i = 0; i < pts.length - 1; i++) out = out.concat(seg(pts[i], pts[i + 1], n).slice(i ? 1 : 0)); return out; }
function circle(cx, cy, rx, ry = rx, a0 = -Math.PI / 2, sweep = Math.PI * 2, n = 80) { return Array.from({ length: n + 1 }, (_, i) => { const a = a0 + sweep * i / n; return [cx + C(a) * rx, cy + S(a) * ry]; }); }
function resample(pts, gap) { const out = [pts[0]]; let acc = 0; for (let i = 1; i < pts.length; i++) { const [x0, y0] = pts[i - 1], [x1, y1] = pts[i]; const d = Math.hypot(x1 - x0, y1 - y0); let t = gap - acc; while (t <= d) { out.push([lerp(x0, x1, t / d), lerp(y0, y1, t / d)]); t += gap; } acc = (acc + d) % gap; } return out; }
function chalk(ctx, pts, col, w, k, seed = 1) { if (k <= 0) return; const dots = resample(pts, Math.max(5, w * 1.6)); const n = Math.max(1, Math.floor(dots.length * clamp(k)));
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = col; ctx.shadowColor = col; ctx.shadowBlur = 8; const r = Math.max(1.4, w * 0.42);
  for (let i = 0; i < n; i++) { const [x, y] = dots[i]; ctx.globalAlpha = 0.95; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); }
  if (k < 1) { const [x, y] = dots[n - 1]; const g = ctx.createRadialGradient(x, y, 0, x, y, 26); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.shadowBlur = 0; ctx.globalAlpha = 0.9; ctx.fillStyle = g; ctx.fillRect(x - 26, y - 26, 52, 52); }
  ctx.restore(); }
function glowAt(ctx, x, y, r, col, a) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.globalAlpha = a; ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); ctx.restore(); }
function hatch(ctx, clipFn, x0, y0, x1, y1, col, k, gap = 9, ang = 0.6, seed = 2) { if (k <= 0) return; ctx.save(); ctx.beginPath(); clipFn(ctx); ctx.clip(); const h = y1 - y0; const span = (x1 - x0) + h * ang; const lines = Math.floor(span / gap); const shown = Math.floor(lines * clamp(k));
  for (let i = 0; i < shown; i++) { const o = x0 + i * gap; chalk(ctx, seg([o, y0], [o - h * ang, y1], 8), col, 3, 1, seed + i); } ctx.restore(); }
function write(ctx, s, x, y, size, col, k = 1, align = 'center', rot = 0) { if (k <= 0) return; ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.font = `600 ${size}px Caveat`; ctx.textAlign = align; ctx.textBaseline = 'middle'; const w = ctx.measureText(s).width; const left = align === 'center' ? -w / 2 : align === 'right' ? -w : 0;
  ctx.beginPath(); ctx.rect(left - 10, -size, (w + 20) * clamp(k), size * 2); ctx.clip(); ctx.fillStyle = col; ctx.shadowColor = col; ctx.shadowBlur = 14; ctx.globalAlpha = 0.95; ctx.fillText(s, 0, 0); ctx.shadowBlur = 0; ctx.globalAlpha = 0.5; ctx.fillStyle = '#ffffff'; ctx.fillText(s, 0, 0); ctx.restore(); }
function arrow(ctx, a, b, col, k, seed = 5) { chalk(ctx, seg(a, b, 30), col, 4, k, seed); if (k >= 1) { const ang = Math.atan2(b[1] - a[1], b[0] - a[0]); for (const s of [-0.5, 0.5]) chalk(ctx, seg(b, [b[0] - 22 * C(ang + s), b[1] - 22 * S(ang + s)], 6), col, 4, 1, seed + 3); } }
function underline(ctx, x, y, w, col, k) { chalk(ctx, poly([[x - w / 2, y], [x + w / 2, y + 3]], 40), col, 4, k, 9); }
function title(ctx, s, t0, T, col = COL.white) { const k = prog(T, t0, t0 + 0.9); ctx.save(); ctx.font = '600 66px Caveat'; const w0 = ctx.measureText(s).width; ctx.restore(); const size = Math.min(66, Math.floor(66 * 600 / w0)); write(ctx, s, 360, 140, size, col, k); const w = Math.min(600, w0 * size / 66); underline(ctx, 360, 185, w * 0.9, COL.yellow, prog(T, t0 + 0.7, t0 + 1.2)); }

// ---------- drawings ----------
function drawPlate(ctx, cx, cy, k, T) { chalk(ctx, circle(cx, cy, 150, 150), COL.white, 5, prog(k, 0, 0.4), 11); chalk(ctx, circle(cx, cy, 110, 110), COL.white, 3, prog(k, 0.2, 0.5), 12);
  chalk(ctx, poly([[cx - 210, cy - 110], [cx - 210, cy + 120]]), COL.white, 5, prog(k, 0.4, 0.55), 13); for (let i = -1; i <= 1; i++) chalk(ctx, poly([[cx - 210 + i * 12, cy - 110], [cx - 210 + i * 12, cy - 60]]), COL.white, 3, prog(k, 0.5, 0.6), 14 + i);
  chalk(ctx, poly([[cx + 210, cy - 110], [cx + 222, cy - 30], [cx + 210, cy + 120]]), COL.white, 5, prog(k, 0.5, 0.7), 17); }
function drawPizzaSlice(ctx, cx, cy, s, k, seed = 20) { const p = [[cx, cy - 70 * s], [cx - 60 * s, cy + 50 * s], [cx + 60 * s, cy + 50 * s], [cx, cy - 70 * s]]; chalk(ctx, poly(p, 20), COL.orange, 5, prog(k, 0, 0.6), seed); chalk(ctx, poly([[cx - 66 * s, cy + 58 * s], [cx + 66 * s, cy + 58 * s]]), COL.yellow, 7, prog(k, 0.5, 0.8), seed + 1); for (const [dx, dy] of [[0, -10], [-20, 25], [22, 22]]) chalk(ctx, circle(cx + dx * s, cy + dy * s, 9 * s), COL.red, 3, prog(k, 0.7, 1), seed + dx); }
function drawBurger(ctx, cx, cy, s, k, seed = 30) { chalk(ctx, circle(cx, cy - 10 * s, 60 * s, 34 * s, Math.PI, Math.PI), COL.orange, 5, prog(k, 0, 0.35), seed); chalk(ctx, poly([[cx - 64 * s, cy], [cx + 64 * s, cy]]), COL.green, 6, prog(k, 0.3, 0.5), seed + 1); chalk(ctx, poly([[cx - 60 * s, cy + 14 * s], [cx + 60 * s, cy + 14 * s]]), COL.red, 9, prog(k, 0.45, 0.65), seed + 2); chalk(ctx, circle(cx, cy + 26 * s, 60 * s, 20 * s, 0, Math.PI), COL.orange, 5, prog(k, 0.6, 1), seed + 3); }
function drawClock(ctx, cx, cy, r, k, fillK) { chalk(ctx, circle(cx, cy, r), COL.white, 5, prog(k, 0, 0.6), 41); for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; chalk(ctx, seg([cx + C(a) * r * 0.82, cy + S(a) * r * 0.82], [cx + C(a) * r * 0.92, cy + S(a) * r * 0.92], 3), COL.white, 3, prog(k, 0.5, 0.8), 42 + i); }
  if (fillK > 0) { const a1 = -Math.PI / 2 + Math.PI * 2 / 12 * ease(fillK); hatch(ctx, c => { c.moveTo(cx, cy); c.arc(cx, cy, r * 0.8, -Math.PI / 2, a1); c.closePath(); }, cx - r, cy - r, cx + r, cy + r, COL.yellow, 1, 8); }
  chalk(ctx, seg([cx, cy], [cx, cy - r * 0.6], 6), COL.white, 5, prog(k, 0.8, 1), 60); chalk(ctx, seg([cx, cy], [cx + r * 0.4, cy + r * 0.1], 6), COL.white, 5, prog(k, 0.85, 1), 61); }
// stick-style body outline used for the body boards
const BODY = { cx: 330, top: 300 };
function drawBody(ctx, k) { const { cx, top } = BODY; chalk(ctx, circle(cx, top + 70, 60, 68), COL.white, 5, prog(k, 0, 0.25), 70);
  const outline = [[cx - 18, top + 138], [cx - 18, top + 160], [cx - 110, top + 190], [cx - 150, top + 400], [cx - 120, top + 405], [cx - 90, top + 250], [cx - 80, top + 480], [cx - 70, top + 760], [cx - 20, top + 760], [cx, top + 520], [cx + 20, top + 760], [cx + 70, top + 760], [cx + 80, top + 480], [cx + 90, top + 250], [cx + 120, top + 405], [cx + 150, top + 400], [cx + 110, top + 190], [cx + 18, top + 160], [cx + 18, top + 138]];
  chalk(ctx, poly(outline, 10), COL.white, 5, prog(k, 0.2, 1), 71); }
function drawJaw(ctx, k, shrink) { const { cx, top } = BODY; const s = lerp(1, 0.45, ease(shrink)); for (const sd of [-1, 1]) { chalk(ctx, circle(cx + sd * 34, top + 98, 16 * s, 24 * s), COL.pink, 4, k, 80 + sd); if (k >= 1) hatch(ctx, c => c.ellipse(cx + sd * 34, top + 98, 16 * s, 24 * s, 0, 0, 7), cx + sd * 34 - 30, top + 70, cx + sd * 34 + 30, top + 130, COL.pink, 1, 7); } }
const BACT = (() => { const r = rng(12); return Array.from({ length: 22 }, () => [r(), r(), r()]); })();
function drawGut(ctx, k, alive) { const { cx, top } = BODY; chalk(ctx, circle(cx - 18, top + 300, 46, 30), COL.pink, 4, prog(k, 0, 0.4), 90); BACT.forEach(([u, v, q], i) => { const bx = cx - 60 + u * 120, by = top + 380 + v * 90; const ok = q < alive; chalk(ctx, circle(bx, by, 7), ok ? COL.green : COL.grey, 3, prog(k, 0.3 + i * 0.02, 0.5 + i * 0.02), 100 + i); if (!ok && k >= 1) chalk(ctx, seg([bx - 8, by - 8], [bx + 8, by + 8], 4), COL.grey, 2, 1, 130 + i); }); }
function drawIntestine(ctx, k, thin) { const { cx, top } = BODY; const pts = Array.from({ length: 140 }, (_, i) => { const u = i / 139, a = u * Math.PI * 6; return [cx + C(a) * (60 - u * 18), top + 380 + u * 100 + S(a) * 18]; }); chalk(ctx, pts, COL.orange, lerp(14, 4, ease(thin)), k, 150); }
function stick(ctx, x, y, s, col, k, seed, arms = 0) { chalk(ctx, circle(x, y - 70 * s, 16 * s), col, 4, prog(k, 0, 0.3), seed); chalk(ctx, seg([x, y - 54 * s], [x, y - 10 * s], 8), col, 4, prog(k, 0.3, 0.5), seed + 1);
  chalk(ctx, poly([[x - 16 * s, y + 20 * s], [x, y - 10 * s], [x + 16 * s, y + 20 * s]]), col, 4, prog(k, 0.5, 0.7), seed + 2); chalk(ctx, poly([[x - 22 * s, y - (40 + arms * 24) * s], [x, y - 40 * s], [x + 22 * s, y - (40 + arms * 24) * s]]), col, 4, prog(k, 0.7, 1), seed + 3); }
function drawCake(ctx, cx, cy, k) { chalk(ctx, poly([[cx - 110, cy], [cx - 110, cy - 90], [cx + 110, cy - 90], [cx + 110, cy], [cx - 110, cy]]), COL.pink, 5, prog(k, 0, 0.4), 160); chalk(ctx, poly([[cx - 110, cy - 50], [cx - 70, cy - 36], [cx - 30, cy - 52], [cx + 10, cy - 36], [cx + 50, cy - 52], [cx + 110, cy - 40]], 8), COL.white, 4, prog(k, 0.3, 0.6), 161);
  for (let i = 0; i < 5; i++) { const x = cx - 80 + i * 40; chalk(ctx, seg([x, cy - 92], [x, cy - 140], 6), i % 2 ? COL.blue : COL.yellow, 4, prog(k, 0.6 + i * 0.05, 0.7 + i * 0.05), 170 + i); if (k > 0.9) chalk(ctx, circle(x, cy - 152, 6, 10), COL.orange, 3, 1, 180 + i); } }
function drawTable(ctx, cx, cy, k) { chalk(ctx, poly([[cx - 220, cy], [cx + 220, cy]]), COL.white, 6, prog(k, 0, 0.4), 190); chalk(ctx, seg([cx - 190, cy], [cx - 190, cy + 120], 8), COL.white, 5, prog(k, 0.3, 0.6), 191); chalk(ctx, seg([cx + 190, cy], [cx + 190, cy + 120], 8), COL.white, 5, prog(k, 0.3, 0.6), 192); }

// ---------- board timeline ----------
const T0 = CL.map(c => c.start);
const EV = { hunger: AT(0, 'hunger'), cooking: AT(0, 'cooking'), food: AT(0, 'food'), ever: AT(0, 'ever'), hour: AT(1, 'hour'), lifetime: AT(1, 'lifetime'), years: AT(1, 'years'), body: AT(2, 'body'), change: AT(2, 'change'), jaw: AT(3, 'jaw'), shrink: AT(3, 'shrink'), gut: AT(4, 'gut'), trillions: AT(4, 'trillions'), starve: AT(4, 'starve'),
  intest: AT(5, 'intestines'), thinner: AT(5, 'thinner'), measure: AT(6, 'measure'), cake: AT(6, 'birthday'), family: AT(6, 'family'), pizza: AT(6, 'pizza'), gone: AT(6, 'gone'), give: AT(7, 'give'), yes: AT(7, 'yes'), comment: AT(7, 'comment') };
// boards: [start, end, draw]
const BOARDS = [
  [0, T0[1], (ctx, T) => { title(ctx, 'What if you never had to eat?', 0.05, T); drawPlate(ctx, 360, 560, prog(T, 0.4, 2.0), T); drawPizzaSlice(ctx, 300, 545, 0.9, prog(T, 1.2, 2.2)); drawBurger(ctx, 420, 570, 0.9, prog(T, 1.6, 2.6));
    const xk = prog(T, EV.ever - 0.2, EV.ever + 0.4); chalk(ctx, seg([180, 380], [540, 740], 40), COL.red, 10, xk, 300); chalk(ctx, seg([540, 380], [180, 740], 40), COL.red, 10, prog(T, EV.ever, EV.ever + 0.5), 301);
    [['no hunger', EV.hunger], ['no cooking', EV.cooking], ['no food', EV.food]].forEach(([s, t0], i) => write(ctx, s, 160 + i * 200, 830, 50, COL.pink, prog(T, t0 - 0.1, t0 + 0.4), 'center', -0.05 + i * 0.05)); write(ctx, 'EVER.', 360, 920, 90, COL.yellow, prog(T, EV.ever - 0.05, EV.ever + 0.4)); }],
  [T0[1], T0[2], (ctx, T) => { title(ctx, 'The upside', T0[1] + 0.05, T, COL.green); drawClock(ctx, 230, 470, 120, prog(T, T0[1] + 0.4, T0[1] + 1.8), prog(T, EV.hour, EV.hour + 0.8)); write(ctx, '1 hour', 500, 430, 64, COL.yellow, prog(T, EV.hour - 0.1, EV.hour + 0.4)); write(ctx, 'a day eating', 500, 490, 42, COL.white, prog(T, EV.hour + 0.2, EV.hour + 0.7));
    arrow(ctx, [360, 640], [360, 730], COL.white, prog(T, EV.lifetime - 0.2, EV.lifetime + 0.3)); write(ctx, 'over a lifetime', 360, 610, 44, COL.blue, prog(T, EV.lifetime - 0.3, EV.lifetime + 0.2));
    write(ctx, 'about 3 years', 360, 800, 96, COL.green, prog(T, EV.years - 0.2, EV.years + 0.4)); if (T > EV.years + 0.4) chalk(ctx, circle(360, 800, 250, 70), COL.yellow, 4, prog(T, EV.years + 0.4, EV.years + 1.2), 310); write(ctx, 'yours again!', 360, 920, 54, COL.white, prog(T, EV.years + 1.0, EV.years + 1.6), 'center', -0.06); }],
  [T0[2], T0[6], (ctx, T) => { title(ctx, 'Your body', T0[2] + 0.05, T); drawBody(ctx, prog(T, T0[2] + 0.3, T0[2] + 2.5)); write(ctx, 'built to eat', 560, 330, 46, COL.blue, prog(T, EV.body, EV.body + 0.6), 'center', -0.05);
    // jaw
    drawJaw(ctx, prog(T, EV.jaw - 0.2, EV.jaw + 0.4), prog(T, EV.shrink - 0.6, EV.shrink + 0.8)); if (T > EV.jaw) { arrow(ctx, [560, 440], [400, 400], COL.pink, prog(T, EV.jaw, EV.jaw + 0.4), 320); write(ctx, 'jaw muscles', 580, 470, 44, COL.pink, prog(T, EV.jaw + 0.2, EV.jaw + 0.7)); write(ctx, 'shrink', 580, 515, 44, COL.pink, prog(T, EV.shrink - 0.2, EV.shrink + 0.3)); }
    // gut bacteria
    drawGut(ctx, prog(T, EV.gut - 0.2, EV.trillions + 0.6), 1 - ease(prog(T, EV.starve - 0.8, EV.starve + 0.6)) * 0.8); if (T > EV.gut) { arrow(ctx, [570, 700], [420, 720], COL.green, prog(T, EV.gut, EV.gut + 0.4), 330); write(ctx, 'gut bacteria', 590, 660, 44, COL.green, prog(T, EV.gut + 0.2, EV.gut + 0.7)); write(ctx, 'starve', 590, 750, 44, COL.green, prog(T, EV.starve - 0.2, EV.starve + 0.3)); }
    // intestines
    drawIntestine(ctx, prog(T, EV.intest - 0.2, EV.intest + 1.0), prog(T, EV.thinner - 0.6, EV.thinner + 0.8)); if (T > EV.intest) { arrow(ctx, [570, 860], [420, 800], COL.orange, prog(T, EV.intest, EV.intest + 0.4), 340); write(ctx, 'lining thins', 590, 900, 44, COL.orange, prog(T, EV.thinner - 0.2, EV.thinner + 0.4)); } }],
  [T0[6], T0[7], (ctx, T) => { title(ctx, "What you can't measure", T0[6] + 0.05, T, COL.yellow);
    drawCake(ctx, 200, 480, prog(T, EV.cake - 0.2, EV.cake + 1.0)); write(ctx, 'birthdays', 200, 520, 44, COL.pink, prog(T, EV.cake, EV.cake + 0.5));
    drawTable(ctx, 470, 470, prog(T, EV.family - 0.2, EV.family + 0.5)); for (let i = 0; i < 3; i++) stick(ctx, 400 + i * 70, 430, 0.9, [COL.blue, COL.yellow, COL.white][i], prog(T, EV.family + i * 0.15, EV.family + 0.6 + i * 0.15), 200 + i * 5, 1); write(ctx, 'family dinners', 470, 640, 44, COL.blue, prog(T, EV.family + 0.2, EV.family + 0.7));
    drawPizzaSlice(ctx, 250, 780, 1.1, prog(T, EV.pizza - 0.2, EV.pizza + 0.6), 220); for (let i = 0; i < 2; i++) stick(ctx, 420 + i * 80, 820, 1.0, [COL.green, COL.orange][i], prog(T, EV.pizza + i * 0.2, EV.pizza + 0.6 + i * 0.2), 230 + i * 5, 1); write(ctx, 'pizza with friends', 360, 900, 46, COL.orange, prog(T, EV.pizza + 0.3, EV.pizza + 0.8)); }],
  [T0[7], TM.total + 1, (ctx, T) => { write(ctx, 'Would you give up', 360, 330, 70, COL.white, prog(T, T0[7] + 0.1, T0[7] + 0.8)); write(ctx, 'food forever?', 360, 410, 80, COL.yellow, prog(T, T0[7] + 0.5, T0[7] + 1.2)); underline(ctx, 360, 455, 420, COL.yellow, prog(T, T0[7] + 1.1, T0[7] + 1.5));
    for (const [x, s, c] of [[220, 'YES', COL.green], [500, 'NO', COL.red]]) { chalk(ctx, poly([[x - 80, 560], [x + 80, 560], [x + 80, 700], [x - 80, 700], [x - 80, 560]], 10), c, 5, prog(T, EV.yes - 0.2, EV.yes + 0.5), x); write(ctx, s, x, 630, 80, c, prog(T, EV.yes, EV.yes + 0.5)); }
    write(ctx, 'comment below', 360, 820, 56, COL.blue, prog(T, EV.comment - 0.1, EV.comment + 0.5)); arrow(ctx, [360, 860], [360, 960], COL.blue, prog(T, EV.comment + 0.3, EV.comment + 0.8), 400); }],
];
// captions (handwritten, small, bottom)
const CAPS = [];
for (const c of CL) { let cur = []; const flush = () => { if (cur.length) CAPS.push({ a: cur[0].a, b: cur[cur.length - 1].b, txt: cur.map(w => w.w).join(' ') }); cur = []; };
  c.words.forEach(w => { if (cur.length && (cur.length >= 5 || w.a - cur[cur.length - 1].b > 0.2 || /^(No|Ever|At|The|Over|All|But|So|First|Chewing|Without|Next|Trillions|With|And|Then|Birthday|Family|Late|Gone|Yes|Comment)$/.test(w.w) && cur.length > 1)) flush(); cur.push(w); }); flush(); }
CAPS.forEach((c, i) => { const nx = CAPS[i + 1]; c.b = nx ? Math.min(nx.a, c.b + 0.35) : c.b + 0.8; c.txt = c.txt.replace(/[:\-]/g, '.').replace(/three years/, '3 years'); });

let out, octx;
window.ready = (async () => { await document.fonts.load('600 40px Caveat'); makeBoard(); out = document.getElementById('c'); octx = out.getContext('2d'); })();
window.DURATION = TM.total;
window.renderFrame = function (T) {
  background(octx, T);
  if (T > EV.ever - 0.2 && T < T0[1]) glowAt(octx, 360, 560, 320, '#ffaa33', 0.45 * prog(T, EV.ever - 0.2, EV.ever + 0.3));
  if (T > EV.years - 0.2 && T < T0[2]) glowAt(octx, 360, 800, 300, '#88ffaa', 0.35 * prog(T, EV.years - 0.2, EV.years + 0.4));
  if (T > EV.jaw && T < EV.gut) glowAt(octx, 330, 398, 120, '#ff6a9a', 0.5); if (T > EV.gut && T < EV.intest) glowAt(octx, 330, 720, 160, '#66ff88', 0.4); if (T > EV.intest && T < T0[6]) glowAt(octx, 330, 730, 160, '#ffaa44', 0.45);
  if (T > T0[7]) glowAt(octx, 360, 400, 340, '#ffcc55', 0.25);
  if (T < T0[2]) { chalk(octx, circle(150, 1000, 16), COL.white, 3, prog(T, 0.3, 0.8), 500); chalk(octx, poly([[140, 1016], [136, 1060], [164, 1060], [160, 1016]], 8), COL.white, 3, prog(T, 0.5, 1.0), 501); chalk(octx, seg([162, 1028], [196, 1000 + S(T * 2) * 6], 8), COL.white, 3, prog(T, 0.8, 1.2), 502); }
  // which board, and eraser wipe on change
  for (let i = 0; i < BOARDS.length; i++) { const [a, b, fn] = BOARDS[i]; if (T >= a - 0.01 && T < b) fn(octx, T); }
  // "Gone": the memories dissolve into sparks
  if (T > EV.gone - 0.1 && T < T0[7]) { const k = ease(prog(T, EV.gone - 0.1, EV.gone + 0.8)); octx.save(); octx.fillStyle = `rgba(3,4,7,${k})`; octx.fillRect(0, 230, W, 760); octx.restore(); const r = rng(77); octx.save(); octx.globalCompositeOperation = 'lighter'; for (let i = 0; i < 260; i++) { const x = r() * W, y = 260 + r() * 700, c = [COL.yellow, COL.pink, COL.blue, COL.white][i % 4]; const up = k * (40 + r() * 160); octx.globalAlpha = (1 - k) * 0.9; octx.fillStyle = c; octx.fillRect(x + S(i) * up * 0.3, y - up, 2.5, 2.5); } octx.restore();
    write(octx, 'GONE.', 360, 620, 150, COL.white, prog(T, EV.gone + 0.3, EV.gone + 0.8)); }
  // board change: dissolve to black with sparkles
  for (const b of [T0[1], T0[2], T0[6], T0[7]]) { const k = prog(T, b - 0.35, b); if (k > 0 && k < 1) { octx.fillStyle = `rgba(3,4,7,${ease(k)})`; octx.fillRect(0, 0, W, H); } const k2 = prog(T, b, b + 0.3); if (k2 > 0 && k2 < 1) { octx.fillStyle = `rgba(3,4,7,${1 - ease(k2)})`; octx.fillRect(0, 0, W, H); } }
  // caption (clean chalk handwriting, bottom)
  const cap = CAPS.find(c => T >= c.a && T < c.b); if (cap) { octx.save(); octx.font = '600 50px Caveat'; octx.textAlign = 'center'; octx.textBaseline = 'middle'; const words = cap.txt.split(' '); const lines = []; let cur = ''; for (const w of words) { const x = cur ? cur + ' ' + w : w; if (octx.measureText(x).width > 600 && cur) { lines.push(cur); cur = w; } else cur = x; } lines.push(cur);
    lines.forEach((l, i) => { const y = 1110 - (lines.length - 1) * 28 + i * 56; octx.fillStyle = 'rgba(0,0,0,0.55)'; const w = octx.measureText(l).width; octx.fillRect(360 - w / 2 - 16, y - 28, w + 32, 56); octx.fillStyle = '#ffffff'; octx.fillText(l, 360, y); }); octx.restore(); }
  // frame
  if (T < 0.15) { octx.fillStyle = `rgba(0,0,0,${1 - T / 0.15})`; octx.fillRect(0, 0, W, H); }
  if (T > TM.total - 0.6) { octx.fillStyle = `rgba(0,0,0,${prog(T, TM.total - 0.6, TM.total)})`; octx.fillRect(0, 0, W, H); }
};
})();
