
// ===================== CEL-SHADED TOON LOOK (ink outlines, 2-tone shading, cartoon people) =====================
// cartoon person with the same rig/API as human(): up, head, mouth, brows, armL/R (.userData.e/.h), legL/R (.userData.k)
function human(o = {}) { const g = new T3.Group(); const skin = SM(o.skin || '#e8b890'), top = SM(o.top || '#3a6ad8'), bot = SM(o.bot || '#2a2e3a'), hairM = SM(o.hair || '#4a2e1a'), shoe = SM(o.shoe || '#f4f4f4'), ink = new T3.MeshBasicMaterial({ color: '#141414' });
  const up = new T3.Group(); up.position.y = 0.95; g.add(up);
  add(up, Cap(0.17, 0.36, 14), top, 0, 0.3, 0).scale.z = 0.72; add(up, Sp(0.17, 16, 12), bot, 0, -0.02, 0).scale.set(1, 0.65, 0.75); add(up, Cy(0.05, 0.055, 0.1, 10), skin, 0, 0.62, 0);
  const head = new T3.Group(); head.position.set(0, 0.8, 0); up.add(head); const hs = add(head, Sp(0.15, 24, 18), skin, 0, 0, 0); hs.scale.set(0.92, 1.05, 0.95);
  for (const sx of [-1, 1]) add(head, Sp(0.03, 10, 8), skin, sx * 0.138, -0.005, 0).scale.set(0.5, 1, 0.8);
  const hairCap = add(head, new T3.SphereGeometry(0.158, 24, 14, 0, PI * 2, 0, PI * 0.46), hairM, 0, 0.012, -0.01); hairCap.rotation.x = -0.25; add(head, Sp(0.07, 10, 8), hairM, 0.05, 0.12, 0.06).scale.set(1.4, 0.6, 1);
  const brows = []; for (const sx of [-1, 1]) { add(head, Sp(0.019, 10, 8), ink, sx * 0.05, 0.012, 0.135, false).scale.set(1, 1.3, 0.5); const br = add(head, Bx(0.016, 0.06, 0.012), ink, sx * 0.052, 0.045, 0.134, false); br.rotation.z = PI / 2 - sx * 0.12; br.userData.sx = -sx; brows.push(br); }
  add(head, Sp(0.022, 10, 8), skin, 0, -0.018, 0.142).scale.set(0.8, 0.8, 0.9); // nose
  const mouth = new T3.Group(); mouth.position.set(0, -0.06, 0.132); head.add(mouth); add(mouth, Bx(0.05, 0.01, 0.006), ink, 0, 0, 0, false);
  const arm = (sx) => { const s_ = new T3.Group(); s_.position.set(sx * 0.2, 0.5, 0); up.add(s_); add(s_, Sp(0.06), top, 0, 0, 0); add(s_, Cap(0.05, 0.2, 10), o.short ? top : top, 0, -0.13, 0); const e = new T3.Group(); e.position.y = -0.28; s_.add(e); add(e, Cap(0.045, 0.2, 10), o.short ? skin : top, 0, -0.12, 0); const h = new T3.Group(); h.position.y = -0.27; e.add(h); add(h, Sp(0.05, 12, 10), skin, 0, -0.02, 0).scale.set(0.9, 1.1, 0.7); s_.userData.e = e; s_.userData.h = h; return s_; };
  const leg = (sx) => { const hp = new T3.Group(); hp.position.set(sx * 0.09, 0.92, 0); g.add(hp); add(hp, Cap(0.072, 0.32, 10), bot, 0, -0.22, 0); const k = new T3.Group(); k.position.y = -0.45; hp.add(k); add(k, Cap(0.058, 0.32, 10), o.short ? skin : bot, 0, -0.2, 0); const sh = add(k, Cap(0.055, 0.12, 8), shoe, 0, -0.42, 0.05); sh.rotation.x = PI / 2; sh.scale.set(1.1, 1, 0.7); hp.userData.k = k; return hp; };
  g.userData = { up, head, mouth, brows, armL: arm(-1), armR: arm(1), legL: leg(-1), legR: leg(1) }; return g; }
// golden-hour sky and a low warm sun
function goldenHour() { const st = ctex(16, 512, (c, w, h) => { const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#4a7ac8'); gr.addColorStop(0.32, '#8ab8e0'); gr.addColorStop(0.45, '#f4c8a0'); gr.addColorStop(0.5, '#ff9a6a'); gr.addColorStop(0.52, '#e8a878'); gr.addColorStop(1, '#c89a78'); c.fillStyle = gr; c.fillRect(0, 0, w, h); }); R.sky.material.map = st; R.sky.material.needsUpdate = true;
  R.sun.color.set('#ffd0a0'); R.hemi.color.set('#ffd8b8'); R.hemi.groundColor.set('#8a6a58'); }
function sunAt(x, y, z) { R.sun.target.position.set(x, y, z); R.sun.position.set(x - 50, y + 30, z - 60); }
// convert every lit material to a 2-step toon material and give solid meshes an ink outline (screen-space width)
let GRAD, INK;
function toonify(root) { GRAD = ctex(4, 1, (c) => { c.fillStyle = '#5a5a5a'; c.fillRect(0, 0, 2, 1); c.fillStyle = '#ffffff'; c.fillRect(2, 0, 2, 1); }); GRAD.minFilter = GRAD.magFilter = T3.NearestFilter; GRAD.colorSpace = T3.NoColorSpace;
  INK = new T3.ShaderMaterial({ uniforms: { uT: { value: 0.0065 } }, side: T3.BackSide, vertexShader: 'uniform float uT; void main(){ vec4 c = projectionMatrix * modelViewMatrix * vec4(position,1.0); vec3 n = normalize(normalMatrix * normal); vec2 o = normalize((projectionMatrix * vec4(n,0.0)).xy + 1e-6); c.xy += o * uT * c.w; gl_Position = c; }', fragmentShader: 'void main(){ gl_FragColor = vec4(0.07,0.06,0.08,1.0); }' });
  const cache = new Map(); const meshes = []; root.traverse(m => { if (m.isMesh && m.material && m.material.isMeshStandardMaterial) meshes.push(m); });
  meshes.forEach(m => { const sm = m.material; let tm = cache.get(sm); if (!tm) { tm = new T3.MeshToonMaterial({ color: sm.color, map: sm.map || null, gradientMap: GRAD, transparent: sm.transparent, opacity: sm.opacity, side: sm.side, emissive: sm.emissive, emissiveIntensity: sm.emissiveIntensity }); cache.set(sm, tm); } m.material = tm;
    m.geometry.computeBoundingSphere(); const r = m.geometry.boundingSphere ? m.geometry.boundingSphere.radius * Math.max(m.scale.x, m.scale.y, m.scale.z) : 0; if (r > 0 && r < 30 && !sm.transparent) { const ol = new T3.Mesh(m.geometry, INK); ol.castShadow = false; ol.receiveShadow = false; ol.renderOrder = -1; m.add(ol); } }); }
