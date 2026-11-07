// Farm Zombie Day 1 — code-drawn motion comic engine (720x1280 virtual space).
const W = 720, H = 1280;
const INK = '#111111';

// ---------- utils ----------
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const ease = t => { t = clamp(t); return t * t * (3 - 2 * t); };
const prog = (t, a, b) => clamp((t - a) / (b - a));
function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
function stroke(ctx, lw, col = INK) { ctx.lineWidth = lw; ctx.strokeStyle = col; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke(); }
function fillStroke(ctx, fill, lw = 4, col = INK) { ctx.fillStyle = fill; ctx.fill(); if (lw) stroke(ctx, lw, col); }
function ellipse(ctx, x, y, rx, ry, rot = 0) { ctx.beginPath(); ctx.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), rot, 0, Math.PI * 2); }
function rect(ctx, x, y, w, h) { ctx.beginPath(); ctx.rect(x, y, w, h); }
function rrect(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
function line(ctx, x1, y1, x2, y2, lw, col = INK) { ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); stroke(ctx, lw, col); }
function glow(ctx, x, y, r, col, a) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, col.replace('A', a)); g.addColorStop(1, col.replace('A', 0));
  ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2);
}

// ---------- characters ----------
// arm spec: null = hidden (pocket) / default; {a: deg, len} ; {to:[x,y]} in parent coords
function armEnd(sx, sy, spec, len, ox, oy, s) {
  if (spec.to) return [(spec.to[0] - ox) / s, (spec.to[1] - oy) / s];
  const a = spec.a * Math.PI / 180, L = spec.len || len;
  return [sx + Math.cos(a) * L, sy + Math.sin(a) * L];
}
function eyes(ctx, x1, x2, y, rx, ry, o) {
  const dx = o.eyeDX || 0, dy = o.eyeDY || 0, k = o.wide ? 1.35 : 1;
  for (const ex of [x1, x2]) {
    if (o.blink) { line(ctx, ex - rx * 1.4 + dx, y + dy, ex + rx * 1.4 + dx, y + dy, 2.6); }
    else { ellipse(ctx, ex + dx, y + dy, rx * k, ry * k); ctx.fillStyle = INK; ctx.fill(); }
  }
}
function mouth(ctx, y, w, o) {
  if (o.mouth === 'o') { ellipse(ctx, 0, y + 2, w * 0.35, w * 0.45); ctx.fillStyle = INK; ctx.fill(); }
  else line(ctx, -w, y, w, y, 2.6);
}

function drawMan(ctx, x, y, s, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate((o.lean || 0) * Math.PI / 180);
  const w = o.walk; // phase in radians or undefined
  const sw = w === undefined ? 0 : Math.sin(w) * 26;
  const bob = w === undefined ? 0 : Math.abs(Math.cos(w)) * -6;
  ctx.translate(0, bob);
  const crouch = o.crouch || 0; // 0..1
  const hipY = -78 + crouch * 30;
  // legs
  if (crouch > 0.01) {
    ctx.beginPath(); ctx.moveTo(-18, hipY); ctx.lineTo(-40, -30); ctx.lineTo(-30, 0); stroke(ctx, 7);
    ctx.beginPath(); ctx.moveTo(18, hipY); ctx.lineTo(42, -34); ctx.lineTo(34, 0); stroke(ctx, 7);
  } else {
    line(ctx, -16, hipY, -16 + sw, 0, 7); line(ctx, 16, hipY, 16 - sw, 0, 7);
  }
  line(ctx, -16 + (crouch > .01 ? -14 : sw) - 8, 0, -16 + (crouch > .01 ? -14 : sw) + 4, 0, 9);
  line(ctx, 16 - (crouch > .01 ? -18 : sw) - 4, 0, 16 - (crouch > .01 ? -18 : sw) + 8, 0, 9);
  const top = -232 + crouch * 30;
  // back arm (drawn behind coat if given)
  const drawArm = (spec, side) => {
    const sx = side * 44, sy = top + 22;
    const [ex, ey] = armEnd(sx, sy, spec, 118, x, y, s);
    const mx = lerp(sx, ex, 0.62), my = lerp(sy, ey, 0.62);
    line(ctx, sx, sy, mx, my, 24); line(ctx, sx, sy, mx, my, 17, '#1e1f22');
    line(ctx, mx, my, ex, ey, 6);
    ellipse(ctx, ex, ey, 9, 9); ctx.fillStyle = INK; ctx.fill();
  };
  // coat
  ctx.beginPath();
  ctx.moveTo(-50, top + 10);
  ctx.quadraticCurveTo(-58, top - 6, -34, top - 12); // hood left
  ctx.quadraticCurveTo(0, top - 4, 34, top - 12);
  ctx.quadraticCurveTo(58, top - 6, 50, top + 10);
  ctx.lineTo(66, hipY + 6); ctx.quadraticCurveTo(0, hipY + 16, -66, hipY + 6); ctx.closePath();
  fillStroke(ctx, '#1e1f22', 5);
  line(ctx, 0, top + 2, 0, hipY + 10, 2.5, '#3a3c41');
  ctx.beginPath(); ctx.moveTo(-50, hipY - 52); ctx.quadraticCurveTo(-38, hipY - 40, -28, hipY - 56); stroke(ctx, 2.5, '#3a3c41');
  ctx.beginPath(); ctx.moveTo(50, hipY - 52); ctx.quadraticCurveTo(38, hipY - 40, 28, hipY - 56); stroke(ctx, 2.5, '#3a3c41');
  // hood collar
  ctx.beginPath(); ctx.moveTo(-30, top - 10); ctx.quadraticCurveTo(0, top + 18, 30, top - 10); stroke(ctx, 3, '#3a3c41');
  if (o.armL) drawArm(o.armL, -1);
  if (o.armR) drawArm(o.armR, 1);
  // neck + head
  const hy = top - 66;
  line(ctx, 0, top - 4, 0, hy + 56, 4);
  ctx.save(); ctx.translate(0, hy); ctx.rotate((o.headTilt || 0) * Math.PI / 180);
  ellipse(ctx, 0, 0, 62, 62); fillStroke(ctx, '#ffffff', 5);
  eyes(ctx, -22, 22, 2, 5, 9, o);
  mouth(ctx, 32, 13, o);
  // hair
  ctx.beginPath();
  ctx.moveTo(-66, 4);
  const spikes = [[-74, -30], [-62, -22], [-70, -60], [-48, -50], [-46, -86], [-22, -66], [-10, -98], [8, -70], [30, -96], [36, -64], [64, -78], [56, -44], [76, -36], [62, -16], [70, 8]];
  for (const [px, py] of spikes) ctx.lineTo(px, py);
  ctx.lineTo(60, -10); ctx.lineTo(50, -26); ctx.lineTo(40, -6); ctx.lineTo(28, -30); ctx.lineTo(14, -14); ctx.lineTo(0, -34);
  ctx.lineTo(-14, -10); ctx.lineTo(-26, -32); ctx.lineTo(-40, -8); ctx.lineTo(-52, -24); ctx.lineTo(-60, 0); ctx.closePath();
  fillStroke(ctx, '#3a2a20', 4);
  ctx.restore();
  ctx.restore();
}

