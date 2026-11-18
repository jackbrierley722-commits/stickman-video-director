// DOM renderer: sets the time, screenshots the page, pipes JPEG frames to ffmpeg. Usage: node render.js out.mp4 [snapDir t1 t2 ...]
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs'); const { spawn } = require('child_process');
(async () => {
  const FPS = 24, out = process.argv[2] || 'laugh-test.mp4', snapDir = process.argv[3], snaps = process.argv.slice(4).map(Number);
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 720, height: 1280 } }); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + path.resolve(__dirname, 'index.html')); await p.evaluate(() => window.ready);
  if (snapDir) { fs.mkdirSync(snapDir, { recursive: true }); for (const t of snaps) { await p.evaluate(t => renderFrame(t), t); await p.screenshot({ path: `${snapDir}/t${String(t).padStart(5, '0')}.jpg`, type: 'jpeg', quality: 85 }); } await b.close(); console.log(errs.join('\n') || 'snaps ok'); return; }
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-', '-i', 'mix.wav', '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '160k', '-shortest', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const n = Math.round(FPS * (await p.evaluate(() => window.DURATION)));
  for (let i = 0; i < n; i++) { await p.evaluate(t => renderFrame(t), i / FPS); const buf = await p.screenshot({ type: 'jpeg', quality: 92 }); if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r)); }
  ff.stdin.end(); await new Promise(r => ff.on('close', r)); await b.close(); console.log(errs.length ? 'ERRORS:\n' + [...new Set(errs)].join('\n') : 'render ok');
})();
