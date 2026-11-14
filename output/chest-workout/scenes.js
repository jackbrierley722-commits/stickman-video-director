// "Don't make any eye contact" — flat vector style, 2D canvas.
(() => {
const W = 720, H = 1280, PI = Math.PI, S = Math.sin, C = Math.cos;
const TM = window.TIMING, CL = TM.clips;
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), lerp = (a, b, t) => a + (b - a) * t, ease = t => { t = clamp(t); return t * t * (3 - 2 * t); }, prog = (t, a, b) => clamp((t - a) / (b - a));
function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
function wt(ci, word, n = 0) { let k = 0; for (const w of CL[ci].words) if (w.w.toLowerCase().replace(/[^a-z0-9']/g, '') === word) { if (k === n) return w.a; k++; } return CL[ci].start; }
const AT = wt;
let ctx, grain;

// ---------- primitives ----------
function rr(x, y, w, h, r, fill) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); if (fill) { ctx.fillStyle = fill; ctx.fill(); } }
function poly(pts, fill) { ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]); ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); }
function circ(x, y, r, fill) { ctx.beginPath(); ctx.arc(x, y, r, 0, PI * 2); ctx.fillStyle = fill; ctx.fill(); }
function line(x1, y1, x2, y2, w, col) { ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.lineWidth = w; ctx.strokeStyle = col; ctx.lineCap = 'round'; ctx.stroke(); }
function glow(x, y, r, col, a) { const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col.replace('A', a)); g.addColorStop(1, col.replace('A', 0)); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); }
function text(s, x, y, size, col, font = 'P7', align = 'center') { ctx.font = `${size}px ${font}`; ctx.fillStyle = col; ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.fillText(s, x, y); }
function camera(fx, fy, z) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.translate(-fx, -fy); }
function camL(a, b, k) { k = ease(k); camera(lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)); }
function reset() { ctx.setTransform(1, 0, 0, 1, 0, 0); }

// ---------- city ----------
const SKY = (() => { const r = rng(7); const L = []; for (const [n, base, hmin, hmax, col] of [[14, 0.62, 0.12, 0.3, '#2e2b4c'], [11, 0.7, 0.14, 0.34, '#25233f'], [8, 0.8, 0.18, 0.42, '#1b1a31']]) { const b = []; let x = -0.05; while (x < 1.05) { const w = 0.07 + r() * 0.12; const h = hmin + r() * (hmax - hmin); const win = []; for (let i = 0; i < 40; i++) win.push([r(), r(), r()]); b.push({ x, w, h, win, roof: r() }); x += w + r() * 0.02; } L.push({ b, base, col }); } return L; })();
function city(x0, y0, w, h, T, o = {}) { ctx.save(); ctx.beginPath(); ctx.rect(x0, y0, w, h); ctx.clip();
  const g = ctx.createLinearGradient(0, y0, 0, y0 + h); g.addColorStop(0, '#141833'); g.addColorStop(0.55, '#2c2546'); g.addColorStop(0.8, '#6a3f55'); g.addColorStop(1, '#8a4f50'); ctx.fillStyle = g; ctx.fillRect(x0, y0, w, h);
  if (o.moon !== false) { circ(x0 + w * 0.78, y0 + h * 0.16, w * 0.05, '#efe3c8'); glow(x0 + w * 0.78, y0 + h * 0.16, w * 0.16, 'rgba(240,220,190,A)', 0.18); }
  const r = rng(3); for (let i = 0; i < 40; i++) circ(x0 + r() * w, y0 + r() * h * 0.45, 1 + r() * 1.2, `rgba(255,255,255,${0.3 + 0.5 * r()})`);
  SKY.forEach((Ly, li) => { if (li === 2 && o.monster) drawMonsterCity(x0, y0, w, h, T, o.monster);
    Ly.b.forEach((b, bi) => { const bx = x0 + b.x * w, bw = b.w * w, bh = b.h * h, by = y0 + h * Ly.base + (1 - Ly.base) * h * 0.3 - bh + (li === 2 ? h * 0.2 : 0);
      ctx.fillStyle = Ly.col; ctx.fillRect(bx, by, bw, h); if (b.roof > 0.7) ctx.fillRect(bx + bw * 0.3, by - bh * 0.08, bw * 0.15, bh * 0.08);
      const cols = Math.max(2, Math.floor(bw / (w * 0.028))), rows = Math.floor(bh / (h * 0.03)); const ww = bw / (cols * 2 + 1), wh = h * 0.012;
      for (let ry = 0; ry < rows; ry++) for (let cx = 0; cx < cols; cx++) { const k = (ry * cols + cx) % 40; const [p1, p2, p3] = b.win[k]; let col = null;
        if (p1 > 0.72 - li * 0.05) col = li === 0 ? 'rgba(242,178,92,0.55)' : '#f2b25c';
        if (o.flash && p2 < o.flash) { const on = S(T * (6 + p3 * 10) + p1 * 20) > -0.2; if (on) col = '#cfe6ff'; }
        if (o.dark && p3 < o.dark) col = null;
        if (col) { ctx.fillStyle = col; ctx.fillRect(bx + ww * (1 + cx * 2), by + h * 0.02 + ry * h * 0.03, ww, wh); } } }); });
  if (o.flash) { ctx.fillStyle = `rgba(160,200,255,${0.05 + 0.04 * S(T * 9)})`; ctx.fillRect(x0, y0, w, h); }
  ctx.restore(); }
function drawMonsterCity(x0, y0, w, h, T, m) { monster(x0 + w * m.x, y0 + h * 1.0, h * m.h, T, m.eyes ?? 1, 1); }

// ---------- the tall ones ----------
function monster(x, y, h, T, eyes = 1, sway = 1) { ctx.save(); ctx.translate(x, y); ctx.rotate(S(T * 0.7) * 0.012 * sway); const col = '#0c0b12'; ctx.fillStyle = col; ctx.strokeStyle = col; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const hy = -h, sh = -h * 0.8, hip = -h * 0.5;
  // legs
  ctx.beginPath(); ctx.moveTo(-h * 0.035, hip); ctx.lineTo(-h * 0.03, -h * 0.01); ctx.lineTo(-h * 0.012, 0); ctx.lineTo(-h * 0.01, hip); ctx.fill();
  ctx.beginPath(); ctx.moveTo(h * 0.035, hip); ctx.lineTo(h * 0.032, -h * 0.01); ctx.lineTo(h * 0.012, 0); ctx.lineTo(h * 0.01, hip); ctx.fill();
  // torso
  ctx.beginPath(); ctx.moveTo(-h * 0.06, sh); ctx.quadraticCurveTo(-h * 0.035, -h * 0.65, -h * 0.04, hip); ctx.lineTo(h * 0.04, hip); ctx.quadraticCurveTo(h * 0.035, -h * 0.65, h * 0.06, sh); ctx.closePath(); ctx.fill();
  // neck + head (tilted forward)
  ctx.lineWidth = h * 0.018; ctx.beginPath(); ctx.moveTo(0, sh); ctx.lineTo(h * 0.012, -h * 0.87); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(h * 0.016, -h * 0.915, h * 0.03, h * 0.045, 0.15, 0, PI * 2); ctx.fill();
  // arms down to the knees with claws
  for (const sd of [-1, 1]) { const ex = sd * h * 0.085, ey = -h * 0.3 + S(T * 0.9 + sd) * h * 0.005; ctx.lineWidth = h * 0.014; ctx.beginPath(); ctx.moveTo(sd * h * 0.055, sh + h * 0.01); ctx.quadraticCurveTo(sd * h * 0.08, -h * 0.55, ex, ey); ctx.stroke();
    ctx.lineWidth = h * 0.005; for (let f = -1; f <= 1; f++) { ctx.beginPath(); ctx.moveTo(ex, ey); ctx.quadraticCurveTo(ex + f * h * 0.008, ey + h * 0.03, ex + f * h * 0.014 - sd * h * 0.004, ey + h * 0.055); ctx.stroke(); } }
  if (eyes > 0) { for (const ex of [h * 0.006, h * 0.03]) { glow(ex, -h * 0.925, h * 0.025, 'rgba(255,255,255,A)', 0.35 * eyes); circ(ex, -h * 0.925, Math.max(1.2, h * 0.0045), `rgba(255,255,255,${eyes})`); } }
  ctx.restore(); }

