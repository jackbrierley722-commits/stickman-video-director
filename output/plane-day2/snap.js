const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
(async () => {
  const times = process.argv.slice(3).map(Number); const out = process.argv[2]; fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 720, height: 1280 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + path.resolve(__dirname, 'index.html')); await p.evaluate(() => window.ready);
  for (const t of times) { try { const d = await p.evaluate(t => frame(t), t); fs.writeFileSync(`${out}/t${String(t).padStart(5, '0')}.jpg`, Buffer.from(d.split(',')[1], 'base64')); } catch (e) { errs.push(t + ': ' + e.message.split('\n')[0]); } }
  console.log(errs.length ? errs.join('\n') : 'ok'); await b.close();
})();
