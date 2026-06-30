import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { CertificatesService } from './certificates.service';

const URL = '/certificates-content/certificates.json';

function setup() {
  TestBed.configureTestingModule({
    providers: [provideHttpClient(), provideHttpClientTesting(), CertificatesService],
  });
  // Injetar o serviço dispara o GET no construtor.
  const service = TestBed.inject(CertificatesService);
  const http = TestBed.inject(HttpTestingController);
  return { service, http };
}

describe('CertificatesService', () => {
  it('loads the courses and marks loaded without error', () => {
    const { service, http } = setup();
    http.expectOne(URL).flush({
      courses: [
        {
          name: 'Curso',
          platform: 'X',
          date: '01-2026',
          workload: '10h',
          topics: [],
          language: 'pt',
          pdf: 'a.pdf',
        },
      ],
    });

    expect(service.loaded()).toBe(true);
    expect(service.error()).toBe(false);
    expect(service.courses().length).toBe(1);
    http.verify();
  });

  it('treats a missing courses array as empty', () => {
    const { service, http } = setup();
    http.expectOne(URL).flush({});

    expect(service.courses()).toEqual([]);
    expect(service.loaded()).toBe(true);
    expect(service.error()).toBe(false);
  });

  it('sets the error flag (and loaded) when the request fails', () => {
    const { service, http } = setup();
    http.expectOne(URL).error(new ProgressEvent('error'));

    expect(service.loaded()).toBe(true);
    expect(service.error()).toBe(true);
    expect(service.courses()).toEqual([]);
    http.verify();
  });
});
