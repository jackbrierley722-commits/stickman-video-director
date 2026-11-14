// Plane crash survival — scenes and timeline. Driven by narration timings in window.TIMING.
(() => {
const E = window.ENGINE;
const { clamp, lerp, ease, prog, rng, panel, camLerp, FULL, TOP, BOT, line, ellipse, rect, rrect, fillStroke, stroke, glow, comicText, burst, caption, silhouette } = E;
const W = 720, H = 1280, INK = '#111111', SIN = Math.sin, COS = Math.cos;
const TM = window.TIMING;
const CL = TM.clips;
// time (local to clip) of the n-th occurrence of a word in a clip
function wt(ci, word, n = 0) {
  const c = CL[ci]; let k = 0;
  for (const w of c.words) if (w.w.toLowerCase().replace(/[^a-z0-9']/g, '') === word.toLowerCase()) { if (k === n) return w.a - c.start; k++; }
  return 0;
}
const enter = (t, a, d = 0.35) => clamp((t - a) / d);

// ---------- the two friends ----------
const JAKE = { hair: 'spiky', hairCol: '#2a1c15', top: '#28344d', topLine: '#3d4b68', legs: '#1f2433', hood: true };
const RYAN = { hair: 'swept', hairCol: '#a2713f', top: '#b48c5c', topLine: '#8d6a42', legs: '#5a5e66', hood: false };

function armEnd(sx, sy, spec, len, ox, oy, s) {
  if (spec.to) return [(spec.to[0] - ox) / s, (spec.to[1] - oy) / s];
  const a = spec.a * Math.PI / 180; return [sx + COS(a) * (spec.len || len), sy + SIN(a) * (spec.len || len)];
}
function guy(ctx, who, x, y, s, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate((o.lean || 0) * Math.PI / 180);
  const w = o.walk; const sw = w === undefined ? 0 : SIN(w) * 24; ctx.translate(0, w === undefined ? 0 : Math.abs(COS(w)) * -5);
  const shiv = o.shiver ? SIN((o.t || 0) * 60) * 1.5 : 0; ctx.translate(shiv, 0);
  const top = -226, hipY = -112;
  // legs (jeans) — thin dark limb drawn thicker in jeans colour
  if (!o.noLegs) {
    for (const [hx, fx] of [[-16, -16 + sw], [16, 16 - sw]]) { line(ctx, hx, hipY, fx, 0, 15); line(ctx, hx, hipY, fx, 0, 9, who.legs); line(ctx, fx - 7, 2, fx + 9, 2, 10, o.socks || INK); }
  }
  // top / jacket
  ctx.beginPath(); ctx.moveTo(-48, top + 10); ctx.quadraticCurveTo(-52, top - 4, -30, top - 10); ctx.quadraticCurveTo(0, top - 2, 30, top - 10); ctx.quadraticCurveTo(52, top - 4, 48, top + 10);
  ctx.lineTo(54, hipY + 4); ctx.quadraticCurveTo(0, hipY + 12, -54, hipY + 4); ctx.closePath(); fillStroke(ctx, who.top, 5);
  if (who.hood) { ctx.beginPath(); ctx.moveTo(-30, top - 8); ctx.quadraticCurveTo(0, top + 22, 30, top - 8); stroke(ctx, 3, who.topLine); line(ctx, -8, top + 6, -10, top + 40, 2.5, '#d8d8d8'); line(ctx, 8, top + 6, 10, top + 40, 2.5, '#d8d8d8'); rrect(ctx, -28, hipY - 44, 56, 26, 6); stroke(ctx, 2.5, who.topLine); }
  else { line(ctx, 0, top + 2, 0, hipY + 8, 2.5, who.topLine); ctx.beginPath(); ctx.moveTo(-26, top - 8); ctx.lineTo(-6, top + 22); ctx.lineTo(0, top + 4); ctx.lineTo(6, top + 22); ctx.lineTo(26, top - 8); stroke(ctx, 3, who.topLine); }
  if (who.tie) { ctx.beginPath(); ctx.moveTo(-6, top + 6); ctx.lineTo(6, top + 6); ctx.lineTo(9, top + 70); ctx.lineTo(0, top + 84); ctx.lineTo(-9, top + 70); ctx.closePath(); fillStroke(ctx, who.tie, 3); }
  if (o.dirt) { for (const [dx, dy] of [[-30, -170], [22, -140], [-10, -128]]) { ellipse(ctx, dx, dy, 7, 4); ctx.fillStyle = 'rgba(60,45,30,0.55)'; ctx.fill(); } }
  // arms
  const arm = (spec, side) => {
    const sx = side * 42, sy = top + 22; const [ex, ey] = armEnd(sx, sy, spec, 112, x, y, s);
    const mx = lerp(sx, ex, 0.6), my = lerp(sy, ey, 0.6);
    line(ctx, sx, sy, mx, my, 22); line(ctx, sx, sy, mx, my, 15, who.top); line(ctx, mx, my, ex, ey, 6);
    ellipse(ctx, ex, ey, 8.5, 8.5); ctx.fillStyle = INK; ctx.fill();
  };
  arm(o.armL || { a: 100 }, -1); arm(o.armR || { a: 80 }, 1);
  if (o.cross) { line(ctx, -40, top + 62, 40, top + 52, 20); line(ctx, -40, top + 62, 40, top + 52, 13, who.top); line(ctx, 40, top + 62, -40, top + 52, 20); line(ctx, 40, top + 62, -40, top + 52, 13, who.top); }
  // head
  const hy = top - 64; line(ctx, 0, top - 4, 0, hy + 56, 4);
  ctx.save(); ctx.translate(0, hy); ctx.rotate((o.headTilt || 0) * Math.PI / 180);
  ellipse(ctx, 0, 0, 60, 60); fillStroke(ctx, '#ffffff', 5);
  const dx = o.eyeDX || 0, dy = o.eyeDY || 0, k = o.wide ? 1.35 : 1;
  for (const ex of [-21, 21]) {
    if (o.blink || o.closed) line(ctx, ex - 7 + dx, 4 + dy, ex + 7 + dx, 4 + dy, 2.6);
    else { ellipse(ctx, ex + dx, 2 + dy, 5 * k, 9 * k); ctx.fillStyle = INK; ctx.fill(); }
  }
  if (o.worried) { line(ctx, -30 + dx, -16, -12 + dx, -22, 2.5); line(ctx, 30 + dx, -16, 12 + dx, -22, 2.5); }
  if (o.mouth === 'o') { ellipse(ctx, dx * 0.5, 34, 6, 8); ctx.fillStyle = INK; ctx.fill(); } else line(ctx, -12 + dx * 0.4, 32, 12 + dx * 0.4, 32, 2.6);
  if (o.scratch) { line(ctx, 30, -6, 44, 6, 2.2, '#c0473a'); line(ctx, 34, -10, 48, 2, 2.2, '#c0473a'); }
  if (o.breath) { const b = ((o.t || 0) * 0.7) % 1; ellipse(ctx, 70 + b * 40, 30 - b * 30, 10 + b * 16, 7 + b * 10); ctx.fillStyle = `rgba(230,236,245,${0.5 * (1 - b)})`; ctx.fill(); }
  // hair
  ctx.beginPath();
  if (who.hair === 'spiky') {
    ctx.moveTo(-64, 4);
    for (const [px, py] of [[-72, -28], [-60, -22], [-68, -58], [-46, -48], [-44, -84], [-20, -64], [-8, -96], [10, -68], [30, -92], [36, -62], [62, -74], [56, -42], [74, -32], [62, -14], [68, 8]]) ctx.lineTo(px, py);
    ctx.lineTo(58, -10); ctx.lineTo(48, -26); ctx.lineTo(38, -6); ctx.lineTo(26, -30); ctx.lineTo(12, -14); ctx.lineTo(0, -32); ctx.lineTo(-14, -10); ctx.lineTo(-26, -30); ctx.lineTo(-40, -8); ctx.lineTo(-52, -22); ctx.lineTo(-58, 0);
  } else {
    ctx.moveTo(-62, 10); ctx.bezierCurveTo(-74, -50, -40, -82, 4, -80); ctx.bezierCurveTo(52, -80, 78, -50, 64, 6);
    ctx.quadraticCurveTo(58, -18, 48, -26); ctx.quadraticCurveTo(40, -10, 30, -6); ctx.quadraticCurveTo(26, -30, 2, -38);
    ctx.quadraticCurveTo(-24, -30, -36, -14); ctx.quadraticCurveTo(-44, -22, -48, -20); ctx.quadraticCurveTo(-56, -6, -62, 10);
  }
  ctx.closePath(); fillStroke(ctx, who.hairCol, 4);
  if (who.hair === 'swept') { ctx.beginPath(); ctx.moveTo(-30, -60); ctx.quadraticCurveTo(10, -66, 40, -44); stroke(ctx, 2.5, '#7a5230'); }
  ctx.restore();
  ctx.restore();
}
// lying down: rotate whole figure
function lying(ctx, who, x, y, s, o) { ctx.save(); ctx.translate(x, y); ctx.rotate(Math.PI / 2); guy(ctx, who, 0, 0, s, o); ctx.restore(); }

// ---------- 28th floor: cast & sets ----------
const YOU = { hair: 'swept', hairCol: '#3a2a1e', top: '#efefea', topLine: '#bdbdb8', legs: '#4a4e58', hood: false, tie: '#2a4a8a' };
const Z = (ctx, x, y, s, t, o = {}) => E.drawZombie(ctx, x, y, s, Object.assign({ t }, o));
const R2 = rng(5);
const WINDOWS = Array.from({ length: 400 }, () => R2());

function skyline(ctx, t, smoke = 1) {
  const g = ctx.createLinearGradient(0, 0, 0, 1300); g.addColorStop(0, '#1a1830'); g.addColorStop(0.6, '#6a3a3a'); g.addColorStop(1, '#c8603a'); ctx.fillStyle = g; ctx.fillRect(-400, -400, W + 800, 2000);
  for (let i = 0; i < 14; i++) { const x = -60 + i * 62, h = 300 + ((i * 97) % 260); rect(ctx, x, 1300 - h, 56, h); fillStroke(ctx, '#2a2632', 3); for (let k = 0; k < 10; k++) { const wx = x + 8 + (k % 3) * 16, wy = 1300 - h + 16 + Math.floor(k / 3) * 30; rect(ctx, wx, wy, 9, 14); ctx.fillStyle = WINDOWS[i * 10 + k] > 0.6 ? '#f0c060' : '#3a3644'; ctx.fill(); } }
  if (smoke) for (let i = 0; i < 4; i++) { const sx = 80 + i * 180; for (let k = 0; k < 9; k++) { const kk = ((t * 0.12 + k / 9) % 1); ellipse(ctx, sx + kk * 60 + SIN(k + t) * 10, 1150 - kk * 700, 30 + kk * 70, 24 + kk * 50); ctx.fillStyle = `rgba(40,36,40,${0.55 * (1 - kk) * smoke})`; ctx.fill(); } glow(ctx, sx, 1180, 90, 'rgba(255,120,40,A)', 0.5 * smoke); }
}
function tower(ctx, t, hl) {
  skyline(ctx, t);
  rect(ctx, 200, -1400, 320, 2800); fillStroke(ctx, '#3a4250', 6);
  for (let f = 0; f < 60; f++) { const y = 1240 - f * 46; for (let c = 0; c < 6; c++) { rect(ctx, 214 + c * 51, y - 34, 42, 32); const lit = f === 27 ? 1 : (WINDOWS[f * 6 + c] > 0.75 ? 0.6 : 0); ctx.fillStyle = f === 27 ? `rgba(255,214,120,${0.7 + 0.3 * SIN(t * 6)})` : lit ? '#c8a860' : '#1c2230'; ctx.fill(); } }
  if (hl) { const y = 1240 - 27 * 46; rect(ctx, 206, y - 40, 308, 44); stroke(ctx, 6, `rgba(255,80,60,${0.6 + 0.4 * SIN(t * 8)})`); }
}
function office(ctx, t, o = {}) {
  ctx.fillStyle = o.dark ? '#0a0c10' : '#cfd3d6'; ctx.fillRect(-400, -400, W + 800, 2000);
  if (!o.dark) { rect(ctx, -400, 0, W + 800, 40); ctx.fillStyle = '#b8bcc0'; ctx.fill(); for (let x = -300; x < 1000; x += 160) { rect(ctx, x, 20, 110, 14); ctx.fillStyle = '#f4f6f0'; ctx.fill(); } }
  // window wall with city
  if (o.window !== false) { ctx.save(); rect(ctx, 40, 140, 640, 560); ctx.clip(); ctx.translate(40, 140); ctx.scale(640 / 720, 560 / 1300); skyline(ctx, t, 1); ctx.restore(); rect(ctx, 40, 140, 640, 560); stroke(ctx, 12, '#5a5e66'); for (const x of [253, 466]) line(ctx, x, 140, x, 700, 8, '#5a5e66'); }
  ctx.fillStyle = o.dark ? '#121418' : '#8a8f96'; ctx.fillRect(-400, 860, W + 800, 1000);
  if (o.desks !== false) for (const [x, y, s] of [[150, 960, 1], [520, 960, 1], [-60, 1140, 1.3], [380, 1140, 1.3]]) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); rect(ctx, -110, -14, 220, 18); fillStroke(ctx, o.dark ? '#1c1e22' : '#e8e2d6', 4); line(ctx, -100, 4, -100, 90, 6); line(ctx, 100, 4, 100, 90, 6); rect(ctx, -40, -80, 80, 56); fillStroke(ctx, '#1a1c22', 4); rect(ctx, -34, -74, 68, 44); ctx.fillStyle = o.dark ? '#0a0c10' : '#5a8ac0'; ctx.fill(); rect(ctx, -8, -24, 16, 12); fillStroke(ctx, '#1a1c22', 3); ctx.restore(); }
}
function elevatorDoors(ctx, t, open, num, o = {}) {
  ctx.fillStyle = '#9a9ea4'; ctx.fillRect(-400, -400, W + 800, 2000);
  rect(ctx, 150, 240, 420, 860); fillStroke(ctx, '#6a6e74', 8);
  if (open > 0 && o.inside) o.inside(ctx);
  const gw = 210 * open; rect(ctx, 150, 240, 210 - gw, 860); fillStroke(ctx, '#c8ccd0', 5); rect(ctx, 360 + gw, 240, 210 - gw, 860); fillStroke(ctx, '#c8ccd0', 5);
  line(ctx, 160, 260, 340 - gw, 1080, 2, 'rgba(255,255,255,0.4)');
  rect(ctx, 290, 150, 140, 70); fillStroke(ctx, '#111', 5); ctx.save(); ctx.font = '50px Anton'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#ff5a3a'; ctx.fillText(num, 360, 188); ctx.restore();
  ctx.fillStyle = '#7a7e84'; ctx.fillRect(-400, 1100, W + 800, 600);
  rrect(ctx, 600, 600, 60, 120, 10); fillStroke(ctx, '#6a6e74', 4); for (const [y, lit] of [[630, o.upLit], [690, o.downLit]]) { ellipse(ctx, 630, y, 16, 16); fillStroke(ctx, lit ? '#ffcf4a' : '#d8dadc', 3); }
}
function stairwell(ctx, t, o = {}) {
  ctx.fillStyle = '#8a8676'; ctx.fillRect(-400, -1200, W + 800, 3400);
  for (let i = 0; i < 9; i++) { const y = -200 + i * 260, dir = i % 2 ? 1 : -1; const x0 = dir > 0 ? 120 : 600, x1 = dir > 0 ? 600 : 120;
    ctx.beginPath(); ctx.moveTo(x0, y); for (let k = 0; k <= 10; k++) { const x = lerp(x0, x1, k / 10), yy = y + k * 22; ctx.lineTo(x, yy); ctx.lineTo(lerp(x0, x1, (k + 1) / 10), yy); } ctx.lineTo(x1, y + 240); ctx.lineTo(x0, y + 240); ctx.closePath(); fillStroke(ctx, '#b8b2a0', 4);
    line(ctx, x0, y - 90, x1, y + 130, 6, '#c8302a'); for (let k = 0; k <= 4; k++) line(ctx, lerp(x0, x1, k / 4), y - 90 + k * 55, lerp(x0, x1, k / 4), y + k * 55, 4, '#c8302a');
    rect(ctx, x1 + (dir > 0 ? 0 : -80), y + 220, 80, 20); fillStroke(ctx, '#a8a290', 3);
    const fl = (o.top ?? 27) - i; if (fl > 0) { ctx.save(); ctx.font = '64px Anton'; ctx.textAlign = 'center'; ctx.fillStyle = 'rgba(40,40,40,0.55)'; ctx.fillText(String(fl), dir > 0 ? 660 : 60, y + 120); ctx.restore(); } }
}
function door(ctx, x, y, s, num, shake, t, faces) {
  ctx.save(); ctx.translate(x + (shake ? SIN(t * 70) * 6 * shake : 0), y); ctx.scale(s, s);
  rect(ctx, -110, -360, 220, 360); fillStroke(ctx, '#7a3a2a', 6); rect(ctx, -40, -300, 80, 110); fillStroke(ctx, faces ? '#1a1e1a' : '#2a3038', 5);
  if (faces) { ctx.save(); rect(ctx, -40, -300, 80, 110); ctx.clip(); ellipse(ctx, -12, -250, 30, 30); fillStroke(ctx, '#a9b79c', 3); for (const ex of [-22, -2]) { ellipse(ctx, ex, -252, 4, 6); ctx.fillStyle = '#111'; ctx.fill(); } ellipse(ctx, 26, -230, 26, 26); fillStroke(ctx, '#9aaa8c', 3); ctx.restore(); line(ctx, -40, -300, 40, -190, 2, 'rgba(255,255,255,0.3)'); }
  rect(ctx, 60, -190, 40, 14); fillStroke(ctx, '#c8c8c8', 3);
  ctx.save(); ctx.font = '70px Anton'; ctx.textAlign = 'center'; ctx.fillStyle = '#f0f0e8'; ctx.strokeStyle = '#111'; ctx.lineWidth = 6; ctx.strokeText(num, 0, -390); ctx.fillText(num, 0, -390); ctx.restore();
  ctx.restore();
}
function exitSign(ctx, x, y, s, a = 1) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); glow(ctx, 0, 0, 120, 'rgba(60,255,120,A)', 0.35 * a); rect(ctx, -60, -24, 120, 48); fillStroke(ctx, '#1a7a3a', 4); ctx.font = '32px Anton'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#d8ffe0'; ctx.fillText('EXIT', 0, 2); ctx.restore(); }
function heli(ctx, x, y, s, t) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); glow(ctx, 0, 60, 200, 'rgba(255,255,220,A)', 0.25); ctx.beginPath(); ctx.moveTo(-10, 40); ctx.lineTo(-60, 400); ctx.lineTo(60, 400); ctx.lineTo(10, 40); ctx.closePath(); ctx.fillStyle = 'rgba(255,255,220,0.12)'; ctx.fill();
  ellipse(ctx, 0, 0, 60, 34); fillStroke(ctx, '#2a2e36', 4); rect(ctx, 50, -8, 90, 14); fillStroke(ctx, '#2a2e36', 3); line(ctx, -40, 34, 40, 34, 4); line(ctx, -80 * Math.abs(COS(t * 30)), -40, 80 * Math.abs(COS(t * 30)), -40, 5); line(ctx, 0, -40, 0, -30, 4); ellipse(ctx, 140, 0, 6, 20 * Math.abs(SIN(t * 40)) + 2); ctx.fillStyle = '#111'; ctx.fill(); ellipse(ctx, -20, -6, 22, 14); ctx.fillStyle = '#8ab0d0'; ctx.fill();
  ellipse(ctx, 0, 34, 6, 6); ctx.fillStyle = SIN(t * 8) > 0 ? '#ff4040' : '#401010'; ctx.fill(); ctx.restore(); }
