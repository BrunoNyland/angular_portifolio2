import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  {
    path: 'certificados',
    loadComponent: () =>
      import('./pages/certificates/certificates.page').then((m) => m.CertificatesPage),
  },
  { path: '**', redirectTo: '' },
];