function drawGirl(ctx, x, y, s, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate((o.lean || 0) * Math.PI / 180);
  const w = o.walk; const sw = w === undefined ? 0 : Math.sin(w) * 16;
  const bob = w === undefined ? 0 : Math.abs(Math.cos(w)) * -4; ctx.translate(0, bob);
  const t = o.t || 0; const sway = Math.sin(t * 2.2) * 2 + (w === undefined ? 0 : Math.sin(w) * 4);
  const hy = -172;
  // hair back
  ctx.beginPath();
  ctx.moveTo(-44, hy - 10);
  ctx.bezierCurveTo(-70 + sway, hy + 40, -62 + sway, hy + 70, -56 + sway, hy + 96);
  ctx.quadraticCurveTo(-40 + sway, hy + 88, -30 + sway, hy + 100);
  ctx.lineTo(30 + sway, hy + 100); ctx.quadraticCurveTo(42 + sway, hy + 88, 56 + sway, hy + 96);
  ctx.bezierCurveTo(62 + sway, hy + 70, 70 + sway, hy + 40, 44, hy - 10); ctx.closePath();
  fillStroke(ctx, '#e6c47c', 4);
  // legs
  if (o.sit) { line(ctx, -10, -48, -34, -48, 5); line(ctx, -34, -48, -34, -6, 5); line(ctx, 10, -48, -14, -48, 5); line(ctx, -14, -48, -14, -6, 5); }
  else { line(ctx, -12, -44, -12 + sw, 0, 5); line(ctx, 12, -44, 12 - sw, 0, 5); line(ctx, -12 + sw - 6, 0, -12 + sw + 4, 0, 7); line(ctx, 12 - sw - 4, 0, 12 - sw + 6, 0, 7); }
  // dress
  ctx.beginPath(); ctx.moveTo(-22, -122); ctx.lineTo(22, -122); ctx.lineTo(44, -42); ctx.quadraticCurveTo(0, -36, -44, -42); ctx.closePath();
  fillStroke(ctx, '#e9e0cd', 4);
  // arms
  const arm = (spec, side, def) => {
    const sx = side * 20, sy = -114; const sp = spec || def;
    const [ex, ey] = armEnd(sx, sy, sp, 66, x, y, s);
    line(ctx, sx, sy, ex, ey, 4.5); ellipse(ctx, ex, ey, 5.5, 5.5); ctx.fillStyle = INK; ctx.fill();
  };
  arm(o.armL, -1, { a: 110 }); arm(o.armR, 1, { a: 70 });
  // neck, head
  line(ctx, 0, -124, 0, hy + 40, 3.5);
  ctx.save(); ctx.translate(0, hy); ctx.rotate((o.headTilt || 0) * Math.PI / 180);
  ellipse(ctx, 0, 0, 44, 44); fillStroke(ctx, '#ffffff', 4);
  eyes(ctx, -15, 15, 4, 3.6, 6.5, o);
  mouth(ctx, 24, 8, o);
  // bangs
  ctx.beginPath(); ctx.moveTo(-46, 10); ctx.bezierCurveTo(-50, -40, -10, -56, 14, -46);
  ctx.bezierCurveTo(40, -40, 52, -16, 46, 12); ctx.quadraticCurveTo(36, -14, 14, -24); ctx.quadraticCurveTo(-6, -2, -30, -14);
  ctx.quadraticCurveTo(-40, -4, -46, 10); ctx.closePath(); fillStroke(ctx, '#e6c47c', 4);
  // bow (left side)
  ctx.save(); ctx.translate(-30, -30);
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-11, -7); ctx.lineTo(-11, 7); ctx.closePath(); fillStroke(ctx, '#d9c4a8', 2.5);
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(11, -7); ctx.lineTo(11, 7); ctx.closePath(); fillStroke(ctx, '#d9c4a8', 2.5);
  ellipse(ctx, 0, 0, 3.5, 3.5); fillStroke(ctx, '#c9b090', 2);
  ctx.restore();
  ctx.restore();
  ctx.restore();
}

