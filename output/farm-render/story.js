(()=>{
// Storyboard timeline: 10 clips x 10s.
const E = window.ENGINE;
const { clamp, lerp, ease, prog, panel, camLerp, FULL, TOP, BOT, farm, interior, drawMan, drawGirl, drawZombie, silhouette, jug, can, bowl, line, ellipse, rect, rrect, fillStroke, stroke, glow, ripple, waterIcon, speedLines, comicText, burst, caption } = E;

const VO = [
  "Imagine this. You're trapped on a farm during a zombie apocalypse. Sounds bad? Wrong. This might actually be the BEST place to survive. Here's why.",
  "A man and a young girl have taken shelter on an abandoned farm. They've got a farmhouse, a barn, crops and hopefully enough supplies to survive 7 days.",
  "But they'll need some rules. Rule 1: NEVER make unnecessary noise. One loud bang could attract zombies from miles away.",
  "First, water. Two people need around 14 gallons for 7 days, using one gallon per person per day. Luckily, they've found 16 gallons.",
  "That's 2 gallons spare. Rule 2: NEVER waste water. Every gallon counts. Next, food. They've found 38 cans of food.",
  "That's a promising start, but they'll need to ration it carefully and check how many meals each can provides. Rule 3: Every meal must be recorded. Nothing gets wasted.",
  "But suddenly, they hear a loud banging coming from the barn. The girl looks at the man. \"What's that?\" He looks through the window.",
  "There's a zombie standing outside the barn. They can't stay here forever. They have TWO choices.",
  "OPTION A: Stay inside the farmhouse, lock the doors and hope the zombies leave. OPTION B: Escape across the farm and get inside the barn, where there's potentially more supplies.",
  "But crossing the open farm could be dangerous. What should they do? COMMENT A OR B. The most popular choice decides what happens in DAY 2.",
];

// caption chunks: break at sentence/clause punctuation, max ~4 words
function chunks(text) {
  const words = text.split(' '); const out = []; let cur = [];
  for (const w of words) {
    cur.push(w);
    const end = /[.?!,:]["”]?$/.test(w);
    if (end || cur.length >= 4) { out.push({ txt: cur.join(' '), pause: /[.?!]["”]?$/.test(w) ? 0.35 : (end ? 0.15 : 0) }); cur = []; }
  }
  if (cur.length) out.push({ txt: cur.join(' '), pause: 0 });
  return out;
}
const CAPS = [];
VO.forEach((v, i) => {
  const cs = chunks(v); const weights = cs.map(c => c.txt.length + 6 + c.pause * 40);
  const tot = weights.reduce((a, b) => a + b, 0); const span = 9.5; let t = i * 10 + 0.25;
  cs.forEach((c, k) => { const d = span * weights[k] / tot; CAPS.push({ a: t, b: t + d, txt: c.txt.replace(/["”]/g, '"') }); t += d; });
});
window.CAPS = CAPS;

const OVERLAYS = [
  { a: 0.3, b: 3.4, txt: 'DAY 1', size: 130, y: 240 },
  { a: 21.6, b: 29.6, txt: 'RULE 1: NO NOISE', size: 76, y: 210 },
  { a: 32.2, b: 36.6, txt: 'NEED 14 GALLONS', size: 76, y: 200 },
  { a: 37.2, b: 39.8, txt: 'FOUND 16!', size: 92, y: 200 },
  { a: 40.2, b: 42.2, txt: '+2 SPARE', size: 92, y: 200 },
  { a: 42.4, b: 46.6, txt: 'RULE 2: SAVE WATER', size: 72, y: 200 },
  { a: 47.0, b: 49.8, txt: '38 CANS', size: 96, y: 200 },
  { a: 55.4, b: 59.6, txt: 'RULE 3: LOG EVERY MEAL', size: 62, y: 200 },
  { a: 94.6, b: 100.1, txt: 'COMMENT A OR B', size: 84, y: 230 },
  { a: 97.2, b: 100.1, txt: 'DAY 2 DECIDES...', size: 54, y: 320, fill: '#ffffff' },
];
const BANGS = [61.7, 62.4, 63.1];
window.BANGS = BANGS;

// helpers for scenes
const SIN = Math.sin;
function shot(t, a, b) { return t >= a && t < b; }
function enter(t, a, d = 0.35) { return clamp((t - a) / d); }

// ---- per-clip renderers: (ctx, lt, T) ----
const CLIPS = [
  // 1 Hook
  (ctx, lt, T) => {
    if (lt < 3.6) {
      const p = ease(prog(lt, 0, 3.6));
      panel(ctx, FULL, c => farm(c, { tod: 'dusk', t: T, lit: 0, smoke: 0 }), camLerp({ z: 1.5, cx: 330, cy: 330 }, { z: 1.0, cx: 360, cy: 680 }, p), 1);
    } else if (lt < 6.6) {
      const p = ease(prog(lt, 3.4, 6.6));
      panel(ctx, FULL, c => farm(c, { tod: 'dusk', t: T, lit: 0, smoke: 0, ridge: true }), camLerp({ z: 1.3, cx: 360, cy: 760 }, { z: 3.2, cx: 330, cy: 790 }, p), enter(lt, 3.6));
    } else {
      const p = prog(lt, 6.4, 10); const mx = lerp(690, 470, p);
      panel(ctx, FULL, c => farm(c, {
        tod: 'dusk', t: T, lit: 0, smoke: 0, chars: c2 => {
          const ph = T * 9;
          drawGirl(c2, mx + 70, 1196, 0.5, { walk: ph + 1.4, t: T, eyeDX: -6, lean: -6, armL: { to: [mx + 30, 1086] } });
          drawMan(c2, mx, 1200, 0.5, { walk: ph, eyeDX: -8, lean: -8, armR: { to: [mx + 30, 1086] } });
        }
      }), { z: 2.0, cx: lerp(600, 500, p), cy: 1060 }, enter(lt, 6.6));
    }
  },
  // 2 Setting
  (ctx, lt, T) => {
    if (lt < 3.3) {
      const p = ease(prog(lt, 0.3, 2.6));
      panel(ctx, FULL, c => interior(c, {
        t: T, lantern: false, stone: true, extra: c2 => {
          // doorway
          rect(c2, 220, 420, 300, 500); fillStroke(c2, '#0a0806', 8, '#2a1d14');
          const dw = lerp(300, 60, p); rect(c2, 220, 420, dw, 500); fillStroke(c2, '#5a3b24', 6, '#2a1d14');
          for (let i = 1; i < 4; i++) line(c2, 220 + dw * i / 4, 430, 220 + dw * i / 4, 910, 2, '#3a2616');
          drawGirl(c2, 560, 1010, 1.15, { t: T, eyeDX: -5, headTilt: -8, armL: { a: 160 } });
          drawMan(c2, 290 + dw * 0.35, 1030, 1.25, { t: T, lean: -10, eyeDX: -8, armL: { a: 190 }, blink: lt > 2.2 && lt < 2.35 });
        }
      }), { z: 1.0, cx: 380, cy: 640 }, 1);
    } else if (lt < 6.8) {
      const p = ease(prog(lt, 3.1, 6.8));
      panel(ctx, FULL, c => farm(c, { tod: 'dusk', t: T, lit: 0, smoke: 0 }), camLerp({ z: 1.35, cx: 250, cy: 900 }, { z: 1.35, cx: 500, cy: 880 }, p), enter(lt, 3.3));
    } else {
      const p = prog(lt, 6.6, 10);
      panel(ctx, FULL, c => farm(c, { tod: 'dusk', t: T, lit: ease(prog(lt, 7.0, 9.0)), smoke: ease(prog(lt, 7.8, 9.6)) }), { z: lerp(2.6, 3.4, ease(p)), cx: 160, cy: 820 }, enter(lt, 6.8));
    }
  },
  // 3 Rule 1
  (ctx, lt, T) => {
    const kitchen = (c, extra) => interior(c, { t: T, window: [440, 360, 200, 230], extra });
    if (lt < 2.6) {
      const p = prog(lt, 0.9, 2.6);
      panel(ctx, FULL, c => kitchen(c, c2 => {
        rect(c2, -100, 700, 420, 40); fillStroke(c2, '#6a4a30', 5); rect(c2, -100, 740, 400, 160); fillStroke(c2, '#4a3222', 5);
        drawMan(c2, 500, 1060, 1.1, { t: T, eyeDX: -10, armL: { to: [300, 700] }, lean: -4 });
        const px = lerp(250, 300, p), py = lerp(690, 900, p * p), rot = p * 2.4;
        c2.save(); c2.translate(px, py); c2.rotate(rot); ellipse(c2, 0, 0, 46, 12); fillStroke(c2, '#7d8287', 4); line(c2, 44, 0, 110, -6, 9); c2.restore();
      }), { z: 1.2, cx: 300, cy: 760 }, 1);
    } else if (lt < 5.0) {
      const sh = lt < 3.0 ? SIN(lt * 80) * 6 : 0;
      panel(ctx, TOP, c => kitchen(c, c2 => {
        speedLines(c2, 360, 900, 1 - prog(lt, 2.6, 3.6), 3);
        drawMan(c2, 330 + sh, 1050, 1.1, { t: T, crouch: 1, eyeDX: 6, wide: true, armR: { to: [470, 1010] }, armL: { a: 150 } });
        c2.save(); c2.translate(500, 1012); ellipse(c2, 0, 0, 46, 12); fillStroke(c2, '#7d8287', 4); line(c2, -44, 0, -96, -4, 9); c2.restore();
      }), { z: 1.25, cx: 400, cy: 820 }, 1);
      panel(ctx, BOT, c => interior(c, {
        t: T, extra: c2 => drawGirl(c2, 360, 1250, 2.4, { t: T, wide: true, armR: { to: [372, 1250 - 2.4 * 140] }, blink: lt > 4.4 && lt < 4.55 })
      }), { z: 1.0, cx: 360, cy: 1040 }, enter(lt, 3.5));
    } else {
      const p = prog(lt, 5.2, 9.6);
      panel(ctx, FULL, c => farm(c, {
        tod: 'dusk', t: T, lit: 1, smoke: 1, ridge: true, ridgeTurn: -ease(prog(lt, 7.0, 7.6)),
        crops: c2 => ripple(c2, 160, 860, p)
      }), camLerp({ z: 1.1, cx: 330, cy: 820 }, { z: 1.25, cx: 300, cy: 830 }, ease(p)), enter(lt, 5.0));
    }
  },
  // 4 Water
  (ctx, lt, T) => {
    const cellar = (c, extra) => interior(c, { t: T, stone: true, lx: 360, extra });
    const jugsRow = (c2, n, gl) => { for (let i = 0; i < 16; i++) { if (i >= n) break; const row = i % 2, col = Math.floor(i / 2); jug(c2, 70 + col * 82 + row * 30, 1000 + row * 70, 1.25 + row * 0.1, gl); } };
    if (lt < 3.0) {
      const p = ease(prog(lt, 0.4, 2.4));
      panel(ctx, FULL, c => cellar(c, c2 => {
        jugsRow(c2, 16, 0);
        c2.save(); c2.translate(lerp(0, 520, p), lerp(0, -260, p)); c2.rotate(p * 0.4);
        c2.beginPath(); c2.moveTo(30, 870); c2.quadraticCurveTo(350, 780, 720, 860); c2.lineTo(740, 1120); c2.lineTo(20, 1120); c2.closePath(); fillStroke(c2, '#6a6a5e', 5); c2.restore();
        drawMan(c2, 620 + p * 20, 1180, 1.0, { t: T, lean: 6, eyeDX: -6, armL: { a: 200 - p * 30 } });
      }), { z: 1.0, cx: 380, cy: 760 }, 1);
    } else if (lt < 7.0) {
      const p = prog(lt, 3.0, 6.8);
      const n = 2 + Math.floor(ease(p) * 14);
      panel(ctx, [16, 400, 688, 560], c => cellar(c, c2 => {
        jugsRow(c2, n, 0.3);
        drawGirl(c2, 80 + Math.floor(n / 2) * 82 + 40, 1130, 0.9, { t: T, armL: { a: 150 }, eyeDX: 4 });
      }), { z: 1.5, cx: lerp(260, 470, ease(p)), cy: 960 }, enter(lt, 3.0));
      waterIcon(ctx, 360, 300, 0.8, enter(lt, 3.6, 0.5));
    } else {
      const p = prog(lt, 7.0, 10);
      panel(ctx, FULL, c => cellar(c, c2 => {
        jugsRow(c2, 16, 0.8 + 0.2 * SIN(T * 3));
        drawGirl(c2, 720, 1130, 0.9, { t: T, armL: { to: [690, 1010] }, eyeDX: -6 });
      }), { z: lerp(1.6, 1.9, ease(p)), cx: lerp(250, 560, ease(p)), cy: 980 }, enter(lt, 7.0));
    }
  },
  // 5 Water to food
  (ctx, lt, T) => {
    if (lt < 3.0) {
      panel(ctx, FULL, c => interior(c, {
        t: T, stone: true, extra: c2 => {
          jug(c2, 560, 1090, 1.4, 0.6); jug(c2, 640, 1100, 1.4, 0.6);
          drawGirl(c2, 330, 1150, 2.0, { t: T, eyeDX: 3, armL: { to: [300, 980] }, armR: { to: [380, 990] }, blink: lt > 1.6 && lt < 1.75 });
          jug(c2, 340, 1060, 1.6, 0.8);
        }
      }), { z: 1.0, cx: 400, cy: 800 }, 1);
    } else if (lt < 6.5) {
      const p = prog(lt, 3.0, 6.5); const closed = lt > 5.3;
      panel(ctx, FULL, c => interior(c, {
        t: T, lantern: false, extra: c2 => {
          rect(c2, 120, 760, 480, 200); fillStroke(c2, '#7c7a72', 6); rect(c2, 160, 770, 400, 120); fillStroke(c2, '#4a4a46', 5);
          rect(c2, 330, 420, 40, 260); fillStroke(c2, '#9a9ea3', 5);
          c2.beginPath(); c2.moveTo(330, 440); c2.quadraticCurveTo(330, 380, 420, 380); c2.lineTo(470, 380); c2.lineTo(470, 430); c2.lineTo(420, 430); c2.quadraticCurveTo(370, 430, 370, 460); c2.closePath(); fillStroke(c2, '#9a9ea3', 5);
          const hr = closed ? Math.PI / 2 : ease(prog(lt, 4.7, 5.3)) * Math.PI / 2;
          c2.save(); c2.translate(350, 520); c2.rotate(hr); rect(c2, -70, -12, 140, 24); fillStroke(c2, '#c94f3a', 5); c2.restore();
          if (lt > 4.7 && lt < 5.6) { const hx = 350 + Math.cos(hr) * 70, hy = 520 + Math.sin(hr) * 70; ellipse(c2, hx, hy, 16, 16); c2.fillStyle = '#111'; c2.fill(); }
          if (!closed) { const k = (lt * 1.3) % 1; c2.beginPath(); c2.moveTo(470, 440 + k * 300); c2.bezierCurveTo(484, 466 + k * 300, 480, 480 + k * 300, 470, 480 + k * 300); c2.bezierCurveTo(460, 480 + k * 300, 456, 466 + k * 300, 470, 440 + k * 300); fillStroke(c2, '#8fc4e0', 3); }
        }
      }), { z: 1.4, cx: 380, cy: 560 }, enter(lt, 3.0));
    } else {
      const p = ease(prog(lt, 6.6, 8.2));
      panel(ctx, FULL, c => interior(c, {
        t: T, extra: c2 => {
          rect(c2, 160, 300, 420, 620); fillStroke(c2, '#2a1d14', 6);
          for (let s = 0; s < 4; s++) { rect(c2, 170, 440 + s * 130, 400, 14); fillStroke(c2, '#6a4a30', 3); for (let i = 0; i < 9; i++) can(c2, 200 + i * 42, 438 + s * 130, 1.0); }
          const dw = lerp(420, 40, p); rect(c2, 160, 300, dw, 620); fillStroke(c2, '#5a3b24', 6, '#2a1d14');
          drawMan(c2, 640, 1150, 1.0, { t: T, eyeDX: -8, armL: { to: [160 + dw - 10, 640] } });
        }
      }), { z: lerp(1.0, 1.25, ease(prog(lt, 7.5, 10))), cx: 380, cy: 700 }, enter(lt, 6.5));
    }
  },
  // 6 Food & Rule 3
  (ctx, lt, T) => {
    const table = c2 => { rect(c2, -100, 880, 920, 50); fillStroke(c2, '#6a4a30', 6); rect(c2, -100, 930, 920, 400); fillStroke(c2, '#3a281c', 5); };
    if (lt < 3.0) {
      const n = Math.min(10, 1 + Math.floor(lt * 4));
      const pos = [[0, 0], [1, 0], [2, 0], [3, 0], [0.5, 1], [1.5, 1], [2.5, 1], [1, 2], [2, 2], [1.5, 3]];
      panel(ctx, FULL, c => interior(c, { t: T, swing: SIN(T * 1.7) * 0.12, chain: 160, extra: c2 => { table(c2); pos.slice(0, n).forEach(([px, py]) => can(c2, 250 + px * 72, 890 - py * 64, 1.7)); } }), { z: 1.15, cx: 360, cy: 720 }, 1);
    } else if (lt < 5.6) {
      const sp = SIN(lt * 6);
      panel(ctx, TOP, c => interior(c, {
        t: T, extra: c2 => {
          drawMan(c2, 360, 1120, 1.2, { t: T, eyeDX: 2, eyeDY: 5, armR: { to: [lt < 4.2 ? 260 + sp * 16 : 460 + sp * 16, 850] } });
          table(c2); bowl(c2, 230, 890, 1.6, clamp((lt - 3.2) / 0.8)); bowl(c2, 490, 890, 1.6, clamp((lt - 4.2) / 0.8)); can(c2, 640, 890, 1.6);
        }
      }), { z: 1.15, cx: 380, cy: 760 }, 1);
      panel(ctx, BOT, c => interior(c, {
        t: T, extra: c2 => {
          const k = clamp((lt - 4.2) / 1.4);
          drawGirl(c2, 380, 1060, 1.9, { t: T, eyeDY: 5, eyeDX: 2, headTilt: 6, armR: { to: [372 + SIN(lt * 14) * 26 + k * 50, 862] } });
          table(c2); rect(c2, 300, 850, 180, 40); fillStroke(c2, '#efe8d6', 4); for (let i = 0; i < Math.floor(k * 6); i++) line(c2, 312, 858 + i * 5, 312 + 60 + (i * 37) % 90, 858 + i * 5, 1.5, '#555');
          line(c2, 372 + SIN(lt * 14) * 26 + k * 50, 862, 380 + SIN(lt * 14) * 26 + k * 50, 840, 4, '#c9a24a');
        }
      }), { z: 1.15, cx: 380, cy: 780 }, enter(lt, 4.2));
    } else {
      const shut = ease(prog(lt, 8.0, 8.7));
      panel(ctx, FULL, c => {
        c.fillStyle = '#3a281c'; c.fillRect(-200, -200, 1200, 1800);
        // open notebook seen from above
        rect(c, 80, 360, 280, 560); fillStroke(c, '#efe8d6', 6); rect(c, 360, 360, 280, 560); fillStroke(c, '#efe8d6', 6);
        for (let i = 0; i < 16; i++) line(c, 110, 420 + i * 30, 330, 420 + i * 30, 1.5, '#b8c4d4');
        const k = clamp((lt - 5.6) / 2.2);
        for (let i = 0; i < Math.floor(k * 14); i++) { c.beginPath(); c.moveTo(120, 412 + i * 30); for (let x = 0; x < 180; x += 12) c.lineTo(120 + x, 412 + i * 30 + SIN(x * 0.9 + i) * 5); stroke(c, 2.5, '#333'); }
        if (shut > 0) { c.save(); c.translate(360, 0); c.scale(lerp(1, -1, shut) || 0.001, 1); rect(c, 0, 360, 280, 560); fillStroke(c, '#5a3a24', 6); c.restore(); }
        if (shut >= 1) { rect(c, 80, 360, 280, 560); fillStroke(c, '#5a3a24', 6); }
      }, { z: lerp(1.0, 1.0 + ease(prog(lt, 8.8, 10)) * 2.4, 1), cx: lerp(360, 220, ease(prog(lt, 8.8, 10))), cy: 640 }, enter(lt, 5.6));
      if (lt > 9.3) { ctx.fillStyle = `rgba(30,20,12,${prog(lt, 9.3, 10)})`; ctx.fillRect(0, 0, 720, 1280); }
    }
  },
  // 7 Twist
  (ctx, lt, T) => {
    const room = (c, extra, o = {}) => interior(c, { t: T, night: true, swing: o.swing || 0, window: [470, 330, 200, 280], windowScene: winNight, extra });
    if (lt < 1.6) {
      panel(ctx, FULL, c => room(c, c2 => { rect(c2, 160, 880, 380, 40); fillStroke(c2, '#4a3222', 5); bowl(c2, 270, 880, 1.4, 0.6); drawGirl(c2, 290, 1100, 1.6, { t: T, sit: true, armR: { to: [lt < 1.0 ? 280 + SIN(lt * 8) * 10 : 300, lt < 1.0 ? 870 - lt * 60 : 820] }, wide: lt > 1.0 }); }), { z: 1.2, cx: 330, cy: 760 }, 1);
    } else if (lt < 4.4) {
      const bi = window.BANGS.map(b => b - 60); let k = 0; for (const b of bi) if (lt > b) k = Math.max(k, 1 - (lt - b) / 0.5);
      const sh = k * 14;
      ctx.save(); ctx.translate(SIN(lt * 90) * sh, SIN(lt * 70) * sh);
      panel(ctx, FULL, c => room(c, c2 => { rect(c2, 160, 880, 380, 40); fillStroke(c2, '#4a3222', 5); bowl(c2, 270, 880, 1.4, 0.6); drawGirl(c2, 290, 1100, 1.6, { t: T, sit: true, wide: true, mouth: 'o', armR: { to: [300, 820] } }); drawMan(c2, 600, 1150, 1.3, { t: T, wide: true, eyeDX: 8 }); }, { swing: SIN(lt * 5) * 0.35 * (1 - prog(lt, 1.6, 4.4)) }), { z: 1.1, cx: 380, cy: 740 }, enter(lt, 1.6, 0.15));
      ctx.restore();
      for (const b of bi) { const a = 1 - (lt - b) / 0.6; if (lt > b && a > 0) burst(ctx, 360 + ((b * 997) % 200) - 100, 300 + ((b * 571) % 160), 170, a, 'BANG!'); }
    } else if (lt < 6.6) {
      panel(ctx, TOP, c => room(c, c2 => drawGirl(c2, 330, 1280, 3.2, { t: T, eyeDY: -6, eyeDX: 5, headTilt: 10, wide: true })), { z: 1.0, cx: 360, cy: 700 }, 1);
      panel(ctx, BOT, c => room(c, c2 => drawMan(c2, 380, 1500, 2.6, { t: T, eyeDX: lt > 5.4 ? 14 : -4, headTilt: lt > 5.4 ? 6 : 0 })), { z: 1.0, cx: 360, cy: 700 }, enter(lt, 5.0));
    } else {
      const p = ease(prog(lt, 6.6, 8.2)), push = ease(prog(lt, 8.6, 10));
      panel(ctx, FULL, c => room(c, c2 => {
        // curtains
        const gap = lerp(0, 60, p);
        c2.beginPath(); c2.moveTo(440, 300); c2.lineTo(570 - gap, 300); c2.quadraticCurveTo(540 - gap, 470, 570 - gap, 640); c2.lineTo(440, 640); c2.closePath(); fillStroke(c2, '#5a2a24', 5);
        c2.beginPath(); c2.moveTo(700, 300); c2.lineTo(570 + gap, 300); c2.quadraticCurveTo(600 + gap, 470, 570 + gap, 640); c2.lineTo(700, 640); c2.closePath(); fillStroke(c2, '#5a2a24', 5);
        drawMan(c2, 400, 1120, 1.3, { t: T, eyeDX: 10, lean: 4, armR: { to: [565 - gap, 470] } });
      }), { z: lerp(1.15, 3.2, push), cx: lerp(470, 570, push), cy: lerp(700, 470, push) }, enter(lt, 6.6));
    }
  },
  // 8 Reveal
  (ctx, lt, T) => {
    const zomb = (eyeDX, tilt) => c2 => drawZombie(c2, 640, 1135, 0.62, { t: T, eyeDX, headTilt: tilt });
    if (lt < 3.5) {
      const p = ease(prog(lt, 0, 3.5));
      panel(ctx, FULL, c => farm(c, { tod: 'night', t: T, lit: 1, smoke: 0.6, lampFlick: true, barnFig: zomb(8, 12) }), { z: lerp(1.0, 1.5, p), cx: lerp(360, 520, p), cy: lerp(700, 900, p) }, 1);
      // window frame fading
      const a = 1 - prog(lt, 0.4, 1.6); if (a > 0) { ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = '#1a120c'; ctx.lineWidth = 60; ctx.strokeRect(0, 0, 720, 1280); ctx.lineWidth = 26; ctx.beginPath(); ctx.moveTo(360, 0); ctx.lineTo(360, 1280); ctx.moveTo(0, 640); ctx.lineTo(720, 640); ctx.stroke(); ctx.restore(); }
    } else if (lt < 7.2) {
      const turn = lt > 5.2; const p = ease(prog(lt, 3.3, 7.2));
      panel(ctx, FULL, c => farm(c, { tod: 'night', t: T, lit: 1, smoke: 0.6, lampFlick: true, barnFig: turn ? zomb(-14, -4) : zomb(8, 12) }), { z: lerp(2.6, 3.1, p), cx: 630, cy: 1010 }, enter(lt, 3.5, 0.2));
    } else {
      const sp = prog(lt, 9.2, 10);
      const r1 = [16, 16, 688, lerp(1248, 616, ease(sp))];
      panel(ctx, r1, c => interior(c, {
        t: T, night: true, moon: true, lantern: false, window: [470, 330, 200, 280], windowScene: winNight, extra: c2 => {
          drawMan(c2, 440, 1120, 1.5, { t: T, eyeDX: -6, armL: { to: [300 + 30, 1110 - 1.5 * 115] } });
          drawGirl(c2, 300, 1110, 1.5, { t: T, wide: true, eyeDX: 8, lean: 4 });
          c2.fillStyle = 'rgba(120,150,200,0.18)'; c2.beginPath(); c2.moveTo(470, 330); c2.lineTo(670, 330); c2.lineTo(560, 1300); c2.lineTo(120, 1300); c2.closePath(); c2.fill();
        }
      }), { z: 1.15, cx: 380, cy: 780 }, enter(lt, 7.2));
    }
  },
  // 9 Decision
  (ctx, lt, T) => {
    const merge = ease(prog(lt, 9.3, 10));
    const cabinet = clamp((lt - 3.0) / 3.6);
    panel(ctx, [16, 16, 688, lerp(616, 1248, merge)], c => interior(c, {
      t: T, extra: c2 => {
        rect(c2, 260, 340, 220, 560); fillStroke(c2, '#5a3b24', 6, '#2a1d14');
        const bolt = ease(prog(lt, 0.6, 2.2)); rect(c2, 440, 600, 40, 16); fillStroke(c2, '#555a60', 3); rect(c2, 420 + bolt * 50, 596, 34, 24); fillStroke(c2, '#8a8f96', 3);
        const cx = lerp(80, 250, ease(cabinet)); rect(c2, cx - 150, 560, 150, 340); fillStroke(c2, '#4a3020', 6); line(c2, cx - 75, 570, cx - 75, 890, 3, '#2a1d14');
        if (lt < 2.6) drawMan(c2, 560, 1080, 1.2, { t: T, eyeDX: -10, armL: { to: [470 + bolt * 50, 608] } });
        else drawMan(c2, lerp(-40, 120, ease(cabinet)), 1080, 1.2, { t: T, eyeDX: 10, lean: 12, armR: { to: [cx - 150, 760] }, armL: { to: [cx - 150, 700] } });
        drawGirl(c2, 600, 1080, 1.2, { t: T, eyeDX: -6, wide: lt > 7, armL: lt > 7 ? { to: [lerp(-40, 120, ease(cabinet)) + 60, 960] } : undefined });
      }
    }), { z: 1.0, cx: 360, cy: 720 }, 1);
    if (merge < 1) {
      const p = ease(prog(lt, 0.5, 9.0)); const hand = ease(prog(lt, 6.6, 8.2));
      ctx.save(); ctx.globalAlpha = 1 - merge;
      panel(ctx, BOT, c => farm(c, {
        tod: 'night', t: T, lit: 1, smoke: 0.5, lampFlick: true, crops: c2 => {
          if (hand > 0) { c2.save(); c2.translate(470, 1080); c2.scale(2.2, 2.2); c2.translate(-470, -1080); const hx = 470, hy = 1060 - hand * 50; line(c2, hx, 1080, hx, hy, 7); line(c2, hx, hy, hx - 12, hy - 20, 5); line(c2, hx, hy, hx + 2, hy - 26, 5); line(c2, hx, hy, hx + 14, hy - 18, 5); ellipse(c2, hx, hy, 9, 9); c2.fillStyle = '#a9b79c'; c2.fill(); stroke(c2, 3); c2.restore(); }
        }
      }), { z: 1.9, cx: lerp(470, 560, p), cy: lerp(1180, 1050, p) }, enter(lt, 0.2));
      ctx.restore();
    }
    const la = clamp(1 - merge) * enter(lt, 0.6, 0.4);
    comicText(ctx, 'A: STAY & LOCK', 360, 80, 64, '#f0a94a', la);
    comicText(ctx, 'B: RUN TO THE BARN', 360, 712, 64, '#b9c6d8', la * enter(lt, 4.4, 0.4));
  },
  // 10 Ending
  (ctx, lt, T) => {
    const p = ease(prog(lt, 0, 8.6));
    const crops = c2 => { for (let i = 0; i < 6; i++) { const k = ease(prog(lt, 1.5 + i * 0.8, 2.5 + i * 0.8)); if (k > 0) silhouette(c2, 60 + i * 70 + (i % 2) * 20, 1000 + (i % 3) * 30 + (1 - k) * 60, 0.35 + (i % 3) * 0.05, T + i, 0, '#07080b'); } };
    panel(ctx, FULL, c => farm(c, { tod: 'night', t: T, lit: 1, smoke: 0.5, flicker: lt > 3, lampFlick: true, windowFigs: true, crops, fog: 1.5 }), { z: lerp(1.9, 1.0, p), cx: lerp(250, 360, p), cy: lerp(900, 700, p) }, 1);
    if (lt > 9.0) { ctx.fillStyle = `rgba(0,0,0,${prog(lt, 9.0, 10) * 0.45})`; ctx.fillRect(0, 0, 720, 1280); }
  },
];

function winNight(c, x, y, w, h) {
  c.save(); c.translate(x, y); c.scale(w / 720 * 1.6, w / 720 * 1.6); c.translate(-260, -560); farm(c, { tod: 'night', t: window.__T || 0, lit: 0, smoke: 0, lampFlick: true }); c.restore();
}

window.DURATION = 100;
window.renderFrame = function (ctx, T) {
  window.__T = T;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = '#0c0e13'; ctx.fillRect(0, 0, 720, 1280);
  const ci = Math.min(9, Math.floor(T / 10)); const lt = T - ci * 10;
  ctx.save(); CLIPS[ci](ctx, lt, T); ctx.restore();
  // grain-free comic vignette
  const vg = ctx.createRadialGradient(360, 640, 400, 360, 640, 900); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.35)'); ctx.fillStyle = vg; ctx.fillRect(0, 0, 720, 1280);
  for (const o of OVERLAYS) if (T >= o.a && T < o.b) {
    const a = Math.min(clamp((T - o.a) / 0.2), clamp((o.b - T) / 0.2)); const pop = 1 + 0.25 * (1 - ease(clamp((T - o.a) / 0.25)));
    ctx.save(); ctx.translate(360, o.y); ctx.scale(pop, pop); comicText(ctx, o.txt, 0, 0, o.size, o.fill || '#f0a94a', a, -0.03); ctx.restore();
  }
  const cap = CAPS.find(c => T >= c.a && T < c.b); if (cap) caption(ctx, cap.txt, 1);
  // first frame fade in
  if (T < 0.4) { ctx.fillStyle = `rgba(0,0,0,${1 - T / 0.4})`; ctx.fillRect(0, 0, 720, 1280); }
};

})();
