import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Certificate } from './certificate.types';

interface CertificatesFile {
  courses: Certificate[];
}

/**
 * Carrega todos os certificados de /certificates/certificates.json (servido a
 * partir de public/). São documentos leves, então carregamos tudo de uma vez e
 * filtramos em memória na página.
 */
@Injectable({ providedIn: 'root' })
export class CertificatesService {
  private readonly http = inject(HttpClient);

  private readonly _courses = signal<Certificate[]>([]);
  readonly courses = this._courses.asReadonly();
  readonly loaded = signal(false);

  constructor() {
    this.load();
  }

  private load(): void {
    this.http.get<CertificatesFile>('/certificates/certificates.json').subscribe({
      next: (data) => {
        this._courses.set(data?.courses ?? []);
        this.loaded.set(true);
      },
      error: () => this.loaded.set(true),
    });
  }
}