function drawZombie(ctx, x, y, s, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const t = o.t || 0; const sway = Math.sin(t * 1.3) * 3;
  ctx.rotate((6 + sway * 0.5) * Math.PI / 180);
  const hipY = -80, top = -226;
  line(ctx, -16, hipY, -22, 0, 7); line(ctx, 16, hipY, 24, 0, 7);
  line(ctx, -30, 0, -14, 0, 9); line(ctx, 16, 0, 32, 0, 9);
  // trousers stub
  ctx.beginPath(); ctx.moveTo(-34, hipY - 10); ctx.lineTo(34, hipY - 10); ctx.lineTo(30, hipY + 22); ctx.lineTo(-30, hipY + 22); ctx.closePath(); fillStroke(ctx, '#3b3d3a', 4);
  // torn shirt
  ctx.beginPath(); ctx.moveTo(-46, top + 8); ctx.lineTo(46, top + 8); ctx.lineTo(52, hipY);
  const hem = [[40, hipY + 12], [30, hipY - 2], [18, hipY + 14], [4, hipY], [-10, hipY + 16], [-22, hipY - 2], [-36, hipY + 10], [-52, hipY]];
  for (const [px, py] of hem) ctx.lineTo(px, py); ctx.closePath(); fillStroke(ctx, '#7c807b', 5);
  line(ctx, -10, top + 50, 6, top + 66, 2.5, '#4e524d'); line(ctx, 20, top + 90, 30, top + 80, 2.5, '#4e524d');
  // arms dangling forward
  const a1 = 100 + sway * 2, a2 = 78 - sway * 2;
  for (const [sx, a] of [[-42, a1], [42, a2]]) {
    const r = a * Math.PI / 180; const ex = sx + Math.cos(r) * 120, ey = top + 20 + Math.sin(r) * 120;
    line(ctx, sx, top + 20, ex, ey, 6); ellipse(ctx, ex, ey, 9, 9); ctx.fillStyle = INK; ctx.fill();
  }
  const hy = top - 64;
  line(ctx, 0, top + 4, 0, hy + 54, 4);
  ctx.save(); ctx.translate(0, hy); ctx.rotate(((o.headTilt ?? 12)) * Math.PI / 180);
  ellipse(ctx, 0, 0, 60, 60); fillStroke(ctx, '#a9b79c', 5);
  const dx = o.eyeDX || 0;
  for (const ex of [-21, 21]) { ellipse(ctx, ex + dx, 2, 7, 11); ctx.fillStyle = '#0a0a0a'; ctx.fill(); }
  ellipse(ctx, 0 + dx * 0.6, 32, 9, 12); ctx.fillStyle = '#1a1a1a'; ctx.fill();
  // ragged hair strands
  ctx.beginPath(); for (const [a, b, c, d] of [[-50, -30, -60, -6], [-30, -52, -40, -24], [-6, -60, -14, -30], [18, -58, 10, -30], [40, -44, 44, -18]]) { ctx.moveTo(a, b); ctx.lineTo(c, d); }
  stroke(ctx, 5, '#2b2b28');
  ctx.restore();
  ctx.restore();
}

function silhouette(ctx, x, y, s, t, turn = 0, col = '#141217') {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(Math.sin(t * 1.5 + x) * 0.08);
  ctx.fillStyle = col; ctx.strokeStyle = col;
  line(ctx, -8, -40, -12, 0, 7, col); line(ctx, 8, -40, 12, 0, 7, col);
  ctx.beginPath(); ctx.moveTo(-20, -110); ctx.lineTo(20, -110); ctx.lineTo(24, -38); ctx.lineTo(-24, -38); ctx.closePath(); ctx.fill();
  line(ctx, -20, -104, -14 + Math.sin(t * 2 + x) * 4, -46, 6, col); line(ctx, 20, -104, 34, -70, 6, col);
  ellipse(ctx, turn * 6, -138, 26, 26); ctx.fill();
  ctx.restore();
}