function waves(ctx, x, y, t, a) { for (let i = 0; i < 3; i++) { const k = ((t * 1.3 + i / 3) % 1); ellipse(ctx, x, y, 20 + k * 120, (20 + k * 120) * 0.4); stroke(ctx, 4 * (1 - k) + 1, `rgba(255,240,200,${a * (1 - k)})`); } }
function bigX(ctx, a) { if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.lineCap = 'round'; ctx.strokeStyle = '#111'; ctx.lineWidth = 64; ctx.beginPath(); ctx.moveTo(170, 300); ctx.lineTo(550, 980); ctx.moveTo(550, 300); ctx.lineTo(170, 980); ctx.stroke(); ctx.strokeStyle = '#e8302a'; ctx.lineWidth = 44; ctx.stroke(); ctx.restore(); }

// ---------- clips ----------
const CLIPS = [
  // 1 Hook: tower, office, elevator — DON'T
  (ctx, lt, T, D) => {
    const floor = wt(0, 'floor'), not = wt(0, 'not');
    if (lt < floor - 0.6) { const p = prog(lt, 0, floor - 0.6); panel(ctx, FULL, c => tower(c, T, p > 0.6), { z: 1.3, cx: 360, cy: lerp(1000, 0, ease(p)) }, 1); }
    else if (lt < not - 0.5) { panel(ctx, FULL, c => { office(c, T, { desks: false }); guy(c, YOU, 360, 1240, 1.25, { t: T, wide: true, worried: true, eyeDY: -2, mouth: 'o', armL: { a: 150 }, armR: { a: 30 } }); }, { z: 1.0, cx: 360, cy: 700 }, enter(lt, floor - 0.6, 0.2)); }
    else { panel(ctx, FULL, c => { elevatorDoors(c, T, 0, '28', { downLit: lt < not + 0.3 }); guy(c, YOU, 640, 1260, 0.9, { t: T, eyeDX: -10, armL: { to: [630, 692] } }); }, { z: 1.0, cx: 360, cy: 680 }, enter(lt, not - 0.5, 0.2)); bigX(ctx, ease(prog(lt, not - 0.1, not + 0.25))); }
  },
  // 2 Elevator nightmare
  (ctx, lt, T, D) => {
    const wrong = wt(1, 'wrong'), doors = wt(1, 'doors'), nowhere = wt(1, 'nowhere');
    if (lt < doors - 0.2) {
      const n = Math.max(19, 28 - Math.floor(lt * 2.4)); const ding = lt > wrong;
      panel(ctx, FULL, c => { c.fillStyle = '#b8b4a8'; c.fillRect(-300, -300, 1400, 1900); rect(c, 0, 0, 720, 1280); stroke(c, 0); for (let x = 60; x < 720; x += 120) line(c, x, 0, x, 1280, 3, '#a09c90');
        rect(c, 300, 120, 120, 64); fillStroke(c, '#111', 4); c.font = '46px Anton'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#ff5a3a'; c.fillText(ding ? '19' : String(n), 360, 154);
        guy(c, YOU, 360, 1180, 1.3, { t: T, eyeDY: -6, eyeDX: 0, worried: ding, wide: ding }); }, { z: 1.0, cx: 360, cy: 640 }, 1);
    } else {
      const op = ease(prog(lt, doors - 0.2, doors + 0.6));
      ctx.save(); const sh = lt > nowhere ? 6 : 0; ctx.translate(SIN(T * 60) * sh, 0);
      panel(ctx, FULL, c => elevatorDoors(c, T, op, '19', { inside: c2 => { c2.fillStyle = '#2a2a2e'; c2.fillRect(150, 240, 420, 860); for (let i = 0; i < 7; i++) Z(c2, 190 + i * 58 + (i % 2) * 10, 1100 + (i % 2) * 20, 0.75 - (i % 2) * 0.1, T + i, { eyeDX: 0, headTilt: (i - 3) * 4 }); } }), { z: lerp(1.0, 1.25, prog(lt, doors, D)), cx: 360, cy: 720 }, enter(lt, doors - 0.2, 0.2));
      ctx.restore();
    }
  },
  // 3 Stairs — echoes
  (ctx, lt, T, D) => {
    const ech = wt(2, 'echoes'), ten = wt(2, 'ten');
    const p = prog(lt, 0, D); const k = (lt * 0.55) % 1; const flight = Math.floor(lt * 0.55) % 2;
    const x = flight ? lerp(120, 600, k) : lerp(600, 120, k), y = 60 + (flight ? 260 : 0) + k * 220;
    panel(ctx, FULL, c => { stairwell(c, T, { top: 26 }); guy(c, YOU, x, y, 0.5, { t: T, walk: T * 10, eyeDX: flight ? 8 : -8 });
      if (lt > ech - 0.2) { for (let i = 0; i < 4; i++) waves(c, 360, y + 260 * (i + 1), T + i * 0.3, prog(lt, ech - 0.2 + i * 0.25, ech + 0.2 + i * 0.25)); }
      if (lt > ten - 0.2) for (let i = 0; i < 3; i++) Z(c, 200 + i * 140, 1560 + (i % 2) * 40, 0.45, T + i, { eyeDX: 0, headTilt: -25 }); },
      (() => { const zk = ease(prog(lt, ten - 0.5, ten + 0.5)); return { z: lerp(1.35, 0.75, zk), cx: lerp(lerp(x, 360, 0.4), 360, zk), cy: lerp(y - 120, 900, zk) }; })(), 1);
  },
  // 4 Shoes off, silence
  (ctx, lt, T, D) => {
    const silence = wt(3, 'silence'), rule = wt(3, 'rule');
    if (lt < silence + 0.2) {
      const off = ease(prog(lt, 0.6, 2.2));
      panel(ctx, FULL, c => { c.fillStyle = '#b8b2a0'; c.fillRect(-300, -300, 1400, 1900); line(c, -300, 900, 1100, 900, 6, '#8a8676');
        for (const [fx, sgn] of [[250, -1], [470, 1]]) { rect(c, fx - 30, 300, 60, 560); fillStroke(c, YOU.legs, 5); ellipse(c, fx + 20, 880, 60, 24); fillStroke(c, '#e8e8e4', 4); line(c, fx - 20, 880, fx + 60, 880, 2, '#c8c8c4');
          c.save(); c.translate(fx + 20 + sgn * off * 200, 880 - off * 60 * (1 - off) * 4); c.rotate(sgn * off * 0.8); rrect(c, -66, -34, 132, 50, 18); fillStroke(c, '#1c1a18', 5); c.restore(); } }, { z: 1.0, cx: 360, cy: 700 }, 1);
    } else {
      const k = (lt * 0.35) % 1; const x = lerp(600, 120, k), y = 60 + k * 220;
      panel(ctx, FULL, c => { stairwell(c, T, { top: 24 }); guy(c, YOU, x, y, 0.5, { t: T, walk: T * 4, socks: '#e8e8e4', eyeDX: -6, lean: 4, armL: { a: 150 }, armR: { a: 30 } }); }, { z: 1.4, cx: lerp(x, 360, 0.4), cy: y - 120 }, enter(lt, silence + 0.2, 0.2));
    }
  },
  // 5 Floor 15 — banging door below
  (ctx, lt, T, D) => {
    const bang = wt(4, 'banging'), already = wt(4, 'already');
    const sh = lt > bang - 0.1 ? Math.max(0, SIN(lt * 9)) : 0;
    panel(ctx, FULL, c => { stairwell(c, T, { top: 17 }); door(c, 360, 1240, 1.0, '15', sh, T, lt > already - 0.2); guy(c, YOU, 520, 520, 0.6, { t: T, socks: '#e8e8e4', wide: lt > bang, worried: lt > bang, eyeDY: 6, eyeDX: -6, armL: { a: 150 } }); },
      { z: lerp(1.1, 1.5, ease(prog(lt, already - 0.4, D))), cx: lerp(420, 380, prog(lt, 0, D)), cy: lerp(760, 960, ease(prog(lt, already - 0.4, D))) }, 1);
    if (lt > bang && lt < bang + 2.4) { const b = Math.floor((lt - bang) / 0.6); const a = 1 - ((lt - bang) % 0.6) / 0.6; burst(ctx, 360 + (b % 2 ? 110 : -110), 620, 140, a * 0.9, 'BANG!'); }
  },
  // 6 Cross the office to the other exit
  (ctx, lt, T, D) => {
    const p = prog(lt, 0.2, D - 0.3);
    panel(ctx, FULL, c => { office(c, T, { window: false }); exitSign(c, 620, 380, 1.2); rect(c, 560, 420, 130, 440); fillStroke(c, '#7a3a2a', 5);
      guy(c, YOU, lerp(60, 600, p), lerp(1150, 900, p), lerp(0.9, 0.6, p), { t: T, walk: T * 11, socks: '#e8e8e4', lean: 10, eyeDX: 10, armL: { a: 150 }, armR: { a: 20 } }); },
      { z: 1.1, cx: lerp(300, 450, p), cy: 760 }, 1);
  },
  // 7 Power out — phone torch
  (ctx, lt, T, D) => {
    const out = wt(6, 'power') + 0.3, torch = wt(6, 'torch');
    if (lt < out) { panel(ctx, FULL, c => { office(c, T, { window: false }); exitSign(c, 620, 380, 1.2); guy(c, YOU, 380, 1120, 0.9, { t: T, socks: '#e8e8e4', eyeDY: -6 }); }, { z: 1.1, cx: 400, cy: 760 }, 1); }
    else if (lt < torch - 0.2) { const flick = lt - out < 0.5 && SIN(lt * 60) > 0 ? 0.6 : 0; ctx.fillStyle = '#030305'; ctx.fillRect(0, 0, W, H); ctx.fillStyle = `rgba(200,210,220,${flick})`; ctx.fillRect(0, 0, W, H); ctx.save(); ctx.globalAlpha = 0.9; eyesWhite(ctx, 360, 560, T); ctx.restore(); }
    else {
      panel(ctx, FULL, c => { c.fillStyle = '#030305'; c.fillRect(-300, -300, 1400, 1900);
        c.save(); c.beginPath(); c.moveTo(390, 760); c.lineTo(80, 1280); c.lineTo(700, 1280); c.closePath(); c.clip();
        office(c, T, { window: false }); for (let i = 0; i < 4; i++) { const fx = 300 + i * 40, fy = 1200 - ((lt * 0.8 + i * 0.25) % 1) * 300; ellipse(c, fx + (i % 2) * 40, fy, 16, 8); c.fillStyle = 'rgba(0,0,0,0.25)'; c.fill(); }
        const lg = c.createRadialGradient(390, 760, 10, 390, 1100, 560); lg.addColorStop(0, 'rgba(255,255,230,0.35)'); lg.addColorStop(1, 'rgba(0,0,0,0.7)'); c.fillStyle = lg; c.fillRect(-300, 700, 1400, 900); c.restore();
        guy(c, YOU, 330, 1060, 1.0, { t: T, socks: '#e8e8e4', eyeDY: 6, worried: true, armR: { to: [390, 770] } }); rrect(c, 372, 744, 36, 60, 6); fillStroke(c, '#1a1a1e', 3); glow(c, 390, 770, 40, 'rgba(255,255,230,A)', 0.8); }, { z: 1.0, cx: 360, cy: 760 }, 1);
    }
  },
  // 8 Lobby — street full of them
  (ctx, lt, T, D) => {
    const street = wt(7, 'street');
    panel(ctx, FULL, c => { c.fillStyle = '#5a5650'; c.fillRect(-300, -300, 1400, 1900);
      // glass doors with street
      c.save(); rect(c, 80, 260, 560, 640); c.clip(); c.fillStyle = '#1a1c28'; c.fillRect(80, 260, 560, 640); c.fillStyle = '#2a2a30'; c.fillRect(80, 760, 560, 140);
      rect(c, 120, 700, 220, 90); fillStroke(c, '#3a4a6a', 4); ellipse(c, 160, 790, 22, 22); fillStroke(c, '#111', 3); ellipse(c, 300, 790, 22, 22); fillStroke(c, '#111', 3); ellipse(c, 230, 696, 16, 8); c.fillStyle = SIN(T * 10) > 0 ? '#ff3030' : '#3060ff'; c.fill();
      glow(c, 230, 696, 120, SIN(T * 10) > 0 ? 'rgba(255,40,40,A)' : 'rgba(40,90,255,A)', 0.35);
      const n = Math.floor(ease(prog(lt, street - 0.4, street + 1.2)) * 9);
      for (let i = 0; i < 9; i++) silhouette(c, 110 + i * 62, 900 + (i % 3) * 10, 0.9 - (i % 3) * 0.1, T + i, 0, i < n ? '#15171a' : 'rgba(0,0,0,0)');
      c.restore();
      rect(c, 80, 260, 560, 640); stroke(c, 12, '#2a2a2e'); line(c, 360, 260, 360, 900, 10, '#2a2a2e'); line(c, 330, 560, 330, 640, 8, '#c8c8c8'); line(c, 390, 560, 390, 640, 8, '#c8c8c8');
      c.fillStyle = '#7a7268'; c.fillRect(-300, 900, 1400, 800);
      rect(c, -100, 1000, 560, 300); fillStroke(c, '#3a2e26', 6); rect(c, -100, 990, 570, 24); fillStroke(c, '#5a4a3a', 4);
      guy(c, YOU, 560, 1270, 1.1, { t: T, socks: '#e8e8e4', eyeDX: -10, wide: lt > street, worried: true }); },
      { z: lerp(1.0, 1.15, prog(lt, 0, D)), cx: 380, cy: 760 }, 1);
  },
  // 9 Decision
  (ctx, lt, T, D) => {
    const optB = wt(8, 'option', 1), comment = wt(8, 'comment');
    if (lt < comment - 0.1) {
      panel(ctx, TOP, c => { c.fillStyle = '#1a1c28'; c.fillRect(-300, -300, 1400, 1900); c.fillStyle = '#2a2a30'; c.fillRect(-300, 1000, 1400, 600);
        for (let i = 0; i < 6; i++) Z(c, 60 + i * 120, 1100 + (i % 2) * 30, 0.55, T + i, { eyeDX: -6 }); guy(c, YOU, lerp(300, 420, prog(lt, 0, comment)), 1180, 0.75, { t: T, walk: T * 14, lean: 14, socks: '#e8e8e4', wide: true, eyeDX: 10, armL: { a: 150 }, armR: { a: 20 } }); }, { z: 1.0, cx: 360, cy: 900 }, 1);
      panel(ctx, BOT, c => { const g = c.createLinearGradient(0, 0, 0, 1300); g.addColorStop(0, '#05070f'); g.addColorStop(1, '#1a2238'); c.fillStyle = g; c.fillRect(-300, -300, 1400, 1900);
        c.fillStyle = '#3a3e46'; c.fillRect(-300, 1000, 1400, 600); ellipse(c, 360, 1080, 160, 40); stroke(c, 6, '#e8e030'); c.font = '60px Anton'; c.textAlign = 'center'; c.fillStyle = '#e8e030'; c.fillText('H', 360, 1102);
        heli(c, lerp(900, 480, ease(prog(lt, optB, comment))), 420, 1.2, T); guy(c, YOU, 220, 1060, 0.8, { t: T, socks: '#e8e8e4', eyeDY: -8, armR: { a: -60 }, armL: { a: -120 } }); }, { z: 1.0, cx: 360, cy: 760 }, enter(lt, optB - 0.2));
      comicText(ctx, 'A: RUN FOR IT', 360, 80, 62, '#f0a94a', enter(lt, 0.1));
      comicText(ctx, 'B: ROOF & WAIT', 360, 712, 62, '#b9c6d8', enter(lt, optB - 0.1));
    } else {
      panel(ctx, FULL, c => tower(c, T, true), { z: lerp(1.6, 1.2, prog(lt, comment, D)), cx: 360, cy: 0 }, enter(lt, comment - 0.1));
      if (lt > D - 0.9) { ctx.fillStyle = `rgba(0,0,0,${prog(lt, D - 0.9, D) * 0.6})`; ctx.fillRect(0, 0, W, H); }
    }
  },
];
function eyesWhite(ctx, x, y, t) { for (const dx of [-24, 24]) { ellipse(ctx, x + dx, y, 7, 11); ctx.fillStyle = '#e8e8e8'; ctx.fill(); } }

