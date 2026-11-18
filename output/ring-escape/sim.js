// Escape the rings: deterministic physics. Used by the page (render) and by node (events for the audio).
(function (root) {
  const CFG = { cx: 360, cy: 700, rings: 12, r0: 62, dr: 24, th: 6, ballR: 11, g: 820, dt: 1 / 960, fps: 24, tMax: 60, intro: 0.0, after: 3.2 };
  function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
  function simulate(seed, gapScale) { const r = rng(seed); const R = []; for (let i = 0; i < CFG.rings; i++) R.push({ i, rad: CFG.r0 + i * CFG.dr, gap: (0.95 - i * 0.025) * gapScale, a0: r() * Math.PI * 2, w: (i % 2 ? -1 : 1) * (0.9 + 0.12 * i + r() * 0.3), alive: true, tBreak: null });
    let x = CFG.cx + 3, y = CFG.cy - 10, vx = 210, vy = -90; const ev = [], frames = []; let t = 0, nf = 0, bounces = 0, done = null; const trail = [];
    const ringAng = (ri, tt) => ri.a0 + ri.w * tt;
    while (t < CFG.tMax) {
      vy += CFG.g * CFG.dt; x += vx * CFG.dt; y += vy * CFG.dt; t += CFG.dt;
      const inner = R.find(q => q.alive);
      if (inner) { const dx = x - CFG.cx, dy = y - CFG.cy, d = Math.hypot(dx, dy); const lim = inner.rad - CFG.th / 2 - CFG.ballR;
        if (d >= lim) { let ang = Math.atan2(dy, dx) - ringAng(inner, t); ang = ((ang % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI); const inGap = ang < inner.gap;
          if (inGap) { if (d >= inner.rad) { inner.alive = false; inner.tBreak = t; ev.push({ t, type: 'break', ring: inner.i, x, y }); if (!R.some(q => q.alive)) done = t; } }
          else { const nx = dx / d, ny = dy / d; const vn = vx * nx + vy * ny; if (vn > 0) { vx -= 2 * vn * nx; vy -= 2 * vn * ny; const sp = Math.hypot(vx, vy), want = Math.min(1150, Math.max(560, sp * 1.02)); vx *= want / sp; vy *= want / sp; bounces++; ev.push({ t, type: 'bounce', ring: inner.i, speed: want, x, y, n: bounces }); } x = CFG.cx + nx * lim; y = CFG.cy + ny * lim; } } }
      if (t >= nf / CFG.fps) { trail.push([x, y]); if (trail.length > 14) trail.shift(); frames.push({ x, y, vx, vy, b: bounces, trail: trail.slice() }); nf++; }
      if (done !== null && t > done + CFG.after) break; }
    return { R: R.map(q => ({ i: q.i, rad: q.rad, gap: q.gap, a0: q.a0, w: q.w, tBreak: q.tBreak })), ev, frames, done, total: frames.length / CFG.fps, bounces }; }
  // pick the run whose ending lands in a good length
  function best() { let pick = null; for (let s = 1; s < 400 && !pick; s++) for (const gs of [0.55, 0.6, 0.65, 0.7]) { const r = simulate(s, gs); if (r.done && r.done > 30 && r.done < 38) { pick = Object.assign(r, { seed: s, gs }); break; } } return pick || Object.assign(simulate(1, 0.7), { seed: 1, gs: 0.7 }); }
  const api = { CFG, simulate, best }; if (typeof module !== 'undefined') module.exports = api; else root.SIM = api;
})(this);
