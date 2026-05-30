import { DOCUMENT, Injectable, effect, inject, signal } from '@angular/core';
import { SceneService } from '../scene/scene.service';
import { StorageService } from '../core/storage.service';

export interface Tweaks {
  accent: string;
  lockAccent: boolean;
  showB: boolean;
  particles: number;
  scrollSpeed: number;
  cursor: boolean;
}

export const TWEAK_DEFAULTS: Tweaks = {
  accent: '#00e6a8',
  lockAccent: true,
  showB: true,
  particles: 400,
  scrollSpeed: 0.5,
  cursor: true,
};

const ACCENT_KEY = 'accent';

@Injectable({ providedIn: 'root' })
export class TweaksService {
  private readonly scene = inject(SceneService);
  private readonly storage = inject(StorageService);
  private readonly document = inject(DOCUMENT);
  private readonly _tweaks = signal<Tweaks>(this.readInitial());
  readonly tweaks = this._tweaks.asReadonly();

  constructor() {
    // Apply scene-side effects whenever tweaks change.
    effect(() => {
      const t = this._tweaks();
      this.document.documentElement.style.setProperty('--accent', t.accent);
      this.scene.setAccentColor(t.accent);
      this.scene.setBVisible(t.showB);
      this.scene.setParticleDensity(t.particles);
      const cursor = this.document.getElementById('cursor');
      if (cursor) cursor.style.display = t.cursor === false ? 'none' : '';
      this.storage.set(ACCENT_KEY, t.accent);
    });
  }

  set<K extends keyof Tweaks>(key: K, value: Tweaks[K]): void {
    this._tweaks.update((prev) => ({ ...prev, [key]: value }));
  }

  patch(edits: Partial<Tweaks>): void {
    this._tweaks.update((prev) => ({ ...prev, ...edits }));
  }

  private readInitial(): Tweaks {
    const accent = this.storage.get(ACCENT_KEY);
    return accent ? { ...TWEAK_DEFAULTS, accent } : { ...TWEAK_DEFAULTS };
  }
}
