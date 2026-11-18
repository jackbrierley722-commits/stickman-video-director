const { chromium } = require('playwright'); const path = require('path'); const { spawn } = require('child_process');
(async () => {
  const FPS = 24, DUR = 0, out = process.argv[2] || '429a-part2.mp4';
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-', '-i', 'mix.wav',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '160k', '-shortest', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }); const p = await b.newPage({ viewport: { width: 720, height: 1280 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + path.resolve(__dirname, 'index.html')); await p.evaluate(() => window.ready);
  const n = Math.round(FPS * (await p.evaluate(() => window.DURATION)));
  for (let i = 0; i < n; i++) {
    const d = await p.evaluate(t => frame(t, 0.95), i / FPS);
    if (!ff.stdin.write(Buffer.from(d.split(',')[1], 'base64'))) await new Promise(r => ff.stdin.once('drain', r));
    if (i % 480 === 0) console.log('frame', i, '/', n);
  }
  ff.stdin.end(); await new Promise(r => ff.on('close', r)); await b.close();
  console.log(errs.length ? 'ERRORS:\n' + [...new Set(errs)].join('\n') : 'render ok');
})();