// ---------- props ----------
function jug(ctx, x, y, s, glowA = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.beginPath(); ctx.moveTo(-22, 0); ctx.lineTo(-22, -46); ctx.quadraticCurveTo(-22, -58, -10, -62); ctx.lineTo(-8, -72); ctx.lineTo(8, -72); ctx.lineTo(10, -62);
  ctx.quadraticCurveTo(22, -58, 22, -46); ctx.lineTo(22, 0); ctx.closePath();
  ctx.fillStyle = 'rgba(200,225,235,0.28)'; ctx.fill();
  ctx.save(); ctx.clip(); ctx.fillStyle = `rgba(150,190,205,${0.45 + glowA * 0.2})`; ctx.fillRect(-24, -40, 48, 42);
  ctx.fillStyle = `rgba(240,170,80,${0.15 + glowA * 0.3})`; ctx.fillRect(-24, -40, 18, 42); ctx.restore();
  stroke(ctx, 3);
  ctx.beginPath(); ctx.moveTo(12, -54); ctx.quadraticCurveTo(30, -50, 22, -30); stroke(ctx, 3);
  rect(ctx, -9, -78, 18, 7); fillStroke(ctx, '#d9d6cc', 2.5);
  ctx.restore();
}
function can(ctx, x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  rect(ctx, -16, -40, 32, 40); fillStroke(ctx, '#8e9196', 3);
  line(ctx, -16, -30, 16, -30, 1.8, '#5d6065'); line(ctx, -16, -10, 16, -10, 1.8, '#5d6065');
  ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.fillRect(-10, -38, 5, 36);
  ellipse(ctx, 0, -40, 16, 4); fillStroke(ctx, '#a7aaae', 2.5);
  ctx.restore();
}
function bowl(ctx, x, y, s, fill = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.beginPath(); ctx.moveTo(-34, -24); ctx.quadraticCurveTo(0, 26, 34, -24); ctx.closePath(); fillStroke(ctx, '#c9c2b2', 3.5);
  if (fill > 0) { ellipse(ctx, 0, -24, 30 * fill, 5); ctx.fillStyle = '#8a5a34'; ctx.fill(); }
  ctx.restore();
}
function lantern(ctx, x, y, s, swing, flick, chainLen = 120) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(swing);
  line(ctx, 0, 0, 0, chainLen * s, 2.5);
  ctx.translate(0, chainLen * s); ctx.scale(s, s);
  glow(ctx, 0, 30, 220, 'rgba(255,175,70,A)', 0.35 * flick);
  rect(ctx, -18, 0, 36, 8); fillStroke(ctx, '#3a2c20', 3);
  ctx.beginPath(); ctx.moveTo(-16, 8); ctx.lineTo(-20, 50); ctx.lineTo(20, 50); ctx.lineTo(16, 8); ctx.closePath(); fillStroke(ctx, `rgba(255,${190 + flick * 30},110,0.95)`, 3);
  line(ctx, 0, 8, 0, 50, 2.5); rect(ctx, -22, 50, 44, 8); fillStroke(ctx, '#3a2c20', 3);
  ctx.restore();
}

// ---------- backgrounds ----------
const R = rng(7);
const CROPS = []; for (let r = 0; r < 9; r++) for (let i = 0; i < 16; i++) CROPS.push([r, i, R()]);
const WHEAT = []; for (let i = 0; i < 60; i++) WHEAT.push([R() * 300 - 20, R() * 140, R()]);
const STARS = []; for (let i = 0; i < 70; i++) STARS.push([R() * W, R() * 700, R()]);

