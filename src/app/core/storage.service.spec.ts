import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { StorageService } from './storage.service';

describe('StorageService', () => {
  describe('in the browser', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [{ provide: PLATFORM_ID, useValue: 'browser' }],
      });
      localStorage.clear();
    });

    it('persists and reads values', () => {
      const storage = TestBed.inject(StorageService);
      storage.set('k', 'v');
      expect(storage.get('k')).toBe('v');
    });

    it('returns null for missing keys', () => {
      expect(TestBed.inject(StorageService).get('missing')).toBeNull();
    });
  });

  describe('on the server', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [{ provide: PLATFORM_ID, useValue: 'server' }],
      });
    });

    it('is a no-op and never touches localStorage', () => {
      const storage = TestBed.inject(StorageService);
      expect(() => storage.set('k', 'v')).not.toThrow();
      expect(storage.get('k')).toBeNull();
    });
  });
});
