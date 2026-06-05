import { Injectable, NgZone, inject } from '@angular/core';
import type * as THREE from 'three';

type ThreeModule = typeof import('three');

@Injectable({ providedIn: 'root' })
export class SceneService {
  private readonly zone = inject(NgZone);

  private renderer?: THREE.WebGLRenderer;
  private scene?: THREE.Scene;
  private camera?: THREE.PerspectiveCamera;
  private bMesh?: THREE.Mesh;
  private wireMesh?: THREE.LineSegments;
  private bMat?: THREE.MeshStandardMaterial;
  private wireMat?: THREE.LineBasicMaterial;
  private points?: THREE.Points;
  private pGeo?: THREE.BufferGeometry;
  private pMat?: THREE.PointsMaterial;
  private speeds?: Float32Array;
  private accentPoints?: THREE.Points;
  private apMat?: THREE.PointsMaterial;
  private keyLight?: THREE.PointLight;
  private THREE?: ThreeModule;

  private readonly target = { mx: 0, my: 0, sy: 0, pulse: 0 };
  private readonly current = { mx: 0, my: 0, sy: 0, pulse: 0 };
  private startTime = 0;
  private rafId = 0;
  private readonly PCOUNT = 900;
  private mouseHandler?: (e: MouseEvent) => void;
  private resizeHandler?: () => void;

  // Qualidade adaptativa: do mais pesado (0) ao mais leve. O monitor de FPS abaixa
  // o nível quando a média cai, ajustando pixel ratio e densidade de partículas.
  private readonly QUALITY = [
    { dpr: 2, particles: 900 },
    { dpr: 1.5, particles: 600 },
    { dpr: 1, particles: 360 },
  ];
  private quality = 0;
  private frameCount = 0;
  private fpsElapsed = 0;
  private lastFrame = 0;
  private destroyed = false;

  async init(canvas: HTMLCanvasElement): Promise<void> {
    this.destroyed = false;
    const THREE = await import('three');
    if (this.destroyed) return;
    this.THREE = THREE;

    this.zone.runOutsideAngular(() => {
      if (this.destroyed) return;
      // Dispositivos de menor potência (toque/telas pequenas) começam com qualidade
      // reduzida e sem antialias; o monitor de FPS no tick pode baixar ainda mais.
      const lowPower =
        (window.matchMedia?.('(pointer: coarse)').matches ?? false) || window.innerWidth < 768;
      this.quality = lowPower ? 1 : 0;

      const renderer = new THREE.WebGLRenderer({ canvas, antialias: !lowPower, alpha: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setClearColor(0x000000, 0);
      this.renderer = renderer;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
        50,
        window.innerWidth / window.innerHeight,
        0.1,
        200,
      );
      camera.position.z = 6;
      this.scene = scene;
      this.camera = camera;

      // Lighting
      scene.add(new THREE.AmbientLight(0xffffff, 0.4));
      const key = new THREE.PointLight(0x7c5cff, 2.6, 30);
      key.position.set(-3, 2, 4);
      scene.add(key);
      this.keyLight = key;

      const rim = new THREE.PointLight(0xffffff, 1.4, 30);
      rim.position.set(4, -2, 2);
      scene.add(rim);

      // 3D "B" mark
      const bGeo = new THREE.ExtrudeGeometry(this.makeBShape(THREE), {
        depth: 0.4,
        bevelEnabled: true,
        bevelThickness: 0.04,
        bevelSize: 0.04,
        bevelSegments: 6,
        curveSegments: 24,
      });
      bGeo.center();

      const bMat = new THREE.MeshStandardMaterial({
        color: 0x111111,
        metalness: 0.85,
        roughness: 0.18,
        emissive: 0x1a0f3a,
        emissiveIntensity: 0.5,
      });
      const bMesh = new THREE.Mesh(bGeo, bMat);
      bMesh.scale.setScalar(1.4);
      scene.add(bMesh);
      this.bMesh = bMesh;
      this.bMat = bMat;

      const wireGeo = new THREE.EdgesGeometry(bGeo, 25);
      const wireMat = new THREE.LineBasicMaterial({
        color: 0x7c5cff,
        transparent: true,
        opacity: 0.35,
      });
      const wireMesh = new THREE.LineSegments(wireGeo, wireMat);
      wireMesh.scale.copy(bMesh.scale);
      wireMesh.position.copy(bMesh.position);
      scene.add(wireMesh);
      this.wireMesh = wireMesh;
      this.wireMat = wireMat;

      // Particles
      const positions = new Float32Array(this.PCOUNT * 3);
      const speeds = new Float32Array(this.PCOUNT);
      for (let i = 0; i < this.PCOUNT; i++) {
        positions[i * 3 + 0] = (Math.random() - 0.5) * 24;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 18;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 18 - 4;
        speeds[i] = 0.4 + Math.random() * 1.4;
      }
      this.speeds = speeds;
      const pGeo = new THREE.BufferGeometry();
      pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const pMat = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.012,
        transparent: true,
        opacity: 0.7,
        sizeAttenuation: true,
      });
      const points = new THREE.Points(pGeo, pMat);
      scene.add(points);
      this.points = points;
      this.pGeo = pGeo;
      this.pMat = pMat;

      // Accent particles
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
        sizeAttenuation: true,
      });
      const accentPoints = new THREE.Points(apGeo, apMat);
      scene.add(accentPoints);
      this.accentPoints = accentPoints;
      this.apMat = apMat;