function farm(ctx, o) {
  const t = o.t || 0, night = o.tod === 'night';
  const P = night ? {
    sky0: '#05070d', sky1: '#141c29', hill: '#121820', hill2: '#0d1218', tree: '#0b1014', house: '#2a2d33', roof: '#15171b', field: '#11180f', row: '#1b2617', plant: '#22301d',
    barn: '#3a3d42', barnLine: '#2a2c30', metal: '#1c1e22', silo: '#33363b', path: '#2a2018', wheat: '#3a3524', fence: '#2b2219', leaf: '#141a12', branch: '#0f0d0c', puddle: '#8fa0b8', tractor: '#4a2620', hay: '#5c4a2a'
  } : {
    sky0: '#6d5e66', sky1: '#e07a3c', hill: '#5c6a3a', hill2: '#4c5a30', tree: '#3d4a28', house: '#8b847a', roof: '#3e3a38', field: '#5b6a33', row: '#4a3a28', plant: '#6f8a3a',
    barn: '#9d968a', barnLine: '#7b746a', metal: '#454449', silo: '#77767a', path: '#6e4c33', wheat: '#d6a23c', fence: '#6b4a2e', leaf: '#4c5a2a', branch: '#4a3524', puddle: '#e89a5a', tractor: '#9e3b2b', hay: '#d7a74a'
  };
  // sky
  let g = ctx.createLinearGradient(0, 0, 0, 840); g.addColorStop(0, P.sky0); g.addColorStop(1, P.sky1);
  ctx.fillStyle = g; ctx.fillRect(-400, -400, W + 800, 1300);
  if (night) {
    for (const [sx, sy, a] of STARS) { ctx.fillStyle = `rgba(220,230,245,${0.25 + 0.5 * a * (0.6 + 0.4 * Math.sin(t * 2 + a * 9))})`; ctx.fillRect(sx, sy, 2, 2); }
    glow(ctx, 590, 330, 260, 'rgba(190,210,235,A)', 0.25);
    ellipse(ctx, 590, 330, 66, 66); ctx.fillStyle = '#dfe6ee'; ctx.fill();
    for (const [cx, cy, r] of [[570, 310, 10], [610, 352, 14], [560, 360, 7], [622, 300, 6]]) { ellipse(ctx, cx, cy, r, r); ctx.fillStyle = '#c3ccd6'; ctx.fill(); }
    for (let i = 0; i < 4; i++) { const cx = ((i * 260 + t * 12) % 1100) - 200; ellipse(ctx, cx, 280 + i * 70, 180, 26); ctx.fillStyle = 'rgba(25,30,40,0.85)'; ctx.fill(); }
  } else {
    glow(ctx, 470, 805, 260, 'rgba(255,190,90,A)', 0.45);
    ellipse(ctx, 470, 805, 42, 42); ctx.fillStyle = '#f6c463'; ctx.fill();
    for (let i = 0; i < 7; i++) { const cx = ((i * 190 + t * 6) % 1000) - 140; ellipse(ctx, cx, 330 + (i % 4) * 110, 90 + (i % 3) * 30, 16); ctx.fillStyle = '#ea8b4c'; ctx.fill(); }
  }
  // hills
  ctx.beginPath(); ctx.moveTo(-400, 840); ctx.bezierCurveTo(0, 770, 200, 790, 360, 800); ctx.bezierCurveTo(500, 810, 600, 780, 1120, 820); ctx.lineTo(1120, 900); ctx.lineTo(-400, 900); ctx.closePath(); fillStroke(ctx, P.hill, 3);
  ctx.beginPath(); ctx.moveTo(-400, 880); ctx.bezierCurveTo(100, 830, 300, 860, 1120, 850); ctx.lineTo(1120, 920); ctx.lineTo(-400, 920); ctx.closePath(); fillStroke(ctx, P.hill2, 3);
  // ridge zombies
  if (o.ridge) for (let i = 0; i < 6; i++) silhouette(ctx, 250 + i * 34 + ((t * 4) % 30), 800 + Math.sin(i) * 4, 0.12, t + i, o.ridgeTurn || 0, night ? '#05060a' : '#2a2224');
  // treeline left
  for (let i = 0; i < 8; i++) { ellipse(ctx, -20 + i * 50, 880 - (i % 3) * 12, 40, 34); fillStroke(ctx, P.tree, 3); }
  // farmhouse
  const hx = 70;
  rect(ctx, hx, 820, 170, 90); fillStroke(ctx, P.house, 3.5);
  ctx.beginPath(); ctx.moveTo(hx - 12, 822); ctx.lineTo(hx + 50, 772); ctx.lineTo(hx + 128, 772); ctx.lineTo(hx + 182, 822); ctx.closePath(); fillStroke(ctx, P.roof, 3.5);
  rect(ctx, hx + 60, 744, 18, 40); fillStroke(ctx, P.roof, 3);
  const wins = [[hx + 22, 846], [hx + 76, 846], [hx + 130, 846]];
  wins.forEach(([wx, wy], i) => {
    let lit = clamp((o.lit ?? 0) * 3 - i);
    if (o.flicker) lit *= 0.75 + 0.25 * Math.sin(t * 17 + i * 3) * Math.sin(t * 5.3);
    rect(ctx, wx, wy, 20, 26); fillStroke(ctx, lit > 0.05 ? `rgb(${lerp(43, 245, lit)},${lerp(42, 182, lit)},${lerp(40, 82, lit)})` : '#2b2a28', 2.5);
    if (lit > 0.3) glow(ctx, wx + 10, wy + 13, 40, 'rgba(255,180,80,A)', 0.4 * lit);
    if (o.windowFigs && i === 1) { silhouette(ctx, wx + 6, wy + 26, 0.1, t, 0, '#2a1a10'); silhouette(ctx, wx + 15, wy + 26, 0.07, t, 0, '#2a1a10'); }
  });
  if (o.smoke > 0) for (let i = 0; i < 6; i++) {
    const k = ((t * 0.25 + i / 6) % 1); const a = (1 - k) * 0.5 * o.smoke;
    ellipse(ctx, hx + 69 + Math.sin(k * 6 + i) * 12 + k * 30, 740 - k * 120, 10 + k * 22, 8 + k * 14); ctx.fillStyle = `rgba(120,115,115,${a})`; ctx.fill();
  }
  // field with crop rows
  ctx.beginPath(); ctx.moveTo(-400, 905); ctx.lineTo(560, 905); ctx.lineTo(560, 1110); ctx.lineTo(-400, 1110); ctx.closePath(); ctx.fillStyle = P.field; ctx.fill();
  for (let r = 0; r < 9; r++) {
    const y0 = 915 + r * r * 2.4 + r * 6; const sc = 0.4 + r * 0.12;
    ctx.beginPath(); ctx.moveTo(-60, y0 + 4 * sc); ctx.lineTo(540 - r * 6, y0 + 4 * sc); stroke(ctx, 8 * sc, P.row);
    for (const [rr, i, q] of CROPS) if (rr === r) {
      const px = -40 + i * (36 + r * 2) + q * 6; if (px > 520 - r * 6) continue;
      const wob = Math.sin(t * 1.6 + i + r) * 2 * sc;
      ellipse(ctx, px + wob, y0, 9 * sc, 7 * sc); fillStroke(ctx, P.plant, 1.6 * sc);
      ellipse(ctx, px + 7 * sc + wob, y0 - 3 * sc, 7 * sc, 6 * sc); fillStroke(ctx, P.plant, 1.6 * sc);
    }
  }
  if (o.crops) o.crops(ctx);
  // silo
  rect(ctx, 400, 600, 96, 420); fillStroke(ctx, P.silo, 3.5);
  ctx.beginPath(); ctx.arc(448, 600, 48, Math.PI, 0); ctx.closePath(); fillStroke(ctx, P.silo, 3.5);
  for (let i = 0; i < 6; i++) line(ctx, 420 + i * 12, 560, 420 + i * 12, 600, 1.5, P.barnLine);
  line(ctx, 392, 620, 392, 1000, 3); line(ctx, 404, 620, 404, 1000, 3);
  for (let y = 630; y < 1000; y += 18) line(ctx, 392, y, 404, y, 2);
  // barn
  ctx.beginPath(); ctx.moveTo(490, 820); ctx.lineTo(760, 820); ctx.lineTo(760, 1140); ctx.lineTo(490, 1140); ctx.closePath(); fillStroke(ctx, P.barn, 4);
  for (let y = 840; y < 1140; y += 26) for (let x = 490 + ((y / 26) % 2) * 24; x < 760; x += 48) { rect(ctx, x, y, 44, 22); stroke(ctx, 1.4, P.barnLine); }
  ctx.beginPath(); ctx.moveTo(470, 832); ctx.lineTo(620, 690); ctx.lineTo(780, 690); ctx.lineTo(780, 832); ctx.closePath(); fillStroke(ctx, P.metal, 4);
  for (let i = 0; i < 9; i++) line(ctx, 490 + i * 32, 820, 640 + i * 18, 700, 1.5, night ? '#2a2c31' : '#5a5960');
  rect(ctx, 560, 880, 200, 260); fillStroke(ctx, night ? '#0b0b0c' : '#1d1a17', 5);
  for (const [bx, by] of [[600, 1080], [660, 1080], [620, 1022], [680, 1022], [640, 964]]) { rect(ctx, bx, by, 64, 58); fillStroke(ctx, P.hay, 3); line(ctx, bx + 6, by + 20, bx + 58, by + 20, 1.5, '#8a6a2a'); line(ctx, bx + 6, by + 38, bx + 58, by + 38, 1.5, '#8a6a2a'); }
  if (night) {
    const fl = o.lampFlick ? 0.75 + 0.25 * Math.sin(t * 23) * Math.sin(t * 7) : 1;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    ctx.beginPath(); ctx.moveTo(590, 860); ctx.lineTo(520, 1180); ctx.lineTo(720, 1180); ctx.closePath();
    const lg = ctx.createLinearGradient(0, 860, 0, 1180); lg.addColorStop(0, `rgba(255,170,70,${0.28 * fl})`); lg.addColorStop(1, 'rgba(255,170,70,0)'); ctx.fillStyle = lg; ctx.fill();
    ctx.restore();
    glow(ctx, 590, 858, 90, 'rgba(255,185,90,A)', 0.6 * fl);
    line(ctx, 590, 834, 606, 834, 3); line(ctx, 606, 834, 606, 846, 3);
    ctx.beginPath(); ctx.arc(590, 850, 12, Math.PI, 0); ctx.closePath(); fillStroke(ctx, '#222', 2.5);
    ellipse(ctx, 590, 856, 6, 5); ctx.fillStyle = `rgba(255,214,140,${fl})`; ctx.fill();
  }
  if (o.barnFig) o.barnFig(ctx);
  // tractor
  ctx.save(); ctx.translate(330, 1000);
  rect(ctx, 30, 30, 140, 50); fillStroke(ctx, P.tractor, 4);
  rect(ctx, 100, -30, 70, 62); fillStroke(ctx, P.tractor, 4); rect(ctx, 110, -20, 50, 34); fillStroke(ctx, night ? '#181a1f' : '#3a3d42', 3);
  rect(ctx, 30, 40, 26, 22); fillStroke(ctx, night ? '#2a1612' : '#6e2a1f', 3);
  ellipse(ctx, 140, 92, 48, 48); fillStroke(ctx, '#1d1d1f', 4); ellipse(ctx, 140, 92, 20, 20); fillStroke(ctx, '#55565b', 3);
  ellipse(ctx, 54, 100, 26, 26); fillStroke(ctx, '#1d1d1f', 4); ellipse(ctx, 54, 100, 10, 10); fillStroke(ctx, '#55565b', 2.5);
  ctx.restore();
  // path
  ctx.beginPath(); ctx.moveTo(380, 1300); ctx.bezierCurveTo(470, 1200, 520, 1150, 560, 1120); ctx.lineTo(760, 1120); ctx.lineTo(760, 1300); ctx.closePath(); ctx.fillStyle = P.path; ctx.fill();
  ctx.beginPath(); ctx.moveTo(380, 1300); ctx.bezierCurveTo(470, 1200, 520, 1150, 560, 1120); stroke(ctx, 3, night ? '#1a140f' : '#4a321f');
  for (const [px, py, rx] of [[600, 1170, 60], [690, 1240, 70], [520, 1262, 40]]) {
    ellipse(ctx, px, py, rx, rx * 0.22); ctx.fillStyle = P.puddle; ctx.globalAlpha = night ? 0.45 : 0.6; ctx.fill(); ctx.globalAlpha = 1;
    ellipse(ctx, px + Math.sin(t * 3 + px) * 6, py, rx * 0.4, 2); ctx.fillStyle = night ? 'rgba(230,240,255,0.5)' : 'rgba(255,220,170,0.6)'; ctx.fill();
    ellipse(ctx, px, py, rx, rx * 0.22); stroke(ctx, 2, night ? '#1a140f' : '#4a321f');
  }
  if (o.chars) o.chars(ctx);
  // wheat
  for (const [wx, wy, q] of WHEAT) {
    const bx = wx, by = 1300 - wy * 0.6, bend = Math.sin(t * 1.8 + q * 6) * 6;
    ctx.beginPath(); ctx.moveTo(bx, 1300); ctx.quadraticCurveTo(bx + bend * 0.5, by + 60, bx + bend, by); stroke(ctx, 2.5, night ? '#2e2a1c' : '#b88a2e');
    ellipse(ctx, bx + bend, by - 14, 5, 15, bend * 0.03); fillStroke(ctx, P.wheat, 2);
  }
  // fence
  ctx.save(); ctx.translate(-10, 1130);
  for (const [x1, y1, x2, y2] of [[0, 30, 330, -10], [0, 90, 330, 50]]) { ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.lineTo(x2, y2 + 26); ctx.lineTo(x1, y1 + 26); ctx.closePath(); fillStroke(ctx, P.fence, 4); }
  rect(ctx, 300, -60, 34, 230); fillStroke(ctx, P.fence, 4); rect(ctx, 296, -66, 42, 12); fillStroke(ctx, P.fence, 3);
  ctx.restore();
  // fog
  if (night) for (let i = 0; i < 5; i++) {
    const fx = ((i * 230 + t * (10 + i * 3)) % 1200) - 300; const fy = 900 + i * 45;
    const fg = ctx.createRadialGradient(fx, fy, 10, fx, fy, 260); fg.addColorStop(0, `rgba(150,165,185,${0.14 * (o.fog ?? 1)})`); fg.addColorStop(1, 'rgba(150,165,185,0)');
    ctx.fillStyle = fg; ctx.fillRect(fx - 280, fy - 120, 560, 240);
  }
  // branch
  ctx.beginPath(); ctx.moveTo(-60, 560); ctx.quadraticCurveTo(120, 300, 360, 70); ctx.lineTo(372, 82); ctx.quadraticCurveTo(140, 320, -40, 600); ctx.closePath(); fillStroke(ctx, P.branch, 4);
  ctx.beginPath(); ctx.moveTo(150, 280); ctx.quadraticCurveTo(250, 250, 330, 300); stroke(ctx, 9, P.branch);
  const lb = Math.sin(t * 1.2) * 4;
  for (const [lx, ly, r] of [[40, 380, 54], [110, 250, 60], [220, 130, 66], [330, 60, 58], [10, 470, 44], [300, 300, 40], [170, 170, 44], [420, 30, 50]]) {
    ellipse(ctx, lx + lb, ly, r, r * 0.8); fillStroke(ctx, P.leaf, 4);
    line(ctx, lx - r * 0.5 + lb, ly, lx + r * 0.5 + lb, ly - 4, 2, night ? '#0a0d09' : '#3a4520');
  }
}