// ---------- overlays & captions ----------
const C0 = i => CL[i].start;
const OVERLAYS = [
  { a: 0.2, b: C0(0) + wt(0, 'floor') - 0.6, txt: '28TH FLOOR', size: 100, y: 230 },
  { a: C0(0) + wt(0, 'not') - 0.1, b: C0(1), txt: "DON'T TAKE THE ELEVATOR", size: 56, y: 1180 - 40, fill: '#ffffff' },
  { a: C0(1) + wt(1, 'nowhere') - 0.1, b: C0(2), txt: 'NOWHERE TO RUN', size: 84, y: 230, fill: '#e8584a' },
  { a: C0(3) + wt(3, 'rule') - 0.1, b: C0(4), txt: 'RULE 1:', size: 76, y: 200 },
  { a: C0(3) + wt(3, 'rule') - 0.1, b: C0(4), txt: 'QUIET BEATS FAST', size: 76, y: 290 },
  { a: C0(4) + wt(4, 'already') - 0.1, b: C0(5), txt: "THEY'RE INSIDE", size: 84, y: 230, fill: '#e8584a' },
  { a: C0(6) + wt(6, 'power') + 0.3, b: C0(6) + wt(6, 'torch') - 0.2, txt: 'POWER OUT', size: 96, y: 300, fill: '#ffffff' },
  { a: C0(8) + wt(8, 'comment') - 0.1, b: TM.total + 1, txt: 'COMMENT A OR B', size: 84, y: 300 },
];
const CAPS = [];
function merged(words) { const out = []; for (let i = 0; i < words.length; i++) { const w = words[i], n = words[i + 1]; if (/^twenty$/i.test(w.w) && n && /^eighth$/i.test(n.w)) { out.push({ w: '28th', a: w.a, b: n.b }); i++; } else if (/^fifteen$/i.test(w.w)) out.push({ w: '15', a: w.a, b: w.b }); else if (w.w === 'ten') out.push({ w: '10', a: w.a, b: w.b }); else if (/^one$/i.test(w.w) && words[i - 1] && /^rule$/i.test(words[i - 1].w)) out.push({ w: '1:', a: w.a, b: w.b }); else out.push(w); } return out; }
for (const c0 of CL) { const c = { words: merged(c0.words) }; let cur = []; const flush = () => { if (cur.length) CAPS.push({ a: cur[0].a, b: cur[cur.length - 1].b, txt: cur.map(w => w.w).join(' ') }); cur = []; };
  c.words.forEach(w => { if (cur.length && (cur.length >= 4 || w.a - cur[cur.length - 1].b > 0.28 || /^(So|But|Every|Finally|Option|Comment|There's|They're)$/.test(w.w) || (/^(And|It's|The|One)$/.test(w.w) && cur.length > 1))) flush(); cur.push(w); }); flush(); }
CAPS.forEach((c, i) => { const nx = CAPS[i + 1]; c.b = nx ? Math.min(nx.a, c.b + 0.5) : c.b + 0.6; });
const NUM = { 'twenty eighth': '28th', 'fifteen': '15', 'ten': '10', 'one': '1:', 'NOT': 'NOT' };
const fix = s => s.replace(/twenty eighth/i, '28th').replace(/\bfifteen\b/, '15').replace(/\bten floors\b/, '10 floors').replace(/Rule one/, 'Rule 1:');

window.DURATION = TM.total;
window.renderFrame = function (ctx, T) {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#0c0e13'; ctx.fillRect(0, 0, W, H);
  let ci = CL.findIndex(c => T >= c.start && T < c.start + c.dur); if (ci < 0) ci = CL.length - 1;
  const lt = T - CL[ci].start;
  ctx.save(); CLIPS[ci](ctx, lt, T, CL[ci].dur); ctx.restore();
  const vg = ctx.createRadialGradient(360, 640, 400, 360, 640, 900); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.35)'); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  for (const o of OVERLAYS) if (T >= o.a && T < o.b) { const a = Math.min(clamp((T - o.a) / 0.2), clamp((o.b - T) / 0.2)); const pop = 1 + 0.25 * (1 - ease(clamp((T - o.a) / 0.25))); ctx.save(); ctx.translate(360, o.y); ctx.scale(pop, pop); comicText(ctx, o.txt, 0, 0, o.size, o.fill || '#f0a94a', a, -0.03); ctx.restore(); }
  const cap = CAPS.find(c => T >= c.a && T < c.b); if (cap && !(ci === 0 && T > C0(0) + wt(0, 'not') - 0.1)) caption(ctx, fix(cap.txt), 1);
  if (T < 0.3) { ctx.fillStyle = `rgba(0,0,0,${1 - T / 0.3})`; ctx.fillRect(0, 0, W, H); }
};
})();