      // Event listeners
      this.mouseHandler = (e: MouseEvent) => {
        this.target.mx = (e.clientX / window.innerWidth - 0.5) * 2;
        this.target.my = (e.clientY / window.innerHeight - 0.5) * 2;
      };
      this.resizeHandler = () => {
        if (!this.camera || !this.renderer) return;
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
      };
      window.addEventListener('mousemove', this.mouseHandler);
      window.addEventListener('resize', this.resizeHandler);

      this.applyQuality();
      this.startTime = performance.now();
      if (this.destroyed) return;
      this.tick();
    });
  }

  setScroll(y: number): void {
    this.target.sy = y;
  }
  pulse(): void {
    this.target.pulse = 1;
  }

  setHue(h: number): void {
    if (!this.THREE || !this.bMat || !this.wireMat || !this.apMat || !this.keyLight) return;
    const c = new this.THREE.Color().setHSL(h, 0.7, 0.6);
    this.bMat.emissive = c.clone().multiplyScalar(0.3);
    this.wireMat.color = c;
    this.apMat.color = c;
    this.keyLight.color = c;
  }

  setAccentColor(hex: string): void {
    if (!this.THREE || !this.bMat || !this.wireMat || !this.apMat || !this.keyLight) return;
    const c = new this.THREE.Color(hex);
    this.bMat.emissive = c.clone().multiplyScalar(0.3);
    this.wireMat.color = c;
    this.apMat.color = c;
    this.keyLight.color = c;
  }

  setBVisible(on: boolean): void {
    if (this.bMesh) this.bMesh.visible = !!on;
    if (this.wireMesh) this.wireMesh.visible = !!on;
  }

  setParticleDensity(n: number): void {
    if (!this.pMat || !this.apMat) return;
    const k = Math.max(0, Math.min(1, n / 900));
    this.pMat.opacity = 0.7 * k;
    this.apMat.opacity = 0.9 * k;
  }

  /** Aplica o nível de qualidade atual: pixel ratio do renderer e partículas desenhadas. */
  private applyQuality(): void {
    const q = this.QUALITY[this.quality];
    if (this.renderer) {
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, q.dpr));
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    this.pGeo?.setDrawRange(0, q.particles);
  }

  private tick = (): void => {
    if (this.destroyed || !this.renderer || !this.scene || !this.camera) return;
    const now = performance.now();
    const t = (now - this.startTime) / 1000;

    // Monitor de FPS: mede a média a cada ~1s e, passada a fase de aquecimento,
    // reduz a qualidade um nível se a taxa cair — recupera fluidez em dispositivos lentos.
    if (this.lastFrame) {
      this.fpsElapsed += now - this.lastFrame;
      this.frameCount++;
      if (this.fpsElapsed >= 1000) {
        const fps = (this.frameCount * 1000) / this.fpsElapsed;
        if (t > 2 && fps < 50 && this.quality < this.QUALITY.length - 1) {
          this.quality++;
          this.applyQuality();
        }
        this.frameCount = 0;
        this.fpsElapsed = 0;
      }
    }
    this.lastFrame = now;

    this.current.mx += (this.target.mx - this.current.mx) * 0.05;
    this.current.my += (this.target.my - this.current.my) * 0.05;
    this.current.sy += (this.target.sy - this.current.sy) * 0.08;
    this.current.pulse += (this.target.pulse - this.current.pulse) * 0.05;
    this.target.pulse *= 0.94;

    if (this.bMesh && this.wireMesh && this.wireMat) {
      this.bMesh.rotation.y = this.current.mx * 0.6 + t * 0.15 + this.current.sy * 0.001;
      this.bMesh.rotation.x = -this.current.my * 0.4 + Math.sin(t * 0.3) * 0.08;
      this.bMesh.position.y = Math.sin(t * 0.4) * 0.15 - this.current.sy * 0.0015;
      this.bMesh.position.x = this.current.mx * 0.4;

      this.wireMesh.rotation.copy(this.bMesh.rotation);
      this.wireMesh.position.copy(this.bMesh.position);

      const scl = 1.4 + this.current.pulse * 0.25;
      this.bMesh.scale.setScalar(scl);
      this.wireMesh.scale.setScalar(scl * 1.02);
      this.wireMat.opacity = 0.35 + this.current.pulse * 0.5;
    }

    if (this.pGeo && this.speeds && this.points) {
      const pos = this.pGeo.attributes['position'].array as Float32Array;
      for (let i = 0; i < this.PCOUNT; i++) {
        pos[i * 3 + 1] += 0.002 * this.speeds[i];
        if (pos[i * 3 + 1] > 9) pos[i * 3 + 1] = -9;
      }
      this.pGeo.attributes['position'].needsUpdate = true;
      this.points.rotation.y = t * 0.02 + this.current.mx * 0.1;
    }

    if (this.accentPoints) {
      this.accentPoints.rotation.y = -t * 0.04 + this.current.mx * 0.15;
      this.accentPoints.rotation.x = this.current.my * 0.1;
    }

    this.camera.position.x = this.current.mx * 0.4;
    this.camera.position.y = -this.current.my * 0.3 - this.current.sy * 0.0008;
    this.camera.lookAt(0, 0, 0);

    if (this.destroyed) return;
    this.renderer.render(this.scene, this.camera);
    this.rafId = requestAnimationFrame(this.tick);
  };

  private makeBShape(THREE: ThreeModule): THREE.Shape {
    const s = new THREE.Shape();
    const w = 1.0,
      h = 1.4;
    s.moveTo(-w / 2, -h / 2);
    s.lineTo(-w / 2, h / 2);
    s.lineTo(w / 2 - 0.05, h / 2);
    s.bezierCurveTo(w / 2 + 0.35, h / 2, w / 2 + 0.35, 0.08, w / 2 - 0.05, 0.08);
    s.lineTo(-w / 2 + 0.25, 0.08);
    s.lineTo(-w / 2 + 0.25, -0.08);
    s.lineTo(w / 2 - 0.05, -0.08);
    s.bezierCurveTo(w / 2 + 0.45, -0.08, w / 2 + 0.45, -h / 2, w / 2 - 0.05, -h / 2);
    s.lineTo(-w / 2, -h / 2);

    const top = new THREE.Path();
    top.moveTo(-w / 2 + 0.25, 0.25);
    top.lineTo(-w / 2 + 0.25, h / 2 - 0.18);
    top.lineTo(w / 2 - 0.18, h / 2 - 0.18);
    top.bezierCurveTo(w / 2 + 0.08, h / 2 - 0.18, w / 2 + 0.08, 0.25, w / 2 - 0.18, 0.25);
    top.lineTo(-w / 2 + 0.25, 0.25);
    s.holes.push(top);

    const bot = new THREE.Path();
    bot.moveTo(-w / 2 + 0.25, -h / 2 + 0.18);
    bot.lineTo(-w / 2 + 0.25, -0.25);
    bot.lineTo(w / 2 - 0.18, -0.25);
    bot.bezierCurveTo(
      w / 2 + 0.18,
      -0.25,
      w / 2 + 0.18,
      -h / 2 + 0.18,
      w / 2 - 0.18,
      -h / 2 + 0.18,
    );
    bot.lineTo(-w / 2 + 0.25, -h / 2 + 0.18);
    s.holes.push(bot);

    return s;
  }

  destroy(): void {
    this.destroyed = true;
    this.dispose();
  }

  private dispose(): void {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.rafId = 0;
    if (this.mouseHandler) window.removeEventListener('mousemove', this.mouseHandler);
    if (this.resizeHandler) window.removeEventListener('resize', this.resizeHandler);
    this.renderer?.dispose();
  }
}