function interior(ctx, o) {
  const t = o.t || 0, night = !!o.night;
  const warm = o.warm ?? 1;
  // wall
  const g = ctx.createLinearGradient(0, 0, 0, 900); g.addColorStop(0, night ? '#1c1a1d' : '#2f2620'); g.addColorStop(1, night ? '#2f2a28' : '#5a4636');
  ctx.fillStyle = g; ctx.fillRect(-300, -300, W + 600, 1300);
  if (o.stone) {
    for (let y = -40; y < 920; y += 64) for (let x = -300 + ((y / 64) % 2) * 50; x < W + 300; x += 100) { rrect(ctx, x + 4, y + 4, 92, 56, 12); fillStroke(ctx, night ? '#2b2a2b' : '#4e4840', 3, '#1a1714'); }
  } else {
    for (let x = -300; x < W + 300; x += 120) line(ctx, x, 0, x + 10, 900, 1.5, 'rgba(0,0,0,0.18)');
    rect(ctx, -300, 760, W + 600, 30); fillStroke(ctx, '#3a2a1e', 3);
  }
  // floor
  ctx.fillStyle = night ? '#241a14' : '#3d2b1f'; ctx.fillRect(-300, 900, W + 600, 700);
  for (let i = -8; i < 16; i++) { ctx.beginPath(); ctx.moveTo(360 + i * 30, 900); ctx.lineTo(360 + i * 110, 1400); stroke(ctx, 2, '#22170f'); }
  line(ctx, -300, 900, W + 300, 900, 4);
  if (o.window) {
    const [wx, wy, ww, wh] = o.window;
    ctx.save(); rect(ctx, wx, wy, ww, wh); ctx.clip();
    if (o.windowScene) { o.windowScene(ctx, wx, wy, ww, wh); }
    else { const sg = ctx.createLinearGradient(0, wy, 0, wy + wh); sg.addColorStop(0, night ? '#070a12' : '#4a4360'); sg.addColorStop(1, night ? '#1a2333' : '#c96a3a'); ctx.fillStyle = sg; ctx.fillRect(wx, wy, ww, wh); }
    ctx.restore();
    rect(ctx, wx, wy, ww, wh); stroke(ctx, 10, '#2a1d14'); line(ctx, wx + ww / 2, wy, wx + ww / 2, wy + wh, 7, '#2a1d14'); line(ctx, wx, wy + wh / 2, wx + ww, wy + wh / 2, 7, '#2a1d14');
    rect(ctx, wx - 16, wy + wh, ww + 32, 16); fillStroke(ctx, '#4a3424', 3);
  }
  // warm wash + vignette
  ctx.save(); ctx.globalCompositeOperation = 'multiply';
  const vg = ctx.createRadialGradient(o.lx ?? 360, 400, 80, o.lx ?? 360, 500, 900);
  vg.addColorStop(0, night && o.moon ? 'rgb(170,185,215)' : 'rgb(255,226,185)'); vg.addColorStop(1, night ? 'rgb(30,34,50)' : 'rgb(60,45,40)');
  ctx.fillStyle = vg; ctx.fillRect(-300, -300, W + 600, 1900); ctx.restore();
  if (o.extra) o.extra(ctx);
  // lantern
  if (o.lantern !== false) {
    const sw = (o.swing || 0) + Math.sin(t * 1.4) * 0.03;
    const fl = 0.85 + 0.15 * Math.sin(t * 13) * Math.sin(t * 4.1);
    lantern(ctx, o.lx ?? 360, -20, o.ls ?? 1.3, sw, fl * warm, o.chain ?? 190);
  }
}