// ---------- people (flat vector) ----------
const ELLIE = { top: '#e0895a', top2: '#c9744a', pants: '#3a3f5a', hair: '#3a2418', skin: '#f0c6a0', shoe: '#2a2a33', H: 330, pony: true };
const THEO = { top: '#6aa0c8', top2: '#5a8cb4', pants: '#6aa0c8', hair: '#c8883a', skin: '#f3cba6', shoe: '#e8e0d0', H: 235, stripes: true };
function limb(x1, y1, a1, l1, a2, l2, w, col) { const x2 = x1 + S(a1) * l1, y2 = y1 + C(a1) * l1; const x3 = x2 + S(a2) * l2, y3 = y2 + C(a2) * l2; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.lineTo(x3, y3); ctx.lineWidth = w; ctx.strokeStyle = col; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke(); return [x3, y3]; }
// p: {legL:[thigh,shin], legR, armL:[upper,fore], armR, sit, lean, face:'front'|'side'|'back', look}
function person(C_, x, y, s, dir, p, T) { const H_ = C_.H * s; ctx.save(); ctx.translate(x, y); ctx.scale(dir, 1);
  const sit = p.sit || 0, hipY = -H_ * lerp(0.47, 0.27, sit), shY = hipY - H_ * 0.3, lean = (p.lean || 0) * H_;
  const lw = H_ * 0.085, aw = H_ * 0.065, ll = H_ * 0.24;
  const legs = [p.legL || [0, 0], p.legR || [0, 0]], arms = [p.armL || [0.1, 0], p.armR || [-0.1, 0]];
  // back limbs
  limb(-H_ * 0.03, hipY, legs[0][0], ll, legs[0][1], ll, lw, C_.pants);
  if (p.face !== 'back') limb(-H_ * 0.07 + lean * 0.8, shY + H_ * 0.03, arms[0][0], H_ * 0.17, arms[0][1], H_ * 0.16, aw, C_.top2);
  // torso
  ctx.save(); ctx.translate(0, hipY); ctx.rotate(lean / H_ * 0.8); rr(-H_ * 0.11, -H_ * 0.33, H_ * 0.22, H_ * 0.36, H_ * 0.07, C_.top);
  if (C_.stripes) { ctx.fillStyle = 'rgba(255,255,255,0.35)'; for (let i = 0; i < 4; i++) ctx.fillRect(-H_ * 0.11, -H_ * 0.28 + i * H_ * 0.08, H_ * 0.22, H_ * 0.025); }
  if (C_.pony && p.face !== 'back') { ctx.fillStyle = 'rgba(0,0,0,0.08)'; ctx.fillRect(-H_ * 0.02, -H_ * 0.33, H_ * 0.04, H_ * 0.2); }
  ctx.restore();
  // front limbs
  limb(H_ * 0.03, hipY, legs[1][0], ll, legs[1][1], ll, lw, C_.pants);
  for (const [lg, sd] of [[legs[0], -1], [legs[1], 1]]) { const kx = sd * H_ * 0.03 + S(lg[0]) * ll, ky = hipY + C(lg[0]) * ll; const fx = kx + S(lg[1]) * ll, fy = ky + C(lg[1]) * ll; ctx.beginPath(); ctx.ellipse(fx + H_ * 0.03, fy + H_ * 0.005, H_ * 0.05, H_ * 0.025, 0, 0, PI * 2); ctx.fillStyle = C_.shoe; ctx.fill(); }
  // head
  const hx = lean + H_ * 0.01, hyy = shY - H_ * 0.12, hr = H_ * 0.095;
  limb(H_ * 0.0, shY, 0, 0, 0, 0, 0, C_.skin); rr(hx - H_ * 0.025, shY - H_ * 0.05, H_ * 0.05, H_ * 0.06, 4, C_.skin);
  if (C_.pony) { ctx.beginPath(); ctx.ellipse(hx - hr * 1.05, hyy + hr * 0.5 + S(T * 3) * 2, hr * 0.42, hr * 0.85, 0.3, 0, PI * 2); ctx.fillStyle = C_.hair; ctx.fill(); }
  circ(hx, hyy, hr, C_.skin);
  ctx.fillStyle = C_.hair; ctx.beginPath(); if (p.face === 'back') { ctx.arc(hx, hyy, hr * 1.02, 0, PI * 2); } else { ctx.arc(hx, hyy, hr * 1.03, PI * 0.95, PI * 2.12); ctx.quadraticCurveTo(hx + hr * 0.2, hyy - hr * 0.3, hx - hr * 0.9, hyy + hr * 0.1); } ctx.fill();
  if (p.face !== 'back') { const side = p.face === 'side'; const ex = side ? hx + hr * 0.5 : hx + hr * 0.15; const blink = (T * 0.7 % 3) < 0.08 ? 0.2 : 1; const ey = hyy + hr * 0.1;
    if (p.sleep) { for (const dx of [-hr * 0.38, hr * 0.38]) { ctx.beginPath(); ctx.arc(ex + dx, ey - hr * 0.05, hr * 0.12, 0.2, PI - 0.2); ctx.lineWidth = hr * 0.06; ctx.strokeStyle = '#2a1f1f'; ctx.stroke(); } }
    else { ctx.fillStyle = p.glow ? '#ffffff' : '#2a1f1f'; for (const dx of side ? [0] : [-hr * 0.38, hr * 0.38]) { ctx.beginPath(); ctx.ellipse(ex + dx + (p.look || 0) * hr * 0.15, ey, hr * 0.1, hr * 0.13 * blink, 0, 0, PI * 2); ctx.fill(); } }
    if (p.glow) {} else if (p.scared) { ctx.beginPath(); ctx.ellipse(ex + (side ? 0 : 0), hyy + hr * 0.55, hr * 0.12, hr * 0.16, 0, 0, PI * 2); ctx.fill(); } else { ctx.beginPath(); ctx.arc(ex, hyy + hr * 0.45, hr * 0.18, 0.2, PI - 0.2); ctx.lineWidth = hr * 0.08; ctx.strokeStyle = '#2a1f1f'; ctx.stroke(); }
    if (!p.glow) circ(ex + (side ? -hr * 0.15 : 0) - hr * 0.55, hyy + hr * 0.35, hr * 0.14, 'rgba(230,120,110,0.35)'); }
  // front arm
  if (p.face !== 'back') limb(H_ * 0.07 + lean * 0.8, shY + H_ * 0.03, arms[1][0], H_ * 0.17, arms[1][1], H_ * 0.16, aw, C_.top);
  else { limb(-H_ * 0.09, shY + H_ * 0.03, arms[0][0], H_ * 0.17, arms[0][1], H_ * 0.16, aw, C_.top2); limb(H_ * 0.09, shY + H_ * 0.03, arms[1][0], H_ * 0.17, arms[1][1], H_ * 0.16, aw, C_.top2); }
  ctx.restore(); }
function walk(T, amt = 1) { const s_ = S(T * 9) * 0.5 * amt; return { legL: [s_, s_ > 0 ? 0 : -s_ * 0.8 + s_], legR: [-s_, -s_ > 0 ? 0 : s_ * 0.8 - s_], armL: [-s_ * 0.8, -0.2], armR: [s_ * 0.8, -0.2] }; }
const SIT = { sit: 1, legL: [1.45, 0.1], legR: [1.35, 0.15] };

// ---------- the bedroom (room space 900 x 1280) ----------
const WIN = [230, 330, 440, 440];
function room(T, o = {}) { const lamp = o.lamp ?? 1, dim = o.dim || 0;
  ctx.fillStyle = '#4b363f'; ctx.fillRect(-400, -600, 1700, 900); ctx.fillStyle = '#6b4a3a'; ctx.fillRect(-400, 1200, 1700, 700); poly([[0, 0], [-400, -600], [-400, 1900], [0, 1280]], '#523b44'); poly([[900, 0], [1300, -600], [1300, 1900], [900, 1280]], '#4a343d');
  poly([[0, 0], [900, 0], [740, 250], [160, 250]], '#4b363f'); for (const fx of [0.3, 0.55, 0.8]) { ctx.beginPath(); ctx.moveTo(900 * fx, 0); ctx.lineTo(160 + 580 * fx, 250); ctx.lineWidth = 10; ctx.strokeStyle = '#2b1f25'; ctx.stroke(); }
  poly([[0, 0], [160, 250], [160, 880], [0, 1280]], '#523b44'); poly([[900, 0], [740, 250], [740, 880], [900, 1280]], '#4a343d');
  ctx.fillStyle = '#5c434c'; ctx.fillRect(160, 250, 580, 630);
  poly([[0, 1280], [160, 880], [740, 880], [900, 1280]], '#6b4a3a'); for (let i = 1; i < 9; i++) { const k = i / 9; ctx.beginPath(); ctx.moveTo(160 + 580 * k, 880); ctx.lineTo(900 * k, 1280); ctx.lineWidth = 2; ctx.strokeStyle = '#5a3c2f'; ctx.stroke(); }
  // window with the city
  city(WIN[0], WIN[1], WIN[2], WIN[3], T, o.city || {});
  ctx.fillStyle = '#1e1519'; for (let i = 0; i <= 4; i++) ctx.fillRect(WIN[0] - 8 + i * WIN[2] / 4, WIN[1] - 8, 12, WIN[3] + 16); ctx.fillRect(WIN[0] - 8, WIN[1] - 8, WIN[2] + 16, 12); ctx.fillRect(WIN[0] - 14, WIN[1] + WIN[3], WIN[2] + 28, 16);
  // shelves + picture on left wall
  poly([[30, 470], [140, 440], [140, 452], [30, 484]], '#7a5040'); for (let i = 0; i < 5; i++) poly([[40 + i * 18, 470 - i * 5], [54 + i * 18, 466 - i * 5], [54 + i * 18, 410 - i * 5], [40 + i * 18, 414 - i * 5]], ['#3a3040', '#4a3a48', '#2e2a36', '#5a4050', '#3a3040'][i]);
  rr(36, 540, 90, 110, 4, '#2b1f25'); rr(44, 548, 74, 94, 2, '#7a6070'); poly([[50, 640], [60, 590], [72, 600], [84, 570], [96, 600], [112, 610], [112, 640]], '#3a2a3a');
  // plant hanging
  for (let i = 0; i < 9; i++) { ctx.beginPath(); ctx.ellipse(150 + S(i * 1.7) * 14, 445 + i * 22, 14, 9, S(i) * 0.8, 0, PI * 2); ctx.fillStyle = i % 2 ? '#8a8a3a' : '#a8a048'; ctx.fill(); }
  // desk + monitor under the right of the window
  ctx.fillStyle = '#6a4434'; ctx.fillRect(520, 760, 190, 18); ctx.fillRect(530, 778, 14, 100); ctx.fillRect(690, 778, 14, 100); rr(590, 700, 90, 58, 4, '#1c1a20'); ctx.fillStyle = '#2a2a33'; ctx.fillRect(630, 758, 12, 6);
  rr(545, 735, 16, 22, 3, '#e8dcc8'); poly([[540, 735], [565, 735], [560, 712], [552, 700], [544, 712]], '#7a8a4a');
  // chair
  rr(560, 790, 70, 80, 14, '#2a2228'); line(595, 870, 595, 905, 8, '#2a2228'); line(570, 910, 620, 910, 8, '#2a2228');
  // rug
  poly([[220, 980], [700, 980], [770, 1150], [150, 1150]], '#5a5058');
  // furniture that will barricade the window
  const sk = ease(o.shelf || 0), wk = ease(o.ward || 0);
  bookshelf(lerp(735, 450, sk), 300 - 0 * sk, 220, 640, T); wardrobe(lerp(-90, 225, wk), 280, 235, 660);
  // bed (front left)
  poly([[0, 940], [300, 940], [360, 1010], [360, 1120], [0, 1120]], '#2e2630'); poly([[0, 900], [290, 900], [370, 1000], [370, 1060], [0, 1060]], '#6a6470'); rr(20, 880, 150, 52, 22, '#d8d0d4'); rr(0, 800, 40, 220, 8, '#3a2e36');
  // nightstand + lamp (right of bed)
  rr(380, 930, 100, 90, 6, '#6a4434'); ctx.fillStyle = '#4e3228'; ctx.fillRect(388, 970, 84, 4);
  line(430, 930, 430, 880, 6, '#2b1f25'); poly([[400, 880], [460, 880], [450, 838], [410, 838]], lamp > 0 ? '#f6d08a' : '#6a5a50');
  if (lamp > 0) glow(430, 870, 330, 'rgba(255,190,110,A)', 0.32 * lamp);
  if (dim > 0) { ctx.fillStyle = `rgba(10,8,22,${dim})`; ctx.fillRect(-200, -200, 1300, 1700); if (lamp > 0) glow(430, 870, 260, 'rgba(255,190,110,A)', 0.25 * lamp * dim); } }
