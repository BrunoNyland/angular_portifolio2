import { DOCUMENT } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Meta, Title } from '@angular/platform-browser';
import { SeoService } from './seo.service';
import { ContentService } from '../content/content.service';
import { StorageService } from './storage.service';

class FakeStorage {
  readonly store = new Map<string, string>();
  get = (key: string): string | null => this.store.get(key) ?? null;
  set = (key: string, value: string): void => void this.store.set(key, value);
}

function setup() {
  TestBed.configureTestingModule({
    providers: [{ provide: StorageService, useValue: new FakeStorage() }],
  });
  return {
    seo: TestBed.inject(SeoService),
    content: TestBed.inject(ContentService),
    title: TestBed.inject(Title),
    meta: TestBed.inject(Meta),
    doc: TestBed.inject(DOCUMENT),
  };
}

describe('SeoService', () => {
  it('applies title, description and OG/Twitter tags from the getter', () => {
    const { seo, title, meta } = setup();
    seo.setMeta(() => ({ title: 'My Title', desc: 'My Desc' }));
    TestBed.tick(); // flush o effect

    expect(title.getTitle()).toBe('My Title');
    expect(meta.getTag('name="description"')?.content).toBe('My Desc');
    expect(meta.getTag('property="og:title"')?.content).toBe('My Title');
    expect(meta.getTag('property="og:description"')?.content).toBe('My Desc');
    expect(meta.getTag('name="twitter:title"')?.content).toBe('My Title');
  });

  it('reacts to language changes through the getter', () => {
    const { seo, content, title } = setup();
    seo.setMeta(() => ({ title: content.lang() === 'en' ? 'EN' : 'PT', desc: 'd' }));
    TestBed.tick();
    expect(title.getTitle()).toBe('PT');

    content.setLang('en');
    TestBed.tick();
    expect(title.getTitle()).toBe('EN');
  });

  it('writes canonical and hreflang alternates from the provided paths', () => {
    const { seo, doc } = setup();
    seo.setMeta(() => ({ title: 'T', desc: 'D' }), { pt: '/pt-path', en: '/en-path' });
    TestBed.tick();

    const canonical = doc.head.querySelector('link[rel="canonical"]');
    expect(canonical?.getAttribute('href')).toContain('/pt-path');

    const en = doc.head.querySelector('link[rel="alternate"][hreflang="en"]');
    expect(en?.getAttribute('href')).toContain('/en-path');

    const xDefault = doc.head.querySelector('link[rel="alternate"][hreflang="x-default"]');
    expect(xDefault?.getAttribute('href')).toContain('/pt-path');
  });
});
