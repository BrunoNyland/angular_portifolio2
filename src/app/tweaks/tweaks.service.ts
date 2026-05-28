import { Injectable, effect, signal, inject } from '@angular/core';
import { SceneService } from '../scene/scene.service';

export interface Tweaks {
  accent: string;
  lockAccent: boolean;
  showB: boolean;
  particles: number;
  scrollSpeed: number;
  sectionBlur: number;
  cursor: boolean;
}

export const TWEAK_DEFAULTS: Tweaks = {
  accent: '#00e6a8',
  lockAccent: true,
  showB: true,
  particles: 400,
  scrollSpeed: 0.5,
  sectionBlur: 10,
  cursor: true,
};

@Injectable({ providedIn: 'root' })
export class TweaksService {
  private readonly scene = inject(SceneService);
  private readonly _tweaks = signal<Tweaks>({ ...TWEAK_DEFAULTS });
  readonly tweaks = this._tweaks.asReadonly();

  constructor() {
    // Apply scene-side effects whenever tweaks change.
    effect(() => {
      const t = this._tweaks();
      document.documentElement.style.setProperty('--accent', t.accent);
      this.scene.setAccentColor(t.accent);
      this.scene.setBVisible(t.showB);
      this.scene.setParticleDensity(t.particles);
      const c = document.getElementById('cursor');
      if (c) c.style.display = t.cursor === false ? 'none' : '';
    });
  }

  set<K extends keyof Tweaks>(key: K, value: Tweaks[K]): void {
    this._tweaks.update((prev) => ({ ...prev, [key]: value }));
  }

  patch(edits: Partial<Tweaks>): void {
    this._tweaks.update((prev) => ({ ...prev, ...edits }));
  }
}