function bookshelf(x, y, w, h, T) { rr(x, y, w, h, 4, '#6a4434'); ctx.fillStyle = '#4e3228'; for (let i = 0; i < 6; i++) { ctx.fillRect(x + 10, y + 12 + i * (h - 24) / 6, w - 20, (h - 24) / 6 - 10); }
  const r = rng(11); for (let i = 0; i < 6; i++) { let bx = x + 14; while (bx < x + w - 24) { const bw = 10 + r() * 12, bh = (h - 24) / 6 - 18 - r() * 18; ctx.fillStyle = ['#7a3a3a', '#3a4a6a', '#8a7a4a', '#4a6a5a', '#d8cbb0', '#5a3a5a'][(r() * 6) | 0]; ctx.fillRect(bx, y + 12 + (i + 1) * (h - 24) / 6 - 10 - bh, bw, bh); bx += bw + 2; } }
  for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.ellipse(x + 30 + i * 28, y - 6 + S(i) * 4, 18, 10, S(i * 2) * 0.5, 0, PI * 2); ctx.fillStyle = i % 2 ? '#8a8a3a' : '#a8a048'; ctx.fill(); } }
function wardrobe(x, y, w, h) { rr(x, y, w, h, 4, '#7a5040'); ctx.fillStyle = '#6a4434'; ctx.fillRect(x + w / 2 - 2, y + 10, 4, h - 20); rr(x + w / 2 - 18, y + h * 0.45, 8, 60, 4, '#2b1f25'); rr(x + w / 2 + 10, y + h * 0.45, 8, 60, 4, '#2b1f25'); ctx.fillStyle = '#5a3a2e'; ctx.fillRect(x, y + h - 26, w, 26); }

// ---------- phone ----------
function phone(T, cx, cy, s, o) { ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s); const w = 420, h = 820;
  glow(0, 0, 520, 'rgba(255,90,80,A)', o.alarm ? 0.25 + 0.15 * S(T * 12) : 0.08);
  rr(-w / 2, -h / 2, w, h, 56, '#15131c'); rr(-w / 2 + 16, -h / 2 + 16, w - 32, h - 32, 42, '#20203a'); rr(-50, -h / 2 + 28, 100, 26, 13, '#15131c');
  text(o.clock || '3.32', 0, -h / 2 + 150, 92, '#ffffff', 'P5'); text('THURSDAY', 0, -h / 2 + 215, 20, 'rgba(255,255,255,0.6)', 'P7');
  // alert card
  const ay = -h / 2 + 270, ah = o.cardH || 300; rr(-w / 2 + 34, ay, w - 68, ah, 28, '#f7f1e8');
  rr(-w / 2 + 34, ay, w - 68, 62, [28, 28, 0, 0], o.red ? '#d9533f' : '#d9533f'); text('⚠  EMERGENCY ALERT', -w / 2 + 58, ay + 32, 22, '#fff', 'P8', 'left'); text('NOW', w / 2 - 58, ay + 32, 18, 'rgba(255,255,255,0.8)', 'P7', 'right');
  (o.lines || []).forEach((l, i) => { const [s_, col, size] = l; text(s_, -w / 2 + 58, ay + 104 + i * 50, size || 28, col || '#2a2a2a', 'P8', 'left'); });
  if (o.blank) { const bx = -w / 2 + 58, by = ay + 104 + (o.lines.length) * 50; if (o.fill) text(o.fill, bx, by, 40, '#d9533f', 'P8', 'left'); else if (S(T * 8) > 0) { ctx.fillStyle = '#2a2a2a'; ctx.fillRect(bx, by + 16, 230, 6); } }
  ctx.restore(); }

// ---------- other locations ----------
function street(T, o = {}) { const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#121630'); g.addColorStop(0.7, '#3a2a48'); g.addColorStop(1, '#5a3a4a'); ctx.fillStyle = g; ctx.fillRect(-200, -200, 1100, 1700);
  for (let i = 0; i < 3; i++) { ctx.fillStyle = `rgba(150,120,170,${0.08 + i * 0.03})`; ctx.fillRect(-200, 700 + i * 120, 1100, 400); }
  monster(360 + (o.mx || 0), 1180, o.mh || 900, T, o.eyes ?? 1);
  ctx.fillStyle = '#1a1830'; ctx.fillRect(-200, 0, 380, 1400); ctx.fillRect(540, 0, 400, 1400); ctx.fillStyle = '#211f3a'; ctx.fillRect(160, 0, 26, 1400); ctx.fillRect(534, 0, 26, 1400);
  for (let y = 60; y < 1100; y += 90) for (const x of [20, 90, 600, 670]) { ctx.fillStyle = (x * 7 + y) % 5 === 0 ? '#f2b25c' : '#2c2a48'; ctx.fillRect(x, y, 40, 46); }
  ctx.fillStyle = '#141224'; ctx.fillRect(-200, 1180, 1100, 300); line(250, 1180, 250, 860, 8, '#141224'); line(250, 860, 290, 860, 8, '#141224'); glow(292, 872, 120, 'rgba(255,200,120,A)', 0.4); circ(292, 868, 10, '#ffd8a0'); }
function facade(T, o = {}) { ctx.fillStyle = '#26243e'; ctx.fillRect(-300, -300, 1400, 2000);
  for (let f = 0; f < 9; f++) { const y = 80 + f * 150; text(String(17 - f), 40, y + 50, 22, 'rgba(255,255,255,0.25)', 'P7'); for (let c = 0; c < 4; c++) { const x = 90 + c * 160; const target = f === 3 && c === 2; let col = '#1a1830'; if (((f * 5 + c * 3) % 7) === 0) col = '#f2b25c';
      if (target) col = o.targetLit ? '#f6c070' : '#121020'; rr(x, y, 110, 110, 4, '#1e1c32'); ctx.fillStyle = col; ctx.fillRect(x + 8, y + 8, 94, 94);
      if (target && o.person && o.targetLit) { circ(x + 55, y + 50, 16, '#3a2a30'); rr(x + 33, y + 66, 44, 40, 10, '#3a2a30'); } } }
  ctx.save(); ctx.translate(410, 0); text('FLOOR 14', 0, 80 + 3 * 150 - 26, 22, '#ffd27a', 'P8'); ctx.restore();
  if (o.mon > 0) { const k = o.mon; ctx.save(); ctx.translate(lerp(900, 560, k), 0); monster(0, 2800, 2400, T, 1, 0.3); ctx.restore(); if (k > 0.6) { const a = prog(k, 0.6, 1); ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = '#0c0b12'; ctx.lineCap = 'round'; for (let f = 0; f < 4; f++) { const fx = 470 + f * 14; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(560, 650); ctx.quadraticCurveTo(fx + 10, 630, fx, 600 + f * 4); ctx.stroke(); } ctx.restore(); } } }
function hallway(T, o = {}) { ctx.fillStyle = '#3a3044'; ctx.fillRect(-200, -200, 1100, 1700); poly([[-200, 1500], [120, 1000], [600, 1000], [920, 1500]], '#2a2230'); rr(190, 320, 340, 690, 6, '#1e1820'); rr(205, 335, 310, 665, 4, '#6a4a3a');
  rr(220, 360, 280, 260, 4, '#5e4234'); rr(220, 650, 280, 330, 4, '#5e4234'); circ(470, 680, 14, '#c8a050'); text('9C', 360, 300, 30, '#d8cbb0', 'P8');
  const lit = 0.7 + 0.3 * S(T * 30) * (S(T * 3) > 0.6 ? 1 : 0); ctx.fillStyle = `rgba(255,220,160,${lit})`; ctx.fillRect(205, 1000, 310, 8); glow(360, 1012, 260, 'rgba(255,200,130,A)', 0.25 * lit);
  if (o.legs) { ctx.fillStyle = '#0c0b12'; ctx.fillRect(300, 998, 18, 12); ctx.fillRect(392, 998, 18, 12); poly([[300, 1010], [318, 1010], [250, 1300], [190, 1300]], 'rgba(12,11,18,0.85)'); poly([[392, 1010], [410, 1010], [470, 1300], [420, 1300]], 'rgba(12,11,18,0.85)'); } }
