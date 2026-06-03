import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  {
    // Mesma página em dois slugs localizados: 'certificados' (PT) e 'certificates' (EN).
    // A página mantém o slug em sincronia com o idioma selecionado.
    path: 'certificados',
    loadComponent: () =>
      import('./pages/certificates/certificates.page').then((m) => m.CertificatesPage),
  },
  {
    path: 'certificates',
    loadComponent: () =>
      import('./pages/certificates/certificates.page').then((m) => m.CertificatesPage),
  },
  { path: '**', redirectTo: '' },
];
