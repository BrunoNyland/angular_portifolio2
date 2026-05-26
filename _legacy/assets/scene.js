// Three.js background: extruded 3D text + floating particles.
// Reacts to mouse + scroll. Driven externally via window.__scene.

(function () {
  const THREE = window.THREE;
  if (!THREE) return;

  const canvas = document.getElementById('bg-canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 200);
  camera.position.z = 6;

  // ---------- Lighting ----------
  const amb = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(amb);
  const key = new THREE.PointLight(0x7c5cff, 2.6, 30);
  key.position.set(-3, 2, 4);
  scene.add(key);
  const rim = new THREE.PointLight(0xffffff, 1.4, 30);
  rim.position.set(4, -2, 2);
  scene.add(rim);

  // ---------- 3D extruded "B" mark ----------
  // Using ExtrudeGeometry from a Shape so we don't need to load a typeface file.
  function makeBShape() {
    const s = new THREE.Shape();
    // Outer rectangle of B (rough block letter, 1.0 x 1.4)
    const w = 1.0, h = 1.4, r = 0.05;
    s.moveTo(-w/2, -h/2);
    s.lineTo(-w/2, h/2);
    s.lineTo(w/2 - 0.05, h/2);
    s.bezierCurveTo(w/2 + 0.35, h/2, w/2 + 0.35, 0.08, w/2 - 0.05, 0.08);
    s.lineTo(-w/2 + 0.25, 0.08);
    s.lineTo(-w/2 + 0.25, -0.08);
    s.lineTo(w/2 - 0.05, -0.08);
    s.bezierCurveTo(w/2 + 0.45, -0.08, w/2 + 0.45, -h/2, w/2 - 0.05, -h/2);
    s.lineTo(-w/2, -h/2);

    // Cut out top hole
    const top = new THREE.Path();
    top.moveTo(-w/2 + 0.25, 0.25);
    top.lineTo(-w/2 + 0.25, h/2 - 0.18);
    top.lineTo(w/2 - 0.18, h/2 - 0.18);
    top.bezierCurveTo(w/2 + 0.08, h/2 - 0.18, w/2 + 0.08, 0.25, w/2 - 0.18, 0.25);
    top.lineTo(-w/2 + 0.25, 0.25);
    s.holes.push(top);

    // Cut out bottom hole
    const bot = new THREE.Path();
    bot.moveTo(-w/2 + 0.25, -h/2 + 0.18);
    bot.lineTo(-w/2 + 0.25, -0.25);
    bot.lineTo(w/2 - 0.18, -0.25);
    bot.bezierCurveTo(w/2 + 0.18, -0.25, w/2 + 0.18, -h/2 + 0.18, w/2 - 0.18, -h/2 + 0.18);
    bot.lineTo(-w/2 + 0.25, -h/2 + 0.18);
    s.holes.push(bot);

    return s;
  }

  const bGeo = new THREE.ExtrudeGeometry(makeBShape(), {
    depth: 0.4,
    bevelEnabled: true,
    bevelThickness: 0.04,
    bevelSize: 0.04,
    bevelSegments: 6,
    curveSegments: 24
  });
  bGeo.center();

  const bMat = new THREE.MeshStandardMaterial({
    color: 0x111111,
    metalness: 0.85,
    roughness: 0.18,
    emissive: 0x1a0f3a,
    emissiveIntensity: 0.5
  });
  const bMesh = new THREE.Mesh(bGeo, bMat);
  bMesh.scale.setScalar(1.4);
  bMesh.position.set(0, 0, 0);
  scene.add(bMesh);

  // Wireframe overlay
  const wireGeo = new THREE.EdgesGeometry(bGeo, 25);
  const wireMat = new THREE.LineBasicMaterial({ color: 0x7c5cff, transparent: true, opacity: 0.35 });
  const wireMesh = new THREE.LineSegments(wireGeo, wireMat);
  wireMesh.scale.copy(bMesh.scale);
  wireMesh.position.copy(bMesh.position);
  scene.add(wireMesh);

  // ---------- Particles ----------
  const PCOUNT = 900;
  const positions = new Float32Array(PCOUNT * 3);
  const speeds = new Float32Array(PCOUNT);
  for (let i = 0; i < PCOUNT; i++) {
    positions[i * 3 + 0] = (Math.random() - 0.5) * 24;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 18;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 18 - 4;
    speeds[i] = 0.4 + Math.random() * 1.4;
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const pMat = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.012,
    transparent: true,
    opacity: 0.7,
    sizeAttenuation: true
  });
  const points = new THREE.Points(pGeo, pMat);
  scene.add(points);

  // Accent particles (purple, larger)
  const APCOUNT = 80;
  const ap = new Float32Array(APCOUNT * 3);
  for (let i = 0; i < APCOUNT; i++) {
    ap[i * 3 + 0] = (Math.random() - 0.5) * 18;
    ap[i * 3 + 1] = (Math.random() - 0.5) * 14;
    ap[i * 3 + 2] = (Math.random() - 0.5) * 12 - 2;
  }
  const apGeo = new THREE.BufferGeometry();
  apGeo.setAttribute('position', new THREE.BufferAttribute(ap, 3));
  const apMat = new THREE.PointsMaterial({
    color: 0x7c5cff,
    size: 0.05,
    transparent: true,
    opacity: 0.9,
    sizeAttenuation: true
  });
  const accentPoints = new THREE.Points(apGeo, apMat);
  scene.add(accentPoints);

  // ---------- Mouse / scroll state ----------
  const target = { mx: 0, my: 0, sy: 0, pulse: 0 };
  const current = { mx: 0, my: 0, sy: 0, pulse: 0 };

  window.addEventListener('mousemove', (e) => {
    target.mx = (e.clientX / window.innerWidth - 0.5) * 2;
    target.my = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // Public hooks
  window.__scene = {
    setScroll(y) { target.sy = y; },
    pulse() { target.pulse = 1; },
    setHue(h) {
      const c = new THREE.Color().setHSL(h, 0.7, 0.6);
      bMat.emissive = c.clone().multiplyScalar(0.3);
      wireMat.color = c;
      apMat.color = c;
      key.color = c;
    },
    setAccentColor(hex) {
      const c = new THREE.Color(hex);
      bMat.emissive = c.clone().multiplyScalar(0.3);
      wireMat.color = c;
      apMat.color = c;
      key.color = c;
    },
    setBVisible(on) {
      bMesh.visible = !!on;
      wireMesh.visible = !!on;
    },
    setParticleDensity(n) {
      // Scale point material size + alpha to fake density change without rebuilding buffers
      const k = Math.max(0, Math.min(1, n / 900));
      pMat.opacity = 0.7 * k;
      apMat.opacity = 0.9 * k;
    }
  };

  // ---------- Animate ----------
  const clock = new THREE.Clock();
  function tick() {
    const t = clock.getElapsedTime();

    // Lerp values
    current.mx += (target.mx - current.mx) * 0.05;
    current.my += (target.my - current.my) * 0.05;
    current.sy += (target.sy - current.sy) * 0.08;
    current.pulse += (target.pulse - current.pulse) * 0.05;
    target.pulse *= 0.94;

    // Rotate B mesh based on mouse + scroll
    bMesh.rotation.y = current.mx * 0.6 + t * 0.15 + current.sy * 0.001;
    bMesh.rotation.x = -current.my * 0.4 + Math.sin(t * 0.3) * 0.08;
    bMesh.position.y = Math.sin(t * 0.4) * 0.15 - current.sy * 0.0015;
    bMesh.position.x = current.mx * 0.4;

    wireMesh.rotation.copy(bMesh.rotation);
    wireMesh.position.copy(bMesh.position);

    // Pulse on action
    const scl = 1.4 + current.pulse * 0.25;
    bMesh.scale.setScalar(scl);
    wireMesh.scale.setScalar(scl * 1.02);
    wireMat.opacity = 0.35 + current.pulse * 0.5;

    // Particles drift
    const pos = pGeo.attributes.position.array;
    for (let i = 0; i < PCOUNT; i++) {
      pos[i * 3 + 1] += 0.002 * speeds[i];
      if (pos[i * 3 + 1] > 9) pos[i * 3 + 1] = -9;
    }
    pGeo.attributes.position.needsUpdate = true;
    points.rotation.y = t * 0.02 + current.mx * 0.1;

    accentPoints.rotation.y = -t * 0.04 + current.mx * 0.15;
    accentPoints.rotation.x = current.my * 0.1;

    // Camera tiny drift
    camera.position.x = current.mx * 0.4;
    camera.position.y = -current.my * 0.3 - current.sy * 0.0008;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }
  tick();
})();