function carScene(T) { const g = ctx.createLinearGradient(0, 0, 0, 640); g.addColorStop(0, '#141833'); g.addColorStop(1, '#4a3048'); ctx.fillStyle = g; ctx.fillRect(0, 0, 720, 640); ctx.fillStyle = '#1e1c30'; ctx.fillRect(0, 430, 720, 210);
  for (let i = 0; i < 4; i++) { ctx.fillStyle = '#2a2840'; ctx.fillRect(40 + i * 180, 120, 120, 310); }
  rr(200, 440, 330, 90, 30, '#c8543f'); poly([[260, 440], [300, 385], [440, 385], [480, 440]], '#c8543f'); poly([[275, 438], [305, 395], [365, 395], [365, 438]], '#9ab8d0'); poly([[375, 438], [375, 395], [435, 395], [462, 438]], '#9ab8d0'); circ(270, 530, 30, '#1a1820'); circ(460, 530, 30, '#1a1820');
  monster(620, 560, 440, T, 1); monster(90, 520, 360, T + 2, 1); }

// ---------- UI ----------
function liveCard(T, a) { if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; rr(30, 40, 420, 132, 24, '#f7f1e8'); text('Hallway noise', 58, 82, 28, '#2a2a2a', 'P7', 'left'); rr(330, 62, 96, 40, 20, '#5a8a78'); text('LIVE', 378, 83, 20, '#fff', 'P8');
  ctx.beginPath(); for (let x = 0; x <= 360; x += 3) { const k = x / 360; const amp = (2 + 26 * k * k * (0.6 + 0.4 * S(T * 3))) * (0.6 + 0.4 * S(x * 0.9 + T * 40)) * (1 + 1.5 * SPIKE(T)); const y = 136 + S(x * 0.35 + T * 22) * amp * 0.5 + S(x * 1.3 + T * 31) * amp * 0.3; x === 0 ? ctx.moveTo(58 + x, y) : ctx.lineTo(58 + x, y); } ctx.lineWidth = 3; ctx.strokeStyle = '#2a2a2a'; ctx.lineJoin = 'round'; ctx.stroke(); ctx.restore(); }
let SPIKES = []; function SPIKE(T) { let v = 0; for (const s of SPIKES) if (T > s && T < s + 1.2) v = Math.max(v, 1 - (T - s) / 1.2); return v; }
function clockChip(T, s, a) { if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; rr(470, 40, 220, 132, 24, '#2a2238'); text(s, 580, 106, 46, '#f6d08a', 'P8'); ctx.restore(); }
function card(x, y, w, h, title, a) { ctx.save(); ctx.globalAlpha = a; rr(x, y, w, h, 26, '#f7f1e8'); rr(x, y, w, 60, [26, 26, 0, 0], '#d9533f'); text(title, x + 28, y + 31, 22, '#fff', 'P8', 'left'); ctx.restore(); }
function bubble(s, x, y, a, tailX, col = '#f7f1e8', tc = '#2a2a2a', size = 30) { if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.font = `${size}px P7`; const lines = s.split('\n'); const w = Math.max(...lines.map(l => ctx.measureText(l).width)) + 56, h = lines.length * size * 1.3 + 36;
  rr(x - w / 2, y - h, w, h, 26, col); poly([[tailX - 14, y - 2], [tailX + 14, y - 2], [tailX, y + 26]], col); lines.forEach((l, i) => text(l, x, y - h + 18 + size * 0.65 + i * size * 1.3, size, tc, 'P7')); ctx.restore(); }