// ---------- icons / fx ----------
function ripple(ctx, x, y, p) {
  for (let i = 0; i < 4; i++) {
    const k = p * 1.4 - i * 0.18; if (k <= 0 || k > 1) continue;
    ellipse(ctx, x, y, 40 + k * 700, (40 + k * 700) * 0.35); stroke(ctx, 6 * (1 - k) + 1, `rgba(255,236,200,${(1 - k) * 0.9})`);
  }
}
function waterIcon(ctx, x, y, s, a) {
  ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.scale(s, s);
  rrect(ctx, -170, -70, 340, 140, 18); fillStroke(ctx, 'rgba(20,22,28,0.85)', 4, '#f0a94a');
  for (const fx of [-110, 30]) {
    ellipse(ctx, fx, -26, 14, 14); fillStroke(ctx, '#fff', 3);
    line(ctx, fx, -12, fx, 18, 4, '#fff'); line(ctx, fx - 14, 0, fx + 14, 0, 4, '#fff'); line(ctx, fx, 18, fx - 10, 40, 4, '#fff'); line(ctx, fx, 18, fx + 10, 40, 4, '#fff');
    ctx.save(); ctx.translate(fx + 48, 20); ctx.beginPath(); ctx.moveTo(0, -46); ctx.bezierCurveTo(20, -18, 20, 0, 0, 0); ctx.bezierCurveTo(-20, 0, -20, -18, 0, -46); fillStroke(ctx, '#7fb6d6', 3, '#fff'); ctx.restore();
  }
  ctx.restore();
}
function speedLines(ctx, cx, cy, a, seed) {
  const r = rng(seed); ctx.save(); ctx.globalAlpha = a;
  for (let i = 0; i < 40; i++) { const ang = r() * Math.PI * 2, r1 = 260 + r() * 120, r2 = r1 + 300 + r() * 300; line(ctx, cx + Math.cos(ang) * r1, cy + Math.sin(ang) * r1, cx + Math.cos(ang) * r2, cy + Math.sin(ang) * r2, 2 + r() * 4, 'rgba(255,255,255,0.7)'); }
  ctx.restore();
}

