import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideRouter, withHashLocation, withInMemoryScrolling } from '@angular/router';
import { routes } from './app.routes';
import { environment } from '../environments/environment';

const routerProviders = environment.useHashRouting
  ? [
      provideRouter(
        routes,
        withInMemoryScrolling({ scrollPositionRestoration: 'disabled' }),
        withHashLocation(),
      ),
    ]
  : [provideRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: 'disabled' }))];

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    ...routerProviders,
    provideHttpClient(withFetch()),
  ],
};