function big(s, y, size, col, a = 1, font = 'P8', x = 360) { if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.font = `${size}px ${font}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round'; ctx.lineWidth = size * 0.18; ctx.strokeStyle = 'rgba(20,16,30,0.9)'; ctx.strokeText(s, x, y); ctx.fillStyle = col; ctx.fillText(s, x, y); ctx.restore(); }
function tag(s, x, y, a, col = '#f7f1e8', tc = '#2a2a2a') { if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.font = '26px P8'; const w = ctx.measureText(s).width + 40; rr(x - w / 2, y - 26, w, 52, 26, col); text(s, x, y + 1, 26, tc, 'P8'); ctx.restore(); }
// captions
const CAPS = []; CL.forEach((c0, ci) => { let cur = []; const flush = () => { if (cur.length) CAPS.push({ a: cur[0].a, b: cur[cur.length - 1].b, txt: cur.map(w => w.w).join(' ') }); cur = []; };
  c0.words.forEach(w => { if (cur.length && (cur.length >= 4 || w.a - cur[cur.length - 1].b > 0.2 || (/^(You|And|Like|Part|Through|It|Same|But|Picks|Then|A|I|Rule|Never|So|There's|It's|Lily|Come|Quick|They|What's|Silence|Option|Trust|Burst|Comment)$/.test(w.w) && cur.length > 1))) flush(); cur.push(w); }); flush(); });
CAPS.forEach((c, i) => { const nx = CAPS[i + 1]; c.b = nx ? Math.min(nx.a, c.b + 0.35) : c.b + 0.8; c.txt = c.txt.replace(/[:\-"]/g, '').replace(/rule two/i, 'rule 2').replace(/Rule three/i, 'Rule 3.').replace(/part four/i, 'part 4').replace(/Part three/i, 'Part 3.'); });
function caption(s) { ctx.save(); ctx.font = '44px P8'; const words = s.split(' '); const lines = []; let cur = ''; for (const w of words) { const x = cur ? cur + ' ' + w : w; if (ctx.measureText(x).width > 600 && cur) { lines.push(cur); cur = w; } else cur = x; } lines.push(cur);
  const y0 = 1110 - (lines.length - 1) * 30; lines.forEach((l, i) => { ctx.lineJoin = 'round'; ctx.lineWidth = 10; ctx.strokeStyle = 'rgba(20,16,30,0.95)'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.strokeText(l, 360, y0 + i * 60); ctx.fillStyle = '#fff'; ctx.fillText(l, 360, y0 + i * 60); }); ctx.restore(); }

// ---------- new characters + locations ----------
const YOU = { top: '#3f8f86', top2: '#347a72', pants: '#2e3448', hair: '#2a1c14', skin: '#e8b896', shoe: '#2a2a33', H: 330 };
const LILY = { top: '#f2c14e', top2: '#d8a83a', pants: '#f2c14e', hair: '#7a3a20', skin: '#f3cba6', shoe: '#e8e0d0', H: 220, pony: true, stripes: true };
const COPY = { top: '#14121c', top2: '#0e0c14', pants: '#14121c', hair: '#0e0c14', skin: '#14121c', shoe: '#0e0c14', H: 330 };
function chat(T, cx, cy, s, msgs, o = {}) { ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s); const w = 440, h = 880;
  glow(0, 0, 560, 'rgba(120,200,190,A)', 0.12);
  rr(-w / 2, -h / 2, w, h, 56, '#15131c'); rr(-w / 2 + 16, -h / 2 + 16, w - 32, h - 32, 42, '#f7f1e8'); rr(-50, -h / 2 + 28, 100, 26, 13, '#15131c');
  // header: your own contact
  ctx.fillStyle = '#ece4d8'; ctx.beginPath(); ctx.roundRect(-w / 2 + 16, -h / 2 + 16, w - 32, 170, [42, 42, 0, 0]); ctx.fill();
  const hi = o.hi || {}; circ(0, -h / 2 + 100, 38, '#3f8f86'); if (hi.photo) { ctx.lineWidth = 6; ctx.strokeStyle = '#d9533f'; ctx.beginPath(); ctx.arc(0, -h / 2 + 100, 46, 0, 7); ctx.stroke(); }
  circ(0, -h / 2 + 90, 14, '#e8b896'); ctx.fillStyle = '#2a1c14'; ctx.beginPath(); ctx.arc(0, -h / 2 + 88, 15, PI, 0); ctx.fill(); rr(-18, -h / 2 + 106, 36, 22, 10, '#e8b896');
  text('Me', 0, -h / 2 + 152, 24, hi.name ? '#d9533f' : '#2a2a2a', 'P8'); text('YOUR NUMBER', 0, -h / 2 + 176, 13, hi.num ? '#d9533f' : '#8a8078', 'P8');
  if (hi.name || hi.num) { ctx.lineWidth = 4; ctx.strokeStyle = '#d9533f'; ctx.strokeRect(hi.name ? -40 : -70, hi.name ? -h / 2 + 136 : -h / 2 + 166, hi.name ? 80 : 140, hi.name ? 32 : 22); }
  let y = -h / 2 + 220; text(o.time || '3.14 AM', 0, y, 15, '#8a8078', 'P7'); y += 30;
  ctx.font = '25px P7'; msgs.forEach(m => { if (T < m.t) return; const a = prog(T, m.t, m.t + 0.2); const lines = m.text.split('\n'); const bw = Math.max(...lines.map(l => ctx.measureText(l).width)) + 44, bh = lines.length * 34 + 26; const me = m.me;
    ctx.save(); ctx.globalAlpha = a; const bx = me ? w / 2 - 40 - bw : -w / 2 + 40; rr(bx, y + (1 - a) * 20, bw, bh, 22, me ? '#3f8f86' : (m.red ? '#d9533f' : '#e2d8ca'));
    lines.forEach((l, i) => text(l, bx + 22, y + (1 - a) * 20 + 30 + i * 34, 25, me || m.red ? '#fff' : '#2a2a2a', 'P7', 'left')); ctx.restore(); y += bh + 14; });
  if (o.typing && T > o.typing[0] && T < o.typing[1]) { rr(-w / 2 + 40, y, 100, 50, 22, '#e2d8ca'); for (let i = 0; i < 3; i++) circ(-w / 2 + 68 + i * 22, y + 25 + S(T * 10 - i) * 4, 7, '#8a8078'); }
  if (o.sent) { ctx.fillStyle = '#f7f1e8'; ctx.fillRect(-w / 2 + 16, -h / 2 + 186, w - 32, h - 210); text('SENT', 0, -h / 2 + 240, 26, '#2a2a2a', 'P8'); text('No messages', 0, 0, 30, '#8a8078', 'P7'); }
  rr(-w / 2 + 34, h / 2 - 90, w - 68, 54, 27, '#ece4d8'); text(o.draft || 'iMessage', -w / 2 + 62, h / 2 - 62, 22, o.draft ? '#2a2a2a' : '#a8a098', 'P7', 'left');
  ctx.restore(); }
function banner(T, a, msg) { if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.translate(0, (1 - a) * -60); rr(40, 200, 640, 120, 28, '#f7f1e8'); circ(100, 260, 32, '#3f8f86'); circ(100, 252, 12, '#e8b896'); text('Me', 150, 238, 26, '#2a2a2a', 'P8', 'left'); text('now', 650, 238, 20, '#8a8078', 'P7', 'right'); text(msg, 150, 280, 22, '#2a2a2a', 'P7', 'left'); ctx.restore(); }
function doorIn(T, o = {}) { ctx.fillStyle = '#5c434c'; ctx.fillRect(-300, -300, 1400, 2000); ctx.fillStyle = '#6b4a3a'; ctx.fillRect(-300, 1120, 1400, 600);
  let sh = 0; for (const k of o.knocks || []) if (T > k && T < k + 0.25) sh = (1 - (T - k) / 0.25) * 10; ctx.save(); ctx.translate((Math.random() - 0.5) * sh, 0);
  rr(170, 200, 380, 930, 6, '#3a2a30'); rr(185, 215, 350, 905, 4, '#7a5040'); rr(215, 250, 290, 360, 6, '#6a4434'); rr(215, 650, 290, 430, 6, '#6a4434'); circ(495, 680, 16, '#c8a050');
  rr(470, 600, 50, 28, 8, '#2b1f25'); const lk = ease(o.lock || 0); rr(lerp(470, 520, lk), 606, 34, 16, 6, '#c8a050'); if (lk > 0.95) { ctx.fillStyle = '#c8a050'; ctx.fillRect(546, 604, 10, 20); }
  ctx.restore(); const lit = 0.75 + 0.25 * S(T * 23) * (S(T * 2) > 0.7 ? 1 : 0); ctx.fillStyle = `rgba(255,220,160,${lit})`; ctx.fillRect(185, 1118, 350, 8); glow(360, 1128, 300, 'rgba(255,200,130,A)', 0.22 * lit);
  if (o.feet != null) { const fx = 300 + (o.feet || 0) * 420; ctx.fillStyle = '#0c0b12'; ctx.fillRect(fx, 1116, 26, 12); ctx.fillRect(fx + 70, 1116, 26, 12); poly([[fx, 1128], [fx + 26, 1128], [fx - 30, 1400], [fx - 90, 1400]], 'rgba(12,11,18,0.8)'); poly([[fx + 70, 1128], [fx + 96, 1128], [fx + 130, 1400], [fx + 80, 1400]], 'rgba(12,11,18,0.8)'); }
  if (o.you) { person(YOU, 640, 1260, 1.15, -1, o.you, T); } }
function hall2(T, o = {}) { ctx.fillStyle = '#3a3044'; ctx.fillRect(-300, -300, 1400, 2000); ctx.fillStyle = '#2a2230'; ctx.fillRect(-300, 1000, 1400, 800); ctx.fillStyle = '#463a50'; ctx.fillRect(-300, 960, 1400, 40);
  for (const [x, nm] of [[20, ''], [480, 'LILY']]) { rr(x, 330, 230, 640, 6, '#1e1820'); rr(x + 12, 344, 206, 616, 4, '#6a4a3a'); circ(x + 190, 670, 11, '#c8a050'); if (nm) { rr(x + 55, 420, 120, 60, 12, '#f2c14e'); text(nm, x + 115, 452, 26, '#7a3a20', 'P8'); for (let i = 0; i < 4; i++) { circ(x + 40 + i * 50, 520 + (i % 2) * 30, 8, '#f6d08a'); } } }
  rr(320, 860, 40, 30, 8, '#f6d08a'); glow(340, 870, 120, 'rgba(255,210,140,A)', 0.4);
  if (o.walk != null) { const k = o.walk; const x = lerp(170, 560, k); person(COPY, x, 1000, 1, 1, k < 1 ? { ...walk(T * 0.55, 0.6), face: 'side', glow: 1 } : { face: 'side', glow: 1, armR: [-1.4, 0] }, T); } }
function lilyRoom(T) { ctx.fillStyle = '#3a3050'; ctx.fillRect(-300, -300, 1400, 2000); ctx.fillStyle = '#4a3a3a'; ctx.fillRect(-300, 1000, 1400, 800); city(470, 260, 200, 260, T, { moon: true }); ctx.fillStyle = '#1e1519'; ctx.fillRect(462, 252, 216, 10); ctx.fillRect(462, 518, 216, 12); ctx.fillRect(565, 252, 8, 270);
  rr(60, 820, 520, 200, 20, '#f2a8b8'); rr(60, 760, 60, 260, 10, '#8a5a6a'); rr(90, 800, 150, 60, 26, '#f7f1e8'); ctx.save(); ctx.translate(455, 832); ctx.rotate(-PI / 2); person(LILY, 0, 0, 1.45, 1, { face: 'front', sleep: 1, armL: [0.1, 0], armR: [-0.1, 0] }, T); ctx.restore(); poly([[180, 840], [570, 840], [580, 960], [170, 960]], '#e88aa0');
  for (let i = 0; i < 3; i++) text('z', 260 + i * 34, 700 - i * 40 - (T * 20 % 40), 34 + i * 6, `rgba(255,255,255,${0.6 - i * 0.15})`, 'P8'); circ(640, 980, 18, '#f6d08a'); glow(640, 980, 140, 'rgba(255,210,140,A)', 0.45); }

// ---------- part 2 locations ----------
function smallFeet(fx) { ctx.fillStyle = '#0c0b12'; ctx.fillRect(fx, 1117, 18, 10); ctx.fillRect(fx + 40, 1117, 18, 10); poly([[fx, 1127], [fx + 18, 1127], [fx - 20, 1330], [fx - 60, 1330]], 'rgba(12,11,18,0.75)'); poly([[fx + 40, 1127], [fx + 58, 1127], [fx + 80, 1330], [fx + 50, 1330]], 'rgba(12,11,18,0.75)'); }
function lilyDoor(T, ajar) { ctx.fillStyle = '#3a3044'; ctx.fillRect(-300, -300, 1400, 2000); ctx.fillStyle = '#2a2230'; ctx.fillRect(-300, 1000, 1400, 800); ctx.fillStyle = '#463a50'; ctx.fillRect(-300, 960, 1400, 40);
  rr(230, 330, 260, 640, 6, '#1e1820'); ctx.fillStyle = '#060408'; ctx.fillRect(244, 344, 232, 616); const k = ease(ajar); poly([[244, 344], [244 + 232 * (1 - k * 0.35), 344 - k * 20], [244 + 232 * (1 - k * 0.35), 960 + k * 20], [244, 960]], '#6a4a3a');
  rr(290, 420, 120 * (1 - k * 0.35), 60, 12, '#f2c14e'); if (k < 0.3) text('LILY', 350, 452, 26, '#7a3a20', 'P8'); circ(244 + 232 * (1 - k * 0.35) - 24, 670, 10, '#c8a050'); rr(560, 860, 40, 30, 8, '#f6d08a'); glow(580, 870, 120, 'rgba(255,210,140,A)', 0.4); }
function underBed(T) { ctx.fillStyle = '#2a2236'; ctx.fillRect(-300, -300, 1400, 2000); ctx.fillStyle = '#e88aa0'; ctx.fillRect(-300, 300, 1400, 120); ctx.fillStyle = '#c86a80'; ctx.fillRect(-300, 420, 1400, 40); ctx.fillStyle = '#0e0a14'; ctx.fillRect(-300, 460, 1400, 520); ctx.fillStyle = '#4a3a3a'; ctx.fillRect(-300, 980, 1400, 800);
  ctx.fillStyle = '#8a5a6a'; ctx.fillRect(40, 460, 30, 520); ctx.fillRect(650, 460, 30, 520);
  const bl = (T * 0.6 % 3) < 0.1 ? 0.15 : 1; for (const dx of [-28, 28]) { ctx.beginPath(); ctx.ellipse(330 + dx, 760, 13, 16 * bl, 0, 0, PI * 2); ctx.fillStyle = '#f7f1e8'; ctx.fill(); circ(332 + dx, 762, 6 * bl, '#2a1f1f'); }
  ctx.beginPath(); ctx.ellipse(330, 800, 60, 40, 0, PI, 0); ctx.fillStyle = 'rgba(243,203,166,0.25)'; ctx.fill(); circ(450, 820, 46, '#a07050'); circ(420, 785, 18, '#a07050'); circ(480, 785, 18, '#a07050'); circ(436, 815, 5, '#2a1f1f'); circ(464, 815, 5, '#2a1f1f'); }
function windowFace(T, o = {}) { room(T, { lamp: 0, dim: 0.55, city: {} }); let sh = 0; for (const k of o.knocks || []) if (T > k && T < k + 0.25) sh = (1 - (T - k) / 0.25);
  const a = o.face || 0; if (a > 0) { ctx.save(); ctx.globalAlpha = a; ctx.beginPath(); ctx.rect(WIN[0], WIN[1], WIN[2], WIN[3]); ctx.clip(); const fx = 470, fy = 560 + (1 - a) * 300; circ(fx, fy, 120, '#0e0c14'); rr(fx - 140, fy + 100, 280, 300, 80, '#0e0c14');
    for (const dx of [-42, 42]) { glow(fx + dx, fy - 10, 40, 'rgba(255,255,255,A)', 0.4); circ(fx + dx, fy - 10, 10, '#fff'); }
    ctx.strokeStyle = '#0e0c14'; ctx.lineCap = 'round'; for (let f = 0; f < 4; f++) { ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(fx - 190 + f * 20, fy + 260); ctx.lineTo(fx - 200 + f * 22 + sh * 6, fy + 120 - f * 6); ctx.stroke(); } ctx.restore(); } }
function wardrobeIn(T) { ctx.fillStyle = '#0c0910'; ctx.fillRect(-300, -300, 1400, 2000); const g_ = ctx.createLinearGradient(330, 0, 390, 0); g_.addColorStop(0, 'rgba(255,210,150,0)'); g_.addColorStop(0.5, 'rgba(255,210,150,0.55)'); g_.addColorStop(1, 'rgba(255,210,150,0)'); ctx.fillStyle = g_; ctx.fillRect(330, 0, 60, 1300); ctx.fillStyle = 'rgba(255,225,180,0.9)'; ctx.fillRect(358, 0, 4, 1300);
  for (let i = 0; i < 6; i++) { rr(60 + i * 110, 300, 90, 420, 30, ['#2a2430', '#3a2a30', '#24302e', '#302a24', '#2a2a36', '#36242a'][i]); } person(YOU, 330, 1230, 1.3, 1, { ...SIT, face: 'front', scared: 1, armL: [-0.6, -2.2], armR: [-0.6, -2.2] }, T); }

// ---------- part 3 pieces ----------
function gapView(T, w, inner) { ctx.fillStyle = '#07060a'; ctx.fillRect(-300, -300, 1400, 2000);
  ctx.save(); ctx.beginPath(); ctx.rect(360 - w / 2, 0, w, H); ctx.clip(); inner(); ctx.restore(); reset();
  for (const sd of [-1, 1]) { const ex = 360 + sd * w / 2; const g = ctx.createLinearGradient(ex, 0, ex + sd * 120, 0); g.addColorStop(0, 'rgba(255,210,150,0.25)'); g.addColorStop(1, 'rgba(255,210,150,0)'); ctx.fillStyle = g; ctx.fillRect(Math.min(ex, ex + sd * 120), 0, 120, H); ctx.fillStyle = '#1a1214'; ctx.fillRect(sd < 0 ? ex - 16 : ex, 0, 16, H); }
  for (let i = 0; i < 6; i++) { const x = i < 3 ? 40 + i * 90 : 400 + (i - 3) * 100; if (Math.abs(x + 40 - 360) < w / 2 + 40) continue; rr(x, -20, 80, 420, 34, ['#120e14', '#16101a', '#100c12'][i % 3]); } }
function vent(T, o = {}) { ctx.fillStyle = '#2a1c16'; ctx.fillRect(-300, -300, 1400, 2000); for (let y = 0; y < H; y += 130) { ctx.fillStyle = '#24180f'; ctx.fillRect(0, y, W, 6); }
  rr(190, 430, 340, 260, 10, '#3a3a40'); rr(205, 445, 310, 230, 6, '#0a0a0e'); if (o.eyes) { const k = o.eyes; for (const dx of [-26, 26]) { glow(360 + dx, 560, 40, 'rgba(255,255,255,A)', 0.35 * k); circ(360 + dx, 560, 6, `rgba(255,255,255,${k})`); } }
  for (let i = 0; i < 8; i++) rr(205, 452 + i * 28, 310, 14, 4, '#4a4a52'); for (const [x, y] of [[200, 440], [520, 440], [200, 680], [520, 680]]) circ(x, y, 7, '#8a8a90');
  let sh = 0; for (const k of o.taps || []) if (T > k && T < k + 0.2) sh = (1 - (T - k) / 0.2) * 8; if (sh) { ctx.fillStyle = `rgba(255,255,255,${sh * 0.02})`; ctx.fillRect(0, 0, W, H); } }
function duct(T) { ctx.fillStyle = '#0a0a0e'; ctx.fillRect(0, 0, 720, 640); for (let i = 0; i < 6; i++) { const k = i / 6, s_ = 1 - k * 0.8; ctx.strokeStyle = `rgba(140,140,150,${0.6 - k * 0.5})`; ctx.lineWidth = 4; ctx.strokeRect(360 - 330 * s_, 330 - 260 * s_, 660 * s_, 520 * s_); } glow(360, 330, 90, 'rgba(255,220,170,A)', 0.5); ctx.save(); ctx.translate(360, 520); ctx.rotate(0); person(YOU, 0, 40, 0.9, 1, { face: 'back', ...walk(T * 0.6, 0.4), armL: [PI - 0.6, 0], armR: [PI - 0.8, 0], sit: 0.8 }, T); ctx.restore(); }
function frontDoor(T) { ctx.fillStyle = '#3a3044'; ctx.fillRect(0, 0, 720, 640); ctx.fillStyle = '#2a2230'; ctx.fillRect(0, 480, 720, 160); rr(420, 120, 200, 360, 6, '#1e1820'); rr(432, 132, 176, 348, 4, '#7a4a3a'); circ(590, 320, 9, '#c8a050'); rr(470, 80, 120, 34, 6, '#1a7a3a'); text('EXIT', 530, 98, 20, '#d8ffe0', 'P8'); person(YOU, lerp(80, 360, (T * 0.4) % 1), 520, 0.75, 1, { ...walk(T, 1), scared: 1 }, T); }
const COPYU = { ...YOU };
function roomWide(T, fx, fy, z) { camera(fx, fy, z); room(T, { lamp: 0.5, dim: 0.5 }); }

// ---------- breast anatomy explainer (textbook cross-section) ----------
const SKIN = '#f2c6a8', SKIN2 = '#e0a888', FAT = '#f6d26a', MUS = '#d8604a', LOB = '#f08aa0', DUCT = '#c84a6a', RIB = '#efe4cc', LIG = '#ffffff';
// side profile: chest wall on the left, body faces right; bulge peaks at the nipple (470,700)
function outline(sc = 1) { const k = sc; ctx.beginPath(); ctx.moveTo(200, 320); ctx.lineTo(200, 540); ctx.bezierCurveTo(260 + 60 * k, 560, 440 + 40 * (k - 1), 600, 462 + 40 * (k - 1), 690); ctx.quadraticCurveTo(478 + 40 * (k - 1), 700, 462 + 40 * (k - 1), 712); ctx.bezierCurveTo(440 + 40 * (k - 1), 820, 300, 880, 205, 880); ctx.lineTo(200, 1010); }
const NIP = [474, 700];
const LOBS = [[300, 640], [350, 600], [400, 650], [330, 730], [390, 760], [290, 800]];
function diagram(T, o = {}) { const L = o.layers || {};
  // body background (skin) + chest wall
  ctx.fillStyle = SKIN; ctx.beginPath(); ctx.moveTo(60, 320); ctx.lineTo(200, 320); ctx.lineTo(200, 540); ctx.bezierCurveTo(320, 560, 440, 600, 462, 690); ctx.quadraticCurveTo(478, 700, 462, 712); ctx.bezierCurveTo(440, 820, 300, 880, 205, 880); ctx.lineTo(200, 1010); ctx.lineTo(60, 1010); ctx.closePath(); ctx.fill();
  if (L.ribs) { ctx.save(); ctx.globalAlpha = L.ribs; for (let y = 380; y < 1000; y += 74) { ctx.beginPath(); ctx.ellipse(130, y, 42, 24, 0, 0, PI * 2); ctx.fillStyle = RIB; ctx.fill(); ctx.strokeStyle = '#c8b898'; ctx.lineWidth = 3; ctx.stroke(); } ctx.restore(); }
  if (L.muscle) { ctx.save(); ctx.globalAlpha = L.muscle; ctx.fillStyle = MUS; ctx.beginPath(); ctx.moveTo(185, 360); ctx.quadraticCurveTo(245, 380, 248, 520); ctx.lineTo(250, 900); ctx.quadraticCurveTo(230, 960, 185, 970); ctx.closePath(); ctx.fill(); ctx.strokeStyle = 'rgba(120,30,20,0.35)'; ctx.lineWidth = 3; for (let y = 400; y < 950; y += 26) { ctx.beginPath(); ctx.moveTo(190, y); ctx.lineTo(244, y + 14); ctx.stroke(); } ctx.restore(); }
  if (L.fat) { const f = L.fat; ctx.save(); ctx.beginPath(); ctx.moveTo(250, 560); ctx.bezierCurveTo(330, 575, 432, 610, 452, 690); ctx.quadraticCurveTo(466, 700, 452, 710); ctx.bezierCurveTo(432, 806, 320, 862, 250, 866); ctx.closePath(); ctx.clip(); ctx.fillStyle = FAT; ctx.fillRect(250, 560, (452 - 250) * f + 10, 320); const r = rng(4); for (let i = 0; i < 70; i++) { const x = 255 + r() * 200, y = 565 + r() * 300; if (x < 250 + 210 * f) { ctx.beginPath(); ctx.arc(x, y, 6 + r() * 12, 0, PI * 2); ctx.fillStyle = 'rgba(255,240,170,0.65)'; ctx.fill(); ctx.strokeStyle = 'rgba(210,170,60,0.4)'; ctx.lineWidth = 2; ctx.stroke(); } } ctx.restore(); }
  if (L.lig) { ctx.save(); ctx.globalAlpha = L.lig; const st = o.stretch || 0; ctx.strokeStyle = LIG; ctx.lineWidth = 4; ctx.lineCap = 'round'; for (const [sy, ey, ex] of [[580, 590, 360], [640, 640, 445], [720, 790, 430], [800, 850, 330], [690, 700, 455]]) { ctx.beginPath(); ctx.moveTo(250, sy); ctx.quadraticCurveTo(330, (sy + ey) / 2 + st * 30 + S(T * 2) * 3, ex, ey + st * 30); ctx.stroke(); } ctx.restore(); }
  if (L.lob) { const g = L.lob; LOBS.forEach(([x, y], i) => { const k = clamp(g * 1.6 - i * 0.12); if (k <= 0) return; const milk = o.milk || 0; for (let j = 0; j < 7; j++) { const a = j / 7 * PI * 2 + i; circ(x + C(a) * 14 * k, y + S(a) * 14 * k, 9 * k, milk > 0.1 ? `rgb(${lerp(240, 255, milk)},${lerp(138, 250, milk)},${lerp(160, 245, milk)})` : LOB); } circ(x, y, 9 * k, '#e86a88'); }); }
  if (L.ducts) { const d = L.ducts; ctx.save(); ctx.strokeStyle = DUCT; ctx.lineWidth = 5; ctx.lineCap = 'round'; LOBS.forEach(([x, y], i) => { const n = 30, m = Math.floor(n * d); ctx.beginPath(); for (let j = 0; j <= m; j++) { const q = j / n; const px = lerp(x, NIP[0] - 8, q), py = lerp(y, NIP[1], q) + S(q * PI) * (y - NIP[1]) * 0.15; j ? ctx.lineTo(px, py) : ctx.moveTo(px, py); } ctx.stroke();
      if (o.flow) for (let k = 0; k < 3; k++) { const q = ((T * 0.45 + k / 3 + i * 0.13) % 1) * d; const px = lerp(x, NIP[0] - 8, q), py = lerp(y, NIP[1], q) + S(q * PI) * (y - NIP[1]) * 0.15; circ(px, py, 6, '#fff'); } }); ctx.restore(); }
  // areola / nipple
  if (L.nip) { ctx.save(); ctx.globalAlpha = L.nip; ctx.fillStyle = '#c8786a'; ctx.beginPath(); ctx.moveTo(458, 672); ctx.quadraticCurveTo(486, 700, 458, 728); ctx.closePath(); ctx.fill(); ctx.restore(); }
  // skin outline
  ctx.strokeStyle = SKIN2; ctx.lineWidth = 7; ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(200, 320); ctx.lineTo(200, 540); ctx.bezierCurveTo(320, 560, 440, 600, 462, 690); ctx.quadraticCurveTo(478, 700, 462, 712); ctx.bezierCurveTo(440, 820, 300, 880, 205, 880); ctx.lineTo(200, 1010); ctx.stroke(); }
function lbl(s, ax, ay, lx, ly, a, col = '#2a2a2a', bg = '#f7f1e8') { if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = '#2a2a2a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(lx, ly); ctx.stroke(); circ(ax, ay, 7, '#2a2a2a'); ctx.font = '28px P8'; const w = ctx.measureText(s).width + 36; rr(lx - (lx > ax ? 0 : w), ly - 25, w, 50, 25, bg); ctx.strokeStyle = '#2a2a2a'; ctx.strokeRect; text(s, lx + (lx > ax ? w / 2 : -w / 2), ly + 1, 28, col, 'P8'); ctx.restore(); }
function bg(T) { ctx.fillStyle = '#f4ede4'; ctx.fillRect(-400, -400, 1600, 2200); for (let i = 0; i < 9; i++) circ(80 + i * 90, 1180 + S(T + i) * 6, 30, 'rgba(216,96,74,0.05)'); }
function muscleIcon(x, y, s, T) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = '#f2c6a8'; ctx.beginPath(); ctx.moveTo(-90, 60); ctx.quadraticCurveTo(-100, -20, -40, -40); ctx.quadraticCurveTo(-30, -110, 20, -100); ctx.quadraticCurveTo(70, -90, 60, -50); ctx.quadraticCurveTo(10, -60, 0, -30); ctx.quadraticCurveTo(60, -10, 70, 40); ctx.quadraticCurveTo(80, 70, 40, 80); ctx.lineTo(-90, 80); ctx.closePath(); ctx.fill(); ctx.strokeStyle = SKIN2; ctx.lineWidth = 6; ctx.stroke(); ctx.restore(); }
function xstamp(x, y, s, a) { if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.scale(s * (1 + (1 - a) * 0.6), s * (1 + (1 - a) * 0.6)); ctx.strokeStyle = '#d9533f'; ctx.lineWidth = 28; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-90, -90); ctx.lineTo(90, 90); ctx.moveTo(90, -90); ctx.lineTo(-90, 90); ctx.stroke(); ctx.restore(); }
function check(x, y, s, a, col = '#3f9a6a') { if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.scale(s, s); circ(0, 0, 70, col); ctx.strokeStyle = '#fff'; ctx.lineWidth = 16; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(-32, 0); ctx.lineTo(-8, 26); ctx.lineTo(36, -26); ctx.stroke(); ctx.restore(); }
function baby(x, y, s, T) { ctx.save(); ctx.translate(x, y + S(T * 3) * 4); ctx.scale(s, s); rr(-70, -10, 140, 120, 60, '#a8d0f0'); circ(0, -30, 55, '#f3cba6'); circ(-18, -32, 5, '#2a1f1f'); circ(18, -32, 5, '#2a1f1f'); ctx.strokeStyle = '#2a1f1f'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(0, -16, 12, 0.2, PI - 0.2); ctx.stroke(); circ(-30, -14, 9, 'rgba(240,120,120,0.4)'); circ(30, -14, 9, 'rgba(240,120,120,0.4)'); ctx.restore(); }
function drop(x, y, s) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.moveTo(0, -70); ctx.bezierCurveTo(40, -10, 55, 20, 0, 55); ctx.bezierCurveTo(-55, 20, -40, -10, 0, -70); ctx.fill(); ctx.strokeStyle = '#a8c8e8'; ctx.lineWidth = 6; ctx.stroke(); ctx.restore(); }
function molecule(x, y, s, T) { ctx.save(); ctx.translate(x, y); ctx.rotate(S(T) * 0.1); ctx.scale(s, s); ctx.strokeStyle = '#8a5ac8'; ctx.lineWidth = 7; for (const [cx, cy] of [[-60, 0], [0, -35], [60, 0]]) { ctx.beginPath(); for (let k = 0; k <= 6; k++) { const a = k / 6 * PI * 2 + PI / 6; k ? ctx.lineTo(cx + C(a) * 40, cy + S(a) * 40) : ctx.moveTo(cx + C(a) * 40, cy + S(a) * 40); } ctx.stroke(); } circ(100, -20, 12, '#d9533f'); circ(-100, 20, 12, '#d9533f'); ctx.restore(); }
function mound(x, y, s, col = SKIN) { ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(x - 60 * s, y); ctx.quadraticCurveTo(x - 50 * s, y - 70 * s, x, y - 75 * s); ctx.quadraticCurveTo(x + 50 * s, y - 70 * s, x + 60 * s, y); ctx.closePath(); ctx.fill(); ctx.strokeStyle = SKIN2; ctx.lineWidth = 5; ctx.stroke(); }
function big(s, y, size, col, a = 1, font = 'P8', x = 360) { if (a <= 0) return; ctx.save(); ctx.globalAlpha = Math.min(1, a); ctx.font = `${size}px ${font}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round'; ctx.lineWidth = size * 0.16; ctx.strokeStyle = '#fffaf2'; const sc = a < 1 ? 1 + (1 - a) * 0.3 : 1; ctx.translate(x, y); ctx.scale(sc, sc); ctx.strokeText(s, 0, 0); ctx.fillStyle = col; ctx.fillText(s, 0, 0); ctx.restore(); }
// ---------- chest workout reply ----------
let CIMG;
// diagram2: m = pec growth, lift = how far the breast sits up, shrink = fat loss
function diagram2(T, m, lift, shrink, labels) { const dx = 34 * m, dy = -26 * lift, sc = 1 - 0.22 * shrink;
  ctx.fillStyle = SKIN; ctx.fillRect(60, 320, 140 + dx, 690);
  for (let y = 380; y < 1000; y += 74) { ctx.beginPath(); ctx.ellipse(130, y, 42, 24, 0, 0, PI * 2); ctx.fillStyle = RIB; ctx.fill(); ctx.strokeStyle = '#c8b898'; ctx.lineWidth = 3; ctx.stroke(); }
  ctx.fillStyle = MUS; ctx.beginPath(); ctx.moveTo(185, 360); ctx.quadraticCurveTo(245 + dx * 1.6, 380, 248 + dx, 520); ctx.lineTo(250 + dx, 900); ctx.quadraticCurveTo(230 + dx, 960, 185, 970); ctx.closePath(); ctx.fill(); ctx.strokeStyle = 'rgba(120,30,20,0.35)'; ctx.lineWidth = 3; for (let y = 400; y < 950; y += 26) { ctx.beginPath(); ctx.moveTo(190, y); ctx.lineTo(244 + dx, y + 14); ctx.stroke(); }
  ctx.save(); ctx.translate(dx, dy); ctx.translate(250, 715); ctx.scale(sc, sc); ctx.translate(-250, -715);
  ctx.fillStyle = SKIN; ctx.beginPath(); ctx.moveTo(200, 540); ctx.bezierCurveTo(320, 560, 440, 600, 462, 690); ctx.quadraticCurveTo(478, 700, 462, 712); ctx.bezierCurveTo(440, 820, 300, 880, 205, 880); ctx.closePath(); ctx.fill();
  ctx.save(); ctx.beginPath(); ctx.moveTo(250, 560); ctx.bezierCurveTo(330, 575, 432, 610, 452, 690); ctx.quadraticCurveTo(466, 700, 452, 710); ctx.bezierCurveTo(432, 806, 320, 862, 250, 866); ctx.closePath(); ctx.clip(); ctx.fillStyle = FAT; ctx.fillRect(250, 560, 220, 320); const r = rng(4); for (let i = 0; i < 70; i++) { const x = 255 + r() * 200, y = 565 + r() * 300; ctx.beginPath(); ctx.arc(x, y, 6 + r() * 12, 0, PI * 2); ctx.fillStyle = 'rgba(255,240,170,0.65)'; ctx.fill(); } ctx.restore();
  LOBS.forEach(([x, y], i) => { for (let j = 0; j < 7; j++) { const a = j / 7 * PI * 2 + i; circ(x + C(a) * 14, y + S(a) * 14, 9, LOB); } circ(x, y, 9, '#e86a88'); });
  ctx.fillStyle = '#c8786a'; ctx.beginPath(); ctx.moveTo(458, 672); ctx.quadraticCurveTo(486, 700, 458, 728); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = SKIN2; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(200, 540); ctx.bezierCurveTo(320, 560, 440, 600, 462, 690); ctx.quadraticCurveTo(478, 700, 462, 712); ctx.bezierCurveTo(440, 820, 300, 880, 205, 880); ctx.stroke(); ctx.restore();
  ctx.strokeStyle = SKIN2; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(200, 320); ctx.lineTo(200 + dx * 0.3, 540 + dy); ctx.moveTo(205, 880 + dy); ctx.lineTo(200, 1010); ctx.stroke();
  if (labels) { lbl('MUSCLE (PECS)', 225 + dx * 0.7, 460, 340, 390, labels.mus || 0); lbl('FAT + GLANDS', 330 + dx, 760 + dy, 380, 960, labels.fat || 0, '#2a2a2a', FAT); } }
function commentCard(a, y = 230, s = 0.56) { if (a <= 0 || !CIMG) return; ctx.save(); ctx.globalAlpha = a; const w = 1179 * s, h = 407 * s; ctx.translate(360, y); const pop = a < 1 ? 0.8 + 0.2 * a : 1; ctx.scale(pop, pop); ctx.shadowColor = 'rgba(0,0,0,0.25)'; ctx.shadowBlur = 24; rr(-w / 2 - 10, -h / 2 - 10, w + 20, h + 20, 28, '#ffffff'); ctx.shadowBlur = 0; ctx.drawImage(CIMG, -w / 2, -h / 2, w, h); ctx.restore(); }
function scoreboard(T, k1, k2) { card(110, 380, 500, 360, 'CHEST DAY', 1); ctx.save(); ctx.globalAlpha = k1; text('MORE LIFT', 160, 510, 44, '#2a2a2a', 'P8', 'left'); check(540, 505, 0.5, 1); ctx.restore(); ctx.save(); ctx.globalAlpha = k2; text('MORE SIZE', 160, 640, 44, '#2a2a2a', 'P8', 'left'); ctx.restore(); xstamp(540, 635, 0.35, k2); }
// ---------- timeline ----------
const E = { if0: AT(0, 'if'), no: AT(0, 'no'), but0: AT(0, 'but'), fat1: AT(1, 'fat'), nomus: AT(1, "there's"), grow: AT(2, 'grow'), pecs: AT(2, 'pecs'), base: AT(2, 'so'), lifted: AT(3, 'lifted'), notgrow: AT(3, 'but'), twist: CL[4].start, burns: AT(4, 'burns'), smaller: AT(4, 'smaller'), since: AT(4, 'and', 1),
  so5: CL[5].start, lift5: AT(5, 'lift'), size5: AT(5, 'not'), q: AT(5, 'got'), comment: AT(5, 'comment') };
E.loop = TM.total - 0.4;
function shot(T) { const k = (a, b) => prog(T, a, b); bg(T);
  if (T < CL[1].start || T >= E.loop) { camera(360, 640, 1); const lp = T >= E.loop; 
    { ctx.save(); ctx.translate(0, 120); ctx.globalAlpha = lp || T < E.no - 0.1 ? 0.35 : 1; diagram2(T, 0, 0, 0, null); ctx.restore(); }
    commentCard(lp ? 1 : ease(k(0, 0.25)), 330, 0.56); tag('THEY ASKED', 360, 160, lp ? 1 : k(0.1, 0.4), '#3f8f86', '#fff'); if (!lp && T > E.no - 0.1) { ctx.save(); ctx.globalAlpha = k(E.no - 0.1, E.no + 0.1); rr(470, 760, 200, 110, 30, '#d9533f'); text('NO', 570, 818, 64, '#fff', 'P8'); ctx.restore(); } if (!lp && T > E.but0 - 0.1) tag('BUT SOMETHING CHANGES', 360, 1010, k(E.but0 - 0.1, E.but0 + 0.1), '#2a2a2a', '#fff'); return; }
  if (T < CL[2].start) { camL([330, 660, 1.0], [330, 680, 1.05], k(CL[1].start, CL[2].start)); diagram2(T, 0, 0, 0, { mus: k(E.nomus - 0.1, E.nomus + 0.2), fat: k(E.fat1 - 0.1, E.fat1 + 0.2) }); reset(); if (T > E.nomus - 0.1) tag('NO MUSCLE INSIDE', 360, 300, k(E.nomus - 0.1, E.nomus + 0.15), '#d9533f', '#fff'); return; }
  if (T < CL[3].start) { const m = ease(k(E.grow - 0.1, E.pecs + 0.6)); camL([330, 660, 1.05], [320, 670, 1.1], k(CL[2].start, CL[3].start)); diagram2(T, m, 0.3 * ease(k(E.base, E.base + 1.2)), 0, { mus: 1, fat: 0.6 }); reset(); if (T > E.grow) { const a = k(E.grow, E.grow + 0.2); ctx.save(); ctx.globalAlpha = a; text('💪', -999, -999, 1, '#000'); rr(400, 240, 260, 80, 40, MUS); text('PECS GROW', 530, 282, 30, '#fff', 'P8'); ctx.restore(); } if (T > E.base - 0.1) tag('BIGGER, FIRMER BASE', 360, 1010, k(E.base - 0.1, E.base + 0.1), '#3f8f86', '#fff'); return; }
  if (T < CL[4].start) { camL([320, 670, 1.1], [330, 660, 1.0], k(CL[3].start, CL[4].start)); diagram2(T, 1, 0.3 + 0.7 * ease(k(CL[3].start, E.lifted + 0.3)), 0, { mus: 1, fat: 1 }); reset(); ctx.save(); ctx.globalAlpha = k(E.lifted - 0.2, E.lifted + 0.1); ctx.strokeStyle = '#3f8f86'; ctx.lineWidth = 8; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(560, 760); ctx.lineTo(560, 640); ctx.moveTo(530, 670); ctx.lineTo(560, 635); ctx.lineTo(590, 670); ctx.stroke(); ctx.restore(); if (T > E.lifted - 0.1) tag('MORE LIFTED', 560, 560, k(E.lifted - 0.1, E.lifted + 0.1), '#3f8f86', '#fff'); if (T > E.notgrow - 0.1) tag('SAME SIZE TISSUE', 360, 1010, k(E.notgrow - 0.1, E.notgrow + 0.1), '#2a2a2a', '#fff'); return; }
  if (T < CL[5].start) { const sh = ease(k(E.burns, E.smaller + 0.4)); camera(330, 660, 1.0); diagram2(T, 1, 1, sh, { mus: 1, fat: 1 }); reset(); if (T < E.burns - 0.1) bigW("HERE'S THE TWIST", 300, 56, '#d9533f', k(E.twist, E.twist + 0.2)); else { ctx.save(); ctx.globalAlpha = k(E.burns - 0.1, E.burns + 0.1); rr(420, 240, 260, 80, 40, '#f4a020'); text('BURNS FAT', 550, 282, 30, '#fff', 'P8'); ctx.restore(); for (let i = 0; i < 10; i++) { const q = (T * 0.8 + i / 10) % 1; circ(420 + S(i * 2) * 40, 760 - q * 300, 8 * (1 - q), `rgba(246,210,106,${0.8 * (1 - q) * k(E.burns, E.burns + 0.3)})`); } } if (T > E.smaller - 0.2) tag('A BIT SMALLER', 360, 1010, k(E.smaller - 0.2, E.smaller + 0.1), '#d9533f', '#fff'); return; }
  camera(360, 640, 1); if (T < E.q - 0.1) { scoreboard(T, k(E.lift5 - 0.2, E.lift5 + 0.1), k(E.size5 - 0.1, E.size5 + 0.2)); return; } commentCard(0.85 + 0.15 * S(T * 3), 420, 0.5); bigW('GOT A QUESTION?', 700, 54, '#2a2a2a', k(E.q - 0.1, E.q + 0.15)); if (T > E.comment - 0.1) tag('COMMENT IT . I MIGHT ANSWER NEXT', 360, 800, k(E.comment - 0.1, E.comment + 0.15), '#3f8f86', '#fff'); }
function bigW(s, y, size, col, a = 1, x = 360) { if (a <= 0) return; ctx.save(); ctx.globalAlpha = Math.min(1, a); ctx.font = `${size}px P8`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round'; ctx.lineWidth = size * 0.16; ctx.strokeStyle = '#fffaf2'; const sc = a < 1 ? 1 + (1 - a) * 0.3 : 1; ctx.translate(x, y); ctx.scale(sc, sc); ctx.strokeText(s, 0, 0); ctx.fillStyle = col; ctx.fillText(s, 0, 0); ctx.restore(); }
window.init = async function () { await Promise.all(['30px P5', '30px P7', '30px P8'].map(f => document.fonts.load(f))); ctx = document.getElementById('c').getContext('2d');
  CIMG = await new Promise(r => { const im = new Image(); im.onload = () => r(im); im.src = window.CIMG_SRC; });
  grain = document.createElement('canvas'); grain.width = 360; grain.height = 640; const g = grain.getContext('2d'); const id = g.createImageData(360, 640); const r = rng(5); for (let i = 0; i < id.data.length; i += 4) { const v = r() * 255; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 14; } g.putImageData(id, 0, 0); };
window.DURATION = TM.total;
window.renderFrame = function (T) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; shot(T); reset(); const loop = T >= E.loop;
  ctx.drawImage(grain, 0, 0, W, H); if (T >= CL[1].start && !loop) { rr(24, 30, 250, 56, 28, 'rgba(42,42,42,0.85)'); text('YOU ASKED', 149, 59, 24, '#f6d08a', 'P8'); }
  const cap = CAPS.find(c => T >= c.a && T < c.b); if (cap && !loop) caption(cap.txt); };
})();