// ---------- panel system ----------
const FULL = [16, 16, 688, 1248], TOP = [16, 16, 688, 616], BOT = [16, 648, 688, 616];
function panel(ctx, r, scene, cam, enter = 0, dir = 1) {
  let [x, y, w, h] = r;
  const e = ease(enter);
  ctx.save();
  ctx.globalAlpha = clamp(enter * 2);
  ctx.translate(0, (1 - e) * 120 * dir);
  ctx.beginPath(); ctx.rect(x, y, w, h); ctx.save(); ctx.clip();
  ctx.fillStyle = '#000'; ctx.fillRect(x, y, w, h);
  const z = cam.z || 1; const s = Math.max(w / W, h / H) * z;
  ctx.translate(x + w / 2, y + h / 2); ctx.scale(s, s); ctx.translate(-(cam.cx ?? W / 2), -(cam.cy ?? H / 2));
  scene(ctx);
  ctx.restore();
  ctx.lineWidth = 6; ctx.strokeStyle = '#0a0a0a'; ctx.strokeRect(x, y, w, h);
  ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(235,225,205,0.55)'; ctx.strokeRect(x + 4, y + 4, w - 8, h - 8);
  ctx.restore();
}
const camLerp = (a, b, p) => ({ z: lerp(a.z, b.z, p), cx: lerp(a.cx, b.cx, p), cy: lerp(a.cy, b.cy, p) });

// ---------- text ----------
function comicText(ctx, txt, x, y, size, fill = '#f0a94a', a = 1, rot = 0, font = 'Bangers') {
  ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.rotate(rot);
  ctx.font = `${size}px ${font}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round'; ctx.lineWidth = size * 0.2; ctx.strokeStyle = '#0a0a0a'; ctx.strokeText(txt, 0, 0);
  ctx.fillStyle = fill; ctx.fillText(txt, 0, 0);
  ctx.restore();
}
function burst(ctx, x, y, r, a, txt) {
  ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y);
  ctx.beginPath(); for (let i = 0; i < 24; i++) { const ang = i / 24 * Math.PI * 2, rr = i % 2 ? r * 0.62 : r; ctx.lineTo(Math.cos(ang) * rr, Math.sin(ang) * rr * 0.8); } ctx.closePath();
  fillStroke(ctx, '#f0d24a', 6);
  ctx.restore(); comicText(ctx, txt, x, y + 4, r * 0.62, '#d8402a', a, -0.1);
}
function wrapLines(ctx, text, maxW) {
  const words = text.split(' '); const lines = []; let cur = '';
  for (const w of words) { const test = cur ? cur + ' ' + w : w; if (ctx.measureText(test).width > maxW && cur) { lines.push(cur); cur = w; } else cur = test; }
  if (cur) lines.push(cur); return lines;
}
function caption(ctx, txt, a) {
  if (!txt || a <= 0) return;
  ctx.save(); ctx.globalAlpha = a; ctx.font = '50px Anton'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const lines = wrapLines(ctx, txt.toUpperCase(), 620); const lh = 62; const y0 = 1050 - (lines.length - 1) * lh / 2;
  lines.forEach((l, i) => { ctx.lineJoin = 'round'; ctx.lineWidth = 11; ctx.strokeStyle = '#0a0a0a'; ctx.strokeText(l, W / 2, y0 + i * lh); ctx.fillStyle = '#ffffff'; ctx.fillText(l, W / 2, y0 + i * lh); });
  ctx.restore();
}

window.ENGINE = { W, H, clamp, lerp, ease, prog, rng, line, ellipse, rect, rrect, fillStroke, stroke, glow, drawMan, drawGirl, drawZombie, silhouette, jug, can, bowl, lantern, farm, interior, ripple, waterIcon, speedLines, panel, camLerp, FULL, TOP, BOT, comicText, burst, caption };
